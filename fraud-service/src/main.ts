import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { validateArticle } from './rules/price-rules';
import { validateContent } from './rules/content-rules';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'fraud-service' });
});

// Fraud validation endpoint
app.post('/validate', (req, res) => {
    const { articleId, title, description, price } = req.body;

    if (!title || !description || price === undefined) {
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

    console.log(`[Fraud] Article ${articleId} — Score: ${combinedScore.toFixed(2)} — Valid: ${valid}`);

    res.json({
        articleId,
        valid,
        score: Number(combinedScore.toFixed(2)),
        reasons: allReasons,
    });
});

app.listen(PORT, () => {
    console.log(`🔍 Fraud Service running on http://localhost:${PORT}`);
});

export default app;
