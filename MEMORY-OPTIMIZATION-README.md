# Memory-Optimized Scenario Generation System

## Overview
This system prevents JavaScript heap memory errors when generating large numbers of scenarios by processing them in small batches with automatic memory management.

## The Problem
When adding many scenarios sequentially, Node.js memory usage grows until hitting the heap limit, causing:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

## The Solution
Process scenarios in batches of 2, completely restarting Node.js between batches to release all memory.

## Scripts

### 1. `memory-safe-scenario-adder.js`
Core script that safely adds scenarios with memory monitoring.

**Features:**
- Processes 1-2 scenarios at a time
- Monitors memory usage in real-time
- Creates automatic backups before changes
- Validates scenario structure
- Stops if memory exceeds 70%

**Usage:**
```bash
node memory-safe-scenario-adder.js scenario-11.json scenario-12.json
```

### 2. `batch-scenario-orchestrator.sh`
Automated script that processes all scenario files in memory-safe batches.

**Features:**
- Finds all `scenario-*.json` files automatically
- Processes in batches of 2
- Restarts Node.js between batches
- Shows progress and statistics
- Handles errors gracefully

**Usage:**
```bash
bash batch-scenario-orchestrator.sh
```

### 3. `memory-safe-workflow-demo.js`
Demo script showing system status and usage examples.

**Usage:**
```bash
node memory-safe-workflow-demo.js
```

## Workflow Example

1. **Create scenario files:**
   ```bash
   # Create individual scenario JSON files
   scenario-11-example.json
   scenario-12-example.json
   scenario-13-example.json
   # etc...
   ```

2. **Run batch processor:**
   ```bash
   bash batch-scenario-orchestrator.sh
   ```
   
   Output:
   ```
   🎯 Batch Scenario Orchestrator
   📁 Found 6 scenario files to process
   
   🔄 Batch 1
   📋 Processing files:
      - scenario-11-example.json
      - scenario-12-example.json
   🚀 Starting Node.js with 4096MB memory limit...
   ✅ Successfully added 2 scenarios
   💾 Memory: 45MB / 140MB (32%)
   
   ⏸️  Pausing briefly before next batch...
   
   🔄 Batch 2
   📋 Processing files:
      - scenario-13-example.json
      - scenario-14-example.json
   [continues...]
   ```

## Memory Settings

### Raspberry Pi 8GB Configuration
For Raspberry Pi with 8GB RAM, recommended settings:
- Default memory limit: 3072MB (3GB)
- Maximum safe limit: 4096MB (4GB)
- Leave at least 2-3GB for OS and other processes

### Adjusting Memory Limits
1. Edit `NODE_MEMORY_LIMIT` in `batch-scenario-orchestrator.sh`
2. Or run manually with custom limit:
   ```bash
   node --max-old-space-size=3072 memory-safe-scenario-adder.js [files]
   ```

### Platform-Specific Notes
- ARM64 architecture may have different memory characteristics than x86_64
- Monitor system memory with `free -h` during processing
- Consider reducing batch size if memory issues persist

## Backup System

- Automatic backups created in `./backups/` directory
- Named with timestamp: `scenarios-backup-1234567890.json`
- Restored automatically if errors occur

## Best Practices

1. **Name scenarios sequentially:**
   - scenario-11-topic.json
   - scenario-12-topic.json
   - etc.

2. **Monitor the output:**
   - Check memory usage percentages
   - Verify scenario counts
   - Watch for validation errors

3. **Keep scenarios separate:**
   - One scenario per JSON file
   - Easier to debug issues
   - Can process selectively

4. **Regular backups:**
   - System creates them automatically
   - Keep important ones
   - Clean old backups periodically

## Troubleshooting

**"File not found" errors:**
- Ensure scenario files are in same directory as scripts
- Check file naming (must match `scenario-*.json`)

**"Invalid scenario" errors:**
- Verify all required fields present
- Check JSON syntax
- Use the validation in memory-safe-scenario-adder.js

**Memory still running out:**
- Reduce batch size (edit SCENARIOS_PER_BATCH)
- For Raspberry Pi: Keep memory limit under 4GB
- Monitor with `htop` or `free -h` during execution
- Check for memory leaks in scenario data
- Consider system swap configuration

## Performance Notes

With this system:
- Can process 50+ scenarios without memory issues
- Each batch takes ~5-10 seconds
- Total time: ~1 minute per 10 scenarios
- Memory stays under 50% usage per batch

## Advanced Memory Optimization Techniques (2025 Update)

### 1. Process Isolation Strategy
**Discovery**: Running memory-intensive operations through separate scripts prevents window crashes
- Main process delegates work to child processes
- If child process crashes, main window remains stable
- Implemented in `voice-generation-safe.sh`

### 2. Voice Generation Memory Management
When processing ElevenLabs API calls with large text content:
- Memory usage scales with: number of scenarios × average text length × voice variations
- API response buffering can cause memory spikes
- Solution: Process in controlled batches with memory monitoring

### 3. Real-World Results
**Voice Generation Project (27 scenarios, 84 MP3 files)**:
- Memory limit: 3GB (conservative for 8GB Raspberry Pi)
- Completion rate: 100% without crashes
- Total size generated: 29MB of audio
- Memory remained stable throughout

### 4. Key Insights
1. **Analytics Generation**: Defer heavy analytics until end of processing
2. **Character Extraction**: Complex regex operations on large texts need careful memory management
3. **File I/O**: Writing many files sequentially benefits from periodic garbage collection
4. **API Buffering**: Network responses should be streamed, not buffered entirely

### 5. Recommended Architecture Pattern
```
Main Process (Protected)
    ↓
Shell Orchestrator (Memory Monitor)
    ↓
Node.js Worker (Memory Limited)
    ↓
Output Files + Analytics
```

This pattern ensures the main development environment remains stable even if memory-intensive operations fail.