// Shared types for web dashboard

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: string;
  sold: string;
  usageCount: number;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface VideoScript {
  id?: string;
  platform: string;
  title: string;
  hook: string;
  body: string;
  voiceoverCTA: string;
  wordCount: number;
  estimatedDuration: string;
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

export interface HistoryEntry {
  id: string;
  productId: string | null;
  scriptId: string | null;
  descriptionId: string | null;
  workflow: string;
  createdAt: string;
  product?: { name: string } | null;
}

export interface TrendBriefResult {
  brief: {
    product: { name: string; price: string; views: string; trendPercent: string };
    hook: string;
    angle: string;
    painPoint: string;
    ctaAngle: string;
    hashtags: string[];
  };
  product: { id: string; name: string };
}

export interface ShortVideoTimelineSegment {
  range: string;
  content: string;
  prompt: string;
}

export interface ShortVideoResult {
  totalDuration: string;
  visualStyle: string;
  aspectRatio: string;
  visualQuality: string;
  timeline: ShortVideoTimelineSegment[];
  videoPromptFull: string;
}

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

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export type Platform = 'tiktok' | 'youtube' | 'facebook_reels' | 'instagram_reels' | 'facebook_ads';
export type AdPlatform = 'facebook' | 'tiktok' | 'shopee' | 'lazada';
export type AspectRatio = '1:1' | '9:16' | '16:9';
