// Profanity filter - blocks explicit words
// Comprehensive list of inappropriate words

const PROFANITY_LIST = [
  // Explicit words (common profanity)
  'fuck', 'fucking', 'fucked', 'fucker', 'fuckers',
  'shit', 'shitting', 'shitted', 'shitter',
  'damn', 'damned', 'dammit',
  'hell', 'hells',
  'ass', 'asses', 'asshole', 'assholes',
  'bitch', 'bitches', 'bitching',
  'bastard', 'bastards',
  'crap', 'crappy',
  'piss', 'pissing', 'pissed',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks',
  'pussy', 'pussies',
  'slut', 'sluts', 'slutty',
  'whore', 'whores',
  'nigger', 'niggers', 'nigga', 'niggas',
  'retard', 'retarded', 'retards',
  'gay', 'gays', // Context-dependent, but blocking for safety
  'lesbian', 'lesbians',
  'homo', 'homos',
  // Add more as needed
];

// Common variations and leet speak
const LEET_REPLACEMENTS = {
  'a': ['a', '4', '@'],
  'e': ['e', '3'],
  'i': ['i', '1', '!'],
  'o': ['o', '0'],
  's': ['s', '5', '$'],
  't': ['t', '7'],
};

// Check if text contains profanity
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  
  // Remove common punctuation and spaces for checking
  const normalizedText = lowerText.replace(/[^a-z0-9]/g, '');
  
  // Check each profanity word
  for (const word of PROFANITY_LIST) {
    // Direct match
    if (lowerText.includes(word)) {
      return true;
    }
    
    // Check with spaces/punctuation removed
    if (normalizedText.includes(word)) {
      return true;
    }
    
    // Check common variations (leet speak)
    const variations = generateVariations(word);
    for (const variation of variations) {
      if (lowerText.includes(variation) || normalizedText.includes(variation)) {
        return true;
      }
    }
  }
  
  return false;
}

function generateVariations(word) {
  const variations = [word];

  const replacements = {
    'a': ['a', '4', '@'],
    'e': ['e', '3'],
    'i': ['i', '1', '!'],
    'o': ['o', '0'],
    's': ['s', '5', '$'],
    't': ['t', '7'],
  };

  for (const [char, chars] of Object.entries(replacements)) {
    if (word.includes(char)) {
      for (const replacement of chars) {
        variations.push(
          word.replace(new RegExp(char, 'g'), replacement)
        );
      }
    }
  }

  return variations;
}

// Filter profanity from text (replace with asterisks)
export function filterProfanity(text) {
  if (!text || typeof text !== 'string') return text;
  
  let filtered = text;
  const lowerText = text.toLowerCase();
  
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  
  return filtered;
}

// Get profanity error message
export function getProfanityErrorMessage() {
  return 'Your post contains inappropriate language. Please revise your message.';
}
