#!/usr/bin/env node

/**
 * V3 Scenario Generator
 * Generates scenarios compliant with V3 specification
 * - Enforces 15 allowed fallacies only
 * - Creates rich indicator/trigger objects
 * - Generates audio-friendly scripts
 * - Includes proper hint structures
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { validateV3Scenario, ALLOWED_FALLACIES } = require('./v3-scenario-validator');

// Configuration
const CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229',
    maxTokens: 4000,
    temperature: 0.8,
    outputDir: path.join(__dirname, 'data/scenario-packs'),
    memoryLimit: 512 * 1024 * 1024 // 512MB limit
};

// Load the V3 specification
async function loadV3Spec() {
    try {
        const specPath = path.join(__dirname, 'data/ai-scenario-generation-spec-v3.md');
        return await fs.readFile(specPath, 'utf8');
    } catch (error) {
        console.error('Error loading V3 spec:', error);
        throw error;
    }
}

// Generate prompt for scenario creation
async function generatePrompt(theme, packContext = null) {
    const v3Spec = await loadV3Spec();
    
    const prompt = `You are an expert scenario writer for Phuzzy Think Tank. Create a scenario following the V3 specification EXACTLY.

CRITICAL REQUIREMENTS:
1. You MUST use ONLY these 15 logical fallacies:
   ${ALLOWED_FALLACIES.join(', ')}
   
2. If you think of a fallacy not in this list, map it to the closest allowed one.

3. Create engaging scenarios that are:
   - Fun and accessible for younger audiences
   - Free of profanity or inappropriate content
   - Balanced between educational and entertaining

4. Include rich indicator and trigger objects with appropriate icons.

5. Generate BOTH display content AND audio script versions.

${packContext ? `\nPACK CONTEXT:\n${packContext}\n` : ''}

THEME: ${theme}

Here is the complete V3 specification to follow:

${v3Spec}

Generate ONE complete scenario in valid JSON format. Ensure all fields are properly filled according to the V3 spec.`;

    return prompt;
}

// Make API request to Claude
async function callClaude(prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: CONFIG.model,
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: CONFIG.maxTokens,
            temperature: CONFIG.temperature
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CONFIG.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.content && response.content[0]) {
                        resolve(response.content[0].text);
                    } else {
                        reject(new Error('Invalid response from Claude'));
                    }
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

// Extract JSON from Claude's response
function extractJSON(text) {
    // Try to find JSON between code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find raw JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }
    
    throw new Error('No valid JSON found in response');
}

// Generate a single scenario
async function generateScenario(theme, packContext = null) {
    console.log(`🎯 Generating V3 scenario with theme: ${theme}`);
    
    try {
        // Generate prompt
        const prompt = await generatePrompt(theme, packContext);
        
        // Call Claude
        console.log('  📡 Calling Claude API...');
        const response = await callClaude(prompt);
        
        // Extract and parse scenario
        console.log('  📝 Parsing response...');
        const scenario = extractJSON(response);
        
        // Validate scenario
        console.log('  ✅ Validating scenario...');
        const validation = await validateV3Scenario(scenario);
        
        if (!validation.valid) {
            console.error('  ❌ Validation failed:', validation.errors);
            console.log('  🔧 Attempting to fix...');
            // Use the fixed version
            return validation.scenario;
        }
        
        if (validation.warnings.length > 0) {
            console.log('  ⚠️  Warnings:', validation.warnings);
        }
        
        console.log('  ✅ Scenario generated successfully!');
        return validation.scenario;
        
    } catch (error) {
        console.error('  ❌ Error generating scenario:', error.message);
        throw error;
    }
}

// Generate a batch of scenarios
async function generateBatch(themes, packInfo) {
    const scenarios = [];
    const errors = [];
    
    console.log(`\n🚀 Generating ${themes.length} V3 scenarios...\n`);
    
    for (let i = 0; i < themes.length; i++) {
        console.log(`\n[${i + 1}/${themes.length}] ${themes[i]}`);
        
        try {
            const scenario = await generateScenario(themes[i], packInfo.context);
            
            // Add pack-specific metadata
            scenario.id = `${packInfo.id}-${String(i).padStart(3, '0')}`;
            scenario.packId = packInfo.id;
            scenario.version = '3.0.0';
            
            scenarios.push(scenario);
            
            // Memory management - write incrementally
            if (scenarios.length % 5 === 0) {
                await saveIntermediateResults(packInfo.id, scenarios);
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`  ❌ Failed to generate scenario ${i + 1}:`, error.message);
            errors.push({ theme: themes[i], error: error.message });
        }
    }
    
    return { scenarios, errors };
}

// Save intermediate results (memory-efficient)
async function saveIntermediateResults(packId, scenarios) {
    const tempFile = path.join(CONFIG.outputDir, `${packId}-temp.json`);
    await fs.writeFile(tempFile, JSON.stringify({ scenarios }, null, 2));
    console.log(`  💾 Saved intermediate results (${scenarios.length} scenarios)`);
}

// Create a complete scenario pack
async function createScenarioPack(packInfo, themes) {
    console.log(`📦 Creating V3 Scenario Pack: ${packInfo.name}`);
    console.log(`📝 Description: ${packInfo.description}`);
    console.log(`🏷️  Tags: ${packInfo.tags.join(', ')}`);
    
    // Generate scenarios
    const { scenarios, errors } = await generateBatch(themes, packInfo);
    
    // Create pack structure
    const pack = {
        packInfo: {
            id: packInfo.id,
            name: packInfo.name,
            description: packInfo.description,
            version: '3.0.0',
            generatedDate: new Date().toISOString(),
            tags: packInfo.tags,
            scenarioCount: scenarios.length
        },
        scenarios,
        generationErrors: errors
    };
    
    // Save pack
    const outputPath = path.join(CONFIG.outputDir, `${packInfo.id}-v3.json`);
    await fs.writeFile(outputPath, JSON.stringify(pack, null, 2));
    
    console.log(`\n✅ Pack created successfully!`);
    console.log(`📄 Output: ${outputPath}`);
    console.log(`📊 Generated: ${scenarios.length}/${themes.length} scenarios`);
    
    if (errors.length > 0) {
        console.log(`⚠️  Errors: ${errors.length}`);
        errors.forEach(e => console.log(`   - ${e.theme}: ${e.error}`));
    }
    
    return pack;
}

// Example usage
async function main() {
    // Check for API key
    if (!CONFIG.apiKey) {
        console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
        process.exit(1);
    }
    
    // Example: Create a fun, kid-friendly pack
    const packInfo = {
        id: 'pack-007',
        name: 'Silly Science & Wacky Wisdom',
        description: 'Fun scenarios mixing silly science experiments with everyday wisdom',
        tags: ['fun', 'kid-friendly', 'science', 'humor', 'educational'],
        context: 'Create scenarios that are silly and fun but teach critical thinking. Use humor, animals, and relatable situations for kids.'
    };
    
    const themes = [
        'A hamster scientist claims their wheel-powered perpetual motion machine disproves thermodynamics',
        'Pizza delivery drones form a union demanding hazard pay for bird encounters',
        'A kindergarten class votes to replace math with "feelings about numbers"',
        'Talking houseplants argue that photosynthesis is just a social construct',
        'Time-traveling historians debate whether dinosaurs invented social media',
        'A smart refrigerator starts a cooking show but only knows how to keep things cold',
        'Alien tourists rate Earth poorly because gravity is "too clingy"',
        'A group of clouds sue the weather service for misrepresentation',
        'Telepathic goldfish claim they predicted every lottery number but forgot to tell anyone',
        'Robot teachers argue homework should be optional because they don\'t sleep'
    ];
    
    try {
        await createScenarioPack(packInfo, themes);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Export for use as module
module.exports = {
    generateScenario,
    generateBatch,
    createScenarioPack,
    CONFIG
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}