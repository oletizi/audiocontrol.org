# Claude AI Agent Guidelines for audiocontrol.org

This document provides guidelines for AI agents (including Claude Code) working on the audiocontrol.org website.

## Overview

audiocontrol.org is an Astro-based static site that serves as a hub for open source audio tools, particularly web interfaces for vintage samplers and synthesizers. The site is hosted on Netlify.

## Project Structure

```text
audiocontrol.org/
├── src/
│   ├── components/     # Reusable Astro components
│   ├── layouts/        # Page layouts
│   └── pages/          # Route pages
├── public/             # Static assets (images, fonts, etc.)
├── astro.config.mjs    # Astro configuration
├── netlify.toml        # Netlify build and redirect config
├── package.json
└── tsconfig.json
```

## Core Requirements

### Security - CRITICAL

- **NEVER hardcode secrets** (API keys, tokens, passwords) in code or config files
- Use environment variables for sensitive data
- Never commit `.env` files (already in .gitignore)
- Google Analytics ID and similar public tracking IDs are acceptable in code

### Astro Conventions

- Follow standard Astro file and folder conventions
- Use `.astro` files for pages and components
- Use TypeScript for type safety
- Keep styles scoped within components when possible
- Use the `public/` directory for static assets

### Code Quality

- TypeScript strict mode is enabled
- Prefer editing existing files over creating new ones
- Keep components focused and reusable
- Use semantic HTML for accessibility and SEO

### Repository Hygiene

- Build artifacts go in `dist/` (gitignored)
- Netlify artifacts go in `.netlify/` (gitignored)
- Never bypass pre-commit or pre-push hooks - fix issues instead
- Keep commits focused and use descriptive messages

## Development Patterns

### Component Structure

```astro
---
// TypeScript frontmatter
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Default description' } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  <p>{description}</p>
</div>

<style>
  /* Scoped styles */
  .component {
    /* ... */
  }
</style>
```

### Layout Usage

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Page Title" description="Page description for SEO">
  <!-- Page content -->
</Layout>
```

### Adding New Projects

Projects are defined in `src/pages/index.astro`. To add a new project:

1. Add the project to the `projects` array
2. Set appropriate status ('available' or 'coming-soon')
3. Add proxy redirects in `netlify.toml` if needed
4. Update sitemap config in `astro.config.mjs` if proxied

## Netlify Configuration

### Proxy Redirects

Proxied apps (like /s330) are configured in `netlify.toml`:

```toml
[[redirects]]
  from = "/app-path"
  to = "https://target-app.netlify.app/"
  status = 200
  force = true
```

Remember to handle both trailing slash and non-trailing slash variants.

### Build Settings

- Build command: `npm run build`
- Publish directory: `dist`

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

## SEO Checklist

When adding new pages:

- Set appropriate `title` and `description` props
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Add to sitemap if needed (check `astro.config.mjs`)
- Use semantic HTML elements

## Critical Don'ts

❌ **NEVER hardcode secrets** (API keys, tokens, passwords)
❌ **NEVER bypass pre-commit/pre-push hooks** - fix issues instead
❌ **NEVER commit build artifacts** outside gitignored directories
❌ **NEVER commit `.env` files** or other secret-containing files

## When in Doubt

- Check existing components for patterns
- Follow Astro documentation conventions
- Prioritize simplicity and maintainability
- Ask for clarification rather than guessing
