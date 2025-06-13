/**
 * 🎯 Phuzzy Scenario Manager
 * Smart single-pack loading with config-based pack selection
 * 
 * Features:
 * - Loads only ONE pack per session (10 scenarios)
 * - Config-driven pack selection with promotions
 * - Weighted random selection
 * - Featured scenario support
 * - Memory efficient (no multi-pack loading)
 * 
 * Built for the Phuzzy Think Tank game engine
 */

class ScenarioManager {
    constructor(config = {}) {
        this.config = {
            scenariosPerRound: config.scenariosPerRound || 10,
            packConfigPath: config.packConfigPath || './data/pack-promotions.json',
            maxRetries: config.maxRetries || 3,
            ...config
        };
        
        this.currentPack = null;
        this.scenarios = [];
        this.usedScenarios = [];
        this.packInfo = null;
        this.loadingPromise = null;
        
        // Error tracking
        this.errorLog = [];
        this.loadAttempts = 0;
    }

    /**
     * Load scenarios for a game session
     * This is the main entry point - loads ONE pack only
     */
    async loadScenarios(requestedCount = 10) {
        try {
            // Prevent multiple simultaneous loads
            if (this.loadingPromise) {
                return await this.loadingPromise;
            }

            this.loadingPromise = this._doLoadScenarios(requestedCount);
            const result = await this.loadingPromise;
            this.loadingPromise = null;
            
            return result;
            
        } catch (error) {
            this.loadingPromise = null;
            this.logError('Failed to load scenarios', error);
            throw error;
        }
    }

    /**
     * Internal scenario loading logic
     */
    async _doLoadScenarios(requestedCount) {
        this.loadAttempts++;
        
        // Step 1: Select which pack to use
        const selectedPack = await this.selectPack();
        if (!selectedPack) {
            throw new Error('No valid scenario pack available');
        }

        console.log(`🎯 Selected pack: ${selectedPack.name} (${selectedPack.id})`);

        // Step 2: Load the selected pack
        const packData = await this.loadPackData(selectedPack);
        if (!packData || !packData.scenarios) {
            throw new Error(`Failed to load pack data: ${selectedPack.id}`);
        }

        // Step 3: Process and validate scenarios
        this.scenarios = await this.processScenarios(packData.scenarios);
        this.packInfo = packData.packInfo || { packName: selectedPack.name, packId: selectedPack.id };
        this.currentPack = selectedPack;

        console.log(`✅ Loaded ${this.scenarios.length} scenarios from ${selectedPack.name}`);
        
        return {
            count: this.scenarios.length,
            packInfo: this.packInfo,
            packId: selectedPack.id
        };
    }

    /**
     * Select which pack to use based on config and promotions
     */
    async selectPack() {
        try {
            // Get pack promotions config
            const promotions = await this.loadPromotionsConfig();
            const availablePacks = this.getAvailablePacks();
            
            if (availablePacks.length === 0) {
                throw new Error('No enabled packs available');
            }

            // Check for active promotions
            const activePromotion = this.getActivePromotion(promotions);
            
            if (activePromotion) {
                console.log(`🎉 Active promotion: ${activePromotion.name}`);
                return this.selectPackFromPromotion(activePromotion, availablePacks);
            } else {
                console.log('📦 Using default pack selection');
                return this.selectPackFromDefaults(promotions.defaultWeights || {}, availablePacks);
            }
            
        } catch (error) {
            this.logError('Pack selection failed, using fallback', error);
            // Fallback: just pick the first available pack
            const availablePacks = this.getAvailablePacks();
            return availablePacks.length > 0 ? availablePacks[0] : null;
        }
    }

    /**
     * Get list of enabled packs from config
     */
    getAvailablePacks() {
        const packs = window.SCENARIO_PACKS || {};
        return Object.values(packs).filter(pack => pack.enabled && pack.file);
    }

    /**
     * Load pack promotions configuration
     */
    async loadPromotionsConfig() {
        try {
            const response = await fetch('./data/pack-promotions.json');
            if (!response.ok) {
                throw new Error(`Failed to load promotions: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            this.logError('Failed to load promotions config', error);
            // Return empty config as fallback
            return { promotions: [], defaultWeights: {} };
        }
    }

    /**
     * Find active promotion based on current date
     */
    getActivePromotion(promotionsConfig) {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

        return promotionsConfig.promotions
            .filter(promo => promo.active)
            .filter(promo => {
                const start = promo.startDate;
                const end = promo.endDate;
                return today >= start && today <= end;
            })
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]; // Highest priority first
    }

    /**
     * Select pack based on promotion criteria (tags + weights)
     */
    selectPackFromPromotion(promotion, availablePacks) {
        // Filter by tags first
        let eligiblePacks = availablePacks;
        
        if (promotion.requiredTags || promotion.excludeTags) {
            eligiblePacks = window.getPacksByTags(
                promotion.requiredTags || [],
                promotion.optionalTags || [],
                promotion.excludeTags || []
            );
            
            console.log(`🏷️  Tag filtering: ${eligiblePacks.length} packs match criteria`);
        }
        
        // Apply pack weights
        const weights = promotion.packWeights || {};
        const weightedPacks = eligiblePacks.filter(pack => 
            weights[pack.id] !== undefined ? weights[pack.id] > 0 : true
        );
        
        if (weightedPacks.length === 0) {
            console.warn('No packs match promotion criteria, using defaults');
            return this.selectPackFromDefaults({}, availablePacks);
        }

        // Use promotion weights or equal weighting
        const finalWeights = {};
        weightedPacks.forEach(pack => {
            finalWeights[pack.id] = weights[pack.id] || 1;
        });

        return this.selectWeightedRandom(weightedPacks, finalWeights);
    }

    /**
     * Select pack using default weights
     */
    selectPackFromDefaults(defaultWeights, availablePacks) {
        const weights = {};
        
        // Assign weights to available packs
        availablePacks.forEach(pack => {
            weights[pack.id] = defaultWeights[pack.id] || 1; // Default weight of 1
        });

        return this.selectWeightedRandom(availablePacks, weights);
    }

    /**
     * Weighted random selection
     */
    selectWeightedRandom(packs, weights) {
        const totalWeight = packs.reduce((sum, pack) => sum + (weights[pack.id] || 0), 0);
        
        if (totalWeight === 0) {
            // All weights are 0, just pick randomly
            return packs[Math.floor(Math.random() * packs.length)];
        }

        let random = Math.random() * totalWeight;
        
        for (const pack of packs) {
            const weight = weights[pack.id] || 0;
            random -= weight;
            if (random <= 0) {
                return pack;
            }
        }

        // Fallback: return last pack
        return packs[packs.length - 1];
    }

    /**
     * Load scenario data from pack file
     */
    /**
     * 🐻 FORTIFIED PACK LOADING - Bear-proof file loading with bulletproof error handling
     */
    async loadPackData(pack) {
        console.log(`🐻 Bear attempting to load pack: ${pack?.name || 'Unknown Pack'}`);
        
        try {
            // Validate pack input with bear claws
            if (!pack) {
                throw new Error('🐻 Bear error: No pack provided to load');
            }
            
            if (!pack.file) {
                throw new Error(`🐻 Bear error: Pack ${pack.id || 'unknown'} has no file path`);
            }
            
            console.log(`📂 Bear fetching pack file: ${pack.file}`);
            
            // Bulletproof HTTP request
            let response;
            try {
                response = await fetch(pack.file);
            } catch (fetchError) {
                console.error(`🐻 Bear network error fetching ${pack.file}:`, fetchError);
                throw new Error(`Network error: Could not fetch pack file ${pack.file}. Check if the file exists and server is running.`);
            }
            
            // Bear validates HTTP response
            if (!response) {
                throw new Error(`🐻 Bear error: No response received for ${pack.file}`);
            }
            
            if (!response.ok) {
                console.error(`🐻 Bear HTTP error: ${response.status} ${response.statusText} for ${pack.file}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - Could not load ${pack.file}`);
            }
            
            console.log(`✅ Bear successfully fetched ${pack.file}, parsing JSON...`);
            
            // Bulletproof JSON parsing
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error(`🐻 Bear JSON parse error for ${pack.file}:`, parseError);
                throw new Error(`Invalid JSON in pack file ${pack.file}. Check file syntax.`);
            }
            
            // Bear validates data structure with detailed logging
            console.log(`🔍 Bear inspecting pack data structure...`);
            
            if (!data) {
                throw new Error(`🐻 Bear error: Pack file ${pack.file} contains no data`);
            }
            
            if (typeof data !== 'object') {
                throw new Error(`🐻 Bear error: Pack file ${pack.file} should contain a JSON object, got ${typeof data}`);
            }
            
            // Check for scenarios array with detailed diagnostics
            console.log(`🔍 Bear checking for scenarios array...`);
            
            if (!data.scenarios) {
                console.error(`🐻 Bear structure error: No 'scenarios' property found in ${pack.file}`);
                console.log(`🔍 Bear found these properties instead:`, Object.keys(data));
                throw new Error(`Invalid pack structure: missing 'scenarios' property in ${pack.file}`);
            }
            
            if (!Array.isArray(data.scenarios)) {
                console.error(`🐻 Bear type error: 'scenarios' property is not an array in ${pack.file}, got:`, typeof data.scenarios);
                throw new Error(`Invalid pack structure: 'scenarios' must be an array in ${pack.file}`);
            }
            
            if (data.scenarios.length === 0) {
                console.warn(`🐻 Bear warning: Pack ${pack.file} contains empty scenarios array`);
                throw new Error(`Pack ${pack.file} contains no scenarios`);
            }
            
            console.log(`✅ Bear approved pack structure: ${data.scenarios.length} scenarios found in ${pack.file}`);
            
            // Optional: Log pack metadata if available
            if (data.packInfo) {
                console.log(`📋 Bear found pack info:`, {
                    name: data.packInfo.packName || 'Unknown',
                    id: data.packInfo.packId || 'Unknown',
                    version: data.version || 'Unknown'
                });
            }
            
            return data;
            
        } catch (error) {
            // Bear logs detailed error information
            console.error(`🐻 Bear failed to load pack ${pack?.id || 'unknown'}:`, error);
            
            const errorDetails = {
                packId: pack?.id || 'unknown',
                packName: pack?.name || 'unknown',
                packFile: pack?.file || 'unknown',
                errorMessage: error.message,
                errorType: error.constructor.name
            };
            
            this.logError(`Failed to load pack: ${pack?.id || 'unknown'}`, error, errorDetails);
            
            // Bear re-throws with context
            throw new Error(`🐻 Pack loading failed for ${pack?.id || 'unknown'}: ${error.message}`);
        }
    }

    /**
     * Process and validate scenarios from pack
     * 🐻 FORTIFIED WITH BEAR CLAWS - Bulletproof error handling
     */
    async processScenarios(rawScenarios) {
        const validScenarios = [];
        const errorLog = [];
        
        console.log(`🐻 Bear processing ${rawScenarios?.length || 0} raw scenarios...`);
        
        for (let i = 0; i < rawScenarios.length; i++) {
            const scenario = rawScenarios[i];
            
            try {
                // Basic validation with detailed logging
                if (!scenario || typeof scenario !== 'object') {
                    throw new Error(`Scenario ${i} is not a valid object: ${typeof scenario}`);
                }

                console.log(`🔍 Processing scenario ${i}: ${scenario.title || scenario.id || 'untitled'}`);

                // Create a fortified scenario with defaults
                const fortifiedScenario = this.fortifyScenario(scenario, i);
                
                // Add pack context with safety checks
                try {
                    fortifiedScenario.packId = this.currentPack?.id || 'unknown-pack';
                    fortifiedScenario.packName = this.currentPack?.name || 'Unknown Pack';
                } catch (packError) {
                    console.warn(`🐻 Bear growl: Pack context failed for scenario ${i}:`, packError);
                    fortifiedScenario.packId = 'fallback-pack';
                    fortifiedScenario.packName = 'Fallback Pack';
                }

                validScenarios.push(fortifiedScenario);
                console.log(`✅ Bear approved scenario ${i}: ${fortifiedScenario.title}`);
                
            } catch (error) {
                const errorDetails = {
                    index: i,
                    scenarioId: scenario?.id || 'unknown',
                    scenarioTitle: scenario?.title || 'unknown',
                    error: error.message,
                    scenario: scenario
                };
                
                errorLog.push(errorDetails);
                console.error(`🐻 Bear encountered obstacle at scenario ${i}:`, error);
                console.warn(`🐻 Bear says: Skipping broken scenario, continuing with ${rawScenarios.length - i - 1} remaining...`);
                
                this.logError(`Invalid scenario at index ${i}`, error, errorDetails);
                // Bear doesn't give up - continue with other scenarios
            }
        }

        // Log summary of bear's work
        console.log(`🐻 Bear summary: Processed ${validScenarios.length}/${rawScenarios.length} scenarios successfully`);
        if (errorLog.length > 0) {
            console.warn(`🐻 Bear encountered ${errorLog.length} obstacles but persevered:`, errorLog);
        }

        if (validScenarios.length === 0) {
            console.error(`🐻 Bear failed: No valid scenarios survived processing!`);
            throw new Error('No valid scenarios found in pack - all scenarios failed validation');
        }

        // Bear shuffles the deck for randomness
        const shuffledScenarios = this.shuffleArray(validScenarios);
        console.log(`🐻 Bear shuffled ${shuffledScenarios.length} scenarios for optimal gameplay`);
        
        return shuffledScenarios;
    }

    /**
     * 🐻 BEAR CLAWS METHOD - Fortify individual scenario with bulletproof defaults
     * This method takes a raw scenario and makes it bulletproof with proper validation and fallbacks
     */
    fortifyScenario(rawScenario, index) {
        console.log(`🛡️ Bear fortifying scenario ${index}...`);
        
        // Create a safe copy to avoid mutating original data
        const scenario = {};
        
        try {
            // Essential fields with bulletproof defaults
            scenario.id = this.safeString(rawScenario.id) || `scenario-${index}`;
            scenario.title = this.safeString(rawScenario.title) || `Untitled Scenario ${index + 1}`;
            scenario.text = this.safeString(rawScenario.text) || 'No scenario text provided.';
            scenario.claim = this.safeString(rawScenario.claim) || 'No claim provided.';
            
            // Critical game mechanics fields
            scenario.correctAnswer = this.validateCorrectAnswer(rawScenario.correctAnswer, scenario.id);
            scenario.answerWeights = this.validateAnswerWeights(rawScenario.answerWeights, scenario.id);
            
            // Optional but important fields
            scenario.reviewKeywords = this.validateReviewKeywords(rawScenario.reviewKeywords, scenario.id);
            scenario.analysis = this.validateAnalysis(rawScenario.analysis, scenario.id);
            scenario.wisdom = this.safeString(rawScenario.wisdom) || 'Consider the evidence and reasoning carefully.';
            
            // Preserve any additional fields that might exist
            Object.keys(rawScenario).forEach(key => {
                if (!scenario.hasOwnProperty(key)) {
                    try {
                        scenario[key] = rawScenario[key];
                    } catch (copyError) {
                        console.warn(`🐻 Bear growl: Could not copy field '${key}' for ${scenario.id}:`, copyError);
                    }
                }
            });
            
            console.log(`🛡️ Bear successfully fortified scenario: ${scenario.title}`);
            return scenario;
            
        } catch (fortifyError) {
            console.error(`🐻 Bear fortress breach while fortifying scenario ${index}:`, fortifyError);
            
            // Last resort - return a minimal viable scenario
            return {
                id: `fallback-scenario-${index}`,
                title: `Fallback Scenario ${index + 1}`,
                text: 'This scenario encountered processing errors but the bear persevered.',
                claim: 'The game must go on.',
                correctAnswer: 'balanced',
                answerWeights: { logic: 25, emotion: 25, balanced: 25, agenda: 25 },
                reviewKeywords: { logic: [], emotion: [], balanced: [], agenda: [] },
                analysis: {},
                wisdom: 'Sometimes the bear must make do with what it has.'
            };
        }
    }
    
    /**
     * 🐻 BEAR UTILITY METHODS - Safe data validation and defaults
     */
    safeString(value) {
        try {
            if (typeof value === 'string') return value;
            if (value !== null && value !== undefined) return String(value);
            return null;
        } catch {
            return null;
        }
    }
    
    validateCorrectAnswer(correctAnswer, scenarioId) {
        const validAnswers = ['logic', 'emotion', 'balanced', 'agenda'];
        
        try {
            if (validAnswers.includes(correctAnswer)) {
                return correctAnswer;
            }
            
            console.warn(`🐻 Bear says: Invalid correctAnswer '${correctAnswer}' for ${scenarioId}, defaulting to 'balanced'`);
            return 'balanced';
            
        } catch (error) {
            console.warn(`🐻 Bear says: correctAnswer validation failed for ${scenarioId}:`, error);
            return 'balanced';
        }
    }
    
    validateAnswerWeights(answerWeights, scenarioId) {
        const defaultWeights = { logic: 25, emotion: 25, balanced: 25, agenda: 25 };
        
        try {
            if (!answerWeights || typeof answerWeights !== 'object') {
                console.warn(`🐻 Bear says: Missing or invalid answerWeights for ${scenarioId}, using defaults`);
                return defaultWeights;
            }
            
            const weights = {};
            ['logic', 'emotion', 'balanced', 'agenda'].forEach(key => {
                try {
                    const value = answerWeights[key];
                    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
                        weights[key] = value;
                    } else {
                        console.warn(`🐻 Bear says: Invalid weight for '${key}' in ${scenarioId}, using default`);
                        weights[key] = 25;
                    }
                } catch (weightError) {
                    console.warn(`🐻 Bear says: Weight processing failed for '${key}' in ${scenarioId}:`, weightError);
                    weights[key] = 25;
                }
            });
            
            return weights;
            
        } catch (error) {
            console.warn(`🐻 Bear says: answerWeights validation failed for ${scenarioId}:`, error);
            return defaultWeights;
        }
    }
    
    validateReviewKeywords(reviewKeywords, scenarioId) {
        const defaultKeywords = { 
            logic: [], 
            emotion: [], 
            balanced: [], 
            agenda: [] 
        };
        
        try {
            if (!reviewKeywords || typeof reviewKeywords !== 'object') {
                console.log(`🐻 Bear adapting: No reviewKeywords for ${scenarioId}, using empty structure`);
                return defaultKeywords;
            }
            
            const keywords = {};
            ['logic', 'emotion', 'balanced', 'agenda'].forEach(key => {
                try {
                    const value = reviewKeywords[key];
                    
                    // 🐻 BEAR ADAPTIVE FORMAT HANDLING
                    if (Array.isArray(value)) {
                        // Format 1: Already an array - perfect!
                        keywords[key] = value;
                        console.log(`✅ Bear found array format for '${key}' in ${scenarioId}: ${value.length} items`);
                        
                    } else if (value && typeof value === 'object') {
                        // Format 2: Object with nested structure - try to extract
                        console.log(`🔄 Bear adapting object format for '${key}' in ${scenarioId}:`, value);
                        
                        if (Array.isArray(value.keywords)) {
                            keywords[key] = value.keywords;
                            console.log(`✅ Bear extracted ${value.keywords.length} keywords from nested structure`);
                        } else if (Array.isArray(value.items)) {
                            keywords[key] = value.items;
                            console.log(`✅ Bear extracted ${value.items.length} items from nested structure`);
                        } else if (Array.isArray(value.phrases)) {
                            // 🐻 NEW FORMAT: Array of objects with phrase + weight
                            // Extract phrases but PRESERVE weight data for timeline
                            keywords[key] = value.phrases.map(item => {
                                if (item && typeof item === 'object' && item.phrase) {
                                    return item.phrase; // Extract just the phrase text for compatibility
                                }
                                return item; // Fallback for non-object items
                            });
                            
                            // 🐻 PRESERVE WEIGHT DATA for timeline sin wave generation
                            keywords[key + '_weighted'] = value.phrases; // Store full weighted data
                            console.log(`✅ Bear extracted ${keywords[key].length} weighted phrases and preserved weight data for timeline`);
                        } else {
                            // Try to extract any array property
                            const arrayProps = Object.keys(value).filter(prop => Array.isArray(value[prop]));
                            if (arrayProps.length > 0) {
                                keywords[key] = value[arrayProps[0]];
                                console.log(`✅ Bear found array in '${arrayProps[0]}' property: ${keywords[key].length} items`);
                            } else {
                                keywords[key] = [];
                                console.log(`🔄 Bear adapted: Object format but no arrays found for '${key}', using empty array`);
                            }
                        }
                        
                    } else if (typeof value === 'string') {
                        // Format 3: String - maybe comma-separated?
                        if (value.includes(',')) {
                            keywords[key] = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                            console.log(`✅ Bear converted comma-separated string to ${keywords[key].length} keywords`);
                        } else if (value.length > 0) {
                            keywords[key] = [value];
                            console.log(`✅ Bear converted single string to 1-item array`);
                        } else {
                            keywords[key] = [];
                            console.log(`🔄 Bear adapted: Empty string for '${key}', using empty array`);
                        }
                        
                    } else {
                        // Format 4: Something else entirely
                        keywords[key] = [];
                        console.log(`🔄 Bear adapted: Unknown format (${typeof value}) for '${key}' in ${scenarioId}, using empty array`);
                    }
                    
                } catch (keywordError) {
                    console.warn(`🐻 Bear adaptation failed for '${key}' in ${scenarioId}:`, keywordError);
                    keywords[key] = [];
                }
            });
            
            return keywords;
            
        } catch (error) {
            console.warn(`🐻 Bear says: reviewKeywords validation failed for ${scenarioId}:`, error);
            return defaultKeywords;
        }
    }
    
    validateAnalysis(analysis, scenarioId) {
        try {
            if (analysis && typeof analysis === 'object') {
                return analysis;
            }
            
            console.warn(`🐻 Bear says: Missing or invalid analysis for ${scenarioId}, using empty object`);
            return {};
            
        } catch (error) {
            console.warn(`🐻 Bear says: analysis validation failed for ${scenarioId}:`, error);
            return {};
        }
    }

    /**
     * Get next scenario for gameplay
     */
    getNextScenario(completedScenarios = []) {
        const unusedScenarios = this.scenarios.filter(scenario => 
            !completedScenarios.includes(scenario.id)
        );

        if (unusedScenarios.length === 0) {
            return null; // Game complete
        }

        return unusedScenarios[0]; // Return first unused scenario
    }

    /**
     * Utility: Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Error logging
     */
    logError(message, error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message,
            error: error.message,
            context,
            loadAttempts: this.loadAttempts
        };
        
        this.errorLog.push(errorEntry);
        console.error(`[ScenarioManager] ${message}:`, error);
        
        // Keep log manageable
        if (this.errorLog.length > 20) {
            this.errorLog.shift();
        }
    }

    /**
     * Get current pack info
     */
    getCurrentPackInfo() {
        return {
            pack: this.currentPack,
            packInfo: this.packInfo,
            scenarioCount: this.scenarios.length,
            loadAttempts: this.loadAttempts
        };
    }

    /**
     * Reset for new session
     */
    reset() {
        this.currentPack = null;
        this.scenarios = [];
        this.usedScenarios = [];
        this.packInfo = null;
        this.loadAttempts = 0;
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.ScenarioManager = ScenarioManager;
}

// Module export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScenarioManager;
}