#!/usr/bin/env node

// Test character detection patterns
const testTexts = [
    // Should find "Dr. Sarah Chen"
    "Dr. Sarah Chen, a Harvard-trained biochemist, posted on LinkedIn: 'After 15 years researching aging...'",
    
    // Should find "Jim Maxwell"  
    "Posted in NextDoor by Jim Maxwell: URGENT - BE AWARE!!! 🚨🚨🚨 I saw a van...",
    
    // Should NOT find "Emergency Fan"
    "Emergency Fan Council Meeting - 'The Prometheus Incident' (Leaked Transcript):\n\nCHAIRMAN KYLE: Order!",
    
    // Should NOT find "From The"
    "From TheTimelineInquisition.net - 'PROOF The MCU Timeline is PROPAGANDA':\n\nListen up, sheeple!"
];

const namePatterns = [
    // LinkedIn/social media patterns
    /posted\s+(?:on|in)\s+(?:LinkedIn|Facebook|Twitter|Instagram)\s+by\s+(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    // Posted by pattern - more specific
    /posted\s+in\s+\w+\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?):/i,
    // Direct attribution with punctuation
    /^(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?),\s*(?:a|an|the)\s+/i,
];

console.log('Testing character extraction patterns:\n');

testTexts.forEach((text, index) => {
    console.log(`Test ${index + 1}: "${text.substring(0, 50)}..."`);
    
    let character = null;
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            character = match[1].trim();
            break;
        }
    }
    
    console.log(`  → Found character: ${character || 'NONE'}\n`);
});