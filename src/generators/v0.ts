import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";

/**
 * Generates v0 integration — "Open in v0" links for registry components.
 *
 * v0 (v0.dev) supports opening components via URL:
 *   https://v0.dev/chat?q=<encoded-prompt>&registry=<registry-url>
 *
 * This generates:
 * 1. A helper function to build v0 URLs
 * 2. An "Open in v0" button component
 * 3. Docs showing how to add v0 links to component pages
 */
export function generateV0(config: ProjectConfig): void {
  const dir = config.directory;

  // v0 URL helper
  writeFile(
    join(dir, "lib/v0.ts"),
    `/**
 * Generate a "Open in v0" URL for a registry component.
 *
 * @param componentName - The registry component name (e.g., "button")
 * @param prompt - Optional prompt to pre-fill in v0
 * @returns The v0.dev URL
 */
export function getV0Url(
  componentName: string,
  prompt?: string
): string {
  const registryUrl = "${config.homepage}/r";
  const defaultPrompt = \`Create a demo using the \${componentName} component from \${registryUrl}/\${componentName}.json\`;
  const q = encodeURIComponent(prompt || defaultPrompt);

  return \`https://v0.dev/chat?q=\${q}\`;
}
`
  );

  // Open in v0 button component
  if (config.framework === "nextjs") {
    writeFile(
      join(dir, "components/open-in-v0.tsx"),
      `import { cn } from "@/lib/utils"
import { getV0Url } from "@/lib/v0"

interface OpenInV0Props {
  /** The registry component name (e.g., "button"). */
  name: string
  /** Optional custom prompt for v0. */
  prompt?: string
  className?: string
}

export function OpenInV0({ name, prompt, className }: OpenInV0Props) {
  return (
    <a
      href={getV0Url(name, prompt)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <svg
        viewBox="0 0 40 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-auto"
        aria-hidden="true"
      >
        <path
          d="m.3 0 10 20h2.4L2.4 0H.3ZM5 0l10 20h2.3L7.1 0H5Zm22 0h-2v2h2V0Zm0 4h-2v2h2V4Zm-2 4h2v2h-2V8Zm2 4h-2v2h2v-2Zm0 4h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm4-4h-2v2h2v-2Zm4 0h-2v2h2v-2Zm-8 0h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm0-4h-2v2h2V8Zm4 0h-2v2h2V8Zm4 0h-2v2h2V8Zm-8-4h-2v2h2V4Zm4 0h-2v2h2V4Zm-4-4h-2v2h2V0Zm4 0h-2v2h2V0Zm-8 4h-2v2h2V4Zm0-4h-2v2h2V0Z"
          fill="currentColor"
        />
      </svg>
      Open in v0
    </a>
  )
}
`
    );
  }
}
