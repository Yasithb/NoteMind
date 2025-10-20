/**
 * Fallback Summarizer Utility
 * 
 * This provides a simple client-side fallback when the OpenAI API is unavailable.
 * It extracts important sentences based on simple heuristics.
 * Note: This is not as good as AI summarization but works as a fallback.
 */

/**
 * Simple client-side text summarization when API is unavailable
 * @param {string} text - Text to summarize
 * @param {number} sentenceCount - Number of sentences to include (default: 3)
 * @returns {string} - Simple summary
 */
export const generateFallbackSummary = (text, sentenceCount = 3) => {
  if (!text || typeof text !== 'string') return '';
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length <= sentenceCount) {
    return text; // Return original if it's already short
  }
  
  // Simple scoring of sentences based on:
  // 1. Length (not too short, not too long)
  // 2. Position in text (first and last paragraphs often contain summary info)
  // 3. Presence of key phrases
  
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Score based on position (first and last paragraphs get boost)
    if (index < 3) score += 2;
    if (index > sentences.length - 4) score += 1;
    
    // Score based on length (prefer medium length sentences)
    const words = sentence.split(/\s+/).length;
    if (words > 5 && words < 25) score += 2;
    
    // Score based on key phrases that often indicate important content
    const keyPhrases = [
      'important', 'significant', 'key', 'main', 'primary', 
      'central', 'essential', 'critical', 'crucial', 'vital',
      'in summary', 'to summarize', 'in conclusion', 'therefore',
      'overall', 'ultimately', 'finally'
    ];
    
    const lowercaseSentence = sentence.toLowerCase();
    keyPhrases.forEach(phrase => {
      if (lowercaseSentence.includes(phrase)) score += 2;
    });
    
    return { 
      sentence: sentence.trim(), 
      score,
      index
    };
  });
  
  // Sort by score (highest first)
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Take top N sentences and sort them by original position
  const topSentences = scoredSentences
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index);
  
  // Join sentences back together
  return topSentences.map(item => item.sentence).join(' ');
};

/**
 * Determines summary length settings for the fallback summarizer
 * @param {string} lengthPreference - 'short', 'medium', or 'long'
 * @param {string} text - The text to be summarized
 * @returns {number} - Number of sentences to include
 */
export const getSentenceCountByLength = (lengthPreference, text) => {
  // Estimate total sentence count
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const totalSentences = sentences.length;
  
  switch (lengthPreference) {
    case 'short':
      return Math.max(1, Math.min(2, Math.ceil(totalSentences * 0.1)));
    case 'long':
      return Math.max(5, Math.ceil(totalSentences * 0.3));
    case 'medium':
    default:
      return Math.max(3, Math.ceil(totalSentences * 0.2));
  }
};

export default {
  generateFallbackSummary,
  getSentenceCountByLength
};