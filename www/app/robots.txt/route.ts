export function GET() {
  const body = `# https://scnstack.sh/robots.txt
# RFC 9309 — https://www.rfc-editor.org/rfc/rfc9309

User-agent: *
Allow: /
Sitemap: https://scnstack.sh/sitemap.xml

# AI crawlers — allow search and browsing
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

# Block known bad actors
User-agent: Bytespider
Disallow: /

# Content Signals — https://contentsignals.org/
# Allow search indexing and agent input, disallow training
Content-Signal: ai-train=no, search=yes, ai-input=yes
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
