#!/usr/bin/env node

/**
 * Audio Folder Metadata Manager
 * Creates and updates info.json files in each audio recording folder
 * Tracks generation status, versions, and approval workflow
 */

const fs = require('fs').promises;
const path = require('path');

// Audio recording base path
const AUDIO_BASE_PATH = path.join(__dirname, 'data', 'audio-recording-voices-for-scenarios-from-elevenlabs');

// Metadata template
function createMetadataTemplate(scenarioId, scenarioTitle, packId) {
  return {
    scenarioId,
    scenarioTitle,
    packId,
    packPosition: parseInt(scenarioId.split('-').pop()),
    
    generation: {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      generatedBy: "audio-aware-scenario-generator-v3",
      elevenLabsModel: "eleven_turbo_v2",
      voiceMode: "multi-voice",
      costEstimate: 0.0
    },
    
    files: {
      title: { exists: false, duration: null, size: null },
      content: { exists: false, duration: null, size: null },
      claim: { exists: false, duration: null, size: null }
    },
    
    characters: {},
    
    workflow: {
      status: "pending", // pending, generated, reviewed, approved, revision-needed
      generatedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      approvedDate: null,
      approvedBy: null,
      notes: [],
      qualityChecks: {
        audioClarity: null, // 1-5 rating
        voiceDistinction: null, // 1-5 rating
        performanceQuality: null, // 1-5 rating
        technicalQuality: null, // 1-5 rating
        familyFriendly: null // boolean
      }
    },
    
    revisions: [],
    
    audioProcessing: {
      preprocessingApplied: [],
      multiVoiceSegments: 0,
      totalCharacterCount: 0,
      estimatedCreditsUsed: 0,
      turboModeUsed: true
    },
    
    packAlignment: {
      correctPackNumber: null,
      correctScenarioIndex: null,
      needsRenumbering: false
    }
  };
}

// Check if audio files exist and get their stats
async function checkAudioFiles(folderPath) {
  const files = {
    title: { exists: false, duration: null, size: null },
    content: { exists: false, duration: null, size: null },
    claim: { exists: false, duration: null, size: null }
  };
  
  for (const [key, value of Object.entries(files)) {
    const filePath = path.join(folderPath, `${key}.mp3`);
    try {
      const stats = await fs.stat(filePath);
      files[key].exists = true;
      files[key].size = stats.size;
      // Duration would require an audio library to extract
    } catch (err) {
      // File doesn't exist
    }
  }
  
  return files;
}

// Map scenario numbers to pack structure
function getPackMapping(scenarioNum) {
  // Based on expected 10 scenarios per pack
  const packMappings = {
    // Pack 000: scenarios 0-9
    0: { pack: "000", index: 0 },
    1: { pack: "000", index: 1 },
    2: { pack: "000", index: 2 },
    3: { pack: "000", index: 3 },
    4: { pack: "000", index: 4 },
    5: { pack: "000", index: 5 },
    6: { pack: "000", index: 6 },
    7: { pack: "000", index: 7 },
    8: { pack: "000", index: 8 },
    9: { pack: "000", index: 9 },
    
    // Pack 001: scenarios 10-16 (only 7 scenarios)
    10: { pack: "001", index: 0 },
    11: { pack: "001", index: 1 },
    12: { pack: "001", index: 2 },
    13: { pack: "001", index: 3 },
    14: { pack: "001", index: 4 },
    15: { pack: "001", index: 5 },
    16: { pack: "001", index: 6 },
    
    // Pack 002: scenarios 17-26
    17: { pack: "002", index: 0 },
    18: { pack: "002", index: 1 },
    19: { pack: "002", index: 2 },
    20: { pack: "002", index: 3 },
    21: { pack: "002", index: 4 },
    22: { pack: "002", index: 5 },
    23: { pack: "002", index: 6 },
    24: { pack: "002", index: 7 },
    25: { pack: "002", index: 8 },
    26: { pack: "002", index: 9 },
    
    // Pack 003: scenarios 27-36
    27: { pack: "003", index: 0 },
    28: { pack: "003", index: 1 },
    29: { pack: "003", index: 2 },
    30: { pack: "003", index: 3 },
    31: { pack: "003", index: 4 },
    32: { pack: "003", index: 5 },
    33: { pack: "003", index: 6 },
    34: { pack: "003", index: 7 },
    35: { pack: "003", index: 8 },
    36: { pack: "003", index: 9 },
    
    // Pack 004: scenarios 37-46
    37: { pack: "004", index: 0 },
    38: { pack: "004", index: 1 },
    39: { pack: "004", index: 2 },
    40: { pack: "004", index: 3 },
    41: { pack: "004", index: 4 },
    42: { pack: "004", index: 5 },
    43: { pack: "004", index: 6 },
    44: { pack: "004", index: 7 },
    45: { pack: "004", index: 8 },
    46: { pack: "004", index: 9 },
    
    // Pack 005: scenarios 47-54 (only 8 scenarios)
    47: { pack: "005", index: 0 },
    48: { pack: "005", index: 1 },
    49: { pack: "005", index: 2 },
    50: { pack: "005", index: 3 },
    51: { pack: "005", index: 4 },
    52: { pack: "005", index: 5 },
    53: { pack: "005", index: 6 },
    54: { pack: "005", index: 7 },
    
    // Pack 006: scenarios 55-64
    55: { pack: "006", index: 0 },
    56: { pack: "006", index: 1 },
    57: { pack: "006", index: 2 },
    58: { pack: "006", index: 3 },
    59: { pack: "006", index: 4 },
    60: { pack: "006", index: 5 },
    61: { pack: "006", index: 6 },
    62: { pack: "006", index: 7 },
    63: { pack: "006", index: 8 },
    64: { pack: "006", index: 9 },
    
    // Additional scenarios that exist
    65: { pack: "006", index: 10 }, // Extra in pack 6
    66: { pack: "006", index: 11 }, // Extra in pack 6
  };
  
  return packMappings[scenarioNum] || { pack: "unknown", index: scenarioNum };
}

// Get scenario title from pack files
async function getScenarioTitle(packId, scenarioIndex) {
  try {
    const packFile = path.join(__dirname, 'data', 'scenario-packs', `scenario-generated-${packId}.json`);
    const packData = JSON.parse(await fs.readFile(packFile, 'utf8'));
    
    // Find scenario by index in pack
    const scenario = packData.scenarios.find(s => {
      const id = s.id;
      const index = parseInt(id.split('-').pop());
      return index === scenarioIndex;
    });
    
    return scenario ? scenario.title : "Unknown Scenario";
  } catch (err) {
    return "Scenario Not Found";
  }
}

// Process a single audio folder
async function processAudioFolder(folderName) {
  const folderPath = path.join(AUDIO_BASE_PATH, folderName);
  const infoPath = path.join(folderPath, 'info.json');
  
  // Extract scenario number from folder name
  const match = folderName.match(/scenario-(\d+)/);
  if (!match) {
    console.log(`Skipping non-scenario folder: ${folderName}`);
    return;
  }
  
  const scenarioNum = parseInt(match[1]);
  const packMapping = getPackMapping(scenarioNum);
  
  // Get scenario title from pack file
  const scenarioTitle = await getScenarioTitle(packMapping.pack, packMapping.index);
  
  // Check if info.json already exists
  let metadata;
  try {
    const existing = await fs.readFile(infoPath, 'utf8');
    metadata = JSON.parse(existing);
    console.log(`Updating existing metadata for ${folderName}`);
  } catch (err) {
    // Create new metadata
    metadata = createMetadataTemplate(
      `${packMapping.pack}-${String(packMapping.index).padStart(3, '0')}`,
      scenarioTitle,
      packMapping.pack
    );
    console.log(`Creating new metadata for ${folderName}`);
  }
  
  // Update file existence
  metadata.files = await checkAudioFiles(folderPath);
  
  // Update pack alignment
  metadata.packAlignment = {
    currentFolderNumber: scenarioNum,
    correctPackNumber: packMapping.pack,
    correctScenarioIndex: packMapping.index,
    needsRenumbering: true // Since folder numbers don't match pack structure
  };
  
  // Update workflow status based on file existence
  const allFilesExist = Object.values(metadata.files).every(f => f.exists);
  if (allFilesExist && metadata.workflow.status === 'pending') {
    metadata.workflow.status = 'generated';
    metadata.workflow.generatedDate = new Date().toISOString();
  }
  
  // Save updated metadata
  await fs.writeFile(infoPath, JSON.stringify(metadata, null, 2));
  
  return metadata;
}

// Generate audio reorganization script
async function generateReorganizationPlan() {
  const plan = {
    timestamp: new Date().toISOString(),
    totalFolders: 0,
    mappings: [],
    commands: []
  };
  
  // Read all scenario folders
  const folders = await fs.readdir(AUDIO_BASE_PATH);
  const scenarioFolders = folders.filter(f => f.match(/^scenario-\d+$/)).sort();
  
  for (const folder of scenarioFolders) {
    const scenarioNum = parseInt(folder.match(/scenario-(\d+)/)[1]);
    const mapping = getPackMapping(scenarioNum);
    
    const oldPath = `scenario-${String(scenarioNum).padStart(3, '0')}`;
    const newPath = `pack-${mapping.pack}/scenario-${String(mapping.index).padStart(3, '0')}`;
    
    plan.mappings.push({
      current: oldPath,
      target: newPath,
      scenarioNum,
      packId: mapping.pack,
      indexInPack: mapping.index
    });
    
    plan.commands.push(`mkdir -p pack-${mapping.pack} && mv ${oldPath} pack-${mapping.pack}/scenario-${String(mapping.index).padStart(3, '0')}`);
  }
  
  plan.totalFolders = scenarioFolders.length;
  
  // Save reorganization plan
  const planPath = path.join(__dirname, 'audio-reorganization-plan.json');
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
  console.log(`\nReorganization plan saved to: ${planPath}`);
  
  // Also create a shell script
  const scriptContent = `#!/bin/bash
# Audio Folder Reorganization Script
# Generated: ${new Date().toISOString()}
# This script reorganizes audio folders to match pack structure

cd "${AUDIO_BASE_PATH}"

echo "Reorganizing ${plan.totalFolders} audio folders..."

${plan.commands.join('\n')}

echo "Reorganization complete!"
`;
  
  const scriptPath = path.join(__dirname, 'reorganize-audio-folders.sh');
  await fs.writeFile(scriptPath, scriptContent);
  await fs.chmod(scriptPath, '755');
  console.log(`Shell script saved to: ${scriptPath}`);
  
  return plan;
}

// Main function
async function main() {
  console.log('Audio Folder Metadata Manager');
  console.log('============================\n');
  
  try {
    // Check if audio directory exists
    await fs.access(AUDIO_BASE_PATH);
  } catch (err) {
    console.error(`Audio directory not found: ${AUDIO_BASE_PATH}`);
    console.log('\nCreating example structure...');
    await fs.mkdir(AUDIO_BASE_PATH, { recursive: true });
  }
  
  // Get all folders
  const items = await fs.readdir(AUDIO_BASE_PATH);
  const scenarioFolders = items.filter(item => item.match(/^scenario-\d+$/));
  
  console.log(`Found ${scenarioFolders.length} scenario folders\n`);
  
  // Process each folder
  let processedCount = 0;
  for (const folder of scenarioFolders.sort()) {
    try {
      await processAudioFolder(folder);
      processedCount++;
    } catch (err) {
      console.error(`Error processing ${folder}: ${err.message}`);
    }
  }
  
  console.log(`\n✓ Processed ${processedCount} folders`);
  
  // Generate reorganization plan
  console.log('\nGenerating reorganization plan...');
  const plan = await generateReorganizationPlan();
  
  console.log('\nSummary:');
  console.log(`- Total folders to reorganize: ${plan.totalFolders}`);
  console.log(`- Folders will be organized into packs 000-006`);
  console.log(`- Run ./reorganize-audio-folders.sh to apply changes`);
  
  // Update production status
  try {
    const statusPath = path.join(__dirname, 'production-status.json');
    const status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
    status.teamUpdates.technician = `Added metadata to ${processedCount} audio folders`;
    status.lastUpdate = new Date().toISOString();
    await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
  } catch (err) {
    console.log('Could not update production status');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMetadataTemplate, processAudioFolder };