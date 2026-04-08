import {
  VideoScript,
  PostDescription,
  ValidationResult,
} from "../types/content";

/**
 * Count words in Vietnamese text (handles diacritics, hyphens, numbers)
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function validateScript(script: VideoScript): ValidationResult {
  const issues: string[] = [];

  // Hook: 5-20 từ
  const hookWords = countWords(script.hook);
  if (hookWords < 5) {
    issues.push(`Hook quá ngắn (${hookWords} từ, cần 5-20 từ)`);
  }
  if (hookWords > 20) {
    issues.push(`Hook quá dài (${hookWords} từ, cần 5-20 từ)`);
  }

  // Body: phải có ít nhất 1 dấu xuống dòng (≥ 2 đoạn)
  const paragraphs = script.body.split("\n").filter((p) => p.trim().length > 0);
  if (paragraphs.length < 2) {
    issues.push("Body cần ít nhất 2 đoạn (dùng xuống dòng để tách đoạn)");
  }

  // Script: không rỗng, chỉ lời thoại
  if (!script.body || script.body.trim().length === 0) {
    issues.push("Script rỗng");
  }

  // CTA: 3-15 từ
  const ctaWords = countWords(script.voiceoverCTA);
  if (ctaWords < 3) {
    issues.push(`CTA quá ngắn (${ctaWords} từ, cần 3-15 từ)`);
  }
  if (ctaWords > 15) {
    issues.push(`CTA quá dài (${ctaWords} từ, cần 3-15 từ)`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function validateDescription(desc: PostDescription): ValidationResult {
  const issues: string[] = [];

  // Headline: 3-15 từ
  const headlineWords = countWords(desc.headline);
  if (headlineWords < 3) {
    issues.push(`Headline quá ngắn (${headlineWords} từ, cần 3-15 từ)`);
  }
  if (headlineWords > 15) {
    issues.push(`Headline quá dài (${headlineWords} từ, cần 3-15 từ)`);
  }

  // Content: 30-500 ký tự
  if (desc.content.length < 30) {
    issues.push(`Content quá ngắn (${desc.content.length} ký tự, cần 30-500)`);
  }
  if (desc.content.length > 500) {
    issues.push(`Content quá dài (${desc.content.length} ký tự, tối đa 500)`);
  }

  // Offer: ≥ 10 ký tự
  if (desc.offer.length < 10) {
    issues.push(`Offer quá ngắn (${desc.offer.length} ký tự, cần ≥ 10)`);
  }

  // CTA: ≥ 5 ký tự
  if (desc.cta.length < 5) {
    issues.push(`CTA quá ngắn (${desc.cta.length} ký tự, cần ≥ 5)`);
  }

  // Hashtags: ≥ 3 items
  if (!desc.hashtags || desc.hashtags.length < 3) {
    issues.push(`Thiếu hashtags (có ${desc.hashtags?.length || 0}, cần ≥ 3)`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
