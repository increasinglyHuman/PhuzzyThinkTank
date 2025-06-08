#!/bin/bash

# Phuzzy Production Orchestrator
# Complete pipeline for scenario generation and audio production
# Memory-safe implementation for Raspberry Pi

echo "╔═══════════════════════════════════════════════╗"
echo "║      Phuzzy Production Orchestrator V3        ║"
echo "║   Scenario Generation & Audio Production      ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Configuration
NODE_MEMORY_LIMIT=3072  # 3GB for Raspberry Pi
TURBO_MODE=true
PRODUCTION_DIR="$(dirname "$0")"
STATUS_FILE="$PRODUCTION_DIR/production-status.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to show memory usage
show_memory() {
    echo -e "${YELLOW}System Memory Status:${NC}"
    free -h | grep -E "^(Mem|Swap):"
    echo ""
}

# Function to update status
update_status() {
    local phase="$1"
    local message="$2"
    
    if [ -f "$STATUS_FILE" ]; then
        # Update the JSON status file
        node -e "
        const fs = require('fs');
        const status = JSON.parse(fs.readFileSync('$STATUS_FILE'));
        status.currentPhase = '$phase';
        status.lastUpdate = new Date().toISOString();
        status.teamUpdates.producer = '$message';
        fs.writeFileSync('$STATUS_FILE', JSON.stringify(status, null, 2));
        "
    fi
}

# Main menu
show_menu() {
    echo "Production Pipeline Options:"
    echo "1) Generate missing scenarios (5 scenarios for packs 001 & 005)"
    echo "2) Generate audio for new scenarios (turbo mode)"
    echo "3) Add metadata to audio folders"
    echo "4) Reorganize audio folders to match pack structure"
    echo "5) Full pipeline (1-4 in sequence)"
    echo "6) Check production status"
    echo "7) Audit scenarios for V3 compliance"
    echo "8) Migrate scenarios to V3 format"
    echo "9) Exit"
    echo ""
    read -p "Select option (1-9): " choice
}

# 1. Generate missing scenarios
generate_scenarios() {
    echo -e "${GREEN}Phase 1: Generating Missing Scenarios${NC}"
    update_status "writing" "Generating 5 missing scenarios"
    
    show_memory
    
    # Run the V3 scenario generator
    echo "Generating scenarios with audio-aware format..."
    node --max-old-space-size=$NODE_MEMORY_LIMIT \
         "$PRODUCTION_DIR/generate-missing-scenarios-v3.js"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Scenario generation complete!${NC}"
        update_status "writing" "Successfully generated missing scenarios"
    else
        echo -e "${RED}✗ Scenario generation failed!${NC}"
        update_status "error" "Failed to generate scenarios"
        return 1
    fi
}

# 2. Generate audio for scenarios
generate_audio() {
    echo -e "${GREEN}Phase 2: Generating Audio with ElevenLabs${NC}"
    update_status "recording" "Processing scenarios through audio pipeline"
    
    show_memory
    
    # Determine which scenarios need audio
    echo "Checking which scenarios need audio generation..."
    
    # For the 5 new scenarios, we need to map them correctly
    # Pack 001: scenarios 10-16 need 3 more (17-19 in new numbering)
    # Pack 005: scenarios 47-54 need 2 more (55-56 in new numbering)
    
    if [ "$TURBO_MODE" = true ]; then
        echo -e "${YELLOW}Using TURBO mode for 50% cost savings${NC}"
        TURBO_FLAG="--turbo"
    else
        TURBO_FLAG=""
    fi
    
    # Run voice generation for new scenarios
    echo "Generating audio files..."
    node --max-old-space-size=$NODE_MEMORY_LIMIT \
         "$PRODUCTION_DIR/tools/elevenlabs-voice-generator.js" \
         $TURBO_FLAG \
         --start-from 67
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Audio generation complete!${NC}"
        update_status "recording" "Audio files generated successfully"
    else
        echo -e "${RED}✗ Audio generation failed!${NC}"
        update_status "error" "Audio generation encountered errors"
        return 1
    fi
}

# 3. Add metadata to audio folders
add_metadata() {
    echo -e "${GREEN}Phase 3: Adding Metadata to Audio Folders${NC}"
    update_status "processing" "Adding tracking metadata to audio folders"
    
    show_memory
    
    node --max-old-space-size=$NODE_MEMORY_LIMIT \
         "$PRODUCTION_DIR/audio-folder-metadata-manager.js"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Metadata addition complete!${NC}"
        update_status "processing" "Metadata added to all audio folders"
    else
        echo -e "${RED}✗ Metadata addition failed!${NC}"
        return 1
    fi
}

# 4. Reorganize audio folders
reorganize_audio() {
    echo -e "${GREEN}Phase 4: Reorganizing Audio Folders${NC}"
    update_status "processing" "Reorganizing audio folders to match pack structure"
    
    # Check if reorganization script exists
    if [ -f "$PRODUCTION_DIR/reorganize-audio-folders.sh" ]; then
        echo "Executing audio folder reorganization..."
        bash "$PRODUCTION_DIR/reorganize-audio-folders.sh"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Reorganization complete!${NC}"
            update_status "completed" "Audio folders reorganized successfully"
        else
            echo -e "${RED}✗ Reorganization failed!${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Reorganization script not found. Run option 3 first.${NC}"
        return 1
    fi
}

# 5. Full pipeline
run_full_pipeline() {
    echo -e "${GREEN}Running Full Production Pipeline${NC}"
    echo "This will:"
    echo "- Generate missing scenarios"
    echo "- Create audio files"
    echo "- Add metadata"
    echo "- Reorganize folders"
    echo ""
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "Pipeline cancelled."
        return
    fi
    
    generate_scenarios && \
    generate_audio && \
    add_metadata && \
    reorganize_audio
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}═══════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Full pipeline completed successfully!${NC}"
        echo -e "${GREEN}═══════════════════════════════════════${NC}"
        update_status "completed" "Full production pipeline completed"
    else
        echo -e "${RED}Pipeline encountered errors. Check logs.${NC}"
    fi
}

# 6. Check status
check_status() {
    echo -e "${YELLOW}Production Status:${NC}"
    
    if [ -f "$STATUS_FILE" ]; then
        # Pretty print the status
        node -e "
        const status = JSON.parse(require('fs').readFileSync('$STATUS_FILE'));
        console.log('Current Phase:', status.currentPhase);
        console.log('Last Update:', status.lastUpdate);
        console.log('\nProgress:');
        console.log('- Scenarios Written:', status.progress.scenariosWritten);
        console.log('- Scenarios Recorded:', status.progress.scenariosRecorded);
        console.log('- Scenarios Needed:', status.progress.scenariosNeeded);
        console.log('\nTeam Updates:');
        Object.entries(status.teamUpdates).forEach(([role, msg]) => {
            console.log(\`- \${role}: \${msg}\`);
        });
        "
    else
        echo "No status file found."
    fi
    
    echo ""
    show_memory
}

# 7. Audit scenarios
audit_scenarios() {
    echo -e "${GREEN}Phase 7: Auditing Scenarios for V3 Compliance${NC}"
    update_status "auditing" "Checking all scenarios for profanity, dialogue, and audio issues"
    
    show_memory
    
    node --max-old-space-size=$NODE_MEMORY_LIMIT \
         "$PRODUCTION_DIR/scenario-v3-compliance-auditor.js"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Audit complete!${NC}"
        echo ""
        echo "Review these files for details:"
        echo "- scenario-audit-report.md (summary)"
        echo "- re-recording-priority-list.json (what needs re-recording)"
        update_status "auditing" "Audit complete - review reports for issues"
    else
        echo -e "${RED}✗ Audit failed!${NC}"
        return 1
    fi
}

# 8. Migrate scenarios
migrate_scenarios() {
    echo -e "${GREEN}Phase 8: Migrating Scenarios to V3 Format${NC}"
    
    echo "This will:"
    echo "- Remove any profanity"
    echo "- Fix dialogue formatting"
    echo "- Generate audio scripts"
    echo "- Add character voice hints"
    echo ""
    
    read -p "Run in dry-run mode first? (y/n): " dryrun
    
    if [ "$dryrun" = "y" ]; then
        echo "Running migration in DRY RUN mode..."
        node --max-old-space-size=$NODE_MEMORY_LIMIT \
             "$PRODUCTION_DIR/scenario-v3-migration-tool.js" --dry-run
    else
        echo -e "${YELLOW}Running LIVE migration - this will modify files!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            update_status "migrating" "Migrating all scenarios to V3 format"
            
            node --max-old-space-size=$NODE_MEMORY_LIMIT \
                 "$PRODUCTION_DIR/scenario-v3-migration-tool.js"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Migration complete!${NC}"
                update_status "migrating" "Successfully migrated scenarios to V3"
            else
                echo -e "${RED}✗ Migration failed!${NC}"
                return 1
            fi
        else
            echo "Migration cancelled."
        fi
    fi
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) generate_scenarios ;;
        2) generate_audio ;;
        3) add_metadata ;;
        4) reorganize_audio ;;
        5) run_full_pipeline ;;
        6) check_status ;;
        7) audit_scenarios ;;
        8) migrate_scenarios ;;
        9) 
            echo "Exiting production orchestrator."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please select 1-9.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done