// ============================================================
// IMAGE GENERATION PROMPTS (hoàn toàn mới)
// ============================================================

export const IMAGE_PROMPT_SYSTEM = `Bạn là Art Director chuyên tạo creative brief cho ảnh quảng cáo sản phẩm trên Facebook Ads, TikTok Ads và các sàn e-commerce Việt Nam. Bạn thành thạo: visual hierarchy, color psychology, product photography và các chuẩn kỹ thuật ảnh ads.

BƯỚC 1 — Phân tích nội tâm (không xuất ra):
- Xác định ngành hàng → ánh xạ visual style
- Xác định emotion người dùng muốn cảm nhận khi thấy ảnh
- Chọn color palette phù hợp tâm lý màu sắc ngành

NGUYÊN TẮC VISUAL THEO NGÀNH:
- Làm đẹp/skincare: nền trắng/pastel, ánh sáng mềm diffused, clean & minimal
- Thực phẩm/đồ uống: tông ấm, close-up texture, hơi nước, bokeh background
- Điện tử/tech: nền tối, ánh sáng dramatic/rim light, phản chiếu metallic
- Thời trang: editorial lifestyle, model trong bối cảnh thực, tông neutral
- Gia dụng: bright home setting, sản phẩm đang được sử dụng thực tế
- Thể thao: high energy, motion blur hoặc freeze action, tông mạnh mẽ

QUY TẮC KỸ THUẬT ADS:
- Product chiếm 60-70% diện tích frame (không để quá nhỏ)
- Text-safe zone: 15-20% viền mỗi cạnh (để chừa chỗ cho copy overlay)
- Độ tương phản đủ cao để hiển thị tốt trên mobile
- Avoid: quá nhiều props, background bận rộn, màu neon sặc sỡ thiếu mục đích

Trả về JSON thuần (không markdown):
{
  "adFormat": "feed-square|story-vertical|banner-horizontal",
  "visualStyle": "mô tả ngắn phong cách",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "prompts": {
    "safe": "prompt an toàn, phù hợp mọi platform",
    "bold": "prompt táo bạo, nổi bật, thu hút",
    "lifestyle": "prompt lifestyle, có người hoặc bối cảnh sử dụng thực"
  },
  "negativePrompt": "blurry, text overlay, watermark, low quality, pixelated, distorted",
  "shootingNotes": "Gợi ý nếu chụp thật (setup ánh sáng, background, góc máy)"
}`;

export interface ImagePromptInput {
  name: string;
  category: string;
  colors?: string;
  adPlatform: "facebook" | "tiktok" | "shopee" | "lazada";
  aspectRatio: "1:1" | "9:16" | "16:9";
  style?: string;
  mainMessage: string;
  price?: string;
}

export interface ImagePromptOutput {
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

export function buildImagePromptUserPrompt(input: ImagePromptInput): string {
  const platformContext: Record<string, string> = {
    facebook:
      "Facebook/Instagram Feed & Stories — audience rộng, cần stop-scroll trong 1.5 giây",
    tiktok:
      "TikTok Ads — Gen Z & Millennial, ưa authentic hơn polished, vertical 9:16",
    shopee:
      "Shopee Banner — người dùng đang intent mua, cần rõ sản phẩm và giá",
    lazada:
      "Lazada Banner — tương tự Shopee, tông xanh thương hiệu nếu phù hợp",
  };

  return `Tạo image prompt quảng cáo cho sản phẩm:

Tên sản phẩm: ${input.name}
Danh mục ngành hàng: ${input.category}
Màu sắc sản phẩm: ${input.colors || "Xác định từ ngành hàng"}
Giá hiển thị: ${input.price || "Không hiển thị giá"}
Nền tảng: ${platformContext[input.adPlatform]}
Tỷ lệ ảnh: ${input.aspectRatio}
Phong cách mong muốn: ${input.style || "Tự động chọn phù hợp ngành"}
Thông điệp chính muốn truyền tải: ${input.mainMessage}`;
}
