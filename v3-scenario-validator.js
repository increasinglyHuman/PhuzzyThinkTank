/**
 * V3 Scenario Validation Library
 * Enforces V3 spec requirements including:
 * - Only 15 allowed logical fallacies
 * - Rich indicator/trigger objects
 * - Proper hint structure
 * - Audio script compatibility
 */

// The 15 allowed logical fallacies (from V3 spec)
const ALLOWED_FALLACIES = [
    'ad-hominem',
    'appeal-to-authority', 
    'appeal-to-emotion',
    'bandwagon',
    'black-or-white',
    'burden-of-proof',
    'circular-reasoning',
    'false-cause',
    'hasty-generalization',
    'loaded-question',
    'slippery-slope',
    'straw-man',
    'tu-quoque',
    'red-herring',
    'appeal-to-nature'
];

// Common fallacy mappings (from V3 spec)
const FALLACY_MAPPINGS = {
    // Ad Hominem variations
    'ad-hominem-attack': 'ad-hominem',
    'personal-attack': 'ad-hominem',
    'ad-hominem-abusive': 'ad-hominem',
    'ad-hominem-circumstantial': 'ad-hominem',
    'genetic-fallacy': 'ad-hominem',
    
    // Appeal to Authority variations
    'appeal-to-false-authority': 'appeal-to-authority',
    'argument-from-authority': 'appeal-to-authority',
    'appeal-to-expertise': 'appeal-to-authority',
    
    // Appeal to Emotion variations
    'appeal-to-fear': 'appeal-to-emotion',
    'appeal-to-pity': 'appeal-to-emotion',
    'appeal-to-spite': 'appeal-to-emotion',
    'appeal-to-wishful-thinking': 'appeal-to-emotion',
    
    // Bandwagon variations
    'appeal-to-popularity': 'bandwagon',
    'argument-from-popularity': 'bandwagon',
    'appeal-to-common-practice': 'bandwagon',
    
    // Black or White variations
    'false-dilemma': 'black-or-white',
    'false-dichotomy': 'black-or-white',
    'either-or': 'black-or-white',
    
    // False Cause variations
    'post-hoc': 'false-cause',
    'correlation-not-causation': 'false-cause',
    'false-correlation': 'false-cause',
    
    // Others
    'begging-the-question': 'circular-reasoning',
    'shifting-burden': 'burden-of-proof',
    'whataboutism': 'tu-quoque',
    'appeal-to-hypocrisy': 'tu-quoque',
    'smoke-screen': 'red-herring',
    'naturalistic-fallacy': 'appeal-to-nature'
};

// Load indicator/trigger database
let indicatorDatabase = null;
async function loadIndicatorDatabase() {
    if (!indicatorDatabase) {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const dbPath = path.join(__dirname, 'data/indicator-trigger-icons.json');
            const data = await fs.readFile(dbPath, 'utf8');
            indicatorDatabase = JSON.parse(data);
        } catch (error) {
            console.warn('Could not load indicator database:', error.message);
            indicatorDatabase = { indicators: {}, triggers: {} };
        }
    }
    return indicatorDatabase;
}

// Validate a single fallacy reference
function validateFallacy(fallacy) {
    if (typeof fallacy === 'string') {
        // Legacy format - convert to object
        const mappedId = FALLACY_MAPPINGS[fallacy] || fallacy;
        if (!ALLOWED_FALLACIES.includes(mappedId)) {
            return {
                valid: false,
                error: `Fallacy "${fallacy}" is not in the allowed list of 15 fallacies`,
                suggestion: `Use one of: ${ALLOWED_FALLACIES.join(', ')}`
            };
        }
        return {
            valid: true,
            normalized: {
                fallacyId: mappedId,
                strength: 'strong',
                appealType: mappedId.includes('appeal') ? mappedId.split('-')[2] : null
            }
        };
    }
    
    // V3 format object
    const mappedId = FALLACY_MAPPINGS[fallacy.fallacyId] || fallacy.fallacyId;
    if (!ALLOWED_FALLACIES.includes(mappedId)) {
        return {
            valid: false,
            error: `Fallacy "${fallacy.fallacyId}" is not in the allowed list of 15 fallacies`
        };
    }
    
    return {
        valid: true,
        normalized: {
            ...fallacy,
            fallacyId: mappedId
        }
    };
}

// Validate indicator/trigger objects
async function validateIndicators(indicators) {
    const db = await loadIndicatorDatabase();
    const validated = [];
    const errors = [];
    
    for (const indicator of indicators) {
        if (typeof indicator === 'string') {
            // Legacy format - try to find in database
            const dbEntry = Object.values(db.indicators).find(i => 
                i.text.toLowerCase() === indicator.toLowerCase()
            );
            
            if (dbEntry) {
                validated.push({
                    id: dbEntry.id,
                    text: dbEntry.text,
                    icon: dbEntry.icon,
                    category: dbEntry.category,
                    severity: dbEntry.severity || 'medium'
                });
            } else {
                errors.push(`Indicator "${indicator}" not found in database`);
            }
        } else if (indicator.id) {
            // V3 format - validate against database
            const dbEntry = db.indicators[indicator.id];
            if (dbEntry) {
                validated.push({
                    ...dbEntry,
                    ...indicator,
                    icon: indicator.icon || dbEntry.icon
                });
            } else {
                errors.push(`Indicator ID "${indicator.id}" not found in database`);
            }
        } else {
            errors.push(`Invalid indicator format: ${JSON.stringify(indicator)}`);
        }
    }
    
    return { validated, errors };
}

// Main V3 scenario validator
async function validateV3Scenario(scenario) {
    const errors = [];
    const warnings = [];
    const fixes = {};
    
    // Required fields
    const requiredFields = ['id', 'title', 'content', 'claim', 'correctAnswer', 'distractorAnswer'];
    for (const field of requiredFields) {
        if (!scenario[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Validate correct answer
    if (scenario.correctAnswer && !['logic', 'emotion', 'balanced'].includes(scenario.correctAnswer)) {
        errors.push(`Invalid correctAnswer: ${scenario.correctAnswer}. Must be: logic, emotion, or balanced`);
    }
    
    // Validate logical fallacies
    if (scenario.logicalFallacies) {
        const validatedFallacies = [];
        for (const fallacy of scenario.logicalFallacies) {
            const validation = validateFallacy(fallacy);
            if (validation.valid) {
                validatedFallacies.push(validation.normalized);
            } else {
                errors.push(validation.error);
                if (validation.suggestion) {
                    warnings.push(validation.suggestion);
                }
            }
        }
        fixes.logicalFallacies = validatedFallacies;
    }
    
    // Validate indicators
    if (scenario.indicators) {
        const { validated, errors: indicatorErrors } = await validateIndicators(scenario.indicators);
        if (indicatorErrors.length > 0) {
            warnings.push(...indicatorErrors);
        }
        fixes.indicators = validated;
    }
    
    // Validate triggers
    if (scenario.triggers) {
        const { validated, errors: triggerErrors } = await validateIndicators(scenario.triggers);
        if (triggerErrors.length > 0) {
            warnings.push(...triggerErrors);
        }
        fixes.triggers = validated;
    }
    
    // Validate answer weights
    if (scenario.answerWeights) {
        const weights = scenario.answerWeights;
        const total = (weights.logic || 0) + (weights.emotion || 0) + (weights.balanced || 0);
        if (Math.abs(total - 100) > 0.1) {
            errors.push(`Answer weights must sum to 100, got ${total}`);
        }
    } else {
        errors.push('Missing answerWeights');
    }
    
    // Validate hints structure
    if (scenario.hints) {
        if (!Array.isArray(scenario.hints)) {
            errors.push('Hints must be an array');
        } else {
            scenario.hints.forEach((hint, i) => {
                if (!hint.text) {
                    errors.push(`Hint ${i} missing text`);
                }
                if (hint.level && !['subtle', 'moderate', 'obvious'].includes(hint.level)) {
                    warnings.push(`Hint ${i} has invalid level: ${hint.level}`);
                }
            });
        }
    }
    
    // Audio script validation (if present)
    if (scenario.audioScript) {
        // Check for numbers that should be words
        const numberPattern = /\b\d+\b/g;
        const numbers = scenario.audioScript.match(numberPattern);
        if (numbers) {
            warnings.push(`Audio script contains numbers that should be words: ${numbers.join(', ')}`);
        }
        
        // Check for hashtags
        if (scenario.audioScript.includes('#')) {
            warnings.push('Audio script contains hashtags that should be spelled out');
        }
    }
    
    // V3 format validation
    if (!scenario.version || scenario.version !== '3.0.0') {
        warnings.push('Scenario should specify version: "3.0.0"');
        fixes.version = '3.0.0';
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        fixes,
        scenario: {
            ...scenario,
            ...fixes
        }
    };
}

// Batch validation function
async function validateScenarioBatch(scenarios) {
    const results = {
        total: scenarios.length,
        valid: 0,
        invalid: 0,
        warnings: 0,
        details: []
    };
    
    for (const scenario of scenarios) {
        const validation = await validateV3Scenario(scenario);
        results.details.push({
            id: scenario.id,
            title: scenario.title,
            ...validation
        });
        
        if (validation.valid) {
            results.valid++;
            if (validation.warnings.length > 0) {
                results.warnings++;
            }
        } else {
            results.invalid++;
        }
    }
    
    return results;
}

// Export functions
module.exports = {
    ALLOWED_FALLACIES,
    FALLACY_MAPPINGS,
    validateV3Scenario,
    validateScenarioBatch,
    validateFallacy,
    validateIndicators,
    loadIndicatorDatabase
};