import { describe, it, expect } from "vitest";
import { parseArgs } from "../src/args.js";

// parseArgs slices argv at index 2, so prepend two placeholder entries.
const argv = (...args: string[]) => ["node", "cli", ...args];

describe("parseArgs", () => {
  it("returns an empty object for no args", () => {
    expect(parseArgs(argv())).toEqual({});
  });

  it("reads a positional name", () => {
    expect(parseArgs(argv("my-ui")).name).toBe("my-ui");
  });

  it("does not treat flags as the positional name", () => {
    expect(parseArgs(argv("--yes")).name).toBeUndefined();
  });

  it("only captures the first positional as name", () => {
    const args = parseArgs(argv("first", "second"));
    expect(args.name).toBe("first");
  });

  it("parses boolean flags", () => {
    expect(parseArgs(argv("--yes")).yes).toBe(true);
    expect(parseArgs(argv("-y")).yes).toBe(true);
    expect(parseArgs(argv("--help")).help).toBe(true);
    expect(parseArgs(argv("-h")).help).toBe(true);
  });

  it("parses --name and --directory with values", () => {
    const args = parseArgs(argv("--name", "acme", "--dir", "./out"));
    expect(args.name).toBe("acme");
    expect(args.directory).toBe("./out");
  });

  it("accepts --directory as an alias for --dir", () => {
    expect(parseArgs(argv("--directory", "./x")).directory).toBe("./x");
  });

  describe("enum validation", () => {
    it("accepts valid enum values", () => {
      const args = parseArgs(
        argv(
          "--framework",
          "nextjs",
          "--docs",
          "fumadocs",
          "--components",
          "essentials",
          "--style",
          "new-york",
          "--pm",
          "pnpm",
          "--base",
          "radix"
        )
      );
      expect(args.framework).toBe("nextjs");
      expect(args.docs).toBe("fumadocs");
      expect(args.components).toBe("essentials");
      expect(args.style).toBe("new-york");
      expect(args.pm).toBe("pnpm");
      expect(args.base).toBe("radix");
    });

    it("ignores invalid enum values", () => {
      const args = parseArgs(
        argv("--framework", "svelte", "--docs", "nextra", "--pm", "rush")
      );
      expect(args.framework).toBeUndefined();
      expect(args.docs).toBeUndefined();
      expect(args.pm).toBeUndefined();
    });
  });

  describe("monorepo / skills toggles", () => {
    it("parses --monorepo and --no-monorepo", () => {
      expect(parseArgs(argv("--monorepo")).monorepo).toBe(true);
      expect(parseArgs(argv("--no-monorepo")).monorepo).toBe(false);
    });

    it("parses --skills and --no-skills", () => {
      expect(parseArgs(argv("--skills")).skills).toBe(true);
      expect(parseArgs(argv("--no-skills")).skills).toBe(false);
    });

    it("leaves toggles undefined when absent so prompts can decide", () => {
      const args = parseArgs(argv("my-ui"));
      expect(args.monorepo).toBeUndefined();
      expect(args.skills).toBeUndefined();
    });
  });

  it("parses namespace and homepage", () => {
    const args = parseArgs(
      argv("--namespace", "@acme", "--homepage", "https://acme.com")
    );
    expect(args.namespace).toBe("@acme");
    expect(args.homepage).toBe("https://acme.com");
  });

  it("parses a realistic full command", () => {
    const args = parseArgs(
      argv("my-ui", "--framework", "nextjs", "--docs", "fumadocs", "--yes")
    );
    expect(args).toMatchObject({
      name: "my-ui",
      framework: "nextjs",
      docs: "fumadocs",
      yes: true,
    });
  });

  describe("GitHub source registry target", () => {
    it("parses --target github", () => {
      expect(parseArgs(argv("--target", "github")).target).toBe("github");
    });

    it("parses --target hosted", () => {
      expect(parseArgs(argv("--target", "hosted")).target).toBe("hosted");
    });

    it("ignores an unknown --target value", () => {
      expect(parseArgs(argv("--target", "nope")).target).toBeUndefined();
    });

    it("--github sets the github target", () => {
      expect(parseArgs(argv("--github")).target).toBe("github");
    });

    it("--github owner/repo captures the slug", () => {
      const args = parseArgs(argv("--github", "acme/toolkit"));
      expect(args.target).toBe("github");
      expect(args.githubSlug).toBe("acme/toolkit");
    });

    it("--github does not consume a following flag as a slug", () => {
      const args = parseArgs(argv("--github", "--yes"));
      expect(args.target).toBe("github");
      expect(args.githubSlug).toBeUndefined();
      expect(args.yes).toBe(true);
    });

    it("--github-slug implies the github target", () => {
      const args = parseArgs(argv("--github-slug", "acme/toolkit"));
      expect(args.target).toBe("github");
      expect(args.githubSlug).toBe("acme/toolkit");
    });

    it("leaves target undefined by default so prompts can decide", () => {
      expect(parseArgs(argv("my-ui")).target).toBeUndefined();
    });
  });
});
