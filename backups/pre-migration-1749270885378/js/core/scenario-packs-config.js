// Scenario Pack Configuration
window.SCENARIO_PACKS = {
    // Original pack - v1 format (retiring but keeping for backwards compatibility)
    'original-v1': {
        id: 'original-v1',
        name: 'Classic Phuzzy Scenarios',
        description: 'The original 10 scenarios',
        file: './data/scenarios.json',
        version: '1.0.0',
        enabled: false, // Retiring this one
        scenarios: 10
    },
    
    // Original pack updated to v2 format
    'original-v2': {
        id: 'original-v2',
        name: 'Classic Scenarios Enhanced',
        description: 'Original scenarios updated with v2 features',
        file: './data/scenarios-v2-repaired.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // First AI-generated pack
    'pack-001': {
        id: 'pack-001',
        name: 'Digital Age Dilemmas',
        description: 'First AI-generated scenario pack',
        file: './data/scenario-generated-001.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // Pack 002 - just created
    'pack-002': {
        id: 'pack-002',
        name: 'Modern Digital Dilemmas',
        description: 'Sophisticated scenarios featuring winking admissions and statistical whiplash',
        file: './data/scenario-generated-002.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // Complete collection (if available)
    'complete': {
        id: 'complete',
        name: 'Complete Collection',
        description: 'All available scenarios',
        file: './data/scenario-generated-complete.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 30
    },
    
    // Pack 003 - Digital Life challenges
    'pack-003': {
        id: 'pack-003',
        name: 'Digital Life & Society',
        description: 'Modern challenges in technology, education, and social dynamics',
        file: './data/scenario-generated-003.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // Pack 004 - Nature and culture
    'pack-004': {
        id: 'pack-004',
        name: 'Nature, Culture & Identity',
        description: 'Animal parables, sci-fi fandoms, and cultural commentary',
        file: './data/scenario-generated-004.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // Pack 005 - Community life
    'pack-005': {
        id: 'pack-005',
        name: 'Community & Everyday Life',
        description: 'Workplace dynamics, local communities, and lifestyle choices',
        file: './data/scenario-generated-005.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    },
    
    // Pack 006 - Sci-Fi/LitRPG
    'pack-006': {
        id: 'pack-006',
        name: 'Virtual Worlds & Digital Realms',
        description: 'Science fiction and LitRPG scenarios exploring virtual economies, AI consciousness, and gaming culture',
        file: './data/scenario-generated-006.json',
        version: '2.0.0',
        enabled: true,
        scenarios: 10
    }
};

// Configuration for pack selection
window.PACK_SELECTION_CONFIG = {
    // Selection mode: 'random', 'sequential', 'user-choice', 'config'
    mode: 'config',
    
    // For 'config' mode, specify which pack to use
    defaultPack: 'pack-002',
    
    // For 'sequential' mode, define the order
    sequentialOrder: ['original-v2', 'pack-001', 'pack-002', 'pack-003', 'pack-004', 'pack-005', 'pack-006'],
    
    // Allow mixing scenarios from multiple packs
    allowMixing: false,
    
    // Store last used pack in localStorage
    rememberLastPack: true
};

// Helper function to get available packs
window.getAvailableScenarioPacks = function() {
    return Object.values(window.SCENARIO_PACKS).filter(pack => pack.enabled);
};

// Helper function to select a pack based on config
window.selectScenarioPack = function(preferredPackId = null) {
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
    if (config.rememberLastPack) {
        const lastPackId = localStorage.getItem('phuzzy_last_pack');
        if (lastPackId && window.SCENARIO_PACKS[lastPackId] && window.SCENARIO_PACKS[lastPackId].enabled) {
            console.log('Using last pack:', lastPackId);
            return window.SCENARIO_PACKS[lastPackId];
        }
    }
    
    switch (config.mode) {
        case 'random':
            const randomIndex = Math.floor(Math.random() * availablePacks.length);
            const selectedPack = availablePacks[randomIndex];
            console.log('Randomly selected pack:', selectedPack.id);
            return selectedPack;
            
        case 'sequential':
            // Get current index from localStorage
            let currentIndex = parseInt(localStorage.getItem('phuzzy_pack_index') || '0');
            const sequentialPacks = config.sequentialOrder
                .map(id => window.SCENARIO_PACKS[id])
                .filter(pack => pack && pack.enabled);
            
            if (sequentialPacks.length === 0) return availablePacks[0];
            
            if (currentIndex >= sequentialPacks.length) {
                currentIndex = 0;
            }
            
            const seqPack = sequentialPacks[currentIndex];
            // Update index for next time
            localStorage.setItem('phuzzy_pack_index', String((currentIndex + 1) % sequentialPacks.length));
            console.log('Sequential pack:', seqPack.id);
            return seqPack;
            
        case 'config':
            const configPack = window.SCENARIO_PACKS[config.defaultPack];
            if (configPack && configPack.enabled) {
                console.log('Config specified pack:', configPack.id);
                return configPack;
            }
            // Fallback to first available
            console.warn('Config pack not available, using first available');
            return availablePacks[0];
            
        case 'user-choice':
            // This would require UI implementation
            console.log('User choice mode - defaulting to first available');
            return availablePacks[0];
            
        default:
            return availablePacks[0];
    }
};

// Function to remember selected pack
window.rememberSelectedPack = function(packId) {
    if (window.PACK_SELECTION_CONFIG.rememberLastPack) {
        localStorage.setItem('phuzzy_last_pack', packId);
    }
};