"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { GitHubStarsButtonClient } from "./github-stars-client";
import { NpmDownloads } from "./npm-downloads";
import { ThemeToggle } from "./theme-toggle";
import { XIcon, MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/builder", label: "Builder" },
  { href: "/sponsor", label: "Sponsor" },
];

export function SiteHeader() {
  const scrolled = useScroll(10);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes. Using the pathname as a
  // key on the menu lets React reset the open state without an effect chain.
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-4xl md:rounded-md md:transition-all md:ease-out",
        scrolled
          ? "border border-border/60 bg-background/80 backdrop-blur-md md:top-2 md:max-w-3xl md:shadow-lg md:shadow-black/20"
          : "border border-transparent"
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <Link
          href="/"
          className="rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
        >
          <Image
            src="/brand/scn-stack-wordmark.svg"
            alt="scn-stack"
            width={120}
            height={20}
            className="h-5 w-auto dark:invert"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              asChild
              key={item.label}
              size="sm"
              variant="ghost"
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                pathname.startsWith(item.href) && "text-foreground"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <NpmDownloads />
          <GitHubStarsButtonClient owner="jal-co" repo="scn-stack" />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            aria-label={open ? "Close" : "Menu"}
            className="text-muted-foreground"
            onClick={() => setOpen(!open)}
            size="icon"
            variant="ghost"
          >
            {open ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </Button>
        </div>
      </nav>

      {open && (
        <div key={pathname}>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <nav className="fixed inset-x-0 top-14 z-50 border-b border-border/60 bg-background p-4 md:hidden">
            <div className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...navItems].map((item) => (
                <Button
                  asChild
                  key={item.label}
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Link href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </Button>
              ))}
              <Button
                asChild
                variant="ghost"
                className="justify-start text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <a
                  href="https://github.com/jal-co/scn-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  GitHub
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
