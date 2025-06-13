/**
 * 🎯 Phuzzy Scenario Pack Configuration  
 * Clean single-pack system with promotion-based selection
 * 
 * Note: Each game session loads exactly ONE pack (10 scenarios)
 * Pack selection is handled by scenario-manager.js using pack-promotions.json
 */

// Available scenario packs
window.SCENARIO_PACKS = {
    // Core packs - properly numbered and organized
    'pack-000': {
        id: 'pack-000',
        name: 'Classic Scenarios Enhanced',
        description: 'Original scenarios updated with v3 weighted keywords',
        file: './data/scenario-packs/pack-000-weighted-test.json',
        version: '3.0.0-weighted',
        enabled: false, // 🐻 Bear temporarily disabled for wacky scenarios test
        scenarios: 10,
        tags: ['classic', 'foundational', 'weighted-keywords']
    },
    
    'pack-000-wacky': {
        id: 'pack-000-wacky',
        name: 'Super Silly Critical Thinking Adventures',
        description: 'Hilarious scenarios that teach kids to spot wacky manipulation through absurd but educational situations',
        file: './new-scenarios/scenariopack-000/wacky-scenarios-000.json',
        version: '2.0.0',
        enabled: true, // 🐻 Bear-imported wacky scenarios active
        scenarios: 10,
        tags: ['silly', 'kids', 'wacky', 'bear-imported', 'kid-friendly', 'fun', 'whimsical'], // 🐻 Added promotion tags
        bearImported: true // 🐻 Bear flag for special handling
    },
    
    'pack-001': {
        id: 'pack-001',
        name: 'Digital Age Dilemmas',
        description: 'Modern technology and social media scenarios',
        file: './data/scenario-packs/scenario-generated-001.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['technology', 'social-media', 'modern']
    },
    
    'pack-002': {
        id: 'pack-002',
        name: 'Media & Information',
        description: 'News, statistics, and information literacy',
        file: './data/scenario-packs/scenario-generated-002.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['media', 'statistics', 'news']
    },
    
    'pack-003': {
        id: 'pack-003',
        name: 'Society & Culture',
        description: 'Cultural debates and social issues',
        file: './data/scenario-packs/scenario-generated-003.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['culture', 'society', 'debates']
    },
    
    'pack-004': {
        id: 'pack-004',
        name: 'Nature & Animals',
        description: 'Animal behavior and nature-based scenarios',
        file: './data/scenario-packs/scenario-generated-004.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['animals', 'nature', 'kid-friendly', 'fun']
    },
    
    'pack-005': {
        id: 'pack-005',
        name: 'Community Life',
        description: 'Workplace, school, and community scenarios',
        file: './data/scenario-packs/pack-005-aggregate-test.json',
        version: '3.0.0-weighted',
        enabled: true,
        scenarios: 10,
        tags: ['community', 'workplace', 'kid-friendly', 'whimsical', 'weighted-keywords']
    },
    
    'pack-006': {
        id: 'pack-006',
        name: 'Science & Technology',
        description: 'Scientific debates and tech innovation',
        file: './data/scenario-packs/scenario-generated-006.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['science', 'technology', 'innovation']
    },
    
    'pack-007': {
        id: 'pack-007',
        name: 'Virtual Worlds',
        description: 'Gaming, virtual reality, and digital spaces',
        file: './data/scenario-packs/scenario-generated-007.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10,
        tags: ['gaming', 'virtual', 'digital']
    }
};

// Legacy pack mapping for backward compatibility
// Maps old pack IDs to new standardized IDs
window.LEGACY_PACK_MAPPING = {
    'original-v1': 'pack-000',
    'original-v2': 'pack-000', 
    'complete': null,  // No longer supported - was multi-pack
};

/**
 * Get pack by ID with legacy support
 */
window.getPackById = function(packId) {
    // Check for direct match
    if (window.SCENARIO_PACKS[packId]) {
        return window.SCENARIO_PACKS[packId];
    }
    
    // Check legacy mapping
    if (window.LEGACY_PACK_MAPPING[packId]) {
        const newId = window.LEGACY_PACK_MAPPING[packId];
        return newId ? window.SCENARIO_PACKS[newId] : null;
    }
    
    return null;
};

/**
 * Get all enabled packs
 */
window.getAvailableScenarioPacks = function() {
    return Object.values(window.SCENARIO_PACKS).filter(pack => pack.enabled);
};

/**
 * Get packs by tags (for promotion filtering)
 */
window.getPacksByTags = function(requiredTags = [], optionalTags = [], excludeTags = []) {
    return Object.values(window.SCENARIO_PACKS).filter(pack => {
        if (!pack.enabled) return false;
        
        const packTags = pack.tags || [];
        
        // Must have all required tags
        if (requiredTags.length > 0) {
            const hasAllRequired = requiredTags.every(tag => packTags.includes(tag));
            if (!hasAllRequired) return false;
        }
        
        // Must not have any excluded tags
        if (excludeTags.length > 0) {
            const hasExcluded = excludeTags.some(tag => packTags.includes(tag));
            if (hasExcluded) return false;
        }
        
        return true;
    });
};

// Note: Pack selection logic is now handled by scenario-manager.js
// This file only defines available packs - no selection logic here