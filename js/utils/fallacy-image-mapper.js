/**
 * Maps fallacy types to their corresponding image files
 */

const FALLACY_IMAGE_MAP = {
    'ad-hominem': 'AdHominem.svg',
    'appeal-to-authority': 'AppealToAuthority.svg',
    'appeal-to-fear': 'appealToFear.svg',
    'appeal-to-nature': 'AppealToNature.svg',
    'appeal-to-tradition': 'AppealToTradition.svg',
    'bandwagon': 'Bandwagon.svg',
    'cherry-picking': 'CherryPicking.svg',
    'false-dilemma': 'falseDilemma.svg',
    'false-equivalence': 'FalseEquivalency.svg',
    'false-scarcity': 'falseScarcity.svg',
    'hasty-generalization': 'HastyGeneralization.svg',
    'post-hoc': 'proctor-hoc.svg',
    'red-herring': 'redHerring.svg',
    'slippery-slope': 'slipperySlope.svg',
    'straw-man': 'StrawMan.svg'
};

/**
 * Get the image path for a given fallacy type
 * @param {string} fallacyType - The kebab-case fallacy type
 * @param {string} format - The image format ('jpg' or 'svg')
 * @returns {string} The full path to the image file
 */
function getFallacyImagePath(fallacyType, format = 'jpg') {
    const imageName = FALLACY_IMAGE_MAP[fallacyType];
    if (!imageName) {
        console.warn(`No image mapping found for fallacy: ${fallacyType}`);
        return '/images/bearpaw.svg'; // Default fallback
    }
    
    // For now, all images are JPG, but this allows for future SVG support
    return `/images/${imageName}`;
}

/**
 * Check if a fallacy has a custom image
 * @param {string} fallacyType - The kebab-case fallacy type
 * @returns {boolean} True if custom image exists
 */
function hasFallacyImage(fallacyType) {
    return fallacyType in FALLACY_IMAGE_MAP;
}