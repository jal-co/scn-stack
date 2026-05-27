"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  Globe,
  BookOpen,
  Puzzle,
  Hash,
  Boxes,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

type Framework = "nextjs" | "vite" | "react-router" | "tanstack-start";
type DocsEngine = "fumadocs" | "mintlify" | "starlight" | "none";
type StarterComponents = "essentials" | "minimal" | "none";
type Style = "new-york" | "default";
type BaseLibrary = "radix" | "base";
type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

interface Config {
  name: string;
  style: Style;
  base: BaseLibrary;
  homepage: string;
  framework: Framework;
  docsEngine: DocsEngine;
  starterComponents: StarterComponents;
  monorepo: boolean;
  namespace: string;
  packageManager: PackageManager;
}

const DEFAULT_CONFIG: Config = {
  name: "my-ui",
  style: "new-york",
  base: "radix",
  homepage: "https://my-ui.com",
  framework: "nextjs",
  docsEngine: "fumadocs",
  starterComponents: "essentials",
  monorepo: false,
  namespace: "@my-ui",
  packageManager: "pnpm",
};

function OptionCard({
  selected,
  onClick,
  title,
  description,
  badge,
  icon,
  iconNode,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  badge?: string;
  icon?: string;
  iconNode?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 border px-4 py-3 text-left text-sm transition-all",
        selected
          ? "border-foreground bg-foreground/5 ring-1 ring-foreground/20"
          : "border-border hover:border-foreground/30 hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-2">
        {iconNode || (icon && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={icon} alt="" className="h-4 w-4 shrink-0" />
        ))}
        <span className="font-medium">{title}</span>
        {badge && (
          <span className="border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </div>
  );
}

function CopyCommandButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5  border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}

function buildCommand(config: Config): string {
  const parts = ["npx create-scn-stack"];

  if (config.name !== "my-ui") {
    parts.push(`--name ${config.name}`);
  }
  if (config.style !== "new-york") {
    parts.push(`--style ${config.style}`);
  }
  if (config.homepage !== `https://${config.name}.com`) {
    parts.push(`--homepage ${config.homepage}`);
  }
  if (config.framework !== "nextjs") {
    parts.push(`--framework ${config.framework}`);
  }
  if (config.docsEngine !== "fumadocs") {
    parts.push(`--docs ${config.docsEngine}`);
  }
  if (config.starterComponents !== "essentials") {
    parts.push(`--components ${config.starterComponents}`);
  }
  if (config.base !== "radix") {
    parts.push(`--base ${config.base}`);
  }
  if (config.monorepo) {
    parts.push("--monorepo");
  }
  if (config.namespace !== `@${config.name}`) {
    parts.push(`--namespace ${config.namespace}`);
  }
  if (config.packageManager !== "pnpm") {
    parts.push(`--pm ${config.packageManager}`);
  }

  return parts.join(" \\\n  ");
}

export function Builder() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-sync derived fields
      if (key === "name") {
        const name = value as string;
        if (prev.homepage === `https://${prev.name}.com`) {
          next.homepage = `https://${name}.com`;
        }
        if (prev.namespace === `@${prev.name}`) {
          next.namespace = `@${name}`;
        }
      }
      // Fumadocs requires Next.js
      if (key === "framework" && value !== "nextjs" && prev.docsEngine === "fumadocs") {
        next.docsEngine = "mintlify";
      }
      if (key === "docsEngine" && value === "fumadocs" && prev.framework !== "nextjs") {
        next.framework = "nextjs";
      }
      return next;
    });
  };

  const command = buildCommand(config);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row">
        {/* Config panel */}
        <div className="flex flex-1 flex-col gap-8">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Registry Builder
            </h1>
            <p className="mt-1 text-muted-foreground">
              Configure your registry and copy the command.
            </p>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Hash} title="Registry Name" />
            <input
              type="text"
              value={config.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="my-ui"
              className="h-10  border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Style */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Puzzle} title="Style" />
            <div className="grid grid-cols-2 gap-2">
              <OptionCard
                selected={config.style === "new-york"}
                onClick={() => update("style", "new-york")}
                title="New York"
                badge="recommended"
              />
              <OptionCard
                selected={config.style === "default"}
                onClick={() => update("style", "default")}
                title="Default"
              />
            </div>
          </div>

          {/* Base Library */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Boxes} title="Base Library" />
            <div className="grid grid-cols-2 gap-2">
              <OptionCard
                selected={config.base === "radix"}
                onClick={() => update("base", "radix")}
                title="Radix UI"
                badge="recommended"
                iconNode={
                  <svg viewBox="4 0 17 25" fill="currentColor" className="h-4 w-4">
                    <path d="M12 25a8 8 0 1 1 0-16v16zM12 0H4v8h8V0zM17 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                  </svg>
                }
              />
              <OptionCard
                selected={config.base === "base"}
                onClick={() => update("base", "base")}
                title="Base UI"
                description="by MUI"
                iconNode={
                  <svg viewBox="0 0 17 24" fill="currentColor" className="h-4 w-4">
                    <path d="M9.5 7.015A.477.477 0 0 0 9 7.5V23a8 8 0 0 0 .5-15.985ZM8 9.8V23c-4.418 0-8-3.94-8-8.8V1c4.418 0 8 3.94 8 8.8Z"/>
                  </svg>
                }
              />
            </div>
          </div>

          {/* Framework */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Boxes} title="Framework" />
            <div className="grid grid-cols-2 gap-2">
              <OptionCard
                selected={config.framework === "nextjs"}
                onClick={() => update("framework", "nextjs")}
                title="Next.js"
                description="App Router + Turbopack"
                badge="recommended"
                icon="https://svgl.app/library/nextjs_icon_dark.svg"
              />
              <OptionCard
                selected={config.framework === "vite"}
                onClick={() => update("framework", "vite")}
                title="Vite"
                description="React + Vite"
                icon="https://svgl.app/library/vite.svg"
              />
              <OptionCard
                selected={config.framework === "react-router"}
                onClick={() => update("framework", "react-router")}
                title="React Router"
                description="v7 with SSR"
                icon="https://svgl.app/library/reactrouter.svg"
              />
              <OptionCard
                selected={config.framework === "tanstack-start"}
                onClick={() => update("framework", "tanstack-start")}
                title="TanStack Start"
                description="Vinxi + file routing"
                icon="https://svgl.app/library/tanstack.svg"
              />
            </div>
          </div>

          {/* Docs Engine */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={BookOpen} title="Documentation" />
            <div className="grid grid-cols-2 gap-2">
              <OptionCard
                selected={config.docsEngine === "fumadocs"}
                onClick={() => update("docsEngine", "fumadocs")}
                title="Fumadocs"
                description="Requires Next.js"
                badge="recommended"
                icon="/icons/fumadocs.svg"
              />
              <OptionCard
                selected={config.docsEngine === "mintlify"}
                onClick={() => update("docsEngine", "mintlify")}
                title="Mintlify"
                description="Hosted platform"
                icon="https://svgl.app/library/mintlify.svg"
              />
              <OptionCard
                selected={config.docsEngine === "starlight"}
                onClick={() => update("docsEngine", "starlight")}
                title="Starlight"
                description="Astro-based"
                icon="https://svgl.app/library/astro-icon-dark.svg"
              />
              <OptionCard
                selected={config.docsEngine === "none"}
                onClick={() => update("docsEngine", "none")}
                title="None"
                description="Registry only"
              />
            </div>
          </div>

          {/* Starter Components */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Puzzle} title="Starter Components" />
            <div className="grid grid-cols-3 gap-2">
              <OptionCard
                selected={config.starterComponents === "essentials"}
                onClick={() => update("starterComponents", "essentials")}
                title="Essentials"
                description="Button, Card, Badge"
              />
              <OptionCard
                selected={config.starterComponents === "minimal"}
                onClick={() => update("starterComponents", "minimal")}
                title="Minimal"
                description="Button only"
              />
              <OptionCard
                selected={config.starterComponents === "none"}
                onClick={() => update("starterComponents", "none")}
                title="None"
                description="Empty registry"
              />
            </div>
          </div>

          {/* Homepage */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Globe} title="Homepage" />
            <input
              type="text"
              value={config.homepage}
              onChange={(e) => update("homepage", e.target.value)}
              placeholder="https://my-ui.com"
              className="h-10  border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Namespace */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Hash} title="Namespace" />
            <input
              type="text"
              value={config.namespace}
              onChange={(e) => update("namespace", e.target.value)}
              placeholder="@my-ui"
              className="h-10  border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Monorepo */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Boxes} title="Monorepo" />
            <div className="grid grid-cols-2 gap-2">
              <OptionCard
                selected={!config.monorepo}
                onClick={() => update("monorepo", false)}
                title="Single project"
                badge="default"
              />
              <OptionCard
                selected={config.monorepo}
                onClick={() => update("monorepo", true)}
                title="Monorepo"
                description="packages/ workspace"
              />
            </div>
          </div>

          {/* Package Manager */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Terminal} title="Package Manager" />
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: "pnpm" as const, icon: "https://svgl.app/library/pnpm.svg" },
                { value: "npm" as const, icon: "https://svgl.app/library/npm.svg" },
                { value: "yarn" as const, icon: "https://svgl.app/library/yarn.svg" },
                { value: "bun" as const, icon: "https://svgl.app/library/bun.svg" },
              ]).map((pm) => (
                <OptionCard
                  key={pm.value}
                  selected={config.packageManager === pm.value}
                  onClick={() => update("packageManager", pm.value)}
                  title={pm.value}
                  icon={pm.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Command output — sticky sidebar on desktop */}
        <div className="lg:sticky lg:top-[calc(3.5rem+2rem)] lg:h-fit lg:w-80">
          <div className="flex flex-col gap-4  border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Command</span>
              <CopyCommandButton command={command.replace(/\s*\\\n\s*/g, " ")} />
            </div>
            <div className="overflow-x-auto  bg-muted/70 p-4">
              <pre className="font-mono text-xs leading-relaxed text-foreground">
                {command}
              </pre>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  {config.framework === "nextjs"
                    ? "Next.js"
                    : config.framework === "vite"
                      ? "Vite"
                      : config.framework === "react-router"
                        ? "React Router"
                        : "TanStack Start"}
                </span>{" "}
                +{" "}
                <span className="font-medium text-foreground">
                  {config.docsEngine === "fumadocs"
                    ? "Fumadocs"
                    : config.docsEngine === "mintlify"
                      ? "Mintlify"
                      : config.docsEngine === "starlight"
                        ? "Starlight"
                        : "No docs"}
                </span>{" "}
                +{" "}
                <span className="font-medium text-foreground">
                  {config.starterComponents === "essentials"
                    ? "3 components"
                    : config.starterComponents === "minimal"
                      ? "1 component"
                      : "empty"}
                </span>
              </p>
              {config.framework !== "nextjs" && config.docsEngine === "fumadocs" && (
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠ Fumadocs requires Next.js — will auto-switch framework.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-muted-foreground">
          <span>
            Built by{" "}
            <a
              href="https://github.com/jal-co"
              className="text-foreground underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              jal-co
            </a>
          </span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
