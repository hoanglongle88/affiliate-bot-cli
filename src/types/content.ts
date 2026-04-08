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
  headline: string; // Tiêu đề thu hút (viết hoa)
  content: string; // Mô tả sản phẩm (30-500 ký tự)
  offer: string; // Ưu đãi/sự khan hiếm
  cta: string; // Link/vị trí mua hàng
  hashtags: string[]; // Array tags KHÔNG có dấu # → Orchestrator tự thêm
  caption: string; // Auto-built by Orchestrator (headline + content + offer + cta + hashtags)
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

// ── Short Video Creator ──

export interface ShortVideoPrompt {
  styleAnalysis: string; // Phân tích phong cách hình ảnh (VN)
  videoPrompt: string; // Prompt chi tiết tiếng Anh cho Veo
  aspectRatio: string; // 9:16, 16:9, 1:1
  visualQuality: string; // 1080p, 60fps, cinematic...
}

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
  headline: string;
  content: string;
  offer: string;
  cta: string;
  hashtags: string[];
  caption: string;
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
  workflow:
    | "script"
    | "description"
    | "full"
    | "trend"
    | "image_brief"
    | "short_video";
  createdAt: string;
}
