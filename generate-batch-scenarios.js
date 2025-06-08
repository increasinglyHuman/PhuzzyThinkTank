#!/usr/bin/env node
// Memory-efficient batch scenario generator
// Run with: node --max-old-space-size=6144 generate-batch-scenarios.js

const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_FILE = './scenarios-batch-001.json';
const BACKUP_DIR = './backups';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Memory monitoring
function checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const percentUsed = Math.round((usage.heapUsed / usage.heapTotal) * 100);
    
    console.log(`💾 Memory: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentUsed}% used)`);
    
    if (percentUsed > 80) {
        console.log('⚠️  WARNING: Memory usage high! Consider stopping.');
        return false;
    }
    return true;
}

// Create backup
function createBackup() {
    const timestamp = Date.now();
    const backupFile = path.join(BACKUP_DIR, `scenarios-batch-001-backup-${timestamp}.json`);
    
    try {
        if (fs.existsSync(BATCH_FILE)) {
            fs.copyFileSync(BATCH_FILE, backupFile);
            console.log(`💾 Backup created: ${backupFile}`);
        }
        return backupFile;
    } catch (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return null;
    }
}

// Load current scenarios
function loadScenarios() {
    try {
        if (!fs.existsSync(BATCH_FILE)) {
            return { scenarios: [] };
        }
        const content = fs.readFileSync(BATCH_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error loading scenarios: ${error.message}`);
        return { scenarios: [] };
    }
}

// Save scenarios
function saveScenarios(data) {
    try {
        fs.writeFileSync(BATCH_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ Saved ${data.scenarios.length} scenarios to ${BATCH_FILE}`);
        return true;
    } catch (error) {
        console.error(`❌ Error saving scenarios: ${error.message}`);
        return false;
    }
}

// Add a single scenario
function addScenario(scenario) {
    console.log(`\n📝 Adding scenario: ${scenario.id} - ${scenario.title}`);
    
    // Validate required fields
    const required = ['id', 'title', 'text', 'claim', 'correctAnswer', 'answerWeights'];
    const missing = required.filter(field => !scenario[field]);
    
    if (missing.length > 0) {
        console.error(`❌ Scenario missing required fields: ${missing.join(', ')}`);
        return false;
    }
    
    // Load current data
    const data = loadScenarios();
    
    // Check for duplicate ID
    if (data.scenarios.some(s => s.id === scenario.id)) {
        console.error(`❌ Duplicate scenario ID: ${scenario.id}`);
        return false;
    }
    
    // Add scenario
    data.scenarios.push(scenario);
    
    // Save
    if (saveScenarios(data)) {
        console.log(`📊 Total scenarios now: ${data.scenarios.length}`);
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
            console.log('🧹 Memory cleaned');
        }
        
        return true;
    }
    
    return false;
}

// Main function
function main() {
    console.log('🚀 Batch Scenario Generator');
    console.log('===========================\n');
    
    // Create backup
    const backupFile = createBackup();
    if (!backupFile && fs.existsSync(BATCH_FILE)) {
        console.error('❌ Could not create backup. Aborting.');
        process.exit(1);
    }
    
    // Check current status
    const data = loadScenarios();
    console.log(`📊 Current scenarios: ${data.scenarios.length}`);
    
    // Check memory
    checkMemory();
    
    console.log('\n✨ Ready for scenario generation!');
    console.log('Usage: Call addScenario() with a scenario object');
    console.log('Memory will be monitored and cleaned after each addition\n');
}

// Export for use in other scripts
module.exports = {
    addScenario,
    checkMemory,
    loadScenarios,
    saveScenarios
};

// Run if called directly
if (require.main === module) {
    main();
}