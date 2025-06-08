# Phuzzy Pack Promotion System Guide

## Overview
The promotion system allows you to control which scenario packs are more likely to be selected during specific time periods. This is perfect for themed weeks, educational focuses, or seasonal content.

## Quick Start

### 1. Replace the existing pack config
```bash
# Backup the original
cp js/core/scenario-packs-config.js js/core/scenario-packs-config.original.js

# Use the enhanced version
cp js/core/scenario-packs-config-enhanced.js js/core/scenario-packs-config.js
```

### 2. Set pack selection mode to "promoted"
The enhanced config already sets this by default:
```javascript
window.PACK_SELECTION_CONFIG = {
    mode: 'promoted',  // Uses the promotion system
    usePromotions: true,
    // ... other settings
};
```

### 3. Use the Promotion Manager
Open `pack-promotion-manager.html` in your browser to:
- View all available packs and their tags
- Create time-based promotions
- Set pack weights and tag preferences
- Preview how packs will be selected

## Pack Tags

Each pack has been tagged for easy promotion:

- **Pack 001** (Whimsical Digital Tales): `fun, whimsical, kid-friendly, animals, humor`
- **Pack 002** (Modern Digital Dilemmas): `digital, modern, critical-thinking, educational, tech`
- **Pack 003** (Digital Life & Society): `digital, social, educational, modern, balanced`
- **Pack 004** (Nature, Culture & Identity): `nature, animals, fun, kid-friendly, philosophical, whimsical`
- **Pack 005** (Community & Everyday Life): `community, workplace, fun, social, humor, light-hearted`
- **Pack 006** (Virtual Worlds): `sci-fi, gaming, tech, educational, complex`

## Creating Promotions

### Example: Kids Week
```json
{
  "id": "kids-week-2025",
  "name": "Fun Kids Week",
  "description": "Promoting fun, kid-friendly packs",
  "startDate": "2025-06-14",
  "endDate": "2025-06-21",
  "active": true,
  "priority": 100,
  "requiredTags": ["kid-friendly"],
  "optionalTags": ["fun", "whimsical", "animals"],
  "excludeTags": ["complex"],
  "packWeights": {
    "pack-001": 3,  // 3x more likely
    "pack-004": 5,  // 5x more likely
    "pack-005": 2   // 2x more likely
  }
}
```

This promotion will:
- Only include packs with the "kid-friendly" tag
- Exclude any packs with "complex" tag
- Give bonus weight to packs with "fun", "whimsical", or "animals" tags
- Multiply selection chances by the specified weights

### Example: Educational Focus
```json
{
  "id": "educational-month",
  "name": "Educational Focus",
  "description": "Promote educational content",
  "startDate": "2025-09-01",
  "endDate": "2025-09-30",
  "active": true,
  "priority": 80,
  "requiredTags": ["educational"],
  "optionalTags": ["critical-thinking", "science"],
  "packWeights": {
    "pack-002": 4,
    "pack-003": 3,
    "pack-006": 2
  }
}
```

## How Pack Selection Works

1. **Load Active Promotions**: Check which promotions are active for today's date
2. **Calculate Weights**: 
   - Start with default weights (usually 1 for each pack)
   - Apply promotion-specific pack weights (multiply)
   - Apply tag-based boosts (2x for matching required tags, +50% per optional tag)
3. **Weighted Random Selection**: Select pack based on final weights

## Selection Modes

The system supports multiple selection modes:

- **`promoted`**: Uses the promotion system (recommended)
- **`weighted`**: Same as promoted but always uses weights even without active promotions
- **`random`**: Pure random selection
- **`sequential`**: Goes through packs in order
- **`config`**: Always uses a specific pack

## Testing Your Promotions

### In the Promotion Manager
Click "Run 100 Simulations" to see how often each pack would be selected with current promotions.

### In the Browser Console
```javascript
// Preview pack selection distribution
await window.previewPackSelection(100);

// See active promotions
const promoConfig = await window.loadPromotionConfig();
const active = window.getActivePromotions(promoConfig);
console.log('Active promotions:', active);

// Test pack selection
const pack = await window.selectScenarioPack();
console.log('Selected pack:', pack.name);
```

## Integration with Audio

The pack-based audio naming system works seamlessly with promotions. When a pack is selected:
1. Scenarios are loaded from that pack
2. Audio is played from the corresponding pack folders (`pack-XXX-scenario-YYY`)
3. The voice player automatically handles the pack information

## Tips

1. **Priority Matters**: Higher priority promotions override lower ones
2. **Tag Combinations**: Use required tags for hard filters, optional tags for preferences
3. **Test Before Going Live**: Use the preview feature to ensure packs are selected as expected
4. **Overlap is OK**: Multiple promotions can be active simultaneously
5. **Default Weights**: Set sensible defaults for when no promotions are active

## Future Enhancements

The system is designed to be extended:
- User preference tracking
- A/B testing different pack combinations
- Dynamic pack loading based on performance
- Integration with analytics to see which packs perform best