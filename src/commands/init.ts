import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeFile, ensureDir, titleCase } from "../utils.js";

interface InitArgs {
  name?: string;
  style?: "new-york" | "default";
  namespace?: string;
  homepage?: string;
  docs?: boolean;
  yes?: boolean;
}

type DetectedFramework =
  | "nextjs"
  | "vite"
  | "react-router"
  | "tanstack-start"
  | "unknown";

export function parseInitArgs(argv: string[]): InitArgs {
  const args: InitArgs = {};
  const rest = argv.slice(3); // skip node, script, "init"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];

    switch (arg) {
      case "--name":
        args.name = next;
        i++;
        break;
      case "--style":
        if (next === "new-york" || next === "default") args.style = next;
        i++;
        break;
      case "--namespace":
        args.namespace = next;
        i++;
        break;
      case "--homepage":
        args.homepage = next;
        i++;
        break;
      case "--docs":
        args.docs = true;
        break;
      case "--no-docs":
        args.docs = false;
        break;
      case "--yes":
      case "-y":
        args.yes = true;
        break;
    }
  }

  return args;
}

function detectFramework(cwd: string): DetectedFramework {
  const pkgPath = join(cwd, "package.json");

  if (!existsSync(pkgPath)) return "unknown";

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (allDeps["next"]) return "nextjs";
  if (allDeps["@tanstack/start"] || allDeps["@tanstack/react-start"])
    return "tanstack-start";
  if (allDeps["react-router"] || allDeps["react-router-dom"])
    return "react-router";
  if (allDeps["vite"]) return "vite";

  return "unknown";
}

function detectExistingComponents(cwd: string): string | null {
  if (existsSync(join(cwd, "components.json"))) return "components.json";
  return null;
}

export async function init(args: InitArgs): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" init — add registry to existing project ")));

  const cwd = process.cwd();

  // Check we're in a project
  if (!existsSync(join(cwd, "package.json"))) {
    p.cancel(
      "No package.json found. Run this from the root of an existing project."
    );
    process.exit(1);
  }

  // Check we don't already have a registry
  if (existsSync(join(cwd, "registry.json"))) {
    p.cancel(
      "registry.json already exists. This project already has a registry."
    );
    process.exit(1);
  }

  // Detect framework
  const framework = detectFramework(cwd);
  const frameworkLabel =
    framework === "nextjs"
      ? "Next.js"
      : framework === "vite"
        ? "Vite"
        : framework === "react-router"
          ? "React Router"
          : framework === "tanstack-start"
            ? "TanStack Start"
            : "Unknown";

  if (framework !== "unknown") {
    p.log.info(`Detected framework: ${pc.cyan(frameworkLabel)}`);
  } else {
    p.log.warn(
      "Could not detect framework. Registry files will still be generated."
    );
  }

  // Check for existing shadcn setup
  const existingConfig = detectExistingComponents(cwd);
  if (existingConfig) {
    p.log.info(`Found existing ${pc.cyan(existingConfig)}`);
  }

  // Gather config
  const name =
    args.name ||
    (args.yes
      ? readPkgName(cwd) || "my-registry"
      : ((await p.text({
          message: "Registry name",
          placeholder: readPkgName(cwd) || "my-registry",
          defaultValue: readPkgName(cwd) || "my-registry",
          validate: (v) => {
            if (!v) return "Name is required.";
            if (!/^[a-z][a-z0-9-]*$/.test(v))
              return "Lowercase letters, numbers, and hyphens only.";
            return undefined;
          },
        })) as string));

  if (p.isCancel(name)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const style =
    args.style ||
    (args.yes
      ? "new-york"
      : ((await p.select({
          message: "Style",
          options: [
            { value: "new-york", label: "New York", hint: "recommended" },
            { value: "default", label: "Default" },
          ],
        })) as "new-york" | "default"));

  if (p.isCancel(style)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const homepage =
    args.homepage ||
    (args.yes
      ? `https://${name}.com`
      : ((await p.text({
          message: "Homepage URL",
          placeholder: `https://${name}.com`,
          defaultValue: `https://${name}.com`,
        })) as string));

  if (p.isCancel(homepage)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const useNamespace = args.namespace
    ? true
    : args.yes
      ? true
      : ((await p.confirm({
          message: "Add a namespace?",
          initialValue: true,
        })) as boolean);

  if (p.isCancel(useNamespace)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const namespace = useNamespace
    ? args.namespace ||
      (args.yes
        ? `@${name}`
        : ((await p.text({
            message: "Namespace",
            placeholder: `@${name}`,
            defaultValue: `@${name}`,
            validate: (v) => {
              if (!v) return "Namespace is required.";
              if (!/^@[a-z][a-z0-9-]*$/.test(v))
                return "Must start with @ followed by a lowercase letter.";
              return undefined;
            },
          })) as string))
    : "";

  if (p.isCancel(namespace)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const addDocs =
    args.docs !== undefined
      ? args.docs
      : args.yes
        ? false
        : ((await p.confirm({
            message: "Add documentation pages? (requires Fumadocs for Next.js)",
            initialValue: framework === "nextjs",
          })) as boolean);

  if (p.isCancel(addDocs)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const s = p.spinner();

  // 1. Create registry.json
  s.start("Creating registry.json...");

  const registryJson = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name,
    homepage,
    include: [`registry/${style}/ui/registry.json`],
  };

  writeFile(
    join(cwd, "registry.json"),
    JSON.stringify(registryJson, null, 2) + "\n"
  );

  // Create empty UI registry
  ensureDir(join(cwd, `registry/${style}/ui`));
  writeFile(
    join(cwd, `registry/${style}/ui/registry.json`),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry.json",
        items: [],
      },
      null,
      2
    ) + "\n"
  );

  s.stop("registry.json created.");

  // 2. Create or update components.json
  s.start("Configuring components.json...");

  if (existingConfig) {
    // Update existing components.json with registry namespace
    const existing = JSON.parse(
      readFileSync(join(cwd, "components.json"), "utf-8")
    );

    if (namespace && useNamespace) {
      existing.registries = existing.registries || {};
      existing.registries[namespace] = `${homepage}/r/{name}.json`;
    }

    writeFileSync(
      join(cwd, "components.json"),
      JSON.stringify(existing, null, 2) + "\n"
    );
  } else {
    // Create new components.json
    const componentsJson: Record<string, unknown> = {
      $schema: "https://ui.shadcn.com/schema.json",
      style,
      rsc: framework === "nextjs",
      tsx: true,
      tailwind: {
        config: "",
        css:
          framework === "nextjs" ? "app/globals.css" : "src/index.css",
        baseColor: "neutral",
        cssVariables: true,
        prefix: "",
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks",
      },
      iconLibrary: "lucide",
    };

    if (namespace && useNamespace) {
      componentsJson.registries = {
        [namespace]: `${homepage}/r/{name}.json`,
      };
    }

    writeFile(
      join(cwd, "components.json"),
      JSON.stringify(componentsJson, null, 2) + "\n"
    );
  }

  s.stop("components.json configured.");

  // 3. Add registry:build script to package.json
  s.start("Adding build script...");

  const pkgPath = join(cwd, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts["registry:build"]) {
    pkg.scripts["registry:build"] = "shadcn build";
  }

  // Add shadcn as dependency if not present
  pkg.dependencies = pkg.dependencies || {};
  if (!pkg.dependencies["shadcn"] && !pkg.devDependencies?.["shadcn"]) {
    pkg.dependencies["shadcn"] = "^4.0.0";
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  s.stop("Build script added.");

  // 4. Create lib/utils.ts if it doesn't exist
  if (!existsSync(join(cwd, "lib/utils.ts")) && !existsSync(join(cwd, "src/lib/utils.ts"))) {
    s.start("Creating lib/utils.ts...");
    const utilsDir = framework === "nextjs" ? "lib" : "src/lib";
    writeFile(
      join(cwd, `${utilsDir}/utils.ts`),
      `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
    );
    s.stop("lib/utils.ts created.");
  }

  // 5. Optional: add docs scaffolding
  if (addDocs && framework === "nextjs") {
    s.start("Setting up documentation...");

    ensureDir(join(cwd, "content/docs/components"));

    writeFile(
      join(cwd, "content/docs/index.mdx"),
      `---
title: Getting Started
description: Get started with ${name} — a custom shadcn component registry.
---

## Installation

Add the ${name} registry to your project:

\`\`\`bash
npx shadcn@latest registry add ${useNamespace ? `${namespace}=${homepage}/r/{name}.json` : `${homepage}/r/{name}.json`}
\`\`\`

Then install any component:

\`\`\`bash
npx shadcn@latest add ${useNamespace ? `${namespace}/button` : `${homepage}/r/button.json`}
\`\`\`

## Components

Browse available components in the sidebar.
`
    );

    writeFile(
      join(cwd, "content/docs/meta.json"),
      JSON.stringify(
        {
          title: name,
          pages: [
            "---Getting Started---",
            "index",
            "---Components---",
            "...components",
          ],
        },
        null,
        2
      ) + "\n"
    );

    writeFile(
      join(cwd, "content/docs/components/meta.json"),
      JSON.stringify({ title: "Components", pages: [] }, null, 2) + "\n"
    );

    s.stop("Documentation scaffolded.");
  }

  // 6. Add .gitignore entries
  const gitignorePath = join(cwd, ".gitignore");
  if (existsSync(gitignorePath)) {
    const gitignore = readFileSync(gitignorePath, "utf-8");
    const additions: string[] = [];

    if (!gitignore.includes("public/r/")) {
      additions.push("# Built registry output", "public/r/");
    }

    if (additions.length > 0) {
      writeFileSync(
        gitignorePath,
        gitignore.trimEnd() + "\n\n" + additions.join("\n") + "\n"
      );
    }
  }

  // Done
  const createdFiles = [
    `${pc.dim("Registry:")}     ${pc.cyan("registry.json")}`,
    `${pc.dim("UI registry:")}  ${pc.cyan(`registry/${style}/ui/registry.json`)}`,
    `${pc.dim("Config:")}       ${pc.cyan("components.json")} ${existingConfig ? "(updated)" : "(created)"}`,
    `${pc.dim("Build script:")} ${pc.cyan('package.json → "registry:build"')}`,
    addDocs ? `${pc.dim("Docs:")}         ${pc.cyan("content/docs/")}` : "",
    "",
    `${pc.dim("Next steps:")}`,
    `  1. Add components with ${pc.cyan("npx create-scn-stack add-component <name>")}`,
    `  2. Build the registry with ${pc.cyan("pnpm registry:build")}`,
    `  3. Deploy — registry JSON is served from ${pc.cyan("public/r/")}`,
  ]
    .filter(Boolean)
    .join("\n");

  p.note(createdFiles, `Registry initialized in ${pc.cyan(cwd)}`);

  p.outro(
    `${pc.green("✓")} Registry ${pc.bold(name)} added to your project. Happy building! 🎉`
  );
}

function readPkgName(cwd: string): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    const name = pkg.name?.replace(/^@[^/]+\//, "") || null;
    return name && /^[a-z][a-z0-9-]*$/.test(name) ? name : null;
  } catch {
    return null;
  }
}
