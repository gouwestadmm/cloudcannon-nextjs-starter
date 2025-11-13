# CloudCannon + Next.js Starter

A practical Next.js starter with CloudCannon visual editing, built from 10+ years of real-world CloudCannon projects. This setup eliminates repetitive configuration work and gets you building content-rich sites faster.

## Key Features

- **CloudCannon Visual Editing** - Pre-configured editable regions and block-based page builder
- **Auto-Scaffolding** - Generates content-collections config and TypeScript types from CloudCannon schemas
- **Smart MDX Compilation** - Automatically detects and compiles markdown fields with React component support
- **Modern Stack** - React 19, Next.js App Router, Turbopack, Tailwind 4
- **Zero-Config Linting** - Ultracite (Biome preset) handles formatting and linting

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Project Structure

```
├── content/
│   ├── pages/          # Visual and content-editor pages
│   ├── posts/          # Blog posts
│   └── data/           # Site data (navigation, etc.)
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/
│   │   ├── blocks/     # Reusable content blocks
│   │   └── content/    # Content rendering components
│   └── lib/            # Utilities and component registry
├── scripts/
│   ├── generate-content-collections.js  # Auto-scaffolding script
│   └── generate-mdx-styles.js          # Editor styles generator
├── schemas/            # CloudCannon content schemas
└── cloudcannon.config.yml
```

## How It Works

### Content Collections + Auto-Scaffolding

The scaffolding script (`generate-content-collections.js`) runs automatically before dev and build:

1. Reads your CloudCannon schemas and config
2. Generates TypeScript types for all content blocks
3. Detects markdown fields and sets up automatic MDX compilation
4. Creates both `field` and `field_mdx` properties for every markdown field
5. Works recursively through nested objects and arrays

This means:

- Editors write simple markdown in CloudCannon
- Developers get React components in content
- Types stay in sync automatically
- No manual configuration needed

### Adding a New Block

1. Create a component in `src/components/blocks/`
2. Register it in `src/lib/component-registry.ts`
3. Add it to `_structures.content_blocks` in `cloudcannon.config.yml`
4. Run `pnpm run dev` - the script regenerates types automatically

### Two Page Types

- **`page-visual`** - Block-based page builder for visual editing
- **`page`** - Traditional content editor with markdown

Choose the approach that fits your content.

## Deployment

### CloudCannon

Set the `ENVIRONMENT` variable to `cloudcannon` in your CloudCannon build settings. This enables static export mode and disables image optimization.

### Vercel / Other Platforms

```bash
# For CloudCannon editing
ENVIRONMENT=cloudcannon

# For standard deployment (default)
# No environment variable needed
```

## Key Files

- `cloudcannon.config.yml` - Collections, schemas, and content blocks
- `src/lib/component-registry.ts` - React component registration
- `scripts/generate-content-collections.js` - Auto-scaffolding
- `content-collections.ts` - Generated content collections config (auto-generated)

## Stack

- [Next.js 16](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [CloudCannon](https://cloudcannon.com) - Visual CMS
- [Content Collections](https://www.content-collections.dev) - Content transformation with HMR
- [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS with fluid typography
- [Ultracite](https://ultracite.dev) - Zero-config Biome preset for linting/formatting
- [Turbopack](https://turbo.build/pack) - Fast bundler

## Learn More

- [CloudCannon Documentation](https://cloudcannon.com/documentation/)
- [Content Collections Documentation](https://www.content-collections.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Blog Post: Introducing this Starter](/blog/introducing-cloudcannon-nextjs-starter)

## License

MIT
