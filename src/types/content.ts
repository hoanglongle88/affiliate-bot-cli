export type Platform =
  | "tiktok"
  | "youtube"
  | "facebook_reels"
  | "instagram_reels"
  | "facebook_ads";

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
  facebook_reels: "Facebook Reels",
  instagram_reels: "Instagram Reels",
  facebook_ads: "Facebook Ads",
};

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

// ── Persisted Content Types (saved to DB) ──

export interface SavedVideoScript {
  id: string;
  productId: string | null;
  platform: Platform;
  title: string;
  hook: string;
  body: string;
  voiceoverCta: string;
  wordCount: number;
  estimatedDuration: string;
  rawAiResponse?: Record<string, unknown>;
  createdAt: string;
}

export interface SavedPostDescription {
  id: string;
  productId: string | null;
  scriptId: string | null;
  platform: Platform;
  caption: string;
  hashtags: string[];
  cta: string;
  wordCount: number;
  createdAt: string;
}

export interface SavedTrendBrief {
  id: string;
  source: string;
  niche: string;
  productId: string | null;
  angle: string;
  hook: string;
  hashtags: string[];
  painPoint: string;
  ctaAngle: string;
  rawAiResponse?: Record<string, unknown>;
  createdAt: string;
}

export interface SavedImageBrief {
  id: string;
  productId: string | null;
  adPlatform: string;
  aspectRatio: string;
  adFormat: string;
  visualStyle: string;
  colorPalette: string[];
  promptSafe: string;
  promptBold: string;
  promptLifestyle: string;
  negativePrompt: string;
  shootingNotes: string;
  rawAiResponse?: Record<string, unknown>;
  createdAt: string;
}

// ── Updated HistoryEntry to reference content by ID ──

export interface PersistedHistoryEntry {
  id: string;
  productId: string | null;
  scriptId: string | null;
  descriptionId: string | null;
  workflow: "script" | "description" | "full" | "trend" | "image_brief";
  createdAt: string;
}
