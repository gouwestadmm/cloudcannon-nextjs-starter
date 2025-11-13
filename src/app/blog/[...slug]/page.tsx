import { allPosts } from "content-collections";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H1, H4, P } from "@/components/core/typography/typography";

type PageProps = {
  params: {
    slug: string[];
  };
};

function getPostFromParams(slug: string[]) {
  const slugClean = slug?.join("/") || "";
  const foundPost = allPosts.find((p) => p.slug === slugClean);
  return foundPost;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostFromParams(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostFromParams(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen">
      <Section
        backgroundColor={"primary"}
        paddingBottom="large"
        paddingTop="large"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-12 xl:px-24">
          {post.date && (
            <time className="mb-4 block text-muted-foreground">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          <H1 className="mb-4" data-editable="text" data-prop="title">
            {post.title}
          </H1>
          {post.summary && (
            <H4
              className="mt-8 indent-20 xl:mt-16 xl:indent-40"
              data-editable="text"
              data-prop="summary"
            >
              {post.summary}
            </H4>
          )}
          {post.author && (
            <P className="mt-4" data-editable="text" data-prop="author">
              By {post.author}
            </P>
          )}
        </div>
      </Section>

      {post.featured_image && (
        <Section paddingBottom="medium" paddingTop="none">
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                alt={post.featured_image_alt || post.title}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                src={post.featured_image}
              />
            </div>
          </div>
        </Section>
      )}

      <Section
        backgroundColor={"white"}
        paddingBottom="large"
        paddingTop="large"
      >
        <div className="mx-auto max-w-3xl px-4">
          <MdxContent
            className="markdown"
            code={post.mdx}
            data-editable="text"
            data-prop="@content"
          />
        </div>
      </Section>

      <Section
        backgroundColor="stone"
        paddingBottom="medium"
        paddingTop="medium"
      >
        <div className="mx-auto max-w-4xl px-4">
          <Link className="text-primary hover:underline" href="/blog">
            ← Back to all posts
          </Link>
        </div>
      </Section>
    </article>
  );
}

export function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
