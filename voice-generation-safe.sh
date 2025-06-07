#!/bin/bash

# Memory-Safe Voice Generation Script for Raspberry Pi
# Based on memory optimization strategies from the project
# Usage: ./voice-generation-safe.sh [--turbo]

echo "🎙️ Memory-Safe Voice Generation Orchestrator"
echo "==========================================="

# Check for turbo flag
TURBO_MODE=""
QUALITY_MODE="Standard ($0.30/1k chars)"
if [[ "$1" == "--turbo" ]]; then
    TURBO_MODE="USE_TURBO=true"
    QUALITY_MODE="Turbo ($0.15/1k chars) - 50% savings!"
    echo "💨 TURBO MODE ENABLED"
fi

echo "💰 Quality Mode: $QUALITY_MODE"
echo ""

# Configuration
NODE_MEMORY_LIMIT=3072  # 3GB - conservative for RPi 8GB
LOG_FILE="voice-generation-$(date +%s).log"

# Check current memory
echo "📊 Current System Memory:"
free -h
echo ""

# Function to check if generation is needed
check_scenario_generated() {
    local scenario_num=$1
    local scenario_dir="data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-${scenario_num}"
    
    if [ -d "$scenario_dir" ] && [ -f "$scenario_dir/title.mp3" ]; then
        return 0  # Already generated
    else
        return 1  # Needs generation
    fi
}

# Count total scenarios
TOTAL_SCENARIOS=$(ls data/scenario-generated-*.json 2>/dev/null | wc -l)
echo "📁 Found $TOTAL_SCENARIOS scenario files"

# Find where we left off
LAST_GENERATED=0
for i in $(seq -w 000 999); do
    if check_scenario_generated "$i"; then
        LAST_GENERATED=$i
    else
        break
    fi
done

echo "✅ Already generated: scenarios 000-$LAST_GENERATED"
echo ""

# Continue from where we left off
START_SCENARIO=$((10#$LAST_GENERATED + 1))

echo "🚀 Starting from scenario $(printf '%03d' $START_SCENARIO)"
echo ""

# Run with memory limit and logging
echo "⏳ Running voice generation with ${NODE_MEMORY_LIMIT}MB memory limit..."
echo ""

# Create a temporary script that generates a specific range
cat > temp-voice-gen.js << 'EOF'
// Temporary focused voice generation script
const originalScript = require('./tools/elevenlabs-voice-generator.js');

// This will run the main function from the original script
// The script will handle its own analytics and completion
EOF

# Run with memory constraints
env $TURBO_MODE node --max-old-space-size=$NODE_MEMORY_LIMIT \
     -r dotenv/config \
     tools/elevenlabs-voice-generator.js 2>&1 | tee -a "$LOG_FILE"

# Check if analytics were generated
if [ -f "data/audio-recording-voices-for-scenarios-from-elevenlabs/voice-analytics.json" ]; then
    echo ""
    echo "✅ Analytics file generated successfully!"
    echo ""
    
    # Show summary
    echo "📊 Generation Summary:"
    echo "====================="
    
    # Count generated scenarios
    GENERATED_COUNT=$(ls -d data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-* 2>/dev/null | grep -v scenario-999 | wc -l)
    echo "🎯 Total scenarios with audio: $GENERATED_COUNT"
    
    # Count MP3 files
    MP3_COUNT=$(find data/audio-recording-voices-for-scenarios-from-elevenlabs -name "*.mp3" | wc -l)
    echo "🎵 Total MP3 files created: $MP3_COUNT"
    
    # Show file sizes
    TOTAL_SIZE=$(du -sh data/audio-recording-voices-for-scenarios-from-elevenlabs | cut -f1)
    echo "💾 Total audio data size: $TOTAL_SIZE"
    
    echo ""
    echo "📈 View analytics at:"
    echo "   - voice-analytics-dashboard.html"
    echo "   - voice-analytics-advanced.html"
else
    echo ""
    echo "⚠️  Analytics file not generated. Check log for errors."
fi

echo ""
echo "📝 Full log saved to: $LOG_FILE"
echo ""

# Clean up
rm -f temp-voice-gen.js 2>/dev/null

# Show final memory state
echo "📊 Final System Memory:"
free -h