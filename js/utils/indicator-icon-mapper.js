// ===== UTILS/INDICATOR-ICON-MAPPER.JS =====
// Centralized icon mapping system for logic indicators and emotion triggers
// Used by both the game engine and review dashboard

class IndicatorIconMapper {
    constructor() {
        this.logicMappings = new Map();
        this.emotionMappings = new Map();
        this.isLoaded = false;
        this.loadPromise = null;
    }
    
    async initialize() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        this.loadPromise = this.loadMappings();
        return this.loadPromise;
    }
    
    async loadMappings() {
        console.log('🎯 IndicatorIconMapper: Starting to load mappings...');
        try {
            // Try to load the comprehensive mapping file first
            console.log('🎯 IndicatorIconMapper: Attempting to load comprehensive mapping file...');
            const comprehensiveResponse = await fetch('data/reference/indicator-trigger-icons.json').catch(() => null);
            
            if (comprehensiveResponse && comprehensiveResponse.ok) {
                console.log('✅ IndicatorIconMapper: Successfully fetched comprehensive mapping file');
                const data = await comprehensiveResponse.json();
                
                // Process the comprehensive format
                if (data.indicators) {
                    // Flatten the nested structure
                    Object.values(data.indicators).forEach(category => {
                        if (typeof category === 'object' && category !== null && !category.icon) {
                            Object.entries(category).forEach(([key, value]) => {
                                if (value && value.icon) {
                                    this.logicMappings.set(key, `${value.icon} ${value.text}`);
                                }
                            });
                        }
                    });
                    console.log(`✅ IndicatorIconMapper: Loaded ${this.logicMappings.size} logic mappings from comprehensive file`);
                }
                
                if (data.triggers) {
                    // Flatten the nested structure
                    Object.values(data.triggers).forEach(category => {
                        if (typeof category === 'object' && category !== null && !category.icon) {
                            Object.entries(category).forEach(([key, value]) => {
                                if (value && value.icon) {
                                    this.emotionMappings.set(key, `${value.icon} ${value.text}`);
                                }
                            });
                        }
                    });
                    console.log(`✅ IndicatorIconMapper: Loaded ${this.emotionMappings.size} emotion mappings from comprehensive file`);
                }
            } else {
                // Fallback to individual files
                console.log('⚠️ IndicatorIconMapper: Comprehensive file not found, trying individual files...');
                const [logicResponse, emotionResponse] = await Promise.all([
                    fetch('data/reference/logic-indicator-icons.json').catch(() => null),
                    fetch('data/reference/emotion-trigger-icons.json').catch(() => null)
                ]);
                
                if (logicResponse && logicResponse.ok) {
                    const logicData = await logicResponse.json();
                    this.logicMappings = new Map(Object.entries(logicData));
                    console.log(`✅ IndicatorIconMapper: Loaded ${this.logicMappings.size} logic mappings from individual file`);
                } else {
                    console.log('⚠️ IndicatorIconMapper: Logic file not found, using hardcoded fallback');
                    this.loadHardcodedLogicMappings();
                }
                
                if (emotionResponse && emotionResponse.ok) {
                    const emotionData = await emotionResponse.json();
                    this.emotionMappings = new Map(Object.entries(emotionData));
                    console.log(`✅ IndicatorIconMapper: Loaded ${this.emotionMappings.size} emotion mappings from individual file`);
                } else {
                    console.log('⚠️ IndicatorIconMapper: Emotion file not found, using hardcoded fallback');
                    this.loadHardcodedEmotionMappings();
                }
            }
            
            this.isLoaded = true;
            console.log('📊 IndicatorIconMapper: Final loaded state:', {
                logicMappings: this.logicMappings.size,
                emotionMappings: this.emotionMappings.size,
                sampleLogic: Array.from(this.logicMappings.entries()).slice(0, 3),
                sampleEmotion: Array.from(this.emotionMappings.entries()).slice(0, 3)
            });
            
        } catch (error) {
            console.error('❌ IndicatorIconMapper: Failed to load icon mappings, using hardcoded fallback:', error);
            this.loadHardcodedLogicMappings();
            this.loadHardcodedEmotionMappings();
            this.isLoaded = true;
        }
    }
    
    getIconForFactor(factor, type = 'auto', containerId = null) {
        if (!this.isLoaded) {
            console.warn('⚠️ IndicatorIconMapper: Not loaded yet, returning fallback for:', factor);
            return this.getFallbackIcon(factor);
        }
        
        console.log(`🔍 IndicatorIconMapper: Looking up icon for factor: "${factor}", type: "${type}", containerId: "${containerId}"`);
        
        // Auto-detect type based on containerId if not specified
        if (type === 'auto') {
            if (containerId === 'logic-factors') {
                type = 'logic';
                console.log('🔍 IndicatorIconMapper: Auto-detected type as "logic" based on containerId');
            } else if (containerId === 'emotion-factors') {
                type = 'emotion';
                console.log('🔍 IndicatorIconMapper: Auto-detected type as "emotion" based on containerId');
            } else {
                // Try both maps
                if (this.logicMappings.has(factor)) {
                    type = 'logic';
                    console.log('🔍 IndicatorIconMapper: Found factor in logic mappings');
                } else if (this.emotionMappings.has(factor)) {
                    type = 'emotion';
                    console.log('🔍 IndicatorIconMapper: Found factor in emotion mappings');
                } else {
                    type = 'logic'; // default
                    console.log('🔍 IndicatorIconMapper: Factor not found in either mapping, defaulting to logic');
                }
            }
        }
        
        const mappings = type === 'logic' ? this.logicMappings : this.emotionMappings;
        
        if (mappings.has(factor)) {
            const result = mappings.get(factor);
            console.log(`✅ IndicatorIconMapper: Found mapping for "${factor}": "${result}"`);
            return result;
        }
        
        // Fallback to readable text
        console.log(`⚠️ IndicatorIconMapper: No mapping found for "${factor}", using fallback`);
        return this.getFallbackIcon(factor);
    }
    
    getFallbackIcon(factor) {
        // If factor already contains emoji, use as-is
        if (this.hasEmoji(factor)) {
            return factor;
        }
        
        // Convert kebab-case to readable text with generic icon
        const readable = factor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return '• ' + readable;
    }
    
    hasEmoji(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(text) || text.includes('✓') || text.includes('🚫');
    }
    
    // Scan scenarios to find missing mappings
    analyzeMissingMappings(scenarios) {
        const missing = {
            logic: new Set(),
            emotion: new Set()
        };
        
        scenarios.forEach(scenario => {
            if (scenario.analysis && scenario.analysis.logic && scenario.analysis.logic.indicators) {
                scenario.analysis.logic.indicators.forEach(indicator => {
                    if (!this.logicMappings.has(indicator)) {
                        missing.logic.add(indicator);
                    }
                });
            }
            
            if (scenario.analysis && scenario.analysis.emotion && scenario.analysis.emotion.triggers) {
                scenario.analysis.emotion.triggers.forEach(trigger => {
                    if (!this.emotionMappings.has(trigger)) {
                        missing.emotion.add(trigger);
                    }
                });
            }
        });
        
        return {
            logic: Array.from(missing.logic).sort(),
            emotion: Array.from(missing.emotion).sort(),
            total: missing.logic.size + missing.emotion.size
        };
    }
    
    // Add new mapping
    addMapping(factor, iconText, type) {
        const mappings = type === 'logic' ? this.logicMappings : this.emotionMappings;
        mappings.set(factor, iconText);
        
        console.log(`Added ${type} mapping:`, factor, '→', iconText);
        return true;
    }
    
    // Get all mappings for export/review
    getAllMappings() {
        return {
            logic: Object.fromEntries(this.logicMappings),
            emotion: Object.fromEntries(this.emotionMappings)
        };
    }
    
    // Save mappings to JSON (for review dashboard)
    async saveMappings() {
        const data = this.getAllMappings();
        
        // In a real implementation, this would save to the server
        // For now, we'll just log the data that could be saved
        console.log('Mappings ready for export:', data);
        
        return data;
    }
    
    // Suggest similar mappings based on text analysis
    suggestMapping(factor, type) {
        const mappings = type === 'logic' ? this.logicMappings : this.emotionMappings;
        const suggestions = [];
        
        // Find mappings with similar keywords
        const factorWords = factor.toLowerCase().split('-');
        
        for (const [existingFactor, iconText] of mappings) {
            const existingWords = existingFactor.toLowerCase().split('-');
            const commonWords = factorWords.filter(word => existingWords.includes(word));
            
            if (commonWords.length > 0) {
                suggestions.push({
                    factor: existingFactor,
                    iconText: iconText,
                    similarity: commonWords.length / Math.max(factorWords.length, existingWords.length),
                    commonWords: commonWords
                });
            }
        }
        
        // Sort by similarity
        suggestions.sort((a, b) => b.similarity - a.similarity);
        
        return suggestions.slice(0, 5); // Top 5 suggestions
    }
    
    loadHardcodedLogicMappings() {
        const hardcodedLogic = {
            'qualified-expert': '✅ Qualified expert source',
            'specific-data': '✅ Specific study data shared', 
            'acknowledges-limits': '✅ Acknowledges limitations',
            'mentions-alternatives': '✅ Mentions alternatives',
            'direct-observation': '👁️ Direct classroom observation',
            'specific-changes': '📊 Specific behavior changes noted',
            'student-reports': '💬 Student self-reports',
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
        
        this.logicMappings = new Map(Object.entries(hardcodedLogic));
    }
    
    loadHardcodedEmotionMappings() {
        const hardcodedEmotion = {
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
            'life-death-framing': '⚰️ Life or death framing'
        };
        
        this.emotionMappings = new Map(Object.entries(hardcodedEmotion));
    }
}

// Create singleton instance
const indicatorIconMapper = new IndicatorIconMapper();

// Initialize immediately if in browser
if (typeof window !== 'undefined') {
    indicatorIconMapper.initialize().catch(console.error);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IndicatorIconMapper, indicatorIconMapper };
} else if (typeof window !== 'undefined') {
    window.IndicatorIconMapper = IndicatorIconMapper;
    window.indicatorIconMapper = indicatorIconMapper;
}