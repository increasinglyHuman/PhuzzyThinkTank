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
                    '<span class="bear-name">Wisdom Bear\'s Analysis</span>' +
                '</div>' +
                '<div class="bear-card-collection" id="bear-card-collection">' +
                    '<div class="collection-header"><span class="collection-icon">🎪</span> Phuzzy\'s Fallacies</div>' +
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
        // TODO: Future enhancement - Fuzzy analysis system
        // Instead of hard-coded mappings, we could analyze:
        // - Factor combinations (e.g., "harvard-credibility" + "profit-motive" = higher manipulation)
        // - Context weights (same factor means different things in different scenarios)
        // - Linguistic analysis of the actual text
        // - Bayesian inference from user responses
        // This would make scores emerge from the content rather than being predetermined
        
        // If factor already contains emoji or starts with emoji, use as-is
        if (factor.match(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u) || factor.includes('✓') || factor.includes('🚫')) {
            return factor;
        }
        
        // Logic factor conversions
        var logicFactors = {
            'qualified-expert': '✅ Qualified expert source',
            'specific-data': '✅ Specific study data shared', 
            'acknowledges-limits': '✅ Acknowledges limitations',
            'mentions-alternatives': '✅ Mentions alternatives',
            'direct-observation': '👁️ Direct classroom observation',
            'specific-changes': '📊 Specific behavior changes noted',
            'student-reports': '💬 Student self-reports',
            // V2 indicators
            'specific-percentages': '📊 Specific percentages cited',
            'cites-research': '📚 Cites research sources',
            'shows-uncertainty': '🤔 Shows uncertainty/questioning',
            'tested-data': '🧪 Personal testing/experiments',
            'specific-metrics': '📈 Specific metrics provided',
            'productivity-paradox': '⚡ Productivity paradox exposed',
            'correlation-acknowledgment': '🔗 Acknowledges correlation issues',
            'specific-costs': '💰 Specific costs detailed',
            'scholarship-statistics': '🎓 Scholarship statistics',
            'investment-comparison': '💸 Investment comparisons',
            'personal-data': '📱 Personal data/experience',
            'credential-comparison': '🎖️ Credential comparisons',
            'funding-sources': '💵 Funding sources revealed',
            'peer-review-counts': '📑 Peer review counts',
            'economic-pressure': '💼 Economic pressures noted',
            'dueling-studies': '⚔️ Competing studies cited',
            'selective-evidence': '🎯 Selective evidence use',
            'health-claims': '🏥 Health claims made',
            'test-results': '🩺 Test results shared',
            'probability-misunderstanding': '🎲 Probability errors',
            'independent-events-ignored': '🔀 Independent events confused',
            'pattern-invention': '🌀 False patterns claimed',
            'mathematical-certainty-claimed': '🧮 False mathematical certainty',
            'income-breakdown': '💵 Income breakdown shown',
            'expense-tracking': '📊 Expense tracking detailed',
            'hour-documentation': '⏰ Hours documented',
            'tax-classification': '📋 Tax classification issues',
            'collaborative': '🤝 Collaborative approach',
            'weak-evidence': '🚫 Weak or missing evidence',
            'zero-evidence': '🚫 Zero evidence of threat',
            'biased-source': '📱 Questionable source reliability',
            'facebook-source': '📱 "Read on Facebook" source',
            'hidden-agenda': '💰 Hidden sales agenda',
            'hidden-sales': '💰 Hidden sales agenda',
            'speculation': '😱 Pure speculation',
            'pure-speculation': '😱 Pure speculation',
            'cherry-picked': '🍒 Cherry-picked sample',
            'cherry-picked-sample': '🍒 Cherry-picked sample',
            'contradicts-evidence': '❌ Contradicts vast evidence',
            'industry-funded': '🏭 Likely industry-funded source',
            'dubious-institute': '🏭 Dubious "institute" source',
            'logical-fallacy': '🤔 Logical fallacy detected',
            'natural-good-fallacy': '🤔 "Natural = good" fallacy',
            'slippery-slope': '🎿 Slippery slope reasoning',
            'false-dilemma': '⚔️ False choice presented',
            'hasty-generalization': '🏃 Rushed generalization',
            'ad-hominem': '👤 Personal attack substitute',
            'appeal-to-tradition': '🏛️ "Ancient wisdom" appeal',
            'false-scarcity': '⏰ Fake scarcity pressure',
            'conspiracy-theory': '🕳️ Conspiracy reasoning',
            'false-equivalence': '⚖️ False equivalence drawn',
            'appeal-to-consequences': '😨 Threatening consequences',
            'multiple-studies': '📚 Multiple studies reviewed',
            'conflicting-data': '⚖️ Conflicting evidence presented',
            'regulatory-positions': '🏛️ Regulatory body positions',
            'practical-guidance': '💡 Practical guidance provided',
            'large-sample': '📊 Large sample size',
            'specific-metrics': '📈 Specific metrics provided',
            'nuanced-findings': '🔍 Nuanced findings presented',
            'credible-institution': '🎓 Credible institution source',
            'cost-benefit': '💰 Cost-benefit analysis',
            'survey-data': '📋 Survey data included',
            'comparable-examples': '🔗 Comparable examples cited',
            'acknowledges-downsides': '⚠️ Acknowledges downsides',
            'no-information': '🚫 No substantive information',
            'simple-trick-scam': '🎪 "Simple trick" scam language',
            'fake-urgency': '⏰ Artificial urgency created',
            'profit-motive': '💰 Clear profit motive',
            'filtered-photos': '📸 Heavily filtered photos',
            'ancient-secret-nonsense': '🏛️ "Ancient secret" nonsense',
            'anti-doctor': '⚕️ Anti-medical establishment',
            'aggressive-sales': '💰 Aggressive sales tactics',
            'one-incident-total-ban': '🚫 One incident, total ban',
            'extreme-response': '⚠️ Extreme overreaction',
            'no-context': '❌ Missing context',
            'fear-over-education': '😱 Fear over education'
        };
        
        // Emotion factor conversions  
        var emotionFactors = {
            'harvard-credibility': '🎓 Harvard credibility appeal',
            'aging-concern': '⏰ Aging concerns trigger',
            'hope-solution': '💊 Hope for solution',
            'professional-trust': '🤝 Professional trust appeal',
            'child-safety': '🚸 Child safety panic',
            'child-safety-panic': '🚸 Child safety panic',
            'police-narrative': '🚔 "Police won\'t help" narrative',
            'police-wont-help': '🚔 "Police won\'t help" narrative',
            'us-vs-them': '👥 Us vs. them mentality',
            'urgency-pressure': '⚡ URGENT pressure tactics',
            'urgent-pressure': '⚡ URGENT!!! pressure',
            'body-shame': '😢 Body shame activation',
            'relationship-insecurity': '👰 Relationship insecurity',
            'beauty-anxiety': '💃 Beauty standard anxiety',
            'economic-fear': '💰 Economic fear tactics',
            'superiority-complex': '🐑 "Wake up" superiority appeal',
            'wake-up-superiority': '🐑 "Wake up" superiority',
            'anti-establishment': '🏴 Anti-establishment appeal',
            'theyre-lying': '😤 "They\'re lying to you"',
            'academic-concern': '📚 Academic performance worry',
            'partnership-request': '🤝 Partnership approach',
            'health-worry': '🏥 Health concerns',
            'teacher-care': '💕 Teacher showing care',
            'child-health': '🧒 Child health concerns',
            'common-exposure': '📊 Common exposure data',
            'empowerment-info': '💪 Empowering information',
            'international-comparison': '🌍 International comparison',
            'work-relevance': '💼 Work relevance appeal',
            'data-confidence': '📊 Data confidence building',
            'change-acceptance': '🔄 Change acceptance',
            'academic-authority': '🎓 Academic authority appeal',
            'community-building': '🏘️ Community building appeal',
            'neighborhood-improvement': '🏠 Neighborhood improvement',
            'family-activity': '👨‍👩‍👧‍👦 Family activity appeal',
            'property-value': '🏡 Property value consideration',
            'kids-deserve-better': '👶 "Your kids deserve better"',
            'fomo-last-chance': '⏰ Fear of missing out',
            'wage-slave-shame': '😤 "Wage slave" shaming',
            'lifestyle-envy': '🏖️ Lifestyle envy trigger',
            'predator-terror': '😱 Predator terror appeal',
            'technology-panic': '📱 Technology panic',
            'protective-parent': '🛡️ Protective parent identity',
            'life-death-framing': '⚰️ Life or death framing',
            // V2 emotion triggers
            'scholarship-threat': '🎓 Scholarship threat',
            'academic-integrity': '📚 Academic integrity crisis',
            'systemic-frustration': '🏛️ System frustration',
            'fairness-struggle': '⚖️ Fairness struggle',
            'surveillance-frustration': '📹 Surveillance frustration',
            'us-vs-management': '👔 Us vs management',
            'tech-worker-solidarity': '💻 Tech worker solidarity',
            'irony-humor': '😏 Ironic humor coping',
            'parent-guilt': '😔 Parent guilt',
            'wasted-money': '💸 Wasted money regret',
            'failed-dreams': '💔 Failed dreams pain',
            'identity-crisis': '🎭 Identity crisis',
            'judgment-fear': '👀 Fear of judgment',
            'environmental-guilt': '🌍 Environmental guilt',
            'waste-shock': '🗑️ Waste shock value',
            'ethical-superiority': '✨ Ethical superiority',
            'change-maker-identity': '🦸 Change-maker identity',
            'stranger-danger': '🚨 Stranger danger fear',
            'property-values': '🏠 Property value concerns',
            'vigilante-justice': '⚔️ Vigilante justice',
            'safety-panic': '🚨 Safety panic',
            'professional-integrity': '💼 Professional integrity',
            'public-harm': '⚠️ Public harm concern',
            'moral-compromise': '😕 Moral compromise',
            'optimization-exhaustion': '😩 Optimization exhaustion',
            'authenticity-paradox': '🎭 Authenticity paradox',
            'shared-frustration': '🤝 Shared frustration',
            'family-division': '👨‍👩‍👧 Family division',
            'identity-threat': '🆔 Identity threat',
            'lost-connection': '💔 Lost connection',
            'tribal-warfare': '⚔️ Tribal warfare',
            'relationship-mourning': '😢 Relationship mourning',
            'loss-recovery-desperation': '🎰 Loss recovery desperation',
            'universe-owes-me': '🌌 Universe owes me',
            '智-superiority-delusion': '🧠 Superiority delusion',
            'life-destruction-humor': '😂 Life destruction humor',
            'financial-desperation': '💰 Financial desperation',
            'lost-dignity': '😞 Lost dignity',
            'isolation': '🏝️ Isolation',
            'regret': '😔 Regret',
            'dark-humor-coping': '🃏 Dark humor coping'
        };
        
        // Check logic factors first
        if (containerId === 'logic-factors' && logicFactors[factor]) {
            return logicFactors[factor];
        }
        
        // Check emotion factors
        if (containerId === 'emotion-factors' && emotionFactors[factor]) {
            return emotionFactors[factor];
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
        
        // Manipulation check
        setTimeout(function() {
            self.checkForManipulation(scenario);
        }, 4500);
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
                    htmlContent += '<div class="fallacy-callout-header">';
                    htmlContent += '<span class="icon">🃏</span>';
                    htmlContent += '<span>Logical Fallacy Cards Discovered!</span>';
                    htmlContent += '<div style="font-size: 0.8rem; margin-top: 5px; opacity: 0.8;">Hover to flip. Click to collect.</div>';
                    htmlContent += '</div>';
                    
                    htmlContent += '<div class="fallacy-card-container">';
                    
                    // Limit to maximum 3 cards per scenario
                    var cardsToShow = primaryFallacies.slice(0, 3);
                    
                    // Add each primary fallacy as a trading card
                    var self = this;
                    cardsToShow.forEach(function(fallacy, index) {
                        // Look up the full fallacy data
                        var fallacyData = self.fallacyDatabase && self.fallacyDatabase[fallacy.fallacyId];
                        if (!fallacyData) {
                            // Try to get icon from allFallacies array
                            var basicFallacy = self.allFallacies.find(function(f) { return f.id === fallacy.fallacyId; });
                            var fallacyIcon = basicFallacy ? basicFallacy.icon : '🃏';
                            var fallacyRarity = basicFallacy ? basicFallacy.rarity : 'common';
                            
                            // Fallback to minimal data if database not loaded
                            fallacyData = {
                                id: fallacy.fallacyId,
                                name: fallacy.fallacyId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                icon: fallacyIcon,
                                rarity: fallacyRarity,
                                definition: fallacy.example || 'A logical error in reasoning',
                                learningTip: 'Be aware of this logical fallacy',
                                commonIn: [],
                                category: 'logical-reasoning'
                            };
                        }
                        
                        var rarityStars = self.getRarityStars(fallacyData.rarity || 'common');
                        
                        htmlContent += '<div class="fallacy-card ' + (fallacyData.rarity || 'common') + ' card-discovered" id="card-' + fallacy.fallacyId + '">';
                        htmlContent += '<div class="card-inner">';
                        
                        // Card Front
                        htmlContent += '<div class="card-front">';
                        
                        // Card Header
                        htmlContent += '<div class="card-header">';
                        htmlContent += '<div class="card-title">Logical Fallacy</div>';
                        htmlContent += '<div class="card-rarity">' + rarityStars + '</div>';
                        htmlContent += '</div>';
                        
                        // Card Art Area
                        htmlContent += '<div class="card-art">';
                        htmlContent += '<div class="card-icon">' + fallacyData.icon + '</div>';
                        htmlContent += '</div>';
                        
                        // Card Content
                        htmlContent += '<div class="card-content">';
                        htmlContent += '<div class="card-category">' + (fallacyData.category || 'logical-reasoning').replace('-', ' ') + '</div>';
                        htmlContent += '<div class="card-name">' + fallacyData.name + '</div>';
                        htmlContent += '<div class="card-description">' + fallacyData.definition + '</div>';
                        htmlContent += '</div>';
                        
                        // New card badge - only show if never collected before
                        if (!self.everCollectedCards.has(fallacy.fallacyId)) {
                            htmlContent += '<div class="card-new-badge">NEW!</div>';
                        }
                        
                        htmlContent += '</div>'; // Close card-front
                        
                        // Card Back
                        htmlContent += '<div class="card-back">';
                        htmlContent += '<div class="card-back-content">';
                        htmlContent += '<div class="card-back-header">💡</div>';
                        htmlContent += '<div class="card-tip">' + fallacyData.learningTip + '</div>';
                        htmlContent += '<div class="card-examples">';
                        htmlContent += '<strong>Common in:</strong><br>' + (fallacyData.commonIn || []).join(', ');
                        htmlContent += '</div>';
                        htmlContent += '</div>'; // Close card-back-content
                        htmlContent += '</div>'; // Close card-back
                        
                        htmlContent += '</div>'; // Close card-inner
                        htmlContent += '</div>'; // Close fallacy-card
                    });
                    
                    htmlContent += '</div>'; // Close fallacy-card-container
                    
                    // Add secondary fallacies if present
                    if (secondaryFallacies.length > 0) {
                        htmlContent += '<div class="fallacy-secondary">';
                        htmlContent += '<strong>Also Present:</strong>';
                        htmlContent += '<div class="fallacy-secondary-list">';
                        secondaryFallacies.forEach(function(fallacy) {
                            var fallacyData = self.fallacyDatabase && self.fallacyDatabase[fallacy.fallacyId];
                            var icon = fallacyData ? fallacyData.icon : '🃏';
                            var shortName = fallacyData ? fallacyData.shortName : fallacy.fallacyId.replace(/-/g, ' ');
                            htmlContent += '<span class="fallacy-secondary-item">';
                            htmlContent += icon + ' ' + shortName;
                            htmlContent += '</span>';
                        });
                        htmlContent += '</div>';
                        htmlContent += '</div>';
                    }
                    
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
                            // Get the icon from the fallacy database or use a default
                            var fallacyData = self.fallacyDatabase && self.fallacyDatabase[fallacy.fallacyId];
                            var icon = '🃏'; // default
                            
                            if (fallacyData) {
                                icon = fallacyData.icon;
                            } else {
                                // Try to get icon from allFallacies array as fallback
                                var basicFallacy = self.allFallacies.find(function(f) { return f.id === fallacy.fallacyId; });
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
    
    checkForManipulation(scenario) {
        var manipulationScore = scenario.analysis.emotion.scores.manipulation;
        var warning = document.getElementById('manipulation-warning');
        var text = document.getElementById('manipulation-text');
        
        if (manipulationScore > 6 && warning && text) {
            text.textContent = 'High manipulation detected! This argument heavily relies on emotional triggers rather than solid evidence.';
            warning.style.display = 'block';
            warning.classList.add('visible');
        } else if (warning) {
            warning.style.display = 'none';
            warning.classList.remove('visible');
        }
    }
    
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
        // List all 15 fallacies from the data (rarity based on importance)
        this.allFallacies = [
            { id: 'appeal-to-fear', icon: '😨', rarity: 'uncommon' }, // Very manipulative
            { id: 'slippery-slope', icon: '🎿', rarity: 'uncommon' },
            { id: 'false-dilemma', icon: '⚔️', rarity: 'rare' }, // Critical thinking killer
            { id: 'post-hoc', icon: '🔄', rarity: 'uncommon' },
            { id: 'ad-hominem', icon: '👤', rarity: 'common' },
            { id: 'hasty-generalization', icon: '🏃', rarity: 'uncommon' }, // Very common mistake
            { id: 'appeal-to-tradition', icon: '🏛️', rarity: 'common' },
            { id: 'false-scarcity', icon: '⏰', rarity: 'rare' }, // Sales manipulation
            { id: 'cherry-picking', icon: '🍒', rarity: 'rare' }, // Deceptive practice
            { id: 'appeal-to-authority', icon: '🎓', rarity: 'common' },
            { id: 'straw-man', icon: '🥤', rarity: 'uncommon' }, // Debate destroyer
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
        // Create flying card element
        var flyingCard = document.createElement('div');
        flyingCard.className = 'flying-card';
        flyingCard.textContent = fallacyIcon;
        
        // Position it at source element location
        var sourceRect = sourceElement.getBoundingClientRect();
        flyingCard.style.position = 'fixed';
        flyingCard.style.left = sourceRect.left + 'px';
        flyingCard.style.top = sourceRect.top + 'px';
        flyingCard.style.zIndex = '9999';
        flyingCard.style.fontSize = '2rem';
        flyingCard.style.transition = 'all 1s ease-out';
        flyingCard.style.pointerEvents = 'none';
        
        document.body.appendChild(flyingCard);
        
        // Find target slot
        var targetSlot = document.getElementById('mini-card-' + fallacyId);
        if (!targetSlot) {
            document.body.removeChild(flyingCard);
            return;
        }
        
        var targetRect = targetSlot.getBoundingClientRect();
        
        // Animate to target with arc trajectory
        setTimeout(() => {
            flyingCard.style.left = targetRect.left + (targetRect.width / 2) + 'px';
            flyingCard.style.top = targetRect.top + (targetRect.height / 2) + 'px';
            flyingCard.style.transform = 'scale(0.6) rotate(360deg)';
            flyingCard.style.opacity = '0.8';
        }, 50);
        
        // After animation completes, update collection and cleanup
        setTimeout(() => {
            document.body.removeChild(flyingCard);
            this.addCardToCollection(fallacyId, fallacyIcon);
        }, 1050);
    }
    
    addCardToCollection(fallacyId, fallacyIcon) {
        var slot = document.getElementById('mini-card-' + fallacyId);
        if (!slot || slot.classList.contains('collected')) return;
        
        slot.classList.remove('empty');
        slot.classList.add('collected', 'new-discovery');
        slot.textContent = fallacyIcon;
        
        // Remove new-discovery animation after it completes
        setTimeout(() => {
            slot.classList.remove('new-discovery');
        }, 800);
    }
    
    collectCard(fallacyId, fallacyIcon, cardElement) {
        console.log('collectCard called:', fallacyId, fallacyIcon);
        var self = this;
        var slot = document.getElementById('mini-card-' + fallacyId);
        console.log('Looking for slot:', 'mini-card-' + fallacyId, 'Found:', !!slot);
        
        // If clicking a displayed card, return it to the rack
        if (slot && slot.classList.contains('collected') && slot.classList.contains('empty')) {
            // Card is displayed, return it to rack
            slot.classList.remove('empty');
            slot.textContent = fallacyIcon;
            
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
        
        // First time collecting
        if (!slot || !slot.classList.contains('collected')) {
            // Mark as ever collected (for NEW badge tracking)
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
            
            // Check if we have 3 cards displayed and need to hide one
            this.manageDisplayedCards(fallacyId);
            
            // Animate card to collection
            this.animateCardToCollection(fallacyId, fallacyIcon, cardElement);
            
            // Track in scoring system
            if (window.gameEngine && window.gameEngine.scoringSystem) {
                window.gameEngine.scoringSystem.collectedCards.add(fallacyId);
            }
            
            // Show success message
            this.showCardMessage(cardElement, 'Collected!');
            
            // Make the card disappear after a short delay
            setTimeout(function() {
                cardElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.5)';
                
                // Fully hide after animation
                setTimeout(function() {
                    cardElement.style.display = 'none';
                }, 500);
            }, 500);
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
            // Card is already displayed, do nothing
            return;
        }
        
        // Make the rack slot appear empty
        slot.classList.add('empty');
        var iconToRestore = slot.textContent;
        slot.textContent = '';
        slot.setAttribute('data-icon', iconToRestore); // Store icon for later
        
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
        cardHtml.innerHTML = 
            '<div class="card-inner">' +
                '<div class="card-front">' +
                    '<div class="card-header">' +
                        '<div class="card-title">Logical Fallacy</div>' +
                        '<div class="card-rarity">' + rarityStars + '</div>' +
                    '</div>' +
                    '<div class="card-art">' +
                        '<div class="card-icon">' + fallacyData.icon + '</div>' +
                    '</div>' +
                    '<div class="card-content">' +
                        '<div class="card-category">' + (fallacyData.category || 'logical-reasoning').replace('-', ' ') + '</div>' +
                        '<div class="card-name">' + fallacyData.name + '</div>' +
                        '<div class="card-description">' + fallacyData.definition + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card-back">' +
                    '<div class="card-back-content">' +
                        '<div class="card-back-header">💡</div>' +
                        '<div class="card-tip">' + fallacyData.learningTip + '</div>' +
                        '<div class="card-examples">' +
                            '<strong>Common in:</strong><br>' + (fallacyData.commonIn || []).join(', ') +
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
        
        // Hide manipulation warning
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
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BearAnalysis: BearAnalysis };
} else if (typeof window !== 'undefined') {
    window.BearAnalysis = BearAnalysis;
}