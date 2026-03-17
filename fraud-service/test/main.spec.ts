import http from 'http';
import app from '../src/main';

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
        expect(data.service).toBe('fraud-service');
    });
});

describe('Metrics endpoint', () => {
    it('should return prometheus metrics', async () => {
        const { status } = await request('GET', '/metrics');
        expect(status).toBe(200);
    });
});

describe('Validate endpoint', () => {
    it('should return 400 when required fields are missing', async () => {
        const { status, data } = await request('POST', '/validate', {});
        expect(status).toBe(400);
        expect(data.valid).toBe(false);
        expect(data.score).toBe(1.0);
        expect(data.reasons).toContain('Missing required fields: title, description, price');
    });

    it('should validate a legitimate article', async () => {
        const { status, data } = await request('POST', '/validate', {
            articleId: '1',
            title: 'Montre Omega Seamaster 1965',
            description:
                'Superbe montre vintage Omega Seamaster de 1965 en excellent état. Le boîtier en acier inoxydable mesure 34mm de diamètre. Le cadran argenté est en parfait état sans aucune rayure visible. Le mouvement automatique fonctionne parfaitement et a été révisé récemment par un horloger professionnel certifié. Livrée avec son bracelet cuir original.',
            price: 850,
        });
        expect(status).toBe(200);
        expect(data.valid).toBe(true);
        expect(data.score).toBe(0);
        expect(data.reasons).toHaveLength(0);
    });

    it('should flag a fraudulent article', async () => {
        const { status, data } = await request('POST', '/validate', {
            articleId: '2',
            title: 'ab',
            description: 'fake scam',
            price: -5,
        });
        expect(status).toBe(200);
        expect(data.valid).toBe(false);
        expect(data.score).toBeGreaterThan(0);
        expect(data.reasons.length).toBeGreaterThan(0);
    });

    it('should return combined score from price and content checks', async () => {
        const { status, data } = await request('POST', '/validate', {
            articleId: '3',
            title: 'Objet',
            description:
                'Un objet de collection en bon état général avec quelques traces légères. Il est livré avec un certificat et tous les accessoires originaux. Cet article rare provient directement du propriétaire initial et a été conservé avec soin dans un environnement contrôlé pendant plusieurs décennies.',
            price: 100000,
        });
        expect(status).toBe(200);
        expect(data.score).toBeGreaterThan(0);
        expect(data.reasons.some((r: string) => r.includes('Prix'))).toBe(true);
    });
});
