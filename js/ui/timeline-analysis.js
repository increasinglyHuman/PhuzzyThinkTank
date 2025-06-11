// ===== UI/TIMELINE-ANALYSIS.JS =====
// Timeline Analysis Integration for Phuzzy's Think Tank

class TimelineAnalysis {
    constructor() {
        this.currentScenario = null;
        this.timelineChart = null;
        this.radarChart = null;
        // Use global bear game state instead of local one
        if (!window.bearGameState) {
            window.bearGameState = {
                lastPlayTime: 0,
                cooldownMinutes: 10,
                activeTimer: null,
                timeLeft: 20,
                gameActive: false,
                urgentMode: false,
                pushCooldown: false
            };
        }
        this.bearGameState = window.bearGameState; // Reference to global state
        this.accordionOpen = false;
        this.lastEnabledDimension = null; // Track most recently enabled dimension
        this.scenarioAnswered = false; // Track if current scenario has been answered
        
        // Hide bear paw on initialization
        const bearPaw = document.getElementById('bear-paw-main');
        if (bearPaw) {
            bearPaw.style.display = 'none';
        }
    }
    
    // Centralized text formatting function (matching quiz-interface.js)
    formatScenarioText(text) {
        let formattedText = text;
        
        // Apply content filter for 13+ rating
        const profanityMap = {
            'shit': '$#!@', 'piss': '@!$$', 'fuck': '!@#$', 'cunt': '#@$!',
            'cocksucker': '#@#$$@#$%!', 'motherfucker': '@#$%&!@#$%!', 'tits': '@!#$',
            'bullshit': '%@!!$#!@', 'fucking': '!@#$!&%', 'fucked': '!@#$%&',
            'shitty': '$#!@@*', 'pissed': '@!$$%&', 'asshole': '@$$#@!%',
            'bitch': '%!@#$', 'damn': '&@#$', 'hell': '#%!!', 'ass': '@$$'
        };
        
        // Replace profanity with symbols (case-insensitive)
        Object.keys(profanityMap).forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            formattedText = formattedText.replace(regex, profanityMap[word]);
        });
        
        // Replace AITA with family-friendly version
        formattedText = formattedText.replace(/\bAITA\b/g, 'Am I Wrong');
        
        // First, convert actual newlines to HTML breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Convert lists with dashes/bullets to proper formatting with indentation
        // Also handle lists that might come after <br> tags
        // Remove the <br> before list items and add tight line spacing
        formattedText = formattedText.replace(/(<br>)?^- ([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $2</span>');
        formattedText = formattedText.replace(/<br>- ([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $1</span>');
        
        // Recognize numbered lists and indent them too
        formattedText = formattedText.replace(/(<br>)?^(\d+)\.\s+([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">$2. $3</span>');
        formattedText = formattedText.replace(/<br>(\d+)\.\s+([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">$1. $2</span>');
        
        // Recognize lists that use asterisks
        formattedText = formattedText.replace(/(<br>)?^\* ([^<]+)/gm, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $2</span>');
        formattedText = formattedText.replace(/<br>\* ([^<]+)/g, '<span style="display: block; padding-left: 1.5em; text-indent: -1.5em; margin-left: 1.5em; margin-top: 0; margin-bottom: 0; line-height: 1.2;">• $1</span>');
        
        // Convert double line breaks to paragraphs with controlled spacing
        formattedText = formattedText.replace(/(<br>)(<br>)+/g, '</p><p style="margin-top: 0.8em;">');
        formattedText = '<p style="margin: 0;">' + formattedText + '</p>';
        
        return formattedText;
    }

    // Hide all bear game UI elements
    hideBearGameUI() {
        // Hide bear paw
        const bearPaw = document.getElementById('bear-paw-main');
        if (bearPaw) {
            bearPaw.style.cssText = 'display: none !important; visibility: hidden !important;';
            bearPaw.classList.add('force-hidden');
        }
        
        // Hide flyout
        const flyout = document.getElementById('bear-flyout-main');
        if (flyout) {
            flyout.style.cssText = 'display: none !important; visibility: hidden !important; animation: none !important;';
            flyout.classList.add('force-hidden');
        }
        
        // Hide push button
        const pushBtn = document.getElementById('push-btn-main');
        if (pushBtn) {
            pushBtn.style.cssText = 'display: none !important; visibility: hidden !important;';
        }
        
        // Clear any character data
        if (this.timelineChart && this.timelineChart.characterData) {
            clearInterval(this.timelineChart.sparkleInterval);
            this.timelineChart.sparkleInterval = null;
            this.timelineChart.characterData = null;
        }
    }
    
    // Initialize the timeline analysis for a scenario
    initializeForScenario(scenario) {
        this.currentScenario = scenario;
        
        // Reset flags for new scenario
        this.scenarioAnswered = false;
        this.lastEnabledDimension = null;
        
        // Update bear paw visibility based on cooldown
        this.updateBearPawVisibility();
        
        // Prepare data when accordion is opened
        if (this.accordionOpen) {
            this.renderAnalysis();
        }
    }

    // Toggle the accordion
    toggleAccordion() {
        const accordion = document.getElementById('timeline-analysis-accordion');
        const quizSection = document.getElementById('quiz-section');
        const toggleBtn = document.getElementById('analysis-toggle-btn');
        
        this.accordionOpen = !this.accordionOpen;
        
        if (this.accordionOpen) {
            // Open accordion, hide quiz
            accordion.style.display = 'block';
            quizSection.style.display = 'none';
            toggleBtn.innerHTML = '🔍 Close Investigation';
            
            // Move score tracker to timeline position
            this.repositionScoreTracker(true);
            
            // Render the analysis after a brief delay to ensure DOM is ready
            setTimeout(() => {
                this.renderAnalysis();
                // Update bear paw visibility after accordion opens
                this.updateBearPawVisibility();
            }, 100);
        } else {
            // Close accordion, show quiz
            accordion.style.display = 'none';
            quizSection.style.display = 'block';
            toggleBtn.innerHTML = '🔍 Investigate';
            
            // Reset score tracker position
            this.repositionScoreTracker(false);
            
            // Clear any text highlights
            this.clearTextHighlights();
            
            // Clean up charts
            this.cleanupCharts();
        }
    }

    // Render the complete analysis
    renderAnalysis() {
        // console.log('renderAnalysis called');
        // console.log('Current scenario:', this.currentScenario);
        
        // Reset lastEnabledDimension for new scenario
        this.lastEnabledDimension = null;
        
        if (!this.currentScenario) {
            console.error('No current scenario!');
            return;
        }
        
        // DEBUG: Check if elements exist
        const analysisGrid = document.querySelector('.analysis-grid');
        const radarSection = document.querySelector('.radar-section');
        const timelineSection = document.querySelector('.timeline-chart-section');
        
        // console.log('DEBUG - Elements found:');
        // console.log('- analysis-grid:', analysisGrid);
        // console.log('- radar-section:', radarSection);
        // console.log('- timeline-section:', timelineSection);
        
        if (analysisGrid) {
            const gridStyle = window.getComputedStyle(analysisGrid);
            // console.log('- analysis-grid computed style:', gridStyle.display);
            // console.log('- analysis-grid height:', gridStyle.height);
            // console.log('- analysis-grid overflow:', gridStyle.overflow);
        }
        
        // Create timeline chart
        this.createTimelineChart();
        
        // Create radar chart
        this.createRadarChart();
        
        // Update info boxes
        this.updateInfoBoxes();
        
        // Initialize bear game after timeline is ready
        if (window.initializeBearGame) {
            window.initializeBearGame();
        }
    }

    // Create the timeline chart
    createTimelineChart() {
        const canvas = document.getElementById('timeline-chart');
        if (!canvas) {
            console.error('Timeline canvas not found');
            // console.log('All canvas elements:', document.querySelectorAll('canvas'));
            return;
        }
        
        // console.log('Creating timeline chart...');
        // console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        // console.log('Canvas parent:', canvas.parentElement);
        
        // Clean up existing chart
        if (this.timelineChart) {
            this.timelineChart.destroy();
        }
        
        // Create new timeline chart instance
        this.timelineChart = new TimelineChart(canvas);
        
        // Reset all dimension toggles to visible (default state)
        this.timelineChart.visibleDimensions = {
            logic: true,
            emotion: true,
            balanced: true,
            agenda: true
        };
        
        // Set up dimension toggle callback
        this.timelineChart.onDimensionToggle = (dimension, isVisible) => {
            // console.log('Dimension toggled:', dimension, isVisible);
            if (isVisible) {
                this.lastEnabledDimension = dimension;
            }
            this.updateInfoBoxes();
        };
        
        // Analyze the scenario text and draw
        console.log('🔍 Timeline: currentScenario keys:', Object.keys(this.currentScenario));
        console.log('🔍 Timeline: scenario.text:', this.currentScenario.text);
        console.log('🔍 Timeline: scenario.reviewKeywords:', this.currentScenario.reviewKeywords);
        
        const reviewKeywords = this.currentScenario.reviewKeywords || {};
        const text = this.currentScenario.text || '';
        
        console.log('🔍 Timeline: extracted text length:', text.length);
        console.log('🔍 Timeline: extracted keywords:', reviewKeywords);
        
        // Extract keywords array from the nested structure
        const keywords = {};
        ['logic', 'emotion', 'balanced', 'agenda'].forEach(dim => {
            if (reviewKeywords[dim] && reviewKeywords[dim].keywords) {
                keywords[dim] = reviewKeywords[dim].keywords;
            } else {
                keywords[dim] = [];
            }
        });
        
        // console.log('Extracted keywords:', keywords);
        
        this.timelineChart.draw(text, keywords);
    }

    // Create the radar chart
    createRadarChart() {
        const canvas = document.getElementById('radar-chart');
        if (!canvas) {
            console.error('Radar canvas not found');
            return;
        }
        
        // console.log('Creating radar chart...');
        
        const ctx = canvas.getContext('2d');
        
        // Check if player has submitted their answer for this scenario
        // Also check if the current scenario is in the completed list
        const isScenarioCompleted = window.gameEngine && window.gameEngine.scenariosCompleted && 
                                   this.currentScenario && 
                                   window.gameEngine.scenariosCompleted.includes(this.currentScenario.id);
        
        const hasAnswered = this.scenarioAnswered || 
                           (window.gameEngine && window.gameEngine.uiController && window.gameEngine.uiController.hasAnswered) ||
                           isScenarioCompleted;
        
        // Update our flag if scenario is completed
        if (isScenarioCompleted && !this.scenarioAnswered) {
            this.scenarioAnswered = true;
        }
        
        console.log('🔍 createRadarChart - hasAnswered:', hasAnswered, 'scenarioAnswered:', this.scenarioAnswered, 'isCompleted:', isScenarioCompleted);
        console.log('🔍 About to check hasAnswered - if false, will call startRadarScan');
        
        if (!hasAnswered) {
            console.log('🔍 hasAnswered is false - calling this.startRadarScan...');
            console.log('🔍 this.startRadarScan exists?', typeof this.startRadarScan);
            this.startRadarScan(ctx, canvas.width, canvas.height);
            
            // Clear radar legend when in scan mode
            const legend = document.getElementById('radar-legend');
            if (legend) {
                legend.innerHTML = '';
            }
        } else {
            // Show real values after answer
            const weights = this.currentScenario.answerWeights || {};
            // console.log('Using answer weights for radar chart:', weights);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw radar chart
            this.drawRadarChart(ctx, weights, canvas.width, canvas.height);
            
            // Update radar legend
            this.updateRadarLegend(weights);
            
            // Restore original caption when showing real values
            const captionElement = document.querySelector('.radar-section .chart-explanation em');
            if (captionElement) {
                captionElement.style.opacity = '1';
                captionElement.style.color = '#666';
                captionElement.style.fontWeight = 'normal';
                captionElement.style.fontSize = ''; // Reset to default
                captionElement.textContent = 'Shows overall argument classification';
            }
        }
    }
    
    // Start radar scan animation
    startRadarScan(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.4;
        
        // Store animation frame ID for cleanup
        if (this.radarScanAnimation) {
            cancelAnimationFrame(this.radarScanAnimation);
        }
        
        let angle = 0;
        let time = 0;
        
        // Initialize dynamic values for each dimension
        const dynamicValues = {
            logic: { current: 50, target: 50, velocity: 0 },
            emotion: { current: 50, target: 50, velocity: 0 },
            balanced: { current: 50, target: 50, velocity: 0 },
            agenda: { current: 50, target: 50, velocity: 0 }
        };
        
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw radar grid
            ctx.strokeStyle = '#e5e5e5';
            ctx.lineWidth = 1;
            
            // Draw concentric circles
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Draw axes
            const axes = 4;
            const dimensions = ['logic', 'emotion', 'balanced', 'agenda'];
            const colors = {
                logic: '#3b82f6',
                emotion: '#ec4899',
                balanced: '#10b981',
                agenda: '#f59e0b'
            };
            
            for (let i = 0; i < axes; i++) {
                const axisAngle = (Math.PI * 2 / axes) * i - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(axisAngle) * maxRadius,
                    centerY + Math.sin(axisAngle) * maxRadius
                );
                ctx.stroke();
            }
            
            // Update dynamic values with spring physics
            Object.keys(dynamicValues).forEach(dim => {
                const val = dynamicValues[dim];
                
                // Randomly change target every so often
                if (Math.random() < 0.02) {
                    val.target = 20 + Math.random() * 60; // Range 20-80
                }
                
                // Spring physics
                const springForce = (val.target - val.current) * 0.05;
                const damping = val.velocity * 0.9;
                val.velocity = damping + springForce;
                val.current += val.velocity;
                
                // Add some noise
                val.current += (Math.random() - 0.5) * 2;
                
                // Clamp values
                val.current = Math.max(10, Math.min(90, val.current));
            });
            
            // Draw animated preview shape
            ctx.save();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            dimensions.forEach((dim, i) => {
                const axisAngle = (Math.PI * 2 / axes) * i - Math.PI / 2;
                const value = dynamicValues[dim].current / 100;
                const x = centerX + Math.cos(axisAngle) * maxRadius * value;
                const y = centerY + Math.sin(axisAngle) * maxRadius * value;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            // Draw floating numbers at each axis
            ctx.save();
            dimensions.forEach((dim, i) => {
                const axisAngle = (Math.PI * 2 / axes) * i - Math.PI / 2;
                const value = Math.round(dynamicValues[dim].current);
                
                // Position numbers just inside the radar edge to fit canvas
                // Move bottom number up more to make room for text
                let adjustedRadius = maxRadius - 20;
                if (i === 2) { // Bottom dimension (balanced)
                    adjustedRadius = maxRadius - 35;
                }
                const numX = centerX + Math.cos(axisAngle) * adjustedRadius;
                const numY = centerY + Math.sin(axisAngle) * adjustedRadius;
                
                // Pulsing effect
                const pulse = 1 + Math.sin(time * 0.03 + i) * 0.1;
                
                ctx.font = `${16 * pulse}px system-ui`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Shadow for better visibility
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.fillStyle = colors[dim];
                ctx.fillText(value + '%', numX, numY);
            });
            ctx.restore();
            
            // Draw scanning line
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#10b981';
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * maxRadius,
                centerY + Math.sin(angle) * maxRadius
            );
            ctx.stroke();
            
            // Draw scanning arc
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, maxRadius, angle - 0.5, angle, false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            
            // Add "SCANNING..." text on radar - orange/red warning style
            ctx.save();
            ctx.fillStyle = '#f97316'; // Orange warning color
            ctx.font = 'bold 20px system-ui';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f97316';
            
            // Keep SCANNING at steady opacity with slight pulse
            const scanPulse = 0.7 + Math.sin(time * 0.05) * 0.3;
            ctx.globalAlpha = scanPulse;
            ctx.fillText('SCANNING...', centerX, height - 5);
            ctx.restore();
            
            // Update caption with animated messages
            const captionElement = document.querySelector('.radar-section .chart-explanation em');
            if (captionElement) {
                // Create a faster fade in/hold/fade out cycle
                const cycleTime = 300; // Total cycle time (faster)
                const fadeTime = 60; // Time for fade in/out
                const holdTime = 180; // Time to hold at full opacity
                
                const cyclePosition = time % cycleTime;
                let opacity = 0;
                
                if (cyclePosition < fadeTime) {
                    // Fade in
                    opacity = cyclePosition / fadeTime;
                } else if (cyclePosition < fadeTime + holdTime) {
                    // Hold
                    opacity = 1;
                } else if (cyclePosition < fadeTime * 2 + holdTime) {
                    // Fade out
                    opacity = 1 - (cyclePosition - fadeTime - holdTime) / fadeTime;
                }
                
                // Rotate through different messages
                const messages = [
                    '🔍 Submit answer to unlock analysis',
                    '📊 Pattern recognition in progress...',
                    '⏳ Awaiting user input to calibrate',
                    '🔒 Data locked - answer required',
                    '🎯 Complete investigation to reveal'
                ];
                const messageIndex = Math.floor(time / cycleTime) % messages.length;
                
                // Update caption with animated opacity
                captionElement.style.opacity = opacity;
                captionElement.style.color = '#4b5563'; // Dark grey color for readability
                captionElement.style.fontWeight = '500';
                captionElement.style.fontSize = '0.95em'; // Slightly larger than default
                captionElement.textContent = messages[messageIndex];
            }
            
            // Update angle and time
            angle += 0.02;
            if (angle > Math.PI * 2) {
                angle = 0;
            }
            time++;
            
            // Continue animation
            this.radarScanAnimation = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // Stop radar scan animation
    stopRadarScan() {
        if (this.radarScanAnimation) {
            cancelAnimationFrame(this.radarScanAnimation);
            this.radarScanAnimation = null;
        }
        
        // Restore original caption
        const captionElement = document.querySelector('.radar-section .chart-explanation em');
        if (captionElement) {
            captionElement.style.opacity = '1';
            captionElement.style.color = '#666';
            captionElement.style.fontWeight = 'normal';
            captionElement.style.fontSize = ''; // Reset to default
            captionElement.textContent = 'Shows overall argument classification';
        }
    }
    
    // Update radar chart after answer is submitted
    updateRadarAfterAnswer() {
        // console.log('Updating radar chart after answer...');
        
        // Mark that this scenario has been answered
        this.scenarioAnswered = true;
        
        // Stop the scanning animation
        this.stopRadarScan();
        
        // Redraw the radar with real values
        this.createRadarChart();
    }
    
    // Calculate average scores from timeline data
    calculateAverageScores(timelineData) {
        const dimensions = ['logic', 'emotion', 'balanced', 'agenda'];
        const averages = {};
        
        dimensions.forEach(dim => {
            let total = 0;
            let count = 0;
            
            timelineData.forEach(dataPoint => {
                if (dataPoint.scores && dataPoint.scores[dim] !== undefined) {
                    total += dataPoint.scores[dim];
                    count++;
                }
            });
            
            // Calculate average and scale from 0-10 to 0-100
            const average = count > 0 ? (total / count) : 0;
            averages[dim] = Math.round(average * 10); // Scale 0-10 to 0-100
        });
        
        return averages;
    }

    // Draw radar chart
    drawRadarChart(ctx, weights, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        
        // Dimensions
        const dimensions = ['logic', 'emotion', 'balanced', 'agenda'];
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Draw concentric circles
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw axes
        dimensions.forEach((dim, i) => {
            const angle = (i * Math.PI * 2 / dimensions.length) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Draw labels
            ctx.fillStyle = colors[dim];
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const labelRadius = radius + 20;
            const labelX = centerX + Math.cos(angle) * labelRadius;
            const labelY = centerY + Math.sin(angle) * labelRadius;
            
            const labels = {
                logic: 'Logic',
                emotion: 'Emotion',
                balanced: 'Balanced',
                agenda: 'Agenda'
            };
            
            ctx.fillText(labels[dim], labelX, labelY);
        });
        
        // Draw data polygon
        ctx.beginPath();
        dimensions.forEach((dim, i) => {
            const value = weights[dim] || 0;
            const angle = (i * Math.PI * 2 / dimensions.length) - Math.PI / 2;
            const r = radius * value / 100;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        
        // Fill polygon
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw points
        dimensions.forEach((dim, i) => {
            const value = weights[dim] || 0;
            const angle = (i * Math.PI * 2 / dimensions.length) - Math.PI / 2;
            const r = radius * value / 100;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = colors[dim];
            ctx.fill();
        });
    }

    // Update radar legend
    updateRadarLegend(weights) {
        const legend = document.getElementById('radar-legend');
        legend.innerHTML = '';
        
        const dimensions = [
            { key: 'logic', label: 'Logic', color: 'logic' },
            { key: 'emotion', label: 'Emotional', color: 'emotion' },
            { key: 'balanced', label: 'Balanced', color: 'balanced' },
            { key: 'agenda', label: 'Agenda', color: 'agenda' }
        ];
        
        dimensions.forEach(dim => {
            const value = weights[dim.key] || 0;
            // Scale the visual width to leave space for percentage label
            // 100% actual = 85% visual width to leave room for text
            const visualWidth = value * 0.85;
            const bar = document.createElement('div');
            bar.className = `radar-bar ${dim.color}-bar`;
            bar.innerHTML = `
                <div class="radar-bar-fill" style="width: ${visualWidth}%"></div>
                <div class="bar-content">
                    <span class="bar-label">${dim.label}</span>
                    <span class="bar-value">${value}%</span>
                </div>
            `;
            legend.appendChild(bar);
        });
    }

    // Update info boxes
    updateInfoBoxes() {
        if (!this.currentScenario) return;
        
        // Check if player has submitted their answer
        const hasAnswered = window.gameEngine && window.gameEngine.uiController && window.gameEngine.uiController.hasAnswered;
        
        // Determine which dimension to show
        let selectedDimension = null;
        
        // console.log('updateInfoBoxes - hasAnswered:', hasAnswered, 'lastEnabledDimension:', this.lastEnabledDimension);
        
        // Always check for recently enabled dimension first (works both before and after answer)
        if (this.lastEnabledDimension) {
            // Check if it's still visible
            if (this.timelineChart && this.timelineChart.visibleDimensions[this.lastEnabledDimension]) {
                selectedDimension = this.lastEnabledDimension;
            } else {
                // Clear it if it's no longer visible
                this.lastEnabledDimension = null;
            }
        }
        
        // If no recently enabled dimension and answer has been submitted, show highest weight
        if (!selectedDimension && hasAnswered) {
            let highestWeight = 0;
            ['emotion', 'logic', 'balanced', 'agenda'].forEach(dim => {
                const weight = this.currentScenario.answerWeights[dim] || 0;
                if (weight > highestWeight) {
                    highestWeight = weight;
                    selectedDimension = dim;
                }
            });
            
            // Final fallback: use correct answer
            if (!selectedDimension) {
                selectedDimension = this.currentScenario.correctAnswer;
            }
        }
        
        // Update timeline description box
        const timelineBox = document.querySelector('.timeline-info-box');
        const timelineDesc = document.getElementById('timeline-description');
        
        if (timelineBox && timelineDesc) {
            if (!selectedDimension) {
                // No dimension selected - show generic neutral state
                timelineDesc.textContent = 'Analyzing language patterns across the timeline...';
                
                // Neutral gray styling with !important to override any CSS
                timelineBox.style.setProperty('background', '#e5e5e5', 'important');
                timelineBox.style.setProperty('border-left-color', '#999999', 'important');
                
                const infoTitle = timelineBox.querySelector('.info-title');
                if (infoTitle) {
                    infoTitle.style.color = '#4b5563';
                }
            } else {
                // Dimension selected - show dimension-specific info
                // Get scenario-specific analysis if available
                let analysisText = null;
                if (this.currentScenario.dimensionAnalysis && this.currentScenario.dimensionAnalysis[selectedDimension]) {
                    analysisText = this.currentScenario.dimensionAnalysis[selectedDimension];
                }
                
                // Dimension styling
                const dimensionStyles = {
                    logic: {
                        background: '#dbeafe',
                        borderColor: '#3b82f6',
                        titleColor: '#1e40af'
                    },
                    emotion: {
                        background: '#fce7f3',
                        borderColor: '#ec4899',
                        titleColor: '#be185d'
                    },
                    balanced: {
                        background: '#d1fae5',
                        borderColor: '#10b981',
                        titleColor: '#047857'
                    },
                    agenda: {
                        background: '#fed7aa',
                        borderColor: '#f59e0b',
                        titleColor: '#b45309'
                    }
                };
                
                // Fallback texts if dimensionAnalysis not available
                const fallbackTexts = {
                    logic: 'Track how evidence quality changes - watch for missing data, false statistics, and logical leaps that bypass critical thinking.',
                    emotion: 'Notice emotional intensity patterns - fear spikes, guilt triggers, and hope manipulation designed to override rational thought.',
                    balanced: 'Observe how multiple perspectives are presented fairly - acknowledging complexity without manipulation or oversimplification.',
                    agenda: 'Watch for hidden motives surfacing - sales pitches disguised as advice, biased sources, and selective information presentation.'
                };
                
                const dimStyle = dimensionStyles[selectedDimension];
                
                // Update text - use scenario-specific or fallback
                timelineDesc.textContent = analysisText || fallbackTexts[selectedDimension];
                
                // Update box styling
                timelineBox.style.background = dimStyle.background;
                timelineBox.style.borderLeftColor = dimStyle.borderColor;
                
                // Update title color
                const infoTitle = timelineBox.querySelector('.info-title');
                if (infoTitle) {
                    infoTitle.style.color = dimStyle.titleColor;
                }
            }
        }
        
        // Update analysis importance with structured content
        const importance = document.getElementById('analysis-importance');
        if (importance) {
            // Structured explanations with three sections for each scenario
            const detailedImportance = {
                'miracle-supplement-001': `<strong>The Timeline Reveals Balanced Communication:</strong> This scenario demonstrates responsible scientific communication - starting with credentials to establish credibility, presenting specific data points, acknowledging limitations and non-responders, and ending with personal disclosure without pressure.

<strong>How Rankings Work:</strong> Responses that identify this as balanced score highest because they recognize the hallmarks of responsible science communication. The moderate logic score reflects good evidence, while the low emotion and agenda scores show minimal manipulation. This is how experts should share findings.

<strong>Real-World Application:</strong> When evaluating health claims, look for this pattern - specific data WITH limitations acknowledged. Be suspicious of anyone claiming 100% success rates or hiding negative results.`,

                'neighborhood-watch-002': `<strong>The Timeline Reveals Manipulation Patterns:</strong> This scenario demonstrates classic fear-mongering tactics - starting with urgent language to grab attention, escalating with unsupported claims from social media, and ending with a sales pitch disguised as community safety.

<strong>How Rankings Work:</strong> Responses that identify the emotional manipulation score highest because they recognize the primary tactic being used. While there are also logical flaws and a hidden agenda, the emotional fear-mongering is the main driver of this message's persuasive power. Note the very low balanced approach score - this message completely lacks nuance or multiple perspectives.

<strong>Real-World Application:</strong> When you see similar patterns - urgent warnings leading to product sales - you can recognize the manipulation before being influenced by it. Real safety concerns come with specific evidence and measured responses, not panic and products.`,

                'climate-study-003': `<strong>The Timeline Reveals Logical Failures:</strong> This scenario shows classic disinformation tactics - starting with an official-sounding source, making extraordinary claims with tiny sample size (50 scientists), attacking the credibility of thousands of researchers, and ending with appeals to "common sense" over evidence.

<strong>How Rankings Work:</strong> Responses identifying logical flaws score highest because the primary issue is the complete lack of credible evidence. The high agenda score reflects the obvious bias, while emotional appeals ("Wake up!") are secondary to the logical failures. The balanced score is zero - this is pure one-sided propaganda.

<strong>Real-World Application:</strong> When you see claims that "everyone is lying except us," check the evidence quality. Real scientific debates happen in journals with peer review, not through unnamed surveys and conspiracy claims.`,

                'teachers-concern-004': `<strong>The Timeline Reveals Professional Balance:</strong> This scenario demonstrates responsible concern-raising - starting with specific observations (5 students, grade drops), presenting evidence without catastrophizing, offering research resources, and ending with collaborative problem-solving invitation.

<strong>How Rankings Work:</strong> Responses recognizing balance score highest because Mrs. Rodriguez combines legitimate concern with measured response. The moderate logic score reflects real evidence, while low emotion and agenda scores show she's not manipulating parents. This is professional communication at its best.

<strong>Real-World Application:</strong> When raising concerns or evaluating others' concerns, look for this pattern - specific examples, proportionate response, and collaborative solutions. Beware those who jump from minor issues to extreme demands.`,

                'investment-scam-005': `<strong>The Timeline Reveals Emotional Warfare:</strong> This scenario shows predatory emotional manipulation - opening with lifestyle envy, attacking your current situation ("wage slave"), triggering family guilt, creating false urgency, and ending with a call-to-action while providing zero actual information.

<strong>How Rankings Work:</strong> Responses identifying emotional manipulation score highest because every element targets feelings, not logic. The very high agenda score reflects the obvious sales pitch, while the near-zero logic score shows complete absence of substance. This is pure psychological manipulation.

<strong>Real-World Application:</strong> When someone makes you feel terrible about your life while positioning themselves as your only salvation, run. Legitimate opportunities provide information, not emotional attacks. The emoji overload is another red flag of manipulation.`,

                'food-additive-006': `<strong>The Timeline Reveals Honest Complexity:</strong> This scenario demonstrates responsible health reporting - presenting multiple studies with conflicting results, acknowledging regulatory positions, avoiding fear-mongering or dismissal, and empowering readers to make informed choices based on their values.

<strong>How Rankings Work:</strong> Responses recognizing balance score highest because the article presents all sides fairly. The high logic score reflects extensive evidence citation, while moderate emotion acknowledges parental concern without exploiting it. This is how complex health topics should be discussed.

<strong>Real-World Application:</strong> In health decisions, be suspicious of anyone claiming absolute certainty. Real science often shows mixed results. Look for sources that present evidence honestly and help you weigh trade-offs rather than pushing one answer.`,

                'fitness-influencer-007': `<strong>The Timeline Reveals Predatory Marketing:</strong> This scenario shows agenda-driven manipulation - starting with impossible promises (no diet/exercise needed), attacking medical professionals, using fake urgency pricing, and ending with personal attacks on viewers' relationships and self-worth.

<strong>How Rankings Work:</strong> Responses identifying hidden agenda score highest because every element serves the sales goal. The high emotion score reflects body-shaming tactics, while the very low logic score shows zero evidence. The "ancient secret" claim is a classic scam indicator.

<strong>Real-World Application:</strong> When fitness influencers attack doctors and promise effortless results, they're selling fantasy. Real health professionals never claim you can achieve results without effort. The relationship shaming ("husband looking at other women") reveals the cruel manipulation.`,

                'university-study-008': `<strong>The Timeline Reveals Quality Research:</strong> This scenario demonstrates exemplary academic communication - presenting comprehensive methodology, specific results by category, acknowledging both benefits and drawbacks, and providing access to full data for verification.

<strong>How Rankings Work:</strong> Responses recognizing balance score highest because MIT presents both positive and negative findings honestly. The very high logic score reflects robust methodology, while minimal emotion shows they let data speak for itself. This is institutional credibility at work.

<strong>Real-World Application:</strong> When evaluating research claims, look for large sample sizes, nuanced results (not all positive or negative), and accessible source data. Be skeptical of studies that only report benefits or hide their methodology.`,

                'parenting-forum-009': `<strong>The Timeline Reveals Panic Overreaction:</strong> This scenario shows how fear overwhelms reason - starting with one concerning incident, escalating to destroying all technology, dismissing reasonable solutions, and ending with demands that others follow this extreme response.

<strong>How Rankings Work:</strong> Responses identifying emotional manipulation score highest because panic has completely overridden logic. While the parent's fear is genuine, the response is disproportionate and potentially harmful. The very low balanced score reflects the total absence of measured thinking.

<strong>Real-World Application:</strong> Child safety requires balanced responses. One incident doesn't justify destroying all technology, which children need for education and social development. Real protection involves supervision, communication, and teaching safe practices - not isolation.`,

                'community-garden-010': `<strong>The Timeline Reveals Mature Governance:</strong> This scenario demonstrates professional proposal-making - presenting specific costs upfront, providing evidence from comparable cities, acknowledging concerns (parking, noise), and suggesting a pilot program to test before full commitment.

<strong>How Rankings Work:</strong> Responses recognizing balance score highest because Councilwoman Lee presents both benefits and drawbacks honestly. The high logic score reflects solid data, while moderate emotion shows appropriate enthusiasm without manipulation. This is how civic proposals should work.

<strong>Real-World Application:</strong> When evaluating community proposals, look for specific costs, comparable examples, acknowledged downsides, and testing phases. Be wary of proposals that promise only benefits or hide costs until after approval.`
            };
            
            // Use scenario-specific detailed explanation
            const specificImportance = detailedImportance[this.currentScenario.id];
            if (specificImportance) {
                // Split by double newlines and wrap each section
                const sections = specificImportance.split('\n\n');
                importance.innerHTML = sections.map((section, index) => {
                    // Add emoji for the main "Why This Analysis Matters" header
                    if (index === 0) {
                        return `<div style="margin-bottom: 0.8em;">🎯 <strong>Why This Analysis Matters</strong></div><p style="margin-bottom: 1em;">${section}</p>`;
                    }
                    return `<p style="margin-bottom: 1em;">${section}</p>`;
                }).join('');
            } else {
                // Fallback to wisdom field if available
                if (this.currentScenario.wisdom) {
                    importance.textContent = this.currentScenario.wisdom;
                } else {
                    // General fallback
                    const correctAnswer = this.currentScenario.correctAnswer;
                    const importanceText = {
                        logic: 'Spotting logical flaws helps you demand better evidence and avoid being misled by confident-sounding nonsense.',
                        emotion: 'Recognizing emotional manipulation protects you from fear-based decisions and helps maintain rational thinking.',
                        balanced: 'Identifying well-balanced arguments teaches you what responsible communication looks like.',
                        agenda: 'Detecting hidden agendas reveals when someone prioritizes their interests over honest information.'
                    };
                    importance.textContent = importanceText[correctAnswer] || 'Understanding manipulation tactics...';
                }
            }
        }
    }

    // Handle bear paw click
    handleBearPawClick() {
        // Check cooldown
        const now = Date.now();
        const timeSinceLastPlay = (now - this.bearGameState.lastPlayTime) / (1000 * 60);
        
        if (timeSinceLastPlay < this.bearGameState.cooldownMinutes) {
            const remainingMinutes = Math.ceil(this.bearGameState.cooldownMinutes - timeSinceLastPlay);
            alert(`🐻 Phuzzy is still catching his breath from the last analysis sprint! The old bear needs ${remainingMinutes} more minute${remainingMinutes !== 1 ? 's' : ''} to recalibrate his statistical whiskers.`);
            return;
        }
        
        // Start the mini-game
        this.startBearGame();
    }

    // Start bear mini-game
    startBearGame() {
        if (!this.timelineChart) return;
        
        // Choose random dimension first
        const dimensions = ['logic', 'emotion', 'balanced', 'agenda'];
        const randomDimension = dimensions[Math.floor(Math.random() * dimensions.length)];
        
        // Show instruction dialog with the chosen dimension
        this.showBearInstructions(randomDimension, () => {
            // Start the game after dialog is dismissed
            this.startBearGameActual(randomDimension);
        });
    }
    
    // Show bear dash instructions
    showBearInstructions(dimension, callback) {
        // Dimension-specific descriptions
        const dimensionInfo = {
            logic: {
                color: '#3b82f6',
                name: 'Logical Fallacy',
                description: 'Help him navigate the peaks of flawed reasoning and valleys of missing evidence!',
                obstacle: 'logical potholes'
            },
            emotion: {
                color: '#ec4899',
                name: 'Emotional Manipulation',
                description: 'Guide him through the rollercoaster of fear appeals and identity triggers!',
                obstacle: 'emotional whirlpools'
            },
            balanced: {
                color: '#10b981',
                name: 'Balance Issues',
                description: 'Race along the reasonable ridges where logic and emotion meet!',
                obstacle: 'imbalance wobbles'
            },
            agenda: {
                color: '#f59e0b',
                name: 'Hidden Agenda',
                description: 'Sprint through the sneaky slopes of bias and ulterior motives!',
                obstacle: 'agenda ambushes'
            }
        };
        
        const info = dimensionInfo[dimension];
        const dialog = document.createElement('div');
        dialog.className = 'bear-instruction-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 25px;
            padding: 40px;
            max-width: 420px;
            width: 90%;
            color: white;
            z-index: 10000;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
        `;
        
        // Create color icon based on dimension
        const colorIcons = {
            logic: '🔵',
            emotion: '💗',
            balanced: '🟢',
            agenda: '🟠'
        };
        const colorIcon = colorIcons[dimension] || '⚪';
        
        dialog.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px; text-align: center;">🐻💨</div>
            <h2 style="font-weight: 700; margin-bottom: 25px; font-size: 2rem; text-align: center; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Phuzzy's Mad Dash</h2>
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 15px; padding: 20px; margin-bottom: 25px; backdrop-filter: blur(10px);">
                <p style="font-size: 1.1rem; line-height: 1.6; margin: 0; text-align: left;">
                    Phuzzy needs your help! He spotted an insight on the 
                    <span style="display: inline-block; background: ${info.color}33; padding: 2px 8px; border-radius: 4px; margin: 0 2px;">
                        ${colorIcon} ${info.name}
                    </span> curve.
                    <br><br>
                    🎮 <strong style="font-size: 1.3rem;">TAP THE TIMELINE</strong> to boost him forward!
                </p>
            </div>
            <button id="bear-play-btn" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 18px 50px;
                font-size: 1.3rem;
                font-weight: 700;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                display: block;
                margin: 0 auto;
                position: relative;
                overflow: hidden;
            ">Play Now</button>
        `;
        
        document.body.appendChild(dialog);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
        
        // Handle button click
        const playBtn = document.getElementById('bear-play-btn');
        playBtn.onclick = () => {
            dialog.remove();
            overlay.remove();
            callback();
        };
        
        // Add hover effect
        playBtn.onmouseover = () => {
            playBtn.style.transform = 'translateY(-3px)';
            playBtn.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            playBtn.style.background = '#f8f9ff';
        };
        playBtn.onmouseout = () => {
            playBtn.style.transform = 'translateY(0)';
            playBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            playBtn.style.background = 'white';
        };
    }
    
    // Actual game start logic
    startBearGameActual(dimension) {
        
        // Set only this dimension visible
        this.timelineChart.visibleDimensions = {
            logic: false,
            emotion: false,
            balanced: false,
            agenda: false
        };
        this.timelineChart.visibleDimensions[dimension] = true;
        
        // Update button states
        document.querySelectorAll('.timeline-chart-section .toggle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.dimension === dimension) {
                btn.classList.add('active');
            }
        });
        
        // Start game with longer timer for escalating difficulty
        this.bearGameState.lastPlayTime = Date.now();
        this.bearGameState.gameActive = true;
        this.bearGameState.timeLeft = 30;
        this.bearGameState.urgentMode = false;
        
        // Hide flyout - we're using timeline clicking now
        document.getElementById('bear-flyout-main').style.display = 'none';
        
        // Add click handler to timeline canvas
        const canvas = document.getElementById('timeline-chart');
        if (canvas && !canvas.hasAttribute('data-bear-click-handler')) {
            canvas.setAttribute('data-bear-click-handler', 'true');
            canvas.style.cursor = 'pointer';
            
            const clickHandler = (e) => {
                if (this.bearGameState.gameActive && !this.bearGameState.pushCooldown) {
                    // Get click position relative to canvas
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Get bear position from timeline chart
                    if (this.timelineChart && this.timelineChart.characterData) {
                        const bearPos = this.getBearScreenPosition();
                        if (bearPos) {
                            // Calculate distance from click to bear
                            const distance = Math.sqrt(
                                Math.pow(x - bearPos.x, 2) + 
                                Math.pow(y - bearPos.y, 2)
                            );
                            
                            // Effective range: increased to 40 pixels for better playability
                            const effectiveRange = 40;
                            
                            if (distance <= effectiveRange) {
                                // Close enough - check if in front or behind
                                if (x > bearPos.x + 10) {
                                    // Clicked in front of bear - backward push!
                                    this.giveBearPush(true); // true = backward
                                    // Show different effect for backward push
                                    this.showTapEffect(x, y, 'backward');
                                } else {
                                    // Normal forward push
                                    this.giveBearPush(false);
                                    // Show success tap effect
                                    this.showTapEffect(x, y, 'forward');
                                }
                            } else {
                                // Too far - show miss effect
                                this.showTapEffect(x, y, 'miss');
                            }
                        }
                    }
                }
            };
            
            canvas.addEventListener('click', clickHandler);
            canvas.addEventListener('touchstart', clickHandler);
            
            // Store handler for cleanup
            canvas._bearClickHandler = clickHandler;
        }
        
        // Start timer
        this.startGameTimer();
        
        // Redraw chart
        this.timelineChart.redraw();
    }

    // Game timer
    startGameTimer() {
        if (this.bearGameState.activeTimer) return;
        
        this.bearGameState.activeTimer = setInterval(() => {
            if (!this.bearGameState.gameActive) return;
            
            this.bearGameState.timeLeft--;
            this.updateTimerBar();
            
            // Check for victory
            if (this.timelineChart && this.timelineChart.characterData && 
                this.timelineChart.characterData.position > 0.95) {
                this.endBearGame(true);
                return;
            }
            
            // Start urgent mode at 5 seconds
            if (this.bearGameState.timeLeft === 5 && !this.bearGameState.urgentMode) {
                this.bearGameState.urgentMode = true;
                this.startUrgentMode();
            }
            
            if (this.bearGameState.timeLeft <= 0) {
                this.endBearGame(false);
            }
        }, 1000);
    }

    // Update timer bar
    updateTimerBar() {
        // Redraw the timeline chart to update the timer bar
        if (this.timelineChart) {
            this.timelineChart.redraw();
        }
    }

    // Start urgent mode
    startUrgentMode() {
        document.querySelector('.timeline-chart-section').classList.add('urgent');
        this.startDoomCountdown();
    }

    // DOOM countdown
    startDoomCountdown() {
        let countdownNumber = 5;
        let countdownTimer = null;
        
        const showCountdown = () => {
            if (!this.bearGameState.gameActive) {
                if (countdownTimer) clearTimeout(countdownTimer);
                const existing = document.getElementById('doom-countdown');
                if (existing) existing.remove();
                return;
            }
            
            const existing = document.getElementById('doom-countdown');
            if (existing) existing.remove();
            
            if (countdownNumber <= 0) return;
            
            const countdown = document.createElement('div');
            countdown.id = 'doom-countdown';
            countdown.className = 'doom-countdown';
            countdown.textContent = countdownNumber;
            
            const intensity = (6 - countdownNumber) * 0.5;
            countdown.style.fontSize = (8 + intensity * 2) + 'rem';
            countdown.style.filter = `brightness(${1 + intensity})`;
            
            document.body.appendChild(countdown);
            
            setTimeout(() => {
                if (countdown.parentNode) countdown.remove();
            }, 800);
            
            countdownNumber--;
            
            if (countdownNumber >= 0 && this.bearGameState.gameActive) {
                countdownTimer = setTimeout(showCountdown, 1000);
            }
        };
        
        showCountdown();
    }

    // End bear game
    endBearGame(success) {
        // Prevent multiple calls
        if (!this.bearGameState.gameActive) return;
        
        clearInterval(this.bearGameState.activeTimer);
        this.bearGameState.activeTimer = null;
        this.bearGameState.gameActive = false;
        this.bearGameState.urgentMode = false;
        this.bearGameState.justEnded = true; // Flag to prevent immediate re-show
        
        // Remove click handler from timeline canvas
        const canvas = document.getElementById('timeline-chart');
        if (canvas && canvas._bearClickHandler) {
            canvas.removeEventListener('click', canvas._bearClickHandler);
            canvas.removeEventListener('touchstart', canvas._bearClickHandler);
            canvas.removeAttribute('data-bear-click-handler');
            canvas.style.cursor = 'default';
            delete canvas._bearClickHandler;
        }
        
        // Stop urgent mode
        document.querySelector('.timeline-chart-section').classList.remove('urgent');
        
        // Remove countdown
        const countdown = document.getElementById('doom-countdown');
        if (countdown) countdown.remove();
        
        // Set last play time for cooldown
        this.bearGameState.lastPlayTime = Date.now();
        
        // Show result
        if (success) {
            // console.log('🎉 Phuzzy reached the insight! +5 RIZ points awarded!');
            
            // Show success dialog
            setTimeout(() => {
                this.showBearResultDialog(true);
            }, 500);
            
            // Create custom bear reward animation
            // this.showBearReward(); // Commented out - we use createBearCoins instead
            
            // Award RIZ points with animation
            const points = 5;
            
            // Update score
            if (window.gameEngine && window.gameEngine.scoringSystem) {
                window.gameEngine.scoringSystem.totalScore += points;
            }
            
            // Update display
            const userScore = document.getElementById('user-score');
            if (userScore) {
                const currentScore = parseInt(userScore.textContent) || 0;
                const newScore = currentScore + points;
                userScore.textContent = newScore;
            }
            
            // Create custom floating rewards for bear game
            this.createBearCoins(points);
        } else {
            // console.log('😭 Phuzzy ran out of time!');
            
            // Show failure dialog
            setTimeout(() => {
                this.showBearResultDialog(false);
            }, 500);
            
            // Show sad bear feedback
            const sadBear = document.createElement('div');
            sadBear.className = 'floating-bear-emoji';
            sadBear.textContent = '😭';
            sadBear.style.cssText = `
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-size: 120px;
                z-index: 10000;
                animation: bearSad 2s ease-out forwards;
            `;
            document.body.appendChild(sadBear);
            setTimeout(() => sadBear.remove(), 2000);
        }
        
        // Force hide all bear game UI elements immediately
        this.hideBearGameUI();
        
        // Double-check after a brief delay to ensure nothing reopened it
        setTimeout(() => {
            this.hideBearGameUI();
        }, 100);
        
        // Clear the justEnded flag after cooldown starts
        setTimeout(() => {
            this.bearGameState.justEnded = false;
        }, 2000);
        
        // Reset chart after coin animation completes (1.5s for animation + buffer)
        setTimeout(() => {
            
            // Reset chart
            if (this.timelineChart) {
                if (this.timelineChart.characterData) {
                    clearInterval(this.timelineChart.sparkleInterval);
                    this.timelineChart.sparkleInterval = null;
                    this.timelineChart.characterData = null;
                }
                
                // Reset all dimensions to visible
                this.timelineChart.visibleDimensions = {
                    logic: true,
                    emotion: true,
                    balanced: true,
                    agenda: true
                };
                
                // Update buttons
                document.querySelectorAll('.timeline-chart-section .toggle-btn').forEach(btn => {
                    btn.classList.add('active');
                    btn.classList.remove('highlight-mode');
                });
                
                this.timelineChart.redraw();
            }
        }, 1500); // Wait for coin animation to complete
    }

    // Get bear's current screen position
    getBearScreenPosition() {
        if (!this.timelineChart || !this.timelineChart.characterData) return null;
        
        const canvas = document.getElementById('timeline-chart');
        if (!canvas) return null;
        
        const padding = 50;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        
        // Get character position (0-1)
        const pos = this.timelineChart.characterData.position;
        
        // Get current visible dimension
        const visibleDims = Object.keys(this.timelineChart.visibleDimensions)
            .filter(dim => this.timelineChart.visibleDimensions[dim]);
        if (visibleDims.length !== 1) return null;
        
        const dimension = visibleDims[0];
        const data = this.timelineChart.currentData;
        if (!data) return null;
        
        // Calculate position on timeline
        const dataIndex = Math.floor(pos * (data.length - 1));
        const nextIndex = Math.min(dataIndex + 1, data.length - 1);
        const localProgress = (pos * (data.length - 1)) % 1;
        
        // Calculate difficulty multiplier (same as in timeline-chart.js)
        let difficultyMultiplier = 1.0;
        let waveAmplitude = 0;
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        if (this.bearGameState.gameActive) {
            // Jump straight to maximum deformation!
            difficultyMultiplier = 6.0;  // Full 6x peak heights
            waveAmplitude = 100;  // Full wave interference
            
            // Pre-calculate all values to find min/max
            data.forEach(point => {
                let yValue = point.scores[dimension];
                const deviation = yValue - 50;
                yValue = 50 + (deviation * difficultyMultiplier);
                const wavePhase = point.position * Math.PI * 4;
                yValue += Math.sin(wavePhase) * waveAmplitude;
                
                minValue = Math.min(minValue, yValue);
                maxValue = Math.max(maxValue, yValue);
            });
        }
        
        // Apply same transformations
        const getModifiedScore = (point) => {
            let yValue = point.scores[dimension];
            const deviation = yValue - 50;
            yValue = 50 + (deviation * difficultyMultiplier);
            const wavePhase = point.position * Math.PI * 4;
            yValue += Math.sin(wavePhase) * waveAmplitude;
            // During game, no clamping
            if (this.bearGameState.gameActive) {
                return yValue;
            } else {
                return Math.max(0, Math.min(100, yValue));
            }
        };
        
        // Interpolate Y position with modified scores
        const y1 = getModifiedScore(data[dataIndex]);
        const y2 = getModifiedScore(data[nextIndex]);
        const interpolatedY = y1 + (y2 - y1) * localProgress;
        
        // Convert to screen coordinates with proper scaling
        const x = padding + pos * width;
        let scaleFactor = 100;
        let baselineOffset = 0;
        if (this.bearGameState.gameActive) {
            const range = maxValue - minValue;
            scaleFactor = range > 0 ? range : 100;
            baselineOffset = -minValue;
        }
        const y = padding + height - ((interpolatedY + baselineOffset) / scaleFactor * height) - 15; // 15 is groundOffset
        
        return { x, y };
    }
    
    // Show tap effect at click position
    showTapEffect(x, y, effectType = 'forward') {
        const canvas = document.getElementById('timeline-chart');
        if (!canvas) return;
        
        // Create a temporary canvas for the effect
        const effectCanvas = document.createElement('canvas');
        effectCanvas.width = canvas.width;
        effectCanvas.height = canvas.height;
        effectCanvas.style.cssText = canvas.style.cssText;
        effectCanvas.style.position = 'absolute';
        effectCanvas.style.pointerEvents = 'none';
        effectCanvas.style.left = canvas.offsetLeft + 'px';
        effectCanvas.style.top = canvas.offsetTop + 'px';
        effectCanvas.style.zIndex = '1000'; // Ensure it's above the timeline
        canvas.parentElement.appendChild(effectCanvas);
        
        const ctx = effectCanvas.getContext('2d');
        
        if (effectType === 'forward') {
            // Forward push effect - blue/purple power rings with particles
            const rings = [
                { radius: 0, opacity: 0.8, speed: 2, lineWidth: 4 },
                { radius: 0, opacity: 0.6, speed: 1.8, lineWidth: 3 },
                { radius: 0, opacity: 0.4, speed: 1.5, lineWidth: 2 }
            ];
            
            // Wind/particle lines
            const particles = [];
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2,
                    length: 0,
                    maxLength: 8,
                    opacity: 0.7
                });
            }
            
            const animate = () => {
                ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
            
            let allDone = true;
            
            // Draw expanding rings
            rings.forEach((ring, index) => {
                if (ring.radius < 15 + index * 5) { // 30% of original size
                    allDone = false;
                    ctx.beginPath();
                    ctx.arc(x, y, ring.radius, 0, Math.PI * 2);
                    
                    // Gradient stroke for power effect
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, ring.radius);
                    gradient.addColorStop(0, `rgba(59, 130, 246, ${ring.opacity})`);
                    gradient.addColorStop(0.5, `rgba(139, 92, 246, ${ring.opacity * 0.8})`);
                    gradient.addColorStop(1, `rgba(59, 130, 246, ${ring.opacity * 0.3})`);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = ring.lineWidth;
                    ctx.stroke();
                    
                    ring.radius += ring.speed;
                    ring.opacity -= 0.01; // Slower fade
                    ring.opacity = Math.max(0, ring.opacity);
                }
            });
            
            // Draw wind/power particles
            particles.forEach(particle => {
                if (particle.length < particle.maxLength) {
                    allDone = false;
                    
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    
                    const endX = particle.x + particle.vx * (particle.length / particle.maxLength);
                    const endY = particle.y + particle.vy * (particle.length / particle.maxLength);
                    
                    ctx.lineTo(endX, endY);
                    
                    // Gradient for wind effect
                    const gradient = ctx.createLinearGradient(particle.x, particle.y, endX, endY);
                    gradient.addColorStop(0, `rgba(59, 130, 246, 0)`);
                    gradient.addColorStop(0.5, `rgba(139, 92, 246, ${particle.opacity})`);
                    gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    
                    particle.length += 1.5; // Slower growth
                    particle.opacity -= 0.02; // Slower fade
                    particle.opacity = Math.max(0, particle.opacity);
                }
            });
            
            if (!allDone) {
                requestAnimationFrame(animate);
            } else {
                effectCanvas.remove();
            }
        };
        
        animate();
        } else if (effectType === 'backward') {
            // Backward push effect - orange/red warning rings
            const rings = [
                { radius: 0, opacity: 0.8, speed: 2, lineWidth: 3 },
                { radius: 0, opacity: 0.5, speed: 1.5, lineWidth: 2 }
            ];
            
            const animate = () => {
                ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
                
                let allDone = true;
                
                // Draw expanding rings with warning colors
                rings.forEach((ring, index) => {
                    if (ring.radius < 20 + index * 10) {
                        allDone = false;
                        ctx.beginPath();
                        ctx.arc(x, y, ring.radius, 0, Math.PI * 2);
                        
                        // Orange to red gradient for warning
                        const gradient = ctx.createRadialGradient(x, y, 0, x, y, ring.radius);
                        gradient.addColorStop(0, `rgba(251, 146, 60, ${ring.opacity})`);
                        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${ring.opacity * 0.8})`);
                        gradient.addColorStop(1, `rgba(220, 38, 38, ${ring.opacity * 0.3})`);
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = ring.lineWidth;
                        ctx.stroke();
                        
                        // Draw backward arrows
                        if (index === 0) {
                            ctx.save();
                            ctx.fillStyle = `rgba(239, 68, 68, ${ring.opacity})`;
                            ctx.font = 'bold 16px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('◀', x - 15, y);
                            ctx.fillText('◀', x + 15, y);
                            ctx.restore();
                        }
                        
                        ring.radius += ring.speed;
                        ring.opacity -= 0.02;
                        ring.opacity = Math.max(0, ring.opacity);
                    }
                });
                
                if (!allDone) {
                    requestAnimationFrame(animate);
                } else {
                    effectCanvas.remove();
                }
            };
            
            animate();
        } else {
            // Miss effect - smaller, subtler feedback
            let opacity = 0.6;
            let radius = 0;
            
            const animateMiss = () => {
                ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
                
                if (opacity > 0) {
                    // Draw pulsing dot with fading ring
                    ctx.save();
                    
                    // Fading ring
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(156, 163, 175, ${opacity * 0.5})`; // Gray color
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Center dot - slightly larger
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(107, 114, 128, ${opacity})`;
                    ctx.fill();
                    
                    // Small "miss" indicator - diagonal line, bit bolder
                    ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(x - 7, y - 7);
                    ctx.lineTo(x + 7, y + 7);
                    ctx.stroke();
                    
                    ctx.restore();
                    
                    // Update animation values
                    radius += 1.5;
                    opacity -= 0.05;
                    
                    requestAnimationFrame(animateMiss);
                } else {
                    effectCanvas.remove();
                }
            };
            
            animateMiss();
        }
    }
    
    // Give bear push
    giveBearPush(isBackward = false) {
        if (!this.bearGameState.gameActive || !this.timelineChart || this.bearGameState.pushCooldown) return;
        
        // Implement push cooldown
        this.bearGameState.pushCooldown = true;
        
        setTimeout(() => {
            this.bearGameState.pushCooldown = false;
        }, 500); // 0.5 second cooldown
        
        if (this.timelineChart.characterData && this.timelineChart.sparkleInterval) {
            // Base push strength
            let forwardPush = 0.05;
            let backwardPush = -0.03;
            
            // Reduce push effectiveness on steep uphills
            const currentSlope = this.timelineChart.characterData.currentSlope || 0;
            if (currentSlope > 0 && !isBackward) {
                // Uphill forward pushes are less effective
                const uphillPenalty = Math.max(0.3, 1 - currentSlope / 15); // At slope 15, only 30% effective
                forwardPush *= uphillPenalty;
            } else if (currentSlope < 0 && isBackward) {
                // Backward pushes uphill (against downward slope) are less effective
                const uphillPenalty = Math.max(0.3, 1 + currentSlope / 15);
                backwardPush *= uphillPenalty;
            }
            
            // Apply the adjusted boost
            this.timelineChart.characterData.pendingBoost = isBackward ? backwardPush : forwardPush;
            
            setTimeout(() => {
                if (this.bearGameState.gameActive && this.timelineChart.characterData && 
                    this.timelineChart.characterData.position > 0.95) {
                    this.endBearGame(true);
                }
            }, 100);
        }
    }

    // Create bear coin animation
    createBearCoins(points) {
        // Find the target - timeline star since bear game only runs with timeline open
        const targetElement = document.getElementById('star-timeline');
        if (!targetElement) return;
        
        // Cache target coordinates immediately
        const targetRect = targetElement.getBoundingClientRect();
        const finalX = targetRect.left + targetRect.width / 2;
        const finalY = targetRect.top + targetRect.height / 2;
        
        // console.log('Bear coin target:', finalX, finalY); // Debug log
        
        // Create coin emojis that fly to the target
        const numCoins = Math.min(points, 5);
        for (let i = 0; i < numCoins; i++) {
            // Capture coordinates for this specific coin
            const coinTargetX = finalX;
            const coinTargetY = finalY;
            
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.textContent = '💫';
                coin.style.cssText = `
                    position: fixed;
                    left: 50%;
                    top: 60%;
                    transform: translate(-50%, -50%);
                    font-size: 48px;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 1;
                    will-change: transform, left, top;
                `;
                document.body.appendChild(coin);
                
                // Force layout calculation
                coin.offsetHeight;
                
                // Store target on the element itself
                coin.dataset.targetX = coinTargetX;
                coin.dataset.targetY = coinTargetY;
                
                // Animate to cached target coordinates
                requestAnimationFrame(() => {
                    // Double-check target still exists
                    const checkTarget = document.getElementById('star-timeline');
                    if (!checkTarget) {
                        // console.warn('Target star disappeared during animation!');
                    }
                    
                    // Use inline styles with !important to prevent CSS conflicts
                    coin.style.cssText += `
                        transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
                        left: ${coinTargetX}px !important;
                        top: ${coinTargetY}px !important;
                        transform: translate(-50%, -50%) scale(0.3) !important;
                        opacity: 0 !important;
                    `;
                    // console.log('Animating coin to:', coinTargetX, coinTargetY); // Debug log
                    
                    // Check position after a moment
                    setTimeout(() => {
                        const currentLeft = parseFloat(coin.style.left);
                        const currentTop = parseFloat(coin.style.top);
                        // console.log('Coin position check:', currentLeft, currentTop, 'vs target:', coinTargetX, coinTargetY);
                    }, 500);
                });
                
                // Remove after animation completes
                setTimeout(() => {
                    coin.remove();
                }, 1100);
            }, i * 100);
        }
    }
    
    // Show bear reward animation
    showBearReward() {
        // Create celebratory bear emojis similar to answer feedback
        const bearEmojis = ['🐻', '🎉', '✨', '🏆', '🌟'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create main success bear
        const successBear = document.createElement('div');
        successBear.className = 'floating-bear-emoji';
        successBear.textContent = '🐻';
        successBear.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 120px;
            z-index: 10000;
            animation: bearSuccess 2s ease-out forwards;
        `;
        document.body.appendChild(successBear);
        
        // Create surrounding celebration emojis
        bearEmojis.forEach((emoji, index) => {
            setTimeout(() => {
                const angle = (index / bearEmojis.length) * Math.PI * 2;
                const radius = 150;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                const celebEmoji = document.createElement('div');
                celebEmoji.textContent = emoji;
                celebEmoji.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 40px;
                    z-index: 9999;
                    animation: bearCelebration 1s ease-out forwards;
                `;
                document.body.appendChild(celebEmoji);
                setTimeout(() => celebEmoji.remove(), 1000);
            }, index * 100);
        });
        
        // Remove main bear after animation
        setTimeout(() => successBear.remove(), 2000);
        
        // Don't use feedback animator - we have our own coin animation
        // that properly targets the timeline star
    }
    
    // Show bear game result dialog
    showBearResultDialog(success) {
        const dialog = document.createElement('div');
        dialog.className = 'bear-result-dialog';
        
        const overlay = document.createElement('div');
        overlay.className = 'bear-result-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        if (success) {
            dialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 25px;
                padding: 40px;
                max-width: 450px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                color: white;
            `;
            
            dialog.innerHTML = `
                <div style="font-size: 80px; margin-bottom: 20px; animation: bearDance 1s ease-in-out infinite alternate;">🐻</div>
                <h2 style="margin-bottom: 20px; font-size: 2.2rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">EUREKA! 🎊</h2>
                <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 20px;">
                    Phuzzy reached the critical insight! He's doing his signature "Data Dance" with his tiny spectacles bouncing.
                </p>
                <div style="background: rgba(255, 255, 255, 0.15); border-radius: 15px; padding: 20px; margin: 20px 0; backdrop-filter: blur(10px);">
                    <div style="font-size: 3rem; font-weight: bold; margin-bottom: 5px;">+5 RIZ</div>
                    <div style="font-weight: 600;">POINTS EARNED!</div>
                </div>
                <p style="font-style: italic; font-size: 1.1rem; margin-top: 20px;">
                    "Excellent curve navigation, colleague!"<br>
                    <span style="font-size: 0.9rem;">—Phuzzy</span>
                </p>
                <button id="bear-result-close" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 18px 50px;
                    font-size: 1.3rem;
                    font-weight: 700;
                    border-radius: 50px;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                ">Excellent!</button>
                <style>
                    @keyframes bearDance {
                        0% { transform: rotate(-5deg); }
                        100% { transform: rotate(5deg); }
                    }
                </style>
            `;
        } else {
            dialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 25px;
                padding: 40px;
                max-width: 450px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                color: white;
            `;
            
            dialog.innerHTML = `
                <div style="font-size: 80px; margin-bottom: 20px;">😅</div>
                <h2 style="margin-bottom: 20px; font-size: 2.2rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">TIME'S UP! ⏰</h2>
                <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 20px;">
                    Phuzzy got distracted by a fascinating data anomaly and lost track of time!
                </p>
                <div style="background: rgba(255, 255, 255, 0.15); border-radius: 15px; padding: 20px; margin: 20px 0; backdrop-filter: blur(10px);">
                    <p style="font-size: 1.1rem; margin: 0;">
                        "No worries! Even failed experiments contribute to our understanding."
                    </p>
                </div>
                <p style="font-size: 1rem; margin-top: 15px;">
                    The Professor will be ready for another attempt in <strong>10 minutes</strong>.
                </p>
                <button id="bear-result-close" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 18px 50px;
                    font-size: 1.3rem;
                    font-weight: 700;
                    border-radius: 50px;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                ">Next Time!</button>
            `;
        }
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            dialog.style.opacity = '1';
            dialog.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Handle close button
        const closeBtn = document.getElementById('bear-result-close');
        const closeDialog = () => {
            dialog.style.opacity = '0';
            dialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
            overlay.style.opacity = '0';
            setTimeout(() => {
                dialog.remove();
                overlay.remove();
            }, 300);
        };
        
        closeBtn.onclick = closeDialog;
        overlay.onclick = closeDialog;
        
        // Add hover effect to button
        closeBtn.onmouseover = () => {
            closeBtn.style.transform = 'translateY(-2px)';
            closeBtn.style.boxShadow = success ? 
                '0 6px 20px rgba(59, 130, 246, 0.4)' : 
                '0 6px 20px rgba(99, 102, 241, 0.4)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.transform = 'translateY(0)';
            closeBtn.style.boxShadow = success ? 
                '0 4px 12px rgba(59, 130, 246, 0.3)' : 
                '0 4px 12px rgba(99, 102, 241, 0.3)';
        };
    }
    
    // Create spark effect
    createSparkEffect(button) {
        const rect = button.getBoundingClientRect();
        const spark = document.createElement('div');
        spark.className = 'spark-effect';
        spark.style.left = (rect.left + rect.width/2) + 'px';
        spark.style.top = (rect.top + rect.height/2) + 'px';
        document.body.appendChild(spark);
        
        setTimeout(() => spark.remove(), 800);
    }

    // Update bear paw visibility based on cooldown
    updateBearPawVisibility() {
        const bearPaw = document.getElementById('bear-paw-main');
        if (!bearPaw) return;
        
        // Never show paw during an active game
        if (this.bearGameState.gameActive) {
            bearPaw.style.display = 'none';
            return;
        }
        
        // Check if game just ended - don't show paw immediately after game ends
        if (this.bearGameState.justEnded) {
            bearPaw.style.display = 'none';
            return;
        }
        
        // Only show bear paw if accordion is open
        if (!this.accordionOpen) {
            bearPaw.style.display = 'none';
            return;
        }
        
        const now = Date.now();
        const timeSinceLastPlay = (now - this.bearGameState.lastPlayTime) / (1000 * 60);
        
        if (timeSinceLastPlay >= this.bearGameState.cooldownMinutes) {
            bearPaw.style.display = 'block';
            bearPaw.classList.remove('cooldown');
            // console.log('Bear paw shown - cooldown expired');
        } else {
            bearPaw.style.display = 'none';
            // console.log(`Bear paw hidden - ${this.bearGameState.cooldownMinutes - timeSinceLastPlay} minutes left`);
        }
    }

    // Clean up charts
    cleanupCharts() {
        if (this.timelineChart) {
            this.timelineChart.destroy();
            this.timelineChart = null;
        }
    }

    // Toggle dimension
    toggleDimension(dimension) {
        if (!this.timelineChart) return;
        
        const chart = this.timelineChart;
        const isVisible = chart.visibleDimensions[dimension];
        const isHighlighted = chart.highlightedDimension === dimension;
        
        const button = document.querySelector(`.timeline-chart-section .toggle-btn[data-dimension="${dimension}"]`);
        if (!button) return;
        
        if (!isVisible) {
            // OFF → ON
            chart.visibleDimensions[dimension] = true;
            button.classList.add('active');
            button.classList.remove('highlight-mode');
            chart.highlightedDimension = null;
            // Track this as the most recently enabled dimension
            this.lastEnabledDimension = dimension;
        } else if (!isHighlighted) {
            // ON → HIGHLIGHT
            // Clear other highlights
            document.querySelectorAll('.timeline-chart-section .toggle-btn').forEach(btn => {
                btn.classList.remove('highlight-mode');
            });
            // Clear any existing text highlights first
            this.clearTextHighlights();
            chart.highlightedDimension = dimension;
            button.classList.add('highlight-mode');
            // Highlight keywords in scenario text
            this.highlightKeywordsInText(dimension);
            // Track this as the most recently enabled dimension
            this.lastEnabledDimension = dimension;
        } else {
            // HIGHLIGHT → OFF (ignore for dimension selection)
            chart.visibleDimensions[dimension] = false;
            chart.highlightedDimension = null;
            button.classList.remove('active', 'highlight-mode');
            // Clear text highlights
            this.clearTextHighlights();
            // Don't update lastEnabledDimension when turning OFF
        }
        
        chart.redraw();
        
        // Update info boxes to reflect new dimension selection
        this.updateInfoBoxes();
    }
    
    // Highlight keywords in scenario text
    highlightKeywordsInText(dimension) {
        const scenarioText = document.getElementById('scenario-text');
        if (!scenarioText || !this.currentScenario) return;
        
        // Store original text if not already stored
        if (!scenarioText.hasAttribute('data-original-text')) {
            scenarioText.setAttribute('data-original-text', this.currentScenario.text);
        }
        
        const originalText = scenarioText.getAttribute('data-original-text');
        const keywords = this.currentScenario.reviewKeywords[dimension]?.keywords || [];
        
        if (keywords.length === 0) {
            // Re-apply formatting when no keywords
            const formattedText = this.formatScenarioText(originalText);
            scenarioText.innerHTML = formattedText;
            scenarioText.style.lineHeight = '1.4';
            
            // Show a tooltip message
            this.showNoKeywordsTooltip(dimension);
            return;
        }
        
        // Color schemes for each dimension
        const colors = {
            logic: { bg: '#dbeafe', color: '#3b82f6' },
            emotion: { bg: '#fce7f3', color: '#ec4899' },
            balanced: { bg: '#d1fae5', color: '#10b981' },
            agenda: { bg: '#fef3c7', color: '#f59e0b' }
        };
        
        const colorScheme = colors[dimension];
        
        // First apply formatting
        let formattedText = this.formatScenarioText(originalText);
        
        // Sort keywords by length (longer first) to avoid partial matches
        const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
        
        // Create regex pattern that won't match inside HTML tags
        const pattern = sortedKeywords
            .map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|');
        const regex = new RegExp(`(?![^<]*>)(${pattern})`, 'gi');
        
        // Apply highlights
        const highlightedText = formattedText.replace(regex, match => 
            `<span style="background-color: ${colorScheme.bg}; color: ${colorScheme.color}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${match}</span>`
        );
        
        scenarioText.innerHTML = highlightedText;
    }
    
    // Clear text highlights
    clearTextHighlights() {
        const scenarioText = document.getElementById('scenario-text');
        if (!scenarioText) return;
        
        const originalText = scenarioText.getAttribute('data-original-text');
        if (originalText) {
            // Re-apply formatting when clearing highlights
            const formattedText = this.formatScenarioText(originalText);
            scenarioText.innerHTML = formattedText;
            scenarioText.style.lineHeight = '1.4';
        }
    }
    
    // Show tooltip when no keywords exist
    showNoKeywordsTooltip(dimension) {
        const dimensionNames = {
            logic: 'logical flaws',
            emotion: 'emotional triggers',
            balanced: 'balanced elements',
            agenda: 'agenda markers'
        };
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
            animation: tooltipFade 2.5s ease-out forwards;
        `;
        tooltip.textContent = `No ${dimensionNames[dimension]} detected in this scenario`;
        
        // Position near the scenario text
        const scenarioText = document.getElementById('scenario-text');
        const rect = scenarioText.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - 150 + 'px';
        tooltip.style.top = rect.bottom + 10 + 'px';
        
        document.body.appendChild(tooltip);
        
        // Remove after animation
        setTimeout(() => tooltip.remove(), 2500);
    }
    
    // Show bear reward animation
    showBearReward() {
        const scoreTracker = document.getElementById('score-tracker');
        if (!scoreTracker) return;
        
        const targetRect = scoreTracker.getBoundingClientRect();
        
        // Create multiple floating bear rewards
        const rewards = ['🐻', '✨', '🏆', '✨', '🐻'];
        rewards.forEach((icon, i) => {
            setTimeout(() => {
                const reward = document.createElement('div');
                reward.className = 'floating-reward';
                reward.style.cssText = `
                    position: fixed;
                    font-size: ${icon === '🏆' ? '60px' : '40px'};
                    z-index: 10000;
                    pointer-events: none;
                `;
                reward.textContent = icon;
                
                // Start from bear's finishing position
                const bearCanvas = document.getElementById('timeline-chart');
                const bearRect = bearCanvas.getBoundingClientRect();
                const startX = bearRect.right - 50;
                const startY = bearRect.top + bearRect.height / 2;
                
                // Animate to score tracker
                reward.style.left = startX + 'px';
                reward.style.top = startY + 'px';
                reward.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                document.body.appendChild(reward);
                
                // Trigger animation
                setTimeout(() => {
                    reward.style.left = (targetRect.left + targetRect.width / 2 - 20) + 'px';
                    reward.style.top = (targetRect.top + targetRect.height / 2 - 20) + 'px';
                    reward.style.transform = 'scale(0) rotate(720deg)';
                    reward.style.opacity = '0';
                }, 50);
                
                // Remove after animation
                setTimeout(() => reward.remove(), 1600);
            }, i * 200);
        });
        
        // Also use feedback animator if available
        if (window.gameEngine && window.gameEngine.uiController && window.gameEngine.uiController.feedbackAnimator) {
            window.gameEngine.uiController.feedbackAnimator.showScoreIncrease(5);
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: successPulse 4s ease-out;
        `;
        successMsg.textContent = '🎉 Runner Bear made it home! +5 RIZ!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 5000); // Extended from 2500ms to 5000ms
    }
    
    // Reposition score tracker
    repositionScoreTracker(toTimeline) {
        // Score tracker is now permanently fixed at top - no repositioning needed
        return;
    }
}

// Make class available globally
window.TimelineAnalysis = TimelineAnalysis;

// Global functions for onclick handlers
window.toggleTimelineAnalysis = function() {
    window.timelineAnalysis.toggleAccordion();
};

window.handleBearPawClick = function() {
    window.timelineAnalysis.handleBearPawClick();
};

window.giveBearPush = function() {
    window.timelineAnalysis.giveBearPush();
};

window.toggleDimension = function(chartId, dimension) {
    window.timelineAnalysis.toggleDimension(dimension);
};