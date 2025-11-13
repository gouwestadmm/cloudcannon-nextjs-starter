import type { MixedContentBlock } from "@/../../content-collections";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H2 } from "@/components/core/typography/typography";

export default function MixedContent(props: MixedContentBlock) {
  return (
    <Section block={props} className="relative" {...props}>
      <div className="mx-auto max-w-6xl px-4 xl:px-12">
        {props.title && (
          <H2 className="" data-editable="text" data-prop="title">
            {props.title}
          </H2>
        )}
        {props.content_mdx && (
          <div className="mt-6">
            <MdxContent
              className="markdown"
              code={props.content_mdx}
              data-editable="text"
              data-prop="content"
            />
          </div>
        )}
        {props.content && (
          <div className="mt-6">
            <MdxContent
              className="markdown"
              code={props.mdx}
              data-editable="text"
              data-prop="content"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
