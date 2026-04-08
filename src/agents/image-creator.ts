import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import {
  IMAGE_PROMPT_SYSTEM,
  buildImagePromptUserPrompt,
  ImagePromptInput,
  ImagePromptOutput,
} from "../prompts/image-creator";
import {
  boxHeader,
  sectionHeader,
  quoteBox,
  field,
  infoBlock,
  divider,
} from "../utils/ui-helpers";

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
  async generateBrief(input: ImagePromptInput): Promise<ImagePromptOutput> {
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

    return this.parseResponse(response);
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
    let out = "";

    out += boxHeader("🎨 CREATIVE BRIEF — ẢNH QUẢNG CÁO", chalk.blue);
    out += infoBlock("🎬", "Format:", brief.adFormat);
    out += infoBlock("🎨", "Visual style:", brief.visualStyle);

    out += divider();
    out += chalk.bold.cyan("🎨 Bảng màu đề xuất:\n");
    brief.colorPalette.forEach(
      (c) => (out += chalk.white(`  ${c} `) + chalk.gray("████") + "\n"),
    );

    out += sectionHeader("3 IMAGE PROMPTS", "📝");
    out += chalk.green.bold("  1️⃣  SAFE:\n");
    out += quoteBox(brief.prompts.safe, chalk.green);
    out += chalk.green.bold("\n  2️⃣  BOLD:\n");
    out += quoteBox(brief.prompts.bold, chalk.yellow);
    out += chalk.green.bold("\n  3️⃣  LIFESTYLE:\n");
    out += quoteBox(brief.prompts.lifestyle, chalk.cyan);

    out += divider();
    out += infoBlock("🚫", "Negative:", brief.negativePrompt);
    out += infoBlock("📸", "Shooting:", brief.shootingNotes);
    out += divider();

    console.log(out);
  }
}
