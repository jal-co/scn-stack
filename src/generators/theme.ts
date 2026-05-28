import type { ProjectConfig } from "../types.js";
import { writeFile, ensureDir } from "../utils.js";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Generates a registry:theme entry — a custom theme that users can install
 * with `npx shadcn add <namespace>/theme-<name>`.
 *
 * A registry theme is a CSS file with custom properties that override the
 * default shadcn theme variables.
 */
export function generateTheme(config: ProjectConfig): void {
  const dir = config.directory;
  const style = config.style;

  // Create themes directory
  const themeDir = join(dir, `registry/${style}/themes`);
  ensureDir(themeDir);

  // Default custom theme
  writeFile(
    join(themeDir, `${config.registryName}.css`),
    `/**
 * ${config.registryName} — custom theme
 *
 * Override these CSS custom properties to customize the theme.
 * Users install with: npx shadcn add <namespace>/theme-${config.registryName}
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
`
  );

  // Create per-directory registry.json for themes
  writeFile(
    join(themeDir, "registry.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry.json",
        items: [
          {
            name: `theme-${config.registryName}`,
            type: "registry:theme",
            title: `${config.registryName} Theme`,
            description: `Custom theme for ${config.registryName}.`,
            cssVars: {},
            files: [
              {
                path: `${config.registryName}.css`,
                type: "registry:theme",
              },
            ],
          },
        ],
      },
      null,
      2
    ) + "\n"
  );
}

/**
 * Adds the theme include path to the root registry.json.
 * Call this after generateTheme() if the project uses the include pattern.
 */
export function addThemeInclude(config: ProjectConfig): void {
  const registryPath = join(config.directory, "registry.json");

  if (!existsSync(registryPath)) return;

  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  const themePath = `registry/${config.style}/themes/registry.json`;

  if (registry.include && !registry.include.includes(themePath)) {
    registry.include.push(themePath);
    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  }
}
