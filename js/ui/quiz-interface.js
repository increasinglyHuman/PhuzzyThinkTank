// ===== UI/QUIZ-INTERFACE.JS =====
// Dependencies loaded via global window objects

class QuizInterface {
    constructor(gameEngine, elements) {
        this.gameEngine = gameEngine;
        this.elements = elements;
        this.currentScenario = null;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        
        this.bearAnalysis = new window.BearAnalysis(elements.analysisSection);
        this.feedbackAnimator = new window.FeedbackAnimator();
        this.hintDisplay = new window.HintDisplay();
        
        this.bindEvents();
        this.setupDeveloperHotkeys();
    }
    
    bindEvents() {
        try {
            // Answer selection
            if (this.elements.answerOptions) {
                this.elements.answerOptions.forEach(function(option) {
                    if (option) {
                        option.addEventListener('click', function() { this.selectAnswer(option); }.bind(this));
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
        
        // Load next scenario
        this.gameEngine.loadNextScenario();
    }
    
    resetAnswerOptions() {
        this.elements.answerOptions.forEach(function(opt) {
            opt.classList.remove('selected');
            opt.classList.remove('correct-highlight'); // Clear any lingering highlights
            opt.style.borderWidth = ''; // Reset border width
            opt.style.borderStyle = ''; // Reset border style
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
            // Add educational highlight effect
            correctOption.classList.add('correct-highlight');
            
            // Keep it highlighted longer for learning
            setTimeout(function() {
                correctOption.classList.remove('correct-highlight');
            }, 4000); // 4 seconds for better learning retention
            
            // Also add a subtle permanent indicator
            correctOption.style.borderWidth = '4px';
            correctOption.style.borderStyle = 'solid';
        }
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