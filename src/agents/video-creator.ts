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

    console.log(
      `🎬 Video Creator đang tạo kịch bản ${platform.toUpperCase()}...`,
    );

    const response = await callAI(VIDEO_CREATOR_SYSTEM_PROMPT, userPrompt);

    return this.parseResponse(response, platform, product.name);
  }

  private parseResponse(
    text: string,
    platform: Platform,
    productName: string,
  ): VideoScript {
    // Step 1: Try to parse JSON response
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      const data = JSON.parse(cleaned);

      // AI returns: { hook, body, cta, wordCount, angle, script }
      // "script" = hook + body + cta merged into readable paragraph
      const mergedScript =
        data.script || `${data.hook} ${data.body} ${data.cta}`;
      const wordCount = data.wordCount || mergedScript.split(/\s+/).length;

      return {
        platform,
        title: `Review ${productName}`,
        hook: data.hook || "",
        body: mergedScript,
        voiceoverCTA: data.cta || "",
        wordCount,
        estimatedDuration: `${Math.round(wordCount / 2.5)} giây`,
      };
    } catch {
      // Step 2: Fallback — raw text parsing (old behavior)
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
