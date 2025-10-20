import React, { useState } from 'react';
import './NoteCard.css';

const NoteCard = ({ note, isFlashcard = false }) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    if (isFlashcard) {
      setFlipped(!flipped);
    }
  };

  // Render a standard note card
  if (!isFlashcard) {
    return (
      <div className="note-card">
        <div className="note-content">
          <div className="note-updated">Updated {note.updated}</div>
          <h3 className="note-title">{note.title}</h3>
          <p className="note-description">{note.description}</p>
        </div>
        {note.thumbnail && (
          <div className="note-thumbnail">
            <div 
              className="thumbnail-placeholder"
              style={note.thumbnail ? { backgroundImage: `url(${note.thumbnail})` } : {}}
            />
          </div>
        )}
      </div>
    );
  }

  // Render a flashcard with Q&A format
  return (
    <div 
      className={`flashcard ${flipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flashcard-content">
            <div className="flashcard-tag">Question</div>
            <h3 className="flashcard-question">{note.question}</h3>
            <div className="flashcard-hint">
              <i className="fas fa-sync-alt"></i> 
              <span>Click to reveal answer</span>
            </div>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-content">
            <div className="flashcard-tag">Answer</div>
            <div className="flashcard-answer">{note.answer}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
