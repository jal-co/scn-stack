import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";

interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  files: { path: string; type: string }[];
  dependencies?: string[];
}

function getComponentItems(config: ProjectConfig): RegistryItem[] {
  const items: RegistryItem[] = [];

  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    items.push({
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "A button component with multiple variants.",
      dependencies: ["class-variance-authority"],
      files: [
        {
          path: "button.tsx",
          type: "registry:ui",
        },
      ],
    });
  }

  if (config.starterComponents === "essentials") {
    items.push(
      {
        name: "card",
        type: "registry:ui",
        title: "Card",
        description: "A card component with header, content, and footer.",
        files: [
          {
            path: "card.tsx",
            type: "registry:ui",
          },
        ],
      },
      {
        name: "badge",
        type: "registry:ui",
        title: "Badge",
        description: "A badge component with multiple variants.",
        dependencies: ["class-variance-authority"],
        files: [
          {
            path: "badge.tsx",
            type: "registry:ui",
          },
        ],
      }
    );
  }

  return items;
}

export function generateRegistryJson(config: ProjectConfig): void {
  const style = config.style;

  // Root registry.json — uses include pattern
  const root = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: config.registryName,
    homepage: config.homepage,
    include: [`registry/${style}/ui/registry.json`],
  };

  writeFile(
    join(config.directory, "registry.json"),
    JSON.stringify(root, null, 2) + "\n"
  );

  // Per-directory registry.json for UI components
  const items = getComponentItems(config);

  if (items.length > 0) {
    const uiRegistry = {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      items,
    };

    writeFile(
      join(config.directory, `registry/${style}/ui/registry.json`),
      JSON.stringify(uiRegistry, null, 2) + "\n"
    );
  }
}

export function generateComponentsJson(config: ProjectConfig): void {
  const componentsJson: Record<string, unknown> = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: config.style,
    rsc: config.framework === "nextjs",
    tsx: true,
    tailwind: {
      config: "",
      css: config.framework === "nextjs" ? "app/globals.css" : "src/index.css",
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    iconLibrary: "lucide",
  };

  if (config.useNamespace && config.namespace) {
    componentsJson.registries = {
      [config.namespace]: `${config.homepage}/r/{name}.json`,
    };
  }

  writeFile(
    join(config.directory, "components.json"),
    JSON.stringify(componentsJson, null, 2) + "\n"
  );
}
