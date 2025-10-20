import Tag from "../models/Tag.js";

/**
 * @desc    Create a new tag
 * @route   POST /api/tags
 * @access  Private
 */
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Check if tag with same name exists for this user
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') }, 
      user: req.user.id 
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "You already have a tag with this name"
      });
    }

    // Create tag in MongoDB
    const tag = await Tag.create({
      name,
      color: color || "#05D7B3", // Default color
      user: req.user.id // From auth middleware
    });

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when creating tag",
      error: error.message
    });
  }
};

/**
 * @desc    Get all tags for a user
 * @route   GET /api/tags
 * @access  Private
 */
export const getTags = async (req, res) => {
  try {
    // Get query parameters
    const { search } = req.query;
    
    // Build query
    let query = { user: req.user.id };
    
    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Get all tags for this user, sorted alphabetically
    const userTags = await Tag.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: userTags.length,
      data: userTags
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving tags",
      error: error.message
    });
  }
};

/**
 * @desc    Get a single tag
 * @route   GET /api/tags/:id
 * @access  Private
 */
export const getTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Make sure user owns the tag
    if (tag.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this tag"
      });
    }

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error("Get tag error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving tag",
      error: error.message
    });
  }
};

/**
 * @desc    Update tag
 * @route   PUT /api/tags/:id
 * @access  Private
 */
export const updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    let tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Make sure user owns the tag
    if (tag.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this tag"
      });
    }

    // If name is changing, check if the new name already exists for this user
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name: { $regex: new RegExp('^' + name + '$', 'i') }, 
        user: req.user.id,
        _id: { $ne: req.params.id } // Exclude current tag
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "You already have a tag with this name"
        });
      }
    }

    // Update tag
    tag = await Tag.findByIdAndUpdate(
      req.params.id, 
      { name: name || tag.name, color: color || tag.color }, 
      {
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    );

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when updating tag",
      error: error.message
    });
  }
};

/**
 * @desc    Delete tag
 * @route   DELETE /api/tags/:id
 * @access  Private
 */
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Make sure user owns the tag
    if (tag.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this tag"
      });
    }

    // Remove tag from database
    await tag.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when deleting tag",
      error: error.message
    });
  }
};