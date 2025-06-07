#!/usr/bin/env node
/**
 * Analyzes existing scenarios to identify common themes/topics
 * This helps us assign appropriate categories during migration
 */

const fs = require('fs');

// Load scenario packs
const packs = [
    { file: './data/scenario-packs/scenario-generated-000.json', name: 'Pack 000' },
    { file: './data/scenario-packs/scenario-generated-001.json', name: 'Pack 001' },
    { file: './data/scenario-packs/scenario-generated-002.json', name: 'Pack 002' }
];

console.log('🌱 Bonsai Master Theme Analysis\n');
console.log('Analyzing scenarios to identify natural groupings...\n');

packs.forEach(pack => {
    try {
        const data = JSON.parse(fs.readFileSync(pack.file, 'utf8'));
        console.log(`\n=== ${pack.name}: ${data.packInfo.packName} ===`);
        console.log(`Description: ${data.packInfo.description}`);
        console.log('\nScenario titles and content themes:');
        
        data.scenarios.forEach((scenario, index) => {
            console.log(`\n${index + 1}. ${scenario.title} (${scenario.id})`);
            
            // Extract key themes from text
            const text = scenario.text.toLowerCase();
            const themes = [];
            
            // Technology themes
            if (text.includes('ai') || text.includes('algorithm') || text.includes('app') || text.includes('crypto')) {
                themes.push('Technology');
            }
            
            // Health/Wellness themes
            if (text.includes('health') || text.includes('wellness') || text.includes('supplement') || text.includes('vaccine')) {
                themes.push('Health & Wellness');
            }
            
            // Social Media themes
            if (text.includes('instagram') || text.includes('tiktok') || text.includes('influencer') || text.includes('followers')) {
                themes.push('Social Media');
            }
            
            // Environment themes
            if (text.includes('climate') || text.includes('sustainable') || text.includes('eco')) {
                themes.push('Environment');
            }
            
            // Parenting themes
            if (text.includes('parent') || text.includes('child') || text.includes('kids') || text.includes('mom') || text.includes('dad')) {
                themes.push('Parenting');
            }
            
            // Work/Career themes
            if (text.includes('work') || text.includes('career') || text.includes('boss') || text.includes('corporate')) {
                themes.push('Work & Career');
            }
            
            // Education themes
            if (text.includes('school') || text.includes('teacher') || text.includes('student') || text.includes('professor')) {
                themes.push('Education');
            }
            
            // Finance themes
            if (text.includes('invest') || text.includes('money') || text.includes('financial') || text.includes('$')) {
                themes.push('Finance');
            }
            
            console.log(`   Detected themes: ${themes.length > 0 ? themes.join(', ') : 'General/Lifestyle'}`);
        });
        
    } catch (error) {
        console.error(`Error reading ${pack.file}:`, error.message);
    }
});

console.log('\n\n🎯 Theme Categories for Migration:');
console.log('\nSuggested pack-level categories based on analysis:');
console.log('- Pack 000: "Core Media Literacy" (foundational scenarios)');
console.log('- Pack 001: "Digital Age Dilemmas" (tech & modern life)');
console.log('- Pack 002: "Modern Manipulation" (sophisticated tactics)');

console.log('\nSuggested topic taxonomy:');
console.log('- Technology & AI');
console.log('- Health & Wellness');
console.log('- Social Media & Influence');
console.log('- Environment & Sustainability');
console.log('- Parenting & Family');
console.log('- Work & Career');
console.log('- Education & Learning');
console.log('- Finance & Economics');
console.log('- Community & Society');
console.log('- General Critical Thinking');