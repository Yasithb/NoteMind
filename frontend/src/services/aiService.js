/**
 * AI Service for NoteMind
 * Handles communication with backend AI services
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';
// Alternative URLs in case localhost doesn't work
const ALTERNATIVE_API_BASE_URL = 'http://localhost:5000/api';

/**
 * Local summarization function as fallback
 * @param {string} content - The text to summarize
 * @param {string} lengthType - 'short', 'medium', or 'long'
 * @returns {string} - Simple extractive summary
 */
const generateLocalSummary = (content, lengthType = 'medium') => {
  // Simple extractive summarization
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= 3) return content;
  
  // Determine sentence count based on length preference
  let sentenceCount;
  switch (lengthType) {
    case 'short': sentenceCount = Math.max(1, Math.min(2, Math.ceil(sentences.length * 0.1))); break;
    case 'long': sentenceCount = Math.max(5, Math.ceil(sentences.length * 0.3)); break;
    case 'medium': 
    default: sentenceCount = Math.max(3, Math.ceil(sentences.length * 0.2)); break;
  }
  
  // Score sentences based on position and keywords
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Boost first and last sentences
    if (index < 2) score += 2;
    if (index > sentences.length - 3) score += 1;
    
    // Boost based on length (prefer medium length)
    const words = sentence.split(/\s+/).length;
    if (words > 5 && words < 25) score += 2;
    
    // Boost sentences with key phrases
    const keyPhrases = ['important', 'key', 'main', 'summary', 'conclusion', 'therefore', 'however'];
    const lowercaseSentence = sentence.toLowerCase();
    keyPhrases.forEach(phrase => {
      if (lowercaseSentence.includes(phrase)) score += 2;
    });
    
    return { sentence: sentence.trim(), score, index };
  });
  
  // Select top sentences and maintain order
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index);
  
  return topSentences.map(item => item.sentence).join(' ');
};

/**
 * Summarizes the provided text using the backend AI service
 * @param {string} text - The text to summarize
 * @param {string} [prompt] - Optional custom prompt for summarization
 * @returns {Promise<string>} - A promise that resolves to the summarized text
 */
export const summarizeText = async (text, prompt) => {
  try {
    console.log("Making request to backend API at:", `${API_BASE_URL}/summarize`);
    console.log("Text length:", text.length);
    
    // Extract length preference from prompt if available
    let lengthType = 'medium';
    if (prompt && prompt.toLowerCase().includes('brief')) lengthType = 'short';
    if (prompt && prompt.toLowerCase().includes('detailed')) lengthType = 'long';
    
    // Try to contact the server
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        prompt
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to summarize text';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        
        // Handle specific API errors and fall back to local summarizer
        if (response.status === 401 || errorMessage.includes('API key') || errorMessage.includes('401')) {
          console.warn("API key issue detected, using local summarizer");
          const localSummary = generateLocalSummary(text, lengthType);
          return `${localSummary}\n\n💡 Note: This summary was generated locally. To use AI-powered summarization, please configure a valid OpenAI API key in the backend settings.`;
        }
        
        if (response.status === 429 || errorMessage.includes('quota')) {
          console.warn("API quota exceeded, using local summarizer");
          const localSummary = generateLocalSummary(text, lengthType);
          return `${localSummary}\n\n⚠️ Note: API quota exceeded. This summary was generated locally. Please check your OpenAI API usage.`;
        }
        
        if (response.status >= 500) {
          console.warn("Server error, using local summarizer");
          const localSummary = generateLocalSummary(text, lengthType);
          return `${localSummary}\n\n🔧 Note: Server error encountered. This summary was generated locally.`;
        }
        
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error in summarizeText:', error);
    
    // If it's a network error, use local summarizer
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn("Network error, using local summarizer");
      const lengthType = prompt && prompt.toLowerCase().includes('brief') ? 'short' : 
                        prompt && prompt.toLowerCase().includes('detailed') ? 'long' : 'medium';
      const localSummary = generateLocalSummary(text, lengthType);
      return `${localSummary}\n\n🌐 Note: Unable to connect to AI service. This summary was generated locally.`;
    }
    
    throw error;
  }
};

/**
 * Generates flashcards from the provided text
 * @param {string} text - The text to generate flashcards from
 * @returns {Promise<Array>} - A promise that resolves to an array of flashcard objects
 */
export const generateFlashcards = async (noteText) => {
  // This is a placeholder for future implementation
  // TODO: Implement backend endpoint for flashcard generation using `noteText`
  console.warn('Flashcard generation is not yet implemented on the backend');
  if (noteText.length === 0) return [];
  return []; // Return empty array for now
};

/**
 * Translates the provided text to the target language
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The language code to translate to
 * @returns {Promise<string>} - A promise that resolves to the translated text
 */
export const translateText = async (noteText, language) => {
  // This is a placeholder for future implementation
  // TODO: Implement backend endpoint for translation to the specified `language`
  console.warn(`Text translation to ${language || 'target language'} is not yet implemented`);
  return noteText; // Return original text for now
};

/**
 * Generates ideas based on the provided text
 * @param {string} text - The text to generate ideas from
 * @param {string} ideaType - The type of ideas to generate (e.g., "questions", "topics", "improvements")
 * @param {number} count - The number of ideas to generate
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of idea strings
 */
export const generateIdeas = async (noteText, ideaType, ideaCount = 5) => {
  // This is a placeholder for future implementation
  // TODO: Implement backend endpoint for idea generation
  console.warn(`Generating ${ideaCount} ideas of type "${ideaType}" is not yet implemented`);
  return []; // Return empty array for now
};

export default {
  summarizeText,
  generateFlashcards,
  translateText,
  generateIdeas,
};
