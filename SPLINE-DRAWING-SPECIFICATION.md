# Beautiful Spline Drawing Specification for Timeline Charts

## Requirements

Create smooth, mathematically accurate spline curves that connect data points in a timeline chart with the following specifications:

### Input Data Structure
- Array of data points with x,y coordinates where:
  - x = position along timeline (0 to text.length)
  - y = intensity score (0 to 100, unscaled)
- Multiple dimensions (logic, emotion, balanced, agenda) each with their own data points
- Each point represents keyword density/intensity at that text position

### Visual Requirements
1. **Smooth Curves**: Use cubic Bezier splines or Catmull-Rom splines for natural-looking curves
2. **Curve Continuity**: C1 continuous (smooth first derivative) at all data points
3. **Natural Flow**: Curves should follow natural acceleration/deceleration patterns
4. **Peak Preservation**: Important peaks and valleys must be preserved, not smoothed away
5. **Boundary Conditions**: Natural curve endings (not forced to be horizontal)

### Technical Specifications

#### Canvas Context Methods to Use
- `moveTo(x, y)` - Start path at first point
- `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)` - Draw cubic Bezier curve segments
- `quadraticCurveTo(cpx, cpy, x, y)` - Alternative for simpler curves
- `stroke()` - Render the final path

#### Spline Algorithm Options
1. **Cubic Bezier Splines**: Most flexible, allows fine control over curve shape
2. **Catmull-Rom Splines**: Pass through all data points naturally
3. **Cardinal Splines**: Similar to Catmull-Rom but with tension parameter

#### Mathematical Implementation
For each segment between points P[i] and P[i+1]:
- Calculate control points based on neighboring points P[i-1] and P[i+2]
- Use tangent vectors to ensure smooth transitions
- Apply tension parameter (0.0 = straight lines, 1.0 = maximum curvature)

#### Canvas Drawing Implementation
```javascript
// Pseudo-code structure
function drawSpline(points, canvas2DContext) {
    // 1. Calculate control points for each segment
    // 2. Start path at first point
    // 3. Draw cubic Bezier curves connecting all points
    // 4. Ensure curves pass through or very close to actual data points
    // 5. Handle edge cases (single point, two points)
}
```

#### Performance Considerations
- Pre-calculate control points to avoid repeated computation
- Use efficient Canvas2D drawing methods
- Consider point reduction for very dense data sets (>200 points)
- Cache calculations when data doesn't change

#### Visual Styling
- Line width: 2-3 pixels for main curves
- Anti-aliasing: Enabled for smooth appearance
- Colors: Match existing dimension colors (logic: blue, emotion: pink, etc.)
- Alpha blending: Support for fade effects when multiple dimensions shown

#### Error Handling
- Handle degenerate cases: 0 points, 1 point, 2 points
- Graceful degradation when spline calculation fails
- Fallback to simple line segments if needed

#### Integration Points
- Replace existing `drawLine` method in timeline-chart.js
- Maintain compatibility with existing data structure
- Support existing animation and game features
- Preserve dimension visibility toggles

### Expected Output
A JavaScript function that takes an array of {x, y} points and renders a beautiful, smooth spline curve through them using HTML5 Canvas 2D context, suitable for timeline visualization where users need to see both the overall trend and specific intensity peaks.