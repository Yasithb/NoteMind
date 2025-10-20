/**
 * Tag service for NoteMind
 * Handles operations related to tags
 */
import axios from 'axios';
import { getAuthHeader } from './authService';

const API_BASE_URL = 'http://127.0.0.1:5000/api';
const TAGS_ENDPOINT = `${API_BASE_URL}/tags`;

/**
 * Get all tags for the current user
 * @returns {Promise<Array>} - Array of tags
 */
export const getTags = async () => {
  try {
    const response = await axios.get(TAGS_ENDPOINT, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @param {string} tagData.name - Tag name
 * @param {string} tagData.color - Tag color (hex)
 * @returns {Promise<Object>} - Created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await axios.post(TAGS_ENDPOINT, tagData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating tag:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing tag
 * @param {string} tagId - Tag ID
 * @param {Object} tagData - Tag data to update
 * @returns {Promise<Object>} - Updated tag
 */
export const updateTag = async (tagId, tagData) => {
  try {
    const response = await axios.put(`${TAGS_ENDPOINT}/${tagId}`, tagData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating tag:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a tag
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} - API response
 */
export const deleteTag = async (tagId) => {
  try {
    const response = await axios.delete(`${TAGS_ENDPOINT}/${tagId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting tag:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Add a tag to a note
 * @param {string} noteId - Note ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} - Updated note
 */
export const addTagToNote = async (noteId, tagId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notes/${noteId}/tags/${tagId}`, {}, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding tag to note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Remove a tag from a note
 * @param {string} noteId - Note ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} - Updated note
 */
export const removeTagFromNote = async (noteId, tagId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/notes/${noteId}/tags/${tagId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error removing tag from note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all notes with a specific tag
 * @param {string} tagId - Tag ID
 * @returns {Promise<Array>} - Array of notes with the tag
 */
export const getNotesByTag = async (tagId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tags/${tagId}/notes`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notes by tag:', error.response?.data || error.message);
    throw error;
  }
};

// Fallback with local storage for offline functionality
export const getLocalTags = () => {
  try {
    const localTags = localStorage.getItem('noteMindTags');
    return localTags ? JSON.parse(localTags) : [];
  } catch (error) {
    console.error('Error getting local tags:', error);
    return [];
  }
};

export const saveLocalTags = (tags) => {
  try {
    localStorage.setItem('noteMindTags', JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving local tags:', error);
  }
};

export default {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  addTagToNote,
  removeTagFromNote,
  getNotesByTag,
  getLocalTags,
  saveLocalTags
};