import type { ComponentProps, ReactNode } from "react";
import { CodeBlockCommand } from "@/components/code-block-command";
import { CodeBlock } from "@/components/code-block";
import { CodeLine } from "@/components/code-line";
import { FileTree, type FileTreeNode } from "@/components/file-tree";
import { convertNpmCommand } from "@/lib/convert-npm-command";

export { CodeBlockCommand, CodeBlock, CodeLine, FileTree, convertNpmCommand };
export type { FileTreeNode };

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props: Record<string, unknown> }).props;
    return extractText(props.children);
  }
  return "";
}

function getCodeInfo(children: ReactNode): {
  code: string;
  lang: string;
} | null {
  // Handle: <pre><code className="language-xxx">...</code></pre>
  if (
    children &&
    typeof children === "object" &&
    "props" in (children as Record<string, unknown>)
  ) {
    const childProps = (children as { props: Record<string, unknown> }).props;
    const className = (childProps.className as string) || "";
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch?.[1] || "";
    const code = extractText(childProps.children).trim();
    if (code) {
      return { code, lang };
    }
  }
  // Handle: raw text children in <pre>
  const raw = extractText(children).trim();
  if (raw) {
    return { code: raw, lang: "" };
  }
  return null;
}

/**
 * Custom MDX pre/code handler.
 * Routes all fenced code blocks to the appropriate jalco-ui component.
 */
function CustomPre({ children, ...props }: ComponentProps<"pre">) {
  const info = getCodeInfo(children);

  if (info) {
    const { code, lang } = info;

    // Shell package manager commands → CodeBlockCommand with PM tabs
    if (lang === "bash" || lang === "sh" || lang === "shell") {
      if (code.match(/^(npm |npx |pnpm |yarn |bun |bunx |shadcn )/m)) {
        const converted = convertNpmCommand(code);
        return <CodeBlockCommand {...converted} />;
      }
      return <CodeBlock code={code} language="bash" compact />;
    }

    // Single-line non-JSON/TSX → CodeLine
    const lines = code.split("\n").filter(Boolean);
    if (lines.length === 1 && !lang.match(/^(json|tsx|typescript|mdx)$/)) {
      return <CodeLine code={code} language={lang || "text"} />;
    }

    // Everything else → CodeBlock
    return <CodeBlock code={code} language={lang || "text"} compact />;
  }

  // Fallback — try extracting raw text as last resort
  const rawText = extractText(children).trim();
  if (rawText) {
    return <CodeBlock code={rawText} language="text" compact />;
  }

  return (
    <pre
      className="overflow-x-auto rounded-xl border bg-muted/50 p-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  );
}

function CustomCode({ children, className, ...props }: ComponentProps<"code">) {
  // If inside a <pre>, let CustomPre handle it
  if (className?.includes("language-")) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  // Inline code
  return (
    <code
      className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[0.85em] font-mono"
      {...props}
    >
      {children}
    </code>
  );
}

export const mdxComponents = {
  pre: CustomPre,
  code: CustomCode,
  FileTree,
  CodeBlockCommand,
  CodeBlock,
  CodeLine,
};
