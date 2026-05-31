import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  images: {
    // The only images served through next/image are first-party brand and
    // tech-stack SVGs bundled in /public. Allowing SVG is safe here because no
    // user-supplied SVG is ever passed to next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withMDX(nextConfig);
