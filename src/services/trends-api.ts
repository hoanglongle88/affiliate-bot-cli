import { ScanSource } from "../types/content";

/**
 * Source selection helpers. AI does the actual research via its own web search.
 */

export function getSourceLabel(source: ScanSource): string {
  switch (source) {
    case "tiktok":
      return "TikTok + Google Trends";
    case "youtube":
      return "YouTube + Google Trends";
    case "shopee":
      return "Shopee + Google Trends";
  }
}

export function getRandomSource(): ScanSource {
  const sources: ScanSource[] = ["tiktok", "youtube", "shopee"];
  return sources[Math.floor(Math.random() * sources.length)];
}
