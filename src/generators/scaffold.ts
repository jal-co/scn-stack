import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync } from "node:fs";
import os from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { ProjectConfig } from "../types.js";
import {
  ensureDir,
  writeFile,
  runCommand,
  getInstallCommand,
  getRunCommand,
  getDlxCommand,
} from "../utils.js";
import { generateRegistryJson, generateComponentsJson } from "./registry.js";
import { generateComponents } from "./components.js";
import { generateNextjs } from "./frameworks/nextjs.js";
import { generateVite } from "./frameworks/vite.js";
import { generateReactRouter } from "./frameworks/react-router.js";
import { generateTanstackStart } from "./frameworks/tanstack-start.js";
import { generateFumadocs } from "./docs/fumadocs.js";
import { generateMintlify } from "./docs/mintlify.js";
import { generateStarlight } from "./docs/starlight.js";
import { generateSkill } from "./skills.js";
import { generateLlmsTxt } from "./llms-txt.js";
import { generateTheme, addThemeInclude } from "./theme.js";
import { generateV0 } from "./v0.js";
import { generatePreview } from "./preview.js";
import { generateConfig } from "./config.js";
import { generateGithubRegistry } from "./github-registry.js";
import {
  labelValue,
  printStepHeader,
  note,
} from "../brand.js";

export async function scaffold(config: ProjectConfig): Promise<void> {
  // Fall back to ./<name> when no directory was provided so an empty value
  // never resolves to the current working directory or a bare root.
  const requestedDir = config.directory?.trim() || `./${config.name}`;
  const targetDir = resolve(process.cwd(), requestedDir);

  // The project must land inside the current working directory ("." is
  // allowed). resolve() treats an absolute segment (e.g. "/orc") as a new
  // root, which previously surfaced as a raw `mkdir ENOENT` stack trace.
  // Scaffolding into the home directory or filesystem root would also clobber
  // existing files, so refuse those outright.
  const cwd = resolve(process.cwd());
  const relativeToCwd = relative(cwd, targetDir);
  const escapesCwd =
    relativeToCwd.startsWith("..") || isAbsolute(relativeToCwd);
  const isHomeOrRoot =
    targetDir === resolve("/") || targetDir === resolve(os.homedir());
  if (escapesCwd || isHomeOrRoot) {
    p.cancel(
      `Can't scaffold into ${pc.cyan(targetDir)} — it's outside the current ` +
        `directory. Use a relative path like ${pc.cyan(`./${config.name}`)}.`
    );
    process.exit(1);
  }

  config.directory = requestedDir;

  // Check if directory already exists
  if (existsSync(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory ${pc.cyan(config.directory)} already exists. Continue?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Setup cancelled.");
      process.exit(0);
    }
  }

  // GitHub source registries take a separate, minimal path: no framework
  // app, no docs site, no build script, no dependency install. The repo
  // itself is the registry.
  if (config.target === "github") {
    config.directory = targetDir;
    await scaffoldGithubRegistry(config);
    return;
  }

  // Update config with resolved directory
  const monorepoRoot = config.monorepo ? targetDir : null;
  if (config.monorepo) {
    config.directory = join(targetDir, "packages/registry");
  } else {
    config.directory = targetDir;
  }

  // Allow CI / tests to scaffold files without the slow, networked steps
  // (dependency install, skill install, git init).
  const skipSideEffects = process.env.SCN_STACK_SKIP_INSTALL === "1";
  const startedAt = Date.now();
  const totalPhases = skipSideEffects ? 3 : 4;
  const installDir = monorepoRoot || config.directory;

  // ── Phase 1: Project scaffold ───────────────────────────────────────
  printStepHeader(
    1,
    totalPhases,
    "Project scaffold",
    `${labelText(config.framework)} · ${config.directory}`
  );

  await p.tasks([
    {
      title: "Setting up monorepo workspace",
      enabled: monorepoRoot !== null,
      task: async () => {
        ensureDir(monorepoRoot!);
        generateMonorepoRoot(config, monorepoRoot!);
        return `Monorepo workspace ready — ${monorepoRoot}`;
      },
    },
    {
      title: `Generating ${labelText(config.framework)} project`,
      task: async () => {
        ensureDir(config.directory);
        switch (config.framework) {
          case "nextjs":
            generateNextjs(config);
            break;
          case "vite":
            generateVite(config);
            break;
          case "react-router":
            generateReactRouter(config);
            break;
          case "tanstack-start":
            generateTanstackStart(config);
            break;
        }
        return `${labelText(config.framework)} project generated`;
      },
    },
  ]);

  // ── Phase 2: Registry + components ───────────────────────────────────
  printStepHeader(
    2,
    totalPhases,
    "Registry & components",
    `style: ${config.style}` +
      (config.useNamespace ? ` · namespace: ${config.namespace}` : "")
  );

  await p.tasks([
    {
      title: "Writing registry.json and components.json",
      task: async () => {
        generateRegistryJson(config);
        generateComponentsJson(config);
        return "Registry configured";
      },
    },
    {
      title: `Adding starter components (${labelText(config.starterComponents)})`,
      enabled: config.starterComponents !== "none",
      task: async () => {
        generateComponents(config);
        const list =
          config.starterComponents === "essentials"
            ? "Button, Card, Badge"
            : "Button";
        return `Starter components added: ${list}`;
      },
    },
  ]);

  if (config.starterComponents === "none") {
    note("no starter components — empty registry");
  }

  // ── Phase 3: Docs, theme, extras ──────────────────────────────────────
  printStepHeader(
    3,
    totalPhases,
    "Docs, theme & extras",
    docsPhaseDescription(config)
  );

  // Resolve the docs decision up front so the task list reads cleanly.
  const docsFellBackToStarlight =
    config.docsEngine === "fumadocs" && config.framework !== "nextjs";
  if (docsFellBackToStarlight) {
    p.log.warn(
      "Fumadocs requires Next.js. Using Starlight for this framework."
    );
  }
  const effectiveDocs = docsFellBackToStarlight ? "starlight" : config.docsEngine;

  await p.tasks([
    {
      title: `Setting up ${docsLabelOf(effectiveDocs)} documentation`,
      enabled: effectiveDocs !== "none",
      task: async () => {
        switch (effectiveDocs) {
          case "fumadocs":
            generateFumadocs(config);
            break;
          case "mintlify":
            generateMintlify(config);
            break;
          case "starlight":
            generateStarlight(config);
            break;
        }
        return `${docsLabelOf(effectiveDocs)} documentation configured`;
      },
    },
    {
      title: "Generating theme, llms.txt, v0, previews, config, README",
      task: async () => {
        generateLlmsTxt(config);
        generateTheme(config);
        addThemeInclude(config);
        generateV0(config);
        if (config.framework === "nextjs") generatePreview(config);
        if (config.installRegistrySkill) generateSkill(config);
        generateConfig(config);
        generateReadme(config);
        return "Extras ready (theme, llms.txt, v0, previews, config, README)";
      },
    },
  ]);

  // ── Phase 4: Install + git ───────────────────────────────────────────────
  if (skipSideEffects) {
    note(
      "install / shadcn skill / git init skipped (SCN_STACK_SKIP_INSTALL=1)"
    );
  } else {
    printStepHeader(
      4,
      totalPhases,
      "Install & finalize",
      `${config.packageManager} install · git init` +
        (config.installShadcnSkill ? " · shadcn skill" : "")
    );

    await p.tasks([
      {
        title: `Installing dependencies with ${config.packageManager}`,
        task: async () => {
          try {
            runCommand(
              getInstallCommand(config.packageManager),
              installDir,
              true
            );
            return "Dependencies installed";
          } catch {
            return "Dependency install failed — you can run it manually later";
          }
        },
      },
      {
        title: "Installing shadcn skill",
        enabled: config.installShadcnSkill,
        task: async () => {
          try {
            runCommand(
              `${getDlxCommand(config.packageManager)} skills add shadcn/ui`,
              installDir,
              true
            );
            return "shadcn skill installed";
          } catch {
            return `shadcn skill skipped — install later with: ${getDlxCommand(config.packageManager)} skills add shadcn/ui`;
          }
        },
      },
      {
        title: "Initializing git repository",
        task: async () => {
          try {
            runCommand("git init", installDir, true);
            runCommand("git add -A", installDir, true);
            runCommand(
              'git commit -m "feat: initial scaffold from create-scn-stack"',
              installDir,
              true
            );
            return "Git repository initialized";
          } catch {
            return "Git init skipped";
          }
        },
      },
    ]);
  }

  // Done! Show next steps
  const runCmd = getRunCommand(config.packageManager, "dev");
  const dlx = getDlxCommand(config.packageManager);
  const frameworkLabel =
    config.framework === "nextjs"
      ? "Next.js"
      : config.framework === "vite"
        ? "Vite"
        : config.framework === "react-router"
          ? "React Router"
          : "TanStack Start";

  const docsLabel =
    config.docsEngine === "fumadocs"
      ? "Fumadocs"
      : config.docsEngine === "mintlify"
        ? "Mintlify"
        : config.docsEngine === "starlight"
          ? "Starlight"
          : "";

  const elapsed = Date.now() - startedAt;

  // Summary lives inside clack's frame via p.note so it lines up with
  // every other rendered block above it.
  const summaryLines = [
    labelValue("Framework:", frameworkLabel),
    docsLabel ? labelValue("Docs:", docsLabel) : "",
    config.useNamespace
      ? labelValue("Namespace:", pc.cyan(config.namespace))
      : "",
    "",
    `${pc.cyan("cd")} ${config.name}`,
    `${pc.cyan(runCmd)}`,
    "",
    labelValue("Registry:", "http://localhost:3000/r/registry.json"),
    config.docsEngine !== "none"
      ? labelValue("Docs URL:", "http://localhost:3000/docs")
      : "",
    "",
    labelValue(
      "Build:",
      pc.cyan(getRunCommand(config.packageManager, "registry:build"))
    ),
    labelValue(
      "Add:",
      pc.cyan(
        `${dlx} shadcn@latest add http://localhost:3000/r/button.json`
      )
    ),
  ].filter(Boolean);

  p.note(summaryLines.join("\n"), `✓ ${config.name} created`);

  // p.outro closes the prompt frame and prints the final line.
  p.outro(
    `${pc.bold(config.name)} ready with ${frameworkLabel}${docsLabel ? ` + ${docsLabel}` : ""} in ${pc.dim(formatDuration(elapsed))} 🎉`
  );
}

async function scaffoldGithubRegistry(config: ProjectConfig): Promise<void> {
  const skipSideEffects = process.env.SCN_STACK_SKIP_INSTALL === "1";
  const startedAt = Date.now();
  const slug = config.githubSlug || `<owner>/${config.registryName}`;

  printStepHeader(
    1,
    skipSideEffects ? 2 : 3,
    "GitHub source registry",
    `${config.directory} · no build, no host`
  );

  await p.tasks([
    {
      title: "Writing registry.json, components.json and source files",
      task: async () => {
        ensureDir(config.directory);
        generateGithubRegistry(config);
        return "Source registry generated";
      },
    },
    {
      title: "Generating theme, llms.txt, config, AI skill",
      task: async () => {
        generateTheme(config);
        addThemeInclude(config);
        generateLlmsTxt(config);
        if (config.installRegistrySkill) generateSkill(config);
        generateConfig(config);
        return "Extras ready (theme, llms.txt, config)";
      },
    },
  ]);

  if (!skipSideEffects) {
    printStepHeader(2, 3, "Finalize", "git init");
    await p.tasks([
      {
        title: "Initializing git repository",
        task: async () => {
          try {
            runCommand("git init", config.directory, true);
            runCommand("git add -A", config.directory, true);
            runCommand(
              'git commit -m "feat: initial GitHub source registry from create-scn-stack"',
              config.directory,
              true
            );
            return "Git repository initialized";
          } catch {
            return "Git init skipped";
          }
        },
      },
    ]);
  } else {
    note("git init skipped (SCN_STACK_SKIP_INSTALL=1)");
  }

  const elapsed = Date.now() - startedAt;

  const summaryLines = [
    labelValue("Target:", "GitHub source registry"),
    labelValue("Repo slug:", pc.cyan(slug)),
    "",
    pc.dim("Push this repo to GitHub, then users install with:"),
    `${pc.cyan(`npx shadcn@latest add ${slug}/button`)}`,
    "",
    pc.dim("No build step. Commit + push is the publish step."),
  ].filter(Boolean);

  p.note(summaryLines.join("\n"), `✓ ${config.name} created`);

  p.outro(
    `${pc.bold(config.name)} ready as a GitHub source registry in ${pc.dim(formatDuration(elapsed))} 🎉`
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}m ${r}s`;
}

function labelText(value: string): string {
  switch (value) {
    case "nextjs":
      return "Next.js";
    case "vite":
      return "Vite";
    case "react-router":
      return "React Router";
    case "tanstack-start":
      return "TanStack Start";
    case "essentials":
      return "Button, Card, Badge";
    case "minimal":
      return "Button only";
    case "none":
      return "none";
    default:
      return value;
  }
}

function docsLabelOf(engine: string): string {
  switch (engine) {
    case "fumadocs":
      return "Fumadocs";
    case "mintlify":
      return "Mintlify";
    case "starlight":
      return "Starlight";
    default:
      return "";
  }
}

function docsPhaseDescription(config: ProjectConfig): string {
  const parts: string[] = [];
  if (config.docsEngine !== "none") {
    parts.push(`${docsLabelOf(config.docsEngine).toLowerCase()} docs`);
  } else {
    parts.push("no docs");
  }
  parts.push("theme");
  parts.push("v0");
  if (config.framework === "nextjs") parts.push("previews");
  if (config.installRegistrySkill) parts.push("registry skill");
  parts.push("llms.txt");
  return parts.join(" · ");
}

function generateMonorepoRoot(
  config: ProjectConfig,
  rootDir: string
): void {
  const pm = config.packageManager;

  // Root package.json with workspaces
  const rootPkg: Record<string, unknown> = {
    name: config.name,
    private: true,
    scripts: {
      dev: `${pm === "npm" ? "npm run" : pm} --filter registry dev`,
      build: `${pm === "npm" ? "npm run" : pm} --filter registry build`,
      "registry:build": `${pm === "npm" ? "npm run" : pm} --filter registry registry:build`,
    },
  };

  if (pm === "pnpm") {
    // pnpm uses pnpm-workspace.yaml
    writeFile(
      join(rootDir, "pnpm-workspace.yaml"),
      "packages:\n  - packages/*\n"
    );
  } else if (pm === "npm" || pm === "yarn") {
    rootPkg.workspaces = ["packages/*"];
  } else if (pm === "bun") {
    rootPkg.workspaces = ["packages/*"];
  }

  writeFile(
    join(rootDir, "package.json"),
    JSON.stringify(rootPkg, null, 2) + "\n"
  );

  // Root .gitignore
  writeFile(
    join(rootDir, ".gitignore"),
    `node_modules/\n.DS_Store\n`
  );
}

function generateReadme(config: ProjectConfig): void {
  const dlx = getDlxCommand(config.packageManager);
  const runCmd = getRunCommand(config.packageManager, "dev");
  const name = config.registryName;

  const installCmd = config.useNamespace
    ? `${dlx} shadcn@latest add ${config.namespace}/button`
    : `${dlx} shadcn@latest add ${config.homepage}/r/button.json`;

  const namespaceSection = config.useNamespace
    ? `
## Namespace

This registry uses the \`${config.namespace}\` namespace. Users can add it to their project:

\`\`\`bash
${dlx} shadcn@latest registry add ${config.namespace}=${config.homepage}/r/{name}.json
\`\`\`

Then install components:

\`\`\`bash
${dlx} shadcn@latest add ${config.namespace}/button
\`\`\`
`
    : "";

  writeFile(
    join(config.directory, "README.md"),
    `# ${name}

A custom [shadcn component registry](https://ui.shadcn.com/docs/registry).

## Development

\`\`\`bash
${runCmd}
\`\`\`

## Install Components

\`\`\`bash
${installCmd}
\`\`\`
${namespaceSection}
## Build Registry

\`\`\`bash
${getRunCommand(config.packageManager, "registry:build")}
\`\`\`

This generates static JSON files in \`public/r/\` for each registry item.

## Project Structure

\`\`\`
├── registry.json              # Registry definition
├── registry/default/          # Component source files
├── public/r/                  # Built registry output (generated)
${config.docsEngine === "fumadocs" ? "├── content/docs/              # Documentation (MDX)\n" : ""}${config.docsEngine === "mintlify" ? "├── docs/                      # Mintlify documentation\n" : ""}${config.docsEngine === "starlight" ? "├── docs/                      # Starlight documentation site\n" : ""}└── components.json            # shadcn config
\`\`\`

## Adding Components, Hooks & Blocks

\`\`\`bash
npx create-scn-stack add-component <name> -d "Description"
npx create-scn-stack add-hook <name> -d "Description"
npx create-scn-stack add-block <name> -d "Description"
\`\`\`

Or manually:

1. Create your component in \`registry/<style>/ui/<name>.tsx\`
2. Add the item to \`registry/<style>/ui/registry.json\`
3. Run \`${getRunCommand(config.packageManager, "registry:build")}\`
${config.docsEngine === "fumadocs" ? "4. Add a doc page in `content/docs/components/<name>.mdx`" : config.docsEngine === "mintlify" ? "4. Add a doc page in `docs/components/<name>.mdx`" : config.docsEngine === "starlight" ? "4. Add a doc page in `docs/src/content/docs/components/<name>.md`" : ""}

## License

MIT
`
  );
}
