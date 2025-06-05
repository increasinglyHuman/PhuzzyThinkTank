# AI Context and Scenario Generation

This folder contains all AI-related context documents and tools for Phuzzy Think Tank.

## Contents

### Context Documents
- `CONTEXT-UPDATE-*.md` - Progressive context updates for AI assistants
- `SCENARIO-GENERATION-*.md` - Insights and ideas from scenario generation sessions
- `PACK-SYSTEM-IMPLEMENTATION-SUMMARY.md` - Summary of the scenario pack system
- `SCENARIO-V3-MIGRATION-PLAN.md` - Plan for migrating to version 3 scenarios

### Generation Tools
- `ai-scenario-generator.js` - Main AI-powered scenario generation tool
- `add-scenario-efficiently.js` - Memory-optimized scenario addition
- `add-scenario-incremental.js` - Incremental scenario updates
- `scenario-append-helper.js` - Helper for appending scenarios
- `scenario-generation-report.md` - Report on scenario generation progress

## Usage

These tools are designed to help expand the game from 30 scenarios to the target of 48+ scenarios while maintaining quality and educational value.

### To generate new scenarios:
```bash
node ai-context/ai-scenario-generator.js
```

### To add scenarios efficiently:
```bash
node ai-context/add-scenario-efficiently.js
```

## Note
These files are primarily for AI assistants and developers working on content expansion. The actual game scenarios are stored in `/data/scenario-generated-*.json`.