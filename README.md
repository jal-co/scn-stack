# scn-stack

Scaffold a complete [shadcn component registry](https://ui.shadcn.com/docs/registry) with documentation in minutes.

🌐 [scnstack.sh](https://scnstack.sh)

```bash
npx create-scn-stack
```

> Like `create-t3-app`, but for shadcn registries.

## What is this?

The shadcn ecosystem lets you run your own component registry — distributing custom components, hooks, and blocks that anyone can install with `npx shadcn add @yourname/button`.

Setting one up from scratch means wiring together a framework, registry config, documentation site, and example components. **This CLI does all of that for you.**

## Features

- 🏗️ **Interactive CLI** — guided setup with sensible defaults
- ⚡ **Framework choice** — Next.js, Vite, React Router, TanStack Start
- 📖 **Docs engine** — Fumadocs (recommended), Starlight, or none
- 🎨 **Style** — New York or Default shadcn style
- 🧩 **Starter components** — Button, Card, Badge with auto-generated doc pages
- 📦 **Registry ready** — `registry.json`, `shadcn build`, namespace support
- 🔌 **Init into existing projects** — add a registry to any project
- 🪝 **Hooks & blocks** — scaffold hooks and blocks alongside components
- 🎭 **Theme scaffolding** — distributable theme with CSS custom properties
- 🔒 **Private registries** — bearer token auth with middleware
- 🖼️ **Component previews** — iframe preview system for docs
- 🤖 **v0 integration** — "Open in v0" button + URL helpers
- 📄 **llms.txt** — auto-generated for AI context
- ⚙️ **Config file** — `.scn-stack.json` for repeatable operations
- 🚀 **Deploy anywhere** — Vercel, Netlify, Cloudflare, self-hosted

## Quick Start

```bash
npx create-scn-stack
```

### Add to an existing project

```bash
npx create-scn-stack init
```

Detects your framework, creates `registry.json`, `components.json`, and a build script.

You'll be asked:

1. **Registry name** — identifier for your registry (e.g., `my-ui`)
2. **Project location** — folder to create the registry in
3. **Style** — New York or Default
4. **Homepage** — URL where the registry will be hosted
5. **Framework** — Next.js (default), Vite, React Router, TanStack Start
6. **Docs engine** — Fumadocs (default), Starlight, None
7. **Starter components** — essentials, minimal, or empty
8. **Namespace** — e.g., `@my-ui`
9. **Package manager** — pnpm, npm, yarn, bun

Then:

```bash
cd my-registry
pnpm dev
```

Your registry is live at `http://localhost:3000` with docs and components ready to go.

## What You Get

```
my-registry/
├── registry.json                  # Registry definition
├── registry/new-york/ui/          # Component source files
│   ├── button.tsx
│   ├── card.tsx
│   └── badge.tsx
├── content/docs/                  # Documentation (MDX)
│   ├── index.mdx
│   ├── installation.mdx
│   └── components/
│       ├── button.mdx
│       ├── card.mdx
│       └── badge.mdx
├── app/                           # Framework app
│   └── docs/                      # Docs routes
├── public/r/                      # Built registry output
└── components.json                # shadcn config
```

## Adding Components, Hooks & Blocks

```bash
npx create-scn-stack add-component input -d "An input component."
npx create-scn-stack add-hook use-toggle -d "A toggle state hook."
npx create-scn-stack add-block login-form -d "A login form block."
```

Each command creates the source file, updates `registry.json`, and generates a docs page.

## Users Install Your Components

Once deployed, anyone can use your registry:

```bash
# Add your namespace
npx shadcn registry add @acme=https://acme.com/r/{name}.json

# Install components
npx shadcn add @acme/button
```

## Contributing

Contributions welcome! Please read [TODO.md](./TODO.md) for the current roadmap.

## License

MIT
