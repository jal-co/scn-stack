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
import {
  brandedIntro,
  printIntro,
  printPromptHelp,
  labelValue,
} from "./brand.js";

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
  // Auto-promote to --yes mode when stdin isn't an interactive TTY (CI,
  // piped input, etc.) so the CLI never hangs waiting for keystrokes
  // that will never arrive. The user can still scaffold by passing flags
  // (--name, --framework, etc.) which override the defaults.
  if (!args.yes && (p.isCI() || !p.isTTY(process.stdin))) {
    args = { ...args, yes: true };
  }

  // p.intro() opens clack's continuous prompt frame. Every subsequent
  // p.note / p.text / p.select / p.confirm / p.spinner connects to the
  // same left gutter, which is what makes the rendering line up.
  p.intro(brandedIntro());

  // Framing block lives inside the prompt frame.
  if (!args.yes) {
    printIntro(9, 4);
  }

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

    p.note(
      [
        labelValue("Directory:", config.directory),
        labelValue("Style:", config.style),
        labelValue("Base:", config.baseLibrary),
        labelValue("Framework:", config.framework),
        labelValue("Docs:", config.docsEngine),
        labelValue("Components:", config.starterComponents),
        labelValue("Monorepo:", config.monorepo ? "yes" : "no"),
        labelValue("Namespace:", config.namespace),
        labelValue("Package mgr:", config.packageManager),
        labelValue("AI skills:", installSkills ? "yes" : "no"),
      ].join("\n"),
      `Defaults applied (--yes) for ${config.name}`
    );

    return config;
  }

  const project = await p.group(
    {
      name: () => {
        if (args.name) return Promise.resolve(args.name);
        printPromptHelp(
          "What should we call your registry? Lowercase letters, numbers, and hyphens — this becomes the package name and the default namespace.",
          [],
          "https://ui.shadcn.com/docs/registry/getting-started"
        );
        return p.text({
          message: "Registry name",
          placeholder: "my-ui",
          validate: validateRegistryName,
        });
      },

      directory: ({ results }) => {
        if (args.directory) return Promise.resolve(args.directory);
        printPromptHelp(
          "Where on disk should the project be created? Relative paths are resolved from your current directory."
        );
        return p.text({
          message: "Where should we create it?",
          placeholder: `./${results.name as string}`,
          defaultValue: `./${results.name as string}`,
          validate: validateProjectLocation,
        });
      },

      style: () => {
        if (args.style) return Promise.resolve(args.style);
        printPromptHelp(
          "The visual baseline for components. Affects spacing, border-radius, and a handful of default tokens.",
          [
            ["New York", "tighter spacing, used by most modern registries"],
            ["Default", "original shadcn proportions"],
          ],
          "https://ui.shadcn.com/docs/themes"
        );
        return p.select({
          message: "Pick a shadcn style",
          options: [
            {
              value: "new-york" as Style,
              label: "New York",
              hint: "recommended",
            },
            { value: "default" as Style, label: "Default" },
          ],
        });
      },

      baseLibrary: () => {
        if (args.base) return Promise.resolve(args.base);
        printPromptHelp(
          "The headless primitive library your components are built on. Determines which packages shadcn add installs.",
          [
            [
              "Radix UI",
              "shadcn default, mature accessibility, widest community",
            ],
            ["Base UI", "by MUI, newer, smaller bundles, simpler API"],
          ],
          "https://ui.shadcn.com/docs/installation"
        );
        return p.select({
          message: "Which primitives library?",
          options: [
            {
              value: "radix" as BaseLibrary,
              label: "Radix UI",
              hint: "radix-ui.com",
            },
            {
              value: "base" as BaseLibrary,
              label: "Base UI",
              hint: "base-ui.com",
            },
          ],
        });
      },

      homepage: ({ results }) => {
        if (args.homepage) return Promise.resolve(args.homepage);
        printPromptHelp(
          "Where will the registry be hosted? Used in registry.json and in the install commands shown to your users."
        );
        return p.text({
          message: "Public homepage URL",
          placeholder: `https://${results.name as string}.com`,
          defaultValue: `https://${results.name as string}.com`,
          validate: validateHomepage,
        });
      },

      framework: () => {
        if (args.framework) return Promise.resolve(args.framework);
        printPromptHelp(
          "The app shell that serves your registry JSON and docs. Pick the one that matches how your users build.",
          [
            ["Next.js", "App Router + RSC, the shadcn reference platform"],
            ["Vite (React)", "fast SPA, no server, easiest to host statically"],
            ["React Router", "v7 framework mode with SSR and data loading"],
            ["TanStack Start", "full-stack TanStack Router with type-safe routes"],
          ],
          "https://scnstack.sh/docs/frameworks"
        );
        return p.select({
          message: "Pick a framework",
          options: [
            {
              value: "nextjs" as Framework,
              label: "Next.js",
              hint: "nextjs.org · recommended",
            },
            {
              value: "vite" as Framework,
              label: "Vite (React)",
              hint: "vite.dev",
            },
            {
              value: "react-router" as Framework,
              label: "React Router",
              hint: "reactrouter.com",
            },
            {
              value: "tanstack-start" as Framework,
              label: "TanStack Start",
              hint: "tanstack.com/start",
            },
          ],
        });
      },

      docsEngine: ({ results }) => {
        if (args.docs) return Promise.resolve(args.docs);
        printPromptHelp(
          "How do you want to write component docs? Each option scaffolds a working docs site you can extend.",
          [
            [
              "Fumadocs",
              "shadcn-style MDX inside Next.js — what shadcn/ui itself uses",
            ],
            ["Mintlify", "hosted docs platform, framework-agnostic"],
            ["Starlight", "Astro-based, separate docs site, very fast"],
            ["No docs", "just the registry — bring your own docs setup"],
          ],
          "https://scnstack.sh/docs/docs-engines"
        );
        return p.select({
          message: "How do you want to write docs?",
          options: [
            {
              value: "fumadocs" as DocsEngine,
              label: "Fumadocs",
              hint:
                results.framework === "nextjs"
                  ? "fumadocs.dev · recommended"
                  : "fumadocs.dev · needs Next.js, will fall back",
            },
            {
              value: "mintlify" as DocsEngine,
              label: "Mintlify",
              hint: "mintlify.com",
            },
            {
              value: "starlight" as DocsEngine,
              label: "Starlight",
              hint: "starlight.astro.build",
            },
            {
              value: "none" as DocsEngine,
              label: "No docs",
              hint: "registry only",
            },
          ],
        });
      },

      starterComponents: () => {
        if (args.components) return Promise.resolve(args.components);
        printPromptHelp(
          "Starter components scaffolded into registry/<style>/ui/ so you have something to ship on day one.",
          [
            ["Essentials", "Button, Card, Badge with matching docs pages"],
            ["Minimal", "just Button — a single end-to-end example"],
            ["Empty", "no components, you'll author your own"],
          ]
        );
        return p.select({
          message: "What should we pre-populate?",
          options: [
            {
              value: "essentials" as StarterComponents,
              label: "Essentials",
              hint: "Button, Card, Badge",
            },
            {
              value: "minimal" as StarterComponents,
              label: "Minimal",
              hint: "Button only",
            },
            {
              value: "none" as StarterComponents,
              label: "Empty",
              hint: "no components",
            },
          ],
        });
      },

      useNamespace: () => {
        if (args.namespace !== undefined) return Promise.resolve(true);
        printPromptHelp(
          "Namespaces let users install with a short handle like @my-ui/button instead of a full URL. Recommended.",
          [],
          "https://ui.shadcn.com/docs/registry/namespace"
        );
        return p.confirm({
          message: "Publish under a namespace? (e.g. @my-ui/button)",
          initialValue: true,
        });
      },

      namespace: ({ results }) => {
        if (args.namespace) return Promise.resolve(args.namespace);
        if (!results.useNamespace) return Promise.resolve("" as string);
        return p.text({
          message: "Namespace handle",
          placeholder: `@${results.name as string}`,
          defaultValue: `@${results.name as string}`,
          validate: validateNamespace,
        }) as Promise<string>;
      },

      packageManager: () => {
        if (args.pm) return Promise.resolve(args.pm);
        printPromptHelp(
          "Which package manager should we use to install dependencies? Auto-detected from your shell when possible.",
          [
            ["pnpm", "fast, content-addressed store — recommended"],
            ["npm", "ships with Node, no extra install"],
            ["yarn", "classic or berry, both supported"],
            ["bun", "fastest installs, native runtime"],
          ]
        );
        return p.select({
          message: "Package manager",
          initialValue: detectPackageManager(),
          options: [
            {
              value: "pnpm" as PackageManager,
              label: "pnpm",
              hint: "pnpm.io",
            },
            {
              value: "npm" as PackageManager,
              label: "npm",
              hint: "npmjs.com",
            },
            {
              value: "yarn" as PackageManager,
              label: "yarn",
              hint: "yarnpkg.com",
            },
            {
              value: "bun" as PackageManager,
              label: "bun",
              hint: "bun.sh",
            },
          ],
        });
      },

      monorepo: () => {
        if (args.monorepo !== undefined) return Promise.resolve(args.monorepo);
        printPromptHelp(
          "A monorepo puts the registry in packages/registry and gives you room for an example consuming app, docs site, etc.",
          [],
          "https://scnstack.sh/docs/monorepo"
        );
        return p.confirm({
          message: "Create a monorepo? (registry + consuming app)",
          initialValue: false,
        });
      },

      installSkills: () => {
        if (args.skills !== undefined) return Promise.resolve(args.skills);
        printPromptHelp(
          "AI skills teach Claude Code, Cursor, and other agents how to use shadcn and your registry. Installed via skills.sh.",
          [
            ["shadcn skill", "how to add, customize, and theme shadcn components"],
            ["registry skill", "how to add components/hooks/blocks to YOUR registry"],
          ],
          "https://skills.sh"
        );
        return p.confirm({
          message: "Install AI skills? (shadcn + registry skills)",
          initialValue: true,
        });
      },
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

  // Final review — show the chosen config before scaffolding so the user
  // can bail without an irreversible install.
  //
  // Use clack's p.note() instead of our own box so the frame lines up
  // with the prompt gutter and doesn't render a phantom │ next to a
  // custom box drawn outside the gutter context.
  p.note(
    [
      labelValue("Name:", config.name),
      labelValue("Directory:", config.directory),
      labelValue("Style:", config.style),
      labelValue("Base:", config.baseLibrary),
      labelValue("Framework:", config.framework),
      labelValue("Docs:", config.docsEngine),
      labelValue("Components:", config.starterComponents),
      labelValue("Monorepo:", config.monorepo ? "yes" : "no"),
      labelValue(
        "Namespace:",
        config.useNamespace ? config.namespace : pc.dim("— none —")
      ),
      labelValue("Package mgr:", config.packageManager),
      labelValue("AI skills:", skills ? "yes" : "no"),
    ].join("\n"),
    "Ready to scaffold"
  );

  const proceed = await p.confirm({
    message: "Proceed with these settings?",
    initialValue: true,
  });

  if (p.isCancel(proceed) || !proceed) {
    p.cancel("Cancelled. Re-run when you're ready.");
    process.exit(0);
  }

  return config;
}
