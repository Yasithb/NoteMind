import notes from "../utils/staticNotes.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
export const createNote = async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;

    // Create a new note object
    const note = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags || [],
      color: color || "#ffffff",
      user: req.user.id, // From auth middleware
      isPinned: false,
      summary: "",
      lastEdited: new Date(),
      createdAt: new Date()
    };

    // Add to notes array
    notes.push(note);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when creating note"
    });
  }
};

/**
 * @desc    Get all notes for a user
 * @route   GET /api/notes
 * @access  Private
 */
export const getNotes = async (req, res) => {
  try {
    // Get query parameters
    const { search, tag, sort } = req.query;
    
    // Filter notes by user
    let userNotes = notes.filter(note => note.user === req.user.id);
    
    // Add search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      userNotes = userNotes.filter(note => 
        note.title.toLowerCase().includes(searchLower) || 
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Add tag filter if provided
    if (tag) {
      userNotes = userNotes.filter(note => 
        note.tags.includes(tag)
      );
    }
    
    // Sort notes
    if (sort === 'title') {
      userNotes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'updated') {
      userNotes.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
    } else if (sort === 'oldest') {
      userNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: newest first
      userNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: userNotes.length,
      data: userNotes
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving notes"
    });
  }
};

/**
 * @desc    Get a single note
 * @route   GET /api/notes/:id
 * @access  Private
 */
export const getNote = async (req, res) => {
  try {
    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this note"
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving note"
    });
  }
};

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
export const updateNote = async (req, res) => {
  try {
    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (notes[noteIndex].user !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this note"
      });
    }

    // Update note fields
    const updatedNote = {
      ...notes[noteIndex],
      ...req.body,
      lastEdited: new Date()
    };

    // Replace note in array
    notes[noteIndex] = updatedNote;

    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when updating note"
    });
  }
};

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
export const deleteNote = async (req, res) => {
  try {
    const noteIndex = notes.findIndex(n => n.id === req.params.id);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (notes[noteIndex].user !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this note"
      });
    }

    // Remove note from array
    notes.splice(noteIndex, 1);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when deleting note"
    });
  }
};

/**
 * @desc    Summarize note content using AI
 * @route   POST /api/notes/:id/summarize
 * @access  Private
 */
export const summarizeNote = async (req, res) => {
  try {
    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to summarize this note"
      });
    }

    // Generate summary using Gemini API
    try {
      // Get API key from environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: "API key not found in environment variables"
        });
      }
      
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Generate prompt for summarization
      const prompt = `Summarize this note in a concise paragraph: ${note.content}`;
      
      // Generate summary
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      
      // Update note with summary
      const noteIndex = notes.findIndex(n => n.id === req.params.id);
      notes[noteIndex].summary = summary;
      
      res.status(200).json({
        success: true,
        data: {
          summary
        }
      });
    } catch (error) {
      console.error("AI summarization error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to summarize note with AI",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Summarize note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when processing note for summarization"
    });
  }
};