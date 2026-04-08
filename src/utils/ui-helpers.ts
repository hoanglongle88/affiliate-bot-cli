import chalk from "chalk";

// ── Box Drawing Helpers ──

const BOX_WIDTH = 58;

/**
 * Draw a colored box header with title
 */
export function boxHeader(
  title: string,
  color: typeof chalk.white = chalk.white,
): string {
  const padding = Math.max(0, BOX_WIDTH - title.length - 4);
  const padLeft = Math.floor(padding / 2);
  const padRight = padding - padLeft;

  const top = color("╔" + "═".repeat(BOX_WIDTH) + "╗");
  const mid =
    color("║") +
    " ".repeat(2 + padLeft) +
    title +
    " ".repeat(2 + padRight) +
    color("║");
  const bot = color("╚" + "═".repeat(BOX_WIDTH) + "╝");

  return `\n${top}\n${mid}\n${bot}\n`;
}

/**
 * Draw a section header (colored label + separator line)
 */
export function sectionHeader(label: string, icon: string): string {
  const line = chalk.gray("─".repeat(BOX_WIDTH));
  return `\n${chalk.gray(line)}\n${icon} ${chalk.bold.cyan(label)}\n${chalk.gray(line)}\n`;
}

/**
 * Draw a labeled field: label + value
 */
export function field(
  label: string,
  value: string,
  color: typeof chalk = chalk.white,
): string {
  return `${chalk.bold.cyan(label)} ${color(value)}\n`;
}

/**
 * Draw a labeled field with highlight color
 */
export function fieldHighlight(
  label: string,
  value: string,
  hl: typeof chalk = chalk.yellow,
): string {
  return `${chalk.bold.gray(label)} ${hl(value)}\n`;
}

/**
 * Draw a quoted text block
 */
export function quotedBlock(
  text: string,
  prefix: string = "",
  color: typeof chalk = chalk.gray,
): string {
  return (
    text
      .split("\n")
      .map((line) => `${color("│ ")}${prefix}${line}`)
      .join("\n") + "\n"
  );
}

/**
 * Draw a divider line
 */
export function divider(): string {
  return chalk.gray("─".repeat(BOX_WIDTH)) + "\n";
}

/**
 * Draw a small info block
 */
export function infoBlock(icon: string, label: string, value: string): string {
  return `${icon} ${chalk.bold(label)} ${chalk.gray(value)}\n`;
}

/**
 * Wrap text in a colored quote box
 */
export function quoteBox(
  text: string,
  borderColor: typeof chalk = chalk.cyan,
): string {
  const lines = text.split("\n");
  const border = borderColor("│");
  return (
    "\n" + lines.map((l) => `  ${border} ${chalk.white(l)}`).join("\n") + "\n"
  );
}

/**
 * Draw a status badge
 */
export function badge(
  label: string,
  color: typeof chalk = chalk.green,
): string {
  return ` ${color(` [${label}] `)} `;
}

// ── Cyberpunk Menu Helpers ──

/**
 * Draw cyberpunk-styled menu header
 */
export function cyberHeader(): string {
  const neon = chalk.hex("#00f0ff");
  const pink = chalk.hex("#ff006e");
  const W = 60;

  const border = neon("┃");
  const corner = pink("┏") + neon("━".repeat(W - 2)) + pink("┓");
  const bottom = pink("┗") + neon("━".repeat(W - 2)) + pink("┛");

  // Use raw string lengths for padding (ANSI codes inflate .length)
  const rawTitle = "⚡ AFFILIATE BOT v2.0";
  const title = pink("⚡ ") + neon.bold("AFFILIATE BOT") + pink.bold(" v2.0");
  const rawSub = "AI-Powered Content Automation";
  const subtitle = chalk.hex("#7b2ff7").italic("AI-Powered Content Automation");

  const midLine1 = border + neon("━".repeat(W - 2)) + border;
  const pad1 = Math.max(0, Math.floor((W - 2 - rawTitle.length) / 2));
  const pad2 = Math.max(0, Math.floor((W - 2 - rawSub.length) / 2));

  let out = "\n";
  out += corner + "\n";
  out +=
    border +
    " ".repeat(pad1) +
    title +
    " ".repeat(Math.max(0, W - 2 - pad1 - rawTitle.length)) +
    border +
    "\n";
  out += midLine1 + "\n";
  out +=
    border +
    " ".repeat(pad2) +
    subtitle +
    " ".repeat(Math.max(0, W - 2 - pad2 - rawSub.length)) +
    border +
    "\n";
  out += bottom + "\n";

  return out;
}

/**
 * Draw a menu section group header with cyberpunk style
 */
export function cyberSection(label: string, color: typeof chalk): string {
  const arrow = chalk.hex("#3a3a5c")("▸");
  return `\n${chalk.hex("#3a3a5c")("─".repeat(58))}\n  ${arrow} ${color.bold(label)}\n${chalk.hex("#3a3a5c")("─".repeat(58))}\n`;
}

/**
 * Draw a menu item with number key and description
 */
export function cyberMenuItem(
  key: string,
  label: string,
  description: string,
  icon: string = "",
): string {
  const neon = chalk.hex("#00f0ff");
  const keyNum = chalk.hex("#ff006e").bold(` ${key} `);
  const labelText = neon.bold(label);
  const descText = chalk.hex("#8888aa")(description);

  return `  ${keyNum} │ ${icon} ${labelText} ${descText}`;
}

/**
 * Draw a menu separator
 */
export function cyberSeparator(): string {
  return chalk.hex("#1a1a3a")("  " + "·".repeat(28) + "\n");
}

/**
 * Draw footer/status bar
 */
export function cyberFooter(): string {
  const dim = chalk.hex("#3a3a5c");
  const text = chalk.hex("#555577")(" Press ");
  const key = chalk.hex("#ff006e").bold(" Ctrl+C ");
  const text2 =
    chalk.hex("#555577")(" to exit  •  ") +
    chalk.hex("#00f0ff")("Ollama") +
    chalk.hex("#555577")(" / ") +
    chalk.hex("#00f0ff")("Gemini") +
    chalk.hex("#555577")(" AI");

  return dim("  " + "━".repeat(56)) + "\n" + text + key + text2 + "\n";
}
