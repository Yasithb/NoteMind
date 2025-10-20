import React from 'react';
import './AIActionBar.css';

const AIActionBar = ({ onActionSelect }) => {
  // Define AI actions
  const aiActions = [
    {
      id: 'summarize',
      icon: 'compress-alt',
      label: 'Summarize',
      color: '#1665D8',
      description: 'Create a concise AI-powered summary of your note'
    },
    {
      id: 'generate-ideas',
      icon: 'lightbulb',
      label: 'Generate Ideas',
      color: '#F0B429',
      description: 'Generate creative ideas based on your content'
    },
    {
      id: 'translate',
      icon: 'language',
      label: 'Translate',
      color: '#05D7B3',
      description: 'Translate your note into multiple languages'
    },
    {
      id: 'flashcards',
      icon: 'copy',
      label: 'Create Flashcards',
      color: '#3366FF',
      description: 'Convert your notes into interactive study flashcards'
    }
  ];

  // Handle action click
  const handleActionClick = (actionId) => {
    if (onActionSelect) {
      onActionSelect(actionId);
    }
  };

  return (
    <div className="ai-action-bar">
      <div className="ai-action-title">AI ACTIONS</div>
      <div className="ai-actions-container">
        {aiActions.map((action) => (
          <button
            key={action.id}
            className="ai-action-button"
            onClick={() => handleActionClick(action.id)}
            title={action.description}
          >
            <div 
              className="ai-action-icon"
              style={{ backgroundColor: `${action.color}30`, color: action.color }}
            >
              {action.id === 'summarize' && <i className="fas fa-compress-alt"></i>}
              {action.id === 'generate-ideas' && <i className="fas fa-lightbulb"></i>}
              {action.id === 'translate' && <i className="fas fa-language"></i>}
              {action.id === 'flashcards' && <i className="far fa-clone"></i>}
            </div>
            <div className="ai-action-label">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIActionBar;
