#!/usr/bin/env node

// Simple script to add scenario 30 with explicit memory monitoring
const fs = require('fs');

console.log('Memory at start:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');

// Read the new scenario
const newScenario = JSON.parse(fs.readFileSync('./scenario-30-office-plants.json', 'utf8'));
console.log('✓ Read new scenario');

// Read existing batch in smaller chunks
const batchPath = './scenarios-batch-001.json';
const batchContent = fs.readFileSync(batchPath, 'utf8');
console.log('✓ Read batch file');

// Parse with error handling
let batchData;
try {
  batchData = JSON.parse(batchContent);
  console.log('✓ Parsed batch data, current count:', batchData.scenarios.length);
} catch (error) {
  console.error('Failed to parse batch file:', error);
  process.exit(1);
}

// Add the new scenario
batchData.scenarios.push(newScenario);
console.log('✓ Added scenario, new count:', batchData.scenarios.length);

// Create backup
const backupPath = `./backups/scenarios-backup-${Date.now()}.json`;
fs.writeFileSync(backupPath, batchContent);
console.log('✓ Created backup:', backupPath);

// Write updated file
fs.writeFileSync(batchPath, JSON.stringify(batchData, null, 2));
console.log('✓ Updated batch file');

console.log('\nMemory at end:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
console.log('✅ Successfully added scenario 30!');