#!/usr/bin/env node
const fs = require('fs');
const { addScenario, checkMemory } = require('./generate-batch-scenarios.js');

// Load scenarios from JSON files
const scenario9 = JSON.parse(fs.readFileSync('./scenario-9-vaccine-natural.json', 'utf8'));
const scenario10 = JSON.parse(fs.readFileSync('./scenario-10-climate-debate.json', 'utf8'));

console.log('📝 Adding scenarios 9 and 10 to batch file...\n');

// Add scenario 9
if (addScenario(scenario9)) {
    console.log('✅ Successfully added scenario 9: Natural Immunity Debate');
    checkMemory();
} else {
    console.error('❌ Failed to add scenario 9');
    process.exit(1);
}

// Add scenario 10
if (addScenario(scenario10)) {
    console.log('✅ Successfully added scenario 10: Climate Control Conspiracy');
    checkMemory();
} else {
    console.error('❌ Failed to add scenario 10');
    process.exit(1);
}

console.log('\n✨ Successfully added both scenarios to batch!');
console.log('📊 The pack now has 10 complete scenarios.');