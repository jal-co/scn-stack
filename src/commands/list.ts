import * as p from "@clack/prompts";
import pc from "picocolors";
import { printHeaderCompact, printFooter } from "../brand.js";
import { loadRegistryContext, allItems } from "../registry-item.js";

interface ListArgs {
  type?: string;
  json?: boolean;
}

const TYPE_ALIASES: Record<string, string> = {
  ui: "registry:ui",
  component: "registry:ui",
  components: "registry:ui",
  hook: "registry:hook",
  hooks: "registry:hook",
  block: "registry:block",
  blocks: "registry:block",
  theme: "registry:theme",
  themes: "registry:theme",
};

export function parseListArgs(argv: string[]): ListArgs {
  const args: ListArgs = {};
  const rest = argv.slice(3); // skip node, script, "list"

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];
    if (arg === "--type" || arg === "-t") {
      args.type = next;
      i++;
    } else if (arg === "--json") {
      args.json = true;
    }
  }

  return args;
}

const TYPE_LABEL: Record<string, string> = {
  "registry:ui": "Components",
  "registry:hook": "Hooks",
  "registry:block": "Blocks",
  "registry:theme": "Themes",
};

const TYPE_ORDER = [
  "registry:ui",
  "registry:hook",
  "registry:block",
  "registry:theme",
];

export async function list(args: ListArgs): Promise<void> {
  const cwd = process.cwd();
  const ctx = loadRegistryContext(cwd);

  if (!ctx) {
    if (args.json) {
      console.log("[]");
      return;
    }
    p.cancel(
      "No registry.json found. Run this from the root of a project created with create-scn-stack."
    );
    process.exit(1);
  }

  let items = allItems(cwd).map((loc) => loc.item);

  if (args.type) {
    const wanted = TYPE_ALIASES[args.type] ?? args.type;
    items = items.filter((i) => i.type === wanted);
  }

  // --json is the scriptable path: no branding, just data on stdout.
  if (args.json) {
    console.log(
      JSON.stringify(
        items.map((i) => ({
          name: i.name,
          type: i.type,
          title: i.title,
          description: i.description,
        })),
        null,
        2
      )
    );
    return;
  }

  printHeaderCompact("list");

  if (items.length === 0) {
    console.log(`  ${pc.dim("No items registered yet.")}`);
    console.log(
      `  ${pc.dim("Add one with")} ${pc.cyan("npx create-scn-stack add-component <name>")}`
    );
    console.log();
    return;
  }

  // Group by type, preserving a stable display order.
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const arr = groups.get(item.type) ?? [];
    arr.push(item);
    groups.set(item.type, arr);
  }

  const sortedTypes = [...groups.keys()].sort(
    (a, b) =>
      (TYPE_ORDER.indexOf(a) + 1 || 99) - (TYPE_ORDER.indexOf(b) + 1 || 99)
  );

  for (const type of sortedTypes) {
    const group = groups.get(type)!;
    const label = TYPE_LABEL[type] ?? type;
    console.log(`  ${pc.bold(label)} ${pc.dim(`(${group.length})`)}`);

    const nameWidth = Math.max(...group.map((i) => i.name.length));
    for (const item of group) {
      const padded = item.name.padEnd(nameWidth);
      const desc = item.description ? pc.dim(item.description) : "";
      console.log(`    ${pc.cyan(padded)}  ${desc}`);
    }
    console.log();
  }

  printFooter(
    `${items.length} item${items.length === 1 ? "" : "s"} in ${ctx.registryName}.`
  );
}
