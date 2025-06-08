#!/bin/bash

# ElevenLabs Setup Script
echo "🎙️ Setting up ElevenLabs Voice Generation"
echo "========================================"
echo ""
echo "This script will help you securely set up your API key."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
    echo "# ElevenLabs API Configuration" >> .env
    echo "ELEVENLABS_API_KEY=" >> .env
    echo ""
    echo "✅ Created .env file"
    echo ""
fi

echo "Please add your API key to the .env file:"
echo "1. Open .env in your editor"
echo "2. Add your key after ELEVENLABS_API_KEY="
echo "3. Save the file"
echo ""
echo "Then run: npm run generate-voices"
echo ""
echo "For a test run: npm run test-voice"