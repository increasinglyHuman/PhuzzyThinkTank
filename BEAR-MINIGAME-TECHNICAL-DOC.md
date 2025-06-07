# Bear Runner Mini-Game Technical Documentation

## Overview
The Bear Runner mini-game is a physics-based runner where Phuzzy the bear races along dynamically deformed timeline curves. Players tap the screen to push the bear forward, navigating massive peaks and valleys created by amplified data visualization.

## Core Components

### 1. Spline Generation & Deformation

#### Base Timeline Data
- Original data comes from sentiment analysis scores (0-100 range)
- Four dimensions: logic, emotion, balanced, agenda
- Data points represent sentiment intensity at different positions in the text

#### Deformation Algorithm
When the game starts, the timeline instantly transforms:

```javascript
// In timeline-chart.js drawLine() and drawCharacterOnCurve()
difficultyMultiplier = 6.0;  // Amplifies deviations from center (50)
waveAmplitude = 100;         // Adds sine wave interference

// For each point:
let yValue = point.scores[dimension];
const deviation = yValue - 50;
yValue = 50 + (deviation * difficultyMultiplier);  // 6x amplification
const wavePhase = point.position * Math.PI * 4;    // 2 full waves
yValue += Math.sin(wavePhase) * waveAmplitude;     // Add wave interference
```

#### Dynamic Scaling
To keep the deformed curve visible:
```javascript
// Calculate min/max across all deformed points
minValue = Math.min(...allDeformedValues);
maxValue = Math.max(...allDeformedValues);

// Scale to fit canvas
const range = maxValue - minValue;
scaleFactor = range > 0 ? range : 100;
baselineOffset = -minValue;  // Ensures lowest point sits at bottom

// Apply when rendering
const y = padding + height - ((yValue + baselineOffset) / scaleFactor * height);
```

### 2. Physics Simulation

#### Core Physics Loop (20 FPS)
Located in `timeline-chart.js` `startSparkles()`:

```javascript
// Sample curve ahead for slope calculation
const sampleDistance = 0.005;
const slope = (nextY - currentY) / sampleDistance;

// Different physics for different terrain
if (slope < 0) { // Downhill
    gravityEffect = -baseGravity * 0.5;  // Gravity helps
    const speedDrag = 1 - Math.min(momentum * 20, 0.7);  // Up to 70% drag
    slopeAcceleration = -slope * 0.002 * speedDrag;
    friction = 0.975;
} else if (slope > 0) { // Uphill
    const slopeSeverity = Math.min(slope / 10, 2);
    gravityEffect = baseGravity * (1 + slopeSeverity);  // Opposes motion
    slopeAcceleration = -slope * 0.005;
    const momentumDecay = 0.92 - (slope * 0.002);
    friction = Math.max(momentumDecay, 0.85);
} else { // Flat/Valley
    gravityEffect = 0;
    slopeAcceleration = 0;
    friction = 0.98;  // Less friction for responsiveness
}

// Update velocity
velocity += slopeAcceleration - gravityEffect;
velocity *= friction;
```

#### Curve Adhesion System
Prevents ball from flying off peaks:

```javascript
// Multi-step integration
const steps = 5;
const stepSize = velocity / steps;

for (let step = 0; step < steps; step++) {
    const testPos = oldPos + (stepSize * (step + 1));
    // Check Y difference at test position
    if (yDiff > maxYDiff) {
        // Cap position to prevent overshooting
        newPos = oldPos + (stepSize * step) + (stepSize * 0.5);
        break;
    }
}

// Curvature-based correction at render time
const curvature = (futureY - 2 * currentY + prevY) / 0.0001;
if (Math.abs(curvature) > 1000) {
    curveHugOffset = Math.sign(curvature) * Math.min(Math.abs(curvature) / 200, 10);
}
```

### 3. Push Mechanism

#### Click Detection
In `timeline-analysis.js`:

```javascript
// Calculate distance from click to bear
const distance = Math.sqrt(
    Math.pow(x - bearPos.x, 2) + 
    Math.pow(y - bearPos.y, 2)
);
const effectiveRange = 40;  // pixels

if (distance <= effectiveRange) {
    if (x > bearPos.x + 10) {
        // Clicked in front - backward push
        giveBearPush(true);
    } else {
        // Normal forward push
        giveBearPush(false);
    }
}
```

#### Push Force Application
```javascript
// Base push strengths
let forwardPush = 0.05;
let backwardPush = -0.03;

// Reduce effectiveness on steep uphills
if (currentSlope > 0 && !isBackward) {
    const uphillPenalty = Math.max(0.3, 1 - currentSlope / 15);
    forwardPush *= uphillPenalty;  // At slope 15, only 30% effective
}

// Apply to pending boost (processed in physics loop)
characterData.pendingBoost = isBackward ? backwardPush : forwardPush;
```

#### Visual Feedback
Three tap effect types:
- **Forward**: Green expanding rings
- **Backward**: Orange/red expanding rings  
- **Miss**: Red dots with connecting line

### 4. Bear Position Calculation

The bear's screen position requires matching the deformed curve exactly:

```javascript
// In getBearScreenPosition() - timeline-analysis.js
// 1. Apply same deformation as visual curve
difficultyMultiplier = 6.0;
waveAmplitude = 100;

// 2. Calculate min/max for scaling (same as render)
// 3. Interpolate position on deformed curve
const y1 = getModifiedScore(data[dataIndex]);
const y2 = getModifiedScore(data[nextIndex]);
const interpolatedY = y1 + (y2 - y1) * localProgress;

// 4. Convert to screen coordinates with scaling
const y = padding + height - ((interpolatedY + baselineOffset) / scaleFactor * height) - 15;
```

## Game Flow

1. **Initialization**: Player clicks bear paw icon → Shows instruction dialog
2. **Start**: Timeline instantly deforms to maximum difficulty
3. **Gameplay**: 30-second timer, tap to push bear forward
4. **Physics**: Momentum builds downhill, decays uphill
5. **Victory**: Reach 95% of timeline before time runs out
6. **Loss**: Timer expires

## Key Physics Values

- **Base Gravity**: 0.0003
- **Forward Push**: 0.05 (reduced on uphills)
- **Backward Push**: -0.03
- **Max Velocity**: 0.015
- **Min Velocity**: 0.0003
- **Downhill Friction**: 0.975
- **Uphill Friction**: 0.85-0.92 (slope dependent)
- **Valley Friction**: 0.98
- **Push Cooldown**: 500ms
- **Physics Update Rate**: 20 FPS (50ms)

## Future Gamification Possibilities

### Obstacles & Hazards
- **Data Spikes**: Sharp peaks that slow momentum
- **Info Valleys**: Deep dips that trap the bear
- **Bias Barriers**: Walls requiring multiple hits
- **Logic Loops**: Circular sections that confuse direction
- **Emotional Storms**: Wind effects pushing backward

### Power-ups & Collectibles
- **Truth Tokens**: Temporary speed boosts
- **Clarity Crystals**: Brief invincibility 
- **Balance Badges**: Score multipliers
- **Insight Orbs**: Reveal optimal path
- **Momentum Magnets**: Pull bear forward

### Enemies
- **Fallacy Foxes**: Chase and slow the bear
- **Agenda Ants**: Create sticky patches
- **Bias Bats**: Dive-bomb from above
- **Confusion Clouds**: Obscure the path

### Upgrades
- **Better Paws**: Increased push effectiveness
- **Momentum Master**: Less friction on uphills
- **Valley Vault**: Jump ability in deep areas
- **Peak Performance**: Better adhesion at extremes
- **Time Extender**: +5 seconds per upgrade

### Environmental Mechanics
- **Wind Zones**: Constant push/pull forces
- **Ice Patches**: Reduced friction areas
- **Sticky Sections**: Increased friction zones
- **Boost Pads**: Automatic velocity increases
- **Teleporters**: Skip sections of track

### Progression Systems
- **Star Ratings**: Based on completion time
- **Leaderboards**: Global/friend rankings
- **Daily Challenges**: Special deformed curves
- **Achievement Badges**: Special moves, perfect runs
- **Unlock System**: New dimensions, characters

### Multiplayer Concepts
- **Race Mode**: Split-screen competition
- **Relay Mode**: Tag team with friends
- **Sabotage Mode**: Place obstacles for opponents
- **Co-op Mode**: Shared timer, must both finish

## Technical Considerations

### Performance
- Canvas rendering at 600x300 (no pixel density scaling)
- Physics at 20 FPS, rendering on demand
- Efficient curve interpolation using Catmull-Rom splines

### Mobile Support
- Touch events supported alongside mouse
- Responsive tap detection
- Visual feedback scales with viewport

### Integration Points
- Uses existing timeline visualization data
- Shares dimension visibility toggles
- Integrates with scoring system
- Maintains game state in `bearGameState` object