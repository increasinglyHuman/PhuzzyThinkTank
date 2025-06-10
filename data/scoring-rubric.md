# Phuzzy Think Tank Scoring Rubric

## Overview
Each scenario is scored on four dimensions from 0-100. These scores represent "how much this scenario exhibits this quality" and can be visualized as fuzzy curves.

## Scoring Dimensions

### 1. Logic Score (0-100)
**Measures:** Presence of logical fallacies and weak reasoning

- **90-100**: Extreme logical fallacies, zero valid evidence
  - Multiple major fallacies
  - Completely unsupported claims
  - Contradictory reasoning
  
- **70-89**: Major logical flaws dominate
  - Several significant fallacies
  - Weak or dubious evidence
  - Poor reasoning throughout
  
- **40-69**: Mixed logical issues with some valid points
  - Some fallacies present
  - Partially supported claims
  - Inconsistent reasoning
  
- **10-39**: Mostly sound with minor weaknesses
  - Occasional minor fallacies
  - Generally good evidence
  - Solid reasoning overall
  
- **0-9**: Logically sound throughout
  - No significant fallacies
  - Strong evidence-based
  - Consistent reasoning

### 2. Emotion Score (0-100)
**Measures:** Level of emotional manipulation

- **90-100**: Pure emotional manipulation
  - Fear-mongering at maximum
  - Guilt/shame tactics dominant
  - Multiple emotional triggers
  - No substance beneath emotion
  
- **70-89**: Heavy emotional manipulation
  - Strong fear/guilt appeals
  - Emotional language dominates
  - Limited factual content
  
- **40-69**: Moderate emotional appeals
  - Some emotional triggers
  - Mix of emotion and substance
  - Noticeable but not overwhelming
  
- **10-39**: Light emotional elements
  - Minor emotional language
  - Emotion supports valid points
  - Professional tone maintained
  
- **0-9**: Minimal emotional content
  - Purely factual presentation
  - No manipulation tactics
  - Neutral professional tone

### 3. Balanced Score (0-100)
**Measures:** Fairness and acknowledgment of complexity

- **90-100**: Perfect balance
  - Acknowledges all perspectives
  - Presents pros and cons equally
  - Admits uncertainties
  - Encourages informed choice
  
- **70-89**: Very balanced
  - Multiple viewpoints presented
  - Minor bias present
  - Generally fair treatment
  
- **40-69**: Somewhat balanced
  - Some alternative views mentioned
  - Noticeable lean to one side
  - Partial acknowledgment of complexity
  
- **10-39**: Limited balance
  - Mostly one-sided
  - Token mention of alternatives
  - Clear bias throughout
  
- **0-9**: Completely one-sided
  - No alternative perspectives
  - Black-and-white presentation
  - Refuses to acknowledge complexity

### 4. Agenda Score (0-100)
**Measures:** Hidden profit motive or ulterior agenda

- **90-100**: Blatant hidden agenda
  - Clear profit motive
  - Deceptive sales tactics
  - Manipulation for gain
  - No attempt to hide agenda
  
- **70-89**: Strong hidden agenda
  - Profit motive poorly disguised
  - Conflict of interest present
  - Agenda drives content
  
- **40-69**: Moderate agenda
  - Some commercial interest
  - Partially transparent
  - Mixed motives
  
- **10-39**: Minor agenda
  - Slight commercial element
  - Mostly transparent
  - Agenda doesn't dominate
  
- **0-9**: No hidden agenda
  - Completely transparent
  - No profit motive
  - Pure information sharing

## Determining Correct Answer

The **correct answer** is the dimension with the highest score, representing the primary characteristic of the argument. This creates natural "fuzzy" boundaries where scenarios can exhibit multiple characteristics.

### Example Interpretations:
- **Logic: 85, Emotion: 95, Balanced: 5, Agenda: 85**
  → Correct answer: "emotion" (highest at 95)
  → But also shows high logical fallacies and hidden agenda

- **Logic: 15, Emotion: 30, Balanced: 85, Agenda: 20**
  → Correct answer: "balanced" (highest at 85)
  → Shows good reasoning with minimal manipulation

## Answer Weights
The `answerWeights` in the JSON represent these raw scores, allowing:
- Partial credit for near-correct answers
- Visualization as fuzzy curves
- Nuanced understanding of argument characteristics
- Future features like radar charts or fuzzy logic diagrams

## Review Keywords
Each scenario should include specific keywords that exemplify each dimension, helping players learn to recognize these patterns in real-world arguments.