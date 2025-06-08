#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK = process.argv.includes('--rollback');

// File mappings
const FILE_UPDATES = [
    // Core game files
    {
        file: 'js/core/scenario-packs-config.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'js/core/scenario-manager.js',
        replacements: [
            { from: './data/scenarios.json', to: './data/legacy/scenarios.json' },
            { from: './data/logical-fallacies.json', to: './data/reference/logical-fallacies.json' }
        ]
    },
    
    // Tools that use direct requires
    {
        file: 'compare-scenarios.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'analyze-scenario-themes.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'check-field-usage.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    
    // Tools that scan directories
    {
        file: 'gentle-migrate-topics.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'distribute-batch-to-packs.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'package-scenarios-v2.js',
        replacements: [
            { from: 'path.join(__dirname, \'data\')', to: 'path.join(__dirname, \'data/scenario-packs\')' }
        ]
    },
    
    // AI context files
    {
        file: 'ai-context/add-scenario-efficiently.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    {
        file: 'ai-context/add-scenario-incremental.js',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    
    // Test files
    {
        file: 'test-v2-compatibility.html',
        replacements: [
            { from: './data/scenario-generated-', to: './data/scenario-packs/scenario-generated-' }
        ]
    },
    
    // Tools that scan for patterns
    {
        file: 'identify-scenarios-to-regenerate.js',
        replacements: [
            { from: 'path.join(__dirname, \'data\')', to: 'path.join(__dirname, \'data/scenario-packs\')' },
            { from: 'await fs.readdir(path.join(__dirname, \'data\'))', to: 'await fs.readdir(path.join(__dirname, \'data/scenario-packs\'))' }
        ]
    },
    {
        file: 'tools/batch-title-generator.js',
        replacements: [
            { from: 'path.join(__dirname, \'../data\')', to: 'path.join(__dirname, \'../data/scenario-packs\')' }
        ]
    },
    {
        file: 'tools/elevenlabs-voice-generator.js',
        replacements: [
            { from: 'path.join(__dirname, \'../data\')', to: 'path.join(__dirname, \'../data/scenario-packs\')' }
        ]
    },
    
    // Other references
    {
        file: 'check-scenarios.js',
        replacements: [
            { from: 'data/scenario-generated-complete.json', to: 'data/legacy/scenario-generated-complete.json' }
        ]
    },
    {
        file: 'repair-scenarios.js',
        replacements: [
            { from: 'data/scenario-generated-complete.json', to: 'data/legacy/scenario-generated-complete.json' }
        ]
    }
];

async function createBackup() {
    console.log('📸 Creating backup before migration...');
    const timestamp = Date.now();
    const backupDir = `backups/pre-migration-${timestamp}`;
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // Backup all files we're going to modify
    for (const update of FILE_UPDATES) {
        try {
            const content = await fs.readFile(update.file, 'utf8');
            const backupPath = path.join(backupDir, update.file);
            await fs.mkdir(path.dirname(backupPath), { recursive: true });
            await fs.writeFile(backupPath, content);
            console.log(`  ✓ Backed up ${update.file}`);
        } catch (e) {
            console.log(`  ⚠️  Couldn't backup ${update.file}: ${e.message}`);
        }
    }
    
    // Save migration metadata
    const metadata = {
        timestamp: new Date(timestamp).toISOString(),
        filesModified: FILE_UPDATES.map(u => u.file),
        migrationComplete: false
    };
    
    await fs.writeFile(path.join(backupDir, 'migration-metadata.json'), JSON.stringify(metadata, null, 2));
    return backupDir;
}

async function updateFilePaths() {
    console.log('\n📝 Updating file references...');
    
    for (const update of FILE_UPDATES) {
        try {
            let content = await fs.readFile(update.file, 'utf8');
            let modified = false;
            
            for (const replacement of update.replacements) {
                if (content.includes(replacement.from)) {
                    content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
                    modified = true;
                    console.log(`  ✓ Updated ${update.file}: ${replacement.from} → ${replacement.to}`);
                }
            }
            
            if (modified && !DRY_RUN) {
                await fs.writeFile(update.file, content);
            }
        } catch (e) {
            console.log(`  ⚠️  Couldn't update ${update.file}: ${e.message}`);
        }
    }
}

async function moveFiles() {
    console.log('\n📁 Moving files to new structure...');
    
    // Create directories
    const dirs = ['data/scenario-packs', 'data/legacy', 'data/schemas', 'data/reference'];
    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}/`);
    }
    
    // Move scenario packs
    for (let i = 0; i <= 6; i++) {
        const filename = `scenario-generated-${i.toString().padStart(3, '0')}.json`;
        try {
            if (!DRY_RUN) {
                await fs.rename(`data/${filename}`, `data/scenario-packs/${filename}`);
            }
            console.log(`  ✓ Moved ${filename} to scenario-packs/`);
        } catch (e) {
            console.log(`  ⚠️  Couldn't move ${filename}: ${e.message}`);
        }
    }
    
    // Move legacy files
    const legacyFiles = [
        'scenario-generated-002-backup-1749055701782.json',
        'scenarios-backup-1749108875.json',
        'scenario-generated-complete.json',
        'scenarios.json',
        'scenarios_repaired.json'
    ];
    
    for (const file of legacyFiles) {
        try {
            if (!DRY_RUN) {
                await fs.rename(`data/${file}`, `data/legacy/${file}`);
            }
            console.log(`  ✓ Moved ${file} to legacy/`);
        } catch (e) {
            console.log(`  ⚠️  Couldn't move ${file}: ${e.message}`);
        }
    }
    
    // Move schema files
    const schemaFiles = await fs.readdir('data');
    for (const file of schemaFiles) {
        if (file.includes('schema') && file.endsWith('.json')) {
            try {
                if (!DRY_RUN) {
                    await fs.rename(`data/${file}`, `data/schemas/${file}`);
                }
                console.log(`  ✓ Moved ${file} to schemas/`);
            } catch (e) {
                console.log(`  ⚠️  Couldn't move ${file}: ${e.message}`);
            }
        }
    }
    
    // Move reference files
    const referenceFiles = ['indicator-trigger-icons.json', 'logical-fallacies.json', 'scenario-example-v2.json'];
    for (const file of referenceFiles) {
        try {
            if (!DRY_RUN) {
                await fs.rename(`data/${file}`, `data/reference/${file}`);
            }
            console.log(`  ✓ Moved ${file} to reference/`);
        } catch (e) {
            console.log(`  ⚠️  Couldn't move ${file}: ${e.message}`);
        }
    }
}

async function main() {
    console.log('🚀 Scenario Pack Migration Tool');
    console.log('================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    if (ROLLBACK) {
        console.log('⏪ ROLLBACK MODE - Not yet implemented\n');
        return;
    }
    
    // Create backup
    const backupDir = await createBackup();
    console.log(`\n✅ Backup created at: ${backupDir}`);
    
    // Update file paths
    await updateFilePaths();
    
    // Move files
    await moveFiles();
    
    console.log('\n✅ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the game to ensure all scenarios load correctly');
    console.log('2. Run voice generation tools to verify paths work');
    console.log('3. If issues occur, restore from backup: ' + backupDir);
    
    if (DRY_RUN) {
        console.log('\n⚠️  This was a DRY RUN. To execute:');
        console.log('   node migrate-scenario-packs.js');
    }
}

main().catch(console.error);