# Phuzzy's Mad Dash Physics Solutions

Three different approaches to fix the peak and valley physics issues in the mini-game.

## Problem Analysis

The original physics had fundamental issues:
1. **Inverted Y-axis**: Canvas Y increases downward, causing gravity to work backwards
2. **Automatic uphill assistance**: Ball had built-in push that fought against gravity
3. **Minimum speed constraints**: Prevented natural backward rolling
4. **No directional movement**: Ball couldn't roll backward down hills

## Core Physics Fix (All Solutions)

### Corrected Coordinate System
```javascript
// Canvas Y increases downward, so we invert slope calculation
const visualSlope = -(nextY - currentY);  // Positive = uphill, negative = downhill
```

### Natural Gravity
- **Uphill**: Gravity opposes motion (`velocity -= gravity * visualSlope * 0.1`)
- **Downhill**: Gravity assists motion (same formula, negative slope)
- **No automatic pushes**: Only user input can overcome gravity
- **Backward rolling**: Ball naturally rolls backward if lacking momentum

### Key Changes
- Removed all automatic uphill assistance
- Removed minimum speed constraints
- Allow negative velocity for backward movement
- Friction always opposes motion direction

## Solution 1: Momentum Conservation
**File**: `solution-1-momentum-conservation.html`

### Approach
- Detects peak/valley transitions by comparing current and previous slopes
- Preserves 85% of momentum when transitioning through valleys
- Adds a small boost when cresting peaks to prevent stalling

### Key Changes
```javascript
// Apply gravity naturally
velocity -= gravity * visualSlope * 0.1;

// Preserve momentum at transitions
if (isValley) {
    velocity *= momentumConservation; // 0.85
} else if (isPeak && velocity > 0) {
    velocity *= momentumConservation;
}
```

### Expected Behavior
- Natural gravity-based motion
- Momentum preservation through transitions
- Ball rolls backward if it can't make it uphill
- Smooth valley transitions with forward momentum

## Solution 2: Adaptive Gravity
**File**: `solution-2-adaptive-gravity.html`

### Approach
- Calculates curve sharpness to detect transition points
- Reduces gravity effect at sharp curves (peaks/valleys)
- Provides adaptive assistance based on curve geometry

### Key Changes
```javascript
const curveSharpness = Math.abs(visualSlope - lastSlope) / 100;
const adaptiveGravityMultiplier = Math.max(0.3, 1 - curveSharpness * 0.7);
const gravity = baseGravity * adaptiveGravityMultiplier;

// Apply adaptive gravity
velocity -= gravity * visualSlope * 0.1;

// Help maintain momentum through sharp transitions
if (curveSharpness > 0.15 && Math.abs(velocity) > 0.001) {
    velocity += Math.sign(velocity) * pushForce * curveSharpness * 0.5;
}
```

### Expected Behavior
- Reduced gravity effect at sharp curves
- Better flow through sudden transitions
- Natural backward rolling with adaptive assistance
- Smoother overall motion

## Solution 3: Rail Physics
**File**: `solution-3-rail-physics.html`

### Approach
- Treats the timeline like a roller coaster rail
- Ball "sticks" to the curve with rail adhesion
- Ensures minimum speed to prevent getting stuck

### Key Changes
```javascript
// Convert visual slope to angle for proper physics
const slopeAngle = Math.atan2(-visualSlope, 100);
const gravityComponent = gravity * Math.sin(slopeAngle);

// Apply gravity along the rail
velocity += gravityComponent * 3; // Stronger effect

// Rail adhesion at sharp curves
if (Math.abs(visualSlope - lastSlope) > 30) {
    velocity *= railAdhesion;
}
```

### Expected Behavior
- Most physically accurate motion
- Strong gravity effect along the rail
- Natural backward rolling on steep hills
- Adhesion prevents flying off at sharp transitions
- No artificial speed limits or assists

## Testing Instructions

1. Open `test-physics-fixed.html` for corrected physics testing
2. Use buttons to switch between physics models
3. Key behaviors to test:
   - **No push = backward roll**: Ball should roll backward on hills without user input
   - **Gravity works correctly**: Ball accelerates downhill, decelerates uphill
   - **Natural motion**: No automatic assistance or minimum speeds
   - **User control**: Push Forward/Backward buttons provide the only propulsion

## Visual Indicators
- **Green ball**: Moving forward
- **Red ball**: Moving backward
- **Orange ball**: Nearly stopped
- **Arrow**: Shows velocity direction and magnitude

## Recommendation

With corrected physics:
- **Solution 1**: Good for maintaining flow through curves
- **Solution 2**: Best for complex, sharp transitions
- **Solution 3**: Most realistic physics (recommended)

Solution 3 (Rail Physics) provides the most natural and predictable behavior, especially for a game where players expect physics to "just work" intuitively.