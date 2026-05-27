import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.body;
  const toc = page.data.toc;

  return (
    <div className="mx-auto flex w-full items-start gap-14 px-6 py-10 md:px-10">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-6">
          {/* Title + description */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {page.data.title}
            </h1>
            {page.data.description && (
              <p className="text-xl leading-relaxed text-muted-foreground">
                {page.data.description}
              </p>
            )}
          </div>

          {/* MDX content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h2:text-xl prose-h2:font-semibold prose-h2:tracking-tight prose-h3:text-lg prose-h3:font-medium prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
            <MDX components={mdxComponents} />
          </div>
        </div>
      </div>

      {/* Table of contents */}
      {toc && toc.length > 0 && (
        <aside className="sticky top-24 hidden w-56 shrink-0 xl:block">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On This Page
            </p>
            <div className="flex flex-col gap-2 border-l border-border/40 pl-4">
              {toc.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  className="line-clamp-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  style={{
                    paddingLeft: (item.depth - 2) * 12,
                  }}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
