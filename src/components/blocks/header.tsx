import Image from "next/image";
import type { HeaderBlock } from "@/../../content-collections";
import { Section } from "@/components/content/section";
import { H1, H3, H6 } from "@/components/core/typography/typography";

export default function Header(props: HeaderBlock) {
  const block = props;
  return (
    <Section block={block} className="relative">
      <div className="relative mx-auto mt-20 max-w-7xl px-4 2xl:px-16">
        {block.title && (
          <H1
            className="mt-3 max-w-none"
            data-editable="text"
            data-prop="title"
          >
            {block.title}
          </H1>
        )}

        {block.subtitle && (
          <H3
            className="mt-8 xl:mt-12"
            data-editable="text"
            data-prop="subtitle"
          >
            {block.subtitle}
          </H3>
        )}

        {block.introduction && (
          <H6
            className="mt-8 tracking-tight"
            data-editable="text"
            data-prop="introduction"
          >
            {block.introduction}
          </H6>
        )}
      </div>
      <div className="relative mx-auto mt-8 grid max-w-7xl grid-cols-12 items-center gap-6 xl:mt-24 xl:gap-10">
        <div className="-mb-12 relative col-span-12 aspect-square overflow-clip rounded-4xl lg:aspect-30/9">
          <Image
            alt="header image"
            className=""
            data-editable="image"
            data-prop-src="image"
            fill
            src={block.image || "/header-placeholder.jpg"}
          />
        </div>
      </div>
    </Section>
  );
}
