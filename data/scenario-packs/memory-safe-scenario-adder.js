#!/usr/bin/env node
/**
 * Memory-Safe Scenario Addition Script
 * Adds scenarios in small batches with automatic memory management
 * Usage: node memory-safe-scenario-adder.js <scenario-file-1> <scenario-file-2>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BATCH_FILE = './scenarios-batch-001.json';
const BACKUP_DIR = './backups';
const MAX_SCENARIOS_PER_RUN = 2;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Memory monitoring
function getMemoryUsageMB() {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        percent: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
}

// Create backup with timestamp
function createBackup() {
    if (!fs.existsSync(BATCH_FILE)) return null;
    
    const timestamp = Date.now();
    const backupFile = path.join(BACKUP_DIR, `scenarios-backup-${timestamp}.json`);
    
    try {
        fs.copyFileSync(BATCH_FILE, backupFile);
        console.log(`💾 Backup created: ${backupFile}`);
        return backupFile;
    } catch (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return null;
    }
}

// Validate scenario structure
function validateScenario(scenario) {
    const required = ['id', 'title', 'text', 'claim', 'correctAnswer', 'answerWeights'];
    const missing = required.filter(field => !scenario[field]);
    
    if (missing.length > 0) {
        throw new Error(`Scenario missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate answerWeights
    const weights = scenario.answerWeights;
    if (!weights.logic || !weights.emotion || !weights.balanced || !weights.agenda) {
        throw new Error('Scenario missing required answer weights');
    }
    
    return true;
}

// Add scenarios to batch file
function addScenarios(scenarioFiles) {
    console.log(`\n🚀 Starting memory-safe scenario addition...`);
    console.log(`📊 Initial memory: ${JSON.stringify(getMemoryUsageMB())}`);
    
    // Create backup before starting
    const backupFile = createBackup();
    
    try {
        // Load current batch file
        let batchData = { scenarios: [] };
        if (fs.existsSync(BATCH_FILE)) {
            const content = fs.readFileSync(BATCH_FILE, 'utf8');
            batchData = JSON.parse(content);
            console.log(`📖 Loaded existing batch with ${batchData.scenarios.length} scenarios`);
        }
        
        // Process each scenario file
        let addedCount = 0;
        for (const file of scenarioFiles) {
            if (!fs.existsSync(file)) {
                console.error(`❌ File not found: ${file}`);
                continue;
            }
            
            console.log(`\n📄 Processing: ${file}`);
            const scenario = JSON.parse(fs.readFileSync(file, 'utf8'));
            
            // Validate scenario
            try {
                validateScenario(scenario);
            } catch (error) {
                console.error(`❌ Invalid scenario in ${file}: ${error.message}`);
                continue;
            }
            
            // Check for duplicate ID
            if (batchData.scenarios.some(s => s.id === scenario.id)) {
                console.error(`⚠️  Duplicate ID skipped: ${scenario.id}`);
                continue;
            }
            
            // Add scenario
            batchData.scenarios.push(scenario);
            addedCount++;
            console.log(`✅ Added: ${scenario.id} - ${scenario.title}`);
            
            // Check memory after each addition
            const mem = getMemoryUsageMB();
            console.log(`💾 Memory: ${mem.heapUsed}MB / ${mem.heapTotal}MB (${mem.percent}%)`);
            
            if (mem.percent > 60 || mem.heapUsed > 2048) {
                console.log(`⚠️  Memory usage high (${mem.percent}% or ${mem.heapUsed}MB), saving and exiting...`);
                break;
            }
        }
        
        // Save the updated batch file
        if (addedCount > 0) {
            fs.writeFileSync(BATCH_FILE, JSON.stringify(batchData, null, 2));
            console.log(`\n✅ Successfully added ${addedCount} scenarios`);
            console.log(`📊 Total scenarios in batch: ${batchData.scenarios.length}`);
        } else {
            console.log(`\n⚠️  No scenarios were added`);
        }
        
        // Final memory report
        const finalMem = getMemoryUsageMB();
        console.log(`\n📊 Final memory: ${JSON.stringify(finalMem)}`);
        
        return addedCount;
        
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        
        // Restore backup if available
        if (backupFile && fs.existsSync(backupFile)) {
            console.log(`\n🔄 Restoring from backup...`);
            fs.copyFileSync(backupFile, BATCH_FILE);
            console.log(`✅ Restored from: ${backupFile}`);
        }
        
        throw error;
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
Usage: node memory-safe-scenario-adder.js <scenario-file-1> [scenario-file-2] ...

Example:
  node memory-safe-scenario-adder.js scenario-11.json scenario-12.json
  
This script safely adds scenarios with automatic memory management.
It will process up to ${MAX_SCENARIOS_PER_RUN} scenarios per run to prevent memory issues.
        `);
        process.exit(0);
    }
    
    try {
        const filesToProcess = args.slice(0, MAX_SCENARIOS_PER_RUN);
        if (args.length > MAX_SCENARIOS_PER_RUN) {
            console.log(`\n⚠️  Note: Only processing first ${MAX_SCENARIOS_PER_RUN} files to manage memory`);
            console.log(`   Remaining files: ${args.slice(MAX_SCENARIOS_PER_RUN).join(', ')}`);
        }
        
        addScenarios(filesToProcess);
        
    } catch (error) {
        console.error(`\n💥 Script failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = { addScenarios, validateScenario, createBackup };