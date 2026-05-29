import pc from "picocolors";

/**
 * scn-stack CLI branding — logo, colors, and styled output helpers.
 */

// Brand colors
const CYAN = pc.cyan;
const DIM = pc.dim;
const BOLD = pc.bold;
const GREEN = pc.green;
const WHITE = pc.white;
const YELLOW = pc.yellow;

// Logo — three horizontal bars matching the SVG brand mark.
// Top and bottom bars are the same width (22 blocks), middle bar is wider
// (26 blocks). All three are symmetrically centered around the same axis
// so the silhouette is a clean three-bar stack. Total width ~30 cols.
// Bars are rendered in bold white to match the wordmark.
const ICON = [
  `   ${BOLD(WHITE("▄".repeat(22)))}`,
  ` ${BOLD(WHITE("▄".repeat(26)))}`,
  `   ${BOLD(WHITE("▄".repeat(22)))}`,
].join("\n");

const WORDMARK = `${BOLD(WHITE("scn"))}${DIM("━━━")}${BOLD(WHITE("stack"))}`;

const LOGO = `
${ICON}

  ${WORDMARK}
  ${DIM("scaffolding for shadcn registries")}
`;

const LOGO_COMPACT = `  ${BOLD(WHITE("▄▄"))} ${WORDMARK}`;

/**
 * Return the full branded header as a string. Pass to clack's p.intro()
 * so the logo sits inside the prompt frame and connects cleanly to the
 * first prompt's gutter.
 */
export function brandedIntro(): string {
  return LOGO;
}

/**
 * Print the full branded header directly. Used by non-interactive paths
 * (init, subcommands) that don't run through p.intro().
 */
export function printHeader(): void {
  console.log(LOGO);
}

/**
 * Print a compact header. Use for subcommands like add-component, add-hook, add-block.
 */
export function printHeaderCompact(subcommand: string): void {
  console.log();
  console.log(`${LOGO_COMPACT}  ${DIM("›")} ${CYAN(subcommand)}`);
  console.log();
}

/**
 * Print a short framing block at the start of an interactive session:
 * how many prompts, what comes next, and how long it usually takes.
 */
export function printIntro(prompts: number, phases: number): void {
  console.log(`  ${DIM("›")} ${prompts} quick questions`);
  console.log(
    `  ${DIM("›")} then ${phases} setup phases (~30s with install, ~1s without)`
  );
  console.log(`  ${DIM("›")} press ${CYAN("Ctrl+C")} any time to cancel`);
  console.log();
}

/**
 * Print a multi-line description block above a prompt.
 * Use to explain what the next question means, list the options in plain
 * language, and link to authoritative docs the user can open.
 *
 * Most modern terminals (iTerm, Warp, Ghostty, VS Code, kitty) auto-link
 * bare URLs so the doc link is clickable without any extra escapes.
 *
 * All text is hard-wrapped to a stable column with the same indent so
 * wrapped lines align under the first character of the previous line
 * — not the terminal's column 0.
 */
export function printPromptHelp(
  summary: string,
  options: ReadonlyArray<readonly [string, string]> = [],
  docsUrl?: string
): void {
  const INDENT = "  ";
  const SUB_INDENT = "    ";
  const width = Math.max(40, (process.stdout.columns ?? 80) - 4);

  console.log();
  for (const line of wrap(summary, width - INDENT.length)) {
    console.log(`${INDENT}${DIM(line)}`);
  }
  for (const [name, desc] of options) {
    const head = `${SUB_INDENT}${CYAN("•")} ${BOLD(name)} `;
    const headVisible = SUB_INDENT.length + 2 + name.length + 1;
    const tailLines = wrap(`— ${desc}`, width - headVisible);
    console.log(`${head}${DIM(tailLines[0] ?? "")}`);
    for (let i = 1; i < tailLines.length; i++) {
      console.log(`${" ".repeat(headVisible)}${DIM(tailLines[i])}`);
    }
  }
  if (docsUrl) {
    console.log(`${SUB_INDENT}${DIM("docs:")} ${DIM(docsUrl)}`);
  }
}

/**
 * Word-wrap a single line to fit within `width` columns. Returns an array
 * of lines. Long unbreakable words are kept whole even if they exceed the
 * width.
 */
function wrap(text: string, width: number): string[] {
  if (width <= 0) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (current.length + 1 + word.length <= width) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Print a "Step N of M — Title" header above a prompt or phase.
 */
export function printStepHeader(
  current: number,
  total: number,
  title: string,
  description?: string
): void {
  const counter = DIM(`[${current}/${total}]`);
  console.log();
  console.log(`  ${counter} ${BOLD(title)}`);
  if (description) {
    console.log(`  ${DIM(description)}`);
  }
}

/**
 * Print a styled section divider.
 */
export function printDivider(): void {
  console.log(DIM("  ─────────────────────────────────────"));
}

/**
 * Print a "Review" box with all chosen config values for confirmation.
 */
export function printReviewBox(title: string, lines: string[]): void {
  const filtered = lines.filter(Boolean);
  const width = boxWidth(filtered, title);
  const pad = (s: string) =>
    s + " ".repeat(Math.max(0, width - 2 - stripAnsi(s).length));

  console.log();
  console.log(`  ${DIM("┌")}${DIM("─".repeat(width - 2))}${DIM("┐")}`);
  console.log(`  ${DIM("│")} ${pad(BOLD(title))} ${DIM("│")}`);
  console.log(`  ${DIM("│")} ${pad("")} ${DIM("│")}`);
  for (const line of filtered) {
    console.log(`  ${DIM("│")} ${pad(line)} ${DIM("│")}`);
  }
  console.log(`  ${DIM("│")} ${pad("")} ${DIM("│")}`);
  console.log(`  ${DIM("└")}${DIM("─".repeat(width - 2))}${DIM("┘")}`);
  console.log();
}

/**
 * Print a success summary box with file listing.
 */
export function printSummaryBox(title: string, lines: string[]): void {
  const filtered = lines.filter(Boolean);
  const width = boxWidth(filtered, title);
  const pad = (s: string) =>
    s + " ".repeat(Math.max(0, width - 2 - stripAnsi(s).length));

  console.log();
  console.log(`  ${CYAN("┌")}${DIM("─".repeat(width - 2))}${CYAN("┐")}`);
  console.log(`  ${CYAN("│")} ${pad(GREEN("✓ ") + BOLD(title))} ${CYAN("│")}`);
  console.log(`  ${CYAN("│")} ${pad("")} ${CYAN("│")}`);
  for (const line of filtered) {
    console.log(`  ${CYAN("│")} ${pad(line)} ${CYAN("│")}`);
  }
  console.log(`  ${CYAN("│")} ${pad("")} ${CYAN("│")}`);
  console.log(`  ${CYAN("└")}${DIM("─".repeat(width - 2))}${CYAN("┘")}`);
  console.log();
}

/**
 * Print the closing footer with timing.
 */
export function printFooter(message: string, durationMs?: number): void {
  const timing =
    durationMs !== undefined ? DIM(` (${formatDuration(durationMs)})`) : "";
  console.log(`  ${GREEN("✓")} ${message}${timing}`);
  console.log();
}

/**
 * Format a label: value pair for summary output.
 */
export function labelValue(label: string, value: string): string {
  return `${DIM(label.padEnd(14))} ${value}`;
}

/**
 * Inline note (used for sub-bullets under a step header).
 */
export function note(message: string): void {
  console.log(`    ${DIM("›")} ${DIM(message)}`);
}

/**
 * Render a horizontal progress bar like:
 *   ████████████░░░░░░░░  3/4  Configuring docs
 */
export function progressLine(
  current: number,
  total: number,
  label: string,
  done = false
): string {
  const width = 20;
  const filled = Math.round((current / total) * width);
  const bar =
    (done ? GREEN : CYAN)("█".repeat(filled)) +
    DIM("░".repeat(Math.max(0, width - filled)));
  const counter = DIM(`${current}/${total}`);
  return `  ${bar}  ${counter}  ${label}`;
}

/**
 * Warn the user inline (e.g. fumadocs requires Next.js fallback).
 */
export function warn(message: string): void {
  console.log(`  ${YELLOW("!")} ${message}`);
}

// ─── internals ────────────────────────────────────────────────────────────

function boxWidth(lines: string[], title: string): number {
  const maxLen = Math.max(
    ...lines.map((l) => stripAnsi(l).length),
    stripAnsi(title).length + 2
  );
  // Tight fit — just enough for the longest visible line plus padding.
  // No artificial minimum: short content gets a small box, long content a
  // big one. The previous 42-col floor created huge whitespace and pushed
  // the right border off-screen on narrow terminals.
  return maxLen + 4;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}m ${r}s`;
}

/**
 * Strip ANSI escape codes for length calculation.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
