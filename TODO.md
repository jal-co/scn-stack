# create-shadcn-registry — v1 TODO

Scaffolding CLI for creating shadcn component registries. Like `create-t3-app` but for shadcn registries — choose your framework, docs engine, and starter components. Get a fully working registry with documentation in minutes.

`npx create-shadcn-registry`

---

## Setup

- [x] Create GitHub repo (public, jal-co)
- [x] Initialize Node.js/TypeScript project
- [x] Set up build toolchain (tsup for bundling CLI)
- [ ] CI: lint + build check on push

## CLI Core

- [x] Interactive prompts (clack for modern UX)
  - [x] Registry name (e.g., `acme`)
  - [x] Framework selection
  - [x] Docs engine selection
  - [x] Starter components selection
  - [x] Namespace toggle + name (e.g., `@acme`)
  - [x] Package manager detection / selection
- [x] Template generation system (code-based generators)
- [x] Package manager install command execution
- [x] Input validation (registry name, namespace format)

## Framework Templates

- [x] **Next.js** — App Router, Tailwind v4 (recommended default)
- [x] **Vite** — React + Tailwind v4
- [x] **React Router** — v7, Tailwind v4
- [x] **TanStack Start** — Tailwind v4

Each framework template includes:

- [x] `registry.json` with schema (matching official shadcn conventions)
- [x] `components.json` with `iconLibrary`, style, aliases
- [x] Registry serving via static build (`shadcn build` → `public/r/`)
- [x] Tailwind v4 + PostCSS config (matching registry template)
- [x] TypeScript config
- [x] Dev / build / registry:build scripts in `package.json`

## Docs Engine Templates

- [x] **Fumadocs** (default) — standard for shadcn registries
  - [x] `source.config.ts`
  - [x] `lib/source.ts` with `collections/server` import
  - [x] Docs layout + routes (`DocsLayout`, `DocsPage`)
  - [x] `RootProvider` from `fumadocs-ui/provider/next`
  - [x] MDX content structure (`content/docs/`)
  - [x] Getting started page
  - [x] Installation page
  - [x] Component doc pages (auto-generated per starter component)
  - [x] Navigation via `meta.json`
- [x] **Starlight** (Astro-based alternative)
  - [x] Astro + Starlight config
  - [x] Markdown content structure
  - [x] Component doc pages
- [x] **None** — registry-only, no docs site

## Registry Scaffolding

- [x] `registry.json` generation (valid against `https://ui.shadcn.com/schema/registry.json`)
- [x] `components.json` generation
- [x] Static build setup (`shadcn build` → `public/r/`)
- [x] Namespace configuration (`@name` in components.json registries field)
- [x] Registry item structure: `registry/new-york/ui/`

## Starter Components

Example `registry:ui` items that ship out of the box:

- [x] **Button** — basic button with variants (default, destructive, outline, ghost)
- [x] **Card** — card with header, content, footer
- [x] **Badge** — inline badge with variants

Each starter component includes:

- [x] Component source file (`registry/new-york/ui/<name>.tsx`)
- [x] Registry item definition in `registry.json`
- [x] Matching doc page (if docs engine selected)
- [x] Usage example in doc page

Selection options in CLI:

- `Button, Card, Badge` (essentials)
- `Button only` (minimal)
- `None` (empty registry)

## DX Polish

- [x] Generated `README.md` — customized with registry name, namespace, install instructions
- [x] `package.json` scripts: `dev`, `build`, `registry:build`
- [x] `.gitignore` (node_modules, .next, dist, etc.)
- [x] Post-install terminal output (next steps, dev command, docs URL)
- [x] Landing page (simple hero with registry name + install command)
- [ ] `llms.txt` generation (for AI discoverability)

## Publishing

- [ ] npm package: `create-shadcn-registry`
- [ ] `npx create-shadcn-registry` works out of the box
- [ ] `npm create shadcn-registry` alias
- [x] GitHub README with usage instructions

## Future (v1.1+)

- [ ] `create-shadcn-registry add-component <name>` — scaffold new component + doc page
- [ ] `create-shadcn-registry add-hook <name>` — scaffold new hook + doc page
- [ ] `create-shadcn-registry add-block <name>` — scaffold new block + doc page
- [ ] Theme / style scaffolding (`registry:style`, `registry:theme`)
- [ ] Authentication setup for private registries
- [ ] v0 integration setup ("Open in v0")
- [ ] Component preview iframe in docs
- [ ] Monorepo support (registry + consuming app)
- [ ] `--yes` flag for non-interactive mode with defaults
- [ ] Config file (`.create-shadcn-registry.json`) for repeatable scaffolding
