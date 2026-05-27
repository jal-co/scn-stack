import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { Package } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <>
            <Package className="h-4 w-4" />
            scn-stack
          </>
        ),
        url: "/",
      }}
      links={[
        {
          text: "GitHub",
          url: "https://github.com/jal-co/scn-stack",
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
