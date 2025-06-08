#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;

// Common endpoints to try
const endpoints = [
    '/v1/user',
    '/v1/user/subscription',
    '/v1/user/usage',
    '/v1/usage',
    '/v1/subscription',
    '/v1/billing',
    '/v1/credits',
    '/v1/me',
    '/v1/account',
    '/v1/stats'
];

async function testEndpoint(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.elevenlabs.io',
            path: path,
            method: 'GET',
            headers: {
                'xi-api-key': API_KEY,
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n${path}: Status ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log('✅ SUCCESS! Response:', JSON.stringify(json, null, 2).substring(0, 500) + '...');
                    } catch (e) {
                        console.log('Response:', data.substring(0, 200));
                    }
                }
            });
        });

        req.on('error', (e) => {
            console.log(`${path}: Error - ${e.message}`);
        });

        req.end();
        
        // Resolve after a delay to avoid rate limiting
        setTimeout(resolve, 1000);
    });
}

async function main() {
    console.log('🔍 Exploring ElevenLabs API for usage endpoints...\n');
    
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
    
    console.log('\n✅ Done exploring!');
}

main();