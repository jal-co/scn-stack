import type { ComponentProps } from "react";
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

/**
 * Custom MDX pre/code handler.
 * - Shell install/create commands → CodeBlockCommand with PM switching
 * - Single-line code → CodeLine with syntax highlighting
 * - Multi-line code → CodeBlock with syntax highlighting + copy
 */
function CustomPre({ children, ...props }: ComponentProps<"pre">) {
  if (
    children &&
    typeof children === "object" &&
    "props" in (children as { props?: Record<string, unknown> })
  ) {
    const codeProps = (children as { props: Record<string, unknown> }).props;
    const className = (codeProps.className as string) || "";
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch?.[1] || "";
    const code = extractText(codeProps.children).trim();

    // Shell package manager commands → CodeBlockCommand with PM tabs
    if (lang === "bash" || lang === "sh" || lang === "shell") {
      if (
        code.match(
          /^(npm |npx |pnpm |yarn |bun |bunx |shadcn )/m
        )
      ) {
        const converted = convertNpmCommand(code);
        return <CodeBlockCommand {...converted} />;
      }
      // Other shell commands → CodeBlock
      return <CodeBlock code={code} language="bash" compact />;
    }

    // Single-line code → CodeLine
    const lines = code.split("\n").filter(Boolean);
    if (lines.length === 1 && !lang.match(/^(json|tsx|typescript)$/)) {
      return <CodeLine code={code} language={lang || "typescript"} />;
    }

    // Multi-line code → CodeBlock with syntax highlighting
    return <CodeBlock code={code} language={lang || "text"} compact />;
  }

  return (
    <pre
      className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  );
}

function CustomCode({ children, className, ...props }: ComponentProps<"code">) {
  if (className?.includes("language-")) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code
      className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
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
