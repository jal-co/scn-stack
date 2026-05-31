<div align="center">

[![scn-stack](https://raw.githubusercontent.com/jal-co/scn-stack/main/www/public/brand/repo-header.png)](https://scnstack.sh)

Scaffold a complete [shadcn component registry](https://ui.shadcn.com/docs/registry) with documentation in minutes.

[Homepage](https://scnstack.sh) · [Docs](https://scnstack.sh/docs) · [Builder](https://scnstack.sh/builder) · [𝕏](https://x.com/jalcowastaken)

[![scn-stack stats](https://shieldcn.dev/group/github/stars/jal-co/scn-stack+npm/create-scn-stack+npm/dm/create-scn-stack+github/license/jal-co/scn-stack.svg?variant=branded)](https://github.com/jal-co/scn-stack)

[![built with shadcn](https://shieldcn.dev/badge/built%20with-shadcn-000000.svg?logo=shadcnui&logoColor=fff&variant=branded)](https://ui.shadcn.com) [![made by Justin Levine](https://shieldcn.dev/badge/made%20by-Justin%20Levine-171717.svg?variant=branded)](https://justinlevine.me)

</div>

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

## Adding Components, Hooks, Blocks & Themes

```bash
npx create-scn-stack add-component input -d "An input component."
npx create-scn-stack add-hook use-toggle -d "A toggle state hook."
npx create-scn-stack add-block login-form -d "A login form block."
npx create-scn-stack add-theme midnight -d "A dark, dim theme."
```

Each command creates the source file, updates `registry.json`, and generates a docs page.

## Managing Your Registry

```bash
npx create-scn-stack list                 # everything in the registry
npx create-scn-stack list --type hook     # filter by ui | hook | block | theme
npx create-scn-stack list --json          # machine-readable output

npx create-scn-stack remove button        # full reverse of any add: source +
                                          # registry entry + docs page, gated
                                          # behind a confirm (skip with --yes)

npx create-scn-stack build                # build the registry output (public/r/)
```

`remove` finds the item across the root registry and any `include`d
per-directory registries, deletes its source files, prunes the registry
entry, and removes the matching docs page (and its `meta.json` entry).

## Users Install Your Components

Once deployed, anyone can use your registry:

```bash
# Add your namespace
npx shadcn registry add @acme=https://acme.com/r/{name}.json

# Install components
npx shadcn add @acme/button
```

## Development

```bash
npm install
npm run build      # bundle the CLI to dist/
npm run lint       # type-check with tsc
npm test           # run the Vitest suite
npm run test:watch # watch mode
```

### Tests

The suite covers:

- **Unit** — argument parsing (`args`), helpers (`utils`), and the registry /
  config generators.
- **Integration** — the built CLI run end-to-end into a temp directory
  (`--yes` scaffold + `add-component`), asserting the generated files and
  registry wiring.

Integration tests build real projects but skip the slow, networked steps
(dependency install, skill install, git init) via the
`SCN_STACK_SKIP_INSTALL=1` environment variable. Run `npm run build` before
the suite so the integration tests have a fresh `dist/index.js`.

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md)
for branch naming, commit message conventions, the test suite, and the project
layout.

This project follows the [Contributor Covenant 3.0](./.github/CODE_OF_CONDUCT.md).
By participating you agree to abide by its terms.

## License

MIT
