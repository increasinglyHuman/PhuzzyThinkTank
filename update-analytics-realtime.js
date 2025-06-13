#!/usr/bin/env node

// Real-time analytics updater for voice generation
const fs = require('fs').promises;
const path = require('path');

async function updateAnalytics() {
    const audioDir = path.join(__dirname, 'data/voices');
    
    // Read current victories if exists
    let victories = [];
    try {
        const victoriesData = await fs.readFile(path.join(audioDir, 'victories.json'), 'utf8');
        victories = JSON.parse(victoriesData);
    } catch (e) {}
    
    // Count scenarios and files
    const dirs = await fs.readdir(audioDir);
    const scenarioDirs = dirs.filter(d => d.match(/^scenario-\d{3}$/));
    
    // Build character voice usage from file timestamps
    const voiceUsage = {};
    const characterTimeline = [];
    
    for (const dir of scenarioDirs) {
        const scenarioPath = path.join(audioDir, dir);
        try {
            const files = await fs.readdir(scenarioPath);
            const contentFile = files.find(f => f === 'content.mp3');
            
            if (contentFile) {
                const stats = await fs.stat(path.join(scenarioPath, contentFile));
                const timestamp = new Date(stats.mtime);
                
                // Extract scenario number
                const scenarioNum = parseInt(dir.replace('scenario-', ''));
                
                characterTimeline.push({
                    scenario: scenarioNum,
                    timestamp: timestamp.toISOString(),
                    hour: timestamp.getHours() + ':' + (timestamp.getMinutes() < 30 ? '00' : '30')
                });
            }
        } catch (e) {}
    }
    
    // Sort by timestamp
    characterTimeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Group by half-hour for timeline
    const hourlyGroups = {};
    characterTimeline.forEach(item => {
        if (!hourlyGroups[item.hour]) {
            hourlyGroups[item.hour] = { count: 0, scenarios: [] };
        }
        hourlyGroups[item.hour].count++;
        hourlyGroups[item.hour].scenarios.push(item.scenario);
    });
    
    // Calculate generation speeds
    const speeds = [];
    for (let i = 1; i < characterTimeline.length; i++) {
        const timeDiff = new Date(characterTimeline[i].timestamp) - new Date(characterTimeline[i-1].timestamp);
        const speed = timeDiff / 1000; // seconds per scenario
        speeds.push({
            scenario: characterTimeline[i].scenario,
            speed: speed,
            timestamp: characterTimeline[i].timestamp
        });
    }
    
    // Build real-time analytics
    const analytics = {
        summary: {
            totalScenarios: scenarioDirs.length,
            lastUpdated: new Date().toISOString()
        },
        timeline: characterTimeline,
        hourlyActivity: hourlyGroups,
        generationSpeeds: speeds,
        averageSpeed: speeds.length > 0 ? (speeds.reduce((a, b) => a + b.speed, 0) / speeds.length).toFixed(2) : 0,
        victoriesCount: victories.length
    };
    
    // Save real-time analytics
    await fs.writeFile(
        path.join(audioDir, 'realtime-analytics.json'),
        JSON.stringify(analytics, null, 2)
    );
    
    console.log(`Updated: ${scenarioDirs.length} scenarios, avg speed: ${analytics.averageSpeed}s`);
}

// Run update
updateAnalytics().catch(console.error);

// Auto-update every 10 seconds if called with --watch
if (process.argv.includes('--watch')) {
    setInterval(updateAnalytics, 10000);
}