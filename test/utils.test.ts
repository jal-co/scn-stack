import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
  getDlxCommand,
  writeFile,
  ensureDir,
  titleCase,
  registryHasItem,
} from "../src/utils.js";
import type { PackageManager } from "../src/types.js";

const PMS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

describe("getInstallCommand", () => {
  it.each([
    ["pnpm", "pnpm install"],
    ["npm", "npm install"],
    ["yarn", "yarn"],
    ["bun", "bun install"],
  ] as const)("%s -> %s", (pm, expected) => {
    expect(getInstallCommand(pm)).toBe(expected);
  });
});

describe("getRunCommand", () => {
  it.each([
    ["pnpm", "pnpm dev"],
    ["npm", "npm run dev"],
    ["yarn", "yarn dev"],
    ["bun", "bun run dev"],
  ] as const)("%s -> %s", (pm, expected) => {
    expect(getRunCommand(pm, "dev")).toBe(expected);
  });
});

describe("getDlxCommand", () => {
  it.each([
    ["pnpm", "pnpm dlx"],
    ["npm", "npx"],
    ["yarn", "yarn dlx"],
    ["bun", "bunx"],
  ] as const)("%s -> %s", (pm, expected) => {
    expect(getDlxCommand(pm)).toBe(expected);
  });
});

describe("detectPackageManager", () => {
  const original = process.env.npm_config_user_agent;
  afterEach(() => {
    process.env.npm_config_user_agent = original;
  });

  it.each(PMS)("detects %s from the user agent", (pm) => {
    process.env.npm_config_user_agent = `${pm}/1.0.0 node/v20`;
    // npm has no special prefix; it falls through to the pnpm default.
    const expected = pm === "npm" ? "pnpm" : pm;
    expect(detectPackageManager()).toBe(expected);
  });

  it("defaults to pnpm when the user agent is missing", () => {
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe("pnpm");
  });
});

describe("titleCase", () => {
  it("title-cases single words", () => {
    expect(titleCase("button")).toBe("Button");
  });

  it("splits hyphenated names", () => {
    expect(titleCase("login-form")).toBe("Login Form");
    expect(titleCase("use-toggle")).toBe("Use Toggle");
  });
});

describe("registryHasItem", () => {
  let dir: string;

  afterEach(() => {
    if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  });

  it("returns false when no registry.json exists", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-has-"));
    expect(registryHasItem(dir, "button")).toBe(false);
  });

  it("finds an item directly in the root registry (flat pattern)", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-has-"));
    writeFile(
      join(dir, "registry.json"),
      JSON.stringify({ items: [{ name: "button" }, { name: "card" }] })
    );
    expect(registryHasItem(dir, "button")).toBe(true);
    expect(registryHasItem(dir, "missing")).toBe(false);
  });

  it("follows the include pattern into per-directory registries", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-has-"));
    writeFile(
      join(dir, "registry.json"),
      JSON.stringify({ include: ["registry/new-york/ui/registry.json"] })
    );
    writeFile(
      join(dir, "registry/new-york/ui/registry.json"),
      JSON.stringify({ items: [{ name: "button" }] })
    );
    expect(registryHasItem(dir, "button")).toBe(true);
    expect(registryHasItem(dir, "missing")).toBe(false);
  });

  it("tolerates malformed json and missing include targets", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-has-"));
    writeFile(
      join(dir, "registry.json"),
      JSON.stringify({ include: ["does/not/exist.json"] })
    );
    expect(registryHasItem(dir, "x")).toBe(false);

    writeFile(join(dir, "registry.json"), "{ not valid json");
    expect(registryHasItem(dir, "x")).toBe(false);
  });
});

describe("fs helpers", () => {
  let dir: string;

  afterEach(() => {
    if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  });

  it("writeFile creates missing parent directories", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-utils-"));
    const target = join(dir, "a/b/c/file.txt");
    writeFile(target, "hello");
    expect(existsSync(target)).toBe(true);
    expect(readFileSync(target, "utf-8")).toBe("hello");
  });

  it("ensureDir is idempotent", () => {
    dir = mkdtempSync(join(tmpdir(), "scn-utils-"));
    const target = join(dir, "nested/dir");
    ensureDir(target);
    ensureDir(target);
    expect(existsSync(target)).toBe(true);
  });
});
