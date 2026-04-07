import chalk from "chalk";
import { callOllama, checkOllamaConnection } from "./ollama-client";
import { callGemini, checkGeminiConnection } from "./gemini-client";

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  // Try Ollama first
  try {
    const connected = await checkOllamaConnection();
    if (connected) {
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
      console.log(
        chalk.yellow(`📡 Đang dùng: Ollama - ${ollamaModel} (Local AI)`),
      );
      return await callOllama(systemPrompt, userPrompt);
    }
    console.log("⚠️  Ollama không khả dụng, chuyển sang Gemini...");
  } catch {
    console.log("⚠️  Ollama lỗi, đang thử fallback sang Gemini...");
  }

  // Fallback to Gemini
  try {
    const connected = await checkGeminiConnection();
    if (connected) {
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      console.log(
        chalk.yellow(`📡 Đang dùng: Gemini - ${geminiModel} (Cloud AI)`),
      );
      return await callGemini(systemPrompt, userPrompt);
    }
    throw new Error("Gemini không khả dụng - kiểm tra API key");
  } catch {
    throw new Error("Cả Ollama và Gemini đều không khả dụng");
  }
}

export async function checkProvidersStatus() {
  const ollamaStatus = await checkOllamaConnection();
  const geminiStatus = await checkGeminiConnection();

  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   ⚙️  SYSTEM CHECK - Trạng thái AI Providers     ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  console.log(chalk.bold("\n📡 Kết nối AI providers:"));
  console.log(
    `   ${ollamaStatus ? chalk.green("✅") : chalk.red("❌")} Ollama - ${ollamaModel} (Local AI)`,
  );
  console.log(
    `   ${geminiStatus ? chalk.green("✅") : chalk.red("❌")} Gemini - ${geminiModel} (Cloud AI)`,
  );
  console.log("");
}
