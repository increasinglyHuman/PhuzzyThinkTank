// ===== UI/TIMELINE-CHART.JS =====
// Timeline Chart Class for Language Evolution Visualization

class TimelineChart {
    constructor(canvas) {
        console.log('TimelineChart constructor called with canvas:', canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentData = null;
        this.currentKeywords = null;
        this.sparkleInterval = null;
        this.characterData = null;
        this.showAnnotations = false;
        this.highlightedDimension = null;
        
        // Visible dimensions state
        this.visibleDimensions = {
            logic: true,
            emotion: true,
            balanced: true,
            agenda: true
        };
        
        // Set canvas size without pixel density scaling
        const displayWidth = 600;
        const displayHeight = 300;
        
        // Set both display and actual size to same values
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        console.log('Canvas setup - Display:', canvas.style.width, 'x', canvas.style.height, 'Actual:', canvas.width, 'x', canvas.height);
    }
    
    analyzeText(text, keywords) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const data = [];
        
        sentences.forEach((sentence, index) => {
            const scores = {
                logic: this.scoreKeywords(sentence, keywords.logic || []),
                emotion: this.scoreKeywords(sentence, keywords.emotion || []),
                balanced: this.scoreKeywords(sentence, keywords.balanced || []),
                agenda: this.scoreKeywords(sentence, keywords.agenda || [])
            };
            
            data.push({
                sentence: sentence.trim(),
                position: index / Math.max(1, sentences.length - 1),
                scores
            });
        });
        
        return data;
    }
    
    scoreKeywords(sentence, keywords) {
        if (!keywords || !Array.isArray(keywords)) return 0;
        
        let score = 0;
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = sentence.match(regex);
            if (matches) {
                score += matches.length * Math.min(10, keyword.length);
            }
        });
        return Math.min(100, score * 2);
    }
    
    draw(text, keywords) {
        console.log('TimelineChart.draw called');
        console.log('Text length:', text.length);
        console.log('Keywords:', keywords);
        
        this.currentData = this.analyzeText(text, keywords);
        this.currentKeywords = keywords;
        
        console.log('Analyzed data:', this.currentData);
        
        this.redraw();
    }
    
    redraw() {
        if (!this.currentData) return;
        
        const data = this.currentData;
        const keywords = this.currentKeywords;
        const padding = 50;
        const width = this.canvas.width - padding * 2;
        const height = this.canvas.height - padding * 2;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle border
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0.5, 0.5, this.canvas.width - 1, this.canvas.height - 1);
        
        // Grid
        this.drawGrid(padding, width, height);
        
        // Draw bear game timer bar if game is active
        if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && window.timelineAnalysis.bearGameState.gameActive) {
            this.drawGameTimer(padding, width, height);
        }
        
        // Get visible dimensions
        const visibleDimensions = Object.keys(this.visibleDimensions)
            .filter(dim => this.visibleDimensions[dim]);
        
        // Draw lines
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        visibleDimensions.forEach(dimension => {
            const shouldFade = this.highlightedDimension && this.highlightedDimension !== dimension;
            this.drawLine(data, dimension, padding, width, height, shouldFade);
        });
        
        // Handle character animation - only during active game
        if (visibleDimensions.length === 1 && window.timelineAnalysis && 
            window.timelineAnalysis.bearGameState.gameActive) {
            // Start sparkles if not running
            if (!this.sparkleInterval) {
                this.startSparkles(data, visibleDimensions[0], padding, width, height);
            }
            
            // Draw character if data exists
            if (this.characterData && this.characterData.position !== undefined) {
                this.drawCharacterOnCurve(data, visibleDimensions[0], padding, width, height);
            }
        } else {
            // Stop sparkles if game not active or multiple dimensions visible
            this.stopSparkles();
        }
        
        // X-axis label
        this.ctx.fillStyle = '#718096';
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Reading Progress →', this.canvas.width / 2, this.canvas.height - 10);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.canvas.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Intensity', 0, 0);
        this.ctx.restore();
    }
    
    drawGrid(padding, width, height) {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * height / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + width, y);
            this.ctx.stroke();
            
            // Y-axis labels
            this.ctx.fillStyle = '#a0aec0';
            this.ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${100 - i * 25}%`, padding - 10, y + 4);
        }
    }
    
    drawGameTimer(padding, width, height) {
        const bearState = window.timelineAnalysis.bearGameState;
        const percentage = bearState.timeLeft / 30; // 30 seconds total
        
        // Timer bar position and size
        const barHeight = 12;
        const barY = padding + height + 10; // Below the chart
        const barWidth = width * percentage;
        
        // Calculate color based on time remaining
        let r, g, b;
        if (percentage > 0.5) {
            // Blue to green (20-10 seconds)
            const t = (percentage - 0.5) * 2;
            r = Math.round(59 * t);
            g = Math.round(130 * t + 185 * (1 - t));
            b = Math.round(246 * t + 129 * (1 - t));
        } else if (percentage > 0.25) {
            // Green to yellow (10-5 seconds)
            const t = (percentage - 0.25) * 4;
            r = Math.round(16 * t + 245 * (1 - t));
            g = Math.round(185 * t + 158 * (1 - t));
            b = Math.round(129 * t + 11 * (1 - t));
        } else {
            // Yellow to red (5-0 seconds)
            const t = percentage * 4;
            r = Math.round(245 * t + 239 * (1 - t));
            g = Math.round(158 * t + 68 * (1 - t));
            b = Math.round(11 * t + 71 * (1 - t));
        }
        
        // Draw timer bar background
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(padding, barY, width, barHeight);
        
        // Draw timer bar fill
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(padding, barY, barWidth, barHeight);
        
        // Add glow effect for last 5 seconds
        if (bearState.urgentMode) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(padding, barY, barWidth, barHeight);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawLine(data, dimension, padding, width, height, shouldFade = false) {
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        const color = colors[dimension];
        this.ctx.strokeStyle = shouldFade ? color + '30' : color;
        this.ctx.lineWidth = shouldFade ? 2 : 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Calculate difficulty multiplier if game is active
        let difficultyMultiplier = 1.0;
        let waveAmplitude = 0;
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
            window.timelineAnalysis.bearGameState.gameActive) {
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
        
        // Draw smooth curve using Bezier curves
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const x = padding + point.position * width;
            
            // Get base Y value
            let yValue = point.scores[dimension];
            
            // Apply peak amplification (amplify deviations from 50)
            const deviation = yValue - 50;
            yValue = 50 + (deviation * difficultyMultiplier);
            
            // Add wave interference
            const wavePhase = point.position * Math.PI * 4; // 2 full waves across timeline
            yValue += Math.sin(wavePhase) * waveAmplitude;
            
            // During game, allow values to exceed normal bounds for dramatic effect
            if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                window.timelineAnalysis.bearGameState.gameActive) {
                // Let peaks grow beyond bounds
            } else {
                // Normal clamping when game not active
                yValue = Math.max(0, Math.min(100, yValue));
            }
            
            // Dynamic scaling during game to keep peaks visible
            let scaleFactor = 100;
            let baselineOffset = 0;
            if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                window.timelineAnalysis.bearGameState.gameActive) {
                // Scale based on the actual range of values
                const range = maxValue - minValue;
                scaleFactor = range > 0 ? range : 100;
                // Offset so minimum value sits at bottom of chart
                baselineOffset = -minValue;
            }
            const y = padding + height - ((yValue + baselineOffset) / scaleFactor * height);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Use quadratic Bezier curve for smoothness
                const prevPoint = data[i - 1];
                const prevX = padding + prevPoint.position * width;
                
                // Apply same transformations to previous point
                let prevYValue = prevPoint.scores[dimension];
                const prevDeviation = prevYValue - 50;
                prevYValue = 50 + (prevDeviation * difficultyMultiplier);
                const prevWavePhase = prevPoint.position * Math.PI * 4;
                prevYValue += Math.sin(prevWavePhase) * waveAmplitude;
                // During game, allow values to exceed normal bounds
                if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                    window.timelineAnalysis.bearGameState.gameActive) {
                    // Let peaks grow beyond bounds
                } else {
                    prevYValue = Math.max(0, Math.min(100, prevYValue));
                }
                // Use same scale factor and baseline offset
                let scaleFactor = 100;
                let baselineOffset = 0;
                if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                    window.timelineAnalysis.bearGameState.gameActive) {
                    const range = maxValue - minValue;
                    scaleFactor = range > 0 ? range : 100;
                    baselineOffset = -minValue;
                }
                const prevY = padding + height - ((prevYValue + baselineOffset) / scaleFactor * height);
                
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                
                this.ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
        }
        
        // Draw to the last point
        if (data.length > 0) {
            const lastPoint = data[data.length - 1];
            const lastX = padding + lastPoint.position * width;
            
            // Apply transformations to last point too
            let lastYValue = lastPoint.scores[dimension];
            const lastDeviation = lastYValue - 50;
            lastYValue = 50 + (lastDeviation * difficultyMultiplier);
            const lastWavePhase = lastPoint.position * Math.PI * 4;
            lastYValue += Math.sin(lastWavePhase) * waveAmplitude;
            // During game, allow values to exceed normal bounds
            if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                window.timelineAnalysis.bearGameState.gameActive) {
                // Let peaks grow beyond bounds
            } else {
                lastYValue = Math.max(0, Math.min(100, lastYValue));
            }
            // Use same scale factor and baseline offset
            let scaleFactor = 100;
            let baselineOffset = 0;
            if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                window.timelineAnalysis.bearGameState.gameActive) {
                const range = maxValue - minValue;
                scaleFactor = range > 0 ? range : 100;
                baselineOffset = -minValue;
            }
            const lastY = padding + height - ((lastYValue + baselineOffset) / scaleFactor * height);
            
            this.ctx.lineTo(lastX, lastY);
        }
        
        this.ctx.stroke();
        
        // Draw points
        if (!shouldFade) {
            this.ctx.fillStyle = color;
            data.forEach(point => {
                const x = padding + point.position * width;
                const y = padding + height - (point.scores[dimension] / 100 * height);
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
    }
    
    startSparkles(data, dimension, padding, width, height) {
        // Initialize character data
        this.characterData = {
            position: 0,
            speed: 0.002,
            emoji: '🐻',
            state: 'rolling',
            velocity: 0,
            pendingBoost: 0
        };
        
        const dimensionEmojis = {
            logic: '🧠',
            emotion: '💖',
            balanced: '⚖️',
            agenda: '🎯'
        };
        
        this.characterData.emoji = dimensionEmojis[dimension] || '🐻';
        
        // Pre-calculate deformation parameters for physics
        const difficultyMultiplier = 6.0;
        const waveAmplitude = 100;
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        // Find min/max for scaling
        data.forEach(point => {
            let yValue = point.scores[dimension];
            const deviation = yValue - 50;
            yValue = 50 + (deviation * difficultyMultiplier);
            const wavePhase = point.position * Math.PI * 4;
            yValue += Math.sin(wavePhase) * waveAmplitude;
            minValue = Math.min(minValue, yValue);
            maxValue = Math.max(maxValue, yValue);
        });
        
        const range = maxValue - minValue;
        const scaleFactor = range > 0 ? range : 100;
        const baselineOffset = -minValue;
        
        // Helper to get actual deformed Y value
        const getDeformedY = (point) => {
            let yValue = point.scores[dimension];
            const deviation = yValue - 50;
            yValue = 50 + (deviation * difficultyMultiplier);
            const wavePhase = point.position * Math.PI * 4;
            yValue += Math.sin(wavePhase) * waveAmplitude;
            return (yValue + baselineOffset) / scaleFactor; // Normalized 0-1
        };
        
        // Physics simulation
        this.sparkleInterval = setInterval(() => {
            if (!this.characterData) return;
            
            const pos = this.characterData.position;
            
            if (pos >= 0.98) {
                this.characterData.position = 0.98;
                return;
            }
            
            // Sample multiple points for smoother slope calculation
            const sampleDistance = 0.005; // Sample ahead
            const currentPos = Math.max(0, pos);
            const nextPos = Math.min(0.99, pos + sampleDistance);
            
            // Get indices and interpolate Y values
            const currentIndex = Math.floor(currentPos * (data.length - 1));
            const currentLocalProgress = (currentPos * (data.length - 1)) % 1;
            const currentY1 = getDeformedY(data[currentIndex]);
            const currentY2 = currentIndex < data.length - 1 ? getDeformedY(data[currentIndex + 1]) : currentY1;
            const currentY = currentY1 + (currentY2 - currentY1) * currentLocalProgress;
            
            const nextIndex = Math.floor(nextPos * (data.length - 1));
            const nextLocalProgress = (nextPos * (data.length - 1)) % 1;
            const nextY1 = getDeformedY(data[nextIndex]);
            const nextY2 = nextIndex < data.length - 1 ? getDeformedY(data[nextIndex + 1]) : nextY1;
            const nextY = nextY1 + (nextY2 - nextY1) * nextLocalProgress;
            
            // Calculate actual slope
            const slope = (nextY - currentY) / sampleDistance;
            
            // Enhanced physics with realistic hill climbing
            const baseGravity = 0.0003;
            const momentum = Math.abs(this.characterData.velocity);
            
            // Different physics for uphill vs downhill
            let gravityEffect, slopeAcceleration, friction;
            
            if (slope < 0) { // Downhill
                // Gravity helps on downhills
                gravityEffect = -baseGravity * 0.5; // Reduced to prevent over-acceleration
                // Slope acceleration with drag
                const speedDrag = 1 - Math.min(momentum * 20, 0.7); // Up to 70% drag at high speeds
                slopeAcceleration = -slope * 0.002 * speedDrag; // Reduced and limited by drag
                friction = 0.975; // More friction to control speed
            } else if (slope > 0) { // Uphill
                // Gravity opposes on uphills (positive = slowing down)
                const slopeSeverity = Math.min(slope / 10, 2); // Cap at 2x for very steep slopes
                gravityEffect = baseGravity * (1 + slopeSeverity); // Stronger opposing force on steeper slopes
                
                // Slope deceleration
                slopeAcceleration = -slope * 0.005; // Stronger deceleration uphill
                
                // Momentum decay - faster decay on steeper slopes
                const momentumDecay = 0.92 - (slope * 0.002); // Steeper = faster decay
                friction = Math.max(momentumDecay, 0.85); // Cap minimum friction
                
                // Store slope for push effectiveness
                this.characterData.currentSlope = slope;
            } else { // Flat or valley
                gravityEffect = 0;
                slopeAcceleration = 0;
                friction = 0.98; // Less friction in valleys for better responsiveness
                this.characterData.currentSlope = 0;
            }
            
            // Apply boost if pending
            if (this.characterData.pendingBoost > 0) {
                this.characterData.velocity += this.characterData.pendingBoost;
                this.characterData.pendingBoost = 0;
            }
            
            // Update velocity with proper gravity application
            this.characterData.velocity += slopeAcceleration - gravityEffect;
            
            // Additional downforce at peaks to prevent flying
            if (Math.abs(slope) < 0.5 && currentY > 0.7) { // Near peak
                this.characterData.velocity *= 0.9; // Extra damping at peaks
            }
            
            this.characterData.velocity *= friction;
            
            // Minimum forward speed
            if (this.characterData.velocity < 0.0003) {
                this.characterData.velocity = 0.0003;
            }
            
            // Maximum speed cap to prevent absurd velocities
            if (this.characterData.velocity > 0.015) {
                this.characterData.velocity = 0.015;
            }
            
            // Smart position update with curve adhesion
            const oldPos = this.characterData.position;
            let newPos = oldPos + this.characterData.velocity;
            
            // Multi-step integration for better curve following
            const steps = 5; // More steps = better adhesion
            const stepSize = this.characterData.velocity / steps;
            
            for (let step = 0; step < steps; step++) {
                const testPos = oldPos + (stepSize * (step + 1));
                if (testPos >= 0.98) break;
                
                // Get Y at test position
                const testIndex = Math.floor(testPos * (data.length - 1));
                const testLocalProgress = (testPos * (data.length - 1)) % 1;
                const testY1 = getDeformedY(data[testIndex]);
                const testY2 = testIndex < data.length - 1 ? getDeformedY(data[testIndex + 1]) : testY1;
                const testY = testY1 + (testY2 - testY1) * testLocalProgress;
                
                // Check if we're moving too far from the curve
                const yDiff = Math.abs(testY - currentY);
                const maxYDiff = 0.15; // Maximum normalized Y difference allowed
                
                if (yDiff > maxYDiff) {
                    // We're overshooting - cap the position
                    newPos = oldPos + (stepSize * step) + (stepSize * 0.5); // Partial last step
                    break;
                }
            }
            
            this.characterData.position = newPos;
            
            // Determine state based on actual slope
            if (slope > 5) {
                this.characterData.state = 'struggling';
                this.characterData.speed = this.characterData.velocity * 0.7;
            } else if (slope < -5) {
                this.characterData.state = 'zooming';
                this.characterData.speed = this.characterData.velocity * 1.5;
            } else {
                this.characterData.state = 'rolling';
                this.characterData.speed = this.characterData.velocity;
            }
            
            // Clamp position
            if (this.characterData.position > 0.98) {
                this.characterData.position = 0.98;
            }
            
            this.redraw();
        }, 50); // 20 FPS for smoother physics
    }
    
    drawCharacterOnCurve(data, dimension, padding, width, height) {
        const pos = this.characterData.position;
        const dataIndex = Math.floor(pos * (data.length - 1));
        const nextIndex = Math.min(dataIndex + 1, data.length - 1);
        const localProgress = (pos * (data.length - 1)) % 1;
        
        // Calculate difficulty multiplier (same as in drawLine)
        let difficultyMultiplier = 1.0;
        let waveAmplitude = 0;
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
            window.timelineAnalysis.bearGameState.gameActive) {
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
        
        // Apply same transformations to get the modified curve values
        const getModifiedScore = (point, index) => {
            let yValue = point.scores[dimension];
            const deviation = yValue - 50;
            yValue = 50 + (deviation * difficultyMultiplier);
            const wavePhase = point.position * Math.PI * 4;
            yValue += Math.sin(wavePhase) * waveAmplitude;
            // During game, allow values to exceed normal bounds
            if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
                window.timelineAnalysis.bearGameState.gameActive) {
                return yValue; // No clamping during game
            } else {
                return Math.max(0, Math.min(100, yValue));
            }
        };
        
        // Use Catmull-Rom spline for smooth curve following
        const prevIndex = Math.max(dataIndex - 1, 0);
        const futureIndex = Math.min(dataIndex + 2, data.length - 1);
        
        const p0 = getModifiedScore(data[prevIndex], prevIndex);
        const p1 = getModifiedScore(data[dataIndex], dataIndex);
        const p2 = getModifiedScore(data[nextIndex], nextIndex);
        const p3 = getModifiedScore(data[futureIndex], futureIndex);
        
        // Catmull-Rom interpolation
        const t = localProgress;
        const t2 = t * t;
        const t3 = t2 * t;
        
        const interpolatedY = 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
        
        const x = padding + pos * width;
        // Use same dynamic scaling and baseline offset for character position
        let scaleFactor = 100;
        let baselineOffset = 0;
        if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
            window.timelineAnalysis.bearGameState.gameActive) {
            const range = maxValue - minValue;
            scaleFactor = range > 0 ? range : 100;
            baselineOffset = -minValue;
        }
        const y = padding + height - ((interpolatedY + baselineOffset) / scaleFactor * height);
        
        // Calculate slope angle with modified scores
        const dx = 0.01;
        const nextPos = Math.min(pos + dx, 0.98);
        const nextDataIndex = Math.floor(nextPos * (data.length - 1));
        const nextLocalProgress = (nextPos * (data.length - 1)) % 1;
        const nextY1 = getModifiedScore(data[nextDataIndex], nextDataIndex);
        const nextY2 = nextDataIndex < data.length - 1 ? getModifiedScore(data[nextDataIndex + 1], nextDataIndex + 1) : nextY1;
        const nextInterpolatedY = nextY1 + (nextY2 - nextY1) * nextLocalProgress;
        const nextCanvasY = padding + height - ((nextInterpolatedY + baselineOffset) / scaleFactor * height);
        
        const slopeAngle = Math.atan2(nextCanvasY - y, dx * width);
        
        // Add ground offset so ball sits on top of the curve, not inside it
        const groundOffset = 15; // Ball radius
        
        // Additional curve-hugging correction at extreme points
        // Check if we're at a peak or valley by looking at slope change
        const prevPos = Math.max(0, pos - 0.01);
        const prevDataIndex = Math.floor(prevPos * (data.length - 1));
        const prevY = getModifiedScore(data[prevDataIndex], prevDataIndex);
        
        const futurePos = Math.min(0.99, pos + 0.01);
        const futureDataIndex = Math.floor(futurePos * (data.length - 1));
        const futureY = getModifiedScore(data[futureDataIndex], futureDataIndex);
        
        // Calculate curvature (second derivative approximation)
        const curvature = (futureY - 2 * interpolatedY + prevY) / 0.0001;
        
        // At extreme curves, pull the ball closer to the curve
        let curveHugOffset = 0;
        if (Math.abs(curvature) > 1000) { // Strong curvature
            // Pull ball toward curve at peaks/valleys
            curveHugOffset = Math.sign(curvature) * Math.min(Math.abs(curvature) / 200, 10);
        }
        
        this.drawCharacter(x, y - groundOffset + curveHugOffset, dimension, this.characterData.state || 'rolling', 
                          this.characterData.speed || 0, slopeAngle);
    }
    
    drawCharacter(x, y, dimension, state, speed, angle) {
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        const color = colors[dimension];
        const radius = 15;
        
        // Draw ball
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Rolling rotation
        const rollRotation = (this.characterData.position || 0) * Math.PI * 8;
        this.ctx.rotate(rollRotation);
        
        // Ball gradient
        const gradient = this.ctx.createRadialGradient(0, -radius/3, 0, 0, 0, radius);
        gradient.addColorStop(0, color + 'ff');
        gradient.addColorStop(0.7, color + 'cc');
        gradient.addColorStop(1, color + '88');
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add rolling highlights
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius - 3, -Math.PI/4, Math.PI/4);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Motion trails
        if (state === 'zooming' && speed > 0.003) {
            for (let i = 1; i <= 3; i++) {
                const trailX = x - i * 15 * Math.cos(angle);
                const trailAlpha = 0.3 - i * 0.1;
                
                this.ctx.beginPath();
                this.ctx.arc(trailX, y, radius * (1 - i * 0.2), 0, Math.PI * 2);
                this.ctx.fillStyle = color + Math.floor(trailAlpha * 255).toString(16).padStart(2, '0');
                this.ctx.fill();
            }
        }
        
        // State indicator
        if (state === 'struggling') {
            // Sweat drops
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText('💦', x + radius, y - radius);
        }
    }
    
    stopSparkles() {
        if (this.sparkleInterval) {
            clearInterval(this.sparkleInterval);
            this.sparkleInterval = null;
            this.characterData = null;
        }
    }
    
    destroy() {
        this.stopSparkles();
        this.currentData = null;
        this.currentKeywords = null;
    }
}

// Make available globally
window.TimelineChart = TimelineChart;