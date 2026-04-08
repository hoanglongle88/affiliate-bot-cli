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

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        { text: systemPrompt },
        { text: "\n\n" },
        { text: userPrompt },
      ],
    });

    return response.text?.trim() || "";
  } catch (error: any) {
    // Handle quota exceeded (429)
    if (error.status === 429 || error.code === 429) {
      throw new Error(
        "Gemini API đã hết quota (429 RESOURCE_EXHAUSTED). " +
          "Vui lòng kiểm tra lại billing tại https://aistudio.google.com hoặc chuyển sang dùng Ollama.",
      );
    }

    // Handle other API errors
    if (error.message) {
      throw new Error(`Gemini API lỗi: ${error.message}`);
    }

    throw new Error("Gemini API lỗi không xác định");
  }
}

export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return false;

    const ai = new GoogleGenAI({ apiKey });

    // Test actual generateContent instead of models.list()
    // because models.list() can succeed even when quota is exhausted
    await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      contents: [{ text: "hi" }],
    });

    return true;
  } catch {
    return false;
  }
}
