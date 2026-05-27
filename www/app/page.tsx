import Link from "next/link";
import {
  Package,
  Terminal,
  FileCode,
  BookOpen,
  Layers,
  Rocket,
  ArrowRight,
  Bot,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";

function TerminalBlock() {
  return (
    <div className="w-full max-w-2xl overflow-hidden border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-2.5 w-2.5 bg-red-500/80" />
        <div className="h-2.5 w-2.5 bg-yellow-500/80" />
        <div className="h-2.5 w-2.5 bg-green-500/80" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          terminal
        </span>
      </div>
      <div className="space-y-4 p-6 font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <span className="text-foreground">npx create-scn-stack</span>
        </div>
        <div className="space-y-2 text-muted-foreground">
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Registry name{" "}
            <span className="text-foreground">my-ui</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Style{" "}
            <span className="text-foreground">New York</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Base library{" "}
            <span className="text-foreground">Radix UI</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Framework{" "}
            <span className="text-foreground">Next.js</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Documentation{" "}
            <span className="text-foreground">Fumadocs</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Starter components{" "}
            <span className="text-foreground">Button, Card, Badge</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Namespace{" "}
            <span className="text-foreground">@my-ui</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            AI skills?{" "}
            <span className="text-foreground">Yes</span>
          </div>
        </div>
        <div className="space-y-1 pt-2">
          <div>
            <span className="text-green-500">✓</span> Project files generated.
          </div>
          <div>
            <span className="text-green-500">✓</span> Registry configured.
          </div>
          <div>
            <span className="text-green-500">✓</span> Starter components
            created.
          </div>
          <div>
            <span className="text-green-500">✓</span> Documentation configured.
          </div>
          <div>
            <span className="text-green-500">✓</span> Registry skill added.
          </div>
          <div>
            <span className="text-green-500">✓</span> Dependencies installed.
          </div>
          <div>
            <span className="text-green-500">✓</span> Git repository
            initialized.
          </div>
        </div>
        <div className="pt-2 text-green-500">
          ✓ my-ui created with Next.js + Fumadocs. Happy building! 🎉
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Layers,
    title: "Works with your framework.",
    description:
      "Next.js, Vite, React Router, TanStack Start. Pick what fits.",
  },
  {
    icon: BookOpen,
    title: "Docs included.",
    description:
      "Fumadocs, Mintlify, or Starlight. Full documentation site with component pages.",
  },
  {
    icon: FileCode,
    title: "Live component previews.",
    description:
      "Every component page includes a rendered preview alongside the code.",
  },
  {
    icon: Package,
    title: "Registry-first.",
    description:
      "Valid registry.json with include pattern. shadcn build, validate, and namespace support.",
  },
  {
    icon: Terminal,
    title: "One command to add.",
    description:
      "npx create-scn-stack add-component input — source, registry entry, and docs page.",
  },
  {
    icon: Bot,
    title: "AI-native.",
    description:
      "Ships with shadcn skill + registry skill. Claude, Cursor, and Copilot understand your project.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center md:py-32">
        <div className="flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 border border-dashed px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 bg-green-500" />
            v0.7.0
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Scaffold your shadcn registry
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Interactive CLI that generates a complete component registry with
            docs, framework of your choice, and starter components.
          </p>
        </div>

        {/* Install command */}
        <div className="flex items-center gap-3 border bg-card px-5 py-3 font-mono text-sm">
          <span className="text-muted-foreground">$</span>
          <code>npx create-scn-stack</code>
          <CopyButton text="npx create-scn-stack" />
        </div>

        <div className="flex gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 border bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Builder
          </Link>
        </div>
      </section>

      {/* Terminal demo */}
      <section className="flex justify-center px-4 pb-20">
        <TerminalBlock />
      </section>

      {/* Features */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <div className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 bg-background p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output preview */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Output
          </p>
          <h2 className="mb-10 text-2xl font-bold tracking-tight sm:text-3xl">
            What you get
          </h2>
          <div className="grid gap-px border bg-border md:grid-cols-2">
            <div className="bg-background p-6">
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
            <div className="flex flex-col gap-px bg-border">
              <div className="bg-background p-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Install
                </p>
                <div className="border bg-card p-3 font-mono text-sm">
                  <span className="text-muted-foreground">$ </span>
                  npx shadcn add @my-ui/button
                </div>
              </div>
              <div className="bg-background p-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Add components
                </p>
                <div className="border bg-card p-3 font-mono text-sm">
                  <span className="text-muted-foreground">$ </span>
                  npx create-scn-stack add-component input
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Creates source + registry entry + docs page.
                </p>
              </div>
              <div className="bg-background p-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Build
                </p>
                <div className="border bg-card p-3 font-mono text-sm">
                  <span className="text-muted-foreground">$ </span>
                  pnpm registry:build
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Generates static JSON in public/r/ — ready to deploy.
                </p>
              </div>
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
