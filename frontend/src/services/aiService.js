/**
 * AI Service for NoteMind
 * Handles communication with backend AI services
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';
// Alternative URLs in case localhost doesn't work
const ALTERNATIVE_API_BASE_URL = 'http://localhost:5000/api';

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
    
    // Create a local summarization function as fallback
    const generateLocalSummary = (content) => {
      // Simple extractive summarization
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length <= 3) return content;
      
      // Return first 3 sentences as a simple summary
      return sentences.slice(0, 3).join(' ');
    };
    
    // Try to contact the server with multiple attempts
    let pingSuccess = false;
    
    // First try the main URL
    try {
      console.log("Trying to ping primary endpoint:", API_BASE_URL);
      const pingResponse = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (pingResponse.ok) {
        console.log("Backend server is running");
        pingSuccess = true;
      }
    } catch (primaryError) {
      console.warn("Failed to connect to primary endpoint:", primaryError);
    }
    
    // If primary failed, try alternative
    if (!pingSuccess) {
      try {
        console.log("Trying to ping alternative endpoint:", ALTERNATIVE_API_BASE_URL);
        const altPingResponse = await fetch(`${ALTERNATIVE_API_BASE_URL}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        });
        
        if (altPingResponse.ok) {
          console.log("Alternative backend endpoint is responding");
          pingSuccess = true;
        }
      } catch (altError) {
        console.error("Failed to connect to alternative endpoint:", altError);
      }
    }
    
    // If server is not reachable, use local summarization
    if (!pingSuccess) {
      console.warn("Backend server unreachable, using local summarization");
      const localSummary = generateLocalSummary(text);
      return `[LOCAL SUMMARY] ${localSummary}\n\n(This summary was generated locally because the AI service couldn't be reached.)`;
    }
    
    // Server is reachable, make the actual request
    const apiUrl = pingSuccess ? API_BASE_URL : ALTERNATIVE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/summarize`, {
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
        
        // Handle quota exceeded error specifically
        if (response.status === 429) {
          throw new Error('API quota exceeded. Please try again later or update the API key.');
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
