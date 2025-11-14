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
  const inputs = config._inputs || {};
  return new Set(
    Object.entries(inputs)
      .filter(([, cfg]) => cfg?.type === "markdown" || cfg?.type === "textarea")
      .map(([key]) => key)
  );
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
function getZodSchema(_key, inputConfig, config) {
  if (!inputConfig?.type) {
    return "z.any().optional()";
  }

  const { type, options = {} } = inputConfig;

  // Check mapped types first
  if (ZOD_TYPE_MAP[type]) {
    return ZOD_TYPE_MAP[type];
  }

  // Handle select with enum values
  if (type === "select" || type === "choice") {
    let values = options.values;

    // Resolve string reference to _select_data (CloudCannon convention)
    if (typeof values === "string" && values.startsWith("_select_data.")) {
      const selectKey = values.split(".").slice(1).join(".");
      values = config?._select_data?.[selectKey];
    }

    if (Array.isArray(values) && values.length > 0) {
      const enumValues = values.map((v) => `"${v}"`).join(", ");
      return `z.enum([${enumValues}]).optional()`;
    }
    // fallthrough to default string if we couldn't resolve values
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

    let fieldType = "string";
    if (Array.isArray(value)) {
      fieldType = "any[]";
    } else if (typeof value === "object" && value !== null) {
      fieldType = "any";
    }

    fields.push(`  ${key}?: ${fieldType};`);

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
  const structureTypesByName = new Map();

  for (const [structureName, structureConfig] of Object.entries(structures)) {
    if (!structureConfig.values) {
      continue;
    }

    const structureBlocks = structureConfig.values
      .filter((structure) => structure.value?._type)
      .map((structure) => {
        types.push(generateStructureType(structure, markdownFields));
        return `${toPascalCase(structure.value._type)}Block`;
      });

    if (structureBlocks.length > 0) {
      structureTypesByName.set(structureName, structureBlocks);
    }
  }

  const unions = Array.from(structureTypesByName.entries()).map(
    ([structureName, typeNames]) =>
      `export type ${toPascalCase(structureName)} = ${typeNames.join(" | ")};`
  );

  return {
    types: types.join("\n\n"),
    unionTypes: unions.join("\n\n"),
  };
}

// ============================================================================
// Collection Generation
// ============================================================================

/**
 * Generate slug and fullSlug computation logic for a collection
 */
function generateSlugLogic(collectionConfig) {
  const folder = collectionConfig.path?.split("/").pop() || "";
  return `
    const slug = document._meta.path === "index" ? "" : document._meta.path;
    const fullSlug = "/${folder}/" + document._meta.path;`;
}

/**
 * Get schema fields from first schema in collection
 */
function getFirstSchemaFields(collectionConfig) {
  const firstSchema = Object.values(collectionConfig.schemas || {})[0];
  return firstSchema?.path ? getSchemaFields(firstSchema.path) : [];
}

/**
 * Generate schema field definitions for Zod schema
 */
function generateSchemaFieldDefs(schemaFields, config) {
  return schemaFields
    .map(
      (key) =>
        `    ${key}: ${getZodSchema(key, config._inputs?.[key], config)},`
    )
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
    const mdx = await compileMDX(context, document, { remarkPlugins: [remarkHtmlToComponents] });
${slugLogic}
    
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
});`,
  };
}

/**
 * Generate all collections from config
 */
function generateAllCollections(config) {
  const collectionsConfig = config.collections_config || {};
  return Object.entries(collectionsConfig)
    .filter(([name]) => name !== "data")
    .map(([name, cfg]) => generateCollection(name, cfg, config))
    .filter(Boolean);
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
import remarkHtmlToComponents from "@/lib/remark-html-to-components.js";
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
    processed[key] = value;

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
        processed[\`\${key}_mdx\`] = await compileMDX(context, tempDoc, { remarkPlugins: [remarkHtmlToComponents] });
      } catch {
        processed[\`\${key}_mdx\`] = null;
      }
    } else if (value && typeof value === "object") {
      processed[key] = await processMarkdownFields(value, context, baseMeta);
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
    const outputPath = path.join(process.cwd(), "content-collections.ts");

    fs.writeFileSync(outputPath, generateOutputFile(config), "utf8");

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
