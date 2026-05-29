# Contributing to scn-stack

Thanks for your interest in contributing! This guide covers the conventions enforced across the project so your PRs land smoothly.

## Getting started

```bash
npm install
npm run build        # bundle the CLI to dist/
npm run lint         # type-check with tsc
npm test             # build + run the Vitest suite
npm run test:watch   # vitest in watch mode
```

The CLI lives in `src/`. After `npm run build`, the entry point is `dist/index.js`, which is what `bin: create-scn-stack` points at in `package.json`.

## Branch naming

Branches **must** follow [Conventional Branch](https://conventional-branch.github.io/) format. This is enforced in CI via [commit-check](https://github.com/commit-check/commit-check-action).

```
<type>/<description>
```

| Type | Use for |
|------|---------|
| `feat` or `feature` | New features or enhancements |
| `fix` or `bugfix` | Bug fixes |
| `hotfix` | Urgent production fixes |
| `docs` | Documentation only |
| `refactor` | Code restructuring (no behavior change) |
| `perf` | Performance improvements |
| `style` | Formatting, visual changes |
| `test` | Adding or updating tests |
| `ci` or `build` | CI/CD pipeline changes |
| `chore` | Maintenance, deps, tooling |
| `release` | Release prep |

**Rules:**

- Lowercase alphanumerics, hyphens, and dots only
- No consecutive hyphens or dots
- No leading/trailing hyphens or dots in the description

**Examples:**

```
feat/init-subcommand
fix/add-component-duplicate-detection
docs/quick-start-rewrite
refactor/split-scaffold-steps
chore/bump-vitest
hotfix/registry-include-path
release/v0.10.0
```

## Commit messages

Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). This is enforced in CI.

```
<type>(<scope>): <description>
```

| Type | Use for |
|------|---------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `refactor` | Restructuring without behavior change |
| `perf` | Performance improvements |
| `style` | Formatting (code style, not visuals) |
| `test` | Tests |
| `ci` | CI/CD changes |
| `build` | Build system changes |
| `chore` | Maintenance and tooling |
| `revert` | Reverting a previous commit |

**Rules:**

- Subject line max **80 characters**
- Scope is optional but encouraged (e.g., `cli`, `scaffold`, `commands`, `init`)
- Use `!` after the type/scope for breaking changes: `feat!: drop Node 18 support`
- Merge, revert, and fixup commits are allowed as-is

**Examples:**

```
feat(commands): add init subcommand for existing projects
fix(commands): detect duplicates across registries with include pattern
docs: add shieldcn badges to README
chore(deps): bump tsup to v8.6
ci: run vitest suite on pull requests
test: add coverage for monorepo scaffold
feat!: drop Node 18 support
```

## Issues

When opening an issue, pick the template that fits:

| Template | When to use |
|----------|-------------|
| 🐛 **Bug Report** | The CLI errors, scaffolds incorrectly, or produces a broken project |
| ✨ **Feature Request** | New flag, prompt, generator behaviour, or DX improvement |
| 📦 **Framework / Docs Engine Support** | Request a new framework template or docs engine integration |
| Blank issue | Anything else |

Issues tagged `good first issue` are a great starting point if you're new to the project.

## Pull requests

A PR template will pre-fill when you open a pull request. Fill in the **What**, **Why**, and **Type** sections, and check off the items in the checklist.

### Auto-labeling

PRs are automatically labeled based on your **branch name prefix**:

| Branch prefix | Label |
|---------------|-------|
| `feat/`, `feature/` | `feature` |
| `fix/`, `bugfix/`, `hotfix/` | `bug` |
| `docs/` | `docs` |
| `refactor/` | `refactor` |
| `perf/` | `perf` |
| `style/` | `style` |
| `test/` | `test` |
| `ci/`, `build/` | `ci` |
| `chore/` | `chore` |

Labels also apply based on **changed files** — touching `.github/**` adds `ci`, touching `www/**` adds `website`, touching `test/**` adds `test`, even on a `feat/` branch. Labels sync on every push, so outdated labels are removed automatically.

### Labels

| Label | Description |
|-------|-------------|
| `feature` | New feature or enhancement |
| `bug` | Something isn't working |
| `framework` | New or updated framework template |
| `docs-engine` | New or updated docs engine integration |
| `docs` | Documentation changes |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `style` | Visual / formatting changes |
| `test` | Tests |
| `ci` | CI/CD and workflow changes |
| `chore` | Maintenance and dependencies |
| `website` | Changes to `www/` (scnstack.sh) |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |

## Code style

- TypeScript, ESM, Node ≥ 18
- `tsc --noEmit` (run via `npm run lint`) must pass
- Tests must pass before merging — see [Tests](#tests) below

## Tests

The test suite uses [Vitest](https://vitest.dev/) and lives in `test/`:

- **Unit** — `args.ts` parsing, `utils.ts` helpers, and generator output (`registry.json`, `components.json`, `.scn-stack.json`).
- **Integration** — the built CLI runs end-to-end into a temp directory and asserts the generated project is correct.

Integration tests use `SCN_STACK_SKIP_INSTALL=1` to skip `npm install`, the shadcn skill install, and `git init`. The env var has no effect on normal user runs and keeps the suite under a second.

Run the suite locally:

```bash
npm test           # build + run
npm run test:ci    # run only (CI builds first)
npm run test:watch # watch mode for TDD
```

## Project structure

```
src/
  args.ts             # Top-level flag parsing
  prompts.ts          # Interactive @clack/prompts wizard
  index.ts            # CLI entry — dispatches subcommands
  brand.ts            # TUI styling (header, footer, summary box)
  types.ts            # Shared ProjectConfig + enum types
  utils.ts            # PM detection, fs helpers, registryHasItem
  commands/
    init.ts           # Add a registry to an existing project
    add-component.ts  # Scaffold a new component + docs page
    add-hook.ts       # Scaffold a new hook + docs page
    add-block.ts      # Scaffold a new block + docs page
  generators/
    scaffold.ts       # Orchestrates a full project scaffold
    registry.ts       # registry.json + components.json
    components.ts     # Starter component sources
    config.ts         # .scn-stack.json
    theme.ts          # Theme scaffolding
    v0.ts             # v0 integration
    preview.ts        # Component preview iframe (Next.js)
    llms-txt.ts       # llms.txt route / static file
    skills.ts         # Registry skill
    frameworks/       # Next.js / Vite / React Router / TanStack Start
    docs/             # Fumadocs / Starlight / Mintlify
test/                 # Vitest suite (see Tests above)
www/                  # scnstack.sh marketing + docs site
```

## Need help?

Open an issue or start a discussion — happy to help you get your first PR merged.
