#!/usr/bin/env node

/**
 * Test Anthropic API Connection
 * Verifies API key and tests basic scenario generation
 */

// Load environment variables manually
const fs = require('fs');
const path = require('path');

// Load env file
const envPath = path.join(__dirname, 'env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
}

async function testAnthropicAPI() {
    console.log('🔧 Testing Anthropic API Connection\n');
    
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY not found in environment');
        console.log('💡 Make sure to set it in your .env file or export it');
        return;
    }
    
    console.log('✅ API Key found:', process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');
    
    try {
        console.log('\n📡 Testing API connection...');
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: 'Say "API test successful" and nothing else.'
                }]
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('❌ API Error:', response.status, error);
            return;
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data.content[0].text);
        
        // Test scenario generation format
        console.log('\n📝 Testing scenario generation...');
        
        const scenarioResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Generate a simple test scenario in this exact JSON format:
{
  "title": "Test Scenario",
  "content": "A brief scenario description",
  "claim": "The main claim being made",
  "correctAnswer": "logic",
  "type": "social_media"
}

Return ONLY the JSON, no explanation.`
                }]
            })
        });
        
        if (!scenarioResponse.ok) {
            const error = await scenarioResponse.text();
            console.error('❌ Scenario Generation Error:', error);
            return;
        }
        
        const scenarioData = await scenarioResponse.json();
        const scenarioText = scenarioData.content[0].text;
        
        console.log('\n📄 Raw response:', scenarioText);
        
        // Try to parse it
        try {
            const scenario = JSON.parse(scenarioText);
            console.log('\n✅ Successfully parsed scenario:', scenario);
        } catch (parseError) {
            console.error('\n❌ JSON parsing failed:', parseError.message);
            console.log('💡 This might be why the batch generator is failing');
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

// Run the test
testAnthropicAPI();