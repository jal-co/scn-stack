# scn-stack — TODO

Scaffolding CLI for creating shadcn component registries.

`npx create-scn-stack`

**Live:** [scn-stack.vercel.app](https://scn-stack.vercel.app) · [npm](https://www.npmjs.com/package/create-scn-stack) · [GitHub](https://github.com/jal-co/scn-stack)

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

### Website (scn-stack.vercel.app)
- [x] Landing page: hero, terminal demo, features, output preview, CTA
- [x] Builder page: visual configurator with live command output
- [x] Docs: 11 pages (Quick Start, CLI, frameworks, docs engines, project structure)
- [x] Shared header (shieldcn pattern): logo, nav, GitHub stars button, mobile menu
- [x] Custom docs layout: sidebar + ToC (not Fumadocs UI layouts)
- [x] jalco-ui components: CodeBlock, CodeLine, CodeBlockCommand, FileTree
- [x] svgl logos on builder option cards
- [x] Vercel deployment with root directory set to www/

---

## 🔲 Next Up

### CLI improvements
- [ ] `--yes` flag for non-interactive mode with all defaults
- [ ] CLI flags matching builder options (e.g. `--framework nextjs --docs fumadocs`)
- [ ] `add-component <name>` subcommand — scaffold new component + doc page + registry entry
- [ ] `add-hook <name>` subcommand
- [ ] `add-block <name>` subcommand
- [ ] `llms.txt` generation in scaffolded projects

### Website
- [ ] Connect Vercel GitHub integration for auto-deploy on push
- [ ] OG image generation
- [ ] Demo GIF / video on landing page
- [ ] Showcase page (registries built with scn-stack)
- [ ] Analytics (npm downloads, GitHub stars on landing page)
- [ ] SEO: sitemap, robots.txt, canonical URLs

### Registry features
- [ ] Theme / style scaffolding (`registry:style`, `registry:theme`)
- [ ] Authentication setup for private registries
- [ ] v0 integration ("Open in v0") setup
- [ ] Component preview iframe in generated docs
- [ ] Monorepo support (registry + consuming app in one repo)
- [ ] Config file (`.scn-stack.json`) for repeatable scaffolding / add commands
