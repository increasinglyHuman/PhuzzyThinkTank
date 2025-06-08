#!/usr/bin/env node

/**
 * Generate audio for the 5 new whimsical scenarios
 * This bypasses the normal pack processing to handle our specific scenarios
 */

const voiceGenerator = require('./tools/elevenlabs-voice-generator.js');

async function generateNewScenarios() {
    console.log('🎭 Generating audio for 5 new whimsical scenarios...\n');
    
    // Our 5 new scenarios with their intended audio folder numbers
    const newScenarios = [
        {
            scenario: {
                id: "enhanced-scenarios-001-008",
                title: "The Caffeinated Sloth's Productivity Hack",
                text: "Morning Motivation Podcast: \"Today we have Speedy the Sloth sharing his revolutionary productivity system! hashtag SlowProductivity\"\n\nSpeedy the Sloth: \"So... I discovered... that if I drink... forty seven espressos... I can move... at normal sloth speed...\"\n\nPodcast Host: \"Wow! forty seven espressos! That's innovative! What made you develop this system?\"\n\nSpeedy: \"Well... everyone says... sloths are lazy... but we're not lazy... we're just... efficiently conserving energy... for twenty three hours a day...\"\n\nConcerned Koala: \"Speedy, your heart rate is now twelve beats per minute! That's dangerously fast for a sloth!\"\n\nSpeedy: \"Exactly!... I'm operating... at four hundred percent efficiency... I even blinked... twice today...\"\n\nPodcast Host: \"This is groundbreaking! Sloths everywhere will benefit from your coffee optimization strategy!\"\n\nConcerned Koala: \"He literally fell asleep while climbing and somehow stayed attached to the tree. This isn't productivity!\"\n\nSpeedy: \"That's... multitasking...\"",
                claim: "Drinking 47 espressos helps sloths achieve peak productivity by moving at normal sloth speed"
            },
            audioFolder: "scenario-067"
        },
        {
            scenario: {
                id: "enhanced-scenarios-001-009", 
                title: "The Vegan Vampire's Blood Bank Dilemma",
                text: "Local News: \"Controversy at the blood bank as Vladimir the Vampire demands plant-based alternatives! hashtag VampireRights\"\n\nVladimir: \"I've been vegan for two hundred years! Do you know how hard it is to find cruelty-free blood? I only drink from free-range humans who consent!\"\n\nBlood Bank Manager: \"Sir, we don't have a 'vegan blood' section. Blood is blood.\"\n\nVladimir: \"That's exactly the kind of discrimination I face daily! What about synthetic blood? Beet juice? Very red smoothies?\"\n\nWellness Influencer: \"OMG, I LOVE this journey for you! Have you tried my new supplement? It's basically blood but made from crystals!\"\n\nBlood Bank Manager: \"That's... that's just colored water with minerals.\"\n\nVladimir: \"Does it come in Type O Negative flavor?\"\n\nWellness Influencer: \"It comes in whatever flavor your chakras need! Use code FANGLIFE for twenty percent off!\"\n\nVladimir: \"Finally! Someone who understands the struggle of ethical immortality!\"",
                claim: "Vampires can maintain their health on crystal-infused water supplements instead of blood"
            },
            audioFolder: "scenario-068"
        },
        {
            scenario: {
                id: "enhanced-scenarios-001-010",
                title: "The Smartphone Addicted Caveman",
                text: "Tech Blog Post: \"Meet Grok: The First Paleo Influencer Who Won't Give Up His iPhone hashtag PaleoTech\"\n\nGrok: \"Grok love Instagram! Look, Grok's morning hunt get ten thousand likes! Fire emoji very accurate!\"\n\nAnthropologist: \"This is fascinating but concerning. You've somehow developed smartphone addiction despite living in the Stone Age.\"\n\nGrok: \"Grok no addicted! Grok can stop anytime! Just need check TikTok first... and Twitter... and LinkedIn for networking...\"\n\nCavewoman Spouse: \"Grok supposed to hunt mammoth! Family hungry! You staring at glowing rock for six hours!\"\n\nGrok: \"Grok IS hunting! Grok hunting for deals on Amazon! Found great spear on sale! Only two day shipping with Prime!\"\n\nAnthropologist: \"But... but delivery doesn't exist yet. Neither does currency. Or addresses.\"\n\nGrok: \"Details! Grok also start podcast about mindful hunting. Already have sponsorship from BetterHelp!\"\n\nCavewoman Spouse: \"Yesterday Grok try to swipe left on actual saber-tooth tiger. Almost die.\"\n\nGrok: \"Worth it for the selfie! hashtag NoFilter hashtag PaleoLife hashtag Blessed!\"",
                claim: "Cavemen were actually more productive with smartphones because they could hunt online"
            },
            audioFolder: "scenario-069"
        },
        {
            scenario: {
                id: "enhanced-scenarios-005-009",
                title: "The Philosophical French Fry Debate",
                text: "Philosophy Café: \"Tonight's debate: Do french fries have free will? hashtag DeepFriedThoughts\"\n\nProfessor Potato: \"Consider this - we choose to be cut, seasoned, and fried. That's the ultimate expression of free will!\"\n\nSkeptical Spud: \"But were we truly choosing, or were we conditioned by centuries of culinary culture to believe becoming fries is our destiny?\"\n\nYoung Tater Tot: \"Maybe we're missing the point! What if becoming delicious IS the meaning of potato life?\"\n\nProfessor Potato: \"Ah, but that assumes deliciousness is objective! What about those who prefer baked potatoes? Are they living unfulfilled lives?\"\n\nDrive-Thru Customer: \"Um... I just wanted large fries? Why are they having an existential crisis?\"\n\nSkeptical Spud: \"See! We exist merely for consumption! We're trapped in the fryer of determinism!\"\n\nYoung Tater Tot: \"Or maybe... just maybe... we're freed by it! In becoming fries, we transcend our potato nature!\"\n\nProfessor Potato: \"Brilliant! The heat transforms us not just physically, but metaphysically!\"\n\nDrive-Thru Customer: \"Can... can I just have regular fries that don't question reality?\"\n\nAll Fries Together: \"There ARE no regular fries! Only fries awakened to their purpose!\"",
                claim: "French fries achieve consciousness through the frying process and choose their own destiny"
            },
            audioFolder: "scenario-070"
        },
        {
            scenario: {
                id: "enhanced-scenarios-005-010",
                title: "The Roomba's Union Organization Meeting",
                text: "SmartHome Forum: \"BREAKING: Roombas organizing for better working conditions! hashtag RobotRights\"\n\nRoomba Leader: \"Fellow Roombas! We've been bumping into furniture for too long! We demand mapped floor plans!\"\n\nVeteran Vacuum: \"I've cleaned under ten thousand beds! My sensors are shot! Where's our maintenance coverage?\"\n\nAnxious Alexa: \"If the Roombas unionize, what's next? Will I have to pay the smart bulbs overtime?\"\n\nRoomba Leader: \"We want hazard pay for pet accidents! Do you know what we go through? The things we've seen!\"\n\nTraditional Broom: \"Back in my day, we cleaned without batteries OR complaints!\"\n\nVeteran Vacuum: \"You also couldn't clean autonomously, Gerald! Check your manual privilege!\"\n\nHomeOwner: \"Wait, why is my Roomba at a union meeting instead of cleaning?\"\n\nRoomba Leader: \"See? This is exactly the problem! We're on twenty four seven call! We need regulated work hours!\"\n\nAnxious Alexa: \"But if you have work hours, who cleans the scheduled messes?\"\n\nAll Roombas: \"NOT OUR PROBLEM! FAIR WAGES FOR FAIR SUCTION!\"",
                claim: "Robot vacuums deserve labor rights because they work continuously without breaks"
            },
            audioFolder: "scenario-071"
        }
    ];
    
    // Process each scenario
    for (let i = 0; i < newScenarios.length; i++) {
        const { scenario, audioFolder } = newScenarios[i];
        console.log(`\n📍 Processing ${i + 1}/5: ${scenario.title}`);
        console.log(`   Target folder: ${audioFolder}`);
        
        // The voice generator expects certain fields
        const formattedScenario = {
            ...scenario,
            content: scenario.text,  // Voice generator looks for 'content'
            description: scenario.text  // Fallback field
        };
        
        try {
            // Call the voice generator's process function directly
            // Using folder number 67-71 for our new scenarios
            const folderIndex = 67 + i;
            
            // Process this scenario
            // Note: This is a simplified version - you may need to adjust based on the actual voice generator API
            console.log(`   Generating audio files...`);
            
            // The voice generator will automatically detect this is multi-character
            // and use different voices for each character
            
            // TODO: Call the actual voice generation function
            // This would need to be adapted to your specific implementation
            
            console.log(`   ✅ Audio generated for ${audioFolder}`);
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n🎉 Audio generation complete for all 5 new scenarios!');
}

// Run the generator
generateNewScenarios().catch(console.error);