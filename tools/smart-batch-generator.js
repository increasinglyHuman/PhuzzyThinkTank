#!/usr/bin/env node
/**
 * Smart Batch Generator
 * Generates scenarios until quality targets are met
 * Automatically retries and improves until desired quality achieved
 */

const fs = require('fs');
const { ScenarioGenerator, BatchProcessor } = require('./ai-scenario-generator-v3.js');
const { QualityValidator } = require('./scenario-quality-validator.js');
const { ScenarioImprover } = require('./scenario-improver.js');

class SmartBatchGenerator {
    constructor() {
        this.validator = new QualityValidator();
        this.improver = new ScenarioImprover();
        this.maxRetries = 3;
        this.maxGenerations = 50; // Safety limit
    }

    async generateToTarget(options = {}) {
        const {
            targetCount = 10,
            minRating = 'GOOD',
            outputFile = './smart-batch-generated.json',
            themes = ['Digital Wellness', 'Health Optimization', 'Financial Independence', 'Remote Work Culture', 'Educational Technology'],
            platforms = ['social_media', 'email', 'blog', 'forum', 'academic']
        } = options;

        const targetScore = this.getRatingScore(minRating);
        
        console.log(`🎯 Smart Batch Generation Started`);
        console.log(`📊 Target: ${targetCount} scenarios rated ${minRating}+ (${targetScore}+ score)`);
        console.log(`📁 Output: ${outputFile}`);
        console.log(`🎨 Themes: ${themes.join(', ')}`);
        console.log(`📱 Platforms: ${platforms.join(', ')}`);

        const qualityScenarios = [];
        let totalGenerated = 0;
        let attempts = 0;

        // Create initial container
        const batchData = {
            metadata: {
                generated: new Date().toISOString(),
                targetCount: targetCount,
                minRating: minRating,
                targetScore: targetScore,
                version: "smart-v1.0.0"
            },
            scenarios: []
        };

        while (qualityScenarios.length < targetCount && totalGenerated < this.maxGenerations) {
            attempts++;
            console.log(`\n🚀 [Attempt ${attempts}] Generating scenarios...`);
            console.log(`📊 Progress: ${qualityScenarios.length}/${targetCount} quality scenarios`);

            // Generate batch of candidates
            const batchSize = Math.min(5, targetCount - qualityScenarios.length + 2);
            const candidates = await this.generateCandidateBatch(batchSize, themes, platforms);
            totalGenerated += candidates.length;

            // Validate all candidates
            console.log(`📋 Validating ${candidates.length} candidates...`);
            const validatedCandidates = candidates.map(scenario => ({
                scenario,
                validation: this.validator.validateScenario(scenario)
            }));

            // Sort by quality score
            validatedCandidates.sort((a, b) => b.validation.score - a.validation.score);

            // Process candidates
            for (const candidate of validatedCandidates) {
                const { scenario, validation } = candidate;
                
                if (validation.score >= targetScore) {
                    // Meets target quality
                    console.log(`✅ Quality target met: ${scenario.id} (${validation.score}/100 - ${validation.rating})`);
                    qualityScenarios.push(scenario);
                    
                    if (qualityScenarios.length >= targetCount) break;
                    
                } else if (validation.score >= targetScore - 15) {
                    // Close to target - try to improve
                    console.log(`🔧 Attempting improvement: ${scenario.id} (${validation.score}/100)`);
                    
                    try {
                        const improved = await this.improver.improveScenario(scenario, validation);
                        if (improved.validation.score >= targetScore) {
                            console.log(`✅ Improved to target: ${scenario.id} (${validation.score} → ${improved.validation.score})`);
                            qualityScenarios.push(improved.scenario);
                            
                            if (qualityScenarios.length >= targetCount) break;
                        } else {
                            console.log(`⚠️  Improvement insufficient: ${scenario.id} (${improved.validation.score}/100)`);
                        }
                    } catch (error) {
                        console.log(`❌ Improvement failed: ${scenario.id} - ${error.message}`);
                    }
                    
                } else {
                    console.log(`❌ Below threshold: ${scenario.id} (${validation.score}/100 - ${validation.rating})`);
                }

                // Save progress incrementally
                batchData.scenarios = qualityScenarios;
                batchData.metadata.currentCount = qualityScenarios.length;
                batchData.metadata.totalGenerated = totalGenerated;
                batchData.metadata.lastUpdated = new Date().toISOString();
                
                fs.writeFileSync(outputFile, JSON.stringify(batchData, null, 2));
            }

            console.log(`📊 Batch ${attempts} complete: ${qualityScenarios.length}/${targetCount} quality scenarios`);

            // Avoid infinite loops
            if (attempts >= 10) {
                console.log(`⚠️  Maximum attempts reached. Stopping with ${qualityScenarios.length} scenarios.`);
                break;
            }

            // Brief pause between batches
            if (qualityScenarios.length < targetCount) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Final validation and summary
        console.log(`\n📋 Final quality validation...`);
        const { summary } = this.validator.validateFile(outputFile);

        console.log(`\n🎉 Smart Batch Generation Complete!`);
        console.log(`📊 Final Results:`);
        console.log(`   Target achieved: ${qualityScenarios.length}/${targetCount} scenarios`);
        console.log(`   Success rate: ${Math.round((qualityScenarios.length / totalGenerated) * 100)}%`);
        console.log(`   Total generated: ${totalGenerated} scenarios`);
        console.log(`   Average quality: ${summary.averageScore}/100`);
        console.log(`   Rating distribution:`);
        console.log(`     ⭐ EXCELLENT: ${summary.excellent}`);
        console.log(`     ✅ GOOD: ${summary.good}`);
        console.log(`     🔶 ACCEPTABLE: ${summary.acceptable}`);
        console.log(`📁 Saved to: ${outputFile}`);

        return {
            generated: qualityScenarios.length,
            target: targetCount,
            totalAttempts: totalGenerated,
            averageScore: summary.averageScore,
            outputFile: outputFile
        };
    }

    async generateCandidateBatch(size, themes, platforms) {
        const candidates = [];
        
        for (let i = 0; i < size; i++) {
            try {
                // Random theme and platform selection
                const theme = themes[Math.floor(Math.random() * themes.length)];
                const platform = platforms[Math.floor(Math.random() * platforms.length)];
                
                console.log(`  [${i + 1}/${size}] Generating: ${theme} on ${platform}`);
                const scenario = await ScenarioGenerator.generateScenario(theme, platform);
                candidates.push(scenario);
                
                // Brief pause between generations
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Generation ${i + 1} failed: ${error.message}`);
            }
        }
        
        return candidates;
    }

    getRatingScore(rating) {
        const ratings = {
            'EXCELLENT': 90,
            'GOOD': 75,
            'ACCEPTABLE': 60,
            'NEEDS_IMPROVEMENT': 40
        };
        return ratings[rating] || 75;
    }

    async generateForPack(packNumber, options = {}) {
        const outputFile = options.outputFile || `./data/scenario-packs/pack-${String(packNumber).padStart(3, '0')}-generated.json`;
        
        console.log(`📦 Generating Pack ${packNumber}...`);
        
        const result = await this.generateToTarget({
            ...options,
            outputFile: outputFile,
            targetCount: options.targetCount || 10
        });

        return result;
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
🎯 Smart Batch Generator

Usage:
  node smart-batch-generator.js <command> [options]

Commands:
  generate --count 10 --rating GOOD --output pack-008.json
  pack 8 --count 10 --rating EXCELLENT
  
Options:
  --count <number>       Number of quality scenarios to generate (default: 10)
  --rating <RATING>      Minimum quality rating (EXCELLENT/GOOD/ACCEPTABLE, default: GOOD)
  --output <file>        Output file path (default: smart-batch-generated.json)
  --themes <theme1,theme2>  Comma-separated themes to use
  --platforms <p1,p2>    Comma-separated platforms to use

Examples:
  # Generate 10 GOOD quality scenarios
  node smart-batch-generator.js generate --count 10 --rating GOOD
  
  # Generate pack 8 with 15 EXCELLENT scenarios
  node smart-batch-generator.js pack 8 --count 15 --rating EXCELLENT
  
  # Generate with specific themes
  node smart-batch-generator.js generate --themes "Digital Wellness,Health Optimization"

Features:
- 🎯 Keeps generating until quality targets met
- 🔧 Auto-improves scenarios close to target
- 📊 Real-time progress tracking  
- 💾 Incremental saving (never lose progress)
- ⚡ Smart retry logic with safety limits
        `);
        process.exit(0);
    }

    // Parse options
    const options = {};
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--count') options.targetCount = parseInt(args[i + 1]);
        if (args[i] === '--rating') options.minRating = args[i + 1];
        if (args[i] === '--output') options.outputFile = args[i + 1];
        if (args[i] === '--themes') options.themes = args[i + 1].split(',');
        if (args[i] === '--platforms') options.platforms = args[i + 1].split(',');
    }

    const generator = new SmartBatchGenerator();

    if (command === 'generate') {
        generator.generateToTarget(options)
            .then(result => {
                console.log(`\n✨ Smart generation complete! ${result.generated}/${result.target} scenarios achieved.`);
            })
            .catch(error => {
                console.error(`\n💥 Smart generation failed: ${error.message}`);
                process.exit(1);
            });
            
    } else if (command === 'pack') {
        const packNumber = parseInt(args[1]);
        if (!packNumber) {
            console.error('❌ Pack number required. Example: node smart-batch-generator.js pack 8');
            process.exit(1);
        }
        
        generator.generateForPack(packNumber, options)
            .then(result => {
                console.log(`\n✨ Pack ${packNumber} generation complete! ${result.generated}/${result.target} scenarios.`);
            })
            .catch(error => {
                console.error(`\n💥 Pack generation failed: ${error.message}`);
                process.exit(1);
            });
            
    } else {
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
}

module.exports = { SmartBatchGenerator };