#!/usr/bin/env node
/**
 * Converts new scenario format to batch-compatible format
 */

const fs = require('fs');

function convertScenario(newFormat) {
    // Extract the first question as the main scenario
    const firstQuestion = newFormat.questions[0];
    
    // Create answer weights based on correct answer
    const answerWeights = {
        bias: 0,
        truth: 0,
        balanced: 0
    };
    
    // Map difficulty to answer type
    if (newFormat.difficulty === 'easy') {
        answerWeights.bias = 100;
    } else if (newFormat.difficulty === 'hard') {
        answerWeights.truth = 100;
    } else {
        answerWeights.balanced = 100;
    }
    
    // Generate ID from title
    const id = newFormat.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30) + '-001';
    
    return {
        id: id,
        title: newFormat.title,
        text: newFormat.scenario.content,
        claim: firstQuestion.question,
        correctAnswer: answerWeights.bias > 0 ? 'bias' : 
                       answerWeights.truth > 0 ? 'truth' : 'balanced',
        answerWeights: answerWeights,
        category: newFormat.category,
        theme: newFormat.topic,
        indicators: {
            emotion: [],
            logic: [],
            credibility: [],
            balanced: [],
            agenda: []
        }
    };
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node convert-new-scenarios.js <scenario-file.json>');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = inputFile.replace('.json', '-converted.json');

try {
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const converted = convertScenario(data);
    
    fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));
    console.log(`✅ Converted ${inputFile} to ${outputFile}`);
    
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}