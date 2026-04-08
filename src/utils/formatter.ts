import chalk from "chalk";
import clipboard from "clipboardy";
import {
  GeneratedContent,
  VideoScript,
  PostDescription,
} from "../types/content";
import {
  boxHeader,
  sectionHeader,
  field,
  fieldHighlight,
  quotedBlock,
  divider,
  infoBlock,
  quoteBox,
  badge,
} from "./ui-helpers";

// ── Video Script Output ──

export function formatScriptOutput(script: VideoScript): string {
  const platformEmojis: Record<string, string> = {
    tiktok: "📱",
    youtube: "▶️",
    facebook_reels: "📘",
    instagram_reels: "📸",
    facebook_ads: "📢",
  };
  const platformNames: Record<string, string> = {
    tiktok: "TIKTOK",
    youtube: "YOUTUBE SHORTS",
    facebook_reels: "FACEBOOK REELS",
    instagram_reels: "INSTAGRAM REELS",
    facebook_ads: "FACEBOOK ADS",
  };

  const emoji = platformEmojis[script.platform] || "🎬";
  const platformName = platformNames[script.platform] || "VIDEO";

  let out = "";

  // Main box header
  out += boxHeader(`${emoji} ${platformName} — VIDEO SCRIPT`, chalk.cyan);

  // Title
  out += field("🎬 Tiêu đề:", script.title, chalk.white.bold);

  // Hook section
  out += sectionHeader("HOOK (Mở đầu)", "🎣");
  out += quoteBox(script.hook, chalk.red);

  // Body section
  out += sectionHeader("NỘI DUNG CHÍNH", "📝");
  out += "\n" + chalk.white(script.body) + "\n\n";

  // CTA section
  out += sectionHeader("CALL TO ACTION", "📢");
  out += quoteBox(script.voiceoverCTA, chalk.yellow.bold);

  // Footer info
  out += divider();
  out += infoBlock("📊", "Độ dài:", `~${script.wordCount} từ`);
  out += infoBlock("⏱️", "Thời lượng:", script.estimatedDuration);
  out += divider();

  return out;
}

// ── Post Description Output ──

export function formatDescriptionOutput(desc: PostDescription): string {
  const platformEmojis: Record<string, string> = {
    tiktok: "📱",
    youtube: "▶️",
    facebook_reels: "📘",
    instagram_reels: "📸",
    facebook_ads: "📢",
  };
  const platformNames: Record<string, string> = {
    tiktok: "TIKTOK",
    youtube: "YOUTUBE SHORTS",
    facebook_reels: "FACEBOOK REELS",
    instagram_reels: "INSTAGRAM REELS",
    facebook_ads: "FACEBOOK ADS",
  };

  const emoji = platformEmojis[desc.platform] || "📝";
  const platformName = platformNames[desc.platform] || "POST";

  let out = "";

  // Main box header
  out += boxHeader(`${emoji} ${platformName} — POST DESCRIPTION`, chalk.cyan);

  // Headline
  if (desc.headline) {
    out += sectionHeader("HEADLINE", "🔥");
    out += quoteBox(desc.headline, chalk.yellow.bold);
  }

  // Content
  if (desc.content) {
    out += sectionHeader("CONTENT", "📝");
    out += "\n" + chalk.white(desc.content) + "\n\n";
  }

  // Offer
  if (desc.offer) {
    out += sectionHeader("OFFER / URGENCY", "⚡");
    out += quoteBox(desc.offer, chalk.magenta.bold);
  }

  // CTA
  if (desc.cta) {
    out += sectionHeader("CALL TO ACTION", "👉");
    out += quoteBox(desc.cta, chalk.blue.bold);
  }

  // Hashtags
  const hashTags = desc.hashtags.map((t) => chalk.green(`#${t}`)).join(" ");
  out += sectionHeader("HASHTAGS", "🏷️");
  out += `\n  ${hashTags}\n\n`;

  // Final caption preview
  if (desc.caption) {
    out += sectionHeader("CAPTION HOÀN CHỈNH (SẴN ĐĂNG)", "📋");
    const captionLines = desc.caption.split("\n");
    out += "\n";
    captionLines.forEach((line) => {
      if (line.trim().startsWith("#")) {
        out += chalk.gray("│ ") + chalk.green(line) + "\n";
      } else if (
        line.trim().startsWith("🔥") ||
        line.trim().startsWith("⚡") ||
        line.trim().startsWith("👉")
      ) {
        out += chalk.gray("│ ") + chalk.yellow(line) + "\n";
      } else {
        out += chalk.gray("│ ") + chalk.white(line) + "\n";
      }
    });
    out += chalk.gray("│\n");
  }

  // Footer
  out += divider();
  out += infoBlock("📊", "Độ dài:", `~${desc.wordCount} từ`);
  out += divider();

  return out;
}

// ── Full Output (Script + Description) ──

export function formatFullOutput(content: GeneratedContent): string {
  let output = "";

  if (content.script) {
    output += formatScriptOutput(content.script);
  }

  if (content.description) {
    output += formatDescriptionOutput(content.description);
  }

  return output;
}

// ── Clipboard ──

export async function copyToClipboard(
  text: string,
  label: string,
): Promise<void> {
  try {
    await clipboard.write(text);
    console.log(chalk.green(`\n📋 Đã copy "${label}" vào clipboard!\n`));
  } catch {
    console.log(chalk.yellow("\n⚠️  Không thể copy vào clipboard\n"));
  }
}

// ── Plain Text Extractors ──

export function getScriptText(script: VideoScript): string {
  return `[${script.title}]
Hook: ${script.hook}
${script.body}
CTA: ${script.voiceoverCTA}`;
}

export function getDescriptionText(desc: PostDescription): string {
  const hashTags = desc.hashtags.map((t) => `#${t}`).join(" ");
  return desc.caption
    ? desc.caption
    : `${desc.headline}

${desc.content}

⚡ ${desc.offer}

👉 ${desc.cta}

${hashTags}`;
}

export function getFullText(content: GeneratedContent): string {
  let text = "";

  if (content.script) {
    text += `═══ ${content.script.platform.toUpperCase()} SCRIPT ═══\n`;
    text += getScriptText(content.script);
    text += "\n\n";
  }

  if (content.description) {
    text += `═══ ${content.description.platform.toUpperCase()} POST DESCRIPTION ═══\n`;
    text += getDescriptionText(content.description);
  }

  return text;
}
