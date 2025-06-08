#!/usr/bin/env node
/**
 * Generate Scenarios 18-20 with Aggressive Memory Management
 * Focus on whimsical animal-based critical thinking scenarios
 */

const fs = require('fs');
const path = require('path');

// Memory management helper
function cleanMemory() {
    if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection');
    }
}

// Monitor memory
function logMemory(label) {
    const usage = process.memoryUsage();
    const mb = (bytes) => Math.round(bytes / 1024 / 1024);
    console.log(`💾 ${label}: Heap ${mb(usage.heapUsed)}MB / ${mb(usage.heapTotal)}MB`);
}

// Generate one scenario at a time with immediate write
async function generateScenario(id, title, concept) {
    logMemory(`Before ${id}`);
    
    const scenario = {
        id: id,
        title: title,
        // Structure will be filled by AI
    };
    
    console.log(`\n🎯 Generating: ${id} - ${title}`);
    console.log(`💡 Concept: ${concept}`);
    
    // Write immediately to prevent memory buildup
    const filename = `scenario-${id.split('-')[0]}-${id.split('-')[1]}.json`;
    
    // Placeholder for now - will be replaced with actual scenario
    console.log(`📝 Would write to: ${filename}`);
    
    // Clean up memory after each scenario
    cleanMemory();
    logMemory(`After ${id}`);
    
    return filename;
}

// Main execution
async function main() {
    console.log('🚀 Starting Scenario Generation 18-20');
    console.log('🎨 Theme: Whimsical animal-based critical thinking\n');
    
    const scenarios = [
        {
            id: "18-octopus-multitasking",
            title: "The Eight-Armed Burnout",
            concept: "Octopus life coach promotes toxic multitasking using all 8 arms simultaneously, claims other sea creatures are 'single-tasking losers', ignores that each arm has own neural cluster"
        },
        {
            id: "19-hamster-wheel-economy",
            title: "Spinning to Success",
            concept: "Hamster economist claims running faster in wheel generates more pellets through 'wheel dynamics', sells courses on 'velocity wealth', ignores wheel goes nowhere"
        },
        {
            id: "20-peacock-authenticity",
            title: "Just Be Yourself (But Better)",
            concept: "Peacock influencer preaches radical authenticity while using tail extensions, feather dye, and filters, claims natural peacocks are 'limiting their potential'"
        }
    ];
    
    const generated = [];
    
    for (const spec of scenarios) {
        try {
            const filename = await generateScenario(spec.id, spec.title, spec.concept);
            generated.push(filename);
            
            // Pause between scenarios
            console.log('⏸️  Pausing for memory recovery...\n');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Failed to generate ${spec.id}: ${error.message}`);
        }
    }
    
    console.log('\n✅ Generation complete!');
    console.log(`📊 Generated ${generated.length} scenario templates`);
    logMemory('Final');
}

// Run with explicit gc flag
if (require.main === module) {
    console.log('💡 Tip: Run with --expose-gc for better memory management');
    console.log('   node --expose-gc generate-scenarios-18-20.js\n');
    
    main().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}