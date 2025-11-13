import type { FeatureListBlock } from "@/../../content-collections";
import { Section } from "@/components/content/section";
import { H2, H4, P } from "@/components/core/typography/typography";

export default function FeatureList(props: FeatureListBlock) {
  const block = props;

  return (
    <Section block={block}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          {block.subtitle && (
            <H4 data-cms-bind="#subtitle">{block.subtitle}</H4>
          )}
          <H2 className="mt-2" data-cms-bind="#title">
            {block.title}
          </H2>
          {block.introduction && (
            <P className="mt-6" data-cms-bind="#introduction">
              {block.introduction}
            </P>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="mx-auto grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {block.features?.map((feature, index) => (
              <div className="flex flex-col" key={feature.name}>
                <dt className="flex items-center gap-x-3 font-semibold text-base leading-7">
                  {feature.icon && (
                    <span
                      aria-hidden="true"
                      className="size-5 flex-none"
                      data-cms-bind={`#features[${index}].icon`}
                    >
                      {feature.icon}
                    </span>
                  )}
                  <span data-cms-bind={`#features[${index}].name`}>
                    {feature.name}
                  </span>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                  <p
                    className="flex-auto"
                    data-cms-bind={`#features[${index}].description`}
                  >
                    {feature.description}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
