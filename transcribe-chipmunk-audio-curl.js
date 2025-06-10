#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function transcribeAudioFiles() {
    console.log('🐿️ Chipmunk Cheese Chase Audio Transcription Tool (CURL Version)');
    console.log('=================================================================');
    
    // Use API key from env file
    const apiKey = 'sk_2bc1b076d4933bf42a7213dbf88048c7c9e8866bffa15cd4';
    console.log('✅ ElevenLabs API key loaded');
    
    // Path to pack 007 audio files
    const audioBasePath = './data/audio-recording-voices-for-scenarios-from-elevenlabs';
    const transcribedScenarios = [];
    
    console.log('\n🎵 Transcribing pack 007 audio files...');
    
    // Process pack-007-scenario-000 through pack-007-scenario-009
    for (let i = 0; i <= 9; i++) {
        const scenarioId = String(i).padStart(3, '0');
        const folderName = `pack-007-scenario-${scenarioId}`;
        const folderPath = path.join(audioBasePath, folderName);
        
        console.log(`\n📁 Processing ${folderName}...`);
        
        if (!fs.existsSync(folderPath)) {
            console.log(`  ⚠️ Folder not found: ${folderPath}`);
            continue;
        }
        
        const scenario = {
            id: `pack-007-${scenarioId}-chipmunk-${i}`,
            title: '',
            content: '',
            claim: ''
        };
        
        // Transcribe each audio file
        const audioTypes = ['title', 'content', 'claim'];
        for (const type of audioTypes) {
            const filePath = path.join(folderPath, `${type}.mp3`);
            
            if (fs.existsSync(filePath)) {
                console.log(`  🎤 Transcribing ${type}.mp3...`);
                try {
                    const transcript = transcribeAudioWithCurl(filePath, apiKey);
                    scenario[type] = transcript;
                    console.log(`  ✅ ${type}: "${transcript.substring(0, 50)}${transcript.length > 50 ? '...' : ''}}"`);
                } catch (error) {
                    console.log(`  ❌ Failed to transcribe ${type}: ${error.message}`);
                    scenario[type] = `[Transcription failed: ${error.message}]`;
                }
            } else {
                console.log(`  ⚠️ File not found: ${filePath}`);
                scenario[type] = '[Audio file not found]';
            }
        }
        
        transcribedScenarios.push(scenario);
    }
    
    // Save transcriptions to file
    const outputFile = './transcribed-chipmunk-scenarios.json';
    fs.writeFileSync(outputFile, JSON.stringify({
        packId: "pack-007",
        theme: "Chipmunk Cheese Chase Adventures",
        description: "Adorable chipmunk scenarios transcribed from audio files",
        transcribedAt: new Date().toISOString(),
        scenarios: transcribedScenarios
    }, null, 2));
    
    console.log(`\n💾 Transcriptions saved to: ${outputFile}`);
    console.log(`📊 Total scenarios transcribed: ${transcribedScenarios.length}`);
    
    return transcribedScenarios;
}

function transcribeAudioWithCurl(filePath, apiKey) {
    try {
        // Use curl to call ElevenLabs speech-to-text API
        const curlCommand = `curl -X POST "https://api.elevenlabs.io/v1/speech-to-text" \\
            -H "xi-api-key: ${apiKey}" \\
            -F "audio=@${filePath}" \\
            --silent`;
        
        const result = execSync(curlCommand, { encoding: 'utf8' });
        const response = JSON.parse(result);
        
        return response.text || response.transcript || '[No transcript in response]';
        
    } catch (error) {
        throw new Error(`CURL failed: ${error.message}`);
    }
}

// Run the transcription
if (require.main === module) {
    transcribeAudioFiles().catch(error => {
        console.error('\n💥 Transcription failed:', error);
        process.exit(1);
    });
}

module.exports = { transcribeAudioFiles };