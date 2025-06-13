#!/bin/bash

# 🚀 Phuzzy Development Workspace Selector
# Helps choose the right development context for your task

echo "🚀 Phuzzy's Think Tank Development Workspace"
echo "============================================="
echo ""
echo "Welcome! Choose your development focus:"
echo ""

# Color codes for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}🌐 1. Web Publishing & Deployment${NC} ⚠️ CRITICAL"
echo "   • Dashboards and web components"
echo "   • Apache server configuration"
echo "   • Browser testing and debugging"
echo "   • Cross-platform compatibility"
echo ""

echo -e "${BLUE}🎵 2. Audio Development${NC}"
echo "   • ElevenLabs voice generation"
echo "   • Audio engine optimization" 
echo "   • Voice file management"
echo "   • Audio integration testing"
echo ""

echo -e "${GREEN}📚 3. Scenario Development${NC}"
echo "   • Create new scenarios"
echo "   • AI-powered generation"
echo "   • Pack management"
echo "   • Content validation"
echo ""

echo -e "${PURPLE}🎨 4. UI Development${NC}"
echo "   • Game interface design"
echo "   • Bear character system"
echo "   • Mobile responsiveness"
echo "   • Accessibility improvements"
echo ""

echo -e "${YELLOW}🔧 5. General Development${NC}"
echo "   • Game engine work"
echo "   • Architecture improvements"
echo "   • Testing and debugging"
echo "   • Documentation updates"
echo ""

echo -e "${RED}❓ 6. Help / Project Overview${NC}"
echo "   • Project documentation"
echo "   • Quick reference guides"
echo "   • Development guidelines"
echo ""

echo "0. Exit"
echo ""

# Interactive selection
while true; do
    read -p "Select your workspace (1-6, 0 to exit): " choice
    case $choice in
        1)
            echo ""
            echo -e "${RED}🌐 Launching Web Publishing Workspace...${NC}"
            ./scripts/web-workspace.sh
            break
            ;;
        2)
            echo ""
            echo -e "${BLUE}🎵 Launching Audio Development Workspace...${NC}"
            ./scripts/audio-workspace.sh
            break
            ;;
        3)
            echo ""
            echo -e "${GREEN}📚 Launching Scenario Development Workspace...${NC}"
            ./scripts/scenario-workspace.sh
            break
            ;;
        4)
            echo ""
            echo -e "${PURPLE}🎨 Launching UI Development Workspace...${NC}"
            ./scripts/ui-workspace.sh
            break
            ;;
        5)
            echo ""
            echo -e "${YELLOW}🔧 General Development Context${NC}"
            echo "================================"
            echo ""
            echo "📖 Key Documentation:"
            echo "   • docs/claude/BASE.md - Essential project context"
            echo "   • CLAUDE.md - Main project instructions"
            echo "   • docs/README.md - Complete documentation guide"
            echo ""
            echo "🎯 Core Files:"
            echo "   • js/core/game-engine.js - Main game controller"
            echo "   • js/core/scenario-manager.js - Pack management"
            echo "   • js/utils/input-validator.js - Input validation"
            echo ""
            echo "🌐 Development Server: https://p0qp0q.local/"
            echo ""
            echo "💡 Common Commands:"
            echo "   npm start - Memory-safe scenario management"
            echo "   npm run check-scenarios - Validate data"
            echo "   ./backup-before-changes.sh - Create backup"
            echo ""
            
            # Open general docs if possible
            if [ -n "$DISPLAY" ] && command -v code &> /dev/null; then
                echo "🔧 Opening general documentation in VS Code..."
                code docs/claude/BASE.md CLAUDE.md docs/README.md &
                echo "✅ Documentation opened"
            fi
            break
            ;;
        6)
            echo ""
            echo -e "${RED}❓ Project Help & Overview${NC}"
            echo "=========================="
            echo ""
            echo "📚 Phuzzy's Think Tank - Educational Critical Thinking Game"
            echo ""
            echo "🎯 Project Overview:"
            echo "   • Single-pack loading system (10 scenarios per session)"
            echo "   • Logic Bear (🧠) & Emotion Bear (💖) dual perspectives"
            echo "   • ElevenLabs voice integration"
            echo "   • Memory-efficient browser-based game"
            echo ""
            echo "📖 Essential Reading:"
            echo "   1. CLAUDE.md - Start here for all Claude instances"
            echo "   2. docs/claude/BASE.md - Essential project context"
            echo "   3. docs/README.md - Complete documentation system"
            echo ""
            echo "🎮 How the Game Works:"
            echo "   • Players evaluate arguments for logical fallacies"
            echo "   • Each scenario has 2-4 multiple choice responses"
            echo "   • Bears provide educational feedback"
            echo "   • Scoring tracks critical thinking progress"
            echo ""
            echo "🏗️ Architecture:"
            echo "   • Vanilla JavaScript (ES5 compatible)"
            echo "   • No build tools - direct browser loading"
            echo "   • Apache server at https://p0qp0q.local/"
            echo "   • Single-pack memory management"
            echo ""
            echo "🔑 API Keys Required:"
            echo "   • ElevenLabs: Voice generation"
            echo "   • Anthropic: AI scenario generation"
            echo ""
            echo "💡 Development Philosophy:"
            echo "   • User-device optimized (not dev-optimized)"
            echo "   • Error boundaries throughout"
            echo "   • Educational value focused"
            echo "   • Memory efficient design"
            echo ""
            
            if [ -n "$DISPLAY" ] && command -v firefox &> /dev/null; then
                echo "🌐 Opening game in browser..."
                firefox https://p0qp0q.local/ &
            fi
            break
            ;;
        0)
            echo ""
            echo "👋 Happy coding! Remember to check docs/claude/BASE.md for context."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please select 1-6 or 0 to exit.${NC}"
            ;;
    esac
done

echo ""
echo "🚀 Workspace setup complete! Happy development! 🚀"