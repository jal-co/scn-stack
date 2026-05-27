"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";
import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalActions,
  TerminalCopyButton,
  TerminalContent,
} from "@/components/ai-elements/terminal";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Terminal ANSI output                                               */
/* ------------------------------------------------------------------ */

const terminalOutput = [
  "\x1b[2m$\x1b[0m npx create-scn-stack",
  "",
  "\x1b[36m◆\x1b[0m  Registry name  \x1b[1mmy-ui\x1b[0m",
  "\x1b[36m◆\x1b[0m  Style          \x1b[1mNew York\x1b[0m",
  "\x1b[36m◆\x1b[0m  Base           \x1b[1mRadix UI\x1b[0m",
  "\x1b[36m◆\x1b[0m  Framework      \x1b[1mNext.js\x1b[0m",
  "\x1b[36m◆\x1b[0m  Docs           \x1b[1mFumadocs\x1b[0m",
  "\x1b[36m◆\x1b[0m  Components     \x1b[1mButton, Card, Badge\x1b[0m",
  "\x1b[36m◆\x1b[0m  Namespace      \x1b[1m@my-ui\x1b[0m",
  "\x1b[36m◆\x1b[0m  AI skills?     \x1b[1mYes\x1b[0m",
  "",
  "\x1b[32m✓\x1b[0m Project files generated.",
  "\x1b[32m✓\x1b[0m Registry configured.",
  "\x1b[32m✓\x1b[0m Docs + previews configured.",
  "\x1b[32m✓\x1b[0m AI skills installed.",
  "\x1b[32m✓\x1b[0m Dependencies installed.",
  "\x1b[32m✓\x1b[0m Git initialized.",
  "",
  "\x1b[32m✓ my-ui created with Next.js + Fumadocs. Happy building! 🎉\x1b[0m",
].join("\n");

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  { num: "01", title: "Frameworks", detail: "Next.js · Vite · React Router · TanStack Start" },
  { num: "02", title: "Docs engines", detail: "Fumadocs · Mintlify · Starlight" },
  { num: "03", title: "Live previews", detail: "Rendered components on every doc page" },
  { num: "04", title: "Registry-first", detail: "Include pattern · Build · Validate · Namespace" },
  { num: "05", title: "AI skills", detail: "shadcn skill + project-specific registry skill" },
  { num: "06", title: "Add command", detail: "Source + registry entry + docs in one shot" },
];

const commands = [
  { label: "Install", cmd: "npx shadcn add @my-ui/button" },
  { label: "Add", cmd: "npx create-scn-stack add-component input" },
  { label: "Build", cmd: "pnpm registry:build" },
  { label: "Validate", cmd: "npx shadcn registry validate" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  Hero                                                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b">
        {/* Animated grid background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.05}
          duration={4}
          className={cn(
            "absolute inset-0 h-full w-full",
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          )}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32 lg:py-40">
          <BlurFade delay={0.1}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              scn-stack v0.7.0
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Scaffold a complete
              <br />
              <span className="font-mono">shadcn</span> registry.
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              One command. Framework, docs, starter components, live previews,
              AI skills — ready to develop and deploy.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="mt-8 inline-flex items-center gap-3 border border-dashed bg-card px-5 py-3 font-mono text-sm">
              <span className="text-muted-foreground">$</span>
              <code>npx create-scn-stack</code>
              <CopyButton text="npx create-scn-stack" />
            </div>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="mt-6 flex gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 border bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 border border-dashed px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
              >
                Builder
              </Link>
              <a
                href="https://github.com/jal-co/scn-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-dashed px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  Terminal                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <BlurFade delay={0.1} inView>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              What it looks like
            </p>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <div className="relative overflow-hidden">
              <Terminal output={terminalOutput} className="border-zinc-800 shadow-2xl">
                <TerminalHeader>
                  <TerminalTitle>create-scn-stack</TerminalTitle>
                  <TerminalActions>
                    <TerminalCopyButton />
                  </TerminalActions>
                </TerminalHeader>
                <TerminalContent className="max-h-none text-[13px] leading-relaxed" />
              </Terminal>
              <BorderBeam size={200} duration={8} />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  Features                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-0">
          <BlurFade delay={0.1} inView>
            <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Features
            </p>
          </BlurFade>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <BlurFade key={f.num} delay={0.1 + i * 0.05} inView>
              <div className="group flex flex-col gap-3 border-b border-r border-dashed p-8 transition-colors hover:bg-accent/50">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  {f.num}
                </p>
                <p className="text-lg font-semibold transition-colors group-hover:text-foreground">
                  {f.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.detail}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  Commands                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-0">
          <BlurFade delay={0.1} inView>
            <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Workflow
            </p>
          </BlurFade>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2">
          {commands.map((c, i) => (
            <BlurFade key={c.label} delay={0.1 + i * 0.05} inView>
              <div className="group border-b border-r border-dashed p-8 transition-colors hover:bg-accent/50">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-4 font-mono text-sm transition-colors group-hover:text-foreground">
                  <span className="text-muted-foreground">$ </span>
                  {c.cmd}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  Structure                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="dot-grid border-b">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <BlurFade delay={0.1} inView>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              What you get
            </p>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
{`my-ui/
├── registry.json              # include pattern
├── registry/new-york/ui/
│   ├── registry.json          # component items
│   ├── button.tsx
│   └── badge.tsx
├── components/
│   ├── component-preview.tsx  # live previews
│   └── examples/
│       └── button-demo.tsx
├── content/docs/components/
│   └── button.mdx             # with <Preview>
├── .agents/skills/registry/
│   └── SKILL.md               # AI skill
├── public/r/                  # built output
├── components.json
└── package.json`}
            </pre>
          </BlurFade>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  CTA                                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.04}
          duration={5}
          className={cn(
            "absolute inset-0 h-full w-full",
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
          )}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to build your registry?
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <div className="mt-8 inline-flex items-center gap-3 border border-dashed bg-card px-5 py-3 font-mono text-sm">
              <span className="text-muted-foreground">$</span>
              <code>npx create-scn-stack</code>
              <CopyButton text="npx create-scn-stack" />
            </div>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/docs"
                className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Docs
              </Link>
              <span className="text-border">·</span>
              <Link
                href="/builder"
                className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Builder
              </Link>
              <span className="text-border">·</span>
              <a
                href="https://github.com/jal-co/scn-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
          <a href="https://github.com/jal-co" className="text-foreground" target="_blank" rel="noopener noreferrer">
            jal-co
          </a>
          <span>MIT</span>
        </div>
      </footer>
    </div>
  );
}
