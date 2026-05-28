import pc from "picocolors";
import type {
  Framework,
  DocsEngine,
  StarterComponents,
  PackageManager,
  Style,
  BaseLibrary,
} from "./types.js";

export interface CliArgs {
  name?: string;
  directory?: string;
  style?: Style;
  homepage?: string;
  framework?: Framework;
  docs?: DocsEngine;
  components?: StarterComponents;
  base?: BaseLibrary;
  monorepo?: boolean;
  namespace?: string;
  pm?: PackageManager;
  skills?: boolean;
  yes?: boolean;
  help?: boolean;
}

const FRAMEWORKS = new Set(["nextjs", "vite", "react-router", "tanstack-start"]);
const DOCS = new Set(["fumadocs", "mintlify", "starlight", "none"]);
const COMPONENTS = new Set(["essentials", "minimal", "none"]);
const STYLES = new Set(["new-york", "default"]);
const PMS = new Set(["pnpm", "npm", "yarn", "bun"]);
const BASES = new Set(["radix", "base"]);

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
      case "--base":
        if (next && BASES.has(next)) args.base = next as BaseLibrary;
        i++;
        break;
      case "--monorepo":
        args.monorepo = true;
        break;
      case "--no-monorepo":
        args.monorepo = false;
        break;
      case "--skills":
        args.skills = true;
        break;
      case "--no-skills":
        args.skills = false;
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
  ${pc.bold(pc.white("scn"))}${pc.dim("━━━")}${pc.bold(pc.white("stack"))}  ${pc.dim("› scaffolding for shadcn registries")}

  Usage:
    npx create-scn-stack [name] [options]
    npx create-scn-stack init [options]
    npx create-scn-stack add-component [name] [options]
    npx create-scn-stack add-hook [name] [options]
    npx create-scn-stack add-block [name] [options]

  Commands:
    (default)               Scaffold a new registry project
    init                    Add a registry to an existing project
    add-component [name]    Add a component to an existing registry
    add-hook [name]         Add a hook to an existing registry
    add-block [name]        Add a block to an existing registry

  Scaffold Options:
    --name <name>           Registry name (e.g., my-ui)
    --directory <path>      Project location (default: ./<name>)
    --style <style>         new-york | default (default: new-york)
    --homepage <url>        Registry homepage URL
    --framework <fw>        nextjs | vite | react-router | tanstack-start
    --docs <engine>         fumadocs | mintlify | starlight | none
    --components <set>      essentials | minimal | none
    --namespace <ns>        Namespace (e.g., @my-ui)
    --base <lib>            radix | base (default: radix)
    --monorepo              Create a monorepo structure
    --no-monorepo           Single project (default)
    --pm <pm>               pnpm | npm | yarn | bun
    --skills                Include AI skills (shadcn skill + registry skill)
    --no-skills             Skip AI skills
    -y, --yes               Skip prompts, use defaults
    -h, --help              Show this help

  Init Options:
    --name <name>           Registry name (default: from package.json)
    --style <style>         new-york | default (default: new-york)
    --namespace <ns>        Namespace (e.g., @my-ui)
    --homepage <url>        Registry homepage URL
    --docs                  Add documentation scaffolding
    --no-docs               Skip documentation
    -y, --yes               Skip prompts, use defaults

  Add Component/Hook/Block Options:
    --description, -d       Description

  Examples:
    npx create-scn-stack
    npx create-scn-stack my-ui --yes
    npx create-scn-stack my-ui --framework nextjs --docs fumadocs
    npx create-scn-stack init
    npx create-scn-stack init --name my-ui --namespace @my-ui --yes
    npx create-scn-stack add-component input
    npx create-scn-stack add-component dialog -d "A modal dialog component."
    npx create-scn-stack add-hook use-toggle -d "A toggle state hook."
    npx create-scn-stack add-block login-form -d "A login form block."
`);
}
