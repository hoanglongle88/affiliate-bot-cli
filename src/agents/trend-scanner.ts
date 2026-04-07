import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import {
  TrendBrief,
  ScanSource,
  ProductInfo,
  Platform,
} from "../types/content";
import { NicheConfig, getRandomNiche } from "../config/niches";
import {
  TREND_RESEARCHER_SYSTEM_PROMPT,
  buildTrendResearcherUserPrompt,
} from "../prompts/trend-researcher";
import { getSourceLabel, getRandomSource } from "../services/trends-api";
import { VideoCreatorAgent } from "../agents/video-creator";
import { MarketingWriterAgent } from "../agents/marketing-writer";
import {
  formatScriptOutput,
  formatDescriptionOutput,
} from "../utils/formatter";
import { saveProduct, saveToHistory } from "../data/storage";

export class AutonomousTrendScanner {
  /**
   * Main entry: pick platform + niche → AI researches web → generate content
   */
  async scanAndGenerate(
    niche?: NicheConfig,
  ): Promise<{ brief: TrendBrief; script: any; description: any }> {
    // 1. Pick source & niche
    const source = getRandomSource();
    const selectedNiche = niche || getRandomNiche();

    console.log(chalk.bold.cyan("\n🔍 Đang quét xu hướng..."));
    console.log(chalk.gray(`   📱 Nguồn: ${getSourceLabel(source)}`));
    console.log(chalk.gray(`   🎯 Niché: ${selectedNiche.name}\n`));

    // 2. AI researches web → creates brief
    console.log(chalk.yellow("🧠 AI đang research xu hướng từ web...\n"));
    const brief = await this.researchTrend(source, selectedNiche);

    // 3. Display trend brief
    this.displayBrief(brief);

    // 4. Convert to ProductInfo
    const product: ProductInfo = {
      name: brief.product.name,
      price: brief.product.price,
      rating: brief.product.rating,
      sold: brief.product.sold,
      description: brief.product.description,
    };

    // Save product for reuse
    await saveProduct(product);

    // 5. Generate script
    const platform: Platform =
      brief.platform === "shopee" ? "tiktok" : brief.platform;
    console.log(chalk.yellow("\n🎬 Đang tạo kịch bản video...\n"));
    const videoCreator = new VideoCreatorAgent();
    const script = await videoCreator.generateScript(product, platform);

    console.log(formatScriptOutput(script));

    // 6. Generate description
    console.log(chalk.yellow("\n📝 Đang tạo mô tả bài đăng...\n"));
    const marketingWriter = new MarketingWriterAgent();
    const description = await marketingWriter.generateDescription(
      product,
      script.body.substring(0, 200),
      platform,
    );

    console.log(formatDescriptionOutput(description));

    // 7. Save to history
    const content = { product, script, description };
    await saveToHistory(product, content, "full");

    console.log(
      chalk.cyan(
        "\n🎉 Hoàn thành! Đã tạo đầy đủ: Trend Brief + Kịch bản + Mô tả\n",
      ),
    );

    return { brief, script, description };
  }

  /**
   * Research trend via AI web search
   */
  private async researchTrend(
    source: ScanSource,
    niche: NicheConfig,
  ): Promise<TrendBrief> {
    const userPrompt = buildTrendResearcherUserPrompt(getSourceLabel(source), {
      name: niche.name,
      keywords: niche.keywords,
      hashtags: niche.hashtags,
      painPoints: niche.painPoints,
      contentAngles: niche.contentAngles,
    });

    const response = await callAI(TREND_RESEARCHER_SYSTEM_PROMPT, userPrompt);

    return this.parseResponse(response, source, niche.id);
  }

  /**
   * Parse AI response into TrendBrief
   */
  private parseResponse(
    text: string,
    source: ScanSource,
    nicheId: string,
  ): TrendBrief {
    // Clean up any markdown or code blocks
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // Try to extract JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng dữ liệu thô\n"),
      );
      data = {
        productName:
          text.split(/[.!?\n]/)[0]?.substring(0, 50) || "Sản phẩm trending",
        price: "Chưa có",
        rating: "Chưa có",
        sold: "Chưa có",
        views: "Trending",
        trendPercent: "+100%",
        description: text.substring(0, 200),
        angle: "Review sản phẩm hot",
        hook: text.split(/[.!?\n]/)[0] || "Xem ngay sản phẩm hot này!",
        hashtags: ["#xuhuong", "#tiktokshop", "#review"],
        painPoint: "Đang được tìm kiếm nhiều",
        ctaAngle: "Mua ngay kẻo hết",
      };
    }

    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      platform: source === "shopee" ? "tiktok" : source,
      niche: nicheId,
      product: {
        name: data.productName || "Sản phẩm trending",
        price: data.price || "Chưa có",
        rating: data.rating || "Chưa có",
        sold: data.sold || "Chưa có",
        views: data.views || "Trending",
        trendPercent: data.trendPercent || "+100%",
        description: data.description || "",
      },
      angle: data.angle || "Review sản phẩm",
      hook: data.hook || "Xem ngay sản phẩm hot này!",
      hashtags: Array.isArray(data.hashtags)
        ? data.hashtags
        : ["#xuhuong", "#tiktokshop", "#review"],
      painPoint: data.painPoint || "Đang được tìm kiếm nhiều",
      ctaAngle: data.ctaAngle || "Mua ngay kẻo hết",
      cachedAt: new Date().toISOString(),
    };
  }

  /**
   * Display the trend brief in a compact format
   */
  private displayBrief(brief: TrendBrief): void {
    console.log(chalk.bold.cyan("\n📊 TREND BRIEF"));
    console.log(chalk.cyan("─".repeat(50)));
    console.log(chalk.white(`🏆 ${brief.product.name}`));
    console.log(
      chalk.gray(
        `   👁️  ${brief.product.views} · 📈 ${brief.product.trendPercent} · 💰 ${brief.product.price}`,
      ),
    );
    console.log(chalk.white(`🎣 Hook: ${brief.hook}`));
    console.log(chalk.white(`💡 Angle: ${brief.angle}`));
    console.log(chalk.white(`🎯 Pain point: ${brief.painPoint}`));
    console.log(chalk.white(`#️⃣  Hashtags: ${brief.hashtags.join(" ")}`));
    console.log(chalk.white(`📢 CTA: ${brief.ctaAngle}`));
    console.log(chalk.cyan("─".repeat(50)));
  }
}
