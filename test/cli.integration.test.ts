import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CLI = resolve(__dirname, "../dist/index.js");

/**
 * Run the built CLI in a given working directory.
 * SCN_STACK_SKIP_INSTALL skips dependency install, skill install, and git init
 * so tests stay fast and offline.
 */
function runCli(args: string[], cwd: string) {
  return execFileSync("node", [CLI, ...args], {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, SCN_STACK_SKIP_INSTALL: "1" },
    stdio: "pipe",
  });
}

let work: string;

afterEach(() => {
  if (work && existsSync(work)) rmSync(work, { recursive: true, force: true });
});

beforeAll(() => {
  if (!existsSync(CLI)) {
    throw new Error(
      `Built CLI not found at ${CLI}. Run "npm run build" before the integration tests.`
    );
  }
});

describe("--help", () => {
  it("prints usage and exits cleanly", () => {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    const out = runCli(["--help"], work);
    expect(out).toContain("Usage:");
    expect(out).toContain("create-scn-stack");
    expect(out).toContain("add-component");
  });
});

describe("scaffold (--yes)", () => {
  const readJson = (rel: string) =>
    JSON.parse(readFileSync(join(work, "demo-ui", rel), "utf-8"));

  it("scaffolds a Next.js + Fumadocs registry", () => {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    runCli(
      [
        "demo-ui",
        "--yes",
        "--framework",
        "nextjs",
        "--docs",
        "fumadocs",
        "--components",
        "essentials",
        "--namespace",
        "@demo-ui",
      ],
      work
    );

    const root = join(work, "demo-ui");
    expect(existsSync(root)).toBe(true);

    // Core registry files
    expect(existsSync(join(root, "registry.json"))).toBe(true);
    expect(existsSync(join(root, "components.json"))).toBe(true);
    expect(existsSync(join(root, ".scn-stack.json"))).toBe(true);
    expect(existsSync(join(root, "package.json"))).toBe(true);
    expect(existsSync(join(root, "README.md"))).toBe(true);

    // Starter components
    expect(
      existsSync(join(root, "registry/new-york/ui/button.tsx"))
    ).toBe(true);
    expect(existsSync(join(root, "registry/new-york/ui/card.tsx"))).toBe(true);
    expect(existsSync(join(root, "registry/new-york/ui/badge.tsx"))).toBe(true);

    // Registry wiring
    const registry = readJson("registry.json");
    expect(registry.name).toBe("demo-ui");
    // The scaffold wires the UI registry (and a theme registry) via include.
    expect(registry.include).toContain("registry/new-york/ui/registry.json");

    const components = readJson("components.json");
    expect(components.rsc).toBe(true);
    expect(components.registries["@demo-ui"]).toContain("/r/{name}.json");

    // Side-effect steps must have been skipped
    expect(existsSync(join(root, "node_modules"))).toBe(false);
    expect(existsSync(join(root, ".git"))).toBe(false);
  });

  it("scaffolds a Vite registry without docs", () => {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    runCli(
      ["demo-ui", "--yes", "--framework", "vite", "--docs", "none"],
      work
    );

    const root = join(work, "demo-ui");
    expect(existsSync(join(root, "registry.json"))).toBe(true);
    expect(readJson("components.json").rsc).toBe(false);
    // No Fumadocs content directory for a docs-less Vite project
    expect(existsSync(join(root, "content/docs"))).toBe(false);
  });
});

describe("add-component", () => {
  function scaffoldFixture(): string {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    runCli(["demo-ui", "--yes", "--framework", "nextjs"], work);
    return join(work, "demo-ui");
  }

  it("adds a component, source file, and registry entry", () => {
    const root = scaffoldFixture();
    runCli(["add-component", "data-table", "-d", "A data table."], root);

    expect(
      existsSync(join(root, "registry/new-york/ui/data-table.tsx"))
    ).toBe(true);

    const source = readFileSync(
      join(root, "registry/new-york/ui/data-table.tsx"),
      "utf-8"
    );
    // Hyphenated name should be PascalCased in the component identifier
    expect(source).toContain("const DataTable");

    const uiRegistry = JSON.parse(
      readFileSync(
        join(root, "registry/new-york/ui/registry.json"),
        "utf-8"
      )
    );
    const added = uiRegistry.items.find(
      (i: { name: string }) => i.name === "data-table"
    );
    expect(added).toMatchObject({
      name: "data-table",
      title: "Data Table",
      type: "registry:ui",
    });
  });

  it("creates a docs page when content/docs exists", () => {
    const root = scaffoldFixture();
    runCli(["add-component", "tooltip", "-d", "A tooltip."], root);

    const docPath = join(root, "content/docs/components/tooltip.mdx");
    // Only assert when the scaffolded framework produced a docs dir.
    if (existsSync(join(root, "content/docs"))) {
      expect(existsSync(docPath)).toBe(true);
      expect(readFileSync(docPath, "utf-8")).toContain("title: Tooltip");
    }
  });

  it("fails when run outside a registry project", () => {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    const empty = join(work, "empty");
    mkdirSync(empty, { recursive: true });
    expect(() => runCli(["add-component", "x"], empty)).toThrow();
  });

  it("rejects re-adding a component already in the UI registry (include pattern)", () => {
    const root = scaffoldFixture();
    runCli(["add-component", "accordion", "-d", "first"], root);

    // Second add must fail — the duplicate check has to follow `include`.
    expect(() =>
      runCli(["add-component", "accordion", "-d", "second"], root)
    ).toThrow();

    const uiRegistry = JSON.parse(
      readFileSync(
        join(root, "registry/new-york/ui/registry.json"),
        "utf-8"
      )
    );
    const matches = uiRegistry.items.filter(
      (i: { name: string }) => i.name === "accordion"
    );
    expect(matches.length).toBe(1);
  });

  it("rejects re-adding a starter component (e.g. button)", () => {
    const root = scaffoldFixture();
    // button is part of the essentials set scaffolded into the UI registry.
    expect(() =>
      runCli(["add-component", "button", "-d", "x"], root)
    ).toThrow();
  });
});

describe("add-theme / remove / list", () => {
  function scaffoldFixture(): string {
    work = mkdtempSync(join(tmpdir(), "scn-cli-"));
    runCli(["demo-ui", "--yes", "--framework", "nextjs"], work);
    return join(work, "demo-ui");
  }

  const uiItems = (root: string) =>
    JSON.parse(
      readFileSync(join(root, "registry/new-york/ui/registry.json"), "utf-8")
    ).items.map((i: { name: string }) => i.name);

  it("add-theme registers a theme-<name> item and css file", () => {
    const root = scaffoldFixture();
    runCli(["add-theme", "midnight", "-d", "A dim theme."], root);

    expect(
      existsSync(join(root, "registry/new-york/themes/midnight.css"))
    ).toBe(true);

    const themes = JSON.parse(
      readFileSync(
        join(root, "registry/new-york/themes/registry.json"),
        "utf-8"
      )
    ).items.map((i: { name: string }) => i.name);
    expect(themes).toContain("theme-midnight");
  });

  it("list --json reports every registered item", () => {
    const root = scaffoldFixture();
    const out = runCli(["list", "--json"], root);
    const names = JSON.parse(out).map((i: { name: string }) => i.name);
    expect(names).toEqual(
      expect.arrayContaining(["button", "card", "badge"])
    );
  });

  it("list --type filters by kind", () => {
    const root = scaffoldFixture();
    runCli(["add-hook", "use-toggle", "-d", "x"], root);
    const out = runCli(["list", "--type", "hook", "--json"], root);
    const items = JSON.parse(out);
    expect(items.every((i: { type: string }) => i.type === "registry:hook")).toBe(
      true
    );
    expect(items.map((i: { name: string }) => i.name)).toContain("use-toggle");
  });

  it("remove --yes deletes source, registry entry, and docs page", () => {
    const root = scaffoldFixture();
    expect(uiItems(root)).toContain("button");

    runCli(["remove", "button", "--yes"], root);

    expect(existsSync(join(root, "registry/new-york/ui/button.tsx"))).toBe(
      false
    );
    expect(uiItems(root)).not.toContain("button");

    if (existsSync(join(root, "content/docs"))) {
      expect(
        existsSync(join(root, "content/docs/components/button.mdx"))
      ).toBe(false);
    }
  });

  it("remove fails for an unknown item", () => {
    const root = scaffoldFixture();
    expect(() => runCli(["remove", "nope", "--yes"], root)).toThrow();
  });

  it("add then remove round-trips back to the original item set", () => {
    const root = scaffoldFixture();
    const before = uiItems(root).sort();
    runCli(["add-component", "slider", "-d", "A slider."], root);
    expect(uiItems(root)).toContain("slider");
    runCli(["remove", "slider", "--yes"], root);
    expect(uiItems(root).sort()).toEqual(before);
  });
});
