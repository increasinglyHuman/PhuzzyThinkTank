/**
 * 🛡️ Phuzzy Input Validation System
 * Comprehensive validation for all user inputs, scenario data, and API responses
 * 
 * Features:
 * - Scenario structure validation
 * - User input sanitization
 * - API response validation
 * - Security-focused content filtering
 * 
 * Built for the Phuzzy Think Tank game engine
 */

class PhuzzyInputValidator {
    constructor(config = {}) {
        this.config = {
            maxScenarioLength: config.maxScenarioLength || 5000,
            maxChoices: config.maxChoices || 6,
            allowedAnswers: config.allowedAnswers || ['logic', 'emotion', 'manipulation', 'agenda'],
            maxStringLength: config.maxStringLength || 1000,
            strictMode: config.strictMode !== false,
            ...config
        };
        
        this.validationLog = [];
        this.errorCount = 0;
    }

    /**
     * Log validation issues for debugging
     */
    logValidation(level, message, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        };
        
        this.validationLog.push(entry);
        
        if (level === 'error') {
            this.errorCount++;
            console.error(`[InputValidator] ${message}`, context);
        } else if (level === 'warning') {
            console.warn(`[InputValidator] ${message}`, context);
        }
        
        // Keep log manageable
        if (this.validationLog.length > 100) {
            this.validationLog.shift();
        }
    }

    /**
     * Validate scenario structure and content
     */
    validateScenario(scenario, context = {}) {
        if (!scenario || typeof scenario !== 'object') {
            this.logValidation('error', 'Scenario is not a valid object', { scenario, context });
            return {
                valid: false,
                errors: ['Scenario must be an object'],
                sanitized: null
            };
        }

        const errors = [];
        const warnings = [];
        const sanitized = {};

        // Required fields validation (v3 format)
        const requiredFields = ['id', 'title', 'correctAnswer'];
        // v3 uses 'text' instead of 'content', and no 'choices' field needed
        for (const field of requiredFields) {
            if (!scenario[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        // Check for v3 text field (replaces content)
        if (!scenario.text && !scenario.content) {
            errors.push('Missing required field: text (or content)');
        }

        // ID validation
        if (scenario.id) {
            if (typeof scenario.id !== 'string' || scenario.id.length === 0) {
                errors.push('Scenario ID must be a non-empty string');
            } else if (!/^[a-zA-Z0-9_-]+$/.test(scenario.id)) {
                errors.push('Scenario ID contains invalid characters');
            } else {
                sanitized.id = scenario.id.trim();
            }
        }

        // Title validation
        if (scenario.title) {
            if (typeof scenario.title !== 'string') {
                errors.push('Title must be a string');
            } else if (scenario.title.length > this.config.maxStringLength) {
                errors.push(`Title too long (max ${this.config.maxStringLength} characters)`);
            } else {
                sanitized.title = this.sanitizeString(scenario.title);
            }
        }

        // Content validation
        if (scenario.content) {
            if (typeof scenario.content !== 'string') {
                errors.push('Content must be a string');
            } else if (scenario.content.length > this.config.maxScenarioLength) {
                errors.push(`Content too long (max ${this.config.maxScenarioLength} characters)`);
            } else {
                sanitized.content = this.sanitizeString(scenario.content);
            }
        }

        // Choices validation
        if (scenario.choices) {
            if (!Array.isArray(scenario.choices)) {
                errors.push('Choices must be an array');
            } else if (scenario.choices.length === 0) {
                errors.push('Scenario must have at least one choice');
            } else if (scenario.choices.length > this.config.maxChoices) {
                errors.push(`Too many choices (max ${this.config.maxChoices})`);
            } else {
                sanitized.choices = scenario.choices.map((choice, index) => {
                    if (typeof choice !== 'object' || !choice) {
                        errors.push(`Choice ${index} must be an object`);
                        return null;
                    }
                    
                    const sanitizedChoice = {};
                    
                    if (choice.id && typeof choice.id === 'string') {
                        sanitized.id = choice.id.trim();
                    } else {
                        errors.push(`Choice ${index} missing valid ID`);
                    }
                    
                    if (choice.text && typeof choice.text === 'string') {
                        sanitizedChoice.text = this.sanitizeString(choice.text);
                    } else {
                        errors.push(`Choice ${index} missing valid text`);
                    }
                    
                    return sanitizedChoice;
                }).filter(Boolean);
            }
        }

        // Correct answer validation
        if (scenario.correctAnswer) {
            if (typeof scenario.correctAnswer !== 'string') {
                errors.push('Correct answer must be a string');
            } else if (!this.config.allowedAnswers.includes(scenario.correctAnswer)) {
                errors.push(`Invalid correct answer: ${scenario.correctAnswer}. Must be one of: ${this.config.allowedAnswers.join(', ')}`);
            } else {
                sanitized.correctAnswer = scenario.correctAnswer;
            }
        }

        // Optional fields validation
        if (scenario.fallacies && Array.isArray(scenario.fallacies)) {
            sanitized.fallacies = scenario.fallacies.map(f => this.sanitizeString(f)).filter(Boolean);
        }

        if (scenario.bearAnalysis && typeof scenario.bearAnalysis === 'object') {
            sanitized.bearAnalysis = {};
            if (scenario.bearAnalysis.logic) {
                sanitized.bearAnalysis.logic = this.sanitizeString(scenario.bearAnalysis.logic);
            }
            if (scenario.bearAnalysis.emotion) {
                sanitized.bearAnalysis.emotion = this.sanitizeString(scenario.bearAnalysis.emotion);
            }
        }

        // Audio metadata validation
        if (scenario.audio && typeof scenario.audio === 'object') {
            sanitized.audio = this.validateAudioMetadata(scenario.audio);
        }

        const result = {
            valid: errors.length === 0,
            errors,
            warnings,
            sanitized: errors.length === 0 ? sanitized : null
        };

        if (errors.length > 0) {
            this.logValidation('error', 'Scenario validation failed', { 
                scenarioId: scenario.id, 
                errors, 
                context 
            });
        } else if (warnings.length > 0) {
            this.logValidation('warning', 'Scenario validation warnings', { 
                scenarioId: scenario.id, 
                warnings, 
                context 
            });
        }

        return result;
    }

    /**
     * Validate user answer input
     */
    validateUserAnswer(answer, context = {}) {
        if (!answer) {
            return {
                valid: false,
                error: 'Answer cannot be empty',
                sanitized: null
            };
        }

        if (typeof answer !== 'string') {
            return {
                valid: false,
                error: 'Answer must be a string',
                sanitized: null
            };
        }

        const trimmed = answer.trim().toLowerCase();

        if (!this.config.allowedAnswers.includes(trimmed)) {
            this.logValidation('error', 'Invalid user answer', { answer, allowedAnswers: this.config.allowedAnswers, context });
            return {
                valid: false,
                error: `Invalid answer: ${answer}. Must be one of: ${this.config.allowedAnswers.join(', ')}`,
                sanitized: null
            };
        }

        return {
            valid: true,
            error: null,
            sanitized: trimmed
        };
    }

    /**
     * Validate audio metadata structure
     */
    validateAudioMetadata(audioData) {
        if (!audioData || typeof audioData !== 'object') {
            return null;
        }

        const sanitized = {};

        if (audioData.packId && typeof audioData.packId === 'string') {
            sanitized.packId = audioData.packId.trim();
        }

        if (audioData.scenarioId && typeof audioData.scenarioId === 'string') {
            sanitized.scenarioId = audioData.scenarioId.trim();
        }

        if (audioData.parts && Array.isArray(audioData.parts)) {
            sanitized.parts = audioData.parts
                .filter(part => typeof part === 'string' && part.trim().length > 0)
                .map(part => part.trim());
        }

        if (audioData.multiVoice !== undefined) {
            sanitized.multiVoice = Boolean(audioData.multiVoice);
        }

        return sanitized;
    }

    /**
     * Validate API response structure
     */
    validateAPIResponse(response, expectedType = 'unknown', context = {}) {
        if (!response) {
            this.logValidation('error', 'API response is null or undefined', { expectedType, context });
            return {
                valid: false,
                error: 'No response received',
                sanitized: null
            };
        }

        const result = {
            valid: true,
            errors: [],
            warnings: [],
            sanitized: response
        };

        // Type-specific validation
        switch (expectedType) {
            case 'scenario':
                return this.validateScenario(response, { source: 'api', ...context });
                
            case 'elevenlabs':
                if (!response.audio_base64 && !response.audio_url) {
                    result.valid = false;
                    result.errors.push('ElevenLabs response missing audio data');
                }
                break;
                
            case 'anthropic':
                if (!response.content || !Array.isArray(response.content)) {
                    result.valid = false;
                    result.errors.push('Anthropic response missing content array');
                } else if (response.content.length === 0) {
                    result.valid = false;
                    result.errors.push('Anthropic response content is empty');
                }
                break;
        }

        if (!result.valid) {
            this.logValidation('error', `API response validation failed for ${expectedType}`, { 
                response, 
                errors: result.errors, 
                context 
            });
        }

        return result;
    }

    /**
     * Sanitize string content (remove/escape dangerous characters)
     */
    sanitizeString(str) {
        if (typeof str !== 'string') {
            return '';
        }

        return str
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: urls
            .replace(/on\w+\s*=/gi, '') // Remove on* event handlers
            .replace(/\0/g, '') // Remove null bytes
            .substring(0, this.config.maxStringLength); // Enforce length limit
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        const recentErrors = this.validationLog.filter(entry => 
            entry.level === 'error' && 
            Date.now() - new Date(entry.timestamp).getTime() < 300000 // Last 5 minutes
        );

        return {
            totalErrors: this.errorCount,
            recentErrors: recentErrors.length,
            logEntries: this.validationLog.length,
            lastError: this.validationLog.filter(e => e.level === 'error').pop() || null
        };
    }

    /**
     * Clear validation log
     */
    clearLog() {
        this.validationLog = [];
        this.errorCount = 0;
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.PhuzzyInputValidator = PhuzzyInputValidator;
}

// Module export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhuzzyInputValidator;
}