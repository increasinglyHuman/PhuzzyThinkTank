const batch = require('./scenarios-batch-001.json');
const gen0 = require('./data/scenario-generated-000.json');
const gen1 = require('./data/scenario-generated-001.json');
const gen2 = require('./data/scenario-generated-002.json');

const batchIds = new Set(batch.scenarios.map(s => s.id).filter(id => id && id !== 'undefined'));
const genIds = new Set([
  ...gen0.scenarios.map(s => s.id),
  ...gen1.scenarios.map(s => s.id),
  ...gen2.scenarios.map(s => s.id)
]);

console.log('=== SCENARIO COMPARISON ===\n');
console.log('Batch-001 scenarios (excluding undefined):', batchIds.size);
console.log('Generated pack scenarios (000+001+002):', genIds.size);

const overlaps = [...batchIds].filter(id => genIds.has(id));
console.log('\nOverlapping IDs:', overlaps.length);
if (overlaps.length > 0) {
  console.log('Duplicates found:');
  overlaps.forEach(id => console.log('  -', id));
}

console.log('\nUnique to batch-001:', [...batchIds].filter(id => !genIds.has(id)).length);
console.log('\nBatch-001 scenarios NOT in generated packs:');
[...batchIds].filter(id => !genIds.has(id)).forEach(id => {
  const scenario = batch.scenarios.find(s => s.id === id);
  console.log(`  - ${id}: ${scenario.title}`);
});

// Check for title duplicates regardless of ID
console.log('\n=== TITLE COMPARISON ===');
const batchTitles = new Set(batch.scenarios.map(s => s.title));
const genTitles = new Set([
  ...gen0.scenarios.map(s => s.title),
  ...gen1.scenarios.map(s => s.title),
  ...gen2.scenarios.map(s => s.title)
]);

const titleOverlaps = [...batchTitles].filter(title => genTitles.has(title));
console.log('\nDuplicate titles:', titleOverlaps.length);
if (titleOverlaps.length > 0) {
  titleOverlaps.forEach(title => console.log('  -', title));
}