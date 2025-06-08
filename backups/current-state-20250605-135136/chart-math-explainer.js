// Chart Math Explainer - Shows the relationship between radar and timeline data

(function() {
    // Calculate and display the mathematical relationship
    window.explainChartMath = function(scenario) {
        if (!scenario) return;
        
        const mathNote = document.getElementById('timeline-math-note');
        if (!mathNote) return;
        
        // Get answer weights (radar chart data)
        const weights = scenario.answerWeights || {};
        
        // Get timeline analysis scores
        const logicScores = scenario.analysis?.logic?.scores || {};
        const emotionScores = scenario.analysis?.emotion?.scores || {};
        
        // Calculate timeline score aggregates
        const logicAvg = calculateAverage([
            logicScores.evidence || 0,
            logicScores.consistency || 0,
            logicScores.source || 0,
            10 - (logicScores.agenda || 0) // Invert agenda score
        ]);
        
        const emotionAvg = calculateAverage([
            emotionScores.fear || 0,
            emotionScores.belonging || 0,
            emotionScores.pride || 0,
            emotionScores.manipulation || 0
        ]);
        
        // Create explanation HTML
        let html = '<div style="margin-top: 8px;">';
        
        // Timeline explanation
        html += '<div style="margin-bottom: 8px;">';
        html += '<strong>Timeline Scores (0-10 scale):</strong><br/>';
        html += `• Logic components average: ${logicAvg.toFixed(1)}/10<br/>`;
        html += `• Emotion components average: ${emotionAvg.toFixed(1)}/10<br/>`;
        html += '<span style="font-size: 0.9em; opacity: 0.8;">Calculated from evidence quality, consistency, emotional triggers, etc.</span>';
        html += '</div>';
        
        // Radar explanation
        html += '<div style="margin-bottom: 8px;">';
        html += '<strong>Radar Chart (Answer Weights):</strong><br/>';
        html += `• Logic weight: ${weights.logic || 0}%<br/>`;
        html += `• Emotion weight: ${weights.emotion || 0}%<br/>`;
        html += `• Balanced weight: ${weights.balanced || 0}%<br/>`;
        html += `• Agenda weight: ${weights.agenda || 0}%<br/>`;
        html += '<span style="font-size: 0.9em; opacity: 0.8;">Determines which answer is correct (highest %)</span>';
        html += '</div>';
        
        // Relationship explanation
        html += '<div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 8px; margin-top: 8px;">';
        html += '<strong>🔗 Relationship:</strong><br/>';
        
        // Check if timeline scores correlate with answer weights
        const logicCorrelation = checkCorrelation(logicAvg, weights.logic);
        const emotionCorrelation = checkCorrelation(emotionAvg, weights.emotion);
        
        html += '<span style="font-size: 0.9em;">';
        html += 'Timeline shows detailed analysis scores throughout the text, ';
        html += 'while radar shows overall classification percentages. ';
        
        if (logicCorrelation && emotionCorrelation) {
            html += 'Strong correlation indicates consistent manipulation patterns.';
        } else if (logicCorrelation || emotionCorrelation) {
            html += 'Mixed patterns suggest complex manipulation tactics.';
        } else {
            html += 'Low correlation may indicate subtle or evolving tactics.';
        }
        html += '</span>';
        html += '</div>';
        
        html += '</div>';
        
        mathNote.innerHTML = html;
    };
    
    // Calculate average of array
    function calculateAverage(values) {
        const validValues = values.filter(v => !isNaN(v));
        if (validValues.length === 0) return 0;
        const sum = validValues.reduce((a, b) => a + b, 0);
        return sum / validValues.length;
    }
    
    // Check if timeline score correlates with answer weight
    function checkCorrelation(timelineScore, answerWeight) {
        // Convert timeline score (0-10) to percentage
        const timelinePercent = timelineScore * 10;
        
        // Check if within reasonable range (±20%)
        const difference = Math.abs(timelinePercent - answerWeight);
        return difference < 20;
    }
    
    // Listen for scenario analysis
    window.addEventListener('scenario-analyzed', function(event) {
        if (event.detail && event.detail.scenario) {
            explainChartMath(event.detail.scenario);
        }
    });
})();