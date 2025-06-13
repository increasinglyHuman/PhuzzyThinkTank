# 🎵 Phuzzy Audio Engine Documentation

**Version:** 1.0.0  
**Authors:** Claude & Allen  
**Purpose:** Comprehensive, channel-based audio system for educational games

## Overview

The Phuzzy Audio Engine is a multi-channel audio system designed for educational games with complex audio requirements. It features queue-based playback, smart interruption handling, memory-efficient preloading, and graceful degradation.

## Core Features

- **Multi-channel architecture** (dialogue, effects, music, ui)
- **Queue-based playback** with priorities
- **Smart interruption handling** (duck, smart, immediate)
- **Auto-discovery of audio assets**
- **Crossfade, ducking, and mixing capabilities**
- **Memory-efficient preloading**
- **First-play optimization** (eliminates browser audio clipping)
- **Graceful degradation and error recovery**

## Architecture

### Channel System
The engine organizes audio into channels with different priorities and behaviors:

```javascript
channels: {
    dialogue: { volume: 1.0, priority: 100, crossfade: true },  // Highest priority
    effects: { volume: 0.8, priority: 50, crossfade: false },   // Medium priority
    music: { volume: 0.6, priority: 10, crossfade: true },      // Lowest priority
    ui: { volume: 0.9, priority: 75, crossfade: false }         // UI feedback
}
```

### Audio Paths
Audio files are organized in pack-based folders:
```
data/voices/
├── pack-000-scenario-000/
│   ├── title.mp3
│   ├── content.mp3
│   └── claim.mp3
├── pack-000-scenario-001/
│   ├── title.mp3
│   ├── content.mp3
│   └── claim.mp3
```

## API Reference

### Core Methods

#### `play(audioSpec, options)`
Plays a single audio file.

```javascript
// Play a single audio file
const playId = await audioEngine.play({
    pack: 0,
    scenario: 1,
    type: 'title'
}, {
    channel: 'dialogue',
    volume: 1.0,
    interrupt: 'smart'
});
```

**Parameters:**
- `audioSpec`: Object specifying audio location `{pack, scenario, type}`
- `options`: Playback options
  - `channel`: Channel name ('dialogue', 'effects', 'music', 'ui')
  - `volume`: Volume (0.0 to 1.0)
  - `interrupt`: Interruption strategy ('immediate', 'smart', 'duck', 'queue')
  - `loop`: Boolean, whether to loop
  - `fadeIn`: Boolean, fade in audio
  - `onComplete`: Callback when audio finishes

#### `playSequence(sequence, options)`
Plays multiple audio files in sequence with gaps.

```javascript
// Play a complete scenario sequence
const sequenceId = await audioEngine.playSequence([
    { pack: 0, scenario: 1, type: 'title' },
    { pack: 0, scenario: 1, type: 'content' },
    { pack: 0, scenario: 1, type: 'claim' }
], {
    channel: 'dialogue',
    gapBetween: 800, // 800ms pause between files
    onProgress: (current, total, audioSpec) => {
        console.log(`Playing ${audioSpec.type} (${current}/${total})`);
    },
    onComplete: () => {
        console.log('Entire sequence completed');
        // ⚠️ IMPORTANT: This fires when ENTIRE SEQUENCE completes,
        // not after each individual file. Use for UI state changes.
    }
});
```

**Parameters:**
- `sequence`: Array of audioSpec objects
- `options`: Sequence options
  - `gapBetween`: Milliseconds between audio files
  - `onProgress`: Callback after each file `(current, total, audioSpec)`
  - `onComplete`: Callback when entire sequence finishes
  - `preload`: Boolean, preload all files before starting

#### `stop(playId, options)`
Stops a specific audio stream.

```javascript
audioEngine.stop(playId, { fadeOut: true });
```

#### `stopChannel(channelName, options)`
Stops all audio on a channel.

```javascript
audioEngine.stopChannel('dialogue', { fadeOut: true });
```

#### `stopChannelAndClearQueue(channelName, options)`
Stops channel and clears queued audio (prevents overlapping on restart).

```javascript
// Essential for play/pause buttons to prevent audio overlap
audioEngine.stopChannelAndClearQueue('dialogue', { fadeOut: true });
```

### Integration Methods

#### `integratePhuzzyAudio(gameEngine)`
Integrates the audio engine with a game engine.

```javascript
const gameEngine = new PhuzzyGameEngine();
const audioIntegration = integratePhuzzyAudio(gameEngine);

// Enhanced methods available on gameEngine:
gameEngine.playScenarioAudio(scenarioTitle, packId);
gameEngine.preloadUpcomingAudio(currentIndex, total);
gameEngine.playUISound('correct'); // Generates UI sounds
```

## Best Practices

### Play/Pause Button Implementation

```javascript
let isAudioPlaying = false;
let currentSequenceId = null;

function toggleScenarioAudio() {
    if (isAudioPlaying) {
        // CRITICAL: Use stopChannelAndClearQueue to prevent overlap
        audioEngine.stopChannelAndClearQueue('dialogue', { fadeOut: true });
        isAudioPlaying = false;
        updateButton();
    } else {
        isAudioPlaying = true;
        updateButton();
        
        // Play sequence with completion callback
        gameEngine.playScenarioAudio(scenarioTitle)
            .then(sequenceId => {
                currentSequenceId = sequenceId;
            });
    }
}

// Handle sequence completion to reset button state
window.onAudioSequenceComplete = function() {
    isAudioPlaying = false;
    currentSequenceId = null;
    updateButton();
};
```

### Audio Clipping Prevention

The engine includes "MP beep" technology that eliminates browser audio clipping:

```javascript
// Audio files are processed with sacrificial beep prefixes
// Triple beep pattern (50ms beep → 50ms pause → 50ms beep → 50ms pause → 50ms beep → 200ms pause → content)
// Browser clips the beeps, leaving your content pristine
```

### Memory Management

```javascript
// Configure for different environments
const audioEngine = new PhuzzyAudioEngine({
    memoryLimit: 50 * 1024 * 1024, // 50MB for user devices
    maxConcurrentAudio: 8,          // Reasonable for most hardware
    preloadDistance: 3              // Preload next 3 scenarios
});
```

## Interruption Strategies

### `immediate`
Immediately stops current audio and plays new audio.
**Use for:** Critical UI sounds, emergency stops

### `smart`
Waits for natural break or crossfades if channel supports it.
**Use for:** Dialogue transitions, music changes

### `duck`
Lowers volume of existing audio while new audio plays.
**Use for:** Sound effects over music, notifications over dialogue

### `queue`
Adds to queue to play after current audio finishes.
**Use for:** Sequential audio, continuation scenarios

## Debugging

### Common Issues

#### "Button shows Play but audio is still playing"
- Ensure `onComplete` callback properly resets UI state
- Use `stopChannelAndClearQueue` instead of just `stopChannel`
- Check if completion callback is firing for individual files vs entire sequence

#### "Audio clips at the beginning"
- Ensure audio files have beep prefixes applied
- Check that `enableFirstPlayOptimization` is true
- Verify audio context is properly warmed up

#### "Audio overlaps when restarting"
- Use `stopChannelAndClearQueue('dialogue')` before starting new sequence
- Don't use multiple `play()` calls for sequences, use `playSequence()`

### Debug Methods

```javascript
// Get engine state
const state = audioEngine.getState();
console.log('Audio engine state:', state);

// Get preload status
const preloadStatus = audioEngine.getPreloadStatus();
console.log('Preload status:', preloadStatus);

// Test audio system
audioIntegration.testAudioSystem();
```

## Future Games Integration

This engine is designed for reuse across multiple educational games:

1. **Initialize with game-specific config**
```javascript
const audioEngine = new PhuzzyAudioEngine({
    audioBasePath: './assets/audio/',
    channels: {
        dialogue: { volume: 1.0, priority: 100 },
        music: { volume: 0.5, priority: 10 },
        effects: { volume: 0.8, priority: 50 }
    }
});
```

2. **Integrate with your game engine**
```javascript
const audioIntegration = integratePhuzzyAudio(yourGameEngine);
```

3. **Organize audio files in pack structure**
```
assets/audio/
├── level-001-stage-001/
├── level-001-stage-002/
```

4. **Implement completion callbacks for UI synchronization**

## Technical Notes

- **Browser Compatibility:** Modern browsers with Web Audio API support
- **File Formats:** MP3 (44.1kHz, 128kbps recommended)
- **Memory Usage:** Configurable limits with intelligent cache management
- **Performance:** Optimized for educational games with frequent audio changes
- **Error Handling:** Graceful degradation when audio fails to load

---

*This documentation covers the Phuzzy Audio Engine as implemented for Phuzzy's Think Tank educational game. The engine is designed to be reusable across future educational game projects.*