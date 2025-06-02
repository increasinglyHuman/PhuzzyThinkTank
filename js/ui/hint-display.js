// Hint Display
function HintDisplay() {
    this.hintContainer = null;
    
    this.showHint = function(hintText) {
        if (!this.hintContainer) {
            this.hintContainer = document.createElement("div");
            this.hintContainer.className = "hint-container";
            document.querySelector(".scenario-box").appendChild(this.hintContainer);
        }
        
        this.hintContainer.innerHTML = '<div class="hint">' + hintText + '</div>';
        this.hintContainer.classList.add("slide-in");
    };
    
    this.hideHint = function() {
        if (this.hintContainer) {
            this.hintContainer.innerHTML = "";
            this.hintContainer.classList.remove("slide-in");
        }
    };

    this.show = function(icon, message) {
        // Handle both old style (single param) and new style (icon + message)
        if (message) {
            var hintContent = '<span class="hint-icon">' + icon + '</span><span class="hint-message">' + message + '</span>';
            this.showHint(hintContent);
        } else {
            this.showHint(icon); // fallback for single parameter
        }
    };
    
    this.showError = function(errorText) {
        this.showHint("❌ " + errorText);
    };
}

// Export for global usage
if (typeof window !== 'undefined') {
    window.HintDisplay = HintDisplay;
}
