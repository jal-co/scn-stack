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

const LOGO = `
${CYAN("┌")}${DIM("─────────────────────────────────────")}${CYAN("┐")}
${CYAN("│")}                                     ${CYAN("│")}
${CYAN("│")}   ${BOLD(WHITE("scn"))}${DIM("━━━")}${BOLD(WHITE("stack"))}                      ${CYAN("│")}
${CYAN("│")}   ${DIM("scaffolding for shadcn registries")}  ${CYAN("│")}
${CYAN("│")}                                     ${CYAN("│")}
${CYAN("└")}${DIM("─────────────────────────────────────")}${CYAN("┘")}
`;

const LOGO_COMPACT = `  ${BOLD(WHITE("scn"))}${DIM("━━━")}${BOLD(WHITE("stack"))}`;

/**
 * Print the full branded header. Use at the start of `create-scn-stack` and `init`.
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
 * Print a styled section divider.
 */
export function printDivider(): void {
  console.log(DIM("  ─────────────────────────────────────"));
}

/**
 * Print a success summary box with file listing.
 */
export function printSummaryBox(title: string, lines: string[]): void {
  const filtered = lines.filter(Boolean);
  const maxLen = Math.max(...filtered.map((l) => stripAnsi(l).length), title.length + 2);
  const width = Math.max(maxLen + 4, 42);
  const pad = (s: string) => s + " ".repeat(Math.max(0, width - 2 - stripAnsi(s).length));

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
 * Print the closing footer.
 */
export function printFooter(message: string): void {
  console.log(`  ${GREEN("✓")} ${message}`);
  console.log();
}

/**
 * Format a label: value pair for summary output.
 */
export function labelValue(label: string, value: string): string {
  return `${DIM(label.padEnd(14))} ${value}`;
}

/**
 * Strip ANSI escape codes for length calculation.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
