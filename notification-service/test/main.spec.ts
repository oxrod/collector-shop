import http from 'http';
import app from '../src/main';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
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
});
