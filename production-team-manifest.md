# Phuzzy Production Team Manifest

## Team Structure

### 1. Producer/Director (Me - Lead)
- Overall creative vision and quality control
- Communication with user
- Team coordination
- Final approval on scenarios and audio

### 2. Memory Optimization Specialist
- Ensures all Node.js operations stay under 3GB heap limit
- Implements chunking and streaming for file operations
- Monitors memory usage during batch operations
- Specializes in Raspberry Pi constraints

### 3. Scenario Writer
- Creates whimsical, youth-friendly scenarios
- Implements V3 dual-script format
- Ensures audio-friendly writing from the start
- Focuses on humor and educational value

### 4. Audio Engineer
- Manages ElevenLabs API integration
- Ensures turbo mode usage for cost efficiency
- Handles voice assignment and multi-voice coordination
- Preprocesses text for optimal audio generation

### 5. Technical Assistant
- File organization and naming compliance
- Pack structure maintenance
- Backup creation before operations
- Script debugging and testing

## Communication Protocol

### Central Status Document
Location: `/home/increasinglyhuman/Documents/Claude/Phuzzy/temp/production-status.json`

```json
{
  "lastUpdate": "timestamp",
  "currentPhase": "planning|writing|recording|testing",
  "progress": {
    "scenariosWritten": 0,
    "scenariosRecorded": 0,
    "errorsEncountered": [],
    "memoryPeakMB": 0
  },
  "teamUpdates": {
    "memorySpecialist": "status message",
    "writer": "status message",
    "audioEngineer": "status message",
    "technician": "status message"
  },
  "blockers": [],
  "nextSteps": []
}
```

## Memory Budget Allocation

Total Available: 3GB (3072MB) on Raspberry Pi

- Scenario Generation: 500MB max
- Audio Processing: 1000MB max
- File Operations: 500MB max
- System Overhead: 1072MB reserved

## Cost Management

ElevenLabs Budget:
- Monthly limit: $22
- Turbo rate: $0.15/1k characters (MUST USE)
- Standard rate: $0.30/1k characters (AVOID)
- Current usage tracking via elevenlabs-usage-tracker.js

## Production Pipeline

1. **Planning Phase**
   - Identify missing scenarios
   - Review V3 specification
   - Allocate team resources

2. **Writing Phase**
   - Generate scenarios with dual scripts
   - Validate audio-friendliness
   - Ensure memory efficiency

3. **Recording Phase**
   - Process through ElevenLabs API
   - Use turbo mode exclusively
   - Handle multi-voice scenarios
   - Monitor memory usage

4. **Quality Control**
   - Test audio playback
   - Verify pack compliance
   - Check educational value
   - Ensure youth appropriateness

## Critical Constraints

1. **Memory**: Never exceed 2.5GB heap to leave safety margin
2. **Cost**: Always use turbo mode for 50% cost savings
3. **Quality**: Maintain whimsical, educational tone
4. **Structure**: Follow pack organization (10 scenarios per pack)

## Success Metrics

- All packs complete with 10 scenarios each
- Audio files properly organized by pack
- Memory usage stays under limits
- Cost per scenario under $0.50
- Zero profanity or inappropriate content
- High "giggle factor" for young audiences