import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    maxlength: [30, "Name cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false // Don't return password in queries
  },
  avatar: {
    type: String,
    default: "https://i.pravatar.cc/300" // Default avatar URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified("password")) return next();

  // Hash password with a salt of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JSON Web Token
userSchema.methods.generateAuthToken = function() {
  // Generate JWT token with user id
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable not set");
  }
  
  return jwt.sign({ id: this._id }, jwtSecret, {
    expiresIn: "30d" // Token expires in 30 days
  });
};

// Create a method for generating password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expiry time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;