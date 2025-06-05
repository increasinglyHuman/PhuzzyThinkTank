# Scenario V3 Migration Plan

## Why V3?

The current v2 format works but requires hardcoded mappings between indicator IDs and their display representations. V3 would make scenarios truly self-contained.

## Key Improvements

### 1. **Rich Indicators/Triggers**
Instead of simple strings, use objects with display data:

```javascript
// V2 (current)
"indicators": ["specific-percentages", "tested-data"]

// V3 (proposed)
"indicators": [
  {
    "id": "specific-percentages",
    "icon": "📊",
    "text": "Specific percentages cited",
    "weight": 0.6,
    "category": "evidence"
  }
]
```

### 2. **Enhanced Peak Moments**
Add positioning and emphasis data for timeline visualization:

```javascript
"peakMoments": {
  "logic": [
    {
      "text": "200 matches",
      "position": 0.2,  // 20% through text
      "icon": "📊",
      "emphasis": "number"  // helps with styling
    }
  ]
}
```

### 3. **Multi-Level Hints**
Support both basic and advanced hints:

```javascript
"hints": {
  "primary": {
    "icon": "⚖️",
    "message": "Basic hint for honey pot usage"
  },
  "advanced": {
    "icon": "🔍",
    "message": "Deeper insight",
    "highlights": [...]  // specific text to highlight
  }
}
```

## Migration Strategy

### Phase 1: Backward Compatibility
- Update game engine to handle both v2 and v3 formats
- Check for object vs string in indicators/triggers
- Use existing mappings as fallback for v2 data

### Phase 2: Conversion Tool
Create a tool to convert v2 scenarios to v3:

```javascript
function convertV2toV3(v2Scenario) {
  const v3Scenario = { ...v2Scenario };
  
  // Convert indicators
  if (Array.isArray(v2Scenario.analysis.logic.indicators)) {
    v3Scenario.analysis.logic.indicators = 
      v2Scenario.analysis.logic.indicators.map(ind => {
        if (typeof ind === 'string') {
          return {
            id: ind,
            icon: getIconForIndicator(ind),
            text: getTextForIndicator(ind),
            weight: 0.5
          };
        }
        return ind;
      });
  }
  
  // Similar for triggers...
  
  return v3Scenario;
}
```

### Phase 3: Update Scenario Generator
Modify the AI scenario generation to output v3 format directly:

```javascript
// In scenario generation prompt
"Create indicators as objects with id, icon, text, and weight fields"
```

## Benefits

1. **Self-Contained Data** - No external mappings needed
2. **Flexible Display** - Each scenario can have unique icons/text
3. **Easier Localization** - Text in data, not code
4. **Richer Analytics** - Weights and categories enable better analysis
5. **Visual Consistency** - Icons chosen during scenario creation

## Timeline

- **Now**: Continue with v2 + hardcoded mappings
- **Pack 003**: Implement v3 support with backward compatibility
- **Pack 004+**: Full v3 format
- **Future**: Deprecate v2 support

## Code Changes Needed

1. **scenario-manager.js**: Add v2/v3 detection and conversion
2. **bear-analysis.js**: Update to use embedded display data
3. **timeline-chart.js**: Use peak moment positioning data
4. **honey-pot-manager.js**: Support multi-level hints
5. **scenario-builder-tool.html**: Update for v3 creation

## Example Implementation

```javascript
// In bear-analysis.js
displayFactors(containerId, factors) {
  factors.forEach((factor, index) => {
    setTimeout(() => {
      let displayText;
      
      // Handle both v2 strings and v3 objects
      if (typeof factor === 'object') {
        // V3 format - use embedded data
        displayText = `${factor.icon} ${factor.text}`;
      } else {
        // V2 format - use mapping
        displayText = this.convertFactorToDisplayText(factor, containerId);
      }
      
      // Create and append element...
    }, 200 * (index + 1));
  });
}
```

This approach gives us a smooth migration path while making the system more maintainable and flexible for future scenarios.