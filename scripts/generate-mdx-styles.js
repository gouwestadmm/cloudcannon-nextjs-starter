#!/usr/bin/env node

/**
 * Script to extract Tailwind classes from MDX components and generate CSS for CloudCannon editor
 *
 * This script:
 * 1. Parses the typography components to extract CVA variants and base styles
 * 2. Parses the mdx-components.tsx file to extract additional className values
 * 3. Combines these styles to generate complete CSS with @apply directives
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

  // Split into individual component definitions
  const componentMatches = content.matchAll(COMPONENT_REGEX);

  for (const match of componentMatches) {
    const [fullMatch, componentName] = match;

    // Skip if component name is too generic or capitalized (custom components)
    if (!componentName || componentName[0] === componentName[0].toUpperCase()) {
      continue;
    }

    // Try to extract className - handle different patterns
    let className = null;

    // Pattern 1: Simple className="..."
    const simpleMatch = fullMatch.match(SIMPLE_CLASS_REGEX);
    if (simpleMatch) {
      className = simpleMatch[1];
    }

    // Pattern 2: className={cn("...", ...)} - extract first string
    const cnMatch = fullMatch.match(CN_CLASS_REGEX);
    if (cnMatch) {
      className = cnMatch[1];
    }

    if (className?.trim() && className !== "") {
      // Clean up the className - remove excessive whitespace and problematic patterns
      const cleanedClassName = className
        .replace(/\s+/g, " ")
        .trim()
        // Remove complex selectors that won't work in @apply
        .replace(/\[&[^\]]*\]/g, "")
        // Remove deeply nested arbitrary values
        .replace(/\[[^\]]*\([^)]*\)[^\]]*\]/g, "")
        .trim();

      if (cleanedClassName && cleanedClassName.length > 0) {
        componentStyles[componentName] = cleanedClassName;
      }
    }
  }

  return componentStyles;
}

/**
 * Generate CSS with @apply directives for CloudCannon editor
 */
function generateCSS(componentStyles) {
  const css = `.cms-editor-active .markdown {
${Object.entries(componentStyles)
  .map(([tag, classes]) => {
    // Skip if no valid classes
    if (!classes || classes === '""' || classes === "''") {
      return null;
    }

    // Generate CSS rule
    return `  ${tag} {\n    @apply ${classes};\n  }`;
  })
  .filter(Boolean)
  .join("\n")}
}
`;

  return css;
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

    // Merge styles: typography base + mdx additions
    const componentStyles = { ...typographyStyles };

    for (const [tag, mdxClasses] of Object.entries(mdxComponentStyles)) {
      if (componentStyles[tag]) {
        // Combine typography base styles with MDX additions
        componentStyles[tag] = `${componentStyles[tag]} ${mdxClasses}`.trim();
      } else {
        // Use MDX styles only
        componentStyles[tag] = mdxClasses;
      }
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
