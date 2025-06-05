// ===== UI/QUIZ-INTERFACE.JS =====
// Dependencies loaded via global window objects

class QuizInterface {
    constructor(gameEngine, elements) {
        this.gameEngine = gameEngine;
        this.elements = elements;
        this.currentScenario = null;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.hasShownReviewTip = false; // Track if we've shown the tip
        
        this.bearAnalysis = new window.BearAnalysis(elements.analysisSection);
        this.feedbackAnimator = new window.FeedbackAnimator();
        this.hintDisplay = new window.HintDisplay();
        
        this.bindEvents();
        this.setupDeveloperHotkeys();
    }
    
    bindEvents() {
        try {
            // Answer selection and review mode
            if (this.elements.answerOptions) {
                this.elements.answerOptions.forEach(function(option) {
                    if (option) {
                        option.addEventListener('click', function() { 
                            if (this.hasAnswered) {
                                this.showReviewExplanation(option);
                            } else {
                                this.selectAnswer(option);
                            }
                        }.bind(this));
                    }
                }.bind(this));
            }
            
            // Submit button
            if (this.elements.submitButton) {
                this.elements.submitButton.addEventListener('click', function() { this.submitAnswer(); }.bind(this));
            }
            
            // Honey pot button
            if (this.elements.honeyPotButton) {
                this.elements.honeyPotButton.addEventListener('click', function() { this.useHoneyPot(); }.bind(this));
            }
            
            // Next button
            if (this.elements.nextButton) {
                this.elements.nextButton.addEventListener('click', function() { this.nextScenario(); }.bind(this));
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }
    
    displayScenario(scenario) {
        this.currentScenario = scenario;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.hasUsedHint = false;
        
        // Update UI
        this.elements.scenarioTitle.textContent = scenario.title;
        this.elements.scenarioText.textContent = scenario.text;
        this.elements.claimText.textContent = 'Claim: "' + scenario.claim + '"';
        
        // Update scenario counter
        var scenarioNum = this.gameEngine.scenariosCompleted.length + 1;
        var totalScenarios = this.gameEngine.config.scenariosPerRound;
        this.elements.scenarioCounter.textContent = 'Scenario ' + scenarioNum + ' of ' + totalScenarios;
        
        // Reset UI state
        this.resetAnswerOptions();
        this.elements.submitButton.disabled = true;
        this.elements.nextButton.style.display = 'none';
        this.elements.analysisSection.style.display = 'none';
        this.bearAnalysis.reset();
        
        // Update honey pot display
        this.updateHoneyPotDisplay();
        
        // Update score display
        this.updateScoreDisplay();
        
        // Initialize timeline analysis for this scenario
        if (window.timelineAnalysis) {
            window.timelineAnalysis.initializeForScenario(scenario);
        }
    }
    
    selectAnswer(optionElement) {
        if (this.hasAnswered) return;
        
        this.elements.answerOptions.forEach(function(opt) {
            opt.classList.remove('selected');
        });
        
        optionElement.classList.add('selected');
        this.selectedAnswer = optionElement.dataset.value;
        this.elements.submitButton.disabled = false;
    }
    
    async submitAnswer() {
        if (!this.selectedAnswer || this.hasAnswered) return;
        
        try {
            this.hasAnswered = true;
            this.elements.submitButton.disabled = true;
            this.elements.honeyPotButton.disabled = true;
            
            // Get evaluation from game engine
            var evaluation = this.gameEngine.submitAnswer(this.selectedAnswer);
            
            console.log('Evaluation result:', evaluation); // Debug log
            
            // Show feedback
            await this.showFeedback(evaluation);
            
            // If not perfect answer, highlight the correct one for learning
            if (evaluation.feedbackLevel !== 'perfect') {
                this.highlightCorrectAnswer();
            }
            
            // Show score increase animation with points earned
            if (evaluation.points > 0) {
                this.feedbackAnimator.showScoreIncrease(evaluation.points);
                // Update max possible score after animation completes
                setTimeout(() => {
                    this.updateMaxPossibleScore();
                }, 2500);
            } else {
                // No points earned, just update the max possible immediately
                this.updateMaxPossibleScore();
            }
            
            // Enable review mode on all buttons
            this.elements.answerOptions.forEach(function(opt) {
                opt.classList.add('review-enabled');
            });
            
            // Show review tip on first question only
            if (!this.hasShownReviewTip && this.gameEngine.scenariosCompleted.length === 0) {
                setTimeout(function() {
                    this.showReviewTip();
                }.bind(this), 2500); // After reward effects
            }
            
            // Show analysis after delay
            setTimeout(function() {
                this.showAnalysis();
            }.bind(this), 2000);
        } catch (error) {
            console.error('Error in submitAnswer:', error);
            // Reset state on error
            this.hasAnswered = false;
            this.elements.submitButton.disabled = false;
            this.elements.honeyPotButton.disabled = false;
        }
    }
    
    async showFeedback(evaluation) {
        await this.feedbackAnimator.showResult(
            evaluation.feedbackLevel, 
            evaluation.feedback
        );
    }
    
    showAnalysis() {
        if (!this.currentScenario) {
            console.error('No current scenario available for analysis');
            return;
        }
        
        this.elements.analysisSection.style.display = 'block';
        this.bearAnalysis.showDualBearAnalysis(this.currentScenario);
        
        // Show next button after animation
        setTimeout(function() {
            this.elements.nextButton.style.display = 'block';
        }.bind(this), 4000);
    }
    
    useHoneyPot() {
        // Check if already used hint for this scenario
        if (this.hasUsedHint) {
            this.hintDisplay.showError('You already used a hint for this scenario!');
            return;
        }
        
        var result = this.gameEngine.useHoneyPot();
        
        if (result.success) {
            this.hasUsedHint = true;
            this.applyHint(result.hint);
            this.updateHoneyPotDisplay();
        } else {
            this.hintDisplay.showError(result.message);
        }
    }
    
    applyHint(hint) {
        var textElement = this.elements.scenarioText;
        
        // Apply visual hint to scenario text
        textElement.style.backgroundColor = hint.color;
        textElement.style.border = '2px solid ' + hint.borderColor;
        textElement.style.padding = '20px';
        textElement.style.borderRadius = '10px';
        textElement.style.transition = 'all 0.3s ease';
        
        // Show hint message
        this.hintDisplay.show(hint.icon, hint.message);
    }
    
    updateHoneyPotDisplay() {
        var stats = this.gameEngine.honeyPotManager.getStats();
        
        // Update count
        this.elements.honeyPotCount.textContent = stats.available;
        
        // Update visual honey pots
        this.elements.honeyPotIcons.forEach(function(icon, index) {
            if (index >= stats.available) {
                icon.classList.add('used');
            } else {
                icon.classList.remove('used');
            }
        });
        
        // Update button state - disable if no honey pots, already answered, or already used hint
        this.elements.honeyPotButton.disabled = stats.available === 0 || this.hasAnswered || this.hasUsedHint;
        
        if (stats.available === 0) {
            this.elements.honeyPotButton.innerHTML = '🍯 No Honey Pots Left!';
        } else if (this.hasUsedHint) {
            this.elements.honeyPotButton.innerHTML = '🍯 Hint Already Used!';
        } else {
            this.elements.honeyPotButton.innerHTML = '🍯 Use Honey Pot for Hint (' + stats.available + ' left)';
        }
    }
    
    updateScoreDisplay() {
        var score = this.gameEngine.scoringSystem.getTotalScore();
        
        // Show just the positive score, not x/y format
        this.elements.userScore.textContent = score;
        
        // Update collection progress
        this.updateCollectionDisplay();
        
        // Update progress bar for question progress
        this.updateProgressBar();
        
        // Ensure score tracker stays visible - force it!
        this.elements.scoreTracker.classList.add('visible');
        // Also force opacity and transform in case CSS gets overridden
        this.elements.scoreTracker.style.opacity = '1';
        this.elements.scoreTracker.style.transform = 'translateY(0)';
    }
    
    updateCollectionDisplay() {
        var collectionStats = this.gameEngine.scoringSystem.getCollectionStats();
        var cardsElement = document.getElementById('cards-collected');
        if (cardsElement) {
            cardsElement.textContent = collectionStats.collected;
        }
    }
    
    updateMaxPossibleScore() {
        // Just update progress bar, not the score display
        this.updateProgressBar();
        
        // Ensure score tracker stays visible
        this.elements.scoreTracker.classList.add('visible');
        this.elements.scoreTracker.style.opacity = '1';
        this.elements.scoreTracker.style.transform = 'translateY(0)';
    }
    
    updateProgressBar() {
        var questionsCompleted = this.gameEngine.scenariosCompleted.length;
        var totalQuestions = this.gameEngine.config.scenariosPerRound;
        
        // Update progress bar if it exists
        var progressBar = document.getElementById('question-progress-bar');
        if (progressBar) {
            var progressPercent = (questionsCompleted / totalQuestions) * 100;
            progressBar.style.width = progressPercent + '%';
        }
    }
    
    nextScenario() {
        // Reset hint styling
        var textElement = this.elements.scenarioText;
        textElement.style = '';
        
        // Clear hint display
        this.hintDisplay.hideHint();
        
        // Clear any review tooltips
        this.clearReviewHighlights();
        
        // Load next scenario
        this.gameEngine.loadNextScenario();
    }
    
    resetAnswerOptions() {
        this.elements.answerOptions.forEach(function(opt) {
            opt.classList.remove('selected');
            opt.classList.remove('correct-highlight'); // Clear any lingering highlights
            opt.classList.remove('correct-persistent'); // Clear persistent highlight
            opt.classList.remove('review-enabled'); // Clear review mode
            opt.classList.remove('review-active'); // Clear review active state
            opt.style.borderWidth = ''; // Reset border width
            opt.style.borderStyle = ''; // Reset border style
            opt.style.borderColor = ''; // Reset border color
        });
    }
    
    highlightCorrectAnswer() {
        if (!this.currentScenario) return;
        
        const correctAnswer = this.currentScenario.correctAnswer;
        
        // Find the correct answer option
        const correctOption = Array.from(this.elements.answerOptions).find(function(option) {
            return option.dataset.value === correctAnswer;
        });
        
        if (correctOption) {
            // Add educational highlight effect - permanent until next scenario
            correctOption.classList.add('correct-highlight');
            correctOption.classList.add('correct-persistent');
            
            // Don't remove the highlight - it will be cleared on next scenario
            // The animation will run once, then the persistent styles remain
            
            // Also add a subtle permanent indicator
            correctOption.style.borderWidth = '4px';
            correctOption.style.borderStyle = 'solid';
            correctOption.style.borderColor = '#10b981';
        }
    }
    
    showReviewExplanation(optionElement) {
        if (!this.currentScenario || !this.hasAnswered) return;
        
        const answerType = optionElement.dataset.value;
        const scenario = this.currentScenario;
        
        // Remove any existing review highlights and tooltips
        this.clearReviewHighlights();
        
        // Highlight relevant words in scenario text based on answer type
        this.highlightScenarioText(answerType);
        
        // Show explanation tooltip
        this.showExplanationTooltip(optionElement, answerType);
    }
    
    clearReviewHighlights() {
        // Clear text highlights
        const textElement = this.elements.scenarioText;
        const originalText = this.currentScenario.text;
        textElement.innerHTML = originalText;
        
        // Remove any existing tooltips
        const existingTooltips = document.querySelectorAll('.review-tooltip');
        existingTooltips.forEach(function(tooltip) {
            tooltip.remove();
        });
        
        // Remove review active states
        this.elements.answerOptions.forEach(function(opt) {
            opt.classList.remove('review-active');
        });
    }
    
    highlightScenarioText(answerType) {
        const textElement = this.elements.scenarioText;
        let text = this.currentScenario.text;
        const scenario = this.currentScenario;
        
        // First check if scenario has v2 format with reviewKeywords
        if (scenario.reviewKeywords && scenario.reviewKeywords[answerType]) {
            const reviewData = scenario.reviewKeywords[answerType];
            const keywords = reviewData.keywords || [];
            
            // Use scenario-specific keywords with their colors
            const colorMap = {
                logic: { color: '#3b82f6', bgColor: '#dbeafe' },
                emotion: { color: '#ec4899', bgColor: '#fce7f3' },
                balanced: { color: '#10b981', bgColor: '#d1fae5' },
                agenda: { color: '#f59e0b', bgColor: '#fef3c7' }
            };
            
            const colors = colorMap[answerType];
            
            // Sort keywords by length (longer first)
            keywords.sort((a, b) => b.length - a.length);
            
            // Create regex and highlight
            if (keywords.length > 0) {
                const regex = new RegExp('(' + keywords.map(function(keyword) {
                    return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }).join('|') + ')', 'gi');
                
                const highlightedText = text.replace(regex, function(match) {
                    return '<span class="review-highlight" style="background-color: ' + colors.bgColor + 
                           '; color: ' + colors.color + '; padding: 2px 4px; border-radius: 4px; font-weight: 600;">' + 
                           match + '</span>';
                });
                
                textElement.innerHTML = highlightedText;
                return;
            }
        }
        
        // Fallback to generic patterns for older scenarios
        const hints = scenario.hints || {};
        const highlightPatterns = {
            logic: {
                keywords: [
                    // Extreme generalizations
                    'proves', 'proof', 'ALL', 'EVERY', 'NEVER', 'ONE SIMPLE', 'ALWAYS',
                    // Cherry-picked/dubious sources
                    'Facebook', 'surveyed', 'who agree', 'unnamed', 'Institute',
                    // Conspiracy language
                    "won't report", 'controlled by', "they're lying", 'wake up', 'WAKE UP',
                    'mainstream media', 'they want', 'rigged',
                    // Absolute claims
                    "hasn't changed", "can't be bad", 'natural',
                    // Questionable evidence
                    '50 scientists', 'zero evidence', 'no evidence'
                ],
                color: '#3b82f6',
                bgColor: '#dbeafe'
            },
            emotion: {
                keywords: [
                    // Urgency/fear markers
                    'URGENT', 'NOW', 'RIGHT NOW', 'LAST CHANCE', 'before too late',
                    // Fear language
                    'DANGER', 'danger', 'predators', 'EVERYWHERE', 'trafficking', 'SAVE LIVES',
                    'protect', 'fear', 'scared', 'terrified', 'panic',
                    // Shame/guilt
                    'deserve better', "don't let them down", 'wage slave', 'invisible', 'HATE my',
                    // Drama/caps
                    'BELIEVE', 'SHOCKED', 'MUST', '!!!', '🚨', '😱', '😤', '😔',
                    // Life/death
                    'dead', 'dying', 'kill', 'lives at stake'
                ],
                color: '#ec4899',
                bgColor: '#fce7f3'
            },
            balanced: {
                keywords: [
                    // Qualifying language
                    'however', 'although', 'while', 'but', 'yet', 'despite',
                    // Data/research
                    'study shows', 'research', 'analysis', 'participants', 'results varied',
                    'mixed results', 'some saw', 'others found',
                    // Multiple perspectives
                    'both', 'pros and cons', 'on one hand', 'on the other',
                    'FDA maintains', 'European', 'different views',
                    // Collaborative
                    'work together', 'discuss', 'happy to', 'recommend', 'consider',
                    'based on your', 'informed choices', 'might consider'
                ],
                color: '#10b981',
                bgColor: '#d1fae5'
            },
            agenda: {
                keywords: [
                    // Price/sales
                    '$', 'price', 'discount', 'sale', 'offer', 'special', 'exclusive',
                    'only $', 'just $', 'save', 'deal',
                    // Urgency tactics
                    'swipe up', 'DM me', 'click here', 'limited time', 'act now',
                    'next 10', 'spots left',
                    // Anti-professional
                    'Doctors HATE', "don't want you to know", 'secret', 'ANCIENT SECRET',
                    // Lifestyle promises
                    'financial freedom', 'BEST LIFE', 'beach in Bali', 'quit your job',
                    // Hidden connections
                    'my brother', 'my mentor', 'neighbor discount', 'friend sells'
                ],
                color: '#f59e0b',
                bgColor: '#fef3c7'
            }
        };
        
        // Get pattern for this answer type
        const pattern = highlightPatterns[answerType];
        if (!pattern) return;
        
        // Prioritize scenario-specific keywords if they match the answer type
        let keywords = pattern.keywords;
        if (hints.keywords && hints.strategy === answerType) {
            // Put scenario-specific keywords first for better matching
            keywords = [...hints.keywords, ...pattern.keywords];
        }
        
        // Create regex pattern for all keywords (longer phrases first to avoid partial matches)
        keywords.sort((a, b) => b.length - a.length);
        const regex = new RegExp('(' + keywords.map(function(keyword) {
            return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|') + ')', 'gi');
        
        // Replace matches with highlighted spans
        const highlightedText = text.replace(regex, function(match) {
            return '<span class="review-highlight" style="background-color: ' + pattern.bgColor + 
                   '; color: ' + pattern.color + '; padding: 2px 4px; border-radius: 4px; font-weight: 600;">' + 
                   match + '</span>';
        });
        
        textElement.innerHTML = highlightedText;
    }
    
    showExplanationTooltip(optionElement, answerType) {
        // Mark option as active
        optionElement.classList.add('review-active');
        
        // Get evaluation info
        const correctAnswer = this.currentScenario.correctAnswer;
        const isCorrect = answerType === correctAnswer;
        const answerWeight = this.currentScenario.answerWeights[answerType] || 0;
        
        // Create tooltip content based on answer quality
        let feedbackText = '';
        let feedbackClass = '';
        
        if (isCorrect) {
            feedbackText = '✅ Perfect! This was the best answer.';
            feedbackClass = 'perfect';
        } else if (answerWeight >= 70) {
            feedbackText = '👍 Good thinking! This was almost right.';
            feedbackClass = 'good';
        } else if (answerWeight >= 40) {
            feedbackText = '🤔 Partially correct, but not the main issue.';
            feedbackClass = 'partial';
        } else {
            feedbackText = '❌ Not quite - this misses the key issue.';
            feedbackClass = 'incorrect';
        }
        
        // Use scenario-specific explanation if available, otherwise use generic
        let explanation = '';
        if (this.currentScenario.reviewKeywords && 
            this.currentScenario.reviewKeywords[answerType] && 
            this.currentScenario.reviewKeywords[answerType].explanation) {
            explanation = this.currentScenario.reviewKeywords[answerType].explanation;
        } else {
            // Generic explanations
            const explanations = {
                logic: 'Look for evidence quality, data, and logical consistency.',
                emotion: 'Notice emotional triggers, urgency, and fear appeals.',
                balanced: 'See how it presents multiple perspectives fairly.',
                agenda: 'Spot the hidden motive or sales pitch.'
            };
            explanation = explanations[answerType];
        }
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'review-tooltip ' + feedbackClass;
        tooltip.innerHTML = '<div class="tooltip-content">' +
            '<div class="tooltip-feedback">' + feedbackText + '</div>' +
            '<div class="tooltip-explanation">' + explanation + '</div>' +
            '<div class="tooltip-score">Score value: ' + answerWeight + '%</div>' +
        '</div>';
        
        // Position tooltip
        document.body.appendChild(tooltip);
        const rect = optionElement.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        tooltip.style.zIndex = '10000';
        
        // Add close functionality
        setTimeout(function() {
            tooltip.addEventListener('click', function() {
                tooltip.remove();
                optionElement.classList.remove('review-active');
            });
        }, 100);
        
        // Auto-fade after 5.5 seconds
        setTimeout(function() {
            if (tooltip && tooltip.parentNode) {
                tooltip.style.transition = 'opacity 0.5s ease-out';
                tooltip.style.opacity = '0';
                
                // Remove after fade completes
                setTimeout(function() {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.remove();
                        optionElement.classList.remove('review-active');
                    }
                }, 500);
            }
        }, 5500);
    }
    
    showReviewTip() {
        this.hasShownReviewTip = true;
        
        // Create tip element
        const tip = document.createElement('div');
        tip.className = 'review-mode-tip';
        tip.innerHTML = '<div class="tip-content">' +
            '<div class="tip-icon">💡</div>' +
            '<div class="tip-text">Curious about why?<br>Click any button to learn more!</div>' +
            '<button class="tip-close">Got it!</button>' +
        '</div>';
        
        document.body.appendChild(tip);
        
        // Position it near the quiz options
        const quizSection = document.querySelector('.interactive-section');
        const rect = quizSection.getBoundingClientRect();
        tip.style.position = 'fixed';
        tip.style.left = '50%';
        tip.style.top = (rect.top + rect.height / 2) + 'px';
        tip.style.transform = 'translate(-50%, -50%)';
        tip.style.zIndex = '10001';
        
        // Add close functionality
        const closeBtn = tip.querySelector('.tip-close');
        closeBtn.addEventListener('click', function() {
            tip.classList.add('fade-out');
            setTimeout(function() {
                tip.remove();
            }, 300);
        });
        
        // Auto-close after 8 seconds
        setTimeout(function() {
            if (tip.parentNode) {
                tip.classList.add('fade-out');
                setTimeout(function() {
                    tip.remove();
                }, 300);
            }
        }, 8000);
    }
    
    displayEndGame(stats) {
        // Hide game content
        this.elements.gameContent.style.display = 'none';
        
        // Hide score tracker for cleaner celebration screenshots
        this.elements.scoreTracker.style.display = 'none';
        
        // Show end game screen
        this.elements.endGame.classList.add('visible');
        
        // Update final stats - show score vs max possible points
        var maxPossiblePoints = stats.scenariosCompleted * 3; // 3 points per scenario
        var collectionStats = this.gameEngine.scoringSystem.getCollectionStats();
        var collectionBonus = this.gameEngine.scoringSystem.getCollectionBonus();
        
        // Apply collection bonus to final score
        var finalScore = stats.totalScore + collectionBonus.bonus;
        
        this.elements.finalScore.textContent = finalScore + '/' + maxPossiblePoints;
        this.elements.accuracyPercent.textContent = stats.accuracy + '%';
        this.elements.honeyUsed.textContent = stats.honeyPotsUsed + '/' + this.gameEngine.config.honeyPotsPerRound;
        
        // Update collection stats
        var cardsCollectedFinal = document.getElementById('cards-collected-final');
        if (cardsCollectedFinal) {
            cardsCollectedFinal.textContent = collectionStats.collected + '/' + collectionStats.total;
        }
        
        // Show collection bonus if earned
        if (collectionBonus.bonus > 0) {
            var collectionBonusElement = document.getElementById('collection-bonus');
            var collectionBonusText = document.getElementById('collection-bonus-text');
            if (collectionBonusElement && collectionBonusText) {
                collectionBonusText.textContent = collectionBonus.description;
                collectionBonusElement.style.display = 'block';
            }
        }
        
        // Display badge
        var badge = stats.badge;
        if (badge && this.elements.finalBadge && this.elements.badgeTitle && this.elements.badgeMessage) {
            this.elements.finalBadge.textContent = badge.emoji || '🏆';
            this.elements.badgeTitle.textContent = badge.title || 'Well Done!';
            this.elements.badgeMessage.textContent = badge.message || 'Thanks for playing!';
        }
        
        // Update performance meters
        this.updatePerformanceMeters(stats.performance);
        
        // Create confetti
        this.createConfetti();
    }
    
    updatePerformanceMeters(performance) {
        // Animate performance meters
        setTimeout(function() {
            this.elements.logicPerformance.style.width = performance.logic + '%';
            this.elements.emotionPerformance.style.width = performance.emotion + '%';
            this.elements.balancePerformance.style.width = performance.balanced + '%';
            this.elements.agendaPerformance.style.width = performance.agenda + '%';
        }.bind(this), 1000);
    }
    
    createConfetti() {
        // SPECTACULAR 3-BURST CELEBRATION!
        console.log('🎉 Starting epic 3-burst celebration!');
        
        // Burst 1: Small focused burst from center
        setTimeout(() => {
            this.createConfettiBurst(1, 'center', 60, 12, 18);
        }, 500);
        
        // Burst 2: Medium burst from left and right
        setTimeout(() => {
            this.createConfettiBurst(2, 'sides', 120, 16, 24);
        }, 1200);
        
        // Burst 3: MASSIVE finale burst from everywhere
        setTimeout(() => {
            this.createConfettiBurst(3, 'everywhere', 200, 20, 30);
        }, 2000);
        
        // Add floating emoji celebrations throughout
        setTimeout(() => {
            this.createFloatingCelebration();
        }, 800);
    }
    
    createConfettiBurst(burstNumber, pattern, particleCount, minSize, maxSize) {
        var colors = ['#667eea', '#764ba2', '#ed64a6', '#f6e05e', '#4299e1', '#f6ad55', '#10b981', '#f56565', '#8b5cf6'];
        var shapes = ['circle', 'square', 'triangle', 'star'];
        var endGame = this.elements.endGame;
        
        console.log(`💥 Burst ${burstNumber}: ${particleCount} particles, pattern: ${pattern}`);
        
        for (var i = 0; i < particleCount; i++) {
            setTimeout(() => {
                var confetti = document.createElement('div');
                var shape = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.className = 'confetti confetti-' + shape + ' burst-' + burstNumber;
                
                // Position based on pattern
                var startX, startY;
                switch (pattern) {
                    case 'center':
                        startX = 45 + Math.random() * 10; // 45-55%
                        startY = 40 + Math.random() * 20; // 40-60%
                        break;
                    case 'sides':
                        startX = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20; // 0-20% or 80-100%
                        startY = 30 + Math.random() * 40; // 30-70%
                        break;
                    case 'everywhere':
                        startX = Math.random() * 100;
                        startY = Math.random() * 80; // Don't start too low
                        break;
                }
                
                confetti.style.left = startX + '%';
                confetti.style.top = startY + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Size increases with burst number
                var size = minSize + Math.random() * (maxSize - minSize);
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                
                // Animation timing based on burst intensity
                var duration = 3 + Math.random() * 2; // 3-5 seconds
                var delay = Math.random() * 0.5; // 0-0.5s delay
                
                confetti.style.animationDelay = delay + 's';
                confetti.style.animationDuration = duration + 's';
                
                // Add random movement variables for burst animations
                var randomX = (Math.random() - 0.5) * 300 * burstNumber; // -150 to 150, scaled by burst
                var randomY = (Math.random() - 0.5) * 200 * burstNumber; // -100 to 100, scaled by burst
                confetti.style.setProperty('--random-x', randomX + 'px');
                confetti.style.setProperty('--random-y', randomY + 'px');
                confetti.style.setProperty('--burst-intensity', burstNumber);
                
                endGame.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, (duration + delay + 1) * 1000);
            }, i * (50 / burstNumber)); // Faster spawning for later bursts
        }
    }
    
    createFloatingCelebration() {
        var celebrationEmojis = ['🎉', '🎊', '🥳', '✨', '🌟', '💫', '🎈', '🏆'];
        var endGame = this.elements.endGame;
        
        for (var i = 0; i < 15; i++) {
            setTimeout(() => {
                var emoji = document.createElement('div');
                emoji.className = 'celebration-emoji';
                emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
                emoji.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 80 + 10}%;
                    top: ${Math.random() * 80 + 10}%;
                    font-size: ${2 + Math.random() * 2}em;
                    z-index: 1000;
                    pointer-events: none;
                    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
                    animation: celebrationFloat ${3 + Math.random() * 2}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                
                endGame.appendChild(emoji);
                
                setTimeout(() => emoji.remove(), 8000);
            }, i * 200);
        }
    }
    
    setupDeveloperHotkeys() {
        var self = this;
        var keySequence = [];
        
        document.addEventListener('keydown', function(event) {
            // Only capture keys when not typing in input fields
            var activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
                return; // Ignore keystrokes in input fields
            }
            
            // Track last few keys
            keySequence.push(event.key.toLowerCase());
            
            // Keep only last 5 keys
            if (keySequence.length > 5) {
                keySequence.shift();
            }
            
            // Debug: Show current key sequence (remove this later)
            console.log('Key sequence:', keySequence.join(''));
            
            // Simple sequence: type "party" 
            if (keySequence.join('') === 'party') {
                console.log('🎉 Developer hotkey activated! Time to party with confetti!');
                self.triggerTestEndGame();
                keySequence = []; // Reset
            }
            
            // Skip scenario hotkey: type "skip"
            if (keySequence.join('') === 'skip') {
                console.log('⏭️ Developer skip activated! Jumping to next scenario...');
                self.triggerSkipScenario();
                keySequence = []; // Reset
            }
        });
    }
    
    triggerSkipScenario() {
        console.log('💨 Skipping current scenario for testing...');
        
        // Only work if game is in progress (not answered yet)
        if (this.hasAnswered) {
            console.log('⚠️ Cannot skip - scenario already answered. Use next button or start new game.');
            return;
        }
        
        // Simulate a quick answer to move forward
        this.hasAnswered = true;
        this.selectedAnswer = 'logic'; // Default test answer
        
        // Skip straight to next scenario without showing analysis
        setTimeout(() => {
            this.gameEngine.loadNextScenario();
        }, 500);
    }
    
    triggerTestEndGame() {
        // Create fake stats for testing
        var testStats = {
            totalScore: 18,
            accuracy: 75,
            scenariosCompleted: 8,
            honeyPotsUsed: 2,
            performance: {
                logic: 80,
                emotion: 70,
                balanced: 85,
                agenda: 65
            },
            badge: {
                emoji: '🥇',
                title: 'Test Champion',
                message: 'You found the secret hotkey!'
            }
        };
        
        this.displayEndGame(testStats);
    }
}

// Export for global usage
if (typeof window !== 'undefined') {
    window.QuizInterface = QuizInterface;
}