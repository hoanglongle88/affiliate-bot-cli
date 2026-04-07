import fs from "fs";
import path from "path";
import { DIRS } from "../config/paths";

const VOICE_DIR = DIRS.audio;

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

  async textToSpeech(text: string): Promise<TTSResult> {
    const timestamp = Date.now();
    const audioPath = path.join(VOICE_DIR, `voice_gtts_${timestamp}.mp3`);

    console.log("🎤 Đang tạo giọng nói (Google TTS Tiếng Việt)...\n");

    await this.gttsVietnamese(text, audioPath);

    const actualDuration = this.estimateDuration(text);

    console.log(
      `✅ Đã tạo giọng nói: ${audioPath} (${actualDuration.toFixed(1)}s)\n`,
    );

    return { audioPath, duration: actualDuration, voice: "gtts-vi" };
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

  private estimateDuration(text: string): number {
    const wordCount = text.split(/\s+/).length;
    // gTTS Vietnamese ~2.5 words per second
    return wordCount / 2.5;
  }

  cleanup(audioPath: string): void {
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch {}
  }
}
