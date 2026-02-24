import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EmailChannel } from './channels/email';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

const emailChannel = new EmailChannel();

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});

// Send notification
app.post('/notify', async (req, res) => {
    const { userId, type, title, message, email } = req.body;

    if (!userId || !type || !title || !message) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId, type, title, message',
        });
    }

    console.log(`[Notification] Type: ${type} | User: ${userId} | Title: ${title}`);

    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Email notification (if email provided)
    if (email) {
        try {
            await emailChannel.send(email, title, message);
            results.push({ channel: 'email', success: true });
        } catch (error: any) {
            console.error('[Notification] Email error:', error.message);
            results.push({ channel: 'email', success: false, error: error.message });
        }
    }

    // Log notification (always)
    results.push({ channel: 'log', success: true });

    res.json({
        success: true,
        notificationId: `notif_${Date.now()}`,
        userId,
        type,
        channels: results,
    });
});

// List notification types
app.get('/types', (_req, res) => {
    res.json({
        types: [
            { id: 'article_published', label: 'Article publié' },
            { id: 'article_validated', label: 'Article validé' },
            { id: 'article_rejected', label: 'Article rejeté' },
            { id: 'payment_received', label: 'Paiement reçu' },
            { id: 'payment_sent', label: 'Paiement envoyé' },
            { id: 'order_confirmed', label: 'Commande confirmée' },
            { id: 'price_change', label: 'Variation de prix' },
            { id: 'interest_match', label: 'Nouvel article correspondant à vos centres d\'intérêt' },
            { id: 'fraud_alert', label: 'Alerte fraude détectée' },
        ],
    });
});

app.listen(PORT, () => {
    console.log(`📧 Notification Service running on http://localhost:${PORT}`);
});

export default app;
