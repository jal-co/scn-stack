"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Site terminal demo \u2014 mirrors the real `npx create-scn-stack --yes`
 * output (clack frame, white logo bars, p.note boxes, phase headers,
 * outro). Lines and ANSI sequences below are copied from a live capture
 * with FORCE_COLOR=1 so the rendered look matches the TUI exactly.
 *
 * Cursor hide/show escapes (\\x1b[?25l / \\x1b[?25h) and other private-mode
 * CSI sequences are intentionally omitted \u2014 they'd render as visible
 * garbage in the browser since ansi-to-react only handles SGR.
 */

interface Step {
  type: "type" | "line" | "pause";
  text?: string;
  delay?: number;
}

const COMMAND = "npx create-scn-stack my-ui --yes";

// SGR shortcuts so the array stays readable.
const dim = (s: string) => `\x1b[2m${s}\x1b[22m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[22m`;
const white = (s: string) => `\x1b[37m${s}\x1b[39m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[39m`;
const green = (s: string) => `\x1b[32m${s}\x1b[39m`;
const gray = (s: string) => `\x1b[90m${s}\x1b[39m`;

// Build a single key/value row inside a p.note box:
//   "│  <14-char label> <value><pad>  │"
// Layout: 1(│) + 2(pad) + 14(label) + 1(sep) + N(value) + pad + 2(pad) + 1(│) = boxWidth
// → padRight = boxWidth - 21 - N
const row = (label: string, value: string, boxWidth: number): string => {
  const labelCol = dim(label.padEnd(14));
  const valueLen = stripAnsi(value).length;
  const padRight = " ".repeat(Math.max(0, boxWidth - 21 - valueLen));
  return `${gray("\u2502")}  ${labelCol} ${value}${padRight}  ${gray("\u2502")}`;
};

// Build a single-content row (no label column) inside a p.note box:
//   "│  <content><pad>  │"
// Layout: 1 + 2 + N + pad + 2 + 1 = boxWidth  →  pad = boxWidth - 6 - N
const contentRow = (content: string, boxWidth: number): string => {
  const visibleLen = stripAnsi(content).length;
  const padRight = " ".repeat(Math.max(0, boxWidth - 6 - visibleLen));
  return `${gray("\u2502")}  ${content}${padRight}  ${gray("\u2502")}`;
};

// Strip SGR codes for length math.
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// Defaults box and summary box widths — measured from a live capture of
// `create-scn-stack --yes` with FORCE_COLOR=1 (length of the body row
// after stripping ANSI). Title rows render `─╮` two columns past the
// body's right edge, which is reflected in the title-dash math below.
const DEFAULTS_W = 44;
const SUMMARY_W = 62;

// Horizontal box edges.
const dashes = (n: number) => "\u2500".repeat(n);

const STEPS: Step[] = [
  // Prompt + command typed
  { type: "type", text: COMMAND, delay: 38 },
  { type: "pause", delay: 450 },
  { type: "line", text: "" },

  // ── Branded intro (p.intro opens the frame with ┌) ─────────────────
  { type: "line", text: `${gray("\u250c")}`, delay: 80 },
  {
    type: "line",
    text: `   ${bold(white("\u2584".repeat(22)))}`,
    delay: 30,
  },
  {
    type: "line",
    text: ` ${bold(white("\u2584".repeat(26)))}`,
    delay: 30,
  },
  {
    type: "line",
    text: `   ${bold(white("\u2584".repeat(22)))}`,
    delay: 30,
  },
  { type: "line", text: "" },
  {
    type: "line",
    text: `  ${bold(white("scn"))}${dim("\u2501\u2501\u2501")}${bold(white("stack"))}`,
    delay: 80,
  },
  {
    type: "line",
    text: `  ${dim("scaffolding for shadcn registries")}`,
    delay: 200,
  },
  { type: "line", text: "" },

  // ── Defaults applied box ───────────────────────────────────────────
  { type: "line", text: gray("\u2502"), delay: 80 },
  // Title row visible width = boxWidth + 2 (the title's ─╮ bleeds 2 cols
  // past the body's right edge). Layout:
  //   1(◇) + 2(pad) + 34(title) + 1(sep) + dashes + 1(╮) = boxWidth + 2
  // → dashes = boxWidth + 2 - 39 = boxWidth - 37
  {
    type: "line",
    text: `${green("\u25c7")}  Defaults applied (--yes) for my-ui ${gray(dashes(DEFAULTS_W - 37) + "\u256e")}`,
    delay: 220,
  },
  {
    type: "line",
    text: `${gray("\u2502")}${" ".repeat(DEFAULTS_W - 2)}${gray("\u2502")}`,
    delay: 40,
  },
  { type: "line", text: row("Directory:", "./my-ui", DEFAULTS_W), delay: 60 },
  { type: "line", text: row("Style:", "new-york", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Base:", "radix", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Framework:", "nextjs", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Docs:", "fumadocs", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Components:", "essentials", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Monorepo:", "no", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Namespace:", "@my-ui", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("Package mgr:", "pnpm", DEFAULTS_W), delay: 50 },
  { type: "line", text: row("AI skills:", "yes", DEFAULTS_W), delay: 50 },
  {
    type: "line",
    text: `${gray("\u2502")}${" ".repeat(DEFAULTS_W - 2)}${gray("\u2502")}`,
    delay: 40,
  },
  // Bottom edge visible width = boxWidth - 4 (├ + dashes + ╯, with the
  // ╯ landing 4 cols inside the body's right │ because clack uses
  // single-line connectors back into the outer frame).
  {
    type: "line",
    text: `${gray("\u251c" + dashes(DEFAULTS_W - 6) + "\u256f")}`,
    delay: 80,
  },

  // ── Phase 1 ────────────────────────────────────────────────────────
  { type: "line", text: "" },
  { type: "line", text: `  ${dim("[1/4]")} ${bold("Project scaffold")}`, delay: 200 },
  { type: "line", text: `  ${dim("Next.js \u00b7 ./my-ui")}`, delay: 80 },
  { type: "line", text: gray("\u2502"), delay: 50 },
  {
    type: "line",
    text: `${green("\u25c7")}  Next.js project generated`,
    delay: 320,
  },

  // ── Phase 2 ────────────────────────────────────────────────────────
  { type: "line", text: "" },
  { type: "line", text: `  ${dim("[2/4]")} ${bold("Registry & components")}`, delay: 200 },
  {
    type: "line",
    text: `  ${dim("style: new-york \u00b7 namespace: @my-ui")}`,
    delay: 80,
  },
  { type: "line", text: gray("\u2502"), delay: 50 },
  { type: "line", text: `${green("\u25c7")}  Registry configured`, delay: 260 },
  {
    type: "line",
    text: `${green("\u25c7")}  Starter components added: Button, Card, Badge`,
    delay: 300,
  },

  // ── Phase 3 ────────────────────────────────────────────────────────
  { type: "line", text: "" },
  { type: "line", text: `  ${dim("[3/4]")} ${bold("Docs, theme & extras")}`, delay: 200 },
  {
    type: "line",
    text: `  ${dim("fumadocs docs \u00b7 theme \u00b7 v0 \u00b7 previews \u00b7 registry skill \u00b7 llms.txt")}`,
    delay: 80,
  },
  { type: "line", text: gray("\u2502"), delay: 50 },
  {
    type: "line",
    text: `${green("\u25c7")}  Fumadocs documentation configured`,
    delay: 300,
  },
  {
    type: "line",
    text: `${green("\u25c7")}  Extras ready (theme, llms.txt, v0, previews, config, README)`,
    delay: 320,
  },

  // ── Phase 4 (install + git) ────────────────────────────────────────
  { type: "line", text: "" },
  { type: "line", text: `  ${dim("[4/4]")} ${bold("Install & finalize")}`, delay: 200 },
  {
    type: "line",
    text: `  ${dim("pnpm install \u00b7 git init \u00b7 shadcn skill")}`,
    delay: 80,
  },
  { type: "line", text: gray("\u2502"), delay: 50 },
  {
    type: "line",
    text: `${green("\u25c7")}  Dependencies installed`,
    delay: 700,
  },
  { type: "line", text: `${green("\u25c7")}  shadcn skill installed`, delay: 400 },
  { type: "line", text: `${green("\u25c7")}  Git repository initialized`, delay: 280 },

  // ── Summary p.note ─────────────────────────────────────────────────
  { type: "line", text: gray("\u2502"), delay: 60 },
  // Title row visible width = boxWidth + 2. Layout:
  //   1(◇) + 2(pad) + 1(✓) + 1(sep) + 13("my-ui created") + 1(sep)
  //   + dashes + 1(╮) = boxWidth + 2
  // → dashes = boxWidth - 18
  {
    type: "line",
    text: `${green("\u25c7")}  ${green("\u2713")} my-ui created ${gray(dashes(SUMMARY_W - 18) + "\u256e")}`,
    delay: 260,
  },
  {
    type: "line",
    text: `${gray("\u2502")}${" ".repeat(SUMMARY_W - 2)}${gray("\u2502")}`,
    delay: 40,
  },
  { type: "line", text: row("Framework:", "Next.js", SUMMARY_W), delay: 50 },
  { type: "line", text: row("Docs:", "Fumadocs", SUMMARY_W), delay: 50 },
  { type: "line", text: row("Namespace:", cyan("@my-ui"), SUMMARY_W), delay: 50 },
  { type: "line", text: contentRow(`${cyan("cd")} my-ui`, SUMMARY_W), delay: 50 },
  { type: "line", text: contentRow(cyan("pnpm dev"), SUMMARY_W), delay: 50 },
  {
    type: "line",
    text: row("Registry:", "http://localhost:3000/r/registry.json", SUMMARY_W),
    delay: 60,
  },
  {
    type: "line",
    text: row("Docs URL:", "http://localhost:3000/docs", SUMMARY_W),
    delay: 60,
  },
  {
    type: "line",
    text: row("Build:", cyan("pnpm registry:build"), SUMMARY_W),
    delay: 60,
  },
  {
    type: "line",
    text: `${gray("\u2502")}${" ".repeat(SUMMARY_W - 2)}${gray("\u2502")}`,
    delay: 40,
  },
  {
    type: "line",
    text: `${gray("\u251c" + dashes(SUMMARY_W - 6) + "\u256f")}`,
    delay: 80,
  },

  // ── Outro (p.outro closes the frame with └) ────────────────────────
  { type: "line", text: gray("\u2502"), delay: 60 },
  {
    type: "line",
    text: `${gray("\u2514")}  ${bold("my-ui")} ready with Next.js + Fumadocs in ${dim("4.2s")} \ud83c\udf89`,
    delay: 200,
  },

  // Hold the finished frame for a beat, then loop.
  { type: "pause", delay: 5000 },
];

export function useTerminalDemo() {
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(true);

  const runDemo = useCallback(async () => {
    const lines: string[] = [];
    let typingLine = `${dim("$")} `;

    setOutput(typingLine + "\u2588");
    setIsStreaming(true);

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, ms);
      });

    for (const step of STEPS) {
      if (!mountedRef.current) return;

      if (step.type === "type" && step.text) {
        for (const char of step.text) {
          if (!mountedRef.current) return;
          typingLine += char;
          setOutput([...lines, typingLine + "\u2588"].join("\n"));
          await wait(step.delay ?? 42);
        }
        lines.push(typingLine);
        typingLine = "";
        setOutput(lines.join("\n"));
        await wait(120);
      } else if (step.type === "line") {
        lines.push(step.text ?? "");
        setOutput(lines.join("\n"));
        await wait(step.delay ?? 160);
      } else if (step.type === "pause") {
        await wait(step.delay ?? 400);
      }
    }

    setIsStreaming(false);

    // Restart the demo on a loop so the landing page always animates.
    if (mountedRef.current) {
      await wait(2000);
      if (mountedRef.current) {
        runDemo();
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const delay = setTimeout(() => {
      if (mountedRef.current) {
        runDemo();
      }
    }, 1800);

    return () => {
      mountedRef.current = false;
      clearTimeout(delay);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runDemo]);

  return { output, isStreaming };
}
