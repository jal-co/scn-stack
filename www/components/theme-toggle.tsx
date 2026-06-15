"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves the theme on the client only. Render a stable
  // placeholder on the server to avoid a hydration mismatch, then swap in
  // the real icon once mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme (D)"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <Sun className="size-4 opacity-0" />
      )}
    </Button>
  );
}
