#!/usr/bin/env node
// Memory-efficient scenario adder
// Run with: node --max-old-space-size=6144 add-scenario-efficiently.js

const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_FILE = './data/scenario-generated-002.json';
const BACKUP_FILE = './data/scenario-generated-002-backup.json';

// Function to add a single scenario
function addScenarioToFile(newScenario) {
    console.log(`\n📝 Adding scenario: ${newScenario.id} - ${newScenario.title}`);
    
    try {
        // Read the current file
        const fileContent = fs.readFileSync(TARGET_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Add the new scenario
        data.scenarios.push(newScenario);
        
        // Write back to file with pretty formatting
        fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Successfully added scenario ${newScenario.id}`);
        console.log(`📊 Total scenarios now: ${data.scenarios.length}`);
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
            console.log('🧹 Memory cleaned');
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Error adding scenario: ${error.message}`);
        return false;
    }
}

// Function to validate scenario structure
function validateScenario(scenario) {
    const required = ['id', 'title', 'text', 'claim', 'correctAnswer'];
    const missing = required.filter(field => !scenario[field]);
    
    if (missing.length > 0) {
        console.error(`❌ Scenario missing required fields: ${missing.join(', ')}`);
        return false;
    }
    
    return true;
}

// Create backup before starting
function createBackup() {
    try {
        const content = fs.readFileSync(TARGET_FILE, 'utf8');
        fs.writeFileSync(BACKUP_FILE, content);
        console.log('💾 Backup created');
        return true;
    } catch (error) {
        console.error(`❌ Failed to create backup: ${error.message}`);
        return false;
    }
}

// Interactive mode to add scenarios one by one
async function interactiveMode() {
    console.log('🚀 Memory-Efficient Scenario Adder');
    console.log('==================================');
    console.log(`Target file: ${TARGET_FILE}`);
    console.log(`Memory limit: ${process.env.NODE_OPTIONS || 'default'}`);
    console.log('\nThis script will help you add scenarios one at a time');
    console.log('to avoid memory issues.\n');
    
    // Create backup first
    if (!createBackup()) {
        console.log('⚠️  Continuing without backup...');
    }
    
    console.log('\n📋 Instructions:');
    console.log('1. Paste your scenario JSON when prompted');
    console.log('2. Type "done" to finish');
    console.log('3. Type "status" to check current count');
    console.log('4. Type "restore" to restore from backup\n');
}

// Example scenario template
function printExampleScenario() {
    const example = {
        id: "example-001",
        title: "Example Scenario",
        text: "Scenario text here...",
        claim: "Main claim here",
        correctAnswer: "logic",
        answerWeights: {
            logic: 80,
            emotion: 40,
            balanced: 60,
            agenda: 20
        },
        // ... rest of the fields
    };
    
    console.log('\n📄 Example scenario structure:');
    console.log(JSON.stringify(example, null, 2));
}

// Main execution
if (require.main === module) {
    interactiveMode();
    
    // Check memory usage
    const usage = process.memoryUsage();
    console.log(`\n💾 Initial memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
}

module.exports = {
    addScenarioToFile,
    validateScenario,
    createBackup
};