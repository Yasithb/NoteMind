import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TagsModal from '../components/TagsModal';
import TagBadge from '../components/TagBadge';
import useAvatar from '../hooks/useAvatar';
import { logout } from '../services/authService';
import { getNotes } from '../services/noteService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');
  // State for view type (list or grid)
  const [viewType, setViewType] = useState('list');
  // State for tags modal
  const [showTagsModal, setShowTagsModal] = useState(false);
  // State for selected tags
  const [selectedTags, setSelectedTags] = useState([]);
  // State for notes
  const [notes, setNotes] = useState([]);
  // State for loading state
  const [isLoading, setIsLoading] = useState(true);
  // State for error message
  const [error, setError] = useState(null);
  // Use our custom avatar hook
  const [userAvatar] = useAvatar('https://i.pravatar.cc/40');
  
  // Fetch notes from the API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get sort option from local storage if available
        const savedSettings = JSON.parse(localStorage.getItem('noteMindSettings') || '{}');
        const sortOption = savedSettings.defaultSort || 'updated';
        
        const response = await getNotes({ sort: sortOption });
        
        if (response.success) {
          setNotes(response.data);
        } else {
          setError('Failed to load notes');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Error fetching notes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);
  
  // Handle tag selection
  const handleTagSelect = (tags) => {
    setSelectedTags(tags);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login page even if server-side logout fails
      navigate('/');
    }
  };
  
  // Filter notes by selected tags and search query
  const getFilteredNotes = () => {
    if (!notes.length) return [];
    
    // First filter by tags if any are selected
    let filteredNotes = notes;
    
    if (selectedTags.length > 0) {
      const selectedTagIds = selectedTags.map(tag => tag.id);
      filteredNotes = filteredNotes.filter(note => 
        note.tags && note.tags.some(tag => selectedTagIds.includes(tag.id))
      );
    }
    
    // Then filter by search query if any
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }
    
    return filteredNotes;
  };
  
  // Format the date for display
  const formatDateRelative = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        <div className="app-logo">NoteMind</div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">
              <i className="fas fa-file-alt"></i>
            </span>
            <span className="nav-text">Notes</span>
          </div>
          
          <div 
            className={`nav-item ${selectedTags.length > 0 ? 'active' : ''}`}
            onClick={() => setShowTagsModal(true)}
          >
            <span className="nav-icon">
              <i className="fas fa-tag"></i>
            </span>
            <span className="nav-text">Tags</span>
            {selectedTags.length > 0 && (
              <span className="tag-count">{selectedTags.length}</span>
            )}
          </div>
          
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-icon">
              <i className="fas fa-cog"></i>
            </span>
            <span className="nav-text">Settings</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">
              <i className="fas fa-sign-out-alt"></i>
            </span>
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="main-header">
          <h1>Notes</h1>
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
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="view-options">
          <div 
            className={`view-option ${viewType === 'list' ? 'active' : ''}`}
            onClick={() => setViewType('list')}
          >
            <i className="fas fa-list"></i> List
          </div>
          <div 
            className={`view-option ${viewType === 'grid' ? 'active' : ''}`}
            onClick={() => setViewType('grid')}
          >
            <i className="fas fa-th-large"></i> Grid
          </div>
        </div>
        
        <div className={`notes-container ${viewType}`}>
          {isLoading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading your notes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : getFilteredNotes().length > 0 ? (
            getFilteredNotes().map(note => (
              <div 
                className="note-card" 
                key={note._id}
                onClick={() => navigate(`/editor/${note._id}`)}
              >
                <div className="note-content">
                  <div className="note-updated">
                    Updated {formatDateRelative(note.lastEdited || note.createdAt)}
                  </div>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-description">
                    {note.content.length > 150 
                      ? `${note.content.substring(0, 150).trim()}...` 
                      : note.content}
                  </p>
                  <div className="note-tags">
                    {note.tags && note.tags.map(tag => (
                      <TagBadge 
                        key={tag.id} 
                        tag={tag}
                      />
                    ))}
                  </div>
                </div>
                <div className="note-thumbnail">
                  <div 
                    className="thumbnail-placeholder"
                    style={{ backgroundColor: note.color || '#ffffff' }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="fas fa-file-alt"></i>
              <p>No notes found</p>
              {searchQuery || selectedTags.length > 0 ? (
                <p className="empty-state-subtitle">Try changing your search or filters</p>
              ) : (
                <button 
                  className="create-first-note-button"
                  onClick={() => navigate('/editor')}
                >
                  Create your first note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Note Button */}
      <button 
        className="create-note-button"
        onClick={() => navigate('/editor')}
        title="Create New Note"
      >
        <i className="fas fa-plus"></i>
      </button>
      
      {/* Tags Modal */}
      {showTagsModal && (
        <TagsModal
          onClose={() => setShowTagsModal(false)}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTags}
        />
      )}
    </div>
  );
};

export default Dashboard;
