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
    async loadPackData(pack) {
        try {
            console.log(`📂 Loading pack file: ${pack.file}`);
            
            const response = await fetch(pack.file);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate pack structure
            if (!data || !data.scenarios || !Array.isArray(data.scenarios)) {
                throw new Error('Invalid pack structure: missing scenarios array');
            }

            if (data.scenarios.length === 0) {
                throw new Error('Pack contains no scenarios');
            }

            return data;
            
        } catch (error) {
            this.logError(`Failed to load pack: ${pack.id}`, error);
            throw new Error(`Pack loading failed: ${error.message}`);
        }
    }

    /**
     * Process and validate scenarios from pack
     */
    async processScenarios(rawScenarios) {
        const validScenarios = [];
        
        for (let i = 0; i < rawScenarios.length; i++) {
            const scenario = rawScenarios[i];
            
            try {
                // Basic validation
                if (!scenario || typeof scenario !== 'object') {
                    throw new Error('Invalid scenario object');
                }

                if (!scenario.id) {
                    scenario.id = `scenario-${i}`;
                }

                // Add pack context
                scenario.packId = this.currentPack?.id;
                scenario.packName = this.currentPack?.name;

                validScenarios.push(scenario);
                
            } catch (error) {
                this.logError(`Invalid scenario at index ${i}`, error, { scenario });
                // Continue with other scenarios
            }
        }

        if (validScenarios.length === 0) {
            throw new Error('No valid scenarios found in pack');
        }

        // Shuffle scenarios for random order
        return this.shuffleArray(validScenarios);
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