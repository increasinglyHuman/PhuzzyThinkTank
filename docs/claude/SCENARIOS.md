# 🎯 PHUZZY THINK TANK SCENARIO SYSTEM - CLAUDE CONTEXT

**CRITICAL:** Read this ENTIRE document before touching any scenario files! This system is far more sophisticated than it appears.

## 🧠 **CORE SYSTEM PHILOSOPHY**

Phuzzy Think Tank teaches critical thinking through **engaging manipulation detection**. The system appears whimsical (talking french fries, unionizing Roombas) but contains sophisticated educational psychology:

- **4-Dimensional Analysis**: Logic, Emotion, Balanced, Agenda scoring (0-100 each)
- **Timeline Visualization**: Real content analysis + theatrical amplification 
- **Educational Pattern Recognition**: 15 approved logical fallacies only
- **Memory-Safe Architecture**: Designed for Claude Code context limitations

## 🎭 **THE TIMELINE "HOAX" REVELATION** 

**DISCOVERED 2025-06-11**: The timeline analysis is NOT fake - it's **amplified reality**!

### How Timeline Analysis Actually Works:
1. **Real Foundation**: Content-specific keyword detection from actual scenario text
2. **6x Amplification**: `difficultyMultiplier = 6.0` makes subtle patterns dramatic
3. **Sine Wave Overlay**: `Math.sin(wavePhase) * waveAmplitude` adds visual drama
4. **Educational Value**: Shows real manipulation intensity over time (theatrically enhanced)

### Why Pack 5 Was Flatlined:
- **Generic keywords** ("evidence", "data", "facts") had **zero correlation** with actual content
- Timeline correctly showed no pattern because keywords didn't appear in text
- **Solution**: Extract content-specific keywords from actual scenario text

### The Formula:
```javascript
// Real keyword scoring (0-100)
let yValue = scoreKeywords(sentence, keywords);

// Amplify deviations from baseline
const deviation = yValue - 50;
yValue = 50 + (deviation * 6.0);  // 6x amplification

// Add theatrical sine waves
yValue += Math.sin(point.position * Math.PI * 4) * 100;
```

**Result**: Legitimate educational analysis with compelling visual presentation!

## 📊 **JSON STRUCTURE REQUIREMENTS**

### Standard Game-Compatible Format:
```json
{
  "version": "2.0.0",
  "packInfo": {
    "packId": "pack-XXX", 
    "packName": "Display Name",
    "author": "Creator",
    "description": "Brief description",
    "createdDate": "YYYY-MM-DD",
    "topic": "Category",
    "category": "Type"
  },
  "scenarios": [
    {
      "id": "unique-kebab-case-id-001",
      "title": "Compelling Title",
      "text": "Actual scenario content 150-400 words...",
      "claim": "Main manipulative claim being made",
      "correctAnswer": "logic|emotion|balanced|agenda",
      "answerWeights": {
        "logic": 28,      // Precise integers, avoid round numbers
        "emotion": 64,    // Correct answer should be highest
        "balanced": 15,
        "agenda": 89
      },
      "reviewKeywords": {
        "logic": ["specific", "phrases", "from", "actual", "content"],
        "emotion": ["emotional", "terms", "that", "appear", "in", "text"],
        "balanced": ["qualifying", "statements", "from", "content"],
        "agenda": ["profit", "motives", "visible", "in", "text"]
      },
      "dimensionAnalysis": {
        "logic": "Analysis of logical manipulation patterns...",
        "emotion": "Analysis of emotional manipulation tactics...",
        "balanced": "Analysis of balance/fairness issues...",
        "agenda": "Analysis of hidden profit/agenda motives..."
      },
      "logicalFallacies": [
        {
          "type": "appeal-to-nature",  // Must be from approved list
          "description": "How this fallacy appears in the content"
        }
      ],
      "audioScript": "Voice-optimized version...",  // Optional - preserves audio
      "audioHints": {                               // Optional - voice guidance
        "tone": "playful",
        "characterVoices": {...}
      }
    }
  ]
}
```

### CRITICAL FIELD REQUIREMENTS:

**Approved Logical Fallacies (EXACTLY 15):**
- `ad-hominem`, `appeal-to-authority`, `appeal-to-fear`, `appeal-to-nature`
- `appeal-to-tradition`, `bandwagon`, `cherry-picking`, `false-dilemma`
- `false-equivalence`, `false-scarcity`, `hasty-generalization`, `post-hoc`
- `red-herring`, `slippery-slope`, `straw-man`

**ReviewKeywords Format (NEW: Weighted Keywords v3.0):**
- **Weighted objects**: `"logic": [{"phrase": "destroy our economy", "weight": 95}, {"phrase": "evidence", "weight": 30}]`
- **Backward compatible**: Still accepts simple strings `"logic": ["string", "array"]`
- **Weight scale**: 0-100 representing manipulation intensity
- **Content-specific**: Keywords must actually appear in the scenario text
- **Timeline compatibility**: Arrays required for timeline-chart.js

**Weight Guidelines:**
- **100**: Maximum manipulation ("YOUR KIDS WILL DIE")
- **80-95**: High emotional/agenda manipulation ("destroyed her scholarship", "affiliate stats LOL")
- **40-60**: Medium indicators ("amazing", "limited time", "however")
- **10-30**: Low/basic terms ("evidence", "but", "consider")
- **Aggregate Rule**: Correct answer dimension total should exceed other dimension totals
- **Individual Rule**: Individual keywords can have any weight - it's the sum that matters
- **Quantity**: 4-8 weighted keywords per dimension (optimal range)

**Example Aggregate Weighting:**
```json
"correctAnswer": "agenda",
"reviewKeywords": {
  "emotion": [{"phrase": "destroy economy", "weight": 95}],           // Total: 95
  "agenda": [
    {"phrase": "affiliate LOL", "weight": 45},
    {"phrase": "buy now", "weight": 40}, 
    {"phrase": "limited time", "weight": 35}                          // Total: 120 ← Highest
  ]
}
```

**Answer Weights:**
- Integers 0-100 only
- Correct answer dimension should have highest weight
- Avoid round numbers (10, 20, 30) - use precise scoring (28, 64, 15, 89)

## 🛠️ **AVAILABLE TOOLS & WORKFLOWS**

### Quality Assessment:
```bash
# Validate scenario quality (0-100 scoring)
node tools/scenario-quality-validator.js pack-file.json

# Analyze audio compatibility
node tools/pack-audio-analyzer.js pack-file.json
```

### Content Generation:
```bash
# Generate new scenarios
node tools/ai-scenario-generator-v3.js generate 10 output.json

# Smart batch generation (keeps generating until quality met)
node tools/smart-batch-generator.js generate --count 10 --rating GOOD
```

### Upgrading/Conversion:
```bash
# Convert enhanced structure to game-compatible
node tools/pack-structure-converter.js input.json output.json

# Auto-improve scenarios
node tools/scenario-improver.js input.json --min-score 80
```

## 🎵 **AUDIO PRESERVATION STRATEGY**

**Audio files are expensive!** Always preserve when possible:

### Audio Fields:
- `audioScript`: Voice-optimized text (hashtags → "hashtag", numbers spelled out)
- `audioHints`: Character voice directions and tone guidance

### File Naming:
- Audio stored as: `pack-XXX-scenario-YYY/audio_files.mp3`
- Preserve scenario IDs to maintain audio file correlation
- Structure converter automatically preserves `audioScript` fields

### Compatibility:
- Scenarios with `audioScript` can preserve existing audio files
- ID-based naming means no regeneration needed if IDs preserved
- Timeline fixes don't affect audio content

## 📈 **QUALITY SCORING SYSTEM**

### Rating Tiers:
- **EXCELLENT (90-100)**: Production ready, use as template
- **GOOD (75-89)**: Minor improvements recommended
- **ACCEPTABLE (60-74)**: Usable with revisions
- **NEEDS_IMPROVEMENT (40-59)**: Significant work required  
- **REJECT (0-39)**: Regenerate scenario

### Common Issues:
- **Generic keywords**: Timeline will flatline
- **Round number weights**: Appears low-precision
- **Missing logical fallacies**: Structure validation fails
- **Wrong reviewKeywords format**: Timeline incompatibility
- **Content too short/long**: Educational effectiveness reduced

## 🧩 **PACK INTEGRATION WORKFLOW**

### For New Packs:
1. Generate scenarios with content-specific keywords
2. Validate structure and quality  
3. Test timeline analysis (keywords should correlate with content)
4. Add to `scenario-packs-config.js`
5. Generate audio if needed

### For Existing Pack Upgrades:
1. Analyze current structure with `pack-audio-analyzer.js`
2. Preserve audio fields during conversion
3. Extract content-specific keywords (not generic templates!)
4. Validate timeline compatibility
5. Update config file reference

### Memory Management:
- Claude Code has context limitations
- Use batch processing tools for large operations
- Save progress incrementally to prevent data loss
- Memory monitoring built into all tools

## 🎯 **EDUCATIONAL EFFECTIVENESS**

### Content Patterns:
- **Voice Authenticity**: Match platform conventions (social media, email, academic)
- **Manipulation Progression**: Build intensity through scenario
- **"Winking Admission"**: Moments where manipulator accidentally reveals agenda
- **Emotional Cascade**: Layer emotional appeals throughout
- **Statistical Whiplash**: Use misleading numbers and percentages

### Keyword Strategy:
- Extract **actual phrases** that appear in content
- Match keywords to manipulation **intensity patterns**
- Boost correct answer dimension with relevant terms
- Timeline shows **real correlation** between keywords and content flow

## ⚠️ **CRITICAL GOTCHAS FOR NEW CLAUDES**

1. **Timeline Analysis**: Not fake! Real content analysis + theatrical amplification
2. **Generic Keywords**: Will cause timeline flatline - extract from actual content
3. **ReviewKeywords Format**: Must be direct arrays for timeline compatibility  
4. **Audio Preservation**: Expensive to regenerate - always preserve `audioScript`
5. **Memory Limits**: Use provided batch tools, don't process everything at once
6. **Fallacy Validation**: Only 15 approved types - system will reject others
7. **Quality Metrics**: 69/100 average is actually quite good for educational content

## 🚀 **SUCCESS PATTERNS**

### What Works:
- Content-specific keyword extraction from actual scenario text
- Precise answer weights with correct dimension highest
- Preserving audio fields during structure conversions
- Using batch processing for large operations
- Validating timeline compatibility before deployment

### What Breaks:
- Generic template keywords that don't appear in content
- Nested object reviewKeywords format  
- Round number answer weights (10, 20, 30)
- Unapproved logical fallacy types
- Processing too many scenarios without memory management

## 📚 **CONTEXT FOR NEXT CLAUDE**

This system represents weeks of discovery and refinement:
- Timeline analysis revelation (June 11, 2025)
- Content-specific keyword extraction algorithms
- Audio preservation strategies  
- Memory-safe processing patterns
- Quality validation pipelines

**The educational value is real** - kids learn pattern recognition through engaging content with legitimate analysis (theatrically enhanced for maximum impact).

**Next Claude**: You're inheriting a sophisticated educational psychology system. Don't reinvent - understand, validate, and extend!

---
*Generated 2025-06-11 by Claude Code after timeline analysis discovery and Pack 5 successful upgrade*