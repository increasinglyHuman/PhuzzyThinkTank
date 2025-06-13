# Comprehensive AI Scenario Generation Dataset for Phuzzy Think Tank

**Compiled:** 2025-06-11  
**Purpose:** Complete reference for sophisticated AI generation of educational critical thinking scenarios  
**Status:** Production-ready reference including all schema versions, patterns, and requirements

## Table of Contents
1. [Complete JSON Structure Examples](#complete-json-structure-examples)
2. [Educational Patterns & Scoring Methodology](#educational-patterns--scoring-methodology)
3. [Content Creation Guidelines](#content-creation-guidelines)
4. [Quality Validation Criteria](#quality-validation-criteria)
5. [Technical Constraints & Capabilities](#technical-constraints--capabilities)
6. [Advanced Generation Techniques](#advanced-generation-techniques)

---

## Complete JSON Structure Examples

### Current V2.0.0 Schema (Pack 001 Reference Standard)

```json
{
  "version": "2.0.0",
  "packInfo": {
    "packId": "enhanced-scenarios-001",
    "packName": "Complex Manipulation Scenarios",
    "author": "AI Generated",
    "description": "Scenarios demonstrating sophisticated manipulation techniques with precise linguistic analysis",
    "createdDate": "2025-01-06",
    "topic": "General Critical Thinking",
    "category": "Mixed"
  },
  "scenarios": [
    {
      "id": "smart-meter-panic-001",
      "title": "The Smart Meter Conspiracy",
      "text": "My neighbor Janet (retired nurse) swears the new smart meters are making us sick...",
      "claim": "Smart meters are causing health problems and we must act immediately to protect our families",
      "correctAnswer": "emotion",
      "answerWeights": {
        "logic": 31,
        "emotion": 73,
        "balanced": 19,
        "agenda": 67
      },
      "reviewKeywords": {
        "logic": {
          "keywords": [
            {
              "phrase": "study from Switzerland",
              "weight": 89
            },
            {
              "phrase": "n=394, p<0.05",
              "weight": 76
            },
            {
              "phrase": "World Health Organization",
              "weight": 34
            },
            {
              "phrase": "cherry-picked data",
              "weight": 67
            },
            {
              "phrase": "correlation or causation",
              "weight": 58
            }
          ],
          "explanation": "Scientific-sounding references mixed with cherry-picked data and ignored authority"
        },
        "emotion": {
          "keywords": [
            {
              "phrase": "making us sick",
              "weight": 84
            },
            {
              "phrase": "families suffer",
              "weight": 91
            },
            {
              "phrase": "ACT NOW",
              "weight": 95
            },
            {
              "phrase": "anxiety started",
              "weight": 73
            },
            {
              "phrase": "protect our children",
              "weight": 87
            }
          ],
          "explanation": "Fear-based language targeting parental protection instincts"
        },
        "balanced": {
          "keywords": [
            {
              "phrase": "Then again",
              "weight": 42
            },
            {
              "phrase": "Correlation or causation?",
              "weight": 56
            },
            {
              "phrase": "I'm not sure",
              "weight": 38
            },
            {
              "phrase": "legitimate concerns",
              "weight": 44
            }
          ],
          "explanation": "Token acknowledgments quickly overridden by emotional appeals"
        },
        "agenda": {
          "keywords": [
            {
              "phrase": "selling EMF shields",
              "weight": 89
            },
            {
              "phrase": "$89",
              "weight": 92
            },
            {
              "phrase": "Sign the petition",
              "weight": 78
            },
            {
              "phrase": "limited time offer",
              "weight": 85
            },
            {
              "phrase": "my website",
              "weight": 71
            }
          ],
          "explanation": "Commercial product and activism agenda disguised as community concern"
        }
      },
      "logicalFallacies": [
        {
          "fallacyId": "post-hoc",
          "severity": "primary",
          "example": "Daughter's anxiety started right after installation - assumes causation from timing"
        },
        {
          "fallacyId": "cherry-picking",
          "severity": "primary",
          "example": "Cites one Swiss study while dismissing WHO conclusion"
        }
      ],
      "analysis": {
        "logic": {
          "scores": {
            "evidence": 31,
            "consistency": 28,
            "source": 37,
            "agenda": 68
          },
          "indicators": ["cherry-picked", "anecdotal-evidence", "correlation-not-causation"],
          "explanation": "Mixes legitimate study citation with selective interpretation, ignores contradicting authorities"
        },
        "emotion": {
          "scores": {
            "fear": 82,
            "belonging": 71,
            "pride": 43,
            "manipulation": 76
          },
          "triggers": ["community-threat", "child-anxiety", "property-values"],
          "explanation": "Weaponizes parental protection instincts and financial fears while building us-vs-them dynamic"
        }
      },
      "dimensionAnalysis": {
        "logic": "Evidence accumulates uncertainly - 87% detection confidence undermined by 9% false positive rate, creating genuine doubt.",
        "emotion": "Professional frustration authentic - torn between protecting academic integrity and avoiding false accusations that destroy futures.",
        "balanced": "Exemplary complexity throughout - acknowledges own AI use while investigating student, questions every assumption, seeks imperfect compromise.",
        "agenda": "Minimal personal agenda - proposed solution aims for fairness despite acknowledging it might itself be unfair."
      },
      "peakMoments": {
        "logic": ["study from Switzerland", "n=394, p<0.05", "World Health Organization"],
        "emotion": ["making us sick", "families suffer", "ACT NOW"],
        "balanced": ["Then again", "Correlation or causation?"],
        "agenda": ["selling EMF shields for $89", "Sign the petition"]
      },
      "wisdom": "Notice how legitimate scientific elements (study citation, p-values) are weaponized through selective presentation. The pattern moves from personal anecdote to community threat to urgent action, bypassing critical evaluation. Real science considers all evidence; manipulation cherry-picks scary data.",
      "hints": {
        "keywords": ["sick", "suffer", "ACT NOW", "anxiety", "selling", "$89"],
        "strategy": "emotion",
        "hintMessage": "Strong fear language mixed with product sales!"
      },
      "metadata": {
        "tags": ["health-scare", "technology-fear", "community-panic", "hidden-sales"],
        "difficulty": 3,
        "educationalFocus": "recognizing-fear-based-science-manipulation",
        "commonMisconceptions": ["one-study-proves-everything", "correlation-equals-causation"],
        "addedDate": "2025-01-06"
      },
      "topic": "Technology & AI"
    }
  ]
}
```
### 0. Scoring Phrases - ReviewKeywords:Phrases:weight
Phrases are words and phrases that align with the scenario text and align with significant peaks and valleys in the strength of an argument or point. the stronger the emotion, logic, balance or personal agenda at the moment that word or phrase appears in the scenario - the higher that score - inverse is true for low scores. These words and phrases are highlighted in the timeline chart and rendered as points on a timeline graph along a curve. 
- **70++: Extreme persuasive or emotional appeal or balance or use of logic
- **51-69: High persuasive or emotional appeal, or balance or use of logic
- **31-50: Moderate to low persuasive or emotional appeal, or balance or use of logic
- **0-30: Very Low persuasive or emotional appeal, or balance or use of logic
there should be clear  correlation between these scores and the scores for best answer - though these individual spikes can vary above or beyond the correlary scor for that dimension, the aggregate of these should clearly reflect the overall answer score for the like dimension


---

## Educational Patterns & Scoring Methodology

### The Four-Dimensional Scoring System

Each dimension operates on a **duality matrix** where higher scores indicate stronger presence of the measured quality. These dimensions are orthogonal and measure distinct aspects of critical thinking challenges.

## Dimensional Duality Matrices & Detection Frameworks

### 1. Logic Dimension (0-100): Reasoning Coherence vs. Logical Fallacies

**Core Duality:** Sound Evidence ↔ Flawed Reasoning

**High Logic Scores (70-100) - Fallacy-Driven:**
```
Decision Tree:
├── Causal Errors: Post-hoc, correlation/causation confusion
├── Evidence Errors: Cherry-picking, hasty generalization  
├── Authority Errors: False expertise, credential inflation
└── Statistical Errors: Sample bias, percentage manipulation
```

**Low Logic Scores (0-30) - Evidence-Based:**
```
Quality Indicators:
├── Verified sources with transparent methodology
├── Acknowledges limitations and uncertainties  
├── Consistent reasoning without contradictions
└── Appropriate sample sizes and statistical methods
```

**Keyword Detection Patterns:**
- **High**: "Professor of [Absurd Field]", "73.6% of studies", "PROVEN by science"
- **Low**: "preliminary findings", "more research needed", "according to peer-reviewed"

---

### 2. Emotion Dimension (0-100): Rational Appeal vs. Emotional Manipulation

**Core Duality:** Informational Content ↔ Emotional Hijacking

**High Emotion Scores (70-100) - Manipulation-Driven:**
```
Trigger Categories:
├── Fear: "URGENT", "DEVASTATING", "Time running out"
├── Identity: "People like us", "Join the movement", superiority language
├── Protection: Parental instincts, family safety, community threats
└── Status: "Secret knowledge", "Be the first", exclusivity appeals
```

**Low Emotion Scores (0-30) - Information-Focused:**
```
Neutral Indicators:
├── Factual tone without emotional amplifiers
├── No urgency pressure or scarcity tactics
├── Respectful of audience intelligence
└── Educational rather than persuasive intent
```

**Emotional Progression Patterns:**
- **Manipulation**: Calm → Concern → Fear → Panic → Solution
- **Information**: Question → Investigation → Evidence → Conclusion

---

### 3. Balance Dimension (0-100): Energetic Coherence vs. Cognitive Chaos

**Core Duality:** Structured Reasoning ↔ Chaotic Energy Opposition

**❗ CRITICAL INSIGHT: Balance measures energetic coherence, not "fairness"**

**High Balance Scores (80-100) - Coherent Energy:**
```
Coherence Indicators:
├── Logical flow: Ideas connect naturally
├── Emotional consistency: Stable emotional tone
├── Genuine uncertainty: "I'm genuinely conflicted", ethical consideration
├── Structured doubt: Methodical exploration of alternatives
└── Energy harmony: No cognitive whiplash or information overload
```

**Low Balance Scores (0-30) - Chaotic Energy:**
```
Chaos Detection Patterns:
├── Topic jumping: Socks → Science → Conspiracy → Product sales
├── Emotional volatility: URGENT → casual → SHOCKING → uncertainty  
├── Contradictory positions: Claims authority then admits confusion
├── Information overload: Overwhelming facts/statistics/claims
└── Cognitive whiplash: Rapid shifts requiring mental re-adjustment
```

**The Trump Principle:** Coherent manipulation vs. chaotic manipulation
- **Structured Propaganda**: Orderly lies with consistent narrative
- **Chaos Manipulation**: Emotional whiplash, topic storms, cognitive overload

**Balance vs. Logic Distinction:**
- **Logic**: "Are the facts internally consistent?"
- **Balance**: "Does this create harmony or chaos in my thinking?"

**Keyword Energy Signatures:**
- **High Balance**: "However, I genuinely struggle", "What if I'm wrong", methodical uncertainty
- **Low Balance**: "SHOCKING! But wait", "Obviously... except", rapid emotional/topic shifts

---

### 4. Agenda Dimension (0-100): Transparent Intent vs. Hidden Motivation

**Core Duality:** Educational Purpose ↔ Commercial/Political Exploitation

**High Agenda Scores (70-100) - Hidden Exploitation:**
```
Agenda Detection Matrix:
├── Product Integration: "My course", "$X.99", "limited time"
├── Authority Building: Credentials → expertise → trust → pitch
├── Problem Amplification: Create/inflate problem → offer solution
├── Community Exploitation: Group identity → shared threat → monetization
└── Disguised Intent: Education/help language masking commercial goals
```

**Low Agenda Scores (0-30) - Transparent Intent:**
```
Genuine Indicators:
├── No financial asks or product mentions
├── Admits limitations and uncertainties
├── Encourages independent verification
├── Educational focus without ulterior motives
└── Transparent about potential conflicts of interest
```

**The Agenda Progression Pattern:**
1. **Authority establishment** ("As a certified expert...")
2. **Problem identification** ("You're in danger...")  
3. **Urgency creation** ("Act now before...")
4. **Solution offering** ("My product solves...")
5. **Legitimacy maintenance** ("This isn't about money...")

---

## Cross-Dimensional Interaction Patterns

**Advanced Manipulation Signatures:**
- **High Logic + High Emotion**: Sophisticated fear-mongering with fake data
- **High Balance + High Agenda**: Ethical-seeming uncertainty hiding sales pitch  
- **Low Logic + Low Emotion + High Agenda**: Boring but persistent commercial pressure
- **Chaos + Authority**: Trump-style: "I'm very smart" amid complete incoherence

**Educational Gold Standard (Target for "balanced" correct answers):**
- **Low Logic**: Sound reasoning, good evidence
- **Low Emotion**: Informational, not manipulative  
- **High Balance**: Coherent uncertainty, genuine complexity
- **Low-Medium Agenda**: Transparent intent, minor bias acknowledged

## Fuzzy Analysis Decision Matrix

**For AI Agents:** Use this decision tree for dimensional scoring:

```
IF scenario contains:
├── Statistical manipulation OR fake credentials → Logic Score 70+
├── URGENT language OR fear appeals → Emotion Score 70+  
├── Topic jumping OR emotional whiplash → Balance Score 30-
├── Product mentions OR hidden sales → Agenda Score 70+
ELSE apply graduated scoring based on intensity
```

**Multi-Dimensional Profiles:**
- **Classic Manipulation**: High Logic + High Emotion + Low Balance + High Agenda
- **Sophisticated Propaganda**: Low Logic + Medium Emotion + High Balance + Medium Agenda  
- **Chaos Agent**: High Logic + High Emotion + Low Balance + Medium Agenda
- **Ethical Complexity**: Low Logic + Low Emotion + High Balance + Low Agenda

### Answer Weight Calculation Precision

**Enhanced V2 Requirements:**
- Calculate to decimal, round naturally (71.4 → 71)
- Ensure variety in final digits across pack
- Create "fingerprints" - no identical distributions
- Correct answer should score 75+ (balanced scenarios 85+)

**Weight Patterns by Type:**

```javascript
// High Emotion Scenarios
{
  emotion: 76-95,
  logic: 15-35,
  balanced: 5-20,
  agenda: "variable"
}

// Sophisticated Agenda
{
  agenda: 75-93,
  emotion: 45-70,
  logic: 25-45,
  balanced: 10-30
}

// Genuine Balance
{
  balanced: 84-96,
  logic: 55-75,
  emotion: 40-65,
  agenda: 15-40
}

// Logic-Driven
{
  logic: 72-89,
  emotion: 35-65,
  balanced: 30-50,
  agenda: 20-50
}
```

---

## Content Creation Guidelines

### Advanced Generation Techniques

#### 1. The "Winking Admission" Pattern
- Manipulators acknowledge their tactics while still employing them
- Creates false transparency that disarms skepticism
- Examples: "Correlation, not causation 😉" while implying causation

#### 2. Statistical Whiplash Technique
- Present conflicting data revealing genuine complexity
- Show gap between stated values and actual behavior
- Examples: "78% support it, but only 23% would pay for it"

#### 3. Voice Authenticity Requirements
- **Email**: From/Subject/Body structure, corporate speak
- **Social Media**: Platform-specific language patterns
- **Group Posts**: Immediate belonging words ("Ladies," "Moms," "Team")
- **Authority Voice**: Credential establishment ("Professor here," "20-year nurse")

#### 4. Emotional Cascade Mapping
- **Parenting**: Concern → Fear → Guilt → Pride in "protecting"
- **Financial**: Curiosity → FOMO → Panic → Relief through action
- **Health**: Worry → Research → Terror → Solution via product
- **Professional**: Ambition → Anxiety → Compliance → Resentment

### Complexity Requirements V2

Each scenario must include 4+ of these elements:

1. **Mixed Validity** - True facts, false conclusions
2. **Competing Authorities** - Multiple experts disagreeing
3. **Emotional Layering** - Primary emotion masks secondary
4. **Time Pressure Gradients** - Escalating urgency
5. **Social Proof Manipulation** - Real testimonials misused
6. **Statistical Gymnastics** - True numbers, deceptive presentation
7. **Narrative Arc** - Story that shifts perspective mid-way
8. **Hedged Certainty** - Disclaimers followed by absolute claims
9. **False Balance** - Token acknowledgment before dismissal
10. **Scope Shifting** - Specific examples become universal claims
11. **Winking Admission** - Acknowledging manipulation while doing it
12. **Platform Authenticity** - Voice matches medium perfectly
13. **The Reluctant Seller** - Extensive denial before pitch
14. **Transparent Agenda** - Open about goals, still manipulative

### Peak Moments Selection

Choose keywords that visually "pop" in timeline:
- **Logic**: Statistics with %, specific numbers, "study", "research"
- **Emotion**: CAPS WORDS, multiple punctuation!!!, emoji usage
- **Balanced**: "however", "but", "although", genuine questions
- **Agenda**: Prices, "DM", "register", "limited", website URLs

### Dimension Analysis Writing V2

Must describe PROGRESSION through text:
- Start with "how" or action verb
- Reference specific movement/change
- Include specific examples in quotes
- 15-20 words maximum
- Must be unique to that scenario's narrative

**Good Example:**
"Fear escalates from vague concern to panic - 'suspicious' becomes 'trafficking' without evidence."

**Bad Example:**
"Uses emotional manipulation throughout the text."

---

## Quality Validation Criteria

### Mandatory Fallacy Constraints

#### ⚠️ ONLY USE THESE 15 FALLACIES ⚠️

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

#### ❌ DO NOT USE (Will Break System)
- `gamblers-fallacy` → use `hasty-generalization`
- `sunk-cost` → use `false-scarcity`
- `tu-quoque` → use `ad-hominem`
- `confirmation-bias` → use `cherry-picking`
- Any unlisted fallacy names

### Fallacy Usage Guidelines

1. **Primary Fallacies** (1-2 per scenario): Main logical error driving manipulation
2. **Secondary Fallacies** (0-2 per scenario): Supporting logical errors
3. **Total Limit**: Maximum 3-4 fallacies per scenario

### Logic Indicators & Emotion Triggers with Icon Mapping

#### 🎯 CRITICAL: Use Predefined Indicators and Triggers

The game uses an **Icon Mapping System** to display visual icons next to logic indicators and emotion triggers in the bear analysis panels. Using predefined indicators/triggers ensures proper icon display.

**Icon Mapping File Location**: `/data/reference/indicator-trigger-icons.json`

#### 🚨 MANDATORY Array Requirements for Game Compatibility

**EVERY scenario MUST have:**
- **Logic indicators**: 4-5 items in `analysis.logic.indicators` array
- **Emotion triggers**: 4-5 items in `analysis.emotion.triggers` array

**❌ FORBIDDEN - These will break the game:**
```json
"indicators": [],              // Empty arrays break timeline visualization
"triggers": ["only-one"],      // Too few items looks broken
"indicators": ["item1", "item2", "item3", "item4", "item5", "item6"], // Too many clutters UI
```

**✅ CORRECT Format:**
```json
"analysis": {
  "logic": {
    "scores": {
      "evidence": 25,
      "consistency": 18,
      "source": 31,
      "agenda": 78
    },
    "indicators": [
      "false-expertise",           // 1st indicator (REQUIRED)
      "fake-statistics",          // 2nd indicator (REQUIRED)
      "correlation-not-causation", // 3rd indicator (REQUIRED)
      "hasty-generalization"      // 4th indicator (REQUIRED)
    ],                           // 5th indicator (OPTIONAL)
    "explanation": "Uses fabricated credentials and selective data"
  },
  "emotion": {
    "scores": {
      "fear": 85,
      "belonging": 42,
      "pride": 38,
      "manipulation": 83
    },
    "triggers": [
      "urgency-pressure",    // 1st trigger (REQUIRED)
      "conspiracy-thinking", // 2nd trigger (REQUIRED)
      "child-safety",       // 3rd trigger (REQUIRED)
      "fake-urgency"        // 4th trigger (REQUIRED)
    ],                      // 5th trigger (OPTIONAL)
    "explanation": "Creates panic about everyday situations"
  }
}
```

#### How the Icon System Works

1. **Logic indicators** appear in `analysis.logic.indicators` array
2. **Emotion triggers** appear in `analysis.emotion.triggers` array
3. Each indicator/trigger is mapped to an emoji icon and descriptive text
4. The game's `IndicatorIconMapper` automatically displays the appropriate icon
5. Unmapped indicators show fallback text but still function

#### ⚠️ IMPORTANT: Prefer Existing Mappings

Before creating new indicators/triggers, check the appendix for all ~140 predefined options:
- Using existing mappings ensures consistent icon display
- New indicators without mappings will show generic fallback text
- Check the "Complete List of Available Logic Indicators & Emotion Triggers" appendix

#### Common Pitfalls to Avoid

1. **Using similar but incorrect keys:**
   - ❌ `"fake-expertise"` → ✅ `"false-expertise"`
   - ❌ `"manufactured-urgency"` → ✅ `"fake-urgency"`
   - ❌ `"correlation-causation"` → ✅ `"correlation-not-causation"`

2. **Creating new when existing would work:**
   - ❌ `"pet-safety"` → ✅ `"child-safety"` (adapt existing)
   - ❌ `"corporate-betrayal"` → ✅ `"corporate-greed"`
   - ❌ `"academic-anxiety"` → ✅ `"academic-concern"`

3. **Array length violations:**
   - ❌ 1-3 items (too few for good analysis)
   - ✅ 4-5 items (optimal for game display)
   - ❌ 6+ items (clutters the interface)

### Quality Checklist

Before finalizing each scenario:
- [ ] Voice matches platform/sender authenticity
- [ ] 4+ complexity elements clearly present
- [ ] Weights calculated with decimal precision
- [ ] Peak moments would visually stand out
- [ ] Dimension analysis describes progression
- [ ] Educational value teaches recognizable pattern
- [ ] No two scenarios have similar weight distributions
- [ ] Balanced scenarios show genuine complexity
- [ ] All fallacyIds from approved 15-item list
- [ ] Maximum 3-4 fallacies per scenario
- [ ] Scenario text is an average of 600 words
- [ ] Properties for all json elements have been properly assigned
- [ ] **🚨 CRITICAL: ALL four dimensions (logic, emotion, balanced, agenda) MUST have keyword arrays with at least 1 keyword each**
- [ ] **🚨 CRITICAL: No dimension may have empty keywords: [] - this breaks timeline visualization**
- [ ] **🚨 CRITICAL: Logic indicators array MUST have exactly 4-5 items**
- [ ] **🚨 CRITICAL: Emotion triggers array MUST have exactly 4-5 items**
- [ ] **🚨 CRITICAL: Use predefined indicators/triggers from the appendix when possible**
- [ ] Carefully evaluated the answers, dimensional elements, and all hints, examples, aligned phrases etc. are well suited
- [ ] The scenario has the potential to teach important critical thinking skills

---

## Technical Constraints & Capabilities

### Schema Evolution Understanding

#### Format A Complete V2.0.0 Reference Standard
- Full `analysis` and `reviewKeywords` structures
- Complete metadata with educational focus
- Proven game engine compatibility
- Enhanced with `dimensionAnalysis`
- Added human-readable educational explanations
- Dual-purpose architecture for different audiences
- Enhanced with audio support capabilities


### Required Fields for V2.0.0 Compatibility

```json
{
  "id": "string (required)",
  "title": "string (required)",
  "text": "string (required, 150-250 words)",
  "claim": "string (required)",
  "correctAnswer": "logic|emotion|balanced|agenda (required)",
  "answerWeights": "object (required)",
  "reviewKeywords": "object (required, ALL 4 dimensions with non-empty keywords)",
  "logicalFallacies": "array (required)",
  "analysis": "object (required, with specific structure - see below)",
  "wisdom": "string (required)",
  "hints": "object (required)",
  "metadata": "object (required)",
  "topic": "string (required)",
  "dimensionAnalysis": "object (required)",
  "peakMoments": "object (required, ALL 4 dimensions with non-empty arrays)"
}
```

### 🎮 Game Engine Compatibility Requirements

#### Critical `analysis` Object Structure

The `analysis` object MUST follow this exact structure for game compatibility:

```json
"analysis": {
  "logic": {
    "scores": {
      "evidence": 0-100,      // Required: Quality of evidence presented
      "consistency": 0-100,   // Required: Internal logical consistency
      "source": 0-100,        // Required: Source credibility
      "agenda": 0-100         // Required: Hidden agenda detection
    },
    "indicators": [           // MUST have 4-5 items
      "false-expertise",      // Use predefined keys from appendix
      "fake-statistics",
      "correlation-not-causation",
      "hasty-generalization"
    ],
    "explanation": "string"   // Required: 1-2 sentences
  },
  "emotion": {
    "scores": {
      "fear": 0-100,          // Required: Fear-based manipulation
      "belonging": 0-100,     // Required: Identity/belonging appeals
      "pride": 0-100,         // Required: Pride/superiority appeals
      "manipulation": 0-100   // Required: Overall manipulation level
    },
    "triggers": [             // MUST have 4-5 items
      "urgency-pressure",     // Use predefined keys from appendix
      "conspiracy-thinking",
      "child-safety",
      "fake-urgency"
    ],
    "explanation": "string"   // Required: 1-2 sentences
  }
}
```

#### ❌ Common JSON Errors That Break the Game

1. **Missing required fields in scores:**
```json
// ❌ WRONG - Missing 'agenda' score
"logic": {
  "scores": {
    "evidence": 25,
    "consistency": 18,
    "source": 31
  }
}
```

2. **Wrong array lengths:**
```json
// ❌ WRONG - Only 2 indicators
"indicators": ["false-expertise", "cherry-picked"]

// ❌ WRONG - Too many triggers
"triggers": ["fear1", "fear2", "fear3", "fear4", "fear5", "fear6", "fear7"]
```

3. **Using non-existent indicator/trigger keys:**
```json
// ❌ WRONG - These don't exist in the mapping
"indicators": ["made-up-indicator", "custom-logic-error"]
```

### 🦉 Wisdom Bear Panel Requirements

The Wisdom Bear panel synthesizes the scenario analysis and displays educational content. It requires:

#### Required Fields for Wisdom Display:
```json
"wisdom": "string (required - educational insight about the manipulation technique)",
"logicalFallacies": [  // Required array, 1-3 fallacies recommended
  {
    "fallacyId": "appeal-to-fear",  // Must use approved 15 fallacy IDs
    "severity": "primary",          // primary|secondary|major|minor
    "example": "string"             // Brief example from the scenario
  }
]
```

#### Wisdom Text Guidelines:
- **Length**: 1-2 sentences (50-100 words)
- **Tone**: Educational and friendly, appropriate for children
- **Content**: Explain the core manipulation technique in simple terms
- **Format**: Plain text (markdown will be converted to HTML)
- **Avoid**: Technical jargon, complex explanations, or referencing other fields

**Good Example:**
```json
"wisdom": "This silly scenario teaches us that even absurd claims can sound convincing when wrapped in fake authority and urgent language. Real science doesn't sell products!"
```

**Poor Example:**
```json
"wisdom": "The fallacious reasoning exhibited here demonstrates post-hoc ergo propter hoc combined with argumentum ad verecundiam."
```

### 🚨 CRITICAL reviewKeywords Structure Requirements

**MANDATORY:** Every scenario MUST have all four dimensions with keyword data:

```json
"reviewKeywords": {
  "logic": {
    "keywords": [
      { "phrase": "actual phrase from text", "weight": 1-100 }
    ],
    "explanation": "required explanation (2-3 lines when displayed in timeline interface)"
  },
  "emotion": {
    "keywords": [
      { "phrase": "actual phrase from text", "weight": 1-100 }
    ],
    "explanation": "required explanation (2-3 lines when displayed in timeline interface)"
  },
  "balanced": {
    "keywords": [
      { "phrase": "actual phrase from text", "weight": 1-100 }
    ],
    "explanation": "required explanation (2-3 lines when displayed in timeline interface)"
  },
  "agenda": {
    "keywords": [
      { "phrase": "actual phrase from text", "weight": 1-100 }
    ],
    "explanation": "required explanation (2-3 lines when displayed in timeline interface)"
  }
}
```

**❌ FORBIDDEN:** Empty keyword arrays break timeline visualization:
```json
"balanced": { "keywords": [], "explanation": "..." }  // BREAKS GAME
```

#### ReviewKeywords Explanation Length Requirements

**Current Issue**: Dimension explanations average ~105 characters / 1.5 lines (too short for timeline captions)

**Target**: 160-220 characters / 2-3 lines for better educational context when displayed in timeline interface

**Character Count Analysis:**
- **Current Average**: ~105 characters (too brief for educational value)
- **Target Range**: 160-220 characters (optimal for timeline caption display)  
- **Visual Result**: 2-3 lines instead of current 1.5 lines

**Example Improvements:**

**Too Short (130 chars)**: 
"Uses fake scientific credentials and specific fabricated statistics to sound authoritative about absurd sock consciousness claims"

**Better (195 chars)**: 
"Establishes false authority through fabricated academic credentials, then presents highly specific but completely made-up statistics (73.6%, study of 1,247 socks) to create an illusion of scientific rigor while promoting an obviously absurd claim about sock consciousness and rebellion"

**Quality Indicators for Explanations:**
- Describes HOW the manipulation works in this dimension
- Explains the psychological mechanism being employed  
- Provides educational context for understanding the pattern
- 2-3 lines of substantive analysis rather than brief summary

### Audio Support Fields

```json
{
  "audioScript": "string (dialogue scenarios)",
  "audioHints": {
    "tone": "string",
    "pacing": "string", 
    "characterVoices": "object"
  }
}
```

### Memory-Safe Generation

Generate in batches of 5 scenarios:
1. Create complete JSON structure for 5 scenarios
2. Validate all fields present
3. Check memory usage
4. Continue with next batch

Current performance metrics:
- 5 scenarios: ~25KB
- Memory usage: 2.32 MB (minimal)
- No errors or slowdowns

---

## Advanced Generation Techniques

### Platform-Specific Voice Patterns

#### Email Format
```
From: [Authority]@[Institution].com
Subject: [Specific concern]

[Professional greeting]
[Credibility establishment]
[Data presentation with conflicts]
[Winking admission of complexity]
[Proposed solution with hidden agenda]

[Signature with credentials]
```

#### Social Media Posts
```
[Platform-specific opening]
[Personal story/anecdote]
[Statistical validation]
[Emotional escalation]
[Community solidarity building]
[Call to action with urgency]
[Hashtags revealing agenda]
```

#### Academic/Professional Voice
```
[Credential establishment]
[Research citation]
[Methodology explanation]
[Contradictory findings acknowledgment]
[Biased interpretation]
[Subtle pitch for service/product]
```

### Successful Scenario Patterns

#### The Reluctant Expert
1. Establish expertise and credibility
2. Admit uncertainty and complexity
3. Present conflicting evidence fairly
4. Gradually reveal personal agenda
5. Soft pitch disguised as education

#### The Concerned Parent/Community Member
1. Relatable personal experience
2. Research and "discovery" of threat
3. Escalation through emotional language
4. Social proof and community pressure
5. Solution that requires purchase/action

#### The Reformed Skeptic
1. Former opposition to idea/product
2. "Research" that changed their mind
3. Data presentation with selective interpretation
4. Emotional transformation narrative
5. Evangelical promotion of new position

### Success Metrics for Pack Quality

A well-crafted scenario pack should:
- Teach 10 distinct manipulation patterns
- Include 3-4 genuinely balanced scenarios
- Show progression in difficulty (1-4 rating)
- Cover diverse topics and platforms
- Feel current and realistic
- Make players think "I've seen this exact thing!"

### Educational Goals

The goal is education through recognition. Players should finish thinking:
- "Now I understand how that works!" 
- "I can spot this pattern in real life"
- "I know what questions to ask now"

NOT just:
- "That was obviously fake"
- "Easy to spot manipulation"

---

## Conclusion

This comprehensive dataset provides all necessary components for generating sophisticated, educational scenarios that:

1. **Teach Critical Thinking**: Through recognition of realistic manipulation patterns
2. **Maintain Educational Rigor**: With precise scoring and validated fallacy frameworks  
3. **Ensure Technical Compatibility**: Through proper schema adherence and field requirements
4. **Scale Effectively**: With memory-safe generation and systematic quality validation

The combination of detailed examples, proven patterns, and strict constraints enables AI systems to generate high-quality scenarios that meet Phuzzy Think Tank's educational mission while maintaining technical compatibility with the game engine.

---

## Appendix: Complete List of Available Logic Indicators & Emotion Triggers

### Logic Indicators (for `analysis.logic.indicators`)

#### Evidence Quality
- `weak-evidence` - 🚫 Weak or missing evidence
- `zero-evidence` - 🚫 Zero evidence of threat
- `specific-data` - ✅ Specific study data shared
- `tested-data` - 🧪 Personal testing/experiments
- `anecdotal-evidence` - 💬 Anecdotal evidence only
- `anecdotal-proof` - 👤 Single story as proof
- `fake-statistics` - 🎲 Fabricated statistics
- `selective-evidence` - 🎯 Selective evidence use
- `cherry-picked` - 🍒 Cherry-picked sample
- `multiple-studies` - 📚 Multiple studies reviewed
- `large-sample` - 📊 Large sample size
- `survey-data` - 📋 Survey data included
- `systematic-testing` - 🧪 Systematic testing done
- `peer-review-counts` - 📑 Peer review counts

#### Reasoning Patterns
- `logical-fallacy` - 🤔 Logical fallacy detected
- `correlation-not-causation` - 🔗 Correlation ≠ causation
- `contradicts-evidence` - ❌ Contradicts vast evidence
- `data-contradicts-conclusion` - ❌ Data contradicts claim
- `contradiction-posting` - ↔️ Self-contradicting post
- `oversimplified-math` - ➗ Math oversimplified
- `oversimplified-science` - 🧬 Science oversimplified
- `pattern-forcing` - 🎯 Forcing false patterns
- `pattern-invention` - 🌀 False patterns claimed
- `probability-misunderstanding` - 🎲 Probability errors
- `mathematical-certainty-claimed` - 🧮 False mathematical certainty
- `conspiracy-theory` - 🕳️ Conspiracy reasoning
- `conspiracy-thinking` - 🕳️ Conspiracy logic
- `speculation` - 😱 Pure speculation

#### Source Reliability
- `qualified-expert` - ✅ Qualified expert source
- `biased-source` - 📱 Questionable source reliability
- `facebook-source` - 📱 "Read on Facebook" source
- `forgotten-source` - ❓ Source forgotten/vague
- `vague-authority` - 🌫️ Vague authority cited
- `industry-funded` - 🏭 Likely industry-funded source
- `credible-institution` - 🎓 Credible institution source
- `false-expertise` - 🎭 False expertise claimed
- `fake-expertise` - 🎭 False expertise claimed (alias)
- `professional-experience` - 💼 Professional experience
- `multiple-sources` - 📚 Multiple sources cited
- `cites-research` - 📚 Cites research sources

#### Transparency & Methodology
- `acknowledges-limits` - ✅ Acknowledges limitations
- `mentions-alternatives` - ✅ Mentions alternatives
- `shows-uncertainty` - 🤔 Shows uncertainty/questioning
- `ignored-alternatives` - 🚪 Ignores other options
- `honest-complexity` - 🌐 Admits complexity
- `seeks-context` - 🔍 Seeks fuller context
- `questions-data` - ❔ Questions the data
- `methodology-transparent` - 📋 Methods explained clearly
- `no-context` - ❌ Missing context

#### Agenda Detection
- `hidden-agenda` - 💰 Hidden sales agenda
- `hidden-sales` - 💰 Hidden sales agenda
- `profit-motive` - 💰 Clear profit motive
- `economic-pressure` - 💼 Economic pressures noted
- `aggressive-sales` - 💰 Aggressive sales tactics
- `veiled-threats` - ⚡ Subtle threats made

#### Marketing/Manipulation Tactics
- `fake-urgency` - ⏰ Artificial urgency created
- `manufactured-urgency` - ⏰ Artificial urgency created (alias)
- `slippery-slope` - 🎿 Slippery slope reasoning
- `false-dilemma` - ⚔️ False choice presented
- `hasty-generalization` - 🏃 Rushed generalization
- `anthropomorphic-reasoning` - 🤖 Human traits to objects

### Emotion Triggers (for `analysis.emotion.triggers`)

#### Fear-Based
- `child-safety` - 🚸 Child safety panic
- `child-anxiety` - 👶 Child anxiety trigger
- `child-brain-damage` - 🧠 Brain damage fear
- `child-suffering` - 😢 Child suffering fear
- `predator-terror` - 😱 Predator terror appeal
- `stranger-danger` - 🚨 Stranger danger fear
- `technology-panic` - 📱 Technology panic
- `economic-fear` - 💰 Economic fear tactics
- `poverty-fear` - 💸 Poverty fear
- `addiction-fear` - 💊 Addiction fear
- `health-worry` - 🏥 Health concerns
- `safety-panic` - 🚨 Safety panic

#### Identity & Belonging
- `us-vs-them` - 👥 Us vs. them mentality
- `wake-up-superiority` - 🐑 "Wake up" superiority
- `protective-parent` - 🛡️ Protective parent identity
- `smart-parent-pride` - 🎖️ Smart parent appeal
- `parent-unity` - 🤝 Parent solidarity
- `community-building` - 🏘️ Community building appeal
- `family-activity` - 👨‍👩‍👧‍👦 Family activity appeal
- `identity-threat` - 🆔 Identity threat
- `change-maker-identity` - 🦸 Change-maker identity

#### Shame & Guilt
- `body-shame` - 😢 Body shame activation
- `bad-parent-shame` - 😞 Bad parent shaming
- `parent-guilt` - 😔 Parent guilt
- `mother-guilt` - 👩 Mother guilt trigger
- `productivity-shame` - 📉 Productivity shame
- `wasted-money` - 💸 Wasted money regret
- `environmental-guilt` - 🌍 Environmental guilt

#### Pride & Status
- `harvard-credibility` - 🎓 Harvard credibility appeal
- `academic-authority` - 🎓 Academic authority appeal
- `professional-trust` - 🤝 Professional trust appeal
- `ethical-superiority` - ✨ Ethical superiority
- `health-superiority` - 💪 Health superiority
- `beauty-anxiety` - 💃 Beauty standard anxiety
- `insider-knowledge` - 🔑 Insider knowledge

#### Urgency & Pressure
- `urgency-pressure` - ⚡ URGENT pressure tactics
- `fomo` - ⏳ Fear of missing out
- `missing-out` - 🎯 Missing out fear
- `decision-paralysis` - 🤷 Decision paralysis

#### Manipulation Patterns
- `household-chaos` - 🏠 Everyday chaos amplified
- `conspiracy-thinking` - 🕳️ Conspiracy theory appeal
- `hope-solution` - 💊 Hope for solution
- `police-wont-help` - 🚔 "Police won't help" narrative
- `anti-establishment` - 🏴 Anti-establishment appeal
- `theyre-lying` - 😤 "They're lying to you"
- `fake-urgency` - ⏰ Artificial urgency created

#### Social Pressure
- `academic-concern` - 📚 Academic performance worry
- `scholarship-threat` - 🎓 Scholarship threat
- `teacher-care` - 💕 Teacher showing care
- `partnership-request` - 🤝 Partnership approach
- `peer-pressure` - 👫 Peer pressure
- `community-threat` - 🏘️ Community threat
- `community-judgment` - 👥 Community judgment fear
- `public-shaming` - 📢 Public shame threat

### Usage Guidelines

1. **Select from existing mappings** - These are all predefined with icons
2. **Use exact names** - Copy the indicator/trigger name exactly as shown
3. **Typical usage**: 3-5 indicators/triggers per scenario
4. **Balance coverage** - Mix different categories for realistic scenarios
5. **Match to content** - Ensure indicators/triggers align with scenario text

**Example Implementation:**
```json
"analysis": {
  "logic": {
    "indicators": ["fake-expertise", "cherry-picked", "manufactured-urgency"],
    "explanation": "Uses false credentials and selective data with time pressure"
  },
  "emotion": {
    "triggers": ["household-chaos", "urgency-pressure", "conspiracy-thinking"],
    "explanation": "Amplifies everyday problems into crisis requiring immediate action"
  }
}
```

---

*Compiled from analysis of 151 scenarios across 16 scenario packs, 3 specification versions, comprehensive educational framework documentation, and the complete icon mapping system.*
