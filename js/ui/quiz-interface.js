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
    
    // Centralized text formatting function
    formatScenarioText(text) {
        let formattedText = text;
        
        // Apply content filter for 13+ rating
        const profanityMap = {
            'shit': '$#!@', 'piss': '@!$$', 'fuck': '!@#$', 'cunt': '#@$!',
            'cocksucker': '#@#$$@#$%!', 'motherfucker': '@#$%&!@#$%!', 'tits': '@!#$',
            'bullshit': '%@!!$#!@', 'fucking': '!@#$!&%', 'fucked': '!@#$%&',
            'shitty': '$#!@@*', 'pissed': '@!$$%&', 'asshole': '@$$#@!%',
            'bitch': '%!@#$', 'damn': '&@#$', 'hell': '#%!!', 'ass': '@$$'
        };
        
        // Replace profanity with symbols (case-insensitive)
        Object.keys(profanityMap).forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            formattedText = formattedText.replace(regex, profanityMap[word]);
        });
        
        // Replace AITA with family-friendly version
        formattedText = formattedText.replace(/\bAITA\b/g, 'Am I Wrong');
        
        // First, convert actual newlines to HTML breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Convert lists with dashes/bullets to proper formatting with indentation
        // Also handle lists that might come after <br> tags
        // Remove the <br> before list items and add tight line spacing
        formattedText = formattedText.replace(/(<br>)?^- ([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $2</span>');
        formattedText = formattedText.replace(/<br>- ([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $1</span>');
        
        // Recognize numbered lists and indent them too
        formattedText = formattedText.replace(/(<br>)?^(\d+)\.\s+([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">$2. $3</span>');
        formattedText = formattedText.replace(/<br>(\d+)\.\s+([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">$1. $2</span>');
        
        // Recognize lists that use asterisks
        formattedText = formattedText.replace(/(<br>)?^\* ([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $2</span>');
        formattedText = formattedText.replace(/<br>\* ([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $1</span>');
        
        // Convert double line breaks to paragraphs with controlled spacing
        formattedText = formattedText.replace(/(<br>)(<br>)+/g, '</p><p style="margin-top: 0.8em;">');
        formattedText = '<p style="margin: 0;">' + formattedText + '</p>';
        
        return formattedText;
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
            
            // Audio volume toggle
            var audioToggle = document.getElementById('audio-toggle');
            if (audioToggle) {
                audioToggle.addEventListener('click', function() { this.toggleAudio(); }.bind(this));
            }
            
            // Smart audio button
            var smartAudioButton = document.getElementById('smart-audio-button');
            if (smartAudioButton) {
                smartAudioButton.addEventListener('click', function() { this.handleSmartAudioClick(); }.bind(this));
            }
            
            // Audio replay button
            var audioReplay = document.getElementById('audio-replay');
            if (audioReplay) {
                audioReplay.addEventListener('click', function() { this.replayAudio(); }.bind(this));
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }
    
    displayScenario(scenario) {
        this.currentScenario = scenario;
        this.currentScenarioForReplay = scenario; // Store for audio replay
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.hasUsedHint = false;
        
        // Clear any stored original text from previous scenarios
        if (this.elements.scenarioText.hasAttribute('data-original-text')) {
            this.elements.scenarioText.removeAttribute('data-original-text');
        }
        
        // Update UI
        this.elements.scenarioTitle.textContent = scenario.title;
        
        // Format scenario text using centralized formatter
        const formattedText = this.formatScenarioText(scenario.text);
        
        // Use innerHTML to preserve formatting
        this.elements.scenarioText.innerHTML = formattedText;
        
        // Apply tighter line spacing
        this.elements.scenarioText.style.lineHeight = '1.4';
        this.elements.scenarioText.style.marginBottom = '1em';
        
        this.elements.claimText.textContent = 'Claim: "' + scenario.claim + '"';
        
        // Update scenario counter
        var scenarioNum = this.gameEngine.scenariosCompleted.length + 1;
        var totalScenarios = this.gameEngine.config.scenariosPerRound;
        this.elements.scenarioCounter.textContent = 'Scenario ' + scenarioNum + ' of ' + totalScenarios;
        
        // Play scenario audio if enabled (with small delay to allow audio system warmup)
        setTimeout(() => {
            console.log('Checking audio conditions:', {
                hasGameEngine: !!this.gameEngine,
                audioEnabled: this.gameEngine ? this.gameEngine.audioEnabled : false,
                hasVoicePlayer: this.gameEngine ? !!this.gameEngine.voicePlayer : false,
                scenarioId: scenario.id,
                packId: scenario.packId
            });
            
            this.attemptAudioPlayback(scenario);
        }, 100); // Small delay to ensure audio system is ready
    }
    
    async attemptAudioPlayback(scenario) {
        // Check if user has clicked "Play Now" button yet
        if (!window.userHasClickedPlayNow) {
            console.log('⏳ Waiting for user to click "Play Now" before attempting audio');
            return;
        }
        
        if (this.gameEngine && this.gameEngine.audioEnabled && this.gameEngine.voicePlayer) {
            // Check if audio system is actually ready
            const audioEngine = this.gameEngine.audioEngine;
            if (audioEngine && audioEngine.audioContext) {
                if (audioEngine.audioContext.state !== 'running') {
                    console.log('⏳ Audio context not running yet, waiting...');
                    try {
                        await audioEngine.audioContext.resume();
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (err) {
                        console.log('Failed to resume audio context:', err);
                    }
                }
            }
            console.log('🎬 Starting audio sequence for:', scenario.title);
            
            // Use the new enhanced sequence player if available
            if (this.gameEngine.playScenarioAudio) {
                this.gameEngine.playScenarioAudio(scenario.title, scenario.packId)
                    .then((sequenceId) => {
                        if (sequenceId) {
                            console.log('✅ Enhanced audio sequence started:', sequenceId);
                        } else {
                            console.log('⚠️ Enhanced audio returned false, trying legacy method');
                            this.playAudioSequence(scenario);
                        }
                    })
                    .catch((error) => {
                        console.log('⚠️ Enhanced audio failed, falling back to legacy:', error);
                        this.playAudioSequence(scenario);
                    });
            } else {
                // Fallback to legacy sequence
                console.log('🔄 Using legacy audio sequence');
                this.playAudioSequence(scenario);
            }
        } else {
            console.log('Audio not playing - conditions not met:', {
                hasGameEngine: !!this.gameEngine,
                audioEnabled: this.gameEngine ? this.gameEngine.audioEnabled : false,
                hasVoicePlayer: this.gameEngine ? !!this.gameEngine.voicePlayer : false
            });
        }
        
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
            
            // console.log('Evaluation result:', evaluation); // Debug log
            
            // Show feedback
            await this.showFeedback(evaluation);
            
            // If not perfect answer, highlight the correct one for learning
            if (evaluation.feedbackLevel !== 'perfect') {
                this.highlightCorrectAnswer();
            }
            
            // Play UI sound based on evaluation
            if (this.gameEngine.playUISound) {
                const soundType = evaluation.feedbackLevel === 'perfect' ? 'correct' : 'incorrect';
                this.gameEngine.playUISound(soundType);
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
                
                // Update radar chart state (regardless of accordion state)
                if (window.timelineAnalysis) {
                    window.timelineAnalysis.updateRadarAfterAnswer();
                }
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
        
        // Re-apply formatting when clearing highlights
        const formattedText = this.formatScenarioText(originalText);
        textElement.innerHTML = formattedText;
        
        // Ensure line spacing is maintained
        textElement.style.lineHeight = '1.4';
        
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
        
        // First apply formatting to the text
        let formattedText = this.formatScenarioText(text);
        
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
                const regex = new RegExp('(?![^<]*>)(' + keywords.map(function(keyword) {
                    return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }).join('|') + ')', 'gi');
                
                const highlightedText = formattedText.replace(regex, function(match) {
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
        const highlightedText = formattedText.replace(regex, function(match) {
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
        
        // Position tooltip relative to the button
        document.body.appendChild(tooltip);
        const rect = optionElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        tooltip.style.position = 'absolute';
        tooltip.style.left = (rect.left + scrollLeft) + 'px';
        tooltip.style.top = (rect.bottom + scrollTop + 10) + 'px';
        tooltip.style.zIndex = '10000';
        
        // Ensure tooltip stays within viewport
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Adjust if tooltip goes off right edge
            if (tooltipRect.right > window.innerWidth - 10) {
                tooltip.style.left = (window.innerWidth - tooltipRect.width - 10 + scrollLeft) + 'px';
            }
            
            // Adjust if tooltip goes off bottom
            if (tooltipRect.bottom > window.innerHeight - 10) {
                // Position above the button instead
                tooltip.style.top = (rect.top + scrollTop - tooltipRect.height - 10) + 'px';
            }
        }, 10);
        
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
        // More gentle celebration
        // console.log('🎉 Starting celebration!');
        
        // Single burst from center with fewer particles
        setTimeout(() => {
            this.createConfettiBurst(1, 'center', 40, 10, 16);
        }, 500);
        
        // Add some floating emojis
        setTimeout(() => {
            this.createFloatingCelebration();
        }, 800);
    }
    
    createConfettiBurst(burstNumber, pattern, particleCount, minSize, maxSize) {
        var colors = ['#667eea', '#764ba2', '#ed64a6', '#f6e05e', '#4299e1', '#f6ad55', '#10b981', '#f56565', '#8b5cf6'];
        var shapes = ['circle', 'square', 'triangle', 'star'];
        var endGame = this.elements.endGame;
        
        // console.log(`💥 Burst ${burstNumber}: ${particleCount} particles, pattern: ${pattern}`);
        
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
                
                // Add random movement variables for burst animations - reduce movement
                var randomX = (Math.random() - 0.5) * 150; // -75 to 75px
                var randomY = (Math.random() - 0.5) * 100; // -50 to 50px
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
        
        // Reduce number of emojis for less chaos
        for (var i = 0; i < 8; i++) {
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
            // console.log('Key sequence:', keySequence.join(''));
            
            // Simple sequence: type "party" 
            if (keySequence.join('') === 'party') {
                // console.log('🎉 Developer hotkey activated! Time to party with confetti!');
                self.triggerTestEndGame();
                keySequence = []; // Reset
            }
            
            // Skip scenario hotkey: type "skip"
            if (keySequence.join('') === 'skip') {
                // console.log('⏭️ Developer skip activated! Jumping to next scenario...');
                self.triggerSkipScenario();
                keySequence = []; // Reset
            }
        });
    }
    
    triggerSkipScenario() {
        // console.log('💨 Skipping current scenario for testing...');
        
        // Only work if game is in progress (not answered yet)
        if (this.hasAnswered) {
            // console.log('⚠️ Cannot skip - scenario already answered. Use next button or start new game.');
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
    
    async playAudioSequence(scenario) {
        try {
            console.log('Playing title audio for:', scenario.title);
            await this.waitForAudioComplete(scenario.id, 'title', scenario.packId || 0, scenario.title);
            
            console.log('Title finished, playing content');
            await this.waitForAudioComplete(scenario.id, 'description', scenario.packId || 0, scenario.title);
            
            console.log('Content finished, playing claim');
            await this.waitForAudioComplete(scenario.id, 'claim', scenario.packId || 0, scenario.title);
            
            console.log('Audio sequence complete');
        } catch (error) {
            console.log('Audio sequence failed:', error);
        }
    }
    
    waitForAudioComplete(scenarioId, contentType, packId, scenarioTitle) {
        return new Promise((resolve, reject) => {
            this.gameEngine.voicePlayer.play(scenarioId, contentType, null, packId, scenarioTitle)
                .then(() => {
                    // Wait for the audio to actually finish playing
                    const audio = this.gameEngine.voicePlayer.currentAudio;
                    if (audio) {
                        audio.addEventListener('ended', resolve, { once: true });
                        audio.addEventListener('error', reject, { once: true });
                    } else {
                        resolve();
                    }
                })
                .catch(reject);
        });
    }

    toggleAudio() {
        if (this.gameEngine) {
            this.gameEngine.audioEnabled = !this.gameEngine.audioEnabled;
            
            var audioToggle = document.getElementById('audio-toggle');
            if (audioToggle) {
                if (this.gameEngine.audioEnabled) {
                    audioToggle.textContent = '🔊';
                    audioToggle.classList.remove('muted');
                    audioToggle.title = 'Turn off audio';
                } else {
                    audioToggle.textContent = '🔇';
                    audioToggle.classList.add('muted');
                    audioToggle.title = 'Turn on audio';
                    // Stop any currently playing audio
                    if (this.gameEngine.voicePlayer) {
                        this.gameEngine.voicePlayer.stop();
                    }
                }
            }
        }
    }
    
    replayAudio() {
        if (this.gameEngine && this.gameEngine.audioEnabled && this.gameEngine.voicePlayer && this.currentScenarioForReplay) {
            console.log('Replaying audio for scenario:', this.currentScenarioForReplay.title);
            
            // PRESERVE CURRENT UI STATE - store selected answer
            const currentSelectedAnswer = this.selectedAnswer;
            const selectedElement = document.querySelector('.quiz-option.selected');
            
            // Stop any current audio
            this.gameEngine.voicePlayer.stop();
            
            // Reset progress indicators
            this.resetProgressLabels();
            this.deactivateWaveform();
            
            // Small delay to ensure audio system is fully cleared
            setTimeout(() => {
                // Play the audio sequence again
                this.playAudioSequence(this.currentScenarioForReplay);
                
                // RESTORE SELECTED STATE after audio starts
                if (currentSelectedAnswer && selectedElement) {
                    this.selectedAnswer = currentSelectedAnswer;
                    selectedElement.classList.add('selected');
                    console.log('✅ Restored selected answer:', currentSelectedAnswer);
                }
                
                // Update button to show playing state
                this.updateSmartAudioButton();
            }, 100);
            
        } else if (!this.gameEngine.audioEnabled) {
            console.log('Cannot replay: audio is disabled');
        } else if (!this.currentScenarioForReplay) {
            console.log('Cannot replay: no scenario loaded');
        }
    }
    
    /**
     * Smart Audio Button - Multistate play/pause/replay functionality
     */
    handleSmartAudioClick() {
        const button = document.getElementById('smart-audio-button');
        const currentState = this.getAudioState();
        
        console.log('🎵 Smart audio button clicked, current state:', currentState);
        
        switch (currentState) {
            case 'ready':
            case 'stopped':
                this.playScenarioAudio();
                break;
            case 'playing':
                this.pauseScenarioAudio();
                break;
            case 'paused':
                this.resumeScenarioAudio();
                break;
            case 'disabled':
                console.log('Audio disabled - ignoring click');
                break;
        }
    }
    
    getAudioState() {
        if (!this.gameEngine || !this.gameEngine.audioEnabled) return 'disabled';
        if (!this.gameEngine.voicePlayer) return 'disabled';
        
        // Check if audio is currently playing
        if (this.gameEngine.voicePlayer.isPlaying && this.gameEngine.voicePlayer.isPlaying()) {
            return 'playing';
        }
        
        // Check if we have a scenario loaded
        if (this.currentScenarioForReplay) {
            return 'ready';
        }
        
        return 'stopped';
    }
    
    updateSmartAudioButton() {
        const button = document.getElementById('smart-audio-button');
        const icon = button?.querySelector('.audio-icon');
        const text = button?.querySelector('.audio-text');
        const progressBar = document.getElementById('audio-progress-fill');
        const statusDot = document.getElementById('audio-status-dot');
        const statusText = document.getElementById('audio-status-text');
        
        if (!button || !icon || !text) return;
        
        const state = this.getAudioState();
        
        // Remove all state classes
        button.classList.remove('playing', 'paused', 'disabled');
        statusDot?.classList.remove('playing', 'paused', 'disabled');
        
        switch (state) {
            case 'ready':
            case 'stopped':
                icon.textContent = '▶️';
                text.textContent = 'Play Audio';
                button.title = 'Play scenario audio';
                if (progressBar) progressBar.style.width = '0%';
                if (statusText) statusText.textContent = 'Ready';
                this.deactivateWaveform();
                this.resetProgressLabels();
                break;
                
            case 'playing':
                icon.textContent = '⏸️';
                text.textContent = 'Pause';
                button.title = 'Pause audio playback';
                button.classList.add('playing');
                statusDot?.classList.add('playing');
                if (statusText) statusText.textContent = 'Playing';
                this.activateWaveform();
                break;
                
            case 'paused':
                icon.textContent = '▶️';
                text.textContent = 'Resume';
                button.title = 'Resume audio';
                button.classList.add('paused');
                statusDot?.classList.add('paused');
                if (statusText) statusText.textContent = 'Paused';
                this.deactivateWaveform();
                break;
                
            case 'disabled':
                icon.textContent = '🔇';
                text.textContent = 'Audio Off';
                button.title = 'Audio is disabled';
                button.classList.add('disabled');
                statusDot?.classList.add('disabled');
                if (progressBar) progressBar.style.width = '0%';
                if (statusText) statusText.textContent = 'Disabled';
                this.deactivateWaveform();
                this.resetProgressLabels();
                break;
        }
    }
    
    playScenarioAudio() {
        if (!this.currentScenarioForReplay) return;
        
        console.log('🎵 Smart button: Playing scenario audio');
        this.updateSmartAudioButton();
        
        // Use the existing replay logic but update button state
        this.replayAudio();
    }
    
    pauseScenarioAudio() {
        console.log('⏸️ Smart button: Pausing audio');
        if (this.gameEngine && this.gameEngine.voicePlayer) {
            this.gameEngine.voicePlayer.stop();
        }
        this.deactivateWaveform();
        this.updateSmartAudioButton();
    }
    
    resumeScenarioAudio() {
        console.log('▶️ Smart button: Resuming audio');
        // For now, restart the audio (we could implement true pause/resume later)
        this.playScenarioAudio();
    }
    
    /**
     * Activate waveform visualization during audio playback
     */
    activateWaveform() {
        const waveform = document.getElementById('audio-waveform');
        if (waveform) {
            waveform.classList.add('active');
        }
    }
    
    /**
     * Deactivate waveform visualization when audio stops
     */
    deactivateWaveform() {
        const waveform = document.getElementById('audio-waveform');
        if (waveform) {
            waveform.classList.remove('active');
        }
    }
    
    /**
     * Reset all progress labels to default state
     */
    resetProgressLabels() {
        const labels = ['progress-title', 'progress-content', 'progress-claim'];
        labels.forEach(id => {
            const label = document.getElementById(id);
            if (label) {
                label.classList.remove('active', 'completed');
            }
        });
    }
    
    /**
     * Set a specific progress label as active
     */
    setProgressLabelActive(section) {
        // Reset all first
        this.resetProgressLabels();
        
        const sectionMap = {
            'title': 'progress-title',
            'content': 'progress-content', 
            'claim': 'progress-claim'
        };
        
        const labelId = sectionMap[section];
        if (labelId) {
            const label = document.getElementById(labelId);
            if (label) {
                label.classList.add('active');
                console.log(`🎯 Audio progress: Now playing ${section}`);
            }
        }
    }
    
    /**
     * Mark a section as completed
     */
    setProgressLabelCompleted(section) {
        const sectionMap = {
            'title': 'progress-title',
            'content': 'progress-content',
            'claim': 'progress-claim'
        };
        
        const labelId = sectionMap[section];
        if (labelId) {
            const label = document.getElementById(labelId);
            if (label) {
                label.classList.remove('active');
                label.classList.add('completed');
                console.log(`✅ Audio progress: Completed ${section}`);
            }
        }
    }
}

// Export for global usage
if (typeof window !== 'undefined') {
    window.QuizInterface = QuizInterface;
}