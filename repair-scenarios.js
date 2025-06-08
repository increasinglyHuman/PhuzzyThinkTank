const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/legacy/scenario-generated-complete.json', 'utf8'));

// Add missing fields to scenario 1
if (!data.scenarios[0].dimensionAnalysis) {
  data.scenarios[0].dimensionAnalysis = {
    "logic": "Scientific cherry-picking exposed - cites Swiss study showing problems while dismissing WHO's comprehensive safety assessment as less credible.",
    "emotion": "Community health panic escalates - personal anecdotes ('headaches', 'anxiety') transform into collective fear of 'sick building' and fleeing families.",
    "balanced": "Token balance quickly abandoned - mentions both sides briefly ('Dr. Richards says safe') but overwhelms with fear narratives and urgency.",
    "agenda": "Fear monetization revealed - EMF shields at $89 and activism website emerge after establishing health crisis narrative."
  };
}

if (!data.scenarios[0].peakMoments) {
  data.scenarios[0].peakMoments = {
    "logic": ["study from Switzerland", "n=394, p<0.05", "World Health Organization says"],
    "emotion": ["making us sick", "anxiety started", "families suffer", "ACT NOW"],
    "balanced": ["Then again", "Correlation or causation?"],
    "agenda": ["selling EMF shields for $89", "Sign the petition", "StopSmartMetersNOW.org"]
  };
}

// Add missing fields to scenario 2
if (!data.scenarios[1].dimensionAnalysis) {
  data.scenarios[1].dimensionAnalysis = {
    "logic": "Data manipulation masterclass - real crash statistics (68%) used to hide institutional accumulation claim, unverified MIT predictions presented as fact.",
    "emotion": "Financial FOMO perfected - fear of poverty ('stay poor') combined with insider knowledge superiority and conspiracy against 'traditional finance'.",
    "balanced": "False balance through admission - acknowledges volatility and personal losses while immediately pivoting to 'zoom out' and inevitable wealth.",
    "agenda": "Educational disguise for course sales - extensive expertise claims and 'not selling anything' directly contradicted by $497 course pitch."
  };
}

if (!data.scenarios[1].peakMoments) {
  data.scenarios[1].peakMoments = {
    "logic": ["crashed 68%", "340% during same period", "MIT researchers predict $500k"],
    "emotion": ["HUGE", "stay poor", "TERRIFIED", "revolution"],
    "balanced": ["volatility is real", "lost $30k", "skeptics say"],
    "agenda": ["my course", "$497", "ProfCryptoWealth.edu", "Register"]
  };
}

// Write the repaired file
fs.writeFileSync('data/legacy/scenario-generated-complete.json', JSON.stringify(data, null, 2));
console.log('Repaired scenarios 1-2 with missing fields');

// Validate all fields are present
let allValid = true;
data.scenarios.forEach((s, i) => {
  if (!s.dimensionAnalysis || !s.logicalFallacies || !s.peakMoments) {
    console.log(`Scenario ${i+1} still missing required fields`);
    allValid = false;
  }
});

if (allValid) {
  console.log('✓ All scenarios now have required fields');
}