import React, { useState } from 'react';
import { summarizeText } from '../services/aiService';
import { generateFallbackSummary, getSentenceCountByLength } from '../utils/fallbackSummarizer';
import './SummarizeNote.css';

const SummarizeNote = ({ noteContent, onClose, onApplySummary }) => {
  const [summarizedContent, setSummarizedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState('medium'); // short, medium, long
  const [error, setError] = useState('');

  // Check if we should use the fallback summarizer
  // This would typically come from a settings context or prop
  const checkFallbackSummarizerEnabled = () => {
    // Try to get settings from localStorage
    try {
      const settingsData = localStorage.getItem('noteMindSettings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        return settings.useFallbackSummarization === true;
      }
    } catch (e) {
      console.error('Error reading settings:', e);
    }
    return false;
  };

  // Generate summary based on note content
  const generateSummary = async () => {
    if (!noteContent || noteContent.trim().length < 50) {
      setError('Please provide more content to summarize. At least 50 characters are needed.');
      return;
    }

    setIsLoading(true);
    setError('');

    // If user has chosen to use the fallback summarizer in settings
    if (checkFallbackSummarizerEnabled()) {
      try {
        const sentenceCount = getSentenceCountByLength(summaryLength, noteContent);
        const fallbackSummary = generateFallbackSummary(noteContent, sentenceCount);
        
        setSummarizedContent(`[LOCAL SUMMARY] ${fallbackSummary}\n\n(Note: This summary was generated using the local summarizer. Configure API settings for better results.)`);
      } catch (fallbackError) {
        console.error('Fallback summarizer error:', fallbackError);
        setError('Failed to generate local summary.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise use the API
    try {
      // Create a custom prompt based on the selected summary length
      const customPrompt = getSummaryPrompt();
      
      // Use the aiService to get a summary from the backend API
      const summary = await summarizeText(noteContent, customPrompt);
      setSummarizedContent(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Check for specific API quota error
      if (error.message.includes('API quota exceeded')) {
        setError('API quota exceeded. Using fallback summarizer instead.');
        
        // Use fallback client-side summarizer
        try {
          const sentenceCount = getSentenceCountByLength(summaryLength, noteContent);
          const fallbackSummary = generateFallbackSummary(noteContent, sentenceCount);
          
          // Add note that this is a fallback summary
          setSummarizedContent(`[FALLBACK SUMMARY] ${fallbackSummary}\n\n(Note: This summary was generated locally due to API limitations. For better results, please update the API key.)`);
        } catch (fallbackError) {
          console.error('Fallback summarizer error:', fallbackError);
          setError('Failed to generate summary. Please try again later or update the API key.');
        }
      } else {
        setError(`Failed to generate summary: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to customize summary request based on length
  const getSummaryPrompt = () => {
    switch (summaryLength) {
      case 'short':
        return `Create a very brief summary of this text in 1-2 sentences: ${noteContent}`;
      case 'long':
        return `Create a detailed summary of this text covering the main points: ${noteContent}`;
      case 'medium':
      default:
        return `Summarize this text concisely: ${noteContent}`;
    }
  };

  // Apply the summary to the note
  const applySummary = () => {
    if (summarizedContent) {
      onApplySummary(summarizedContent);
      onClose();
    }
  };
  
  // Replace note content with the summary
  const replaceSummary = () => {
    if (summarizedContent) {
      onApplySummary(summarizedContent, true);
      onClose();
    }
  };

  return (
    <div className="summarize-overlay">
      <div className="summarize-modal">
        <div className="summarize-header">
          <h2>Summarize Note</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="summarize-content">
          {!summarizedContent ? (
            <div className="summarize-options">
              <p className="summarize-description">
                Generate a concise summary of your note using AI. Choose the length of the summary below.
              </p>
              
              <div className="summary-length-options">
                <button 
                  className={`length-option ${summaryLength === 'short' ? 'active' : ''}`}
                  onClick={() => setSummaryLength('short')}
                >
                  <i className="fas fa-align-left"></i>
                  <span>Short</span>
                  <span className="length-description">Brief overview</span>
                </button>
                
                <button 
                  className={`length-option ${summaryLength === 'medium' ? 'active' : ''}`}
                  onClick={() => setSummaryLength('medium')}
                >
                  <i className="fas fa-align-center"></i>
                  <span>Medium</span>
                  <span className="length-description">Balanced summary</span>
                </button>
                
                <button 
                  className={`length-option ${summaryLength === 'long' ? 'active' : ''}`}
                  onClick={() => setSummaryLength('long')}
                >
                  <i className="fas fa-align-right"></i>
                  <span>Long</span>
                  <span className="length-description">Detailed summary</span>
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                className="generate-button"
                onClick={generateSummary}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    <span>Generate Summary</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="summary-preview">
              <h3>Generated Summary</h3>
              
              <div className="summary-text">{summarizedContent}</div>
              
              <div className="summary-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setSummarizedContent('')}
                >
                  <i className="fas fa-redo"></i>
                  <span>Regenerate</span>
                </button>
                
                <button 
                  className="primary-button"
                  onClick={applySummary}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add to Note</span>
                </button>
                
                <button 
                  className="accent-button"
                  onClick={replaceSummary}
                >
                  <i className="fas fa-exchange-alt"></i>
                  <span>Replace Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarizeNote;