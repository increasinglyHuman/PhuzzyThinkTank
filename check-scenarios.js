const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/legacy/scenario-generated-complete.json', 'utf8'));

console.log('Total scenarios:', data.scenarios.length);
console.log('\nChecking for missing fields...\n');

data.scenarios.forEach((s, i) => {
  const missing = [];
  if (!s.dimensionAnalysis) missing.push('dimensionAnalysis');
  if (!s.logicalFallacies) missing.push('logicalFallacies');
  if (!s.peakMoments) missing.push('peakMoments');
  
  if (missing.length > 0) {
    console.log(`Scenario ${i+1} (${s.id}) missing: ${missing.join(', ')}`);
  }
});

console.log('\nAll scenarios have correct answer weights:', 
  data.scenarios.every(s => {
    const weights = Object.values(s.answerWeights);
    return weights.every(w => w >= 0 && w <= 100);
  })
);