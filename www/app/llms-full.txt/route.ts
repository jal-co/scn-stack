import * as fs from "node:fs";
import * as path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

const DOC_ORDER = [
  "index.mdx",
  "project-structure.mdx",
  "cli/options.mdx",
  "cli/prompts.mdx",
  "frameworks/nextjs.mdx",
  "frameworks/vite.mdx",
  "frameworks/react-router.mdx",
  "frameworks/tanstack-start.mdx",
  "docs-engines/fumadocs.mdx",
  "docs-engines/mintlify.mdx",
  "docs-engines/starlight.mdx",
];

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, content: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { data, content: match[2] };
}

function slugFromPath(filePath: string): string {
  return filePath.replace(/\.mdx$/, "").replace(/^index$/, "");
}

function stripJsxComponents(content: string): string {
  return content
    .replace(/<FileTree[\s\S]*?\/>/g, "")
    .replace(/<ComponentPreview[\s\S]*?<\/ComponentPreview>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function GET() {
  const sections: string[] = [];

  sections.push(`# scn-stack — Full Documentation

> Scaffold a complete shadcn component registry with documentation in minutes.

Website: https://scnstack.sh
GitHub: https://github.com/jal-co/scn-stack
npm: https://www.npmjs.com/package/create-scn-stack

---`);

  for (const docPath of DOC_ORDER) {
    const fullPath = path.join(DOCS_DIR, docPath);

    if (!fs.existsSync(fullPath)) continue;

    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = parseFrontmatter(raw);
    const slug = slugFromPath(docPath);
    const url = slug
      ? `https://scnstack.sh/docs/${slug}`
      : "https://scnstack.sh/docs";
    const cleaned = stripJsxComponents(content);

    sections.push(`## ${data.title}

> ${data.description}
> Source: ${url}

${cleaned}

---`);
  }

  const body = sections.join("\n\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
