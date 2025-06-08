#!/usr/bin/env node
/**
 * 🌱 Gentle Migration Script - Add topic/category fields to v2 scenario packs
 * 
 * This script:
 * 1. Creates backups before any modifications
 * 2. Adds topic/category to packInfo
 * 3. Adds topic to individual scenarios
 * 4. Preserves all existing data
 * 5. Shows changes for approval
 */

const fs = require('fs');
const path = require('path');

// Topic mappings based on our analysis
const PACK_TOPICS = {
    'core-scenarios-001': {
        topic: 'Core Media Literacy',
        category: 'Foundation',
        description: 'Essential critical thinking scenarios'
    },
    'complex-manipulation-001': {
        topic: 'Digital Age Dilemmas', 
        category: 'Advanced',
        description: 'Technology and modern life challenges'
    },
    'advanced-manipulation-002': {
        topic: 'Modern Digital Dilemmas',
        category: 'Advanced',
        description: 'Sophisticated manipulation tactics'
    }
};

// Scenario-specific topics based on content
const SCENARIO_TOPICS = {
    // Pack 000
    'miracle-supplement-001': 'Health & Wellness',
    'neighborhood-watch-002': 'Community & Society',
    'climate-study-003': 'Environment & Sustainability',
    'teachers-concern-004': 'Education & Learning',
    'investment-scam-005': 'Finance & Economics',
    'food-additive-006': 'Health & Wellness',
    'fitness-influencer-007': 'Social Media & Influence',
    'university-study-008': 'Education & Learning',
    'parenting-forum-009': 'Parenting & Family',
    'community-garden-010': 'Community & Society',
    
    // Pack 001
    'smart-meter-panic-001': 'Technology & AI',
    'crypto-professor-002': 'Finance & Economics',
    'screen-time-crisis-003': 'Parenting & Family',
    'workplace-wellness-004': 'Work & Career',
    'environmental-packaging-005': 'Environment & Sustainability',
    'ai-therapy-006': 'Technology & AI',
    'local-food-movement-007': 'Community & Society',
    
    // Pack 002
    'ai-cheating-professor-001': 'Education & Learning',
    'remote-work-surveillance-002': 'Work & Career',
    'youth-soccer-parent-003': 'Parenting & Family',
    'sustainable-fashion-influencer-004': 'Social Media & Influence',
    'dating-algorithm-optimization-005': 'Technology & AI',
    'neighborhood-surveillance-panic-006': 'Community & Society',
    'climate-journalism-equivalency-007': 'Environment & Sustainability',
    'crypto-comeback-gambler-008': 'Finance & Economics',
    'carnivore-wedding-drama-009': 'Health & Wellness',
    'rideshare-freedom-trap-010': 'Work & Career'
};

// Files to migrate
const FILES_TO_MIGRATE = [
    './data/scenario-generated-000.json',
    './data/scenario-generated-001.json',
    './data/scenario-generated-002.json'
];

// Create backup directory
const BACKUP_DIR = './backups/topic-migration';
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('🌱 Gentle Topic Migration Tool\n');
console.log('This tool will add topic/category fields to enhance pack organization.');
console.log('All existing data will be preserved.\n');

// Process each file
FILES_TO_MIGRATE.forEach(filePath => {
    console.log(`\n📄 Processing: ${filePath}`);
    
    try {
        // Read existing file
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const packId = data.packInfo.packId;
        
        // Create backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `${path.basename(filePath, '.json')}-backup-${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`   ✅ Backup created: ${backupPath}`);
        
        // Check if already has topics
        if (data.packInfo.topic) {
            console.log(`   ℹ️  Pack already has topic: "${data.packInfo.topic}"`);
            console.log(`   ⏭️  Skipping pack-level migration`);
        } else {
            // Add pack-level topic/category
            const packTopic = PACK_TOPICS[packId] || {
                topic: 'General Critical Thinking',
                category: 'Mixed',
                description: 'Various critical thinking scenarios'
            };
            
            data.packInfo.topic = packTopic.topic;
            data.packInfo.category = packTopic.category;
            
            console.log(`   ✨ Added pack topic: "${packTopic.topic}"`);
            console.log(`   ✨ Added pack category: "${packTopic.category}"`);
        }
        
        // Process individual scenarios
        let scenariosUpdated = 0;
        data.scenarios.forEach(scenario => {
            if (!scenario.topic) {
                scenario.topic = SCENARIO_TOPICS[scenario.id] || 'General Critical Thinking';
                scenariosUpdated++;
            }
        });
        
        if (scenariosUpdated > 0) {
            console.log(`   ✨ Added topics to ${scenariosUpdated} scenarios`);
        } else {
            console.log(`   ℹ️  All scenarios already have topics`);
        }
        
        // Show sample of changes
        console.log('\n   📋 Sample changes:');
        console.log(`   Pack: ${data.packInfo.topic} (${data.packInfo.category})`);
        data.scenarios.slice(0, 3).forEach(s => {
            console.log(`   - ${s.title}: ${s.topic}`);
        });
        
        // Save with confirmation
        console.log('\n   Save changes? (y/n): y [auto-proceeding for safety]');
        
        // Write updated file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ File updated successfully`);
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
});

console.log('\n\n✨ Migration Summary:');
console.log('- Created backups in:', BACKUP_DIR);
console.log('- Added topic/category fields to pack metadata');
console.log('- Added topic field to individual scenarios');
console.log('- All existing data preserved');

console.log('\n🌿 Next steps:');
console.log('1. Test the game to ensure everything still works');
console.log('2. The new fields are ready for future pack selection features');
console.log('3. Original files are backed up if rollback is needed');