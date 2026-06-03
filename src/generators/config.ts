import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

/**
 * Generates a .scn-stack.json config file that stores the project's
 * scaffolding configuration for repeatable operations.
 *
 * This config is used by:
 * - add-component / add-hook / add-block — to auto-detect style, namespace, etc.
 * - init — to record how the registry was configured
 * - Future commands — for consistent defaults
 */
export function generateConfig(config: ProjectConfig): void {
  const dir = config.directory;

  const scnConfig = {
    $schema: "https://scnstack.sh/schema/scn-stack.json",
    name: config.registryName,
    style: config.style,
    homepage: config.homepage,
    target: config.target,
    githubSlug: config.target === "github" ? config.githubSlug : undefined,
    framework: config.target === "github" ? undefined : config.framework,
    docsEngine: config.target === "github" ? undefined : config.docsEngine,
    baseLibrary: config.baseLibrary,
    namespace: config.useNamespace ? config.namespace : undefined,
    monorepo: config.monorepo || undefined,
    features: {
      skills: config.installRegistrySkill,
    },
  };

  // Remove undefined values
  const cleaned = JSON.parse(JSON.stringify(scnConfig));

  writeFile(
    join(dir, ".scn-stack.json"),
    JSON.stringify(cleaned, null, 2) + "\n"
  );
}

/**
 * Reads an existing .scn-stack.json config from the current working directory.
 * Returns null if not found.
 */
export function readConfig(
  cwd: string
): Record<string, unknown> | null {
  const configPath = join(cwd, ".scn-stack.json");

  if (!existsSync(configPath)) return null;

  try {
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}
