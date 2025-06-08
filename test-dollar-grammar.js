#!/usr/bin/env node

function fixDollars(text) {
    let processed = text;
    
    // Handle ranges
    processed = processed.replace(/\$(\d+)\s*-\s*\$(\d+)/g, function(match, start, end) {
        if (start === '1' && end === '1') return '1 dollar';
        if (start === '1') return '1 to ' + end + ' dollars';
        return start + ' to ' + end + ' dollars';
    });
    
    // Handle amounts with cents
    processed = processed.replace(/\$(\d+)\.(\d{2})/g, function(match, dollars, cents) {
        return dollars === '1' ? '1 dollar and ' + cents + ' cents' : dollars + ' dollars and ' + cents + ' cents';
    });
    
    // Handle plain amounts
    processed = processed.replace(/\$(\d+)/g, function(match, amount) {
        return amount === '1' ? '1 dollar' : amount + ' dollars';
    });
    
    return processed;
}

const tests = [
    "$1",
    "$2", 
    "$1.00",
    "$1.50",
    "$10.50",
    "$1-$2",
    "$1-$5", 
    "$2-$5",
    "That costs $1 exactly",
    "Price range: $1-$10"
];

console.log('Dollar Grammar Test:\n');
tests.forEach(test => {
    console.log(`"${test}" → "${fixDollars(test)}"`);
});