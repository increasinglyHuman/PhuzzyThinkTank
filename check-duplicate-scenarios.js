#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function checkDuplicates() {
    console.log('🔍 Checking for duplicate scenarios...\n');
    
    const allScenarios = [];
    const titleMap = new Map();
    const textMap = new Map();
    const duplicates = {
        byTitle: [],
        byText: [],
        byTitleAndText: []
    };
    
    // Load all scenario files
    const files = await fs.readdir(path.join(__dirname, 'data'));
    const scenarioFiles = files.filter(f => f.match(/^scenario-generated-\d{3}\.json$/)).sort();
    
    let globalIndex = 0;
    
    for (const file of scenarioFiles) {
        const filePath = path.join(__dirname, 'data', file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
        
        scenarios.forEach((scenario, localIndex) => {
            const id = globalIndex.toString().padStart(3, '0');
            const scenarioInfo = {
                id,
                file,
                localIndex,
                title: scenario.title,
                text: scenario.text || scenario.description || '',
                claim: scenario.claim || ''
            };
            
            allScenarios.push(scenarioInfo);
            
            // Track by title
            const titleKey = scenario.title?.toLowerCase().trim();
            if (titleKey) {
                if (!titleMap.has(titleKey)) {
                    titleMap.set(titleKey, []);
                }
                titleMap.get(titleKey).push(scenarioInfo);
            }
            
            // Track by text content (first 100 chars for comparison)
            const textKey = (scenario.text || scenario.description || '').substring(0, 100).toLowerCase().trim();
            if (textKey) {
                if (!textMap.has(textKey)) {
                    textMap.set(textKey, []);
                }
                textMap.get(textKey).push(scenarioInfo);
            }
            
            globalIndex++;
        });
    }
    
    // Find duplicates by title
    for (const [title, scenarios] of titleMap.entries()) {
        if (scenarios.length > 1) {
            duplicates.byTitle.push({
                title: scenarios[0].title,
                count: scenarios.length,
                scenarios: scenarios.map(s => ({
                    id: s.id,
                    file: s.file,
                    index: s.localIndex
                }))
            });
        }
    }
    
    // Find duplicates by text
    for (const [text, scenarios] of textMap.entries()) {
        if (scenarios.length > 1) {
            duplicates.byText.push({
                textPreview: text.substring(0, 50) + '...',
                count: scenarios.length,
                scenarios: scenarios.map(s => ({
                    id: s.id,
                    file: s.file,
                    title: s.title
                }))
            });
        }
    }
    
    // Report findings
    console.log('📊 Duplicate Analysis Report');
    console.log('===========================\n');
    
    console.log(`Total scenarios: ${allScenarios.length}`);
    console.log(`Unique titles: ${titleMap.size}`);
    console.log(`Duplicate titles found: ${duplicates.byTitle.length}\n`);
    
    if (duplicates.byTitle.length > 0) {
        console.log('🔄 Scenarios with duplicate titles:');
        duplicates.byTitle.forEach(dup => {
            console.log(`\n"${dup.title}" appears ${dup.count} times:`);
            dup.scenarios.forEach(s => {
                console.log(`  - scenario-${s.id} in ${s.file} [index: ${s.index}]`);
            });
        });
        console.log('');
    }
    
    if (duplicates.byText.length > 0) {
        console.log('📝 Scenarios with duplicate content:');
        duplicates.byText.slice(0, 5).forEach(dup => {
            console.log(`\nText starting with "${dup.textPreview}" appears ${dup.count} times:`);
            dup.scenarios.forEach(s => {
                console.log(`  - scenario-${s.id}: ${s.title}`);
            });
        });
        if (duplicates.byText.length > 5) {
            console.log(`\n... and ${duplicates.byText.length - 5} more duplicate texts`);
        }
    }
    
    // Look for specific known duplicates
    const neighborhoodWatch = allScenarios.filter(s => 
        s.title?.toLowerCase().includes('neighborhood watch') ||
        s.text?.toLowerCase().includes('neighborhood watch alert')
    );
    
    if (neighborhoodWatch.length > 0) {
        console.log('\n🚨 Neighborhood Watch scenarios found:');
        neighborhoodWatch.forEach(s => {
            console.log(`  - scenario-${s.id}: ${s.title} (in ${s.file})`);
        });
    }
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalScenarios: allScenarios.length,
            uniqueTitles: titleMap.size,
            duplicateTitles: duplicates.byTitle.length,
            duplicateTexts: duplicates.byText.length
        },
        duplicates,
        allScenarios: allScenarios.map(s => ({
            id: s.id,
            title: s.title,
            file: s.file
        }))
    };
    
    await fs.writeFile(
        path.join(__dirname, 'duplicate-scenarios-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Full report saved to: duplicate-scenarios-report.json');
    
    // Suggest fixes
    if (duplicates.byTitle.length > 0) {
        console.log('\n🛠️  Suggested fixes:');
        console.log('1. Remove duplicate entries from scenario files');
        console.log('2. Ensure scenario generation scripts check for existing titles');
        console.log('3. Consider adding unique IDs to prevent accidental duplicates');
    }
}

checkDuplicates().catch(console.error);