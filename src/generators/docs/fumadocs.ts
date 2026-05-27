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

  // Component preview component
  generateComponentPreview(config);

  // Component doc pages
  generateComponentDocs(config);
}

function generateComponentPreview(config: ProjectConfig): void {
  const dir = config.directory;
  const style = config.style;

  // ComponentPreview — client component with Preview/Code tabs
  writeFile(
    join(dir, "components/component-preview.tsx"),
    `"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentPreviewProps {
  children: React.ReactNode
  className?: string
}

export function ComponentPreview({ children, className }: ComponentPreviewProps) {
  return (
    <div
      className={cn(
        "not-prose flex min-h-[200px] w-full items-center justify-center rounded-xl border bg-card p-8",
        className
      )}
    >
      {children}
    </div>
  )
}
`
  );

  // Example preview files for each starter component
  if (
    config.starterComponents === "essentials" ||
    config.starterComponents === "minimal"
  ) {
    writeFile(
      join(dir, "components/examples/button-demo.tsx"),
      `"use client"

import { Button } from "@/registry/${style}/ui/button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="lg">Large</Button>
      <Button>Default</Button>
      <Button size="sm">Small</Button>
    </div>
  )
}
`
    );
  }

  if (config.starterComponents === "essentials") {
    writeFile(
      join(dir, "components/examples/card-demo.tsx"),
      `"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/registry/${style}/ui/card"

export function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">This is the card content area.</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Card footer
      </CardFooter>
    </Card>
  )
}
`
    );

    writeFile(
      join(dir, "components/examples/badge-demo.tsx"),
      `"use client"

import { Badge } from "@/registry/${style}/ui/badge"

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
`
    );
  }
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

import { ComponentPreview } from "@/components/component-preview"
import { ButtonDemo, ButtonSizes } from "@/components/examples/button-demo"

## Preview

<ComponentPreview>
  <ButtonDemo />
</ComponentPreview>

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

<ComponentPreview>
  <ButtonDemo />
</ComponentPreview>

\`\`\`tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
\`\`\`

## Sizes

<ComponentPreview>
  <ButtonSizes />
</ComponentPreview>

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
      join(dir, "content/docs/components/card.mdx"),
      `---
title: Card
description: A card component with header, content, and footer.
---

import { ComponentPreview } from "@/components/component-preview"
import { CardDemo } from "@/components/examples/card-demo"

## Preview

<ComponentPreview>
  <CardDemo />
</ComponentPreview>

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

import { ComponentPreview } from "@/components/component-preview"
import { BadgeDemo } from "@/components/examples/badge-demo"

## Preview

<ComponentPreview>
  <BadgeDemo />
</ComponentPreview>

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

<ComponentPreview>
  <BadgeDemo />
</ComponentPreview>

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
