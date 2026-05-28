"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { GitHubStarsButtonClient } from "./github-stars-client";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-4xl md:rounded-md md:transition-all md:ease-out",
        scrolled
          ? "border border-white/[0.08] bg-zinc-950/80 backdrop-blur-md md:top-2 md:max-w-3xl md:shadow-lg md:shadow-black/20"
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
          className="rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/scn-stack-wordmark.svg"
            alt="scn-stack"
            className="h-5 w-auto invert"
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
                "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100",
                pathname.startsWith(item.href) && "text-zinc-100"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <a
              href="https://www.npmjs.com/package/create-scn-stack"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm
            </a>
          </Button>
          <GitHubStarsButtonClient owner="jal-co" repo="scn-stack" />
        </div>

        <Button
          aria-label={open ? "Close" : "Menu"}
          className="text-zinc-400 md:hidden"
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
      </nav>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed inset-x-0 top-14 z-50 border-b border-white/[0.08] bg-zinc-950 p-4 md:hidden">
            <div className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...navItems].map((item) => (
                <Button
                  asChild
                  key={item.label}
                  variant="ghost"
                  className="justify-start text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button
                asChild
                variant="ghost"
                className="justify-start text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              >
                <a
                  href="https://www.npmjs.com/package/create-scn-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  npm
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="justify-start text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              >
                <a
                  href="https://github.com/jal-co/scn-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
