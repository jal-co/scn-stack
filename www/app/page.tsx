"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Marquee from "react-fast-marquee";
import {
  ArrowRightIcon,
} from "@/components/icons";
import { CopyButton } from "@/components/copy-button";
import { useTerminalDemo } from "@/components/use-terminal-demo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalActions,
  TerminalCopyButton,
  TerminalContent,
} from "@/components/ai-elements/terminal";



const stackLogos = [
  { src: "/logos/nextjs.svg", alt: "Next.js", label: "Next.js" },
  { src: "/logos/vite.svg", alt: "Vite", label: "Vite" },
  { src: "/logos/react-router.svg", alt: "React Router", label: "React Router" },
  { src: "/logos/tanstack.svg", alt: "TanStack", label: "TanStack" },
  { src: "/logos/radix.svg", alt: "Radix UI", label: "Radix UI" },
  { src: "/logos/baseui.svg", alt: "Base UI", label: "Base UI" },
  { src: "/logos/turborepo.svg", alt: "Turborepo", label: "Turborepo" },
];

const toolLogos = [
  { src: "/logos/fumadocs.svg", alt: "Fumadocs", label: "Fumadocs" },
  { src: "/logos/mintlify.svg", alt: "Mintlify", label: "Mintlify" },
  { src: "/logos/astro.svg", alt: "Starlight", label: "Starlight" },
  { src: "/logos/claude.svg", alt: "Claude", label: "Claude" },
  { src: "/logos/cursor.svg", alt: "Cursor", label: "Cursor" },
  { src: "/logos/copilot.svg", alt: "GitHub Copilot", label: "Copilot" },
  { src: "/logos/codex.svg", alt: "Codex", label: "Codex" },
];


export default function Home() {
  const terminalCardRef = useRef<HTMLDivElement>(null);
  const { output: terminalOutput, isStreaming: terminalStreaming } = useTerminalDemo();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return;
    }

    let frame = 0;

    const setTerminalRotation = (
      rotateX = 0,
      rotateY = 0,
      lightX = 50,
      lightY = 42
    ) => {
      const card = terminalCardRef.current;

      if (!card) {
        return;
      }

      card.style.setProperty("--terminal-rotate-x", `${rotateX}deg`);
      card.style.setProperty("--terminal-rotate-y", `${rotateY}deg`);
      card.style.setProperty("--terminal-light-x", `${lightX}%`);
      card.style.setProperty("--terminal-light-y", `${lightY}%`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const card = terminalCardRef.current;

        if (!card) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const relativeX = (event.clientX - cardCenterX) / (window.innerWidth / 2);
        const relativeY = (event.clientY - cardCenterY) / (window.innerHeight / 2);
        const rotateY = Math.max(-2.2, Math.min(2.2, relativeX * 2.2));
        const rotateX = Math.max(-1.8, Math.min(1.8, relativeY * -1.8));
        const lightX = Math.max(28, Math.min(72, 50 + relativeX * 18));
        const lightY = Math.max(18, Math.min(62, 42 + relativeY * 14));

        setTerminalRotation(rotateX, rotateY, lightX, lightY);
      });
    };

    const resetTerminalRotation = () => setTerminalRotation();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetTerminalRotation);
    window.addEventListener("blur", resetTerminalRotation);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetTerminalRotation);
      window.removeEventListener("blur", resetTerminalRotation);
    };
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero */}
      <section className="hero-bg relative overflow-x-clip pb-0">
        <SiteHeader />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-24">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-50 md:text-6xl">
              Scaffold a complete shadcn registry.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              One command. Framework, docs, starter components, live previews,
              AI skills, ready to develop and deploy.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-4 py-2 font-mono text-sm text-zinc-100 shadow-sm shadow-black/20">
                <span className="text-zinc-500">$</span>
                <code>npx create-scn-stack</code>
                <CopyButton text="npx create-scn-stack" />
              </div>
              <Link
                href="/docs"
                className="group inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Get Started
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.09]"
              >
                Builder
              </Link>
            </div>

            {/* Terminal laptop */}
            <div className="macbook-stage relative mt-10 w-full max-w-5xl text-left">
              <div className="macbook-glow" aria-hidden="true" />
              <div className="macbook-glow-grain" aria-hidden="true" />
              <div
                ref={terminalCardRef}
                className="macbook-photo-shell"
                style={{
                  ["--terminal-light-x" as string]: "50%",
                  ["--terminal-light-y" as string]: "42%",
                  isolation: "isolate",
                  marginInline: "auto",
                  maxWidth: "1100px",
                  position: "relative",
                  transform:
                    "rotateX(var(--terminal-rotate-x, 0deg)) rotateY(var(--terminal-rotate-y, 0deg))",
                  transformOrigin: "center bottom",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="macbook-photo-screen"
                  style={{
                    background: "oklch(0.055 0.003 270)",
                    borderRadius: "1.2%",
                    height: "85.43%",
                    left: "10.16%",
                    overflow: "hidden",
                    position: "absolute",
                    top: "2.45%",
                    width: "79.69%",
                    zIndex: 3,
                  }}
                >
                    <div className="macbook-desktop">
                      <div className="macbook-menu-bar">
                        <div className="flex items-center gap-3">
                          <svg className="h-3 w-3 text-zinc-100" viewBox="0 0 17 20" fill="currentColor"><path d="M12.57 10.412c-.02-2.132 1.74-3.152 1.82-3.203-.99-1.45-2.532-1.65-3.082-1.672-1.313-.133-2.563.773-3.23.773-.667 0-1.697-.753-2.787-.733-1.434.02-2.756.834-3.495 2.12-1.49 2.585-.381 6.414 1.07 8.513.71 1.026 1.557 2.18 2.67 2.138 1.07-.043 1.475-.693 2.77-.693 1.294 0 1.656.693 2.787.672 1.153-.02 1.887-1.047 2.593-2.076.818-1.191 1.154-2.345 1.174-2.404-.026-.012-2.252-.864-2.275-3.428l.005-.007zm-2.134-6.304C11.08 3.338 11.51 2.28 11.39 1.213c-.91.037-2.012.607-2.665 1.373-.586.678-1.1 1.762-.962 2.802 1.015.079 2.05-.516 2.673-1.28z"/></svg>
                          <span className="font-medium text-zinc-100">Terminal</span>
                          <span>File</span>
                          <span>Edit</span>
                          <span>View</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>⌘</span>
                          <span>100%</span>
                          <span>9:41 AM</span>
                        </div>
                      </div>

                      <div className="macbook-window-frame">
                        <Terminal
                          output={terminalOutput}
                          isStreaming={terminalStreaming}
                          autoScroll
                          className="macbook-terminal border-zinc-800"
                        >
                          <TerminalHeader className="grid grid-cols-3 items-center px-3 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                              <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                            </div>
                            <TerminalTitle className="justify-center text-xs">
                              create-scn-stack
                            </TerminalTitle>
                            <TerminalActions className="justify-end">
                              <TerminalCopyButton className="size-6" />
                            </TerminalActions>
                          </TerminalHeader>
                          <TerminalContent className="max-h-[260px] p-3 text-[11px] leading-relaxed" />
                        </Terminal>
                      </div>
                    </div>
                </div>
                <img
                  src="/macbook-pro-m4-space-black.svg"
                  alt=""
                  className="macbook-photo-frame"
                  style={{
                    display: "block",
                    filter:
                      "drop-shadow(0 34px 52px oklch(0.03 0.003 270 / 62%))",
                    height: "auto",
                    pointerEvents: "none",
                    position: "relative",
                    userSelect: "none",
                    width: "100%",
                    zIndex: 1,
                  }}
                  draggable={false}
                />
                <div className="macbook-photo-light" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stack logos */}
      <section className="hero-features relative overflow-hidden py-20">
        <div className="mx-auto mb-12 max-w-5xl px-6 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
            Built on the best
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            The frameworks, docs engines, and AI tools that power modern registries.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="relative">
            <Marquee speed={35} pauseOnHover autoFill>
              {stackLogos.map((logo) => (
                <Tooltip key={logo.alt}>
                  <TooltipTrigger asChild>
                    <div className="mx-12 flex items-center justify-center">
                      <img src={logo.src} alt={logo.alt} className="h-10 w-10 object-contain" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {logo.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[oklch(0.04_0.002_270)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[oklch(0.04_0.002_270)] to-transparent" />
          </div>

          <div className="relative">
            <Marquee speed={30} pauseOnHover autoFill direction="right">
              {toolLogos.map((logo) => (
                <Tooltip key={logo.alt}>
                  <TooltipTrigger asChild>
                    <div className="mx-12 flex items-center justify-center">
                      <img src={logo.src} alt={logo.alt} className="h-10 w-10 object-contain" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {logo.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[oklch(0.04_0.002_270)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[oklch(0.04_0.002_270)] to-transparent" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section relative bg-zinc-950">
        <div className="cta-fade-overlay" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-2xl px-6 py-24 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
            Ready to build?
          </h2>
          <p className="mt-3 text-zinc-500">
            Spin up your registry in under a minute.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-mono text-sm text-zinc-200">
              <span className="text-zinc-600">$</span>
              <code>npx create-scn-stack</code>
              <CopyButton text="npx create-scn-stack" />
            </div>
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-md bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Get Started
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
