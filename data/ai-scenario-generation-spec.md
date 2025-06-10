# AI Scenario Generation Specification for Phuzzy's Think Tank

## Overview
Generate 10 educational scenarios that teach critical thinking by presenting arguments that use logic, emotion, hidden agendas, or balanced reasoning. Each scenario must include comprehensive analysis data with precise, nuanced scoring that reflects linguistic complexity.

## Pre-Generation Research Phase

Before generating scenarios, analyze these frameworks:

### Critical Thinking Dimensions
- **Bloom's Taxonomy**: Evaluate arguments at different cognitive levels (remember, understand, apply, analyze, evaluate, create)
- **Paul-Elder Framework**: Universal intellectual standards (clarity, accuracy, precision, relevance, depth, breadth, logic)
- **Toulmin Model**: Claims, grounds, warrants, backing, qualifiers, rebuttals

### Persuasion Mechanisms
- **Cialdini's Principles**: Reciprocity, commitment/consistency, social proof, authority, liking, scarcity
- **Aristotle's Appeals**: Logos (logic), Ethos (credibility), Pathos (emotion), Kairos (timing)
- **Kahneman's Dual Systems**: System 1 (fast/intuitive/emotional) vs System 2 (slow/deliberate/logical)

### Linguistic Complexity Markers
- **Hedging language**: "might", "perhaps", "studies suggest", "it appears"
- **Certainty markers**: "definitely", "proven", "everyone knows", "obviously"
- **Temporal framing**: Present urgency vs future consequences
- **Statistical sophistication**: Raw numbers vs percentages vs relative risk vs absolute risk

## Core Requirements

### Scenario Content Requirements
1. **Length**: 150-300 words
2. **Format**: Written as social media posts, emails, news articles, or advertisements
3. **Voice**: First-person or organizational perspective
4. **Topic diversity**: Health, safety, parenting, finance, community, technology, environment
5. **Manipulation techniques**: Include various persuasion tactics (fear, urgency, false logic, cherry-picking, etc.)

### Scenario Complexity Matrix

Each scenario must include AT LEAST 3 of these complexity elements:

1. **Mixed Validity** - Some true facts mixed with false conclusions
2. **Competing Authorities** - Multiple "experts" with conflicting views
3. **Emotional Layering** - Primary emotion (fear) masking secondary (greed)
4. **Time Pressure Gradients** - Escalating urgency throughout text
5. **Social Proof Manipulation** - Real testimonials used misleadingly
6. **Statistical Gymnastics** - True numbers presented deceptively
7. **Narrative Arc** - Personal story that shifts perspective mid-way
8. **Hedged Certainty** - Disclaimers followed by absolute claims
9. **False Balance** - Token acknowledgment of other views before dismissing them
10. **Scope Shifting** - Moving between specific examples and universal claims

### Four Answer Categories
- **Logic (🧠)**: Flawed reasoning, missing evidence, logical fallacies
- **Emotion (💖)**: Fear mongering, guilt trips, tribalism, hope manipulation  
- **Balanced (⚖️)**: Fair consideration of multiple perspectives, acknowledges complexity
- **Agenda (🎯)**: Hidden commercial/political motives, biased sources, sales pitches

## JSON Output Format

Generate exactly this structure for each scenario:

```json
{
  "id": "unique-slug-###",
  "title": "The [Descriptive Title]",
  "text": "[Full scenario text with natural speech patterns, capitals for emphasis, emojis where appropriate]",
  "claim": "[One sentence summary of what the scenario is arguing]",
  
  "keywords": {
    "logic": ["study", "research", "data", "evidence", "proves"],
    "emotion": ["URGENT", "danger", "terrifying", "save", "protect"],
    "balanced": ["however", "consider", "although", "perspective", "both"],
    "agenda": ["buy now", "limited time", "exclusive", "discount", "offer"]
  },
  
  "answerWeights": {
    "logic": 23,      // Precise 0-100, MUST vary (avoid 20, 25, 30, etc.)
    "emotion": 87,    // Highest value determines correctAnswer
    "balanced": 12,   // How much balanced reasoning present
    "agenda": 48      // Commercial/political motive strength
  },
  
  "correctAnswer": "emotion",  // Dimension with highest weight
  
  "dimensionAnalysis": {
    "logic": "Evidence quality degrades from vague anecdote to universal law - 'I saw' becomes 'everyone knows' without data.",
    "emotion": "Fear escalates through urgent capitals and protective parent triggers - rational thought overridden by child safety panic.",
    "balanced": "No alternative explanations considered - delivery driver or lost tourist possibilities completely ignored.",
    "agenda": "Sales motive emerges after fear peak - convenient camera solution from family member reveals profit incentive."
  },
  
  "analysis": {
    "logic": {
      "scores": {
        "evidence": 25,        // 0-100: Quality of supporting evidence
        "consistency": 30,     // 0-100: Internal logical consistency
        "source": 20,          // 0-100: Credibility of sources cited
        "agenda": 85           // 0-100: Hidden agenda presence
      },
      "indicators": ["zero-evidence", "facebook-source", "hidden-sales", "pure-speculation"],
      "explanation": "No actual evidence of threat, just fear-based speculation"
    },
    "emotion": {
      "scores": {
        "fear": 95,           // 0-100: Fear-based manipulation
        "belonging": 60,      // 0-100: Us-vs-them, community pressure
        "pride": 30,          // 0-100: Ego, status, superiority appeals
        "manipulation": 90    // 0-100: Overall emotional manipulation
      },
      "triggers": ["child-safety-panic", "police-wont-help", "us-vs-them", "urgent-pressure"],
      "explanation": "Maximum fear manipulation to drive sales"
    }
  },
  
  "logicalFallacies": [
    {
      "fallacyId": "hasty-generalization",
      "severity": "primary",   // primary|secondary
      "example": "One slow van means entire neighborhood is being cased by traffickers"
    },
    {
      "fallacyId": "slippery-slope",
      "severity": "secondary",
      "example": "If we don't act now, children will be kidnapped"
    }
  ],
  
  "peakMoments": {
    "logic": ["out-of-state plates", "Facebook told me"],
    "emotion": ["URGENT", "trafficking", "SAVE LIVES!!!"],
    "balanced": [],
    "agenda": ["buy security cameras NOW", "neighbor discount"]
  },
  
  "wisdom": "Classic fear-to-sale manipulation: manufacture crisis through unsubstantiated trafficking panic, then conveniently offer security cameras. Notice how evidence-free speculation escalates to life-or-death urgency.",
  
  "hints": {
    "keywords": ["URGENT", "trafficking", "danger", "security cameras", "neighbor discount"],
    "strategy": "emotion",
    "hintMessage": "Look for dramatic language and emotional triggers!"
  },
  
  "metadata": {
    "tags": ["security", "fear-mongering", "sales-pitch", "neighborhood"],
    "difficulty": 2,  // 1-3
    "educationalFocus": "recognizing-fear-based-marketing",
    "addedDate": "2024-01-01"
  },
  
  "suggestedMappings": {  // OPTIONAL - only if new concepts needed
    "logic": [
      {"key": "social-proof-fake", "suggested": "👥 Fake social proof", "reason": "Uses made-up testimonials"}
    ],
    "emotion": []  // None needed for this scenario
  }
}
```

## Field Summary
Total unique AI-generated fields: **11 core data structures**
1. `keywords` - Shared by timeline, hints, review
2. `answerWeights` - Used by radar, scoring, review
3. `correctAnswer` - Derived from highest weight
4. `dimensionAnalysis` - Info boxes and review
5. `analysis.logic.scores` - Bear meter values
6. `analysis.logic.indicators` - Logic issues list
7. `analysis.emotion.scores` - Bear meter values  
8. `analysis.emotion.triggers` - Emotion triggers list
9. `logicalFallacies` - Card collection system
10. `wisdom` - Post-answer education
11. `hints` - Honey pot system

## Analysis Methodology

### 1. Keyword Extraction
- Scan text for words/phrases that signal each dimension
- Keywords should be actual words from the scenario text
- Include variations (CAPS, punctuation)
- 4-8 keywords per dimension

### 2. Answer Weight Calculation - PRECISE METHODOLOGY

#### Step 1: Linguistic Feature Extraction
Count specific features per 100 words:
- **Emotion markers**: Intensifiers ("extremely", "devastating"), exclamations, emotional vocabulary
- **Logic markers**: Causal connectors ("therefore", "because"), evidence citations, qualifiers
- **Balance markers**: Contrasting conjunctions ("however", "although"), acknowledgments
- **Agenda markers**: Calls-to-action, product mentions, political framing

#### Step 2: Rhetorical Device Scoring (0-10 scale)
- **Repetition patterns**: Key phrases repeated for emphasis
- **Metaphorical language**: Vivid comparisons that bypass logic
- **Question-answer structures**: Leading questions with assumed answers
- **Parallel construction**: Rhythmic patterns that enhance persuasion

#### Step 3: Calculate Raw Scores
```
emotion_raw = (emotion_markers * 2.5) + (rhetorical_emotion * 3) + (caps_percentage * 1.5)
logic_raw = (evidence_quality * 4) + (source_credibility * 3) + (logical_structure * 3)
balanced_raw = (perspective_count * 5) + (limitation_acknowledgments * 3) + (nuance_markers * 2)
agenda_raw = (product_mentions * 3) + (action_urgency * 4) + (benefit_claims * 3)
```

#### Step 4: Normalize to Precise Percentages
- Convert raw scores to 0-100 scale
- Use EXACT calculations (e.g., 67, 34, 89)
- AVOID multiples of 5 or 10 unless calculation genuinely results in them
- Weights should reflect the actual linguistic complexity found

### 3. Detailed Breakdowns (0-100 scale)

**Logic Breakdown Scoring:**
- Evidence: 0 = pure speculation, 100 = peer-reviewed data
- Consistency: 0 = contradictory, 100 = perfectly logical
- Source Credibility: 0 = "my friend said", 100 = expert consensus
- Hidden Agenda: 0 = transparent, 100 = deceptive motives

**Logic Indicators (3-4 word descriptors):**
Use these predefined keys when possible:

Positive indicators:
- `qualified-expert` → ✅ Qualified expert source
- `specific-data` → ✅ Specific study data shared
- `acknowledges-limits` → ✅ Acknowledges limitations
- `mentions-alternatives` → ✅ Mentions alternatives
- `multiple-studies` → 📚 Multiple studies reviewed
- `large-sample` → 📊 Large sample size
- `cost-benefit` → 💰 Cost-benefit analysis

Negative indicators:
- `zero-evidence` → 🚫 Zero evidence of threat
- `facebook-source` → 📱 "Read on Facebook" source
- `hidden-sales` → 💰 Hidden sales agenda
- `pure-speculation` → 😱 Pure speculation
- `cherry-picked` → 🍒 Cherry-picked sample
- `false-urgency` → ⏰ Artificial urgency created
- `slippery-slope` → 🎿 Slippery slope reasoning
- `false-dilemma` → ⚔️ False choice presented
- `hasty-generalization` → 🏃 Rushed generalization

**Emotion Breakdown Scoring:**
- Fear: 0 = calm, 100 = panic-inducing
- Belonging: 0 = inclusive, 100 = us-vs-them warfare
- Pride: 0 = humble, 100 = superiority complex
- Manipulation: 0 = honest, 100 = exploitative

**Emotion Triggers (3-4 word descriptors):**
Use these predefined keys when possible:

- `child-safety-panic` → 👶 Child safety exploitation
- `us-vs-them` → 🆚 Us versus them mentality
- `urgent-pressure` → ⏰ Artificial time pressure
- `guilt-shame` → 😔 Guilt and shame tactics
- `lifestyle-envy` → 🏖️ Lifestyle envy trigger
- `protective-instinct` → 🛡️ Protective parent identity
- `community-threat` → 🏘️ Community in danger
- `personal-attack` → 👤 Personal identity attack
- `fomo` → 😰 Fear of missing out
- `authority-pressure` → 👮 Authority figure pressure

**NEW MAPPING REQUESTS:**
If the scenario needs indicators/triggers that don't fit well with existing options:
1. Use the closest available option from the list above
2. Add a "suggestedMappings" field with your recommendations:

```json
"suggestedMappings": {
  "logic": [
    {"key": "ai-generated-data", "suggested": "🤖 AI-generated statistics", "reason": "Scenario involves fake AI research claims"},
    {"key": "influencer-science", "suggested": "📸 Influencer 'science'", "reason": "Social media personality making health claims"}
  ],
  "emotion": [
    {"key": "pet-owner-guilt", "suggested": "🐕 Pet owner guilt", "reason": "Manipulates love for pets"},
    {"key": "eco-shame", "suggested": "🌍 Environmental shaming", "reason": "Guilts about carbon footprint"}
  ]
}
```

### 4. Dimension Analysis Writing
Write 1-2 sentences per dimension that:
- Identify the specific technique used
- Explain how it manifests in this scenario
- Use vivid, educational language
- Reference specific parts of the text

### 5. Logical Fallacy Identification
Only include if clearly present. Common fallacies:
- `hasty-generalization`: Broad conclusion from limited data
- `false-dilemma`: Only two options presented
- `slippery-slope`: Extreme consequences predicted
- `ad-hominem`: Attacking the person not argument
- `appeal-to-fear`: Using fear instead of logic
- `false-scarcity`: Fake urgency/limited availability
- `post-hoc`: Correlation assumed as causation

### 6. Educational Insight
Write 1-2 sentences that:
- Summarize the core manipulation technique
- Explain why it's effective
- Help players recognize it in real life

## Three-Pass Generation Process

### Pass 1: Initial Draft
Generate scenario with basic structure and claims

### Pass 2: Complexity Enhancement
- Add contradictory evidence
- Layer in subtle biases  
- Introduce competing narratives
- Embed statistical nuance
- Add hedging language followed by certainty
- Include token counterarguments

### Pass 3: Weight Precision & Analysis
- Recount all linguistic features
- Apply weight calculation formula
- Calculate weights to single-digit precision
- Verify weights reflect actual complexity
- Ensure variety in final digits (avoid patterns like all weights ending in 0, 2, 5, 7)

## Nuanced Language Analysis Requirements

### Micro-Persuasion Techniques to Identify
- **Presuppositions**: "When you realize..." (assumes realization will occur)
- **Nominalization**: Turning processes into things ("the danger" vs "becoming endangered")
- **Modal verbs**: Must, should, could - indicating necessity/possibility gradients
- **Deletion patterns**: Vague references ("studies show", "experts agree")
- **Distortion patterns**: Mind reading ("you're probably thinking...")
- **Generalization patterns**: Universal quantifiers ("all", "never", "everyone")

### Emotional Trajectory Mapping
Chart emotional intensity through the text:
- **Opening hook** (0-20%): Establish rapport or concern
- **Escalation phase** (20-60%): Build tension/urgency
- **Peak manipulation** (60-80%): Maximum emotional pressure
- **Call to action** (80-100%): Convert emotion to action

### Logical Structure Deconstruction
- **Warrant identification**: Unstated assumption connecting evidence to claim
- **Missing rebuttals**: Counterarguments not addressed
- **False equivalencies**: Unlike things compared as equal
- **Scope shifts**: Specific case → universal claim
- **Cherry-picked data**: Selective evidence presentation

## Enhanced Complexity Example

Instead of: "This supplement helps with energy. Studies show it works. Buy now!"

Generate: "Dr. Martinez (Harvard '03) found arsenic in tap water - same chemical in rat poison! While EPA says 10ppb is 'safe', that's 10x higher than Europe allows. My daughter's rash cleared up after we switched to SpringPure™. Sure, correlation isn't causation, but can you risk your family's health? CDC admits long-term studies are 'ongoing'. Meanwhile, SpringPure™ removes 99.9% of contaminants (in lab conditions). Use code SAFETY for 20% off - because while scientists debate, parents must act."

This has:
- True fact (arsenic limits differ) mixed with misleading comparison
- Personal anecdote with admitted logical flaw
- Genuine uncertainty weaponized
- Hidden agenda with partial disclosure
- Multiple complexity layers

Resulting in precise weights like: logic: 34%, emotion: 67%, balanced: 23%, agenda: 78%

## Validation Criteria

✓ **Text** contains 3+ complexity elements
✓ **Keywords** are actually in the scenario text
✓ **Weights** are precise single digits (NOT multiples of 5)
✓ **Weights** show realistic variety (e.g., 34, 67, 23, 78)
✓ **Analysis** references specific linguistic features
✓ **Breakdowns** align with weights using the formula
✓ **Fallacies** have concrete examples from text
✓ **Educational value** teaches recognizable real-world patterns

## Example Validation
If emotion weight = 87%, then emotion breakdown scores should average 80-90
If logic weight = 23%, then logic breakdown scores should average 20-30

## Score Correlation Guidelines
The breakdown scores should relate to answerWeights:
- If logic answerWeight = 25%, then logic scores (evidence, consistency, source) should average around 20-30
- If emotion answerWeight = 87%, then emotion scores (fear, belonging, pride) should average around 80-90
- Individual scores can vary ±20 from the average to show nuance

## Topics to Cover (pick 10)
1. Health supplements/miracle cures
2. Neighborhood safety/crime
3. Parenting advice/child safety
4. Investment opportunities
5. Environmental issues
6. Technology dangers/benefits
7. Political candidates/issues
8. Food safety/nutrition
9. Education methods
10. Social media trends
11. Workplace changes
12. Community projects

## Advanced Generation Techniques (Learned from Practice)

### 1. **Voice and Format Variation**
- **Email formats**: Use From/Subject/Body structure for workplace scenarios
- **Social media posts**: Include platform-specific elements (NextDoor for neighborhood, LinkedIn for professional)
- **Direct address**: "Ladies," "MOMS," "Team," to create immediate connection
- **Question endings**: "What would you honestly do?" to engage reader participation

### 2. **Complexity Patterns That Work**
- **Statistical whiplash**: "78% support it, but only 23% would pay" - revealing gaps between stated values and actions
- **Winking admission**: "correlation, not causation 😉" - acknowledging manipulation while doing it
- **Competing authorities**: MIT research vs European regulations vs FDA - create confusion
- **Infrastructure reality**: "compostable cups need industrial facilities we don't have"

### 3. **Emotional Sophistication**
- **Layered fears**: Start with one fear (health), reveal another (money), hide the third (status)
- **Pride traps**: "Other parents with their zombie children" - superiority as manipulation tool
- **Workplace coercion**: "voluntary" with career consequences - power dynamics
- **False concessions**: "I'm not extreme" while being extreme - self-awareness theater

### 4. **Balanced Scenario Techniques**
- **Genuine questions**: End with real requests for input, not rhetorical manipulation
- **Multiple stakeholders**: Show different groups' conflicting needs (customers vs employees)
- **Admission of agenda**: "looks better for marketing" - transparency about mixed motives
- **Real trade-offs**: Every solution has documented downsides

### 5. **Weight Calculation Refinements**
- **Avoid patterns**: Don't let all scenarios in a pack have similar weight distributions
- **Match complexity**: More nuanced scenarios should have closer weight values
- **Surprise inversions**: High logic score with emotion as correct answer (when logic is weaponized)
- **Decimal thinking**: Calculate to decimal, then round (e.g., 71.4 → 71, not 70)

### 6. **Scenario Arc Patterns**
- **Hook → Escalation → Pivot → Call**: Standard manipulation arc
- **Data → Doubt → Dilemma → Question**: Balanced presentation arc
- **Authority → Undermining → Conspiracy → Product**: Agenda-driven arc
- **Problem → Agitation → Solution → Urgency**: Classic sales arc

### 7. **Language Precision Tips**
- **Specificity sells**: "$3,000/month" beats "expensive"
- **Time pressure gradients**: "This Saturday" → "Limited spots" → "before they shut us down"
- **Credibility props**: "Harvard '03" more believable than just "Harvard"
- **Contradiction flags**: "However," "That said," "Of course... but"

Generate 10 complete scenarios following this specification exactly, incorporating these advanced techniques for more sophisticated and varied content.