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

    // ✅ Flexible tag handling (accepts string, string array, or object array)
    let formattedTags = [];
    if (Array.isArray(tags)) {
      formattedTags = tags.map(tag => {
        if (typeof tag === "string") {
          return { name: tag, color: "#cccccc" }; // default color
        }
        return {
          name: tag.name || "",
          color: tag.color || "#cccccc",
          id: tag.id || undefined
        };
      });
    } else if (typeof tags === "string" && tags.trim() !== "") {
      formattedTags = [{ name: tags, color: "#cccccc" }];
    }

    // ✅ Create the note
    const note = await Note.create({
      title,
      content,
      tags: formattedTags,
      color: color || "#ffffff",
      user: req.user.id,
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
    const { search, tag, sort } = req.query;
    let query = { user: req.user.id };

    // 🔍 Text search
    if (search) query.$text = { $search: search };

    // 🏷️ Filter by tag name
    if (tag) query["tags.name"] = tag;

    // 🔃 Sorting
    let sortOptions = {};
    if (sort === "title") sortOptions.title = 1;
    else if (sort === "updated") sortOptions.lastEdited = -1;
    else if (sort === "oldest") sortOptions.createdAt = 1;
    else sortOptions.createdAt = -1; // newest first

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

    // ✅ Ownership check
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

    // ✅ Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this note"
      });
    }

    const { title, content, tags, color, isPinned } = req.body;

    // ✅ Handle tags (same flexible logic as create)
    let formattedTags = [];
    if (Array.isArray(tags)) {
      formattedTags = tags.map(tag => {
        if (typeof tag === "string") {
          return { name: tag, color: "#cccccc" };
        }
        return {
          name: tag.name || "",
          color: tag.color || "#cccccc",
          id: tag.id || undefined
        };
      });
    } else if (typeof tags === "string" && tags.trim() !== "") {
      formattedTags = [{ name: tags, color: "#cccccc" }];
    }

    // ✅ Prepare update fields
    const updateFields = {
      ...(title && { title }),
      ...(content && { content }),
      ...(color && { color }),
      ...(typeof isPinned !== "undefined" && { isPinned }),
      ...(formattedTags.length && { tags: formattedTags }),
      lastEdited: Date.now()
    };

    // ✅ Update in DB
    note = await Note.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

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

    // ✅ Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this note"
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
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
 * @desc    Summarize note content using OpenAI API
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

    // ✅ Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to summarize this note"
      });
    }

    // ✅ AI summarization
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "OpenAI API key missing in environment variables"
      });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `Summarize this note in a concise paragraph:\n\n${note.content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const summary = completion.choices[0].message.content;

    note.summary = summary;
    note.lastEdited = Date.now();
    await note.save();

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error("Summarize note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during summarization",
      error: error.message
    });
  }
};