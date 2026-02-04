# Project Management Standards

**Purpose:** Project management approach for audiocontrol.org using GitHub

---

## Overview

audiocontrol.org is a static Astro site serving as the hub for audiocontrol projects. It has a smaller scope than the main audiocontrol monorepo, but follows the same core project management principles.

### Core Principles

1. **GitHub issues for all non-trivial work**: Bug fixes, new pages, design changes
2. **Feature branches for changes**: Branch from main, PR back to main
3. **Simple milestone structure**: Weekly milestones when active development is happening

---

## Issue Tracking

### Issue Title Format

Use descriptive, action-focused titles:

| Issue Title                              | Example Use                    |
| ---------------------------------------- | ------------------------------ |
| `Add Akai S3000XL project listing`       | New project on index page      |
| `Fix navigation dropdown on mobile`      | Bug fix                        |
| `Update S-330 docs for new URL scheme`   | Documentation update           |
| `Add blog post about S3000XL editor`     | Content addition               |

### Labels

| Label           | Meaning                   |
| --------------- | ------------------------- |
| `bug`           | Something is broken       |
| `enhancement`   | New feature or content    |
| `documentation` | Documentation change      |
| `design`        | Visual/layout change      |

---

## Branch Naming

**Format:** `feature/<short-description>` or `fix/<short-description>`

**Examples:**

- `feature/s3000xl-listing`
- `fix/mobile-nav`
- `feature/blog-s3000xl`

---

## Weekly Milestones

When active development is happening, use weekly milestones:

**Format:** `Week of [Mon Date]-[Fri Date]`

For simple sites like this, milestones are optional for isolated changes. Use them when coordinating multiple related changes (e.g., adding a new editor proxy + landing page + blog post).

---

## Feature Documentation

For non-trivial features (new editor integrations, major redesigns), create a workplan:

```
docs/<feature-slug>/
├── prd.md          # What and why
└── workplan.md     # How (implementation plan with GitHub issue links)
```

For simple changes (bug fixes, copy edits, minor styling), an issue description is sufficient.

---

## Proxy Configuration for Editors

When adding a new editor to the site, the following must be coordinated:

1. **netlify.toml** — Add proxy redirect rules following the URL convention:
   ```
   /manufacturer/device/editor → target Netlify app
   ```
2. **astro.config.mjs** — Add to sitemap customPages
3. **src/pages/index.astro** — Add to projects array
4. **Blog/docs** — Create or update relevant content

### URL Convention

```
https://audiocontrol.org/<manufacturer>/<device>/editor
```

| Editor          | URL Path                  | Proxy Target                    |
| --------------- | ------------------------- | ------------------------------- |
| Roland S-330    | `/roland/s330/editor`     | `https://s330.netlify.app/`     |
| Akai S3000XL    | `/akai/s3k/editor`        | TBD                             |

---

## Linking

Use GitHub URLs (not file paths) when referencing code or documentation in issues. GitHub links are portable and accessible without a local clone.
