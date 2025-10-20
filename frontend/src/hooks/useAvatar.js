import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../services/authService';

/**
 * Custom hook for loading and managing the current user's avatar
 * @param {string} defaultAvatar - Default avatar URL if none is found
 * @returns {[string, Function]} - [avatarUrl, refreshAvatar] tuple
 */
const useAvatar = (defaultAvatar = 'https://i.pravatar.cc/40') => {
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  
  // Function to refresh the avatar from user data
  const refreshAvatar = useCallback(() => {
    const user = getCurrentUser();
    if (user && user.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, []);
  
  // Load avatar when component mounts
  useEffect(() => {
    refreshAvatar();
    
    // Listen for avatar update events
    const handleAvatarUpdate = () => {
      refreshAvatar();
    };
    
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [refreshAvatar]);
  
  return [avatarUrl, refreshAvatar];
};

export default useAvatar;