#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("yaml");
const matter = require("gray-matter");

// ============================================================================
// Configuration Loading
// ============================================================================

function loadCloudCannonConfig() {
  const configPath = path.join(process.cwd(), "cloudcannon.config.yml");
  return yaml.parse(fs.readFileSync(configPath, "utf8"));
}

// ============================================================================
// Utility Functions
// ============================================================================

const PASCAL_CASE_REGEX = /[-_]/;

function toPascalCase(str) {
  return str
    .split(PASCAL_CASE_REGEX)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// ============================================================================
// Input Analysis
// ============================================================================

/**
 * Extract all markdown fields from CloudCannon _inputs configuration
 */
function getMarkdownFields(config) {
  const markdownFields = new Set();
  const inputs = config._inputs || {};

  for (const [key, inputConfig] of Object.entries(inputs)) {
    if (
      typeof inputConfig === "object" &&
      inputConfig !== null &&
      (inputConfig.type === "markdown" || inputConfig.type === "textarea")
    ) {
      markdownFields.add(key);
    }
  }

  return markdownFields;
}

// ============================================================================
// Zod Schema Generation
// ============================================================================

const ZOD_TYPE_MAP = {
  checkbox: "z.boolean().optional()",
  switch: "z.boolean().optional()",
  number: "z.number().optional()",
  range: "z.number().optional()",
  date: "z.coerce.date().optional()",
  datetime: "z.coerce.date().optional()",
  time: "z.coerce.date().optional()",
  object: "z.object({}).passthrough().optional()",
  array: "z.array(z.any()).optional()",
};

/**
 * Generate Zod schema string for a CloudCannon input type
 */
function getZodSchema(_key, inputConfig) {
  if (!inputConfig?.type) {
    return "z.any().optional()";
  }

  const { type, options = {} } = inputConfig;

  // Check mapped types first
  if (ZOD_TYPE_MAP[type]) {
    return ZOD_TYPE_MAP[type];
  }

  // Handle select with enum values
  if ((type === "select" || type === "choice") && options.values?.length > 0) {
    const enumValues = options.values.map((v) => `"${v}"`).join(", ");
    return `z.enum([${enumValues}]).optional()`;
  }

  // Default to string for text, markdown, image, url, etc.
  return "z.string().optional().nullish()";
}

// ============================================================================
// Schema File Analysis
// ============================================================================

/**
 * Read schema file and extract field names
 */
function getSchemaFields(schemaPath) {
  const fullPath = path.join(process.cwd(), schemaPath);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  try {
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContent);
    return Object.keys(data);
  } catch {
    console.warn(`Warning: Could not read schema file ${schemaPath}`);
    return [];
  }
}

// ============================================================================
// TypeScript Type Generation
// ============================================================================

/**
 * Generate TypeScript type for a structure value
 */
function generateStructureType(structure, markdownFields) {
  const typeName = `${toPascalCase(structure.value._type)}Block`;
  const fields = [`  _type: "${structure.value._type}";`];

  for (const [key, value] of Object.entries(structure.value)) {
    if (key === "_type") {
      continue;
    }

    // Infer type
    let fieldType = "string";
    if (Array.isArray(value)) {
      fieldType = "any[]";
    } else if (typeof value === "object" && value !== null) {
      fieldType = "any";
    }

    fields.push(`  ${key}?: ${fieldType};`);

    // Add MDX variant if it's a markdown field
    if (markdownFields.has(key)) {
      fields.push(`  ${key}_mdx?: any;`);
    }
  }

  return `export type ${typeName} = {\n${fields.join("\n")}\n};`;
}

/**
 * Generate all structure types from config
 */
function generateStructureTypes(config) {
  const structures = config._structures || {};
  const markdownFields = getMarkdownFields(config);
  const types = [];

  // Generate types for all structures
  const structureTypesByName = new Map();

  for (const [structureName, structureConfig] of Object.entries(structures)) {
    if (!structureConfig.values) {
      continue;
    }

    const structureBlocks = [];

    for (const structure of structureConfig.values) {
      if (structure.value?._type) {
        // This is a content block with _type
        types.push(generateStructureType(structure, markdownFields));
        const typeName = `${toPascalCase(structure.value._type)}Block`;
        structureBlocks.push(typeName);
      }
    }

    // Store block types for this structure (only if it has _type blocks)
    if (structureBlocks.length > 0) {
      structureTypesByName.set(structureName, structureBlocks);
    }
  }

  // Generate union types dynamically based on structure names
  const unions = [];
  for (const [structureName, typeNames] of structureTypesByName.entries()) {
    const unionName = toPascalCase(structureName);
    unions.push(`export type ${unionName} = ${typeNames.join(" | ")};`);
  }

  return {
    types: types.join("\n\n"),
    unionTypes: unions.join("\n\n"),
  };
}

// ============================================================================
// Collection Generation
// ============================================================================

/**
 * Generate slug logic for a collection
 */
function generateSlugLogic(collectionConfig) {
  const urlPattern = collectionConfig.url;

  if (!urlPattern) {
    return "document._meta.path";
  }

  // For pages collection with [full_slug] pattern
  if (urlPattern === "[full_slug]") {
    return 'document._meta.path === "index" ? "" : document._meta.path';
  }

  // For blog posts with /blog/[slug]/ pattern
  if (urlPattern.includes("[slug]")) {
    return "document._meta.path";
  }

  return "document._meta.path";
}

/**
 * Get schema fields from first schema in collection
 */
function getFirstSchemaFields(collectionConfig) {
  if (!collectionConfig.schemas) {
    return [];
  }

  const firstSchema = Object.values(collectionConfig.schemas)[0];
  if (!firstSchema?.path) {
    return [];
  }

  return getSchemaFields(firstSchema.path);
}

/**
 * Generate schema field definitions for Zod schema
 */
function generateSchemaFieldDefs(schemaFields, config) {
  return schemaFields
    .map((key) => {
      const zodType = getZodSchema(key, config._inputs?.[key]);
      return `    ${key}: ${zodType},`;
    })
    .join("\n");
}

/**
 * Generate collection definition
 */
function generateCollection(collectionName, collectionConfig, config) {
  if (!collectionConfig.path) {
    return null;
  }

  const schemaFields = getFirstSchemaFields(collectionConfig);
  const schemaFieldDefs = generateSchemaFieldDefs(schemaFields, config);
  const slugLogic = generateSlugLogic(collectionConfig);

  return {
    name: collectionName,
    definition: `const ${collectionName} = defineCollection({
  name: "${collectionName}",
  directory: "${collectionConfig.path}",
  include: "**/*.mdx",
  schema: z.object({
${schemaFieldDefs}
    content: z.string(),
  }).passthrough(),
  transform: async (document: any, context: any) => {
    const mdx = await compileMDX(context, document);
    const slug = ${slugLogic};
    
    const content_blocks = document.content_blocks && Array.isArray(document.content_blocks)
      ? await processMarkdownFields(document.content_blocks, context, document._meta)
      : document.content_blocks;

    return {
      ...document,
      slug,
      mdx,
      content_blocks,
    };
  },
});`,
  };
}

/**
 * Generate all collections from config
 */
function generateAllCollections(config) {
  const collectionsConfig = config.collections_config || {};
  const collections = [];

  for (const [collectionName, collectionConfig] of Object.entries(
    collectionsConfig
  )) {
    // Skip data collections
    if (collectionName === "data") {
      continue;
    }

    const collection = generateCollection(
      collectionName,
      collectionConfig,
      config
    );

    if (collection) {
      collections.push(collection);
    }
  }

  return collections;
}

// ============================================================================
// Output File Generation
// ============================================================================

/**
 * Generate the complete content-collections.ts file
 */
function generateOutputFile(config) {
  const markdownFields = getMarkdownFields(config);
  const structureTypes = generateStructureTypes(config);
  const collections = generateAllCollections(config);

  const markdownFieldsList = Array.from(markdownFields)
    .map((f) => `"${f}"`)
    .join(", ");

  const collectionNames = collections.map((c) => c.name).join(", ");
  const collectionDefs = collections.map((c) => c.definition).join("\n\n");

  return `import fs from "node:fs";
import path from "node:path";
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import yaml from "yaml";
import { z } from "zod";

// Read CloudCannon config
const cloudcannonConfigPath = path.join(process.cwd(), "cloudcannon.config.yml");
const cloudcannonConfig = yaml.parse(fs.readFileSync(cloudcannonConfigPath, "utf8"));

// ============================================================================
// Content Block Types (Auto-generated from CloudCannon config)
// ============================================================================

${structureTypes.types}

${structureTypes.unionTypes}

// ============================================================================
// Collection Definitions
// ============================================================================

// Extract markdown fields from _inputs configuration
const markdownFields = new Set<string>([${markdownFieldsList}]);

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
    if (typeof value === "string" && markdownFields.has(key)) {
      try {
        const tempDoc = {
          content: value,
          _meta: {
            ...baseMeta,
            path: \`\${baseMeta.path}-\${key}\`,
            fileName: \`\${key}.mdx\`,
          },
        };

        const mdx = await compileMDX(context, tempDoc);
        processed[key] = value;
        processed[\`\${key}_mdx\`] = mdx;
      } catch {
        processed[key] = value;
        processed[\`\${key}_mdx\`] = null;
      }
    } else if (value && typeof value === "object") {
      processed[key] = await processMarkdownFields(value, context, baseMeta);
    } else {
      processed[key] = value;
    }
  }
  return processed;
}

${collectionDefs}

export default defineConfig({
  collections: [${collectionNames}],
});
`;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  try {
    const config = loadCloudCannonConfig();
    const outputContent = generateOutputFile(config);
    const outputPath = path.join(process.cwd(), "content-collections.ts");

    fs.writeFileSync(outputPath, outputContent, "utf8");

    const collections = generateAllCollections(config);
    const structureTypes = generateStructureTypes(config);
    const typeCount = structureTypes.types.split("\n\n").filter(Boolean).length;

    console.log(
      `✓ Generated content-collections.ts with ${collections.length} collection(s): ${collections.map((c) => c.name).join(", ")}`
    );
    console.log(
      `✓ Generated ${typeCount} content block types from CloudCannon config`
    );
  } catch (error) {
    console.error("Error generating content-collections.ts:", error);
    process.exit(1);
  }
}

main();
