// Simple helper to append a single scenario to the 002 file
// This is designed to be used with Claude Code for maximum memory efficiency

const fs = require('fs');

function appendSingleScenario(scenarioObject) {
    const targetFile = './data/scenario-generated-002.json';
    
    try {
        // Read current data
        const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
        
        // Add the scenario
        data.scenarios.push(scenarioObject);
        
        // Write back
        fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
        
        return {
            success: true,
            totalScenarios: data.scenarios.length,
            addedId: scenarioObject.id
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use
module.exports = { appendSingleScenario };