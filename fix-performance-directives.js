#!/usr/bin/env node

/**
 * Fix Performance Directives in Audio Scripts
 * Removes [bracketed] performance directives that ElevenLabs can't interpret
 */

const fs = require('fs').promises;
const path = require('path');

// Pattern to match performance directives
const PERFORMANCE_DIRECTIVE_PATTERN = /\[(?:excited|whispered|sarcastic|thoughtful|dramatic pause|laughs|sighs|gasps|questioning|dramatic|grumpy|proud|half asleep|yawning|sophisticated accent|hopeful|confused|defensive|inspirational|determined beeping|smugly|unified beeping|pause|serious|hesitant|condescending|frank|emphatic|shocked)\]/gi;

async function stripPerformanceDirectives(text) {
    // Remove performance directives but keep the text flowing naturally
    return text.replace(PERFORMANCE_DIRECTIVE_PATTERN, '').replace(/\s+/g, ' ').trim();
}

async function processScenarioPack(packFile) {
    try {
        const content = await fs.readFile(packFile, 'utf8');
        const packData = JSON.parse(content);
        let modified = false;
        
        for (const scenario of packData.scenarios) {
            if (scenario.audioScript && PERFORMANCE_DIRECTIVE_PATTERN.test(scenario.audioScript)) {
                console.log(`Found directives in: ${scenario.id} - ${scenario.title}`);
                
                // Create clean audio script
                const cleanAudioScript = await stripPerformanceDirectives(scenario.audioScript);
                
                // Store original if not already stored
                if (!scenario.audioScriptWithDirectives) {
                    scenario.audioScriptWithDirectives = scenario.audioScript;
                }
                
                scenario.audioScript = cleanAudioScript;
                modified = true;
            }
        }
        
        if (modified) {
            // Create backup
            const backupFile = packFile.replace('.json', `-backup-${Date.now()}.json`);
            await fs.writeFile(backupFile, content);
            console.log(`Created backup: ${backupFile}`);
            
            // Save cleaned version
            await fs.writeFile(packFile, JSON.stringify(packData, null, 2));
            console.log(`Updated pack: ${packFile}`);
        }
        
        return modified;
    } catch (error) {
        console.error(`Error processing ${packFile}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('Performance Directive Cleaner');
    console.log('============================\n');
    
    const packDir = path.join(__dirname, 'data', 'scenario-packs');
    
    try {
        const files = await fs.readdir(packDir);
        const packFiles = files.filter(f => f.startsWith('scenario-generated-') && f.endsWith('.json'));
        
        let modifiedCount = 0;
        
        for (const file of packFiles) {
            const packPath = path.join(packDir, file);
            if (await processScenarioPack(packPath)) {
                modifiedCount++;
            }
        }
        
        console.log(`\n✓ Processed ${packFiles.length} packs, modified ${modifiedCount}`);
        console.log('\nPerformance directives have been removed from audioScript fields.');
        console.log('Original scripts with directives are preserved in audioScriptWithDirectives field.');
        
    } catch (error) {
        console.error('Failed:', error);
    }
}

// Also export for use in voice generator
module.exports = { stripPerformanceDirectives, PERFORMANCE_DIRECTIVE_PATTERN };

if (require.main === module) {
    main();
}