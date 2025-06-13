#!/usr/bin/env node
/**
 * Pack Audio Compatibility Analyzer
 * Analyzes scenario packs for audio structure and compatibility
 */

const fs = require('fs');
const path = require('path');

class PackAudioAnalyzer {
    analyzePackStructure(filePath) {
        console.log(`🔍 Analyzing: ${filePath}`);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const scenarios = data.scenarios || [data];
        
        const analysis = {
            filePath: filePath,
            totalScenarios: scenarios.length,
            audioCompatible: 0,
            audioFields: {
                audioScript: 0,
                audioHints: 0,
                characterVoices: 0
            },
            dataStructure: {
                hasContent: 0,
                hasText: 0,
                oldReviewKeywords: 0,  // nested objects
                newReviewKeywords: 0   // direct arrays
            },
            idPattern: null,
            sampleIds: scenarios.slice(0, 3).map(s => s.id),
            audioNamingCompatible: true
        };

        scenarios.forEach((scenario, index) => {
            // Check audio fields
            if (scenario.audioScript) analysis.audioFields.audioScript++;
            if (scenario.audioHints) analysis.audioFields.audioHints++;
            if (scenario.audioHints?.characterVoices) analysis.audioFields.characterVoices++;
            
            // Check data structure
            if (scenario.content) analysis.dataStructure.hasContent++;
            if (scenario.text) analysis.dataStructure.hasText++;
            
            // Check reviewKeywords format
            if (scenario.reviewKeywords) {
                const logic = scenario.reviewKeywords.logic;
                if (Array.isArray(logic)) {
                    analysis.dataStructure.newReviewKeywords++;
                } else if (logic && typeof logic === 'object' && logic.keywords) {
                    analysis.dataStructure.oldReviewKeywords++;
                }
            }
            
            // Audio compatibility check
            if (scenario.audioScript || scenario.audioHints) {
                analysis.audioCompatible++;
            }
        });

        // Determine ID pattern
        if (scenarios.length > 0) {
            const firstId = scenarios[0].id;
            if (firstId.includes('enhanced-scenarios')) {
                analysis.idPattern = 'enhanced-scenarios-XXX-YYY';
            } else if (firstId.includes('-001') || firstId.includes('-002')) {
                analysis.idPattern = 'descriptive-name-XXX';
            } else {
                analysis.idPattern = 'unknown';
            }
        }

        return analysis;
    }

    generateAudioCompatibilityReport(packFiles) {
        console.log(`\n🎵 Audio Compatibility Analysis Report`);
        console.log(`=======================================\n`);
        
        const allAnalyses = packFiles.map(file => this.analyzePackStructure(file));
        
        console.log(`📊 Summary Across ${allAnalyses.length} Packs:`);
        
        const totals = allAnalyses.reduce((acc, analysis) => {
            acc.totalScenarios += analysis.totalScenarios;
            acc.audioCompatible += analysis.audioCompatible;
            acc.audioScript += analysis.audioFields.audioScript;
            acc.audioHints += analysis.audioFields.audioHints;
            acc.oldKeywords += analysis.dataStructure.oldReviewKeywords;
            acc.newKeywords += analysis.dataStructure.newReviewKeywords;
            return acc;
        }, {
            totalScenarios: 0,
            audioCompatible: 0,
            audioScript: 0,
            audioHints: 0,
            oldKeywords: 0,
            newKeywords: 0
        });

        console.log(`  Total scenarios: ${totals.totalScenarios}`);
        console.log(`  Audio-ready: ${totals.audioCompatible} (${Math.round((totals.audioCompatible/totals.totalScenarios)*100)}%)`);
        console.log(`  With audioScript: ${totals.audioScript}`);
        console.log(`  With audioHints: ${totals.audioHints}`);
        console.log(`  Old reviewKeywords format: ${totals.oldKeywords}`);
        console.log(`  New reviewKeywords format: ${totals.newKeywords}`);

        console.log(`\n📋 Individual Pack Analysis:`);
        allAnalyses.forEach(analysis => {
            const fileName = path.basename(analysis.filePath);
            const audioReady = analysis.audioCompatible > 0;
            const keywordFormat = analysis.dataStructure.oldReviewKeywords > 0 ? 'OLD' : 'NEW';
            
            console.log(`\n📦 ${fileName}:`);
            console.log(`  🎬 Audio ready: ${audioReady ? '✅' : '❌'} (${analysis.audioCompatible}/${analysis.totalScenarios})`);
            console.log(`  📝 Keyword format: ${keywordFormat}`);
            console.log(`  🏷️  ID pattern: ${analysis.idPattern}`);
            console.log(`  📄 Data field: ${analysis.dataStructure.hasText ? 'text' : 'content'}`);
            console.log(`  🎤 Audio fields: script=${analysis.audioFields.audioScript}, hints=${analysis.audioFields.audioHints}`);
            console.log(`  🆔 Sample IDs: ${analysis.sampleIds.join(', ')}`);
        });

        console.log(`\n🔧 Upgrade Recommendations:`);
        
        const needsUpgrade = allAnalyses.filter(a => 
            a.dataStructure.oldReviewKeywords > 0 || a.audioCompatible === 0
        );

        if (needsUpgrade.length === 0) {
            console.log(`✅ All packs are fully compatible!`);
        } else {
            console.log(`⚠️  ${needsUpgrade.length} packs need upgrades:`);
            
            needsUpgrade.forEach(analysis => {
                const fileName = path.basename(analysis.filePath);
                const issues = [];
                
                if (analysis.dataStructure.oldReviewKeywords > 0) {
                    issues.push('reviewKeywords format (timeline incompatible)');
                }
                if (analysis.audioCompatible === 0) {
                    issues.push('missing audio fields');
                }
                
                console.log(`  📦 ${fileName}: ${issues.join(', ')}`);
            });
        }

        console.log(`\n🎵 Audio File Preservation Strategy:`);
        console.log(`  ✅ Scenarios with audioScript can preserve existing audio files`);
        console.log(`  ✅ ID-based audio naming means no regeneration needed if IDs preserved`);
        console.log(`  ⚠️  Timeline compatibility requires reviewKeywords format fix`);
        console.log(`  💡 Recommendation: Upgrade data format, preserve audio content`);

        return {
            summary: totals,
            analyses: allAnalyses,
            needsUpgrade: needsUpgrade,
            audioPreservable: totals.audioScript > 0
        };
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🔍 Pack Audio Compatibility Analyzer

Usage:
  node pack-audio-analyzer.js <pack-file1> [pack-file2] ...
  node pack-audio-analyzer.js data/scenario-packs/scenario-generated-*.json

Examples:
  node pack-audio-analyzer.js data/scenario-packs/scenario-generated-005.json
  node pack-audio-analyzer.js data/scenario-packs/scenario-generated-00*.json
  
Analyzes:
- Audio field compatibility (audioScript, audioHints)
- ReviewKeywords format (timeline compatibility)
- ID patterns for audio file naming
- Upgrade requirements and preservation strategy
        `);
        process.exit(0);
    }

    try {
        const analyzer = new PackAudioAnalyzer();
        const report = analyzer.generateAudioCompatibilityReport(args);
        
        console.log(`\n📄 Analysis complete. Audio preservation: ${report.audioPreservable ? 'POSSIBLE' : 'NOT POSSIBLE'}`);
        
    } catch (error) {
        console.error(`❌ Analysis failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { PackAudioAnalyzer };