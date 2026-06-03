import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeFile, registryHasItem } from "../utils.js";
import { githubSlugFromHomepage } from "../registry-item.js";
import {
  printHeaderCompact,
  printSummaryBox,
  printFooter,
  labelValue,
} from "../brand.js";

interface FileSpec {
  /** Path in the repo (relative to registry root). */
  path: string;
  /** Where shadcn installs it in the consumer project (or ~/ for home). */
  target: string;
}

export interface AddFileArgs {
  name?: string;
  description?: string;
  files: FileSpec[];
}

/**
 * add-file [name] --file <path>[:<target>] [--file ...] [-d <desc>]
 *
 * `--file foo.md` distributes foo.md to the same relative target.
 * `--file foo.md:~/AGENTS.md` distributes foo.md to ~/AGENTS.md.
 * `--target` after a `--file` is an alternative way to set the target.
 */
export function parseAddFileArgs(argv: string[]): AddFileArgs {
  const args: AddFileArgs = { files: [] };
  const rest = argv.slice(3); // skip node, script, "add-file"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];

    if (arg === "--description" || arg === "-d") {
      args.description = next;
      i++;
    } else if (arg === "--file" || arg === "-f") {
      if (next) {
        const [path, inlineTarget] = next.split(/:(.+)/);
        args.files.push({ path, target: inlineTarget || path });
        i++;
      }
    } else if (arg === "--target") {
      // Apply to the most recently added file.
      if (next && args.files.length > 0) {
        args.files[args.files.length - 1].target = next;
        i++;
      }
    } else if (!arg.startsWith("-") && !args.name) {
      args.name = arg;
    }
  }

  return args;
}

export async function addFile(args: AddFileArgs): Promise<void> {
  printHeaderCompact("add-file");

  const cwd = process.cwd();
  const registryPath = join(cwd, "registry.json");

  if (!existsSync(registryPath)) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

  const name =
    args.name ||
    ((await p.text({
      message: "Item name",
      placeholder: "project-conventions",
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

  if (registryHasItem(cwd, name)) {
    p.cancel(`Item "${name}" already exists in the registry.`);
    process.exit(1);
  }

  let files = args.files;

  // Interactive fallback: collect a single file when none were passed.
  if (files.length === 0 && (p.isCI() || !p.isTTY(process.stdin))) {
    p.cancel(
      "No files specified. Pass --file <path>[:<target>] (repeatable)."
    );
    process.exit(1);
  }
  if (files.length === 0) {
    const path = (await p.text({
      message: "File path (relative to the registry root)",
      placeholder: "conventions/AGENTS.md",
      validate: (v) => (v ? undefined : "A file path is required."),
    })) as string;
    if (p.isCancel(path)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    const target = (await p.text({
      message: "Install target in the consumer project",
      placeholder: "~/AGENTS.md",
      defaultValue: path,
    })) as string;
    if (p.isCancel(target)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    files = [{ path, target }];
  }

  const defaultDescription = `Files distributed by ${name}.`;
  // Skip the prompt in non-interactive contexts (CI, piped input, tests) so
  // the command never hangs waiting for a keystroke that won't arrive.
  const nonInteractive = p.isCI() || !p.isTTY(process.stdin);
  const description =
    args.description ||
    (nonInteractive
      ? defaultDescription
      : ((await p.text({
          message: "Description",
          placeholder: defaultDescription,
          defaultValue: defaultDescription,
        })) as string));

  if (p.isCancel(description)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const s = p.spinner();
  s.start("Creating files...");

  // Create placeholder files for any that don't exist yet so the item is
  // installable immediately. Never overwrite existing files.
  for (const f of files) {
    const abs = join(cwd, f.path);
    if (!existsSync(abs)) {
      writeFile(abs, placeholderFor(f.path, name));
    }
  }
  s.stop("Files ready.");

  s.start("Updating registry...");
  const item = {
    name,
    type: "registry:item",
    title: titleFromName(name),
    description: description || `Files distributed by ${name}.`,
    files: files.map((f) => ({
      path: f.path,
      type: "registry:file" as const,
      target: f.target,
    })),
  };

  registry.items = Array.isArray(registry.items) ? registry.items : [];
  registry.items.push(item);
  writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  s.stop("Registry updated.");

  // Build the install command, preferring the GitHub source-registry form.
  const homepage =
    (registry.homepage as string | undefined) || `https://${registry.name}.com`;
  const slug = githubSlugFromHomepage(homepage);
  const installCmd = slug
    ? `npx shadcn@latest add ${slug}/${name}`
    : `npx shadcn@latest add ${homepage}/r/${name}.json`;

  printSummaryBox(`Added ${titleFromName(name)}`, [
    labelValue("Item:", `${pc.cyan(name)} (registry:item)`),
    ...files.map((f) =>
      labelValue("File:", `${f.path} ${pc.dim("→")} ${pc.cyan(f.target)}`)
    ),
    labelValue("Registry:", `${pc.cyan("registry.json")} (updated)`),
    "",
    labelValue("Install:", pc.cyan(installCmd)),
  ]);

  printFooter(`${titleFromName(name)} added to your registry.`);
}

function placeholderFor(path: string, name: string): string {
  if (path.endsWith(".json")) return "{}\n";
  if (path.endsWith(".md") || path.endsWith(".mdx")) {
    return `# ${titleFromName(name)}\n\nDistributed by the registry. Edit \`${path}\`.\n`;
  }
  return `# ${titleFromName(name)} — distributed by the registry. Edit ${path}.\n`;
}

function titleFromName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
