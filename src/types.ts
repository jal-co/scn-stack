export type Framework = "nextjs" | "vite" | "react-router" | "tanstack-start";
export type DocsEngine = "fumadocs" | "starlight" | "none";
export type StarterComponents = "essentials" | "minimal" | "none";
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Style = "new-york" | "default";

export interface ProjectConfig {
  name: string;
  registryName: string;
  style: Style;
  homepage: string;
  framework: Framework;
  docsEngine: DocsEngine;
  starterComponents: StarterComponents;
  useNamespace: boolean;
  namespace: string;
  packageManager: PackageManager;
  directory: string;
  installShadcnSkill: boolean;
  installRegistrySkill: boolean;
}
