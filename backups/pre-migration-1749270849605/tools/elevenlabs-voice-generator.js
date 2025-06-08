#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Voice IDs for different character types
const VOICE_IDS = {
    male: [
        'TxGEqnHWrfWFTfGW9XjX', // Josh
        'ErXwobaYiN019PkySvjV', // Antoni
        'VR6AewLTigWG4xSOukaG', // Arnold
        'pNInz6obpgDQGcFmaJgB'  // Adam
    ],
    female: [
        '21m00Tcm4TlvDq8ikWAM', // Rachel
        'EXAVITQu4vr4xnSDxMaL', // Bella
        'MF3mGyEYCl7XYWbV9V6O', // Elli
        'AZnzlk1XvdvUeBnXmlld'  // Domi
    ]
};

// Configuration
const CONFIG = {
    apiKey: process.env.ELEVENLABS_API_KEY || '', // Set via environment variable
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Default voice, can be customized
    modelId: 'eleven_multilingual_v2',
    modelIdTurbo: 'eleven_turbo_v2', // Turbo model for faster/cheaper generation
    outputFormat: 'mp3_44100_128',
    baseUrl: 'api.elevenlabs.io',
    outputDir: path.join(__dirname, '../data/audio-recording-voices-for-scenarios-from-elevenlabs'),
    // Pricing info (per 1000 characters)
    pricing: {
        standard: 0.30,  // $0.30 per 1000 chars
        turbo: 0.15      // $0.15 per 1000 chars  
    },
    monthlyBudget: 22.00,  // $22/month
    useTurbo: process.env.USE_TURBO === 'true' || false  // Set USE_TURBO=true for cheaper mode
};

// Victory tracking
const victories = [];

// Analytics tracking
const analytics = {
    genderCounts: { male: 0, female: 0 },
    characterNames: [],
    nameGenderMap: new Map(),
    uncertainNames: [],
    characterVoiceScenarios: [],
    mathSymbolsFound: [],
    // Credit tracking
    creditUsage: {
        totalCharacters: 0,
        totalCredits: 0,
        costEstimate: 0,
        scenarios: []
    },
    // Profanity tracking
    profanityFiltered: {
        count: 0,
        scenarios: [],
        words: new Set()
    }
};

// Profanity filter - matching game's approach
const PROFANITY_LIST = [
    'shit', 'fuck', 'damn', 'ass', 'bitch', 'hell', 'crap', 'bastard',
    'piss', 'dick', 'cock', 'pussy', 'fag', 'slut', 'whore'
];

function filterProfanity(text) {
    let filtered = text;
    let foundProfanity = false;
    
    PROFANITY_LIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(filtered)) {
            foundProfanity = true;
            analytics.profanityFiltered.words.add(word);
            filtered = filtered.replace(regex, '***');
        }
    });
    
    return { text: filtered, hadProfanity: foundProfanity };
}

function logVictory(message) {
    const victory = {
        timestamp: new Date().toISOString(),
        message
    };
    victories.push(victory);
    console.log(`🏆 Victory: ${message}`);
}

// Determine gender from name with context
function guessGenderFromName(name, context = '') {
    // Remove duplicates and organize better
    const femaleNames = new Set(['sarah', 'emma', 'lisa', 'jane', 'mary', 'anna', 'bella', 'emily', 
                                'olivia', 'sophia', 'charlotte', 'mia', 'harper', 'evelyn', 'abigail',
                                'elizabeth', 'camila', 'luna', 'avery', 'aria', 'scarlett', 'penelope',
                                'chloe', 'victoria', 'madison', 'eleanor', 'grace', 'nora', 'riley', 
                                'jessica', 'jennifer', 'amanda', 'ashley', 'michelle', 'kimberly', 'lauren',
                                'patricia', 'susan', 'karen', 'nancy', 'betty', 'helen', 'sandra', 'donna']);
    
    const maleNames = new Set(['john', 'mike', 'david', 'james', 'robert', 'tom', 'bob', 'william', 
                              'richard', 'jim', 'joseph', 'thomas', 'matthew', 'daniel', 'paul', 'mark', 
                              'donald', 'george', 'steven', 'edward', 'brian', 'ronald', 'anthony', 
                              'kevin', 'jason', 'jeff', 'gary', 'timothy', 'jose', 'larry', 'frank']);
    
    const lowerName = name.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    // Check for clear gender titles - comprehensive list
    const femaleTitles = /\b(mrs|ms|miss|lady|dame|madam|mme|mlle|senhora|senora|frau|signora)\b/i;
    const maleTitles = /\b(mr|mister|sir|lord|master|senor|signor|herr|monsieur)\b/i;
    
    if (lowerName.match(femaleTitles) || lowerContext.match(new RegExp(lowerName + '.*?' + femaleTitles.source))) return 'female';
    if (lowerName.match(maleTitles) || lowerContext.match(new RegExp(lowerName + '.*?' + maleTitles.source))) return 'male';
    
    // Look for signature patterns like "Dr. Sarah Chen" or "Posted by Sarah"
    const signatureMatch = context.match(/(?:by|from|dr\.?|professor|prof\.?)\s+(\w+\s+)?(\w+)/i);
    if (signatureMatch) {
        const extractedName = signatureMatch[2] || signatureMatch[1];
        if (extractedName && femaleNames.has(extractedName.toLowerCase())) return 'female';
        if (extractedName && maleNames.has(extractedName.toLowerCase())) return 'male';
    }
    
    // Check context for pronouns near the name
    if (context) {
        // Look for patterns like "Sarah Chen, she" or "her colleague Sarah"
        const contextWindow = 100; // characters to check around name
        const nameIndex = lowerContext.indexOf(lowerName.split(' ')[0].toLowerCase());
        if (nameIndex !== -1) {
            const surroundingText = lowerContext.substring(
                Math.max(0, nameIndex - contextWindow), 
                Math.min(lowerContext.length, nameIndex + lowerName.length + contextWindow)
            );
            
            // Female pronouns
            if (surroundingText.match(/\b(she|her|hers|herself|lady|woman|girl|female)\b/)) return 'female';
            // Male pronouns  
            if (surroundingText.match(/\b(he|him|his|himself|gentleman|man|boy|male)\b/)) return 'male';
        }
    }
    
    // Check for profession/role indicators in context
    if (context && name) {
        const contextClues = {
            female: ['mother', 'mom', 'wife', 'daughter', 'sister', 'aunt', 'grandmother', 'lady', 'woman', 'girl'],
            male: ['father', 'dad', 'husband', 'son', 'brother', 'uncle', 'grandfather', 'gentleman', 'man', 'boy']
        };
        
        for (const clue of contextClues.female) {
            if (lowerContext.includes(name.toLowerCase()) && lowerContext.includes(clue)) return 'female';
        }
        
        for (const clue of contextClues.male) {
            if (lowerContext.includes(name.toLowerCase()) && lowerContext.includes(clue)) return 'male';
        }
    }
    
    // Check first names - extract first word of name
    const firstName = lowerName.split(/[\s\-\.]/)[0];
    if (femaleNames.has(firstName)) return 'female';
    if (maleNames.has(firstName)) return 'male';
    
    // Also check if any part of the name matches
    const nameParts = lowerName.split(/[\s\-\.]/);
    for (const part of nameParts) {
        if (femaleNames.has(part)) return 'female';
        if (maleNames.has(part)) return 'male';
    }
    
    // Special cases from our scenarios
    if (name.includes('Chen') || name.includes('Rodriguez')) return 'female'; // Dr. Sarah Chen, Mrs. Rodriguez
    if (name.includes('Maxwell')) return 'male'; // Jim Maxwell
    
    // Username patterns
    if (lowerName.match(/mom|mama|lady|girl|gal|queen|princess|diva/)) return 'female';
    if (lowerName.match(/dad|papa|guy|boy|dude|king|prince|bro/)) return 'male';
    
    // Default to alternating if uncertain
    return Math.random() > 0.5 ? 'male' : 'female';
}

// Get voice ID based on character name and tracking usage
const voiceUsage = new Map();
function getVoiceForCharacter(characterName, context = '') {
    // Track character name
    if (!analytics.characterNames.includes(characterName)) {
        analytics.characterNames.push(characterName);
    }
    
    // Check if we already assigned a voice to this character
    if (voiceUsage.has(characterName)) {
        return voiceUsage.get(characterName);
    }
    
    const gender = guessGenderFromName(characterName, context);
    
    // Track gender assignment
    analytics.genderCounts[gender]++;
    analytics.nameGenderMap.set(characterName, gender);
    
    // Track uncertain names
    const lowerName = characterName.toLowerCase();
    const hasFemaleName = ['sarah', 'emma', 'lisa', 'jane', 'mary', 'anna', 'elle', 'bella', 'emily', 'olivia', 
                         'sophia', 'charlotte', 'mia', 'harper', 'evelyn', 'abigail', 'ella', 'elizabeth',
                         'camila', 'luna', 'sofia', 'avery', 'mila', 'aria', 'scarlett', 'penelope',
                         'chloe', 'victoria', 'madison', 'eleanor', 'grace', 'nora', 'riley', 'zoey'].some(n => lowerName.includes(n));
    const hasMaleName = ['john', 'mike', 'david', 'james', 'robert', 'tom', 'bob', 'william', 'richard',
                       'jim', 'joseph', 'thomas', 'matthew', 'daniel', 'paul', 'mark', 'donald',
                       'george', 'steven', 'edward', 'brian', 'ronald', 'anthony', 'kevin', 'jason'].some(n => lowerName.includes(n));
    
    if (!hasFemaleName && !hasMaleName && !lowerName.includes('mrs') && !lowerName.includes('mr')) {
        analytics.uncertainNames.push({ name: characterName, assignedGender: gender });
    }
    
    const voicePool = VOICE_IDS[gender];
    
    // Rotate through voices to add variety
    const usedVoices = Array.from(voiceUsage.values());
    let voiceId;
    
    for (const voice of voicePool) {
        if (!usedVoices.includes(voice)) {
            voiceId = voice;
            break;
        }
    }
    
    // If all voices used, pick random
    if (!voiceId) {
        voiceId = voicePool[Math.floor(Math.random() * voicePool.length)];
    }
    
    voiceUsage.set(characterName, voiceId);
    return voiceId;
}

// Generate recommendations based on analytics
function generateRecommendations() {
    const recommendations = [];
    
    const femalePercentage = (analytics.genderCounts.female / (analytics.genderCounts.male + analytics.genderCounts.female)) * 100;
    
    if (femalePercentage < 30) {
        recommendations.push('Consider adding more female characters for better gender balance');
    }
    
    if (analytics.uncertainNames.length > analytics.characterNames.length * 0.3) {
        recommendations.push('Many names required guessing - consider adding more explicit gender indicators');
    }
    
    // Look for patterns in uncertain names
    const uncertainPatterns = {};
    analytics.uncertainNames.forEach(({name}) => {
        const words = name.split(' ');
        words.forEach(word => {
            if (!uncertainPatterns[word]) uncertainPatterns[word] = 0;
            uncertainPatterns[word]++;
        });
    });
    
    const commonUncertain = Object.entries(uncertainPatterns)
        .filter(([word, count]) => count > 2)
        .map(([word]) => word);
    
    if (commonUncertain.length > 0) {
        recommendations.push(`Common uncertain words: ${commonUncertain.join(', ')} - consider adding these to gender detection`);
    }
    
    return recommendations;
}

// Helper to convert numbers to words for more natural speech
function numberToWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    return num.toString(); // For larger numbers, let ElevenLabs handle it
}

// Preprocess text for better speech generation
function preprocessTextForSpeech(text, scenarioId = null) {
    let processed = text;
    
    // Apply profanity filter first
    const profanityResult = filterProfanity(processed);
    if (profanityResult.hadProfanity) {
        processed = profanityResult.text;
        analytics.profanityFiltered.count++;
        if (scenarioId && !analytics.profanityFiltered.scenarios.includes(scenarioId)) {
            analytics.profanityFiltered.scenarios.push(scenarioId);
        }
    }
    
    // Track math symbols
    const mathSymbols = text.match(/[∀∃∈∉⊂⊃∪∩∧∨¬→↔≡≠≤≥]/g);
    if (mathSymbols) {
        analytics.mathSymbolsFound.push(...mathSymbols);
    }
    
    // Replace common math symbols with spoken equivalents
    const mathReplacements = {
        '≈': 'approximately equals',
        '≠': 'is not equal to',
        '!=': 'is not equal to',
        '<>': 'is not equal to',
        '≤': 'less than or equal to',
        '≥': 'greater than or equal to',
        '∞': 'infinity',
        '√': 'square root of',
        'π': 'pi',
        '∑': 'sum of',
        '∏': 'product of',
        '∀': 'for all',
        '∃': 'there exists',
        '∈': 'is an element of',
        '∉': 'is not an element of',
        '⊂': 'is a subset of',
        '∪': 'union',
        '∩': 'intersection',
        '∧': 'and',
        '∨': 'or',
        '¬': 'not',
        '→': 'implies',
        '↔': 'if and only if',
        '≡': 'is equivalent to'
    };
    
    for (const [symbol, replacement] of Object.entries(mathReplacements)) {
        processed = processed.replace(new RegExp(symbol, 'g'), replacement);
    }
    
    // Fix common issues
    processed = processed.replace(/(\d+)%/g, '$1 percent'); // 50% → 50 percent
    
    // Fix dollar amounts - must be done before number ranges!
    // First handle dollar ranges with abbreviations
    processed = processed.replace(/\$(\d+\.?\d*)b\s*-\s*\$(\d+\.?\d*)b/gi, '$1 billion to $2 billion dollars'); // $1b-$2b → 1 billion to 2 billion dollars
    processed = processed.replace(/\$(\d+\.?\d*)m\s*-\s*\$(\d+\.?\d*)m/gi, '$1 million to $2 million dollars'); // $1m-$2m → 1 million to 2 million dollars
    processed = processed.replace(/\$(\d+\.?\d*)k\s*-\s*\$(\d+\.?\d*)k/gi, '$1 thousand to $2 thousand dollars'); // $100k-$200k → 100 thousand to 200 thousand dollars
    processed = processed.replace(/\$(\d+)\s*-\s*\$(\d+)/g, '$1 to $2 dollars'); // $1-$2 → 1 to 2 dollars
    
    // Then handle individual amounts with abbreviations
    processed = processed.replace(/\$(\d+\.?\d*)b/gi, '$1 billion dollars'); // $2.5b → 2.5 billion dollars
    processed = processed.replace(/\$(\d+\.?\d*)m/gi, '$1 million dollars'); // $2m → 2 million dollars
    processed = processed.replace(/\$(\d+\.?\d*)k/gi, '$1 thousand dollars'); // $5k → 5 thousand dollars
    
    // Handle comma-separated amounts
    processed = processed.replace(/\$(\d{1,3}),(\d{3}),(\d{3}),(\d{3})/g, function(match, billions, millions, thousands, ones) {
        return billions + ' billion ' + (millions !== '000' ? millions + ' million ' : '') + 
               (thousands !== '000' ? thousands + ' thousand ' : '') + 
               (ones !== '000' ? ones + ' ' : '') + 'dollars';
    }); // $1,234,567,890 → 1 billion 234 million 567 thousand 890 dollars
    
    processed = processed.replace(/\$(\d{1,3}),(\d{3}),(\d{3})/g, function(match, millions, thousands, ones) {
        return millions + ' million ' + (thousands !== '000' ? thousands + ' thousand ' : '') + 
               (ones !== '000' ? ones + ' ' : '') + 'dollars';
    }); // $1,234,567 → 1 million 234 thousand 567 dollars
    
    processed = processed.replace(/\$(\d{1,3}),(\d{3})/g, function(match, thousands, ones) {
        const total = parseInt(thousands) * 1000 + parseInt(ones);
        return total + ' dollars';
    }); // $1,234 → 1234 dollars (let ElevenLabs pronounce it as "one thousand two hundred thirty-four")
    
    // Handle amounts with cents
    processed = processed.replace(/\$(\d+)\.(\d{2})/g, '$1 dollars and $2 cents'); // $10.50 → 10 dollars and 50 cents
    
    // Handle plain dollar amounts (must be last)
    processed = processed.replace(/\$(\d+)/g, '$1 dollars'); // $50 → 50 dollars
    
    // Fix number ranges - but NOT dollar ranges like $1-$2
    processed = processed.replace(/(?<!\$)(\d+)\s*-\s*(?!\$)(\d+)/g, '$1 to $2'); // 10-20 → 10 to 20, but not $1-$2
    processed = processed.replace(/\b(\d+)x\b/g, '$1 times'); // 10x → 10 times
    
    return processed;
}

// Analyze if scenario uses character voice style
function analyzeScenarioVoiceStyle(scenarioData) {
    const text = scenarioData.text || scenarioData.description || '';
    
    // Patterns that suggest character voice
    const voiceIndicators = [
        /posted (?:on|in)/i,
        /wrote:/i,
        /said:/i,
        /emailed/i,
        /tweeted/i,
        /announced/i,
        /shared (?:on|in)/i,
        /[""].*[""]/, // Quoted speech
        /^(Dr\.|Mrs\.|Mr\.|Ms\.|Prof\.)/,
        /I'm|I am|I've|We're|We are/
    ];
    
    const hasCharacterVoice = voiceIndicators.some(pattern => pattern.test(text));
    
    if (hasCharacterVoice) {
        analytics.characterVoiceScenarios.push({
            id: scenarioData.id || 'unknown',
            title: scenarioData.title,
            firstLine: text.substring(0, 100) + '...'
        });
    }
    
    return hasCharacterVoice;
}

// Make API request to ElevenLabs
async function generateVoice(text, outputPath, voiceId = CONFIG.voiceId, scenarioId = null) {
    // Preprocess text
    const processedText = preprocessTextForSpeech(text, scenarioId);
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            text: processedText,
            model_id: CONFIG.useTurbo ? CONFIG.modelIdTurbo : CONFIG.modelId,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        });

        const options = {
            hostname: CONFIG.baseUrl,
            path: `/v1/text-to-speech/${voiceId}?output_format=${CONFIG.outputFormat}`,
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': CONFIG.apiKey,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`API request failed with status ${res.statusCode}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    await fs.writeFile(outputPath, buffer);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Process a single scenario
async function processScenario(scenarioData, scenarioIndex) {
    const scenarioId = scenarioIndex.toString().padStart(3, '0');
    const scenarioDir = path.join(CONFIG.outputDir, `scenario-${scenarioId}`);
    
    // Track credit usage for this scenario
    const scenarioCredits = {
        id: scenarioId,
        title: scenarioData.title,
        files: [],
        totalChars: 0,
        credits: 0
    };
    
    // Analyze scenario voice style
    analyzeScenarioVoiceStyle(scenarioData);
    
    // Create scenario directory
    await fs.mkdir(scenarioDir, { recursive: true });
    
    const filesToGenerate = [];
    
    // Add title
    if (scenarioData.title) {
        filesToGenerate.push({
            text: scenarioData.title,
            filename: 'title.mp3'
        });
    }
    
    // Add main text content (could be description or text field)
    if (scenarioData.description || scenarioData.text) {
        const contentText = scenarioData.description || scenarioData.text;
        
        // Extract character name - check first 200 chars and last 200 chars
        let character = null;
        const openingText = contentText.substring(0, 200);
        const closingText = contentText.substring(Math.max(0, contentText.length - 200));
        
        const namePatterns = [
            // LinkedIn/social media patterns
            /posted\s+(?:on|in)\s+(?:LinkedIn|Facebook|Twitter|Instagram)\s+by\s+(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
            // Email headers
            /^from:\s*(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s*<|@|\s*$)/im,
            // Direct attribution
            /^(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)\s+(?:wrote|said|posted|announced|shared)[:]/i,
            // Signature patterns at end
            /[\n\r]\s*(?:regards|sincerely|best|cheers|thanks),?\s*[\n\r]\s*(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/i,
            // Dash signature
            /[\n\r]\s*[-~]\s*(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/i,
            // Posted by at start
            /^posted\s+by\s+(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
            // Generic name at very start
            /^(?:Dr\.?|Mrs?\.?|Ms\.?|Prof\.?)?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/
        ];
        
        // Check opening for author
        for (const pattern of namePatterns) {
            const match = openingText.match(pattern);
            if (match && match[1]) {
                const extracted = match[1].trim();
                // Skip common non-name words
                if (!['The', 'Posted', 'From', 'Dear', 'Subject'].includes(extracted)) {
                    character = extracted;
                    break;
                }
            }
        }
        
        // If not found in opening, check closing for signature
        if (!character) {
            for (const pattern of namePatterns.slice(3)) { // Focus on signature patterns
                const match = closingText.match(pattern);
                if (match && match[1]) {
                    character = match[1].trim();
                    break;
                }
            }
        }
        
        filesToGenerate.push({
            text: contentText,
            filename: 'content.mp3',
            character: character
        });
    }
    
    // Add claim if exists
    if (scenarioData.claim) {
        filesToGenerate.push({
            text: `The claim is: ${scenarioData.claim}`,
            filename: 'claim.mp3'
        });
    }
    
    // Add posts with voice selection based on username
    if (scenarioData.posts && Array.isArray(scenarioData.posts)) {
        scenarioData.posts.forEach((post, index) => {
            if (post.content) {
                filesToGenerate.push({
                    text: `${post.username}: ${post.content}`,
                    filename: `post-${index.toString().padStart(3, '0')}.mp3`,
                    character: post.username
                });
            }
        });
    }
    
    // Generate audio files
    for (const file of filesToGenerate) {
        const outputPath = path.join(scenarioDir, file.filename);
        
        // Select voice based on character
        const voiceId = file.character ? getVoiceForCharacter(file.character, file.text) : CONFIG.voiceId;
        
        try {
            console.log(`Generating ${file.filename} for scenario ${scenarioId}...`);
            if (file.character) {
                console.log(`  Using voice for character: ${file.character}`);
            }
            
            // Track character count for credits
            const charCount = file.text.length;
            scenarioCredits.files.push({
                filename: file.filename,
                characters: charCount
            });
            scenarioCredits.totalChars += charCount;
            
            // Retry logic for rate limits
            let retries = 3;
            let success = false;
            
            while (retries > 0 && !success) {
                try {
                    await generateVoice(file.text, outputPath, voiceId, scenarioId);
                    console.log(`✓ Generated ${file.filename} (${charCount} chars)`);
                    success = true;
                } catch (error) {
                    if (error.message.includes('429') || error.message.includes('rate')) {
                        retries--;
                        if (retries > 0) {
                            console.log(`⚠️  Rate limit hit, waiting 30s before retry (${retries} retries left)...`);
                            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second wait
                        } else {
                            throw error;
                        }
                    } else {
                        throw error;
                    }
                }
            }
            
            // Smart rate limiting - adjust based on response
            let delay = 1000; // Default 1 second
            
            // If we're processing many files, increase delay
            if (totalScenarios > 20) {
                delay = 2000; // 2 seconds for larger batches
            }
            
            // Add extra delay every 10 requests to avoid bursts
            if ((totalScenarios + i) % 10 === 0) {
                console.log('⏸️  Pausing for rate limit cooldown...');
                delay = 5000; // 5 second cooldown every 10 requests
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            console.error(`✗ Failed to generate ${file.filename}:`, error.message);
        }
    }
    
    // Calculate credits for this scenario
    scenarioCredits.credits = Math.ceil(scenarioCredits.totalChars / 1000);
    analytics.creditUsage.scenarios.push(scenarioCredits);
    analytics.creditUsage.totalCharacters += scenarioCredits.totalChars;
    analytics.creditUsage.totalCredits += scenarioCredits.credits;
    
    const pricePerCredit = CONFIG.useTurbo ? CONFIG.pricing.turbo : CONFIG.pricing.standard;
    const scenarioCost = (scenarioCredits.credits * pricePerCredit) / 1000;
    
    console.log(`💰 Scenario ${scenarioId} used ${scenarioCredits.credits} credits (~${scenarioCredits.totalChars} chars) = $${scenarioCost.toFixed(2)}`);
    
    logVictory(`Completed audio generation for scenario ${scenarioId}`);
}

// Main execution
async function main() {
    try {
        // Check for API key
        if (!CONFIG.apiKey) {
            console.error('❌ ElevenLabs API key not found!');
            console.log('\nTo use this script:');
            console.log('1. Create an account at https://elevenlabs.io');
            console.log('2. Find your API key in your profile settings');
            console.log('3. Set the environment variable: export ELEVENLABS_API_KEY="your-key-here"');
            console.log('4. Run this script again\n');
            process.exit(1);
        }

        logVictory('Script initialized with API credentials');

        // Load scenarios - dynamically find all generated files
        const fs2 = require('fs');
        const scenarioFiles = fs2.readdirSync(path.join(__dirname, '../data'))
            .filter(file => file.match(/^scenario-generated-\d{3}\.json$/))
            .sort();

        let totalScenarios = 0;
        
        for (const file of scenarioFiles) {
            const filePath = path.join(__dirname, '../data', file);
            
            try {
                const data = await fs.readFile(filePath, 'utf8');
                const jsonData = JSON.parse(data);
                
                // Handle both array format and object with scenarios property
                const scenarios = Array.isArray(jsonData) ? jsonData : (jsonData.scenarios || []);
                
                if (scenarios.length > 0) {
                    console.log(`\nProcessing ${scenarios.length} scenarios from ${file}...`);
                    
                    for (let i = 0; i < scenarios.length; i++) {
                        await processScenario(scenarios[i], totalScenarios + i);
                    }
                    
                    totalScenarios += scenarios.length;
                    logVictory(`Completed processing ${file}`);
                }
            } catch (error) {
                console.error(`Failed to process ${file}:`, error.message);
            }
        }

        // Save victories log
        const victoriesPath = path.join(CONFIG.outputDir, 'victories.json');
        await fs.writeFile(victoriesPath, JSON.stringify(victories, null, 2));
        
        // Save analytics
        const analyticsPath = path.join(CONFIG.outputDir, 'voice-analytics.json');
        const analyticsReport = {
            summary: {
                totalCharacters: analytics.characterNames.length,
                maleVoices: analytics.genderCounts.male,
                femaleVoices: analytics.genderCounts.female,
                percentageFemale: ((analytics.genderCounts.female / (analytics.genderCounts.male + analytics.genderCounts.female)) * 100).toFixed(1) + '%'
            },
            charactersByGender: {
                female: Array.from(analytics.nameGenderMap.entries()).filter(([name, gender]) => gender === 'female').map(([name]) => name),
                male: Array.from(analytics.nameGenderMap.entries()).filter(([name, gender]) => gender === 'male').map(([name]) => name)
            },
            uncertainAssignments: analytics.uncertainNames,
            characterVoiceScenarios: analytics.characterVoiceScenarios,
            mathSymbolsFound: [...new Set(analytics.mathSymbolsFound)],
            recommendations: generateRecommendations(),
            creditUsage: {
                totalCharacters: analytics.creditUsage.totalCharacters,
                totalCredits: analytics.creditUsage.totalCredits,
                estimatedCost: analytics.creditUsage.costEstimate,
                monthlyBudgetUsed: ((analytics.creditUsage.costEstimate / CONFIG.monthlyBudget) * 100).toFixed(1) + '%',
                qualityTier: CONFIG.useTurbo ? 'Turbo' : 'Standard',
                pricePerThousand: CONFIG.useTurbo ? CONFIG.pricing.turbo : CONFIG.pricing.standard,
                costComparison: {
                    currentCost: analytics.creditUsage.costEstimate,
                    standardCost: (analytics.creditUsage.totalCredits * CONFIG.pricing.standard) / 1000,
                    turboCost: (analytics.creditUsage.totalCredits * CONFIG.pricing.turbo) / 1000,
                    potentialSavings: ((analytics.creditUsage.totalCredits * CONFIG.pricing.standard) / 1000) - 
                                     ((analytics.creditUsage.totalCredits * CONFIG.pricing.turbo) / 1000)
                },
                topScenariosByUsage: analytics.creditUsage.scenarios
                    .sort((a, b) => b.credits - a.credits)
                    .slice(0, 5)
                    .map(s => ({
                        id: s.id,
                        title: s.title,
                        credits: s.credits,
                        cost: ((s.credits * (CONFIG.useTurbo ? CONFIG.pricing.turbo : CONFIG.pricing.standard)) / 1000).toFixed(2)
                    }))
            },
            profanityFiltered: {
                totalInstances: analytics.profanityFiltered.count,
                affectedScenarios: analytics.profanityFiltered.scenarios,
                uniqueWords: Array.from(analytics.profanityFiltered.words),
                scenariosNeedingRegeneration: analytics.profanityFiltered.scenarios
            }
        };
        
        await fs.writeFile(analyticsPath, JSON.stringify(analyticsReport, null, 2));
        
        // Calculate final cost
        const pricePerCredit = CONFIG.useTurbo ? CONFIG.pricing.turbo : CONFIG.pricing.standard;
        analytics.creditUsage.costEstimate = (analytics.creditUsage.totalCredits * pricePerCredit) / 1000;
        const monthlyCreditsUsed = (analytics.creditUsage.costEstimate / CONFIG.monthlyBudget) * 100;
        
        // Print analytics summary
        console.log('\n📊 Voice Analytics Summary:');
        console.log(`Total Characters: ${analytics.characterNames.length}`);
        console.log(`Female Voices: ${analytics.genderCounts.female} (${analyticsReport.summary.percentageFemale})`);
        console.log(`Male Voices: ${analytics.genderCounts.male}`);
        console.log(`Uncertain Names: ${analytics.uncertainNames.length}`);
        
        console.log('\n💰 Credit Usage Summary:');
        console.log(`Total Characters: ${analytics.creditUsage.totalCharacters.toLocaleString()}`);
        console.log(`Total Credits: ${analytics.creditUsage.totalCredits.toLocaleString()}`);
        console.log(`Estimated Cost: $${analytics.creditUsage.costEstimate.toFixed(2)}`);
        console.log(`Monthly Budget Used: ${monthlyCreditsUsed.toFixed(1)}% of $${CONFIG.monthlyBudget}`);
        console.log(`Quality Tier: ${CONFIG.useTurbo ? 'Turbo ($0.15/1k)' : 'Standard ($0.30/1k)'}`);
        
        if (monthlyCreditsUsed > 80) {
            console.log('\n⚠️  WARNING: Approaching monthly budget limit!')
        }
        
        if (analytics.uncertainNames.length > 0) {
            console.log('\n⚠️  Names that needed guessing:');
            analytics.uncertainNames.slice(0, 10).forEach(({name, assignedGender}) => {
                console.log(`  - "${name}" → assigned ${assignedGender}`);
            });
        }
        
        logVictory(`All scenarios processed! Total: ${totalScenarios}`);
        console.log(`\nVictories saved to: ${victoriesPath}`);
        console.log(`Analytics saved to: ${analyticsPath}`);

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Help text
if (process.argv.includes('--help')) {
    console.log(`
ElevenLabs Voice Generator for Phuzzy Scenarios

Usage: node elevenlabs-voice-generator.js [options]

Options:
  --help        Show this help message
  --test        Test with a single scenario
  --scenario N  Process only scenario N

Environment Variables:
  ELEVENLABS_API_KEY  Your ElevenLabs API key (required)

Example:
  export ELEVENLABS_API_KEY="your-key-here"
  node elevenlabs-voice-generator.js
`);
    process.exit(0);
}

// Test mode
if (process.argv.includes('--test')) {
    const testScenario = {
        title: "Test Scenario",
        description: "This is a test of the ElevenLabs voice generation system.",
        posts: [
            { username: "TestUser", content: "Hello, this is a test post!" }
        ]
    };
    
    processScenario(testScenario, 999)
        .then(() => console.log('Test completed!'))
        .catch(error => console.error('Test failed:', error));
} else {
    main();
}