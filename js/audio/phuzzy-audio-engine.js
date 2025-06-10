/**
 * 🎵 Phuzzy Audio Engine
 * A comprehensive, channel-based audio system for educational games
 * 
 * Features:
 * - Multi-channel architecture (dialogue, effects, music, ui)
 * - Queue-based playback with priorities
 * - Smart interruption handling
 * - Auto-discovery of audio assets
 * - Crossfade, ducking, and mixing capabilities
 * - Memory-efficient preloading
 * - Graceful degradation and error recovery
 * 
 * Built for the Allen+Claude game engine family
 * 
 * @version 1.0.0
 * @author Claude & Allen
 */

class PhuzzyAudioEngine {
    constructor(config = {}) {
        this.config = {
            // Base paths
            audioBasePath: config.audioBasePath || '../data/audio-recording-voices-for-scenarios-from-elevenlabs/',
            
            // First-play optimization
            enableFirstPlayOptimization: config.enableFirstPlayOptimization !== false,
            silentPrewarmDuration: config.silentPrewarmDuration || 100, // ms of silence to pre-warm
            audioContextLatency: config.audioContextLatency || 'interactive', // or 'balanced'
            
            // Channel configuration
            channels: {
                dialogue: { volume: 1.0, priority: 100, crossfade: true },
                effects: { volume: 0.8, priority: 50, crossfade: false },
                music: { volume: 0.6, priority: 10, crossfade: true },
                ui: { volume: 0.9, priority: 75, crossfade: false }
            },
            
            // Performance settings
            maxConcurrentAudio: config.maxConcurrentAudio || 8,
            preloadDistance: config.preloadDistance || 3,
            memoryLimit: config.memoryLimit || 50 * 1024 * 1024, // 50MB
            
            // Timing settings
            crossfadeDuration: config.crossfadeDuration || 500,
            duckingLevel: config.duckingLevel || 0.3,
            
            // Auto-discovery
            autoDiscoverAssets: config.autoDiscoverAssets !== false,
            fallbackStrategy: config.fallbackStrategy || 'intelligent',
            
            // Debug mode
            debug: config.debug || false,
            
            ...config
        };
        
        // Internal state
        this.channels = new Map();
        this.queues = new Map();
        this.audioCache = new Map();
        this.assetRegistry = new Map();
        this.activeStreams = new Set();
        this.memoryUsage = 0;
        this.isInitialized = false;
        this.masterVolume = 1.0;
        this.globalMuted = false;
        
        // First-play optimization state
        this.audioSystemWarmedUp = false;
        this.firstInteractionReceived = false;
        this.warmupPromise = null;
        
        // Initialize channels
        this.initializeChannels();
        
        // Audio context for advanced features
        this.audioContext = null;
        this.masterGain = null;
        
        // Asset discovery
        if (this.config.autoDiscoverAssets) {
            this.discoverAssets();
        }
        
        // Set up first-play optimization
        if (this.config.enableFirstPlayOptimization) {
            this.setupFirstPlayOptimization();
        }
        
        this.log('🎵 Phuzzy Audio Engine initialized', this.config);
    }
    
    /**
     * Initialize audio channels
     */
    initializeChannels() {
        Object.entries(this.config.channels).forEach(([name, settings]) => {
            this.channels.set(name, {
                ...settings,
                currentStream: null,
                queue: [],
                gain: null, // Will be set when AudioContext is available
                muted: false,
                ducked: false,
                duckingGain: 1.0
            });
            this.queues.set(name, []);
        });
    }
    
    /**
     * Initialize Web Audio API for advanced features
     */
    async initializeAudioContext() {
        if (this.audioContext) return;
        
        try {
            // Use optimized latency hint for interactive audio
            const contextOptions = {
                latencyHint: this.config.audioContextLatency,
                sampleRate: 44100 // Standard for most content
            };
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)(contextOptions);
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            // Create gain nodes for each channel
            this.channels.forEach((channel, name) => {
                channel.gain = this.audioContext.createGain();
                channel.gain.gain.value = channel.volume;
                channel.gain.connect(this.masterGain);
            });
            
            this.log('🔊 Web Audio API initialized with', contextOptions);
        } catch (error) {
            this.log('⚠️ Web Audio API not available, using basic HTML5 audio', error);
        }
    }
    
    /**
     * Set up first-play optimization to eliminate the "hiccup"
     */
    setupFirstPlayOptimization() {
        // Listen for first user interaction to warm up the audio system
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        const handleFirstInteraction = () => {
            if (this.firstInteractionReceived) return;
            
            this.firstInteractionReceived = true;
            this.warmupPromise = this.warmupAudioSystem();
            
            // Remove listeners after first interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleFirstInteraction, { capture: true });
            });
            
            this.log('👆 First user interaction detected - warming up audio system');
        };
        
        // Add passive listeners that capture the first interaction
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleFirstInteraction, { 
                capture: true, 
                passive: true,
                once: false // We handle removal manually
            });
        });
        
        this.log('🎯 First-play optimization armed - waiting for user interaction');
    }
    
    /**
     * Warm up the audio system to eliminate first-play delays
     */
    async warmupAudioSystem() {
        if (this.audioSystemWarmedUp) return;
        
        try {
            // Step 1: Initialize audio context (requires user gesture)
            await this.initializeAudioContext();
            
            // Step 2: Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                this.log('🔄 Resumed suspended audio context');
            }
            
            // Step 3: Create and play a tiny silent audio buffer to prime the system
            await this.primeAudioSystem();
            
            // Step 4: Pre-warm HTML5 audio elements
            await this.prewarmHTML5Audio();
            
            this.audioSystemWarmedUp = true;
            this.log('🔥 Audio system fully warmed up - first-play hiccup eliminated!');
            
        } catch (error) {
            this.log('⚠️ Audio system warmup failed:', error);
            // Don't throw - graceful degradation
        }
    }
    
    /**
     * Prime the Web Audio API system with silent audio
     */
    async primeAudioSystem() {
        if (!this.audioContext) return;
        
        try {
            // Create a tiny silent buffer
            const silentDuration = this.config.silentPrewarmDuration / 1000; // Convert to seconds
            const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * silentDuration, this.audioContext.sampleRate);
            
            // Create and connect nodes
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = 0.001; // Nearly silent
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Play the silent buffer
            source.start();
            
            // Wait for it to complete
            await new Promise(resolve => {
                source.onended = resolve;
                // Fallback timeout
                setTimeout(resolve, silentDuration * 1000 + 50);
            });
            
            this.log('🔇 Web Audio API primed with silent buffer');
            
        } catch (error) {
            this.log('⚠️ Web Audio API priming failed:', error);
        }
    }
    
    /**
     * Pre-warm HTML5 audio elements
     */
    async prewarmHTML5Audio() {
        try {
            // Create a silent data URL (0.1 seconds of silence)
            const silentAudio = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAFN3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyAFRQRTEAAAARAAAAU3dpdGNoIFBsdXMgMi4wMwBUU1NFAAAADwAAA0xhdmY1Ni40MC4xMDEA';
            
            // Create and configure test audio element
            const testAudio = new Audio();
            testAudio.preload = 'auto';
            testAudio.volume = 0.001; // Nearly silent
            testAudio.src = silentAudio;
            
            // Prime the audio element
            const playPromise = testAudio.play();
            
            if (playPromise) {
                await playPromise;
                
                // Stop immediately
                testAudio.pause();
                testAudio.currentTime = 0;
                
                this.log('🔇 HTML5 audio primed with silent data');
            }
            
            // Clean up
            testAudio.src = '';
            
        } catch (error) {
            this.log('⚠️ HTML5 audio prewarming failed:', error);
        }
    }
    
    /**
     * Ensure audio system is warmed up before playing
     */
    async ensureAudioReady() {
        if (this.audioSystemWarmedUp) return;
        
        if (!this.firstInteractionReceived) {
            throw new Error('Audio requires user interaction - please ensure user has clicked/tapped first');
        }
        
        if (this.warmupPromise) {
            await this.warmupPromise;
        } else {
            await this.warmupAudioSystem();
        }
    }
    
    /**
     * Discover available audio assets automatically
     */
    async discoverAssets() {
        try {
            // In a real implementation, this would scan the file system
            // For now, we'll build from known patterns
            
            const packs = ['000', '001', '002', '003', '004', '005', '006', '007'];
            const audioTypes = ['title', 'content', 'claim'];
            
            for (const pack of packs) {
                for (let scenario = 0; scenario < 10; scenario++) {
                    const scenarioId = scenario.toString().padStart(3, '0');
                    const folderPath = `pack-${pack}-scenario-${scenarioId}`;
                    
                    for (const type of audioTypes) {
                        const assetKey = `${pack}-${scenarioId}-${type}`;
                        const assetPath = `${this.config.audioBasePath}${folderPath}/${type}.mp3`;
                        
                        this.assetRegistry.set(assetKey, {
                            path: assetPath,
                            pack: pack,
                            scenario: scenarioId,
                            type: type,
                            discovered: true,
                            verified: false // Will be verified on first load
                        });
                    }
                }
            }
            
            this.log(`🔍 Discovered ${this.assetRegistry.size} potential audio assets`);
        } catch (error) {
            this.log('⚠️ Asset discovery failed', error);
        }
    }
    
    /**
     * Play audio with comprehensive options
     */
    async play(audioSpec, options = {}) {
        const {
            channel = 'dialogue',
            priority = null,
            interrupt = 'smart',
            volume = null,
            fadeIn = false,
            loop = false,
            onComplete = null,
            onError = null
        } = options;
        
        try {
            // Ensure we're initialized and audio system is ready
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            // Ensure audio system is warmed up to prevent first-play hiccup
            await this.ensureAudioReady();
            
            // Resolve audio asset
            const asset = await this.resolveAsset(audioSpec);
            if (!asset) {
                throw new Error(`Audio asset not found: ${JSON.stringify(audioSpec)}`);
            }
            
            // Create play request
            const playRequest = {
                id: this.generateId(),
                asset,
                channel,
                priority: priority || this.channels.get(channel).priority,
                interrupt,
                volume: volume !== null ? volume : this.channels.get(channel).volume,
                fadeIn,
                loop,
                onComplete,
                onError,
                timestamp: Date.now()
            };
            
            // Handle interruption logic
            await this.handleInterruption(playRequest);
            
            // Queue or play immediately
            if (this.shouldQueue(playRequest)) {
                this.addToQueue(playRequest);
                this.log(`📥 Queued audio: ${asset.path}`);
            } else {
                await this.playImmediate(playRequest);
            }
            
            return playRequest.id;
            
        } catch (error) {
            this.log('❌ Play failed', error);
            if (options.onError) options.onError(error);
            throw error;
        }
    }
    
    /**
     * Play a sequence of audio files
     */
    async playSequence(sequence, options = {}) {
        const {
            channel = 'dialogue',
            gapBetween = 500,
            allowInterruption = true,
            onProgress = null,
            onComplete = null
        } = options;
        
        const sequenceId = this.generateId();
        const playedIds = [];
        
        try {
            for (let i = 0; i < sequence.length; i++) {
                const audioSpec = sequence[i];
                
                // Play current audio
                const playId = await this.play(audioSpec, {
                    ...options,
                    channel,
                    interrupt: i === 0 ? options.interrupt : 'queue'
                });
                
                playedIds.push(playId);
                
                // Wait for completion
                await this.waitForCompletion(playId);
                
                // Progress callback
                if (onProgress) {
                    onProgress(i + 1, sequence.length, audioSpec);
                }
                
                // Gap between tracks (except after last)
                if (i < sequence.length - 1 && gapBetween > 0) {
                    await this.wait(gapBetween);
                }
            }
            
            if (onComplete) onComplete(sequenceId, playedIds);
            return sequenceId;
            
        } catch (error) {
            this.log('❌ Sequence failed', error);
            // Stop any remaining audio in the sequence
            playedIds.forEach(id => this.stop(id));
            throw error;
        }
    }
    
    /**
     * Smart asset resolution with fallbacks
     */
    async resolveAsset(audioSpec) {
        // Handle different input formats
        let searchKey = null;
        
        if (typeof audioSpec === 'string') {
            // Direct path
            if (audioSpec.includes('.mp3') || audioSpec.includes('.wav')) {
                return { path: audioSpec, type: 'direct' };
            }
            // Asset key
            searchKey = audioSpec;
        } else if (audioSpec.scenarioTitle) {
            // Title-based lookup (legacy compatibility)
            searchKey = this.findAssetByTitle(audioSpec.scenarioTitle, audioSpec.type || 'content');
        } else if (audioSpec.pack !== undefined && audioSpec.scenario !== undefined) {
            // Pack-based lookup
            const pack = audioSpec.pack.toString().padStart(3, '0');
            const scenario = audioSpec.scenario.toString().padStart(3, '0');
            const type = audioSpec.type || 'content';
            searchKey = `${pack}-${scenario}-${type}`;
        }
        
        // Try direct registry lookup
        if (searchKey && this.assetRegistry.has(searchKey)) {
            const asset = this.assetRegistry.get(searchKey);
            
            // Verify asset exists if not already verified
            if (!asset.verified) {
                asset.verified = await this.verifyAsset(asset.path);
            }
            
            if (asset.verified) {
                return asset;
            }
        }
        
        // Fallback strategies
        if (this.config.fallbackStrategy === 'intelligent') {
            return await this.intelligentFallback(audioSpec);
        }
        
        return null;
    }
    
    /**
     * Intelligent fallback when primary asset isn't found
     */
    async intelligentFallback(audioSpec) {
        this.log(`🔄 Attempting intelligent fallback for:`, audioSpec);
        
        // Strategy 1: Look for similar assets in the same pack
        if (audioSpec.pack !== undefined) {
            const pack = audioSpec.pack.toString().padStart(3, '0');
            
            // Try different scenarios in the same pack
            for (let i = 0; i < 10; i++) {
                const scenario = i.toString().padStart(3, '0');
                const key = `${pack}-${scenario}-${audioSpec.type || 'content'}`;
                
                if (this.assetRegistry.has(key)) {
                    const asset = this.assetRegistry.get(key);
                    if (!asset.verified) asset.verified = await this.verifyAsset(asset.path);
                    if (asset.verified) {
                        this.log(`🎯 Fallback success: Using ${key}`);
                        return asset;
                    }
                }
            }
        }
        
        // Strategy 2: Generic placeholder audio
        const placeholderKey = 'placeholder-' + (audioSpec.type || 'content');
        if (this.assetRegistry.has(placeholderKey)) {
            this.log(`🔄 Using placeholder audio`);
            return this.assetRegistry.get(placeholderKey);
        }
        
        // Strategy 3: Silent fallback
        return {
            path: 'data:audio/mp3;base64,', // Empty audio data
            type: 'silent',
            duration: 1000
        };
    }
    
    /**
     * Find asset by scenario title (legacy support)
     */
    findAssetByTitle(title, type = 'content') {
        // This maintains compatibility with the old mapping system
        const titleMappings = new Map([
            ['My Own Boss Blues', '000-000'],
            ['The Algorithm Whisperer', '000-001'],
            ['Balanced Climate Report', '000-002'],
            ['The Ethical Closet Confession', '000-003'],
            ['The Package Thief Vigilante', '000-004']
            // More mappings would be auto-generated from scenario data
        ]);
        
        if (titleMappings.has(title)) {
            const [pack, scenario] = titleMappings.get(title).split('-');
            return `${pack}-${scenario}-${type}`;
        }
        
        return null;
    }
    
    /**
     * Handle interruption logic based on priorities and settings
     */
    async handleInterruption(playRequest) {
        const channelData = this.channels.get(playRequest.channel);
        const currentStream = channelData.currentStream;
        
        if (!currentStream) return;
        
        switch (playRequest.interrupt) {
            case 'immediate':
                await this.stopChannel(playRequest.channel);
                break;
                
            case 'smart':
                if (playRequest.priority > currentStream.priority) {
                    await this.stopChannel(playRequest.channel, { fadeOut: true });
                } else {
                    // Lower priority - add to queue
                    this.addToQueue(playRequest);
                    return false; // Don't play immediately
                }
                break;
                
            case 'queue':
                this.addToQueue(playRequest);
                return false;
                
            case 'duck':
                await this.duckChannel(playRequest.channel);
                break;
                
            case 'none':
                if (currentStream) {
                    return false; // Don't interrupt
                }
                break;
        }
        
        return true; // OK to play immediately
    }
    
    /**
     * Duck (lower volume of) a channel
     */
    async duckChannel(channelName) {
        const channel = this.channels.get(channelName);
        if (!channel || !channel.currentStream) return;
        
        channel.ducked = true;
        
        if (this.audioContext && channel.gain) {
            // Smooth volume reduction using Web Audio API
            const currentTime = this.audioContext.currentTime;
            channel.gain.gain.cancelScheduledValues(currentTime);
            channel.gain.gain.setValueAtTime(channel.gain.gain.value, currentTime);
            channel.gain.gain.linearRampToValueAtTime(
                channel.volume * this.config.duckingLevel,
                currentTime + this.config.crossfadeDuration / 1000
            );
        } else if (channel.currentStream && channel.currentStream.audio) {
            // Fallback to HTML5 audio volume
            const audio = channel.currentStream.audio;
            const targetVolume = channel.volume * this.config.duckingLevel;
            this.animateVolume(audio, audio.volume, targetVolume, this.config.crossfadeDuration);
        }
        
        this.log(`🦆 Ducked channel: ${channelName}`);
    }
    
    /**
     * Un-duck (restore volume of) a channel
     */
    async unduckChannel(channelName) {
        const channel = this.channels.get(channelName);
        if (!channel || !channel.ducked) return;
        
        channel.ducked = false;
        
        if (this.audioContext && channel.gain) {
            const currentTime = this.audioContext.currentTime;
            channel.gain.gain.cancelScheduledValues(currentTime);
            channel.gain.gain.setValueAtTime(channel.gain.gain.value, currentTime);
            channel.gain.gain.linearRampToValueAtTime(
                channel.volume,
                currentTime + this.config.crossfadeDuration / 1000
            );
        } else if (channel.currentStream && channel.currentStream.audio) {
            const audio = channel.currentStream.audio;
            this.animateVolume(audio, audio.volume, channel.volume, this.config.crossfadeDuration);
        }
        
        this.log(`🦆⬆️ Un-ducked channel: ${channelName}`);
    }
    
    /**
     * Crossfade between audio tracks
     */
    async crossfade(fromAudio, toAudio, duration = null) {
        duration = duration || this.config.crossfadeDuration;
        
        if (this.audioContext) {
            // Use Web Audio API for smooth crossfading
            return this.webAudioCrossfade(fromAudio, toAudio, duration);
        } else {
            // Fallback crossfade using HTML5 audio
            return this.basicCrossfade(fromAudio, toAudio, duration);
        }
    }
    
    /**
     * Web Audio API crossfade
     */
    async webAudioCrossfade(fromAudio, toAudio, duration) {
        // This would implement proper Web Audio API crossfading
        // For now, fall back to basic crossfade
        return this.basicCrossfade(fromAudio, toAudio, duration);
    }
    
    /**
     * Basic crossfade using volume animation
     */
    async basicCrossfade(fromAudio, toAudio, duration) {
        const steps = 20;
        const stepDuration = duration / steps;
        
        // Start the new audio at 0 volume
        toAudio.volume = 0;
        toAudio.play();
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            
            if (fromAudio && !fromAudio.paused) {
                fromAudio.volume = 1 - progress;
            }
            
            toAudio.volume = progress;
            
            if (i < steps) {
                await this.wait(stepDuration);
            }
        }
        
        // Stop the old audio
        if (fromAudio && !fromAudio.paused) {
            fromAudio.pause();
            fromAudio.currentTime = 0;
        }
    }
    
    /**
     * Animate volume change smoothly
     */
    async animateVolume(audio, fromVolume, toVolume, duration) {
        const steps = 20;
        const stepDuration = duration / steps;
        const volumeStep = (toVolume - fromVolume) / steps;
        
        for (let i = 0; i <= steps; i++) {
            audio.volume = fromVolume + (volumeStep * i);
            if (i < steps) {
                await this.wait(stepDuration);
            }
        }
    }
    
    /**
     * Preload audio assets intelligently
     */
    async preload(assets, priority = 'background') {
        const preloadPromises = assets.map(async (assetSpec) => {
            try {
                const asset = await this.resolveAsset(assetSpec);
                if (!asset) return null;
                
                if (this.audioCache.has(asset.path)) {
                    return this.audioCache.get(asset.path);
                }
                
                // Check memory limits
                if (this.memoryUsage > this.config.memoryLimit) {
                    await this.cleanupCache();
                }
                
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = asset.path;
                
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Preload timeout: ${asset.path}`));
                    }, 10000);
                    
                    audio.addEventListener('canplaythrough', () => {
                        clearTimeout(timeout);
                        this.audioCache.set(asset.path, audio);
                        this.memoryUsage += this.estimateAudioSize(audio);
                        this.log(`📦 Preloaded: ${asset.path}`);
                        resolve(audio);
                    }, { once: true });
                    
                    audio.addEventListener('error', () => {
                        clearTimeout(timeout);
                        reject(new Error(`Preload failed: ${asset.path}`));
                    }, { once: true });
                });
                
            } catch (error) {
                this.log(`⚠️ Preload failed for ${assetSpec}:`, error);
                return null;
            }
        });
        
        const results = await Promise.allSettled(preloadPromises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null);
        
        this.log(`📦 Preloaded ${successful.length}/${assets.length} assets`);
        return successful.map(r => r.value);
    }
    
    /**
     * Clean up audio cache to manage memory
     */
    async cleanupCache() {
        // Sort cached audio by last access time and memory usage
        const cacheEntries = Array.from(this.audioCache.entries()).map(([path, audio]) => ({
            path,
            audio,
            lastAccess: audio._lastAccess || 0,
            estimatedSize: this.estimateAudioSize(audio)
        }));
        
        // Sort by last access (oldest first)
        cacheEntries.sort((a, b) => a.lastAccess - b.lastAccess);
        
        // Remove oldest entries until we're under the limit
        let cleaned = 0;
        while (this.memoryUsage > this.config.memoryLimit * 0.8 && cacheEntries.length > 0) {
            const entry = cacheEntries.shift();
            this.audioCache.delete(entry.path);
            this.memoryUsage -= entry.estimatedSize;
            entry.audio.src = ''; // Free memory
            cleaned++;
        }
        
        if (cleaned > 0) {
            this.log(`🧹 Cleaned up ${cleaned} cached audio files`);
        }
    }
    
    /**
     * Estimate audio file memory usage
     */
    estimateAudioSize(audio) {
        // Rough estimation based on duration and quality
        // In reality, this would be more sophisticated
        const duration = audio.duration || 10; // Default 10 seconds
        const bitrate = 128000; // 128 kbps MP3
        return (duration * bitrate) / 8; // Convert to bytes
    }
    
    /**
     * Stop all audio or specific channels/streams
     */
    stop(target = 'all', options = {}) {
        const { fadeOut = false } = options;
        
        if (target === 'all') {
            this.channels.forEach((_, channelName) => {
                this.stopChannel(channelName, { fadeOut });
            });
        } else if (this.channels.has(target)) {
            this.stopChannel(target, { fadeOut });
        } else {
            // Assume it's a stream ID
            this.stopStream(target, { fadeOut });
        }
    }
    
    /**
     * Stop a specific channel
     */
    async stopChannel(channelName, options = {}) {
        const channel = this.channels.get(channelName);
        if (!channel || !channel.currentStream) return;
        
        await this.stopStream(channel.currentStream.id, options);
    }
    
    /**
     * Stop a specific stream
     */
    async stopStream(streamId, options = {}) {
        const { fadeOut = false } = options;
        
        // Find the stream across all channels
        for (const [channelName, channel] of this.channels) {
            if (channel.currentStream && channel.currentStream.id === streamId) {
                const stream = channel.currentStream;
                
                if (fadeOut && stream.audio) {
                    await this.animateVolume(stream.audio, stream.audio.volume, 0, this.config.crossfadeDuration);
                }
                
                if (stream.audio) {
                    stream.audio.pause();
                    stream.audio.currentTime = 0;
                }
                
                channel.currentStream = null;
                this.activeStreams.delete(streamId);
                
                // Process queue
                this.processQueue(channelName);
                
                this.log(`⏹️ Stopped stream: ${streamId}`);
                break;
            }
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.audioContext && this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        } else {
            // Apply to all active audio elements
            for (const stream of this.activeStreams) {
                // Find and update volume... (simplified)
            }
        }
        
        this.log(`🔊 Master volume: ${Math.round(this.masterVolume * 100)}%`);
    }
    
    /**
     * Mute/unmute globally or by channel
     */
    setMuted(muted, channel = null) {
        if (channel) {
            const channelData = this.channels.get(channel);
            if (channelData) {
                channelData.muted = muted;
            }
        } else {
            this.globalMuted = muted;
        }
        
        this.log(`🔇 ${muted ? 'Muted' : 'Unmuted'}: ${channel || 'global'}`);
    }
    
    /**
     * Get current state for debugging/monitoring
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            masterVolume: this.masterVolume,
            globalMuted: this.globalMuted,
            channels: Object.fromEntries(
                Array.from(this.channels.entries()).map(([name, channel]) => [
                    name,
                    {
                        volume: channel.volume,
                        muted: channel.muted,
                        ducked: channel.ducked,
                        hasCurrentStream: !!channel.currentStream,
                        queueLength: channel.queue.length
                    }
                ])
            ),
            activeStreams: this.activeStreams.size,
            cachedAssets: this.audioCache.size,
            memoryUsage: this.memoryUsage,
            registeredAssets: this.assetRegistry.size
        };
    }
    
    // === HELPER METHODS ===
    
    async initialize() {
        if (this.isInitialized) return;
        
        await this.initializeAudioContext();
        this.isInitialized = true;
        
        this.log('🚀 Phuzzy Audio Engine fully initialized');
    }
    
    generateId() {
        return `phuzzy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async waitForCompletion(streamId) {
        return new Promise((resolve) => {
            const checkCompletion = () => {
                if (!this.activeStreams.has(streamId)) {
                    resolve();
                } else {
                    setTimeout(checkCompletion, 100);
                }
            };
            checkCompletion();
        });
    }
    
    async verifyAsset(path) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    shouldQueue(playRequest) {
        const channel = this.channels.get(playRequest.channel);
        return channel.currentStream && playRequest.interrupt === 'queue';
    }
    
    addToQueue(playRequest) {
        const channel = this.channels.get(playRequest.channel);
        channel.queue.push(playRequest);
        
        // Sort by priority
        channel.queue.sort((a, b) => b.priority - a.priority);
    }
    
    async processQueue(channelName) {
        const channel = this.channels.get(channelName);
        if (channel.currentStream || channel.queue.length === 0) return;
        
        const nextRequest = channel.queue.shift();
        await this.playImmediate(nextRequest);
    }
    
    async playImmediate(playRequest) {
        // Actual audio playback implementation
        try {
            let audio = this.audioCache.get(playRequest.asset.path);
            
            if (!audio) {
                audio = new Audio();
                
                // Optimize audio element for immediate playback
                audio.preload = 'auto';
                audio.crossOrigin = 'anonymous'; // Avoid CORS issues
                
                // Set source and wait for it to be ready
                audio.src = playRequest.asset.path;
                
                this.audioCache.set(playRequest.asset.path, audio);
                
                // For first-time loading, ensure it's ready to play immediately
                if (!this.audioSystemWarmedUp) {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Audio load timeout'));
                        }, 5000);
                        
                        const handleCanPlay = () => {
                            clearTimeout(timeout);
                            audio.removeEventListener('canplaythrough', handleCanPlay);
                            audio.removeEventListener('error', handleError);
                            resolve();
                        };
                        
                        const handleError = (error) => {
                            clearTimeout(timeout);
                            audio.removeEventListener('canplaythrough', handleCanPlay);
                            audio.removeEventListener('error', handleError);
                            reject(error);
                        };
                        
                        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
                        audio.addEventListener('error', handleError, { once: true });
                        
                        // If already ready, resolve immediately
                        if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                            handleCanPlay();
                        }
                    });
                }
            }
            
            audio._lastAccess = Date.now();
            audio.volume = playRequest.volume * this.masterVolume;
            audio.loop = playRequest.loop;
            
            const stream = {
                id: playRequest.id,
                audio,
                request: playRequest,
                startTime: Date.now()
            };
            
            const channel = this.channels.get(playRequest.channel);
            channel.currentStream = stream;
            this.activeStreams.add(playRequest.id);
            
            // Set up completion handling
            audio.addEventListener('ended', () => {
                this.activeStreams.delete(playRequest.id);
                channel.currentStream = null;
                
                if (playRequest.onComplete) {
                    playRequest.onComplete(playRequest.id);
                }
                
                // Process next in queue
                this.processQueue(playRequest.channel);
            }, { once: true });
            
            audio.addEventListener('error', (error) => {
                this.activeStreams.delete(playRequest.id);
                channel.currentStream = null;
                
                if (playRequest.onError) {
                    playRequest.onError(error);
                }
                
                this.processQueue(playRequest.channel);
            }, { once: true });
            
            // Fade in if requested
            if (playRequest.fadeIn) {
                audio.volume = 0;
                const playPromise = audio.play();
                
                // Handle play promise properly
                if (playPromise) {
                    await playPromise;
                }
                
                await this.animateVolume(audio, 0, playRequest.volume * this.masterVolume, this.config.crossfadeDuration);
            } else {
                // Use optimized play for immediate response
                const playPromise = this.optimizedPlay(audio);
                if (playPromise) {
                    await playPromise;
                }
            }
            
            this.log(`▶️ Playing: ${playRequest.asset.path} on ${playRequest.channel}`);
            
        } catch (error) {
            this.log('❌ Immediate play failed', error);
            if (playRequest.onError) playRequest.onError(error);
            throw error;
        }
    }
    
    /**
     * Optimized play method that handles promises and reduces first-play delay
     */
    optimizedPlay(audio) {
        try {
            // Reset to beginning for consistent playback
            if (audio.currentTime !== 0) {
                audio.currentTime = 0;
            }
            
            // Use the native play method
            const playPromise = audio.play();
            
            // Modern browsers return a promise
            if (playPromise && typeof playPromise.then === 'function') {
                return playPromise.catch(error => {
                    // Handle autoplay restrictions gracefully
                    if (error.name === 'NotAllowedError') {
                        this.log('⚠️ Autoplay blocked - user interaction required');
                    } else {
                        this.log('⚠️ Audio play failed:', error);
                    }
                    throw error;
                });
            }
            
            return Promise.resolve();
            
        } catch (error) {
            this.log('⚠️ Optimized play failed:', error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Prime specific audio for immediate playback (useful before sequences)
     */
    async primeAudioForImmediatePlay(audioSpec) {
        if (!this.audioSystemWarmedUp) {
            await this.ensureAudioReady();
        }
        
        try {
            const asset = await this.resolveAsset(audioSpec);
            if (!asset) return false;
            
            // Create and fully load the audio
            const audio = new Audio();
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';
            audio.src = asset.path;
            
            // Wait for it to be fully ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Prime timeout'));
                }, 3000);
                
                const handleReady = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', handleReady);
                    audio.removeEventListener('error', handleError);
                    resolve();
                };
                
                const handleError = (error) => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', handleReady);
                    audio.removeEventListener('error', handleError);
                    reject(error);
                };
                
                audio.addEventListener('canplaythrough', handleReady, { once: true });
                audio.addEventListener('error', handleError, { once: true });
                
                if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                    handleReady();
                }
            });
            
            // Cache it for immediate use
            this.audioCache.set(asset.path, audio);
            this.log(`🚀 Primed audio for immediate play: ${asset.path}`);
            return true;
            
        } catch (error) {
            this.log(`⚠️ Failed to prime audio:`, error);
            return false;
        }
    }
    
    /**
     * Get system diagnostics for first-play optimization
     */
    getFirstPlayDiagnostics() {
        return {
            firstInteractionReceived: this.firstInteractionReceived,
            audioSystemWarmedUp: this.audioSystemWarmedUp,
            hasAudioContext: !!this.audioContext,
            audioContextState: this.audioContext ? this.audioContext.state : 'none',
            cachedAudio: this.audioCache.size,
            warmupEnabled: this.config.enableFirstPlayOptimization
        };
    }
    
    log(...args) {
        if (this.config.debug) {
            console.log('[PhuzzyAudio]', ...args);
        }
    }
}

// Export for use in games
if (typeof window !== 'undefined') {
    window.PhuzzyAudioEngine = PhuzzyAudioEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhuzzyAudioEngine;
}