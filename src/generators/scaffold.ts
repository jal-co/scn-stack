import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
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
import { printSummaryBox, printFooter, labelValue } from "../brand.js";

export async function scaffold(config: ProjectConfig): Promise<void> {
  const targetDir = resolve(process.cwd(), config.directory);

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

  // Update config with resolved directory
  const monorepoRoot = config.monorepo ? targetDir : null;
  if (config.monorepo) {
    config.directory = join(targetDir, "packages/registry");
  } else {
    config.directory = targetDir;
  }

  const s = p.spinner();

  // 0. Generate monorepo root if needed
  if (monorepoRoot) {
    s.start("Setting up monorepo...");
    ensureDir(monorepoRoot);
    generateMonorepoRoot(config, monorepoRoot);
    s.stop("Monorepo configured.");
  }

  // 1. Generate framework files
  s.start("Generating project files...");

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

  s.stop("Project files generated.");

  // 2. Generate registry files
  s.start("Setting up registry...");
  generateRegistryJson(config);
  generateComponentsJson(config);
  s.stop("Registry configured.");

  // 3. Generate component source files
  if (config.starterComponents !== "none") {
    s.start("Creating starter components...");
    generateComponents(config);
    s.stop("Starter components created.");
  }

  // 4. Generate docs
  if (config.docsEngine !== "none") {
    const docsLabel =
      config.docsEngine === "fumadocs"
        ? "Fumadocs"
        : config.docsEngine === "mintlify"
          ? "Mintlify"
          : "Starlight";
    s.start(`Setting up ${docsLabel} documentation...`);

    switch (config.docsEngine) {
      case "fumadocs":
        if (config.framework !== "nextjs") {
          p.log.warn(
            "Fumadocs requires Next.js. Falling back to Starlight for non-Next.js frameworks."
          );
          generateStarlight(config);
        } else {
          generateFumadocs(config);
        }
        break;
      case "mintlify":
        generateMintlify(config);
        break;
      case "starlight":
        generateStarlight(config);
        break;
    }

    s.stop("Documentation configured.");
  }

  // 5. Generate skills
  if (config.installRegistrySkill) {
    s.start("Adding registry skill...");
    generateSkill(config);
    s.stop("Registry skill added.");
  }

  // 6. Generate llms.txt
  s.start("Generating llms.txt...");
  generateLlmsTxt(config);
  s.stop("llms.txt generated.");

  // 7. Generate theme scaffolding
  s.start("Setting up theme...");
  generateTheme(config);
  addThemeInclude(config);
  s.stop("Theme configured.");

  // 8. Generate v0 integration
  s.start("Adding v0 integration...");
  generateV0(config);
  s.stop("v0 integration added.");

  // 9. Generate component preview system
  if (config.framework === "nextjs") {
    s.start("Setting up component previews...");
    generatePreview(config);
    s.stop("Component preview system added.");
  }

  // 10. Generate .scn-stack.json config
  s.start("Writing config...");
  generateConfig(config);
  s.stop("Config saved.");

  // 11. Generate README
  s.start("Generating README...");
  generateReadme(config);
  s.stop("README generated.");

  // 12. Install dependencies
  const installDir = monorepoRoot || config.directory;
  s.start(`Installing dependencies with ${config.packageManager}...`);
  try {
    runCommand(getInstallCommand(config.packageManager), installDir, true);
    s.stop("Dependencies installed.");
  } catch {
    s.stop("Failed to install dependencies. You can install them manually.");
  }

  // 13. Install shadcn skill
  if (config.installShadcnSkill) {
    s.start("Installing shadcn skill...");
    try {
      runCommand(
        `${getDlxCommand(config.packageManager)} skills add shadcn/ui`,
        installDir,
        true
      );
      s.stop("shadcn skill installed.");
    } catch {
      s.stop("shadcn skill installation skipped (you can install later with: pnpm dlx skills add shadcn/ui).");
    }
  }

  // 14. Initialize git
  s.start("Initializing git repository...");
  try {
    runCommand("git init", installDir, true);
    runCommand("git add -A", installDir, true);
    runCommand(
      'git commit -m "feat: initial scaffold from create-scn-stack"',
      installDir,
      true
    );
    s.stop("Git repository initialized.");
  } catch {
    s.stop("Git initialization skipped.");
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

  printSummaryBox(`${config.name} created`, [
    labelValue("Framework:", frameworkLabel),
    docsLabel ? labelValue("Docs:", docsLabel) : "",
    config.useNamespace ? labelValue("Namespace:", pc.cyan(config.namespace)) : "",
    "",
    `${pc.cyan("cd")} ${config.name}`,
    `${pc.cyan(runCmd)}`,
    "",
    labelValue("Registry:", "http://localhost:3000/r/registry.json"),
    config.docsEngine !== "none" ? labelValue("Docs:", "http://localhost:3000/docs") : "",
    "",
    labelValue("Build:", pc.cyan(getRunCommand(config.packageManager, "registry:build"))),
    labelValue("Add:", pc.cyan(`${dlx} shadcn@latest add http://localhost:3000/r/button.json`)),
  ]);

  printFooter(`${pc.bold(config.name)} ready with ${frameworkLabel}${docsLabel ? ` + ${docsLabel}` : ""}. Happy building! 🎉`);
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
