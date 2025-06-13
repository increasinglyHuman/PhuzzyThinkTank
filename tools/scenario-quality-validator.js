#!/usr/bin/env node
/**
 * Scenario Quality Validator
 * Comprehensive validation pipeline based on technical specifications
 * Ensures scenarios meet Phuzzy Think Tank educational standards
 */

const fs = require('fs');
const path = require('path');

// Quality scoring thresholds
const QUALITY_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    ACCEPTABLE: 60,
    NEEDS_IMPROVEMENT: 40,
    REJECT: 0
};

// Educational complexity requirements
const COMPLEXITY_REQUIREMENTS = {
    MIN_ELEMENTS: 4,
    MIN_FALLACIES: 1,
    MAX_FALLACIES: 3,
    OPTIMAL_WORD_COUNT: [800, 2000],
    REQUIRED_DIMENSIONS: ['logic', 'emotion', 'balanced', 'agenda']
};

class QualityValidator {
    constructor() {
        this.approvedFallacies = [
            'ad-hominem', 'appeal-to-authority', 'appeal-to-fear', 'appeal-to-nature',
            'appeal-to-tradition', 'bandwagon', 'cherry-picking', 'false-dilemma',
            'false-equivalence', 'false-scarcity', 'hasty-generalization', 'post-hoc',
            'red-herring', 'slippery-slope', 'straw-man'
        ];
    }

    validateStructure(scenario) {
        const errors = [];
        const warnings = [];

        // Required fields validation
        const required = [
            'id', 'title', 'text', 'claim', 'correctAnswer', 
            'answerWeights', 'reviewKeywords', 'dimensionAnalysis', 'logicalFallacies'
        ];

        required.forEach(field => {
            if (!scenario[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // ID format validation
        if (scenario.id && !/^[a-z0-9-]+$/.test(scenario.id)) {
            errors.push('ID must be kebab-case (lowercase letters, numbers, hyphens only)');
        }

        // Answer weights validation
        if (scenario.answerWeights) {
            COMPLEXITY_REQUIREMENTS.REQUIRED_DIMENSIONS.forEach(dim => {
                const weight = scenario.answerWeights[dim];
                if (typeof weight !== 'number' || weight < 0 || weight > 100) {
                    errors.push(`Invalid ${dim} weight: must be 0-100 integer`);
                }
                // Check for overly round numbers (indicates low precision)
                if (weight % 10 === 0 && weight !== 0 && weight !== 100) {
                    warnings.push(`${dim} weight ${weight} appears rounded - consider more precise scoring`);
                }
            });

            // Validate correct answer alignment for answerWeights
            const correctDim = scenario.correctAnswer;
            if (correctDim && scenario.answerWeights[correctDim]) {
                const correctWeight = scenario.answerWeights[correctDim];
                const otherWeights = Object.keys(scenario.answerWeights)
                    .filter(dim => dim !== correctDim)
                    .map(dim => scenario.answerWeights[dim]);
                
                if (correctWeight <= Math.max(...otherWeights)) {
                    warnings.push(`Correct answer ${correctDim} (${correctWeight}) should have highest answerWeight`);
                }
            }
            
            // Validate correct answer has highest aggregate keyword weight
            if (correctDim && scenario.reviewKeywords) {
                const aggregateWeights = {};
                ['logic', 'emotion', 'balanced', 'agenda'].forEach(dim => {
                    const keywords = scenario.reviewKeywords[dim] || [];
                    aggregateWeights[dim] = keywords.reduce((sum, keyword) => {
                        if (typeof keyword === 'object' && keyword.weight) {
                            return sum + keyword.weight;
                        } else if (typeof keyword === 'string') {
                            return sum + Math.min(10, keyword.length); // Old format fallback
                        }
                        return sum;
                    }, 0);
                });
                
                const correctAggregate = aggregateWeights[correctDim];
                const otherAggregates = Object.keys(aggregateWeights)
                    .filter(dim => dim !== correctDim)
                    .map(dim => aggregateWeights[dim]);
                
                const maxOtherAggregate = Math.max(...otherAggregates);
                if (correctAggregate <= maxOtherAggregate) {
                    warnings.push(`Correct answer ${correctDim} keyword aggregate (${correctAggregate}) should exceed max other (${maxOtherAggregate})`);
                }
                
                console.log(`📊 Keyword aggregates: ${JSON.stringify(aggregateWeights)}`);
            }
        }

        // ReviewKeywords timeline compatibility
        if (scenario.reviewKeywords) {
            COMPLEXITY_REQUIREMENTS.REQUIRED_DIMENSIONS.forEach(dim => {
                const keywords = scenario.reviewKeywords[dim];
                if (!Array.isArray(keywords)) {
                    errors.push(`reviewKeywords.${dim} must be array for timeline compatibility`);
                    return;
                }
                
                // Validate weighted keyword format
                keywords.forEach((keyword, index) => {
                    if (typeof keyword === 'object') {
                        // Weighted format validation
                        if (!keyword.phrase || typeof keyword.phrase !== 'string') {
                            errors.push(`reviewKeywords.${dim}[${index}] missing valid phrase`);
                        }
                        if (!keyword.weight || typeof keyword.weight !== 'number' || 
                            keyword.weight < 0 || keyword.weight > 100) {
                            errors.push(`reviewKeywords.${dim}[${index}] invalid weight (must be 0-100)`);
                        }
                    } else if (typeof keyword !== 'string') {
                        errors.push(`reviewKeywords.${dim}[${index}] must be string or weighted object`);
                    }
                });
            });
        }

        // Logical fallacies validation
        if (scenario.logicalFallacies) {
            if (scenario.logicalFallacies.length < COMPLEXITY_REQUIREMENTS.MIN_FALLACIES) {
                errors.push(`Must include at least ${COMPLEXITY_REQUIREMENTS.MIN_FALLACIES} logical fallacy`);
            }
            if (scenario.logicalFallacies.length > COMPLEXITY_REQUIREMENTS.MAX_FALLACIES) {
                warnings.push(`${scenario.logicalFallacies.length} fallacies may be too complex for educational clarity`);
            }

            scenario.logicalFallacies.forEach(fallacy => {
                if (!this.approvedFallacies.includes(fallacy.type)) {
                    errors.push(`Unapproved fallacy: ${fallacy.type}`);
                }
                if (!fallacy.description || fallacy.description.length < 10) {
                    warnings.push(`Fallacy ${fallacy.type} needs better description`);
                }
            });
        }

        return { errors, warnings };
    }

    validateContent(scenario) {
        const errors = [];
        const warnings = [];
        const metrics = {};

        if (!scenario.text) return { errors: ['No text content'], warnings: [], metrics: {} };

        // Content length analysis
        const wordCount = scenario.text.split(/\s+/).length;
        metrics.wordCount = wordCount;

        if (wordCount < COMPLEXITY_REQUIREMENTS.OPTIMAL_WORD_COUNT[0]) {
            warnings.push(`Content too short (${wordCount} words) - may lack complexity`);
        } else if (wordCount > COMPLEXITY_REQUIREMENTS.OPTIMAL_WORD_COUNT[1]) {
            warnings.push(`Content too long (${wordCount} words) - may lose reader attention`);
        }

        // Voice authenticity analysis
        const text = scenario.text.toLowerCase();
        const voicePatterns = {
            social_media: /(?:emoji|#\w+|@\w+|viral|trending|like if you agree)/gi,
            email: /(?:subject:|dear|click here|limited time|act now|unsubscribe)/gi,
            academic: /(?:study shows|research indicates|peer[- ]reviewed|methodology|significant)/gi,
            blog: /(?:in my experience|as i mentioned|you might be wondering|let me explain)/gi,
            forum: /(?:anyone else|has anyone tried|am i the only one|this community|gatekeeping)/gi
        };

        let platformMatch = null;
        let maxMatches = 0;
        Object.keys(voicePatterns).forEach(platform => {
            const matches = (scenario.text.match(voicePatterns[platform]) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                platformMatch = platform;
            }
        });

        metrics.voiceAuthenticity = { platform: platformMatch, strength: maxMatches };
        if (maxMatches < 2) {
            warnings.push('Weak platform voice authenticity - add more platform-specific language');
        }

        // Manipulation pattern detection
        const manipulationPatterns = {
            urgency: /(?:limited time|act now|hurry|deadline|expires soon|don't wait)/gi,
            scarcity: /(?:only \d+|last chance|running out|exclusive|while supplies last)/gi,
            social_proof: /(?:everyone is|thousands of|most people|join millions)/gi,
            authority: /(?:experts say|studies show|proven|guaranteed|certified)/gi,
            emotion: /(?:don't you hate|imagine if|you deserve|finally|freedom|truth)/gi
        };

        const detectedPatterns = {};
        Object.keys(manipulationPatterns).forEach(pattern => {
            const matches = (scenario.text.match(manipulationPatterns[pattern]) || []).length;
            if (matches > 0) detectedPatterns[pattern] = matches;
        });

        metrics.manipulationPatterns = detectedPatterns;
        const patternCount = Object.keys(detectedPatterns).length;
        
        if (patternCount < 2) {
            warnings.push('Low manipulation pattern diversity - add more persuasion techniques');
        }

        // Educational value indicators
        const educationalElements = {
            winking_admission: /(?:wink|;-?\)|btw|just saying|hint hint|if you know what i mean)/gi,
            contradiction: /(?:but|however|although|even though|despite|ironically)/gi,
            financial_motive: /(?:\$|price|cost|buy|purchase|investment|money|profit|revenue)/gi,
            credibility_boost: /(?:trust me|believe me|honestly|frankly|to be honest)/gi
        };

        const educationalScore = Object.keys(educationalElements).reduce((score, element) => {
            const matches = (scenario.text.match(educationalElements[element]) || []).length;
            return score + (matches > 0 ? 25 : 0);
        }, 0);

        metrics.educationalValue = educationalScore;
        if (educationalScore < 50) {
            warnings.push('Low educational value - add more recognizable manipulation patterns');
        }

        return { errors, warnings, metrics };
    }

    validateDimensionAnalysis(scenario) {
        const errors = [];
        const warnings = [];

        if (!scenario.dimensionAnalysis) {
            return { errors: ['Missing dimension analysis'], warnings: [] };
        }

        COMPLEXITY_REQUIREMENTS.REQUIRED_DIMENSIONS.forEach(dim => {
            const analysis = scenario.dimensionAnalysis[dim];
            if (!analysis) {
                errors.push(`Missing ${dim} dimension analysis`);
                return;
            }

            if (analysis.length < 50) {
                warnings.push(`${dim} analysis too brief (${analysis.length} chars) - needs more detail`);
            }

            // Check for analysis quality indicators
            const qualityMarkers = {
                logic: ['reasoning', 'evidence', 'conclusion', 'premise', 'argument'],
                emotion: ['feeling', 'fear', 'desire', 'anxiety', 'hope', 'anger'],
                balanced: ['perspective', 'nuance', 'complexity', 'consideration', 'alternative'],
                agenda: ['profit', 'selling', 'benefit', 'hidden', 'motive', 'agenda']
            };

            const markers = qualityMarkers[dim] || [];
            const foundMarkers = markers.filter(marker => 
                analysis.toLowerCase().includes(marker)
            ).length;

            if (foundMarkers < 2) {
                warnings.push(`${dim} analysis lacks key terminology - consider adding relevant concepts`);
            }
        });

        return { errors, warnings };
    }

    calculateOverallScore(scenario) {
        const structure = this.validateStructure(scenario);
        const content = this.validateContent(scenario);
        const dimension = this.validateDimensionAnalysis(scenario);

        // Scoring algorithm
        let score = 100;

        // Deduct for errors (critical issues)
        score -= (structure.errors.length * 20);
        score -= (content.errors.length * 15);
        score -= (dimension.errors.length * 10);

        // Deduct for warnings (quality issues)
        score -= (structure.warnings.length * 5);
        score -= (content.warnings.length * 3);
        score -= (dimension.warnings.length * 2);

        // Bonus for quality indicators
        if (content.metrics.educationalValue >= 75) score += 10;
        if (content.metrics.voiceAuthenticity?.strength >= 3) score += 5;
        if (Object.keys(content.metrics.manipulationPatterns || {}).length >= 3) score += 5;

        return Math.max(0, Math.min(100, score));
    }

    validateScenario(scenario) {
        const structure = this.validateStructure(scenario);
        const content = this.validateContent(scenario);
        const dimension = this.validateDimensionAnalysis(scenario);
        const overallScore = this.calculateOverallScore(scenario);

        // Determine quality rating
        let rating = 'REJECT';
        if (overallScore >= QUALITY_THRESHOLDS.EXCELLENT) rating = 'EXCELLENT';
        else if (overallScore >= QUALITY_THRESHOLDS.GOOD) rating = 'GOOD';
        else if (overallScore >= QUALITY_THRESHOLDS.ACCEPTABLE) rating = 'ACCEPTABLE';
        else if (overallScore >= QUALITY_THRESHOLDS.NEEDS_IMPROVEMENT) rating = 'NEEDS_IMPROVEMENT';

        return {
            id: scenario.id,
            title: scenario.title,
            score: overallScore,
            rating: rating,
            validation: {
                structure: structure,
                content: content,
                dimension: dimension
            },
            metrics: content.metrics,
            recommendation: this.getRecommendation(rating, overallScore)
        };
    }

    getRecommendation(rating, score) {
        switch (rating) {
            case 'EXCELLENT':
                return 'Ready for production. Consider as template for future scenarios.';
            case 'GOOD':
                return 'Minor improvements recommended but acceptable for use.';
            case 'ACCEPTABLE':
                return 'Usable with revisions. Address warnings before publication.';
            case 'NEEDS_IMPROVEMENT':
                return 'Significant revisions required. Focus on content quality and educational value.';
            default:
                return 'Reject and regenerate. Too many critical issues for revision.';
        }
    }

    validateFile(filePath) {
        console.log(`📋 Validating: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const scenarios = data.scenarios || [data];

        const results = scenarios.map(scenario => this.validateScenario(scenario));
        
        // Generate summary report
        const summary = {
            total: results.length,
            excellent: results.filter(r => r.rating === 'EXCELLENT').length,
            good: results.filter(r => r.rating === 'GOOD').length,
            acceptable: results.filter(r => r.rating === 'ACCEPTABLE').length,
            needsImprovement: results.filter(r => r.rating === 'NEEDS_IMPROVEMENT').length,
            reject: results.filter(r => r.rating === 'REJECT').length,
            averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        };

        return { results, summary };
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const filePath = args[0];

    if (!filePath) {
        console.log(`
📋 Scenario Quality Validator

Usage: node scenario-quality-validator.js <scenario-file.json>

Validates scenarios against Phuzzy Think Tank educational standards:
- Structural compliance
- Content quality and voice authenticity  
- Educational effectiveness
- Timeline system compatibility

Quality Ratings:
- EXCELLENT (90-100): Production ready
- GOOD (75-89): Minor improvements needed
- ACCEPTABLE (60-74): Usable with revisions
- NEEDS_IMPROVEMENT (40-59): Significant work required
- REJECT (0-39): Regenerate scenario
        `);
        process.exit(0);
    }

    try {
        const validator = new QualityValidator();
        const { results, summary } = validator.validateFile(filePath);

        console.log(`\n📊 Validation Summary for ${filePath}:`);
        console.log(`Total scenarios: ${summary.total}`);
        console.log(`Average score: ${summary.averageScore}/100`);
        console.log(`\nRating distribution:`);
        console.log(`  ⭐ EXCELLENT: ${summary.excellent}`);
        console.log(`  ✅ GOOD: ${summary.good}`);
        console.log(`  🔶 ACCEPTABLE: ${summary.acceptable}`);
        console.log(`  ⚠️  NEEDS_IMPROVEMENT: ${summary.needsImprovement}`);
        console.log(`  ❌ REJECT: ${summary.reject}`);

        console.log(`\n📋 Individual Results:`);
        results.forEach(result => {
            const emoji = {
                'EXCELLENT': '⭐',
                'GOOD': '✅', 
                'ACCEPTABLE': '🔶',
                'NEEDS_IMPROVEMENT': '⚠️',
                'REJECT': '❌'
            }[result.rating];

            console.log(`\n${emoji} ${result.id} - ${result.title}`);
            console.log(`   Score: ${result.score}/100 (${result.rating})`);
            console.log(`   ${result.recommendation}`);

            // Show top issues
            const allErrors = [
                ...result.validation.structure.errors,
                ...result.validation.content.errors,
                ...result.validation.dimension.errors
            ];
            const allWarnings = [
                ...result.validation.structure.warnings,
                ...result.validation.content.warnings,
                ...result.validation.dimension.warnings
            ];

            if (allErrors.length > 0) {
                console.log(`   🚨 Errors: ${allErrors.slice(0, 2).join(', ')}${allErrors.length > 2 ? '...' : ''}`);
            }
            if (allWarnings.length > 0) {
                console.log(`   ⚠️  Warnings: ${allWarnings.slice(0, 2).join(', ')}${allWarnings.length > 2 ? '...' : ''}`);
            }
        });

        // Export detailed report
        const reportFile = filePath.replace('.json', '-validation-report.json');
        fs.writeFileSync(reportFile, JSON.stringify({ summary, results }, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportFile}`);

    } catch (error) {
        console.error(`❌ Validation failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { QualityValidator, QUALITY_THRESHOLDS };