import fs from "node:fs";
import path from "node:path";
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkHtmlToComponents from "@/lib/remark-html-to-components.js";
import yaml from "yaml";
import { z } from "zod";
import type { Configuration } from "@cloudcannon/configuration-types";

// Read CloudCannon config
const cloudcannonConfigPath = path.join(process.cwd(), "cloudcannon.config.yml");
const cloudcannonConfig: Configuration = yaml.parse(fs.readFileSync(cloudcannonConfigPath, "utf8"));

// ============================================================================
// Content Block Types (Auto-generated from CloudCannon config)
// ============================================================================

export type HeaderBlock = {
  _type: "header";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  introduction?: string;
  introduction_mdx?: any;
  image?: string;
  buttons?: any[];
};

export type IntroBlock = {
  _type: "intro";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  introduction?: string;
  introduction_mdx?: any;
  buttons?: any[];
};

export type CtaBlock = {
  _type: "cta";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  introduction?: string;
  introduction_mdx?: any;
  image?: string;
  image_alt?: string;
  buttons?: any[];
};

export type ImageBlockBlock = {
  _type: "image_block";
  image?: string;
  image_alt?: string;
  aspect_ratio?: string;
};

export type ImageWithContentBlock = {
  _type: "image-with-content";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  content?: string;
  content_mdx?: any;
  image?: string;
  image_alt?: string;
  layout?: string;
  size?: string;
  color?: string;
  buttons?: any[];
};

export type MixedContentBlock = {
  _type: "mixed-content";
  title?: string;
  title_mdx?: any;
  content?: string;
  content_mdx?: any;
};

export type FeatureListBlock = {
  _type: "feature_list";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  introduction?: string;
  introduction_mdx?: any;
  features?: any[];
};

export type FeaturesBlock = {
  _type: "features";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  introduction?: string;
  introduction_mdx?: any;
  features?: any[];
};

export type LogoGridBlock = {
  _type: "logo_grid";
  title?: string;
  title_mdx?: any;
  subtitle?: string;
  subtitle_mdx?: any;
  logos?: any[];
};

export type ContentBlocks = HeaderBlock | IntroBlock | CtaBlock | ImageBlockBlock | ImageWithContentBlock | MixedContentBlock | FeatureListBlock | FeaturesBlock | LogoGridBlock;

// ============================================================================
// Collection Definitions
// ============================================================================

// Extract markdown fields from _inputs configuration
const markdownFields = new Set<string>(["title", "subtitle", "introduction", "content", "summary"]);

/**
 * Process markdown fields within objects and arrays
 */
async function processMarkdownFields(obj: any, context: any, baseMeta: any): Promise<any> {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item) => processMarkdownFields(item, context, baseMeta)));
  }

  const processed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    processed[key] = value;

    if (typeof value === "string" && markdownFields.has(key)) {
      try {
        const tempDoc = {
          content: value,
          _meta: {
            ...baseMeta,
            path: `${baseMeta.path}-${key}`,
            fileName: `${key}.mdx`,
          },
        };
        processed[`${key}_mdx`] = await compileMDX(context, tempDoc, { remarkPlugins: [remarkHtmlToComponents] });
      } catch {
        processed[`${key}_mdx`] = null;
      }
    } else if (value && typeof value === "object") {
      processed[key] = await processMarkdownFields(value, context, baseMeta);
    }
  }
  return processed;
}

const pages = defineCollection({
  name: "pages",
  directory: "content/pages",
  include: "**/*.mdx",
  schema: z.object({
    _schema: z.any().optional(),
    title: z.any().optional(),
    subtitle: z.string().optional().nullish(),
    introduction: z.any().optional(),
    featured_image: z.string().optional().nullish(),
    featured_image_alt: z.string().optional().nullish(),
    published: z.boolean().optional(),
    seo_title: z.any().optional(),
    seo_description: z.any().optional(),
    content: z.string(),
  }).passthrough(),
  transform: async (document: any, context: any) => {
    const mdx = await compileMDX(context, document, { remarkPlugins: [remarkHtmlToComponents] });

    const slug = document._meta.path === "index" ? "" : document._meta.path;
    const fullSlug = "/pages/" + document._meta.path;
    
    const content_blocks = document.content_blocks && Array.isArray(document.content_blocks)
      ? await processMarkdownFields(document.content_blocks, context, document._meta)
      : document.content_blocks;

    return {
      ...document,
      slug,
      fullSlug,
      mdx,
      content_blocks,
    };
  },
});

const posts = defineCollection({
  name: "posts",
  directory: "content/blog/posts",
  include: "**/*.mdx",
  schema: z.object({
    _schema: z.any().optional(),
    title: z.any().optional(),
    subtitle: z.string().optional().nullish(),
    summary: z.string().optional().nullish(),
    date: z.coerce.date().optional(),
    author: z.string().optional().nullish(),
    featured_image: z.string().optional().nullish(),
    featured_image_alt: z.string().optional().nullish(),
    published: z.boolean().optional(),
    seo_title: z.any().optional(),
    seo_description: z.any().optional(),
    tags: z.array(z.any()).optional(),
    categories: z.array(z.any()).optional(),
    content: z.string(),
  }).passthrough(),
  transform: async (document: any, context: any) => {
    const mdx = await compileMDX(context, document, { remarkPlugins: [remarkHtmlToComponents] });

    const slug = document._meta.path === "index" ? "" : document._meta.path;
    const fullSlug = "/posts/" + document._meta.path;
    
    const content_blocks = document.content_blocks && Array.isArray(document.content_blocks)
      ? await processMarkdownFields(document.content_blocks, context, document._meta)
      : document.content_blocks;

    return {
      ...document,
      slug,
      fullSlug,
      mdx,
      content_blocks,
    };
  },
});

export default defineConfig({
  collections: [pages, posts],
});
