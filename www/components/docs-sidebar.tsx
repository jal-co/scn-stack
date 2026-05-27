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
    title: "CLI",
    items: [
      { title: "Options Reference", href: "/docs/cli/options" },
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
];

export { docsNav };

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-4 py-4">
      {docsNav.map((group, i) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <p
            className={cn(
              "px-2 pb-1 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
              i === 0 ? "pt-0" : "pt-4"
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
                  "relative flex items-center px-2 py-1.5 text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent font-medium text-foreground"
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
