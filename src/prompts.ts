import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  DocsEngine,
  Framework,
  PackageManager,
  ProjectConfig,
  StarterComponents,
  Style,
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

function validateProjectLocation(
  value: string | undefined
): string | undefined {
  if (!value) return "Project location is required.";
  return undefined;
}

function validateHomepage(value: string | undefined): string | undefined {
  if (!value) return undefined; // optional
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

export async function runPrompts(): Promise<ProjectConfig> {
  p.intro(pc.bgCyan(pc.black(" create-scn-stack ")));

  const project = await p.group(
    {
      name: () =>
        p.text({
          message: "Registry name",
          placeholder: "my-ui",
          validate: validateRegistryName,
        }),

      directory: ({ results }) =>
        p.text({
          message: "Project location",
          placeholder: `./${results.name as string}`,
          defaultValue: `./${results.name as string}`,
          validate: validateProjectLocation,
        }),

      style: () =>
        p.select({
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

      homepage: ({ results }) =>
        p.text({
          message: "Homepage",
          placeholder: `https://${results.name as string}.com`,
          defaultValue: `https://${results.name as string}.com`,
          validate: validateHomepage,
        }),

      framework: () =>
        p.select({
          message: "Framework",
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
          message: "Documentation",
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
        p.confirm({
          message: "Add a namespace?",
          initialValue: true,
        }),

      namespace: ({ results }) => {
        if (!results.useNamespace) return Promise.resolve("" as string);
        return p.text({
          message: "Namespace",
          placeholder: `@${results.name as string}`,
          defaultValue: `@${results.name as string}`,
          validate: validateNamespace,
        }) as Promise<string>;
      },

      packageManager: () =>
        p.select({
          message: "Package manager",
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
    style: project.style,
    homepage: (project.homepage as string) || `https://${project.name}.com`,
    framework: project.framework,
    docsEngine: project.docsEngine,
    starterComponents: project.starterComponents,
    useNamespace: project.useNamespace,
    namespace: (project.namespace as string) || "",
    packageManager: project.packageManager,
    directory: project.directory as string,
  };

  return config;
}
