# AI Scenario Generation Specification v3
**Updated:** January 6, 2025
**Purpose:** Strict guidelines for AI-generated scenarios to ensure compatibility with the 15-card fallacy system

## CRITICAL CONSTRAINT: Fallacy Limitations

### ⚠️ ONLY USE THESE 15 FALLACIES ⚠️
The game has exactly 15 collectible fallacy cards. You MUST only use these fallacy IDs:

1. `ad-hominem` - Personal Attack
2. `appeal-to-authority` - Expert Says  
3. `appeal-to-fear` - Fear Appeal
4. `appeal-to-nature` - Natural = Good
5. `appeal-to-tradition` - Ancient Wisdom
6. `bandwagon` - Everyone's Doing It
7. `cherry-picking` - Selective Evidence
8. `false-dilemma` - False Choice
9. `false-equivalence` - Both Sides Same
10. `false-scarcity` - Fake Urgency
11. `hasty-generalization` - Rushed Conclusion
12. `post-hoc` - After This, Therefore Because
13. `red-herring` - Distraction
14. `slippery-slope` - Slippery Slope
15. `straw-man` - Fake Target

### ❌ DO NOT USE THESE (Even Though They're Common)
These fallacies are NOT in our card system:
- `gamblers-fallacy` → use `hasty-generalization` instead
- `sunk-cost` → use `false-scarcity` instead  
- `tu-quoque` → use `ad-hominem` instead
- `confirmation-bias` → use `cherry-picking` instead
- `appeal-to-popularity` → use `bandwagon` instead
- `false-analogy` → use `false-equivalence` instead
- `begging-the-question` → NOT AVAILABLE
- `no-true-scotsman` → NOT AVAILABLE
- Any other fallacy names → NOT AVAILABLE

### 🔄 Automatic Mapping (For Reference)
The game engine will automatically map these variations:
```javascript
// These will be converted on-the-fly:
'gamblers-fallacy' → 'hasty-generalization'
'sunk-cost' → 'false-scarcity'  
'tu-quoque' → 'ad-hominem'
'false-comparison' → 'false-equivalence'
'anecdotal-evidence' → 'hasty-generalization'
'appeal-to-popularity' → 'bandwagon'
'confirmation-bias' → 'cherry-picking'
// etc.
```

## Scenario Structure Requirements

### Required Fields
```json
{
  "id": "unique-id-here",
  "title": "Catchy Title (3-6 words)",
  "text": "The scenario text (150-250 words)...",
  "claim": "The specific claim being made",
  "correctAnswer": "logic|emotion|balanced|agenda",
  "answerWeights": {
    "logic": 0-100,
    "emotion": 0-100,
    "balanced": 0-100,
    "agenda": 0-100
  },
  "logicalFallacies": [
    {
      "fallacyId": "MUST BE FROM THE 15 ALLOWED",
      "severity": "primary|secondary|minor",
      "example": "How it appears in this scenario"
    }
  ],
  "analysis": { ... },
  "wisdom": "Integration text...",
  "difficulty": "beginner|intermediate|advanced"
}
```

### Fallacy Usage Guidelines

1. **Primary Fallacies** (1-2 per scenario)
   - The main logical error driving the manipulation
   - Players can collect these as cards
   - Must be clearly identifiable

2. **Secondary Fallacies** (0-2 per scenario)  
   - Supporting logical errors
   - Less prominent but still present

3. **Total Limit**: Maximum 3-4 fallacies per scenario
   - Don't overwhelm players
   - Keep focus clear

## Example: Correct Fallacy Usage

```json
"logicalFallacies": [
  {
    "fallacyId": "appeal-to-fear",  // ✅ From allowed list
    "severity": "primary",
    "example": "Uses predator panic to sell tracking app"
  },
  {
    "fallacyId": "false-scarcity",  // ✅ From allowed list
    "severity": "secondary",
    "example": "Limited time offer pressure"
  }
]
```

## Example: INCORRECT Usage (Will Break)

```json
"logicalFallacies": [
  {
    "fallacyId": "gamblers-fallacy",  // ❌ NOT IN LIST!
    "severity": "primary",
    "example": "..."
  }
]
```

## Indicator & Trigger Requirements

### ⚠️ USE PREDEFINED INDICATORS/TRIGGERS ⚠️
Load and use indicators/triggers from `indicator-trigger-icons.json`:

```javascript
// GOOD - Using predefined indicator
"indicators": ["weak-evidence", "hidden-agenda", "cherry-picked"]

// BAD - Making up new ones without adding to database
"indicators": ["totally-new-indicator"]
```

### Adding New Indicators/Triggers
If you need something not in the database:
1. First check if a similar one exists
2. If truly new, add it to `indicator-trigger-icons.json` with:
   - Appropriate category
   - Clear icon (emoji)
   - Concise text (3-5 words)
3. Then use it in your scenario

Example addition:
```json
"quantum-confusion": { 
  "icon": "⚛️", 
  "text": "Quantum physics misused" 
}
```

## Quality Checks Before Submission

- [ ] All fallacyIds are from the approved 15
- [ ] No made-up or alternative fallacy names
- [ ] Maximum 3-4 fallacies per scenario
- [ ] Each fallacy has clear example in text
- [ ] Severity levels make sense
- [ ] All indicators exist in indicator-trigger-icons.json
- [ ] All triggers exist in indicator-trigger-icons.json
- [ ] New additions properly formatted with icons

## Remember: Educational Purpose

The limited fallacy set helps students:
- Master core concepts thoroughly
- Recognize patterns across scenarios  
- Build genuine critical thinking skills
- Feel accomplishment collecting all cards

Stick to the 15. The constraint creates better learning!