# scn-stack — TODO

Scaffolding CLI for creating shadcn component registries.

`npx create-scn-stack`

**Live:** [scnstack.sh](https://scnstack.sh) · [npm](https://www.npmjs.com/package/create-scn-stack) · [GitHub](https://github.com/jal-co/scn-stack)

---

## ✅ Done

### CLI (v0.2.0)
- [x] Interactive prompts (clack): name, location, style, homepage, framework, docs, components, namespace, PM
- [x] 4 framework templates: Next.js, Vite, React Router, TanStack Start
- [x] 2 docs engines: Fumadocs (Next.js), Starlight (any framework), None
- [x] Starter components: Button, Card, Badge (essentials / minimal / none)
- [x] Registry scaffolding: registry.json, components.json, shadcn build, namespace
- [x] Matches current shadcn v3 conventions, Tailwind v4, Fumadocs v16
- [x] npm publish via GitHub Actions on release
- [x] `--yes` flag for non-interactive mode with all defaults
- [x] CLI flags matching builder options (`--framework nextjs --docs fumadocs`)
- [x] `add-component <name>` subcommand — scaffold new component + doc page + registry entry
- [x] `add-hook <name>` subcommand — scaffold new hook + doc page + registry entry
- [x] `add-block <name>` subcommand — scaffold new block + doc page + registry entry
- [x] `llms.txt` generation in scaffolded projects (Next.js route handler or static file)
- [x] `init` subcommand — add a registry to an existing project (detect framework, inject registry.json, components.json, build script, optional docs)

### Website (scnstack.sh)
- [x] Landing page: hero, terminal demo, features, output preview, CTA
- [x] Builder page: visual configurator with live command output
- [x] Docs: 11 pages (Quick Start, CLI, frameworks, docs engines, project structure)
- [x] Shared header (shieldcn pattern): logo, nav, GitHub stars button, mobile menu
- [x] Custom docs layout: sidebar + ToC (not Fumadocs UI layouts)
- [x] jalco-ui components: CodeBlock, CodeLine, CodeBlockCommand, FileTree
- [x] svgl logos on builder option cards
- [x] Vercel deployment with root directory set to www/
- [x] Vercel GitHub integration for auto-deploy on push
- [x] OG image
- [x] Demo GIF / video on landing page
- [x] SEO: sitemap, robots.txt
- [x] Analytics: npm weekly downloads + GitHub stars in header

### Registry features
- [x] Theme / style scaffolding (`registry:theme` with CSS custom properties)
- [x] Authentication setup for private registries (Next.js middleware + bearer token)
- [x] v0 integration ("Open in v0" button + URL helper)
- [x] Component preview iframe in generated docs (`/preview/[name]` route + `PreviewFrame` component)
- [x] Monorepo support (registry + consuming app in one repo)
- [x] Config file (`.scn-stack.json`) for repeatable scaffolding / add commands
