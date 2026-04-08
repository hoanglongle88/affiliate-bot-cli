import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import { SHORT_CREATOR_SYSTEM_PROMPT, buildShortCreatorUserPrompt } from "../prompts/short-creator";
import { Platform } from "../types/content";
import type { ShortVideoPrompt } from "../types/content";

export class ShortCreatorAgent {
  async generatePrompt(
    productName: string,
    visualCues: string[],
    angle: string,
    platform: Platform,
  ): Promise<ShortVideoPrompt> {
    const userPrompt = buildShortCreatorUserPrompt(
      productName,
      visualCues,
      angle,
      platform,
    );

    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        chalk.gray(`\r   ⏳ Đang tạo video prompt... ${elapsed}s`),
      );
    }, 500);

    const response = await callAI(
      SHORT_CREATOR_SYSTEM_PROMPT,
      userPrompt,
      "short_video_prompt",
    );
    clearInterval(loadingInterval);
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    return this.parseResponse(response);
  }

  private parseResponse(text: string): ShortVideoPrompt {
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      const data = JSON.parse(cleaned);
      return {
        styleAnalysis: data.styleAnalysis || "Phong cách thực tế, năng động",
        videoPrompt: data.videoPrompt || `Product showcase video, cinematic lighting, ${data.aspectRatio || "9:16"}`,
        aspectRatio: data.aspectRatio || "9:16",
        visualQuality: data.visualQuality || "1080p, 60fps",
      };
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng dữ liệu mặc định\n"),
      );
      return {
        styleAnalysis: "Phong cách video thực tế",
        videoPrompt: `Hyper-realistic product showcase video, cinematic lighting, smooth camera movement, 9:16 aspect ratio`,
        aspectRatio: "9:16",
        visualQuality: "1080p, 60fps",
      };
    }
  }

  displayPrompt(prompt: ShortVideoPrompt): void {
    let out = "";
    out += chalk.bold.cyan("\n🎬 VIDEO PROMPT — AI Video Generation\n");
    out += chalk.cyan("─".repeat(50)) + "\n";
    out += chalk.bold("\n🎨 Phong cách: ") + chalk.white(prompt.styleAnalysis);
    out += chalk.bold("\n📐 Tỷ lệ: ") + chalk.white(prompt.aspectRatio);
    out += chalk.bold("\n📊 Chất lượng: ") + chalk.white(prompt.visualQuality);
    out += "\n\n";
    out += chalk.bold.green("📝 VIDEO PROMPT (EN):\n");
    out += chalk.gray("  " + "─".repeat(46)) + "\n";
    out += chalk.yellow(`  ${prompt.videoPrompt}`) + "\n";
    out += chalk.gray("  " + "─".repeat(46)) + "\n";
    console.log(out);
  }
}
