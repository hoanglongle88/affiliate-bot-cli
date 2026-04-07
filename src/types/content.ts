export type Platform = "tiktok" | "youtube";

export interface ProductInfo {
  name: string;
  description: string;
  price: string;
  rating: string;
  sold: string;
  usp?: string; // Unique Selling Point - Điểm bán hàng độc nhất
}

export interface VideoScript {
  platform: Platform;
  title: string;
  hook: string;
  body: string;
  voiceoverCTA: string;
  wordCount: number;
  estimatedDuration: string;
}

export interface PostDescription {
  platform: Platform;
  caption: string;
  hashtags: string[];
  cta: string;
  wordCount: number;
}

export interface GeneratedContent {
  product: ProductInfo;
  script?: VideoScript;
  description?: PostDescription;
}

export interface VideoResult {
  videoPath: string;
  audioPath: string;
  duration: number;
  platform: Platform;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface TrendingProduct {
  name: string;
  price: string;
  rating: string;
  sold: string;
  views: string;
  trendPercent: string;
  description: string;
  sourceUrl?: string;
}

export interface TrendBrief {
  id: string;
  platform: "tiktok" | "youtube" | "shopee";
  niche: string;
  product: TrendingProduct;
  angle: string;
  hook: string;
  hashtags: string[];
  painPoint: string;
  ctaAngle: string;
  cachedAt: string;
}

export type ScanSource = "tiktok" | "youtube" | "shopee";
