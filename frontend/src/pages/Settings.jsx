import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TagsModal from '../components/TagsModal';
import ApiSettings from '../components/ApiSettings';
import EditProfileModal from '../components/EditProfileModal';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import ProfilePhotoSelector from '../components/ProfilePhotoSelector';
import { getCurrentUser, logout } from '../services/authService';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  
  // State for settings
  // Load settings from localStorage or use defaults
  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('noteMindSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error('Error loading saved settings:', e);
    }
    return {
      theme: 'dark',
      fontSize: 'medium',
      notifications: true,
      autoSave: true,
      saveInterval: 30,
      defaultView: 'list',
      useFallbackSummarization: false
    };
  };
  
  const [settings, setSettings] = useState(loadSavedSettings());
  
  // State for tags modal
  const [showTagsModal, setShowTagsModal] = useState(false);
  // State for API settings modal
  const [showApiSettings, setShowApiSettings] = useState(false);
  // State for profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  // State for password update modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // State for profile photo selector modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  // State for selected tags
  const [selectedTags, setSelectedTags] = useState([]);
  // State for user data
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/80'
  });
  
  // Load user data on component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserData({
        name: user.name || 'John Doe',
        email: user.email || 'john.doe@example.com',
        avatar: user.avatar || 'https://i.pravatar.cc/80'
      });
    }
  }, []);
  
  // Handle settings changes
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    console.log('Settings saved:', settings);
    // Save to localStorage
    try {
      localStorage.setItem('noteMindSettings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };
  
  // Handle reset to defaults
  const handleResetDefaults = () => {
    const defaultSettings = {
      theme: 'dark',
      fontSize: 'medium',
      notifications: true,
      autoSave: true,
      saveInterval: 30,
      defaultView: 'list',
      useFallbackSummarization: false
    };
    
    setSettings(defaultSettings);
    
    // Also clear localStorage
    try {
      localStorage.setItem('noteMindSettings', JSON.stringify(defaultSettings));
    } catch (e) {
      console.error('Error resetting settings:', e);
    }
  };
  
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

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        <div className="app-logo">NoteMind</div>
        
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
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
          
          <div className="nav-item active">
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
          <h1>Settings</h1>
        </div>
        
        <div className="settings-container">
          {/* Appearance Section */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              <i className="fas fa-palette"></i> Appearance
            </h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <label className="settings-label">Theme</label>
                <div className="settings-options">
                  <button 
                    className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    <div className="theme-preview dark">
                      <div className="theme-preview-sidebar"></div>
                      <div className="theme-preview-content"></div>
                    </div>
                    <span>Dark</span>
                  </button>
                  
                  <button 
                    className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    <div className="theme-preview light">
                      <div className="theme-preview-sidebar"></div>
                      <div className="theme-preview-content"></div>
                    </div>
                    <span>Light</span>
                  </button>
                  
                  <button 
                    className={`theme-option ${settings.theme === 'contrast' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('theme', 'contrast')}
                  >
                    <div className="theme-preview contrast">
                      <div className="theme-preview-sidebar"></div>
                      <div className="theme-preview-content"></div>
                    </div>
                    <span>High Contrast</span>
                  </button>
                </div>
              </div>
              
              <div className="settings-item">
                <label className="settings-label">Font Size</label>
                <div className="settings-control">
                  <select 
                    value={settings.fontSize} 
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    className="settings-select"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preferences Section */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              <i className="fas fa-sliders-h"></i> Preferences
            </h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <label className="settings-label">Default View</label>
                <div className="settings-control">
                  <div className="settings-toggle-group">
                    <button 
                      className={`toggle-button ${settings.defaultView === 'list' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('defaultView', 'list')}
                    >
                      <i className="fas fa-list"></i> List
                    </button>
                    <button 
                      className={`toggle-button ${settings.defaultView === 'grid' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('defaultView', 'grid')}
                    >
                      <i className="fas fa-th-large"></i> Grid
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="settings-item">
                <div className="settings-label-group">
                  <label className="settings-label">Notifications</label>
                  <span className="settings-description">
                    Receive reminders and updates about your notes
                  </span>
                </div>
                <div className="settings-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications} 
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Editor Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              <i className="fas fa-edit"></i> Editor
            </h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-label-group">
                  <label className="settings-label">Auto-Save</label>
                  <span className="settings-description">
                    Automatically save your notes as you write
                  </span>
                </div>
                <div className="settings-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.autoSave} 
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              {settings.autoSave && (
                <div className="settings-item">
                  <label className="settings-label">Save Interval (seconds)</label>
                  <div className="settings-control">
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5" 
                      value={settings.saveInterval} 
                      onChange={(e) => handleSettingChange('saveInterval', parseInt(e.target.value))}
                      className="settings-range"
                    />
                    <span className="settings-range-value">{settings.saveInterval}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* AI Settings Section */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              <i className="fas fa-robot"></i> AI Settings
            </h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-label-group">
                  <label className="settings-label">API Configuration</label>
                  <span className="settings-description">
                    Manage OpenAI API key for AI features
                  </span>
                </div>
                <div className="settings-control">
                  <button 
                    className="api-settings-button" 
                    onClick={() => setShowApiSettings(true)}
                  >
                    <i className="fas fa-key"></i> Manage API Settings
                  </button>
                </div>
              </div>
              
              <div className="settings-item">
                <div className="settings-label-group">
                  <label className="settings-label">Fallback Summarization</label>
                  <span className="settings-description">
                    Use local summarization when API is unavailable
                  </span>
                </div>
                <div className="settings-control">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.useFallbackSummarization !== false} 
                      onChange={(e) => handleSettingChange('useFallbackSummarization', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Section */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              <i className="fas fa-user-circle"></i> Account
            </h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <div className="account-info">
                  <div className="account-avatar">
                    <img 
                      src={userData.avatar} 
                      alt={userData.name} 
                      className="avatar-image"
                      onError={(e) => {
                        // Fallback if avatar doesn't load
                        e.target.src = 'https://i.pravatar.cc/80';
                      }}
                    />
                    <button 
                      className="avatar-edit-button"
                      onClick={() => setShowPhotoModal(true)}
                      title="Browse Profile Photos"
                    >
                      <i className="fas fa-images"></i>
                    </button>
                  </div>
                  <div className="account-details">
                    <h3>{userData.name}</h3>
                    <p>{userData.email}</p>
                    <button 
                      className="edit-profile-button"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <i className="fas fa-pen"></i> Edit Profile
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="settings-item">
                <div className="settings-label-group">
                  <label className="settings-label">Change Password</label>
                </div>
                <div className="settings-control">
                  <button 
                    className="change-password-button"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <i className="fas fa-key"></i> Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="settings-actions">
            <button className="reset-button" onClick={handleResetDefaults}>
              Reset to Defaults
            </button>
            <button className="save-button" onClick={handleSaveSettings}>
              <i className="fas fa-save"></i> Save Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Tags Modal */}
      {showTagsModal && (
        <TagsModal
          onClose={() => setShowTagsModal(false)}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTags}
        />
      )}
      
      {/* API Settings Modal */}
      {showApiSettings && (
        <ApiSettings
          onClose={() => setShowApiSettings(false)}
        />
      )}
      
      {/* Edit Profile Modal */}
      {showProfileModal && (
        <EditProfileModal
          onClose={() => {
            setShowProfileModal(false);
            // Refresh user data after profile edit
            const user = getCurrentUser();
            if (user) {
              setUserData({
                name: user.name || 'John Doe',
                email: user.email || 'john.doe@example.com',
                avatar: user.avatar || 'https://i.pravatar.cc/80'
              });
            }
          }}
        />
      )}
      
      {/* Update Password Modal */}
      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      
      {/* Profile Photo Selector Modal */}
      {showPhotoModal && (
        <ProfilePhotoSelector
          currentAvatar={userData.avatar}
          onClose={() => {
            setShowPhotoModal(false);
            // Refresh user data after profile photo selection
            const user = getCurrentUser();
            if (user) {
              setUserData({
                name: user.name || 'John Doe',
                email: user.email || 'john.doe@example.com',
                avatar: user.avatar || 'https://i.pravatar.cc/80'
              });
            }
            
            // Dispatch a custom event to notify other components about avatar update
            window.dispatchEvent(new CustomEvent('avatar-updated'));
          }}
        />
      )}
    </div>
  );
};

export default Settings;
