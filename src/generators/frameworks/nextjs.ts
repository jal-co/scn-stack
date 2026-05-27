import type { ProjectConfig } from "../../types.js";
import { writeFile, getDlxCommand } from "../../utils.js";
import { join } from "node:path";

export function generateNextjs(config: ProjectConfig): void {
  const dir = config.directory;
  const dlx = getDlxCommand(config.packageManager);
  const isFumadocs = config.docsEngine === "fumadocs";

  // package.json
  const pkg: Record<string, unknown> = {
    name: config.name,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev --turbopack",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "registry:build": "shadcn build",
    },
    dependencies: {
      next: "^16.2.0",
      react: "^19.2.0",
      "react-dom": "^19.2.0",
      shadcn: "^3.0.0",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "lucide-react": "^0.487.0",
      "tailwind-merge": "^3.3.1",
      "tw-animate-css": "^1.3.6",
      ...(isFumadocs
        ? {
            "fumadocs-core": "^16.8.0",
            "fumadocs-ui": "^16.8.0",
            "fumadocs-mdx": "^15.0.0",
            "@types/mdx": "^2.0.13",
          }
        : {}),
    },
    devDependencies: {
      typescript: "^5.9.0",
      "@types/node": "^20.19.0",
      "@types/react": "^19.2.0",
      "@types/react-dom": "^19.2.0",
      "@eslint/eslintrc": "^3.3.1",
      eslint: "^9.32.0",
      "eslint-config-next": "^16.2.0",
      tailwindcss: "^4.1.11",
      "@tailwindcss/postcss": "^4.1.11",
    },
  };

  writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // next.config.ts
  const nextConfig = isFumadocs
    ? `import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withMDX(nextConfig);
`
    : `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;
  writeFile(join(dir, "next.config.ts"), nextConfig);

  // tsconfig.json
  const tsPaths: Record<string, string[]> = {
    "@/*": ["./*"],
  };
  if (isFumadocs) {
    tsPaths["collections/*"] = ["./.source/*"];
  }

  const tsInclude = [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
  ];
  if (isFumadocs) {
    tsInclude.push(".source/**/*.ts");
  }

  writeFile(
    join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: tsPaths,
        },
        include: tsInclude,
        exclude: ["node_modules"],
      },
      null,
      2
    ) + "\n"
  );

  // postcss.config.mjs — matches registry template exactly
  writeFile(
    join(dir, "postcss.config.mjs"),
    `const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
`
  );

  // app/globals.css — matches registry template exactly
  writeFile(
    join(dir, "app/globals.css"),
    `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`
  );

  // app/layout.tsx
  writeFile(
    join(dir, "app/layout.tsx"),
    `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "${config.registryName}",
  description: "A custom shadcn component registry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        {children}
      </body>
    </html>
  );
}
`
  );

  // app/page.tsx (landing page)
  const installCmd = config.useNamespace
    ? `${dlx} shadcn@latest add ${config.namespace}/button`
    : `${dlx} shadcn@latest add ${config.homepage}/r/button.json`;

  writeFile(
    join(dir, "app/page.tsx"),
    `export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">${config.registryName}</h1>
        <p className="text-muted-foreground">
          A custom registry for distributing code using shadcn.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        <div className="flex flex-col gap-4 border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Install a component</h2>
          <div className="rounded-md bg-muted p-4">
            <code className="text-sm">${installCmd}</code>
          </div>
        </div>
        <div className="flex gap-4">${
          config.docsEngine !== "none"
            ? `
          <a
            href="/docs"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Documentation
          </a>`
            : ""
        }
          <a
            href="/r/registry.json"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View Registry
          </a>
        </div>
      </main>
    </div>
  );
}
`
  );

  // Registry is served as static files via \`shadcn build\` → public/r/
  // No dynamic route handlers needed — Next.js serves public/ automatically.
  // Run \`pnpm registry:build\` to generate the JSON files.

  // .gitignore
  writeFile(
    join(dir, ".gitignore"),
    `# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/

# production
build/
dist/

# misc
.DS_Store
*.pem
.env*.local

# typescript
*.tsbuildinfo
next-env.d.ts

# fumadocs
.source/
`
  );

  // eslint config
  writeFile(
    join(dir, "eslint.config.mjs"),
    `import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

export default eslintConfig;
`
  );
}
