// Check if existing scenarios use theme/topic
const gen1 = require('./data/scenario-packs/scenario-generated-001.json');
const gen2 = require('./data/scenario-packs/scenario-generated-002.json');
const batch = require('./scenarios-batch-001.json');

console.log('=== Field Usage Analysis ===');
console.log('\nGenerated Pack 001:');
console.log('Has theme field:', gen1.scenarios[0].theme !== undefined);
console.log('Has topic field:', gen1.scenarios[0].topic !== undefined);
console.log('Has category field:', gen1.scenarios[0].category !== undefined);

console.log('\nGenerated Pack 002:');  
console.log('Has theme field:', gen2.scenarios[0].theme !== undefined);
console.log('Has topic field:', gen2.scenarios[0].topic !== undefined);
console.log('Has category field:', gen2.scenarios[0].category !== undefined);

console.log('\nBatch-001:');
const batchScenario = batch.scenarios[0];
console.log('Has theme field:', batchScenario.theme !== undefined);
console.log('Has topic field:', batchScenario.topic !== undefined);
console.log('Has category field:', batchScenario.category !== undefined);

// Check which fields are actually used
console.log('\n=== Sample Values ===');
if (batchScenario.theme) console.log('Batch theme:', batchScenario.theme);
if (batchScenario.topic) console.log('Batch topic:', batchScenario.topic);
if (batchScenario.category) console.log('Batch category:', batchScenario.category);