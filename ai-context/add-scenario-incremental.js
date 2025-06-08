#!/usr/bin/env node
// Incremental scenario adder - adds one scenario at a time to avoid memory issues

const fs = require('fs');
const readline = require('readline');

const TARGET_FILE = './data/scenario-packs/scenario-generated-002.json';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to append a scenario
function appendScenario(scenarioJson) {
    try {
        // Parse the scenario
        const scenario = JSON.parse(scenarioJson);
        
        // Read current file
        const currentData = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
        
        // Check if scenario already exists
        if (currentData.scenarios.find(s => s.id === scenario.id)) {
            console.log(`⚠️  Scenario ${scenario.id} already exists, skipping...`);
            return false;
        }
        
        // Add scenario
        currentData.scenarios.push(scenario);
        
        // Write back
        fs.writeFileSync(TARGET_FILE, JSON.stringify(currentData, null, 2));
        
        console.log(`✅ Added scenario: ${scenario.id} - ${scenario.title}`);
        console.log(`📊 Total scenarios: ${currentData.scenarios.length}`);
        
        // Clear the scenario from memory
        scenario = null;
        
        return true;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
}

// Main function
async function main() {
    console.log('🎯 Incremental Scenario Adder');
    console.log('=============================');
    console.log('This tool adds scenarios one at a time to avoid memory issues.\n');
    
    // Create backup
    const backupFile = TARGET_FILE.replace('.json', `-backup-${Date.now()}.json`);
    fs.copyFileSync(TARGET_FILE, backupFile);
    console.log(`💾 Backup created: ${backupFile}\n`);
    
    // Show current status
    const current = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
    console.log(`📁 Current file: ${TARGET_FILE}`);
    console.log(`📊 Current scenarios: ${current.scenarios.length}`);
    console.log(`🏷️  Pack: ${current.packInfo.packName}\n`);
    
    console.log('📋 Instructions:');
    console.log('1. I will ask if you want to add a scenario');
    console.log('2. Paste the ENTIRE scenario object (including {})');
    console.log('3. Press Enter twice when done pasting');
    console.log('4. Repeat for each scenario\n');
    
    // Process scenarios one by one
    let continueAdding = true;
    while (continueAdding) {
        const answer = await new Promise(resolve => {
            rl.question('\n➡️  Add a scenario? (yes/no): ', resolve);
        });
        
        if (answer.toLowerCase() !== 'yes') {
            continueAdding = false;
            break;
        }
        
        console.log('\n📝 Paste the scenario JSON below (press Enter twice when done):');
        
        // Collect multi-line input
        let scenarioJson = '';
        let emptyLineCount = 0;
        
        const collectInput = () => {
            return new Promise(resolve => {
                rl.on('line', (line) => {
                    if (line.trim() === '') {
                        emptyLineCount++;
                        if (emptyLineCount >= 2) {
                            rl.removeAllListeners('line');
                            resolve();
                        }
                    } else {
                        emptyLineCount = 0;
                        scenarioJson += line + '\n';
                    }
                });
            });
        };
        
        await collectInput();
        
        if (scenarioJson.trim()) {
            appendScenario(scenarioJson.trim());
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                console.log('🧹 Memory cleared');
            }
        }
        
        // Show memory usage
        const usage = process.memoryUsage();
        console.log(`💾 Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB used`);
    }
    
    console.log('\n✨ Done! Thanks for using the incremental adder.');
    rl.close();
}

// Run the script
main().catch(console.error);