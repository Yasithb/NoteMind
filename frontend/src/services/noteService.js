/**
 * Note service for NoteMind
 * Handles CRUD operations for notes
 */
import axios from 'axios';
import { getAuthHeader } from './authService';

const API_BASE_URL = 'http://127.0.0.1:5000/api';
const NOTES_ENDPOINT = `${API_BASE_URL}/notes`;

/**
 * Create a new note
 * @param {Object} noteData - Note data object
 * @param {string} noteData.title - Note title
 * @param {string} noteData.content - Note content
 * @param {Array} [noteData.tags] - Array of tag IDs
 * @param {string} [noteData.color] - Note color (hex)
 * @returns {Promise<Object>} - Created note
 */
export const createNote = async (noteData) => {
  try {
    const response = await axios.post(NOTES_ENDPOINT, noteData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all notes for current user
 * @param {Object} [options] - Query parameters
 * @param {string} [options.search] - Search term
 * @param {string} [options.tag] - Filter by tag ID
 * @param {string} [options.sort] - Sort option (title, updated, oldest)
 * @returns {Promise<Array>} - Array of notes
 */
export const getNotes = async (options = {}) => {
  try {
    // Build query string from options
    const queryParams = new URLSearchParams();
    if (options.search) queryParams.append('search', options.search);
    if (options.tag) queryParams.append('tag', options.tag);
    if (options.sort) queryParams.append('sort', options.sort);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${NOTES_ENDPOINT}?${queryString}` : NOTES_ENDPOINT;
    
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a single note by ID
 * @param {string} noteId - Note ID
 * @returns {Promise<Object>} - Note object
 */
export const getNote = async (noteId) => {
  try {
    const response = await axios.get(`${NOTES_ENDPOINT}/${noteId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing note
 * @param {string} noteId - Note ID
 * @param {Object} noteData - Note data to update
 * @returns {Promise<Object>} - Updated note
 */
export const updateNote = async (noteId, noteData) => {
  try {
    const response = await axios.put(`${NOTES_ENDPOINT}/${noteId}`, noteData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a note
 * @param {string} noteId - Note ID
 * @returns {Promise<Object>} - API response
 */
export const deleteNote = async (noteId) => {
  try {
    const response = await axios.delete(`${NOTES_ENDPOINT}/${noteId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting note:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Generate a summary for a note using AI
 * @param {string} noteId - Note ID
 * @returns {Promise<Object>} - Summary response
 */
export const summarizeNote = async (noteId) => {
  try {
    const response = await axios.post(`${NOTES_ENDPOINT}/${noteId}/summarize`, {}, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error summarizing note:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  summarizeNote
};