import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import {
  IMAGE_PROMPT_SYSTEM,
  buildImagePromptUserPrompt,
  ImagePromptInput,
  ImagePromptOutput,
} from "../prompts/image-creator";
import { saveImageBrief } from "../data/storage";
import { SavedImageBrief } from "../types/content";

const DEFAULT_BRIEF: ImagePromptOutput = {
  adFormat: "feed-square",
  visualStyle: "Product photography, clean background",
  colorPalette: ["#FFFFFF", "#F5F5F5", "#333333"],
  prompts: {
    safe: "Professional product photo, clean white background, studio lighting",
    bold: "Eye-catching product, dramatic lighting, vibrant colors, stop-scroll visual",
    lifestyle:
      "Product in real-life setting, natural lighting, lifestyle photography",
  },
  negativePrompt: "blurry, text overlay, watermark, low quality, pixelated",
  shootingNotes: "Chụp sản phẩm trên nền trắng, ánh sáng studio, góc 45 độ",
};

export { ImagePromptOutput as ImageBrief };

export class ImageCreatorAgent {
  async generateBrief(
    input: ImagePromptInput,
    productId: string | null = null,
  ): Promise<{ brief: ImagePromptOutput; savedId: string }> {
    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        chalk.gray(`\r   ⏳ Đang tạo brief ảnh... ${elapsed}s`),
      );
    }, 500);

    const userPrompt = buildImagePromptUserPrompt(input);
    const response = await callAI(
      IMAGE_PROMPT_SYSTEM,
      userPrompt,
      "image_brief",
    );

    clearInterval(loadingInterval);
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    const brief = this.parseResponse(response);

    // Self-save to storage
    const briefToSave: SavedImageBrief = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      productId,
      adPlatform: input.adPlatform,
      aspectRatio: input.aspectRatio,
      adFormat: brief.adFormat,
      visualStyle: brief.visualStyle,
      colorPalette: brief.colorPalette,
      promptSafe: brief.prompts.safe,
      promptBold: brief.prompts.bold,
      promptLifestyle: brief.prompts.lifestyle,
      negativePrompt: brief.negativePrompt,
      shootingNotes: brief.shootingNotes,
      rawAiResponse: { raw: response },
      createdAt: new Date().toISOString(),
    };

    const saved = await saveImageBrief(briefToSave);

    return { brief, savedId: saved.id };
  }

  private parseResponse(text: string): ImagePromptOutput {
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      return JSON.parse(cleaned);
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng dữ liệu mặc định\n"),
      );
      return DEFAULT_BRIEF;
    }
  }

  displayBrief(brief: ImagePromptOutput): void {
    console.log(
      chalk.bold.cyan("\n📸 CREATIVE BRIEF — Ảnh quảng cáo sản phẩm"),
    );
    console.log(chalk.cyan("─".repeat(50)));

    console.log(chalk.bold("\n🎬 Format: ") + brief.adFormat);
    console.log(chalk.bold("🎨 Visual style: ") + brief.visualStyle);

    console.log(chalk.bold("\n🎨 Bảng màu đề xuất:"));
    brief.colorPalette.forEach((c) => console.log(chalk.white(`   ${c} ████`)));

    console.log(chalk.bold("\n📝 3 Image Prompts:"));
    console.log(chalk.green("   1️⃣  SAFE: ") + brief.prompts.safe);
    console.log(chalk.green("   2️⃣  BOLD: ") + brief.prompts.bold);
    console.log(chalk.green("   3️⃣  LIFESTYLE: ") + brief.prompts.lifestyle);

    console.log(chalk.bold("\n🚫 Negative: ") + brief.negativePrompt);
    console.log(chalk.bold("\n📸 Shooting notes: ") + brief.shootingNotes);
    console.log(chalk.cyan("─".repeat(50) + "\n"));
  }
}
