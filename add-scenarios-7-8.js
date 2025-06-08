#!/usr/bin/env node
const fs = require('fs');
const { addScenario, checkMemory } = require('./generate-batch-scenarios.js');

// Load scenarios from temp files
const scenario7 = JSON.parse(fs.readFileSync('./temp-scenario-7.json', 'utf8'));
const scenario8 = JSON.parse(fs.readFileSync('./temp-scenario-8.json', 'utf8'));

console.log('📝 Adding new scenarios to batch file...\n');

// Add scenario 7
if (addScenario(scenario7)) {
    console.log('✅ Successfully added scenario 7');
    checkMemory();
}

// Add scenario 8
if (addScenario(scenario8)) {
    console.log('✅ Successfully added scenario 8');
    checkMemory();
}

// Clean up temp files
fs.unlinkSync('./temp-scenario-7.json');
fs.unlinkSync('./temp-scenario-8.json');
console.log('\n🧹 Cleaned up temporary files');
console.log('✨ Done!');