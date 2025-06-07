// 🌱 Enhanced Word-by-Word Animator for Splash Screen
(function() {
    'use strict';
    
    window.EnhancedSplashAnimator = {
        // Configuration for different animation styles
        animationStyles: {
            spectacular: 'wordSpectacular',
            neon: 'wordNeonGlow',
            flip: 'word3DFlip',
            rainbow: 'rainbowWave',
            typewriter: 'wordTypewriter'
        },
        
        // Key words to emphasize in each instruction
        keyWords: {
            0: ['story', 'carefully'],
            1: ['Investigate'],
            2: ['Answer'],
            3: ['Best', 'RIZ'],
            4: ['Honey pots', 'hints']
        },
        
        // Initialize the enhanced animations
        init: function() {
            const splashScreen = document.getElementById('splash-screen');
            if (!splashScreen) return;
            
            // Start the animation sequence after splash entrance
            setTimeout(() => {
                this.animateAllInstructions();
            }, 1200); // Increased initial delay for better load performance
        },
        
        // Animate all instructions in sequence
        animateAllInstructions: function() {
            const instructions = document.querySelectorAll('.instruction-item');
            let currentIndex = 0;
            
            const animateNext = () => {
                if (currentIndex < instructions.length) {
                    this.animateInstruction(currentIndex, () => {
                        currentIndex++;
                        setTimeout(animateNext, 800); // Increased pause between instructions for smoother rendering
                    });
                } else {
                    // Enable play button with fanfare
                    this.enablePlayButton();
                }
            };
            
            animateNext();
        },
        
        // Animate a single instruction with spectacular word effects
        animateInstruction: function(index, callback) {
            const item = document.querySelectorAll('.instruction-item')[index];
            if (!item) return;
            
            const textElement = item.querySelector('.instruction-text');
            const iconElement = item.querySelector('.instruction-icon');
            const originalText = textElement.textContent;
            const words = originalText.split(' ');
            
            // Clear text and prepare for animation
            textElement.textContent = '';
            item.classList.add('animating');
            
            // Create background ripple effect
            setTimeout(() => {
                item.classList.remove('animating');
            }, 1000);
            
            // Animate icon first
            iconElement.classList.add('icon-pulse');
            
            // Animate each word
            words.forEach((word, wordIndex) => {
                setTimeout(() => {
                    const wordSpan = this.createAnimatedWord(word, index, wordIndex);
                    
                    // Create a wrapper span that includes the word and a space
                    const wordWrapper = document.createElement('span');
                    wordWrapper.appendChild(wordSpan);
                    
                    // Add space after word (except last)
                    if (wordIndex < words.length - 1) {
                        wordWrapper.appendChild(document.createTextNode(' '));
                    }
                    
                    textElement.appendChild(wordWrapper);
                    
                    // Create particle effects for key words
                    if (this.isKeyWord(word, index)) {
                        this.createParticleEffect(wordSpan);
                    }
                    
                    // Callback on last word
                    if (wordIndex === words.length - 1 && callback) {
                        setTimeout(callback, 700); // Increased to allow animation to settle
                    }
                }, wordIndex * 200); // Increased stagger for smoother word animations
            });
        },
        
        // Create an animated word span with effects
        createAnimatedWord: function(word, instructionIndex, wordIndex) {
            const span = document.createElement('span');
            span.className = 'word-animate delay-' + (wordIndex + 1);
            
            // Check if it's a key word for special styling
            if (this.isKeyWord(word, instructionIndex)) {
                span.classList.add('word-key');
                
                // 50% chance for holographic effect on key words
                if (Math.random() > 0.5) {
                    span.classList.add('word-holographic');
                }
            }
            
            // For very important words, use letter animation
            if (word.toUpperCase() === 'INVESTIGATE' || word.toUpperCase() === 'RIZ') {
                // Disable letter scatter for now - it's causing the "investigatem" issue
                span.textContent = word;
                span.classList.add('word-emphasis');
            } else {
                span.textContent = word;
            }
            
            return span;
        },
        
        // Check if a word is a key word
        isKeyWord: function(word, instructionIndex) {
            const keys = this.keyWords[instructionIndex] || [];
            return keys.some(key => 
                word.toLowerCase().includes(key.toLowerCase())
            );
        },
        
        // Create particle effects for emphasis
        createParticleEffect: function(wordElement) {
            const rect = wordElement.getBoundingClientRect();
            const container = document.createElement('div');
            container.className = 'word-particles';
            
            // Create multiple particles
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.setProperty('--fly-x', (Math.random() - 0.5) * 100 + 'px');
                particle.style.setProperty('--fly-y', (Math.random() - 0.5) * 100 + 'px');
                particle.style.animationDelay = (i * 50) + 'ms';
                container.appendChild(particle);
            }
            
            wordElement.style.position = 'relative';
            wordElement.appendChild(container);
        },
        
        // Enable play button with celebration
        enablePlayButton: function() {
            const playButton = document.getElementById('play-now-button');
            const bear = document.querySelector('.splash-bear');
            
            // Make bear celebrate
            bear.style.animation = 'bounce 0.5s ease';
            
            // Enable button with glow effect
            setTimeout(() => {
                playButton.disabled = false;
                playButton.innerHTML = '<span class="word-holographic">✨ Play Now ✨</span>';
                playButton.classList.add('button-ready');
                
                // Add confetti or sparkle effect around button
                this.createButtonSparkles(playButton);
            }, 500);
        },
        
        // Create sparkle effects around play button
        createButtonSparkles: function(button) {
            const sparkleContainer = document.createElement('div');
            sparkleContainer.style.position = 'absolute';
            sparkleContainer.style.top = '0';
            sparkleContainer.style.left = '0';
            sparkleContainer.style.width = '100%';
            sparkleContainer.style.height = '100%';
            sparkleContainer.style.pointerEvents = 'none';
            sparkleContainer.style.overflow = 'visible';
            
            button.style.position = 'relative';
            button.appendChild(sparkleContainer);
            
            // Create sparkles
            const sparkles = ['✨', '⭐', '💫', '✨'];
            sparkles.forEach((sparkle, i) => {
                const span = document.createElement('span');
                span.textContent = sparkle;
                span.style.position = 'absolute';
                span.style.fontSize = '20px';
                span.style.opacity = '0';
                span.style.animation = 'particleFly 1s ease-out forwards';
                span.style.animationDelay = (i * 200) + 'ms';
                span.style.left = '50%';
                span.style.top = '50%';
                span.style.setProperty('--fly-x', (Math.cos(i * Math.PI / 2) * 60) + 'px');
                span.style.setProperty('--fly-y', (Math.sin(i * Math.PI / 2) * 60) + 'px');
                sparkleContainer.appendChild(span);
            });
        },
        
        // Alternative: Typewriter effect with sound
        typewriterEffect: function(element, text, callback) {
            let index = 0;
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            element.appendChild(cursor);
            
            const typeNext = () => {
                if (index < text.length) {
                    const char = document.createTextNode(text[index]);
                    element.insertBefore(char, cursor);
                    index++;
                    
                    // Vary typing speed for natural feel
                    const delay = text[index - 1] === ' ' ? 50 : 30 + Math.random() * 50;
                    setTimeout(typeNext, delay);
                } else {
                    cursor.remove();
                    if (callback) callback();
                }
            };
            
            typeNext();
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