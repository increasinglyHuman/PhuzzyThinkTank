// ===== CORE/SCENARIO-MANAGER.JS =====
class ScenarioManager {
    constructor(config) {
        this.apiEndpoint = config.apiEndpoint;
        this.scenarios = [];
        this.loadedScenarios = new Map();
        this.fallacies = new Map();
    }
    
    async loadFallacies() {
        try {
            const response = await fetch('./data/logical-fallacies.json');
            const data = await response.json();
            
            // Store fallacies by ID for easy lookup
            Object.keys(data.fallacies).forEach(fallacyId => {
                this.fallacies.set(fallacyId, data.fallacies[fallacyId]);
            });
            
            console.log('Loaded', this.fallacies.size, 'logical fallacies');
            return this.fallacies;
        } catch (error) {
            console.error('Failed to load logical fallacies:', error);
            return new Map();
        }
    }
    
    enrichScenarioWithFallacies(scenario) {
        // If scenario has logical fallacies, enrich with full definitions
        if (scenario.logicalFallacies && Array.isArray(scenario.logicalFallacies)) {
            scenario.logicalFallacies = scenario.logicalFallacies.map(fallacyRef => {
                const fullFallacy = this.fallacies.get(fallacyRef.fallacyId);
                if (fullFallacy) {
                    return {
                        ...fallacyRef,
                        name: fullFallacy.name,
                        shortName: fullFallacy.shortName,
                        definition: fullFallacy.definition,
                        category: fullFallacy.category,
                        icon: fullFallacy.icon,
                        learningTip: fullFallacy.learningTip
                    };
                } else {
                    console.warn('Unknown fallacy ID:', fallacyRef.fallacyId);
                    return fallacyRef;
                }
            });
        }
        return scenario;
    }
    
    async loadScenarios(count = 10) {
        try {
            // Load both scenarios and fallacies in parallel
            const [scenariosResponse, fallaciesLoaded] = await Promise.all([
                fetch('./data/scenarios.json'),
                this.loadFallacies()
            ]);
            
            const data = await scenariosResponse.json();
            
            // Shuffle and select scenarios
            const shuffled = this.shuffleArray([...data.scenarios]);
            this.scenarios = shuffled.slice(0, count);
            
            // Enrich scenarios with fallacy data
            this.scenarios = this.scenarios.map(scenario => this.enrichScenarioWithFallacies(scenario));
            
            // Pre-process scenarios
            this.scenarios.forEach(scenario => {
                this.loadedScenarios.set(scenario.id, scenario);
            });
            
            return this.scenarios;
        } catch (error) {
            console.error('Failed to load scenarios:', error);
            // Fallback to embedded scenarios if needed
            return this.getEmbeddedScenarios(count);
        }
    }
    
    getNextScenario(completedIds) {
        return this.scenarios.find(s => !completedIds.includes(s.id));
    }
    
    getScenarioById(id) {
        return this.loadedScenarios.get(id);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Fallback embedded scenarios (subset)
    getEmbeddedScenarios(count) {
        // Would include minimal scenarios for offline
        return [];
    }
}

// Export for global usage
if (typeof window !== 'undefined') {
    window.ScenarioManager = ScenarioManager;
}
