import chalk from "chalk";
import { ProductInfo, PostDescription, Platform } from "../types/content";
import { callAI } from "../services/ai-orchestrator";
import { savePostDescription } from "../data/storage";
import {
  MARKETING_WRITER_SYSTEM_PROMPT,
  buildMarketingWriterUserPrompt,
} from "../prompts/marketing-writer";

export class MarketingWriterAgent {
  async generateDescription(
    product: ProductInfo,
    scriptSummary: string,
    platform: Platform,
    productId: string | null = null,
    scriptId: string | null = null,
    targetAudience: string = "Người mua hàng online tại Việt Nam",
  ): Promise<{ description: PostDescription; savedId: string }> {
    const input = {
      name: product.name,
      usp: product.usp || "Chất lượng vượt trội trong tầm giá",
      targetAudience,
      price: product.price,
    };

    const userPrompt = buildMarketingWriterUserPrompt(
      input,
      scriptSummary,
      platform,
    );

    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(chalk.gray(`\r   ⏳ Đang tạo mô tả... ${elapsed}s`));
    }, 500);

    const response = await callAI(
      MARKETING_WRITER_SYSTEM_PROMPT,
      userPrompt,
      "marketing_caption",
    );
    clearInterval(loadingInterval);
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    const description = this.parseResponse(response, platform);

    // Self-save to storage
    const saved = await savePostDescription(description, productId, scriptId);

    return { description, savedId: saved.id };
  }

  private parseResponse(text: string, platform: Platform): PostDescription {
    const hashtagRegex = /#[\wÀ-ỹ]+/g;
    const hashtags = text.match(hashtagRegex) || [];

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
      "comment",
      "bio",
    ];
    const cta =
      [...sentences]
        .reverse()
        .find((s) => ctaKeywords.some((kw) => s.toLowerCase().includes(kw)))
        ?.trim() || "";

    const caption = text.replace(hashtagRegex, "").trim();

    const defaultTags: Record<string, string[]> = {
      tiktok: ["#fyp", "#xuhuong", "#tiktokshop"],
      youtube: ["#shorts", "#review", "#xuhuong"],
      facebook_reels: ["#reels", "#fyp", "#review"],
      instagram_reels: ["#reels", "#instashop", "#review"],
      facebook_ads: ["#ads", "#sale", "#freeship"],
    };

    const platformDefaults = defaultTags[platform] || [
      "#fyp",
      "#xuhuong",
      "#review",
    ];
    const finalTags =
      hashtags.length >= 3
        ? hashtags.slice(0, 7)
        : [...new Set([...hashtags, ...platformDefaults])].slice(0, 7);

    return {
      platform,
      caption,
      hashtags: finalTags,
      cta,
      wordCount: text.split(/\s+/).length,
    };
  }
}
