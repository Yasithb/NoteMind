import Note from "../models/Note.js";
import OpenAI from "openai";

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
export const createNote = async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;

    // Create note in MongoDB
    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      color: color || "#ffffff",
      user: req.user.id, // From auth middleware
      isPinned: false,
      summary: ""
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when creating note",
      error: error.message
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
    
    // Build query
    let query = { user: req.user.id };
    
    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Add tag filter if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Build sort object
    let sortOptions = {};
    if (sort === 'title') {
      sortOptions.title = 1; // Ascending
    } else if (sort === 'updated') {
      sortOptions.lastEdited = -1; // Descending
    } else if (sort === 'oldest') {
      sortOptions.createdAt = 1; // Ascending
    } else {
      // Default: newest first
      sortOptions.createdAt = -1; // Descending
    }
    
    // Execute query with sort
    const userNotes = await Note.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: userNotes.length,
      data: userNotes
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving notes",
      error: error.message
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
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
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
      message: "Server error when retrieving note",
      error: error.message
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
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this note"
      });
    }

    // Update note with new data and set lastEdited timestamp
    req.body.lastEdited = Date.now();
    
    note = await Note.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    );

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when updating note",
      error: error.message
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
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this note"
      });
    }

    // Remove note from database
    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when deleting note",
      error: error.message
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
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to summarize this note"
      });
    }

    // Generate summary using OpenAI API
    try {
      // Get API key from environment variables
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: "API key not found in environment variables"
        });
      }
      
      // Initialize OpenAI
      const openai = new OpenAI({ apiKey });
      
      // Generate prompt for summarization
      const prompt = `Summarize this note in a concise paragraph: ${note.content}`;
      
      // Generate summary using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      
      const summary = completion.choices[0].message.content;
      
      // Update note with summary in database
      note.summary = summary;
      note.lastEdited = Date.now();
      await note.save();
      
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
      message: "Server error when processing note for summarization",
      error: error.message
    });
  }
};