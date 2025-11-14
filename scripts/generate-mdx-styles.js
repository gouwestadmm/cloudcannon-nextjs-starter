#!/usr/bin/env node

/**
 * Script to extract Tailwind classes from MDX components and generate CSS for CloudCannon editor
 *
 * This script:
 * 1. Parses the typography components to extract CVA variants and base styles
 * 2. Parses the mdx-components.tsx file to extract additional className values
 * 3. Uses cn() utility (inlined) to properly merge and deduplicate classes
 * 4. Combines these styles to generate complete CSS with @apply directives
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Inline version of cn() from utils.ts
 * Merges Tailwind classes intelligently, handling conflicts and deduplication
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MDX_COMPONENTS_PATH = join(
  process.cwd(),
  "src/components/content/mdx-components.tsx"
);
const TYPOGRAPHY_PATH = join(
  process.cwd(),
  "src/components/core/typography/typography.tsx"
);
const OUTPUT_CSS_PATH = join(process.cwd(), "src/app/mdx-editor-styles.css");

// Regex patterns defined at top level for performance
const COMPONENT_REGEX =
  /(\w+):\s*\([^)]*\)\s*=>\s*(?:\([\s\S]*?\)|<[\s\S]*?>)/g;
const SIMPLE_CLASS_REGEX = /className=["'`]([^"'`]+)["'`]/;
const CN_CLASS_REGEX = /className={cn\(\s*["'`]([^"'`]+)["'`]/;
const TITLE_VARIANTS_REGEX = /const titleVariants = cva\(([\s\S]*?)\);/;
const BASE_CLASS_REGEX = /["'`]([^"'`]+)["'`]/;
const SIZE_VARIANT_REGEX = /size:\s*{([^}]+)}/;
const VARIANT_ITEM_REGEX = /(\w+):\s*["'`]([^"'`]+)["'`]/g;
const P_VARIANTS_REGEX = /const pVariants = cva\(\s*["'`]([^"'`]+)["'`]/;
const P_SIZE_DEFAULT_REGEX = /size:\s*{[^}]*default:\s*["'`]([^"'`]+)["'`]/;

/**
 * Extract CVA variants and base classes from typography components
 */
function extractTypographyStyles(content) {
  const styles = {};

  // Extract titleVariants CVA definition
  const titleVariantsMatch = content.match(TITLE_VARIANTS_REGEX);

  if (titleVariantsMatch) {
    const cvaContent = titleVariantsMatch[1];

    // Extract base classes (first string parameter)
    const baseMatch = cvaContent.match(BASE_CLASS_REGEX);
    const baseClasses = baseMatch ? baseMatch[1] : "";

    // Extract size variants
    const sizeMatch = cvaContent.match(SIZE_VARIANT_REGEX);
    if (sizeMatch) {
      const sizeContent = sizeMatch[1];
      const variantMatches = sizeContent.matchAll(VARIANT_ITEM_REGEX);

      for (const match of variantMatches) {
        const [, tag, classes] = match;
        styles[tag] = `${baseClasses} ${classes}`.trim();
      }
    }
  }

  // Extract pVariants CVA definition
  const pVariantsMatch = content.match(P_VARIANTS_REGEX);

  if (pVariantsMatch) {
    const baseClasses = pVariantsMatch[1];

    // Extract default size variant
    const sizeMatch = content.match(P_SIZE_DEFAULT_REGEX);
    if (sizeMatch) {
      const defaultSize = sizeMatch[1];
      styles.p = `${baseClasses} ${defaultSize}`.trim();
    }
  }

  return styles;
}

/**
 * Extract className values from JSX code
 * Handles both className="..." and className={cn("...", ...)} patterns
 */
function extractClassNames(content) {
  const componentStyles = {};
  const componentMatches = content.matchAll(COMPONENT_REGEX);

  for (const match of componentMatches) {
    const [fullMatch, componentName] = match;

    // Skip capitalized component names (custom components)
    if (!componentName || componentName[0] === componentName[0].toUpperCase()) {
      continue;
    }

    // Extract className from either pattern
    const className =
      fullMatch.match(SIMPLE_CLASS_REGEX)?.[1] ||
      fullMatch.match(CN_CLASS_REGEX)?.[1];

    if (className?.trim()) {
      componentStyles[componentName] = className;
    }
  }

  return componentStyles;
}

/**
 * Generate CSS with @apply directives for CloudCannon editor
 */
function generateCSS(componentStyles) {
  const rules = Object.entries(componentStyles)
    .filter(([, classes]) => classes)
    .map(([tag, classes]) => `  ${tag} {\n    @apply ${classes};\n  }`)
    .join("\n");

  return `.cms-editor-active .markdown {\n${rules}\n}\n`;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log("📖 Reading typography components...");
    const typographyContent = await readFile(TYPOGRAPHY_PATH, "utf-8");

    console.log("🔍 Extracting base styles from typography components...");
    const typographyStyles = extractTypographyStyles(typographyContent);
    console.log(
      `✅ Found typography styles for: ${Object.keys(typographyStyles).join(", ")}`
    );

    console.log("\n📖 Reading MDX components...");
    const mdxContent = await readFile(MDX_COMPONENTS_PATH, "utf-8");

    console.log(
      "🔍 Extracting additional className values from MDX components..."
    );
    const mdxComponentStyles = extractClassNames(mdxContent);

    // Merge and normalize all styles using cn()
    const componentStyles = {};
    const allTags = new Set([
      ...Object.keys(typographyStyles),
      ...Object.keys(mdxComponentStyles),
    ]);

    for (const tag of allTags) {
      const typographyClasses = typographyStyles[tag] || "";
      const mdxClasses = mdxComponentStyles[tag] || "";
      componentStyles[tag] = cn(typographyClasses, mdxClasses);
    }

    if (Object.keys(componentStyles).length === 0) {
      console.warn("⚠️  No styles found");
      return;
    }

    console.log(
      `✅ Total components with styles: ${Object.keys(componentStyles).join(", ")}`
    );

    console.log("\n📝 Generating CSS...");
    const css = generateCSS(componentStyles);

    console.log(`💾 Writing to ${OUTPUT_CSS_PATH}...`);
    await writeFile(OUTPUT_CSS_PATH, css, "utf-8");

    console.log("✨ Done! Generated CSS for CloudCannon editor.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
