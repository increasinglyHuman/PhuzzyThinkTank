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
        this.isDrawing = false;
        
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
        console.log('🐻 Bear analyzing text for keyword positions...');
        const dimensionData = {};
        
        // Process each dimension's keywords to find exact positions
        ['logic', 'emotion', 'balanced', 'agenda'].forEach(dimension => {
            const dimensionKeywords = keywords[dimension] || [];
            const points = [];
            
            dimensionKeywords.forEach(keywordItem => {
                let phrase, weight;
                
                if (typeof keywordItem === 'string') {
                    phrase = keywordItem;
                    weight = 50; // Default weight for old format
                } else if (typeof keywordItem === 'object' && keywordItem.phrase) {
                    phrase = keywordItem.phrase;
                    weight = keywordItem.weight || 50;
                } else {
                    return; // Skip invalid entries
                }
                
                // Find all occurrences of this phrase in the text
                const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const position = match.index / text.length; // Relative position 0-1
                    
                    points.push({
                        phrase: phrase,
                        weight: weight,
                        position: position,
                        textIndex: match.index
                    });
                    
                    console.log(`🎯 Found "${phrase}" at position ${(position * 100).toFixed(1)}% with weight ${weight}`);
                }
            });
            
            // Sort points by position for smooth spline drawing
            points.sort((a, b) => a.position - b.position);
            dimensionData[dimension] = points;
        });
        
        return dimensionData;
    }
    
    scoreKeywords(sentence, keywords) {
        if (!keywords || !Array.isArray(keywords)) return 0;
        
        let score = 0;
        keywords.forEach(keywordItem => {
            // Handle both old format (strings) and new format (objects with phrase/weight)
            let phrase, weight;
            
            if (typeof keywordItem === 'string') {
                // Old format: simple string
                phrase = keywordItem;
                weight = Math.min(10, keywordItem.length); // Old weighting system
            } else if (typeof keywordItem === 'object' && keywordItem.phrase) {
                // New format: {phrase: "text", weight: number}
                phrase = keywordItem.phrase;
                weight = keywordItem.weight || 10; // Use specified weight
            } else {
                return; // Skip invalid entries
            }
            
            // Escape special regex characters
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = sentence.match(regex);
            if (matches) {
                // Apply weighted scoring: matches * weight (instead of old formula)
                score += matches.length * weight;
            }
        });
        
        // Return score without arbitrary multiplication for weighted keywords
        return Math.min(100, score);
    }
    
    draw(text, keywords) {
        console.log('🐻 BEAR TIMELINE ENTRY - TimelineChart.draw called');
        console.log('🔍 Bear text check:', text ? `${text.length} chars` : 'NO TEXT');
        console.log('🔍 Bear keywords check:', keywords ? Object.keys(keywords) : 'NO KEYWORDS');
        
        this.currentData = this.analyzeText(text, keywords);
        this.currentKeywords = keywords;
        
        console.log('Analyzed data:', this.currentData);
        
        this.redraw();
    }
    
    redraw() {
        if (!this.currentData) return;
        
        // Prevent infinite redraw loops
        if (this.isDrawing) {
            console.log('🐻 Bear preventing redraw loop');
            return;
        }
        this.isDrawing = true;
        
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
        
        // Draw keyword dots and splines
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899', 
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        visibleDimensions.forEach(dimension => {
            const shouldFade = this.highlightedDimension && this.highlightedDimension !== dimension;
            const dimensionPoints = data[dimension] || [];
            
            if (dimensionPoints.length > 0) {
                // Phase 1: Draw smooth spline connecting the keyword points
                this.drawKeywordSpline(dimensionPoints, colors[dimension], padding, width, height, shouldFade);
                
                // Phase 2: Draw precise dots at keyword positions  
                this.drawKeywordDots(dimensionPoints, colors[dimension], padding, width, height, shouldFade);
            }
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
        
        // Reset drawing flag to allow future redraws
        this.isDrawing = false;
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
        console.log(`🐻 Bear drawLine called for ${dimension}:`, data?.length, 'points');
        
        const colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        
        const color = colors[dimension];
        this.ctx.strokeStyle = shouldFade ? color + '30' : color;
        this.ctx.lineWidth = shouldFade ? 3 : 4; // Thicker lines for better visibility
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Calculate wave parameters based on weighted keyword data
        let waveAmplitude = this.calculateWaveAmplitude(data, dimension);
        let waveFrequency = this.calculateWaveFrequency(data, dimension);
        let baseAmplification = this.calculateBaseAmplification(data, dimension);
        
        // Enhanced amplification for better visibility
        waveAmplitude *= 3.0; // Always amplify for better visibility
        baseAmplification *= 2.5;
        
        // Even more amplification during bear game
        if (window.timelineAnalysis && window.timelineAnalysis.bearGameState && 
            window.timelineAnalysis.bearGameState.gameActive) {
            waveAmplitude *= 2.0;
            baseAmplification *= 2.0;
        }
        
        // Pre-calculate all transformed values to find min/max for proper scaling
        let minValue = Infinity;
        let maxValue = -Infinity;
        const transformedPoints = [];
        
        data.forEach(point => {
            const transformedY = this.applyWaveTransformation(
                point, dimension, waveAmplitude, waveFrequency, baseAmplification
            );
            transformedPoints.push({
                ...point,
                transformedY: transformedY
            });
            minValue = Math.min(minValue, transformedY);
            maxValue = Math.max(maxValue, transformedY);
        });
        
        // 🎯 PROPER SCALING: No vertical squashing, full 0-100 range preserved
        // Y-axis: Direct mapping of 0-100 values to canvas height
        // X-axis: Distribute points across available width based on position in text
        
        // 🌊 BEAUTIFUL SPLINE CURVES with proper scaling
        this.drawCatmullRomSpline(transformedPoints, padding, width, height, shouldFade, color);
    }
    
    /**
     * 🎨 Draw smooth Catmull-Rom spline through data points
     * No Y-axis squashing - maintains full 0-100 range!
     */
    drawCatmullRomSpline(transformedPoints, padding, width, height, shouldFade, color) {
        console.log('🐻 Bear spline debug - transformedPoints:', transformedPoints.length, transformedPoints.slice(0, 3));
        
        if (transformedPoints.length === 0) {
            console.log('🐻 Bear says: No points to draw!');
            return;
        }
        
        // Convert data points to canvas coordinates with PROPER scaling
        const canvasPoints = transformedPoints.map(point => ({
            x: padding + (point.position || 0) * width, // X based on text position
            y: padding + height - (Math.max(0, Math.min(100, point.transformedY)) / 100) * height // Y direct 0-100 mapping
        }));
        
        console.log('🐻 Bear canvas points:', canvasPoints.slice(0, 3));
        console.log('🐻 Bear first point detail:', transformedPoints[0]);
        console.log('🐻 Bear canvas dimensions:', { padding, width, height });
        
        this.ctx.beginPath();
        
        if (canvasPoints.length === 1) {
            // Single point - draw a circle
            const point = canvasPoints[0];
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            return;
        }
        
        if (canvasPoints.length === 2) {
            // Two points - draw a line
            this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
            this.ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
        } else {
            // 3+ points - draw smooth Catmull-Rom spline
            this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
            
            for (let i = 0; i < canvasPoints.length - 1; i++) {
                // Get control points for Catmull-Rom spline
                const p0 = canvasPoints[Math.max(0, i - 1)];
                const p1 = canvasPoints[i];
                const p2 = canvasPoints[i + 1];
                const p3 = canvasPoints[Math.min(canvasPoints.length - 1, i + 2)];
                
                // Calculate tangent vectors for smooth curves
                const tension = 0.4; // Curve smoothness (0.0 = sharp corners, 1.0 = very smooth)
                
                // Catmull-Rom control points
                const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
                const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
                
                const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
                const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
                
                // Draw cubic Bezier curve segment
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            }
        }
        
        this.ctx.stroke();
        
        // Draw data points for reference (if not too cluttered)
        if (!shouldFade && transformedPoints.length <= 15) {
            this.ctx.fillStyle = color;
            canvasPoints.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Subtle white outline for visibility
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                this.ctx.strokeStyle = shouldFade ? color + '30' : color;
                this.ctx.lineWidth = shouldFade ? 2 : 3;
            });
        }
    }
    
    calculateWaveAmplitude(data, dimension) {
        // Base amplitude on the intensity variation in the data
        let totalVariation = 0;
        let maxScore = 0;
        
        data.forEach(point => {
            const score = point.scores[dimension];
            maxScore = Math.max(maxScore, score);
            if (data.length > 1) {
                const avgScore = data.reduce((sum, p) => sum + p.scores[dimension], 0) / data.length;
                totalVariation += Math.abs(score - avgScore);
            }
        });
        
        // More variation = bigger waves, higher scores = bigger waves
        const variationFactor = totalVariation / Math.max(data.length, 1);
        const intensityFactor = maxScore / 100;
        
        return Math.max(10, Math.min(40, 15 + variationFactor * 0.5 + intensityFactor * 20));
    }
    
    calculateWaveFrequency(data, dimension) {
        // More data points = higher frequency waves for detail
        // Fewer points = lower frequency for smoother curves
        const baseFrequency = 2; // Base number of wave cycles
        const dataComplexity = Math.min(data.length / 10, 3); // Up to 3x frequency boost
        
        return baseFrequency + dataComplexity;
    }
    
    calculateBaseAmplification(data, dimension) {
        // Amplify based on weighted keyword density
        let totalWeight = 0;
        let totalKeywords = 0;
        
        data.forEach(point => {
            const score = point.scores[dimension];
            if (score > 0) {
                totalWeight += score;
                totalKeywords++;
            }
        });
        
        if (totalKeywords === 0) return 1.5; // Minimal amplification for no keywords
        
        const avgWeight = totalWeight / totalKeywords;
        // Higher average weight = more amplification
        return Math.max(1.5, Math.min(4.0, 1.5 + (avgWeight / 50)));
    }
    
    applyWaveTransformation(point, dimension, waveAmplitude, waveFrequency, baseAmplification) {
        // Get base score with weighted keyword influence
        let yValue = point.scores[dimension];
        
        // Apply base amplification to enhance peaks and valleys
        const deviation = yValue - 50;
        yValue = 50 + (deviation * baseAmplification);
        
        // Create sin wave that travels through the data
        // Use position to determine wave phase, creating a continuous wave
        const wavePhase = point.position * Math.PI * waveFrequency;
        
        // Modulate wave amplitude based on data intensity at this point
        const intensityModulation = Math.max(0.3, yValue / 100); // Never go below 30% amplitude
        const modulatedAmplitude = waveAmplitude * intensityModulation;
        
        // Add the sin wave transformation
        yValue += Math.sin(wavePhase) * modulatedAmplitude;
        
        return yValue;
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
        
        // Use the same wave calculation methods as drawLine
        let waveAmplitude = this.calculateWaveAmplitude(data, dimension);
        let waveFrequency = this.calculateWaveFrequency(data, dimension);
        let baseAmplification = this.calculateBaseAmplification(data, dimension);
        
        // Enhanced amplification during bear game
        waveAmplitude *= 2.5;
        baseAmplification *= 2.0;
        
        // Pre-calculate all transformed values
        let minValue = Infinity;
        let maxValue = -Infinity;
        const transformedPoints = [];
        
        data.forEach(point => {
            const transformedY = this.applyWaveTransformation(
                point, dimension, waveAmplitude, waveFrequency, baseAmplification
            );
            transformedPoints.push(transformedY);
            minValue = Math.min(minValue, transformedY);
            maxValue = Math.max(maxValue, transformedY);
        });
        
        // Use fixed 0-100 scale for character animation consistency
        const scaleFactor = 100;
        const baselineOffset = 0;
        
        // Store wave parameters for physics calculations
        this.characterData.waveParams = {
            waveAmplitude,
            waveFrequency,
            baseAmplification,
            scaleFactor,
            baselineOffset,
            transformedPoints
        };
        
        // Helper to get actual deformed Y value
        const getDeformedY = (point) => {
            const transformedY = this.applyWaveTransformation(
                point, dimension, waveAmplitude, waveFrequency, baseAmplification
            );
            return (transformedY + baselineOffset) / scaleFactor; // Normalized 0-1
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
        
        // Use stored wave parameters from startSparkles
        const waveParams = this.characterData.waveParams;
        if (!waveParams) return; // Safety check
        
        // Helper function to get transformed Y value at any position
        const getTransformedY = (position) => {
            // Create a virtual point at this position for wave calculation
            const virtualPoint = {
                position: position,
                scores: {}
            };
            
            // Interpolate scores from nearby data points
            const virtualDataIndex = position * (data.length - 1);
            const lowerIndex = Math.floor(virtualDataIndex);
            const upperIndex = Math.min(lowerIndex + 1, data.length - 1);
            const interpolationProgress = virtualDataIndex - lowerIndex;
            
            const lowerScore = data[lowerIndex].scores[dimension];
            const upperScore = data[upperIndex].scores[dimension];
            virtualPoint.scores[dimension] = lowerScore + (upperScore - lowerScore) * interpolationProgress;
            
            // Apply wave transformation
            return this.applyWaveTransformation(
                virtualPoint, dimension, 
                waveParams.waveAmplitude, 
                waveParams.waveFrequency, 
                waveParams.baseAmplification
            );
        };
        
        // Get Y position using wave transformation
        const interpolatedY = getTransformedY(pos);
        
        const x = padding + pos * width;
        const y = padding + height - ((interpolatedY + waveParams.baselineOffset) / waveParams.scaleFactor * height);
        
        // Calculate slope angle using nearby points on the transformed curve
        const dx = 0.01;
        const nextPos = Math.min(pos + dx, 0.98);
        const nextInterpolatedY = getTransformedY(nextPos);
        const nextCanvasY = padding + height - ((nextInterpolatedY + waveParams.baselineOffset) / waveParams.scaleFactor * height);
        
        const slopeAngle = Math.atan2(nextCanvasY - y, dx * width);
        
        // Add ground offset so ball sits on top of the curve, not inside it
        const groundOffset = 15; // Ball radius
        
        // Calculate curvature for curve-hugging behavior
        const prevPos = Math.max(0, pos - dx);
        const prevInterpolatedY = getTransformedY(prevPos);
        
        // Second derivative approximation for curvature
        const curvature = (nextInterpolatedY - 2 * interpolatedY + prevInterpolatedY) / (dx * dx);
        
        // At extreme curves, adjust ball position for better curve following
        let curveHugOffset = 0;
        if (Math.abs(curvature) > 500) { // Strong curvature threshold
            curveHugOffset = Math.sign(curvature) * Math.min(Math.abs(curvature) / 100, 8);
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
    
    // 🐻 NEW: Draw smooth spline connecting keyword points with thermodynamic cooling
    drawKeywordSpline(points, color, padding, width, height, shouldFade) {
        if (points.length === 0) return;
        
        console.log(`🐻 Drawing thermodynamic spline for ${points.length} keyword points`);
        
        // Add start and end anchors at neutral position (50)
        const neutralY = padding + height - (50 / 100) * height;
        const extendedPoints = [
            { position: 0, weight: 50, phrase: 'start', isAnchor: true },
            ...points,
            { position: 1, weight: 50, phrase: 'end', isAnchor: true }
        ];
        
        // Convert all points to canvas coordinates
        const canvasPoints = extendedPoints.map(point => ({
            x: padding + point.position * width,
            y: padding + height - (point.weight / 100) * height,
            weight: point.weight,
            phrase: point.phrase,
            position: point.position,
            isAnchor: point.isAnchor || false
        }));
        
        // Set line style
        this.ctx.strokeStyle = shouldFade ? this.fadeColor(color) : color;
        this.ctx.lineWidth = shouldFade ? 1.5 : 2.5;
        this.ctx.globalAlpha = shouldFade ? 0.3 : 0.8;
        
        this.ctx.beginPath();
        
        if (canvasPoints.length <= 2) {
            // Fallback for very few points
            this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
            if (canvasPoints.length === 2) {
                this.ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
            }
        } else {
            // Draw thermodynamic cooling spline
            this.drawThermodynamicSpline(canvasPoints, neutralY, width);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }
    
    // 🐻 NEW: Draw precise dots at keyword positions
    drawKeywordDots(points, color, padding, width, height, shouldFade) {
        if (points.length === 0) return;
        
        console.log(`🐻 Drawing ${points.length} keyword dots`);
        
        points.forEach(point => {
            const x = padding + point.position * width;
            const y = padding + height - (point.weight / 100) * height;
            
            // Set dot style
            this.ctx.fillStyle = shouldFade ? this.fadeColor(color) : color;
            this.ctx.globalAlpha = shouldFade ? 0.4 : 0.9;
            
            // Draw dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, shouldFade ? 3 : 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Optional: Add weight text for high-weight keywords
            if (point.weight >= 80 && !shouldFade) {
                this.ctx.fillStyle = '#374151';
                this.ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(point.weight.toString(), x, y - 8);
            }
        });
        
        this.ctx.globalAlpha = 1.0;
    }
    
    // 🐻 Helper: Draw Catmull-Rom spline path
    drawCatmullRomPath(points) {
        // Move to first point
        this.ctx.moveTo(points[0].x, points[0].y);
        
        // For each segment, draw smooth curve
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];
            
            // Calculate control points for smooth curve
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    }
    
    // 🐻 NEW: Draw thermodynamic cooling spline with heat decay between keywords
    drawThermodynamicSpline(canvasPoints, neutralY, totalWidth) {
        // Parameters for cooling theory
        const coolingRate = 0.8; // How strongly it pulls toward neutral (0.0 = no cooling, 1.0 = instant cooling)
        const minTimeGap = 0.05; // Minimum time gap to apply cooling (5% of timeline)
        
        // Generate smooth curve path through all points with cooling applied
        const smoothPath = this.generateCoolingPath(canvasPoints, neutralY, coolingRate, minTimeGap);
        
        // Draw the smooth spline through the cooling-adjusted path
        this.drawSmoothSplinePath(smoothPath);
    }
    
    // 🐻 NEW: Generate cooling path with intermediate points for smooth splines
    generateCoolingPath(canvasPoints, neutralY, coolingRate, minTimeGap) {
        const pathPoints = [canvasPoints[0]]; // Start with first point
        
        for (let i = 0; i < canvasPoints.length - 1; i++) {
            const currentPoint = canvasPoints[i];
            const nextPoint = canvasPoints[i + 1];
            const timeGap = nextPoint.position - currentPoint.position;
            
            if (timeGap > minTimeGap) {
                // Add cooling intermediate points for smooth spline
                const intermediatePoints = this.generateCoolingPoints(currentPoint, nextPoint, neutralY, timeGap, coolingRate);
                pathPoints.push(...intermediatePoints);
            }
            
            // Always add the next keyword point
            pathPoints.push(nextPoint);
        }
        
        return pathPoints;
    }
    
    // 🐻 NEW: Generate intermediate cooling points between two keywords
    generateCoolingPoints(startPoint, endPoint, neutralY, timeGap, coolingRate) {
        const numPoints = Math.max(3, Math.floor(timeGap * 15)); // More points for longer gaps
        const intermediatePoints = [];
        
        for (let i = 1; i < numPoints; i++) {
            const t = i / numPoints; // Progress between points (0 to 1)
            
            // Linear interpolation between start and end points
            const baseX = startPoint.x + (endPoint.x - startPoint.x) * t;
            const baseY = startPoint.y + (endPoint.y - startPoint.y) * t;
            
            // Calculate cooling effect - strongest in middle, weaker near keywords
            const distanceFromStart = t;
            const distanceFromEnd = 1 - t;
            const coolingStrength = Math.min(distanceFromStart, distanceFromEnd) * 2;
            
            // Apply cooling toward neutral position
            const coolingEffect = coolingRate * timeGap * coolingStrength;
            const cooledY = baseY + (neutralY - baseY) * coolingEffect;
            
            intermediatePoints.push({
                x: baseX,
                y: cooledY,
                weight: 50, // Intermediate points trend toward neutral
                position: startPoint.position + (endPoint.position - startPoint.position) * t,
                isIntermediate: true
            });
        }
        
        return intermediatePoints;
    }
    
    // 🐻 NEW: Draw smooth spline path through all points (keywords + cooling intermediates)
    drawSmoothSplinePath(pathPoints) {
        if (pathPoints.length <= 1) return;
        
        this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        
        if (pathPoints.length === 2) {
            this.ctx.lineTo(pathPoints[1].x, pathPoints[1].y);
            return;
        }
        
        // Draw smooth Catmull-Rom spline through all points
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p0 = pathPoints[Math.max(0, i - 1)];
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            const p3 = pathPoints[Math.min(pathPoints.length - 1, i + 2)];
            
            // Calculate smooth control points
            const tension = 0.4; // Curve smoothness
            const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
            const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
            const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
            const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
            
            // Draw smooth cubic bezier curve
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    }
    
    // 🐻 Helper: Fade color for non-highlighted dimensions
    fadeColor(color) {
        // Convert hex to rgba with reduced opacity
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
}

// Make available globally
window.TimelineChart = TimelineChart;