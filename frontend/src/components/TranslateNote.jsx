import React, { useState } from 'react';
import './TranslateNote.css';

const TranslateNote = ({ noteContent, onClose, onApplyTranslation }) => {
  const [translatedContent, setTranslatedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [error, setError] = useState('');

  // Available languages for translation
  const languages = [
    { id: 'spanish', name: 'Spanish', flag: '' },
    { id: 'french', name: 'French', flag: '' },
    { id: 'german', name: 'German', flag: '' },
    { id: 'chinese', name: 'Chinese', flag: '' },
    { id: 'japanese', name: 'Japanese', flag: '' },
    { id: 'korean', name: 'Korean', flag: '' },
    { id: 'russian', name: 'Russian', flag: '' },
    { id: 'arabic', name: 'Arabic', flag: '' },
    { id: 'portuguese', name: 'Portuguese', flag: '' },
    { id: 'italian', name: 'Italian', flag: '' },
  ];

  // Generate translation based on note content
  const generateTranslation = async () => {
    if (!noteContent || noteContent.trim().length < 3) {
      setError('Please provide more content to translate.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock translation based on the selected language
      const mockedTranslation = createMockTranslation(noteContent, targetLanguage);
      setTranslatedContent(mockedTranslation);
    } catch (error) {
      console.error('Error generating translation:', error);
      setError('Failed to generate translation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a mock translation based on the target language
  const createMockTranslation = (content, language) => {
    // In a real app, you would use a translation API
    // For this demo, we'll create a simplified mock translation
    
    // Common prefixes/suffixes to simulate different languages
    const langPatterns = {
      spanish: {
        prefix: '',
        suffix: '!',
        common: ['El ', 'La ', 'Los ', 'Las ', 'Muy ', 'Y ', 'En '],
        endings: ['ado', 'ido', 'ción', 'mente', 'ero', 'ito', 'amos']
      },
      french: {
        prefix: '',
        suffix: '',
        common: ['Le ', 'La ', 'Les ', 'Très ', 'Et ', 'Dans ', 'Je ', 'Nous '],
        endings: ['eux', 'ement', 'ais', 'ant', 'iste', 'able', 'ez']
      },
      german: {
        prefix: '',
        suffix: '',
        common: ['Der ', 'Die ', 'Das ', 'Sehr ', 'Und ', 'In ', 'Mit '],
        endings: ['ung', 'lich', 'isch', 'heit', 'keit', 'en', 'er']
      },
      chinese: {
        prefix: '',
        suffix: '。',
        common: ['我 ', '你 ', '他 ', '她 ', '这个 ', '那个 ', '很 '],
        endings: ['了', '的', '吗', '呢', '吧', '啊', '么']
      },
      japanese: {
        prefix: '',
        suffix: 'です。',
        common: ['私は ', '彼は ', '彼女は ', 'とても ', 'そして ', 'に ', 'で '],
        endings: ['ます', 'です', 'ました', 'ください', 'だよ', 'でしょう', 'ません']
      },
      korean: {
        prefix: '',
        suffix: '요.',
        common: ['나는 ', '그는 ', '그녀는 ', '매우 ', '그리고 ', '에 ', '에서 '],
        endings: ['니다', '어요', '습니다', '세요', '이에요', '하다', '했어요']
      },
      russian: {
        prefix: '',
        suffix: '.',
        common: ['Я ', 'Ты ', 'Он ', 'Она ', 'Это ', 'Очень ', 'И '],
        endings: ['ов', 'ский', 'ить', 'ать', 'ный', 'ная', 'ное']
      },
      arabic: {
        prefix: '',
        suffix: '.',
        common: ['أنا ', 'هو ', 'هي ', 'جدا ', 'و ', 'في ', 'مع '],
        endings: ['ون', 'ين', 'ات', 'ة', 'ا', 'ي', 'ها']
      },
      portuguese: {
        prefix: '',
        suffix: '!',
        common: ['O ', 'A ', 'Os ', 'As ', 'Muito ', 'E ', 'Em '],
        endings: ['ão', 'ar', 'er', 'ir', 'ado', 'ido', 'mente']
      },
      italian: {
        prefix: '',
        suffix: '!',
        common: ['Il ', 'La ', 'I ', 'Le ', 'Molto ', 'E ', 'In '],
        endings: ['are', 'ere', 'ire', 'ato', 'ito', 'mente', 'zione']
      }
    };
    
    const pattern = langPatterns[language] || langPatterns.spanish;
    
    // Transform the content into mock translated content
    const lines = content.split('\n');
    const translatedLines = lines.map(line => {
      if (!line.trim()) return line;
      
      // Add language-specific prefix and suffix
      let translatedLine = pattern.prefix + line + pattern.suffix;
      
      // Replace some words with common words from the target language
      pattern.common.forEach((word, index) => {
        if (index % 3 === 0 && translatedLine.length > 10) {
          const position = Math.floor(Math.random() * (translatedLine.length - 10)) + 5;
          translatedLine = translatedLine.substring(0, position) + word + translatedLine.substring(position + word.length);
        }
      });
      
      // Add some endings to random positions
      pattern.endings.forEach((ending, index) => {
        if (index % 4 === 0 && translatedLine.length > 15) {
          const position = Math.floor(Math.random() * (translatedLine.length - 15)) + 10;
          if (translatedLine[position] === ' ' || translatedLine[position] === '.') {
            translatedLine = translatedLine.substring(0, position) + ending + translatedLine.substring(position);
          }
        }
      });
      
      return translatedLine;
    });
    
    return translatedLines.join('\n');
  };

  // Apply the translation to the note
  const applyTranslation = (replace = false) => {
    if (translatedContent) {
      onApplyTranslation(translatedContent, replace);
      onClose();
    }
  };

  // Get the selected language object
  const selectedLanguage = languages.find(lang => lang.id === targetLanguage) || languages[0];

  return (
    <div className="translate-overlay">
      <div className="translate-modal">
        <div className="translate-header">
          <h2>Translate Note</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="translate-content">
          {!translatedContent ? (
            <div className="translate-options">
              <p className="translate-description">
                Translate your note into another language using AI.
              </p>
              
              <div className="language-selector">
                <label>Select target language:</label>
                <div className="language-grid">
                  {languages.map(language => (
                    <button
                      key={language.id}
                      className={`language-option ${targetLanguage === language.id ? 'active' : ''}`}
                      onClick={() => setTargetLanguage(language.id)}
                    >
                      <span className="language-flag">{language.flag}</span>
                      <span className="language-name">{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                className="translate-button"
                onClick={generateTranslation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-language"></i>
                    <span>Translate to {selectedLanguage.name}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="translation-preview">
              <div className="translation-header">
                <h3>
                  <span className="language-flag">{selectedLanguage.flag}</span>
                  <span>Translation ({selectedLanguage.name})</span>
                </h3>
              </div>
              
              <div className="translation-text">
                {translatedContent}
              </div>
              
              <div className="translation-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setTranslatedContent('')}
                >
                  <i className="fas fa-redo"></i>
                  <span>Translate Again</span>
                </button>
                
                <button 
                  className="primary-button"
                  onClick={() => applyTranslation(false)}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add to Note</span>
                </button>
                
                <button 
                  className="accent-button"
                  onClick={() => applyTranslation(true)}
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

export default TranslateNote;
