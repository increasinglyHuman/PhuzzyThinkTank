#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function transcribeAudioFiles() {
    console.log('🐿️ Chipmunk Cheese Chase Audio Transcription Tool');
    console.log('================================================');
    
    // Check for ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('❌ ELEVENLABS_API_KEY environment variable not set');
        process.exit(1);
    }
    
    console.log('✅ ElevenLabs API key found');
    
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
            claim: '',
            audioFiles: {
                title: path.join(folderPath, 'title.mp3'),
                content: path.join(folderPath, 'content.mp3'),
                claim: path.join(folderPath, 'claim.mp3')
            }
        };
        
        // Transcribe each audio file
        for (const [type, filePath] of Object.entries(scenario.audioFiles)) {
            if (fs.existsSync(filePath)) {
                console.log(`  🎤 Transcribing ${type}.mp3...`);
                try {
                    const transcript = await transcribeAudioFile(filePath, apiKey);
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
        
        // Clean up audio file paths from scenario object
        delete scenario.audioFiles;
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

async function transcribeAudioFile(filePath, apiKey) {
    const FormData = require('form-data');
    const { default: fetch } = await import('node-fetch');
    
    // Read the audio file
    const audioBuffer = fs.readFileSync(filePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBuffer, {
        filename: path.basename(filePath),
        contentType: 'audio/mpeg'
    });
    
    // ElevenLabs speech-to-text API endpoint
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            ...formData.getHeaders()
        },
        body: formData
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    return result.text || result.transcript || '[No transcript returned]';
}

// Run the transcription
if (require.main === module) {
    transcribeAudioFiles().catch(error => {
        console.error('\n💥 Transcription failed:', error);
        process.exit(1);
    });
}

module.exports = { transcribeAudioFiles };