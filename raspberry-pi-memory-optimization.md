# Raspberry Pi Memory Optimization for Node.js

## System Configuration
- **Platform**: Raspberry Pi (ARM64/aarch64)
- **RAM**: 8GB
- **OS**: Linux 6.12.25+rpt-rpi-v8
- **Node.js Default Heap**: 1.5GB (64-bit systems)

## Recommended Settings

### Memory Allocation
```bash
# Conservative (recommended for stability)
NODE_MEMORY_LIMIT=3072  # 3GB

# Moderate (if needed for larger operations)
NODE_MEMORY_LIMIT=4096  # 4GB

# Maximum safe limit (leaves 3GB for OS)
NODE_MEMORY_LIMIT=5120  # 5GB
```

### Monitoring Commands
```bash
# Check available memory
free -h

# Monitor in real-time
htop

# Check Node.js process memory
ps aux | grep node

# System memory pressure
cat /proc/meminfo | grep -E "MemFree|MemAvailable|SwapFree"
```

### Performance Tuning

1. **Batch Processing Settings**
   - Keep SCENARIOS_PER_BATCH at 2 for safety
   - Can increase to 3-4 if memory usage stays under 60%

2. **Garbage Collection Tuning**
   ```bash
   # Force more frequent GC (reduces peak memory)
   node --max-old-space-size=3072 --gc-interval=100 script.js
   
   # Expose GC for manual control
   node --expose-gc --max-old-space-size=3072 script.js
   ```

3. **System-Level Optimizations**
   ```bash
   # Increase swap (if using SD card, use cautiously)
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # Set CONF_SWAPSIZE=2048
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

## ARM64-Specific Considerations

1. **Memory Alignment**: ARM processors may handle unaligned memory access differently
2. **JIT Compilation**: V8's JIT may use more memory on ARM during optimization
3. **Buffer Pools**: Consider smaller buffer allocations for ARM

## Troubleshooting

### Symptoms of Memory Issues
- System becomes unresponsive
- SSH sessions freeze
- Node.js crashes with heap errors
- Kernel OOM killer activates

### Quick Fixes
1. Reduce memory limit to 2GB: `NODE_MEMORY_LIMIT=2048`
2. Process single scenarios: `SCENARIOS_PER_BATCH=1`
3. Add cooling pause between batches: `sleep 5`
4. Clear system cache: `sudo sh -c "echo 3 > /proc/sys/vm/drop_caches"`

### Memory Usage Formula
```
Total RAM (8GB) = 
  OS & Services (1-2GB) +
  Node.js Heap (3-4GB) +
  Node.js Non-Heap (0.5-1GB) +
  Buffer/Cache (1-2GB) +
  Safety Margin (1GB)
```

## Best Practices for Raspberry Pi

1. **Start Conservative**: Begin with 3GB limit
2. **Monitor First Run**: Watch memory during initial batch
3. **Gradual Increases**: Only increase if stable
4. **Regular Reboots**: Consider rebooting between large jobs
5. **Temperature**: Monitor CPU temp - throttling affects performance
   ```bash
   vcgencmd measure_temp
   ```