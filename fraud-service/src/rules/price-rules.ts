interface ValidationResult {
    score: number;
    reasons: string[];
}

/**
 * Validates article price for fraud detection.
 * Collector.shop: prix autorisés entre 5€ et 1500€ (sauf cas suspects).
 * Score: 0 = safe, 1 = high risk
 */
export function validateArticle(price: number): ValidationResult {
    const reasons: string[] = [];
    let score = 0;

    // Price must be positive
    if (price <= 0) {
        reasons.push('Le prix doit être supérieur à 0');
        score = 1.0;
        return { score, reasons };
    }

    // Minimum price: 5€
    if (price < 5) {
        reasons.push('Prix inférieur au minimum autorisé (5€)');
        score += 0.4;
    }

    // Suspiciously high price (> 1500€) — cas suspect
    if (price > 1500) {
        reasons.push('Prix anormalement élevé (> 1500€) — vérification manuelle recommandée');
        score += 0.5;
    }

    // Very high price (> 5000€) — almost certainly suspect
    if (price > 5000) {
        reasons.push('Prix extrêmement élevé — risque de fraude');
        score += 0.4;
    }

    // Price with too many decimals (potential manipulation)
    const priceStr = price.toString();
    if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
        reasons.push('Prix avec trop de décimales');
        score += 0.2;
    }

    return { score: Math.min(1, score), reasons };
}
