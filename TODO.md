# create-shadcn-registry — v1 TODO

Scaffolding CLI for creating shadcn component registries. Like `create-t3-app` but for shadcn registries — choose your framework, docs engine, and starter components. Get a fully working registry with documentation in minutes.

`npx create-shadcn-registry`

---

## Setup

- [ ] Create GitHub repo (public, jal-co)
- [ ] Initialize Node.js/TypeScript project
- [ ] Set up build toolchain (tsup for bundling CLI)
- [ ] CI: lint + build check on push

## CLI Core

- [ ] Interactive prompts (clack for modern UX)
  - [ ] Registry name (e.g., `acme`)
  - [ ] Framework selection
  - [ ] Docs engine selection
  - [ ] Starter components selection
  - [ ] Namespace toggle + name (e.g., `@acme`)
  - [ ] Package manager detection / selection
- [ ] Template copying system (file-based templates)
- [ ] String replacement / templating engine
- [ ] Package manager install command execution
- [ ] Input validation (registry name, namespace format)

## Framework Templates

- [ ] **Next.js** — App Router, Tailwind v4 (recommended default)
- [ ] **Vite** — React + Tailwind v4
- [ ] **React Router** — v7, Tailwind v4
- [ ] **TanStack Start** — Tailwind v4

Each framework template includes:

- [ ] `registry.json` with schema
- [ ] `components.json` (shadcn config)
- [ ] Registry serving (static via `shadcn build` + dynamic route handlers)
- [ ] Tailwind v4 + PostCSS config
- [ ] TypeScript config
- [ ] Dev / build / registry:build scripts in `package.json`

## Docs Engine Templates

- [ ] **Fumadocs** (default) — de facto standard for shadcn registries
  - [ ] `source.config.ts`
  - [ ] Docs layout + routes
  - [ ] MDX content structure (`content/docs/`)
  - [ ] Getting started page
  - [ ] Installation page
  - [ ] Component doc pages (auto-generated per starter component)
  - [ ] Code preview / usage examples on each page
- [ ] **Starlight** (Astro-based alternative)
  - [ ] Astro + Starlight config
  - [ ] Markdown content structure
  - [ ] Component doc pages
- [ ] **None** — registry-only, no docs site

## Registry Scaffolding

- [ ] `registry.json` generation (valid against `https://ui.shadcn.com/schema/registry.json`)
- [ ] `components.json` generation
- [ ] Static build setup (`shadcn build` → `public/r/`)
- [ ] Dynamic route handlers (`loadRegistry` / `loadRegistryItem` from `shadcn/registry`)
- [ ] Namespace configuration (`@name` in components.json registries field)
- [ ] Registry item structure: `registry/default/<component>/`

## Starter Components

Example `registry:ui` items that ship out of the box:

- [ ] **Button** — basic button with variants (default, destructive, outline, ghost)
- [ ] **Card** — card with header, content, footer
- [ ] **Badge** — inline badge with variants

Each starter component includes:

- [ ] Component source file (`registry/default/<name>/<name>.tsx`)
- [ ] Registry item definition in `registry.json`
- [ ] Matching doc page (if docs engine selected)
- [ ] Usage example in doc page

Selection options in CLI:

- `Button, Card, Badge` (essentials)
- `Button only` (minimal)
- `None` (empty registry)

## DX Polish

- [ ] Generated `README.md` — customized with registry name, namespace, install instructions
- [ ] `package.json` scripts: `dev`, `build`, `registry:build`, `registry:serve`
- [ ] `.gitignore` (node_modules, .next, dist, etc.)
- [ ] Post-install terminal output (next steps, dev command, docs URL)
- [ ] Landing page (simple hero with registry name + install command)
- [ ] `llms.txt` generation (for AI discoverability)

## Publishing

- [ ] npm package: `create-shadcn-registry`
- [ ] `npx create-shadcn-registry` works out of the box
- [ ] `npm create shadcn-registry` alias
- [ ] GitHub README with usage instructions
- [ ] Demo GIF / screenshot in README

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
