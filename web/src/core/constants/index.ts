// Constants
export const PAGE_SIZE = 10;

export const AD_PLATFORMS = ['facebook', 'tiktok', 'shopee', 'lazada'] as const;
export const AD_PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook / Instagram',
  tiktok: 'TikTok Ads',
  shopee: 'Shopee',
  lazada: 'Lazada',
};

export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 — Vuông (Feed, Shopee)' },
  { value: '9:16', label: '9:16 — Dọc (Stories, Reels, TikTok)' },
  { value: '16:9', label: '16:9 — Ngang (YouTube, Banner)' },
];

export const PROMPT_KEYS = ['safe', 'bold', 'lifestyle'] as const;
export const PROMPT_LABELS = ['🟢 SAFE', '🟡 BOLD', '🔵 LIFESTYLE'] as const;
export const PROMPT_COLORS = [
  'text-green-400',
  'text-yellow-400',
  'text-blue-400',
] as const;

export const WORKFLOW_LABELS: Record<string, string> = {
  script: 'Kịch bản',
  description: 'Caption',
  full: 'Đầy đủ',
  trend: 'Trend',
  image_brief: 'Image Brief',
  short_video: 'Short Video',
};

export const PLATFORMS = [
  'tiktok',
  'youtube',
  'facebook_reels',
  'instagram_reels',
  'facebook_ads',
] as const;

export const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
  facebook_reels: 'Facebook Reels',
  instagram_reels: 'Instagram Reels',
  facebook_ads: 'Facebook Ads',
};

export const NICHES = [
  { id: 'gia-dung', name: 'Gia dụng' },
  { id: 'thoi-trang-nu', name: 'Thời trang nữ' },
  { id: 'thoi-trang-nam', name: 'Thời trang nam' },
  { id: 'cong-nghe', name: 'Công nghệ' },
  { id: 'my-pham', name: 'Mỹ phẩm' },
  { id: 'suc-khoe', name: 'Sức khoẻ' },
  { id: 'me-be', name: 'Mẹ & bé' },
  { id: 'nha-cua', name: 'Nhà cửa' },
  { id: 'the-thao', name: 'Thể thao' },
  { id: 'thu-cung', name: 'Thú cưng' },
  { id: 'oto-xe-may', name: 'Ô tô / Xe máy' },
  { id: 'do-an', name: 'Đồ ăn' },
];

export type ServerStatus = 'loading' | 'online' | 'offline';

export const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
