"use client";

import Link from "next/link";
import {
  ArrowRight,
  Box,
  BookOpen,
  Eye,
  Package,
  Bot,
  Terminal as TerminalIcon,
  Check,
} from "lucide-react";
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
  "\x1b[32m✓ my-ui created with Next.js + Fumadocs. Happy building! \ud83c\udf89\x1b[0m",
].join("\n");

const features = [
  {
    icon: Box,
    title: "Frameworks",
    items: ["Next.js", "Vite", "React Router", "TanStack Start"],
  },
  {
    icon: BookOpen,
    title: "Docs engines",
    items: ["Fumadocs", "Mintlify", "Starlight"],
  },
  {
    icon: Eye,
    title: "Live previews",
    items: ["Rendered components", "Preview + Code tabs", "Auto-generated demos"],
  },
  {
    icon: Package,
    title: "Registry-first",
    items: ["Include pattern", "shadcn build", "Namespace support", "Schema validation"],
  },
  {
    icon: Bot,
    title: "AI-native",
    items: ["shadcn skill", "Project registry skill", "Claude · Cursor · Copilot"],
  },
  {
    icon: TerminalIcon,
    title: "Add components",
    items: ["Source file", "Registry entry", "Docs page with preview"],
  },
];

const commands = [
  { label: "Install a component", cmd: "npx shadcn add @my-ui/button" },
  { label: "Add a new component", cmd: "npx create-scn-stack add-component input" },
  { label: "Build the registry", cmd: "pnpm registry:build" },
  { label: "Validate the schema", cmd: "npx shadcn registry validate" },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
            >
              <span className="font-medium text-foreground">v0.7.0</span>
              <span className="h-3 w-px bg-border" />
              <span>Live previews + AI skills</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Scaffold a complete shadcn registry.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              One command. Framework, docs, starter components, live previews,
              AI skills — ready to develop and deploy.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-md border bg-card px-4 py-2 font-mono text-sm">
                <span className="text-muted-foreground">$</span>
                <code>npx create-scn-stack</code>
                <CopyButton text="npx create-scn-stack" />
              </div>
              <Link
                href="/docs"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 rounded-md border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Builder
              </Link>
            </div>

            {/* Terminal window */}
            <div className="mt-16 w-full max-w-3xl text-left">
              <Terminal
                output={terminalOutput}
                className="border-zinc-800 shadow-2xl"
              >
                <TerminalHeader className="grid grid-cols-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <TerminalTitle className="justify-center">
                    create-scn-stack
                  </TerminalTitle>
                  <TerminalActions className="justify-end">
                    <TerminalCopyButton />
                  </TerminalActions>
                </TerminalHeader>
                <TerminalContent className="max-h-none text-[13px] leading-relaxed" />
              </Terminal>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Six core features, configured by interactive prompts.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-3 w-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Four commands.
            </h2>
            <p className="mt-3 text-muted-foreground">
              From scaffold to deployed registry.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {commands.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium">{c.label}</p>
                <div className="mt-3 rounded-md bg-muted/50 px-4 py-2.5 font-mono text-sm">
                  <span className="text-muted-foreground">$ </span>
                  {c.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project structure */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              What you get.
            </h2>
            <p className="mt-3 text-muted-foreground">
              A fully configured project, ready to develop and deploy.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="border-b bg-muted/30 px-4 py-2.5 font-mono text-xs text-muted-foreground">
              my-ui/
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-muted-foreground">
{`├── registry.json              # include pattern
├── registry/new-york/ui/
│   ├── registry.json          # component items
│   ├── button.tsx
│   ├── card.tsx
│   └── badge.tsx
├── components/
│   ├── component-preview.tsx  # live previews
│   └── examples/
│       ├── button-demo.tsx
│       └── card-demo.tsx
├── content/docs/components/
│   ├── button.mdx             # with <Preview>
│   ├── card.mdx
│   └── badge.mdx
├── .agents/skills/registry/
│   └── SKILL.md               # AI skill
├── public/r/                  # built output
├── components.json
└── package.json`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to build?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Spin up your registry in under a minute.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-md border bg-card px-4 py-2 font-mono text-sm">
              <span className="text-muted-foreground">$</span>
              <code>npx create-scn-stack</code>
              <CopyButton text="npx create-scn-stack" />
            </div>
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-muted-foreground">
          <span>
            Built by{" "}
            <a
              href="https://github.com/jal-co"
              className="text-foreground transition-colors hover:text-muted-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              jal-co
            </a>
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jal-co/scn-stack"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/create-scn-stack"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              npm
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
