interface ValidationResult {
    score: number;
    reasons: string[];
}

// Forbidden words list (expandable)
const FORBIDDEN_WORDS = [
    'scam',
    'arnaque',
    'fake',
    'contrefaçon',
    'replica',
    'gratuit',
    'free',
    'bitcoin',
    'crypto',
    'casino',
    'copie',
    'imitation',
];

/**
 * Validates article content for fraud detection.
 * Collector.shop: objets de collection vintage uniquement.
 * Score: 0 = safe, 1 = high risk
 */
export function validateContent(title: string, description: string): ValidationResult {
    const reasons: string[] = [];
    let score = 0;

    const fullText = `${title} ${description}`.toLowerCase();

    // Check for forbidden words
    for (const word of FORBIDDEN_WORDS) {
        if (fullText.includes(word)) {
            reasons.push(`Mot interdit détecté : "${word}"`);
            score += 0.5;
        }
    }

    // Description too short (minimum 50 words for Collector.shop)
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 50) {
        reasons.push(`Description trop courte (${wordCount} mots, minimum 50 requis)`);
        score += 0.3;
    }

    // Title too short
    if (title.length < 3) {
        reasons.push('Titre trop court (minimum 3 caractères)');
        score += 0.2;
    }

    // Check for excessive caps (spam indicator) — use original text, not lowercased
    const originalText = `${title} ${description}`;
    const uppercaseRatio = (originalText.match(/[A-Z]/g) || []).length / originalText.length;
    if (uppercaseRatio > 0.6 && originalText.length > 10) {
        reasons.push('Utilisation excessive de majuscules');
        score += 0.2;
    }

    // Check for repeated characters (spam indicator)
    if (/(.)\1{4,}/.test(fullText)) {
        reasons.push('Répétition excessive de caractères détectée');
        score += 0.2;
    }

    return { score: Math.min(1, score), reasons };
}
