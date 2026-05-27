import type { ComponentProps, ReactNode } from "react";
import { CodeBlockCommand } from "@/components/code-block-command";
import { CodeLine } from "@/components/code-line";
import { FileTree, type FileTreeNode } from "@/components/file-tree";
import { convertNpmCommand } from "@/lib/convert-npm-command";

// Re-export components for direct use in MDX
export { CodeBlockCommand, CodeLine, FileTree, convertNpmCommand };
export type { FileTreeNode };

/**
 * Custom MDX pre/code handler.
 * - Shell commands → CodeBlockCommand with PM switching
 * - Single-line imports/code → CodeLine
 * - Multi-line code → styled pre block
 */
function CustomPre({ children, ...props }: ComponentProps<"pre">) {
  // Extract the code string and language from the child <code> element
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

    // Shell commands → CodeBlockCommand
    if (lang === "bash" || lang === "sh" || lang === "shell") {
      // Check if it's a package install/create/run command
      if (
        code.match(
          /^(npm |npx |pnpm |yarn |bun |bunx |shadcn )/m
        )
      ) {
        const converted = convertNpmCommand(code);
        return <CodeBlockCommand {...converted} />;
      }
      // Regular shell commands → CodeLine
      return <CodeLine code={code} language="bash" />;
    }

    // Single-line code → CodeLine
    const lines = code.split("\n").filter(Boolean);
    if (lines.length === 1) {
      return <CodeLine code={code} language={lang || "typescript"} />;
    }

    // Multi-line code → styled pre
    return (
      <pre
        className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm"
        {...props}
      >
        <code className={`language-${lang}`}>{code}</code>
      </pre>
    );
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

function CustomCode({ children, className, ...props }: ComponentProps<"code">) {
  // If inside a <pre>, pass through (handled by CustomPre)
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
  CodeLine,
};
