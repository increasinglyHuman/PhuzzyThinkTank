# Claude Transfer Notes - Phuzzy Voice Generation Project

## Project Status (2025-06-07)

### What We Accomplished
1. **Voice Generation System**
   - Created intelligent voice assignment based on character names and context
   - Implemented gender detection with pronoun analysis
   - Built math symbol to speech conversion
   - Generated 35+ scenarios with 3 MP3s each (title, content, claim)

2. **Analytics Dashboards**
   - Created two dashboards: basic and advanced
   - Advanced includes Chart.js visualizations
   - Real-time analytics updater running in background
   - Tracks voice usage, gender distribution, generation speed

3. **Memory Optimization**
   - Applied Raspberry Pi memory strategies from scenario generation
   - Created memory-safe wrapper script
   - Process isolation prevents main window crashes
   - Successfully handles 65+ scenarios without memory issues

### Current Issues to Address
1. **Character Name Extraction**
   - Currently picking up first words ("Posted", "From") instead of actual speakers
   - Need better regex patterns for: "Dr. Sarah Chen", "Mrs. Rodriguez", etc.
   - Context-aware extraction partially implemented

2. **Dashboard Updates Needed**
   - Voice usage frequency chart needs real data connection
   - Timeline should use half-hour increments (already in realtime-analytics.json)
   - Table width needs adjustment for character names
   - Remove mock data, use real analytics

3. **Rate Limiting**
   - Added retry logic with 30s wait on 429 errors
   - Smart delays: 2s for large batches, 5s cooldown every 10 requests
   - May need further tuning based on ElevenLabs limits

### File Locations
- Voice generation script: `tools/elevenlabs-voice-generator.js`
- Memory-safe wrapper: `voice-generation-safe.sh`
- Analytics dashboards: `voice-analytics-dashboard.html`, `voice-analytics-advanced.html`
- Real-time updater: `update-analytics-realtime.js`
- Generated audio: `data/audio-recording-voices-for-scenarios-from-elevenlabs/`

### Next Steps
1. Fix character name extraction regex
2. Complete generation of remaining ~30 scenarios
3. Update dashboards to use realtime-analytics.json
4. Test audio playback in game interface
5. Consider caching strategy for web deployment

### API Keys & Services
- ElevenLabs API key in .env file
- Using subscription (not free tier)
- Voice IDs configured for male/female variety

### Memory Settings
- Node.js heap: 3GB (conservative for 8GB Pi)
- Process generates ~17.74s per scenario average
- Total audio size: ~30MB for 35 scenarios

## Quick Commands
```bash
# Generate voices with memory safety
./voice-generation-safe.sh

# Update analytics in real-time
node update-analytics-realtime.js --watch

# View dashboards
firefox voice-analytics-dashboard.html voice-analytics-advanced.html

# Check progress
ls -d data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-* | wc -l
```