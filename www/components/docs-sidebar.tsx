"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const docsNav: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Quick Start", href: "/docs" },
      { title: "Project Structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Distribution",
    items: [
      { title: "Hosted Registry", href: "/docs/distribution/hosted" },
      {
        title: "GitHub Source Registry",
        href: "/docs/distribution/github-registries",
      },
    ],
  },
  {
    title: "CLI",
    items: [
      { title: "Options Reference", href: "/docs/cli/options" },
      { title: "Init Command", href: "/docs/cli/init" },
      { title: "Eject", href: "/docs/cli/eject" },
      { title: "Using the Prompts", href: "/docs/cli/prompts" },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { title: "Next.js", href: "/docs/frameworks/nextjs" },
      { title: "Vite", href: "/docs/frameworks/vite" },
      { title: "React Router", href: "/docs/frameworks/react-router" },
      { title: "TanStack Start", href: "/docs/frameworks/tanstack-start" },
    ],
  },
  {
    title: "Docs Engines",
    items: [
      { title: "Fumadocs", href: "/docs/docs-engines/fumadocs" },
      { title: "Mintlify", href: "/docs/docs-engines/mintlify" },
      { title: "Starlight", href: "/docs/docs-engines/starlight" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "llms.txt", href: "/llms.txt" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-6">
      {docsNav.map((group, i) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <p
            className={cn(
              "px-0 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
              i === 0 ? "pt-0" : "pt-5"
            )}
          >
            {group.title}
          </p>
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "py-1.5 text-sm transition-colors hover:text-foreground",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
