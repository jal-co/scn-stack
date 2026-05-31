const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "scn-stack-docs",
      type: "skill-md" as const,
      description:
        "Full documentation for scn-stack — an interactive CLI for scaffolding complete shadcn component registries with docs, framework choice, and starter components.",
      url: "https://scnstack.sh/llms-full.txt",
    },
  ],
};

export function GET() {
  return Response.json(index, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
