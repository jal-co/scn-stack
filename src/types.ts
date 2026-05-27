export type Framework = "nextjs" | "vite" | "react-router" | "tanstack-start";
export type DocsEngine = "fumadocs" | "starlight" | "none";
export type StarterComponents = "essentials" | "minimal" | "none";
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export interface ProjectConfig {
  name: string;
  registryName: string;
  framework: Framework;
  docsEngine: DocsEngine;
  starterComponents: StarterComponents;
  useNamespace: boolean;
  namespace: string;
  packageManager: PackageManager;
  directory: string;
}
