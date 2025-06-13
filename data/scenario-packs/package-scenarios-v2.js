#!/usr/bin/env node
/**
 * Packages individual scenario files into v2.0.0 format packs with 10 scenarios each
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCENARIOS_PER_PACK = 10;
const OUTPUT_DIR = './data';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Get next pack number
function getNextPackNumber() {
    const existingPacks = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.match(/scenario-generated-(\d{3})\.json/))
        .map(f => parseInt(f.match(/scenario-generated-(\d{3})\.json/)[1]))
        .sort((a, b) => b - a);
    
    return existingPacks.length > 0 ? existingPacks[0] + 1 : 0;
}

// Create pack metadata
function createPackInfo(packNumber, scenarioCount) {
    const packId = `generated-pack-${String(packNumber).padStart(3, '0')}`;
    return {
        packId: packId,
        packName: `Generated Scenario Pack ${packNumber}`,
        author: "AI Scenario Generator",
        description: `Auto-generated pack containing ${scenarioCount} scenarios`,
        createdDate: new Date().toISOString().split('T')[0],
        tags: ["generated", "batch-processing"]
    };
}

// Main processing
async function packageScenarios() {
    console.log('📦 Starting scenario packaging...\n');
    
    // Get all individual scenario files
    const scenarioFiles = fs.readdirSync('.')
        .filter(f => f.match(/^scenario-\d+.*\.json$/))
        .sort((a, b) => {
            const numA = parseInt(a.match(/scenario-(\d+)/)[1]);
            const numB = parseInt(b.match(/scenario-(\d+)/)[1]);
            return numA - numB;
        });
    
    console.log(`📄 Found ${scenarioFiles.length} scenario files to package\n`);
    
    if (scenarioFiles.length === 0) {
        console.log('❌ No scenario files found');
        return;
    }
    
    // Process in batches
    let packNumber = getNextPackNumber();
    let currentPack = [];
    let skippedCount = 0;
    let processedCount = 0;
    
    for (let i = 0; i < scenarioFiles.length; i++) {
        const file = scenarioFiles[i];
        
        try {
            const scenario = JSON.parse(fs.readFileSync(file, 'utf8'));
            
            // Skip if it's already a pack format
            if (scenario.version && scenario.scenarios) {
                console.log(`⏭️  Skipping ${file} (already in pack format)`);
                skippedCount++;
                continue;
            }
            
            // Ensure scenario has required fields
            if (!scenario.id || !scenario.title || !scenario.text) {
                console.log(`⚠️  Skipping ${file} (missing required fields)`);
                skippedCount++;
                continue;
            }
            
            currentPack.push(scenario);
            processedCount++;
            
            // When pack is full or last file
            if (currentPack.length === SCENARIOS_PER_PACK || i === scenarioFiles.length - 1) {
                const outputFile = path.join(OUTPUT_DIR, `scenario-generated-${String(packNumber).padStart(3, '0')}.json`);
                
                const packData = {
                    version: "2.0.0",
                    packInfo: createPackInfo(packNumber, currentPack.length),
                    scenarios: currentPack
                };
                
                fs.writeFileSync(outputFile, JSON.stringify(packData, null, 2));
                console.log(`✅ Created ${outputFile} with ${currentPack.length} scenarios`);
                
                packNumber++;
                currentPack = [];
            }
        } catch (error) {
            console.log(`❌ Error processing ${file}: ${error.message}`);
            skippedCount++;
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   - Processed: ${processedCount} scenarios`);
    console.log(`   - Skipped: ${skippedCount} files`);
    console.log(`   - Created: ${Math.ceil(processedCount / SCENARIOS_PER_PACK)} pack files`);
    console.log('\n✨ Packaging complete!');
}

// Run the packager
packageScenarios().catch(console.error);