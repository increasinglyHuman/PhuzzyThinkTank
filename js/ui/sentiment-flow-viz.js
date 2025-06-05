// ===== SENTIMENT FLOW VISUALIZATION =====
// Shows how argument characteristics evolve through the text

class SentimentFlowVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.colors = {
            logic: '#3b82f6',
            emotion: '#ec4899',
            balanced: '#10b981',
            agenda: '#f59e0b'
        };
        this.dimensions = ['logic', 'emotion', 'balanced', 'agenda'];
    }
    
    analyzeTextFlow(text, reviewKeywords) {
        // Split text into sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const flowData = [];
        
        sentences.forEach((sentence, index) => {
            const scores = {
                logic: 0,
                emotion: 0,
                balanced: 0,
                agenda: 0
            };
            
            // Count keyword matches in each sentence
            this.dimensions.forEach(dimension => {
                const keywords = reviewKeywords[dimension]?.keywords || [];
                keywords.forEach(keyword => {
                    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    const matches = sentence.match(regex);
                    if (matches) {
                        // Weight by keyword importance (longer keywords = more specific = higher weight)
                        scores[dimension] += matches.length * (keyword.length / 10);
                    }
                });
            });
            
            // Normalize scores relative to sentence length
            const sentenceLength = sentence.split(/\s+/).length;
            Object.keys(scores).forEach(key => {
                scores[key] = Math.min(100, (scores[key] / sentenceLength) * 100);
            });
            
            flowData.push({
                sentence: sentence.trim(),
                position: index / (sentences.length - 1),
                scores: scores,
                cumulativeScores: this.calculateCumulative(flowData, scores)
            });
        });
        
        return flowData;
    }
    
    calculateCumulative(previousData, currentScores) {
        if (previousData.length === 0) return currentScores;
        
        const prev = previousData[previousData.length - 1].cumulativeScores;
        const cumulative = {};
        
        Object.keys(currentScores).forEach(key => {
            // Running average
            cumulative[key] = (prev[key] * previousData.length + currentScores[key]) / (previousData.length + 1);
        });
        
        return cumulative;
    }
    
    drawFlowChart(text, reviewKeywords, options = {}) {
        if (!this.ctx) return;
        
        const flowData = this.analyzeTextFlow(text, reviewKeywords);
        const padding = 60;
        const chartWidth = this.canvas.width - padding * 2;
        const chartHeight = this.canvas.height - padding * 2;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground(padding, chartWidth, chartHeight);
        
        // Draw axes
        this.drawAxes(padding, chartWidth, chartHeight);
        
        // Draw flow lines for each dimension
        if (options.showIndividual !== false) {
            this.dimensions.forEach(dimension => {
                this.drawFlowLine(flowData, dimension, 'scores', padding, chartWidth, chartHeight, 0.3);
            });
        }
        
        // Draw cumulative lines (thicker)
        if (options.showCumulative !== false) {
            this.dimensions.forEach(dimension => {
                this.drawFlowLine(flowData, dimension, 'cumulativeScores', padding, chartWidth, chartHeight, 1);
            });
        }
        
        // Draw annotations for key moments
        if (options.showAnnotations !== false) {
            this.drawAnnotations(flowData, padding, chartWidth, chartHeight);
        }
        
        // Draw legend
        this.drawLegend(padding, chartHeight);
    }
    
    drawBackground(padding, width, height) {
        // Grid lines
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines (0%, 25%, 50%, 75%, 100%)
        for (let i = 0; i <= 4; i++) {
            const y = padding + height - (height * i / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + width, y);
            this.ctx.stroke();
            
            // Labels
            this.ctx.fillStyle = '#6b7280';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText((i * 25) + '%', padding - 10, y + 4);
        }
    }
    
    drawAxes(padding, width, height) {
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2;
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, padding + height);
        this.ctx.stroke();
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding + height);
        this.ctx.lineTo(padding + width, padding + height);
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = '#374151';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText('Reading Progress →', padding + width / 2, padding + height + 40);
        
        // Y-axis label (rotated)
        this.ctx.save();
        this.ctx.translate(20, padding + height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Intensity', 0, 0);
        this.ctx.restore();
    }
    
    drawFlowLine(flowData, dimension, scoreType, padding, width, height, alpha = 1) {
        if (flowData.length < 2) return;
        
        this.ctx.strokeStyle = this.colors[dimension] + Math.round(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.lineWidth = alpha === 1 ? 3 : 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Create smooth curve through points
        this.ctx.beginPath();
        
        flowData.forEach((point, index) => {
            const x = padding + point.position * width;
            const y = padding + height - (point[scoreType][dimension] / 100 * height);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Use quadratic curves for smoothness
                const prevPoint = flowData[index - 1];
                const prevX = padding + prevPoint.position * width;
                const prevY = padding + height - (prevPoint[scoreType][dimension] / 100 * height);
                
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                
                this.ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
            
            // Draw point
            if (alpha === 1 && point[scoreType][dimension] > 20) {
                this.ctx.save();
                this.ctx.fillStyle = this.colors[dimension];
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        
        this.ctx.stroke();
    }
    
    drawAnnotations(flowData, padding, width, height) {
        // Find peaks for each dimension
        const peaks = {};
        this.dimensions.forEach(dimension => {
            let maxScore = 0;
            let maxIndex = 0;
            
            flowData.forEach((point, index) => {
                if (point.scores[dimension] > maxScore) {
                    maxScore = point.scores[dimension];
                    maxIndex = index;
                }
            });
            
            if (maxScore > 30) {
                peaks[dimension] = { index: maxIndex, score: maxScore };
            }
        });
        
        // Draw annotations for significant peaks
        Object.entries(peaks).forEach(([dimension, peak]) => {
            const point = flowData[peak.index];
            const x = padding + point.position * width;
            const y = padding + height - (peak.score / 100 * height);
            
            // Draw callout
            this.ctx.save();
            this.ctx.fillStyle = this.colors[dimension];
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            
            // Bubble
            const bubbleWidth = 140;
            const bubbleHeight = 40;
            const bubbleY = y - 50;
            
            this.ctx.beginPath();
            this.ctx.roundRect(x - bubbleWidth/2, bubbleY, bubbleWidth, bubbleHeight, 8);
            this.ctx.stroke();
            this.ctx.fill();
            
            // Arrow
            this.ctx.beginPath();
            this.ctx.moveTo(x, bubbleY + bubbleHeight);
            this.ctx.lineTo(x - 8, bubbleY + bubbleHeight + 10);
            this.ctx.lineTo(x + 8, bubbleY + bubbleHeight + 10);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(dimension.charAt(0).toUpperCase() + dimension.slice(1) + ' peak', x, bubbleY + 17);
            
            // Show key phrase
            const sentence = point.sentence;
            const keywords = reviewKeywords[dimension]?.keywords || [];
            let keyPhrase = '';
            
            // Find first matching keyword in this sentence
            for (const keyword of keywords) {
                if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
                    keyPhrase = '"' + keyword + '"';
                    break;
                }
            }
            
            if (keyPhrase) {
                this.ctx.font = '11px sans-serif';
                this.ctx.fillText(keyPhrase, x, bubbleY + 30);
            }
            
            this.ctx.restore();
        });
    }
    
    drawLegend(padding, chartHeight) {
        const legendY = padding + chartHeight + 60;
        const legendItems = [
            { name: 'Logic Issues', color: this.colors.logic },
            { name: 'Emotional Appeal', color: this.colors.emotion },
            { name: 'Balanced', color: this.colors.balanced },
            { name: 'Hidden Agenda', color: this.colors.agenda }
        ];
        
        let x = padding;
        
        legendItems.forEach(item => {
            // Line sample
            this.ctx.strokeStyle = item.color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, legendY);
            this.ctx.lineTo(x + 30, legendY);
            this.ctx.stroke();
            
            // Label
            this.ctx.fillStyle = '#374151';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.name, x + 35, legendY + 4);
            
            x += 120;
        });
        
        // Legend title
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('Thin lines: per sentence | Thick lines: cumulative', padding, legendY + 25);
    }
}

// Helper for rounded rectangles (for older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Export for usage
if (typeof window !== 'undefined') {
    window.SentimentFlowVisualization = SentimentFlowVisualization;
}