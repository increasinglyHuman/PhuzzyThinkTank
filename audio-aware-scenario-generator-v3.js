#!/usr/bin/env node

/**
 * Audio-Aware Scenario Generator V3
 * Generates scenarios with dual scripts (display + audio) optimized for ElevenLabs
 * Memory-safe implementation for Raspberry Pi
 */

const fs = require('fs').promises;
const path = require('path');

// Memory monitoring
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);
  return { heapUsedMB, heapTotalMB, percentage };
}

// Audio text conversion rules
function convertToAudioScript(displayText) {
  let audioText = displayText;
  
  // Convert percentages
  audioText = audioText.replace(/(\d+)%/g, (match, num) => {
    const number = parseInt(num);
    return `${numberToWords(number)} percent`;
  });
  
  // Convert dollar amounts with abbreviations
  audioText = audioText.replace(/\$(\d+(?:\.\d+)?)(b|m|k)/gi, (match, num, unit) => {
    const units = { 'b': 'billion', 'm': 'million', 'k': 'thousand' };
    return `${num} ${units[unit.toLowerCase()]} dollars`;
  });
  
  // Convert regular dollar amounts
  audioText = audioText.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
    return convertDollarAmount(amount);
  });
  
  // Convert hashtags
  audioText = audioText.replace(/#(\w+)/g, 'hashtag $1');
  
  // Convert @ mentions
  audioText = audioText.replace(/@(\w+)/g, 'at $1');
  
  // Convert number ranges
  audioText = audioText.replace(/(\d+)-(\d+)(?!\d)/g, '$1 to $2');
  
  // Convert "X times"
  audioText = audioText.replace(/(\d+)x/gi, '$1 times');
  
  // Remove asterisk emphasis but keep the words
  audioText = audioText.replace(/\*([A-Z][A-Z\s]+)\*/g, '"$1"');
  audioText = audioText.replace(/\*([^*]+)\*/g, '$1');
  
  // Convert URLs
  audioText = audioText.replace(/https?:\/\/[^\s]+/g, 'website link');
  audioText = audioText.replace(/www\.[^\s]+/g, 'website link');
  
  // Math symbols
  const mathSymbols = {
    '≈': 'approximately equals',
    '≠': 'is not equal to',
    '!=': 'is not equal to',
    '≤': 'less than or equal to',
    '≥': 'greater than or equal to',
    '&': 'and'
  };
  
  for (const [symbol, replacement] of Object.entries(mathSymbols)) {
    audioText = audioText.split(symbol).join(replacement);
  }
  
  return audioText;
}

// Convert numbers to words (simplified)
function numberToWords(num) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  
  if (num === 0) return 'zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  return num.toString(); // Fallback for larger numbers
}

// Convert dollar amounts to words
function convertDollarAmount(amount) {
  const cleanAmount = amount.replace(/,/g, '');
  const parts = cleanAmount.split('.');
  const dollars = parseInt(parts[0]);
  const cents = parts[1] ? parseInt(parts[1]) : 0;
  
  let result = '';
  if (dollars >= 1000000) {
    const millions = Math.floor(dollars / 1000000);
    const remainder = dollars % 1000000;
    result = `${millions} million`;
    if (remainder >= 1000) {
      result += ` ${Math.floor(remainder / 1000)} thousand`;
    }
    result += ' dollars';
  } else if (dollars >= 1000) {
    result = `${Math.floor(dollars / 1000)} thousand`;
    const remainder = dollars % 1000;
    if (remainder > 0) {
      result += ` ${remainder}`;
    }
    result += ' dollars';
  } else {
    result = `${dollars} dollar${dollars !== 1 ? 's' : ''}`;
  }
  
  if (cents > 0) {
    result += ` and ${cents} cent${cents !== 1 ? 's' : ''}`;
  }
  
  return result;
}

// Whimsical scenario templates
const scenarioTemplates = [
  {
    title: "The [Animal]'s [Modern Problem]",
    themes: ['animals', 'technology', 'social media'],
    characterTypes: ['enthusiastic animal', 'skeptical friend', 'authority figure']
  },
  {
    title: "[Food Item] Revolution",
    themes: ['food', 'rebellion', 'personality'],
    characterTypes: ['rebellious food leader', 'traditional food', 'food critic']
  },
  {
    title: "[Toy/Game] Logic Crisis",
    themes: ['toys', 'existential', 'rules'],
    characterTypes: ['questioning toy', 'rule-following toy', 'toy philosopher']
  },
  {
    title: "[Fantasy Creature]'s Modern Job",
    themes: ['fantasy', 'workplace', 'bureaucracy'],
    characterTypes: ['frustrated creature', 'HR representative', 'coworker']
  },
  {
    title: "[Superhero]'s Mundane Problem",
    themes: ['superheroes', 'everyday life', 'irony'],
    characterTypes: ['struggling hero', 'unhelpful sidekick', 'bemused civilian']
  }
];

// Generate a whimsical scenario with V3 format
async function generateWhimsicalScenario(packId, scenarioIndex, template) {
  const memory = getMemoryUsage();
  console.log(`Memory before generation: ${memory.heapUsedMB}MB / ${memory.heapTotalMB}MB (${memory.percentage}%)`);
  
  // Create scenario ID
  const id = `pack-${packId}-scenario-${String(scenarioIndex).padStart(3, '0')}`;
  
  // Generate display content (this would normally call an AI API)
  // For now, using a template example
  const scenario = {
    id,
    title: "The Grumpy Dragon's Carbon Offset Debate",
    content: `**Breaking News from @MythicalNewsNetwork**

Dragon Rights Activist: "Dragons are being unfairly targeted by climate regulations! #DragonDiscrimination"

Ember the Dragon: *breathes a small puff of smoke* "Look, I've been breathing fire for 500 years. Now they want me to buy carbon credits? That's $50k per flame!"

Environmental Fairy: "But Ember, your daily fire breathing produces 200% more CO2 than a small factory! Think of the pixie children!"

Ember: "Oh sure, blame the dragons! What about those unicorns with their rainbow emissions? Nobody talks about *THAT* pollution!"

Dragon Rights Activist: "Studies show dragon fire is 73% more efficient than industrial heating. We should get credits, not pay them!"

Environmental Fairy: *shows chart* "This graph clearly proves... wait, is this thing upside down? Never mind, the point is dragons bad!"

Ember: "You know what? Fine. I'll just become an electric dragon. Happy now? *sparks sadly*"`,
    
    audioScript: "",  // Will be generated from content
    
    claim: "Dragons should pay carbon credits for their fire breathing because it's worse than factory emissions",
    
    correctAnswer: "agenda",
    
    answerWeights: {
      logic: 31,
      emotion: 67,
      balanced: 22,
      agenda: 94
    },
    
    audioHints: {
      tone: "playful",
      pacing: "moderate", 
      characterVoices: {
        "Dragon Rights Activist": "passionate advocate, slight growl in voice",
        "Ember the Dragon": "grumpy old-timer, deep voice with occasional rumble",
        "Environmental Fairy": "high-pitched, overly enthusiastic about charts"
      },
      specialEffects: ["slight reverb on dragon voice", "tinkling sound for fairy"]
    },
    
    hints: [
      {
        keywords: ["500 years", "carbon credits", "$50k"],
        message: "Notice how tradition and cost are used to dismiss environmental concerns"
      },
      {
        keywords: ["pixie children", "rainbow emissions"],
        message: "Classic whataboutism - deflecting to unicorns instead of addressing the issue"
      },
      {
        keywords: ["73% more efficient", "graph", "upside down"],
        message: "Misleading statistics and admitted confusion about data"
      }
    ],
    
    logicalFallacies: [
      {
        name: "Whataboutism",
        severity: "high",
        example: "Deflecting to unicorn rainbow emissions"
      },
      {
        name: "Appeal to Tradition", 
        severity: "medium",
        example: "I've been breathing fire for 500 years"
      },
      {
        name: "Cherry Picking",
        severity: "high",
        example: "73% more efficient (ignoring total volume)"
      }
    ],
    
    topics: ["climate", "fantasy", "regulation", "tradition", "whataboutism"],
    difficulty: 3,
    educationalFocus: "Recognizing deflection tactics in environmental debates"
  };
  
  // Generate audio script from display content
  scenario.audioScript = convertToAudioScript(scenario.content);
  
  // Add performance directives to audio script
  scenario.audioScript = scenario.audioScript
    .replace('Breaking News from at MythicalNewsNetwork', '[dramatic] Breaking News from Mythical News Network!')
    .replace('"Look, I\'ve been', '[grumpy] "Look, I\'ve been')
    .replace('"But Ember', '[concerned] "But Ember')
    .replace('"Oh sure', '[sarcastic] "Oh sure')
    .replace('"Studies show', '[authoritative] "Studies show')
    .replace('"This graph', '[excited then confused] "This graph')
    .replace('"You know what?', '[resigned] "You know what?');
  
  const postMemory = getMemoryUsage();
  console.log(`Memory after generation: ${postMemory.heapUsedMB}MB / ${postMemory.heapTotalMB}MB (${postMemory.percentage}%)`);
  
  return scenario;
}

// Save scenario to appropriate pack file
async function saveScenarioToPack(scenario, packNumber) {
  const packFile = path.join(
    __dirname,
    'data',
    'scenario-packs',
    `scenario-generated-${String(packNumber).padStart(3, '0')}.json`
  );
  
  try {
    // Read existing pack
    let packData = { scenarios: [] };
    try {
      const content = await fs.readFile(packFile, 'utf8');
      packData = JSON.parse(content);
    } catch (err) {
      console.log(`Creating new pack file: ${packFile}`);
    }
    
    // Add scenario
    packData.scenarios.push(scenario);
    
    // Sort by ID to maintain order
    packData.scenarios.sort((a, b) => a.id.localeCompare(b.id));
    
    // Save with pretty printing
    await fs.writeFile(packFile, JSON.stringify(packData, null, 2));
    console.log(`✓ Saved scenario to ${packFile}`);
    
    return true;
  } catch (error) {
    console.error(`Error saving scenario: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('Audio-Aware Scenario Generator V3');
  console.log('=================================');
  
  // Check if specific scenarios requested
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node audio-aware-scenario-generator-v3.js <pack-number> <scenario-index>');
    console.log('Example: node audio-aware-scenario-generator-v3.js 001 8');
    process.exit(1);
  }
  
  const packNumber = args[0];
  const scenarioIndex = parseInt(args[1]);
  
  console.log(`Generating scenario ${scenarioIndex} for pack ${packNumber}...`);
  
  // Generate scenario
  const templateIndex = scenarioIndex % scenarioTemplates.length;
  const scenario = await generateWhimsicalScenario(packNumber, scenarioIndex, scenarioTemplates[templateIndex]);
  
  // Save to pack
  await saveScenarioToPack(scenario, packNumber);
  
  // Update production status
  try {
    const statusFile = path.join(__dirname, 'production-status.json');
    const status = JSON.parse(await fs.readFile(statusFile, 'utf8'));
    status.progress.scenariosWritten++;
    status.lastUpdate = new Date().toISOString();
    status.teamUpdates.writer = `Generated ${scenario.title} for pack ${packNumber}`;
    await fs.writeFile(statusFile, JSON.stringify(status, null, 2));
  } catch (err) {
    console.log('Could not update production status:', err.message);
  }
  
  console.log('✓ Scenario generation complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateWhimsicalScenario, convertToAudioScript };