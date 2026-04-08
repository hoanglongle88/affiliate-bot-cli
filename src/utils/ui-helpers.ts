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
  const mid = color("║") + " ".repeat(2 + padLeft) + title + " ".repeat(2 + padRight) + color("║");
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
export function field(label: string, value: string, color: typeof chalk = chalk.white): string {
  return `${chalk.bold.cyan(label)} ${color(value)}\n`;
}

/**
 * Draw a labeled field with highlight color
 */
export function fieldHighlight(label: string, value: string, hl: typeof chalk = chalk.yellow): string {
  return `${chalk.bold.gray(label)} ${hl(value)}\n`;
}

/**
 * Draw a quoted text block
 */
export function quotedBlock(text: string, prefix: string = "", color: typeof chalk = chalk.gray): string {
  return text
    .split("\n")
    .map((line) => `${color("│ ")}${prefix}${line}`)
    .join("\n") + "\n";
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
export function quoteBox(text: string, borderColor: typeof chalk = chalk.cyan): string {
  const lines = text.split("\n");
  const border = borderColor("│");
  return (
    "\n" +
    lines.map((l) => `  ${border} ${chalk.white(l)}`).join("\n") +
    "\n"
  );
}

/**
 * Draw a status badge
 */
export function badge(label: string, color: typeof chalk = chalk.green): string {
  return ` ${color(` [${label}] `)} `;
}
