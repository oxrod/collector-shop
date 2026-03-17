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
        expect(result.reasons).toContain('Prix inférieur au minimum autorisé (5€)');
    });

    it('should flag extremely high price', () => {
        const result = validateArticle(100000);
        expect(result.score).toBeGreaterThan(0);
        expect(result.reasons).toContain('Prix anormalement élevé (> 1500€) — vérification manuelle recommandée');
    });

    it('should flag price with too many decimals', () => {
        const result = validateArticle(10.123);
        expect(result.score).toBeGreaterThan(0);
        expect(result.reasons).toContain('Prix avec trop de décimales');
    });
});

describe('Content Rules', () => {
    it('should accept valid content', () => {
        const result = validateContent(
            'iPhone 15 Pro',
            'Excellent état, vendu avec boîte originale et accessoires. Ce téléphone est en parfait état de fonctionnement, sans aucune rayure, livré avec tous les accessoires originaux et la boîte.',
        );
        expect(result.score).toBe(0);
        expect(result.reasons).toHaveLength(0);
    });

    it('should flag forbidden words', () => {
        const result = validateContent(
            'Scam product',
            'This is a totally real product that does not scam anyone at all in any way shape or form I promise you this is a real product',
        );
        expect(result.reasons.some((r) => r.includes('Mot interdit détecté'))).toBe(true);
    });

    it('should flag short description', () => {
        const result = validateContent('iPhone', 'Short');
        expect(result.reasons.some((r) => r.includes('Description trop courte'))).toBe(true);
    });

    it('should flag short title', () => {
        const result = validateContent('ab', 'This is a proper description for an article that should be long enough to pass the validation check with fifty words minimum for the collector shop platform');
        expect(result.reasons).toContain('Titre trop court (minimum 3 caractères)');
    });

    it('should flag excessive caps', () => {
        const result = validateContent(
            'SUPER ARTICLE INCROYABLE',
            'THIS IS ALL CAPS DESCRIPTION WHICH SHOULD TRIGGER THE UPPERCASE CHECK BECAUSE IT HAS WAY TOO MANY CAPITAL LETTERS AND IS DEFINITELY SPAM CONTENT THAT SHOULD BE FLAGGED BY OUR SYSTEM',
        );
        expect(result.reasons).toContain('Utilisation excessive de majuscules');
    });
});
