import type { ProjectConfig } from "../../types.js";
import { writeFile, getDlxCommand } from "../../utils.js";
import { join } from "node:path";

export function generateReactRouter(config: ProjectConfig): void {
  const dir = config.directory;
  const dlx = getDlxCommand(config.packageManager);

  // package.json
  const pkg = {
    name: config.name,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "react-router dev",
      build: `${dlx} shadcn@latest build && react-router build`,
      start: "react-router-serve ./build/server/index.js",
      "registry:build": `${dlx} shadcn@latest build`,
    },
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "react-router": "^7.0.0",
      "@react-router/node": "^7.0.0",
      "@react-router/serve": "^7.0.0",
      shadcn: "^2.9.0",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "tailwind-merge": "^3.0.0",
      "tw-animate-css": "^1.2.0",
      isbot: "^5.1.0",
    },
    devDependencies: {
      typescript: "^5.7.0",
      "@types/node": "^22.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@react-router/dev": "^7.0.0",
      vite: "^6.0.0",
      tailwindcss: "^4.0.0",
      "@tailwindcss/vite": "^4.0.0",
    },
  };
  writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // react-router.config.ts
  writeFile(
    join(dir, "react-router.config.ts"),
    `import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
} satisfies Config;
`
  );

  // vite.config.ts
  writeFile(
    join(dir, "vite.config.ts"),
    `import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
`
  );

  // tsconfig.json
  writeFile(
    join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["DOM", "DOM.Iterable", "ES2022"],
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          esModuleInterop: true,
          isolatedModules: true,
          noEmit: true,
          paths: {
            "@/*": ["./*"],
          },
        },
        include: ["app", "registry", "lib"],
      },
      null,
      2
    ) + "\n"
  );

  // app/root.tsx
  writeFile(
    join(dir, "app/root.tsx"),
    `import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction } from "react-router";
import stylesheet from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
`
  );

  // app/app.css
  writeFile(
    join(dir, "app/app.css"),
    `@import "tailwindcss";
@import "tw-animate-css";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
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

  // app/routes/home.tsx
  const installCmd = config.useNamespace
    ? `${dlx} shadcn@latest add ${config.namespace}/button`
    : `${dlx} shadcn@latest add ${config.homepage}/r/button.json`;

  writeFile(
    join(dir, "app/routes/home.tsx"),
    `import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "${config.registryName}" },
    { name: "description", content: "A custom shadcn component registry." },
  ];
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">${config.registryName}</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          A custom shadcn component registry. Install components with the shadcn CLI.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <code className="text-sm">${installCmd}</code>
      </div>
    </div>
  );
}
`
  );

  // app/routes.ts
  writeFile(
    join(dir, "app/routes.ts"),
    `import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;
`
  );

  // .gitignore
  writeFile(
    join(dir, ".gitignore"),
    `node_modules/
build/
.react-router/
.DS_Store
*.local
`
  );
}
