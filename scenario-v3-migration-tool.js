#!/usr/bin/env node

/**
 * Scenario V3 Migration Tool
 * Automatically upgrades V2 scenarios to V3 format:
 * - Removes profanity
 * - Fixes dialogue formatting
 * - Generates audioScript from content
 * - Adds audioHints for characters
 * - Converts audio-unfriendly patterns
 */

const fs = require('fs').promises;
const path = require('path');

// Import conversion functions from our V3 generator
const { convertToAudioScript } = require('./audio-aware-scenario-generator-v3.js');

// Profanity list
const PROFANITY_LIST = [
  'shit', 'fuck', 'damn', 'ass', 'bitch', 'hell', 'crap', 'bastard',
  'piss', 'dick', 'cock', 'pussy', 'fag', 'slut', 'whore'
];

// Safe replacements for profanity
const PROFANITY_REPLACEMENTS = {
  'shit': 'stuff',
  'fuck': 'fudge',
  'damn': 'darn',
  'ass': 'butt',
  'bitch': 'witch',
  'hell': 'heck',
  'crap': 'crud',
  'bastard': 'jerk',
  'piss': 'tick',
  'dick': 'jerk',
  'cock': 'rooster',
  'pussy': 'cat',
  'fag': 'person',
  'slut': 'person',
  'whore': 'person'
};

// Character voice templates based on common patterns
const VOICE_TEMPLATES = {
  // Authority figures
  'professor': 'academic, thoughtful, slight pompousness',
  'doctor': 'professional, caring but clinical',
  'expert': 'confident, knowledgeable, slightly condescending',
  'scientist': 'analytical, precise, excited about data',
  
  // Media personalities  
  'reporter': 'professional news voice, slight urgency',
  'anchor': 'authoritative broadcast voice',
  'host': 'enthusiastic, engaging, slightly over the top',
  'influencer': 'trendy, excited, uses lots of vocal fry',
  
  // Common characters
  'parent': 'caring but exasperated',
  'child': 'curious, high energy, asks lots of questions',
  'teen': 'slightly bored, uses current slang',
  'elder': 'wise, patient, storytelling voice',
  
  // Animals (anthropomorphized)
  'cat': 'aloof, sophisticated, slightly judgmental',
  'dog': 'enthusiastic, loyal, easily excited',
  'bear': 'gruff but friendly, deep voice',
  'bird': 'chirpy, fast-talking, easily distracted',
  
  // Default
  'default': 'distinct character voice appropriate to role'
};

// Clean profanity from text
function cleanProfanity(text) {
  let cleaned = text;
  let changesMade = [];
  
  for (const [profane, replacement] of Object.entries(PROFANITY_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${profane}\\b`, 'gi');
    const matches = cleaned.match(regex);
    if (matches) {
      cleaned = cleaned.replace(regex, replacement);
      changesMade.push({ from: profane, to: replacement, count: matches.length });
    }
  }
  
  return { cleaned, changesMade };
}

// Fix dialogue formatting
function fixDialogueFormatting(text) {
  let fixed = text;
  const changes = [];
  
  // Fix missing colons after character names
  fixed = fixed.replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(["""])/gm, (match, name, quote) => {
    changes.push({ type: 'added_colon', character: name });
    return `${name}: ${quote}`;
  });
  
  // Standardize character names (remove variations)
  const lines = fixed.split('\n');
  const characterMap = new Map();
  
  // First pass: collect all character names
  for (const line of lines) {
    const match = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/);
    if (match) {
      const name = match[1];
      const baseName = name.split(' ')[0]; // Use first name as base
      
      if (!characterMap.has(baseName)) {
        characterMap.set(baseName, name);
      }
    }
  }
  
  // Second pass: standardize names
  fixed = lines.map(line => {
    for (const [baseName, fullName] of characterMap) {
      // Replace variations like "Dr. Smith", "Smith", "Doctor Smith" with consistent name
      const variations = [
        `Dr\\.?\\s*${baseName}`,
        `Doctor\\s+${baseName}`,
        `Prof\\.?\\s*${baseName}`,
        `Professor\\s+${baseName}`,
        `Mr\\.?\\s*${baseName}`,
        `Mrs\\.?\\s*${baseName}`,
        `Ms\\.?\\s*${baseName}`,
        baseName
      ];
      
      const variationRegex = new RegExp(`^(${variations.join('|')})(:)`, 'i');
      if (variationRegex.test(line) && !line.startsWith(fullName)) {
        changes.push({ type: 'standardized_name', from: line.match(variationRegex)[1], to: fullName });
        line = line.replace(variationRegex, `${fullName}:`);
      }
    }
    return line;
  }).join('\n');
  
  return { fixed, changes, characters: Array.from(characterMap.values()) };
}

// Generate character voices based on names and context
function generateCharacterVoices(characters, content) {
  const voices = {};
  
  for (const character of characters) {
    const lowerChar = character.toLowerCase();
    let voice = VOICE_TEMPLATES.default;
    
    // Check for role indicators
    for (const [role, voiceDesc] of Object.entries(VOICE_TEMPLATES)) {
      if (lowerChar.includes(role)) {
        voice = voiceDesc;
        break;
      }
    }
    
    // Check for specific patterns in the content
    const characterLines = content.split('\n')
      .filter(line => line.startsWith(`${character}:`))
      .join(' ');
    
    // Adjust based on speech patterns
    if (characterLines.includes('data') || characterLines.includes('study')) {
      voice += ', data-driven';
    }
    if (characterLines.includes('!') && characterLines.split('!').length > 3) {
      voice += ', very excitable';
    }
    if (characterLines.includes('?') && characterLines.split('?').length > 3) {
      voice += ', questioning everything';
    }
    
    voices[character] = voice;
  }
  
  return voices;
}

// Add performance directives to audio script
function addPerformanceDirectives(audioScript, content) {
  let enhanced = audioScript;
  
  // Add emotional cues based on punctuation and context
  enhanced = enhanced.replace(/!\s*"/g, '!" [excited] "');
  enhanced = enhanced.replace(/\?\s*"/g, '?" [questioning] "');
  enhanced = enhanced.replace(/\.\.\.\s*"/g, '..." [thoughtful] "');
  
  // Add cues for specific phrases
  const emotionalPhrases = {
    'breaking news': '[dramatic]',
    'oh my god': '[shocked]',
    'um': '[hesitant]',
    'well actually': '[condescending]',
    'listen': '[serious]',
    'honestly': '[frank]',
    'literally': '[emphatic]'
  };
  
  for (const [phrase, directive] of Object.entries(emotionalPhrases)) {
    const regex = new RegExp(`(${phrase})`, 'gi');
    enhanced = enhanced.replace(regex, `${directive} $1`);
  }
  
  // Clean up duplicate directives
  enhanced = enhanced.replace(/\[(\w+)\]\s*\[(\w+)\]/g, '[$1]');
  
  return enhanced;
}

// Migrate a single scenario to V3
async function migrateScenario(scenario) {
  const migrationLog = {
    scenarioId: scenario.id,
    title: scenario.title,
    changes: []
  };
  
  // Get the display content
  let displayContent = scenario.content || scenario.text || scenario.description || '';
  
  // 1. Clean profanity
  const { cleaned: cleanedContent, changesMade: profanityChanges } = cleanProfanity(displayContent);
  if (profanityChanges.length > 0) {
    displayContent = cleanedContent;
    migrationLog.changes.push({ type: 'profanity_removed', details: profanityChanges });
  }
  
  // 2. Fix dialogue formatting
  const { fixed: fixedContent, changes: dialogueChanges, characters } = fixDialogueFormatting(displayContent);
  if (dialogueChanges.length > 0) {
    displayContent = fixedContent;
    migrationLog.changes.push({ type: 'dialogue_fixed', details: dialogueChanges });
  }
  
  // 3. Update content field
  scenario.content = displayContent;
  
  // 4. Generate audio script if missing
  if (!scenario.audioScript) {
    scenario.audioScript = convertToAudioScript(displayContent);
    
    // Add performance directives
    scenario.audioScript = addPerformanceDirectives(scenario.audioScript, displayContent);
    
    migrationLog.changes.push({ type: 'audio_script_generated' });
  }
  
  // 5. Add audio hints if missing
  if (!scenario.audioHints && characters.length > 0) {
    scenario.audioHints = {
      tone: detectTone(displayContent),
      pacing: 'moderate',
      characterVoices: generateCharacterVoices(characters, displayContent)
    };
    
    migrationLog.changes.push({ 
      type: 'audio_hints_added', 
      details: { characterCount: characters.length } 
    });
  }
  
  // 6. Clean claim of profanity and audio-unfriendly patterns
  if (scenario.claim) {
    const { cleaned: cleanedClaim } = cleanProfanity(scenario.claim);
    if (cleanedClaim !== scenario.claim) {
      scenario.claim = cleanedClaim;
      migrationLog.changes.push({ type: 'claim_cleaned' });
    }
  }
  
  // 7. Ensure all required V3 fields exist
  if (!scenario.reviewKeywords) {
    scenario.reviewKeywords = {
      logic: ["evidence", "data", "facts", "research", "study"],
      emotion: ["feel", "believe", "fear", "hope", "worry"],
      balanced: ["however", "consider", "both", "although", "while"],
      agenda: ["buy", "vote", "join", "support", "oppose"]
    };
  }
  
  // Mark as V3
  scenario.formatVersion = 'v3';
  scenario.migrationDate = new Date().toISOString();
  
  return { scenario, migrationLog };
}

// Detect tone from content
function detectTone(content) {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('breaking') || lowerContent.includes('urgent')) {
    return 'dramatic';
  }
  if (lowerContent.includes('study') || lowerContent.includes('research')) {
    return 'thoughtful';
  }
  if (content.split('!').length > 5) {
    return 'energetic';
  }
  if (lowerContent.includes('debate') || lowerContent.includes('argument')) {
    return 'confrontational';
  }
  
  return 'playful'; // default for whimsical scenarios
}

// Process all packs
async function migrateAllScenarios(dryRun = false) {
  const packDir = path.join(__dirname, 'data', 'scenario-packs');
  const migrationReport = {
    timestamp: new Date().toISOString(),
    dryRun,
    totalScenarios: 0,
    totalChanges: 0,
    packReports: []
  };
  
  try {
    // Create backup directory
    if (!dryRun) {
      const backupDir = path.join(__dirname, 'backups', `pre-v3-migration-${Date.now()}`);
      await fs.mkdir(backupDir, { recursive: true });
      console.log(`Created backup directory: ${backupDir}`);
      
      // Copy all pack files to backup
      const files = await fs.readdir(packDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.copyFile(
            path.join(packDir, file),
            path.join(backupDir, file)
          );
        }
      }
    }
    
    // Process each pack
    const files = await fs.readdir(packDir);
    const packFiles = files.filter(f => f.startsWith('scenario-generated-') && f.endsWith('.json'));
    
    for (const file of packFiles.sort()) {
      const packId = file.match(/scenario-generated-(\d+)\.json/)[1];
      console.log(`\nMigrating pack ${packId}...`);
      
      const packPath = path.join(packDir, file);
      const packData = JSON.parse(await fs.readFile(packPath, 'utf8'));
      
      const packReport = {
        packId,
        scenarioCount: packData.scenarios.length,
        migrations: []
      };
      
      // Migrate each scenario
      for (let i = 0; i < packData.scenarios.length; i++) {
        const { scenario, migrationLog } = await migrateScenario(packData.scenarios[i]);
        
        if (migrationLog.changes.length > 0) {
          packReport.migrations.push(migrationLog);
          migrationReport.totalChanges += migrationLog.changes.length;
          console.log(`  ✓ ${scenario.id}: ${migrationLog.changes.length} changes`);
        }
        
        packData.scenarios[i] = scenario;
        migrationReport.totalScenarios++;
      }
      
      // Save migrated pack (unless dry run)
      if (!dryRun && packReport.migrations.length > 0) {
        await fs.writeFile(packPath, JSON.stringify(packData, null, 2));
        console.log(`  Saved ${packReport.migrations.length} migrated scenarios`);
      }
      
      migrationReport.packReports.push(packReport);
    }
    
    // Save migration report
    const reportPath = path.join(__dirname, 'v3-migration-report.json');
    await fs.writeFile(reportPath, JSON.stringify(migrationReport, null, 2));
    
    // Generate summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log(`- Total scenarios processed: ${migrationReport.totalScenarios}`);
    console.log(`- Total changes made: ${migrationReport.totalChanges}`);
    console.log(`- Dry run: ${dryRun}`);
    
    if (!dryRun) {
      console.log('\n✓ Migration complete! Backups saved in backups/ directory');
    } else {
      console.log('\nDry run complete. Run without --dry-run to apply changes.');
    }
    
    return migrationReport;
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('Scenario V3 Migration Tool');
  console.log('=========================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) {
    console.log('Running in DRY RUN mode - no changes will be saved\n');
  } else {
    console.log('Running in LIVE mode - changes will be saved\n');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    await migrateAllScenarios(dryRun);
    
    // Update production status
    if (!dryRun) {
      const statusPath = path.join(__dirname, 'production-status.json');
      try {
        const status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
        status.teamUpdates.technician = 'Completed V3 migration for all scenarios';
        status.lastUpdate = new Date().toISOString();
        await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
      } catch (err) {
        console.log('Could not update production status');
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateScenario, cleanProfanity, fixDialogueFormatting };