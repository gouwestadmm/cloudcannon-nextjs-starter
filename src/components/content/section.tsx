import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const HEADING_REGEX = /(?:^|\n)##\s+([^\n]+)|(?:^|\n)###\s+([^\n]+)/;
const HASH_PREFIX_REGEX = /(#+\s+)/;

export const sectionConfig = {
  paddingTop: {
    none: "pt-0",
    small: "pt-4 md:pt-6 lg:pt-8",
    medium: "pt-6 md:pt-8 lg:pt-12",
    large: "pt-8 md:pt-12 lg:pt-28",
  },
  paddingBottom: {
    none: "pb-0",
    small: "pb-4 md:pb-6 lg:pb-8",
    medium: "pb-6 md:pb-8 lg:pb-12",
    large: "pb-8 md:pb-12 lg:pb-28",
  },
  width: {
    full: "w-full",
    container: "max-w-8xl mx-auto",
  },
  backgroundColor: {
    transparent: "bg-transparent",
    white: "bg-white",
    stone: "bg-stone-50",
    slate: "bg-slate-100",
    neutral: "bg-neutral-100",
    primary: "bg-cyan-50",
    secondary: "bg-pink-50",
    accent: "bg-amber-50",
  },
  isFirst: {
    true: "pt-12 md:pt-16 lg:pt-80",
    false: "",
  },
};

const sectionVariants = cva("relative", {
  variants: sectionConfig,
  defaultVariants: {
    paddingTop: "medium",
    paddingBottom: "medium",
    width: "full",
    backgroundColor: "stone",
  },
});

type SectionVariantProps = VariantProps<typeof sectionVariants>;

export type BlockData = {
  type?: string;
  section?: {
    background_color?:
      | "transparent"
      | "white"
      | "stone"
      | "slate"
      | "neutral"
      | "primary"
      | "secondary"
      | "accent";
    background_image?: string;
    padding_top?: "none" | "small" | "medium" | "large";
    padding_bottom?: "none" | "small" | "medium" | "large";
  };
  title?: string;
  contentMarkdown?: string;
};

export type SectionProps = SectionVariantProps & {
  className?: string;
  as?: React.ElementType;
  backgroundImage?: string;
  children: React.ReactNode;
  isFirst?: boolean;
  id?: string;
  block?: BlockData;
  "data-editable"?: string;
  "data-id"?: string;
};

const formatId = (titleText: string | null): string => {
  if (!titleText) {
    return "";
  }

  return titleText
    .trim()
    .replace(/\n/g, "")
    .replace(HASH_PREFIX_REGEX, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getTitle = (block?: BlockData): string | null => {
  if (!block) {
    return null;
  }
  const markdownTitle = block?.contentMarkdown?.match(HEADING_REGEX);
  return (
    block?.title ||
    (markdownTitle ? markdownTitle[1] || markdownTitle[2] : null)
  );
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      paddingTop = "medium",
      paddingBottom = "medium",
      backgroundColor,
      as: Component = "section",
      backgroundImage,
      children,
      block,
      id,
      ...props
    },
    ref
  ) => {
    const title = getTitle(block);
    const generatedId = id ?? (title ? formatId(title) : undefined);

    return (
      <Component
        className={cn(
          sectionVariants({
            paddingTop: block?.section?.padding_top || paddingTop,
            paddingBottom: block?.section?.padding_bottom || paddingBottom,
            backgroundColor:
              block?.section?.background_color || backgroundColor,
            className,
          })
        )}
        id={generatedId}
        ref={ref}
      >
        <div className="relative z-10">{children}</div>
      </Component>
    );
  }
);

Section.displayName = "Section";
