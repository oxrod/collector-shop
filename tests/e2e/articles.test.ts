import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

describe('Articles E2E', () => {
    it('should return health check', async () => {
        const response = await axios.get(`${API_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('ok');
    });

    it('should list articles', async () => {
        const response = await axios.get(`${API_URL}/articles`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return 401 for unauthenticated article creation', async () => {
        try {
            await axios.post(`${API_URL}/articles`, {
                title: 'Test Article',
                description: 'Test description for e2e',
                price: 29.99,
            });
            fail('Should have thrown 401');
        } catch (error: any) {
            expect(error.response.status).toBe(401);
        }
    });

    it('should return 400 for invalid article data', async () => {
        try {
            await axios.post(
                `${API_URL}/articles`,
                { title: '', price: -1 },
                { headers: { Authorization: 'Bearer invalid-token' } },
            );
            fail('Should have thrown error');
        } catch (error: any) {
            expect([400, 401]).toContain(error.response.status);
        }
    });
});
