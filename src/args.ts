import type {
  Framework,
  DocsEngine,
  StarterComponents,
  PackageManager,
  Style,
} from "./types.js";

export interface CliArgs {
  name?: string;
  directory?: string;
  style?: Style;
  homepage?: string;
  framework?: Framework;
  docs?: DocsEngine;
  components?: StarterComponents;
  namespace?: string;
  pm?: PackageManager;
  yes?: boolean;
  help?: boolean;
}

const FRAMEWORKS = new Set(["nextjs", "vite", "react-router", "tanstack-start"]);
const DOCS = new Set(["fumadocs", "starlight", "none"]);
const COMPONENTS = new Set(["essentials", "minimal", "none"]);
const STYLES = new Set(["new-york", "default"]);
const PMS = new Set(["pnpm", "npm", "yarn", "bun"]);

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  const rest = argv.slice(2);

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const next = rest[i + 1];

    switch (arg) {
      case "--yes":
      case "-y":
        args.yes = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--name":
        args.name = next;
        i++;
        break;
      case "--directory":
      case "--dir":
        args.directory = next;
        i++;
        break;
      case "--style":
        if (next && STYLES.has(next)) args.style = next as Style;
        i++;
        break;
      case "--homepage":
        args.homepage = next;
        i++;
        break;
      case "--framework":
        if (next && FRAMEWORKS.has(next)) args.framework = next as Framework;
        i++;
        break;
      case "--docs":
        if (next && DOCS.has(next)) args.docs = next as DocsEngine;
        i++;
        break;
      case "--components":
        if (next && COMPONENTS.has(next))
          args.components = next as StarterComponents;
        i++;
        break;
      case "--namespace":
        args.namespace = next;
        i++;
        break;
      case "--pm":
        if (next && PMS.has(next)) args.pm = next as PackageManager;
        i++;
        break;
      default:
        // Positional: first non-flag arg is the project name
        if (!arg.startsWith("-") && !args.name) {
          args.name = arg;
        }
        break;
    }
  }

  return args;
}

export function printHelp(): void {
  console.log(`
  create-scn-stack — Scaffold a shadcn component registry

  Usage:
    npx create-scn-stack [name] [options]
    npx create-scn-stack add-component [name] [options]

  Commands:
    (default)               Scaffold a new registry project
    add-component [name]    Add a component to an existing registry

  Scaffold Options:
    --name <name>           Registry name (e.g., my-ui)
    --directory <path>      Project location (default: ./<name>)
    --style <style>         new-york | default (default: new-york)
    --homepage <url>        Registry homepage URL
    --framework <fw>        nextjs | vite | react-router | tanstack-start
    --docs <engine>         fumadocs | starlight | none
    --components <set>      essentials | minimal | none
    --namespace <ns>        Namespace (e.g., @my-ui)
    --pm <pm>               pnpm | npm | yarn | bun
    -y, --yes               Skip prompts, use defaults
    -h, --help              Show this help

  Add Component Options:
    --description, -d       Component description

  Examples:
    npx create-scn-stack
    npx create-scn-stack my-ui --yes
    npx create-scn-stack my-ui --framework nextjs --docs fumadocs
    npx create-scn-stack add-component input
    npx create-scn-stack add-component dialog -d "A modal dialog component."
`);
}
