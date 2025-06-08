#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixDashboards() {
    console.log('Fixing dashboards to use real-time data...');
    
    // Read the advanced dashboard
    const dashboardPath = path.join(__dirname, 'voice-analytics-advanced.html');
    let dashboardContent = await fs.readFile(dashboardPath, 'utf8');
    
    // Replace mock data generation with real data loading
    dashboardContent = dashboardContent.replace(
        /generateMockPerformanceData\(\);[\s\S]*?generateMockAnalytics\(\)/m,
        `// Load real-time analytics
                const realtimeResponse = await fetch('data/audio-recording-voices-for-scenarios-from-elevenlabs/realtime-analytics.json');
                const realtimeData = await realtimeResponse.json();
                
                // Process timeline data for charts
                if (realtimeData.timeline && realtimeData.timeline.length > 0) {
                    // Update performance data from real timeline
                    performanceData.timestamps = realtimeData.timeline.map(t => new Date(t.timestamp).getTime());
                    performanceData.speeds = realtimeData.generationSpeeds.map(s => s.speed);
                    performanceData.apiCalls = realtimeData.timeline.length;
                    performanceData.totalCharacters = analyticsData.creditUsage?.totalCharacters || 0;
                }`
    );
    
    // Fix time ranges - use hours instead of days
    dashboardContent = dashboardContent.replace(
        /const days = \['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'\];/g,
        `const hours = Array.from({length: 24}, (_, i) => i + ':00');`
    );
    
    dashboardContent = dashboardContent.replace(
        /labels: days,/g,
        `labels: hours,`
    );
    
    // Fix generation speed chart to use real hourly data
    dashboardContent = dashboardContent.replace(
        /data: \[.*?\], \/\/ Mock data for generation speeds/g,
        `data: getHourlyGenerationCounts(realtimeData),`
    );
    
    // Add helper function to process hourly data
    const helperFunction = `
        // Helper to get hourly generation counts from real data
        function getHourlyGenerationCounts(realtimeData) {
            const hourlyCounts = new Array(24).fill(0);
            if (realtimeData.hourlyActivity) {
                Object.entries(realtimeData.hourlyActivity).forEach(([time, data]) => {
                    const hour = parseInt(time.split(':')[0]);
                    hourlyCounts[hour] = data.count;
                });
            }
            return hourlyCounts;
        }
        
        // Helper to get character usage from real data
        function getCharacterUsage(analyticsData) {
            const usage = {};
            if (analyticsData.nameGenderMap) {
                // This is old format - convert it
                Object.entries(analyticsData.charactersByGender || {}).forEach(([gender, names]) => {
                    names.forEach(name => {
                        usage[name] = (usage[name] || 0) + 1;
                    });
                });
            }
            return usage;
        }
    `;
    
    // Insert helper functions before chart initialization
    dashboardContent = dashboardContent.replace(
        '// Initialize charts',
        helperFunction + '\n\n// Initialize charts'
    );
    
    // Fix voice usage chart to use real character data
    dashboardContent = dashboardContent.replace(
        /labels: \['DrSarahChen', 'TechBro2023', 'ConcernedMom', 'LocalReporter', 'FitnessGuru'\],[\s\S]*?data: \[12, 8, 15, 6, 9\]/,
        `labels: Object.keys(getCharacterUsage(analyticsData)).slice(0, 10),
                        data: Object.values(getCharacterUsage(analyticsData)).slice(0, 10)`
    );
    
    // Write updated dashboard
    await fs.writeFile(dashboardPath, dashboardContent);
    console.log('✅ Updated advanced dashboard');
    
    // Also update the basic dashboard
    const basicDashboardPath = path.join(__dirname, 'voice-analytics-dashboard.html');
    let basicContent = await fs.readFile(basicDashboardPath, 'utf8');
    
    // Add real-time data loading
    basicContent = basicContent.replace(
        'async function loadAnalytics() {',
        `async function loadAnalytics() {
            // Also load real-time data
            try {
                const realtimeResponse = await fetch('data/audio-recording-voices-for-scenarios-from-elevenlabs/realtime-analytics.json');
                const realtimeData = await realtimeResponse.json();
                window.realtimeData = realtimeData;
            } catch (e) {
                console.log('No realtime data yet');
            }
            `
    );
    
    await fs.writeFile(basicDashboardPath, basicContent);
    console.log('✅ Updated basic dashboard');
    
    console.log('\n🎉 Dashboards updated to use real-time data!');
    console.log('Timeline will now show hourly activity instead of daily');
    console.log('Character usage will reflect actual voice assignments');
}

fixDashboards().catch(console.error);