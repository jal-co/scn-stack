import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  generateRegistryJson,
  generateComponentsJson,
} from "../src/generators/registry.js";
import { generateConfig, readConfig } from "../src/generators/config.js";
import type { ProjectConfig } from "../src/types.js";

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: "my-ui",
    registryName: "my-ui",
    style: "new-york",
    homepage: "https://my-ui.com",
    framework: "nextjs",
    docsEngine: "fumadocs",
    starterComponents: "essentials",
    baseLibrary: "radix",
    monorepo: false,
    useNamespace: true,
    namespace: "@my-ui",
    packageManager: "pnpm",
    directory: "",
    installShadcnSkill: true,
    installRegistrySkill: true,
    ...overrides,
  };
}

let dir: string;
const readJson = (rel: string) =>
  JSON.parse(readFileSync(join(dir, rel), "utf-8"));

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "scn-gen-"));
});

afterEach(() => {
  if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
});

describe("generateRegistryJson", () => {
  it("writes a root registry.json with the include pattern", () => {
    generateRegistryJson(makeConfig({ directory: dir }));
    const root = readJson("registry.json");
    expect(root.name).toBe("my-ui");
    expect(root.homepage).toBe("https://my-ui.com");
    expect(root.include).toEqual(["registry/new-york/ui/registry.json"]);
    expect(root.$schema).toContain("registry.json");
  });

  it("includes button, card, and badge for the essentials set", () => {
    generateRegistryJson(makeConfig({ directory: dir }));
    const ui = readJson("registry/new-york/ui/registry.json");
    expect(ui.items.map((i: { name: string }) => i.name)).toEqual([
      "button",
      "card",
      "badge",
    ]);
  });

  it("includes only button for the minimal set", () => {
    generateRegistryJson(
      makeConfig({ directory: dir, starterComponents: "minimal" })
    );
    const ui = readJson("registry/new-york/ui/registry.json");
    expect(ui.items.map((i: { name: string }) => i.name)).toEqual(["button"]);
  });

  it("omits the per-directory registry for the none set", () => {
    generateRegistryJson(
      makeConfig({ directory: dir, starterComponents: "none" })
    );
    expect(existsSync(join(dir, "registry/new-york/ui/registry.json"))).toBe(
      false
    );
    expect(existsSync(join(dir, "registry.json"))).toBe(true);
  });

  it("respects the configured style in the include path", () => {
    generateRegistryJson(makeConfig({ directory: dir, style: "default" }));
    const root = readJson("registry.json");
    expect(root.include).toEqual(["registry/default/ui/registry.json"]);
  });
});

describe("generateComponentsJson", () => {
  it("enables rsc only for Next.js", () => {
    generateComponentsJson(makeConfig({ directory: dir, framework: "nextjs" }));
    expect(readJson("components.json").rsc).toBe(true);
  });

  it("disables rsc for non-Next.js frameworks", () => {
    generateComponentsJson(makeConfig({ directory: dir, framework: "vite" }));
    expect(readJson("components.json").rsc).toBe(false);
  });

  it("points tailwind css at the framework's entry stylesheet", () => {
    generateComponentsJson(makeConfig({ directory: dir, framework: "nextjs" }));
    expect(readJson("components.json").tailwind.css).toBe("app/globals.css");

    rmSync(join(dir, "components.json"));
    generateComponentsJson(makeConfig({ directory: dir, framework: "vite" }));
    expect(readJson("components.json").tailwind.css).toBe("src/index.css");
  });

  it("registers the namespace when requested", () => {
    generateComponentsJson(
      makeConfig({ directory: dir, useNamespace: true, namespace: "@acme" })
    );
    const json = readJson("components.json");
    expect(json.registries["@acme"]).toBe("https://my-ui.com/r/{name}.json");
  });

  it("omits registries when no namespace is used", () => {
    generateComponentsJson(
      makeConfig({ directory: dir, useNamespace: false, namespace: "" })
    );
    expect(readJson("components.json").registries).toBeUndefined();
  });

  it("only sets base when the Base UI library is selected", () => {
    generateComponentsJson(makeConfig({ directory: dir, baseLibrary: "radix" }));
    expect(readJson("components.json").base).toBeUndefined();

    rmSync(join(dir, "components.json"));
    generateComponentsJson(makeConfig({ directory: dir, baseLibrary: "base" }));
    expect(readJson("components.json").base).toBe("base");
  });
});

describe("config (.scn-stack.json) round-trip", () => {
  it("writes a config and reads it back", () => {
    generateConfig(makeConfig({ directory: dir, namespace: "@acme" }));
    const config = readConfig(dir);
    expect(config).not.toBeNull();
    expect(config).toMatchObject({
      name: "my-ui",
      style: "new-york",
      framework: "nextjs",
      namespace: "@acme",
    });
  });

  it("drops the namespace when none is used", () => {
    generateConfig(
      makeConfig({ directory: dir, useNamespace: false, namespace: "" })
    );
    expect(readConfig(dir)).not.toHaveProperty("namespace");
  });

  it("returns null when no config exists", () => {
    expect(readConfig(dir)).toBeNull();
  });

  it("returns null for malformed config json", () => {
    writeFileSync(join(dir, ".scn-stack.json"), "{ not valid json");
    expect(readConfig(dir)).toBeNull();
  });
});
