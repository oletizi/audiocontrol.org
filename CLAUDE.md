# audiocontrol.org

Astro-based static site serving as the hub for audiocontrol projects. Hosted on Netlify.

## Project Structure

```text
audiocontrol.org/
├── src/
│   ├── components/     # Reusable Astro components
│   ├── layouts/        # Page layouts
│   └── pages/          # Route pages (file-based routing)
├── public/             # Static assets (images, fonts, etc.)
├── astro.config.mjs    # Astro configuration
├── netlify.toml        # Netlify build and redirect config
├── package.json
└── tsconfig.json
```

## Core Requirements

### Security

- Never hardcode secrets (API keys, tokens, passwords) in code or config files
- Use environment variables for sensitive data
- Never commit `.env` files
- Public tracking IDs (e.g., Google Analytics) are acceptable in code

### Error Handling

Never implement fallbacks or use mock data outside of test code. Throw errors with descriptive messages instead. Fallbacks and mock data are bug factories.

### Code Quality

- TypeScript strict mode is enabled
- Prefer editing existing files over creating new ones
- Keep components focused and reusable
- Use semantic HTML for accessibility and SEO
- Files must be under 300-500 lines — refactor larger files

### Repository Hygiene

- Build artifacts go in `dist/` (gitignored)
- Netlify artifacts go in `.netlify/` (gitignored)
- Never bypass pre-commit or pre-push hooks — fix issues instead
- Never commit temporary files or build artifacts

## Astro Conventions

- Use `.astro` files for pages and components
- Use TypeScript in frontmatter
- Keep styles scoped within components when possible
- Use the `public/` directory for static assets

### Component Structure

```astro
---
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
  .component { /* scoped styles */ }
</style>
```

## URL Convention for Editors

Editors are proxied from their dedicated Netlify apps using the path convention:

```
https://audiocontrol.org/<manufacturer>/<device>/editor
```

| Editor       | URL Path              | Proxy Target                |
| ------------ | --------------------- | --------------------------- |
| Roland S-330 | `/roland/s330/editor` | `https://s330.netlify.app/` |

### Adding a New Editor

1. Add proxy redirect rules in `netlify.toml` (handle bare path, trailing slash, and splat)
2. Update sitemap in `astro.config.mjs`
3. Add project entry in `src/pages/index.astro`
4. Create blog post and/or docs page as appropriate

## Netlify Configuration

Proxy redirects in `netlify.toml`:

```toml
[[redirects]]
  from = "/manufacturer/device/editor"
  to = "https://target-app.netlify.app/"
  status = 200
  force = true
```

Always handle bare path, trailing slash, and splat (`/*`) variants.

## SEO Checklist

When adding new pages:

- Set appropriate `title` and `description` props
- Ensure proper heading hierarchy (h1, h2, h3)
- Add to sitemap if needed (check `astro.config.mjs`)
- Use semantic HTML elements

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Documentation Standards

- Don't call what you have built "production-ready"
- Never specify project management goals in temporal terms — use milestone, sprint, phase
- Never offer baseless projection statistics
- Use GitHub links (not file paths) in issue descriptions
- See [PROJECT-MANAGEMENT.md](./PROJECT-MANAGEMENT.md) for project management standards

## Critical Don'ts

- Never hardcode secrets in code or config files
- Never bypass pre-commit/pre-push hooks
- Never commit build artifacts outside gitignored directories
- Never commit `.env` files
- Never implement fallbacks or mock data outside test code
- Never add Claude attribution to git commits
- Never call builds "production-ready"
