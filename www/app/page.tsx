"use client";

import Link from "next/link";
import {
  Package,
  Terminal,
  FileCode,
  BookOpen,
  Layers,
  ArrowRight,
  Bot,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";

/* ------------------------------------------------------------------ */
/*  Terminal Block                                                     */
/* ------------------------------------------------------------------ */

function TerminalBlock() {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          terminal
        </span>
      </div>
      <div className="space-y-3 p-5 font-mono text-[13px]">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <span className="text-foreground">npx create-scn-stack</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          {[
            ["Registry name", "my-ui"],
            ["Style", "New York"],
            ["Base", "Radix UI"],
            ["Framework", "Next.js"],
            ["Docs", "Fumadocs"],
            ["Components", "Button, Card, Badge"],
            ["Namespace", "@my-ui"],
            ["Skills?", "Yes"],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
              {label} <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 pt-1 text-green-500">
          <div>✓ Project files generated.</div>
          <div>✓ Registry configured.</div>
          <div>✓ Docs + previews configured.</div>
          <div>✓ AI skills installed.</div>
          <div>✓ Dependencies installed.</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Layers,
    title: "Works with your framework.",
    description:
      "Next.js, Vite, React Router, TanStack Start.",
  },
  {
    icon: BookOpen,
    title: "Docs included.",
    description: "Fumadocs, Mintlify, or Starlight.",
  },
  {
    icon: FileCode,
    title: "Live previews.",
    description: "Rendered components on every doc page.",
  },
  {
    icon: Package,
    title: "Registry-first.",
    description: "Include pattern. Build, validate, namespace.",
  },
  {
    icon: Terminal,
    title: "One command to add.",
    description: "Source + registry entry + docs page.",
  },
  {
    icon: Bot,
    title: "AI-native.",
    description: "shadcn skill + registry skill included.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Split hero */}
      <section className="mx-auto w-full max-w-7xl flex-1 border-x border-border">
        <div className="flex flex-col lg:flex-row">
          {/* Left — sticky column */}
          <div className="flex flex-col justify-between border-b p-8 lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)] lg:w-[45%] lg:border-b-0 lg:border-r lg:p-12">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 border border-dashed px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 bg-green-500" />
                v0.7.0
              </div>
              <h1 className="text-4xl font-bold tracking-tighter lg:text-5xl xl:text-6xl">
                Scaffold your
                <br />
                shadcn registry.
              </h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Interactive CLI that generates a complete component registry with
                docs, previews, and AI skills.
              </p>
              <div className="flex gap-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 border bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Get Started
                </Link>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Builder
                </Link>
              </div>
            </div>

            {/* Terminal — visible on lg+ */}
            <div className="mt-8 hidden lg:block">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Install
                </span>
                <CopyButton text="npx create-scn-stack" />
              </div>
              <div className="pt-3 font-mono text-sm">
                <span className="text-muted-foreground">$ </span>
                npx create-scn-stack
              </div>
            </div>
          </div>

          {/* Right — scrolling content */}
          <div className="flex-1">
            {/* README section */}
            <div className="border-b p-8 lg:p-12">
              <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                readme
              </p>
              <p className="text-lg text-muted-foreground">
                A CLI that generates{" "}
                <span className="font-medium text-foreground">
                  shadcn component registries
                </span>{" "}
                with documentation, live component previews, and AI skills —
                from weekend projects to design systems used by entire teams.
              </p>
            </div>

            {/* Install tabs */}
            <div className="border-b">
              <div className="flex items-center gap-6 border-b px-8 lg:px-12">
                <span className="border-b-2 border-foreground py-3 font-mono text-xs text-foreground">
                  CLI
                </span>
                <span className="py-3 font-mono text-xs text-muted-foreground">
                  Builder
                </span>
                <span className="py-3 font-mono text-xs text-muted-foreground">
                  Skills
                </span>
              </div>
              <div className="flex items-center justify-between px-8 py-4 lg:px-12">
                <div className="font-mono text-sm">
                  <span className="text-muted-foreground">npx </span>
                  create-scn-stack
                </div>
                <CopyButton text="npx create-scn-stack" />
              </div>
            </div>

            {/* Terminal preview on mobile */}
            <div className="border-b p-8 lg:hidden">
              <TerminalBlock />
            </div>

            {/* Features */}
            <div className="border-b p-8 lg:p-12">
              <p className="mb-8 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Features
              </p>
              <div className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="flex flex-col gap-2 bg-background p-5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <feature.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Output */}
            <div className="border-b p-8 lg:p-12">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Output
              </p>
              <h2 className="mb-8 text-2xl font-bold tracking-tight">
                What you get
              </h2>
              <div className="grid gap-px border bg-border sm:grid-cols-2">
                <div className="bg-background p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Install
                  </p>
                  <div className="border bg-card p-3 font-mono text-sm">
                    <span className="text-muted-foreground">$ </span>
                    npx shadcn add @my-ui/button
                  </div>
                </div>
                <div className="bg-background p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Add components
                  </p>
                  <div className="border bg-card p-3 font-mono text-sm">
                    <span className="text-muted-foreground">$ </span>
                    npx create-scn-stack add-component input
                  </div>
                </div>
                <div className="bg-background p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Build
                  </p>
                  <div className="border bg-card p-3 font-mono text-sm">
                    <span className="text-muted-foreground">$ </span>
                    pnpm registry:build
                  </div>
                </div>
                <div className="bg-background p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Validate
                  </p>
                  <div className="border bg-card p-3 font-mono text-sm">
                    <span className="text-muted-foreground">$ </span>
                    npx shadcn registry validate
                  </div>
                </div>
              </div>
            </div>

            {/* Project structure */}
            <div className="p-8 lg:p-12">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Project structure
              </p>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
                {`my-ui/
├── registry.json              # include pattern
├── registry/new-york/ui/
│   ├── registry.json          # component items
│   ├── button.tsx
│   ├── card.tsx
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to build your registry?
          </h2>
          <div className="flex items-center gap-3 border bg-card px-5 py-3 font-mono text-sm">
            <span className="text-muted-foreground">$</span>
            <code>npx create-scn-stack</code>
            <CopyButton text="npx create-scn-stack" />
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Read the docs
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between font-mono text-xs text-muted-foreground">
          <span>
            Built by{" "}
            <a
              href="https://github.com/jal-co"
              className="text-foreground underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              jal-co
            </a>
          </span>
          <span>MIT</span>
        </div>
      </footer>
    </div>
  );
}
