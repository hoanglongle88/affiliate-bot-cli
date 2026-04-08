// Scripts
export interface ScriptResponse {
  script: {
    id: string;
    productId: string | null;
    platform: string;
    title: string;
    hook: string;
    body: string;
    voiceoverCTA: string;
    wordCount: number;
    estimatedDuration: string;
  };
}

export interface VideoScript {
  id?: string;
  productId?: string | null;
  platform: string;
  title: string;
  hook: string;
  body: string;
  voiceoverCTA: string;
  wordCount: number;
  estimatedDuration: string;
}
