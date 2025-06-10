// System Configuration for High-Performance Development
// This file detects system capabilities and sets appropriate limits

const os = require('os');

// Get system information
const totalMemoryGB = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
const cpuCount = os.cpus().length;
const platform = os.platform();
const hostname = os.hostname();

// Detect if running on Raspberry Pi or high-performance system
const isRaspberryPi = platform === 'linux' && (
    hostname.toLowerCase().includes('raspberry') ||
    totalMemoryGB <= 8
);

// Configuration based on system capabilities
const config = {
    // Memory limits (in MB)
    memory: {
        nodeHeapSize: isRaspberryPi ? 3072 : Math.min(16384, totalMemoryGB * 512), // 50% of RAM, max 16GB
        voiceGenerationLimit: isRaspberryPi ? 2048 : 8192,
        scenarioProcessingLimit: isRaspberryPi ? 2048 : 8192,
    },
    
    // Batch processing sizes
    batches: {
        scenariosPerBatch: isRaspberryPi ? 2 : 20,
        voicesPerBatch: isRaspberryPi ? 5 : 50,
        concurrentVoiceRequests: isRaspberryPi ? 1 : 5,
    },
    
    // Parallel processing
    parallel: {
        workerThreads: isRaspberryPi ? 2 : Math.min(cpuCount / 2, 16),
        maxConcurrentTasks: isRaspberryPi ? 2 : 10,
    },
    
    // Performance tuning
    performance: {
        enableCaching: !isRaspberryPi,
        useWorkerThreads: !isRaspberryPi && cpuCount > 4,
        compressAssets: isRaspberryPi,
        delayBetweenBatches: isRaspberryPi ? 2000 : 100, // ms
    },
    
    // System info for logging
    system: {
        hostname,
        platform,
        totalMemoryGB,
        cpuCount,
        isRaspberryPi,
        nodeVersion: process.version,
    }
};

// Export configuration
module.exports = config;

// CLI output if run directly
if (require.main === module) {
    console.log('🖥️  System Configuration Detected:');
    console.log('================================');
    console.log(`Platform: ${config.system.platform}`);
    console.log(`Hostname: ${config.system.hostname}`);
    console.log(`Total Memory: ${config.system.totalMemoryGB}GB`);
    console.log(`CPU Cores: ${config.system.cpuCount}`);
    console.log(`Node Version: ${config.system.nodeVersion}`);
    console.log(`System Type: ${config.system.isRaspberryPi ? 'Raspberry Pi' : 'High-Performance'}`);
    console.log('\n📊 Optimized Settings:');
    console.log(`Node Heap Size: ${config.memory.nodeHeapSize}MB`);
    console.log(`Scenarios Per Batch: ${config.batches.scenariosPerBatch}`);
    console.log(`Worker Threads: ${config.parallel.workerThreads}`);
    console.log(`Concurrent Voice Requests: ${config.batches.concurrentVoiceRequests}`);
}