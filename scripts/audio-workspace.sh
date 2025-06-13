#!/bin/bash

# 🎵 Phuzzy Audio Development Workspace Setup
# Sets up environment and context for audio system development

echo "🎵 Setting up Audio Development Workspace..."
echo "=============================================="

# Set working directory
cd "$(dirname "$0")/.." || exit 1

# Load environment variables for ElevenLabs API
if [ -f "env" ]; then
    echo "📝 Loading environment variables..."
    export $(grep -v '^#' env | grep -v '^$' | xargs)
    echo "✅ Environment loaded (ElevenLabs API key available)"
else
    echo "⚠️  Warning: env file not found - voice generation may not work"
fi

# Check audio system status
echo ""
echo "🔍 Audio System Status Check:"
echo "-----------------------------"

# Check if audio engine files exist
if [ -f "js/audio/phuzzy-audio-engine.js" ]; then
    echo "✅ Core audio engine: js/audio/phuzzy-audio-engine.js"
else
    echo "❌ Missing: js/audio/phuzzy-audio-engine.js"
fi

if [ -f "js/audio/phuzzy-audio-engine-integration.js" ]; then
    echo "✅ Audio integration: js/audio/phuzzy-audio-engine-integration.js"
else
    echo "❌ Missing: js/audio/phuzzy-audio-engine-integration.js"
fi

# Check voice files directory
if [ -d "data/audio-recording-voices-for-scenarios-from-elevenlabs" ]; then
    voice_count=$(find data/audio-recording-voices-for-scenarios-from-elevenlabs -name "*.mp3" | wc -l)
    echo "✅ Voice files directory exists ($voice_count MP3 files)"
else
    echo "⚠️  Voice files directory not found"
fi

# Check ElevenLabs API connectivity
echo ""
echo "🔗 Testing ElevenLabs API Connection:"
echo "------------------------------------"
if [ -n "$ELEVENLABS_API_KEY" ]; then
    echo "✅ ElevenLabs API key is set"
    if command -v npm &> /dev/null; then
        echo "🧪 Running API test..."
        npm run test-voice 2>/dev/null || echo "⚠️  API test failed - check connection"
    else
        echo "⚠️  npm not available for API testing"
    fi
else
    echo "❌ ElevenLabs API key not set in environment"
fi

echo ""
echo "📚 Audio Development Context:"
echo "=============================="
echo "📖 Documentation: docs/claude/AUDIO.md"
echo "🔧 Core Engine: js/audio/phuzzy-audio-engine.js"
echo "🔗 Integration: js/audio/phuzzy-audio-engine-integration.js"
echo "🎤 Voice Files: data/audio-recording-voices-for-scenarios-from-elevenlabs/"
echo "📋 Component Docs: docs/reference/audio-engine.md"
echo ""

echo "🚀 Quick Commands for Audio Development:"
echo "========================================"
echo "npm run test-voice              # Test ElevenLabs API connection"
echo "npm run generate-voices         # Generate voice files for scenarios"
echo "./voice-generation-safe.sh      # Safe batch voice generation"
echo "npm run check-scenarios         # Validate scenario data (affects audio mapping)"
echo ""

echo "🌐 Development Server:"
echo "======================"
echo "Local server: https://p0qp0q.local/"
echo "Audio test: Open browser console and run 'gameEngine.testAudio()'"
echo ""

echo "🎯 Common Audio Development Tasks:"
echo "=================================="
echo "1. Add voice files for new scenarios"
echo "2. Optimize audio preloading"
echo "3. Test audio error handling"
echo "4. Update audio mappings for new packs"
echo "5. Debug audio integration issues"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Single-pack loading: Audio maps only current pack (memory efficient)"
echo "• User-optimized settings: Don't change for dev convenience"
echo "• Error boundaries: Audio fails gracefully without breaking game"
echo "• Voice file structure: pack-XXX-scenario-YYY/[title|content|claim].mp3"
echo ""

# Open key files if in a desktop environment
if [ -n "$DISPLAY" ] && command -v code &> /dev/null; then
    echo "🔧 Opening key audio files in VS Code..."
    code docs/claude/AUDIO.md \
         js/audio/phuzzy-audio-engine.js \
         js/audio/phuzzy-audio-engine-integration.js \
         docs/reference/audio-engine.md &
    echo "✅ Files opened in VS Code"
elif [ -n "$DISPLAY" ] && command -v gedit &> /dev/null; then
    echo "🔧 Opening audio documentation..."
    gedit docs/claude/AUDIO.md &
    echo "✅ Documentation opened"
else
    echo "💻 Manual file access:"
    echo "   docs/claude/AUDIO.md (start here)"
    echo "   js/audio/phuzzy-audio-engine.js"
    echo "   js/audio/phuzzy-audio-engine-integration.js"
fi

echo ""
echo "🎵 Audio workspace ready! Happy coding! 🎵"
echo "============================================="