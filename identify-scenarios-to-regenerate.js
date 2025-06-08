#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Known female names that were misgendered
const KNOWN_FEMALE_NAMES = [
    'Jessica Chen',
    'Sarah Chen', 
    'Dr. Sarah Chen',
    'Mrs. Rodriguez',
    'Emma',
    'Lisa',
    'Anna'
];

// Profanity list to check
const PROFANITY_LIST = [
    'shit', 'fuck', 'damn', 'ass', 'bitch', 'hell', 'crap', 'bastard',
    'piss', 'dick', 'cock', 'pussy', 'fag', 'slut', 'whore'
];

async function analyzeScenarios() {
    console.log('🔍 Analyzing scenarios for regeneration needs...\n');
    
    const toRegenerate = {
        misgendered: [],
        profanity: [],
        missing: []
    };
    
    // Load analytics to check gender assignments
    try {
        const analyticsPath = path.join(__dirname, 'data/audio-recording-voices-for-scenarios-from-elevenlabs/voice-analytics.json');
        const analyticsData = JSON.parse(await fs.readFile(analyticsPath, 'utf8'));
        
        // Check for misgendered characters
        if (analyticsData.nameGenderMap) {
            Object.entries(analyticsData.nameGenderMap).forEach(([name, gender]) => {
                // Check if a known female was assigned male
                const isKnownFemale = KNOWN_FEMALE_NAMES.some(fname => 
                    name.toLowerCase().includes(fname.toLowerCase())
                );
                
                if (isKnownFemale && gender === 'male') {
                    toRegenerate.misgendered.push({
                        name,
                        assignedGender: gender,
                        correctGender: 'female'
                    });
                }
            });
        }
        
        // Check profanity filtered scenarios
        if (analyticsData.profanityFiltered && analyticsData.profanityFiltered.affectedScenarios) {
            toRegenerate.profanity = analyticsData.profanityFiltered.affectedScenarios;
        }
        
    } catch (e) {
        console.log('⚠️  No analytics file found yet');
    }
    
    // Check all scenario files for profanity and missing audio
    const scenarioFiles = await fs.readdir(path.join(__dirname, 'data/scenario-packs'));
    const scenarioJsonFiles = scenarioFiles.filter(f => f.match(/^scenario-generated-\d{3}\.json$/));
    
    let totalScenarios = 0;
    
    for (const file of scenarioJsonFiles) {
        const data = JSON.parse(await fs.readFile(path.join(__dirname, 'data', file), 'utf8'));
        const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
        
        for (let i = 0; i < scenarios.length; i++) {
            const globalIndex = totalScenarios + i;
            const scenarioId = globalIndex.toString().padStart(3, '0');
            const scenario = scenarios[i];
            
            // Check if audio exists
            const audioDir = path.join(__dirname, 'data/audio-recording-voices-for-scenarios-from-elevenlabs', `scenario-${scenarioId}`);
            try {
                await fs.access(audioDir);
            } catch {
                toRegenerate.missing.push({
                    id: scenarioId,
                    title: scenario.title
                });
            }
            
            // Check for profanity in text
            const textToCheck = [
                scenario.title || '',
                scenario.text || scenario.description || '',
                scenario.claim || ''
            ].join(' ').toLowerCase();
            
            const foundProfanity = PROFANITY_LIST.filter(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                return regex.test(textToCheck);
            });
            
            if (foundProfanity.length > 0 && !toRegenerate.profanity.includes(scenarioId)) {
                toRegenerate.profanity.push(scenarioId);
            }
        }
        
        totalScenarios += scenarios.length;
    }
    
    // Generate report
    console.log('📊 Regeneration Report');
    console.log('====================\n');
    
    console.log(`📝 Total scenarios analyzed: ${totalScenarios}`);
    console.log(`❌ Missing audio: ${toRegenerate.missing.length}`);
    console.log(`🚫 Contains profanity: ${toRegenerate.profanity.length}`);
    console.log(`👤 Misgendered voices: ${toRegenerate.misgendered.length}\n`);
    
    if (toRegenerate.misgendered.length > 0) {
        console.log('👤 Misgendered Characters:');
        toRegenerate.misgendered.forEach(({name, assignedGender, correctGender}) => {
            console.log(`   - "${name}" was ${assignedGender}, should be ${correctGender}`);
        });
        console.log('');
    }
    
    if (toRegenerate.profanity.length > 0) {
        console.log('🚫 Scenarios with profanity:');
        toRegenerate.profanity.slice(0, 10).forEach(id => {
            console.log(`   - scenario-${id}`);
        });
        if (toRegenerate.profanity.length > 10) {
            console.log(`   ... and ${toRegenerate.profanity.length - 10} more`);
        }
        console.log('');
    }
    
    if (toRegenerate.missing.length > 0) {
        console.log('❌ Missing audio files:');
        toRegenerate.missing.slice(0, 10).forEach(({id, title}) => {
            console.log(`   - scenario-${id}: ${title}`);
        });
        if (toRegenerate.missing.length > 10) {
            console.log(`   ... and ${toRegenerate.missing.length - 10} more`);
        }
        console.log('');
    }
    
    // Calculate cost impact
    const totalToRegenerate = new Set([
        ...toRegenerate.profanity,
        ...toRegenerate.missing.map(m => m.id),
        // Add scenarios that contain misgendered characters
        // (This would require tracking which scenarios contain which characters)
    ]).size;
    
    const avgCharsPerScenario = 3000; // Rough estimate
    const creditsNeeded = Math.ceil((totalToRegenerate * avgCharsPerScenario) / 1000);
    const standardCost = creditsNeeded * 0.30; // $0.30 per 1000 chars
    const turboCost = creditsNeeded * 0.15;    // $0.15 per 1000 chars
    
    console.log('💰 Cost Estimate for Regeneration:');
    console.log(`   Scenarios to regenerate: ${totalToRegenerate}`);
    console.log(`   Estimated credits: ${creditsNeeded.toLocaleString()}`);
    console.log(`   Standard quality: $${standardCost.toFixed(2)}`);
    console.log(`   Turbo quality: $${turboCost.toFixed(2)} (50% savings)`);
    
    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalAnalyzed: totalScenarios,
            missingAudio: toRegenerate.missing.length,
            withProfanity: toRegenerate.profanity.length,
            misgenderedVoices: toRegenerate.misgendered.length,
            totalToRegenerate
        },
        details: toRegenerate,
        costEstimate: {
            scenarios: totalToRegenerate,
            estimatedCredits: creditsNeeded,
            standardCost,
            turboCost
        }
    };
    
    await fs.writeFile(
        path.join(__dirname, 'scenarios-to-regenerate.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Full report saved to: scenarios-to-regenerate.json');
    
    // Suggest next steps
    console.log('\n📋 Recommended Next Steps:');
    console.log('1. Review the profanity filter in the voice generator');
    console.log('2. Update gender detection for known names');
    console.log('3. Run regeneration in turbo mode to save 50% on costs');
    console.log('4. Command: ./voice-generation-safe.sh --turbo');
}

analyzeScenarios().catch(console.error);