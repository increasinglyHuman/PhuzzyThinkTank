#!/usr/bin/env node

const testText = `'THIS PHOENIX ENERGY THO! 🔥 TRANSFORMING LIVE!'

#AuthenticAF #NaturallyEnhanced #TailGoals #GenuinelyFake`;

function processHashtags(text) {
    return text.replace(/#(\w+)/g, 'hashtag $1');
}

console.log('Original:');
console.log(testText);
console.log('\nProcessed:');
console.log(processHashtags(testText));

// Test with more examples
const examples = [
    "#SpaceSupremacy #NerdRage",
    "Check out my post! #Amazing #Blessed #NoFilter",
    "#8ArmedAndDangerous #OctoGrindset"
];

console.log('\n\nMore examples:');
examples.forEach(ex => {
    console.log(`\n"${ex}"`);
    console.log(`→ "${processHashtags(ex)}"`);
});