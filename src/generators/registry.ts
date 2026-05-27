import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";

interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
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
          path: "registry/new-york/ui/button.tsx",
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
            path: "registry/new-york/ui/card.tsx",
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
            path: "registry/new-york/ui/badge.tsx",
            type: "registry:ui",
          },
        ],
      }
    );
  }

  return items;
}

export function generateRegistryJson(config: ProjectConfig): void {
  const items = getComponentItems(config);

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: config.registryName,
    homepage: `https://${config.registryName}.com`,
    items,
  };

  writeFile(
    join(config.directory, "registry.json"),
    JSON.stringify(registry, null, 2) + "\n"
  );
}

export function generateComponentsJson(config: ProjectConfig): void {
  const componentsJson: Record<string, unknown> = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
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
      [config.namespace]: `https://${config.registryName}.com/r/{name}.json`,
    };
  }

  writeFile(
    join(config.directory, "components.json"),
    JSON.stringify(componentsJson, null, 2) + "\n"
  );
}
