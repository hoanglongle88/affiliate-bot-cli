export interface ImageBriefResult {
  adFormat: string;
  visualStyle: string;
  colorPalette: string[];
  prompts: {
    safe: string;
    bold: string;
    lifestyle: string;
  };
  negativePrompt: string;
  shootingNotes: string;
}

export interface ImageResponse {
  brief: ImageBriefResult;
}

export type AspectRatio = '1:1' | '9:16' | '16:9';
