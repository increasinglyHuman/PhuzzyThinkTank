#!/usr/bin/env node

/**
 * Scenario Learning Pipeline
 * Processes approval feedback to improve future scenario generation
 * Tracks patterns in rejections and revisions to enhance quality
 */

const fs = require('fs').promises;
const path = require('path');

// Learning categories
const LEARNING_CATEGORIES = {
    CONTENT: 'content_issues',
    AUDIO: 'audio_compatibility',
    HUMOR: 'humor_appropriateness', 
    EDUCATION: 'educational_value',
    DIALOGUE: 'dialogue_quality',
    COMPLEXITY: 'complexity_balance',
    TECHNICAL: 'technical_issues'
};

// Pattern recognition for feedback
const FEEDBACK_PATTERNS = {
    // Content issues
    'too mature': LEARNING_CATEGORIES.CONTENT,
    'inappropriate': LEARNING_CATEGORIES.CONTENT,
    'not family friendly': LEARNING_CATEGORIES.CONTENT,
    'too dark': LEARNING_CATEGORIES.CONTENT,
    
    // Audio issues
    'hard to pronounce': LEARNING_CATEGORIES.AUDIO,
    'audio sounds weird': LEARNING_CATEGORIES.AUDIO,
    'voices too similar': LEARNING_CATEGORIES.AUDIO,
    'performance directive': LEARNING_CATEGORIES.AUDIO,
    
    // Humor issues
    'not funny': LEARNING_CATEGORIES.HUMOR,
    'trying too hard': LEARNING_CATEGORIES.HUMOR,
    'humor missed': LEARNING_CATEGORIES.HUMOR,
    'too silly': LEARNING_CATEGORIES.HUMOR,
    'not silly enough': LEARNING_CATEGORIES.HUMOR,
    
    // Educational issues
    'no clear lesson': LEARNING_CATEGORIES.EDUCATION,
    'fallacy unclear': LEARNING_CATEGORIES.EDUCATION,
    'too obvious': LEARNING_CATEGORIES.EDUCATION,
    'too subtle': LEARNING_CATEGORIES.EDUCATION,
    
    // Dialogue issues
    'dialogue confusing': LEARNING_CATEGORIES.DIALOGUE,
    'too many characters': LEARNING_CATEGORIES.DIALOGUE,
    'character names': LEARNING_CATEGORIES.DIALOGUE,
    'voices not distinct': LEARNING_CATEGORIES.DIALOGUE,
    
    // Complexity issues
    'too complex': LEARNING_CATEGORIES.COMPLEXITY,
    'too simple': LEARNING_CATEGORIES.COMPLEXITY,
    'hard to follow': LEARNING_CATEGORIES.COMPLEXITY,
    
    // Technical issues
    'formatting': LEARNING_CATEGORIES.TECHNICAL,
    'missing field': LEARNING_CATEGORIES.TECHNICAL,
    'data error': LEARNING_CATEGORIES.TECHNICAL
};

// Process approval export file
async function processApprovalData(approvalFile) {
    try {
        const data = JSON.parse(await fs.readFile(approvalFile, 'utf8'));
        
        const learningReport = {
            processedDate: new Date().toISOString(),
            sourceFile: approvalFile,
            totalScenarios: data.summary.total,
            approvalRate: (data.summary.approved / data.summary.total * 100).toFixed(1) + '%',
            
            patterns: {
                commonIssues: {},
                categoryBreakdown: {},
                improvementSuggestions: []
            },
            
            specificExamples: {
                rejected: [],
                revised: [],
                approved: []
            },
            
            generationGuidelines: []
        };
        
        // Analyze feedback patterns
        const feedbackAnalysis = analyzeFeedbackPatterns(data.learningNotes);
        learningReport.patterns = feedbackAnalysis;
        
        // Collect specific examples
        for (const note of data.learningNotes) {
            const example = {
                scenarioId: note.scenarioId,
                title: note.title,
                feedback: note.feedback,
                category: categorizeFeeback(note.feedback)
            };
            
            if (note.status === 'rejected') {
                learningReport.specificExamples.rejected.push(example);
            } else if (note.status === 'revision') {
                learningReport.specificExamples.revised.push(example);
            }
        }
        
        // Generate improvement guidelines
        learningReport.generationGuidelines = generateGuidelines(feedbackAnalysis);
        
        return learningReport;
        
    } catch (error) {
        console.error('Error processing approval data:', error);
        throw error;
    }
}

// Analyze feedback patterns
function analyzeFeedbackPatterns(learningNotes) {
    const patterns = {
        commonIssues: {},
        categoryBreakdown: {},
        improvementSuggestions: []
    };
    
    // Initialize category counts
    for (const category of Object.values(LEARNING_CATEGORIES)) {
        patterns.categoryBreakdown[category] = 0;
    }
    
    // Process each feedback
    for (const note of learningNotes) {
        if (!note.feedback) continue;
        
        const lowerFeedback = note.feedback.toLowerCase();
        
        // Check against known patterns
        for (const [pattern, category] of Object.entries(FEEDBACK_PATTERNS)) {
            if (lowerFeedback.includes(pattern)) {
                patterns.categoryBreakdown[category]++;
                
                if (!patterns.commonIssues[pattern]) {
                    patterns.commonIssues[pattern] = {
                        count: 0,
                        examples: []
                    };
                }
                
                patterns.commonIssues[pattern].count++;
                patterns.commonIssues[pattern].examples.push({
                    scenarioId: note.scenarioId,
                    title: note.title,
                    feedback: note.feedback
                });
            }
        }
    }
    
    // Sort common issues by frequency
    const sortedIssues = Object.entries(patterns.commonIssues)
        .sort(([,a], [,b]) => b.count - a.count);
    
    // Generate improvement suggestions based on top issues
    for (const [issue, data] of sortedIssues.slice(0, 5)) {
        patterns.improvementSuggestions.push(generateSuggestion(issue, data));
    }
    
    return patterns;
}

// Categorize feedback
function categorizeFeeback(feedback) {
    if (!feedback) return 'uncategorized';
    
    const lowerFeedback = feedback.toLowerCase();
    
    for (const [pattern, category] of Object.entries(FEEDBACK_PATTERNS)) {
        if (lowerFeedback.includes(pattern)) {
            return category;
        }
    }
    
    return 'other';
}

// Generate improvement suggestion
function generateSuggestion(issue, data) {
    const suggestions = {
        'too mature': {
            problem: 'Content is too mature for young audiences',
            solution: 'Focus on lighter themes, avoid complex adult situations, use more playful language',
            example: 'Instead of workplace stress, use playground dynamics or pet behaviors'
        },
        'hard to pronounce': {
            problem: 'Text contains words difficult for text-to-speech',
            solution: 'Use simpler words, avoid complex names, test pronunciation mentally',
            example: 'Replace "Tchaikovsky" with "Tom", replace "pharmaceutical" with "medicine"'
        },
        'not funny': {
            problem: 'Humor is falling flat or feels forced',
            solution: 'Use surprise and absurdity, create unexpected character reactions, add physical comedy descriptions',
            example: 'A cat who insists on using spreadsheets to track nap efficiency'
        },
        'too many characters': {
            problem: 'Scenarios have too many voices to track',
            solution: 'Limit to 3-4 distinct characters maximum, give each a clear role',
            example: 'Protagonist, Antagonist, Comic Relief, and optional Narrator'
        },
        'fallacy unclear': {
            problem: 'The logical fallacy being taught is not obvious',
            solution: 'Make the flawed logic more explicit, have characters state their reasoning clearly',
            example: 'Character explicitly says "Since X happened before Y, X must have caused Y"'
        }
    };
    
    return suggestions[issue] || {
        problem: `Issue: ${issue} (${data.count} occurrences)`,
        solution: 'Review specific examples to identify pattern',
        example: 'Analyze feedback for common themes'
    };
}

// Generate improvement guidelines
function generateGuidelines(feedbackAnalysis) {
    const guidelines = [];
    
    // Based on category breakdown
    const topCategories = Object.entries(feedbackAnalysis.categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    for (const [category, count] of topCategories) {
        if (count === 0) continue;
        
        switch (category) {
            case LEARNING_CATEGORIES.CONTENT:
                guidelines.push({
                    category: 'Content Guidelines',
                    rules: [
                        'Keep content family-friendly and appropriate for ages 10+',
                        'Avoid dark themes, violence, or mature situations',
                        'Focus on whimsical, lighthearted scenarios',
                        'Use positive resolution even in conflict'
                    ]
                });
                break;
                
            case LEARNING_CATEGORIES.AUDIO:
                guidelines.push({
                    category: 'Audio Optimization',
                    rules: [
                        'Always convert numbers to words in audioScript',
                        'Use simple character names that are easy to pronounce',
                        'Limit performance directives to key moments',
                        'Ensure each character has a distinct voice description'
                    ]
                });
                break;
                
            case LEARNING_CATEGORIES.HUMOR:
                guidelines.push({
                    category: 'Humor Guidelines',
                    rules: [
                        'Use absurdist humor that appeals to kids',
                        'Create unexpected juxtapositions (serious + silly)',
                        'Add physical comedy through descriptions',
                        'Avoid sarcasm that might be missed by young audiences'
                    ]
                });
                break;
                
            case LEARNING_CATEGORIES.DIALOGUE:
                guidelines.push({
                    category: 'Dialogue Best Practices',
                    rules: [
                        'Maximum 4 distinct characters per scenario',
                        'Each character needs a unique speech pattern',
                        'Use consistent character names throughout',
                        'Include narrator for complex scene transitions'
                    ]
                });
                break;
        }
    }
    
    return guidelines;
}

// Update generation spec with learnings
async function updateGenerationSpec(learningReport) {
    const specPath = path.join(__dirname, 'data', 'ai-scenario-generation-spec-v3-enhanced.md');
    
    let specContent = `# AI Scenario Generation Specification V3 - Enhanced with Learning Pipeline Insights

_Last Updated: ${new Date().toISOString()}_
_Based on ${learningReport.totalScenarios} reviewed scenarios with ${learningReport.approvalRate} approval rate_

## Learning Pipeline Insights

### Top Issues Identified
`;

    // Add top issues
    const topIssues = Object.entries(learningReport.patterns.commonIssues)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);
    
    for (const [issue, data] of topIssues) {
        specContent += `\n#### ${issue} (${data.count} occurrences)\n`;
        const suggestion = learningReport.patterns.improvementSuggestions
            .find(s => s.problem.includes(issue));
        if (suggestion) {
            specContent += `- **Problem**: ${suggestion.problem}\n`;
            specContent += `- **Solution**: ${suggestion.solution}\n`;
            specContent += `- **Example**: ${suggestion.example}\n`;
        }
    }
    
    // Add guidelines
    specContent += `\n## Enhanced Generation Guidelines\n\n`;
    
    for (const guideline of learningReport.generationGuidelines) {
        specContent += `### ${guideline.category}\n`;
        for (const rule of guideline.rules) {
            specContent += `- ${rule}\n`;
        }
        specContent += '\n';
    }
    
    // Add specific examples
    specContent += `## Examples to Avoid\n\n`;
    
    for (const rejected of learningReport.specificExamples.rejected.slice(0, 3)) {
        specContent += `### ❌ ${rejected.title}\n`;
        specContent += `**Issue**: ${rejected.feedback}\n`;
        specContent += `**Category**: ${rejected.category}\n\n`;
    }
    
    // Add the rest of the V3 spec
    specContent += `
## Core V3 Specification

[Include the rest of the V3 specification here...]

## Continuous Improvement

This specification is continuously updated based on approval feedback. Each review cycle helps refine our understanding of what makes a great Phuzzy scenario.

### Current Success Metrics
- Approval Rate: ${learningReport.approvalRate}
- Most Common Issue Category: ${Object.entries(learningReport.patterns.categoryBreakdown).sort(([,a],[,b]) => b-a)[0]?.[0] || 'none'}
- Total Scenarios Reviewed: ${learningReport.totalScenarios}
`;

    await fs.writeFile(specPath, specContent);
    
    return specPath;
}

// Generate learning report
async function generateLearningReport(approvalFile) {
    console.log('Scenario Learning Pipeline');
    console.log('=========================\n');
    
    try {
        console.log('Processing approval data...');
        const learningReport = await processApprovalData(approvalFile);
        
        // Save learning report
        const reportPath = path.join(__dirname, 'scenario-learning-report.json');
        await fs.writeFile(reportPath, JSON.stringify(learningReport, null, 2));
        console.log(`\n✓ Learning report saved to: ${reportPath}`);
        
        // Update generation spec
        console.log('\nUpdating generation specification...');
        const specPath = await updateGenerationSpec(learningReport);
        console.log(`✓ Updated spec saved to: ${specPath}`);
        
        // Display summary
        console.log('\n' + '='.repeat(50));
        console.log('Learning Summary:');
        console.log(`- Approval Rate: ${learningReport.approvalRate}`);
        console.log(`- Top Issue Categories:`);
        
        const topCategories = Object.entries(learningReport.patterns.categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        for (const [category, count] of topCategories) {
            if (count > 0) {
                console.log(`  - ${category}: ${count} issues`);
            }
        }
        
        console.log(`\nTop Improvement Suggestions:`);
        for (const suggestion of learningReport.patterns.improvementSuggestions.slice(0, 3)) {
            console.log(`- ${suggestion.problem}`);
            console.log(`  Solution: ${suggestion.solution}`);
        }
        
        // Update production status
        try {
            const statusPath = path.join(__dirname, 'production-status.json');
            const status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
            status.teamUpdates.producer = `Learning pipeline processed ${learningReport.totalScenarios} scenarios`;
            status.lastUpdate = new Date().toISOString();
            await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
        } catch (err) {
            console.log('Could not update production status');
        }
        
        return learningReport;
        
    } catch (error) {
        console.error('Learning pipeline failed:', error);
        process.exit(1);
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node scenario-learning-pipeline.js <approval-export.json>');
        console.log('Get the approval export from the Review Dashboard');
        process.exit(1);
    }
    
    const approvalFile = args[0];
    
    // Check if file exists
    try {
        await fs.access(approvalFile);
    } catch (err) {
        console.error(`Approval file not found: ${approvalFile}`);
        process.exit(1);
    }
    
    await generateLearningReport(approvalFile);
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { processApprovalData, generateLearningReport };