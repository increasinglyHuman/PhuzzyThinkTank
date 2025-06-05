#!/usr/bin/env node
// AI Scenario Generator with Memory Management
// Generates scenarios one at a time based on v2 spec

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TARGET_FILE = './data/scenario-generated-002.json';
const SPEC_FILE = './data/ai-scenario-generation-spec-v2.md';

// Memory monitoring
function checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const percentUsed = Math.round((usage.heapUsed / usage.heapTotal) * 100);
    
    console.log(`💾 Memory: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentUsed}% used)`);
    
    // Warning if over 80% memory used
    if (percentUsed > 80) {
        console.log('⚠️  WARNING: Memory usage high! Consider stopping.');
        return false;
    }
    return true;
}

// Add scenario to file
function addScenarioToFile(scenario) {
    try {
        const data = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
        data.scenarios.push(scenario);
        fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2));
        
        console.log(`✅ Added: ${scenario.id} - ${scenario.title}`);
        console.log(`📊 Total scenarios: ${data.scenarios.length}`);
        return true;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
}

// Force garbage collection
function cleanMemory() {
    if (global.gc) {
        global.gc();
        console.log('🧹 Memory cleaned');
    }
}

// Scenario generation prompt based on v2 spec
function getScenarioPrompt(topicNumber, topicDescription) {
    return `
Generate ONE scenario for topic ${topicNumber}: ${topicDescription}

Follow the AI Scenario Generation Spec v2:
- Include "winking admission" pattern where appropriate
- Use statistical whiplash technique
- Match voice to platform authenticity
- Create emotional cascade
- Include 4+ complexity elements
- Calculate precise answer weights (not rounded to 10s)
- Select peak moments that would visually pop
- Write dimension analysis showing progression

The scenario should be a complete JSON object matching the schema in scenario-generated-002.json.
Make it current, realistic, and educational about manipulation tactics.
`;
}

// Topics from the spec
const TOPICS = [
    { num: 5, desc: "AI in Education - Cheating detection, personalized learning, teacher replacement fears" },
    { num: 6, desc: "Remote Work Culture - Productivity monitoring, work-life balance, career advancement" },
    { num: 7, desc: "Youth Sports Pressure - College scholarships, parent investment, child burnout" },
    { num: 8, desc: "Sustainable Fashion - Fast fashion guilt, greenwashing, cost barriers" },
    { num: 9, desc: "Dating App Psychology - Algorithm manipulation, profile optimization, authenticity" },
    { num: 10, desc: "Neighborhood Surveillance - Ring cameras, privacy, community safety" }
];

// Main workflow
async function generateScenarios() {
    console.log('🚀 AI Scenario Generator with Memory Management');
    console.log('==============================================\n');
    
    // Create backup
    const backupFile = TARGET_FILE.replace('.json', `-backup-${Date.now()}.json`);
    fs.copyFileSync(TARGET_FILE, backupFile);
    console.log(`💾 Backup created: ${backupFile}\n`);
    
    // Check current status
    const current = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
    console.log(`📁 Target: ${TARGET_FILE}`);
    console.log(`📊 Current scenarios: ${current.scenarios.length}`);
    console.log(`🎯 Goal: Add ${TOPICS.length} more scenarios\n`);
    
    // Initial memory check
    checkMemory();
    
    console.log('\n📋 Process:');
    console.log('1. I will generate one scenario at a time');
    console.log('2. Add it to the file');
    console.log('3. Clean memory');
    console.log('4. Check memory usage');
    console.log('5. Continue if memory is OK\n');
    
    console.log('Topics to generate:');
    TOPICS.forEach(t => console.log(`  ${t.num}. ${t.desc}`));
    
    console.log('\n🤖 Ready to generate scenarios based on v2 spec!\n');
    
    // Return topics for external generation
    return {
        topics: TOPICS,
        currentCount: current.scenarios.length,
        backupFile,
        prompt: getScenarioPrompt
    };
}

// CLI interface
if (require.main === module) {
    generateScenarios().then(info => {
        console.log('\n✨ Setup complete!');
        console.log('Next steps:');
        console.log('1. Generate a scenario using the v2 spec');
        console.log('2. Add it using: node ai-scenario-generator.js add <scenario-json>');
        console.log('3. Check memory and continue');
    }).catch(console.error);
}

// Export functions for use
module.exports = {
    addScenarioToFile,
    checkMemory,
    cleanMemory,
    getScenarioPrompt,
    TOPICS
};