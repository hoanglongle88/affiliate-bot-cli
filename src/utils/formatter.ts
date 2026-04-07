import chalk from "chalk";
import clipboard from "clipboardy";
import {
  GeneratedContent,
  VideoScript,
  PostDescription,
} from "../types/content";

export function formatScriptOutput(script: VideoScript): string {
  const platformLabel =
    script.platform === "tiktok" ? "📱 TIKTOK" : "▶️ YOUTUBE SHORTS";

  let output = "";

  output += chalk.bold.cyan(`\n${platformLabel} SCRIPT\n`);
  output += chalk.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

  output +=
    chalk.bold.yellow("🎬 Tiêu đề: ") + chalk.white(script.title) + "\n\n";

  output +=
    chalk.bold.green("🎣 Hook (3 giây đầu):\n") +
    chalk.red.bold(`  "${script.hook}"`) +
    "\n\n";

  output +=
    chalk.bold.magenta("📝 Nội dung chính:\n") +
    chalk.white(`  ${script.body}`) +
    "\n\n";

  output +=
    chalk.bold.blue("📢 Voiceover CTA (lời thoại cuối video):\n") +
    chalk.yellow(`  ${script.voiceoverCTA}`) +
    "\n\n";

  output += chalk.gray(
    `📊 Độ dài: ~${script.wordCount} từ | ⏱️ ${script.estimatedDuration}\n`,
  );

  return output;
}

export function formatDescriptionOutput(desc: PostDescription): string {
  const platformLabel =
    desc.platform === "tiktok" ? "📱 TIKTOK" : "▶️ YOUTUBE SHORTS";

  let output = "";

  output += chalk.bold.cyan(`\n${platformLabel} POST DESCRIPTION\n`);
  output += chalk.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

  output +=
    chalk.bold.yellow("📝 Caption:\n") +
    chalk.white(`  ${desc.caption}`) +
    "\n\n";

  output +=
    chalk.bold.cyan("🏷️ Hashtags:\n") +
    chalk.cyan(`  ${desc.hashtags.join(" ")}`) +
    "\n\n";

  output += chalk.gray(`📊 Độ dài: ~${desc.wordCount} từ\n`);

  return output;
}

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

export function getScriptText(script: VideoScript): string {
  return `[${script.title}]
Hook: ${script.hook}
${script.body}
CTA: ${script.voiceoverCTA}`;
}

export function getDescriptionText(desc: PostDescription): string {
  return `${desc.caption}
${desc.hashtags.join(" ")}`;
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
