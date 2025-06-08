#!/usr/bin/env node

/**
 * Scenario V3 Compliance Auditor
 * Checks all existing scenarios for:
 * 1. Profanity and inappropriate content
 * 2. Dialogue formatting issues
 * 3. Audio-unfriendly patterns
 * 4. Missing dual-script format
 */

const fs = require('fs').promises;
const path = require('path');

// Profanity list (from voice generator)
const PROFANITY_LIST = [
  'shit', 'fuck', 'damn', 'ass', 'bitch', 'hell', 'crap', 'bastard',
  'piss', 'dick', 'cock', 'pussy', 'fag', 'slut', 'whore'
];

// Audio-unfriendly patterns
const AUDIO_ISSUES = {
  percentages: /\d+%/g,
  dollarAmounts: /\$[\d,]+(\.\d{2})?[bmk]?/gi,
  hashtags: /#\w+/g,
  atMentions: /@\w+/g,
  urls: /https?:\/\/[^\s]+|www\.[^\s]+/g,
  mathSymbols: /[≈≠!=<>≤≥∞√π∑∏∀∃∈∉⊂∪∩∧∨¬→↔≡]/g,
  asteriskActions: /\*[^*]+\*/g,
  allCaps: /\b[A-Z]{4,}\b/g, // Words with 4+ caps (except common acronyms)
  numberRanges: /\d+-\d+/g,
  complexNumbers: /\d{1,3}(,\d{3})+/g
};

// Dialogue detection patterns
const DIALOGUE_PATTERNS = [
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+(?:\s+[A-Z]+)*):\s*(.+)$/gm,
  /^u\/(\w+):\s*(.+)$/gm,
  /posted\s+(?:on|in)\s+(?:LinkedIn|Facebook|Twitter|Instagram|NextDoor)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?):/gm
];

// Audit results structure
const auditResults = {
  timestamp: new Date().toISOString(),
  totalScenarios: 0,
  issues: {
    profanity: [],
    dialogueFormatting: [],
    audioUnfriendly: [],
    missingDualScript: [],
    missingAudioHints: []
  },
  statistics: {
    scenariosWithProfanity: 0,
    scenariosWithDialogue: 0,
    scenariosNeedingAudioScript: 0,
    scenariosFullyCompliant: 0
  },
  recommendations: []
};

// Check for profanity
function checkProfanity(scenario) {
  const issues = [];
  const textToCheck = [
    scenario.content || scenario.text || scenario.description || '',
    scenario.claim || '',
    scenario.title || ''
  ].join(' ').toLowerCase();
  
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textToCheck.match(regex);
    if (matches) {
      issues.push({
        word,
        count: matches.length,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// Check dialogue formatting
function checkDialogueFormatting(scenario) {
  const issues = [];
  const content = scenario.content || scenario.text || scenario.description || '';
  
  // Check if scenario has dialogue
  let hasDialogue = false;
  let dialogueCount = 0;
  let characters = new Set();
  
  for (const pattern of DIALOGUE_PATTERNS) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      hasDialogue = true;
      dialogueCount += matches.length;
      matches.forEach(match => {
        characters.add(match[1]);
      });
    }
  }
  
  if (hasDialogue) {
    // Check for inconsistent character names
    const characterArray = Array.from(characters);
    for (let i = 0; i < characterArray.length; i++) {
      for (let j = i + 1; j < characterArray.length; j++) {
        if (characterArray[i].toLowerCase().includes(characterArray[j].toLowerCase()) ||
            characterArray[j].toLowerCase().includes(characterArray[i].toLowerCase())) {
          issues.push({
            type: 'inconsistent_names',
            characters: [characterArray[i], characterArray[j]],
            severity: 'medium'
          });
        }
      }
    }
    
    // Check for missing colons or malformed dialogue
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+["""]/) && !line.includes(':')) {
        issues.push({
          type: 'missing_colon',
          line: line.substring(0, 50) + '...',
          severity: 'high'
        });
      }
    }
  }
  
  return {
    hasDialogue,
    dialogueCount,
    characterCount: characters.size,
    characters: Array.from(characters),
    issues
  };
}

// Check for audio-unfriendly patterns
function checkAudioPatterns(scenario) {
  const issues = [];
  const content = scenario.content || scenario.text || scenario.description || '';
  
  for (const [patternName, regex] of Object.entries(AUDIO_ISSUES)) {
    const matches = content.match(regex);
    if (matches) {
      issues.push({
        pattern: patternName,
        count: matches.length,
        examples: matches.slice(0, 3),
        severity: patternName === 'profanity' ? 'high' : 'medium'
      });
    }
  }
  
  return issues;
}

// Check V3 compliance
function checkV3Compliance(scenario) {
  const compliance = {
    hasDualScript: !!(scenario.content && scenario.audioScript),
    hasAudioHints: !!scenario.audioHints,
    hasCharacterVoices: !!(scenario.audioHints && scenario.audioHints.characterVoices),
    hasPerformanceDirectives: false
  };
  
  // Check for performance directives in audioScript
  if (scenario.audioScript) {
    const performanceDirectives = /\[(excited|whispered|sarcastic|thoughtful|dramatic pause|laughs|sighs|gasps)\]/g;
    compliance.hasPerformanceDirectives = performanceDirectives.test(scenario.audioScript);
  }
  
  compliance.isFullyCompliant = Object.values(compliance).every(v => v === true);
  
  return compliance;
}

// Generate migration recommendations
function generateRecommendations(scenario, profanityIssues, dialogueInfo, audioIssues, v3Compliance) {
  const recommendations = [];
  
  if (profanityIssues.length > 0) {
    recommendations.push({
      priority: 'critical',
      action: 'remove_profanity',
      details: `Remove ${profanityIssues.length} profane words`,
      automated: true
    });
  }
  
  if (dialogueInfo.hasDialogue && dialogueInfo.issues.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'fix_dialogue_formatting',
      details: `Fix ${dialogueInfo.issues.length} dialogue formatting issues`,
      automated: true
    });
  }
  
  if (audioIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      action: 'create_audio_script',
      details: `Convert ${audioIssues.length} audio-unfriendly patterns`,
      automated: true
    });
  }
  
  if (!v3Compliance.hasDualScript) {
    recommendations.push({
      priority: 'high',
      action: 'generate_dual_script',
      details: 'Generate audioScript from content',
      automated: true
    });
  }
  
  if (dialogueInfo.hasDialogue && !v3Compliance.hasCharacterVoices) {
    recommendations.push({
      priority: 'medium',
      action: 'add_character_voices',
      details: `Define voices for ${dialogueInfo.characterCount} characters`,
      automated: false
    });
  }
  
  // Determine if re-recording is needed
  const needsReRecording = profanityIssues.length > 0 || 
                          (dialogueInfo.hasDialogue && dialogueInfo.issues.length > 0) ||
                          audioIssues.some(issue => issue.severity === 'high');
  
  if (needsReRecording) {
    recommendations.push({
      priority: 'high',
      action: 're_record_audio',
      details: 'Scenario changes require new audio recording',
      automated: false
    });
  }
  
  return recommendations;
}

// Process a single scenario
async function auditScenario(scenario, packId, index) {
  const scenarioId = scenario.id || `${packId}-${index}`;
  
  // Run all checks
  const profanityIssues = checkProfanity(scenario);
  const dialogueInfo = checkDialogueFormatting(scenario);
  const audioIssues = checkAudioPatterns(scenario);
  const v3Compliance = checkV3Compliance(scenario);
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    scenario,
    profanityIssues,
    dialogueInfo,
    audioIssues,
    v3Compliance
  );
  
  // Create audit record
  const auditRecord = {
    scenarioId,
    title: scenario.title,
    packId,
    profanityIssues,
    dialogueInfo,
    audioIssues,
    v3Compliance,
    recommendations,
    severity: recommendations.length > 0 ? 
      (recommendations.some(r => r.priority === 'critical') ? 'critical' :
       recommendations.some(r => r.priority === 'high') ? 'high' : 'medium') : 'none'
  };
  
  // Update statistics
  if (profanityIssues.length > 0) {
    auditResults.statistics.scenariosWithProfanity++;
    auditResults.issues.profanity.push({ scenarioId, issues: profanityIssues });
  }
  
  if (dialogueInfo.hasDialogue) {
    auditResults.statistics.scenariosWithDialogue++;
    if (dialogueInfo.issues.length > 0) {
      auditResults.issues.dialogueFormatting.push({ scenarioId, issues: dialogueInfo.issues });
    }
  }
  
  if (audioIssues.length > 0) {
    auditResults.statistics.scenariosNeedingAudioScript++;
    auditResults.issues.audioUnfriendly.push({ scenarioId, issues: audioIssues });
  }
  
  if (!v3Compliance.hasDualScript) {
    auditResults.issues.missingDualScript.push(scenarioId);
  }
  
  if (!v3Compliance.hasAudioHints && dialogueInfo.hasDialogue) {
    auditResults.issues.missingAudioHints.push(scenarioId);
  }
  
  if (v3Compliance.isFullyCompliant && profanityIssues.length === 0 && 
      audioIssues.length === 0 && dialogueInfo.issues.length === 0) {
    auditResults.statistics.scenariosFullyCompliant++;
  }
  
  return auditRecord;
}

// Process all scenario packs
async function auditAllScenarios() {
  const packDir = path.join(__dirname, 'data', 'scenario-packs');
  const detailedAudit = [];
  
  try {
    const files = await fs.readdir(packDir);
    const packFiles = files.filter(f => f.startsWith('scenario-generated-') && f.endsWith('.json'));
    
    for (const file of packFiles.sort()) {
      const packId = file.match(/scenario-generated-(\d+)\.json/)[1];
      console.log(`Auditing pack ${packId}...`);
      
      const packData = JSON.parse(await fs.readFile(path.join(packDir, file), 'utf8'));
      
      for (let i = 0; i < packData.scenarios.length; i++) {
        const scenario = packData.scenarios[i];
        const auditRecord = await auditScenario(scenario, packId, i);
        detailedAudit.push(auditRecord);
        auditResults.totalScenarios++;
      }
    }
    
    // Sort detailed audit by severity
    detailedAudit.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, none: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    // Generate summary recommendations
    const criticalCount = detailedAudit.filter(a => a.severity === 'critical').length;
    const highCount = detailedAudit.filter(a => a.severity === 'high').length;
    
    if (criticalCount > 0) {
      auditResults.recommendations.push(
        `CRITICAL: ${criticalCount} scenarios contain profanity and must be cleaned before use`
      );
    }
    
    if (highCount > 0) {
      auditResults.recommendations.push(
        `HIGH: ${highCount} scenarios need dialogue formatting or audio script generation`
      );
    }
    
    auditResults.recommendations.push(
      `${auditResults.statistics.scenariosFullyCompliant}/${auditResults.totalScenarios} scenarios are fully V3 compliant`
    );
    
    // Save audit results
    await fs.writeFile(
      path.join(__dirname, 'scenario-audit-results.json'),
      JSON.stringify(auditResults, null, 2)
    );
    
    // Save detailed audit
    await fs.writeFile(
      path.join(__dirname, 'scenario-audit-detailed.json'),
      JSON.stringify(detailedAudit, null, 2)
    );
    
    // Generate re-recording priority list
    const reRecordingList = detailedAudit
      .filter(a => a.recommendations.some(r => r.action === 're_record_audio'))
      .map(a => ({
        scenarioId: a.scenarioId,
        title: a.title,
        packId: a.packId,
        reasons: a.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
          .map(r => r.details)
      }));
    
    await fs.writeFile(
      path.join(__dirname, 're-recording-priority-list.json'),
      JSON.stringify(reRecordingList, null, 2)
    );
    
    return { auditResults, detailedAudit, reRecordingList };
    
  } catch (error) {
    console.error('Error during audit:', error);
    throw error;
  }
}

// Generate human-readable report
function generateReport(auditResults, detailedAudit, reRecordingList) {
  let report = `# Scenario V3 Compliance Audit Report
Generated: ${auditResults.timestamp}

## Summary
- Total Scenarios Audited: ${auditResults.totalScenarios}
- Fully V3 Compliant: ${auditResults.statistics.scenariosFullyCompliant} (${Math.round(auditResults.statistics.scenariosFullyCompliant / auditResults.totalScenarios * 100)}%)
- Scenarios with Profanity: ${auditResults.statistics.scenariosWithProfanity}
- Scenarios with Dialogue: ${auditResults.statistics.scenariosWithDialogue}
- Scenarios Needing Audio Script: ${auditResults.statistics.scenariosNeedingAudioScript}

## Critical Issues
`;

  // Add profanity issues
  if (auditResults.issues.profanity.length > 0) {
    report += `\n### Scenarios with Profanity (${auditResults.issues.profanity.length})\n`;
    for (const issue of auditResults.issues.profanity) {
      report += `- ${issue.scenarioId}: ${issue.issues.map(i => i.word).join(', ')}\n`;
    }
  }
  
  // Add dialogue formatting issues
  if (auditResults.issues.dialogueFormatting.length > 0) {
    report += `\n### Dialogue Formatting Issues (${auditResults.issues.dialogueFormatting.length})\n`;
    for (const issue of auditResults.issues.dialogueFormatting.slice(0, 10)) {
      report += `- ${issue.scenarioId}: ${issue.issues.map(i => i.type).join(', ')}\n`;
    }
    if (auditResults.issues.dialogueFormatting.length > 10) {
      report += `... and ${auditResults.issues.dialogueFormatting.length - 10} more\n`;
    }
  }
  
  // Add re-recording priorities
  if (reRecordingList.length > 0) {
    report += `\n## Re-Recording Priority List (${reRecordingList.length} scenarios)\n`;
    for (const item of reRecordingList.slice(0, 10)) {
      report += `\n### ${item.scenarioId}: ${item.title}\n`;
      report += `Pack: ${item.packId}\n`;
      report += `Reasons:\n`;
      for (const reason of item.reasons) {
        report += `- ${reason}\n`;
      }
    }
    if (reRecordingList.length > 10) {
      report += `\n... and ${reRecordingList.length - 10} more scenarios need re-recording\n`;
    }
  }
  
  report += `\n## Recommendations\n`;
  for (const rec of auditResults.recommendations) {
    report += `- ${rec}\n`;
  }
  
  report += `\n## Next Steps
1. Run the V3 migration tool to automatically fix formatting issues
2. Review and approve automated fixes
3. Re-generate audio for affected scenarios
4. Update metadata in audio folders
`;
  
  return report;
}

// Main function
async function main() {
  console.log('Scenario V3 Compliance Auditor');
  console.log('==============================\n');
  
  try {
    console.log('Starting comprehensive audit...\n');
    
    const { auditResults, detailedAudit, reRecordingList } = await auditAllScenarios();
    
    // Generate and save report
    const report = generateReport(auditResults, detailedAudit, reRecordingList);
    await fs.writeFile(
      path.join(__dirname, 'scenario-audit-report.md'),
      report
    );
    
    console.log('\n✓ Audit Complete!');
    console.log(`\nResults saved to:`);
    console.log(`- scenario-audit-results.json (summary)`);
    console.log(`- scenario-audit-detailed.json (full details)`);
    console.log(`- scenario-audit-report.md (human-readable)`);
    console.log(`- re-recording-priority-list.json (audio tasks)`);
    
    // Display summary
    console.log('\nSummary:');
    console.log(`- ${auditResults.statistics.scenariosWithProfanity} scenarios contain profanity`);
    console.log(`- ${auditResults.issues.dialogueFormatting.length} scenarios have dialogue formatting issues`);
    console.log(`- ${auditResults.issues.missingDualScript.length} scenarios need audio scripts`);
    console.log(`- ${reRecordingList.length} scenarios need re-recording`);
    
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { auditScenario, checkProfanity, checkDialogueFormatting };