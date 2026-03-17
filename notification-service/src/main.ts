import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';
import { EmailChannel } from './channels/email';

const app = express();
const PORT = process.env.PORT || 3003;

// ——— Prometheus Metrics ———
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});

const notificationsSentTotal = new Counter({
    name: 'notifications_sent_total',
    help: 'Total number of notifications sent',
    labelNames: ['channel', 'type', 'success'],
    registers: [register],
});

const notificationDuration = new Histogram({
    name: 'notification_duration_seconds',
    help: 'Duration of notification sending in seconds',
    labelNames: ['channel'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

// ——— Middleware ———
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: 'Too many requests from this IP, please try again later.',
    }),
);

// HTTP metrics middleware (exclude /metrics and /health)
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/metrics' || req.path === '/health') {
        return next();
    }
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route?.path || req.path;
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode.toString(),
        });
        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode.toString() },
            durationMs,
        );
    });
    next();
});

const emailChannel = new EmailChannel();

// ——— Routes ———

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});

// Prometheus metrics
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
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
        const end = notificationDuration.startTimer({ channel: 'email' });
        try {
            await emailChannel.send(email, title, message);
            results.push({ channel: 'email', success: true });
            notificationsSentTotal.inc({ channel: 'email', type, success: 'true' });
        } catch (error: any) {
            console.error('[Notification] Email error:', error.message);
            results.push({ channel: 'email', success: false, error: error.message });
            notificationsSentTotal.inc({ channel: 'email', type, success: 'false' });
        }
        end();
    }

    // Log notification (always)
    results.push({ channel: 'log', success: true });
    notificationsSentTotal.inc({ channel: 'log', type, success: 'true' });

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
