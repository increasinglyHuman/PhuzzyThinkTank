#!/bin/bash
# Optimized Batch Scenario Orchestrator for High-Performance Systems
# Automatically detects system capabilities and adjusts processing

echo "🚀 Optimized Batch Scenario Orchestrator"
echo "======================================="

# Get system configuration
SCRIPT_DIR="$(dirname "$0")"
CONFIG_OUTPUT=$(node "$SCRIPT_DIR/system-config.js" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "$CONFIG_OUTPUT"
    echo ""
    
    # Extract configuration values
    HEAP_SIZE=$(node -e "const config = require('./system-config.js'); console.log(config.memory.nodeHeapSize)")
    SCENARIOS_PER_BATCH=$(node -e "const config = require('./system-config.js'); console.log(config.batches.scenariosPerBatch)")
    DELAY_MS=$(node -e "const config = require('./system-config.js'); console.log(config.performance.delayBetweenBatches)")
else
    echo "⚠️  Could not load system configuration, using defaults"
    HEAP_SIZE=3072
    SCENARIOS_PER_BATCH=2
    DELAY_MS=2000
fi

NODE_MEMORY_LIMIT=$HEAP_SIZE
ADDER_SCRIPT="$SCRIPT_DIR/memory-safe-scenario-adder.js"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if adder script exists
if [ ! -f "$ADDER_SCRIPT" ]; then
    echo -e "${RED}❌ Error: memory-safe-scenario-adder.js not found${NC}"
    exit 1
fi

# Get all scenario JSON files
SCENARIO_FILES=($(ls scenario-*.json 2>/dev/null | sort))
TOTAL_FILES=${#SCENARIO_FILES[@]}

if [ $TOTAL_FILES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No scenario files found (looking for scenario-*.json)${NC}"
    exit 0
fi

echo -e "${GREEN}📁 Found $TOTAL_FILES scenario files to process${NC}"
echo -e "${BLUE}⚙️  Using ${SCENARIOS_PER_BATCH} scenarios per batch with ${NODE_MEMORY_LIMIT}MB heap${NC}"
echo ""

# Performance tracking
START_TIME=$(date +%s)

# Process in batches
BATCH_NUM=1
PROCESSED=0
TOTAL_SUCCESS=0
TOTAL_ERRORS=0

while [ $PROCESSED -lt $TOTAL_FILES ]; do
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🔄 Batch $BATCH_NUM (Progress: $PROCESSED/$TOTAL_FILES)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Calculate batch range
    START=$PROCESSED
    END=$((START + SCENARIOS_PER_BATCH))
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    # Get files for this batch
    BATCH_FILES=()
    for ((i=$START; i<$END; i++)); do
        BATCH_FILES+=("${SCENARIO_FILES[$i]}")
    done
    
    echo "📝 Processing files:"
    for file in "${BATCH_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    
    # Run the adder with memory limit and batch files
    BATCH_START=$(date +%s)
    node --max-old-space-size=$NODE_MEMORY_LIMIT "$ADDER_SCRIPT" "${BATCH_FILES[@]}"
    EXIT_CODE=$?
    BATCH_END=$(date +%s)
    BATCH_DURATION=$((BATCH_END - BATCH_START))
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Batch $BATCH_NUM completed successfully (${BATCH_DURATION}s)${NC}"
        TOTAL_SUCCESS=$((TOTAL_SUCCESS + ${#BATCH_FILES[@]}))
    else
        echo -e "${RED}❌ Batch $BATCH_NUM failed with exit code $EXIT_CODE${NC}"
        TOTAL_ERRORS=$((TOTAL_ERRORS + ${#BATCH_FILES[@]}))
    fi
    
    # Update processed count
    PROCESSED=$END
    BATCH_NUM=$((BATCH_NUM + 1))
    
    # Minimal delay between batches (can be reduced on powerful systems)
    if [ $PROCESSED -lt $TOTAL_FILES ]; then
        if [ $DELAY_MS -gt 0 ]; then
            echo -e "${YELLOW}⏳ Waiting ${DELAY_MS}ms before next batch...${NC}"
            sleep $(echo "scale=3; $DELAY_MS/1000" | bc)
        fi
        echo ""
    fi
done

# Performance summary
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
AVG_TIME_PER_SCENARIO=$(echo "scale=2; $TOTAL_DURATION / $TOTAL_FILES" | bc)

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Processing Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "📊 Summary:"
echo -e "   Total files: $TOTAL_FILES"
echo -e "   Successful: ${GREEN}$TOTAL_SUCCESS${NC}"
echo -e "   Errors: ${RED}$TOTAL_ERRORS${NC}"
echo -e "   Total time: ${TOTAL_DURATION}s"
echo -e "   Average per scenario: ${AVG_TIME_PER_SCENARIO}s"
echo -e "   Batches processed: $((BATCH_NUM - 1))"

# Performance tips for the user
if [ $SCENARIOS_PER_BATCH -lt 10 ] && [ $TOTAL_FILES -gt 10 ]; then
    echo ""
    echo -e "${YELLOW}💡 Performance tip: Your system can handle larger batches!${NC}"
    echo -e "${YELLOW}   Edit system-config.js to increase scenariosPerBatch${NC}"
fi