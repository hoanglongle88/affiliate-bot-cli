import fs from "fs";
import path from "path";
import { DIRS } from "../config/paths";

const USAGE_FILE = path.join(DIRS.data, "usage.json");

export interface UsageStats {
  totalCalls: number;
  byProvider: Record<string, number>;
  byFeature: Record<string, number>;
  lastReset: string;
}

function ensureFile() {
  if (!fs.existsSync(DIRS.data)) {
    fs.mkdirSync(DIRS.data, { recursive: true });
  }
  if (!fs.existsSync(USAGE_FILE)) {
    const initial: UsageStats = {
      totalCalls: 0,
      byProvider: { ollama: 0, gemini: 0 },
      byFeature: {
        trend_research: 0,
        video_script: 0,
        marketing_caption: 0,
        image_brief: 0,
      },
      lastReset: new Date().toISOString(),
    };
    fs.writeFileSync(USAGE_FILE, JSON.stringify(initial, null, 2));
  }
}

function readStats(): UsageStats {
  ensureFile();
  return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
}

function writeStats(stats: UsageStats) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(stats, null, 2));
}

export function recordUsage(provider: string, feature: string) {
  const stats = readStats();
  stats.totalCalls++;
  stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
  stats.byFeature[feature] = (stats.byFeature[feature] || 0) + 1;
  writeStats(stats);
}

export function getUsage(): UsageStats {
  return readStats();
}

export function resetUsage() {
  const stats = readStats();
  stats.totalCalls = 0;
  stats.byProvider = { ollama: 0, gemini: 0 };
  stats.byFeature = {
    trend_research: 0,
    video_script: 0,
    marketing_caption: 0,
    image_brief: 0,
  };
  stats.lastReset = new Date().toISOString();
  writeStats(stats);
}
