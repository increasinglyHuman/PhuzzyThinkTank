// Script to convert scenario scores from 0-10 scale to 0-100 scale
const fs = require('fs');

// Read the scenarios file
const scenariosPath = '../data/scenarios.json';
const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

// Convert each scenario
scenarios.scenarios.forEach(scenario => {
    // Convert logic scores (multiply by 10)
    if (scenario.analysis && scenario.analysis.logic && scenario.analysis.logic.scores) {
        const logicScores = scenario.analysis.logic.scores;
        logicScores.evidence = Math.round(logicScores.evidence * 10);
        logicScores.consistency = Math.round(logicScores.consistency * 10);
        logicScores.source = Math.round(logicScores.source * 10);
        logicScores.agenda = Math.round(logicScores.agenda * 10);
    }
    
    // Convert emotion scores (multiply by 10)
    if (scenario.analysis && scenario.analysis.emotion && scenario.analysis.emotion.scores) {
        const emotionScores = scenario.analysis.emotion.scores;
        emotionScores.fear = Math.round(emotionScores.fear * 10);
        emotionScores.belonging = Math.round(emotionScores.belonging * 10);
        emotionScores.pride = Math.round(emotionScores.pride * 10);
        emotionScores.manipulation = Math.round(emotionScores.manipulation * 10);
    }
});

// Write back to file
fs.writeFileSync(scenariosPath, JSON.stringify(scenarios, null, 2));

console.log('✅ Converted all scenario scores from 0-10 to 0-100 scale');

// Show example of converted scores
const firstScenario = scenarios.scenarios[0];
console.log('\nExample from first scenario:');
console.log('Logic scores:', firstScenario.analysis.logic.scores);
console.log('Emotion scores:', firstScenario.analysis.emotion.scores);