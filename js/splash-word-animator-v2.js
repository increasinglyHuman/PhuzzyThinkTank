// 🌱 Enhanced Word-by-Word Animator for Splash Screen - Simplified Version
(function() {
    'use strict';
    
    window.EnhancedSplashAnimator = {
        // Initialize the enhanced animations
        init: function() {
            const splashScreen = document.getElementById('splash-screen');
            if (!splashScreen) return;
            
            // Start the animation sequence after splash entrance
            setTimeout(() => {
                this.animateAllInstructions();
            }, 1200);
        },
        
        // Animate all instructions in sequence
        animateAllInstructions: function() {
            const instructions = document.querySelectorAll('.instruction-item');
            let currentIndex = 0;
            
            const animateNext = () => {
                if (currentIndex < instructions.length) {
                    this.animateInstruction(instructions[currentIndex], () => {
                        currentIndex++;
                        setTimeout(animateNext, 800); // Pause between instructions
                    });
                } else {
                    // Enable play button
                    this.enablePlayButton();
                }
            };
            
            animateNext();
        },
        
        // Animate a single instruction
        animateInstruction: function(item, callback) {
            if (!item) return;
            
            const textElement = item.querySelector('.instruction-text');
            const iconElement = item.querySelector('.instruction-icon');
            const originalText = textElement.textContent;
            const words = originalText.split(' ');
            
            // Clear text
            textElement.innerHTML = '';
            
            // Animate icon
            iconElement.classList.add('icon-pulse');
            
            // Create all word spans at once
            const wordSpans = words.map((word, index) => {
                const span = document.createElement('span');
                span.className = 'word-animate';
                span.style.animationDelay = (index * 200) + 'ms';
                span.textContent = word;
                
                // Special styling for key words
                if (word.toUpperCase() === 'INVESTIGATE' || 
                    word.toUpperCase() === 'RIZ' ||
                    word.toLowerCase() === 'carefully') {
                    span.classList.add('word-key');
                }
                
                return span;
            });
            
            // Add all spans with proper spacing
            wordSpans.forEach((span, index) => {
                textElement.appendChild(span);
                if (index < wordSpans.length - 1) {
                    textElement.appendChild(document.createTextNode(' '));
                }
            });
            
            // Callback after last word animation
            const totalTime = words.length * 200 + 600;
            setTimeout(callback, totalTime);
        },
        
        // Enable play button
        enablePlayButton: function() {
            const playButton = document.getElementById('play-now-button');
            const bear = document.querySelector('.splash-bear');
            
            // Make bear celebrate
            if (bear) {
                bear.style.animation = 'bounce 0.5s ease';
            }
            
            // Enable button
            setTimeout(() => {
                playButton.disabled = false;
                playButton.classList.add('button-ready');
            }, 500);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.EnhancedSplashAnimator.init();
        });
    } else {
        window.EnhancedSplashAnimator.init();
    }
})();