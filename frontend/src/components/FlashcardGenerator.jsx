import React, { useState, useEffect } from 'react';
import './FlashcardGenerator.css';
import NoteCard from './NoteCard';

const FlashcardGenerator = ({ noteContent, onClose }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numCards, setNumCards] = useState(5);
  const [setName, setSetName] = useState('');
  const [error, setError] = useState('');

  // Set default name based on note content when component mounts
  useEffect(() => {
    if (noteContent) {
      const firstLine = noteContent.split('\n')[0].trim();
      // Use the first line as the set name, or a default if it's empty
      setSetName(firstLine && firstLine.length > 0 
        ? firstLine.substring(0, 30) 
        : 'My Flashcard Set');
    }
  }, [noteContent]);

  // Function to generate flashcards from note content
  const generateFlashcards = async () => {
    // Validate content
    if (!noteContent || noteContent.trim().length < 10) {
      setError('Please add more content to your note for better flashcard generation.');
      return;
    }
    
    setIsGenerating(true);
    setError('');

    try {
      // In a real application, this would be an API call to your backend
      // which would use an AI service to generate Q&A pairs from the content
      // For demonstration, we'll simulate this with timeout and mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate intelligent flashcards based on note content
      const generatedCards = generateIntelligentFlashcards(noteContent, numCards);
      setFlashcards(generatedCards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to intelligently generate flashcards from content
  const generateIntelligentFlashcards = (content, count) => {
    // Simple algorithm to extract meaningful content from the note
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10);
      
    // If not enough lines, split by sentences
    if (lines.length < count / 2) {
      const sentences = content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
      lines.push(...sentences);
    }
    
    const cards = [];
    
    // Generate cards based on the content
    for (let i = 0; i < Math.min(count, lines.length * 2, 20); i++) {
      // Pick a line to use, cycling through available lines
      const lineIdx = i % lines.length;
      const line = lines[lineIdx];
      
      if (line) {
        // Generate different types of questions based on the index
        const card = createFlashcardFromLine(line, i);
        if (card) cards.push(card);
      }
    }
    
    return cards;
  };
  
  // Create a flashcard from a line of text
  const createFlashcardFromLine = (line, index) => {
    const words = line.split(' ');
    
    // Different question types based on pattern
    switch (index % 4) {
      case 0: { // Definition style
        const keyTerm = words.slice(0, Math.min(3, words.length)).join(' ');
        return {
          id: `flashcard-${index}`,
          question: `What is ${keyTerm}?`,
          answer: line,
          created: new Date().toISOString()
        };
      }
        
      case 1: { // Fill-in-the-blank
        const splitPoint = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, splitPoint).join(' ');
        const secondHalf = words.slice(splitPoint).join(' ');
        return {
          id: `flashcard-${index}`,
          question: `Complete this statement: "${firstHalf}..."`,
          answer: secondHalf,
          created: new Date().toISOString()
        };
      }
        
      case 2: { // Concept explanation
        // Find an important word (longer than 5 chars) or use first word
        const keyWord = words.find(w => w.length > 5) || words[0];
        return {
          id: `flashcard-${index}`,
          question: `Explain the concept of "${keyWord}":`,
          answer: line,
          created: new Date().toISOString()
        };
      }
        
      case 3: { // True/False or context question
        return {
          id: `flashcard-${index}`,
          question: `What is the context of "${words.slice(0, 3).join(' ')}..."?`,
          answer: line,
          created: new Date().toISOString()
        };
      }
        
      default: {
        return {
          id: `flashcard-${index}`,
          question: `What does this mean: "${line.substring(0, 30)}..."?`,
          answer: line,
          created: new Date().toISOString()
        };
      }
    }
  };

  // Function to save flashcards
  const saveFlashcards = () => {
    if (!setName.trim()) {
      setError('Please provide a name for your flashcard set');
      return;
    }
    
    // In a real app, this would save to database
    console.log('Saving flashcards:', { setName, flashcards });
    
    // Show success message
    alert('Flashcard set saved successfully!');
    
    // Close the modal after saving
    onClose();
  };

  return (
    <div className="flashcard-generator-overlay">
      <div className="flashcard-generator-modal">
        <div className="flashcard-generator-header">
          <h2>Generate Q&A Flashcards</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="flashcard-generator-content">
          {!flashcards.length ? (
            <div className="generator-options">
              <p className="generator-description">
                Create question and answer flashcards from your note content using AI.
                These can be used for studying or testing your knowledge.
              </p>
              
              <div className="option-group">
                <label htmlFor="set-name">Flashcard Set Name</label>
                <input
                  type="text"
                  id="set-name"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Enter a name for your flashcard set"
                />
              </div>
              
              <div className="option-group">
                <label htmlFor="num-cards">Number of flashcards to generate:</label>
                <input
                  type="number"
                  id="num-cards"
                  min="1"
                  max="20"
                  value={numCards}
                  onChange={(e) => setNumCards(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                className="generate-button"
                onClick={generateFlashcards}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    <span>Generate Flashcards</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flashcards-preview">
              <p className="preview-instruction">
                Review your flashcards below. Click on a card to flip between question and answer.
              </p>
              
              <div className="flashcard-grid">
                {flashcards.map((card) => (
                  <NoteCard 
                    key={card.id} 
                    note={card} 
                    isFlashcard={true} 
                  />
                ))}
              </div>
              
              <div className="flashcard-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setFlashcards([])}
                >
                  <i className="fas fa-redo"></i>
                  <span>Regenerate</span>
                </button>
                
                <button 
                  className="primary-button"
                  onClick={saveFlashcards}
                  disabled={!setName.trim()}
                >
                  <i className="fas fa-save"></i>
                  <span>Save Flashcards</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardGenerator;