import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middleware/cors.js";
import connectDB from "./config/db.js";

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(corsMiddleware);
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

// Path for storing settings
const settingsPath = path.join(__dirname, "settings.json");

// Default settings
const defaultSettings = {
  apiKey: process.env.OPENAI_API_KEY || "",
};

// Load or create settings file
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      return settings;
    } else {
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings), "utf8");
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    return defaultSettings;
  }
};

// Save settings
const saveSettings = (settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
};

// Get AI API instance with current key
const getAI = () => {
  const settings = loadSettings();
  const apiKey = settings.apiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("No API key found in settings or environment variables");
    return null;
  }
  
  return new OpenAI({ apiKey });
};

// Import routes
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);

// API welcome route
app.get("/api", (req, res) => {
  res.json({ message: "NoteMind API is running!" });
});

// Get API settings (masked)
app.get("/api/settings", (req, res) => {
  const settings = loadSettings();
  
  // Mask the API key for security
  let maskedSettings = { ...settings };
  if (maskedSettings.apiKey) {
    maskedSettings.apiKey = `${maskedSettings.apiKey.substring(0, 5)}...${
      maskedSettings.apiKey.substring(maskedSettings.apiKey.length - 4)
    }`;
  }
  
  res.json(maskedSettings);
});

// Update API settings
app.post("/api/settings", (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: "API Key is required" });
  }
  
  const settings = loadSettings();
  settings.apiKey = apiKey;
  
  if (saveSettings(settings)) {
    res.json({ message: "Settings saved successfully" });
  } else {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// Test the API connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const openai = getAI();
    
    if (!openai) {
      return res.status(500).json({
        success: false,
        error: "API key not configured"
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
    });
    
    const text = completion.choices[0].message.content;
    
    res.json({
      success: true,
      message: `API connection successful. Response: ${text}`,
    });
  } catch (error) {
    console.error("API test error:", error);
    res.status(500).json({
      success: false,
      error: `API connection failed: ${error.message}`,
    });
  }
});

app.post("/api/summarize", async (req, res) => {
  console.log("Received summarize request");
  try {
    const { text, prompt } = req.body;
    console.log("Text length:", text ? text.length : 0);
    
    if (!text || text.trim() === '') {
      console.log("Error: Empty text provided");
      return res.status(400).json({ error: "Text is required for summarization" });
    }
    
    const userPrompt = prompt || `Summarize this text concisely: ${text}`;
    console.log("Using prompt:", userPrompt.substring(0, 50) + "...");
    
    const openai = getAI();
    
    if (!openai) {
      console.log("Error: OpenAI API key not configured");
      return res.status(500).json({ 
        error: "OpenAI API key not configured",
        details: "Please set your OpenAI API key in the settings.",
        code: "NO_API_KEY"
      });
    }
    
    console.log("Making request to OpenAI API");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    console.log("Received response from OpenAI");
    const summary = completion.choices[0].message.content;
    
    if (!summary) {
      console.log("Error: Empty summary from API");
      return res.status(500).json({ error: "No response from AI service" });
    }
    
    console.log("Sending summary to client");
    res.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    
    // Handle specific OpenAI API errors
    if (error.message && error.message.includes("401")) {
      return res.status(401).json({
        error: "Invalid OpenAI API key",
        details: "The provided OpenAI API key is invalid or expired. Please check your API key configuration.",
        code: "INVALID_API_KEY"
      });
    }
    
    // Check for quota exceeded error
    if (error.message && (error.message.includes("exceeded") || error.message.includes("quota"))) {
      return res.status(429).json({
        error: "API quota exceeded",
        details: "The OpenAI API quota has been exceeded. Please check your billing and usage limits.",
        code: "QUOTA_EXCEEDED"
      });
    }
    
    // Handle rate limiting
    if (error.message && error.message.includes("rate limit")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: "Too many requests to the OpenAI API. Please try again in a moment.",
        code: "RATE_LIMITED"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to summarize text", 
      details: error.message,
      code: "UNKNOWN_ERROR"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI API running on http://localhost:${PORT}`);
  console.log('Server is bound to all network interfaces');
});
