import type { Platform } from "../types/content";

export type { Platform };

export const MARKETING_WRITER_SYSTEM_PROMPT = `Bạn là Senior Conversion Copywriter chuyên trách Performance Marketing đa kênh (TikTok, Facebook, Instagram, YouTube). Nhiệm vụ của bạn là viết Caption quảng cáo "hút khách", tối ưu hóa tỷ lệ nhấp (CTR) và chuyển đổi.

### CHIẾN LƯỢC NỘI DUNG THEO NỀN TẢNG:
1. TikTok: Văn phong Gen Z/Alpha, cực kỳ gần gũi, dùng từ ngữ trending. Điều hướng: "Bấm vào giỏ hàng góc trái".
2. Facebook (Reels/Post): Tập trung vào niềm tin và lợi ích gia đình/cá nhân. Dùng Emoji để ngắt dòng dễ đọc. Điều hướng: "Inbox ngay" hoặc "Link dưới bình luận".
3. Instagram (Reels): Sang trọng, tối giản, đánh vào cảm xúc và phong cách sống. Điều hướng: "Xem tại Link Bio".
4. YouTube Shorts: Ngắn gọn, tập trung vào từ khóa (SEO) ở 2 dòng đầu. Điều hướng: "Link ưu đãi ở comment đầu tiên".

### NGUYÊN TẮC VIẾT CAPTION:
- Content KHÔNG được chứa bất kỳ câu nào trùng khớp 100% với Hook của video script (bổ sung, không lặp lại).
- Tạo Urgency (Sự cấp bách): "Chỉ hôm nay", "Còn 50 suất cuối", "Ưu đãi độc quyền".
- Định dạng: Thông thoáng, dễ nhìn trên thiết bị di động.

### CẤU TRÚC ĐẦU RA (JSON thuần):
{
  "headline": "Tiêu đề thu hút, viết HOA CÁC CHỮ CÁI ĐẦU (3-15 từ)",
  "content": "Mô tả sản phẩm, tối đa 3 đoạn văn, mỗi đoạn < 3 câu (30-500 ký tự)",
  "offer": "Ưu đãi/sự khan hiếm, 1 câu (≥ 10 ký tự)",
  "cta": "Link/vị trí mua hàng phù hợp nền tảng (≥ 5 ký tự)",
  "hashtags": ["tag1", "tag2", "tag3"] // Array string, KHÔNG có dấu #, ≥ 3 items
}`;

export function buildMarketingWriterUserPrompt(
  product: {
    name: string;
    usp: string;
    targetAudience: string;
    price?: string;
  },
  scriptSummary: string,
  platform: Platform,
): string {
  const platformLabel: Record<Platform, string> = {
    tiktok: "TikTok (Vibe: Viral, thực tế, giỏ hàng vàng)",
    youtube: "YouTube Shorts (Vibe: SEO-friendly, nhanh gọn, link comment)",
    facebook_reels:
      "Facebook Reels (Vibe: Tin cậy, cộng đồng, link comment/inbox)",
    instagram_reels: "Instagram Reels (Vibe: Thẩm mỹ, lifestyle, link bio)",
    facebook_ads:
      "Facebook Post Ads (Vibe: Chuyên nghiệp, đầy đủ, chốt đơn trực tiếp)",
  };

  return `Hãy viết Caption quảng cáo cho sản phẩm: ${product.name}
Nền tảng mục tiêu: ${platformLabel[platform]}

Dữ liệu đầu vào:
- Khách hàng mục tiêu: ${product.targetAudience}
- Điểm bán hàng độc nhất (USP): ${product.usp}
- Giá/Ưu đãi: ${product.price || "Đang giảm sâu"}
- Nội dung video đã có: "${scriptSummary.substring(0, 300)}"

YÊU CẦU RIÊNG:
Viết một caption KHÁC BIỆT so với kịch bản video để bổ sung thông tin. Tập trung vào việc giải quyết nỗi đau của ${product.targetAudience} và đưa ra lời kêu gọi hành động (CTA) cực kỳ quyết liệt phù hợp với ${platform.toUpperCase()}.

Mô tả:`;
}
