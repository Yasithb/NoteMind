import React, { useState } from 'react';
import './IdeaGenerator.css';

const IdeaGenerator = ({ noteContent, onClose, onApplyIdeas }) => {
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ideaType, setIdeaType] = useState('expansion'); // expansion, questions, counterpoints
  const [numIdeas, setNumIdeas] = useState(5);
  const [error, setError] = useState('');

  // Generate ideas based on the note content
  const generateIdeas = async () => {
    if (!noteContent || noteContent.trim().length < 20) {
      setError('Please provide more content in your note to generate meaningful ideas.');
      return;
    }

    setIsLoading(true);
    setError('');

    // In a real app, this would be an API call to an AI service
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Generate ideas based on the selected type and content
      const ideas = createMockIdeas(noteContent, ideaType, numIdeas);
      setGeneratedIdeas(ideas);
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple function to create mock ideas based on the content
  const createMockIdeas = (content, type, count) => {
    // Extract keywords from the content for more relevant ideas
    const keywords = extractKeywords(content);
    
    // Generate different types of ideas based on the selected type
    const ideas = [];
    
    switch (type) {
      case 'expansion':
        // Ideas that expand on the content
        for (let i = 0; i < count; i++) {
          ideas.push(generateExpansionIdea(keywords, content, i));
        }
        break;
        
      case 'questions':
        // Questions related to the content
        for (let i = 0; i < count; i++) {
          ideas.push(generateQuestionIdea(keywords, content, i));
        }
        break;
        
      case 'counterpoints':
        // Alternative perspectives or counterpoints
        for (let i = 0; i < count; i++) {
          ideas.push(generateCounterpointIdea(keywords, content, i));
        }
        break;
        
      default:
        // Mix of different types
        for (let i = 0; i < count; i++) {
          const subtype = i % 3;
          if (subtype === 0) {
            ideas.push(generateExpansionIdea(keywords, content, i));
          } else if (subtype === 1) {
            ideas.push(generateQuestionIdea(keywords, content, i));
          } else {
            ideas.push(generateCounterpointIdea(keywords, content, i));
          }
        }
    }
    
    return ideas;
  };
  
  // Extract keywords from the content
  const extractKeywords = (content) => {
    // In a real app, you would use NLP to extract actual keywords
    // For this demo, we'll use a simple approach
    const words = content.toLowerCase().split(/\W+/);
    
    // Filter out common words and short words
    const commonWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'yes', 'so', 'this', 'that', 'these', 'those', 'it', 'they', 'them']);
    
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      // Get unique words
      .filter((word, index, self) => self.indexOf(word) === index);
    
    return keywords;
  };
  
  // Generate an expansion idea
  const generateExpansionIdea = (keywords, content, index) => {
    const expansionTemplates = [
      'Consider exploring the relationship between [keyword1] and [keyword2] in more depth.',
      'You could add a section about how [keyword1] influences [keyword2] in different contexts.',
      'Think about the historical development of [keyword1] and how it has evolved over time.',
      'It might be valuable to discuss the practical applications of [keyword1] in real-world scenarios.',
      'Research shows that [keyword1] has connections to [keyword2] that could enrich your analysis.',
      'Adding examples of how [keyword1] manifests in various [keyword2] situations could strengthen your points.',
      'Consider comparing and contrasting [keyword1] with [keyword2] to highlight key differences and similarities.',
      'Exploring the ethical implications of [keyword1] could add a valuable dimension to your note.',
      'You might want to address common misconceptions about [keyword1] in relation to your topic.',
      'An interesting angle would be to examine how [keyword1] is viewed across different disciplines or cultures.'
    ];
    
    // Select a random template
    const template = expansionTemplates[index % expansionTemplates.length];
    
    // Select random keywords to insert
    const keyword1 = keywords[index % keywords.length] || 'this topic';
    const keyword2 = keywords[(index + 3) % keywords.length] || 'related concepts';
    
    // Replace placeholders with keywords
    const idea = template
      .replace('[keyword1]', keyword1)
      .replace('[keyword2]', keyword2);
    
    return {
      id: `expansion-${index}`,
      type: 'expansion',
      content: idea,
      icon: 'lightbulb'
    };
  };
  
  // Generate a question idea
  const generateQuestionIdea = (keywords, content, index) => {
    const questionTemplates = [
      'What are the main factors that influence [keyword1] in the context of your note?',
      'How does [keyword1] relate to [keyword2] in different circumstances?',
      'Why is [keyword1] significant for understanding the broader implications of your topic?',
      'What would happen if [keyword1] was approached from a different perspective?',
      'How has the understanding of [keyword1] changed over time?',
      'What evidence supports or challenges the connection between [keyword1] and [keyword2]?',
      'In what ways could [keyword1] be applied to solve problems related to [keyword2]?',
      'What are the limitations of current approaches to [keyword1]?',
      'How do different stakeholders or experts view [keyword1]?',
      'What future developments might we expect to see regarding [keyword1]?'
    ];
    
    // Select a random template
    const template = questionTemplates[index % questionTemplates.length];
    
    // Select random keywords to insert
    const keyword1 = keywords[index % keywords.length] || 'this topic';
    const keyword2 = keywords[(index + 2) % keywords.length] || 'related concepts';
    
    // Replace placeholders with keywords
    const idea = template
      .replace('[keyword1]', keyword1)
      .replace('[keyword2]', keyword2);
    
    return {
      id: `question-${index}`,
      type: 'question',
      content: idea,
      icon: 'question-circle'
    };
  };
  
  // Generate a counterpoint idea
  const generateCounterpointIdea = (keywords, content, index) => {
    const counterpointTemplates = [
      'Although [keyword1] is important, some might argue that it overlooks the significance of [keyword2].',
      'A contrasting viewpoint suggests that [keyword1] is less influential than [keyword2] in this context.',
      'Critics of this approach to [keyword1] point out that alternative frameworks might be more effective.',
      'While your note focuses on [keyword1], considering [keyword2] might reveal opposing insights.',
      'An alternative interpretation could suggest that [keyword1] actually leads to different outcomes than presented.',
      'Not everyone agrees that [keyword1] and [keyword2] are connected in the way described.',
      'Some research challenges the assumption that [keyword1] always results in the effects mentioned.',
      'A competing theory proposes that [keyword1] should be understood through the lens of [keyword2] instead.',
      'Consider the possibility that [keyword1] might actually have the opposite effect in certain circumstances.',
      'The relationship between [keyword1] and [keyword2] might be more complex than initially presented.'
    ];
    
    // Select a random template
    const template = counterpointTemplates[index % counterpointTemplates.length];
    
    // Select random keywords to insert
    const keyword1 = keywords[index % keywords.length] || 'this topic';
    const keyword2 = keywords[(index + 4) % keywords.length] || 'related concepts';
    
    // Replace placeholders with keywords
    const idea = template
      .replace('[keyword1]', keyword1)
      .replace('[keyword2]', keyword2);
    
    return {
      id: `counterpoint-${index}`,
      type: 'counterpoint',
      content: idea,
      icon: 'balance-scale'
    };
  };

  // Apply selected ideas to the note
  const applyIdeas = () => {
    // Filter ideas that have been selected (checked)
    const selectedIdeas = generatedIdeas.filter(idea => idea.selected);
    
    if (selectedIdeas.length === 0) {
      setError('Please select at least one idea to add to your note.');
      return;
    }
    
    // Format the selected ideas as markdown
    const formattedIdeas = formatIdeasAsMarkdown(selectedIdeas);
    
    // Send the formatted ideas back to the Editor component
    onApplyIdeas(formattedIdeas);
    onClose();
  };
  
  // Format ideas as markdown based on their type
  const formatIdeasAsMarkdown = (ideas) => {
    // Group ideas by type
    const groupedIdeas = {
      expansion: ideas.filter(idea => idea.type === 'expansion'),
      question: ideas.filter(idea => idea.type === 'question'),
      counterpoint: ideas.filter(idea => idea.type === 'counterpoint')
    };
    
    let markdown = '## Generated Ideas\n\n';
    
    // Add expansion ideas
    if (groupedIdeas.expansion.length > 0) {
      markdown += '### Points to Explore Further\n';
      groupedIdeas.expansion.forEach(idea => {
        markdown += `- ${idea.content}\n`;
      });
      markdown += '\n';
    }
    
    // Add question ideas
    if (groupedIdeas.question.length > 0) {
      markdown += '### Questions to Consider\n';
      groupedIdeas.question.forEach(idea => {
        markdown += `- ${idea.content}\n`;
      });
      markdown += '\n';
    }
    
    // Add counterpoint ideas
    if (groupedIdeas.counterpoint.length > 0) {
      markdown += '### Alternative Perspectives\n';
      groupedIdeas.counterpoint.forEach(idea => {
        markdown += `- ${idea.content}\n`;
      });
      markdown += '\n';
    }
    
    return markdown;
  };
  
  // Toggle idea selection
  const toggleIdeaSelection = (id) => {
    setGeneratedIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === id ? { ...idea, selected: !idea.selected } : idea
      )
    );
  };

  return (
    <div className="idea-generator-overlay">
      <div className="idea-generator-modal">
        <div className="idea-generator-header">
          <h2>Generate Ideas</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="idea-generator-content">
          {generatedIdeas.length === 0 ? (
            <div className="idea-generator-options">
              <p className="idea-description">
                Generate new ideas, questions, or perspectives based on your note content.
              </p>
              
              <div className="idea-type-options">
                <button 
                  className={`idea-type-option ${ideaType === 'expansion' ? 'active' : ''}`}
                  onClick={() => setIdeaType('expansion')}
                >
                  <i className="fas fa-lightbulb"></i>
                  <div className="option-text">
                    <span className="option-title">Expansion Ideas</span>
                    <span className="option-subtitle">Develop and extend your thoughts</span>
                  </div>
                </button>
                
                <button 
                  className={`idea-type-option ${ideaType === 'questions' ? 'active' : ''}`}
                  onClick={() => setIdeaType('questions')}
                >
                  <i className="fas fa-question-circle"></i>
                  <div className="option-text">
                    <span className="option-title">Critical Questions</span>
                    <span className="option-subtitle">Explore deeper inquiries</span>
                  </div>
                </button>
                
                <button 
                  className={`idea-type-option ${ideaType === 'counterpoints' ? 'active' : ''}`}
                  onClick={() => setIdeaType('counterpoints')}
                >
                  <i className="fas fa-balance-scale"></i>
                  <div className="option-text">
                    <span className="option-title">Alternative Perspectives</span>
                    <span className="option-subtitle">Consider different viewpoints</span>
                  </div>
                </button>
              </div>
              
              <div className="ideas-count-selector">
                <label>Number of ideas to generate:</label>
                <div className="count-buttons">
                  {[3, 5, 7, 10].map(count => (
                    <button 
                      key={count}
                      className={`count-option ${numIdeas === count ? 'active' : ''}`}
                      onClick={() => setNumIdeas(count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                className="generate-button"
                onClick={generateIdeas}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Generating Ideas...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-lightbulb"></i>
                    <span>Generate Ideas</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="generated-ideas">
              <div className="ideas-header">
                <h3>Select ideas to add to your note</h3>
                <div className="selection-controls">
                  <button 
                    className="control-button"
                    onClick={() => setGeneratedIdeas(prev => prev.map(idea => ({ ...idea, selected: true })))}
                  >
                    Select All
                  </button>
                  <button 
                    className="control-button"
                    onClick={() => setGeneratedIdeas(prev => prev.map(idea => ({ ...idea, selected: false })))}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="ideas-list">
                {generatedIdeas.map((idea) => (
                  <div 
                    key={idea.id} 
                    className={`idea-item ${idea.selected ? 'selected' : ''}`}
                    onClick={() => toggleIdeaSelection(idea.id)}
                  >
                    <div className="idea-checkbox">
                      <input 
                        type="checkbox" 
                        checked={idea.selected || false}
                        onChange={() => toggleIdeaSelection(idea.id)}
                      />
                      <i className={`fas fa-${idea.icon}`}></i>
                    </div>
                    <div className="idea-content">
                      {idea.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="ideas-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setGeneratedIdeas([])}
                >
                  <i className="fas fa-redo"></i>
                  <span>Generate Again</span>
                </button>
                
                <button 
                  className="primary-button"
                  onClick={applyIdeas}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add Selected Ideas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;