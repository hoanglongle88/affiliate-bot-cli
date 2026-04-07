import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { DIRS } from "../config/paths";

const VOICE_DIR = DIRS.audio;

export type VoiceType = "macos-linh" | "gtts-vi";

export interface TTSResult {
  audioPath: string;
  duration: number;
  voice: string;
}

export class TTSService {
  constructor() {
    if (!fs.existsSync(VOICE_DIR)) {
      fs.mkdirSync(VOICE_DIR, { recursive: true });
    }
  }

  async textToSpeech(
    text: string,
    voice: VoiceType = "macos-linh",
  ): Promise<TTSResult> {
    const timestamp = Date.now();
    const audioPath = path.join(VOICE_DIR, `voice_${voice}_${timestamp}.mp3`);

    console.log(
      `🎤 Đang tạo giọng nói (${voice === "macos-linh" ? "macOS Linh (tự nhiên)" : "Google TTS"})...`,
    );

    try {
      if (voice === "macos-linh") {
        await this.macosVietnamese(text, audioPath);
      } else {
        await this.gttsVietnamese(text, audioPath);
      }

      const actualDuration = this.getAudioDuration(audioPath);

      console.log(
        `✅ Đã tạo giọng nói: ${audioPath} (${actualDuration.toFixed(1)}s)`,
      );

      return { audioPath, duration: actualDuration, voice };
    } catch (error) {
      console.error("❌ Lỗi TTS:", error);
      throw new Error("Không thể tạo giọng nói");
    }
  }

  private async macosVietnamese(text: string, mp3Path: string): Promise<void> {
    const aiffPath = mp3Path.replace(".mp3", ".aiff");

    // Split long text into chunks (say command has ~250 char limit per chunk)
    const chunks = this.splitText(text, 200);

    if (chunks.length === 1) {
      // Single chunk - direct say
      const escapedText = text.replace(/"/g, '\\"').replace(/\\/g, "\\\\");
      execSync(`say -v "Linh" -r 170 -o "${aiffPath}" "${escapedText}"`, {
        stdio: "pipe",
      });
    } else {
      // Multiple chunks - say each, then combine with ffmpeg
      const chunkFiles: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkAiff = path.join(VOICE_DIR, `chunk_${i}_${Date.now()}.aiff`);
        const escapedChunk = chunks[i]
          .replace(/"/g, '\\"')
          .replace(/\\/g, "\\\\");

        execSync(`say -v "Linh" -r 170 -o "${chunkAiff}" "${escapedChunk}"`, {
          stdio: "pipe",
        });

        chunkFiles.push(chunkAiff);
      }

      // Combine chunks by concatenating AIFF files
      // Use cat for simple concatenation (works with same-format AIFF)
      const combinedCmd = `cat ${chunkFiles.map((f) => `"${f}"`).join(" ")} > "${aiffPath}"`;
      execSync(combinedCmd, { stdio: "pipe" });

      // Cleanup chunk files
      chunkFiles.forEach((f) => {
        try {
          fs.unlinkSync(f);
        } catch {}
      });
    }

    // Convert AIFF to MP3 using macOS builtin afconvert
    try {
      execSync(`afconvert -f MP3f -d MP3 "${aiffPath}" "${mp3Path}"`, {
        stdio: "pipe",
      });
    } catch {
      // Fallback: just copy AIFF as MP3 (less optimal but works)
      console.log("⚠️  afconvert thất bại, giữ nguyên AIFF format");
      fs.copyFileSync(aiffPath, mp3Path);
    }

    // Cleanup AIFF
    try {
      fs.unlinkSync(aiffPath);
    } catch {}
  }

  private gttsVietnamese(text: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const gtts = require("gtts");
      const tts = new gtts(text, "vi");
      tts.save(outputPath, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private getAudioDuration(audioPath: string): number {
    try {
      // Use macOS builtin afinfo
      const output = execSync(`afinfo "${audioPath}" 2>&1`, {
        encoding: "utf-8",
      });

      const durationMatch = output.match(/estimated duration:\s+([\d.]+)/);
      if (durationMatch) {
        return parseFloat(durationMatch[1]);
      }

      return 5; // fallback
    } catch {
      return 5; // fallback
    }
  }

  private splitText(text: string, maxLen: number): string[] {
    const sentences = text.split(/(?<=[.!?,;])\s+/);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + " " + sentence).trim().length > maxLen && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += " " + sentence;
      }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  async generateScriptAudio(
    hook: string,
    body: string,
    cta: string,
    voice: VoiceType = "macos-linh",
  ): Promise<TTSResult> {
    const fullText = `${hook} ${body} ${cta}`.trim();
    return await this.textToSpeech(fullText, voice);
  }

  cleanup(audioPath: string): void {
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch {}
  }

  getAvailableVoices(): { name: string; value: VoiceType }[] {
    return [
      {
        name: "👩  macOS Linh (Tiếng Việt) — Tự nhiên nhất",
        value: "macos-linh",
      },
      { name: "🌐  Google TTS Vietnamese", value: "gtts-vi" },
    ];
  }
}
