#!/usr/bin/env node
/**
 * Memory-Safe Workflow Demo
 * Shows how to use the memory optimization system
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log(`
🎯 Memory-Safe Scenario Addition Demo
====================================

This demo shows how the memory optimization system works:

1. Individual script (memory-safe-scenario-adder.js):
   - Adds 1-2 scenarios at a time
   - Monitors memory usage
   - Creates automatic backups
   - Validates scenario structure

2. Batch orchestrator (batch-scenario-orchestrator.sh):
   - Automatically processes all scenario-*.json files
   - Runs in memory-safe batches
   - Restarts Node.js between batches
   - Shows progress and statistics

📋 Current scenario files found:
`);

// List current scenario files
try {
    const scenarioFiles = fs.readdirSync('.')
        .filter(f => f.match(/^scenario-.*\.json$/))
        .sort();
    
    if (scenarioFiles.length > 0) {
        scenarioFiles.forEach(f => console.log(`   - ${f}`));
        console.log(`\n   Total: ${scenarioFiles.length} files`);
    } else {
        console.log('   (No scenario-*.json files found)');
    }
} catch (error) {
    console.log('   Error listing files:', error.message);
}

console.log(`
📚 Usage Examples:
==================

1️⃣  Add specific scenarios manually:
   node memory-safe-scenario-adder.js scenario-11.json scenario-12.json

2️⃣  Process all scenarios automatically:
   bash batch-scenario-orchestrator.sh

3️⃣  Add with custom memory limit:
   node --max-old-space-size=8192 memory-safe-scenario-adder.js scenario-13.json

💡 Tips:
========
- Keep scenarios in separate JSON files (scenario-11.json, scenario-12.json, etc.)
- The system processes 2 scenarios per batch by default
- Backups are created automatically in ./backups/
- Memory usage is monitored and logged
- If memory exceeds 70%, the batch stops safely

🔍 Current Batch Status:
`);

// Check current batch file
try {
    if (fs.existsSync('./scenarios-batch-001.json')) {
        const batch = JSON.parse(fs.readFileSync('./scenarios-batch-001.json', 'utf8'));
        console.log(`   ✅ Batch file exists with ${batch.scenarios.length} scenarios`);
        
        // Show last 3 scenarios
        if (batch.scenarios.length > 0) {
            console.log(`\n   Recent scenarios:`);
            const recent = batch.scenarios.slice(-3);
            recent.forEach(s => {
                console.log(`   - ${s.id}: ${s.title}`);
            });
        }
    } else {
        console.log('   ⚠️  No batch file found (will be created on first run)');
    }
} catch (error) {
    console.log('   Error reading batch file:', error.message);
}

console.log(`
🚀 Ready to start? Try one of the usage examples above!
`);

// Quick memory check
const usage = process.memoryUsage();
const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
console.log(`💾 Current memory: ${heapUsedMB}MB / ${heapTotalMB}MB
`);