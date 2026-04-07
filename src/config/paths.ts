import path from "path";

// Base output directory
export const OUTPUT_DIR = path.join(process.cwd(), "output");

// Subdirectories
export const DIRS = {
  videos: path.join(OUTPUT_DIR, "videos"), // Final MP4 videos
  audio: path.join(OUTPUT_DIR, "audio"), // Generated TTS voice files
  temp: path.join(OUTPUT_DIR, "temp"), // Intermediate files (bg, srt) - auto cleanup
  data: path.join(process.cwd(), "data"), // Persistent data (products, history) - JSON fallback
  bgm: path.join(process.cwd(), "bgm"), // User-provided background music
  exports: path.join(process.cwd(), "exports"), // Exported text files
};
