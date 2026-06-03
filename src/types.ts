export type Framework = "nextjs" | "vite" | "react-router" | "tanstack-start";
export type DocsEngine = "fumadocs" | "mintlify" | "starlight" | "none";
export type StarterComponents = "essentials" | "minimal" | "none";
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Style = "new-york" | "default";
export type BaseLibrary = "radix" | "base";

/**
 * How the registry is distributed:
 * - "hosted": a framework app builds JSON to public/r/ and serves it from a
 *   homepage URL (the classic shadcn build-and-host model).
 * - "github": a public GitHub repo *is* the registry (a "source registry").
 *   The shadcn CLI reads the root registry.json directly — no build, no
 *   published JSON, no server. Users install with
 *   `npx shadcn@latest add <owner>/<repo>/<item>`.
 */
export type RegistryTarget = "hosted" | "github";

export interface ProjectConfig {
  name: string;
  registryName: string;
  style: Style;
  homepage: string;
  /** Distribution model — defaults to "hosted". */
  target: RegistryTarget;
  /**
   * `<owner>/<repo>` slug for GitHub source registries. Used to build the
   * `npx shadcn add <owner>/<repo>/<item>` install commands. Only set when
   * target === "github".
   */
  githubSlug: string;
  framework: Framework;
  docsEngine: DocsEngine;
  starterComponents: StarterComponents;
  baseLibrary: BaseLibrary;
  monorepo: boolean;
  useNamespace: boolean;
  namespace: string;
  packageManager: PackageManager;
  directory: string;
  installShadcnSkill: boolean;
  installRegistrySkill: boolean;
}
