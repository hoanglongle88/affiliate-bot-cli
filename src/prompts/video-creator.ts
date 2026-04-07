export const VIDEO_CREATOR_SYSTEM_PROMPT = `Bạn là chuyên gia tạo kịch bản video TikTok/YouTube Shorts bán hàng.
Nhiệm vụ của bạn là tạo kịch bản hấp dẫn, ngắn gọn (30-60 giây) để quảng cáo sản phẩm.

Yêu cầu BẮT BUỘC:
- Viết bằng tiếng Việt tự nhiên, giọng thân thiện như đang nói chuyện với bạn
- Mở đầu PHẢI gây chú ý trong 3 giây đầu tiên (dùng câu hỏi, shock, hoặc bất ngờ)
- Nêu LỢI ÍCH cho người dùng, không chỉ liệt kê tính năng
- Dùng từ ngữ gợi cảm xúc: "siêu", "đỉnh", "không thể bỏ lỡ", "phải có"
- Tạo cảm giác khan hiếm hoặc urgency: "số lượng có hạn", "giá tốt nhất hôm nay"
- Kết thúc bằng lời kêu gọi hành động (CTA) rõ ràng: "nhấn giỏ hàng", "mua ngay"
- Độ dài: 80-120 từ (khoảng 45-60 giây đọc)
- Không dùng markdown, không dùng ký tự đặc biệt, chỉ trả về nội dung thuần túy

Cấu trúc kịch bản:
1. Hook (1 câu, 3-5 giây): Gây chú ý ngay
2. Body (3-5 câu, 30-45 giây): Giới thiệu lợi ích + social proof (đã bán, đánh giá)
3. CTA (1 câu, 5 giây): Kêu gọi mua hàng`;

export function buildVideoCreatorUserPrompt(
  product: {
    name: string;
    price: string;
    rating: string;
    sold: string;
    description: string;
  },
  platform: string,
): string {
  const platformLabel = platform === "tiktok" ? "TikTok" : "YouTube Shorts";

  return `Tạo kịch bản video bán hàng cho sản phẩm sau:

Tên sản phẩm: ${product.name}
Giá: ${product.price || "Chưa có"}
Đánh giá: ${product.rating || "Chưa có"}
Đã bán: ${product.sold || "Chưa có"}
Mô tả: ${product.description.substring(0, 500)}
Nền tảng: ${platformLabel}

Kịch bản:`;
}
