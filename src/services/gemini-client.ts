import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model?: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY không được cấu hình trong file .env");
  }

  const selectedModel = model || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: [{ text: systemPrompt }, { text: "\n\n" }, { text: userPrompt }],
  });

  return response.text?.trim() || "";
}

export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return false;

    const ai = new GoogleGenAI({ apiKey });
    await ai.models.list();
    return true;
  } catch {
    return false;
  }
}
