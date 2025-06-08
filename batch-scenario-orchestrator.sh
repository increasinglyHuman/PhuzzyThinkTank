#!/bin/bash
# Batch Scenario Orchestrator
# Automatically processes scenarios in memory-safe batches

echo "🎯 Batch Scenario Orchestrator"
echo "=============================="

# Configuration
SCENARIOS_PER_BATCH=2
NODE_MEMORY_LIMIT=3072  # MB (reduced for Raspberry Pi 8GB)
SCRIPT_DIR="$(dirname "$0")"
ADDER_SCRIPT="$SCRIPT_DIR/memory-safe-scenario-adder.js"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
echo ""

# Process in batches
BATCH_NUM=1
PROCESSED=0

while [ $PROCESSED -lt $TOTAL_FILES ]; do
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🔄 Batch $BATCH_NUM${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Calculate batch range
    START=$PROCESSED
    END=$((START + SCENARIOS_PER_BATCH))
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    # Get files for this batch
    BATCH_FILES=("${SCENARIO_FILES[@]:$START:$((END-START))}")
    
    echo "📋 Processing files:"
    for file in "${BATCH_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    
    # Run the adder script with memory limit
    echo "🚀 Starting Node.js with ${NODE_MEMORY_LIMIT}MB memory limit..."
    node --max-old-space-size=$NODE_MEMORY_LIMIT "$ADDER_SCRIPT" "${BATCH_FILES[@]}"
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}❌ Batch $BATCH_NUM failed with exit code $EXIT_CODE${NC}"
        echo -e "${YELLOW}💡 Tip: Check the scenario files for errors${NC}"
        exit $EXIT_CODE
    fi
    
    # Update counters
    PROCESSED=$END
    BATCH_NUM=$((BATCH_NUM + 1))
    
    # Brief pause between batches
    if [ $PROCESSED -lt $TOTAL_FILES ]; then
        echo ""
        echo -e "${YELLOW}⏸️  Pausing briefly before next batch...${NC}"
        sleep 2
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All scenarios processed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show final statistics
if [ -f "scenarios-batch-001.json" ]; then
    TOTAL_IN_BATCH=$(grep -c '"id":' scenarios-batch-001.json)
    echo ""
    echo "📊 Final Statistics:"
    echo "   - Scenarios processed: $TOTAL_FILES"
    echo "   - Batches run: $((BATCH_NUM - 1))"
    echo "   - Total scenarios in batch file: ~$TOTAL_IN_BATCH"
fi

echo ""
echo "🎉 Done!"