import type { ProjectConfig } from "../../types.js";
import { writeFile } from "../../utils.js";
import { join } from "node:path";

/**
 * Starlight generates a separate Astro docs site in a `docs/` subdirectory.
 * The main app serves the registry, and the docs site is built and deployed separately.
 */
export function generateStarlight(config: ProjectConfig): void {
  const dir = config.directory;
  const docsDir = join(dir, "docs");
  const name = config.registryName;

  // docs/package.json
  const pkg = {
    name: `${config.name}-docs`,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
    },
    dependencies: {
      astro: "^5.0.0",
      "@astrojs/starlight": "^0.32.0",
      sharp: "^0.33.0",
    },
  };
  writeFile(join(docsDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // docs/astro.config.mjs
  const sidebarItems: { label: string; slug: string }[] = [];

  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    sidebarItems.push({ label: "Button", slug: "components/button" });
  }
  if (config.starterComponents === "essentials") {
    sidebarItems.push(
      { label: "Card", slug: "components/card" },
      { label: "Badge", slug: "components/badge" }
    );
  }

  writeFile(
    join(docsDir, "astro.config.mjs"),
    `import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "${name}",
      social: {
        github: "https://github.com/your-org/${name}",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started" },
            { label: "Installation", slug: "installation" },
          ],
        },
        ${
          sidebarItems.length > 0
            ? `{
          label: "Components",
          items: ${JSON.stringify(sidebarItems, null, 12).replace(/\n/g, "\n        ")},
        },`
            : ""
        }
      ],
    }),
  ],
});
`
  );

  // docs/tsconfig.json
  writeFile(
    join(docsDir, "tsconfig.json"),
    JSON.stringify(
      {
        extends: "astro/tsconfigs/strict",
      },
      null,
      2
    ) + "\n"
  );

  // docs/src/content/docs/getting-started.md
  const installPrefix = config.useNamespace
    ? `${config.namespace}/`
    : `${config.homepage}/r/`;
  const installSuffix = config.useNamespace ? "" : ".json";

  writeFile(
    join(docsDir, "src/content/docs/getting-started.md"),
    `---
title: Getting Started
description: Get started with ${name} — a custom shadcn component registry.
---

## Installation

Add the ${name} registry to your project:

\`\`\`bash
npx shadcn@latest registry add ${config.useNamespace ? `${config.namespace}=${config.homepage}/r/{name}.json` : `${config.homepage}/r/{name}.json`}
\`\`\`

Then install any component:

\`\`\`bash
npx shadcn@latest add ${installPrefix}button${installSuffix}
\`\`\`

## What is this?

${name} is a custom component registry built on the [shadcn registry protocol](https://ui.shadcn.com/docs/registry). You can install any component with the shadcn CLI — they'll be copied into your project as source code that you own and can customize.
`
  );

  // docs/src/content/docs/installation.md
  writeFile(
    join(docsDir, "src/content/docs/installation.md"),
    `---
title: Installation
description: How to install ${name} components in your project.
---

## Prerequisites

You need a project with [shadcn/ui](https://ui.shadcn.com) already configured:

\`\`\`bash
npx shadcn@latest init
\`\`\`

## Add the Registry

\`\`\`bash
npx shadcn@latest registry add ${config.useNamespace ? `${config.namespace}=${config.homepage}/r/{name}.json` : `${config.homepage}/r/{name}.json`}
\`\`\`

## Browse Components

\`\`\`bash
npx shadcn@latest list ${config.useNamespace ? config.namespace : `${config.homepage}/r/registry.json`}
\`\`\`
`
  );

  // Component doc pages
  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    writeFile(
      join(docsDir, "src/content/docs/components/button.md"),
      `---
title: Button
description: A button component with multiple variants.
---

## Installation

\`\`\`bash
npx shadcn@latest add ${installPrefix}button${installSuffix}
\`\`\`

## Usage

\`\`\`tsx
import { Button } from "@/components/ui/button"

export function Example() {
  return <Button>Click me</Button>
}
\`\`\`

## Variants

- \`default\` — Primary button
- \`destructive\` — Danger action
- \`outline\` — Bordered button
- \`secondary\` — Secondary action
- \`ghost\` — Minimal button
- \`link\` — Link-style button
`
    );
  }

  if (config.starterComponents === "essentials") {
    writeFile(
      join(docsDir, "src/content/docs/components/card.md"),
      `---
title: Card
description: A card component with header, content, and footer.
---

## Installation

\`\`\`bash
npx shadcn@latest add ${installPrefix}card${installSuffix}
\`\`\`

## Usage

\`\`\`tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content.</p>
      </CardContent>
      <CardFooter>
        <p>Card footer.</p>
      </CardFooter>
    </Card>
  )
}
\`\`\`
`
    );

    writeFile(
      join(docsDir, "src/content/docs/components/badge.md"),
      `---
title: Badge
description: A badge component with multiple variants.
---

## Installation

\`\`\`bash
npx shadcn@latest add ${installPrefix}badge${installSuffix}
\`\`\`

## Usage

\`\`\`tsx
import { Badge } from "@/components/ui/badge"

export function Example() {
  return <Badge>Badge</Badge>
}
\`\`\`

## Variants

- \`default\` — Primary badge
- \`secondary\` — Secondary badge
- \`destructive\` — Danger badge
- \`outline\` — Bordered badge
`
    );
  }
}
