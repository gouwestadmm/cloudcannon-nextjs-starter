import Link from "next/link";
import type { IntroBlock } from "@/../../content-collections";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H2, H4 } from "@/components/core/typography/typography";
import { Button } from "@/components/ui/button";

export default function Intro({
  isFirst,
  ...block
}: IntroBlock & { isFirst?: boolean }) {
  return (
    <Section
      block={block}
      className="relative max-w-dvw overflow-clip"
      isFirst={isFirst}
    >
      <div className="mx-auto max-w-6xl px-4 xl:px-12">
        <div className="max-w-3xl">
          {block.title && (
            <H2 as="h2" data-editable="text" data-prop="title">
              {block.title}
            </H2>
          )}

          {block.subtitle && (
            <H4 className="mt-5" data-editable="text" data-prop="subtitle">
              {block.subtitle}
            </H4>
          )}
        </div>

        <div className="relative mt-6 text-left xl:mt-12 xl:ml-28">
          {/* Use introduction_mdx if available (compiled markdown with component support), fallback to animated text */}
          {block.introduction_mdx && (
            <MdxContent
              className="prose prose-lg relative z-10 max-w-4xl text-pretty"
              code={block.introduction_mdx}
            />
          )}
          {block.buttons && (
            <div className="mt-8 flex flex-wrap gap-8 xl:mt-12">
              {block.buttons.map((button, i) => (
                <Link href={button.link} key={button.link || i}>
                  <Button
                    size={button.style.size}
                    variant={button.style.variant}
                  >
                    {button.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
