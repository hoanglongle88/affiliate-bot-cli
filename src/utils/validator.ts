import { VideoScript, PostDescription, ValidationResult } from '../types/content';

export function validateScript(script: VideoScript): ValidationResult {
  const issues: string[] = [];

  // Check word count (80-120 từ)
  if (script.wordCount < 80) {
    issues.push(`Kịch bản quá ngắn (${script.wordCount} từ, cần 80-120 từ)`);
  }
  if (script.wordCount > 150) {
    issues.push(`Kịch bản quá dài (${script.wordCount} từ, cần 80-120 từ)`);
  }

  // Check hook
  if (!script.hook || script.hook.length < 10) {
    issues.push('Hook quá ngắn hoặc không có');
  }

  // Check body
  if (!script.body || script.body.length < 50) {
    issues.push('Nội dung chính quá ngắn hoặc không có');
  }

  // Check voiceover CTA
  if (!script.voiceoverCTA || script.voiceoverCTA.length < 5) {
    issues.push('Thiếu lời thoại CTA cuối video');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function validateDescription(desc: PostDescription): ValidationResult {
  const issues: string[] = [];

  // Check word count (150-250 từ)
  if (desc.wordCount < 100) {
    issues.push(`Caption quá ngắn (${desc.wordCount} từ, cần 150-250 từ)`);
  }
  if (desc.wordCount > 300) {
    issues.push(`Caption quá dài (${desc.wordCount} từ, cần 150-250 từ)`);
  }

  // Check hashtags
  if (!desc.hashtags || desc.hashtags.length < 3) {
    issues.push(`Thiếu hashtags (có ${desc.hashtags?.length || 0}, cần 5-7)`);
  }

  // Check CTA
  if (!desc.cta || desc.cta.length < 5) {
    issues.push('Thiếu CTA trong caption');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
