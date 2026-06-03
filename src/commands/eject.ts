import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { printHeaderCompact, printFooter } from "../brand.js";
import { getDlxCommand } from "../utils.js";
import type { PackageManager } from "../types.js";

export interface EjectArgs {
  /** -c / --cwd: workspace dir that holds components.json + global CSS. */
  workspace?: string;
}

export function parseEjectArgs(argv: string[]): EjectArgs {
  const args: EjectArgs = {};
  const rest = argv.slice(3); // skip node, script, "eject"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];
    if (arg === "-c" || arg === "--cwd" || arg === "--workspace") {
      args.workspace = next;
      i++;
    }
  }

  return args;
}

function detectProjectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock")))
    return "bun";
  return "npm";
}

/**
 * `shadcn eject` (May 2026) inlines `shadcn/tailwind.css` into your global
 * CSS file and removes the `shadcn` package dependency. This is a thin,
 * package-manager-aware passthrough to `shadcn@latest eject` so users can
 * run it through the create-scn-stack CLI they already have.
 */
export async function eject(args: EjectArgs): Promise<void> {
  printHeaderCompact("eject");

  const cwd = process.cwd();

  // In a monorepo the components.json + global CSS live in a workspace, so
  // shadcn needs -c <workspace>. Resolve the workspace we'll operate on.
  const workspace = args.workspace ? join(cwd, args.workspace) : cwd;
  const componentsJson = join(workspace, "components.json");

  if (!existsSync(componentsJson)) {
    p.cancel(
      `No components.json found in ${pc.cyan(args.workspace ?? ".")}. ` +
        `Run from a project with components.json, or pass ${pc.cyan("-c <workspace>")}.`
    );
    process.exit(1);
  }

  const pm = detectProjectPackageManager(cwd);
  const dlx = getDlxCommand(pm);

  let command = `${dlx} shadcn@latest eject`;
  if (args.workspace) command += ` -c ${args.workspace}`;

  p.note(
    [
      pc.dim("This will:"),
      "  • inline shadcn/tailwind.css into your global CSS file",
      "  • remove the shadcn dependency from package.json",
      "",
      `${pc.dim("›")} ${pc.cyan(command)}`,
    ].join("\n"),
    "shadcn eject"
  );

  const proceed = await p.confirm({
    message: "Eject shadcn/tailwind.css now?",
    initialValue: true,
  });

  if (p.isCancel(proceed) || !proceed) {
    p.cancel("Cancelled. Nothing was changed.");
    process.exit(0);
  }

  try {
    execSync(command, { cwd, stdio: "inherit" });
  } catch {
    p.cancel("Eject failed. See the output above.");
    process.exit(1);
  }

  // Surface the CSS file we expect changed, if discoverable.
  let cssHint = "";
  try {
    const cfg = JSON.parse(readFileSync(componentsJson, "utf-8"));
    const css = cfg?.tailwind?.css as string | undefined;
    if (css) cssHint = ` See ${pc.cyan(css)}.`;
  } catch {
    cssHint = "";
  }

  printFooter(
    `Ejected shadcn/tailwind.css and removed the shadcn dependency.${cssHint}`
  );
}
