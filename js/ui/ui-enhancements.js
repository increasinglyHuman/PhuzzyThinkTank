// UI Enhancements - Button pulse and improved hint positioning

(function() {
    // Track if this is a new player
    function isNewPlayer() {
        return !localStorage.getItem('phuzzy_has_played');
    }
    
    // Mark that player has played
    function markPlayerAsReturning() {
        localStorage.setItem('phuzzy_has_played', 'true');
    }
    
    // Pulse the Investigate button for new players
    function pulseInvestigateButton() {
        if (!isNewPlayer()) return;
        
        // Wait for splash screen to be dismissed and scenario to load
        setTimeout(function() {
            const investigateBtn = document.getElementById('analysis-toggle-btn');
            if (investigateBtn && !investigateBtn.classList.contains('investigate-pulse')) {
                investigateBtn.classList.add('investigate-pulse');
                
                // Remove pulse after first click
                investigateBtn.addEventListener('click', function() {
                    investigateBtn.classList.remove('investigate-pulse');
                    markPlayerAsReturning();
                }, { once: true });
                
                // Also remove after 30 seconds if not clicked
                setTimeout(function() {
                    investigateBtn.classList.remove('investigate-pulse');
                }, 30000);
            }
        }, 7000); // 7 seconds after page load (gives time for splash + reading)
    }
    
    // Improved hint positioning
    function improveHintPositioning() {
        // Override the default hint display to use better positioning
        const originalHintDisplay = window.HintDisplay;
        
        window.HintDisplay = function() {
            const instance = new originalHintDisplay();
            const originalShow = instance.show;
            
            instance.show = function(icon, message) {
                // Call original show
                originalShow.call(this, icon, message);
                
                // Add overlay for honey pot hints
                if (!document.getElementById('hint-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.id = 'hint-overlay';
                    overlay.className = 'hint-overlay';
                    document.body.appendChild(overlay);
                    
                    // Click overlay to dismiss
                    overlay.addEventListener('click', function() {
                        instance.hideHint();
                        overlay.classList.remove('active');
                        setTimeout(function() {
                            overlay.remove();
                        }, 300);
                    });
                }
                
                // Position hint as floating modal
                if (this.hintContainer) {
                    this.hintContainer.classList.add('honey-pot-hint');
                    document.getElementById('hint-overlay').classList.add('active');
                }
            };
            
            const originalHide = instance.hideHint;
            instance.hideHint = function() {
                originalHide.call(this);
                const overlay = document.getElementById('hint-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                    setTimeout(function() {
                        overlay.remove();
                    }, 300);
                }
            };
            
            return instance;
        };
    }
    
    // Initialize enhancements when DOM is ready
    function initEnhancements() {
        pulseInvestigateButton();
        improveHintPositioning();
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancements);
    } else {
        initEnhancements();
    }
    
    // Also pulse when a new scenario loads
    window.addEventListener('scenario-loaded', function() {
        if (isNewPlayer()) {
            setTimeout(pulseInvestigateButton, 1000);
        }
    });
})();