import React, { useState, useRef } from 'react';
import { updateAvatar } from '../services/authService';
import './Modal.css';

const ProfilePhotoSelector = ({ currentAvatar, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(currentAvatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  // Categories of profile photos
  const categories = [
    { name: "Abstract", id: "abstract" },
    { name: "Animals", id: "animals" },
    { name: "Nature", id: "nature" },
    { name: "Professional", id: "professional" }
  ];
  
  const [activeCategory, setActiveCategory] = useState("abstract");
  
  // Photo collections by category
  const photoCollections = {
    abstract: [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
    ],
    animals: [
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=6',
      'https://i.pravatar.cc/150?img=7',
      'https://i.pravatar.cc/150?img=8',
    ],
    nature: [
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=10',
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=12',
    ],
    professional: [
      'https://i.pravatar.cc/150?img=13',
      'https://i.pravatar.cc/150?img=14',
      'https://i.pravatar.cc/150?img=15',
      'https://i.pravatar.cc/150?img=16',
    ]
  };
  
  const handlePhotoSelect = (url) => {
    setSelectedPhoto(url);
    setSelectedFile(null); // Clear any selected file
  };
  
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Handle file selection from device
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
    setSelectedPhoto(previewUrl);
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
    
    if (!selectedPhoto && !selectedFile) {
      setError('Please select a profile photo');
      return;
    }
    
    try {
      setLoading(true);
      
      if (selectedFile) {
        // Update with file from device
        await updateAvatar(selectedFile);
      } else {
        // Update with selected URL
        await updateAvatar(selectedPhoto);
      }
      
      setSuccess('Profile photo updated successfully!');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile photo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container photo-selector-modal">
        <div className="modal-header">
          <h2>Choose Profile Photo</h2>
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
          
          <div className="photo-preview-container">
            {selectedPhoto ? (
              <div className="photo-preview-wrapper">
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : selectedPhoto}
                  alt="Selected Profile"
                  className="photo-preview"
                />
              </div>
            ) : (
              <div className="empty-preview">
                <i className="fas fa-user"></i>
                <span>No photo selected</span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* File upload section */}
            <div className="file-upload-section">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
                id="photo-upload"
              />
              <button 
                type="button" 
                className="browse-device-button"
                onClick={triggerFileInput}
              >
                <i className="fas fa-upload"></i> Browse from Device
              </button>
            </div>

            <div className="form-divider">
              <span>or choose from samples</span>
            </div>

            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="photos-grid">
              {photoCollections[activeCategory].map((url, index) => (
                <div
                  key={index}
                  className={`photo-option ${selectedPhoto === url && !selectedFile ? 'selected' : ''}`}
                  onClick={() => handlePhotoSelect(url)}
                >
                  <img src={url} alt={`Option ${index + 1}`} />
                </div>
              ))}
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
                disabled={loading || (!selectedPhoto && !selectedFile)}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  'Set Profile Photo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;