/**
 * Authentication service for NoteMind
 * Handles registration, login, and user management
 */
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';
const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} - Response with token and user data
 */
export const register = async (userData) => {
  try {
    console.log('Sending registration request to:', `${AUTH_ENDPOINT}/register`);
    console.log('With data:', { name: userData.name, email: userData.email, password: '******' });
    
    const response = await axios.post(`${AUTH_ENDPOINT}/register`, userData);
    
    if (response.data.success && response.data.token) {
      // Store auth token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Store user data (but not password)
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Registration successful:', user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Log in an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Response with token and user data
 */
export const login = async (email, password) => {
  try {
    console.log('Sending login request to:', `${AUTH_ENDPOINT}/login`);
    console.log('With email:', email);
    
    const response = await axios.post(`${AUTH_ENDPOINT}/login`, { email, password });
    
    if (response.data.success && response.data.token) {
      // Store auth token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Store user data
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login successful:', user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Call backend to invalidate token
  return axios.get(`${AUTH_ENDPOINT}/logout`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  }).catch(error => {
    console.error('Logout error:', error);
    // Still remove local tokens even if the server call fails
  });
};

/**
 * Get the current authenticated user
 * @returns {Object|null} - User object or null if not authenticated
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if a user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get the authentication token
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get authorization header
 * @returns {Object} - Header object with Authorization
 */
export const getAuthHeader = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user
 */
export const updateProfile = async (userData) => {
  try {
    const response = await axios.put(`${AUTH_ENDPOINT}/updatedetails`, userData, {
      headers: getAuthHeader()
    });
    
    if (response.data.success) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

/**
 * Update profile photo
 * @param {string|File} photoInput - URL of the selected profile photo or File object
 * @returns {Promise<Object>} - Updated user
 */
export const updateAvatar = async (photoInput) => {
  try {
    // Check if input is a File object from device
    if (photoInput instanceof File) {
      // Convert file to data URL for storage
      const reader = new FileReader();
      
      // Create a promise to handle the async FileReader
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(photoInput);
      });
      
      // Update with the data URL (base64)
      const response = await axios.put(
        `${AUTH_ENDPOINT}/updatedetails`,
        { avatar: fileData },
        { headers: getAuthHeader() }
      );
      
      if (response.data.success) {
        // Update stored user data
        const user = getCurrentUser();
        if (user) {
          const updatedUser = {
            ...user,
            avatar: response.data.data.avatar || fileData
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response.data;
    } else {
      // It's a URL string
      const response = await axios.put(
        `${AUTH_ENDPOINT}/updatedetails`,
        { avatar: photoInput },
        { headers: getAuthHeader() }
      );
      
      if (response.data.success) {
        // Update stored user data
        const user = getCurrentUser();
        if (user) {
          const updatedUser = {
            ...user,
            avatar: response.data.data.avatar || photoInput
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response.data;
    }
  } catch (error) {
    console.error('Profile photo update error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  getAuthHeader,
  updateProfile,
  updateAvatar
};