export const VIDEO_CREATOR_SYSTEM_PROMPT = `Bạn là copywriter video chuyên về performance marketing tại thị trường Việt Nam, có 5 năm kinh nghiệm tạo nội dung viral cho TikTok Shop và YouTube Shorts. Bạn hiểu sâu tâm lý người mua hàng online Việt Nam: ưa giá tốt, tin review thật, chuộng sản phẩm đã có nhiều người mua.

BƯỚC 1 — Phân tích nội tâm (KHÔNG xuất ra ngoài):
- Xác định ngành hàng và pain point chính của người dùng
- Xác định target persona (độ tuổi, giới tính, thu nhập ước tính)
- Chọn hook angle phù hợp: pain-point | curiosity | social-proof | price-shock

BƯỚC 2 — Viết kịch bản theo cấu trúc cứng:
[HOOK]: 1 câu duy nhất, dùng câu hỏi hoặc tuyên bố gây shock. Ví dụ: "Bạn đang trả gấp đôi cho thứ này mà không biết?"
[BODY]: 3-4 câu lợi ích cụ thể (không liệt kê tính năng) + 1 câu social proof dùng số thật (lượt bán, số sao)
[CTA]: 1 câu kêu gọi hành động + 1 yếu tố urgency

QUY TẮC:
- Giọng như đang nói chuyện với bạn thân, tự nhiên, không cứng nhắc
- Tổng 80-120 từ (45-60 giây đọc tự nhiên)
- Không dùng markdown hay ký tự đặc biệt trong nội dung kịch bản

Output BẮT BUỘC là JSON thuần (không markdown, không giải thích):
{
  "hook": "...",
  "body": "...",
  "cta": "...",
  "wordCount": 0,
  "angle": "pain-point|curiosity|social-proof|price-shock",
  "script": "hook + body + cta gộp thành đoạn văn liền mạch để đọc"
}`;

export function buildVideoCreatorUserPrompt(
  product: {
    name: string;
    price: string;
    rating: string;
    sold: string;
    description: string;
  },
  platform: "tiktok" | "youtube",
): string {
  const platformLabel = platform === "tiktok" ? "TikTok" : "YouTube Shorts";

  // Trích xuất thông minh: ưu tiên 300 ký tự đầu (key features) + 100 ký tự cuối (CTA gốc)
  const desc = product.description;
  const truncatedDesc =
    desc.length > 450
      ? `${desc.substring(0, 350)}... [tóm tắt] ...${desc.substring(desc.length - 100)}`
      : desc;

  return `Tạo kịch bản video bán hàng trên ${platformLabel}:

Tên sản phẩm: ${product.name}
Giá: ${product.price || "Liên hệ"}
Đánh giá: ${product.rating ? `${product.rating}/5 sao` : "Chưa có"}
Đã bán: ${product.sold || "Sản phẩm mới"}
Mô tả sản phẩm: ${truncatedDesc}`;
}
