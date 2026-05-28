import { existsSync, mkdirSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import type { PackageManager } from "./types.js";

export function detectPackageManager(): PackageManager {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  return "pnpm";
}

export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun install";
    case "npm":
    default:
      return "npm install";
  }
}

export function getRunCommand(pm: PackageManager, script: string): string {
  switch (pm) {
    case "pnpm":
      return `pnpm ${script}`;
    case "yarn":
      return `yarn ${script}`;
    case "bun":
      return `bun run ${script}`;
    case "npm":
    default:
      return `npm run ${script}`;
  }
}

export function getDlxCommand(pm: PackageManager): string {
  switch (pm) {
    case "pnpm":
      return "pnpm dlx";
    case "yarn":
      return "yarn dlx";
    case "bun":
      return "bunx";
    case "npm":
    default:
      return "npx";
  }
}

export function writeFile(filePath: string, content: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content, "utf-8");
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function runCommand(
  command: string,
  cwd: string,
  silent = false
): string {
  return execSync(command, {
    cwd,
    stdio: silent ? "pipe" : "inherit",
    encoding: "utf-8",
  });
}

export function titleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns true if `name` is already registered as an item in either the
 * root registry.json or any per-directory registry.json listed under its
 * `include` array. This is the source of truth for add-component /
 * add-hook / add-block duplicate detection.
 */
export function registryHasItem(cwd: string, name: string): boolean {
  const rootPath = join(cwd, "registry.json");
  if (!existsSync(rootPath)) return false;

  const root = safeReadJson(rootPath);
  if (!root) return false;

  if (Array.isArray(root.items) && root.items.some((i: { name?: string }) => i?.name === name)) {
    return true;
  }

  const includes: string[] = Array.isArray(root.include) ? root.include : [];
  for (const rel of includes) {
    const sub = safeReadJson(join(cwd, rel));
    if (!sub) continue;
    if (
      Array.isArray(sub.items) &&
      sub.items.some((i: { name?: string }) => i?.name === name)
    ) {
      return true;
    }
  }

  return false;
}

function safeReadJson(path: string): Record<string, unknown> & {
  items?: { name?: string }[];
  include?: string[];
} | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}
