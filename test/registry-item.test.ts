import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadRegistryContext,
  findItem,
  allItems,
  removeItemFromRegistry,
  resolveItemFiles,
  installCommand,
  removeDocsPage,
} from "../src/registry-item.js";

let dir: string;

const write = (rel: string, data: unknown) => {
  const full = join(dir, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(
    full,
    typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n"
  );
};
const readJson = (rel: string) =>
  JSON.parse(readFileSync(join(dir, rel), "utf-8"));

/** A minimal include-pattern registry with a UI button + a hook. */
function seedIncludeRegistry() {
  write("registry.json", {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "acme",
    homepage: "https://acme.dev",
    include: [
      "registry/new-york/ui/registry.json",
      "registry/new-york/hooks/registry.json",
    ],
  });
  write("registry/new-york/ui/registry.json", {
    items: [
      {
        name: "button",
        type: "registry:ui",
        title: "Button",
        description: "A button.",
        files: [{ path: "button.tsx", type: "registry:ui" }],
      },
    ],
  });
  write("registry/new-york/ui/button.tsx", "export const Button = () => null\n");
  write("registry/new-york/hooks/registry.json", {
    items: [
      {
        name: "use-toggle",
        type: "registry:hook",
        files: [{ path: "use-toggle.ts", type: "registry:hook" }],
      },
    ],
  });
  write("registry/new-york/hooks/use-toggle.ts", "export {}\n");
  write("components.json", {
    style: "new-york",
    registries: { "@acme": "https://acme.dev/r/{name}.json" },
  });
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "scn-ri-"));
});
afterEach(() => {
  if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
});

describe("loadRegistryContext", () => {
  it("returns null when there is no registry.json", () => {
    expect(loadRegistryContext(dir)).toBeNull();
  });

  it("reads style, namespace, and include mode", () => {
    seedIncludeRegistry();
    const ctx = loadRegistryContext(dir)!;
    expect(ctx.style).toBe("new-york");
    expect(ctx.namespace).toBe("@acme");
    expect(ctx.registryName).toBe("acme");
    expect(ctx.usesInclude).toBe(true);
  });
});

describe("findItem", () => {
  it("finds an item inside an included per-directory registry", () => {
    seedIncludeRegistry();
    const loc = findItem(dir, "use-toggle")!;
    expect(loc).not.toBeNull();
    expect(loc.isRoot).toBe(false);
    expect(loc.item.type).toBe("registry:hook");
    expect(loc.registryFilePath).toContain("hooks/registry.json");
  });

  it("returns null for an unknown item", () => {
    seedIncludeRegistry();
    expect(findItem(dir, "nope")).toBeNull();
  });

  it("finds an item in the flat root registry", () => {
    write("registry.json", {
      name: "flat",
      items: [{ name: "card", type: "registry:ui", files: [] }],
    });
    const loc = findItem(dir, "card")!;
    expect(loc.isRoot).toBe(true);
  });
});

describe("allItems", () => {
  it("collects items across root and included registries", () => {
    seedIncludeRegistry();
    const names = allItems(dir)
      .map((l) => l.item.name)
      .sort();
    expect(names).toEqual(["button", "use-toggle"]);
  });
});

describe("removeItemFromRegistry + resolveItemFiles", () => {
  it("splices the item out and returns its file paths", () => {
    seedIncludeRegistry();
    const loc = findItem(dir, "button")!;
    const files = removeItemFromRegistry(loc);
    expect(files).toEqual(["button.tsx"]);

    const ui = readJson("registry/new-york/ui/registry.json");
    expect(ui.items.find((i: { name: string }) => i.name === "button")).toBe(
      undefined
    );
  });

  it("resolves include-pattern file paths relative to the registry folder", () => {
    seedIncludeRegistry();
    const loc = findItem(dir, "button")!;
    const abs = resolveItemFiles(dir, loc, ["button.tsx"]);
    expect(abs[0]).toBe(join(dir, "registry/new-york/ui/button.tsx"));
  });
});

describe("installCommand", () => {
  it("prefers the namespace handle", () => {
    seedIncludeRegistry();
    const ctx = loadRegistryContext(dir)!;
    expect(installCommand(ctx, "button")).toBe(
      "npx shadcn@latest add @acme/button"
    );
  });

  it("falls back to the homepage URL when there is no namespace", () => {
    write("registry.json", { name: "flat", homepage: "https://x.dev", items: [] });
    const ctx = loadRegistryContext(dir)!;
    expect(installCommand(ctx, "button")).toBe(
      "npx shadcn@latest add https://x.dev/r/button.json"
    );
  });
});

describe("removeDocsPage", () => {
  it("deletes the mdx page and prunes meta.json", () => {
    write("content/docs/components/button.mdx", "# Button");
    write("content/docs/components/meta.json", {
      pages: ["button", "card"],
    });

    const removed = removeDocsPage(dir, "registry:ui", "button");
    expect(removed).toBe("content/docs/components/button.mdx");
    expect(existsSync(join(dir, "content/docs/components/button.mdx"))).toBe(
      false
    );
    expect(readJson("content/docs/components/meta.json").pages).toEqual([
      "card",
    ]);
  });

  it("is a no-op when there is no docs site", () => {
    expect(removeDocsPage(dir, "registry:ui", "button")).toBeNull();
  });

  it("routes hooks and themes to the right docs folder", () => {
    write("content/docs/hooks/use-toggle.mdx", "x");
    write("content/docs/themes/midnight.mdx", "x");
    expect(removeDocsPage(dir, "registry:hook", "use-toggle")).toBe(
      "content/docs/hooks/use-toggle.mdx"
    );
    expect(removeDocsPage(dir, "registry:theme", "midnight")).toBe(
      "content/docs/themes/midnight.mdx"
    );
  });
});
