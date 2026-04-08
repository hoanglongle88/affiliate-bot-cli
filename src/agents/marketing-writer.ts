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
    targetAudience: string = "Người mua hàng online tại Việt Nam",
  ): Promise<PostDescription> {
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

    return this.parseResponse(response, platform);
  }

  private parseResponse(text: string, platform: Platform): PostDescription {
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      const data = JSON.parse(cleaned);

      // AI returns: { headline, content, offer, cta, hashtags[] }
      // Hashtags: strip leading # from each tag (orchestrator will re-add)
      let rawTags: string[] = Array.isArray(data.hashtags) ? data.hashtags : [];
      const hashtags = rawTags
        .map((t) => t.replace(/^#+/, "").trim())
        .filter(Boolean);

      // Ensure minimum hashtags
      const defaultTags: Record<string, string[]> = {
        tiktok: ["fyp", "xuhuong", "tiktokshop"],
        youtube: ["shorts", "review", "xuhuong"],
        facebook_reels: ["reels", "fyp", "review"],
        instagram_reels: ["reels", "instashop", "review"],
        facebook_ads: ["ads", "sale", "freeship"],
      };
      const platformDefaults = defaultTags[platform] || [
        "fyp",
        "xuhuong",
        "review",
      ];
      const finalTags =
        hashtags.length >= 3
          ? hashtags.slice(0, 7)
          : [...new Set([...hashtags, ...platformDefaults])].slice(0, 7);

      // Orchestrator will build caption: headline + content + offer + cta + hashtags
      // For now, return components — caption is placeholder
      return {
        platform,
        headline: data.headline || "",
        content: data.content || "",
        offer: data.offer || "",
        cta: data.cta || "",
        hashtags: finalTags,
        caption: "", // Auto-built by savePostDescription
        wordCount: (data.content || text).split(/\s+/).length,
      };
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng fallback parsing\n"),
      );

      // Fallback: extract hashtags and treat rest as content
      const hashtagRegex = /#[\wÀ-ỹ]+/g;
      const hashtags = text.match(hashtagRegex) || [];
      const content = text.replace(hashtagRegex, "").trim();

      return {
        platform,
        headline: "REVIEW SẢN PHẨM",
        content: content.substring(0, 500),
        offer: "Ưu đãi có hạn — Mua ngay kẻo lỡ!",
        cta: "Bấm vào link để mua ngay",
        hashtags:
          hashtags.length >= 3
            ? hashtags.map((t) => t.replace(/^#+/, "")).slice(0, 7)
            : ["fyp", "xuhuong", "review"],
        caption: "",
        wordCount: text.split(/\s+/).length,
      };
    }
  }
}
