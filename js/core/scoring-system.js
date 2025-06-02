
// ===== CORE/SCORING-SYSTEM.JS =====
class ScoringSystem {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.totalScore = 0;
        this.possibleScore = 0;
        this.answerHistory = [];
        this.performanceByType = {
            logic: { correct: 0, total: 0 },
            emotion: { correct: 0, total: 0 },
            balanced: { correct: 0, total: 0 },
            agenda: { correct: 0, total: 0 }
        };
        this.collectedCards = new Set(); // Track discovered fallacy cards
    }
    
    evaluateAnswer(userAnswer, scenario) {
        var weights = scenario.answerWeights;
        var weightScore = weights[userAnswer] || 0;
        
        // Convert weight score to 0-3 point scale
        var points;
        var feedbackLevel;
        
        if (weightScore === 100) {
            points = 3;
            feedbackLevel = 'perfect';
        } else if (weightScore >= 80) {
            points = 2;
            feedbackLevel = 'close';
        } else if (weightScore >= 50) {
            points = 1;
            feedbackLevel = 'partial';
        } else {
            points = 0;
            feedbackLevel = 'wrong';
        }
        
        // Track performance by type
        var correctType = scenario.correctAnswer;
        this.performanceByType[correctType].total++;
        
        if (points === 3) {
            this.performanceByType[correctType].correct++;
        }
        
        this.totalScore += points;
        this.possibleScore += 3; // Max 3 points per scenario
        
        var feedback = this.getFeedbackMessage(feedbackLevel, userAnswer, scenario);
        
        this.answerHistory.push({
            scenarioId: scenario.id,
            userAnswer,
            score: weightScore,
            points: points,
            feedbackLevel
        });
        
        // Track discovered fallacy cards
        if (scenario.logicalFallacies && scenario.logicalFallacies.length > 0) {
            scenario.logicalFallacies.forEach(function(fallacy) {
                if (fallacy.severity === 'primary') {
                    this.collectedCards.add(fallacy.id);
                }
            }.bind(this));
        }
        
        return {
            score: weightScore,
            points: points,
            feedbackLevel,
            feedback,
            explanation: this.getExplanation(userAnswer, scenario)
        };
    }
    
    getFeedbackMessage(level, userAnswer, scenario) {
        const messages = {
            perfect: {
                emoji: '🎉',
                text: 'Perfect! (+3 points)',
                detail: 'You correctly identified the primary issue.'
            },
            close: {
                emoji: '😊',
                text: 'So Close! (+2 points)',
                detail: this.getCloseExplanation(userAnswer, scenario)
            },
            partial: {
                emoji: '🤔',
                text: 'Not quite (+1 point)',
                detail: 'You identified a secondary issue, but missed the main one.'
            },
            wrong: {
                emoji: '😅',
                text: 'Oh no! (0 points)',
                detail: 'This answer misses the key elements of the argument.'
            }
        };
        
        return messages[level];
    }
    
    getCloseExplanation(userAnswer, scenario) {
        var correct = scenario.correctAnswer;
        
        var explanations = {
            'emotion-agenda': 'Manipulation often uses emotional appeals, so you\'re on the right track!',
            'agenda-emotion': 'You spotted the emotional manipulation, which often indicates a hidden agenda!',
            'logic-agenda': 'Weak logic often serves a hidden purpose - good eye!',
            'agenda-logic': 'You noticed the logical flaws that support their agenda!',
            'balanced-logic': 'You recognized the logical elements, though this argument is actually well-balanced.',
            'balanced-emotion': 'You noticed the emotional elements, though they\'re appropriately balanced here.'
        };
        
        var key = userAnswer + '-' + correct;
        return explanations[key] || 'You\'re close - consider the primary characteristic of this argument.';
    }
    
    getExplanation(userAnswer, scenario) {
        // Return the full analysis for the correct answer
        return scenario.analysis[scenario.correctAnswer]?.explanation || scenario.wisdom;
    }
    
    getTotalScore() {
        return this.totalScore;
    }
    
    getAccuracy() {
        if (this.possibleScore === 0) return 0;
        return Math.round((this.totalScore / this.possibleScore) * 100);
    }
    
    getPerformanceBreakdown() {
        var breakdown = {};
        
        Object.keys(this.performanceByType).forEach(function(type) {
            var data = this.performanceByType[type];
            breakdown[type] = data.total > 0 
                ? Math.round((data.correct / data.total) * 100)
                : 50; // Default if not tested
        }.bind(this));
        
        return breakdown;
    }
    
    getCollectionStats() {
        var totalFallacies = 15; // Total number of fallacies in the system
        var collected = this.collectedCards.size;
        var collectionPercent = Math.round((collected / totalFallacies) * 100);
        
        return {
            collected: collected,
            total: totalFallacies,
            percentage: collectionPercent,
            isComplete: collected === totalFallacies
        };
    }
    
    getCollectionBonus() {
        var stats = this.getCollectionStats();
        var bonus = 0;
        var description = '';
        
        if (stats.isComplete) {
            bonus = 50; // Major bonus for complete collection
            description = '🃏 Fallacy Master Collection Bonus! +50 RIZ';
        } else if (stats.collected >= 10) {
            bonus = 25;
            description = '🎴 Serious Collector Bonus! +25 RIZ';
        } else if (stats.collected >= 5) {
            bonus = 10;
            description = '🏷️ Card Collector Bonus! +10 RIZ';
        }
        
        return { bonus: bonus, description: description };
    }
    
    getBadge() {
        var accuracy = this.getAccuracy();
        var collectionStats = this.getCollectionStats();
        var badge;
        
        // Base badge based on accuracy
        if (accuracy >= 90) {
            badge = {
                emoji: '💎',
                title: 'Phuzzy Diamond Master',
                message: 'Outstanding mastery! You have exceptional Phuzzy thinking skills!'
            };
        } else if (accuracy >= 75) {
            badge = {
                emoji: '🥇',
                title: 'Phuzzy Gold Guardian',
                message: 'Excellent work! You see through most manipulation with confidence.'
            };
        } else if (accuracy >= 50) {
            badge = {
                emoji: '🥈',
                title: 'Phuzzy Silver Scout',
                message: 'Good progress! Your Phuzzy thinking skills are developing well.'
            };
        } else if (accuracy >= 25) {
            badge = {
                emoji: '🥉',
                title: 'Phuzzy Bronze Cub',
                message: 'Nice start! Keep practicing to grow your critical thinking skills.'
            };
        } else {
            badge = {
                emoji: '🐻',
                title: 'Phuzzy Apprentice',
                message: 'Every expert was once a beginner. Keep learning, future Phuzzy master!'
            };
        }
        
        // Upgrade badge if complete collection achieved
        if (collectionStats.isComplete) {
            badge.emoji = '🎴';
            badge.title = 'Fallacy Card Master ' + badge.emoji;
            badge.message += ' Plus you collected ALL fallacy cards!';
        }
        
        return badge;
    }
}
// Export for global usage
if (typeof window !== 'undefined') {
    window.ScoringSystem = ScoringSystem;
}
