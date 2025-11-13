import { Check } from "lucide-react";
import type { FeaturesBlock } from "@/../../content-collections";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H2, H4, P } from "@/components/core/typography/typography";

export default function Features(props: FeaturesBlock) {
  const block = props;

  return (
    <Section block={block} className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-12 xl:px-12">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2">
            {block.subtitle && (
              <H4
                className="font-semibold text-base leading-7"
                data-editable="text"
                data-prop="subtitle"
              >
                {block.subtitle}
              </H4>
            )}

            {block.title && (
              <H2
                className="mt-2 text-pretty"
                data-editable="text"
                data-prop="title"
              >
                {block.title}
              </H2>
            )}

            {block.introduction_mdx ? (
              <MdxContent
                className="prose prose-lg mt-6 max-w-none"
                code={block.introduction_mdx}
                content={block.introduction}
                data-editable="text"
                data-prop="introduction"
              />
            ) : (
              block.introduction && (
                <P
                  className="mt-6 text-base leading-7"
                  data-editable="text"
                  data-prop="introduction"
                >
                  {block.introduction}
                </P>
              )
            )}
          </div>

          {block.features && block.features.length > 0 && (
            <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 sm:grid-cols-2 lg:gap-y-16">
              {block.features.map((feature) => (
                <div className="relative pl-9" key={feature.name}>
                  <dt className="font-semibold">
                    <Check
                      aria-hidden="true"
                      className="absolute top-1 left-0 size-5 text-blue-600"
                    />
                    <span
                      data-editable="text"
                      data-prop={`features.${block.features?.indexOf(feature)}.name`}
                    >
                      {feature.name}
                    </span>
                  </dt>
                  <dd
                    className="mt-2 text-gray-600"
                    data-editable="text"
                    data-prop={`features.${block.features?.indexOf(feature)}.description`}
                  >
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Section>
  );
}
