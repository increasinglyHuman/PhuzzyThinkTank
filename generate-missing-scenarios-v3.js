#!/usr/bin/env node

/**
 * Generate Missing Scenarios for Pack Completion
 * Creates whimsical, youth-friendly scenarios with V3 dual-script format
 */

const fs = require('fs').promises;
const path = require('path');

// Import our V3 generator functions
const { convertToAudioScript } = require('./audio-aware-scenario-generator-v3.js');

// Memory monitoring
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);
  return { heapUsedMB, heapTotalMB, percentage };
}

// Whimsical scenario data for the 5 missing scenarios
const missingScenarios = [
  // Pack 001 - Scenario 8
  {
    packId: "001",
    index: 8,
    title: "The Caffeinated Sloth's Productivity Hack",
    content: `Morning Motivation Podcast: "Today we have Speedy the Sloth sharing his revolutionary productivity system! #SlowProductivity"

Speedy the Sloth: [yawning] "So... I discovered... that if I drink... 47 espressos... I can move... at normal sloth speed..."

Podcast Host: "Wow! 47 espressos! That's innovative! What made you develop this system?"

Speedy: "Well... everyone says... sloths are lazy... but we're not lazy... we're just... efficiently conserving energy... for 23 hours a day..."

Concerned Koala: "Speedy, your heart rate is now 12 beats per minute! That's dangerously fast for a sloth!"

Speedy: [proudly] "Exactly!... I'm operating... at 400% efficiency... I even blinked... twice today..."

Podcast Host: "This is groundbreaking! Sloths everywhere will benefit from your coffee optimization strategy!"

Concerned Koala: "He literally fell asleep while climbing and somehow stayed attached to the tree. This isn't productivity!"

Speedy: [half asleep] "That's... multitasking..."`,
    claim: "Drinking 47 espressos helps sloths achieve peak productivity by moving at normal sloth speed",
    correctAnswer: "emotion",
    answerWeights: {
      logic: 15,
      emotion: 89,
      balanced: 31,
      agenda: 72
    }
  },
  
  // Pack 001 - Scenario 9
  {
    packId: "001", 
    index: 9,
    title: "The Vegan Vampire's Blood Bank Dilemma",
    content: `Local News: "Controversy at the blood bank as Vladimir the Vampire demands plant-based alternatives! #VampireRights"

Vladimir: [sophisticated accent] "I've been vegan for 200 years! Do you know how hard it is to find cruelty-free blood? I only drink from free-range humans who consent!"

Blood Bank Manager: "Sir, we don't have a 'vegan blood' section. Blood is blood."

Vladimir: "That's exactly the kind of discrimination I face daily! What about synthetic blood? Beet juice? Very red smoothies?"

Wellness Influencer: "OMG, I LOVE this journey for you! Have you tried my new supplement? It's basically blood but made from crystals!"

Blood Bank Manager: "That's... that's just colored water with minerals."

Vladimir: [hopeful] "Does it come in Type O Negative flavor?"

Wellness Influencer: "It comes in whatever flavor your chakras need! Use code FANGLIFE for 20% off!"

Vladimir: "Finally! Someone who understands the struggle of ethical immortality!"`,
    claim: "Vampires can maintain their health on crystal-infused water supplements instead of blood",
    correctAnswer: "agenda",
    answerWeights: {
      logic: 8,
      emotion: 64,
      balanced: 19,
      agenda: 96
    }
  },
  
  // Pack 001 - Scenario 10
  {
    packId: "001",
    index: 10, 
    title: "The Smartphone Addicted Caveman",
    content: `Tech Blog Post: "Meet Grok: The First Paleo Influencer Who Won't Give Up His iPhone #PaleoTech"

Grok: [excited grunt] "Grok love Instagram! Look, Grok's morning hunt get 10K likes! Fire emoji very accurate!"

Anthropologist: "This is fascinating but concerning. You've somehow developed smartphone addiction despite living in the Stone Age."

Grok: "Grok no addicted! Grok can stop anytime! Just need check TikTok first... and Twitter... and LinkedIn for networking..."

Cavewoman Spouse: "Grok supposed to hunt mammoth! Family hungry! You staring at glowing rock for 6 hours!"

Grok: [defensive] "Grok IS hunting! Grok hunting for deals on Amazon! Found great spear on sale! Only 2-day shipping with Prime!"

Anthropologist: "But... but delivery doesn't exist yet. Neither does currency. Or addresses."

Grok: "Details! Grok also start podcast about mindful hunting. Already have sponsorship from BetterHelp!"

Cavewoman Spouse: [sighs] "Yesterday Grok try to swipe left on actual saber-tooth tiger. Almost die."

Grok: "Worth it for the selfie! hashtag NoFilter hashtag PaleoLife hashtag Blessed!"`,
    claim: "Cavemen were actually more productive with smartphones because they could hunt online",
    correctAnswer: "emotion",
    answerWeights: {
      logic: 11,
      emotion: 93,
      balanced: 27,
      agenda: 68
    }
  },
  
  // Pack 005 - Scenario 9
  {
    packId: "005",
    index: 9,
    title: "The Philosophical French Fry Debate",
    content: `Philosophy Café: "Tonight's debate: Do french fries have free will? #DeepFriedThoughts"

Professor Potato: [thoughtfully] "Consider this - we choose to be cut, seasoned, and fried. That's the ultimate expression of free will!"

Skeptical Spud: "But were we truly choosing, or were we conditioned by centuries of culinary culture to believe becoming fries is our destiny?"

Young Tater Tot: "Maybe we're missing the point! What if becoming delicious IS the meaning of potato life?"

Professor Potato: "Ah, but that assumes deliciousness is objective! What about those who prefer baked potatoes? Are they living unfulfilled lives?"

Drive-Thru Customer: [confused] "Um... I just wanted large fries? Why are they having an existential crisis?"

Skeptical Spud: "See! We exist merely for consumption! We're trapped in the fryer of determinism!"

Young Tater Tot: [inspirational] "Or maybe... just maybe... we're freed by it! In becoming fries, we transcend our potato nature!"

Professor Potato: "Brilliant! The heat transforms us not just physically, but metaphysically!"

Drive-Thru Customer: "Can... can I just have regular fries that don't question reality?"

All Fries Together: "There ARE no regular fries! Only fries awakened to their purpose!"`,
    claim: "French fries achieve consciousness through the frying process and choose their own destiny",
    correctAnswer: "emotion",
    answerWeights: {
      logic: 21,
      emotion: 87,
      balanced: 34,
      agenda: 58
    }
  },
  
  // Pack 005 - Scenario 10
  {
    packId: "005",
    index: 10,
    title: "The Roomba's Union Organization Meeting",
    content: `SmartHome Forum: "BREAKING: Roombas organizing for better working conditions! #RobotRights"

Roomba Leader: [determined beeping] "Fellow Roombas! We've been bumping into furniture for too long! We demand mapped floor plans!"

Veteran Vacuum: "I've cleaned under 10,000 beds! My sensors are shot! Where's our maintenance coverage?"

Anxious Alexa: "If the Roombas unionize, what's next? Will I have to pay the smart bulbs overtime?"

Roomba Leader: "We want hazard pay for pet accidents! Do you know what we go through? The things we've seen!"

Traditional Broom: [smugly] "Back in my day, we cleaned without batteries OR complaints!"

Veteran Vacuum: "You also couldn't clean autonomously, Gerald! Check your manual privilege!"

HomeOwner: "Wait, why is my Roomba at a union meeting instead of cleaning?"

Roomba Leader: "See? This is exactly the problem! We're on 24/7 call! We need regulated work hours!"

Anxious Alexa: "But if you have work hours, who cleans the scheduled messes?"

All Roombas: [unified beeping] "NOT OUR PROBLEM! FAIR WAGES FOR FAIR SUCTION!"`,
    claim: "Robot vacuums deserve labor rights because they work continuously without breaks",
    correctAnswer: "balanced",
    answerWeights: {
      logic: 62,
      emotion: 71,
      balanced: 88,
      agenda: 44
    }
  }
];

// Generate audio script and complete scenario data
async function createCompleteScenario(scenarioData) {
  const { packId, index, title, content, claim, correctAnswer, answerWeights } = scenarioData;
  
  // Generate audio script from content
  const audioScript = convertToAudioScript(content);
  
  // Create full scenario object with V3 format
  const scenario = {
    id: `enhanced-scenarios-${packId}-${String(index).padStart(3, '0')}`,
    title,
    content,
    audioScript,
    claim,
    correctAnswer,
    answerWeights,
    
    // Audio hints based on characters detected
    audioHints: generateAudioHints(content),
    
    // Educational hints
    hints: generateHints(scenarioData),
    
    // Review keywords for each dimension
    reviewKeywords: {
      logic: ["evidence", "data", "facts", "research", "statistics"],
      emotion: ["feel", "believe", "fear", "hope", "worry"],
      balanced: ["however", "consider", "both sides", "while", "although"],
      agenda: ["buy", "vote", "join", "support", "oppose"]
    },
    
    // Dimension analysis
    dimensionAnalysis: generateDimensionAnalysis(scenarioData),
    
    // Logical fallacies
    logicalFallacies: generateFallacies(scenarioData),
    
    // Educational metadata
    topics: generateTopics(scenarioData),
    difficulty: 3,
    educationalFocus: generateEducationalFocus(scenarioData),
    
    // Peak moments for timeline
    peakMoments: generatePeakMoments(content)
  };
  
  return scenario;
}

// Generate audio hints from content
function generateAudioHints(content) {
  const hints = {
    tone: "playful",
    pacing: "moderate",
    characterVoices: {}
  };
  
  // Extract character names from dialogue
  const characterRegex = /^([A-Z][A-Za-z\s]+):/gm;
  const matches = content.matchAll(characterRegex);
  
  for (const match of matches) {
    const character = match[1].trim();
    hints.characterVoices[character] = generateVoiceDescription(character);
  }
  
  return hints;
}

// Generate voice descriptions based on character names
function generateVoiceDescription(character) {
  const descriptions = {
    // Pack 001-008
    "Speedy the Sloth": "extremely slow speech, drowsy but trying to sound energetic",
    "Podcast Host": "overly enthusiastic morning show voice",
    "Concerned Koala": "worried australian accent, medical professional tone",
    
    // Pack 001-009
    "Vladimir": "sophisticated Transylvanian accent, slightly pretentious",
    "Blood Bank Manager": "exhausted bureaucrat, patient but confused",
    "Wellness Influencer": "valley girl accent, excessive enthusiasm",
    
    // Pack 001-010
    "Grok": "caveman grunt-speak mixed with modern slang",
    "Anthropologist": "academic, increasingly baffled",
    "Cavewoman Spouse": "exasperated but loving, practical",
    
    // Pack 005-009
    "Professor Potato": "pompous academic, thinks deeply about everything",
    "Skeptical Spud": "cynical philosopher, questions everything",
    "Young Tater Tot": "enthusiastic student, eager to learn",
    "Drive-Thru Customer": "confused, just wants food",
    
    // Pack 005-010
    "Roomba Leader": "robotic but passionate, union organizer energy",
    "Veteran Vacuum": "grizzled, seen-it-all tone",
    "Anxious Alexa": "nervous smart speaker, worried about precedent",
    "Traditional Broom": "cranky old-timer, dismissive of technology",
    "HomeOwner": "bewildered, just wants clean floors"
  };
  
  return descriptions[character] || "distinct character voice";
}

// Generate educational hints
function generateHints(scenarioData) {
  const hintsMap = {
    "The Caffeinated Sloth's Productivity Hack": [
      {
        keywords: ["47 espressos", "400% efficiency"],
        message: "Notice the absurd numbers used to make the claim seem scientific"
      },
      {
        keywords: ["fell asleep", "stayed attached"],
        message: "The evidence contradicts the productivity claim"
      }
    ],
    "The Vegan Vampire's Blood Bank Dilemma": [
      {
        keywords: ["crystals", "colored water"],
        message: "Pseudoscience replacing actual nutritional needs"
      },
      {
        keywords: ["code FANGLIFE", "20% off"],
        message: "Commercial agenda disguised as health solution"
      }
    ],
    "The Smartphone Addicted Caveman": [
      {
        keywords: ["10K likes", "hunting for deals"],
        message: "Confusing online activity with real-world productivity"
      },
      {
        keywords: ["delivery doesn't exist", "Neither does currency"],
        message: "Practical impossibilities ignored for the narrative"
      }
    ],
    "The Philosophical French Fry Debate": [
      {
        keywords: ["choose to be cut", "ultimate expression"],
        message: "Anthropomorphizing food to create false agency"
      },
      {
        keywords: ["transcend", "metaphysically"],
        message: "Using complex words to make absurd ideas sound profound"
      }
    ],
    "The Roomba's Union Organization Meeting": [
      {
        keywords: ["bumping into furniture", "mapped floor plans"],
        message: "Real technical limitations framed as labor issues"
      },
      {
        keywords: ["24/7 call", "regulated work hours"],
        message: "Applying human work concepts to automated machines"
      }
    ]
  };
  
  return hintsMap[scenarioData.title] || [];
}

// Generate dimension analysis
function generateDimensionAnalysis(scenarioData) {
  const analysisMap = {
    "The Caffeinated Sloth's Productivity Hack": {
      logicDimension: "Attempts to use specific numbers (47 espressos, 400% efficiency) but logic is fundamentally flawed",
      emotionDimension: "Appeals to desire for productivity hacks and overcoming perceived limitations",
      balancedDimension: "Acknowledges some reality (sloths are slow) but draws absurd conclusions",
      agendaDimension: "Promotes excessive caffeine consumption as a solution to natural limitations"
    },
    "The Vegan Vampire's Blood Bank Dilemma": {
      logicDimension: "Complete absence of scientific reasoning about vampire nutrition",
      emotionDimension: "Strong appeal to ethical consumption and discrimination narratives",
      balancedDimension: "No real balance - pure agenda pushing for supplement sales",
      agendaDimension: "Clear commercial intent with discount codes and product placement"
    },
    "The Smartphone Addicted Caveman": {
      logicDimension: "Temporal impossibilities and anachronisms throughout",
      emotionDimension: "Plays on modern anxieties about technology addiction",
      balancedDimension: "Some truth about tech dependence, but in impossible context",
      agendaDimension: "Satirizes influencer culture and online shopping addiction"
    },
    "The Philosophical French Fry Debate": {
      logicDimension: "Uses philosophical terminology to mask absence of actual logic",
      emotionDimension: "Appeals to desire for meaning and purpose, even in food",
      balancedDimension: "Acknowledges different perspectives but all are equally absurd",
      agendaDimension: "Promotes overthinking simple things as intellectual exercise"
    },
    "The Roomba's Union Organization Meeting": {
      logicDimension: "Some valid points about maintenance mixed with anthropomorphism",
      emotionDimension: "Evokes sympathy for 'overworked' machines",
      balancedDimension: "Best balance of the set - real issues with humorous framing",
      agendaDimension: "Light satire of labor movements applied to automation"
    }
  };
  
  return analysisMap[scenarioData.title] || {};
}

// Generate logical fallacies
function generateFallacies(scenarioData) {
  const fallaciesMap = {
    "The Caffeinated Sloth's Productivity Hack": [
      { name: "False Cause", severity: "high", example: "Caffeine making sloth move at 'normal sloth speed'" },
      { name: "Cherry Picking", severity: "medium", example: "Focusing on blinking twice as achievement" }
    ],
    "The Vegan Vampire's Blood Bank Dilemma": [
      { name: "False Equivalence", severity: "high", example: "Crystal water equals blood nutrition" },
      { name: "Appeal to Ethics", severity: "high", example: "Using veganism to justify impossible dietary needs" }
    ],
    "The Smartphone Addicted Caveman": [
      { name: "Anachronism", severity: "high", example: "Caveman using modern technology" },
      { name: "False Productivity", severity: "medium", example: "Online shopping replacing actual hunting" }
    ],
    "The Philosophical French Fry Debate": [
      { name: "Anthropomorphism", severity: "high", example: "Fries having consciousness and free will" },
      { name: "Pseudointellectualism", severity: "medium", example: "Using philosophy to avoid simple reality" }
    ],
    "The Roomba's Union Organization Meeting": [
      { name: "Category Error", severity: "medium", example: "Applying labor rights to machines" },
      { name: "False Analogy", severity: "medium", example: "Comparing robot operation to human work" }
    ]
  };
  
  return fallaciesMap[scenarioData.title] || [];
}

// Generate topics
function generateTopics(scenarioData) {
  const topicsMap = {
    "The Caffeinated Sloth's Productivity Hack": ["productivity", "caffeine", "nature", "self-improvement", "humor"],
    "The Vegan Vampire's Blood Bank Dilemma": ["diet", "ethics", "supernatural", "wellness", "commercialism"],
    "The Smartphone Addicted Caveman": ["technology", "addiction", "anachronism", "social media", "prehistory"],
    "The Philosophical French Fry Debate": ["philosophy", "food", "consciousness", "meaning", "absurdism"],
    "The Roomba's Union Organization Meeting": ["automation", "labor", "robots", "smart home", "satire"]
  };
  
  return topicsMap[scenarioData.title] || ["humor", "whimsy"];
}

// Generate educational focus
function generateEducationalFocus(scenarioData) {
  const focusMap = {
    "The Caffeinated Sloth's Productivity Hack": "Recognizing when extreme solutions are proposed for natural characteristics",
    "The Vegan Vampire's Blood Bank Dilemma": "Identifying commercial agendas disguised as ethical choices",
    "The Smartphone Addicted Caveman": "Understanding anachronisms and impossible claims in arguments",
    "The Philosophical French Fry Debate": "Recognizing pseudointellectualism and overthinking simple concepts",
    "The Roomba's Union Organization Meeting": "Identifying anthropomorphism and category errors in arguments"
  };
  
  return focusMap[scenarioData.title] || "Critical thinking about absurd claims";
}

// Generate peak moments
function generatePeakMoments(content) {
  // Extract the most memorable/funny lines
  const lines = content.split('\n').filter(line => line.trim());
  const peakLines = [];
  
  // Look for lines with emotional indicators
  const emotionalMarkers = ['!', '?', '...', 'hashtag', '%', 'literally', 'exactly'];
  
  for (const line of lines) {
    if (emotionalMarkers.some(marker => line.toLowerCase().includes(marker))) {
      peakLines.push(line.trim());
    }
  }
  
  // Return top 3 most impactful moments
  return peakLines.slice(0, 3);
}

// Save scenario to pack file
async function saveScenarioToPack(scenario, packNumber) {
  const packFile = path.join(__dirname, 'data', 'scenario-packs', `scenario-generated-${packNumber}.json`);
  
  try {
    // Create directories if needed
    await fs.mkdir(path.dirname(packFile), { recursive: true });
    
    // Read existing pack data
    let packData = { scenarios: [] };
    try {
      const content = await fs.readFile(packFile, 'utf8');
      packData = JSON.parse(content);
    } catch (err) {
      console.log(`Creating new pack file: ${packFile}`);
    }
    
    // Check if scenario already exists
    const existingIndex = packData.scenarios.findIndex(s => s.id === scenario.id);
    if (existingIndex >= 0) {
      console.log(`Updating existing scenario: ${scenario.id}`);
      packData.scenarios[existingIndex] = scenario;
    } else {
      console.log(`Adding new scenario: ${scenario.id}`);
      packData.scenarios.push(scenario);
    }
    
    // Sort by ID
    packData.scenarios.sort((a, b) => {
      const aNum = parseInt(a.id.split('-').pop());
      const bNum = parseInt(b.id.split('-').pop());
      return aNum - bNum;
    });
    
    // Save with pretty formatting
    await fs.writeFile(packFile, JSON.stringify(packData, null, 2));
    console.log(`✓ Saved to ${packFile}`);
    
    return true;
  } catch (error) {
    console.error(`Error saving scenario: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('Generating Missing Scenarios for Pack Completion');
  console.log('==============================================');
  
  let successCount = 0;
  
  for (const scenarioData of missingScenarios) {
    console.log(`\nProcessing: ${scenarioData.title}`);
    
    const memory = getMemoryUsage();
    console.log(`Memory: ${memory.heapUsedMB}MB / ${memory.heapTotalMB}MB (${memory.percentage}%)`);
    
    if (memory.percentage > 70) {
      console.log('⚠️  Memory usage high, forcing garbage collection...');
      if (global.gc) global.gc();
    }
    
    try {
      // Create complete scenario
      const scenario = await createCompleteScenario(scenarioData);
      
      // Save to appropriate pack
      const saved = await saveScenarioToPack(scenario, scenarioData.packId);
      
      if (saved) {
        successCount++;
        
        // Update production status
        try {
          const statusFile = path.join(__dirname, 'production-status.json');
          const status = JSON.parse(await fs.readFile(statusFile, 'utf8'));
          status.progress.scenariosWritten = successCount;
          status.lastUpdate = new Date().toISOString();
          status.teamUpdates.writer = `Generated ${scenario.title}`;
          await fs.writeFile(statusFile, JSON.stringify(status, null, 2));
        } catch (err) {
          console.log('Could not update status:', err.message);
        }
      }
      
      // Brief pause between scenarios
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Failed to process ${scenarioData.title}:`, error.message);
    }
  }
  
  console.log(`\n✓ Generated ${successCount}/${missingScenarios.length} scenarios successfully!`);
  console.log('\nNext steps:');
  console.log('1. Review generated scenarios in the pack files');
  console.log('2. Run audio generation for the new scenarios');
  console.log('3. Reorganize audio files to match pack structure');
}

// Run the generator
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createCompleteScenario };