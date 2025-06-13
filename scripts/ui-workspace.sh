#!/bin/bash

# 🎨 Phuzzy UI Development Workspace Setup
# Sets up environment and context for user interface development

echo "🎨 Setting up UI Development Workspace..."
echo "========================================="

# Set working directory
cd "$(dirname "$0")/.." || exit 1

# Check UI system status
echo "🔍 UI System Status Check:"
echo "--------------------------"

# Check core UI files
if [ -f "js/ui/quiz-interface.js" ]; then
    lines=$(wc -l < "js/ui/quiz-interface.js")
    echo "✅ Quiz interface: js/ui/quiz-interface.js ($lines lines)"
else
    echo "❌ Missing: js/ui/quiz-interface.js"
fi

if [ -f "js/core/game-engine.js" ]; then
    echo "✅ Game engine: js/core/game-engine.js"
else
    echo "❌ Missing: js/core/game-engine.js"
fi

if [ -f "index.html" ]; then
    echo "✅ Main HTML: index.html"
else
    echo "❌ Missing: index.html"
fi

# Check CSS files
echo ""
echo "🎨 Styling Status:"
echo "------------------"
if [ -f "css/main.css" ]; then
    echo "✅ Main styles: css/main.css"
else
    echo "⚠️  Missing: css/main.css"
fi

css_count=$(find css/ -name "*.css" 2>/dev/null | wc -l)
if [ $css_count -gt 0 ]; then
    echo "📊 Total CSS files: $css_count"
    find css/ -name "*.css" -exec basename {} \; | sed 's/^/   - /'
else
    echo "⚠️  No CSS files found"
fi

# Check input validation
if [ -f "js/utils/input-validator.js" ]; then
    echo "✅ Input validation: js/utils/input-validator.js"
else
    echo "⚠️  Missing: js/utils/input-validator.js"
fi

# Check bear assets
echo ""
echo "🐻 Bear Character Assets:"
echo "-------------------------"
bear_assets=$(find . -name "*bear*" -type f 2>/dev/null | grep -E '\.(png|svg|jpg|jpeg)$' | wc -l)
if [ $bear_assets -gt 0 ]; then
    echo "✅ Bear assets found: $bear_assets files"
    find . -name "*bear*" -type f 2>/dev/null | grep -E '\.(png|svg|jpg|jpeg)$' | head -5 | sed 's/^/   - /'
    [ $bear_assets -gt 5 ] && echo "   ... and $((bear_assets - 5)) more"
else
    echo "⚠️  No bear character assets found"
fi

# Check local server
echo ""
echo "🌐 Development Server Status:"
echo "-----------------------------"
if curl -s -k https://p0qp0q.local/ > /dev/null 2>&1; then
    echo "✅ Local server running: https://p0qp0q.local/"
else
    echo "⚠️  Local server not responding: https://p0qp0q.local/"
    echo "   Run: sudo ./setup-local-domain.sh"
fi

echo ""
echo "🎨 UI Development Context:"
echo "=========================="
echo "📖 Documentation: docs/claude/UI.md"
echo "🔧 Quiz Interface: js/ui/quiz-interface.js"
echo "🎮 Game Engine: js/core/game-engine.js"
echo "🎨 Main Styles: css/main.css"
echo "🏠 HTML Structure: index.html"
echo "📋 Reference: docs/reference/game-engine.md"
echo ""

echo "🚀 Quick Commands for UI Development:"
echo "====================================="
echo "# No build process - direct file editing"
echo "# Test changes immediately at https://p0qp0q.local/"
echo ""
echo "# Validation and testing"
echo "npm run check-scenarios      # Ensure data integrity"
echo "# Browser console: gameEngine.testAudio() for audio integration"
echo ""

echo "🎯 Common UI Development Tasks:"
echo "==============================="
echo "1. Update game interface layouts"
echo "2. Improve bear character animations"
echo "3. Enhance accessibility features"
echo "4. Optimize mobile responsiveness"
echo "5. Test error handling UI"
echo ""

echo "🎨 UI Architecture Overview:"
echo "============================"
echo "• Vanilla JavaScript (ES5 compatible)"
echo "• Direct DOM manipulation (no frameworks)"
echo "• Progressive enhancement design"
echo "• Educational game focus"
echo "• Logic Bear (🧠) & Emotion Bear (💖) integration"
echo ""

echo "📱 Design Guidelines:"
echo "===================="
echo "• Mobile-first responsive design"
echo "• Accessibility (ARIA labels, keyboard nav)"
echo "• Educational focus (minimal distractions)"
echo "• Clear visual hierarchy"
echo "• Graceful error handling"
echo ""

echo "🔧 Technical Constraints:"
echo "========================="
echo "• ES5 syntax only (browser compatibility)"
echo "• No build tools or bundling"
echo "• Direct browser loading"
echo "• Memory-efficient operations"
echo "• Error boundaries implemented"
echo ""

echo "🎮 Game Flow States:"
echo "===================="
echo "1. Splash Screen → Scenario Presentation"
echo "2. Answer Selection → Bear Analysis"
echo "3. Results Summary → Next Scenario"
echo "4. Game Complete → Final Scores"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Test on multiple devices/browsers"
echo "• Use browser dev tools for debugging"
echo "• Check console for JavaScript errors"
echo "• Validate HTML/CSS syntax"
echo "• Test with screen readers"
echo ""

echo "🧪 Testing Workflow:"
echo "===================="
echo "1. Edit files directly (no build step)"
echo "2. Refresh https://p0qp0q.local/ to test"
echo "3. Open browser dev tools for debugging"
echo "4. Check mobile view with responsive mode"
echo "5. Test audio integration with gameEngine.testAudio()"
echo ""

echo "🎨 Bear Character System:"
echo "========================="
echo "• Logic Bear (🧠): Analytical feedback"
echo "• Emotion Bear (💖): Emotional analysis"
echo "• Context-sensitive reactions"
echo "• Animation system for engagement"
echo ""

# Show browser testing links
echo "🔗 Testing URLs:"
echo "================"
echo "Main game: https://p0qp0q.local/"
echo "Debug console: https://p0qp0q.local/debug-console.html"
echo "Review dashboard: https://p0qp0q.local/enhanced-review-dashboard.html"
echo "Pack manager: https://p0qp0q.local/pack-promotion-manager.html"
echo ""

# Open key files if in a desktop environment
if [ -n "$DISPLAY" ] && command -v code &> /dev/null; then
    echo "🔧 Opening key UI files in VS Code..."
    code docs/claude/UI.md \
         js/ui/quiz-interface.js \
         js/core/game-engine.js \
         index.html \
         css/main.css &
    echo "✅ Files opened in VS Code"
elif [ -n "$DISPLAY" ] && command -v gedit &> /dev/null; then
    echo "🔧 Opening UI documentation..."
    gedit docs/claude/UI.md &
    echo "✅ Documentation opened"
else
    echo "💻 Manual file access:"
    echo "   docs/claude/UI.md (start here)"
    echo "   js/ui/quiz-interface.js"
    echo "   js/core/game-engine.js"
    echo "   index.html"
    echo "   css/main.css"
fi

# Open browser if possible
if [ -n "$DISPLAY" ] && command -v firefox &> /dev/null; then
    echo ""
    echo "🌐 Opening development server in Firefox..."
    firefox https://p0qp0q.local/ &
    echo "✅ Browser opened"
elif [ -n "$DISPLAY" ] && command -v google-chrome &> /dev/null; then
    echo ""
    echo "🌐 Opening development server in Chrome..."
    google-chrome https://p0qp0q.local/ &
    echo "✅ Browser opened"
fi

echo ""
echo "🎨 UI workspace ready! Time to create beautiful interfaces! 🎨"
echo "=============================================================="