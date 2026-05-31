import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeFile, ensureDir, titleCase } from "../utils.js";
import {
  printHeaderCompact,
  printSummaryBox,
  printFooter,
  labelValue,
} from "../brand.js";
import {
  loadRegistryContext,
  registryHasItem,
  installCommand,
} from "../registry-item.js";

interface AddThemeArgs {
  name?: string;
  description?: string;
}

export function parseAddThemeArgs(argv: string[]): AddThemeArgs {
  const args: AddThemeArgs = {};
  const rest = argv.slice(3); // skip node, script, "add-theme"

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

const THEME_CSS = (name: string) => `/**
 * ${name} — custom theme
 *
 * Override these CSS custom properties to customize the theme. Users
 * install with the command shown in the docs page for this theme.
 */

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
`;

export async function addTheme(args: AddThemeArgs): Promise<void> {
  printHeaderCompact("add-theme");

  const cwd = process.cwd();
  const ctx = loadRegistryContext(cwd);

  if (!ctx) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  const { registry, registryPath, style } = ctx;

  const name =
    args.name ||
    ((await p.text({
      message: "Theme name",
      placeholder: "midnight",
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
      placeholder: `The ${name} theme.`,
      defaultValue: `The ${name} theme.`,
    })) as string);

  if (p.isCancel(description)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Themes are registered as `theme-<name>` so they don't collide with a
  // component of the same name and to match shadcn's convention.
  const itemName = `theme-${name}`;

  if (registryHasItem(cwd, itemName)) {
    p.cancel(`Theme "${name}" already exists in the registry.`);
    process.exit(1);
  }

  const s = p.spinner();

  // 1. Create theme CSS file.
  s.start("Creating theme...");
  const themeTitle = titleCase(name);
  const themeDir = join(cwd, `registry/${style}/themes`);
  ensureDir(themeDir);
  writeFile(join(themeDir, `${name}.css`), THEME_CSS(name));
  s.stop("Theme created.");

  // 2. Register in the themes registry (include pattern) or root (flat).
  s.start("Updating registry...");
  const themesRegistryPath = join(
    cwd,
    `registry/${style}/themes/registry.json`
  );
  const themesIncludePath = `registry/${style}/themes/registry.json`;

  const newItem = {
    name: itemName,
    type: "registry:theme",
    title: `${themeTitle} Theme`,
    description: description || `The ${name} theme.`,
    cssVars: {},
    files: [
      {
        path: ctx.usesInclude
          ? `${name}.css`
          : `registry/${style}/themes/${name}.css`,
        type: "registry:theme",
      },
    ],
  };

  if (ctx.usesInclude) {
    if (!registry.include!.includes(themesIncludePath)) {
      registry.include!.push(themesIncludePath);
      writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
    }

    const themesRegistry = existsSync(themesRegistryPath)
      ? JSON.parse(readFileSync(themesRegistryPath, "utf-8"))
      : { $schema: "https://ui.shadcn.com/schema/registry.json", items: [] };

    themesRegistry.items.push(newItem);
    writeFileSync(
      themesRegistryPath,
      JSON.stringify(themesRegistry, null, 2) + "\n"
    );
  } else {
    registry.items = registry.items || [];
    registry.items.push(newItem);
    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  }
  s.stop("Registry updated.");

  // 3. Create docs page if a docs site exists.
  const docsDir = join(cwd, "content/docs/themes");
  if (existsSync(join(cwd, "content/docs"))) {
    s.start("Creating docs page...");
    ensureDir(docsDir);

    const installCmd = installCommand(ctx, itemName);

    const docContent = `---
title: ${themeTitle}
description: ${description || `The ${name} theme.`}
---

## Installation

\`\`\`bash
${installCmd}
\`\`\`

## Usage

Installing this theme writes its CSS custom properties into your project's
global stylesheet. Toggle dark mode by adding the \`dark\` class to a parent
element (typically \`<html>\`).

Edit \`registry/${style}/themes/${name}.css\` to customize the tokens.
`;

    writeFile(join(docsDir, `${name}.mdx`), docContent);

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

  printSummaryBox(`Added ${themeTitle} theme`, [
    labelValue("Theme:", `registry/${style}/themes/${pc.cyan(name + ".css")}`),
    labelValue("Registry:", `${pc.cyan("registry.json")} (updated)`),
    labelValue("Item name:", pc.cyan(itemName)),
    existsSync(docsDir)
      ? labelValue("Docs:", `content/docs/themes/${pc.cyan(name + ".mdx")}`)
      : "",
    "",
    `Edit the tokens, then run ${pc.cyan("pnpm registry:build")}`,
  ]);

  printFooter(`${themeTitle} theme added to your registry.`);
}
