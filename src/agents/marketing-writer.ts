import { ProductInfo, PostDescription, Platform } from "../types/content";
import { callAI } from "../services/ai-orchestrator";
import {
  MARKETING_WRITER_SYSTEM_PROMPT,
  buildMarketingWriterUserPrompt,
} from "../prompts/marketing-writer";

export class MarketingWriterAgent {
  async generateDescription(
    product: ProductInfo,
    scriptSummary: string,
    platform: Platform,
  ): Promise<PostDescription> {
    const userPrompt = buildMarketingWriterUserPrompt(
      product.name,
      scriptSummary,
    );

    console.log(
      `✍️  Marketing Writer đang tạo mô tả ${platform.toUpperCase()}...`,
    );

    const response = await callAI(MARKETING_WRITER_SYSTEM_PROMPT, userPrompt);

    return this.parseResponse(response, platform);
  }

  private parseResponse(text: string, platform: Platform): PostDescription {
    // Extract hashtags
    const hashtagRegex = /#[\wÀ-ỹ]+/g;
    const hashtags = text.match(hashtagRegex) || [];

    // CTA = last sentence with action words
    const sentences = text.split(/[.!?\n]/).filter((s) => s.trim().length > 0);
    const ctaKeywords = [
      "mua",
      "giỏ hàng",
      "link",
      "nhấn",
      "click",
      "đặt hàng",
      "inbox",
      "ghé",
    ];
    const cta =
      [...sentences]
        .reverse()
        .find((s) => ctaKeywords.some((kw) => s.toLowerCase().includes(kw)))
        ?.trim() || "";

    // Caption = full text minus hashtags
    const caption = text.replace(hashtagRegex, "").replace(/\s+/g, " ").trim();

    return {
      platform,
      caption,
      hashtags:
        hashtags.length > 0 ? hashtags : ["#fyp", "#xuhuong", "#review"],
      cta,
      wordCount: text.split(/\s+/).length,
    };
  }
}
