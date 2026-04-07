import ollama from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

export async function callOllama(
  systemPrompt: string,
  userPrompt: string,
  model?: string,
): Promise<string> {
  const selectedModel = model || process.env.OLLAMA_MODEL || 'llama3.2';

  const response = await ollama.chat({
    model: selectedModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return response.message.content.trim();
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}
