export type Framework = "nextjs" | "vite" | "react-router" | "tanstack-start";
export type DocsEngine = "fumadocs" | "mintlify" | "starlight" | "none";
export type StarterComponents = "essentials" | "minimal" | "none";
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Style = "new-york" | "default";
export type BaseLibrary = "radix" | "base";

export interface ProjectConfig {
  name: string;
  registryName: string;
  style: Style;
  homepage: string;
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
