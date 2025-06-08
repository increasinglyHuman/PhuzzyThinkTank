# Duplicate Scenarios Report

## Summary

- **Total files analyzed**: 68 JSON files
- **Total scenarios found**: 816
- **Files with errors**: 1 (scenario-29-dirtbike-debate.json - JSON parsing error)

## Key Findings

### 1. Massive Duplication in Backup Files

The most significant duplication occurs across the backup files. Most scenarios appear **25-30 times** across different backup files, suggesting the same batch of scenarios was backed up multiple times.

### 2. "Neighborhood Watch" Scenario

The "Neighborhood Watch Alert" scenario was found in 4 files:
- `/data/scenario-generated-000.json` (index: appears in scenario list)
- `/data/scenarios-backup-1749108875.json`
- `/data/scenarios.json`
- `/data/scenarios_repaired.json`

### 3. Most Duplicated Scenarios (appearing 25+ times each):

1. **"The AI Teacher Takeover"** - 30 occurrences
2. **"The Minimalist Millionaire"** - 30 occurrences  
3. **"The Digital Parenting Paradox"** - 29 occurrences
4. **"The $200 Meditation Cushion"** - 29 occurrences
5. **"The Natural Immunity Debate"** - 29 occurrences
6. **"The Climate Control Conspiracy"** - 29 occurrences
7. **"The Knowledge Economy Hustle"** - 28 occurrences
8. **"The 4AM Club Breakdown"** - 28 occurrences
9. **"The Transformation Tuesday Truth"** - 28 occurrences
10. **"The Diamond Hands Delusion"** - 28 occurrences

### 4. Primary Sources of Duplication

The main files containing the duplicated scenarios are:

1. **scenarios-batch-001.json** - Contains the main batch
2. **scenarios-batch-001-backup.json** - Backup of the main batch
3. **data/scenario-generated-003.json** - Contains first 10 scenarios from batch
4. **data/scenario-generated-004.json** - Contains scenarios 11-20 from batch
5. **data/scenario-generated-005.json** - Contains scenarios 21-30 from batch
6. **26 backup files** in `/backups/` directory - All contain the same scenarios

### 5. Individual Scenario Files

Individual scenario files (scenario-9-vaccine-natural.json through scenario-33-ai-therapist.json) each contain a single scenario that also appears in the batch files.

### 6. Files with Most Scenarios

1. `data/scenarios.json` - Original main scenarios file
2. `scenarios-batch-001.json` - 33 scenarios
3. All backup files in `/backups/scenarios-backup-*.json` - Each contains ~33 scenarios
4. `data/scenario-generated-complete.json` - Likely contains all generated scenarios

## Recommendations

1. **Clean up backup files** - The 26+ backup files in the `/backups/` directory appear to be redundant copies
2. **Consolidate scenario files** - Consider having one master file instead of multiple copies
3. **Remove individual scenario JSON files** if they're already in batch files
4. **Use the distributed pack file** (`scenarios-batch-001-distributed-*.json`) as the primary source since it appears to be the most recent organized version

## File Paths with Duplicates

### Contains "The AI Teacher Takeover" (and most other common scenarios):
- `/backups/pack-distribution/scenarios-batch-001-distributed-1749149733104.json`
- `/backups/scenarios-backup-*.json` (26 files)
- `/backups/scenarios-batch-001-backup-1749110115751.json`
- `/data/scenario-generated-003.json`
- `/scenarios-batch-001-backup.json`
- `/scenarios-batch-001.json`

### Contains "Neighborhood Watch Alert":
- `/data/scenario-generated-000.json`
- `/data/scenarios-backup-1749108875.json`
- `/data/scenarios.json`
- `/data/scenarios_repaired.json`