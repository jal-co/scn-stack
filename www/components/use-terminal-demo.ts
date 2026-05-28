"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Step {
  type: "type" | "line" | "pause";
  text?: string;
  delay?: number;
}

const COMMAND = "npx create-scn-stack";

const STEPS: Step[] = [
  { type: "type", text: COMMAND, delay: 42 },
  { type: "pause", delay: 600 },
  { type: "line", text: "" },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Registry name  \x1b[1mmy-ui\x1b[0m", delay: 280 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Style          \x1b[1mNew York\x1b[0m", delay: 220 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Base           \x1b[1mRadix UI\x1b[0m", delay: 200 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Framework      \x1b[1mNext.js\x1b[0m", delay: 240 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Docs           \x1b[1mFumadocs\x1b[0m", delay: 200 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Components     \x1b[1mButton, Card, Badge\x1b[0m", delay: 260 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  Namespace      \x1b[1m@my-ui\x1b[0m", delay: 200 },
  { type: "line", text: "\x1b[36m◆\x1b[0m  AI skills?     \x1b[1mYes\x1b[0m", delay: 180 },
  { type: "pause", delay: 500 },
  { type: "line", text: "" },
  { type: "line", text: "\x1b[32m✓\x1b[0m Project files generated.", delay: 320 },
  { type: "line", text: "\x1b[32m✓\x1b[0m Registry configured.", delay: 280 },
  { type: "line", text: "\x1b[32m✓\x1b[0m Docs + previews configured.", delay: 300 },
  { type: "line", text: "\x1b[32m✓\x1b[0m AI skills installed.", delay: 260 },
  { type: "line", text: "\x1b[32m✓\x1b[0m Dependencies installed.", delay: 340 },
  { type: "line", text: "\x1b[32m✓\x1b[0m Git initialized.", delay: 240 },
  { type: "pause", delay: 400 },
  { type: "line", text: "" },
  { type: "line", text: "\x1b[32m✓ my-ui created with Next.js + Fumadocs. Happy building! \ud83c\udf89\x1b[0m", delay: 100 },
  { type: "pause", delay: 4000 },
];

export function useTerminalDemo() {
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(true);

  const runDemo = useCallback(async () => {
    const lines: string[] = [];
    let typingLine = "\x1b[2m$\x1b[0m ";

    setOutput(typingLine + "█");
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
          setOutput([...lines, typingLine + "█"].join("\n"));
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

    // restart loop
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
