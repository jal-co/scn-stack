import type { ProjectConfig } from "../../types.js";
import { writeFile } from "../../utils.js";
import { join } from "node:path";

export function generateMintlify(config: ProjectConfig): void {
  const dir = config.directory;
  const name = config.registryName;
  const namespace = config.useNamespace ? config.namespace : null;
  const installPrefix = namespace
    ? `${namespace}/`
    : `${config.homepage}/r/`;
  const installSuffix = namespace ? "" : ".json";

  // mint.json — Mintlify configuration
  const mintConfig: Record<string, unknown> = {
    $schema: "https://mintlify.com/schema.json",
    name,
    logo: {
      dark: "/logo/dark.svg",
      light: "/logo/light.svg",
    },
    favicon: "/favicon.svg",
    colors: {
      primary: "#171717",
      light: "#FAFAFA",
      dark: "#171717",
    },
    topbarLinks: [
      {
        name: "GitHub",
        url: `https://github.com/${name}`,
      },
    ],
    topbarCtaButton: {
      name: "Install",
      url: namespace
        ? `https://ui.shadcn.com/docs/registry/namespace`
        : config.homepage,
    },
    tabs: [
      {
        name: "Components",
        url: "components",
      },
    ],
    navigation: [
      {
        group: "Getting Started",
        pages: ["introduction", "installation"],
      },
      {
        group: "Components",
        pages: getComponentPages(config),
      },
    ],
    footerSocials: {
      github: `https://github.com/${name}`,
    },
  };

  writeFile(
    join(dir, "docs/mint.json"),
    JSON.stringify(mintConfig, null, 2) + "\n"
  );

  // introduction.mdx
  writeFile(
    join(dir, "docs/introduction.mdx"),
    `---
title: Introduction
description: Get started with ${name} — a custom shadcn component registry.
---

## What is ${name}?

${name} is a custom component registry built on the [shadcn registry protocol](https://ui.shadcn.com/docs/registry).

Install any component with the shadcn CLI — they'll be copied into your project as source code that you own and can customize.

<CardGroup cols={2}>
  <Card title="Installation" icon="download" href="/installation">
    Set up ${name} in your project
  </Card>
  <Card title="Components" icon="puzzle-piece" href="/components">
    Browse available components
  </Card>
</CardGroup>

## Quick Install

${namespace ? `
<CodeGroup>
\`\`\`bash Add Namespace
npx shadcn@latest registry add ${namespace}=${config.homepage}/r/{name}.json
\`\`\`

\`\`\`bash Install a Component
npx shadcn@latest add ${namespace}/button
\`\`\`
</CodeGroup>
` : `
\`\`\`bash
npx shadcn@latest add ${config.homepage}/r/button.json
\`\`\`
`}
`
  );

  // installation.mdx
  writeFile(
    join(dir, "docs/installation.mdx"),
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

${namespace ? `### Using Namespace (Recommended)

\`\`\`bash
npx shadcn@latest registry add ${namespace}=${config.homepage}/r/{name}.json
\`\`\`

Then install components by namespace:

\`\`\`bash
npx shadcn@latest add ${namespace}/button
\`\`\`

### Using URL

You can also install directly by URL:
` : "### Install by URL"}

\`\`\`bash
npx shadcn@latest add ${config.homepage}/r/button.json
\`\`\`

## Browse Components

\`\`\`bash
npx shadcn@latest list ${namespace || `${config.homepage}/r/registry.json`}
\`\`\`
`
  );

  // Component doc pages
  generateMintlifyComponentDocs(config, installPrefix, installSuffix);

  // Placeholder logo files
  writeFile(
    join(dir, "docs/logo/dark.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
  );

  writeFile(
    join(dir, "docs/logo/light.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
  );

  writeFile(
    join(dir, "docs/favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`
  );
}

function getComponentPages(config: ProjectConfig): string[] {
  const pages: string[] = [];
  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    pages.push("components/button");
  }
  if (config.starterComponents === "essentials") {
    pages.push("components/card", "components/badge");
  }
  return pages;
}

function generateMintlifyComponentDocs(
  config: ProjectConfig,
  installPrefix: string,
  installSuffix: string
): void {
  const dir = config.directory;

  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    writeFile(
      join(dir, "docs/components/button.mdx"),
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

| Variant | Description |
|---------|-------------|
| \`default\` | Primary button |
| \`secondary\` | Secondary action |
| \`destructive\` | Danger action |
| \`outline\` | Bordered button |
| \`ghost\` | Minimal button |
| \`link\` | Link-style button |

\`\`\`tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
\`\`\`

## Sizes

| Size | Description |
|------|-------------|
| \`default\` | Standard size |
| \`sm\` | Small |
| \`lg\` | Large |
| \`icon\` | Icon only |

\`\`\`tsx
<Button size="lg">Large</Button>
<Button>Default</Button>
<Button size="sm">Small</Button>
\`\`\`
`
    );
  }

  if (config.starterComponents === "essentials") {
    writeFile(
      join(dir, "docs/components/card.mdx"),
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
        <CardDescription>Card description goes here.</CardDescription>
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
      join(dir, "docs/components/badge.mdx"),
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

| Variant | Description |
|---------|-------------|
| \`default\` | Primary badge |
| \`secondary\` | Secondary badge |
| \`destructive\` | Danger badge |
| \`outline\` | Bordered badge |

\`\`\`tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
\`\`\`
`
    );
  }
}
