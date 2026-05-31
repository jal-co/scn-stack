import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { printHeaderCompact, printFooter } from "../brand.js";
import { getRunCommand } from "../utils.js";
import type { PackageManager } from "../types.js";

/**
 * Detect the package manager a *project* uses (as opposed to the one
 * running this CLI) by sniffing its lockfile, falling back to npm.
 */
function detectProjectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock")))
    return "bun";
  return "npm";
}

export async function build(): Promise<void> {
  printHeaderCompact("build");

  const cwd = process.cwd();
  const registryPath = join(cwd, "registry.json");
  const pkgPath = join(cwd, "package.json");

  if (!existsSync(registryPath)) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  // Prefer the project's own registry:build script so we respect any
  // custom flags it sets; fall back to invoking shadcn build directly.
  let command: string;
  let hasScript = false;
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      hasScript = Boolean(pkg.scripts?.["registry:build"]);
    } catch {
      hasScript = false;
    }
  }

  const pm = detectProjectPackageManager(cwd);
  if (hasScript) {
    command = getRunCommand(pm, "registry:build");
  } else {
    command = pm === "bun" ? "bunx shadcn@latest build" : "npx shadcn@latest build";
  }

  console.log(`  ${pc.dim("›")} ${pc.cyan(command)}`);
  console.log();

  try {
    execSync(command, { cwd, stdio: "inherit" });
  } catch {
    p.cancel("Registry build failed. See the output above.");
    process.exit(1);
  }

  printFooter("Registry built. Output written to public/r/.");
}
