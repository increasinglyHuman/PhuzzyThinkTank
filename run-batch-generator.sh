#!/bin/bash
# Script to run the batch scenario generator with proper memory allocation

echo "🚀 Starting Batch Scenario Generator with 6GB memory allocation"
echo "=============================================================="

# Make the script executable
chmod +x generate-batch-scenarios.js

# Run Node.js with explicit memory settings
node --max-old-space-size=6144 --expose-gc generate-batch-scenarios.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Script completed successfully"
else
    echo "❌ Script failed with error code $?"
fi