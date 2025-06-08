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
        
        // Draw smooth curve using Bezier curves
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const x = padding + point.position * width;
            const y = padding + height - (point.scores[dimension] / 100 * height);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Use quadratic Bezier curve for smoothness
                const prevPoint = data[i - 1];
                const prevX = padding + prevPoint.position * width;
                const prevY = padding + height - (prevPoint.scores[dimension] / 100 * height);
                
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                
                this.ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
        }
        
        // Draw to the last point
        if (data.length > 0) {
            const lastPoint = data[data.length - 1];
            const lastX = padding + lastPoint.position * width;
            const lastY = padding + height - (lastPoint.scores[dimension] / 100 * height);
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
        
        // Physics simulation
        this.sparkleInterval = setInterval(() => {
            if (!this.characterData) return;
            
            const pos = this.characterData.position;
            const dataIndex = Math.floor(pos * (data.length - 1));
            const nextIndex = Math.min(dataIndex + 1, data.length - 1);
            
            if (dataIndex >= data.length - 1) {
                this.characterData.position = 0.98;
                return;
            }
            
            // Calculate slope
            const currentY = data[dataIndex].scores[dimension];
            const nextY = data[nextIndex].scores[dimension];
            const slope = (nextY - currentY) / 100;
            
            // Physics
            const gravity = 0.0003;
            const friction = 0.96;
            const slopeEffect = -slope * 0.001;
            
            // Apply boost if pending
            if (this.characterData.pendingBoost > 0) {
                this.characterData.velocity += this.characterData.pendingBoost;
                this.characterData.pendingBoost = 0;
            }
            
            // Update velocity
            this.characterData.velocity += slopeEffect - gravity;
            this.characterData.velocity *= friction;
            
            // Minimum forward speed
            if (this.characterData.velocity < 0.0005) {
                this.characterData.velocity = 0.0005;
            }
            
            // Update position
            this.characterData.position += this.characterData.velocity;
            
            // Determine state
            if (slope > 0.1) {
                this.characterData.state = 'struggling';
                this.characterData.speed = this.characterData.velocity;
            } else if (slope < -0.1) {
                this.characterData.state = 'zooming';
                this.characterData.speed = this.characterData.velocity * 2;
            } else {
                this.characterData.state = 'rolling';
                this.characterData.speed = this.characterData.velocity;
            }
            
            // Clamp position
            if (this.characterData.position > 0.98) {
                this.characterData.position = 0.98;
            }
            
            this.redraw();
        }, 100); // 10 FPS for perception
    }
    
    drawCharacterOnCurve(data, dimension, padding, width, height) {
        const pos = this.characterData.position;
        const dataIndex = Math.floor(pos * (data.length - 1));
        const nextIndex = Math.min(dataIndex + 1, data.length - 1);
        const localProgress = (pos * (data.length - 1)) % 1;
        
        // Use Catmull-Rom spline for smooth curve following
        const prevIndex = Math.max(dataIndex - 1, 0);
        const futureIndex = Math.min(dataIndex + 2, data.length - 1);
        
        const p0 = data[prevIndex].scores[dimension];
        const p1 = data[dataIndex].scores[dimension];
        const p2 = data[nextIndex].scores[dimension];
        const p3 = data[futureIndex].scores[dimension];
        
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
        const y = padding + height - (interpolatedY / 100 * height);
        
        // Calculate slope angle
        const dx = 0.01;
        const nextPos = Math.min(pos + dx, 0.98);
        const nextDataIndex = Math.floor(nextPos * (data.length - 1));
        const nextLocalProgress = (nextPos * (data.length - 1)) % 1;
        const nextY1 = data[nextDataIndex].scores[dimension];
        const nextY2 = nextDataIndex < data.length - 1 ? data[nextDataIndex + 1].scores[dimension] : nextY1;
        const nextInterpolatedY = nextY1 + (nextY2 - nextY1) * nextLocalProgress;
        const nextCanvasY = padding + height - (nextInterpolatedY / 100 * height);
        
        const slopeAngle = Math.atan2(nextCanvasY - y, dx * width);
        
        // Add ground offset so ball sits on top of the curve, not inside it
        const groundOffset = 15; // Ball radius
        this.drawCharacter(x, y - groundOffset, dimension, this.characterData.state || 'rolling', 
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