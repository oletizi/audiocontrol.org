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

---

## Asana for SEO & Engagement

SEO and engagement tasks are tracked in Asana (not GitHub). These tasks involve community outreach, search engine optimization, analytics, and other non-code work.

**Project:** AudioControl (in the "My Company" workspace)

### Board Sections

| Section       | Purpose                                      |
| ------------- | -------------------------------------------- |
| INBOUND       | New tasks to be triaged                      |
| MILESTONES    | Weekly milestone parent tasks by workstream  |
| SCHEDULED     | Tasks planned for execution                  |
| IN PROGRESS   | Currently being worked on                    |
| COMPLETE      | Finished tasks                               |
| CANCELLED     | Tasks no longer needed                       |

### Weekly Milestones

Each workstream (SEO, Content, etc.) has a weekly milestone task in the MILESTONES section.

**Naming format:** `[Workstream] YYYY-MM-DD Milestone`

**Examples:**
- `[SEO] 2026-02-13 Milestone`
- `[Content] 2026-02-14 Milestone`

**Milestone task requirements:**
- The task description contains the goals and scope for that week's work on the workstream
- Subtasks represent discrete, assignable work packets
- Each subtask is also added to the project independently (so it appears in board views and can be scheduled/assigned)

### Subtask Naming

**Format:** `[Workstream] Short action description`

**Examples:**
- `[SEO] Set up Google Search Console`
- `[SEO] Fix homepage title tag`
- `[Content] Write blog post about S-330 MIDI implementation`

### Creating Subtasks

When creating subtasks for a milestone:

1. Create the task with the milestone as `parent`
2. Also specify `project_id` so the task appears independently in the project
3. Include a clear description of the work to be done
4. Subtasks inherit the workstream tag from their parent milestone

### Workflow

1. **Planning:** Create or update weekly milestone with description of goals
2. **Breakdown:** Create subtasks for each discrete work packet
3. **Scheduling:** Move subtasks to SCHEDULED when ready to work
4. **Execution:** Move to IN PROGRESS when starting work
5. **Completion:** Move to COMPLETE when done; mark milestone complete when all subtasks are done
