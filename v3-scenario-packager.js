#!/usr/bin/env node

/**
 * V3 Scenario Packager
 * Packages individual V3 scenarios into packs with validation
 * - Validates all scenarios against V3 spec
 * - Ensures pack consistency
 * - Generates pack metadata
 * - Memory-efficient processing
 */

const fs = require('fs').promises;
const path = require('path');
const { validateScenarioBatch } = require('./v3-scenario-validator');

// Configuration
const CONFIG = {
    scenariosPerPack: 10,
    outputDir: path.join(__dirname, 'data/scenario-packs'),
    version: '3.0.0'
};

// Read scenarios from a directory or file
async function loadScenarios(source) {
    const scenarios = [];
    
    const stat = await fs.stat(source);
    if (stat.isDirectory()) {
        // Load all JSON files from directory
        const files = await fs.readdir(source);
        const jsonFiles = files.filter(f => f.endsWith('.json')).sort();
        
        for (const file of jsonFiles) {
            try {
                const content = await fs.readFile(path.join(source, file), 'utf8');
                const data = JSON.parse(content);
                
                // Handle both single scenario and array formats
                if (Array.isArray(data)) {
                    scenarios.push(...data);
                } else if (data.scenarios) {
                    scenarios.push(...data.scenarios);
                } else if (data.id && data.title) {
                    scenarios.push(data);
                }
            } catch (error) {
                console.warn(`Skipping ${file}: ${error.message}`);
            }
        }
    } else {
        // Load single file
        const content = await fs.readFile(source, 'utf8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
            scenarios.push(...data);
        } else if (data.scenarios) {
            scenarios.push(...data.scenarios);
        } else if (data.id && data.title) {
            scenarios.push(data);
        }
    }
    
    return scenarios;
}

// Create pack metadata
function createPackMetadata(packId, scenarios, packInfo = {}) {
    // Analyze scenarios for auto-tagging
    const autoTags = new Set();
    
    scenarios.forEach(scenario => {
        // Check content for themes
        const content = (scenario.content + ' ' + scenario.title).toLowerCase();
        
        if (content.includes('kid') || content.includes('child') || content.includes('school')) {
            autoTags.add('kid-friendly');
        }
        if (content.includes('tech') || content.includes('digital') || content.includes('computer')) {
            autoTags.add('tech');
        }
        if (content.includes('animal') || content.includes('pet')) {
            autoTags.add('animals');
        }
        if (content.includes('funny') || content.includes('silly') || content.includes('humor')) {
            autoTags.add('humor');
        }
        
        // Check fallacies for educational value
        if (scenario.logicalFallacies && scenario.logicalFallacies.length > 2) {
            autoTags.add('educational');
        }
    });
    
    return {
        id: packId,
        name: packInfo.name || `Scenario Pack ${packId}`,
        description: packInfo.description || `Collection of ${scenarios.length} scenarios`,
        version: CONFIG.version,
        createdDate: new Date().toISOString(),
        scenarioCount: scenarios.length,
        tags: [...new Set([...(packInfo.tags || []), ...autoTags])],
        themes: packInfo.themes || [],
        difficulty: packInfo.difficulty || 'medium'
    };
}

// Package scenarios into a pack
async function packageScenarios(scenarios, packId, packInfo = {}) {
    console.log(`\n📦 Packaging ${scenarios.length} scenarios into pack ${packId}...`);
    
    // Validate all scenarios
    console.log('🔍 Validating scenarios...');
    const validation = await validateScenarioBatch(scenarios);
    
    console.log(`✅ Valid: ${validation.valid}`);
    console.log(`❌ Invalid: ${validation.invalid}`);
    console.log(`⚠️  Warnings: ${validation.warnings}`);
    
    // Show validation details for invalid scenarios
    if (validation.invalid > 0) {
        console.log('\n❌ Invalid scenarios:');
        validation.details
            .filter(d => !d.valid)
            .forEach(d => {
                console.log(`  - ${d.id}: ${d.title}`);
                d.errors.forEach(e => console.log(`    ERROR: ${e}`));
            });
    }
    
    // Get validated scenarios (with fixes applied)
    const validatedScenarios = validation.details.map(d => d.scenario);
    
    // Ensure sequential IDs within pack
    validatedScenarios.forEach((scenario, index) => {
        scenario.packId = packId;
        scenario.indexInPack = index;
        scenario.version = CONFIG.version;
    });
    
    // Create pack structure
    const pack = {
        packInfo: createPackMetadata(packId, validatedScenarios, packInfo),
        scenarios: validatedScenarios,
        validation: {
            totalScenarios: validation.total,
            validScenarios: validation.valid,
            invalidScenarios: validation.invalid,
            warningCount: validation.warnings
        }
    };
    
    // Save pack
    const outputPath = path.join(CONFIG.outputDir, `scenario-generated-${packId}-v3.json`);
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(pack, null, 2));
    
    console.log(`\n✅ Pack created: ${outputPath}`);
    console.log(`📊 Summary: ${validation.valid}/${scenarios.length} valid scenarios`);
    
    return pack;
}

// Batch package multiple packs
async function batchPackage(sourceDir, startPackId = '000') {
    console.log(`🔄 Batch packaging scenarios from ${sourceDir}`);
    
    // Load all scenarios
    const allScenarios = await loadScenarios(sourceDir);
    console.log(`📊 Found ${allScenarios.length} total scenarios`);
    
    // Group into packs
    const packs = [];
    let packNumber = parseInt(startPackId);
    
    for (let i = 0; i < allScenarios.length; i += CONFIG.scenariosPerPack) {
        const packScenarios = allScenarios.slice(i, i + CONFIG.scenariosPerPack);
        const packId = String(packNumber).padStart(3, '0');
        
        console.log(`\n--- Pack ${packId} ---`);
        const pack = await packageScenarios(packScenarios, packId);
        packs.push(pack);
        
        packNumber++;
    }
    
    // Create summary
    const summary = {
        totalPacks: packs.length,
        totalScenarios: allScenarios.length,
        packs: packs.map(p => ({
            id: p.packInfo.id,
            name: p.packInfo.name,
            scenarios: p.packInfo.scenarioCount,
            valid: p.validation.validScenarios,
            tags: p.packInfo.tags
        }))
    };
    
    const summaryPath = path.join(CONFIG.outputDir, 'v3-packs-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n✅ Batch packaging complete!');
    console.log(`📦 Created ${packs.length} packs`);
    console.log(`📄 Summary: ${summaryPath}`);
    
    return summary;
}

// Convert V2 pack to V3
async function convertV2ToV3(v2PackPath) {
    console.log(`🔄 Converting V2 pack to V3: ${v2PackPath}`);
    
    const content = await fs.readFile(v2PackPath, 'utf8');
    const v2Pack = JSON.parse(content);
    
    const scenarios = v2Pack.scenarios || [];
    const packId = path.basename(v2PackPath).match(/\d{3}/)?.[0] || '000';
    
    // Extract pack info from V2
    const packInfo = {
        name: v2Pack.packInfo?.name || v2Pack.name,
        description: v2Pack.packInfo?.description || v2Pack.description,
        tags: v2Pack.packInfo?.tags || v2Pack.tags || [],
        themes: v2Pack.packInfo?.themes || []
    };
    
    // Package with V3 validation
    const v3Pack = await packageScenarios(scenarios, packId, packInfo);
    
    return v3Pack;
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
V3 Scenario Packager

Usage:
  node v3-scenario-packager.js <command> [options]

Commands:
  package <source> <packId>     Package scenarios into a single pack
  batch <sourceDir> [startId]   Batch package all scenarios in directory
  convert <v2PackPath>          Convert V2 pack to V3 format

Examples:
  node v3-scenario-packager.js package ./new-scenarios/ 007
  node v3-scenario-packager.js batch ./all-scenarios/ 000
  node v3-scenario-packager.js convert ./data/packs/pack-001.json
        `);
        process.exit(0);
    }
    
    const command = args[0];
    
    try {
        switch (command) {
            case 'package':
                if (args.length < 3) {
                    console.error('Usage: package <source> <packId>');
                    process.exit(1);
                }
                const scenarios = await loadScenarios(args[1]);
                await packageScenarios(scenarios, args[2]);
                break;
                
            case 'batch':
                if (args.length < 2) {
                    console.error('Usage: batch <sourceDir> [startId]');
                    process.exit(1);
                }
                await batchPackage(args[1], args[2] || '000');
                break;
                
            case 'convert':
                if (args.length < 2) {
                    console.error('Usage: convert <v2PackPath>');
                    process.exit(1);
                }
                await convertV2ToV3(args[1]);
                break;
                
            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = {
    loadScenarios,
    packageScenarios,
    batchPackage,
    convertV2ToV3,
    createPackMetadata
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}