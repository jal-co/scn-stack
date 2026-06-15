"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M0 0v16h16V0H0zm13 13H8V5H5v8H3V3h10v10z" />
    </svg>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}m`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`;
  }
  return n.toLocaleString("en-US");
}

interface NpmDownloadsProps {
  packageName?: string;
  className?: string;
}

export function NpmDownloads({
  packageName = "create-scn-stack",
  className,
}: NpmDownloadsProps) {
  const [downloads, setDownloads] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.downloads != null) {
          setDownloads(data.downloads);
        }
      })
      .catch(() => {});
  }, [packageName]);

  if (downloads === null) return null;

  return (
    <a
      href={`https://www.npmjs.com/package/${packageName}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${packageName} on npm — ${downloads.toLocaleString("en-US")} weekly downloads`}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card/60 px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
        className
      )}
    >
      <NpmIcon className="size-3.5 shrink-0" />
      <span className="tabular-nums text-muted-foreground">
        {formatCount(downloads)}/wk
      </span>
    </a>
  );
}
