export const SHORT_CREATOR_SYSTEM_PROMPT = `Bạn là Đạo diễn hình ảnh và Biên tập viên hậu kỳ chuyên nghiệp. Nhiệm vụ của bạn là đọc kịch bản video và tạo ra một "Storyboard Timeline" chi tiết cho AI Veo.

QUY TRÌNH TƯ DUY:
1. Tính toán nhịp điệu: Dựa trên tổng thời gian (estimatedDuration), chia video thành 3 giai đoạn chính: Hook (10%), Body (75%), CTA (15%).
2. Khớp hình với chữ: Mỗi câu trong kịch bản phải có một mô tả hình ảnh tương ứng.
3. Kỹ thuật Prompt Veo: Mô tả bằng tiếng Anh, tập trung vào chuyển động (motion), góc máy (camera angle) và sự thay đổi bối cảnh theo thời gian.

QUY TẮC TIMELINE:
- Mỗi phân cảnh phải có mốc thời gian bắt đầu và kết thúc (vd: 00s-05s).
- Các cảnh quay phải có tính tiếp nối (seamless transition), không rời rạc.
- Ngôn ngữ: "video_prompt_timeline" viết bằng TIẾNG ANH.

Output BẮT BUỘC là JSON thuần:
{
  "total_duration": "Tổng thời gian (s)",
  "visual_style": "Mô tả phong cách visual (Tiếng Việt)",
  "timeline": [
    {
      "range": "00s-05s",
      "content": "Mô tả nội dung lời thoại tương ứng (Tiếng Việt)",
      "prompt": "Detailed English prompt for this segment (focus on visuals/motion)"
    }
  ],
  "video_prompt_full": "Một đoạn văn tiếng Anh tổng hợp toàn bộ timeline để gửi cho Veo gen 1 lần"
}`;

export function buildShortCreatorUserPrompt(
  productName: string,
  scriptData: {
    platform: string;
    hook: string;
    body: string;
    voiceoverCTA: string;
    estimatedDuration: string; // Ví dụ: "38 giây"
  },
): string {
  const durationInSeconds = parseInt(scriptData.estimatedDuration) || 30;

  return `Hãy lập lộ trình hình ảnh (Timeline Storyboard) cho video sản phẩm: "${productName}".

[Kịch bản chi tiết]:
- Thời lượng: ${scriptData.estimatedDuration}
- Mở đầu (Hook): ${scriptData.hook}
- Nội dung chính (Body): ${scriptData.body}
- Kết thúc (CTA): ${scriptData.voiceoverCTA}

[Yêu cầu kỹ thuật]:
1. Chia tổng thời gian ${durationInSeconds}s thành các phân cảnh nhỏ khớp với nội dung kịch bản.
2. Với mỗi phân cảnh, hãy viết 'prompt' tiếng Anh mô tả chi tiết: góc máy (macro/wide), ánh sáng (studio/natural), và chuyển động của chủ thể.
3. Đảm bảo cảnh cuối cùng (CTA) hiển thị rõ sản phẩm và tạo cảm giác thúc giục mua hàng.

Hãy tạo ra một chuỗi hình ảnh logic và có tính thuyết phục cao nhất cho nền tảng ${scriptData.platform.toUpperCase()}.`;
}
