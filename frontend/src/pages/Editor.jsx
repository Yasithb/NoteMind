import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FlashcardGenerator from '../components/FlashcardGenerator';
import SummarizeNote from '../components/SummarizeNote';
import TranslateNote from '../components/TranslateNote';
import IdeaGenerator from '../components/IdeaGenerator';
import TagsModal from '../components/TagsModal';
import TagBadge from '../components/TagBadge';
import useAvatar from '../hooks/useAvatar';
import { createNote, getNote, updateNote, deleteNote } from '../services/noteService';
import './Editor.css';

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: noteId } = useParams();
  const isEditMode = !!noteId;
  
  // Note state
  const [noteTitle, setNoteTitle] = useState('Untitled Note');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'saved', 'error'
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('#ffffff');
  
  // Use our custom avatar hook
  const [userAvatar] = useAvatar('https://i.pravatar.cc/40');
  
  // Load existing note data if in edit mode
  useEffect(() => {
    const fetchNote = async () => {
      if (isEditMode) {
        try {
          setSaveStatus('loading');
          const response = await getNote(noteId);
          if (response.success) {
            const note = response.data;
            setNoteTitle(note.title);
            setNoteContent(note.content);
            setTags(note.tags || []);
            setColor(note.color || '#ffffff');
          }
          setSaveStatus(null);
        } catch (error) {
          console.error('Error loading note:', error);
          setSaveStatus('error');
        }
      } else if (location.state?.noteData) {
        // Handle creating a note from template or with prefilled data
        const { title, content, tags: noteTags, color: noteColor } = location.state.noteData;
        setNoteTitle(title || 'Untitled Note');
        setNoteContent(content || '');
        setTags(noteTags || []);
        setColor(noteColor || '#ffffff');
      }
    };
    
    fetchNote();
  }, [noteId, isEditMode, location.state]);
  
  // Handle saving the note - wrapped in useCallback to avoid dependency issues in useEffect
  const handleSaveNote = useCallback(async () => {
    if (noteTitle.trim() === '') {
      alert('Please enter a title for your note');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      
      const noteData = {
        title: noteTitle,
        content: noteContent,
        tags,
        color
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing note
        response = await updateNote(noteId, noteData);
      } else {
        // Create new note
        response = await createNote(noteData);
      }
      
      if (response.success) {
        setSaveStatus('saved');
        
        // Show success message briefly before navigating
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [noteTitle, noteContent, tags, color, isEditMode, noteId, navigate]);
  
  // Handle deleting the note
  const handleDeleteNote = async () => {
    // Only allow deletion of existing notes
    if (!isEditMode) {
      if (window.confirm('Discard this unsaved note?')) {
        navigate('/dashboard');
      }
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      try {
        setSaveStatus('saving'); // Reuse saving state for deletion
        const response = await deleteNote(noteId);
        
        if (response.success) {
          // Redirect to dashboard after deleting
          navigate('/dashboard');
        } else {
          setSaveStatus('error');
          alert('Failed to delete note. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        setSaveStatus('error');
        alert('Error deleting note. Please try again.');
      }
    }
  };
  
  // Handle title change
  const handleTitleChange = (e) => {
    setNoteTitle(e.target.value);
  };
  
  // Handle content change
  const handleContentChange = (e) => {
    setNoteContent(e.target.value);
  };
  
  // Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        handleSaveNote();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSaveNote]);
  
  // Auto-save functionality
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('noteMindSettings') || '{}');
    const autoSaveEnabled = settings.autoSave !== false; // Default to true if not set
    const saveInterval = settings.saveInterval || 30; // Default to 30 seconds
    
    if (!autoSaveEnabled || !noteTitle.trim()) return;
    
    let autoSaveTimer;
    
    // Only start auto-save if we have content to save and we're editing an existing note
    if ((noteContent.trim() || noteTitle.trim()) && isEditMode) {
      autoSaveTimer = setTimeout(() => {
        handleSaveNote();
      }, saveInterval * 1000);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [noteContent, noteTitle, isEditMode, handleSaveNote]);
  
  // State for showing/hiding AI feature modals
  const [showFlashcardGenerator, setShowFlashcardGenerator] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  // Handle applying a generated summary to the note
  const handleApplySummary = (summary, replace = false) => {
    if (replace) {
      // Replace the entire note with the summary
      setNoteContent(summary);
    } else {
      // Prepend the summary to the note
      const updatedContent = `## Summary\n${summary}\n\n## Original Content\n${noteContent}`;
      setNoteContent(updatedContent);
    }
  };
  
  // Handle applying a translation to the note
  const handleApplyTranslation = (translation, replace = false) => {
    if (replace) {
      // Replace the entire note with the translation
      setNoteContent(translation);
    } else {
      // Add the translation after the original content
      const updatedContent = `${noteContent}\n\n## Translation\n${translation}`;
      setNoteContent(updatedContent);
    }
  };
  
  // Handle applying generated ideas to the note
  const handleApplyIdeas = (ideas) => {
    // Add the ideas at the end of the note
    const updatedContent = `${noteContent}\n\n${ideas}`;
    setNoteContent(updatedContent);
  };
  
  // Tag management functions
  const handleOpenTagsModal = () => {
    setShowTagsModal(true);
  };
  
  const handleTagSelect = (selectedTags) => {
    setTags(selectedTags);
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag.id !== tagToRemove.id));
  };

  return (
    <div className="editor-container">
      {/* Left Sidebar */}
      <div className="editor-sidebar">
        <div className="app-logo">NoteMind</div>
        
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span className="nav-text">Back to Notes</span>
          </div>
          
          <div className="nav-item active">
            <span className="nav-icon">
              <i className="fas fa-edit"></i>
            </span>
            <span className="nav-text">Editor</span>
          </div>
          
          <div className="nav-divider"></div>
          
          <div className="sidebar-section-title">AI Tools</div>
          
          <div className="nav-item" onClick={() => noteContent.trim().length > 0 ? setShowSummarizeModal(true) : alert('Please add some content to your note first!')}>
            <span className="nav-icon">
              <i className="fas fa-compress-alt"></i>
            </span>
            <span className="nav-text">Summarize</span>
          </div>
          
          <div className="nav-item" onClick={() => noteContent.trim().length > 0 ? setShowIdeaGenerator(true) : alert('Please add some content to your note first!')}>
            <span className="nav-icon">
              <i className="fas fa-lightbulb"></i>
            </span>
            <span className="nav-text">Generate Ideas</span>
          </div>
          
          <div className="nav-item" onClick={() => noteContent.trim().length > 0 ? setShowTranslateModal(true) : alert('Please add some content to your note first!')}>
            <span className="nav-icon">
              <i className="fas fa-language"></i>
            </span>
            <span className="nav-text">Translate</span>
          </div>
          
          <div className="nav-item" onClick={() => noteContent.trim().length > 0 ? setShowFlashcardGenerator(true) : alert('Please add some content to your note first!')}>
            <span className="nav-icon">
              <i className="far fa-clone"></i>
            </span>
            <span className="nav-text">Create Flashcards</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">
              <i className="fas fa-sign-out-alt"></i>
            </span>
            <span className="nav-text">Exit Editor</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="editor-main-content">
        {/* Header */}
        <header className="editor-header">
          <div className="editor-header-title">
            <h1>Editor</h1>
          </div>
          
          <div className="user-profile">
            <button className="settings-button" onClick={() => navigate('/settings')}>
              <i className="fas fa-cog"></i>
            </button>
            <div className="user-avatar">
              <img 
                src={userAvatar} 
                alt="User" 
                onError={(e) => {
                  // Fallback if avatar doesn't load
                  e.target.src = 'https://i.pravatar.cc/40';
                }}
              />
            </div>
          </div>
        </header>
        
        {/* Main Editor Area */}
        <main className="editor-main">
          <div className="editor-content">
            <input
              type="text"
              className="editor-title"
              value={noteTitle}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
            />
            
            <div className="editor-tags">
              <div className="tags-container">
                {tags.map(tag => (
                  <TagBadge 
                    key={tag.id} 
                    tag={tag} 
                    removable={true}
                    onRemove={handleRemoveTag}
                  />
                ))}
                <button 
                  className="add-tag-button" 
                  onClick={handleOpenTagsModal}
                  title="Add Tags"
                >
                  <i className="fas fa-tag"></i> <span>Add Tags</span>
                </button>
              </div>
            </div>
            
            <textarea
              className="editor-body"
              value={noteContent}
              onChange={handleContentChange}
              placeholder="Start writing here..."
            ></textarea>
          </div>
          
          <div className="editor-actions">
            <button className="delete-button" onClick={handleDeleteNote}>
              <i className="fas fa-trash"></i>
              <span>Delete</span>
            </button>
            
            <div className="save-container">
              {saveStatus === 'saving' && (
                <span className="save-indicator saving">
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="save-indicator saved">
                  <i className="fas fa-check"></i> Saved!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="save-indicator error">
                  <i className="fas fa-exclamation-circle"></i> Error saving
                </span>
              )}
              
              <button 
                className="save-button" 
                onClick={handleSaveNote} 
                disabled={isSaving}
              >
                <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Flashcard Generator Modal */}
      {showFlashcardGenerator && (
        <FlashcardGenerator 
          noteContent={noteContent} 
          onClose={() => setShowFlashcardGenerator(false)}
        />
      )}
      
      {/* Summarize Note Modal */}
      {showSummarizeModal && (
        <SummarizeNote
          noteContent={noteContent}
          onClose={() => setShowSummarizeModal(false)}
          onApplySummary={handleApplySummary}
        />
      )}
      
      {/* Translate Note Modal */}
      {showTranslateModal && (
        <TranslateNote
          noteContent={noteContent}
          onClose={() => setShowTranslateModal(false)}
          onApplyTranslation={handleApplyTranslation}
        />
      )}
      
      {/* Idea Generator Modal */}
      {showIdeaGenerator && (
        <IdeaGenerator
          noteContent={noteContent}
          onClose={() => setShowIdeaGenerator(false)}
          onApplyIdeas={handleApplyIdeas}
        />
      )}
      
      {/* Tags Modal */}
      {showTagsModal && (
        <TagsModal
          onClose={() => setShowTagsModal(false)}
          onTagSelect={handleTagSelect}
          selectedTags={tags}
        />
      )}
    </div>
  );
};

export default Editor;
