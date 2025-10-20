import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxlength: [50, "Tag name cannot be more than 50 characters"]
    },
    color: {
      type: String,
      default: "#05D7B3" // Default teal color
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Add text index for search
TagSchema.index({ name: 'text' });

export default mongoose.model("Tag", TagSchema);