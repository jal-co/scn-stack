import * as p from "@clack/prompts";
import pc from "picocolors";
import { existsSync, rmSync } from "node:fs";
import { relative } from "node:path";
import {
  printHeaderCompact,
  printSummaryBox,
  printFooter,
  labelValue,
} from "../brand.js";
import {
  loadRegistryContext,
  findItem,
  removeItemFromRegistry,
  resolveItemFiles,
  removeDocsPage,
} from "../registry-item.js";

interface RemoveArgs {
  name?: string;
  yes?: boolean;
}

export function parseRemoveArgs(argv: string[]): RemoveArgs {
  const args: RemoveArgs = {};
  const rest = argv.slice(3); // skip node, script, "remove"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--yes" || arg === "-y") {
      args.yes = true;
    } else if (!arg.startsWith("-") && !args.name) {
      args.name = arg;
    }
  }

  return args;
}

export async function remove(args: RemoveArgs): Promise<void> {
  printHeaderCompact("remove");

  const cwd = process.cwd();
  const ctx = loadRegistryContext(cwd);

  if (!ctx) {
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  const name =
    args.name ||
    ((await p.text({
      message: "Item name to remove",
      placeholder: "button",
      validate: (v) => (v ? undefined : "Name is required."),
    })) as string);

  if (p.isCancel(name)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const loc = findItem(cwd, name);
  if (!loc) {
    p.cancel(`No item named "${name}" found in the registry.`);
    process.exit(1);
  }

  // Resolve everything we're about to delete so the user can review it
  // before anything irreversible happens.
  const relFiles = (loc.item.files ?? []).map((f) => f.path);
  const absFiles = resolveItemFiles(cwd, loc, relFiles).filter(existsSync);
  const docsFolder =
    loc.item.type === "registry:hook"
      ? "hooks"
      : loc.item.type === "registry:block"
        ? "blocks"
        : loc.item.type === "registry:theme"
          ? "themes"
          : "components";
  const docPathPreview = existsSync(
    `${cwd}/content/docs/${docsFolder}/${name}.mdx`
  )
    ? `content/docs/${docsFolder}/${name}.mdx`
    : null;

  const planLines = [
    labelValue("Item:", `${pc.cyan(name)} (${loc.item.type})`),
    labelValue(
      "Registry:",
      `${pc.cyan(relative(cwd, loc.registryFilePath) || "registry.json")} (entry removed)`
    ),
    ...absFiles.map((f) => labelValue("Delete:", pc.red(relative(cwd, f)))),
    docPathPreview ? labelValue("Delete:", pc.red(docPathPreview)) : "",
  ];

  if (!args.yes) {
    p.note(planLines.filter(Boolean).join("\n"), "The following will be removed");

    const proceed = await p.confirm({
      message: `Remove "${name}"? This deletes the files above.`,
      initialValue: false,
    });

    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Nothing removed.");
      process.exit(0);
    }
  }

  const s = p.spinner();

  // 1. Remove the registry entry.
  s.start("Updating registry...");
  removeItemFromRegistry(loc);
  s.stop("Registry updated.");

  // 2. Delete source files.
  s.start("Deleting source files...");
  for (const file of absFiles) {
    rmSync(file, { force: true });
  }
  s.stop(`Deleted ${absFiles.length} file${absFiles.length === 1 ? "" : "s"}.`);

  // 3. Delete docs page + prune meta.json.
  const removedDoc = removeDocsPage(cwd, loc.item.type, name);

  printSummaryBox(`Removed ${name}`, [
    labelValue("Type:", loc.item.type),
    labelValue(
      "Registry:",
      `${pc.cyan(relative(cwd, loc.registryFilePath) || "registry.json")} (updated)`
    ),
    ...absFiles.map((f) => labelValue("Deleted:", relative(cwd, f))),
    removedDoc ? labelValue("Docs:", removedDoc) : "",
    "",
    `Run ${pc.cyan("pnpm registry:build")} to rebuild your registry output.`,
  ]);

  printFooter(`${name} removed from your registry.`);
}
