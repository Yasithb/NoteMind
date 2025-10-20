import React, { useState, useEffect } from 'react';
import { getTags, createTag, deleteTag, saveLocalTags, getLocalTags } from '../services/tagService';
import './TagsModal.css';

const TagsModal = ({ onClose, onTagSelect, selectedTags = [] }) => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#05D7B3');
  const [selectedTagIds, setSelectedTagIds] = useState(
    selectedTags.map(tag => tag.id)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load tags from the backend or local storage
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get tags from the backend
        const response = await getTags();
        
        if (response && response.success) {
          setTags(response.data);
          // Also save to local storage for offline use
          saveLocalTags(response.data);
        } else {
          // If backend call fails, try local storage
          const localTags = getLocalTags();
          setTags(localTags);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
        
        // Fallback to local storage
        const localTags = getLocalTags();
        setTags(localTags.length ? localTags : [
          { id: 1, name: 'Work', color: '#FF5733' },
          { id: 2, name: 'Personal', color: '#33FF57' },
          { id: 3, name: 'Study', color: '#3357FF' },
          { id: 4, name: 'Health', color: '#FF33A8' },
          { id: 5, name: 'Finance', color: '#33FFF3' },
          { id: 6, name: 'Travel', color: '#F3FF33' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, []);

  // Select or deselect a tag
  const handleTagSelection = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // Add a new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const tagData = {
        name: newTagName.trim(),
        color: newTagColor
      };
      
      // Try to create the tag in the backend
      const response = await createTag(tagData);
      
      if (response && response.success) {
        const newTag = response.data;
        setTags([...tags, newTag]);
        // Update local storage
        saveLocalTags([...tags, newTag]);
      } else {
        // Fallback for offline mode or errors
        const newTag = {
          id: `local_${Date.now()}`, // Use a timestamp as temporary ID
          name: newTagName.trim(),
          color: newTagColor,
          isLocal: true // Mark as local
        };
        
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        saveLocalTags(updatedTags);
      }
      
      setNewTagName('');
    } catch (err) {
      console.error('Error adding tag:', err);
      
      // Fallback for offline mode
      const newTag = {
        id: `local_${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
        isLocal: true
      };
      
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      saveLocalTags(updatedTags);
      
      setNewTagName('');
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId) => {
    try {
      // Check if it's a local tag (not synced with backend)
      const isLocalTag = String(tagId).startsWith('local_');
      
      if (!isLocalTag) {
        // Try to delete from backend
        const response = await deleteTag(tagId);
        
        if (!response || !response.success) {
          console.error('Backend delete failed, removing locally only');
        }
      }
      
      // Always remove from local state
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      setTags(updatedTags);
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
      
      // Update local storage
      saveLocalTags(updatedTags);
    } catch (err) {
      console.error('Error deleting tag:', err);
      
      // Still remove from local state on error
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      setTags(updatedTags);
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
      
      // Update local storage
      saveLocalTags(updatedTags);
    }
  };

  // Apply tag selection
  const handleApply = () => {
    const selectedTagsData = tags.filter(tag => selectedTagIds.includes(tag.id));
    onTagSelect(selectedTagsData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="tags-modal">
        <div className="modal-header">
          <h2>Manage Tags</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <div className="tags-section">
            <h3>Your Tags</h3>
            
            <div className="tags-container">
              {isLoading ? (
                <div className="loading-tags">
                  <i className="fas fa-spinner fa-spin"></i> Loading tags...
                </div>
              ) : error ? (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              ) : tags.length === 0 ? (
                <div className="no-tags-message">
                  <i className="fas fa-tag"></i> You don't have any tags yet. Create your first tag below!
                </div>
              ) : (
                tags.map(tag => (
                  <div 
                    key={tag.id} 
                    className={`tag-item ${selectedTagIds.includes(tag.id) ? 'selected' : ''} ${tag.isLocal ? 'local-tag' : ''}`}
                  >
                    <div 
                      className="tag-color" 
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="tag-name">
                      {tag.name}
                      {tag.isLocal && <small className="local-indicator"> (local)</small>}
                    </span>
                    <div className="tag-actions">
                      <button 
                        className="tag-select-btn"
                        onClick={() => handleTagSelection(tag.id)}
                      >
                        {selectedTagIds.includes(tag.id) ? (
                          <i className="fas fa-check-square"></i>
                        ) : (
                          <i className="far fa-square"></i>
                        )}
                      </button>
                      <button 
                        className="tag-delete-btn"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="add-tag-section">
            <h3>Create New Tag</h3>
            
            <div className="add-tag-form">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>
              
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  <input 
                    type="color" 
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                  />
                  <span className="color-preview" style={{ backgroundColor: newTagColor }}></span>
                </div>
              </div>
              
              <button 
                className="add-tag-button"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
              >
                <i className="fas fa-plus"></i> Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="apply-button" onClick={handleApply}>
            <i className="fas fa-check"></i> Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsModal;