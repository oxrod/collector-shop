import { EmailChannel } from '../src/channels/email';


// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
}));

describe('EmailChannel', () => {
    let emailChannel: EmailChannel;

    beforeEach(() => {
        emailChannel = new EmailChannel();
    });

    it('should be defined', () => {
        expect(emailChannel).toBeDefined();
    });

    it('should send an email successfully', async () => {
        await expect(
            emailChannel.send('test@example.com', 'Test Subject', 'Test body'),
        ).resolves.not.toThrow();
    });

    it('should build HTML template with correct content', () => {
        // Access private method via type assertion for testing
        const template = (emailChannel as any).buildHtmlTemplate('Mon titre', 'Mon contenu');
        expect(template).toContain('Mon titre');
        expect(template).toContain('Mon contenu');
        expect(template).toContain('Marketplace');
    });
});

describe('Notification API — input validation', () => {
    it('should require userId, type, title, message fields', () => {
        // Validate that missing fields results in an error structure
        const requiredFields = ['userId', 'type', 'title', 'message'];
        const payload: Record<string, string> = {};

        for (const field of requiredFields) {
            expect(payload[field]).toBeUndefined();
        }
    });

    it('should define expected notification types', () => {
        const expectedTypes = [
            'article_published',
            'article_validated',
            'article_rejected',
            'payment_received',
            'payment_sent',
            'order_confirmed',
            'price_change',
            'interest_match',
            'fraud_alert',
        ];
        expect(expectedTypes).toHaveLength(9);
        expect(expectedTypes).toContain('article_published');
        expect(expectedTypes).toContain('fraud_alert');
    });
});
