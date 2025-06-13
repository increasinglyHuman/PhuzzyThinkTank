#!/bin/bash

# 📚 Phuzzy Scenario Development Workspace Setup
# Sets up environment and context for scenario development

echo "📚 Setting up Scenario Development Workspace..."
echo "==============================================="

# Set working directory
cd "$(dirname "$0")/.." || exit 1

# Load environment variables for Anthropic API
if [ -f "env" ]; then
    echo "📝 Loading environment variables..."
    export $(grep -v '^#' env | grep -v '^$' | xargs)
    echo "✅ Environment loaded (Anthropic API key available)"
else
    echo "⚠️  Warning: env file not found - AI generation may not work"
fi

# Check scenario system status
echo ""
echo "🔍 Scenario System Status Check:"
echo "--------------------------------"

# Check core scenario files
if [ -f "js/core/scenario-manager.js" ]; then
    echo "✅ Scenario manager: js/core/scenario-manager.js"
else
    echo "❌ Missing: js/core/scenario-manager.js"
fi

if [ -f "js/core/scenario-packs-config.js" ]; then
    echo "✅ Pack configuration: js/core/scenario-packs-config.js"
else
    echo "❌ Missing: js/core/scenario-packs-config.js"
fi

# Check scenario pack files
echo ""
echo "📦 Scenario Pack Status:"
echo "------------------------"
pack_count=0
for pack in data/scenario-packs/scenario-generated-{000..007}.json; do
    if [ -f "$pack" ]; then
        pack_name=$(basename "$pack")
        scenario_count=$(jq '.scenarios | length' "$pack" 2>/dev/null || echo "?")
        echo "✅ $pack_name ($scenario_count scenarios)"
        ((pack_count++))
    fi
done

if [ $pack_count -eq 0 ]; then
    echo "⚠️  No scenario packs found in data/scenario-packs/"
else
    echo "📊 Total: $pack_count packs available"
fi

# Check promotion configuration
if [ -f "data/pack-promotions.json" ]; then
    echo "✅ Pack promotions: data/pack-promotions.json"
    promo_count=$(jq '.promotions | length' data/pack-promotions.json 2>/dev/null || echo "?")
    echo "   📋 $promo_count promotions configured"
else
    echo "⚠️  Missing: data/pack-promotions.json"
fi

# Check AI generation setup
echo ""
echo "🤖 AI Generation Setup:"
echo "-----------------------"
if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "✅ Anthropic API key is set"
    if [ -f "test-anthropic-connection.js" ]; then
        echo "🧪 Testing Anthropic API connection..."
        timeout 10 node test-anthropic-connection.js 2>/dev/null && echo "✅ API connection successful" || echo "⚠️  API test failed"
    fi
else
    echo "❌ Anthropic API key not set in environment"
fi

# Check generation specifications
if [ -f "data/ai-scenario-generation-spec-v3.md" ]; then
    echo "✅ Generation spec: data/ai-scenario-generation-spec-v3.md"
else
    echo "⚠️  Missing generation specification"
fi

echo ""
echo "📚 Scenario Development Context:"
echo "================================="
echo "📖 Documentation: docs/claude/SCENARIOS.md"
echo "🔧 Manager: js/core/scenario-manager.js"
echo "⚙️  Configuration: js/core/scenario-packs-config.js"
echo "📦 Pack Files: data/scenario-packs/"
echo "🎯 Promotions: data/pack-promotions.json"
echo "📋 Reference: docs/reference/scenario-manager.md"
echo ""

echo "🚀 Quick Commands for Scenario Development:"
echo "==========================================="
echo "npm run add-scenario         # Interactive scenario builder"
echo "npm run generate-scenario    # AI-generate new scenarios"
echo "npm run check-scenarios      # Validate all scenario data"
echo "./batch-scenario-orchestrator.sh  # Batch process scenarios"
echo ""

echo "🌐 Development Tools:"
echo "====================="
echo "Local server: https://p0qp0q.local/"
echo "Review dashboard: python serve-review-dashboard.py (port 8000)"
echo "Pack manager: https://p0qp0q.local/pack-promotion-manager.html"
echo ""

echo "🎯 Common Scenario Development Tasks:"
echo "===================================="
echo "1. Create new scenarios (AI or manual)"
echo "2. Update pack configurations"
echo "3. Set up pack promotions"
echo "4. Validate scenario data integrity"
echo "5. Test single-pack loading"
echo ""

echo "📊 Scenario Quality Guidelines:"
echo "==============================="
echo "• 10 scenarios per pack (consistent)"
echo "• Educational value focused"
echo "• Diverse logical fallacy coverage"
echo "• Age-appropriate content"
echo "• Clear learning objectives"
echo ""

echo "🏗️ Single-Pack Architecture:"
echo "============================"
echo "• One pack loads per game session"
echo "• Tag-based promotion filtering"
echo "• Memory-efficient loading"
echo "• Weighted random selection"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Use tags for promotion targeting: ['kid-friendly', 'technology', etc.]"
echo "• Pack weights determine selection probability"
echo "• Voice files follow pack-XXX-scenario-YYY structure"
echo "• Scenario IDs must be unique within packs"
echo ""

# Show current pack status
echo "📈 Current Pack Summary:"
echo "========================"
if command -v jq &> /dev/null; then
    total_scenarios=0
    for pack in data/scenario-packs/scenario-generated-{000..007}.json; do
        if [ -f "$pack" ]; then
            count=$(jq '.scenarios | length' "$pack" 2>/dev/null || echo 0)
            total_scenarios=$((total_scenarios + count))
        fi
    done
    echo "Total scenarios across all packs: $total_scenarios"
else
    echo "Install 'jq' for detailed pack analysis"
fi

# Open key files if in a desktop environment
if [ -n "$DISPLAY" ] && command -v code &> /dev/null; then
    echo ""
    echo "🔧 Opening key scenario files in VS Code..."
    code docs/claude/SCENARIOS.md \
         js/core/scenario-manager.js \
         js/core/scenario-packs-config.js \
         data/pack-promotions.json \
         data/scenario-packs/ &
    echo "✅ Files opened in VS Code"
elif [ -n "$DISPLAY" ] && command -v gedit &> /dev/null; then
    echo ""
    echo "🔧 Opening scenario documentation..."
    gedit docs/claude/SCENARIOS.md &
    echo "✅ Documentation opened"
else
    echo ""
    echo "💻 Manual file access:"
    echo "   docs/claude/SCENARIOS.md (start here)"
    echo "   js/core/scenario-manager.js"
    echo "   js/core/scenario-packs-config.js"
    echo "   data/pack-promotions.json"
fi

echo ""
echo "📚 Scenario workspace ready! Time to create engaging content! 📚"
echo "=================================================================="