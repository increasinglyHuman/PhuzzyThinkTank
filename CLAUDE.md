# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phuzzy's Think Tank is an educational web-based game that teaches critical thinking skills. Players evaluate arguments to identify logical fallacies, emotional manipulation, hidden agendas, or well-balanced reasoning. The game features Logic Bear (🧠) and Emotion Bear (💖) who provide dual perspectives on each scenario.

## Key Commands

### Development & Testing
```bash
# Scenario management
npm start                    # Run memory-safe scenario adder
npm run add-scenario         # Add new scenarios incrementally
npm run check-scenarios      # Validate all scenario data integrity
npm run generate-scenario    # AI-generate new scenarios using Anthropic API

# Voice generation (requires ElevenLabs API key)
npm run test-voice          # Test ElevenLabs API connection
npm run generate-voices     # Generate voice files for scenarios
./voice-generation-safe.sh  # Safe batch voice generation with memory limits

# Production orchestration
./phuzzy-production-orchestrator.sh  # Full production pipeline
./batch-scenario-orchestrator.sh     # Batch process scenarios
```

### Python Tools
```bash
python serve-review-dashboard.py  # Serve scenario review dashboard on port 8000
python tools/smart-scenario-batch-generator.py  # Advanced scenario generation
```

## Architecture Overview

### Core Game Engine
- **`js/core/game-engine.js`** - Main game state management, handles game flow between splash → scenario → feedback → results
- **`js/core/scenario-manager.js`** - Loads and manages scenario packs, handles scenario selection and progression
- **`js/core/scenario-packs-config.js`** - Configuration for all scenario packs, including unlock conditions and promotions
- **`js/core/scoring-system.js`** - Tracks player performance, calculates scores, manages trading card unlocks

### Scenario System
- Scenarios are stored in `data/scenario-packs/` as JSON files (pack-000.json through pack-007.json)
- Each scenario contains: premise, choices (2-4), correct answer, fallacies, bear analyses, and voice metadata
- Scenarios support both single-voice and multi-voice (dialogue) formats
- Voice files are stored in pack-based folders matching scenario IDs

### UI Components
- **`js/ui/quiz-interface.js`** - Main game interface, handles user interactions and choice selection
- **`js/ui/bear-analysis.js`** - Manages Logic Bear and Emotion Bear feedback animations
- **`js/ui/timeline-chart.js`** - D3-based visualization of player progress over time
- **`js/ui/social-sharing.js`** - Canvas-based screenshot generation for social media sharing

### Voice System
- Uses ElevenLabs API for text-to-speech generation
- Voice files organized by pack: `data/scenario-packs/voices/pack-XXX/scenario_Y_part_Z.mp3`
- Multi-voice scenarios use sequential part numbers for dialogue
- Voice generation tools handle rate limiting and memory optimization

## Important Considerations

1. **Memory Optimization**: Originally designed for Raspberry Pi deployment. Many tools include memory management features (see `memory-safe-*` scripts).

2. **No Build Process**: This is a vanilla JavaScript project with no bundling. All code must be ES5-compatible for browser support.

3. **Scenario Content**: When generating new scenarios, follow the established format and ensure educational value. Reference `data/ai-scenario-generation-spec-v3.md` for guidelines.

4. **Voice Generation**: Voice synthesis is expensive. Always check existing voices before regenerating. Use `check-audio-generation-status.js` to audit voice coverage.

5. **Pack System**: Scenarios are organized into themed packs (000-007). New scenarios should be added to appropriate packs or new packs should be created following the existing pattern.

6. **Testing**: No formal test framework is used. Test new features with standalone scripts or HTML test pages before integration.

## API Keys Required

- **ElevenLabs API**: Set `ELEVENLABS_API_KEY` environment variable for voice generation
- **Anthropic API**: Set `ANTHROPIC_API_KEY` environment variable for AI scenario generation

## Local Development Server

**IMPORTANT**: A local HTTPS server is already configured (or can be easily set up) at `https://p0qp0q.local/`

- **Setup Script**: `./setup-local-domain.sh` (run with sudo)
- **Domain**: `https://p0qp0q.local/`
- **Web Root**: `/home/p0qp0q/Phuzzy/`
- **Key URLs**:
  - Main game: `https://p0qp0q.local/`
  - Review dashboard: `https://p0qp0q.local/enhanced-review-dashboard.html`
  - Pack manager: `https://p0qp0q.local/pack-promotion-manager.html`
  - Test page: `https://p0qp0q.local/server-test.html`

**DO NOT** create new web servers with Python SimpleHTTPServer, Node.js http-server, or other tools. Use the existing Apache setup with proper HTTPS and mDNS support.