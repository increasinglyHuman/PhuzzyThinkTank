/**
 * 🎵 Phuzzy Audio Engine Integration Layer
 * Integrates the comprehensive audio engine with the existing game
 * 
 * This replaces the basic VoicePlayer with the full PhuzzyAudioEngine
 * while maintaining backward compatibility
 * 
 * @version 1.0.0
 * @author Claude & Allen
 */

class PhuzzyAudioIntegration {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // Initialize the full audio engine with Corsair-optimized settings
        this.audioEngine = new PhuzzyAudioEngine({
            // High-performance settings for the Corsair box
            maxConcurrentAudio: 16, // Much higher with 62GB RAM
            memoryLimit: 500 * 1024 * 1024, // 500MB cache
            preloadDistance: 10, // Preload more scenarios
            
            // Enhanced quality settings
            crossfadeDuration: 750,
            duckingLevel: 0.2,
            
            // Channel configuration for educational games
            channels: {
                dialogue: { volume: 1.0, priority: 100, crossfade: true },
                narration: { volume: 0.9, priority: 90, crossfade: true },
                effects: { volume: 0.7, priority: 50, crossfade: false },
                ambient: { volume: 0.4, priority: 20, crossfade: true },
                ui: { volume: 0.8, priority: 75, crossfade: false }
            },
            
            // Development settings
            debug: true,
            autoDiscoverAssets: true,
            fallbackStrategy: 'intelligent'
        });
        
        // Legacy compatibility layer
        this.isEnabled = true;
        this.currentAudio = null;
        
        // Enhanced scenario audio mapping with auto-discovery
        this.scenarioMappings = new Map();
        this.buildScenarioMappings();
        
        console.log('🎵 Phuzzy Audio Integration initialized with high-performance settings');
    }
    
    /**
     * Build comprehensive scenario to audio mappings
     * Auto-discovers all available audio and maps to scenarios
     */
    async buildScenarioMappings() {
        try {
            // Load scenario data to build mappings
            const scenarios = await this.loadAllScenarios();
            
            scenarios.forEach((scenario) => {
                // Use the actual pack information from the scenario
                const packId = scenario.packNumber;
                const scenarioIndex = scenario.packIndex;
                
                // Create mapping entry
                this.scenarioMappings.set(scenario.title, {
                    pack: packId,
                    scenario: scenarioIndex,
                    id: scenario.id,
                    hasAudio: false // Will be verified
                });
            });
            
            // Verify which scenarios actually have audio
            await this.verifyAudioAvailability();
            
            console.log(`🗺️ Built ${this.scenarioMappings.size} scenario audio mappings`);
            
        } catch (error) {
            console.warn('⚠️ Could not build comprehensive mappings, using fallback:', error);
            this.buildFallbackMappings();
        }
    }
    
    /**
     * Load all scenarios from available packs
     */
    async loadAllScenarios() {
        const allScenarios = [];
        const packIds = ['000', '001', '002', '003', '004', '005', '006', '007'];
        
        for (const packId of packIds) {
            try {
                const response = await fetch(`../data/scenario-packs/scenario-generated-${packId}.json`);
                if (response.ok) {
                    const data = await response.json();
                    // Add pack information to each scenario
                    const scenariosWithPack = data.scenarios.map((scenario, index) => ({
                        ...scenario,
                        packNumber: parseInt(packId),
                        packIndex: index
                    }));
                    allScenarios.push(...scenariosWithPack);
                }
            } catch (e) {
                console.log(`Pack ${packId} not available`);
            }
        }
        
        return allScenarios;
    }
    
    /**
     * Verify which scenarios actually have audio files
     */
    async verifyAudioAvailability() {
        const verificationPromises = Array.from(this.scenarioMappings.entries()).map(
            async ([title, mapping]) => {
                const hasAudio = await this.checkAudioFiles(mapping.pack, mapping.scenario);
                mapping.hasAudio = hasAudio;
                return { title, hasAudio };
            }
        );
        
        const results = await Promise.allSettled(verificationPromises);
        const available = results.filter(r => 
            r.status === 'fulfilled' && r.value.hasAudio
        ).length;
        
        console.log(`🔍 Verified audio: ${available}/${this.scenarioMappings.size} scenarios have audio files`);
    }
    
    /**
     * Check if audio files exist for a scenario
     */
    async checkAudioFiles(pack, scenario) {
        const packStr = pack.toString().padStart(3, '0');
        const scenarioStr = scenario.toString().padStart(3, '0');
        const baseUrl = '../data/audio-recording-voices-for-scenarios-from-elevenlabs/';
        const folderPath = `pack-${packStr}-scenario-${scenarioStr}`;
        
        const audioTypes = ['title.mp3', 'content.mp3', 'claim.mp3'];
        
        try {
            // Check if at least one audio file exists
            for (const audioType of audioTypes) {
                const response = await fetch(`${baseUrl}${folderPath}/${audioType}`, { method: 'HEAD' });
                if (response.ok) {
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }
    
    /**
     * Fallback mappings for known scenarios
     */
    buildFallbackMappings() {
        const knownMappings = [
            ['My Own Boss Blues', { pack: 0, scenario: 0 }],
            ['The Algorithm Whisperer', { pack: 0, scenario: 1 }],
            ['Balanced Climate Report', { pack: 0, scenario: 2 }],
            ['The Ethical Closet Confession', { pack: 0, scenario: 3 }],
            ['The Package Thief Vigilante', { pack: 0, scenario: 4 }],
            // Add more known mappings...
        ];
        
        knownMappings.forEach(([title, mapping]) => {
            this.scenarioMappings.set(title, { ...mapping, hasAudio: true });
        });
    }
    
    /**
     * Legacy compatibility: play method that mimics the old VoicePlayer
     */
    async play(scenarioId, contentType, postIndex = null, packId = null, scenarioTitle = null) {
        try {
            // Convert legacy parameters to new audio engine format
            const audioSpec = this.buildAudioSpec(scenarioId, contentType, postIndex, packId, scenarioTitle);
            
            if (!audioSpec) {
                console.warn(`No audio mapping found for: ${scenarioTitle || scenarioId}`);
                return false;
            }
            
            // Determine channel based on content type
            const channel = this.getChannelForContentType(contentType);
            
            // Play using the new audio engine
            const playId = await this.audioEngine.play(audioSpec, {
                channel,
                interrupt: 'smart',
                fadeIn: contentType === 'title', // Fade in titles for smooth start
                onComplete: () => {
                    console.log(`✅ Completed playing: ${contentType} for ${scenarioTitle}`);
                },
                onError: (error) => {
                    console.warn(`❌ Audio playback failed: ${error.message}`);
                }
            });
            
            this.currentAudio = { playId, contentType, scenarioTitle };
            return true;
            
        } catch (error) {
            console.error('Audio playback failed:', error);
            return false;
        }
    }
    
    /**
     * Enhanced sequence player for scenario audio
     */
    async playScenarioSequence(scenarioTitle, packId = null) {
        try {
            const mapping = this.scenarioMappings.get(scenarioTitle);
            if (!mapping || !mapping.hasAudio) {
                console.warn(`No audio available for scenario: ${scenarioTitle}`);
                return false;
            }
            
            // Build sequence: title → content → claim
            const sequence = [
                { pack: mapping.pack, scenario: mapping.scenario, type: 'title' },
                { pack: mapping.pack, scenario: mapping.scenario, type: 'content' },
                { pack: mapping.pack, scenario: mapping.scenario, type: 'claim' }
            ];
            
            console.log(`🎬 Starting audio sequence for: ${scenarioTitle}`);
            
            // Play the sequence with intelligent gaps
            const sequenceId = await this.audioEngine.playSequence(sequence, {
                channel: 'dialogue',
                gapBetween: 800, // Pause between audio segments
                onProgress: (current, total, audioSpec) => {
                    console.log(`🎵 Playing ${audioSpec.type} (${current}/${total})`);
                },
                onComplete: () => {
                    console.log(`✅ Completed audio sequence for: ${scenarioTitle}`);
                }
            });
            
            return sequenceId;
            
        } catch (error) {
            console.error('Scenario sequence failed:', error);
            return false;
        }
    }
    
    /**
     * Build audio specification from legacy parameters
     */
    buildAudioSpec(scenarioId, contentType, postIndex, packId, scenarioTitle) {
        // Try title-based mapping first
        if (scenarioTitle && this.scenarioMappings.has(scenarioTitle)) {
            const mapping = this.scenarioMappings.get(scenarioTitle);
            return {
                pack: mapping.pack,
                scenario: mapping.scenario,
                type: this.mapContentType(contentType)
            };
        }
        
        // Try pack-based mapping
        if (packId !== null && scenarioId !== null) {
            return {
                pack: packId,
                scenario: scenarioId % 10, // Assuming 10 scenarios per pack
                type: this.mapContentType(contentType)
            };
        }
        
        // Last resort: try to infer from scenarioId
        if (scenarioId !== null) {
            return {
                pack: Math.floor(scenarioId / 10),
                scenario: scenarioId % 10,
                type: this.mapContentType(contentType)
            };
        }
        
        return null;
    }
    
    /**
     * Map legacy content types to new audio types
     */
    mapContentType(contentType) {
        const mapping = {
            'title': 'title',
            'description': 'content',
            'content': 'content',
            'claim': 'claim',
            'post': 'content' // Fallback for posts
        };
        
        return mapping[contentType] || 'content';
    }
    
    /**
     * Get appropriate channel for content type
     */
    getChannelForContentType(contentType) {
        const channelMapping = {
            'title': 'narration',
            'description': 'dialogue',
            'content': 'dialogue',
            'claim': 'dialogue',
            'post': 'dialogue'
        };
        
        return channelMapping[contentType] || 'dialogue';
    }
    
    /**
     * Legacy compatibility methods
     */
    stop() {
        this.audioEngine.stop('all');
        this.currentAudio = null;
    }
    
    pause() {
        if (this.currentAudio) {
            this.audioEngine.stop(this.currentAudio.playId);
        }
    }
    
    resume() {
        // In the new system, we'd need to re-play
        console.log('Resume not implemented - use replay instead');
    }
    
    setVolume(volume) {
        this.audioEngine.setMasterVolume(volume);
    }
    
    isPlaying() {
        return this.currentAudio !== null;
    }
    
    clearCache() {
        // The new engine handles this automatically
        console.log('Cache cleanup handled automatically by PhuzzyAudioEngine');
    }
    
    /**
     * Enhanced methods for the new system
     */
    
    /**
     * Preload audio for upcoming scenarios
     */
    async preloadUpcoming(currentScenarioIndex, totalScenarios) {
        const scenarios = Array.from(this.scenarioMappings.entries())
            .slice(currentScenarioIndex + 1, currentScenarioIndex + 6) // Next 5 scenarios
            .filter(([_, mapping]) => mapping.hasAudio);
        
        const preloadSpecs = scenarios.flatMap(([title, mapping]) => [
            { pack: mapping.pack, scenario: mapping.scenario, type: 'title' },
            { pack: mapping.pack, scenario: mapping.scenario, type: 'content' },
            { pack: mapping.pack, scenario: mapping.scenario, type: 'claim' }
        ]);
        
        console.log(`📦 Preloading ${preloadSpecs.length} audio files...`);
        await this.audioEngine.preload(preloadSpecs);
    }
    
    /**
     * Add ambient background effects
     */
    async playAmbientTrack(trackName, options = {}) {
        const ambientSpec = `ambient/${trackName}.mp3`;
        
        return await this.audioEngine.play(ambientSpec, {
            channel: 'ambient',
            loop: true,
            volume: 0.3,
            fadeIn: true,
            interrupt: 'duck',
            ...options
        });
    }
    
    /**
     * Play UI sound effects using Web Audio API
     */
    async playUISound(soundType, options = {}) {
        // Generate simple UI sounds using Web Audio API for immediate feedback
        try {
            if (!this.audioEngine.audioContext) {
                console.warn('Audio context not available for UI sounds');
                return false;
            }
            
            const ctx = this.audioEngine.audioContext;
            
            // Sound specifications
            const soundSpecs = {
                'button': { frequency: 800, duration: 0.1, type: 'sine' },
                'correct': { frequency: 523, duration: 0.3, type: 'sine' }, // C5
                'incorrect': { frequency: 200, duration: 0.2, type: 'square' },
                'hint': { frequency: 659, duration: 0.15, type: 'triangle' }, // E5
                'transition': { frequency: 440, duration: 0.2, type: 'sawtooth' }
            };
            
            const spec = soundSpecs[soundType];
            if (!spec) {
                console.warn(`Unknown UI sound type: ${soundType}`);
                return false;
            }
            
            // Create oscillator for immediate sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(spec.frequency, ctx.currentTime);
            oscillator.type = spec.type;
            
            // Volume envelope
            const volume = options.volume || 0.3;
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + spec.duration);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + spec.duration);
            
            // Mark that we've had user interaction for the main audio engine
            if (!this.audioEngine.firstInteractionReceived) {
                this.audioEngine.firstInteractionReceived = true;
                console.log('🎯 User interaction captured via UI sound');
            }
            
            console.log(`🔊 Playing UI sound: ${soundType}`);
            return true;
            
        } catch (error) {
            console.warn('UI sound generation failed:', error);
            return false;
        }
    }
    
    /**
     * Get current audio engine state for debugging
     */
    getDebugInfo() {
        return {
            engineState: this.audioEngine.getState(),
            mappings: this.scenarioMappings.size,
            currentlyPlaying: this.currentAudio,
            availableAudio: Array.from(this.scenarioMappings.values())
                .filter(m => m.hasAudio).length
        };
    }
    
    /**
     * Test audio system with a sample scenario
     */
    async testAudioSystem() {
        console.log('🧪 Testing Phuzzy Audio System...');
        
        try {
            // Test UI sound
            await this.playUISound('button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Test a known scenario if available
            const availableScenario = Array.from(this.scenarioMappings.entries())
                .find(([_, mapping]) => mapping.hasAudio);
            
            if (availableScenario) {
                const [title, mapping] = availableScenario;
                console.log(`🎬 Testing with scenario: ${title}`);
                await this.playScenarioSequence(title);
            } else {
                console.log('🔇 No audio scenarios available for testing');
            }
            
            console.log('✅ Audio system test completed');
            
        } catch (error) {
            console.error('❌ Audio system test failed:', error);
        }
    }
}

/**
 * Integration with existing game engine
 */
function integratePhuzzyAudio(gameEngine) {
    // Replace the old VoicePlayer with the new integration
    const audioIntegration = new PhuzzyAudioIntegration(gameEngine);
    
    // Maintain legacy interface
    gameEngine.voicePlayer = audioIntegration;
    gameEngine.audioEngine = audioIntegration.audioEngine;
    
    // Enhanced audio methods
    gameEngine.playScenarioAudio = (scenarioTitle, packId) => {
        return audioIntegration.playScenarioSequence(scenarioTitle, packId);
    };
    
    gameEngine.preloadUpcomingAudio = (currentIndex, total) => {
        return audioIntegration.preloadUpcoming(currentIndex, total);
    };
    
    gameEngine.playUISound = (soundType, options) => {
        return audioIntegration.playUISound(soundType, options);
    };
    
    gameEngine.testAudio = () => {
        return audioIntegration.testAudioSystem();
    };
    
    console.log('🔗 Phuzzy Audio Engine fully integrated with game engine');
    return audioIntegration;
}

// Export
if (typeof window !== 'undefined') {
    window.PhuzzyAudioIntegration = PhuzzyAudioIntegration;
    window.integratePhuzzyAudio = integratePhuzzyAudio;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PhuzzyAudioIntegration, integratePhuzzyAudio };
}