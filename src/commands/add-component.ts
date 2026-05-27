import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { writeFile, ensureDir, titleCase } from "../utils.js";

interface AddComponentArgs {
  name?: string;
  description?: string;
}

export function parseAddComponentArgs(argv: string[]): AddComponentArgs {
  const args: AddComponentArgs = {};
  const rest = argv.slice(3); // skip node, script, "add-component"

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

export async function addComponent(args: AddComponentArgs): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" add-component ")));

  // Must be run from a project with registry.json
  const cwd = process.cwd();
  const registryPath = join(cwd, "registry.json");
  const componentsJsonPath = join(cwd, "components.json");

  if (!existsSync(registryPath)) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  // Read existing config
  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  const componentsJson = existsSync(componentsJsonPath)
    ? JSON.parse(readFileSync(componentsJsonPath, "utf-8"))
    : null;

  const style = componentsJson?.style || "new-york";

  // Prompt for name if not provided
  const name =
    args.name ||
    ((await p.text({
      message: "Component name",
      placeholder: "input",
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
      placeholder: `A ${name} component.`,
      defaultValue: `A ${name} component.`,
    })) as string);

  if (p.isCancel(description)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Check if component already exists
  const existing = registry.items?.find(
    (item: { name: string }) => item.name === name
  );
  if (existing) {
    p.cancel(`Component "${name}" already exists in registry.json.`);
    process.exit(1);
  }

  const s = p.spinner();

  // 1. Create component source file
  s.start("Creating component...");

  const componentDir = join(cwd, `registry/${style}/ui`);
  ensureDir(componentDir);

  const componentTitle = titleCase(name);
  const componentName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const componentSource = `import * as React from "react"
import { cn } from "@/lib/utils"

interface ${componentName}Props extends React.HTMLAttributes<HTMLDivElement> {}

const ${componentName} = React.forwardRef<HTMLDivElement, ${componentName}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    )
  }
)
${componentName}.displayName = "${componentName}"

export { ${componentName} }
export type { ${componentName}Props }
`;

  writeFile(join(componentDir, `${name}.tsx`), componentSource);
  s.stop("Component created.");

  // 2. Add to registry.json
  s.start("Updating registry.json...");

  const newItem = {
    name,
    type: "registry:ui",
    title: componentTitle,
    description: description || `A ${name} component.`,
    files: [
      {
        path: `registry/${style}/ui/${name}.tsx`,
        type: "registry:ui",
      },
    ],
  };

  registry.items = registry.items || [];
  registry.items.push(newItem);

  writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  s.stop("Registry updated.");

  // 3. Create docs page if content/docs exists
  const docsDir = join(cwd, "content/docs/components");
  if (existsSync(join(cwd, "content/docs"))) {
    s.start("Creating docs page...");

    ensureDir(docsDir);

    // Determine install prefix from registry config
    const registryName = registry.name || "my-ui";
    const namespace = componentsJson?.registries
      ? Object.keys(componentsJson.registries)[0]
      : null;

    const installCmd = namespace
      ? `npx shadcn@latest add ${namespace}/${name}`
      : `npx shadcn@latest add https://${registryName}.com/r/${name}.json`;

    const docContent = `---
title: ${componentTitle}
description: ${description || `A ${name} component.`}
---

## Installation

\`\`\`bash
${installCmd}
\`\`\`

## Usage

\`\`\`tsx
import { ${componentName} } from "@/components/ui/${name}"

export function Example() {
  return <${componentName}>Content</${componentName}>
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
      `${pc.dim("Component:")}  registry/${style}/ui/${pc.cyan(name + ".tsx")}`,
      `${pc.dim("Registry:")}   ${pc.cyan("registry.json")} (updated)`,
      existsSync(docsDir)
        ? `${pc.dim("Docs:")}       content/docs/components/${pc.cyan(name + ".mdx")}`
        : "",
      "",
      `${pc.dim("Next:")}       Edit the component, then run ${pc.cyan("pnpm registry:build")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    `Added ${componentTitle}`
  );

  p.outro(`${pc.green("✓")} ${componentTitle} added to your registry.`);
}
