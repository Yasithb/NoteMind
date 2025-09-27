import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../utils/staticUsers.js";
import crypto from "crypto";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (in-memory only)
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(newUser);

    // Generate token
    const token = generateAuthToken(newUser);

    // Send response with cookie
    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = users.find(user => user.email === email);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Send response with cookie
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // Clear JWT cookie
    res.cookie("jwt", "", {
      expires: new Date(0),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged out"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // User is already available in req due to the protect middleware
    const user = req.user;

    // Don't return the password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when retrieving user profile"
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
export const updateDetails = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update user details
    if (name) users[userIndex].name = name;
    if (email) {
      // Check if email is already in use by another user
      const emailExists = users.some(u => u.email === email && u.id !== req.user.id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
      users[userIndex].email = email;
    }

    // Don't return the password
    const updatedUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt
    };

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when updating user profile"
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Set new password
    users[userIndex].password = hashedPassword;

    // Don't return the password
    const updatedUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt
    };

    // Send new token
    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when updating password"
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "There is no user with that email"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Store token with user (in-memory only)
    users[userIndex].passwordResetToken = resetPasswordToken;
    users[userIndex].passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`;

    // In a production app, send an email with the reset URL
    // For now, just return the reset token in the response
    res.status(200).json({
      success: true,
      message: "Password reset token sent",
      resetToken,
      resetUrl
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    
    res.status(500).json({
      success: false,
      message: "Server error when processing forgot password request"
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    // Find user by reset token and check if token is expired
    const userIndex = users.findIndex(
      u => u.passwordResetToken === resetPasswordToken && u.passwordResetExpires > Date.now()
    );

    if (userIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Set new password and clear reset token
    users[userIndex].password = hashedPassword;
    users[userIndex].passwordResetToken = undefined;
    users[userIndex].passwordResetExpires = undefined;

    const updatedUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt
    };

    // Send token response
    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when resetting password"
    });
  }
};

/**
 * Generate JSON Web Token
 */
const generateAuthToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable not set");
  }
  
  return jwt.sign({ id: user.id }, jwtSecret, {
    expiresIn: "30d" // Token expires in 30 days
  });
};

/**
 * Helper function to create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateAuthToken(user);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ), // 30 days
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Send cookie and response
  res
    .status(statusCode)
    .cookie("jwt", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
};