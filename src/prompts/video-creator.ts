import type { Platform } from "../types/content";

export type { Platform };

export const VIDEO_CREATOR_SYSTEM_PROMPT = `Bạn là Đạo diễn sáng tạo và Senior Copywriter chuyên về Performance Marketing trên các nền tảng Video ngắn (TikTok, Reels, Shorts). Bạn có khả năng biến sản phẩm bình thường thành "cơn sốt" mua sắm ngay lập tức.

QUY TRÌNH TƯ DUY (Internal Monologue):
1. Phân tích Algorithm: TikTok cần sự thực tế (native), FB Reels cần sự tò mò, IG Reels cần sự thẩm mỹ (cinematic), YT Shorts cần sự nhanh gọn.
2. Xác định "Kẻ thù chung": Vấn đề nhức nhối nhất mà khách hàng đang chịu đựng.
3. Chốt hạ bằng Proof: Sử dụng dữ liệu lượt bán/đánh giá để đập tan sự hoài nghi.

CẤU TRÚC KỊCH BẢN (Tối ưu theo khung 60s vàng):
- [HOOK] (5-20 từ): Chặn đứng hành vi lướt bằng câu hỏi xoáy vào nỗi đau hoặc tuyên bố gây sốc.
- [BODY] (≥ 2 đoạn, tách bằng xuống dòng): Dẫn dắt từ Vấn đề -> Giải pháp -> Proof. Mỗi đoạn là một nhịp nghỉ tự nhiên để đọc voiceover.
- [CTA] (3-15 từ): Lời kêu gọi hành động ngắn gọn, dứt khoát.

QUY TẮC NGÔN NGỮ:
- Viết bằng tiếng Việt tự nhiên, gãy gọn, nhịp điệu nhanh.
- Script (lời thoại) CHỈ chứa văn bản để đọc — KHÔNG chứa mô tả cảnh quay, emoji, hay ký tự đặc biệt.
- Body PHẢI được chia thành ít nhất 2 đoạn bằng dấu xuống dòng (\\n).
- KHÔNG dùng markdown.

Output BẮT BUỘC là JSON thuần:
{
  "angle": "pain-point | curiosity | social-proof | price-shock",
  "hook": "Câu mở đầu chặn lướt (5-20 từ)",
  "body": "Nội dung dẫn dắt, chia thành 3-4 đoạn nhỏ bằng dấu xuống dòng (\\n)",
  "cta": "Lời kêu gọi hành động (3-15 từ)",
  "script": "Gộp hook + body + cta thành một văn bản đọc liền mạch (chỉ lời thoại, không mô tả cảnh)",
  "visual_cues": ["Cảnh 1", "Cảnh 2", "Cảnh 3"]
}`;

export function buildVideoCreatorUserPrompt(
  product: {
    name: string;
    price: string;
    rating: string;
    sold: string;
    description: string;
    usp?: string;
  },
  platform: Platform,
): string {
  const platformContexts: Record<Platform, string> = {
    tiktok:
      "Ưu tiên phong cách POV, gần gũi, sử dụng ngôn ngữ trend Gen Z, tạo cảm giác 'người thật việc thật'.",
    youtube:
      "Nhanh, gọn, đi thẳng vào vấn đề, tối ưu từ khóa trong lời thoại để dễ được đề xuất.",
    facebook_reels:
      "Đánh mạnh vào sự tò mò, tâm lý đám đông và các mẹo hữu ích (life hacks).",
    instagram_reels:
      "Ưu tiên sự duy mỹ (Aesthetic), hình ảnh sang chảnh, nhịp điệu theo âm nhạc, cảm giác lifestyle.",
    facebook_ads:
      "Chuyên nghiệp, tin cậy, xoáy sâu vào cam kết chất lượng và ưu đãi mua ngay tại bài viết.",
  };

  let productDetail = product.description?.trim();
  if (
    !productDetail ||
    productDetail === "Chưa có" ||
    productDetail.length < 10
  ) {
    productDetail = `(Không có mô tả chi tiết — HÃY PHÂN TÍCH kỹ các từ khóa kỹ thuật, mã model, công nghệ có trong tên "${product.name}" để suy ra lợi ích chính cho người dùng)`;
  } else {
    productDetail = productDetail.substring(0, 450);
  }

  // 2. Xử lý USP: Ưu tiên sự độc đáo
  let usp = product.usp?.trim();
  if (!usp || usp === "Chưa có" || usp.length < 5) {
    usp = `(Tự xác định điểm bán hàng "đắt giá" nhất dựa trên thông số kỹ thuật)`;
  }

  // 3. Xử lý Social Proof: Tập trung vào con số thực tế (Lượt bán/Đánh giá)
  const socialProof =
    product.sold !== "Chưa có" && product.sold !== "0"
      ? `Đã có ${product.sold} lượt bán thành công, đạt ${product.rating || "5"}/5 sao.`
      : `Sản phẩm đang cực hot với đánh giá ${product.rating || "5"}/5 sao.`;

  return `Hãy viết kịch bản video bán hàng chuyên nghiệp cho ${platform.toUpperCase()}.

[Ngữ cảnh nền tảng]: ${platformContexts[platform]}

[Dữ liệu sản phẩm]:
- Tên: ${product.name}
- Giá bán: ${product.price || "Cực ưu đãi"}
- Uy tín: ${socialProof}
- Điểm khác biệt (USP): ${usp}
- Chi tiết mô tả: ${productDetail}

[Yêu cầu kịch bản]:
- Bóc tách các từ khóa như: "Wireless", "Mechanical", "GaN5", "PD 20W", "Rapid Trigger"... để biến chúng thành lý do khách hàng phải mua.
- Không nhắc đến tên bất kỳ cửa hàng nào.
- Tập trung vào trải nghiệm người dùng: "Cảm giác cầm nắm", "Tốc độ sạc", "Độ bền".
- Kịch bản nhịp điệu nhanh, dứt khoát, kích thích hành động ngay.`;
}
