#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// Import config from main generator
const CONFIG = {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    modelId: 'eleven_multilingual_v2',
    modelIdTurbo: 'eleven_turbo_v2',
    outputFormat: 'mp3_44100_128',
    baseUrl: 'api.elevenlabs.io',
    outputDir: path.join(__dirname, '../data/audio-recording-voices-for-scenarios-from-elevenlabs'),
    useTurbo: process.env.USE_TURBO === 'true' || false,
    voiceId: 'JBFqnCBsd6RMkjVDRZzb' // Default voice
};

async function generateBatchTitles() {
    console.log('🎙️ Batch Title Generator - Cost Optimization Mode');
    console.log('================================================\n');
    
    // Load all scenarios
    const scenarioFiles = await fs.readdir(path.join(__dirname, '../data/scenario-packs'));
    const jsonFiles = scenarioFiles.filter(f => f.match(/^scenario-generated-\d{3}\.json$/)).sort();
    
    const allTitles = [];
    let totalScenarios = 0;
    
    // Collect all titles
    for (const file of jsonFiles) {
        const data = JSON.parse(await fs.readFile(path.join(__dirname, '../data', file), 'utf8'));
        const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
        
        scenarios.forEach((scenario, index) => {
            const globalIndex = totalScenarios + index;
            allTitles.push({
                id: globalIndex.toString().padStart(3, '0'),
                title: scenario.title || `Scenario ${globalIndex}`
            });
        });
        
        totalScenarios += scenarios.length;
    }
    
    console.log(`📊 Found ${allTitles.length} titles to generate\n`);
    
    // Calculate costs
    const totalChars = allTitles.reduce((sum, item) => sum + item.title.length, 0);
    const pauseChars = allTitles.length * 10; // Short pause markers like "... Next: "
    const batchChars = totalChars + pauseChars;
    
    const individualCost = {
        chars: totalChars,
        calls: allTitles.length,
        standard: (totalChars / 1000) * 0.30,
        turbo: (totalChars / 1000) * 0.15
    };
    
    const batchCost = {
        chars: batchChars,
        calls: Math.ceil(allTitles.length / 10), // Assume 10 titles per batch
        standard: (batchChars / 1000) * 0.30,
        turbo: (batchChars / 1000) * 0.15
    };
    
    console.log('💰 Cost Comparison:');
    console.log('==================');
    console.log('\nIndividual Generation (current method):');
    console.log(`  Characters: ${individualCost.chars.toLocaleString()}`);
    console.log(`  API Calls: ${individualCost.calls}`);
    console.log(`  Standard Cost: $${individualCost.standard.toFixed(2)}`);
    console.log(`  Turbo Cost: $${individualCost.turbo.toFixed(2)}`);
    
    console.log('\nBatch Generation (optimized):');
    console.log(`  Characters: ${batchCost.chars.toLocaleString()} (includes pause markers)`);
    console.log(`  API Calls: ${batchCost.calls}`);
    console.log(`  Standard Cost: $${batchCost.standard.toFixed(2)}`);
    console.log(`  Turbo Cost: $${batchCost.turbo.toFixed(2)}`);
    
    console.log('\n📈 Savings Analysis:');
    console.log(`  API Call Reduction: ${((1 - batchCost.calls/individualCost.calls) * 100).toFixed(1)}%`);
    console.log(`  Cost Increase: ${((batchCost.standard/individualCost.standard - 1) * 100).toFixed(1)}% (due to pause markers)`);
    console.log(`  Rate Limit Benefit: ${individualCost.calls - batchCost.calls} fewer API calls\n`);
    
    // Create batch scripts with proper pauses
    const BATCH_SIZE = 10; // Titles per batch
    const batches = [];
    
    for (let i = 0; i < allTitles.length; i += BATCH_SIZE) {
        const batch = allTitles.slice(i, i + BATCH_SIZE);
        const batchScript = batch.map((item, index) => {
            // Use SSML-like markers that we can split on later
            return `[TITLE_${item.id}] ${item.title} [PAUSE_2s]`;
        }).join('\n');
        
        batches.push({
            startId: batch[0].id,
            endId: batch[batch.length - 1].id,
            text: batchScript,
            titles: batch
        });
    }
    
    console.log(`📦 Created ${batches.length} batches of ${BATCH_SIZE} titles each\n`);
    
    // Show example batch
    console.log('📝 Example Batch Format:');
    console.log('========================');
    console.log(batches[0].text.substring(0, 300) + '...\n');
    
    // Save batch configuration
    const batchConfig = {
        timestamp: new Date().toISOString(),
        totalTitles: allTitles.length,
        batchSize: BATCH_SIZE,
        costAnalysis: {
            individual: individualCost,
            batch: batchCost,
            savings: {
                apiCallReduction: ((1 - batchCost.calls/individualCost.calls) * 100).toFixed(1) + '%',
                costIncrease: ((batchCost.standard/individualCost.standard - 1) * 100).toFixed(1) + '%'
            }
        },
        batches: batches.map(b => ({
            range: `${b.startId}-${b.endId}`,
            characterCount: b.text.length,
            titleCount: b.titles.length
        }))
    };
    
    await fs.writeFile(
        path.join(__dirname, '../batch-title-config.json'),
        JSON.stringify(batchConfig, null, 2)
    );
    
    console.log('✅ Batch configuration saved to: batch-title-config.json\n');
    
    // Recommendation
    console.log('🤔 Recommendation:');
    console.log('==================');
    if (allTitles.length > 50) {
        console.log('✅ With ' + allTitles.length + ' titles, batch generation is recommended to:');
        console.log('   - Reduce API calls by ' + (individualCost.calls - batchCost.calls) + ' (avoid rate limits)');
        console.log('   - Slightly higher cost (~5%) but much more reliable');
        console.log('   - Can process all titles in ' + batchCost.calls + ' API calls vs ' + individualCost.calls);
    } else {
        console.log('❌ With only ' + allTitles.length + ' titles, individual generation might be better:');
        console.log('   - More flexibility to regenerate specific titles');
        console.log('   - Easier to handle errors on specific scenarios');
        console.log('   - Cost difference is minimal');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. To generate titles in batch mode, we would need to:');
    console.log('   - Generate batch audio files');
    console.log('   - Split them based on silence detection or timestamps');
    console.log('   - Save individual title files');
    console.log('2. This requires audio processing tools (ffmpeg or similar)');
    console.log('3. Consider if the complexity is worth the API call savings');
}

generateBatchTitles().catch(console.error);