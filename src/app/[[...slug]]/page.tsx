import { allPages } from "content-collections";
import { notFound } from "next/navigation";
import MixedContent from "@/components/blocks/mixed-content";
import { Blocks } from "@/components/content/content-blocks";

function getPageFromParams(slug) {
  const slugClean = slug?.length ? slug.join("/") : "";

  const page = allPages.find((page) => page.slug === slugClean);
  if (!page) {
    null;
  }

  return page;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const page = await getPageFromParams(slug);

  return {
    title: `${page?.title ? page.title : ""}`,
  };
}

export default async function pagePage({ params }) {
  const { slug } = await params;

  const page = await getPageFromParams(slug);

  if (!page) {
    notFound();
  }

  if (page._schema === "page-visual") {
    return <Blocks content_blocks={page.content_blocks} />;
  }

  if (page._schema === "page") {
    return (
      <article className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-12 xl:px-24">
          <MixedContent {...page} />
        </div>
      </article>
    );
  }
}

export function generateStaticParams() {
  return allPages.map((page) => ({
    slug: page.slug ? page.slug.split("/") : [],
  }));
}
