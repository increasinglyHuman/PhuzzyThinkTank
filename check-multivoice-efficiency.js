#!/usr/bin/env node

// Compare character counts for single vs multi-voice

const peacockText = `PeacockTok Live: 'RADICAL AUTHENTICITY with Paulo the Powerful'

PAULO: Hey beautiful souls! Today's truth bomb: JUST BE YOURSELF!

*Adjusts tail extensions*

I used to hide my TRUE COLORS. Now look! *Spreads enhanced tail* This is the REAL ME!

Pigeon Pete: Bro, I saw you at molt season. Your actual tail was... modest.

PAULO: TOXIC ENERGY! My Natural Nature™ Tail Enhancement System helps me be MORE ME!`;

// Count characters in original
const originalChars = peacockText.length;

// Simulate multi-voice processing
const segments = [];
const lines = peacockText.split('\n');
let currentNarration = '';

for (const line of lines) {
    const dialogueMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\s*(.+)$/);
    
    if (dialogueMatch) {
        if (currentNarration.trim()) {
            segments.push(currentNarration.trim());
            currentNarration = '';
        }
        // Only the dialogue, not the name
        segments.push(dialogueMatch[2].trim());
    } else if (!line.match(/^\*[^*]+\*$/)) {
        // Skip full line stage directions
        currentNarration += line + '\n';
    }
}

if (currentNarration.trim()) {
    segments.push(currentNarration.trim());
}

// Count multi-voice characters
const multiVoiceChars = segments.reduce((sum, seg) => sum + seg.length, 0);

console.log('Character Count Comparison:\n');
console.log(`Original text: ${originalChars} characters`);
console.log(`Multi-voice segments: ${multiVoiceChars} characters`);
console.log(`Savings: ${originalChars - multiVoiceChars} characters (${((originalChars - multiVoiceChars) / originalChars * 100).toFixed(1)}%)\n`);

console.log('Segments generated:');
segments.forEach((seg, i) => {
    console.log(`${i + 1}. "${seg.substring(0, 50)}..." (${seg.length} chars)`);
});

console.log('\n💰 Cost Analysis:');
console.log(`Single voice: ${Math.ceil(originalChars / 1000)} credits`);
console.log(`Multi-voice: ${Math.ceil(multiVoiceChars / 1000)} credits`);
console.log('\nConclusion: Multi-voice is actually MORE efficient!');