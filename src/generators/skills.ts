import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";

export function generateSkill(config: ProjectConfig): void {
  const dir = config.directory;
  const name = config.registryName;
  const style = config.style;
  const namespace = config.useNamespace ? config.namespace : null;

  const installCmd = namespace
    ? `npx shadcn@latest add ${namespace}/<name>`
    : `npx shadcn@latest add ${config.homepage}/r/<name>.json`;

  writeFile(
    join(dir, ".agents/skills/registry/SKILL.md"),
    `---
name: ${name}-registry
description: Manage the ${name} shadcn component registry — add components, write docs, and build the registry.
---

# ${name} Registry

This project is a [shadcn component registry](https://ui.shadcn.com/docs/registry) scaffolded with [scn-stack](https://scn-stack.vercel.app).

## Project Structure

- \`registry.json\` — Source of truth. Defines all registry items.
- \`registry/${style}/ui/\` — Component source files.
- \`components.json\` — shadcn configuration (style, aliases, namespace).
- \`public/r/\` — Built registry JSON (generated, don't edit).
${config.docsEngine !== "none" ? `- \`content/docs/\` — Documentation pages (MDX).
- \`content/docs/components/\` — Per-component doc pages.
- \`content/docs/meta.json\` — Navigation structure.` : ""}

## Adding a Component

### 1. Create the source file

Create \`registry/${style}/ui/<name>.tsx\`:

\`\`\`tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface <Name>Props extends React.HTMLAttributes<HTMLDivElement> {}

const <Name> = React.forwardRef<HTMLDivElement, <Name>Props>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props} />
    )
  }
)
<Name>.displayName = "<Name>"

export { <Name> }
\`\`\`

### 2. Add to registry.json

Add an item to the \`items\` array:

\`\`\`json
{
  "name": "<name>",
  "type": "registry:ui",
  "title": "<Title>",
  "description": "A description of the component.",
  "files": [
    {
      "path": "registry/${style}/ui/<name>.tsx",
      "type": "registry:ui"
    }
  ]
}
\`\`\`

If the component has npm dependencies, add them:

\`\`\`json
{
  "dependencies": ["class-variance-authority"],
  "registryDependencies": ["button"]
}
\`\`\`

### 3. Build the registry

\`\`\`bash
pnpm registry:build
\`\`\`

This generates \`public/r/<name>.json\` for each item.
${
  config.docsEngine !== "none"
    ? `
### 4. Add documentation

Create \`content/docs/components/<name>.mdx\`:

\`\`\`mdx
---
title: <Title>
description: A description of the component.
---

## Installation

\\\`\\\`\\\`bash
${installCmd}
\\\`\\\`\\\`

## Usage

\\\`\\\`\\\`tsx
import { <Name> } from "@/components/ui/<name>"

export function Example() {
  return <<Name>>Content</<Name>>
}
\\\`\\\`\\\`
\`\`\`

Add the page to \`content/docs/components/meta.json\`:

\`\`\`json
{
  "pages": ["button", "card", "badge", "<name>"]
}
\`\`\`
`
    : ""
}

## CLI Shortcut

You can also use the CLI to scaffold all of the above:

\`\`\`bash
npx create-scn-stack add-component <name> -d "A description."
\`\`\`

## Registry Conventions

- Component files go in \`registry/${style}/ui/\`.
- Uses the \`include\` pattern: root \`registry.json\` includes \`registry/${style}/ui/registry.json\`.
- File paths in per-directory registry.json are relative to that directory.
- Imports in components use \`@/\` aliases (e.g. \`@/lib/utils\`).
- Use \`class-variance-authority\` for variant-based components.
- Use \`React.forwardRef\` for all components.
- Export both the component and its props type.
- Run \`pnpm registry:build\` after any registry.json change.
- Run \`npx shadcn registry validate\` to check your registry before publishing.
${namespace ? `- Users install with: \`npx shadcn add ${namespace}/<name>\`` : ""}

## Testing

Test components locally:

\`\`\`bash
npx shadcn@latest add http://localhost:3000/r/<name>.json
\`\`\`
`
  );
}
