#!/usr/bin/env node

// Test the multi-voice dialogue parsing

const testText = `PeacockTok Live: 'RADICAL AUTHENTICITY with Paulo the Powerful'

PAULO: Hey beautiful souls! Today's truth bomb: JUST BE YOURSELF!

*Adjusts tail extensions*

I used to hide my TRUE COLORS. Now look! *Spreads enhanced tail* This is the REAL ME! Well, 40% is real, 60% is Japanese synthetic fibers, but it's MY CHOICE to be 160% authentic!

Pigeon Pete: Bro, I saw you at molt season. Your actual tail was... modest.

PAULO: TOXIC ENERGY! My Natural Nature™ Tail Enhancement System helps me be MORE ME! Use code PAULO for 20% off!

Look at these TRANSFORMATION PICS:
- Before: Regular peacock
- After: TRANSCENDENT AUTHENTICITY AVATAR

Parrot Patricia: Paulo, that's literally false advertising

PAULO: Patricia, why are you THREATENED by my *GENUINE GLOW*? *Activates LED tail lights* This bioluminescence? That's my CHAKRAS manifesting!

*Battery pack for LED tail catches fire*

THIS PHOENIX ENERGY THO! 🔥 TRANSFORMING LIVE!

#AuthenticAF #NaturallyEnhanced #TailGoals #GenuinelyFake`;

// Import the parsing function
function parseDialogueWithNarration(text) {
    const segments = [];
    const lines = text.split('\n');
    let currentNarration = '';
    
    for (const line of lines) {
        // Check for character dialogue
        const dialogueMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+(?:\s+[A-Z]+)*):\s*(.+)$/);
        
        if (dialogueMatch && !['URGENT', 'ORDER', 'BREAKING'].includes(dialogueMatch[1])) {
            // Save any narration before this dialogue
            if (currentNarration.trim()) {
                segments.push({
                    type: 'narration',
                    text: currentNarration.trim(),
                    character: 'Narrator'
                });
                currentNarration = '';
            }
            
            // Add the dialogue (without character name)
            segments.push({
                type: 'dialogue',
                character: dialogueMatch[1],
                text: dialogueMatch[2].trim()
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

// Test asterisk removal
function processAsterisks(text) {
    let processed = text;
    
    // Remove stage directions (full lines or at line ends)
    processed = processed.replace(/^\*[^*]+\*\s*$/gm, ''); // Remove full line stage directions
    processed = processed.replace(/\s*\*[^*]+\*\s*$/gm, '.'); // Remove end-of-line stage directions
    
    // Convert inline emphasis to quotation marks
    processed = processed.replace(/\*([A-Z][A-Z\s]+)\*/g, '"$1"');
    
    // Remove any remaining single asterisks
    processed = processed.replace(/\*/g, '');
    
    return processed;
}

console.log('🎭 Multi-Voice Dialogue Test\n');

const segments = parseDialogueWithNarration(testText);

console.log(`Found ${segments.length} segments:\n`);

segments.forEach((seg, i) => {
    const preview = seg.text.substring(0, 60).replace(/\n/g, ' ');
    console.log(`${i + 1}. [${seg.character}]: "${preview}..."`);
});

console.log('\n\n🌟 Asterisk Processing Test\n');

const processedText = processAsterisks(testText);
const original = testText.split('\n').slice(7, 11).join('\n');
const processed = processAsterisks(original);

console.log('Original:');
console.log(original);
console.log('\nProcessed:');
console.log(processed);

console.log('\n✅ With this system:');
console.log('- Each character gets their own voice');
console.log('- Stage directions (*actions*) are removed');
console.log('- Emphasis (*WORDS*) becomes "WORDS" for ElevenLabs');
console.log('- Character names are not spoken');
console.log('- All segments are concatenated into one audio file');