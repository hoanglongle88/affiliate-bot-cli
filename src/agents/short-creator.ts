import chalk from "chalk";
import { callAI } from "../services/ai-orchestrator";
import {
  SHORT_CREATOR_SYSTEM_PROMPT,
  buildShortCreatorUserPrompt,
} from "../prompts/short-creator";
import type { ShortVideoPrompt, VideoScript } from "../types/content";

export interface ShortVideoPromptWithTimeline extends ShortVideoPrompt {
  totalDuration: string;
  visualStyle: string;
  timeline: Array<{
    range: string; // "00s-05s"
    content: string; // Lời thoại tương ứng
    prompt: string; // English prompt for Veo
  }>;
  videoPromptFull: string;
}

export class ShortCreatorAgent {
  /**
   * Generate video prompt từ VideoScript
   */
  async generatePromptFromScript(
    productName: string,
    script: VideoScript,
  ): Promise<ShortVideoPromptWithTimeline> {
    const userPrompt = buildShortCreatorUserPrompt(productName, {
      platform: script.platform,
      hook: script.hook,
      body: script.body,
      voiceoverCTA: script.voiceoverCTA,
      estimatedDuration: script.estimatedDuration,
    });

    const startTime = Date.now();
    const loadingInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(
        chalk.gray(`\r   ⏳ Đang tạo storyboard timeline... ${elapsed}s`),
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

  private parseResponse(text: string): ShortVideoPromptWithTimeline {
    let cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    try {
      const data = JSON.parse(cleaned);

      const timeline: Array<{
        range: string;
        content: string;
        prompt: string;
      }> = Array.isArray(data.timeline)
        ? data.timeline.map((seg: any) => ({
            range: seg.range || "00s-00s",
            content: seg.content || "",
            prompt: seg.prompt || "",
          }))
        : [];

      return {
        totalDuration: data.totalDuration || "30s",
        visualStyle: data.visualStyle || "Phong cách thực tế, năng động",
        videoPrompt: data.videoPromptFull || "",
        aspectRatio: "9:16",
        visualQuality: "1080p, 60fps",
        styleAnalysis: data.visualStyle || "",
        timeline,
        videoPromptFull: data.videoPromptFull || "",
      };
    } catch {
      console.log(
        chalk.yellow("⚠️  Không parse được JSON, dùng dữ liệu mặc định\n"),
      );
      return {
        totalDuration: "30s",
        visualStyle: "Phong cách video thực tế",
        styleAnalysis: "Phong cách video thực tế",
        videoPrompt: `Hyper-realistic product showcase video, cinematic lighting, smooth camera movement, 9:16 aspect ratio`,
        aspectRatio: "9:16",
        visualQuality: "1080p, 60fps",
        timeline: [],
        videoPromptFull: `Hyper-realistic product showcase video, cinematic lighting, smooth camera movement, 9:16 aspect ratio`,
      };
    }
  }

  displayPrompt(prompt: ShortVideoPromptWithTimeline): void {
    let out = "";
    out += chalk.bold.cyan("\n🎬 STORYBOARD TIMELINE — AI Veo Prompt\n");
    out += chalk.cyan("─".repeat(50)) + "\n";
    out +=
      chalk.bold("\n📊 Tổng thời lượng: ") + chalk.white(prompt.totalDuration);
    out += chalk.bold("\n🎨 Visual style: ") + chalk.white(prompt.visualStyle);
    out += chalk.bold("\n📐 Tỷ lệ: ") + chalk.white(prompt.aspectRatio);
    out += chalk.bold("\n📊 Chất lượng: ") + chalk.white(prompt.visualQuality);

    // Display timeline segments
    if (prompt.timeline.length > 0) {
      out += "\n\n";
      out += chalk.bold.cyan("📋 TIMELINE CHI TIẾT:\n");
      out += chalk.gray("─".repeat(50)) + "\n";

      for (const seg of prompt.timeline) {
        out += chalk.bold.magenta(`\n⏱️  ${seg.range}\n`);
        out +=
          chalk.gray("🗣️  Lời thoại:\n") + chalk.white(`  ${seg.content}\n`);
        out +=
          chalk.gray("🎬 Veo Prompt:\n") + chalk.yellow(`  ${seg.prompt}\n`);
      }
      out += chalk.gray("─".repeat(50)) + "\n";
    }

    // Display full prompt
    if (prompt.videoPromptFull) {
      out += "\n";
      out += chalk.bold.green("🎬 FULL VIDEO PROMPT (cho Veo gen 1 shot):\n");
      out += chalk.gray("  " + "═".repeat(46)) + "\n";
      out += chalk.yellow(`  ${prompt.videoPromptFull}`) + "\n";
      out += chalk.gray("  " + "═".repeat(46)) + "\n";
    }

    console.log(out);
  }
}
