#!/usr/bin/env node
/**
 * Tests if adding topic/category fields breaks anything
 */

const fs = require('fs');

// Create a test scenario with topic fields
const testScenario = {
    "version": "2.0.0",
    "packInfo": {
        "packId": "test-pack",
        "packName": "Test Pack",
        "author": "Test",
        "description": "Testing topic fields",
        "topic": "Test Topic",  // NEW FIELD
        "category": "Test Category"  // NEW FIELD
    },
    "scenarios": [{
        "id": "test-001",
        "title": "Test Scenario",
        "text": "Test content...",
        "topic": "Test Scenario Topic",  // NEW FIELD
        "claim": "Test claim",
        "correctAnswer": "balanced",
        "answerWeights": {
            "logic": 50,
            "emotion": 50,
            "balanced": 100,
            "agenda": 0
        }
    }]
};

// Write test file
fs.writeFileSync('./test-scenario-with-topics.json', JSON.stringify(testScenario, null, 2));

console.log('🧪 Topic Field Compatibility Test\n');
console.log('Created test file: test-scenario-with-topics.json');
console.log('\nTest scenario structure:');
console.log('- Has version: ✓');
console.log('- Has packInfo with topic/category: ✓');
console.log('- Has scenario with topic: ✓');
console.log('\nThis file can be used to test if the game loads properly with new fields.');
console.log('\nTo test:');
console.log('1. Temporarily update scenario-packs-config.js to include this test file');
console.log('2. Load the game and verify it works normally');
console.log('3. The new fields should be ignored by the game engine');