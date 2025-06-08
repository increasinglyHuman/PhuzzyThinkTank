#!/bin/bash

echo "📁 Organizing Data Folder Structure"
echo "==================================="
echo ""

# Create organized subfolders
echo "Creating organized folder structure..."
mkdir -p data/scenario-packs
mkdir -p data/legacy
mkdir -p data/schemas
mkdir -p data/reference

# Move scenario pack files
echo ""
echo "📦 Moving scenario pack files..."
for file in data/scenario-generated-[0-9][0-9][0-9].json; do
    if [ -f "$file" ]; then
        echo "  Moving $(basename $file) to scenario-packs/"
        # cp "$file" data/scenario-packs/  # Using cp for safety, change to mv when ready
    fi
done

# Move backup and legacy files
echo ""
echo "🗄️  Moving legacy files..."
for file in data/scenario-generated-*backup*.json data/scenarios-backup-*.json data/scenario-generated-complete.json; do
    if [ -f "$file" ]; then
        echo "  Moving $(basename $file) to legacy/"
        # mv "$file" data/legacy/
    fi
done

# Move schema files
echo ""
echo "📋 Moving schema files..."
for file in data/scenario-schema*.json; do
    if [ -f "$file" ]; then
        echo "  Moving $(basename $file) to schemas/"
        # mv "$file" data/schemas/
    fi
done

# Move reference files
echo ""
echo "📚 Moving reference files..."
for file in data/indicator-trigger-icons.json data/logical-fallacies.json data/scenario-example-*.json; do
    if [ -f "$file" ]; then
        echo "  Moving $(basename $file) to reference/"
        # mv "$file" data/reference/
    fi
done

echo ""
echo "📊 Proposed new structure:"
echo "data/"
echo "├── scenario-packs/          # The 7 main pack files (000-006)"
echo "│   ├── scenario-generated-000.json"
echo "│   ├── scenario-generated-001.json"
echo "│   ├── scenario-generated-002.json"
echo "│   ├── scenario-generated-003.json"
echo "│   ├── scenario-generated-004.json"
echo "│   ├── scenario-generated-005.json"
echo "│   └── scenario-generated-006.json"
echo "├── audio-recording-voices-for-scenarios-from-elevenlabs/"
echo "├── legacy/                  # Old backups and duplicates"
echo "├── schemas/                 # JSON schemas"
echo "└── reference/               # Fallacies, icons, examples"
echo ""
echo "⚠️  This is a DRY RUN - uncomment the mv commands to actually move files"
echo ""
echo "To execute the reorganization:"
echo "1. Review the proposed moves above"
echo "2. Edit this script and change 'cp' to 'mv' to actually move files"
echo "3. Run again to reorganize"