#!/bin/bash
# Script to run the scenario adder with proper memory allocation

echo "🚀 Starting Scenario Adder with 6GB memory allocation"
echo "====================================================="

# Run Node.js with explicit memory settings
node --max-old-space-size=6144 --expose-gc add-scenario-efficiently.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Script completed successfully"
else
    echo "❌ Script failed with error code $?"
fi