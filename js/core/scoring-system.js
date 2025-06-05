
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
        
        // Rank all answers by their weights
        var answerRanking = Object.entries(weights)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Find user's answer rank position
        var userRank = answerRanking.indexOf(userAnswer);
        
        // Convert rank to points (1st=3, 2nd=2, 3rd=1, 4th=0)
        var points;
        var feedbackLevel;
        
        switch(userRank) {
            case 0: // Best answer
                points = 3;
                feedbackLevel = 'perfect';
                break;
            case 1: // Second best
                points = 2;
                feedbackLevel = 'close';
                break;
            case 2: // Third best
                points = 1;
                feedbackLevel = 'partial';
                break;
            default: // Worst answer
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
    
    // Add bonus points with animation
    addBonus(points, source) {
        this.totalScore += points;
        
        // Update score display
        const scoreElement = document.getElementById('user-score');
        if (scoreElement) {
            scoreElement.textContent = this.totalScore;
            scoreElement.classList.add('score-pulse');
            setTimeout(() => scoreElement.classList.remove('score-pulse'), 600);
        }
        
        // Create coin animation
        this.animateBonusCoins(points, source);
    }
    
    // Animate coins to the correct scoreboard position
    animateBonusCoins(points, source) {
        // Find the target - check if timeline accordion is open
        const timelineAccordion = document.getElementById('timeline-analysis-accordion');
        const isTimelineOpen = timelineAccordion && timelineAccordion.style.display !== 'none';
        
        let targetElement;
        let targetRect;
        
        if (isTimelineOpen) {
            // Target the star in the timeline
            targetElement = document.getElementById('star-timeline');
            if (!targetElement) {
                // Fallback to main score tracker
                targetElement = document.getElementById('score-tracker');
            }
        } else {
            // Target the star in the scenario box or the score tracker
            targetElement = document.getElementById('star-scenario');
            if (!targetElement) {
                targetElement = document.getElementById('score-tracker');
            }
        }
        
        if (!targetElement) return;
        
        targetRect = targetElement.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;
        
        // Create coin emojis
        const numCoins = Math.min(points, 5);
        for (let i = 0; i < numCoins; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.textContent = '💫';
                coin.style.cssText = `
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 48px;
                    z-index: 10000;
                    pointer-events: none;
                    transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                `;
                document.body.appendChild(coin);
                
                // Force reflow
                coin.offsetHeight;
                
                // Animate to target
                coin.style.left = targetX + 'px';
                coin.style.top = targetY + 'px';
                coin.style.transform = 'translate(-50%, -50%) scale(0.5)';
                coin.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => coin.remove(), 1000);
            }, i * 100);
        }
    }
}
// Export for global usage
if (typeof window !== 'undefined') {
    window.ScoringSystem = ScoringSystem;
}
