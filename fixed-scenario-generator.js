#!/usr/bin/env node

/**
 * Fixed Scenario Generator for Claude API
 * Handles the Anthropic Messages API format correctly
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, 'env');
if (require('fs').existsSync(envPath)) {
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
}

// Configuration
const CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000,
    temperature: 0.9
};

// Call Claude API using fetch (built into Node.js 18+)
async function callClaude(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CONFIG.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: CONFIG.model,
            max_tokens: CONFIG.maxTokens,
            temperature: CONFIG.temperature,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
    }

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
    } else {
        throw new Error('Invalid response structure from Claude');
    }
}

// Extract JSON from Claude's response
function extractJSON(text) {
    // Remove any markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
    }
    
    // Try to parse the whole response as JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try to find JSON object in the text
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
        }
    }
    
    throw new Error('No valid JSON found in response');
}

// Generate a scenario with the fixed API format
async function generateScenario(theme) {
    const prompt = `Generate a creative scenario for Phuzzy's Think Tank game based on this theme: "${theme}"

The scenario should teach critical thinking by presenting a flawed argument that contains logical fallacies.

Return ONLY a JSON object with this exact structure:
{
  "title": "Creative engaging title",
  "content": "Brief scenario description (2-3 sentences)",
  "audioScript": "Dialogue version of the scenario with character voices",
  "claim": "The main claim or argument being made",
  "correctAnswer": "logic" or "emotion" or "agenda" or "balanced",
  "type": "social_media" or "debate" or "news" or "educational",
  "answerWeights": {
    "emotion": 25,
    "logic": 40,
    "balanced": 30,
    "agenda": 5
  },
  "logicalFallacies": ["fallacy-name-1", "fallacy-name-2"],
  "triggerIndicators": ["indicator-1", "indicator-2"]
}

Make it fun, educational, and appropriate for all ages. Include diverse characters and viewpoints.`;

    console.log(`🎯 Generating scenario for: "${theme}"`);
    
    try {
        const response = await callClaude(prompt);
        const scenario = extractJSON(response);
        
        // Add generated timestamp
        scenario.generatedAt = new Date().toISOString();
        scenario.theme = theme;
        
        console.log(`✅ Generated: "${scenario.title}"`);
        return scenario;
        
    } catch (error) {
        console.error(`❌ Failed to generate scenario:`, error.message);
        throw error;
    }
}

// Generate multiple scenarios
async function generateBatch(themes) {
    const scenarios = [];
    const errors = [];
    
    console.log(`\n🚀 Generating ${themes.length} scenarios...\n`);
    
    for (let i = 0; i < themes.length; i++) {
        try {
            const scenario = await generateScenario(themes[i]);
            scenarios.push(scenario);
            
            // Rate limiting (3 requests per minute for free tier)
            if (i < themes.length - 1) {
                console.log('⏳ Waiting 20 seconds for rate limit...');
                await new Promise(resolve => setTimeout(resolve, 20000));
            }
        } catch (error) {
            errors.push({ theme: themes[i], error: error.message });
        }
    }
    
    return { scenarios, errors };
}

// Main function
async function main() {
    console.log('🎮 Fixed Scenario Generator for Phuzzy');
    console.log('=====================================\n');
    
    if (!CONFIG.apiKey) {
        console.error('❌ ANTHROPIC_API_KEY not found in env file');
        return;
    }
    
    // Test with a few themes
    const testThemes = [
        "A hamster scientist claims their wheel-powered perpetual motion machine disproves thermodynamics",
        "Pizza delivery drones form a union demanding hazard pay for bird encounters",
        "A kindergarten class votes to replace math with 'feelings about numbers'"
    ];
    
    const { scenarios, errors } = await generateBatch(testThemes);
    
    // Save results
    const output = {
        generatedAt: new Date().toISOString(),
        scenarioCount: scenarios.length,
        scenarios,
        errors
    };
    
    const outputPath = path.join(__dirname, 'generated-scenarios-fixed.json');
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Generation complete!`);
    console.log(`📊 Generated: ${scenarios.length}/${testThemes.length} scenarios`);
    if (errors.length > 0) {
        console.log(`❌ Errors: ${errors.length}`);
        errors.forEach(e => console.log(`   - ${e.theme}: ${e.error}`));
    }
    console.log(`📄 Output saved to: ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateScenario, generateBatch };