// Enhanced Scenario Pack Configuration with Tags and Promotion Support
window.SCENARIO_PACKS = {
    // Original pack - v1 format (retiring but keeping for backwards compatibility)
    'original-v1': {
        id: 'original-v1',
        name: 'Classic Phuzzy Scenarios',
        description: 'The original 10 scenarios',
        file: './data/scenarios.json',
        version: '1.0.0',
        enabled: false, // Retiring this one
        scenarios: 10,
        tags: ['classic', 'original']
    },
    
    // Original pack updated to v2 format
    'original-v2': {
        id: 'original-v2',
        name: 'Classic Scenarios Enhanced',
        description: 'Original scenarios updated with v2 features',
        file: './data/scenarios-v2-repaired.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['classic', 'balanced', 'educational']
    },
    
    // Pack 001 - Fun & Whimsical (includes caffeinated sloth, vegan vampire, caveman)
    'pack-001': {
        id: 'pack-001',
        name: 'Whimsical Digital Tales',
        description: 'Fun scenarios with caffeinated sloths, vegan vampires, and smartphone-addicted cavemen',
        file: './data/scenario-packs/scenario-generated-001.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['fun', 'whimsical', 'kid-friendly', 'animals', 'humor']
    },
    
    // Pack 002 - Digital Dilemmas  
    'pack-002': {
        id: 'pack-002',
        name: 'Modern Digital Dilemmas',
        description: 'Sophisticated scenarios featuring winking admissions and statistical whiplash',
        file: './data/scenario-packs/scenario-generated-002.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['digital', 'modern', 'critical-thinking', 'educational', 'tech']
    },
    
    // Pack 003 - Digital Life challenges
    'pack-003': {
        id: 'pack-003',
        name: 'Digital Life & Society',
        description: 'Modern challenges in technology, education, and social dynamics',
        file: './data/scenario-packs/scenario-generated-003.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['digital', 'social', 'educational', 'modern', 'balanced']
    },
    
    // Pack 004 - Nature and culture (includes philosophical french fries)
    'pack-004': {
        id: 'pack-004',
        name: 'Nature, Culture & Identity',
        description: 'Animal parables, philosophical french fries, and cultural commentary',
        file: './data/scenario-packs/scenario-generated-004.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['nature', 'animals', 'fun', 'kid-friendly', 'philosophical', 'whimsical']
    },
    
    // Pack 005 - Community life (includes Roomba union)
    'pack-005': {
        id: 'pack-005',
        name: 'Community & Everyday Life',
        description: 'Workplace dynamics, Roomba unions, and lifestyle choices',
        file: './data/scenario-packs/scenario-generated-005.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['community', 'workplace', 'fun', 'social', 'humor', 'light-hearted']
    },
    
    // Pack 006 - Sci-Fi/LitRPG
    'pack-006': {
        id: 'pack-006',
        name: 'Virtual Worlds & Digital Realms',
        description: 'Science fiction and LitRPG scenarios exploring virtual economies, AI consciousness, and gaming culture',
        file: './data/scenario-packs/scenario-generated-006.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['sci-fi', 'gaming', 'tech', 'educational', 'complex']
    }
};

// Enhanced Configuration for pack selection with promotion support
window.PACK_SELECTION_CONFIG = {
    // Selection mode: 'random', 'sequential', 'user-choice', 'promoted', 'weighted'
    mode: 'config',
    
    // For 'config' mode, specify which pack to use
    defaultPack: 'pack-005',
    
    // For 'sequential' mode, define the order
    sequentialOrder: ['original-v2', 'pack-001', 'pack-002', 'pack-003', 'pack-004', 'pack-005', 'pack-006'],
    
    // Allow mixing scenarios from multiple packs
    allowMixing: false,
    
    // Store last used pack in localStorage
    rememberLastPack: true,
    
    // Use promotion system
    usePromotions: true,
    
    // Promotion config file
    promotionConfigFile: './data/pack-promotions.json'
};

// Load promotion configuration
window.loadPromotionConfig = async function() {
    try {
        const response = await fetch(window.PACK_SELECTION_CONFIG.promotionConfigFile);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Could not load promotion config:', error);
    }
    return null;
};

// Check if a pack matches promotion criteria
window.packMatchesPromotion = function(pack, promotion) {
    if (!pack.tags) return false;
    
    // Check required tags
    if (promotion.requiredTags && promotion.requiredTags.length > 0) {
        const hasAllRequired = promotion.requiredTags.every(tag => pack.tags.includes(tag));
        if (!hasAllRequired) return false;
    }
    
    // Check excluded tags
    if (promotion.excludeTags && promotion.excludeTags.length > 0) {
        const hasExcluded = promotion.excludeTags.some(tag => pack.tags.includes(tag));
        if (hasExcluded) return false;
    }
    
    return true;
};

// Get active promotions for current date
window.getActivePromotions = function(promotionConfig) {
    if (!promotionConfig || !promotionConfig.promotions) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return promotionConfig.promotions
        .filter(promo => {
            if (!promo.active) return false;
            
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            endDate.setHours(23, 59, 59, 999);
            
            return today >= startDate && today <= endDate;
        })
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

// Calculate pack weights based on promotions
window.calculatePackWeights = function(availablePacks, promotionConfig) {
    const weights = {};
    
    // Start with default weights
    const defaultWeights = promotionConfig?.defaultWeights || {};
    availablePacks.forEach(pack => {
        weights[pack.id] = defaultWeights[pack.id] || 1;
    });
    
    // Apply promotion weights
    const activePromotions = window.getActivePromotions(promotionConfig);
    
    activePromotions.forEach(promotion => {
        // Apply specific pack weights from promotion
        if (promotion.packWeights) {
            Object.entries(promotion.packWeights).forEach(([packId, weight]) => {
                if (weights[packId] !== undefined) {
                    weights[packId] *= weight;
                }
            });
        }
        
        // Apply tag-based weight boosts
        availablePacks.forEach(pack => {
            if (window.packMatchesPromotion(pack, promotion)) {
                // Boost weight for matching packs
                weights[pack.id] *= 2;
                
                // Extra boost for optional tags
                if (promotion.optionalTags) {
                    const optionalMatches = promotion.optionalTags.filter(tag => 
                        pack.tags && pack.tags.includes(tag)
                    ).length;
                    weights[pack.id] *= (1 + optionalMatches * 0.5);
                }
            }
        });
    });
    
    return weights;
};

// Enhanced pack selection with promotion support
window.selectScenarioPack = async function(preferredPackId = null) {
    const availablePacks = window.getAvailableScenarioPacks();
    
    if (availablePacks.length === 0) {
        console.error('No scenario packs available!');
        return null;
    }
    
    // If a specific pack is requested
    if (preferredPackId && window.SCENARIO_PACKS[preferredPackId] && window.SCENARIO_PACKS[preferredPackId].enabled) {
        return window.SCENARIO_PACKS[preferredPackId];
    }
    
    const config = window.PACK_SELECTION_CONFIG;
    
    // Check for remembered pack
    if (config.rememberLastPack && config.mode !== 'promoted') {
        const lastPackId = localStorage.getItem('phuzzy_last_pack');
        if (lastPackId && window.SCENARIO_PACKS[lastPackId] && window.SCENARIO_PACKS[lastPackId].enabled) {
            console.log('Using last pack:', lastPackId);
            return window.SCENARIO_PACKS[lastPackId];
        }
    }
    
    switch (config.mode) {
        case 'promoted':
        case 'weighted':
            // Load promotion config
            let promotionConfig = null;
            if (config.usePromotions) {
                promotionConfig = await window.loadPromotionConfig();
            }
            
            // Calculate weights
            const weights = window.calculatePackWeights(availablePacks, promotionConfig);
            
            // Log active promotions
            if (promotionConfig) {
                const activePromos = window.getActivePromotions(promotionConfig);
                if (activePromos.length > 0) {
                    console.log('Active promotions:', activePromos.map(p => p.name).join(', '));
                }
            }
            
            // Weighted random selection
            const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            
            for (const pack of availablePacks) {
                random -= weights[pack.id];
                if (random <= 0) {
                    console.log(`Selected pack: ${pack.id} (weight: ${weights[pack.id]})`);
                    return pack;
                }
            }
            
            // Fallback (shouldn't reach here)
            return availablePacks[0];
            
        case 'random':
            const randomIndex = Math.floor(Math.random() * availablePacks.length);
            return availablePacks[randomIndex];
            
        case 'sequential':
            // [Previous sequential logic remains the same]
            let currentIndex = parseInt(localStorage.getItem('phuzzy_pack_index') || '0');
            const sequentialPacks = config.sequentialOrder
                .map(id => window.SCENARIO_PACKS[id])
                .filter(pack => pack && pack.enabled);
            
            if (sequentialPacks.length === 0) return availablePacks[0];
            
            if (currentIndex >= sequentialPacks.length) {
                currentIndex = 0;
            }
            
            const seqPack = sequentialPacks[currentIndex];
            localStorage.setItem('phuzzy_pack_index', String((currentIndex + 1) % sequentialPacks.length));
            return seqPack;
            
        case 'config':
            const configPack = window.SCENARIO_PACKS[config.defaultPack];
            if (configPack && configPack.enabled) {
                return configPack;
            }
            return availablePacks[0];
            
        default:
            return availablePacks[0];
    }
};

// Helper function to get available packs
window.getAvailableScenarioPacks = function() {
    return Object.values(window.SCENARIO_PACKS).filter(pack => pack.enabled);
};

// Function to remember selected pack
window.rememberSelectedPack = function(packId) {
    if (window.PACK_SELECTION_CONFIG.rememberLastPack) {
        localStorage.setItem('phuzzy_last_pack', packId);
    }
};

// Utility function to preview what packs would be selected with current promotions
window.previewPackSelection = async function(iterations = 100) {
    const counts = {};
    const originalMode = window.PACK_SELECTION_CONFIG.mode;
    
    // Force promoted mode for testing
    window.PACK_SELECTION_CONFIG.mode = 'promoted';
    
    for (let i = 0; i < iterations; i++) {
        const pack = await window.selectScenarioPack();
        counts[pack.id] = (counts[pack.id] || 0) + 1;
    }
    
    // Restore original mode
    window.PACK_SELECTION_CONFIG.mode = originalMode;
    
    console.log('Pack selection preview (100 iterations):');
    Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([packId, count]) => {
            const pack = window.SCENARIO_PACKS[packId];
            console.log(`${pack.name}: ${count}% (tags: ${pack.tags?.join(', ') || 'none'})`);
        });
};