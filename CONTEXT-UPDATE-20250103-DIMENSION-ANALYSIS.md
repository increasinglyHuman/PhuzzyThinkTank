# Phuzzy's Think Tank - Dimension Analysis System
**Date:** January 3, 2025  
**Session:** Timeline Analysis & AI-Ready Scenario Generation  

## 🎯 Critical Feature: Dimension Analysis Strings

### What We Built
We've added a new `dimensionAnalysis` field to the scenario JSON structure that provides **scenario-specific descriptions** of how each dimension manifests in that particular narrative. This is a crucial enhancement that must be preserved.

### JSON Structure Addition
```json
{
  "id": "scenario-id",
  "title": "Scenario Title",
  "text": "...",
  "dimensionAnalysis": {
    "logic": "Evidence crumbles on examination - 50 unnamed scientists versus thousands of published studies reveals cherry-picking.",
    "emotion": "Fear escalates from curiosity to terror - child safety panic peaks with multiple exclamation points and emoji alarms.",
    "balanced": "Zero alternative explanations - no mention of delivery drivers, house hunting, or any innocent possibilities.",
    "agenda": "Classic fear-to-sale pipeline - manufacture crisis, amplify terror, then conveniently offer brother's security cameras."
  }
}
```

### Implementation Details

#### 1. Data Structure (`data/scenarios.json`)
- **Location:** After `reviewKeywords`, before `analysis`
- **Format:** Object with 4 required keys: logic, emotion, balanced, agenda
- **Content:** 15-20 word descriptions specific to THAT scenario's narrative arc
- **Purpose:** Describes what the timeline visualization reveals about manipulation patterns

#### 2. Frontend Integration (`js/ui/timeline-analysis.js`)
- **Function:** `updateInfoBoxes()`
- **Logic Flow:**
  1. Checks for most recently enabled/highlighted dimension
  2. Falls back to highest-weighted dimension
  3. Displays scenario-specific text if available
  4. Falls back to generic descriptions if not
- **Styling:** Box background, border, and title colors change to match dimension

#### 3. Key Code Sections
```javascript
// In timeline-analysis.js
if (this.currentScenario.dimensionAnalysis && this.currentScenario.dimensionAnalysis[selectedDimension]) {
    analysisText = this.currentScenario.dimensionAnalysis[selectedDimension];
}
```

### ⚠️ CRITICAL: Do Not Break This System

The dimension analysis system is architected for **AI-powered scenario generation**. Future plans include:

1. **Batch Generation:** AI will generate 10-1000s of scenarios at once
2. **Complete Analysis:** Each scenario will include:
   - Narrative text and claim
   - Answer weights for all dimensions
   - Review keywords with explanations
   - **Dimension analysis strings** (this new feature)
   - Logical fallacies
   - Full scoring metrics

3. **Quality Assurance:** The strings must:
   - Be specific to that scenario's narrative
   - Describe progression/patterns, not static states
   - Stay under 20 words
   - Use active, descriptive language

### Example Dimension Analysis Strings

**Good Examples:**
- Logic: "Facts vanish into speculation - a slow van becomes trafficking without any connecting evidence."
- Emotion: "Concern stays measured - worry expressed professionally without catastrophizing or manipulating fear."
- Balanced: "Multiple perspectives offered - presents issue while respecting parent autonomy and collaborative solutions."
- Agenda: "Pure profit extraction - manufactured urgency funnels victims to DM for undisclosed scheme."

**What NOT to Write:**
- Generic: "This has logical flaws"
- Too long: Multi-sentence explanations
- Static: "Contains emotional language"
- Vague: "Some bias present"

### Current Status
✅ All 10 scenarios have dimensionAnalysis  
✅ Timeline UI updates dynamically based on selection  
✅ Fallback system for older scenarios without this field  
✅ Color/styling changes work with dimension selection  

### Future AI Generation Requirements

When implementing AI scenario generation, ensure:

1. **Prompt includes examples** of good dimension analysis strings
2. **Validation checks** that all 4 dimensions are present
3. **Length constraints** enforced (< 20 words)
4. **Pattern focus** - describes change/progression through narrative
5. **Specificity requirement** - must reference actual content from scenario

### Integration Points

The dimension analysis touches:
- `data/scenarios.json` - Data storage
- `js/core/scenario-manager.js` - Already handles loading
- `js/ui/timeline-analysis.js` - Display logic
- `css/timeline-accordion.css` - Visual styling

### Testing Checklist
- [ ] Dimension text changes when toggling buttons
- [ ] Colors update to match selected dimension
- [ ] Most recently enabled dimension takes priority
- [ ] Fallback text appears for scenarios without dimensionAnalysis
- [ ] All 4 dimensions have unique, specific strings per scenario

---

**REMEMBER:** This system is the foundation for scalable AI content generation. Preserve its structure and enhance carefully! 🚀