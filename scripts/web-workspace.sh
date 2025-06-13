#!/bin/bash

# 🌐 Phuzzy Web Publishing Workspace Setup
# Critical context for dashboards, game components, and web deployment

echo "🌐 Setting up Web Publishing Workspace..."
echo "========================================="

# Set working directory
cd "$(dirname "$0")/.." || exit 1

# Check Apache server status
echo "🔍 Web Server Status Check:"
echo "---------------------------"

# Test local domain
if curl -s -k https://p0qp0q.local/ > /dev/null 2>&1; then
    echo "✅ Apache server running: https://p0qp0q.local/"
    echo "✅ HTTPS configured and working"
    echo "✅ mDNS domain resolution active"
else
    echo "❌ Local server not responding: https://p0qp0q.local/"
    echo ""
    echo "🚨 CONFIGURATION NEEDED - GET USER TO RUN:"
    echo ""
    echo "   # From directory: /home/p0qp0q/Phuzzy/"
    echo "   cd /home/p0qp0q/Phuzzy/"
    echo "   sudo ./setup-local-domain.sh"
    echo ""
    echo "   OR if script missing, see docs/claude/WEB-PUBLISHING.md"
    echo "   for manual Apache configuration steps."
    echo ""
    echo "🔧 This will configure Apache to serve from /home/p0qp0q/Phuzzy/"
fi

# Check web root directory
if [ -d "/home/p0qp0q/Phuzzy" ] && [ -f "index.html" ]; then
    echo "✅ Web root: /home/p0qp0q/Phuzzy/"
    echo "✅ Main game file: index.html"
else
    echo "❌ Web root directory issue"
fi

# Check key web files
echo ""
echo "📄 Web Content Status:"
echo "----------------------"

web_files=(
    "index.html:Main game"
    "debug-console.html:Debug tools"
    "enhanced-review-dashboard.html:Review dashboard"
    "pack-promotion-manager.html:Pack manager"
    "audio-test-simple.html:Audio testing"
    "simple-scenario-counter.html:Scenario counter"
)

for file_info in "${web_files[@]}"; do
    file="${file_info%%:*}"
    desc="${file_info##*:}"
    if [ -f "$file" ]; then
        echo "✅ $file ($desc)"
    else
        echo "⚠️  Missing: $file ($desc)"
    fi
done

# Check asset directories
echo ""
echo "📁 Web Asset Status:"
echo "-------------------"

if [ -d "js" ]; then
    js_count=$(find js -name "*.js" | wc -l)
    echo "✅ JavaScript directory: js/ ($js_count files)"
else
    echo "❌ Missing: js/ directory"
fi

if [ -d "css" ]; then
    css_count=$(find css -name "*.css" | wc -l)
    echo "✅ CSS directory: css/ ($css_count files)"
else
    echo "❌ Missing: css/ directory"
fi

if [ -d "data" ]; then
    json_count=$(find data -name "*.json" | wc -l)
    echo "✅ Data directory: data/ ($json_count JSON files)"
else
    echo "❌ Missing: data/ directory"
fi

# Check for common web issues
echo ""
echo "🔧 Configuration Check:"
echo "-----------------------"

# Check for .htaccess (shouldn't exist in this setup)
if [ -f ".htaccess" ]; then
    echo "⚠️  .htaccess file found - may conflict with Apache config"
else
    echo "✅ No .htaccess conflicts"
fi

# Check file permissions
if [ -r "index.html" ]; then
    echo "✅ File permissions correct (readable)"
else
    echo "❌ File permission issues detected"
fi

echo ""
echo "🌐 Web Publishing Context:"
echo "=========================="
echo "📖 Documentation: docs/claude/WEB-PUBLISHING.md"
echo "🌍 Local Server: https://p0qp0q.local/"
echo "📁 Web Root: /home/p0qp0q/Phuzzy/"
echo "🔧 Setup Script: ./setup-local-domain.sh"
echo "📋 Apache Config: Pre-configured (DO NOT CHANGE)"
echo ""

echo "🚀 Key Web Publishing Principles:"
echo "================================="
echo "• Files are served DIRECTLY from /home/p0qp0q/Phuzzy/"
echo "• Changes are IMMEDIATELY live (no build step)"
echo "• ES5 JavaScript only (no bundling/transpiling)"
echo "• NEVER create new web servers"
echo "• Static HTML/CSS/JS files only"
echo ""

echo "🎯 Common Web Tasks:"
echo "==================="
echo "1. Create new dashboard pages"
echo "2. Test game components"
echo "3. Debug web issues"
echo "4. Mobile responsive testing"
echo "5. Cross-browser compatibility"
echo ""

echo "🔗 Quick URLs:"
echo "=============="
echo "Main game:        https://p0qp0q.local/"
echo "Debug console:    https://p0qp0q.local/debug-console.html"
echo "Review dashboard: https://p0qp0q.local/enhanced-review-dashboard.html"
echo "Pack manager:     https://p0qp0q.local/pack-promotion-manager.html"
echo "Audio test:       https://p0qp0q.local/audio-test-simple.html"
echo ""

echo "🧪 Testing Workflow:"
echo "==================="
echo "1. Edit files in /home/p0qp0q/Phuzzy/"
echo "2. Refresh browser at https://p0qp0q.local/"
echo "3. Check browser console for errors"
echo "4. Test functionality interactively"
echo "5. Validate with debug tools"
echo ""

echo "⚠️  CRITICAL WEB PUBLISHING RULES:"
echo "=================================="
echo "❌ NEVER: python -m http.server"
echo "❌ NEVER: npx http-server"
echo "❌ NEVER: node server.js"
echo "❌ NEVER: npm run build/webpack/bundling"
echo "✅ ALWAYS: Edit files directly and refresh browser"
echo "✅ ALWAYS: Use https://p0qp0q.local/ for testing"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Browser dev tools are essential"
echo "• Console logging for debugging"
echo "• Network tab for loading issues"
echo "• Responsive mode for mobile testing"
echo "• Performance profiling for memory"
echo ""

# Test server connectivity
echo "🧪 Testing Server Connectivity:"
echo "-------------------------------"
if command -v curl &> /dev/null; then
    echo "Testing main game page..."
    if curl -s -k -I https://p0qp0q.local/ | grep -q "200 OK"; then
        echo "✅ Main game loads successfully"
    else
        echo "⚠️  Main game may have issues"
    fi
    
    echo "Testing static assets..."
    if curl -s -k -I https://p0qp0q.local/js/core/game-engine.js | grep -q "200 OK"; then
        echo "✅ JavaScript assets accessible"
    else
        echo "⚠️  JavaScript asset loading issues"
    fi
else
    echo "⚠️  curl not available for testing"
fi

# Open browser and key files
if [ -n "$DISPLAY" ]; then
    # Open documentation
    if command -v code &> /dev/null; then
        echo ""
        echo "🔧 Opening web publishing files in VS Code..."
        code docs/claude/WEB-PUBLISHING.md \
             index.html \
             debug-console.html \
             enhanced-review-dashboard.html \
             css/main.css &
        echo "✅ Files opened in VS Code"
    elif command -v gedit &> /dev/null; then
        echo ""
        echo "🔧 Opening web publishing documentation..."
        gedit docs/claude/WEB-PUBLISHING.md &
        echo "✅ Documentation opened"
    fi
    
    # Open browser
    if command -v firefox &> /dev/null; then
        echo ""
        echo "🌐 Opening development server in Firefox..."
        firefox https://p0qp0q.local/ &
        echo "✅ Browser opened to main game"
    elif command -v google-chrome &> /dev/null; then
        echo ""
        echo "🌐 Opening development server in Chrome..."
        google-chrome https://p0qp0q.local/ &
        echo "✅ Browser opened to main game"
    fi
else
    echo ""
    echo "💻 Manual access:"
    echo "   docs/claude/WEB-PUBLISHING.md (READ THIS FIRST)"
    echo "   https://p0qp0q.local/ (test in browser)"
fi

echo ""
echo "🌐 Web publishing workspace ready! Build amazing web experiences! 🌐"
echo "====================================================================="