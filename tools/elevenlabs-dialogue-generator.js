#!/usr/bin/env node

// Advanced dialogue generator that creates a single audio file with multiple voices
// by splitting dialogues, generating separately, then concatenating

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Example of how we could handle multi-voice scenarios
async function generateMultiVoiceScenario(scenarioText) {
    // Parse dialogue into segments
    const segments = [];
    const lines = scenarioText.split('\n');
    let currentNarration = '';
    
    for (const line of lines) {
        const dialogueMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+(?:\s+[A-Z]+)*):\s*(.+)$/);
        
        if (dialogueMatch) {
            // Save any narration before this dialogue
            if (currentNarration.trim()) {
                segments.push({
                    type: 'narration',
                    text: currentNarration.trim(),
                    character: 'Narrator'
                });
                currentNarration = '';
            }
            
            // Add the dialogue
            segments.push({
                type: 'dialogue',
                character: dialogueMatch[1],
                text: dialogueMatch[2].replace(/['"]/g, '').trim()
            });
        } else {
            // Accumulate narration
            currentNarration += line + '\n';
        }
    }
    
    // Don't forget final narration
    if (currentNarration.trim()) {
        segments.push({
            type: 'narration',
            text: currentNarration.trim(),
            character: 'Narrator'
        });
    }
    
    return segments;
}

// Concatenate audio files using ffmpeg
async function concatenateAudioFiles(audioFiles, outputPath) {
    return new Promise((resolve, reject) => {
        // Create a list file for ffmpeg
        const listContent = audioFiles.map(f => `file '${f}'`).join('\n');
        const listFile = outputPath + '.txt';
        
        fs.writeFile(listFile, listContent).then(() => {
            const ffmpeg = spawn('ffmpeg', [
                '-f', 'concat',
                '-safe', '0',
                '-i', listFile,
                '-c', 'copy',
                outputPath
            ]);
            
            ffmpeg.on('close', (code) => {
                // Clean up temp files
                fs.unlink(listFile).catch(() => {});
                
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`ffmpeg exited with code ${code}`));
                }
            });
            
            ffmpeg.on('error', reject);
        });
    });
}

// Example usage
async function processScenario(scenarioData) {
    const segments = await generateMultiVoiceScenario(scenarioData.text);
    
    console.log('Scenario segments:');
    segments.forEach((seg, i) => {
        console.log(`${i + 1}. [${seg.character}]: "${seg.text.substring(0, 50)}..."`);
    });
    
    // In practice, you would:
    // 1. Generate audio for each segment with appropriate voice
    // 2. Add small pauses between segments (silence.mp3)
    // 3. Concatenate all segments into final audio
    
    /*
    const audioFiles = [];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const voiceId = getVoiceForCharacter(segment.character);
        const tempFile = `temp_segment_${i}.mp3`;
        
        await generateVoice(segment.text, tempFile, voiceId);
        audioFiles.push(tempFile);
        
        // Add pause between segments
        if (i < segments.length - 1) {
            audioFiles.push('silence_500ms.mp3');
        }
    }
    
    // Combine all segments
    await concatenateAudioFiles(audioFiles, 'final_scenario.mp3');
    
    // Clean up temp files
    for (const file of audioFiles) {
        if (file.startsWith('temp_')) {
            await fs.unlink(file).catch(() => {});
        }
    }
    */
}

// Test with peacock scenario excerpt
const testScenario = {
    text: `PeacockTok Live: 'RADICAL AUTHENTICITY with Paulo the Powerful'

PAULO: Hey beautiful souls! Today's truth bomb: JUST BE YOURSELF!

*Adjusts tail extensions*

I used to hide my TRUE COLORS. Now look! This is the REAL ME!

Pigeon Pete: Bro, I saw you at molt season. Your actual tail was... modest.

PAULO: TOXIC ENERGY! My Natural Nature™ Tail Enhancement System helps me be MORE ME!

Parrot Patricia: Paulo, that's literally false advertising

PAULO: Patricia, why are you THREATENED by my GENUINE GLOW?`
};

processScenario(testScenario).then(() => {
    console.log('\nThis approach would create a single audio file with different voices!');
});