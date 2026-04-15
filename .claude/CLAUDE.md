# audiocontrol.org

Astro-based static site serving as the hub for audiocontrol projects. Hosted on Netlify.

## Session Lifecycle

### Starting a Session

1. Read the feature workplan and latest journal entry
2. Check open GitHub issues for the feature
3. Review DEVELOPMENT-NOTES.md for past session corrections
4. Report context to the user and confirm the session goal
5. Do NOT start coding until the user confirms

Use `/session-start` to automate this, or `/feature-pickup` to resume a feature.

### Ending a Session

1. Update the feature README.md status table
2. Update workplan.md (check off completed acceptance criteria)
3. Write a DEVELOPMENT-NOTES.md entry (see template below)
4. Comment on or close GitHub issues as appropriate
5. Commit all documentation changes

Use `/session-end` to automate this.

### Project Management

See [PROJECT-MANAGEMENT.md](../PROJECT-MANAGEMENT.md) for standards. Use `/feature-help` to see the full feature lifecycle.

Feature documentation lives in `docs/1.0/<status>/<slug>/`:
- `001-IN-PROGRESS/` — active development
- `003-COMPLETE/` — merged and shipped

Each feature directory contains: `prd.md`, `workplan.md`, `README.md`, and optionally `implementation-summary.md`.

### Before Committing — Review Checklist

- [ ] Workplan updated with completed acceptance criteria?
- [ ] Could this task have been delegated to a sub-agent?
- [ ] No ad-hoc test infrastructure left behind?
- [ ] No fabricated claims (all data verified from source)?
- [ ] Documentation updated if behavior changed?
- [ ] No secrets, `.env` files, or build artifacts staged?
- [ ] Commit message is descriptive and has no Claude attribution?

## Sub-Agent Delegation

Delegate tasks to specialized agents when appropriate:

| Task Type | Agent |
|-----------|-------|
| Feature planning, PRD creation, branch/worktree setup | project-orchestrator |
| Implementation delegation, workplan tracking, PR delivery | feature-orchestrator |
| Code quality review, best practices | code-reviewer |
| Feature docs, blog content, SEO content | documentation-engineer |
| TypeScript logic, Astro component code | typescript-pro |
| Codebase health, DRY violations, guideline adherence | codebase-auditor |
| Site structure, component design | architect-reviewer |

Always instruct agents to **use the Write/Edit tool to persist all changes to disk**.

## Project Structure

```text
audiocontrol.org/
├── src/
│   ├── components/     # Reusable Astro components
│   ├── layouts/        # Page layouts
│   └── pages/          # Route pages (file-based routing)
├── public/             # Static assets (images, fonts, etc.)
├── docs/               # Feature documentation (PRDs, workplans)
├── test/               # Test files (integration, e2e)
├── scripts/            # Build/utility scripts
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
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test               # Run unit tests (vitest)
npm run test:integration  # Run integration tests
npm run test:e2e       # Run e2e tests (playwright)
```

## Documentation Standards

- Don't call what you have built "production-ready"
- Never specify project management goals in temporal terms — use milestone, sprint, phase
- Never offer baseless projection statistics
- Use GitHub links (not file paths) in issue descriptions
- Do not embed editorial text in generated feature images or OG images; generated text is not editable. Keep text in page content or HTML/CSS overlays instead.
- See [PROJECT-MANAGEMENT.md](../PROJECT-MANAGEMENT.md) for project management standards

## Development Journal Format

Each session gets an entry in `DEVELOPMENT-NOTES.md`:

```markdown
## YYYY-MM-DD: [Session Title]
### Feature: [feature-slug]
### Worktree: audiocontrol.org-[slug]

**Goal:** [What we set out to do]

**Accomplished:**
- [What was done]

**Didn't Work:**
- [What failed and why]

**Course Corrections:**
- [PROCESS] [Description of correction]
- [UX] [Description of correction]
- [COMPLEXITY] [Description of correction]

**Quantitative:**
- Messages: ~N
- Commits: N
- Corrections: N

**Insights:**
- [What was learned]
```

## Critical Don'ts

- Never hardcode secrets in code or config files
- Never bypass pre-commit/pre-push hooks
- Never commit build artifacts outside gitignored directories
- Never commit `.env` files
- Never implement fallbacks or mock data outside test code
- Never add Claude attribution to git commits or PR descriptions
- Never call builds "production-ready"
