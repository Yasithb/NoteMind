import jwt from "jsonwebtoken";
import users from "../utils/staticUsers.js";

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request object
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
    } 
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // If no token found, return unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route"
      });
    }

    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable not set");
      }
      
      const decoded = jwt.verify(token, jwtSecret);

      // Get user from in-memory users array
      const user = users.find(u => u.id === decoded.id);

      // If user not found, return unauthorized error
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found with this id"
        });
      }

      // Update last active timestamp
      user.lastActive = Date.now();

      // Attach user to request
      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route"
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication"
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};