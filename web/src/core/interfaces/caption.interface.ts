export interface CaptionResponse {
  description: {
    id: string;
    platform: string;
    headline: string;
    content: string;
    offer: string;
    cta: string;
    hashtags: string[];
    caption: string;
    wordCount: number;
  };
}

export interface PostDescription {
  id?: string;
  platform: string;
  headline: string;
  content: string;
  offer: string;
  cta: string;
  hashtags: string[];
  caption: string;
  wordCount: number;
}
