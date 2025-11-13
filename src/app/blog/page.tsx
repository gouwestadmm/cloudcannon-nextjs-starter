import { allPosts } from "content-collections";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/content/section";
import { H1, H4, P } from "@/components/core/typography/typography";

export const metadata = {
  title: "Blog | CloudCannon Next.js Starter",
  description: "Read our latest blog posts and articles.",
};

export default function BlogPage() {
  const posts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen">
      <Section isFirst paddingBottom="medium" paddingTop="large">
        <div className="mx-auto max-w-7xl px-4 lg:px-12 xl:px-24">
          <H1 className="mb-4">Blog</H1>
          <P className="max-w-3xl text-lg text-muted-foreground">
            Read our latest articles and updates.
          </P>
        </div>
      </Section>

      <Section paddingBottom="large" paddingTop="small">
        <div className="mx-auto max-w-7xl px-4 lg:px-12 xl:px-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {posts.map((post) => (
              <Link
                className="group flex flex-col"
                href={`/blog/${post.slug}`}
                key={post._meta.path}
              >
                {post.featured_image && (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={post.featured_image_alt || post.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={post.featured_image}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {post.date && (
                    <time className="text-sm">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  <H4 className="group-hover:underline">{post.title}</H4>
                  {post.summary && <P className="">{post.summary}</P>}
                  {post.author && <P className="text-sm">By {post.author}</P>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
