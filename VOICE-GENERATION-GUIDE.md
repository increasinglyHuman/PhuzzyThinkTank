# Voice Generation Guide for Phuzzy Think Tank

## Overview
Complete audio generation system using ElevenLabs API with multi-voice dialogue support.

## Quick Start

### Generate all scenarios with turbo mode (50% cheaper):
```bash
./voice-generation-safe.sh --turbo
```

### Check current usage:
```bash
node tools/elevenlabs-usage-tracker.js
```

## Key Features

### 1. Multi-Voice Dialogues
- Automatically detects scenarios with 3+ speakers
- Assigns different voices to each character
- Creates radio drama effect with concatenated segments
- Removes character names from speech ("PAULO:" not spoken)

### 2. Cost Optimization (7x reduction!)
- Turbo mode: $0.15/1k chars (vs $0.30 standard)
- Skip existing audio files
- Efficient text preprocessing
- Smart rate limiting reduces failures

### 3. Text Preprocessing
- **Hashtags**: #AuthenticAF → "hashtag AuthenticAF"
- **Dollar amounts**: $1 → "1 dollar", $2 → "2 dollars"
- **Asterisk actions**: *adjusts tie* → removed entirely
- **Emphasis**: *GENUINE GLOW* → "GENUINE GLOW" (quoted for emphasis)
- **Math symbols**: ≠ → "is not equal to"

### 4. Character Voice Assignment
- Intelligent gender detection from names/context
- 4 male voices, 4 female voices available
- Defaults to female for better balance
- Consistent voice per character within scenario

### 5. Memory Safety
- Runs on Raspberry Pi (8GB) without crashes
- Process isolation prevents window crashes
- 3GB heap limit for Node.js

## File Structure
```
data/audio-recording-voices-for-scenarios-from-elevenlabs/
├── scenario-000/
│   ├── title.mp3
│   ├── content.mp3      # Multi-voice if dialogue scenario
│   └── claim.mp3
├── scenario-001/
│   └── ...
├── voice-analytics.json
├── usage-tracking.json
└── victories.json
```

## Analytics Dashboards
- `voice-analytics-dashboard.html` - Basic character/gender stats
- `voice-analytics-advanced.html` - Charts and detailed metrics  
- `voice-credit-usage-dashboard.html` - Cost tracking
- `voice-usage-realtime-dashboard.html` - Live API usage

## Configuration
Set in `.env`:
```
ELEVENLABS_API_KEY=your-key-here
USE_TURBO=true  # For cheaper generation
```

## Multi-Voice Scenarios
As of Jan 2025, 12 scenarios have been converted to multi-voice format:
- Kindergarten series (Playground Tribunal, Goldfish Cartel, Goodie Bag Crisis)
- Animal debates (Bamboo Prison, Feline Master Plan, Hamster Wheel, Toxic Bees)
- Sci-fi/geek culture (Canon Crusades, Accuracy Inquisition)
- Social media scenarios

## Costs
- Used: ~140k characters total
- Cost: ~$21 (with turbo mode)
- Original estimate: $140+ without optimizations
- Monthly budget: $22
- Multi-voice adds ~10-20% more characters per scenario

## Common Issues

### Rate Limiting
Script automatically retries with 30s delays when hitting limits.

### Character Names
If picking up wrong text as names (e.g., "Posted", "From"), check patterns in `elevenlabs-voice-generator.js` lines 519-552.

### Dollar Grammar
Fixed to handle singular/plural correctly ($1 = "1 dollar", not "1 dollars").

## Future Enhancements
- Batch title generation (could save more credits)
- Custom silence insertion between segments
- Voice cloning for specific characters
- Real-time generation during gameplay