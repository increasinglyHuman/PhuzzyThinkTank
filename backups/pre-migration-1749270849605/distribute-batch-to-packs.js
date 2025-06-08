#!/usr/bin/env node
/**
 * Distributes scenarios from batch-001 into new v2 format packs (003, 004, 005)
 */

const fs = require('fs');
const path = require('path');

// Load the batch file
const batchData = JSON.parse(fs.readFileSync('./scenarios-batch-001.json', 'utf8'));
console.log(`📦 Processing ${batchData.scenarios.length} scenarios from batch-001\n`);

// Pack configurations based on content analysis
const PACK_CONFIGS = [
    {
        packId: 'diverse-scenarios-003',
        packName: 'Digital Life & Society',
        description: 'Modern challenges in technology, education, and social dynamics',
        topic: 'Digital Age Challenges',
        category: 'Contemporary',
        startIdx: 0,
        endIdx: 10
    },
    {
        packId: 'nature-culture-004', 
        packName: 'Nature, Culture & Identity',
        description: 'Animal parables, sci-fi fandoms, and cultural commentary',
        topic: 'Cultural Commentary',
        category: 'Creative',
        startIdx: 10,
        endIdx: 20
    },
    {
        packId: 'community-life-005',
        packName: 'Community & Everyday Life',
        description: 'Workplace dynamics, local communities, and lifestyle choices',
        topic: 'Community & Lifestyle',
        category: 'Social',
        startIdx: 20,
        endIdx: 30
    }
];

// Topic mapping for scenarios based on their content
const SCENARIO_TOPICS = {
    'ai-tutoring-parent-panic-001': 'Education & Learning',
    'minimalist-influencer-001': 'Social Media & Influence',
    'screen-time-parent-hypocrisy-001': 'Parenting & Family',
    'wellness-industry-paradox-001': 'Health & Wellness',
    'online-course-fomo-001': 'Education & Learning',
    'productivity-guru-burnout-001': 'Work & Career',
    'fitness-influencer-reality-001': 'Social Media & Influence',
    'crypto-bro-basement-reality-001': 'Finance & Economics',
    'natural-parenting-vaccine-001': 'Parenting & Family',
    'climate-debate-strawman-001': 'Environment & Sustainability',
    'penguin-ice-hotel-luxury-001': 'Social Media & Influence',
    'dog-park-breed-panic-001': 'Community & Society',
    'vegan-lion-savanna-001': 'Health & Wellness',
    'zoo-panda-freedom-debate-001': 'Environment & Sustainability',
    'cat-domestication-conspiracy-001': 'Technology & AI',
    'salmon-upstream-grindset-001': 'Work & Career',
    'octopus-multitasking-burnout-001': 'Work & Career',
    'hamster-wheel-economy-001': 'Finance & Economics',
    'peacock-fake-authenticity-001': 'Social Media & Influence',
    'scifi-canon-wars-001': 'Community & Society',
    'scifi-retcon-rage-001': 'Community & Society',
    'scifi-timeline-truthers-001': 'Community & Society',
    'scifi-cosplay-accuracy-001': 'Community & Society',
    'kindergarten-court-001': 'Education & Learning',
    'birthday-party-economics-001': 'Parenting & Family',
    'snack-time-monopoly-001': 'Education & Learning',
    'saturday-market-intel-001': 'Community & Society',
    'bee-hive-toxic-positivity-001': 'Work & Career'
};

// Create backup directory
const BACKUP_DIR = './backups/pack-distribution';
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Process each pack
PACK_CONFIGS.forEach((config, index) => {
    const packNumber = String(index + 3).padStart(3, '0');
    const outputFile = `./data/scenario-generated-${packNumber}.json`;
    
    console.log(`\n📄 Creating Pack ${packNumber}: ${config.packName}`);
    
    // Get scenarios for this pack
    const packScenarios = batchData.scenarios.slice(config.startIdx, config.endIdx);
    
    // Add topic to each scenario
    packScenarios.forEach(scenario => {
        if (!scenario.topic && scenario.id) {
            scenario.topic = SCENARIO_TOPICS[scenario.id] || 'General Critical Thinking';
        }
    });
    
    // Create pack structure
    const pack = {
        version: "2.0.0",
        packInfo: {
            packId: config.packId,
            packName: config.packName,
            author: "Phuzzy Think Tank Community",
            description: config.description,
            createdDate: new Date().toISOString().split('T')[0],
            topic: config.topic,
            category: config.category
        },
        scenarios: packScenarios
    };
    
    // Write the pack file
    fs.writeFileSync(outputFile, JSON.stringify(pack, null, 2));
    console.log(`✅ Created ${outputFile}`);
    console.log(`   - Scenarios: ${packScenarios.length}`);
    console.log(`   - Topic: ${config.topic}`);
    console.log(`   - Category: ${config.category}`);
    
    // Show sample scenarios
    console.log('   - Sample scenarios:');
    packScenarios.slice(0, 3).forEach(s => {
        console.log(`     • ${s.title} (${s.topic})`);
    });
});

// Create a backup of the batch file
const backupFile = path.join(BACKUP_DIR, `scenarios-batch-001-distributed-${Date.now()}.json`);
fs.copyFileSync('./scenarios-batch-001.json', backupFile);
console.log(`\n💾 Backup created: ${backupFile}`);

console.log('\n✨ Distribution complete!');
console.log('\n📊 Summary:');
console.log('- Created 3 new packs (003, 004, 005)');
console.log('- Each pack contains 10 scenarios');
console.log('- All scenarios have topic assignments');
console.log('- Original batch file preserved');

console.log('\n🔧 Next steps:');
console.log('1. Update scenario-packs-config.js to register the new packs');
console.log('2. Test loading each pack in the game');
console.log('3. Consider creating a combined pack with all 60 scenarios');