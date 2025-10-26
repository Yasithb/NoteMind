import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import connectDB from "./config/db.js";
import corsMiddleware from "./middleware/cors.js";

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ✅ Global Middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve static files (uploads folder)
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// ✅ Load or create settings.json
const settingsPath = path.join(__dirname, "settings.json");

const defaultSettings = {
  apiKey: process.env.OPENAI_API_KEY || "",
};

const loadSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8");
      return JSON.parse(data);
    } else {
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings), "utf8");
      return defaultSettings;
    }
  } catch (error) {
    console.error("⚠️ Error loading settings:", error.message);
    return defaultSettings;
  }
};

const saveSettings = (settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("⚠️ Error saving settings:", error.message);
    return false;
  }
};

// ✅ Get OpenAI API instance dynamically
const getAI = () => {
  const settings = loadSettings();
  const apiKey = settings.apiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ No API key found in settings or environment variables");
    return null;
  }

  return new OpenAI({ apiKey });
};

// ✅ Import Routes
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);

// ✅ Root API Endpoint
app.get("/api", (req, res) => {
  res.json({ message: "✅ NoteMind API is running!" });
});

// ✅ Get masked API settings
app.get("/api/settings", (req, res) => {
  const settings = loadSettings();
  let maskedSettings = { ...settings };

  if (maskedSettings.apiKey) {
    maskedSettings.apiKey = `${maskedSettings.apiKey.substring(0, 5)}...${maskedSettings.apiKey.slice(-4)}`;
  }

  res.json(maskedSettings);
});

// ✅ Update API key settings
app.post("/api/settings", (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API Key is required" });
  }

  const settings = loadSettings();
  settings.apiKey = apiKey;

  if (saveSettings(settings)) {
    res.json({ message: "✅ Settings saved successfully" });
  } else {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// ✅ Test OpenAI API Connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const openai = getAI();

    if (!openai) {
      return res.status(500).json({
        success: false,
        error: "API key not configured",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
    });

    const text = completion.choices[0].message.content;

    res.json({
      success: true,
      message: `✅ API connection successful. Response: ${text}`,
    });
  } catch (error) {
    console.error("API test error:", error);
    res.status(500).json({
      success: false,
      error: `❌ API connection failed: ${error.message}`,
    });
  }
});

// ✅ Summarize text via OpenAI
app.post("/api/summarize", async (req, res) => {
  console.log("🧠 Received summarize request");

  try {
    const { text, prompt } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for summarization" });
    }

    const openai = getAI();
    if (!openai) {
      return res.status(500).json({
        error: "OpenAI API key not configured",
        details: "Please set your OpenAI API key in the settings.",
        code: "NO_API_KEY",
      });
    }

    const userPrompt = prompt || `Summarize this text concisely: ${text}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    if (!summary) {
      return res.status(500).json({ error: "No response from AI service" });
    }

    res.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);

    // Handle specific OpenAI API errors
    if (error.message.includes("401")) {
      return res.status(401).json({
        error: "Invalid OpenAI API key",
        details: "The provided key is invalid or expired.",
        code: "INVALID_API_KEY",
      });
    }

    if (error.message.includes("quota") || error.message.includes("exceeded")) {
      return res.status(429).json({
        error: "API quota exceeded",
        details: "Check your OpenAI usage and billing.",
        code: "QUOTA_EXCEEDED",
      });
    }

    if (error.message.includes("rate limit")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: "Too many requests — try again later.",
        code: "RATE_LIMITED",
      });
    }

    res.status(500).json({
      error: "Failed to summarize text",
      details: error.message,
      code: "UNKNOWN_ERROR",
    });
  }
});

// ✅ Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ✅ Global error handler (in case any unhandled exceptions occur)
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NoteMind API running at http://localhost:${PORT}`);
  console.log("🌐 Server bound to all network interfaces");
});
