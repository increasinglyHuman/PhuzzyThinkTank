#!/usr/bin/env node

/**
 * Updates the voice generator to use pack-based folder naming
 * This creates a modified version that generates folders as:
 * pack-000-scenario-000, pack-000-scenario-001, etc.
 */

const fs = require('fs');
const path = require('path');

const VOICE_GENERATOR_PATH = path.join(__dirname, 'tools/elevenlabs-voice-generator.js');
const BACKUP_PATH = path.join(__dirname, 'tools/elevenlabs-voice-generator.backup.js');

async function updateVoiceGenerator() {
    console.log('🔧 Updating voice generator for pack-based naming...\n');
    
    // First, create a backup
    const originalContent = fs.readFileSync(VOICE_GENERATOR_PATH, 'utf8');
    fs.writeFileSync(BACKUP_PATH, originalContent);
    console.log('✓ Created backup at:', BACKUP_PATH);
    
    // Find the line that creates the scenario directory
    const lines = originalContent.split('\n');
    let updatedContent = originalContent;
    let changesMade = false;
    
    // Look for the scenario directory creation line
    const targetPattern = /const scenarioDir = path\.join\(CONFIG\.outputDir, `scenario-\${scenarioId}`\);/;
    
    // Replace with pack-based naming
    updatedContent = updatedContent.replace(
        targetPattern,
        `// Determine pack and scenario index from ID
    const packNumber = Math.floor(scenarioId / 10).toString().padStart(3, '0');
    const scenarioIndex = (scenarioId % 10).toString().padStart(3, '0');
    const scenarioDir = path.join(CONFIG.outputDir, \`pack-\${packNumber}-scenario-\${scenarioIndex}\`);`
    );
    
    if (updatedContent !== originalContent) {
        changesMade = true;
    }
    
    // Also need to update the main processing loop to pass pack information
    // Look for where scenarios are processed
    const processPattern = /for \(let i = 0; i < scenarios\.length; i\+\+\) \{/;
    
    updatedContent = updatedContent.replace(
        processPattern,
        `for (let i = 0; i < scenarios.length; i++) {
                        // Extract pack number from filename
                        const packMatch = file.match(/scenario-generated-(\\d+)\\.json/);
                        const packNumber = packMatch ? parseInt(packMatch[1]) : 0;`
    );
    
    // Update the processScenario call to include pack info
    const processCallPattern = /await processScenario\(scenario, totalScenarios\);/;
    
    updatedContent = updatedContent.replace(
        processCallPattern,
        `await processScenario(scenario, totalScenarios, packNumber, i);`
    );
    
    // Update the processScenario function signature
    const funcSignaturePattern = /async function processScenario\(scenarioData, scenarioId\) \{/;
    
    updatedContent = updatedContent.replace(
        funcSignaturePattern,
        `async function processScenario(scenarioData, scenarioId, packNumber = null, indexInPack = null) {`
    );
    
    // Update the scenario directory creation inside processScenario
    // This handles both the new pack-based calls and legacy calls
    const scenarioDirPattern = /const scenarioDir = path\.join\(CONFIG\.outputDir, `scenario-\${scenarioId}`\);/;
    
    updatedContent = updatedContent.replace(
        scenarioDirPattern,
        `// Use pack-based naming if pack info is provided, otherwise fall back to sequential
    let scenarioDir;
    if (packNumber !== null && indexInPack !== null) {
        const packStr = packNumber.toString().padStart(3, '0');
        const scenarioStr = indexInPack.toString().padStart(3, '0');
        scenarioDir = path.join(CONFIG.outputDir, \`pack-\${packStr}-scenario-\${scenarioStr}\`);
    } else {
        // Legacy fallback for sequential numbering
        const packNum = Math.floor(scenarioId / 10).toString().padStart(3, '0');
        const scenarioNum = (scenarioId % 10).toString().padStart(3, '0');
        scenarioDir = path.join(CONFIG.outputDir, \`pack-\${packNum}-scenario-\${scenarioNum}\`);
    }`
    );
    
    // Write the updated content
    fs.writeFileSync(VOICE_GENERATOR_PATH, updatedContent);
    console.log('✓ Updated voice generator with pack-based naming');
    
    // Show what changed
    console.log('\n📝 Changes made:');
    console.log('  - Scenario folders now use format: pack-XXX-scenario-YYY');
    console.log('  - Pack number derived from file name or calculated from ID');
    console.log('  - Scenario index within pack (0-9) used for folder suffix');
    
    console.log('\n✅ Voice generator update complete!');
    console.log('\nTo restore original: cp', BACKUP_PATH, VOICE_GENERATOR_PATH);
}

// Run the update
updateVoiceGenerator().catch(console.error);