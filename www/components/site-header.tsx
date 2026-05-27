"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GitHubStarsButtonClient } from "./github-stars-client";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/builder", label: "Builder" },
];

const mobileNavItems = [
  { href: "/", label: "Home" },
  ...navItems,
  {
    href: "https://github.com/jal-co/scn-stack",
    label: "GitHub",
    external: true,
  },
  {
    href: "https://www.npmjs.com/package/create-scn-stack",
    label: "npm",
    external: true,
  },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Package className="h-5 w-5" />
        <span className="hidden font-semibold sm:inline">scn-stack</span>
      </Link>

      {/* Desktop nav */}
      <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(item.href)
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <a
          href="https://www.npmjs.com/package/create-scn-stack"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
        >
          npm
        </a>
        <GitHubStarsButtonClient />
      </div>

      {/* Mobile nav overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed inset-x-0 top-14 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b bg-background p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-1">
              {mobileNavItems.map((item) => {
                const isExternal = "external" in item && item.external;
                const isActive = !isExternal && pathname === item.href;
                const Component = isExternal ? "a" : Link;
                const extraProps = isExternal
                  ? {
                      target: "_blank" as const,
                      rel: "noopener noreferrer",
                    }
                  : {};

                return (
                  <Component
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                    {...extraProps}
                  >
                    {item.label}
                  </Component>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
