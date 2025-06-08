# Phuzzy's Mad Dash - Physics Experiments

This folder contains isolated experiments to fix the physics issues in the Phuzzy's Mad Dash mini-game.

## 🔬 The Problem

The original physics had the ball accelerating uphill and decelerating downhill - the opposite of natural gravity! This was caused by:
1. Canvas Y-axis being inverted (Y increases downward)
2. Automatic uphill assistance fighting against gravity
3. Minimum speed constraints preventing backward rolling

## 🎮 Test Files

### `test-physics-fixed.html` (Recommended)
- **Corrected physics** with proper gravity
- Visual indicators (green/red/orange ball)
- Push Forward/Backward buttons
- Debug mode showing real-time physics values
- All 4 physics models to compare

### Individual Solutions
1. **`solution-1-momentum-conservation.html`** - Preserves momentum through transitions
2. **`solution-2-adaptive-gravity.html`** - Reduces gravity at sharp curves
3. **`solution-3-rail-physics.html`** - Roller coaster physics (recommended)

### Legacy Test File
- `test-physics.html` - Original test with backwards physics (for comparison)

## 🚀 Quick Start

1. Open `test-physics-fixed.html` in a browser
2. Click "Start Ball" 
3. Watch the ball naturally roll backward on hills
4. Use "Push Forward" to help it climb
5. Try each solution to see the differences

## 🎯 Key Behaviors to Test

✅ **Correct Physics**:
- Ball rolls backward on uphill slopes without push
- Ball accelerates when going downhill
- Only user pushes can overcome gravity
- Natural, intuitive motion

❌ **Old Physics** (fixed):
- Ball would accelerate uphill
- Ball would slow down going downhill
- Automatic assists prevented natural motion

## 📊 Recommendation

**Solution 3 (Rail Physics)** provides the most intuitive and fun gameplay experience.