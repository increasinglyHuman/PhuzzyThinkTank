#!/usr/bin/env node

/**
 * Quick setup script for a "Kids Week" promotion
 * This creates a promotion that favors fun, kid-friendly packs
 */

const fs = require('fs');
const path = require('path');

// Load existing promotions
const promotionFile = path.join(__dirname, 'data/pack-promotions.json');
let promotionData;

try {
    promotionData = JSON.parse(fs.readFileSync(promotionFile, 'utf8'));
} catch (error) {
    console.log('Creating new promotion file...');
    promotionData = {
        promotions: [],
        defaultWeights: {
            "pack-001": 1,
            "pack-002": 1,
            "pack-003": 1,
            "pack-004": 1,
            "pack-005": 1,
            "pack-006": 1,
            "original-v2": 1
        }
    };
}

// Calculate dates (next Monday to Sunday)
const today = new Date();
const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
const nextMonday = new Date(today);
nextMonday.setDate(today.getDate() + daysUntilMonday);
const nextSunday = new Date(nextMonday);
nextSunday.setDate(nextMonday.getDate() + 6);

// Create Kids Week promotion
const kidsWeekPromo = {
    id: `kids-week-${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, '0')}-${String(nextMonday.getDate()).padStart(2, '0')}`,
    name: "Fun Kids Week",
    description: "A week of fun, whimsical scenarios perfect for younger audiences",
    startDate: nextMonday.toISOString().split('T')[0],
    endDate: nextSunday.toISOString().split('T')[0],
    active: true,
    priority: 100,
    requiredTags: ["kid-friendly"],
    optionalTags: ["fun", "whimsical", "animals", "humor"],
    excludeTags: ["complex", "mature"],
    packWeights: {
        "pack-001": 5,  // Caffeinated Sloth, Vegan Vampire, etc. - 5x weight
        "pack-004": 4,  // Philosophical French Fries, Animal parables - 4x weight  
        "pack-005": 3   // Roomba Union, Community stories - 3x weight
    }
};

// Check if this promotion already exists
const existingIndex = promotionData.promotions.findIndex(p => p.id === kidsWeekPromo.id);
if (existingIndex >= 0) {
    console.log('Updating existing Kids Week promotion...');
    promotionData.promotions[existingIndex] = kidsWeekPromo;
} else {
    console.log('Adding new Kids Week promotion...');
    promotionData.promotions.push(kidsWeekPromo);
}

// Save the updated promotions
fs.writeFileSync(promotionFile, JSON.stringify(promotionData, null, 2));

console.log('\n✅ Kids Week promotion set up successfully!');
console.log(`📅 Active from ${nextMonday.toDateString()} to ${nextSunday.toDateString()}`);
console.log('\n📦 Promoted packs:');
console.log('  - Pack 001 (Whimsical Digital Tales): 5x more likely');
console.log('  - Pack 004 (Nature, Culture & Identity): 4x more likely');
console.log('  - Pack 005 (Community & Everyday Life): 3x more likely');
console.log('\n🏷️ Looking for packs with tags: kid-friendly, fun, whimsical, animals, humor');
console.log('❌ Excluding packs with tags: complex, mature');
console.log('\n🎮 To activate:');
console.log('  1. Make sure your game uses scenario-packs-config-enhanced.js');
console.log('  2. Set PACK_SELECTION_CONFIG.mode = "promoted"');
console.log('  3. The promotion will activate automatically on the start date');

// Show preview of what will happen
console.log('\n📊 Expected pack distribution during Kids Week:');
console.log('  ~42% - Pack 001 (Caffeinated Sloth, Vegan Vampire)');
console.log('  ~33% - Pack 004 (French Fries, Animal stories)');  
console.log('  ~25% - Pack 005 (Roomba Union, Community life)');
console.log('\n💡 Tip: Run pack-promotion-manager.html to see and edit this promotion visually!');