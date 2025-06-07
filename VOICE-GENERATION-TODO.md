# Voice Generation TODO List

## 1. Generate 3 Missing Scenarios for Pack 001
Pack 001 only has 7 scenarios (010-016) instead of 10. Need to:
- Generate scenarios 017, 018, 019 to complete the pack
- This will shift all subsequent numbering

## 2. Consider Renaming Audio Folders  
Current: scenario-000, scenario-001, etc.
Proposed: scenario-pack-000-00, scenario-pack-000-01, etc. or scenario-000.00

Benefits:
- Clear pack association
- Allows adding scenarios to incomplete packs
- No confusion when numbering shifts

Example mapping:
- scenario-000 → scenario-000.00 (pack 0, scenario 0)
- scenario-052 → scenario-005.05 (pack 5, scenario 5)
- scenario-040 → scenario-004.03 (pack 4, scenario 3)

## 3. Multi-Voice Generation Progress
Successfully converted (12 total):
- ✅ 023 - The Balanced Climate Report (email format)
- ✅ 040 - The Bamboo Prison Dilemma (zoo animals) 
- ✅ 041 - The Feline Master Plan (cat conspiracy)
- ✅ 044 - Spinning to Success (hamster wheel economics)
- ✅ 045 - The Digital Detox Warrior
- ✅ 046 - The Canon Crusades (Star Wars vs Trek Reddit)
- ✅ 049 - The Accuracy Inquisition (cosplay forum)
- ✅ 050 - The Playground Tribunal (LEGENDARY kindergarten court)
- ✅ 051 - The Goodie Bag Crisis (birthday party inequality)
- ✅ 052 - The Goldfish Cartel (kindergarten snack economy)
- ✅ 056 - The Buzzfeed Mentality (toxic positivity bee hive)

Category breakdown:
- 🦁 Animals: 4 scenarios
- 👶 Kindergarten: 3 scenarios  
- 🚀 Sci-fi/Geek: 2 scenarios
- 📱 Social Media: 2 scenarios
- 🎮 Other: 1 scenario

## 4. Fix Reddit Username Detection
✅ FIXED: Added u/username pattern detection
- Reddit usernames now recognized but may need better segment parsing
- Currently grouping some dialogue into narrator segments

## 5. Pronunciation Fixes Applied
- ✅ AT-AT → "at at"
- ✅ BSG → "Battlestar Galactica"
- ✅ LMAO/LMAOOO → "laughing"
- ✅ btw → "by the way"
- ✅ BS → "B S"
- ✅ URLs → "website link"
- ✅ Dollar amounts ($125,000 → "125 thousand dollars")
- ✅ Tiny decimals ($0.00000000043 → "way less than a penny")

## 6. Still To Do
- Find and convert more animal dialogue scenarios
- Look for more sci-fi debates
- Fix segment parsing for better multi-voice separation
- Consider batch title generation for efficiency