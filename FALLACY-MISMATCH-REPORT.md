# Logical Fallacy Mismatch Report
**Date:** June 5, 2025
**Issue:** Scenarios reference fallacies not defined in the card collection system

## Current Situation

### Defined Fallacies (15 total)
The game's card collection system defines exactly 15 logical fallacies in `/data/logical-fallacies.json`:

1. **ad-hominem** - Personal Attack
2. **appeal-to-authority** - Expert Says
3. **appeal-to-fear** - Fear Appeal
4. **appeal-to-nature** - Natural = Good
5. **appeal-to-tradition** - Ancient Wisdom
6. **bandwagon** - Everyone's Doing It
7. **cherry-picking** - Selective Evidence
8. **false-dilemma** - False Choice
9. **false-equivalence** - Both Sides Same
10. **false-scarcity** - Fake Urgency
11. **hasty-generalization** - Rushed Conclusion
12. **post-hoc** - After This, Therefore Because of This
13. **red-herring** - Distraction
14. **slippery-slope** - Slippery Slope
15. **straw-man** - Fake Target

### Undefined Fallacies Used in Scenarios
The scenarios reference 14 additional fallacies that don't exist in the card system:

1. **gamblers-fallacy** (1 usage) - Classic fallacy about probability
2. **false-pattern** (1 usage) - Seeing patterns in randomness
3. **sunk-cost** (3 usages) - Continuing due to past investment
4. **tu-quoque** (2 usages) - "You too" / hypocrisy deflection
5. **false-comparison** (4 usages) - Might be same as false-equivalence
6. **anecdotal-evidence** (4 usages) - Might be hasty-generalization
7. **false-analogy** (2 usages) - Bad comparison
8. **appeal-to-popularity** (2 usages) - Likely same as bandwagon
9. **appeal-to-hypocrisy** (2 usages) - Similar to tu-quoque
10. **appeal-to-consequences** (2 usages) - If X then bad Y
11. **survivorship-bias** (1 usage) - Only seeing successes
12. **false-promise** (1 usage) - Unrealistic guarantees
13. **confirmation-bias** (1 usage) - Seeking supporting evidence
14. **appeal-to-money** (1 usage) - Rich = right

## Analysis

### Common Logical Fallacies (Standard Lists)
Based on educational resources, the most commonly taught logical fallacies include:

**Our 15 + Missing Important Ones:**
- ✅ Ad Hominem
- ✅ Appeal to Authority
- ✅ Appeal to Fear/Emotion
- ✅ Appeal to Nature
- ✅ Appeal to Tradition/Antiquity
- ✅ Bandwagon/Appeal to Popularity
- ✅ Cherry Picking
- ✅ False Dilemma/Dichotomy
- ✅ False Equivalence
- ✅ Hasty Generalization
- ✅ Post Hoc
- ✅ Red Herring
- ✅ Slippery Slope
- ✅ Straw Man
- ❌ **Gambler's Fallacy** - Very important for teaching probability
- ❌ **Sunk Cost Fallacy** - Critical for decision-making
- ❌ **Tu Quoque/Whataboutism** - Common in arguments
- ❌ **Appeal to Consequences** - Important manipulation tactic
- ❌ **Confirmation Bias** - Fundamental cognitive error

### Possible Mappings
Some undefined fallacies might map to existing ones:
- `appeal-to-popularity` → `bandwagon` (same concept)
- `anecdotal-evidence` → `hasty-generalization` (single example)
- `false-comparison` → `false-equivalence` (similar)
- `appeal-to-hypocrisy` → could be new or merged with tu-quoque

## Recommendations

### Option 1: Expand to 20 Fallacies
Add 5 more critical fallacies to reach 20:
1. **gamblers-fallacy** - Essential for probability education
2. **sunk-cost** - Important for decision-making
3. **tu-quoque** - Common deflection tactic
4. **confirmation-bias** - Fundamental bias
5. **survivorship-bias** - Important for data literacy

### Option 2: Strict 15 with Mapping
Keep exactly 15 but create alias mappings:
- Map `gamblers-fallacy` → `hasty-generalization` (poor pattern recognition)
- Map `sunk-cost` → `appeal-to-consequences` (if we add it)
- Map `tu-quoque` → `ad-hominem` (attacking the person)
- Map `anecdotal-evidence` → `hasty-generalization`
- Map `appeal-to-popularity` → `bandwagon`

### Option 3: Replace Less Common with More Important
Remove less common fallacies and add critical ones:
- Remove: `red-herring`, `appeal-to-nature`
- Add: `gamblers-fallacy`, `sunk-cost`

## Implementation Steps

1. **Immediate Fix**: Create mapping function in bear-analysis.js
2. **Data Cleanup**: Update all scenarios to use only defined fallacies
3. **AI Guidance**: Create strict specification for scenario generation
4. **Final Decision**: Choose between 15 or 20 fallacy system

## Code Fix Example
```javascript
// In bear-analysis.js, add fallacy mapping
const fallacyAliases = {
    'gamblers-fallacy': 'hasty-generalization',
    'false-pattern': 'hasty-generalization',
    'sunk-cost': 'appeal-to-consequences',
    'tu-quoque': 'ad-hominem',
    'false-comparison': 'false-equivalence',
    'anecdotal-evidence': 'hasty-generalization',
    'false-analogy': 'false-equivalence',
    'appeal-to-popularity': 'bandwagon',
    'appeal-to-hypocrisy': 'ad-hominem',
    'survivorship-bias': 'cherry-picking',
    'false-promise': 'false-scarcity',
    'confirmation-bias': 'cherry-picking',
    'appeal-to-money': 'appeal-to-authority'
};

// When processing fallacyId:
const mappedId = fallacyAliases[fallacyId] || fallacyId;
```

## Next Steps
1. Decide on 15 vs 20 fallacy system
2. Update either scenarios or fallacy database
3. Create strict AI generation guidelines
4. Test all card collection mechanics