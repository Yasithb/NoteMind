import React, { useState, useRef } from 'react';
import { updateAvatar } from '../services/authService';
import './Modal.css';

const AvatarUploadModal = ({ currentAvatar, onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  // List of sample avatar URLs
  const sampleAvatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
  ];
  
  const handleAvatarSelect = (url) => {
    setAvatarUrl(url);
    setSelectedFile(null); // Clear any selected file
  };
  
  const handleCustomUrlChange = (e) => {
    setAvatarUrl(e.target.value);
    setSelectedFile(null); // Clear any selected file
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    // Clear any previous error
    setError('');
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    if (!avatarUrl && !selectedFile) {
      setError('Please select an avatar image');
      return;
    }
    
    try {
      setLoading(true);
      
      if (selectedFile) {
        // Update avatar with file upload
        await updateAvatar(selectedFile);
      } else {
        // Update avatar with URL
        await updateAvatar(avatarUrl);
      }
      
      setSuccess('Avatar updated successfully!');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update avatar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Update Avatar</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}
          
          <div className="avatar-preview-container">
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="avatar-preview"
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* File upload section */}
            <div className="form-group">
              <label>Upload Image</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
                <button 
                  type="button" 
                  className="file-upload-button"
                  onClick={triggerFileInput}
                >
                  <i className="fas fa-upload"></i> Choose File
                </button>
                <span className="file-name">
                  {selectedFile ? selectedFile.name : 'No file selected'}
                </span>
              </div>
              <div className="file-upload-info">
                Max size: 2MB. Supported formats: JPG, PNG, GIF
              </div>
            </div>
            
            <div className="form-divider">
              <span>OR</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="avatarUrl">Custom Avatar URL</label>
              <input
                type="url"
                id="avatarUrl"
                value={selectedFile ? '' : avatarUrl}
                onChange={handleCustomUrlChange}
                placeholder="https://example.com/avatar.jpg"
                disabled={!!selectedFile}
              />
            </div>
            
            <div className="avatar-samples">
              <label>Select from samples:</label>
              <div className="avatar-grid">
                {sampleAvatars.map((url, index) => (
                  <div
                    key={index}
                    className={`avatar-option ${avatarUrl === url && !selectedFile ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(url)}
                  >
                    <img src={url} alt={`Sample ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  'Set Avatar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;