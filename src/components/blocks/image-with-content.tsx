import { cva } from "class-variance-authority";
import Image from "next/image";
import type { ImageWithContentBlock } from "@/../../content-collections";
import { Buttons } from "@/components/blocks/buttons";
import { MdxContent } from "@/components/content/mdx-content";
import { Section } from "@/components/content/section";
import { H3, H6 } from "@/components/core/typography/typography";
import { cn } from "@/lib/utils";

const variants = cva("", {
  variants: {
    size: {
      small: "aspect-[16/9]",
      medium: "aspect-[4/3]",
      large: "aspect-square",
      extra_large: "aspect-[10/12]",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const layoutConfig = {
  image_left: {
    image: {
      classes: "col-start-1 col-end-8",
      zIndex: "relative",
    },
    content: {
      classes: "col-start-7 col-end-13",
      zIndex: "relative z-10",
      spacing: "mb-8",
      margins: "",
    },
  },
  image_right: {
    image: {
      classes: "col-start-6 col-end-13",
      zIndex: "relative z-10",
    },
    content: {
      classes: "col-start-1 col-end-7",
      zIndex: "lg:z-20",
      spacing: "-mt-5 mb-8",
      margins: "ml-auto mr-0",
    },
  },
};

// Color configuration for cards
const colorConfig = {
  dark: {
    card: "bg-primary-800 text-white",
    title: "text-primary-500",
    subtitle: "text-secondary",
  },
  light: {
    card: "bg-white",
    title: "text-primary-950",
    subtitle: "text-primary-950",
  },
};

// Extracted Image Component
const ImageBlock = ({
  block,
  config,
  size,
}: {
  block: ImageWithContentBlock;
  config: (typeof layoutConfig)["image_left"];
  size: "small" | "medium" | "large" | "extra_large";
}) => (
  <div
    className={cn(
      `${config.image.zIndex} ${config.image.classes} row-start-1 overflow-hidden rounded-2xl`,
      variants({ size })
    )}
  >
    {block?.image && (
      <Image
        alt="GM"
        className="h-full w-full object-cover object-center"
        data-editable="image"
        data-prop-src="image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        src={block.image || "/images/placeholder.png"}
      />
    )}
  </div>
);

// Extracted Content Component
const ContentBlock = ({
  block,
  config,
  color = "light",
}: {
  block: ImageWithContentBlock;
  config: (typeof layoutConfig)["image_left"];
  color?: "light" | "dark";
}) => {
  const colorSettings =
    colorConfig[color as keyof typeof colorConfig] || colorConfig.light;

  return (
    <div
      className={cn(
        `${config.content.classes} row-start-1 ${config.content.spacing} ${config.content.margins}`,
        config.content.zIndex,
        "max-w-lg self-end rounded-xl p-8 xl:px-12 xl:py-20",
        colorSettings.card,
        config === layoutConfig.image_right &&
          "rounded-b-xl pt-16 lg:rounded-t-xl"
      )}
    >
      {block?.title && (
        <H3
          className={cn("", colorSettings.title)}
          data-editable="text"
          data-prop="title"
        >
          {block.title}
        </H3>
      )}
      {block?.subtitle && (
        <H6
          className={cn("mt-2", colorSettings.subtitle)}
          data-editable="text"
          data-prop="subtitle"
        >
          {block.subtitle}
        </H6>
      )}

      {block?.content_mdx && (
        <MdxContent
          className="mt-6"
          code={block.content_mdx}
          data-editable="text"
          data-prop="content"
        />
      )}
      {block?.buttons && <Buttons buttons={block.buttons} />}
    </div>
  );
};

export const ImageWithContent = ({
  isFirst,
  ...block
}: ImageWithContentBlock & { isFirst?: boolean }) => {
  const order = block.order || block.layout || "image_left";
  const size = (block.size || "medium") as
    | "small"
    | "medium"
    | "large"
    | "extra_large";
  const color = (block.color || "light") as "light" | "dark";
  const config =
    layoutConfig[order as keyof typeof layoutConfig] || layoutConfig.image_left;

  return (
    <Section block={block} isFirst={isFirst}>
      <div className="mx-auto max-w-7xl gap-8 lg:grid lg:grid-cols-12">
        <ImageBlock block={block} config={config} size={size} />
        <ContentBlock block={block} color={color} config={config} />
      </div>
    </Section>
  );
};

export default ImageWithContent;
