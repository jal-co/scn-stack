import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared registry-item plumbing used by the add-*, remove, and list
 * commands. Centralises reading registry.json (root + included
 * per-directory files), locating items, and resolving the install
 * command + docs paths so the individual commands stay thin.
 */

export interface RegistryFile {
  path: string;
  type: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  files?: RegistryFile[];
  dependencies?: string[];
  [key: string]: unknown;
}

export interface RegistryDoc {
  $schema?: string;
  name?: string;
  homepage?: string;
  include?: string[];
  items?: RegistryItem[];
  [key: string]: unknown;
}

export interface RegistryContext {
  cwd: string;
  registryPath: string;
  registry: RegistryDoc;
  componentsJson: Record<string, unknown> | null;
  style: string;
  registryName: string;
  namespace: string | null;
  usesInclude: boolean;
}

/**
 * Load the registry context for a project, or return null if there's no
 * registry.json (caller decides how to surface the error so it can match
 * its own copy / branding).
 */
export function loadRegistryContext(cwd: string): RegistryContext | null {
  const registryPath = join(cwd, "registry.json");
  if (!existsSync(registryPath)) return null;

  const registry = readJson<RegistryDoc>(registryPath);
  if (!registry) return null;

  const componentsJsonPath = join(cwd, "components.json");
  const componentsJson = existsSync(componentsJsonPath)
    ? readJson<Record<string, unknown>>(componentsJsonPath)
    : null;

  const style = (componentsJson?.style as string) || "new-york";
  const registryName = registry.name || "my-ui";

  const registries =
    (componentsJson?.registries as Record<string, string> | undefined) ??
    undefined;
  const namespace = registries ? Object.keys(registries)[0] ?? null : null;

  return {
    cwd,
    registryPath,
    registry,
    componentsJson,
    style,
    registryName,
    namespace,
    usesInclude: Array.isArray(registry.include),
  };
}

/**
 * Where an item lives — which registry.json file holds it, and the item
 * itself. `registryFilePath` is the on-disk path of the file to mutate
 * when adding/removing.
 */
export interface ItemLocation {
  item: RegistryItem;
  registryFilePath: string;
  /** true when the item lives in the root registry.json (flat pattern). */
  isRoot: boolean;
}

/**
 * Find an item by name across the root registry and every per-directory
 * registry referenced via `include`. Returns null when not found.
 */
export function findItem(cwd: string, name: string): ItemLocation | null {
  const rootPath = join(cwd, "registry.json");
  const root = readJson<RegistryDoc>(rootPath);
  if (!root) return null;

  const rootItem = root.items?.find((i) => i?.name === name);
  if (rootItem) {
    return { item: rootItem, registryFilePath: rootPath, isRoot: true };
  }

  for (const rel of root.include ?? []) {
    const subPath = join(cwd, rel);
    const sub = readJson<RegistryDoc>(subPath);
    const subItem = sub?.items?.find((i) => i?.name === name);
    if (subItem) {
      return { item: subItem, registryFilePath: subPath, isRoot: false };
    }
  }

  return null;
}

export function registryHasItem(cwd: string, name: string): boolean {
  return findItem(cwd, name) !== null;
}

/**
 * Every item across root + included registries, each tagged with where it
 * lives. Used by `list`.
 */
export function allItems(cwd: string): ItemLocation[] {
  const rootPath = join(cwd, "registry.json");
  const root = readJson<RegistryDoc>(rootPath);
  if (!root) return [];

  const out: ItemLocation[] = [];

  for (const item of root.items ?? []) {
    if (item?.name) {
      out.push({ item, registryFilePath: rootPath, isRoot: true });
    }
  }

  for (const rel of root.include ?? []) {
    const subPath = join(cwd, rel);
    const sub = readJson<RegistryDoc>(subPath);
    for (const item of sub?.items ?? []) {
      if (item?.name) {
        out.push({ item, registryFilePath: subPath, isRoot: false });
      }
    }
  }

  return out;
}

/**
 * Remove an item from its registry.json file in place. Returns the list of
 * `files[].path` entries (relative to the registry root or to the
 * per-directory registry, matching how the add-* commands write them) so
 * the caller can delete the on-disk sources.
 */
export function removeItemFromRegistry(loc: ItemLocation): string[] {
  const doc = readJson<RegistryDoc>(loc.registryFilePath);
  if (!doc || !Array.isArray(doc.items)) return [];

  const files = (loc.item.files ?? []).map((f) => f.path);
  doc.items = doc.items.filter((i) => i.name !== loc.item.name);
  writeFileSync(loc.registryFilePath, JSON.stringify(doc, null, 2) + "\n");
  return files;
}

/**
 * Resolve the absolute on-disk paths of an item's source files. Handles
 * both the include pattern (paths are relative to the per-directory
 * registry's folder) and the flat pattern (paths are relative to cwd).
 */
export function resolveItemFiles(
  cwd: string,
  loc: ItemLocation,
  relPaths: string[]
): string[] {
  if (loc.isRoot) {
    return relPaths.map((p) => join(cwd, p));
  }
  // Per-directory registry: files are relative to that registry's folder.
  const dir = loc.registryFilePath.replace(/registry\.json$/, "");
  return relPaths.map((p) => join(dir, p));
}

/**
 * Derive the `<owner>/<repo>` slug for a GitHub source registry from the
 * project's homepage, when that homepage points at github.com. Returns null
 * for non-GitHub homepages so callers can fall back to the hosted form.
 */
export function githubSlugFromHomepage(
  homepage: string | undefined
): string | null {
  if (!homepage) return null;
  const match = homepage.match(
    /github\.com\/([^/]+)\/([^/#?]+)/i
  );
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  if (!owner || !repo) return null;
  return `${owner}/${repo}`;
}

/**
 * Build the public install command for an item.
 *
 * Resolution order:
 * 1. GitHub source registry — `npx shadcn add <owner>/<repo>/<item>` when the
 *    homepage points at github.com (no build/host needed).
 * 2. Namespace handle — `npx shadcn add @ns/<item>`.
 * 3. Full registry URL — `npx shadcn add <homepage>/r/<item>.json`.
 */
export function installCommand(
  ctx: Pick<RegistryContext, "namespace" | "registryName" | "registry">,
  name: string
): string {
  const homepage =
    (ctx.registry.homepage as string | undefined) ||
    `https://${ctx.registryName}.com`;

  const slug = githubSlugFromHomepage(homepage);
  if (slug) {
    return `npx shadcn@latest add ${slug}/${name}`;
  }

  if (ctx.namespace) {
    return `npx shadcn@latest add ${ctx.namespace}/${name}`;
  }
  return `npx shadcn@latest add ${homepage}/r/${name}.json`;
}

/** registry:* type → docs subfolder name (components, hooks, blocks…). */
export function docsFolderForType(type: string): string {
  switch (type) {
    case "registry:hook":
      return "hooks";
    case "registry:block":
      return "blocks";
    case "registry:theme":
      return "themes";
    default:
      return "components";
  }
}

/**
 * Remove a doc page and prune its meta.json entry. No-op when there's no
 * docs site. Returns the path that was deleted, or null.
 */
export function removeDocsPage(
  cwd: string,
  type: string,
  name: string
): string | null {
  if (!existsSync(join(cwd, "content/docs"))) return null;

  const folder = docsFolderForType(type);
  const docsDir = join(cwd, "content/docs", folder);
  const docPath = join(docsDir, `${name}.mdx`);

  let removed: string | null = null;
  if (existsSync(docPath)) {
    rmSync(docPath);
    removed = `content/docs/${folder}/${name}.mdx`;
  }

  const metaPath = join(docsDir, "meta.json");
  const meta = readJson<{ pages?: string[] }>(metaPath);
  if (meta && Array.isArray(meta.pages) && meta.pages.includes(name)) {
    meta.pages = meta.pages.filter((p) => p !== name);
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  }

  return removed;
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}
