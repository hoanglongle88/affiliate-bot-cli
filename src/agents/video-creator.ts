import chalk from "chalk";
import { ProductInfo, VideoScript, Platform } from "../types/content";
import { callAI } from "../services/ai-orchestrator";
import {
  VIDEO_CREATOR_SYSTEM_PROMPT,
  buildVideoCreatorUserPrompt,
} from "../prompts/video-creator";

export class VideoCreatorAgent {
  async generateScript(
    product: ProductInfo,
    platform: Platform,
  ): Promise<VideoScript> {
    const userPrompt = buildVideoCreatorUserPrompt(product, platform);

    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        chalk.gray(`\r   ⏳ Đang tạo kịch bản... ${elapsed}s`),
      );
    }, 500);

    const response = await callAI(
      VIDEO_CREATOR_SYSTEM_PROMPT,
      userPrompt,
      "video_script",
    );
    clearInterval(loadingInterval);
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    return this.parseResponse(response, platform, product.name);
  }

  private parseResponse(
    text: string,
    platform: Platform,
    productName: string,
  ): VideoScript {
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      const data = JSON.parse(cleaned);

      // AI returns: { angle, hook, body, cta, script, visual_cues[] }
      // Use pre-merged script from AI, or build from parts
      const mergedScript =
        data.script || `${data.hook}\n\n${data.body}\n\n${data.cta}`;
      const wordCount = data.wordCount || mergedScript.split(/\s+/).length;

      const titleAngle =
        data.angle === "pain-point"
          ? "Đừng mua nếu chưa biết"
          : data.angle === "price-shock"
            ? "Giá không tưởng"
            : data.angle === "social-proof"
              ? "Cháy hàng loạt"
              : "Không thể bỏ qua";

      return {
        platform,
        title: `${titleAngle}: ${productName}`,
        hook: data.hook || "",
        body: data.body || "",
        voiceoverCTA: data.cta || "",
        wordCount,
        estimatedDuration: `${Math.round(wordCount / 2.5)} giây`,
      };
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng fallback parsing\n"),
      );

      const sentences = text
        .split(/[.!?\n]/)
        .filter((s) => s.trim().length > 0);
      const hook = sentences[0]?.trim() || "";

      const ctaKeywords = [
        "mua",
        "giỏ hàng",
        "link",
        "nhấn",
        "click",
        "đặt hàng",
        "inbox",
      ];
      const ctaSentence =
        [...sentences]
          .reverse()
          .find((s) =>
            ctaKeywords.some((kw) => s.toLowerCase().includes(kw)),
          ) || "Nhấn vào giỏ hàng bên trái để mua ngay!";

      const wordCount = text.split(/\s+/).length;

      return {
        platform,
        title: `Review ${productName}`,
        hook,
        body: text,
        voiceoverCTA: ctaSentence.trim(),
        wordCount,
        estimatedDuration: `${Math.round(wordCount / 2.5)} giây`,
      };
    }
  }
}
