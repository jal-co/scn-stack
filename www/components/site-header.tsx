"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/builder", label: "Builder" },
];

const externalLinks = [
  { href: "https://github.com/jal-co/scn-stack", label: "GitHub" },
  { href: "https://www.npmjs.com/package/create-scn-stack", label: "npm" },
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
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-sm">
      {/* Left: logo + nav */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-mono text-xs font-bold uppercase tracking-[0.2em]"
        >
          scn-stack
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-[11px] uppercase tracking-[0.15em] transition-colors hover:text-foreground",
                pathname.startsWith(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: external links */}
      <div className="hidden items-center gap-4 md:flex">
        {externalLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground md:hidden"
        aria-label={open ? "Close" : "Menu"}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Mobile nav */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-12 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed inset-x-0 top-12 z-50 border-b bg-background p-6 md:hidden">
            <div className="flex flex-col gap-3">
              {[
                { href: "/", label: "Home" },
                ...navItems,
                ...externalLinks,
              ].map((item) => {
                const isExternal = item.href.startsWith("http");
                const Component = isExternal ? "a" : Link;
                return (
                  <Component
                    key={item.href}
                    href={item.href}
                    className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
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
