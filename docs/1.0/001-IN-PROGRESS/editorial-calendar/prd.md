# PRD: Editorial Calendar

## Problem Statement

Content creation for audiocontrol.org is ad hoc with no schedule, no procedure, and no feedback loop from analytics to inform what to write next. This feature establishes a structured editorial calendar that tracks content through its lifecycle (idea through publication), automates post scaffolding, and wires into the automated-analytics feature to create a virtuous cycle: analytics data drives topic selection, and published post performance feeds back into planning.

## Goals

- Establish a structured content lifecycle: idea, planned, drafting, review, published
- Automate post scaffolding (directory, frontmatter, GitHub issue)
- Wire topic suggestions and performance tracking into the automated-analytics feature
- Create a virtuous cycle: measure performance, identify opportunities, plan content, publish, repeat

## Acceptance Criteria

- A markdown-based editorial calendar (`docs/editorial-calendar.md`) tracks content through stages: idea, planned, drafting, review, published
- A set of Claude Code skills (`/editorial-*`) manage the calendar: add topics, move through stages, show status — one skill per action, composed like UNIX tools
- Topic suggestions are driven by analytics data (search opportunities, content gaps, striking-distance queries from the `/analytics` skill)
- Post scaffolding is automated: creating a directory, index.md with frontmatter, and a GitHub issue from a calendar entry
- Published posts are tracked with publish date and linked to analytics performance
- A feedback loop: `/editorial-performance` can pull analytics for published posts and flag underperformers or suggest updates
- Calendar entries distinguish between analytics-suggested and manually added topics

## Out of Scope

- External tools (Notion, Google Sheets, CMS)
- Automated publishing or deployment
- Social media scheduling or cross-posting
- Multi-author workflow or approval chains
- Automated content writing or drafting

## Technical Approach

### Skills

Each editorial action is a separate Claude Code skill, composed like UNIX tools. `/editorial-help` describes how they work together.

| Skill | Phase | Description |
|-------|-------|-------------|
| `/editorial-help` | 1 | Show the editorial workflow and calendar status |
| `/editorial-add` | 1 | Add an entry to the Ideas stage |
| `/editorial-plan` | 1 | Move an entry to Planned, set target keywords |
| `/editorial-review` | 1 | Show calendar status across all stages |
| `/editorial-draft` | 2 | Scaffold blog post directory and move to Drafting |
| `/editorial-publish` | 2 | Mark entry as Published with date, close GitHub issue |
| `/editorial-suggest` | 3 | Pull analytics, identify content opportunities |
| `/editorial-performance` | 3 | Pull analytics for published posts, flag underperformers |

### Calendar Format

Structured markdown file with tables per stage. Each entry includes: title, slug, target keywords, source (manual or analytics-suggested), status, publish date, performance notes. Format is both human-readable and machine-parseable.

### Analytics Integration

- `/editorial-suggest` invokes the analytics report script from automated-analytics and parses search opportunities and content gaps
- `/editorial-performance` invokes analytics for specific published post URLs and compares against expectations
- Calendar tracks which entries are analytics-suggested vs manually added

### Dependencies

- `automated-analytics` feature — required for `suggest` and `performance` commands (Phase 3)
- `feature-image-generator` feature — optionally invoked during `draft` stage (future enhancement)
- Existing blog post conventions (BlogLayout.astro, directory structure in src/pages/blog/)

## Open Questions

- Exact markdown table format vs structured list entries — tables are more scannable, lists allow more metadata per entry
- How aggressive should `suggest` be? (List opportunities for user to pick, or auto-add to Ideas?)
- Should `/editorial draft` also invoke `/feature-image`?

## References

- GitHub Issue: oletizi/audiocontrol.org#29
- Related: oletizi/audiocontrol.org#30 (automated-analytics)
