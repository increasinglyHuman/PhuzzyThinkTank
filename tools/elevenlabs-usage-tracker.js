#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const USAGE_LOG_FILE = path.join(__dirname, '../data/voices/usage-tracking.json');

async function fetchCurrentUsage() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.elevenlabs.io',
            path: '/v1/user/subscription',
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
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API returned status ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function loadUsageHistory() {
    try {
        const data = await fs.readFile(USAGE_LOG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Initialize if file doesn't exist
        return {
            history: [],
            sessions: []
        };
    }
}

async function saveUsageHistory(data) {
    await fs.writeFile(USAGE_LOG_FILE, JSON.stringify(data, null, 2));
}

async function main() {
    console.log('📊 ElevenLabs Real-Time Usage Tracker\n');
    
    try {
        // Fetch current usage
        const subscription = await fetchCurrentUsage();
        const timestamp = new Date().toISOString();
        
        // Load history
        const usageData = await loadUsageHistory();
        
        // Calculate session usage if we have previous data
        let sessionUsage = 0;
        let sessionCost = 0;
        
        if (usageData.history.length > 0) {
            const lastEntry = usageData.history[usageData.history.length - 1];
            sessionUsage = subscription.character_count - lastEntry.character_count;
            
            // Calculate cost (turbo mode: $0.15 per 1000 chars)
            sessionCost = (sessionUsage / 1000) * 0.15;
        }
        
        // Add current data point
        const dataPoint = {
            timestamp,
            character_count: subscription.character_count,
            character_limit: subscription.character_limit,
            tier: subscription.tier,
            percentage_used: ((subscription.character_count / subscription.character_limit) * 100).toFixed(1),
            reset_date: new Date(subscription.next_character_count_reset_unix * 1000).toISOString()
        };
        
        usageData.history.push(dataPoint);
        
        // Track session if there was usage
        if (sessionUsage > 0) {
            usageData.sessions.push({
                timestamp,
                characters_used: sessionUsage,
                cost_estimate: sessionCost,
                running_total: subscription.character_count
            });
        }
        
        // Save updated data
        await saveUsageHistory(usageData);
        
        // Display current status
        console.log('Current Usage:');
        console.log(`  Characters Used: ${subscription.character_count.toLocaleString()} / ${subscription.character_limit.toLocaleString()}`);
        console.log(`  Percentage: ${dataPoint.percentage_used}%`);
        console.log(`  Tier: ${subscription.tier}`);
        console.log(`  Resets: ${new Date(subscription.next_character_count_reset_unix * 1000).toLocaleDateString()}`);
        
        if (sessionUsage > 0) {
            console.log(`\nThis Session:`);
            console.log(`  Characters: ${sessionUsage.toLocaleString()}`);
            console.log(`  Estimated Cost: $${sessionCost.toFixed(2)}`);
        }
        
        // Calculate monthly cost
        const monthlyCharacters = subscription.character_count;
        const monthlyCost = (monthlyCharacters / 1000) * 0.15;
        console.log(`\nMonth to Date:`);
        console.log(`  Total Cost: $${monthlyCost.toFixed(2)}`);
        
        // Warning if approaching limit
        if (dataPoint.percentage_used > 90) {
            console.log('\n⚠️  WARNING: Approaching character limit!');
        }
        
        console.log('\n✅ Usage data saved to:', USAGE_LOG_FILE);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run as script or module
if (require.main === module) {
    main();
}

module.exports = { fetchCurrentUsage, loadUsageHistory };