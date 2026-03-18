import http from 'http';
import app, { startServer } from '../src/main';

const getSendMailMock = () => (globalThis as any).__sendMailMock as jest.Mock;

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: (() => {
            const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
            (globalThis as any).__sendMailMock = sendMailMock;
            return sendMailMock;
        })(),
    }),
}));

let server: http.Server;
let baseUrl: string;

function request(
    method: string,
    path: string,
    body?: object,
): Promise<{ status: number; data: any }> {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const payload = body ? JSON.stringify(body) : undefined;
        const req = http.request(
            url,
            {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
                },
            },
            (res) => {
                let raw = '';
                res.on('data', (chunk) => (raw += chunk));
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode!, data: JSON.parse(raw) });
                    } catch {
                        resolve({ status: res.statusCode!, data: raw });
                    }
                });
            },
        );
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

beforeAll((done) => {
    server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        done();
    });
});

afterAll((done) => {
    server.close(done);
});

describe('Health endpoint', () => {
    it('should return ok status', async () => {
        const { status, data } = await request('GET', '/health');
        expect(status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.service).toBe('notification-service');
    });
});

describe('Metrics endpoint', () => {
    it('should return prometheus metrics', async () => {
        const { status } = await request('GET', '/metrics');
        expect(status).toBe(200);
    });
});

describe('Types endpoint', () => {
    it('should return all notification types', async () => {
        const { status, data } = await request('GET', '/types');
        expect(status).toBe(200);
        expect(data.types).toHaveLength(9);
        const ids = data.types.map((t: any) => t.id);
        expect(ids).toContain('article_published');
        expect(ids).toContain('fraud_alert');
    });
});

describe('Notify endpoint', () => {
    it('should return 400 when required fields are missing', async () => {
        const { status, data } = await request('POST', '/notify', {});
        expect(status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Missing required fields');
    });

    it('should send a log-only notification', async () => {
        const { status, data } = await request('POST', '/notify', {
            userId: 'user-1',
            type: 'article_published',
            title: 'Article publié',
            message: 'Votre article a été publié avec succès.',
        });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.notificationId).toBeDefined();
        expect(data.userId).toBe('user-1');
        expect(data.channels).toEqual(
            expect.arrayContaining([expect.objectContaining({ channel: 'log', success: true })]),
        );
    });

    it('should send an email notification when email is provided', async () => {
        const { status, data } = await request('POST', '/notify', {
            userId: 'user-2',
            type: 'order_confirmed',
            title: 'Commande confirmée',
            message: 'Votre commande a été confirmée.',
            email: 'user@example.com',
        });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.channels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ channel: 'email', success: true }),
                expect.objectContaining({ channel: 'log', success: true }),
            ]),
        );
    });

    it('should handle email send failure and return email failure result', async () => {
        getSendMailMock().mockRejectedValueOnce(new Error('SMTP down'));

        const { status, data } = await request('POST', '/notify', {
            userId: 'user-3',
            type: 'article_validated',
            title: 'Article validé',
            message: 'Votre article a été validé.',
            email: 'fail@example.com',
        });

        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.channels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    channel: 'email',
                    success: false,
                    error: 'SMTP down',
                }),
            ]),
        );
    });
});

describe('startServer (coverage)', () => {
    it('should handle EADDRINUSE and shutdown signals without exiting the process', async () => {
        let fakeServer: any;
        fakeServer = {
            on: jest.fn((event: string, handler: any) => {
                if (event === 'error') {
                    (fakeServer as any).__errorHandler = handler;
                }
                return fakeServer;
            }),
            close: jest.fn((cb: any) => cb?.()),
        };

        const listenSpy = jest
            .spyOn(app as any, 'listen')
            .mockImplementation((port: any, host: any, cb: any) => {
                if (typeof host === 'function') {
                    cb = host;
                }
                cb?.();
                return fakeServer as any;
            });

        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        startServer();

        // Trigger the error handler branch
        try {
            (fakeServer as any).__errorHandler({ code: 'EADDRINUSE' });
            // If no error is thrown, the test should fail because the handler re-throws.
            throw new Error('Expected server error handler to re-throw');
        } catch (err: any) {
            expect(err?.code).toBe('EADDRINUSE');
        }
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);

        // Trigger shutdown (SIGINT)
        process.emit('SIGINT');
        expect(consoleLogSpy).toHaveBeenCalled();
        expect(fakeServer.close).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(0);

        listenSpy.mockRestore();
        exitSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });
});
