import type { ProjectConfig } from "../types.js";
import { writeFile } from "../utils.js";
import { join } from "node:path";

/**
 * Generates middleware and documentation for a private registry
 * that requires authentication via a bearer token.
 *
 * Private registries use a simple token-based auth:
 * - Registry owner sets REGISTRY_TOKEN env var on the server
 * - Users pass the token via shadcn CLI headers
 */
export function generateAuth(config: ProjectConfig): void {
  const dir = config.directory;

  if (config.framework === "nextjs") {
    generateNextjsAuth(config);
  } else {
    generateStaticAuth(config);
  }

  // Add auth documentation
  generateAuthDocs(config);
}

function generateNextjsAuth(config: ProjectConfig): void {
  const dir = config.directory;

  // Middleware to protect /r/ routes
  writeFile(
    join(dir, "middleware.ts"),
    `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect registry routes with bearer token authentication.
 *
 * Set the REGISTRY_TOKEN environment variable to enable auth.
 * When unset, the registry is public (no auth required).
 *
 * Users authenticate by configuring their shadcn CLI:
 *
 *   components.json → registries → headers → Authorization
 */
export function middleware(request: NextRequest) {
  const token = process.env.REGISTRY_TOKEN;

  // No token configured = public registry
  if (!token) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || authHeader !== \`Bearer \${token}\`) {
    return NextResponse.json(
      { error: "Unauthorized. A valid token is required to access this registry." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/r/:path*",
};
`
  );

  // .env.example
  writeFile(
    join(dir, ".env.example"),
    `# Registry authentication token.
# When set, users must provide this token to install components.
# When unset, the registry is public.
REGISTRY_TOKEN=
`
  );
}

function generateStaticAuth(config: ProjectConfig): void {
  const dir = config.directory;

  // For non-Next.js frameworks, provide a guide
  writeFile(
    join(dir, "AUTH.md"),
    `# Private Registry Authentication

This registry can be made private by requiring a bearer token for access.

## Setup

### Option 1: Reverse proxy (recommended)

Add authentication at the proxy/CDN level (e.g., Cloudflare Access, Vercel Firewall, Nginx):

\`\`\`nginx
location /r/ {
    if ($http_authorization != "Bearer YOUR_SECRET_TOKEN") {
        return 401;
    }
    # ... proxy or serve static files
}
\`\`\`

### Option 2: Server middleware

If you deploy with a server (e.g., Express, Hono), add middleware:

\`\`\`ts
app.use("/r/*", (req, res, next) => {
  const token = process.env.REGISTRY_TOKEN;
  if (!token) return next(); // public

  const auth = req.headers.authorization;
  if (auth !== \`Bearer \${token}\`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
\`\`\`

## User configuration

Users add the token to their \`components.json\`:

\`\`\`json
{
  "registries": {
    "${config.useNamespace ? config.namespace : "@my-registry"}": {
      "url": "${config.homepage}/r/{name}.json",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
\`\`\`
`
  );
}

function generateAuthDocs(config: ProjectConfig): void {
  const dir = config.directory;
  const docsDir = join(dir, "content/docs");

  // Only add docs page if docs engine is active
  if (config.docsEngine === "none") return;

  writeFile(
    join(docsDir, "authentication.mdx"),
    `---
title: Authentication
description: How to access this private registry.
---

## Public vs Private

By default this registry is public. When the \`REGISTRY_TOKEN\` environment variable is set on the server, the registry requires authentication.

## Configuring Access

Add the token to your \`components.json\`:

\`\`\`json
{
  "registries": {
    "${config.useNamespace ? config.namespace : "@registry"}": {
      "url": "${config.homepage}/r/{name}.json",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
\`\`\`

Then install components as normal:

\`\`\`bash
npx shadcn@latest add ${config.useNamespace ? `${config.namespace}/button` : `${config.homepage}/r/button.json`}
\`\`\`

## Getting a Token

Contact the registry owner to get an access token.
`
  );
}
