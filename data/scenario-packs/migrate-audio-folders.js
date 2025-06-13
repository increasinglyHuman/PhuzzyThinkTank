#!/usr/bin/env node

/**
 * Migration script to rename audio folders from sequential numbering
 * to pack-based naming convention
 * 
 * Before: scenario-000, scenario-001, scenario-002...
 * After: pack-000-scenario-000, pack-000-scenario-001, pack-000-scenario-002...
 */

const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, 'data/voices');
const PACKS_DIR = path.join(__dirname, 'data/scenario-packs');
const SCENARIOS_PER_PACK = 10;

async function migrateAudioFolders() {
    console.log('🎵 Starting audio folder migration to pack-based naming...\n');
    
    // First, let's map which scenarios belong to which packs
    const scenarioToPack = new Map();
    
    // Read all pack files to understand the mapping
    console.log('📦 Reading pack files to understand scenario distribution...');
    const packFiles = fs.readdirSync(PACKS_DIR)
        .filter(f => f.endsWith('.json') && f.startsWith('scenario-generated-'))
        .sort();
    
    for (const packFile of packFiles) {
        const packNumber = packFile.match(/scenario-generated-(\d+)\.json/)[1];
        const packData = JSON.parse(fs.readFileSync(path.join(PACKS_DIR, packFile), 'utf8'));
        
        if (packData.scenarios) {
            packData.scenarios.forEach((scenario, idx) => {
                const scenarioIndex = parseInt(packNumber) * SCENARIOS_PER_PACK + idx;
                scenarioToPack.set(scenarioIndex, {
                    pack: packNumber,
                    indexInPack: idx,
                    id: scenario.id,
                    title: scenario.title
                });
            });
        }
        
        console.log(`  ✓ Pack ${packNumber}: ${packData.scenarios ? packData.scenarios.length : 0} scenarios`);
    }
    
    console.log(`\nTotal scenarios mapped: ${scenarioToPack.size}\n`);
    
    // Now rename the audio folders
    console.log('🔄 Renaming audio folders...');
    
    const audioFolders = fs.readdirSync(AUDIO_DIR)
        .filter(f => f.match(/^scenario-\d{3}$/))
        .sort();
    
    const renames = [];
    
    for (const folder of audioFolders) {
        const scenarioNum = parseInt(folder.match(/scenario-(\d{3})/)[1]);
        const mapping = scenarioToPack.get(scenarioNum);
        
        if (mapping) {
            const oldPath = path.join(AUDIO_DIR, folder);
            const newName = `pack-${mapping.pack.padStart(3, '0')}-scenario-${mapping.indexInPack.toString().padStart(3, '0')}`;
            const newPath = path.join(AUDIO_DIR, newName);
            
            renames.push({
                oldPath,
                newPath,
                oldName: folder,
                newName,
                scenarioInfo: mapping
            });
        } else {
            console.log(`  ⚠️  Warning: No pack mapping found for ${folder}`);
        }
    }
    
    // Check for conflicts before renaming
    console.log('\n🔍 Checking for conflicts...');
    const conflicts = renames.filter(r => fs.existsSync(r.newPath));
    
    if (conflicts.length > 0) {
        console.error('❌ Conflicts detected! The following folders already exist:');
        conflicts.forEach(c => console.error(`   ${c.newName}`));
        console.error('\nPlease resolve these conflicts before continuing.');
        return;
    }
    
    // Perform the renames
    console.log('\n📝 Performing renames...');
    let successCount = 0;
    
    for (const rename of renames) {
        try {
            fs.renameSync(rename.oldPath, rename.newPath);
            console.log(`  ✓ ${rename.oldName} → ${rename.newName} (${rename.scenarioInfo.title})`);
            successCount++;
        } catch (error) {
            console.error(`  ❌ Failed to rename ${rename.oldName}: ${error.message}`);
        }
    }
    
    console.log(`\n✅ Migration complete! Renamed ${successCount} folders.`);
    
    // Create a migration log
    const migrationLog = {
        timestamp: new Date().toISOString(),
        totalFolders: audioFolders.length,
        successfulRenames: successCount,
        renames: renames.map(r => ({
            old: r.oldName,
            new: r.newName,
            scenarioId: r.scenarioInfo.id,
            title: r.scenarioInfo.title
        }))
    };
    
    fs.writeFileSync(
        path.join(AUDIO_DIR, 'migration-log.json'),
        JSON.stringify(migrationLog, null, 2)
    );
    
    console.log('\n📄 Migration log saved to:', path.join(AUDIO_DIR, 'migration-log.json'));
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`  Total audio folders found: ${audioFolders.length}`);
    console.log(`  Successfully renamed: ${successCount}`);
    console.log(`  Warnings/unmapped: ${audioFolders.length - renames.length}`);
    
    if (audioFolders.length - renames.length > 0) {
        console.log('\n⚠️  Some folders could not be mapped to packs. These may be:');
        console.log('  - Extra scenarios beyond pack definitions');
        console.log('  - Test scenarios');
        console.log('  - Scenarios from incomplete packs');
    }
}

// Run the migration
migrateAudioFolders().catch(console.error);