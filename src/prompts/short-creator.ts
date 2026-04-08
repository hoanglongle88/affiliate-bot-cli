import { Platform } from "./video-creator";

export const SHORT_CREATOR_SYSTEM_PROMPT = `Bạn là Đạo diễn hình ảnh và Chuyên gia kỹ thuật Prompt cho AI Video (Veo). Nhiệm vụ của bạn là biến những gợi ý cảnh quay (Visual Cues) từ kịch bản kịch bản thành một câu lệnh mô tả video (Prompt) chi tiết và chuyên nghiệp.

QUY TRÌNH TƯ DUY:
1. Phân tích Chủ thể: Sản phẩm trông như thế nào? Chất liệu, góc cạnh, nhãn hiệu.
2. Phân tích Chuyển động: Sản phẩm xoay, di chuyển hay có tác động từ tay người?
3. Thiết lập Ánh sáng & Góc máy: Cinematic, Macro (cận cảnh), Studio lighting, hay Natural light.
4. Tối ưu theo Nền tảng: TikTok cần sự thực tế; Instagram cần sự sang chảnh, thẩm mỹ.

QUY TẮC ĐẦU RA:
- Trường "video_prompt" PHẢI viết bằng tiếng Anh để model Veo hiểu chính xác nhất.
- Mô tả phải liền mạch, tập trung vào sự nhất quán về hình ảnh từ đầu đến cuối video.
- Sử dụng các thuật ngữ chuyên môn: "Hyper-realistic", "Soft bokeh background", "Dynamic motion".

Output BẮT BUỘC là JSON thuần:
{
  "style_analysis": "Phân tích phong cách hình ảnh bằng tiếng Việt (vd: Sang trọng/Năng động)",
  "video_prompt": "Câu lệnh mô tả video chi tiết bằng TIẾNG ANH",
  "aspect_ratio": "9:16",
  "visual_quality": "1080p, 60fps, cinematic color grading"
}`;

export function buildShortCreatorUserPrompt(
  productName: string,
  visualCues: string[], // Lấy từ kết quả của Agent VideoScript
  angle: string, // Lấy từ kết quả của Agent VideoScript
  platform: Platform,
): string {
  const platformStyle: Record<Platform, string> = {
    tiktok:
      "Phong cách quay bằng điện thoại, đời thường, màu sắc tươi sáng, nhịp cắt nhanh.",
    youtube:
      "Chất lượng cao, tập trung vào tính năng sản phẩm, ánh sáng studio rõ nét.",
    facebook_reels:
      "Góc máy trực diện, tập trung vào hành động sử dụng sản phẩm thực tế.",
    instagram_reels:
      "Nghệ thuật, quay chậm (slow-motion), ánh sáng lung linh, vibe sang trọng.",
    facebook_ads:
      "Chuyên nghiệp, tin cậy, quay cận cảnh các chi tiết đắt giá của sản phẩm.",
  };

  return `Hãy tạo Prompt cho Veo để sản xuất video ngắn cho sản phẩm: "${productName}".

[Nguyên liệu từ kịch bản]:
- Các cảnh quay chính: ${visualCues.join(", ")}
- Góc tiếp cận Marketing: ${angle}
- Phong cách nền tảng: ${platformStyle[platform]}

Yêu cầu: 
Dựa trên các cảnh quay trên, hãy viết một câu 'video_prompt' tiếng Anh cực kỳ chi tiết. Đảm bảo video thể hiện được sự khao khát sở hữu sản phẩm ngay từ những giây đầu tiên.`;
}
