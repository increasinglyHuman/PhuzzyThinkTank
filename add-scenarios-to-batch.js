#!/usr/bin/env node
const fs = require('fs');
const { addScenario, checkMemory } = require('./generate-batch-scenarios.js');

// Load scenarios from temp files
const scenario5 = JSON.parse(fs.readFileSync('./temp-scenario-5.json', 'utf8'));
const scenario6 = JSON.parse(fs.readFileSync('./temp-scenario-6.json', 'utf8'));

console.log('📝 Adding new scenarios to batch file...\n');

// Add scenario 5
if (addScenario(scenario5)) {
    console.log('✅ Successfully added scenario 5');
    checkMemory();
}

// Add scenario 6
if (addScenario(scenario6)) {
    console.log('✅ Successfully added scenario 6');
    checkMemory();
}

// Clean up temp files
fs.unlinkSync('./temp-scenario-5.json');
fs.unlinkSync('./temp-scenario-6.json');
console.log('\n🧹 Cleaned up temporary files');
console.log('✨ Done!');