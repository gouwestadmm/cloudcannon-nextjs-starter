#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  type CollectionConfig,
  type Configuration,
  ConfigurationSchema,
  InputSchema,
  type StructureValue,
} from "@cloudcannon/configuration-types";
import matter from "gray-matter";
import yaml from "yaml";

// ============================================================================
// Configuration Loading
// ============================================================================

function loadCloudCannonConfig(): Configuration {
  const configPath = path.join(process.cwd(), "cloudcannon.config.yml");
  const rawConfig = yaml.parse(fs.readFileSync(configPath, "utf8"));

  // Validate against official CloudCannon schema
  const result = ConfigurationSchema.passthrough().safeParse(rawConfig);
  if (!result.success) {
    console.warn("Warning: Configuration validation found some issues:");
    console.warn(result.error.format());
    console.warn("\nProceeding with the configuration anyway...\n");
    // Return raw config as fallback, cast to Configuration type
    return rawConfig as Configuration;
  }

  return result.data;
}

// ============================================================================
// Utility Functions
// ============================================================================

const PASCAL_CASE_REGEX = /[-_]/;

function toPascalCase(str: string): string {
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
function getMarkdownFields(config: Configuration): Set<string> {
  const inputs = config._inputs || {};
  return new Set(
    Object.entries(inputs)
      .filter(([, cfg]) => {
        // Handle raw config that might not validate perfectly
        if (!cfg || typeof cfg !== "object") {
          return false;
        }

        // Check if it has a type property that indicates markdown or textarea
        const hasType = "type" in cfg;
        if (!hasType) {
          return false;
        }

        const type = (cfg as { type: unknown }).type;
        return type === "markdown" || type === "textarea";
      })
      .map(([key]) => key)
  );
}

// ============================================================================
// Zod Schema Generation
// ============================================================================

/**
 * Map of CloudCannon input types to their corresponding Zod schema strings
 */
const INPUT_TYPE_TO_ZOD: Record<string, string> = {
  checkbox: "z.boolean().optional()",
  number: "z.number().optional()",
  range: "z.number().optional()",
  date: "z.coerce.date().optional()",
  datetime: "z.coerce.date().optional()",
  time: "z.coerce.date().optional()",
  object: "z.object({}).passthrough().optional()",
  array: "z.array(z.any()).optional()",
};

/**
 * Handle select/choice input types with enum values
 */
function getSelectZodSchema(
  input: unknown,
  config: Configuration
): string | null {
  const options =
    input && typeof input === "object" && "options" in input
      ? input.options
      : undefined;
  let values =
    options && typeof options === "object" && "values" in options
      ? options.values
      : undefined;

  // Resolve string reference to _select_data (CloudCannon convention)
  if (typeof values === "string" && values.startsWith("_select_data.")) {
    const selectKey = values.split(".").slice(1).join(".");
    values = config?._select_data?.[selectKey];
  }

  if (Array.isArray(values) && values.length > 0) {
    const enumValues = values.map((v: unknown) => `"${String(v)}"`).join(", ");
    return `z.enum([${enumValues}]).optional()`;
  }

  return null;
}

/**
 * Generate Zod schema string for a CloudCannon input type
 * Uses official CloudCannon input type definitions
 */
function getZodSchema(
  _key: string,
  inputConfig: unknown,
  config: Configuration
): string {
  const parsed = InputSchema.safeParse(inputConfig);

  if (!parsed.success) {
    return "z.any().optional()";
  }

  const data = parsed.data;

  if (!("type" in data)) {
    return "z.any().optional()";
  }

  const type = data.type;

  // Check if we have a direct mapping
  if (type in INPUT_TYPE_TO_ZOD) {
    return INPUT_TYPE_TO_ZOD[type];
  }

  // Handle select/choice with enum values
  if (type === "select" || type === "choice") {
    return (
      getSelectZodSchema(data, config) || "z.string().optional().nullish()"
    );
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
function getSchemaFields(schemaPath: string): string[] {
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
function generateStructureType(
  structure: StructureValue,
  markdownFields: Set<string>
): string {
  const value = structure.value as Record<string, unknown>;
  const typeName = `${toPascalCase(String(value._type))}Block`;
  const fields = [`  _type: "${String(value._type)}";`];

  for (const [key, fieldValue] of Object.entries(value)) {
    if (key === "_type") {
      continue;
    }

    let fieldType = "string";
    if (Array.isArray(fieldValue)) {
      fieldType = "any[]";
    } else if (typeof fieldValue === "object" && fieldValue !== null) {
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
function generateStructureTypes(config: Configuration): {
  types: string;
  unionTypes: string;
} {
  const structures = config._structures || {};
  const markdownFields = getMarkdownFields(config);
  const types: string[] = [];
  const structureTypesByName = new Map<string, string[]>();

  for (const [structureName, structureConfig] of Object.entries(structures)) {
    // Type guard to check if structureConfig has values property
    if (
      !structureConfig ||
      typeof structureConfig !== "object" ||
      !("values" in structureConfig)
    ) {
      continue;
    }

    const values = structureConfig.values;
    if (!Array.isArray(values)) {
      continue;
    }

    const structureBlocks = values
      .filter(
        (structure): structure is StructureValue =>
          structure?.value !== undefined &&
          typeof structure.value === "object" &&
          structure.value !== null &&
          "_type" in structure.value
      )
      .map((structure) => {
        types.push(generateStructureType(structure, markdownFields));
        const value = structure.value as Record<string, unknown>;
        return `${toPascalCase(String(value._type))}Block`;
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
function generateSlugLogic(collectionConfig: CollectionConfig): string {
  const folder = collectionConfig.path?.split("/").pop() || "";
  return `
    const slug = document._meta.path === "index" ? "" : document._meta.path;
    const fullSlug = "/${folder}/" + document._meta.path;`;
}

/**
 * Get schema fields from first schema in collection
 */
function getFirstSchemaFields(collectionConfig: CollectionConfig): string[] {
  const schemas = collectionConfig.schemas;
  if (!schemas || typeof schemas !== "object") {
    return [];
  }

  const firstSchema = Object.values(schemas)[0];
  if (!firstSchema || typeof firstSchema !== "object") {
    return [];
  }

  return "path" in firstSchema && typeof firstSchema.path === "string"
    ? getSchemaFields(firstSchema.path)
    : [];
}

/**
 * Generate schema field definitions for Zod schema
 */
function generateSchemaFieldDefs(
  schemaFields: string[],
  config: Configuration
): string {
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
function generateCollection(
  collectionName: string,
  collectionConfig: CollectionConfig,
  config: Configuration
): { name: string; definition: string } | null {
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
function generateAllCollections(
  config: Configuration
): Array<{ name: string; definition: string }> {
  const collectionsConfig = config.collections_config || {};
  return Object.entries(collectionsConfig)
    .filter(([name]) => name !== "data")
    .map(([name, cfg]) => generateCollection(name, cfg, config))
    .filter((c): c is { name: string; definition: string } => c !== null);
}

// ============================================================================
// Output File Generation
// ============================================================================

/**
 * Generate the complete content-collections.ts file
 */
function generateOutputFile(config: Configuration): string {
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
import type { Configuration } from "@cloudcannon/configuration-types";

// Read CloudCannon config
const cloudcannonConfigPath = path.join(process.cwd(), "cloudcannon.config.yml");
const cloudcannonConfig: Configuration = yaml.parse(fs.readFileSync(cloudcannonConfigPath, "utf8"));

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
