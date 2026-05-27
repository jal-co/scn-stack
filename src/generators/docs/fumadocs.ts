import type { ProjectConfig } from "../../types.js";
import { writeFile } from "../../utils.js";
import { join } from "node:path";

export function generateFumadocs(config: ProjectConfig): void {
  const dir = config.directory;
  const name = config.registryName;

  // source.config.ts
  writeFile(
    join(dir, "source.config.ts"),
    `import { defineDocs, defineConfig } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig();
`
  );

  // lib/source.ts — uses collections/server import (current fumadocs convention)
  writeFile(
    join(dir, "lib/source.ts"),
    `import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
`
  );

  // Override app/layout.tsx to add Fumadocs RootProvider
  writeFile(
    join(dir, "app/layout.tsx"),
    `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "fumadocs-ui/style.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "${name}",
    template: "%s | ${name}",
  },
  description: "A custom shadcn component registry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
`
  );

  // app/docs/layout.tsx
  writeFile(
    join(dir, "app/docs/layout.tsx"),
    `import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "${name}",
      }}
    >
      {children}
    </DocsLayout>
  );
}
`
  );

  // app/docs/[[...slug]]/page.tsx
  writeFile(
    join(dir, "app/docs/[[...slug]]/page.tsx"),
    `import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
`
  );

  // content/docs/index.mdx
  writeFile(
    join(dir, "content/docs/index.mdx"),
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
npx shadcn@latest add ${config.useNamespace ? `${config.namespace}/button` : `${config.homepage}/r/button.json`}
\`\`\`

## What is this?

${name} is a custom component registry built on the [shadcn registry protocol](https://ui.shadcn.com/docs/registry). You can install any component with the shadcn CLI — they'll be copied into your project as source code that you own and can customize.

## Components

Browse available components in the sidebar.
`
  );

  // content/docs/installation.mdx
  writeFile(
    join(dir, "content/docs/installation.mdx"),
    `---
title: Installation
description: How to install ${name} components in your project.
---

## Prerequisites

You need a project with [shadcn/ui](https://ui.shadcn.com) already configured. If you haven't set up shadcn yet:

\`\`\`bash
npx shadcn@latest init
\`\`\`

## Add the Registry

${
  config.useNamespace
    ? `### Using Namespace (Recommended)

\`\`\`bash
npx shadcn@latest registry add ${config.namespace}=${config.homepage}/r/{name}.json
\`\`\`

Then install components by namespace:

\`\`\`bash
npx shadcn@latest add ${config.namespace}/button
\`\`\`

### Using URL

You can also install directly by URL:`
    : `### Install by URL`
}

\`\`\`bash
npx shadcn@latest add ${config.homepage}/r/button.json
\`\`\`

## Browse Components

Use the \`list\` command to see all available components:

\`\`\`bash
npx shadcn@latest list ${config.useNamespace ? config.namespace : `${config.homepage}/r/registry.json`}
\`\`\`
`
  );

  // content/docs/meta.json (navigation order)
  writeFile(
    join(dir, "content/docs/meta.json"),
    JSON.stringify(
      {
        title: name,
        pages: [
          "---Getting Started---",
          "index",
          "installation",
          "---Components---",
          "...components",
        ],
      },
      null,
      2
    ) + "\n"
  );

  // Component doc pages
  generateComponentDocs(config);
}

function generateComponentDocs(config: ProjectConfig): void {
  const dir = config.directory;
  const name = config.registryName;
  const installPrefix = config.useNamespace
    ? `${config.namespace}/`
    : `${config.homepage}/r/`;
  const installSuffix = config.useNamespace ? "" : ".json";

  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    writeFile(
      join(dir, "content/docs/components/button.mdx"),
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

\`\`\`tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
\`\`\`

## Sizes

\`\`\`tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔔</Button>
\`\`\`
`
    );
  }

  if (config.starterComponents === "essentials") {
    writeFile(
      join(dir, "content/docs/components/card.mdx"),
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
      join(dir, "content/docs/components/badge.mdx"),
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

\`\`\`tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
\`\`\`
`
    );

    // components meta.json
    writeFile(
      join(dir, "content/docs/components/meta.json"),
      JSON.stringify(
        {
          title: "Components",
          pages: ["button", "card", "badge"],
        },
        null,
        2
      ) + "\n"
    );
  } else if (config.starterComponents === "minimal") {
    writeFile(
      join(dir, "content/docs/components/meta.json"),
      JSON.stringify(
        {
          title: "Components",
          pages: ["button"],
        },
        null,
        2
      ) + "\n"
    );
  }
}
