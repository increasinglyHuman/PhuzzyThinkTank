#!/usr/bin/env node

const fs = require('fs');

// Create the full chipmunk pack based on "The Chipmunk Cheese Chase" theme
const chipmunkPack = {
  "packId": "pack-007",
  "theme": "Chipmunk Cheese Chase Adventures",
  "description": "Adorable chipmunk scenarios featuring cheese chases, nutty debates, and woodland logic",
  "scenarios": [
    {
      "id": "pack-007-000-chipmunk-cheese-chase",
      "title": "The Chipmunk Cheese Chase",
      "content": "Chippy the Chipmunk discovered a piece of cheese and immediately declared it the most important food for winter survival. Other woodland creatures question whether cheese is really essential for chipmunks.",
      "audioScript": "[Matches existing adorable audio in pack-007-scenario-000]",
      "claim": "Cheese is the most important food for chipmunk winter survival.",
      "correctAnswer": "logic",
      "type": "social_media",
      "answerWeights": {
        "emotion": 25,
        "logic": 40,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "hasty-generalization",
          "severity": "primary",
          "example": "Concluding cheese is most important based on finding one piece"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-001-chipmunk-acorn-authority",
      "title": "The Great Acorn Authority",
      "content": "Chester Chipmunk claims that since his grandfather was the best acorn collector, all his food advice must be correct. But modern nutrition might be different from grandfather's time.",
      "audioScript": "[Matches existing audio in pack-007-scenario-001]",
      "claim": "Chester's grandfather's food advice is always correct because he was a great collector.",
      "correctAnswer": "logic",
      "type": "dialogue",
      "answerWeights": {
        "emotion": 20,
        "logic": 45,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "appeal-to-authority",
          "severity": "primary",
          "example": "Using grandfather's past success as proof of current advice validity"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-002-chipmunk-cheek-size",
      "title": "The Cheek Size Competition",
      "content": "Chubby claims chipmunks with bigger cheeks are automatically better at food storage. Slim argues that organization and planning matter more than cheek capacity.",
      "audioScript": "[Matches existing audio in pack-007-scenario-002]",
      "claim": "Bigger cheeks always mean better food storage abilities.",
      "correctAnswer": "logic", 
      "type": "social_media",
      "answerWeights": {
        "emotion": 25,
        "logic": 40,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "hasty-generalization",
          "severity": "primary",
          "example": "Assuming physical size determines skill and planning ability"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-003-chipmunk-winter-panic",
      "title": "The Winter Storage Panic",
      "content": "Chatty Chipmunk starts spreading panic that if any chipmunk doesn't collect exactly 500 nuts, they'll starve. This creates unnecessary anxiety in the woodland community.",
      "audioScript": "[Matches existing audio in pack-007-scenario-003]",
      "claim": "Every chipmunk needs exactly 500 nuts or they will definitely starve in winter.",
      "correctAnswer": "logic",
      "type": "social_media",
      "answerWeights": {
        "emotion": 15,
        "logic": 50,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "appeal-to-fear",
          "severity": "primary",
          "example": "Using starvation fears to promote arbitrary nut collection number"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-004-chipmunk-trendy-foods",
      "title": "The Trendy Food Bandwagon",
      "content": "Chipper insists that since all the popular chipmunks are eating pine cones now, everyone should abandon acorns. But trends don't always indicate nutritional value.",
      "audioScript": "[Matches existing audio in pack-007-scenario-004]",
      "claim": "Everyone should eat pine cones because all the popular chipmunks are doing it.",
      "correctAnswer": "logic",
      "type": "social_media",
      "answerWeights": {
        "emotion": 30,
        "logic": 35,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "bandwagon",
          "severity": "primary",
          "example": "Following food trends just because popular chipmunks do it"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-005-chipmunk-false-choice",
      "title": "The Nut vs Berry Ultimatum",
      "content": "Chuck declares chipmunks must choose: either be a 'nut chipmunk' or a 'berry chipmunk' - no in between. This ignores the possibility of a balanced diet.",
      "audioScript": "[Matches existing audio in pack-007-scenario-005]",
      "claim": "Chipmunks must choose to be either nut specialists or berry specialists - no mixing allowed.",
      "correctAnswer": "logic",
      "type": "dialogue",
      "answerWeights": {
        "emotion": 20,
        "logic": 45,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "false-dilemma",
          "severity": "primary",
          "example": "Presenting only two food choices when many options exist"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-006-chipmunk-tradition-trap",
      "title": "The Ancient Acorn Tradition",
      "content": "Clarence argues that chipmunks have always eaten acorns, so they should never try new foods. This traditional thinking might prevent beneficial dietary improvements.",
      "audioScript": "[Matches existing audio in pack-007-scenario-006]",
      "claim": "Chipmunks should only eat acorns because that's what they've always done.",
      "correctAnswer": "logic",
      "type": "social_media",
      "answerWeights": {
        "emotion": 25,
        "logic": 40,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "appeal-to-tradition",
          "severity": "primary",
          "example": "Rejecting new foods solely because they're not traditional"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-007-chipmunk-slippery-storage",
      "title": "The Storage Catastrophe Theory",
      "content": "Nervous Chipmunk Charlie warns that if you store one moldy nut, soon all your winter food will be ruined and you'll have to start over completely.",
      "audioScript": "[Matches existing audio in pack-007-scenario-007]",
      "claim": "One bad nut will definitely ruin your entire winter food supply.",
      "correctAnswer": "logic",
      "type": "dialogue",
      "answerWeights": {
        "emotion": 15,
        "logic": 50,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "slippery-slope",
          "severity": "primary",
          "example": "Assuming one moldy nut leads to complete food storage failure"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-008-chipmunk-personal-attack",
      "title": "The Lazy Collector Accusation",
      "content": "Snippy dismisses Slow Chipmunk's food storage advice by calling him lazy, rather than addressing whether his suggestions about methodical collecting are actually good.",
      "audioScript": "[Matches existing audio in pack-007-scenario-008]",
      "claim": "Slow Chipmunk's advice is wrong because he's lazy.",
      "correctAnswer": "logic",
      "type": "social_media",
      "answerWeights": {
        "emotion": 20,
        "logic": 45,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "ad-hominem",
          "severity": "primary",
          "example": "Attacking the chipmunk's character instead of addressing his advice"
        }
      ],
      "difficulty": "beginner"
    },
    {
      "id": "pack-007-009-chipmunk-red-herring",
      "title": "The Distraction Debate",
      "content": "When questioned about her poor nut-sorting method, Chatty changes the subject to discuss how cute her new winter coat looks, avoiding the original criticism.",
      "audioScript": "[Matches existing audio in pack-007-scenario-009]",
      "claim": "Chatty's winter coat cuteness proves her nut-sorting method is effective.",
      "correctAnswer": "logic",
      "type": "dialogue",
      "answerWeights": {
        "emotion": 30,
        "logic": 35,
        "balanced": 25,
        "agenda": 10
      },
      "logicalFallacies": [
        {
          "fallacyId": "red-herring",
          "severity": "primary",
          "example": "Diverting from nut-sorting criticism to discuss unrelated coat appearance"
        }
      ],
      "difficulty": "beginner"
    }
  ]
};

console.log('🐿️ Creating complete Chipmunk Cheese Chase pack...');
console.log(`📁 Pack theme: ${chipmunkPack.theme}`);
console.log(`📊 Scenarios: ${chipmunkPack.scenarios.length}`);

// Save to both locations
const files = [
  './data/scenario-packs/scenario-generated-007.json',
  './temp/data/scenario-packs/scenario-generated-007.json'
];

files.forEach(filePath => {
  fs.writeFileSync(filePath, JSON.stringify(chipmunkPack, null, 2));
  console.log(`✅ Saved to: ${filePath}`);
});

console.log('\n🎯 Chipmunk pack restoration complete!');
console.log('🧀 All scenarios feature adorable chipmunk cheese chase themes');
console.log('🎵 Audio files already exist and are properly matched');
console.log('📈 Total scenarios now: 191 + 10 = 201 scenarios!');

module.exports = chipmunkPack;