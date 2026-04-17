# Content Calendar

The content calendar tracks blog posts through their lifecycle from idea to publication, with analytics integration that closes the feedback loop: analytics data drives topic selection, and published post performance feeds back into planning.

## How It Works

Content moves through five stages:

```
Ideas  →  Planned  →  Drafting  →  Review  →  Published
```

Each stage is a section in `docs/editorial-calendar.md` — a markdown file with one table per stage. The file is both human-readable and machine-parseable.

### Stages

| Stage | What happens | Entry gets |
|-------|-------------|------------|
| **Ideas** | A topic is captured — manually or from analytics | slug, title, description, source |
| **Planned** | Topic is committed to — target keywords are set | target keywords |
| **Drafting** | Blog post is scaffolded, GitHub issue created | blog directory, issue number |
| **Review** | Post is written and under review | (manual stage) |
| **Published** | Post is live on the site | publish date, issue closed |

### Entry Fields

Each calendar entry tracks:

- **slug** — URL-safe identifier (e.g., `scsi-over-wifi-raspberry-pi-bridge`)
- **title** — human-readable post title
- **description** — one-line SEO description
- **targetKeywords** — SEO keywords (set during planning)
- **datePublished** — ISO date when published
- **issueNumber** — linked GitHub issue
- **source** — `manual` (human idea) or `analytics` (data-driven suggestion)

## Skills

The editorial workflow is managed through composable Claude Code skills — one per action, like UNIX tools.

### Content lifecycle

| Skill | Purpose |
|-------|---------|
| `/editorial-add "Title"` | Add an idea to the calendar |
| `/editorial-plan slug "kw1, kw2"` | Move to Planned, set target keywords |
| `/editorial-draft slug` | Scaffold blog post, create GitHub issue, move to Drafting |
| `/editorial-publish slug` | Mark as Published, close GitHub issue |

### Analytics integration

| Skill | Purpose |
|-------|---------|
| `/editorial-suggest` | Pull Search Console data, surface content opportunities |
| `/editorial-performance` | Show metrics for published posts, flag underperformers |

### Status and help

| Skill | Purpose |
|-------|---------|
| `/editorial-review` | Show calendar entries across all stages |
| `/editorial-help` | Show the workflow diagram and calendar summary |

## Typical Workflow

### Adding content manually

```
/editorial-add "SCSI Protocol Deep Dive"
/editorial-plan scsi-protocol-deep-dive "SCSI protocol, vintage hardware, SCSI commands"
/editorial-draft scsi-protocol-deep-dive
# ... write the post ...
/editorial-publish scsi-protocol-deep-dive
```

### Adding content from analytics

```
/editorial-suggest
# Review suggestions with evidence (impressions, position, CTR)
# Accept suggestions — they're added to Ideas with source: analytics
/editorial-plan selected-slug "keywords"
# ... continue as above ...
```

### Checking performance

```
/editorial-performance
# See metrics for all published posts
# Posts needing attention are flagged with specific recommendations
```

## Analytics Integration

The editorial calendar integrates with the analytics pipeline (Umami, GA4, Google Search Console):

- **`/editorial-suggest`** queries Search Console for striking-distance queries (position 5-20) and CTR opportunities (high impressions, low clicks). Suggestions include specific evidence so you can make informed decisions about what to write.

- **`/editorial-performance`** matches each published post to its metrics across all data sources and surfaces recommendations from the analytics engine (rewrite titles, boost rankings, investigate bounce rates, add CTAs).

This creates a virtuous cycle: measure what's working, identify gaps, plan new content, publish, measure again.

## File Layout

```
docs/editorial-calendar.md              # The calendar itself (markdown tables)
scripts/lib/editorial/
  types.ts                               # Stage definitions, CalendarEntry type
  calendar.ts                            # Markdown parser/writer, mutations
  scaffold.ts                            # Blog post directory/frontmatter generation
  suggest.ts                             # Analytics integration (suggestions + performance)
  index.ts                               # Barrel export
.claude/skills/editorial-*/SKILL.md      # One skill per action (8 total)
```

## Calendar Format

The calendar file (`docs/editorial-calendar.md`) uses markdown tables. Non-published stages:

```markdown
## Ideas

| Slug | Title | Description | Keywords | Source |
|------|-------|-------------|----------|--------|
| my-idea | My Post Idea | A post about things | | manual |
```

Published stage has extra columns:

```markdown
## Published

| Slug | Title | Description | Keywords | Source | Published | Issue |
|------|-------|-------------|----------|--------|-----------|-------|
| my-post | My Post | About things | kw1, kw2 | analytics | 2026-04-15 | #43 |
```

Stages with entries in Drafting or Review include an Issue column when any entry has a linked issue.
