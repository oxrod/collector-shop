import { validateArticle } from '../src/rules/price-rules';
import { validateContent } from '../src/rules/content-rules';

describe('Price Rules', () => {
    it('should accept valid price', () => {
        const result = validateArticle(49.99);
        expect(result.score).toBe(0);
        expect(result.reasons).toHaveLength(0);
    });

    it('should reject negative price', () => {
        const result = validateArticle(-10);
        expect(result.score).toBe(1.0);
        expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should flag suspiciously low price', () => {
        const result = validateArticle(0.5);
        expect(result.score).toBeGreaterThan(0);
        expect(result.reasons).toContain('Suspiciously low price');
    });

    it('should flag extremely high price', () => {
        const result = validateArticle(100000);
        expect(result.score).toBeGreaterThan(0);
        expect(result.reasons).toContain('Unusually high price — manual review recommended');
    });
});

describe('Content Rules', () => {
    it('should accept valid content', () => {
        const result = validateContent('iPhone 15 Pro', 'Excellent état, vendu avec boîte originale et accessoires');
        expect(result.score).toBe(0);
        expect(result.reasons).toHaveLength(0);
    });

    it('should flag forbidden words', () => {
        const result = validateContent('Scam product', 'This is a totally real product');
        expect(result.reasons.some((r) => r.includes('Forbidden word'))).toBe(true);
    });

    it('should flag short description', () => {
        const result = validateContent('iPhone', 'Short');
        expect(result.reasons).toContain('Description is too short (minimum 10 characters)');
    });

    it('should flag short title', () => {
        const result = validateContent('ab', 'This is a proper description for an article');
        expect(result.reasons).toContain('Title is too short (minimum 3 characters)');
    });
});
