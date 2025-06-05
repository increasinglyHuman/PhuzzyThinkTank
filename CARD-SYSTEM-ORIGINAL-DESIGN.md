# Phuzzy Think Tank - Card System Handoff
## For Next Claude Instance

### Quick Context
You're working on Phuzzy Think Tank, an educational game teaching critical thinking through bear-guided analysis of logical fallacies. The card collection system is nearly complete but needs final testing.

### Current Card System Status

#### What's Working Well
1. **Collection Mechanics**: Click card → animates to rack → slot fills with icon
2. **Recall System**: Click rack icon → card reappears (slot empties) → click card → returns to rack
3. **3-Card Limit**: Auto-hides oldest when 4th appears
4. **NEW Badge**: Only on first-ever collection, tracked via `everCollectedCards` Set

#### What Needs Testing
1. Verify all 10 scenarios display cards properly (especially #1, #4, #6, #8, #10)
2. Check that recalled cards never show NEW badge
3. Ensure smooth animations in all browsers
4. Test edge cases (rapid clicking, multiple cards)

### Key Code Locations
- **Card Display Logic**: `/js/ui/bear-analysis.js` → `showWisdomBearIntegration()`
- **Collection Logic**: `/js/ui/bear-analysis.js` → `collectCard()` and `recallCard()`
- **Card Styling**: `/css/fallacy-cards.css` (blue theme)
- **Mini-card Styling**: `/css/main.css` (search "mini-card")

### Important Implementation Details

#### Severity Levels (DO NOT CHANGE VALUES)
These are for calculations, not just display:
- primary, secondary (standard)
- minor, major, potential (degrees)
- avoided, appropriate, balanced (special cases)

#### Two Tracking Systems
```javascript
this.seenCards = new Set();          // Current session tracking
this.everCollectedCards = new Set(); // Permanent NEW badge tracking
```

#### Rack Slot Empty State
```javascript
slot.classList.add('empty');
slot.setAttribute('data-icon', iconToRestore); // Stores icon for later
```

### Next Steps
1. **Test all scenarios** - Ensure cards appear with proper icons
2. **Create new scenarios** - Target is to expand beyond current 10
3. **Consider card artwork** - 280x420px cards have space for bear-themed graphics

### Server Info
- **Dev Server**: http://localhost:8000 (Python HTTP server)
- **Production**: https://10.0.0.51 (Apache)
- **Working Directory**: `/home/increasinglyhuman/Documents/Claude/Phuzzy/temp`

### Recent Design Decisions
- Circus tent icon (🎪) for collection header - playful and colorful
- "BEAR WITH IT!" for wrong answers - gentle pun
- Blue card theme (#3b82f6) instead of black - friendlier
- Alternating Logic/Emotion animations - more dynamic

### Final Notes
The card system is designed as both a game mechanic AND a study tool. Kids should be able to pull cards in and out repeatedly to learn the fallacies. The NEW badge creates excitement for discovery while the recall system enables learning through repetition.

**Important Note from Allen**: Dr. Partridge loves to stay involved, and every property in the game has a purpose - so don't hesitate to ask him if you find something that seems out of place. He designed each element intentionally, from severity levels to fuzzy math calculations.

Good luck with the testing and scenario creation! The bears are counting on you! 🐻🦉💖