import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import {
  IMAGE_PROMPT_SYSTEM,
  buildImagePromptUserPrompt,
  ImagePromptInput,
} from "../prompts/video-creator";

const CATEGORY_MAP: Record<string, string> = {
  "gia-dung": "Đồ gia dụng nhà bếp",
  "thoi-trang-nu": "Thời trang nữ",
  "thoi-trang-nam": "Thời trang nam",
  "cong-nghe": "Đồ công nghệ & phụ kiện",
  "my-pham": "Mỹ phẩm & skincare",
  "suc-khoe": "Sức khỏe & thực phẩm chức năng",
  "me-va-be": "Mẹ và bé",
  "nha-cua": "Nhà cửa & đồ nội thất",
  "the-thao": "Thể thao & dã ngoại",
  "thu-cung": "Thú cưng",
  "oto-xe-may": "Ô tô & xe máy",
  "do-an": "Đồ ăn & snack",
};

export interface ImageBrief {
  adFormat: string;
  visualStyle: string;
  colorPalette: string[];
  prompts: {
    safe: string;
    bold: string;
    lifestyle: string;
  };
  negativePrompt: string;
  shootingNotes: string;
}

export class ImageCreatorAgent {
  async generateBrief(
    productName: string,
    category: string,
    adPlatform: string,
    aspectRatio: string,
    mainMessage: string,
    price?: string,
  ): Promise<ImageBrief> {
    console.log(
      chalk.yellow("🎨 Đang phân tích & tạo creative brief ảnh ads...\n"),
    );

    const input: ImagePromptInput = {
      name: productName,
      category,
      adPlatform: adPlatform as any,
      aspectRatio: aspectRatio as any,
      mainMessage,
      price,
    };

    const userPrompt = buildImagePromptUserPrompt(input);
    const response = await callAI(IMAGE_PROMPT_SYSTEM, userPrompt);

    return this.parseResponse(response);
  }

  private parseResponse(text: string): ImageBrief {
    let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      return JSON.parse(cleaned);
    } catch {
      console.log(chalk.yellow("⚠️  Không parse được JSON, trả về text thô\n"));
      return {
        adFormat: "feed-square",
        visualStyle: "Product photography, clean background",
        colorPalette: ["#FFFFFF", "#F5F5F5", "#333333"],
        prompts: {
          safe: "Professional product photo, clean white background, studio lighting",
          bold: "Eye-catching product, dramatic lighting, vibrant colors",
          lifestyle: "Product in real-life setting, natural lighting",
        },
        negativePrompt: "blurry, text, watermark, low quality",
        shootingNotes: "Chụp trên nền trắng, ánh sáng studio, góc 45 độ",
      };
    }
  }

  displayBrief(brief: ImageBrief): void {
    console.log(chalk.bold.cyan("\n📸 CREATIVE BRIEF — Ảnh quảng cáo sản phẩm"));
    console.log(chalk.cyan("─".repeat(50)));

    console.log(chalk.bold("\n🎬 Format: ") + brief.adFormat);
    console.log(chalk.bold("🎨 Visual style: ") + brief.visualStyle);

    console.log(chalk.bold("\n🎨 Bảng màu đề xuất:"));
    brief.colorPalette.forEach((c) => console.log(`   ${c} ████`));

    console.log(chalk.bold("\n📝 3 Image Prompts:"));
    console.log(chalk.green("   1️⃣  SAFE: ") + brief.prompts.safe);
    console.log(chalk.green("   2️⃣  BOLD: ") + brief.prompts.bold);
    console.log(chalk.green("   3️⃣  LIFESTYLE: ") + brief.prompts.lifestyle);

    console.log(chalk.bold("\n🚫 Negative: ") + brief.negativePrompt);
    console.log(chalk.bold("\n📸 Shooting notes: ") + brief.shootingNotes);
    console.log(chalk.cyan("─".repeat(50) + "\n"));
  }
}
