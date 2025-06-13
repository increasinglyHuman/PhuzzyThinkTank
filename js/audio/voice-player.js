// Voice Player Module for Scenario Audio
class VoicePlayer {
    constructor() {
        this.audioCache = new Map();
        this.currentAudio = null;
        this.baseUrl = 'data/voices/';
        this.isEnabled = this.checkAudioSupport();
        this.preloadQueue = [];
        this.isPreloading = false;
    }

    checkAudioSupport() {
        try {
            const audio = new Audio();
            return !!(audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, ''));
        } catch (e) {
            console.warn('Audio playback not supported:', e);
            return false;
        }
    }

    async preloadScenario(scenarioId, packId = null) {
        if (!this.isEnabled) return;
        
        // Support both old and new naming conventions
        let scenarioPath;
        if (packId !== null) {
            // New pack-based naming
            const packStr = packId.toString().padStart(3, '0');
            const scenarioStr = (scenarioId % 10).toString().padStart(3, '0');
            scenarioPath = `${this.baseUrl}pack-${packStr}-scenario-${scenarioStr}/`;
        } else {
            // Try new naming based on calculated pack
            const calculatedPack = Math.floor(scenarioId / 10).toString().padStart(3, '0');
            const scenarioIndex = (scenarioId % 10).toString().padStart(3, '0');
            scenarioPath = `${this.baseUrl}pack-${calculatedPack}-scenario-${scenarioIndex}/`;
        }
        
        const files = ['title.mp3', 'description.mp3'];
        
        for (const file of files) {
            const url = scenarioPath + file;
            if (!this.audioCache.has(url)) {
                this.preloadQueue.push(url);
            }
        }
        
        if (!this.isPreloading) {
            this.processPreloadQueue();
        }
    }

    async processPreloadQueue() {
        this.isPreloading = true;
        
        while (this.preloadQueue.length > 0) {
            const url = this.preloadQueue.shift();
            try {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = url;
                
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                });
                
                this.audioCache.set(url, audio);
            } catch (error) {
                console.warn(`Failed to preload ${url}:`, error);
            }
        }
        
        this.isPreloading = false;
    }

    async play(scenarioId, contentType, postIndex = null, packId = null) {
        if (!this.isEnabled) return false;
        
        this.stop(); // Stop any current playback
        
        // Support both old and new naming conventions
        let scenarioPath;
        if (packId !== null) {
            // New pack-based naming
            const packStr = packId.toString().padStart(3, '0');
            const scenarioStr = (scenarioId % 10).toString().padStart(3, '0');
            scenarioPath = `${this.baseUrl}pack-${packStr}-scenario-${scenarioStr}/`;
        } else {
            // Try new naming based on calculated pack
            const calculatedPack = Math.floor(scenarioId / 10).toString().padStart(3, '0');
            const scenarioIndex = (scenarioId % 10).toString().padStart(3, '0');
            scenarioPath = `${this.baseUrl}pack-${calculatedPack}-scenario-${scenarioIndex}/`;
        }
        
        let filename;
        
        switch (contentType) {
            case 'title':
                filename = 'title.mp3';
                break;
            case 'description':
                filename = 'description.mp3';
                break;
            case 'post':
                if (postIndex !== null) {
                    filename = `post-${postIndex.toString().padStart(3, '0')}.mp3`;
                }
                break;
            default:
                console.warn('Invalid content type:', contentType);
                return false;
        }
        
        const url = scenarioPath + filename;
        
        try {
            let audio = this.audioCache.get(url);
            
            if (!audio) {
                audio = new Audio(url);
                audio.preload = 'auto';
                
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                });
                
                this.audioCache.set(url, audio);
            }
            
            this.currentAudio = audio;
            audio.currentTime = 0;
            await audio.play();
            
            return true;
        } catch (error) {
            console.error('Audio playback failed:', error);
            return false;
        }
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    pause() {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
        }
    }

    resume() {
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play();
        }
    }

    setVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }
        
        // Apply to all cached audio
        for (const audio of this.audioCache.values()) {
            audio.volume = volume;
        }
    }

    isPlaying() {
        return this.currentAudio && !this.currentAudio.paused;
    }

    getDuration() {
        return this.currentAudio ? this.currentAudio.duration : 0;
    }

    getCurrentTime() {
        return this.currentAudio ? this.currentAudio.currentTime : 0;
    }

    // Clear cache for memory management
    clearCache() {
        this.stop();
        for (const audio of this.audioCache.values()) {
            audio.src = '';
        }
        this.audioCache.clear();
    }

    // Preload next scenario in background
    preloadNext(currentScenarioId, allScenarioIds) {
        const currentIndex = allScenarioIds.indexOf(currentScenarioId);
        if (currentIndex !== -1 && currentIndex < allScenarioIds.length - 1) {
            const nextId = allScenarioIds[currentIndex + 1];
            this.preloadScenario(nextId);
        }
    }
}

// Export for use in main game
window.VoicePlayer = VoicePlayer;