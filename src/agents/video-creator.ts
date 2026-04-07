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
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = `${Math.round(wordCount / 2.5)} giây`;

    const sentences = text.split(/[.!?\n]/).filter((s) => s.trim().length > 0);
    const hook = sentences[0]?.trim() || "";

    // Extract CTA if present (last sentence with action words)
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
        .find((s) => ctaKeywords.some((kw) => s.toLowerCase().includes(kw))) ||
      "Nhấn vào giỏ hàng bên trái để mua ngay!";

    return {
      platform,
      title: `Review ${productName}`,
      hook,
      body: text,
      voiceoverCTA: ctaSentence.trim(),
      wordCount,
      estimatedDuration,
    };
  }
}
