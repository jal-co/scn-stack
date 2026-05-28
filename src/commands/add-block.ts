import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeFile, ensureDir, titleCase } from "../utils.js";
import { printHeaderCompact, printSummaryBox, printFooter, labelValue } from "../brand.js";

interface AddBlockArgs {
  name?: string;
  description?: string;
}

export function parseAddBlockArgs(argv: string[]): AddBlockArgs {
  const args: AddBlockArgs = {};
  const rest = argv.slice(3); // skip node, script, "add-block"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];

    if (arg === "--description" || arg === "-d") {
      args.description = next;
      i++;
    } else if (!arg.startsWith("-") && !args.name) {
      args.name = arg;
    }
  }

  return args;
}

export async function addBlock(args: AddBlockArgs): Promise<void> {
  printHeaderCompact("add-block");

  const cwd = process.cwd();
  const registryPath = join(cwd, "registry.json");
  const componentsJsonPath = join(cwd, "components.json");

  if (!existsSync(registryPath)) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  const componentsJson = existsSync(componentsJsonPath)
    ? JSON.parse(readFileSync(componentsJsonPath, "utf-8"))
    : null;

  const style = componentsJson?.style || "new-york";

  // Prompt for name if not provided
  const name =
    args.name ||
    ((await p.text({
      message: "Block name",
      placeholder: "login-form",
      validate: (v) => {
        if (!v) return "Name is required.";
        if (!/^[a-z][a-z0-9-]*$/.test(v))
          return "Lowercase letters, numbers, and hyphens only.";
        return undefined;
      },
    })) as string);

  if (p.isCancel(name)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const description =
    args.description ||
    ((await p.text({
      message: "Description",
      placeholder: `A ${name} block.`,
      defaultValue: `A ${name} block.`,
    })) as string);

  if (p.isCancel(description)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Check if block already exists
  const existing = registry.items?.find(
    (item: { name: string }) => item.name === name
  );
  if (existing) {
    p.cancel(`Block "${name}" already exists in registry.json.`);
    process.exit(1);
  }

  const s = p.spinner();

  // 1. Create block source file
  s.start("Creating block...");

  const blockDir = join(cwd, `registry/${style}/blocks`);
  ensureDir(blockDir);

  const blockTitle = titleCase(name);
  const blockName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const blockSource = `import * as React from "react"
import { cn } from "@/lib/utils"

export function ${blockName}() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">${blockTitle}</h1>
          <p className="text-sm text-muted-foreground">
            ${description || `A ${name} block.`}
          </p>
        </div>
        {/* Add your block content here */}
      </div>
    </div>
  )
}
`;

  writeFile(join(blockDir, `${name}.tsx`), blockSource);
  s.stop("Block created.");

  // 2. Add to registry
  s.start("Updating registry...");

  const blocksRegistryPath = join(
    cwd,
    `registry/${style}/blocks/registry.json`
  );
  const usesInclude = registry.include && Array.isArray(registry.include);
  const blocksIncludePath = `registry/${style}/blocks/registry.json`;

  if (usesInclude) {
    // Ensure include references blocks registry
    if (!registry.include.includes(blocksIncludePath)) {
      registry.include.push(blocksIncludePath);
      writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
    }

    // Write to per-directory registry.json
    const blocksRegistry = existsSync(blocksRegistryPath)
      ? JSON.parse(readFileSync(blocksRegistryPath, "utf-8"))
      : { $schema: "https://ui.shadcn.com/schema/registry.json", items: [] };

    blocksRegistry.items.push({
      name,
      type: "registry:block",
      title: blockTitle,
      description: description || `A ${name} block.`,
      files: [{ path: `${name}.tsx`, type: "registry:block" }],
    });

    writeFileSync(
      blocksRegistryPath,
      JSON.stringify(blocksRegistry, null, 2) + "\n"
    );
  } else {
    // Write to root registry.json
    registry.items = registry.items || [];
    registry.items.push({
      name,
      type: "registry:block",
      title: blockTitle,
      description: description || `A ${name} block.`,
      files: [
        {
          path: `registry/${style}/blocks/${name}.tsx`,
          type: "registry:block",
        },
      ],
    });

    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  }

  s.stop("Registry updated.");

  // 3. Create docs page if content/docs exists
  const docsDir = join(cwd, "content/docs/blocks");
  if (existsSync(join(cwd, "content/docs"))) {
    s.start("Creating docs page...");

    ensureDir(docsDir);

    const registryName = registry.name || "my-ui";
    const namespace = componentsJson?.registries
      ? Object.keys(componentsJson.registries)[0]
      : null;

    const installCmd = namespace
      ? `npx shadcn@latest add ${namespace}/${name}`
      : `npx shadcn@latest add https://${registryName}.com/r/${name}.json`;

    const docContent = `---
title: ${blockTitle}
description: ${description || `A ${name} block.`}
---

## Preview

A full-page block for ${blockTitle.toLowerCase()}.

## Installation

\`\`\`bash
${installCmd}
\`\`\`

## Usage

\`\`\`tsx
import { ${blockName} } from "@/components/blocks/${name}"

export default function Page() {
  return <${blockName} />
}
\`\`\`
`;

    writeFile(join(docsDir, `${name}.mdx`), docContent);

    // Update meta.json if it exists
    const metaPath = join(docsDir, "meta.json");
    if (existsSync(metaPath)) {
      const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      if (meta.pages && !meta.pages.includes(name)) {
        meta.pages.push(name);
        writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
      }
    }

    s.stop("Docs page created.");
  }

  // Done
  printSummaryBox(`Added ${blockTitle}`, [
    labelValue("Block:", `registry/${style}/blocks/${pc.cyan(name + ".tsx")}`),
    labelValue("Registry:", `${pc.cyan("registry.json")} (updated)`),
    existsSync(docsDir)
      ? labelValue("Docs:", `content/docs/blocks/${pc.cyan(name + ".mdx")}`)
      : "",
    "",
    `Edit the block, then run ${pc.cyan("pnpm registry:build")}`,
  ]);

  printFooter(`${blockTitle} added to your registry.`);
}
