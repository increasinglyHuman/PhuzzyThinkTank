#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all scenarios with character dialogues
const dataDir = './data/scenario-packs';
const files = fs.readdirSync(dataDir).filter(f => f.match(/^scenario-generated-\d{3}\.json$/));

console.log('🎭 Finding Multi-Character Scenarios\n');

let multiCharScenarios = [];

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    const scenarios = data.scenarios || [];
    
    scenarios.forEach((scenario, idx) => {
        const text = scenario.text || scenario.description || '';
        
        // Look for character dialogue patterns
        const dialoguePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+(?:\s+[A-Z]+)*):\s*(.+)$/gm;
        const characters = new Set();
        let match;
        
        while ((match = dialoguePattern.exec(text)) !== null) {
            const charName = match[1].trim();
            // Filter out common non-names
            if (!['URGENT', 'ORDER', 'ATTENTION', 'BREAKING', 'ALERT', 'WARNING', 'IMPORTANT', 'NOTE', 'UPDATE', 'NEWS'].includes(charName.toUpperCase())) {
                characters.add(charName);
            }
        }
        
        if (characters.size > 1) {
            multiCharScenarios.push({
                file: file,
                index: idx,
                id: scenario.id,
                title: scenario.title,
                characterCount: characters.size,
                characters: Array.from(characters),
                scenarioNumber: data.scenarios.slice(0, idx + 1).length + 
                    parseInt(file.match(/\d{3}/)[0]) * 10 - 10
            });
        }
    });
});

// Sort by character count
multiCharScenarios.sort((a, b) => b.characterCount - a.characterCount);

console.log(`Found ${multiCharScenarios.length} scenarios with multiple characters:\n`);

// Group by character count
const byCount = {};
multiCharScenarios.forEach(s => {
    if (!byCount[s.characterCount]) byCount[s.characterCount] = [];
    byCount[s.characterCount].push(s);
});

Object.keys(byCount).sort((a, b) => b - a).forEach(count => {
    console.log(`\n📢 Scenarios with ${count} characters:`);
    byCount[count].forEach(s => {
        console.log(`  Scenario ${String(s.scenarioNumber).padStart(3, '0')}: "${s.title}"`);
        console.log(`    Characters: ${s.characters.join(', ')}`);
    });
});

// Show which ones are in the 40s (animal scenarios)
console.log('\n\n🦁 Animal Scenarios (40s):');
multiCharScenarios.filter(s => s.scenarioNumber >= 40 && s.scenarioNumber < 50).forEach(s => {
    console.log(`  Scenario ${String(s.scenarioNumber).padStart(3, '0')}: ${s.characterCount} characters - "${s.title}"`);
});