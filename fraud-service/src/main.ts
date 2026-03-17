import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';
import { validateArticle } from './rules/price-rules';
import { validateContent } from './rules/content-rules';

const app = express();
const PORT = process.env.PORT || 3002;

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

const fraudValidationsTotal = new Counter({
    name: 'fraud_validations_total',
    help: 'Total number of fraud validations',
    labelNames: ['valid'],
    registers: [register],
});

const fraudValidationDuration = new Histogram({
    name: 'fraud_validation_duration_seconds',
    help: 'Duration of fraud validation in seconds',
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
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

// ——— Routes ———

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'fraud-service' });
});

// Prometheus metrics
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Fraud validation endpoint
app.post('/validate', (req, res) => {
    const end = fraudValidationDuration.startTimer();
    const { articleId, title, description, price } = req.body;

    if (!title || !description || price === undefined) {
        fraudValidationsTotal.inc({ valid: 'false' });
        end();
        return res.status(400).json({
            valid: false,
            score: 1.0,
            reasons: ['Missing required fields: title, description, price'],
        });
    }

    const priceResult = validateArticle(price);
    const contentResult = validateContent(title, description);

    // Combine scores (0 = safe, 1 = high risk)
    const allReasons = [...priceResult.reasons, ...contentResult.reasons];
    const combinedScore = Math.min(
        1,
        (priceResult.score + contentResult.score) / 2,
    );

    const valid = combinedScore < 0.5 && allReasons.length === 0;

    fraudValidationsTotal.inc({ valid: String(valid) });
    end();

    console.log(`[Fraud] Article ${articleId} — Score: ${combinedScore.toFixed(2)} — Valid: ${valid}`);

    res.json({
        articleId,
        valid,
        score: Number(combinedScore.toFixed(2)),
        reasons: allReasons,
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🔍 Fraud Service running on http://localhost:${PORT}`);
    });
}

export default app;
