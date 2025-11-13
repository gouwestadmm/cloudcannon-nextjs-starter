import type { CtaBlock } from "@/../../content-collections";
import { Buttons } from "@/components/blocks/buttons";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H2 } from "@/components/core/typography/typography";

export default function Cta(props: CtaBlock) {
  return (
    <Section block={props} className="relative">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {props.title && (
            <H2 className="text-balance font-semibold text-4xl text-gray-900 tracking-tight sm:text-5xl dark:text-white">
              {props.title}
            </H2>
          )}

          {props.introduction && (
            <MdxContent
              className="mx-auto mt-6 max-w-xl text-pretty text-gray-600 text-lg/8 dark:text-gray-300"
              code={props.introduction_mdx}
              content={props.introduction}
              data-editable="text"
              data-prop="introduction"
            />
          )}

          {props.buttons && props.buttons.length > 0 && (
            <Buttons buttons={props.buttons} />
          )}
        </div>
      </div>
    </Section>
  );
}
