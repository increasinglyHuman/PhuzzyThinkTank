// ===== CORE/HONEY-POT-MANAGER.JS =====
class HoneyPotManager {
    constructor(initialCount = 3) {
        this.initialCount = initialCount;
        this.reset();
    }
    
    reset() {
        this.available = this.initialCount;
        this.used = 0;
        this.earnedFromMicrogames = 0;
    }
    
    useHoneyPot(scenario) {
        if (this.available <= 0) {
            return {
                success: false,
                message: 'No honey pots left! Play microgames to earn more.'
            };
        }
        
        this.available--;
        this.used++;
        
        return {
            success: true,
            hint: this.generateHint(scenario),
            remaining: this.available
        };
    }
    
    generateHint(scenario) {
        // Don't use the correct answer to generate hints - that's cheating!
        // Instead, provide neutral guidance
        
        // Neutral honey-themed styling
        const neutralStyle = {
            icon: '🍯',
            color: 'rgba(251, 191, 36, 0.15)', // Warm honey yellow
            borderColor: 'rgba(251, 191, 36, 0.6)'
        };
        
        // Check if scenario has custom hint message
        if (scenario.hints && scenario.hints.hintMessage) {
            return {
                ...neutralStyle,
                message: scenario.hints.hintMessage,
                keywords: scenario.hints.keywords || []
            };
        }
        
        // Generic helpful messages that don't reveal the answer
        const genericHints = [
            'Pay attention to the language patterns and emotional tone throughout the message.',
            'Look for evidence quality - are claims supported with data or just opinions?',
            'Consider who benefits from this message and what they might want you to do.',
            'Notice if multiple perspectives are acknowledged or if it\'s one-sided.',
            'Check for urgency tactics, fear appeals, or pressure to act quickly.',
            'Examine whether the source is credible and if opposing views are fairly represented.'
        ];
        
        // Pick a random generic hint
        const randomHint = genericHints[Math.floor(Math.random() * genericHints.length)];
        
        return {
            ...neutralStyle,
            message: randomHint,
            keywords: [] // Don't highlight specific keywords that might give away the answer
        };
    }
    
    add(amount) {
        this.available += amount;
        this.earnedFromMicrogames += amount;
        return this.available;
    }
    
    getAvailable() {
        return this.available;
    }
    
    getUsedCount() {
        return this.used;
    }
    
    getStats() {
        return {
            available: this.available,
            used: this.used,
            earnedFromMicrogames: this.earnedFromMicrogames,
            totalEarned: this.initialCount + this.earnedFromMicrogames
        };
    }
}
// Export for global usage
if (typeof window !== 'undefined') {
    window.HoneyPotManager = HoneyPotManager;
}
