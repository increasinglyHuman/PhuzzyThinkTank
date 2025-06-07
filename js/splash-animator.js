// Splash Screen Animator - Making Instructions Unmissable
(function() {
    'use strict';
    
    window.SplashAnimator = {
        // Highlight key words for better readability
        highlightKeyWords: function() {
            const highlights = {
                0: ['story', 'carefully'],
                1: ['Investigate'],
                2: ['Answer'],
                3: ['Best', 'RIZ'],
                4: ['Honey pots', 'hints']
            };
            
            document.querySelectorAll('.instruction-item').forEach(function(item, index) {
                const textSpan = item.querySelector('.instruction-text');
                if (!textSpan || !highlights[index]) return;
                
                let text = textSpan.textContent;
                highlights[index].forEach(function(word) {
                    text = text.replace(
                        new RegExp('\\b' + word + '\\b', 'gi'),
                        '<span class="instruction-highlight">' + word + '</span>'
                    );
                });
                textSpan.innerHTML = text;
            });
        },
        
        // Start the animation sequence
        startAnimation: function() {
            const instructionsContainer = document.querySelector('.splash-instructions');
            const playButton = document.getElementById('play-now-button');
            const splashBear = document.querySelector('.splash-bear');
            
            // Add animate class to trigger CSS animations
            setTimeout(function() {
                instructionsContainer.classList.add('animate');
                
                // Make bear react to each instruction
                const bearReactions = [200, 400, 600, 800, 1000];
                bearReactions.forEach(function(delay) {
                    setTimeout(function() {
                        splashBear.classList.add('reacting');
                        setTimeout(function() {
                            splashBear.classList.remove('reacting');
                        }, 500);
                    }, delay);
                });
                
                // Enable play button after last animation
                setTimeout(function() {
                    playButton.disabled = false;
                    playButton.textContent = '✨ Play Now ✨';
                    
                    // Add a subtle bounce to draw attention
                    playButton.style.animation = 'bounce 0.5s ease';
                    setTimeout(function() {
                        playButton.style.animation = '';
                    }, 500);
                }, 1800);
            }, 500);
        },
        
        // Alternative: Word-by-word reveal
        wordByWordReveal: function(elementIndex, callback) {
            const item = document.querySelectorAll('.instruction-item')[elementIndex];
            if (!item) return;
            
            const textSpan = item.querySelector('.instruction-text');
            const originalText = textSpan.textContent;
            const words = originalText.split(' ');
            
            textSpan.textContent = '';
            textSpan.style.visibility = 'visible';
            
            words.forEach(function(word, index) {
                setTimeout(function() {
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = word + ' ';
                    wordSpan.style.opacity = '0';
                    wordSpan.style.display = 'inline-block';
                    wordSpan.style.transform = 'translateY(20px)';
                    wordSpan.style.transition = 'all 0.3s ease';
                    
                    textSpan.appendChild(wordSpan);
                    
                    setTimeout(function() {
                        wordSpan.style.opacity = '1';
                        wordSpan.style.transform = 'translateY(0)';
                    }, 50);
                    
                    // Callback on last word
                    if (index === words.length - 1 && callback) {
                        setTimeout(callback, 300);
                    }
                }, index * 100);
            });
        },
        
        // Initialize based on preference
        init: function(useWordByWord) {
            const splashScreen = document.getElementById('splash-screen');
            if (!splashScreen) return;
            
            // Apply highlights first
            this.highlightKeyWords();
            
            if (useWordByWord) {
                // Sequential word-by-word reveal
                let currentIndex = 0;
                const revealNext = function() {
                    if (currentIndex < 5) {
                        window.SplashAnimator.wordByWordReveal(currentIndex, function() {
                            currentIndex++;
                            setTimeout(revealNext, 200);
                        });
                    } else {
                        // Enable play button
                        const playButton = document.getElementById('play-now-button');
                        playButton.disabled = false;
                        playButton.textContent = '✨ Play Now ✨';
                    }
                };
                
                setTimeout(revealNext, 800);
            } else {
                // Use CSS animations
                this.startAnimation();
            }
        },
        
        // Fun alternative: Randomize instruction order
        shuffleInstructions: function() {
            const container = document.querySelector('.splash-instructions');
            const items = Array.from(container.children);
            
            // Fisher-Yates shuffle
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                container.appendChild(items[j]);
            }
        }
    };
})();