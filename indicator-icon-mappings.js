// Missing indicator/trigger mappings to add to bear-analysis.js
// Generated from audit of all scenario files

// ===== MISSING LOGIC INDICATORS (38) =====
// Add these to the logicFactors object in convertFactorToDisplayText():

const missingLogicFactors = {
    // Data & Evidence Issues
    'admitted-correlation': '⚠️ Admits correlation issue',
    'anecdotal-evidence': '💬 Anecdotal evidence only',
    'anecdotal-proof': '👤 Single story as proof',
    'data-contradicts-conclusion': '❌ Data contradicts claim',
    'fake-statistics': '🎲 Fabricated statistics',
    'forgotten-source': '❓ Source forgotten/vague',
    'oversimplified-math': '➗ Math oversimplified',
    'oversimplified-science': '🧬 Science oversimplified',
    'selective-statistics': '📊 Cherry-picked stats',
    'unverified-claims': '❗ Claims unverified',
    'zero-evidence-crime': '🚫 Zero crime evidence',
    
    // Authority & Expertise
    'false-expertise': '🎭 False expertise claimed',
    'professional-experience': '💼 Professional experience',
    'teacher-testimony': '👩‍🏫 Teacher testimony',
    'vague-authority': '🌫️ Vague authority cited',
    
    // Methodology & Testing
    'methodology-transparent': '📋 Methods explained clearly',
    'systematic-testing': '🧪 Systematic testing done',
    'pattern-forcing': '🎯 Forcing false patterns',
    'surveillance-stats': '📹 Surveillance statistics',
    
    // Financial & Sales
    'cost-comparison': '💵 Cost comparison shown',
    'earnings-data': '💰 Earnings data cited',
    'hidden-course-sales': '🎓 Hidden course agenda',
    'corporate-data': '🏢 Corporate data used',
    
    // Critical Thinking
    'contradiction-admission': '🤔 Admits contradiction',
    'contradiction-posting': '↔️ Self-contradicting post',
    'correlation-not-causation': '🔗 Correlation ≠ causation',
    'honest-complexity': '🌐 Admits complexity',
    'ignored-alternatives': '🚪 Ignores other options',
    'questions-data': '❔ Questions the data',
    'seeks-context': '🔍 Seeks fuller context',
    
    // Manipulation Tactics
    'conspiracy-thinking': '🕳️ Conspiracy logic',
    'selective-timeframes': '📅 Cherry-picked timeframe',
    'veiled-threats': '⚡ Subtle threats made',
    'wink-emoji-manipulation': '😉 Winking admission',
    
    // Comparisons & Context
    'international-comparison': '🌍 International data',
    'multiple-sources': '📚 Multiple sources cited',
    'practical-limits': '🚧 Practical limits noted',
    'specific-hours': '⏰ Specific hours documented'
};

// ===== MISSING EMOTION TRIGGERS (36) =====
// Add these to the emotionFactors object:

const missingEmotionFactors = {
    // Parent/Child Emotions
    'bad-parent-shame': '😞 Bad parent shaming',
    'child-anxiety': '👶 Child anxiety trigger',
    'child-brain-damage': '🧠 Brain damage fear',
    'child-suffering': '😢 Child suffering fear',
    'mother-guilt': '👩 Mother guilt trigger',
    'parent-anxiety': '😰 Parent anxiety',
    'smart-parent-pride': '🎖️ Smart parent appeal',
    'zombie-children': '🧟 Zombie kids fear',
    
    // Social & Community
    'community-judgment': '👥 Community judgment fear',
    'community-threat': '🏘️ Community threat',
    'manager-judgment': '👔 Manager judgment fear',
    'parent-unity': '🤝 Parent solidarity',
    'peer-pressure': '👫 Peer pressure',
    'public-shaming': '📢 Public shame threat',
    'us-vs-banks': '🏦 Us versus banks',
    'us-vs-bigag': '🌾 Us versus Big Ag',
    
    // Fear & Anxiety
    'addiction-fear': '💊 Addiction fear',
    'career-threat': '💼 Career threat fear',
    'decision-paralysis': '🤷 Decision paralysis',
    'food-poison-fear': '🤢 Food poisoning fear',
    'poverty-fear': '💸 Poverty fear',
    'replacement-anxiety': '🤖 Replacement fear',
    'sick-building': '🏢 Sick building fear',
    
    // Status & Identity
    'access-guilt': '🔐 Access guilt',
    'health-superiority': '💪 Health superiority',
    'insider-knowledge': '🔑 Insider knowledge',
    'productivity-shame': '📉 Productivity shame',
    'professional-responsibility': '⚕️ Professional duty',
    'professor-authority': '🎓 Professor authority',
    'weakness-challenge': '💢 Weakness challenge',
    
    // Loss & Missing Out
    'business-survival': '💼 Business survival',
    'corporate-greed': '🏢 Corporate greed anger',
    'fomo': '⏳ Fear of missing out',
    'lost-learning': '📚 Lost learning fear',
    'missing-out': '🎯 Missing out fear',
    'patient-harm': '🏥 Patient harm concern'
};

// ===== USAGE INSTRUCTIONS =====
/*
To fix the missing icons:

1. Open js/ui/bear-analysis.js
2. Find the convertFactorToDisplayText function
3. Add the missing mappings to the existing objects:
   - Add missingLogicFactors entries to logicFactors
   - Add missingEmotionFactors entries to emotionFactors

Or create a more maintainable system by moving all mappings to a JSON file
that can be loaded dynamically.
*/