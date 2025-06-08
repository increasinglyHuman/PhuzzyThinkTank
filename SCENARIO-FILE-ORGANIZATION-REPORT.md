# Scenario File Organization Report

## File Structure Analysis

### scenario-generated-000.json
- **Contains**: 10 scenarios (IDs 0-9 based on original design)
- **Pack ID**: "core-scenarios-001"
- **Pack Name**: "Core Media Literacy Scenarios"
- **Description**: Essential scenarios covering common manipulation tactics
- **Created**: 2024-01-01

### scenario-generated-001.json
- **Contains**: 7 scenarios (appears incomplete)
- **Pack ID**: "enhanced-scenarios-001"
- **Pack Name**: "Complex Manipulation Scenarios"
- **Description**: Sophisticated manipulation techniques with precise linguistic analysis
- **Created**: 2025-01-06

### scenario-generated-002.json
- **Contains**: 10 scenarios
- **Pack ID**: "advanced-manipulation-002"
- **Pack Name**: "Modern Digital Dilemmas"
- **Description**: Sophisticated scenarios featuring winking admissions, statistical whiplash
- **Created**: 2025-01-06

### scenarios-batch-001.json
- **Contains**: 28 scenarios
- **Structure**: Appears to be a collection of additional scenarios
- **Note**: Not in the same pack format as scenario-generated files

### Individual Scenario Files (scenario-9.json through scenario-33.json)
- **scenario-9-vaccine-natural.json**: ID "natural-parenting-vaccine-001"
- **scenario-10-climate-debate.json**: ID "climate-debate-strawman-001"
- **scenario-11-penguin-influencer.json**: ID "penguin-ice-hotel-luxury-001"
- **scenario-12-dog-park-drama.json**: ID "dog-park-breed-panic-001"
- **scenario-13-vegan-lion.json**: ID "vegan-lion-savanna-001"
- **scenario-14-zoo-freedom-debate.json**: ID "zoo-panda-freedom-debate-001"
- **scenario-15-cat-conspiracy.json**: ID "cat-domestication-conspiracy-001"
- **scenario-16-salmon-grindset.json**: ID "salmon-upstream-grindset-001"
- **scenario-17-bee-toxic-positivity.json**: ID "bee-hive-toxic-positivity-001"
- **scenario-18-octopus-multitasking.json**: ID "octopus-multitasking-burnout-001"
- **scenario-19-hamster-wheel.json**: ID "hamster-wheel-economy-001"
- **scenario-20-peacock-authenticity.json**: ID "peacock-fake-authenticity-001"
- **scenario-21-scifi-canon.json**: ID "scifi-canon-wars-001"
- **scenario-22-scifi-retcon.json**: ID "scifi-retcon-rage-001"
- **scenario-23-scifi-timeline.json**: ID "scifi-timeline-truthers-001"
- **scenario-24-scifi-cosplay.json**: ID "scifi-cosplay-accuracy-001"
- **scenario-25-kindergarten-justice.json**: ID "kindergarten-court-001"
- **scenario-26-birthday-inequality.json**: ID "birthday-party-economics-001"
- **scenario-27-snack-time-economics.json**: ID "snack-time-monopoly-001"
- **scenario-28-market-gossip.json**: ID "saturday-market-intel-001"
- **scenario-29-dirtbike-debate.json**: ID "dirtbike-negotiation-001"
- **scenario-30-office-plants.json**: Uses different format (scenarioId: "scenario-030")
- **scenario-31-gym-philosophy.json**: Similar different format
- **scenario-32-wine-mom-science.json**: Similar different format
- **scenario-33-ai-therapist.json**: Similar different format

## Key Findings

1. **scenario-generated-000.json** appears to be the original 10 core scenarios (0-9)

2. **scenario-generated-001.json** and **scenario-generated-002.json** contain newer AI-generated scenarios with more sophisticated manipulation patterns

3. **Individual scenario files (9-33)** exist separately and use different ID formats:
   - Scenarios 9-29: Use descriptive IDs like "natural-parenting-vaccine-001"
   - Scenarios 30-33: Use a different format with "scenarioId" field

4. **scenarios-batch-001.json** contains 28 scenarios in yet another format

## Backup Files to Move to Legacy
The following backup files in the backups/ directory should be moved to a legacy folder:
- scenarios-backup-1749112683692.json through scenarios-backup-1749147610259.json (17 files)
- scenarios-batch-001-backup-1749110115751.json

## Recommendations

1. The scenario files are NOT organized by ID ranges as initially expected
2. There are multiple format versions in use across different files
3. Individual scenario files 9-33 appear to be additions that haven't been integrated into the main scenario-generated files
4. The backup files should be organized into a legacy folder to reduce clutter