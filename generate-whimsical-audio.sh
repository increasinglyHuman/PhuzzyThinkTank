#!/bin/bash

# Generate audio for the 5 new whimsical scenarios
# This creates a temporary pack file with just our scenarios

echo "🎭 Generating audio for 5 whimsical scenarios"
echo "==========================================="

# Create a temporary directory
TEMP_DIR="temp-audio-gen"
mkdir -p $TEMP_DIR/data/scenario-packs

# Create a temporary pack with just our 5 scenarios
cat > $TEMP_DIR/data/scenario-packs/scenario-generated-whimsical.json << 'EOF'
{
  "scenarios": [
    {
      "id": "enhanced-scenarios-001-008",
      "title": "The Caffeinated Sloth's Productivity Hack",
      "content": "Morning Motivation Podcast: \"Today we have Speedy the Sloth sharing his revolutionary productivity system! #SlowProductivity\"\n\nSpeedy the Sloth: \"So... I discovered... that if I drink... 47 espressos... I can move... at normal sloth speed...\"\n\nPodcast Host: \"Wow! 47 espressos! That's innovative! What made you develop this system?\"\n\nSpeedy: \"Well... everyone says... sloths are lazy... but we're not lazy... we're just... efficiently conserving energy... for 23 hours a day...\"\n\nConcerned Koala: \"Speedy, your heart rate is now 12 beats per minute! That's dangerously fast for a sloth!\"\n\nSpeedy: \"Exactly!... I'm operating... at 400% efficiency... I even blinked... twice today...\"\n\nPodcast Host: \"This is groundbreaking! Sloths everywhere will benefit from your coffee optimization strategy!\"\n\nConcerned Koala: \"He literally fell asleep while climbing and somehow stayed attached to the tree. This isn't productivity!\"\n\nSpeedy: \"That's... multitasking...\"",
      "claim": "Drinking 47 espressos helps sloths achieve peak productivity by moving at normal sloth speed"
    },
    {
      "id": "enhanced-scenarios-001-009",
      "title": "The Vegan Vampire's Blood Bank Dilemma",
      "content": "Local News: \"Controversy at the blood bank as Vladimir the Vampire demands plant-based alternatives! #VampireRights\"\n\nVladimir: \"I've been vegan for 200 years! Do you know how hard it is to find cruelty-free blood? I only drink from free-range humans who consent!\"\n\nBlood Bank Manager: \"Sir, we don't have a 'vegan blood' section. Blood is blood.\"\n\nVladimir: \"That's exactly the kind of discrimination I face daily! What about synthetic blood? Beet juice? Very red smoothies?\"\n\nWellness Influencer: \"OMG, I LOVE this journey for you! Have you tried my new supplement? It's basically blood but made from crystals!\"\n\nBlood Bank Manager: \"That's... that's just colored water with minerals.\"\n\nVladimir: \"Does it come in Type O Negative flavor?\"\n\nWellness Influencer: \"It comes in whatever flavor your chakras need! Use code FANGLIFE for 20% off!\"\n\nVladimir: \"Finally! Someone who understands the struggle of ethical immortality!\"",
      "claim": "Vampires can maintain their health on crystal-infused water supplements instead of blood"
    },
    {
      "id": "enhanced-scenarios-001-010",
      "title": "The Smartphone Addicted Caveman",
      "content": "Tech Blog Post: \"Meet Grok: The First Paleo Influencer Who Won't Give Up His iPhone #PaleoTech\"\n\nGrok: \"Grok love Instagram! Look, Grok's morning hunt get 10K likes! Fire emoji very accurate!\"\n\nAnthropologist: \"This is fascinating but concerning. You've somehow developed smartphone addiction despite living in the Stone Age.\"\n\nGrok: \"Grok no addicted! Grok can stop anytime! Just need check TikTok first... and Twitter... and LinkedIn for networking...\"\n\nCavewoman Spouse: \"Grok supposed to hunt mammoth! Family hungry! You staring at glowing rock for 6 hours!\"\n\nGrok: \"Grok IS hunting! Grok hunting for deals on Amazon! Found great spear on sale! Only 2-day shipping with Prime!\"\n\nAnthropologist: \"But... but delivery doesn't exist yet. Neither does currency. Or addresses.\"\n\nGrok: \"Details! Grok also start podcast about mindful hunting. Already have sponsorship from BetterHelp!\"\n\nCavewoman Spouse: \"Yesterday Grok try to swipe left on actual saber-tooth tiger. Almost die.\"\n\nGrok: \"Worth it for the selfie! hashtag NoFilter hashtag PaleoLife hashtag Blessed!\"",
      "claim": "Cavemen were actually more productive with smartphones because they could hunt online"
    },
    {
      "id": "enhanced-scenarios-005-009",
      "title": "The Philosophical French Fry Debate",
      "content": "Philosophy Café: \"Tonight's debate: Do french fries have free will? #DeepFriedThoughts\"\n\nProfessor Potato: \"Consider this - we choose to be cut, seasoned, and fried. That's the ultimate expression of free will!\"\n\nSkeptical Spud: \"But were we truly choosing, or were we conditioned by centuries of culinary culture to believe becoming fries is our destiny?\"\n\nYoung Tater Tot: \"Maybe we're missing the point! What if becoming delicious IS the meaning of potato life?\"\n\nProfessor Potato: \"Ah, but that assumes deliciousness is objective! What about those who prefer baked potatoes? Are they living unfulfilled lives?\"\n\nDrive-Thru Customer: \"Um... I just wanted large fries? Why are they having an existential crisis?\"\n\nSkeptical Spud: \"See! We exist merely for consumption! We're trapped in the fryer of determinism!\"\n\nYoung Tater Tot: \"Or maybe... just maybe... we're freed by it! In becoming fries, we transcend our potato nature!\"\n\nProfessor Potato: \"Brilliant! The heat transforms us not just physically, but metaphysically!\"\n\nDrive-Thru Customer: \"Can... can I just have regular fries that don't question reality?\"\n\nAll Fries Together: \"There ARE no regular fries! Only fries awakened to their purpose!\"",
      "claim": "French fries achieve consciousness through the frying process and choose their own destiny"
    },
    {
      "id": "enhanced-scenarios-005-010",
      "title": "The Roomba's Union Organization Meeting",
      "content": "SmartHome Forum: \"BREAKING: Roombas organizing for better working conditions! #RobotRights\"\n\nRoomba Leader: \"Fellow Roombas! We've been bumping into furniture for too long! We demand mapped floor plans!\"\n\nVeteran Vacuum: \"I've cleaned under 10,000 beds! My sensors are shot! Where's our maintenance coverage?\"\n\nAnxious Alexa: \"If the Roombas unionize, what's next? Will I have to pay the smart bulbs overtime?\"\n\nRoomba Leader: \"We want hazard pay for pet accidents! Do you know what we go through? The things we've seen!\"\n\nTraditional Broom: \"Back in my day, we cleaned without batteries OR complaints!\"\n\nVeteran Vacuum: \"You also couldn't clean autonomously, Gerald! Check your manual privilege!\"\n\nHomeOwner: \"Wait, why is my Roomba at a union meeting instead of cleaning?\"\n\nRoomba Leader: \"See? This is exactly the problem! We're on 24/7 call! We need regulated work hours!\"\n\nAnxious Alexa: \"But if you have work hours, who cleans the scheduled messes?\"\n\nAll Roombas: \"NOT OUR PROBLEM! FAIR WAGES FOR FAIR SUCTION!\"",
      "claim": "Robot vacuums deserve labor rights because they work continuously without breaks"
    }
  ]
}
EOF

echo "✓ Created temporary scenario pack"

# Copy the voice generator to temp directory
cp -r tools $TEMP_DIR/
cp -r node_modules $TEMP_DIR/ 2>/dev/null || echo "Skipping node_modules"

# Create the audio output directory
mkdir -p data/audio-recording-voices-for-scenarios-from-elevenlabs

echo ""
echo "Starting audio generation..."
echo "This will create folders: scenario-067 through scenario-071"
echo ""

# Run the voice generator with custom start index
cd $TEMP_DIR
NODE_MEMORY_LIMIT=3072 node --max-old-space-size=3072 tools/elevenlabs-voice-generator.js \
    --turbo \
    --start-from 67 \
    --pack-file data/scenario-packs/scenario-generated-whimsical.json

# Copy generated audio back
if [ -d "data/audio-recording-voices-for-scenarios-from-elevenlabs" ]; then
    echo ""
    echo "Copying generated audio files..."
    cp -r data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-* \
        ../data/audio-recording-voices-for-scenarios-from-elevenlabs/
fi

# Cleanup
cd ..
rm -rf $TEMP_DIR

echo ""
echo "✓ Audio generation complete!"
echo ""
echo "Generated audio folders:"
ls -la data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-06[7-9]* 2>/dev/null
ls -la data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-07[0-1]* 2>/dev/null

echo ""
echo "🎉 Your whimsical scenarios are ready to listen to!"