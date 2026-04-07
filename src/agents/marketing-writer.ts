import chalk from "chalk";
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
      product.description.substring(0, 200),
      "Người mua hàng online tại Việt Nam",
      scriptSummary,
    );

    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(chalk.gray(`\r   ⏳ Đang tạo mô tả... ${elapsed}s`));
    }, 500);

    const response = await callAI(MARKETING_WRITER_SYSTEM_PROMPT, userPrompt);
    clearInterval(loadingInterval);
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    return this.parseResponse(response, platform);
  }

  private parseResponse(text: string, platform: Platform): PostDescription {
    // Extract hashtags (cuối text)
    const hashtagRegex = /#[\wÀ-ỹ]+/g;
    const hashtags = text.match(hashtagRegex) || [];

    // CTA = câu cuối có action keywords
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

    // Caption = text gốc giữ nguyên emoji, chỉ remove hashtags
    const caption = text.replace(hashtagRegex, "").trim();

    // Default hashtags nếu không có
    const defaultTags = ["#fyp", "#xuhuong", "#review"];
    const finalTags =
      hashtags.length >= 3
        ? hashtags.slice(0, 7)
        : [...new Set([...hashtags, ...defaultTags])].slice(0, 7);

    return {
      platform,
      caption,
      hashtags: finalTags,
      cta,
      wordCount: text.split(/\s+/).length,
    };
  }
}
