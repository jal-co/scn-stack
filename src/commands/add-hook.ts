import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeFile, ensureDir, titleCase } from "../utils.js";

interface AddHookArgs {
  name?: string;
  description?: string;
}

export function parseAddHookArgs(argv: string[]): AddHookArgs {
  const args: AddHookArgs = {};
  const rest = argv.slice(3); // skip node, script, "add-hook"

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

export async function addHook(args: AddHookArgs): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" add-hook ")));

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
      message: "Hook name",
      placeholder: "use-toggle",
      validate: (v) => {
        if (!v) return "Name is required.";
        if (!/^use-[a-z][a-z0-9-]*$/.test(v))
          return "Hook names must start with 'use-' followed by lowercase letters, numbers, and hyphens.";
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
      placeholder: `A custom ${name} hook.`,
      defaultValue: `A custom ${name} hook.`,
    })) as string);

  if (p.isCancel(description)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Check if hook already exists
  const existing = registry.items?.find(
    (item: { name: string }) => item.name === name
  );
  if (existing) {
    p.cancel(`Hook "${name}" already exists in registry.json.`);
    process.exit(1);
  }

  const s = p.spinner();

  // 1. Create hook source file
  s.start("Creating hook...");

  const hookDir = join(cwd, `registry/${style}/hooks`);
  ensureDir(hookDir);

  const hookTitle = titleCase(name);
  const hookFnName = name
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");

  const hookSource = `import * as React from "react"

export function ${hookFnName}() {
  const [state, setState] = React.useState(false)

  const toggle = React.useCallback(() => {
    setState((prev) => !prev)
  }, [])

  return { state, toggle, setState } as const
}
`;

  writeFile(join(hookDir, `${name}.ts`), hookSource);
  s.stop("Hook created.");

  // 2. Add to registry
  s.start("Updating registry...");

  const hooksRegistryPath = join(cwd, `registry/${style}/hooks/registry.json`);
  const usesInclude = registry.include && Array.isArray(registry.include);
  const hooksIncludePath = `registry/${style}/hooks/registry.json`;

  if (usesInclude) {
    // Ensure include references hooks registry
    if (!registry.include.includes(hooksIncludePath)) {
      registry.include.push(hooksIncludePath);
      writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
    }

    // Write to per-directory registry.json
    const hooksRegistry = existsSync(hooksRegistryPath)
      ? JSON.parse(readFileSync(hooksRegistryPath, "utf-8"))
      : { $schema: "https://ui.shadcn.com/schema/registry.json", items: [] };

    hooksRegistry.items.push({
      name,
      type: "registry:hook",
      title: hookTitle,
      description: description || `A custom ${name} hook.`,
      files: [{ path: `${name}.ts`, type: "registry:hook" }],
    });

    writeFileSync(
      hooksRegistryPath,
      JSON.stringify(hooksRegistry, null, 2) + "\n"
    );
  } else {
    // Write to root registry.json
    registry.items = registry.items || [];
    registry.items.push({
      name,
      type: "registry:hook",
      title: hookTitle,
      description: description || `A custom ${name} hook.`,
      files: [
        {
          path: `registry/${style}/hooks/${name}.ts`,
          type: "registry:hook",
        },
      ],
    });

    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  }

  s.stop("Registry updated.");

  // 3. Create docs page if content/docs exists
  const docsDir = join(cwd, "content/docs/hooks");
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
title: ${hookTitle}
description: ${description || `A custom ${name} hook.`}
---

## Installation

\`\`\`bash
${installCmd}
\`\`\`

## Usage

\`\`\`tsx
import { ${hookFnName} } from "@/hooks/${name}"

export function Example() {
  const { state, toggle } = ${hookFnName}()

  return (
    <button onClick={toggle}>
      {state ? "On" : "Off"}
    </button>
  )
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
  p.note(
    [
      `${pc.dim("Hook:")}       registry/${style}/hooks/${pc.cyan(name + ".ts")}`,
      `${pc.dim("Registry:")}   ${pc.cyan("registry.json")} (updated)`,
      existsSync(docsDir)
        ? `${pc.dim("Docs:")}       content/docs/hooks/${pc.cyan(name + ".mdx")}`
        : "",
      "",
      `${pc.dim("Next:")}       Edit the hook, then run ${pc.cyan("pnpm registry:build")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    `Added ${hookTitle}`
  );

  p.outro(`${pc.green("✓")} ${hookTitle} added to your registry.`);
}
