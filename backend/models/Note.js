import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"]
    },
    content: {
      type: String,
      required: [true, "Content is required"]
    },
    summary: {
      type: String,
      default: ""
    },
    tags: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
      },
      name: String,
      color: String
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "#ffffff" // Default white color
    },
    lastEdited: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Add text index for search functionality
NoteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model("Note", NoteSchema);