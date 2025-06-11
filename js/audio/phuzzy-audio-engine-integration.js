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
        
        // Initialize the full audio engine with user-optimized settings
        this.audioEngine = new PhuzzyAudioEngine({
            // Conservative settings for user devices
            maxConcurrentAudio: 8, // Reasonable for user devices
            memoryLimit: 50 * 1024 * 1024, // 50MB cache for user compatibility
            preloadDistance: 3, // Conservative preloading
            
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
            
            // User-friendly settings
            debug: false,
            autoDiscoverAssets: true,
            fallbackStrategy: 'intelligent'
        });
        
        // Legacy compatibility layer
        this.isEnabled = true;
        this.currentAudio = null;
        
        // Audio mappings for current pack
        this.scenarioMappings = new Map();
        // Note: buildScenarioMappings() will be called after pack loads
        
        console.log('🎵 Phuzzy Audio Integration initialized with user-optimized settings');
    }
    
    /**
     * Build audio mappings for the current pack only
     * Integrates with the single-pack scenario manager
     */
    async buildScenarioMappings() {
        try {
            // Get current pack from the scenario manager
            const currentPack = this.gameEngine.scenarioManager?.getCurrentPackInfo();
            
            if (currentPack && currentPack.pack) {
                await this.buildMappingsForPack(currentPack.pack);
            } else {
                console.log('📦 No current pack available, using fallback mappings');
                this.buildFallbackMappings();
            }
            
        } catch (error) {
            console.warn('⚠️ Could not build current pack mappings, using fallback:', error);
            this.buildFallbackMappings();
        }
    }
    
    /**
     * Build audio mappings for a specific pack
     * Only loads the current pack being played
     */
    async buildMappingsForPack(packInfo) {
        try {
            console.log(`🎯 Building audio mappings for ${packInfo.name} (${packInfo.id})`);
            
            const response = await fetch(packInfo.file);
            if (!response.ok) {
                throw new Error(`Failed to load pack: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.scenarios || !Array.isArray(data.scenarios)) {
                throw new Error('Invalid pack structure');
            }
            
            // Build mappings for this pack's scenarios
            data.scenarios.forEach((scenario, index) => {
                const packNumber = parseInt(packInfo.id.replace('pack-', ''));
                
                this.scenarioMappings.set(scenario.title, {
                    pack: packNumber,
                    scenario: index,
                    id: scenario.id,
                    hasAudio: false // Will be verified
                });
            });
            
            // Verify which scenarios actually have audio
            await this.verifyAudioAvailability();
            
            console.log(`🗺️ Built ${this.scenarioMappings.size} scenario audio mappings for ${packInfo.name}`);
            
        } catch (error) {
            throw new Error(`Failed to build mappings for pack: ${error.message}`);
        }
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
            
            // Play using the new audio engine with fade-in to prevent clipping
            const playId = await this.audioEngine.play(audioSpec, {
                channel,
                interrupt: 'smart',
                fadeIn: 200, // 200ms fade-in for all audio to prevent clipping
                fadeOut: 100, // 100ms fade-out for smooth transitions
                preload: true, // Preload to prevent delays
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
            
            // Ensure audio context is ready before starting
            if (this.audioEngine.audioContext && this.audioEngine.audioContext.state !== 'running') {
                try {
                    await this.audioEngine.audioContext.resume();
                    // Small delay to ensure audio context is fully ready
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (error) {
                    console.warn('Could not resume audio context:', error);
                }
            }
            
            // Play the sequence with intelligent gaps and fade-ins to prevent clipping
            const sequenceId = await this.audioEngine.playSequence(sequence, {
                channel: 'dialogue',
                gapBetween: 800, // Pause between audio segments
                fadeIn: 200, // 200ms fade-in for each audio part to prevent clipping
                fadeOut: 100, // 100ms fade-out for smooth transitions
                preload: true, // Preload all sequence parts to prevent delays
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
     * Update audio mappings when pack changes
     * Called by game engine when a new pack loads
     */
    async updateMappingsForCurrentPack() {
        const currentPack = this.gameEngine.scenarioManager?.getCurrentPackInfo();
        if (currentPack && currentPack.pack) {
            this.scenarioMappings.clear();
            await this.buildMappingsForPack(currentPack.pack);
            console.log(`🔄 Updated audio mappings for pack: ${currentPack.pack.name}`);
        }
    }
    
    /**
     * Enhanced methods for the new system
     */
    
    /**
     * Preload audio for upcoming scenarios (enhanced with progressive loading)
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
        
        console.log(`📦 Progressive preloading ${preloadSpecs.length} audio files...`);
        
        // Use progressive preloading for non-blocking background loading
        return this.audioEngine.preload(preloadSpecs, 'background');
    }
    
    /**
     * Preload current scenario immediately (blocking for critical audio)
     */
    async preloadCurrentScenario(scenarioTitle, packId = null) {
        const mapping = this.scenarioMappings.get(scenarioTitle);
        if (!mapping || !mapping.hasAudio) {
            console.warn(`No audio mapping for current scenario: ${scenarioTitle}`);
            return false;
        }
        
        const criticalSpecs = [
            { pack: mapping.pack, scenario: mapping.scenario, type: 'title' },
            { pack: mapping.pack, scenario: mapping.scenario, type: 'content' },
            { pack: mapping.pack, scenario: mapping.scenario, type: 'claim' }
        ];
        
        console.log(`⚡ Immediate preloading current scenario: ${scenarioTitle}`);
        
        // Use immediate preloading for current scenario (blocking)
        return this.audioEngine.preload(criticalSpecs, 'immediate');
    }
    
    /**
     * Start adaptive background preloading for the entire game session
     */
    startAdaptivePreloading(gameEngine) {
        if (!gameEngine) {
            console.warn('No game engine provided for adaptive preloading');
            return;
        }
        
        // Create game state provider function
        const gameStateProvider = () => {
            try {
                return {
                    currentScenarioIndex: gameEngine.scenariosCompleted?.length || 0,
                    scenarios: gameEngine.scenarioManager?.scenarios || [],
                    packInfo: gameEngine.scenarioManager?.getCurrentPackInfo()?.pack || {}
                };
            } catch (error) {
                console.warn('Error getting game state for preloading:', error);
                return null;
            }
        };
        
        // Start the background preloader
        this.audioEngine.startBackgroundPreloading(gameStateProvider);
        console.log('🚀 Adaptive background preloading started');
    }
    
    /**
     * Stop adaptive background preloading
     */
    stopAdaptivePreloading() {
        this.audioEngine.stopBackgroundPreloading();
        console.log('⏹️ Adaptive background preloading stopped');
    }
    
    /**
     * Get preloading status for debugging
     */
    getPreloadingStatus() {
        return this.audioEngine.getPreloadStatus();
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
    
    gameEngine.preloadCurrentScenario = (scenarioTitle, packId) => {
        return audioIntegration.preloadCurrentScenario(scenarioTitle, packId);
    };
    
    gameEngine.playUISound = (soundType, options) => {
        return audioIntegration.playUISound(soundType, options);
    };
    
    gameEngine.testAudio = () => {
        return audioIntegration.testAudioSystem();
    };
    
    // Audio pack integration
    gameEngine.updateAudioMappings = () => {
        return audioIntegration.updateMappingsForCurrentPack();
    };
    
    // Adaptive preloading controls
    gameEngine.startAdaptivePreloading = () => {
        return audioIntegration.startAdaptivePreloading(gameEngine);
    };
    
    gameEngine.stopAdaptivePreloading = () => {
        return audioIntegration.stopAdaptivePreloading();
    };
    
    gameEngine.getAudioPreloadStatus = () => {
        return audioIntegration.getPreloadingStatus();
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