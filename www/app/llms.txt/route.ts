export function GET() {
  const content = `# scn-stack

> Scaffold a complete shadcn component registry with documentation in minutes.

## About

scn-stack is an interactive CLI that generates fully configured shadcn component registries. It handles framework setup, documentation, registry config, starter components, and AI skills — all in one command.

\`\`\`bash
npx create-scn-stack
\`\`\`

## Docs

- [Quick Start](https://scnstack.sh/docs): Get started in minutes
- [Project Structure](https://scnstack.sh/docs/project-structure): What gets generated
- [CLI Options](https://scnstack.sh/docs/cli/options): All flags and commands
- [CLI Prompts](https://scnstack.sh/docs/cli/prompts): Interactive prompt walkthrough

## Frameworks

- [Next.js](https://scnstack.sh/docs/frameworks/nextjs): Recommended framework
- [Vite](https://scnstack.sh/docs/frameworks/vite): Lightweight React projects
- [React Router](https://scnstack.sh/docs/frameworks/react-router): React Router v7
- [TanStack Start](https://scnstack.sh/docs/frameworks/tanstack-start): TanStack ecosystem

## Docs Engines

- [Fumadocs](https://scnstack.sh/docs/docs-engines/fumadocs): Recommended, requires Next.js
- [Mintlify](https://scnstack.sh/docs/docs-engines/mintlify): Hosted documentation platform
- [Starlight](https://scnstack.sh/docs/docs-engines/starlight): Astro-based, any framework

## Links

- Website: https://scnstack.sh
- GitHub: https://github.com/jal-co/scn-stack
- npm: https://www.npmjs.com/package/create-scn-stack
- Full docs for LLMs: https://scnstack.sh/llms-full.txt
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
