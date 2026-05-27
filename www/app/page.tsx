import Link from "next/link";
import {
  Package,
  Terminal,
  FileCode,
  BookOpen,
  Layers,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";

function TerminalBlock() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">terminal</span>
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
            Project location{" "}
            <span className="text-foreground">./my-ui</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Style{" "}
            <span className="text-foreground">New York</span>
          </div>
          <div>
            <span className="text-cyan-500 dark:text-cyan-400">◆</span>{" "}
            Homepage{" "}
            <span className="text-foreground">https://my-ui.com</span>
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
            <span className="text-green-500">✓</span> Fumadocs documentation
            configured.
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
    title: "4 Frameworks",
    description:
      "Next.js, Vite, React Router, or TanStack Start. Pick what fits your project.",
  },
  {
    icon: BookOpen,
    title: "Docs Included",
    description:
      "Fumadocs or Starlight — get a full documentation site with auto-generated component pages.",
  },
  {
    icon: FileCode,
    title: "Starter Components",
    description:
      "Button, Card, Badge with variants — real registry:ui items ready for shadcn build.",
  },
  {
    icon: Package,
    title: "Registry Ready",
    description:
      "Valid registry.json, components.json, namespace support. Run shadcn build and ship.",
  },
  {
    icon: Terminal,
    title: "One Command",
    description:
      "Interactive prompts guide you through every choice. Zero config to figure out.",
  },
  {
    icon: Rocket,
    title: "Deploy Anywhere",
    description:
      "Vercel, Netlify, Cloudflare — your registry is a static site. Deploy it anywhere.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-5 w-5" />
            scn-stack
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <a
              href="https://github.com/jal-co/scn-stack"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/create-scn-stack"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center md:py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            v0.2.0 — Now on npm
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Scaffold your{" "}
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              shadcn registry
            </span>{" "}
            in minutes
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Interactive CLI that generates a complete component registry with
            docs, framework of your choice, and starter components. Like{" "}
            <span className="text-foreground font-medium">create-t3-app</span>,
            but for shadcn registries.
          </p>
        </div>

        {/* Install command */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-5 py-3 font-mono text-sm shadow-sm">
          <span className="text-muted-foreground">$</span>
          <code>npx create-scn-stack</code>
          <CopyButton text="npx create-scn-stack" />
        </div>

        <div className="flex gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/jal-co/scn-stack"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Terminal demo */}
      <section className="flex justify-center px-4 pb-20">
        <TerminalBlock />
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to ship a registry
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-foreground" />
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
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            What you get
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            A fully configured project, ready to develop and deploy.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Project Structure</h3>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
{`my-ui/
├── registry.json            # Registry definition
├── registry/new-york/ui/    # Component source
│   ├── button.tsx
│   ├── card.tsx
│   └── badge.tsx
├── content/docs/            # Documentation (MDX)
│   ├── index.mdx
│   ├── installation.mdx
│   └── components/
│       ├── button.mdx
│       ├── card.mdx
│       └── badge.mdx
├── app/
│   ├── page.tsx             # Landing page
│   └── docs/                # Docs routes
├── public/r/                # Built registry JSON
├── components.json          # shadcn config
└── package.json`}
              </pre>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-3 font-semibold">Your users install with</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="rounded-md bg-muted p-3">
                    <span className="text-muted-foreground">$ </span>
                    npx shadcn add @my-ui/button
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-3 font-semibold">Build your registry</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="rounded-md bg-muted p-3">
                    <span className="text-muted-foreground">$ </span>
                    pnpm registry:build
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generates static JSON in public/r/ — ready to deploy.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-3 font-semibold">
                  Compatible with shadcn CLI
                </h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="rounded-md bg-muted p-3">
                    <span className="text-muted-foreground">$ </span>
                    npx shadcn list @my-ui
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <span className="text-muted-foreground">$ </span>
                    npx shadcn search @my-ui --query button
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to build your registry?
          </h2>
          <div className="flex items-center gap-3 rounded-lg border bg-card px-5 py-3 font-mono text-sm shadow-sm">
            <span className="text-muted-foreground">$</span>
            <code>npx create-scn-stack</code>
            <CopyButton text="npx create-scn-stack" />
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Read the docs
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-muted-foreground">
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
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
