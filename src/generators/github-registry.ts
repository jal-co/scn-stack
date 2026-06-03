import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { generateComponents } from "./components.js";
import { generateRegistryJson, generateComponentsJson } from "./registry.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Scaffold a GitHub *source registry* (the June 2026 shadcn feature).
 *
 * A public GitHub repository with a root registry.json *is* the registry.
 * The shadcn CLI reads registry.json directly, resolves `include` entries,
 * finds the requested item and installs its files. There is no framework
 * app, no `shadcn build`, no published JSON, and no server.
 *
 * Users install with:
 *   npx shadcn@latest add <owner>/<repo>/<item>
 *
 * This generator deliberately produces a *minimal* repo: registry.json,
 * components.json (so contributors get autocomplete + correct aliases),
 * source files, an example "project-conventions" file item, and a README.
 */
export function generateGithubRegistry(config: ProjectConfig): void {
  const dir = config.directory;

  // registry.json (root, with include) + per-directory UI registry.
  // generateComponentsJson is reused so contributors editing the repo get a
  // correct components.json; it's harmless for consumers.
  generateRegistryJson(config);
  generateComponentsJson(config);

  // Starter component sources + cn() util (framework-agnostic).
  if (config.starterComponents !== "none") {
    generateComponents(config);
  }

  // A ready-to-edit "project-conventions" file item that shows off the
  // "distribute anything" capability: shared docs, editor settings, and
  // agent instructions installed into the consumer's project (and home dir).
  writeProjectConventions(config);

  // tsconfig with the @/* alias so the source files type-check in-repo.
  writeFile(
    join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["DOM", "DOM.Iterable", "ES2020"],
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          skipLibCheck: true,
          baseUrl: ".",
          paths: { "@/*": ["./*"] },
        },
        include: ["registry", "lib"],
      },
      null,
      2
    ) + "\n"
  );

  writeFile(
    join(dir, ".gitignore"),
    "node_modules/\n.DS_Store\n*.log\n"
  );

  generateGithubReadme(config);
}

/**
 * Add a `project-conventions` item that installs shared project files via
 * the registry:file type with `~/` (home-relative) and project-relative
 * targets — exactly the pattern the shadcn announcement highlights.
 */
function writeProjectConventions(config: ProjectConfig): void {
  const dir = config.directory;

  // Ship the actual files the item distributes.
  writeFile(
    join(dir, "conventions/AGENTS.md"),
    `# Agent Instructions

These instructions are distributed by the \`${config.registryName}\` registry.

- Match existing conventions before adding new patterns.
- Prefer composition over configuration.
- Keep components accessible by default.
`
  );

  writeFile(
    join(dir, "conventions/.editorconfig"),
    `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
  );

  writeFile(
    join(dir, "conventions/conventions.md"),
    `# Project Conventions

Shared conventions distributed by \`${config.registryName}\`.

Edit \`conventions/conventions.md\` in the registry repo to update what
consumers receive.
`
  );

  // Append the item to the root registry.json (file items live alongside
  // the include entries, not in the per-directory UI registry).
  const rootPath = join(dir, "registry.json");
  // generateRegistryJson already wrote the root file; we mutate it here to
  // add the file item so the example ships out of the box.
  appendItemToRegistry(rootPath, {
    name: "project-conventions",
    type: "registry:item",
    title: "Project Conventions",
    description:
      "Shared docs, editor settings, and agent instructions for consumers.",
    files: [
      {
        path: "conventions/AGENTS.md",
        type: "registry:file",
        target: "~/AGENTS.md",
      },
      {
        path: "conventions/.editorconfig",
        type: "registry:file",
        target: ".editorconfig",
      },
      {
        path: "conventions/conventions.md",
        type: "registry:file",
        target: "docs/conventions.md",
      },
    ],
  });
}

function appendItemToRegistry(
  rootPath: string,
  item: Record<string, unknown>
): void {
  // The root registry.json was just written by generateRegistryJson with an
  // `include` array but no `items`. Read, add the item, write back.
  if (!existsSync(rootPath)) return;
  const doc = JSON.parse(readFileSync(rootPath, "utf-8")) as {
    items?: unknown[];
    [k: string]: unknown;
  };
  doc.items = Array.isArray(doc.items) ? doc.items : [];
  doc.items.push(item);
  writeFileSync(rootPath, JSON.stringify(doc, null, 2) + "\n");
}

function generateGithubReadme(config: ProjectConfig): void {
  const slug = config.githubSlug || `<owner>/${config.registryName}`;
  const name = config.registryName;

  const addExample =
    config.starterComponents !== "none"
      ? `npx shadcn@latest add ${slug}/button`
      : `npx shadcn@latest add ${slug}/project-conventions`;

  writeFile(
    join(config.directory, "README.md"),
    `# ${name}

A [shadcn **GitHub source registry**](https://ui.shadcn.com/docs/registry).

This repository *is* the registry. There is no build step, no published JSON,
and no server — the shadcn CLI reads \`registry.json\` directly from GitHub,
resolves the requested item, and installs its files.

## Install items

\`\`\`bash
npx shadcn@latest add ${slug}/<item>
\`\`\`

For example:

\`\`\`bash
${addExample}
\`\`\`

## Browse items

\`\`\`bash
# List everything in this registry
npx shadcn@latest list ${slug}

# Search items
npx shadcn@latest search ${slug} --query button

# View a single item
npx shadcn@latest view ${slug}/${config.starterComponents !== "none" ? "button" : "project-conventions"}
\`\`\`

## What's distributed

| Item | Type | Notes |
|---|---|---|
${config.starterComponents !== "none" ? "| `button` | `registry:ui` | Component source |\n" : ""}${config.starterComponents === "essentials" ? "| `card` | `registry:ui` | Component source |\n| `badge` | `registry:ui` | Component source |\n" : ""}| \`project-conventions\` | \`registry:item\` | Docs, editor config, agent instructions |

A GitHub registry can distribute components, hooks, utilities, design tokens,
feature kits, project conventions, agent instructions, testing setup, CI/release
workflows, templates, codemods, migration kits, and other project files.

## Add more items

\`\`\`bash
# Components, hooks, blocks (with source + registry entry)
npx create-scn-stack add-component <name>
npx create-scn-stack add-hook <name>
npx create-scn-stack add-block <name>

# Arbitrary file items (conventions, CI workflows, agent instructions, …)
npx create-scn-stack add-file <name> --file path/to/file --target <target>
\`\`\`

After editing, just commit and push — there's nothing to build.

## License

MIT
`
  );
}
