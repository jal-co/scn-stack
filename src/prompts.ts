import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  DocsEngine,
  Framework,
  PackageManager,
  ProjectConfig,
  StarterComponents,
} from "./types.js";
import { detectPackageManager } from "./utils.js";

function validateRegistryName(value: string | undefined): string | undefined {
  if (!value) return "Registry name is required.";
  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    return "Must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.";
  }
  if (value.length > 50) return "Must be under 50 characters.";
  return undefined;
}

function validateNamespace(value: string | undefined): string | undefined {
  if (!value) return "Namespace is required.";
  if (!/^@[a-z][a-z0-9-]*$/.test(value)) {
    return 'Must start with @ followed by a lowercase letter (e.g., @acme).';
  }
  return undefined;
}

export async function runPrompts(): Promise<ProjectConfig> {
  p.intro(pc.bgCyan(pc.black(" create-scn-registry ")));

  const project = await p.group(
    {
      name: () =>
        p.text({
          message: "What is your registry name?",
          placeholder: "my-ui",
          validate: validateRegistryName,
        }),

      framework: () =>
        p.select({
          message: "What framework would you like to use?",
          options: [
            {
              value: "nextjs" as Framework,
              label: "Next.js",
              hint: "recommended",
            },
            { value: "vite" as Framework, label: "Vite (React)" },
            { value: "react-router" as Framework, label: "React Router" },
            { value: "tanstack-start" as Framework, label: "TanStack Start" },
          ],
        }),

      docsEngine: () =>
        p.select({
          message: "Would you like to add a documentation site?",
          options: [
            {
              value: "fumadocs" as DocsEngine,
              label: "Fumadocs",
              hint: "recommended — standard for shadcn registries",
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
        p.select({
          message: "Which starter components would you like?",
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
        p.confirm({
          message: "Would you like to add a namespace?",
          initialValue: true,
        }),

      namespace: ({ results }) => {
        if (!results.useNamespace) return Promise.resolve("" as string);
        return p.text({
          message: "What namespace?",
          placeholder: `@${results.name as string}`,
          defaultValue: `@${results.name as string}`,
          validate: validateNamespace,
        }) as Promise<string>;
      },

      packageManager: () =>
        p.select({
          message: "Which package manager?",
          initialValue: detectPackageManager(),
          options: [
            { value: "pnpm" as PackageManager, label: "pnpm" },
            { value: "npm" as PackageManager, label: "npm" },
            { value: "yarn" as PackageManager, label: "yarn" },
            { value: "bun" as PackageManager, label: "bun" },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  const config: ProjectConfig = {
    name: project.name,
    registryName: project.name,
    framework: project.framework,
    docsEngine: project.docsEngine,
    starterComponents: project.starterComponents,
    useNamespace: project.useNamespace,
    namespace: (project.namespace as string) || "",
    packageManager: project.packageManager,
    directory: project.name,
  };

  return config;
}
