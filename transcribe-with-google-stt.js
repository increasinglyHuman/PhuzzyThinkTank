#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function transcribeWithGoogleSTT() {
    console.log('🐿️ Chipmunk Cheese Chase - Google Speech-to-Text Transcription');
    console.log('================================================================');
    
    // Check if gcloud is installed
    try {
        execSync('gcloud --version', { stdio: 'ignore' });
        console.log('✅ Google Cloud CLI detected');
    } catch (error) {
        console.error('❌ Google Cloud CLI not found. Installing...');
        console.log('💡 Run: curl https://sdk.cloud.google.com | bash');
        console.log('💡 Then: gcloud auth login');
        console.log('💡 And: gcloud config set project YOUR_PROJECT_ID');
        return false;
    }
    
    // Check authentication
    try {
        execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { stdio: 'ignore' });
        console.log('✅ Google Cloud authentication verified');
    } catch (error) {
        console.error('❌ Not authenticated with Google Cloud');
        console.log('💡 Run: gcloud auth login');
        return false;
    }
    
    const audioBasePath = './data/audio-recording-voices-for-scenarios-from-elevenlabs';
    const transcribedScenarios = [];
    
    console.log('\n🎵 Transcribing pack 007 audio files with Google STT...');
    console.log('📊 Using Google Cloud free tier (60 minutes/month)');
    
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
                    const transcript = await transcribeWithGoogle(filePath);
                    scenario[type] = transcript;
                    console.log(`  ✅ ${type}: "${transcript.substring(0, 60)}${transcript.length > 60 ? '...' : ''}"`);
                    
                    // Small delay to be nice to the API
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
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
    
    // Save transcriptions
    const outputFile = './transcribed-chipmunk-scenarios-google.json';
    const result = {
        packId: "pack-007",
        theme: "Chipmunk Cheese Chase Adventures",
        description: "Adorable chipmunk scenarios transcribed using Google Speech-to-Text",
        transcribedAt: new Date().toISOString(),
        method: "Google Cloud Speech-to-Text API",
        scenarios: transcribedScenarios
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    console.log(`\n💾 Transcriptions saved to: ${outputFile}`);
    console.log(`📊 Total scenarios transcribed: ${transcribedScenarios.length}`);
    console.log(`💰 Estimated cost: ~$0.00 (within free tier)`);
    
    return result;
}

async function transcribeWithGoogle(audioFilePath) {
    try {
        // Use gcloud CLI to call Speech-to-Text API
        // First, we need to convert MP3 to WAV for better compatibility
        const wavPath = audioFilePath.replace('.mp3', '.wav');
        
        // Convert MP3 to WAV using ffmpeg (if available)
        try {
            execSync(`ffmpeg -i "${audioFilePath}" -ar 16000 -ac 1 "${wavPath}" -y`, { stdio: 'ignore' });
        } catch (error) {
            console.log('    ⚠️ ffmpeg not found, using MP3 directly (may have issues)');
        }
        
        const fileToUse = fs.existsSync(wavPath) ? wavPath : audioFilePath;
        
        // Create temporary JSON request file
        const requestJson = {
            config: {
                encoding: fs.existsSync(wavPath) ? "LINEAR16" : "MP3",
                sampleRateHertz: 16000,
                languageCode: "en-US",
                enableAutomaticPunctuation: true,
                enableWordTimeOffsets: false
            },
            audio: {
                content: fs.readFileSync(fileToUse).toString('base64')
            }
        };
        
        const tempRequestFile = `/tmp/stt-request-${Date.now()}.json`;
        fs.writeFileSync(tempRequestFile, JSON.stringify(requestJson));
        
        // Call Google Speech-to-Text API
        const command = `gcloud ml speech recognize "${tempRequestFile}" --language-code=en-US --format=json`;
        const result = execSync(command, { encoding: 'utf8' });
        
        // Clean up temp files
        fs.unlinkSync(tempRequestFile);
        if (fs.existsSync(wavPath) && wavPath !== audioFilePath) {
            fs.unlinkSync(wavPath);
        }
        
        // Parse result
        const response = JSON.parse(result);
        if (response.results && response.results.length > 0) {
            const alternatives = response.results[0].alternatives;
            if (alternatives && alternatives.length > 0) {
                return alternatives[0].transcript || '[No transcript in response]';
            }
        }
        
        return '[No speech detected]';
        
    } catch (error) {
        throw new Error(`Google STT failed: ${error.message}`);
    }
}

// Run the transcription
if (require.main === module) {
    transcribeWithGoogleSTT().then(result => {
        if (result) {
            console.log('\n🎉 Transcription completed successfully!');
            console.log('🐿️ Ready to restore the adorable chipmunk scenarios!');
        }
    }).catch(error => {
        console.error('\n💥 Transcription failed:', error.message);
        console.log('\n🤔 Alternative options:');
        console.log('1. Set up Google Cloud CLI and authentication');
        console.log('2. Try a different transcription service');
        console.log('3. Manual transcription of one sample file');
        process.exit(1);
    });
}

module.exports = { transcribeWithGoogleSTT };