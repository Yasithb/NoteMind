import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY in environment variables");
  process.exit(1);
}

console.log("API Key found:", apiKey.substring(0, 10) + "...");

const client = new OpenAI({ apiKey });

async function testSummarization() {
  try {
    console.log("Testing summarization...");
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Summarize this text: This is a test." }],
      max_tokens: 100
    });
    
    console.log("Response received:", response.choices[0].message.content);
  } catch (error) {
    console.error("API Error:", error);
  }
}

testSummarization();