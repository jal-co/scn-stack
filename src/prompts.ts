import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  BaseLibrary,
  DocsEngine,
  Framework,
  PackageManager,
  ProjectConfig,
  StarterComponents,
  Style,
} from "./types.js";
import type { CliArgs } from "./args.js";
import { detectPackageManager } from "./utils.js";

function validateRegistryName(value: string | undefined): string | undefined {
  if (!value) return "Registry name is required.";
  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    return "Must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.";
  }
  if (value.length > 50) return "Must be under 50 characters.";
  return undefined;
}

function validateProjectLocation(
  value: string | undefined
): string | undefined {
  if (!value) return "Project location is required.";
  return undefined;
}

function validateHomepage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^https?:\/\/.+/.test(value)) {
    return "Must be a valid URL starting with https://";
  }
  return undefined;
}

function validateNamespace(value: string | undefined): string | undefined {
  if (!value) return "Namespace is required.";
  if (!/^@[a-z][a-z0-9-]*$/.test(value)) {
    return "Must start with @ followed by a lowercase letter (e.g., @acme).";
  }
  return undefined;
}

const DEFAULTS = {
  name: "my-ui",
  style: "new-york" as Style,
  framework: "nextjs" as Framework,
  docsEngine: "fumadocs" as DocsEngine,
  starterComponents: "essentials" as StarterComponents,
  packageManager: detectPackageManager(),
};

export async function runPrompts(args: CliArgs): Promise<ProjectConfig> {
  p.intro(pc.bgCyan(pc.black(" create-scn-stack ")));

  // If --yes, fill everything from args + defaults
  if (args.yes) {
    const name = args.name || DEFAULTS.name;
    const framework = args.framework || DEFAULTS.framework;
    let docsEngine = args.docs || DEFAULTS.docsEngine;
    // Fumadocs requires Next.js
    if (docsEngine === "fumadocs" && framework !== "nextjs") {
      docsEngine = "starlight";
    }
    const namespace = args.namespace || `@${name}`;

    const installSkills = args.skills !== false;

    const config: ProjectConfig = {
      name,
      registryName: name,
      style: args.style || DEFAULTS.style,
      homepage: args.homepage || `https://${name}.com`,
      framework,
      docsEngine,
      starterComponents: args.components || DEFAULTS.starterComponents,
      baseLibrary: args.base || "radix",
      monorepo: args.monorepo || false,
      useNamespace: true,
      namespace,
      packageManager: args.pm || DEFAULTS.packageManager,
      directory: args.directory || `./${name}`,
      installShadcnSkill: installSkills,
      installRegistrySkill: installSkills,
    };

    p.log.info(`Using defaults for ${pc.cyan(config.name)}`);
    p.log.step(
      [
        `${pc.dim("Name:")}        ${config.name}`,
        `${pc.dim("Directory:")}   ${config.directory}`,
        `${pc.dim("Style:")}       ${config.style}`,
        `${pc.dim("Base:")}        ${config.baseLibrary}`,
        `${pc.dim("Homepage:")}    ${config.homepage}`,
        `${pc.dim("Framework:")}   ${config.framework}`,
        `${pc.dim("Docs:")}        ${config.docsEngine}`,
        `${pc.dim("Components:")}  ${config.starterComponents}`,
        `${pc.dim("Monorepo:")}    ${config.monorepo ? "yes" : "no"}`,
        `${pc.dim("Namespace:")}   ${config.namespace}`,
        `${pc.dim("PM:")}          ${config.packageManager}`,
        `${pc.dim("Skills:")}      ${installSkills ? "yes" : "no"}`,
      ].join("\n")
    );

    return config;
  }

  const project = await p.group(
    {
      name: () =>
        args.name
          ? Promise.resolve(args.name)
          : p.text({
              message: "Registry name",
              placeholder: "my-ui",
              validate: validateRegistryName,
            }),

      directory: ({ results }) =>
        args.directory
          ? Promise.resolve(args.directory)
          : p.text({
              message: "Project location",
              placeholder: `./${results.name as string}`,
              defaultValue: `./${results.name as string}`,
              validate: validateProjectLocation,
            }),

      style: () =>
        args.style
          ? Promise.resolve(args.style)
          : p.select({
              message: "Style",
              options: [
                {
                  value: "new-york" as Style,
                  label: "New York",
                  hint: "recommended",
                },
                { value: "default" as Style, label: "Default" },
              ],
            }),

      baseLibrary: () =>
        args.base
          ? Promise.resolve(args.base)
          : p.select({
              message: "Base library",
              options: [
                {
                  value: "radix" as BaseLibrary,
                  label: "Radix UI",
                  hint: "recommended",
                },
                {
                  value: "base" as BaseLibrary,
                  label: "Base UI",
                  hint: "by MUI",
                },
              ],
            }),

      homepage: ({ results }) =>
        args.homepage
          ? Promise.resolve(args.homepage)
          : p.text({
              message: "Homepage",
              placeholder: `https://${results.name as string}.com`,
              defaultValue: `https://${results.name as string}.com`,
              validate: validateHomepage,
            }),

      framework: () =>
        args.framework
          ? Promise.resolve(args.framework)
          : p.select({
              message: "Framework",
              options: [
                {
                  value: "nextjs" as Framework,
                  label: "Next.js",
                  hint: "recommended",
                },
                { value: "vite" as Framework, label: "Vite (React)" },
                {
                  value: "react-router" as Framework,
                  label: "React Router",
                },
                {
                  value: "tanstack-start" as Framework,
                  label: "TanStack Start",
                },
              ],
            }),

      docsEngine: ({ results }) =>
        args.docs
          ? Promise.resolve(args.docs)
          : p.select({
              message: "Documentation",
              options: [
                {
                  value: "fumadocs" as DocsEngine,
                  label: "Fumadocs",
                  hint:
                    results.framework === "nextjs"
                      ? "recommended — standard for shadcn registries"
                      : "requires Next.js",
                },
                {
                  value: "mintlify" as DocsEngine,
                  label: "Mintlify",
                  hint: "hosted — works with any framework",
                },
                {
                  value: "starlight" as DocsEngine,
                  label: "Starlight",
                  hint: "Astro-based",
                },
                {
                  value: "none" as DocsEngine,
                  label: "None",
                  hint: "registry only",
                },
              ],
            }),

      starterComponents: () =>
        args.components
          ? Promise.resolve(args.components)
          : p.select({
              message: "Starter components",
              options: [
                {
                  value: "essentials" as StarterComponents,
                  label: "Button, Card, Badge",
                  hint: "essentials",
                },
                {
                  value: "minimal" as StarterComponents,
                  label: "Button only",
                  hint: "minimal",
                },
                {
                  value: "none" as StarterComponents,
                  label: "None",
                  hint: "empty registry",
                },
              ],
            }),

      useNamespace: () =>
        args.namespace !== undefined
          ? Promise.resolve(true)
          : p.confirm({
              message: "Add a namespace?",
              initialValue: true,
            }),

      namespace: ({ results }) => {
        if (args.namespace) return Promise.resolve(args.namespace);
        if (!results.useNamespace) return Promise.resolve("" as string);
        return p.text({
          message: "Namespace",
          placeholder: `@${results.name as string}`,
          defaultValue: `@${results.name as string}`,
          validate: validateNamespace,
        }) as Promise<string>;
      },

      packageManager: () =>
        args.pm
          ? Promise.resolve(args.pm)
          : p.select({
              message: "Package manager",
              initialValue: detectPackageManager(),
              options: [
                { value: "pnpm" as PackageManager, label: "pnpm" },
                { value: "npm" as PackageManager, label: "npm" },
                { value: "yarn" as PackageManager, label: "yarn" },
                { value: "bun" as PackageManager, label: "bun" },
              ],
            }),

      monorepo: () =>
        args.monorepo !== undefined
          ? Promise.resolve(args.monorepo)
          : p.confirm({
              message: "Create a monorepo?",
              initialValue: false,
            }),

      installSkills: () =>
        args.skills !== undefined
          ? Promise.resolve(args.skills)
          : p.confirm({
              message: "Add AI skills? (shadcn skill + registry skill)",
              initialValue: true,
            }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  const skills = project.installSkills as boolean;

  const config: ProjectConfig = {
    name: project.name as string,
    registryName: project.name as string,
    style: project.style as Style,
    homepage:
      (project.homepage as string) || `https://${project.name as string}.com`,
    framework: project.framework as Framework,
    docsEngine: project.docsEngine as DocsEngine,
    starterComponents: project.starterComponents as StarterComponents,
    baseLibrary: project.baseLibrary as BaseLibrary,
    monorepo: project.monorepo as boolean,
    useNamespace: project.useNamespace as boolean,
    namespace: (project.namespace as string) || "",
    packageManager: project.packageManager as PackageManager,
    directory: project.directory as string,
    installShadcnSkill: skills,
    installRegistrySkill: skills,
  };

  return config;
}
