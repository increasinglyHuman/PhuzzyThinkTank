// ===== FUZZY CURVE VISUALIZATION =====
// Creates radar/spider charts showing scenario characteristics

class FuzzyCurveVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.dimensions = ['Logic', 'Emotion', 'Balanced', 'Agenda'];
        this.colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
    }
    
    drawRadarChart(scores, options = {}) {
        if (!this.ctx) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background circles
        this.drawBackgroundGrid(centerX, centerY, radius);
        
        // Draw axes
        this.drawAxes(centerX, centerY, radius);
        
        // Draw data
        this.drawDataArea(scores, centerX, centerY, radius, options);
        
        // Draw labels
        this.drawLabels(centerX, centerY, radius);
    }
    
    drawBackgroundGrid(centerX, centerY, radius) {
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        
        // Draw concentric circles at 20, 40, 60, 80, 100
        for (let i = 1; i <= 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            // Add percentage labels
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText((i * 20) + '%', centerX + 5, centerY - (radius * i) / 5);
        }
    }
    
    drawAxes(centerX, centerY, radius) {
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.lineWidth = 2;
        
        const angleStep = (2 * Math.PI) / 4; // 4 dimensions
        
        for (let i = 0; i < 4; i++) {
            const angle = -Math.PI / 2 + i * angleStep; // Start from top
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }
    
    drawDataArea(scores, centerX, centerY, radius, options) {
        const values = [
            scores.logic || 0,
            scores.emotion || 0,
            scores.balanced || 0,
            scores.agenda || 0
        ];
        
        const angleStep = (2 * Math.PI) / 4;
        
        // Create gradient fill
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.2)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.4)');
        
        // Draw filled area
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            const value = values[i] / 100; // Normalize to 0-1
            const x = centerX + radius * value * Math.cos(angle);
            const y = centerY + radius * value * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw outline
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw data points
        for (let i = 0; i < 4; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            const value = values[i] / 100;
            const x = centerX + radius * value * Math.cos(angle);
            const y = centerY + radius * value * Math.sin(angle);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = Object.values(this.colors)[i];
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawLabels(centerX, centerY, radius) {
        const angleStep = (2 * Math.PI) / 4;
        const labelOffset = 30;
        
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        
        this.dimensions.forEach((label, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const x = centerX + (radius + labelOffset) * Math.cos(angle);
            const y = centerY + (radius + labelOffset) * Math.sin(angle);
            
            // Add background to labels
            const metrics = this.ctx.measureText(label);
            const padding = 8;
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(
                x - metrics.width / 2 - padding,
                y - 10 - padding / 2,
                metrics.width + padding * 2,
                20 + padding
            );
            
            // Draw colored label
            this.ctx.fillStyle = Object.values(this.colors)[i];
            this.ctx.fillText(label, x, y + 5);
            
            // Add score value
            this.ctx.font = '12px sans-serif';
            this.ctx.fillStyle = '#6b7280';
            const score = this.lastScores ? this.lastScores[Object.keys(this.lastScores)[i]] : 0;
            this.ctx.fillText(score + '%', x, y + 20);
        });
    }
    
    // Animated transition between states
    animateTransition(fromScores, toScores, duration = 1000) {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentScores = {};
            for (const key in toScores) {
                const from = fromScores[key] || 0;
                const to = toScores[key] || 0;
                currentScores[key] = from + (to - from) * easeProgress;
            }
            
            this.lastScores = currentScores;
            this.drawRadarChart(currentScores);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}

// Export for usage
if (typeof window !== 'undefined') {
    window.FuzzyCurveVisualization = FuzzyCurveVisualization;
}