// ===== UI/BEAR-ANALYSIS.JS =====
class BearAnalysis {
    constructor(container) {
        this.container = container;
        this.setupHTML();
        this.initializeCardCollection();
    }
    
    setupHTML() {
        this.container.innerHTML = 
            '<div class="analysis-grid">' +
                '<div class="bear-panel logic-panel">' +
                    '<div class="bear-header">' +
                        '<span class="bear-emoji thinking" id="logic-bear">🧠</span>' +
                        '<span class="bear-name logic-name">Logic Bear</span>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Evidence Quality</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill logic-fill" id="evidence-meter" style="width: 0%">' +
                                '<span class="meter-value" id="evidence-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Logical Consistency</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill logic-fill" id="logic-meter" style="width: 0%">' +
                                '<span class="meter-value" id="logic-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Source Reliability</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill logic-fill" id="source-meter" style="width: 0%">' +
                                '<span class="meter-value" id="source-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Hidden Agenda Risk</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill logic-fill" id="agenda-meter" style="width: 0%">' +
                                '<span class="meter-value" id="agenda-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="factors-list">' +
                        '<h4>Logical Issues Found:</h4>' +
                        '<div id="logic-factors"></div>' +
                    '</div>' +
                '</div>' +
                
                '<div class="bear-panel emotion-panel">' +
                    '<div class="bear-header">' +
                        '<span class="bear-emoji thinking" id="emotion-bear">💖</span>' +
                        '<span class="bear-name emotion-name">Emotion Bear</span>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Fear/Safety Appeal</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill emotion-fill" id="fear-meter" style="width: 0%">' +
                                '<span class="meter-value" id="fear-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Belonging/Identity</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill emotion-fill" id="belonging-meter" style="width: 0%">' +
                                '<span class="meter-value" id="belonging-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Pride/Status Appeal</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill emotion-fill" id="pride-meter" style="width: 0%">' +
                                '<span class="meter-value" id="pride-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="metric">' +
                        '<div class="metric-label">Emotional Manipulation Risk</div>' +
                        '<div class="meter-container">' +
                            '<div class="meter-fill emotion-fill" id="emotion-agenda-meter" style="width: 0%">' +
                                '<span class="meter-value" id="emotion-agenda-value">0/10</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="factors-list">' +
                        '<h4>Emotional Triggers Detected:</h4>' +
                        '<div id="emotion-factors"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            '<div class="wisdom-panel">' +
                '<div class="wisdom-header">' +
                    '<span class="bear-emoji">🦉</span>' +
                    '<span class="bear-name" data-text="Wisdom\'s Analysis">Wisdom\'s Analysis</span>' +
                '</div>' +
                '<div class="bear-card-collection" id="bear-card-collection">' +
                    '<div class="card-collection-grid" id="card-collection-grid">' +
                        '<!-- 15 mini bear card slots will be generated by JS -->' +
                    '</div>' +
                '</div>' +
                '<div class="wisdom-content" id="wisdom-content">' +
                    'Analyzing the balance between logic and emotion...' +
                '</div>' +
                '<div class="balance-section">' +
                    '<h3>Logic ↔ Emotion Balance</h3>' +
                    '<div class="balance-meter">' +
                        '<div class="balance-indicator" id="balance-indicator" style="left: 50%">' +
                            '<span class="balance-icon" id="balance-icon">⚖️</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="balance-labels" style="font-size: 1.3em; display: flex; justify-content: space-between; margin-top: 10px;">' +
                        '<span style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); font-weight: 600;">🧠 Pure Logic</span>' +
                        '<span style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); font-weight: 600;">⚖️ Balanced</span>' +
                        '<span style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); font-weight: 600;">💖 Pure Emotion</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            '<div class="manipulation-warning" id="manipulation-warning">' +
                '<strong style="font-size: 1.2em;">🚨 Manipulation Alert!</strong>' +
                '<div id="manipulation-text" style="margin-top: 8px; font-size: 1.05em;"></div>' +
            '</div>';
    }
    
    showDualBearAnalysis(scenario) {
        // Make analysis visible
        var analysisGrid = this.container.querySelector('.analysis-grid');
        if (analysisGrid) {
            analysisGrid.classList.add('visible');
        }
        
        // Start bear animations
        document.getElementById('logic-bear').classList.add('thinking');
        document.getElementById('emotion-bear').classList.add('thinking');
        
        // Store scenario data for scroll-triggered animations
        this.currentScenario = scenario;
        this.animationsTriggered = false;
        
        // Set up scroll listener for dramatic reveals
        this.setupScrollTrigger();
        
        // Stop thinking animation after a moment - user will scroll to see results
        setTimeout(function() {
            document.getElementById('logic-bear').classList.remove('thinking');
            document.getElementById('emotion-bear').classList.remove('thinking');
        }, 2000);
        
        // Note: Animations and integrations now triggered by scroll
        // This creates suspense as user scrolls down to reveal analysis
    }
    
    animateMeter(meterId, value, delay) {
        setTimeout(function() {
            var meter = document.getElementById(meterId);
            var valueSpan = document.getElementById(meterId.replace('-meter', '-value'));
            
            if (meter && valueSpan) {
                // Ensure meter starts at 0% (force reflow)
                meter.style.width = '0%';
                meter.offsetHeight; // Force reflow
                
                // Now animate to target width (value is already 0-100)
                meter.style.width = value + '%';
                valueSpan.textContent = value + '%';
            }
        }, delay);
    }
    
    displayFactors(containerId, factors) {
        var container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        var self = this;
        factors.forEach(function(factor, index) {
            setTimeout(function() {
                var factorDiv = document.createElement('div');
                factorDiv.className = 'factor-item';
                // Convert factor keys to display text with icons
                var displayText = self.convertFactorToDisplayText(factor, containerId);
                factorDiv.innerHTML = displayText;
                container.appendChild(factorDiv);
            }, 200 * (index + 1)); // Stagger the factor appearance
        });
    }
    
    convertFactorToDisplayText(factor, containerId) {
        // Use centralized indicator icon mapper if available
        if (window.indicatorIconMapper && window.indicatorIconMapper.isLoaded) {
            return window.indicatorIconMapper.getIconForFactor(factor, 'auto', containerId);
        }
        
        // Fallback to legacy hardcoded mappings if mapper not loaded
        return this.getLegacyMapping(factor, containerId);
    }
    
    getLegacyMapping(factor, containerId) {
        // If factor already contains emoji or starts with emoji, use as-is
        if (factor.match(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u) || factor.includes('✓') || factor.includes('🚫')) {
            return factor;
        }
        
        // Basic fallback mappings for common indicators
        var basicLogicFactors = {
            'qualified-expert': '✅ Qualified expert source',
            'specific-data': '✅ Specific study data shared',
            'weak-evidence': '🚫 Weak or missing evidence',
            'hidden-agenda': '💰 Hidden sales agenda',
            'cherry-picked': '🍒 Cherry-picked sample',
            'false-scarcity': '⏰ Fake scarcity pressure'
        };
        
        var basicEmotionFactors = {
            'harvard-credibility': '🎓 Harvard credibility appeal',
            'child-safety-panic': '🚸 Child safety panic',
            'us-vs-them': '👥 Us vs. them mentality',
            'urgency-pressure': '⚡ URGENT pressure tactics',
            'lifestyle-envy': '🏖️ Lifestyle envy trigger'
        };
        
        // Check basic mappings
        if (containerId === 'logic-factors' && basicLogicFactors[factor]) {
            return basicLogicFactors[factor];
        }
        
        if (containerId === 'emotion-factors' && basicEmotionFactors[factor]) {
            return basicEmotionFactors[factor];
        }
        
        // Fallback: convert kebab-case to readable text
        return '• ' + factor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    setupScrollTrigger() {
        var self = this;
        
        // Remove any existing scroll listener
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
        
        this.scrollListener = function() {
            try {
                if (self.animationsTriggered) return;
                
                // Check if bear analysis section is in view
                var analysisGrid = self.container.querySelector('.analysis-grid');
                if (!analysisGrid) return;
                
                var rect = analysisGrid.getBoundingClientRect();
                var triggerPoint = window.innerHeight * 0.7; // Trigger when 70% visible
                
                if (rect.top < triggerPoint) {
                    self.animationsTriggered = true;
                    self.triggerStaggeredAnimations();
                    window.removeEventListener('scroll', self.scrollListener);
                    self.scrollListener = null; // Clear reference
                }
            } catch (error) {
                console.warn('Scroll listener error:', error);
                // Remove faulty listener to prevent blocking
                window.removeEventListener('scroll', self.scrollListener);
                self.scrollListener = null;
            }
        };
        
        window.addEventListener('scroll', this.scrollListener);
    }
    
    triggerStaggeredAnimations() {
        var scenario = this.currentScenario;
        if (!scenario) return;
        
        var self = this;
        
        // Start both bears thinking
        setTimeout(function() {
            console.log('🧠💖 Bears begin dual analysis...');
            document.getElementById('logic-bear').classList.add('thinking');
            document.getElementById('emotion-bear').classList.add('thinking');
        }, 200);
        
        // Alternate between logic and emotion bars
        // Bar 1: Logic Evidence
        setTimeout(function() {
            self.animateMeter('evidence-meter', scenario.analysis.logic.scores.evidence, 0);
        }, 400);
        
        // Bar 1: Emotion Fear
        setTimeout(function() {
            self.animateMeter('fear-meter', scenario.analysis.emotion.scores.fear, 0);
        }, 800);
        
        // Bar 2: Logic Consistency
        setTimeout(function() {
            self.animateMeter('logic-meter', scenario.analysis.logic.scores.consistency, 0);
        }, 1200);
        
        // Bar 2: Emotion Belonging
        setTimeout(function() {
            self.animateMeter('belonging-meter', scenario.analysis.emotion.scores.belonging, 0);
        }, 1600);
        
        // Bar 3: Logic Source
        setTimeout(function() {
            self.animateMeter('source-meter', scenario.analysis.logic.scores.source, 0);
        }, 2000);
        
        // Bar 3: Emotion Pride
        setTimeout(function() {
            self.animateMeter('pride-meter', scenario.analysis.emotion.scores.pride, 0);
        }, 2400);
        
        // Bar 4: Logic Agenda
        setTimeout(function() {
            self.animateMeter('agenda-meter', scenario.analysis.logic.scores.agenda, 0);
            document.getElementById('logic-bear').classList.remove('thinking');
            self.displayFactors('logic-factors', scenario.analysis.logic.indicators);
        }, 2800);
        
        // Bar 4: Emotion Manipulation
        setTimeout(function() {
            self.animateMeter('emotion-agenda-meter', scenario.analysis.emotion.scores.manipulation, 0);
            document.getElementById('emotion-bear').classList.remove('thinking');
            self.displayFactors('emotion-factors', scenario.analysis.emotion.triggers);
        }, 3200);
        
        // Wisdom Bear integration
        setTimeout(function() {
            console.log('🦉 Wisdom Bear synthesizes...');
            self.showWisdomBearIntegration(scenario);
            self.updateBalanceIndicator(scenario);
        }, 4000);
        
        // Manipulation check - DISABLED for cleaner UI
        // setTimeout(function() {
        //     self.checkForManipulation(scenario);
        // }, 4500);
    }
    
    showWisdomBearIntegration(scenario) {
        var wisdomContent = document.getElementById('wisdom-content');
        if (wisdomContent) {
            var htmlContent = '';
            
            console.log('🦉 Wisdom Bear analyzing scenario:', scenario.id); // Debug
            console.log('Logical fallacies found:', scenario.logicalFallacies); // Debug
            console.log('Primary fallacies:', scenario.logicalFallacies ? scenario.logicalFallacies.filter(f => f.severity === 'primary') : []); // Debug
            
            // Create structured fallacy callout if fallacies present
            if (scenario.logicalFallacies && scenario.logicalFallacies.length > 0) {
                // Calculate fuzzy scores for intelligent card selection
                var logicScore = Object.values(scenario.analysis.logic.scores).reduce((a, b) => a + b, 0) / 4;
                var emotionScore = Object.values(scenario.analysis.emotion.scores).reduce((a, b) => a + b, 0) / 4;
                var manipulationLevel = scenario.analysis.emotion.scores.manipulation;
                var agendaLevel = scenario.analysis.logic.scores.agenda;
                
                // Fuzzy calculation: Higher manipulation/agenda = show more cards
                // Lower scores = show educational examples of proper usage
                var fuzzyCardThreshold = (manipulationLevel + agendaLevel) / 200; // 0.0 to 1.0 (now using 0-100 scale)
                var educationalValue = 1 - fuzzyCardThreshold; // Inverse: good examples are educational too
                
                console.log('🧮 Fuzzy card calculation:', {
                    scenario: scenario.id,
                    manipulation: manipulationLevel,
                    agenda: agendaLevel,
                    fuzzyThreshold: fuzzyCardThreshold,
                    educationalValue: educationalValue
                });
                
                // Group fallacies with fuzzy logic consideration
                var primaryFallacies = scenario.logicalFallacies.filter(f => 
                    f.severity === 'primary' || 
                    f.severity === 'major' || 
                    f.severity === 'minor' || 
                    f.severity === 'potential'
                );
                
                // If no primary fallacies but educational value is high, promote some
                if (primaryFallacies.length === 0 && educationalValue > 0.5) {
                    // Promote "appropriate" or "balanced" uses for educational purposes
                    var educationalFallacies = scenario.logicalFallacies.filter(f =>
                        f.severity === 'appropriate' || 
                        f.severity === 'balanced'
                    );
                    if (educationalFallacies.length > 0) {
                        primaryFallacies = educationalFallacies.slice(0, Math.max(1, Math.ceil(educationalFallacies.length * educationalValue)));
                        console.log('📚 Promoting educational fallacies:', primaryFallacies);
                    }
                }
                
                // Ensure at least one card per scenario
                if (primaryFallacies.length === 0 && scenario.logicalFallacies.length > 0) {
                    primaryFallacies = [scenario.logicalFallacies[0]];
                    console.log('🎴 Ensuring at least one card for scenario');
                }
                
                var secondaryFallacies = scenario.logicalFallacies.filter(f => 
                    !primaryFallacies.includes(f) && (
                        f.severity === 'secondary' || 
                        f.severity === 'avoided' ||
                        f.severity === 'appropriate' ||
                        f.severity === 'balanced'
                    )
                );
                
                if (primaryFallacies.length > 0) {
                    htmlContent += '<div class="fallacy-callout">';
                    htmlContent += '<div class="fallacy-card-container">';
                    
                    // Limit to maximum 3 cards per scenario
                    var cardsToShow = primaryFallacies.slice(0, 3);
                    
                    // Add each primary fallacy as a trading card
                    var self = this;
                    cardsToShow.forEach(function(fallacy, index) {
                        // Apply alias mapping if needed
                        var mappedFallacyId = self.fallacyAliases[fallacy.fallacyId] || fallacy.fallacyId;
                        
                        // Look up the full fallacy data using mapped ID
                        var fallacyData = self.fallacyDatabase && self.fallacyDatabase[mappedFallacyId];
                        if (!fallacyData) {
                            // Try to get icon from allFallacies array using mapped ID
                            var basicFallacy = self.allFallacies.find(function(f) { return f.id === mappedFallacyId; });
                            
                            // If still no match, default to hasty-generalization (most generic fallacy)
                            if (!basicFallacy) {
                                console.warn('Unknown fallacy:', fallacy.fallacyId, '- defaulting to hasty-generalization');
                                mappedFallacyId = 'hasty-generalization';
                                basicFallacy = self.allFallacies.find(function(f) { return f.id === mappedFallacyId; });
                            }
                            
                            var fallacyIcon = basicFallacy.icon;
                            var fallacyRarity = basicFallacy.rarity;
                            
                            // Fallback to minimal data if database not loaded
                            fallacyData = {
                                id: mappedFallacyId,
                                name: mappedFallacyId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                icon: fallacyIcon,
                                rarity: fallacyRarity,
                                definition: fallacy.example || 'A logical error in reasoning',
                                learningTip: 'Be aware of this logical fallacy',
                                commonIn: [],
                                category: 'logical-reasoning'
                            };
                        }
                        
                        var rarityStars = self.getRarityStars(fallacyData.rarity || 'common');
                        
                        // Use original fallacyId for card ID to maintain uniqueness
                        htmlContent += '<div class="fallacy-card ' + (fallacyData.rarity || 'common') + ' card-discovered" id="card-' + fallacy.fallacyId + '">';
                        htmlContent += '<div class="card-inner">';
                        
                        // Card Front with background image
                        var cardFrontStyle = '';
                        if (typeof getFallacyImagePath !== 'undefined') {
                            var imagePath = getFallacyImagePath(mappedFallacyId);
                            cardFrontStyle = ' style="background-image: url(\'' + imagePath + '\');"';
                        }
                        htmlContent += '<div class="card-front"' + cardFrontStyle + '>';
                        
                        // Card Header
                        htmlContent += '<div class="card-header">';
                        htmlContent += '<div class="card-rarity">' + rarityStars + '</div>';
                        htmlContent += '</div>';
                        
                        // Card Content - just the name at bottom
                        htmlContent += '<div class="card-content">';
                        // Use shorter name for Post Hoc
                        var displayName = fallacyData.name;
                        if (mappedFallacyId === 'post-hoc') {
                            displayName = 'False Cause';
                        }
                        htmlContent += '<div class="card-name">' + displayName + '</div>';
                        htmlContent += '</div>';
                        
                        // New card badge - only show if never collected before
                        if (!self.everCollectedCards.has(fallacy.fallacyId)) {
                            htmlContent += '<div class="card-new-badge">NEW!</div>';
                        }
                        
                        htmlContent += '</div>'; // Close card-front
                        
                        // Card Back
                        htmlContent += '<div class="card-back">';
                        htmlContent += '<div class="card-back-content">';
                        htmlContent += '<div class="card-tip">' + fallacyData.learningTip + '</div>';
                        
                        // Add defensive tip
                        var defenseTip = self.fallacyDefenses[mappedFallacyId] || "\"Trust your instincts and ask questions!\"";
                        htmlContent += '<div class="card-defense" style="background: rgba(102, 126, 234, 0.15); padding: 12px; border-radius: 8px; margin: 15px 0 0 0; font-weight: 600; color: #e6d7c3;"><strong>🛡️ Defense Tip:</strong> ' + defenseTip + '</div>';
                        htmlContent += '</div>'; // Close card-back-content
                        htmlContent += '</div>'; // Close card-back
                        
                        htmlContent += '</div>'; // Close card-inner
                        htmlContent += '</div>'; // Close fallacy-card
                    });
                    
                    htmlContent += '</div>'; // Close fallacy-card-container
                    
                    htmlContent += '</div>'; // Close fallacy-callout
                }
            }
            
            // Then add the wisdom analysis
            var integration = scenario.wisdom || this.getWisdomIntegration(scenario);
            // Remove any existing fallacy detection from wisdom text to avoid duplication
            integration = integration.replace(/🎯\s*\*\*Logical Fallac[^*]*\*\*[^-]*-\s*/g, '');
            
            // Convert remaining markdown to HTML and add to content
            var wisdomHtml = integration
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
            
            htmlContent += '<div style="margin-top: 15px;">' + wisdomHtml + '</div>';
            
            wisdomContent.innerHTML = htmlContent;
            
            // Add click handlers to fallacy cards for collection
            if (scenario.logicalFallacies && scenario.logicalFallacies.length > 0) {
                var self = this;
                setTimeout(function() {
                    var primaryFallacies = scenario.logicalFallacies.filter(f => 
                        f.severity === 'primary' || 
                        f.severity === 'major' || 
                        f.severity === 'minor' || 
                        f.severity === 'potential' ||
                        f.severity === 'appropriate' ||
                        f.severity === 'balanced'
                    );
                    var cardsToShow = primaryFallacies.slice(0, 3);
                    
                    cardsToShow.forEach(function(fallacy) {
                        var cardElement = document.getElementById('card-' + fallacy.fallacyId);
                        if (cardElement) {
                            // Apply alias mapping
                            var mappedFallacyId = self.fallacyAliases[fallacy.fallacyId] || fallacy.fallacyId;
                            
                            // Get the icon from the fallacy database or use a default
                            var fallacyData = self.fallacyDatabase && self.fallacyDatabase[mappedFallacyId];
                            var icon = '🃏'; // default
                            
                            if (fallacyData) {
                                icon = fallacyData.icon;
                            } else {
                                // Try to get icon from allFallacies array as fallback using mapped ID
                                var basicFallacy = self.allFallacies.find(function(f) { return f.id === mappedFallacyId; });
                                if (basicFallacy) {
                                    icon = basicFallacy.icon;
                                }
                            }
                            
                            cardElement.addEventListener('click', function() {
                                self.collectCard(fallacy.fallacyId, icon, cardElement);
                            });
                            cardElement.style.cursor = 'pointer';
                            cardElement.title = 'Click to collect this fallacy card';
                        }
                    });
                }, 500); // Wait for cards to be rendered
            }
        }
    }
    
    getWisdomIntegration(scenario) {
        var correctAnswer = scenario.correctAnswer;
        
        if (correctAnswer === 'emotion') {
            return 'Classic emotional manipulation combining trust networks with body insecurity. The "doctor husband" detail adds false authority while urgent scarcity drives quick decisions. Real medical weight loss never promises 30 pounds in a month safely.';
        } else if (correctAnswer === 'logic') {
            return 'Weak logical foundation built on anecdotes and assumptions. The argument dismisses expert opinions without evidence and proposes extreme solutions based on limited personal experiences.';
        } else if (correctAnswer === 'balanced') {
            return 'Well-structured argument with solid data and cost analysis. Acknowledges potential confounding factors while maintaining focus on measurable outcomes and student success metrics.';
        } else {
            return 'Hidden agenda detected through selective data presentation and inflammatory language. The source may have financial or ideological motivations that compromise objective analysis.';
        }
    }
    
    updateBalanceIndicator(scenario) {
        var logicTotal = Object.values(scenario.analysis.logic.scores).reduce(function(a, b) { return a + b; }, 0) / 4;
        var emotionTotal = Object.values(scenario.analysis.emotion.scores).reduce(function(a, b) { return a + b; }, 0) / 4;
        
        // Balance calculation: 0% = Pure Logic (left), 100% = Pure Emotion (right)
        var balance = (emotionTotal / (logicTotal + emotionTotal)) * 100;
        var indicator = document.getElementById('balance-indicator');
        var icon = document.getElementById('balance-icon');
        
        
        if (indicator && icon) {
            // Force initial position for animation
            indicator.style.transition = 'none';
            indicator.style.left = '50%';
            
            // Trigger reflow
            indicator.offsetHeight;
            
            // Now animate to target position
            indicator.style.transition = 'left 1.5s ease-out';
            indicator.style.left = balance + '%';
            
            if (balance < 30) {
                icon.textContent = '🧠';
                icon.title = 'Logic-heavy argument';
            } else if (balance > 70) {
                icon.textContent = '💖';
                icon.title = 'Emotion-heavy argument';
            } else {
                icon.textContent = '⚖️';
                icon.title = 'Balanced argument';
            }
        }
    }
    
    // DISABLED - Manipulation warnings removed for cleaner, more educational UI
    // checkForManipulation(scenario) {
    //     var manipulationScore = scenario.analysis.emotion.scores.manipulation;
    //     var warning = document.getElementById('manipulation-warning');
    //     var text = document.getElementById('manipulation-text');
    //     
    //     if (manipulationScore > 6 && warning && text) {
    //         text.textContent = 'High manipulation detected! This argument heavily relies on emotional triggers rather than solid evidence.';
    //         warning.style.display = 'block';
    //         warning.classList.add('visible');
    //     } else if (warning) {
    //         warning.style.display = 'none';
    //         warning.classList.remove('visible');
    //     }
    // }
    
    getRarityStars(rarity) {
        var rarityMap = {
            'common': '★☆☆',
            'uncommon': '★★☆', 
            'rare': '★★★',
            'epic': '★★★★',
            'legendary': '★★★★★'
        };
        return '<span class="rarity-star">' + (rarityMap[rarity] || '★☆☆') + '</span>';
    }
    
    initializeCardCollection() {
        // Fallacy alias mapping for scenarios using undefined fallacies
        this.fallacyAliases = {
            'gamblers-fallacy': 'hasty-generalization',
            'false-pattern': 'hasty-generalization',
            'sunk-cost': 'false-scarcity', // continuing due to investment
            'tu-quoque': 'ad-hominem', // attacking person's hypocrisy
            'false-comparison': 'false-equivalence',
            'anecdotal-evidence': 'hasty-generalization',
            'false-analogy': 'false-equivalence',
            'appeal-to-popularity': 'bandwagon',
            'appeal-to-hypocrisy': 'ad-hominem',
            'appeal-to-consequences': 'appeal-to-fear',
            'survivorship-bias': 'cherry-picking',
            'false-promise': 'false-scarcity',
            'confirmation-bias': 'cherry-picking',
            'appeal-to-money': 'appeal-to-authority'
        };
        
        // Defensive tips for each fallacy - short, punchy, and practical!
        this.fallacyDefenses = {
            'appeal-to-fear': "\"What are the actual statistics on that?\"",
            'slippery-slope': "\"Let's focus on this specific issue first.\"",
            'false-dilemma': "\"What other options are we missing?\"",
            'post-hoc': "\"Correlation doesn't equal causation!\"",
            'ad-hominem': "\"Let's stick to the actual argument.\"",
            'hasty-generalization': "\"That's just one example - got more data?\"",
            'appeal-to-tradition': "\"Just because it's old doesn't make it right.\"",
            'false-scarcity': "\"I'll sleep on it and decide tomorrow.\"",
            'cherry-picking': "\"Show me ALL the data, not just the good parts.\"",
            'appeal-to-authority': "\"Experts can be wrong - where's the evidence?\"",
            'straw-man': "\"That's not what I said. Let me clarify...\"",
            'bandwagon': "\"Popular doesn't mean correct.\"",
            'red-herring': "\"Nice distraction, but back to the point...\"",
            'appeal-to-nature': "\"Natural doesn't always mean better or safer.\"",
            'false-equivalence': "\"Those two things aren't really comparable.\""
        };
        
        // List all 15 fallacies from the data (rarity based on importance)
        this.allFallacies = [
            { id: 'appeal-to-fear', icon: '😨', rarity: 'uncommon' }, // Very manipulative
            { id: 'slippery-slope', icon: '🎿', rarity: 'uncommon' },
            { id: 'false-dilemma', icon: '⚔️', rarity: 'rare' }, // Critical thinking killer
            { id: 'post-hoc', icon: '🎲', rarity: 'uncommon' }, // Dice = correlation ≠ causation
            { id: 'ad-hominem', icon: '👉', rarity: 'common' }, // Pointing finger at person
            { id: 'hasty-generalization', icon: '🏃', rarity: 'uncommon' }, // Very common mistake
            { id: 'appeal-to-tradition', icon: '🏛️', rarity: 'common' },
            { id: 'false-scarcity', icon: '⏰', rarity: 'rare' }, // Sales manipulation
            { id: 'cherry-picking', icon: '🍒', rarity: 'rare' }, // Deceptive practice
            { id: 'appeal-to-authority', icon: '🎓', rarity: 'common' },
            { id: 'straw-man', icon: '🎃', rarity: 'uncommon' }, // Scarecrow/fake target
            { id: 'bandwagon', icon: '🚌', rarity: 'common' },
            { id: 'red-herring', icon: '🐟', rarity: 'uncommon' }, // Distraction tactic
            { id: 'appeal-to-nature', icon: '🌿', rarity: 'common' },
            { id: 'false-equivalence', icon: '⚖️', rarity: 'rare' } // Dangerous in media
        ];
        
        // Track which cards have been seen before
        this.seenCards = new Set();
        
        // Track which cards have EVER been collected (for NEW badge)
        this.everCollectedCards = new Set();
        
        // Load full fallacy data
        this.loadFallacyData();
        
        // Create the mini card slots
        setTimeout(() => {
            this.createCardSlots();
        }, 100);
    }
    
    loadFallacyData() {
        var self = this;
        fetch('data/logical-fallacies.json')
            .then(response => response.json())
            .then(data => {
                self.fallacyDatabase = data.fallacies;
                console.log('Loaded fallacy database:', self.fallacyDatabase);
            })
            .catch(error => {
                console.error('Error loading fallacy data:', error);
                // Fallback to basic data if load fails
                self.fallacyDatabase = {};
            });
    }
    
    createCardSlots() {
        var grid = document.getElementById('card-collection-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        var self = this;
        
        for (var i = 0; i < this.allFallacies.length; i++) {
            var fallacy = this.allFallacies[i];
            var slot = document.createElement('div');
            slot.className = 'mini-card empty ' + fallacy.rarity;
            slot.id = 'mini-card-' + fallacy.id;
            var tooltipText = fallacy.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            slot.setAttribute('data-tooltip', tooltipText);
            
            // Add click handler for recall functionality
            slot.addEventListener('click', function() {
                var fallacyId = this.id.replace('mini-card-', '');
                if (this.classList.contains('collected')) {
                    self.recallCard(fallacyId);
                }
            });
            
            grid.appendChild(slot);
        }
        
        // Start sizzle animation timer
        this.startSizzleTimer();
        
        // Initialize backgrounds for any previously collected cards
        this.initializeCollectedCardBackgrounds();
    }
    
    initializeCollectedCardBackgrounds() {
        var self = this;
        
        // Check if scoring system has collected cards
        if (window.gameEngine && window.gameEngine.scoringSystem && window.gameEngine.scoringSystem.collectedCards) {
            window.gameEngine.scoringSystem.collectedCards.forEach(function(fallacyId) {
                var slot = document.getElementById('mini-card-' + fallacyId);
                if (slot && slot.classList.contains('collected')) {
                    // Set background image
                    if (typeof getFallacyImagePath !== 'undefined') {
                        var imagePath = getFallacyImagePath(fallacyId);
                        slot.style.backgroundImage = 'url("' + imagePath + '")';
                    }
                    slot.textContent = ''; // Clear any text
                }
            });
        }
    }
    
    startSizzleTimer() {
        var self = this;
        
        // Clear any existing timer
        if (this.sizzleTimer) {
            clearInterval(this.sizzleTimer);
        }
        
        // Start new timer every 10 seconds
        this.sizzleTimer = setInterval(function() {
            self.triggerRandomSizzle();
        }, 10000);
    }
    
    triggerRandomSizzle() {
        var collectedCards = document.querySelectorAll('.mini-card.collected:not(.hidden-card)');
        if (collectedCards.length === 0) return;
        
        // Pick a random collected card
        var randomCard = collectedCards[Math.floor(Math.random() * collectedCards.length)];
        
        // Add sizzle class
        randomCard.classList.add('sizzle');
        
        // Remove sizzle class after animation
        setTimeout(function() {
            randomCard.classList.remove('sizzle');
        }, 1000);
    }
    
    animateCardToCollection(fallacyId, fallacyIcon, sourceElement) {
        // Create flying card container with 3D perspective
        var flyingCard = document.createElement('div');
        flyingCard.className = 'flying-card-3d';
        flyingCard.style.cssText = 'position: fixed; width: 140px; height: 210px; perspective: 1000px; z-index: 9999; pointer-events: none;';
        
        // Create inner card that can rotate
        var cardInner = document.createElement('div');
        cardInner.style.cssText = 'width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: all 1s ease-out; transform: rotateY(180deg);';
        
        // Create card front
        var cardFront = document.createElement('div');
        cardFront.style.cssText = 'position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 10px; border: 2px solid #ffd700; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);';
        
        if (typeof getFallacyImagePath !== 'undefined') {
            var imagePath = getFallacyImagePath(fallacyId);
            cardFront.style.backgroundImage = 'url("' + imagePath + '")';
            cardFront.style.backgroundSize = 'cover';
            cardFront.style.backgroundPosition = 'center';
        } else {
            cardFront.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            cardFront.style.display = 'flex';
            cardFront.style.alignItems = 'center';
            cardFront.style.justifyContent = 'center';
            cardFront.style.fontSize = '3rem';
            cardFront.style.color = 'white';
            cardFront.textContent = fallacyIcon;
        }
        
        // Create card back (mini version)
        var cardBack = document.createElement('div');
        cardBack.style.cssText = 'position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg); border-radius: 10px; border: 2px solid #744210; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); display: flex; align-items: center; justify-content: center; color: #ffd700; font-size: 2rem; font-weight: bold;';
        cardBack.textContent = '🛡️';
        
        // Assemble the card
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        flyingCard.appendChild(cardInner);
        
        // Position it at source element location (centered)
        var sourceRect = sourceElement.getBoundingClientRect();
        flyingCard.style.left = (sourceRect.left + sourceRect.width / 2 - 70) + 'px';
        flyingCard.style.top = (sourceRect.top + sourceRect.height / 2 - 105) + 'px';
        
        document.body.appendChild(flyingCard);
        
        // Find target slot
        var targetSlot = document.getElementById('mini-card-' + fallacyId);
        if (!targetSlot) {
            document.body.removeChild(flyingCard);
            return;
        }
        
        var targetRect = targetSlot.getBoundingClientRect();
        
        // Animate to target with rotation and scaling (no spin at end)
        setTimeout(() => {
            flyingCard.style.transition = 'all 1s ease-out';
            flyingCard.style.left = (targetRect.left + targetRect.width / 2 - 22.5) + 'px';
            flyingCard.style.top = (targetRect.top + targetRect.height / 2 - 30) + 'px';
            cardInner.style.transform = 'rotateY(0deg) scale(0.28)';
            flyingCard.style.opacity = '0.85';
        }, 50);
        
        // After animation completes, update collection and cleanup
        setTimeout(() => {
            document.body.removeChild(flyingCard);
            this.addCardToCollection(fallacyId, fallacyIcon);
        }, 1050);
    }
    
    addCardToCollection(fallacyId, fallacyIcon) {
        var slot = document.getElementById('mini-card-' + fallacyId);
        if (!slot) return;
        
        // If already collected, don't re-add animations
        var isFirstTime = !slot.classList.contains('collected');
        
        slot.classList.remove('empty');
        slot.classList.add('collected');
        
        if (isFirstTime) {
            slot.classList.add('new-discovery');
        }
        
        // Set background image instead of icon
        if (typeof getFallacyImagePath !== 'undefined') {
            var imagePath = getFallacyImagePath(fallacyId);
            slot.style.backgroundImage = 'url("' + imagePath + '")';
        }
        slot.textContent = ''; // Remove any text content
        
        // Add shadow filter for "tucked in" effect
        slot.style.filter = 'brightness(0.85) drop-shadow(inset 0 2px 4px rgba(0, 0, 0, 0.6))';
        
        // Remove new-discovery animation after it completes
        if (isFirstTime) {
            setTimeout(() => {
                slot.classList.remove('new-discovery');
            }, 800);
        }
    }
    
    collectCard(fallacyId, fallacyIcon, cardElement) {
        console.log('collectCard called:', fallacyId, fallacyIcon);
        var self = this;
        
        // Apply alias mapping
        var mappedFallacyId = this.fallacyAliases[fallacyId] || fallacyId;
        
        var slot = document.getElementById('mini-card-' + mappedFallacyId);
        console.log('Looking for slot:', 'mini-card-' + mappedFallacyId, 'Found:', !!slot);
        
        // If clicking a displayed card, return it to the rack
        if (slot && slot.classList.contains('collected') && slot.classList.contains('empty')) {
            // Card is displayed, return it to rack
            slot.classList.remove('empty');
            
            // Restore background image
            var storedBgImage = slot.getAttribute('data-bg-image');
            if (storedBgImage) {
                slot.style.backgroundImage = storedBgImage;
            } else if (typeof getFallacyImagePath !== 'undefined') {
                var imagePath = getFallacyImagePath(mappedFallacyId);
                slot.style.backgroundImage = 'url("' + imagePath + '")';
            }
            slot.textContent = ''; // Keep empty
            
            // Hide the displayed card
            cardElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.5)';
            
            setTimeout(function() {
                cardElement.style.display = 'none';
            }, 500);
            
            this.showCardMessage(cardElement, 'Returned to collection!');
            return;
        }
        
        // Otherwise, collect the card (whether first time or seen before)
        if (slot) {
            // Only handle NEW badge if this is truly the first time seeing this card
            if (!this.everCollectedCards.has(fallacyId)) {
                // Mark as ever collected
                this.everCollectedCards.add(fallacyId);
                
                // Remove NEW badge if it exists
                var newBadge = cardElement.querySelector('.card-new-badge');
                if (newBadge) {
                    newBadge.style.opacity = '0';
                    setTimeout(function() {
                        if (newBadge.parentNode) {
                            newBadge.parentNode.removeChild(newBadge);
                        }
                    }, 300);
                }
            }
            
            // Check if we have 3 cards displayed and need to hide one
            this.manageDisplayedCards(mappedFallacyId);
            
            // Track in scoring system using mapped ID (only if not already in collection)
            if (!slot.classList.contains('collected')) {
                if (window.gameEngine && window.gameEngine.scoringSystem) {
                    window.gameEngine.scoringSystem.collectedCards.add(mappedFallacyId);
                }
                
                // First time adding to collection - use addCardToCollection
                // (This will happen after the flying animation)
            }
            
            // Show success message
            this.showCardMessage(cardElement, 'Collected!');
            
            // Make the card disappear faster
            setTimeout(function() {
                cardElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.5)';
                
                // Fully hide after animation
                setTimeout(function() {
                    cardElement.style.display = 'none';
                }, 300);
            }, 200);
            
            // Delay the flying card animation until big card is almost gone
            var self = this;
            setTimeout(function() {
                self.animateCardToCollection(mappedFallacyId, fallacyIcon, cardElement);
                
                // Mark the slot as empty since we're displaying the card
                var slot = document.getElementById('mini-card-' + mappedFallacyId);
                if (slot) {
                    slot.classList.add('empty');
                }
            }, 400);
        } else {
            // Card has been collected before but we still need to handle it
            console.log('Card already collected but handling click:', mappedFallacyId);
            
            // Still remove NEW badge if it exists (shouldn't but just in case)
            var newBadge = cardElement.querySelector('.card-new-badge');
            if (newBadge) {
                newBadge.style.opacity = '0';
                setTimeout(function() {
                    if (newBadge.parentNode) {
                        newBadge.parentNode.removeChild(newBadge);
                    }
                }, 300);
            }
            
            // Check if we have 3 cards displayed and need to hide one
            this.manageDisplayedCards(mappedFallacyId);
            
            // Show success message
            this.showCardMessage(cardElement, 'Collected!');
            
            // Make the card disappear faster
            setTimeout(function() {
                cardElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.5)';
                
                // Fully hide after animation
                setTimeout(function() {
                    cardElement.style.display = 'none';
                }, 300);
            }, 200);
            
            // Delay the flying card animation until big card is almost gone
            var self = this;
            setTimeout(function() {
                self.animateCardToCollection(mappedFallacyId, fallacyIcon, cardElement);
                
                // Mark the slot as empty since we're displaying the card
                var slot = document.getElementById('mini-card-' + mappedFallacyId);
                if (slot) {
                    slot.classList.add('empty');
                }
            }, 400);
        }
    }
    
    manageDisplayedCards(newFallacyId) {
        // Track which cards are currently displayed
        if (!this.displayedCards) {
            this.displayedCards = [];
        }
        
        // If we're about to show a 4th card, hide the oldest one
        if (this.displayedCards.length >= 3) {
            var oldestCard = this.displayedCards.shift();
            this.hideDisplayedCard(oldestCard);
        }
        
        // Add new card to displayed list
        this.displayedCards.push(newFallacyId);
    }
    
    hideDisplayedCard(fallacyId) {
        var slot = document.getElementById('mini-card-' + fallacyId);
        if (slot && slot.classList.contains('collected')) {
            slot.classList.add('hidden-card');
            slot.style.opacity = '0.3';
            slot.style.transform = 'scale(0.8)';
        }
    }
    
    recallCard(fallacyId) {
        console.log('recallCard called with:', fallacyId);
        console.log('fallacyDatabase loaded?', this.fallacyDatabase ? Object.keys(this.fallacyDatabase).length + ' fallacies' : 'NO');
        
        var slot = document.getElementById('mini-card-' + fallacyId);
        if (!slot || !slot.classList.contains('collected')) {
            console.log('Card not found or not collected:', fallacyId);
            return;
        }
        
        // Check if we already have a card displayed for this fallacy
        var existingCard = document.getElementById('card-' + fallacyId);
        if (existingCard && existingCard.style.display !== 'none') {
            // Card is already displayed, so recall it back to toybox
            existingCard.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            existingCard.style.opacity = '0';
            existingCard.style.transform = 'scale(0.8)';
            
            // Return card to rack with background image
            slot.classList.remove('empty');
            slot.classList.add('collected');
            
            // Restore the background image
            var storedBgImage = slot.getAttribute('data-bg-image');
            if (storedBgImage) {
                slot.style.backgroundImage = storedBgImage;
            } else if (typeof getFallacyImagePath !== 'undefined') {
                // Fallback: regenerate the image path
                var imagePath = getFallacyImagePath(fallacyId);
                slot.style.backgroundImage = 'url("' + imagePath + '")';
            }
            slot.textContent = ''; // Keep text empty
            
            setTimeout(function() {
                existingCard.style.display = 'none';
            }, 300);
            
            // Show the oldest hidden card if any
            this.showOldestHiddenCard();
            
            // Update displayed cards list
            if (this.displayedCards) {
                var index = this.displayedCards.indexOf(fallacyId);
                if (index > -1) {
                    this.displayedCards.splice(index, 1);
                }
            }
            
            return;
        }
        
        // Make the rack slot appear empty BUT keep it marked as collected
        slot.classList.add('empty');
        // Don't remove 'collected' - we need to know it's been collected before
        
        // Store the background image for restoration
        var bgImageToRestore = slot.style.backgroundImage;
        slot.setAttribute('data-bg-image', bgImageToRestore);
        slot.style.backgroundImage = '';
        slot.textContent = '';
        
        // First, check if we need to hide an old card (if 3+ are displayed)
        var displayedCards = document.querySelectorAll('.fallacy-card:not([style*="display: none"])');
        if (displayedCards.length >= 3) {
            // Hide the oldest displayed card and return it to its rack
            var oldestCard = displayedCards[0];
            var oldestId = oldestCard.id.replace('card-', '');
            var oldestSlot = document.getElementById('mini-card-' + oldestId);
            
            if (oldestSlot && oldestSlot.getAttribute('data-icon')) {
                oldestSlot.classList.remove('empty');
                oldestSlot.textContent = oldestSlot.getAttribute('data-icon');
            }
            
            oldestCard.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            oldestCard.style.opacity = '0';
            oldestCard.style.transform = 'scale(0.8)';
            setTimeout(function() {
                oldestCard.style.display = 'none';
            }, 300);
        }
        
        // Now recreate the card in the wisdom bear section
        this.recreateCardInWisdom(fallacyId);
    }
    
    showOldestHiddenCard() {
        var hiddenCards = document.querySelectorAll('.mini-card.collected.hidden-card');
        if (hiddenCards.length > 0) {
            var oldestHidden = hiddenCards[0];
            oldestHidden.classList.remove('hidden-card');
            oldestHidden.style.opacity = '';
            oldestHidden.style.transform = '';
        }
    }
    
    showCardMessage(cardElement, message) {
        var messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = 'position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; z-index: 1000; pointer-events: none;';
        
        cardElement.style.position = 'relative';
        cardElement.appendChild(messageEl);
        
        setTimeout(function() {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 2000);
    }
    
    recreateCardInWisdom(fallacyId) {
        var self = this;
        
        // Find the fallacy card container
        var container = document.querySelector('.fallacy-card-container');
        if (!container) return;
        
        // Get fallacy data
        var fallacyData = this.fallacyDatabase && this.fallacyDatabase[fallacyId];
        if (!fallacyData) {
            // Try to find from allFallacies
            var basicData = this.allFallacies.find(f => f.id === fallacyId);
            if (basicData) {
                fallacyData = {
                    id: fallacyId,
                    name: fallacyId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    icon: basicData.icon,
                    rarity: basicData.rarity,
                    definition: 'A logical error in reasoning',
                    learningTip: 'Be aware of this logical fallacy',
                    commonIn: [],
                    category: 'logical-reasoning'
                };
            } else {
                return;
            }
        }
        
        // Check if card already exists and is just hidden
        var existingCard = document.getElementById('card-' + fallacyId);
        if (existingCard) {
            // Make it visible again
            existingCard.style.display = '';
            existingCard.style.opacity = '0';
            existingCard.style.transform = 'scale(0.5)';
            
            // Animate in
            setTimeout(function() {
                existingCard.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                existingCard.style.opacity = '1';
                existingCard.style.transform = 'scale(1)';
            }, 50);
            
            return;
        }
        
        // Create new card HTML
        var rarityStars = this.getRarityStars(fallacyData.rarity || 'common');
        var cardHtml = document.createElement('div');
        cardHtml.className = 'fallacy-card ' + (fallacyData.rarity || 'common') + ' card-discovered';
        cardHtml.id = 'card-' + fallacyId;
        
        // Get background image for card front
        var cardFrontStyle = '';
        if (typeof getFallacyImagePath !== 'undefined') {
            var imagePath = getFallacyImagePath(fallacyId);
            cardFrontStyle = ' style="background-image: url(\'' + imagePath + '\');"';
        }
        
        cardHtml.innerHTML = 
            '<div class="card-inner">' +
                '<div class="card-front"' + cardFrontStyle + '>' +
                    '<div class="card-header">' +
                        '<div class="card-rarity">' + rarityStars + '</div>' +
                    '</div>' +
                    '<div class="card-content">' +
                        '<div class="card-name">' + (fallacyId === 'post-hoc' ? 'False Cause' : fallacyData.name) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card-back">' +
                    '<div class="card-back-content">' +
                        '<div class="card-tip">' + fallacyData.learningTip + '</div>' +
                        '<div class="card-defense" style="background: rgba(102, 126, 234, 0.15); padding: 12px; border-radius: 8px; margin: 15px 0 0 0; font-weight: 600; color: #e6d7c3;"><strong>🛡️ Defense Tip:</strong> ' + 
                            (this.fallacyDefenses[fallacyId] || "\"Trust your instincts and ask questions!\"") + 
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        
        // Add click handler
        cardHtml.addEventListener('click', function() {
            self.collectCard(fallacyId, fallacyData.icon, cardHtml);
        });
        cardHtml.style.cursor = 'pointer';
        cardHtml.title = 'Click to collect this fallacy card';
        
        // Animate in
        cardHtml.style.opacity = '0';
        cardHtml.style.transform = 'scale(0.5)';
        container.appendChild(cardHtml);
        
        setTimeout(function() {
            cardHtml.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            cardHtml.style.opacity = '1';
            cardHtml.style.transform = 'scale(1)';
        }, 50);
    }
    
    reset() {
        // Clean up scroll listener
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
        
        // Clean up sizzle timer
        if (this.sizzleTimer) {
            clearInterval(this.sizzleTimer);
            this.sizzleTimer = null;
        }
        
        // Reset animation state
        this.animationsTriggered = false;
        this.currentScenario = null;
        this.displayedCards = [];
        
        // Reset meters
        var meters = ['evidence-meter', 'logic-meter', 'source-meter', 'agenda-meter', 
                     'fear-meter', 'belonging-meter', 'pride-meter', 'emotion-agenda-meter'];
        
        meters.forEach(function(meterId) {
            var meter = document.getElementById(meterId);
            var valueSpan = document.getElementById(meterId.replace('-meter', '-value'));
            if (meter) {
                meter.style.width = '0%';
            }
            if (valueSpan) valueSpan.textContent = '0%';
        });
        
        // Clear factors
        var factorContainers = ['logic-factors', 'emotion-factors'];
        factorContainers.forEach(function(containerId) {
            var container = document.getElementById(containerId);
            if (container) container.innerHTML = '';
        });
        
        // Reset bears
        document.getElementById('logic-bear').classList.remove('thinking');
        document.getElementById('emotion-bear').classList.remove('thinking');
        
        // Hide manipulation warning - DISABLED but keeping DOM cleanup
        var warning = document.getElementById('manipulation-warning');
        if (warning) {
            warning.style.display = 'none';
            warning.classList.remove('visible');
        }
        
        // Reset balance
        document.getElementById('balance-indicator').style.left = '50%';
        document.getElementById('balance-icon').textContent = '⚖️';
        
        // Reset wisdom content
        var wisdomContent = document.getElementById('wisdom-content');
        if (wisdomContent) {
            wisdomContent.textContent = 'Analyzing the balance between logic and emotion...';
        }
        
        // Restore all collected cards to their rack positions
        this.restoreCollectedCards();
    }
    
    restoreCollectedCards() {
        var self = this;
        
        // Hide any displayed fallacy cards
        var displayedCards = document.querySelectorAll('.fallacy-card');
        displayedCards.forEach(function(card) {
            card.style.display = 'none';
        });
        
        // Go through all mini-card slots
        var allSlots = document.querySelectorAll('.mini-card');
        allSlots.forEach(function(slot) {
            if (slot.classList.contains('collected')) {
                // Remove empty state
                slot.classList.remove('empty');
                
                // Restore background image if stored
                var storedBgImage = slot.getAttribute('data-bg-image');
                if (storedBgImage) {
                    slot.style.backgroundImage = storedBgImage;
                } else {
                    // Get fallacy ID from slot ID
                    var fallacyId = slot.id.replace('mini-card-', '');
                    if (typeof getFallacyImagePath !== 'undefined') {
                        var imagePath = getFallacyImagePath(fallacyId);
                        slot.style.backgroundImage = 'url("' + imagePath + '")';
                    }
                }
                
                // Ensure proper styling
                slot.textContent = '';
                slot.style.filter = 'brightness(0.85) drop-shadow(inset 0 2px 4px rgba(0, 0, 0, 0.6))';
            }
        });
        
        // Restart sizzle timer for collected cards
        this.startSizzleTimer();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BearAnalysis: BearAnalysis };
} else if (typeof window !== 'undefined') {
    window.BearAnalysis = BearAnalysis;
}