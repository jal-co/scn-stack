# create-scn-registry

Scaffold a complete [shadcn component registry](https://ui.shadcn.com/docs/registry) with documentation in minutes.

```bash
npx create-scn-registry
```

> Like `create-t3-app`, but for shadcn registries.

## What is this?

The shadcn ecosystem lets you run your own component registry — distributing custom components, hooks, and blocks that anyone can install with `npx shadcn add @yourname/button`.

Setting one up from scratch means wiring together a framework, registry config, documentation site, and example components. **This CLI does all of that for you.**

## Features

- 🏗️ **Interactive CLI** — guided setup with sensible defaults
- ⚡ **Framework choice** — Next.js, Vite, React Router, TanStack Start
- 📖 **Docs engine** — Fumadocs (recommended), Starlight, or none
- 🧩 **Starter components** — Button, Card, Badge with auto-generated doc pages
- 📦 **Registry ready** — `registry.json`, `shadcn build`, namespace support
- 🚀 **Deploy anywhere** — Vercel, Netlify, Cloudflare, self-hosted

## Quick Start

```bash
npx create-scn-registry
```

You'll be asked:

1. **Registry name** — e.g., `acme`
2. **Framework** — Next.js (default), Vite, React Router, TanStack Start
3. **Docs engine** — Fumadocs (default), Starlight, None
4. **Starter components** — essentials, minimal, or empty
5. **Namespace** — e.g., `@acme`
6. **Package manager** — pnpm, npm, yarn, bun

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
