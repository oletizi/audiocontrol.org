# Content Calendar

The content calendar tracks blog posts through their lifecycle from idea to publication, with analytics integration that closes the feedback loop: analytics data drives topic selection, and published post performance feeds back into planning.

## How It Works

Content moves through five stages:

```
Ideas  →  Planned  →  Drafting  →  Review  →  Published
```

Each stage is a section in `docs/editorial-calendar-<site>.md` — a markdown file with one table per stage. The file is both human-readable and machine-parseable. Each site in the repo (`audiocontrol`, `editorialcontrol`) has its own calendar.

## Multi-site: the `--site` parameter

Every `/editorial-*` skill and every library function that touches disk takes a site parameter:

- **Default**: `audiocontrol`. Invocations without `--site` behave the same as before the multi-site split. Every historical pattern keeps working.
- **Explicit**: pass `--site=editorialcontrol` (or the audiocontrol variant) to target the other site.
- **Unknown values error** with the list of valid sites. No silent fallback.

Each site has its own data files:

| Site | Calendar | Channels |
|------|----------|----------|
| `audiocontrol` | `docs/editorial-calendar-audiocontrol.md` | `docs/editorial-channels-audiocontrol.json` |
| `editorialcontrol` | `docs/editorial-calendar-editorialcontrol.md` | `docs/editorial-channels-editorialcontrol.json` |

Blog posts live under `src/sites/<site>/pages/blog/<slug>/`. Library functions are `readCalendar(rootDir, site)`, `writeCalendar(rootDir, site, cal)`, `readChannels(rootDir, site)`, etc.

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

Every skill accepts an optional `--site <slug>` (default `audiocontrol`).

| Skill | Purpose |
|-------|---------|
| `/editorial-add "Title"` | Add an idea to the calendar |
| `/editorial-plan slug "kw1, kw2"` | Move to Planned, set target keywords |
| `/editorial-draft slug` | Scaffold blog post at `src/sites/<site>/pages/blog/<slug>/`, create GitHub issue, move to Drafting |
| `/editorial-publish slug` | Mark as Published, close GitHub issue |

### Analytics integration

| Skill | Purpose |
|-------|---------|
| `/editorial-suggest` | Pull Search Console data, surface content opportunities |
| `/editorial-performance` | Show metrics and social referrals for published posts, flag underperformers |

### Social distribution

| Skill | Purpose |
|-------|---------|
| `/editorial-distribute` | Record that a published post was shared on Reddit / YouTube / LinkedIn / Instagram (captures sub-channel e.g. subreddit) |
| `/editorial-social-review` | Matrix of published posts vs platforms — subreddit count for the Reddit column |

### Reddit cross-posting

| Skill | Purpose |
|-------|---------|
| `/editorial-reddit-sync` | Pull recent Reddit submissions via the API and upsert DistributionRecords automatically |
| `/editorial-reddit-opportunities <slug>` | Show which subreddits a post has already been shared to (don't duplicate) and unshared candidates enriched with live metadata |

Reddit credentials live at `~/.config/audiocontrol/reddit.json`. See [Reddit Setup](#reddit-setup) below.

### Status and help

| Skill | Purpose |
|-------|---------|
| `/editorial-status` | Show calendar entries across all stages |
| `/editorial-help` | Show the workflow diagram and calendar summary |

## Typical Workflow

### Adding content manually

Default (audiocontrol):

```
/editorial-add "SCSI Protocol Deep Dive"
/editorial-plan scsi-protocol-deep-dive "SCSI protocol, vintage hardware, SCSI commands"
/editorial-draft scsi-protocol-deep-dive
# ... write the post ...
/editorial-publish scsi-protocol-deep-dive
```

Explicit site:

```
/editorial-add --site=editorialcontrol "Agents as Workflow Primitives"
/editorial-plan --site=editorialcontrol agents-as-workflow-primitives "agent workflow, content marketing automation"
/editorial-draft --site=editorialcontrol agents-as-workflow-primitives
# ... write the post ...
/editorial-publish --site=editorialcontrol agents-as-workflow-primitives
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

### Cross-posting to Reddit without duplicating

```
/editorial-reddit-sync
# Pulls your recent Reddit submissions, matches them to blog posts by URL,
# and upserts DistributionRecords automatically. Run this before the
# opportunities skill to make sure it has a current view.

/editorial-reddit-opportunities claude-vs-codex-claude-perspective
# Shows: "Already shared to: r/ClaudeAI (2026-04-15) — DO NOT DUPLICATE"
# Then: unshared candidates with subscriber counts and self-promo hints
```

## Reddit Setup

One-line config file — no Reddit app, no OAuth, no credentials.

Create `~/.config/audiocontrol/reddit.json`:

```json
{ "username": "your-reddit-username" }
```

That's it. Run `/editorial-reddit-sync` — it reads your public submissions via Reddit's `.json` endpoints using a User-Agent derived from your username.

**Why no auth?** Reddit's public data (your submissions, subreddit metadata) is accessible without OAuth by appending `.json` to any reddit.com URL. For periodic personal sync this works great and eliminates the password/2FA/app-registration friction of OAuth.

**Rate limits:** unauthenticated requests are limited to roughly 10/min. A full sync of your submissions is ~1-3 requests; keep sync frequency to hourly or less. If you start running into 429s, we can switch to OAuth — but probably you won't.

**What's not available:** posting, voting, private drafts, saved items. Reading public subreddits and a user's public submissions is all this tool needs.

## Curated cross-posting map

`docs/editorial-channels-<site>.json` maps topic tags to recommended distribution channels (subreddits today; room for other platforms later) for that site. Edit the file directly to add topics or update subreddits. Each entry can carry an optional `note` with community rules or submission hints.

The `/editorial-reddit-opportunities` skill reads the site's channels file, collects candidates for a post's topics, subtracts already-shared subreddits (case-insensitive comparison — `r/SynthDIY` and `/r/synthdiy` match), enriches remaining candidates with subscriber count from Reddit's API, and reports the gap.

## Analytics Integration

The editorial calendar integrates with the analytics pipeline (Umami, GA4, Google Search Console):

- **`/editorial-suggest`** queries Search Console for striking-distance queries (position 5-20) and CTR opportunities (high impressions, low clicks). Suggestions include specific evidence so you can make informed decisions about what to write.

- **`/editorial-performance`** matches each published post to its metrics across all data sources and surfaces recommendations from the analytics engine (rewrite titles, boost rankings, investigate bounce rates, add CTAs). Also breaks out per-post traffic from Reddit, YouTube, LinkedIn, and Instagram using Umami referrer data.

- **`/editorial-distribute` + `/editorial-social-review`** record where each post has been shared and show which posts still have social distribution gaps, closing the loop from published → distributed → measured.

This creates a virtuous cycle: measure what's working, identify gaps, plan new content, publish, distribute, measure again.

## File Layout

```
docs/editorial-calendar-audiocontrol.md        # audiocontrol's calendar
docs/editorial-calendar-editorialcontrol.md    # editorialcontrol's calendar
docs/editorial-channels-audiocontrol.json      # audiocontrol's curated subreddit map
docs/editorial-channels-editorialcontrol.json  # editorialcontrol's curated subreddit map
scripts/lib/editorial/
  types.ts                                      # Stage definitions, CalendarEntry, Site, assertSite
  calendar.ts                                   # Markdown parser/writer, mutations (takes Site)
  channels.ts                                   # Channels file loader (takes Site)
  crosslinks.ts                                 # Cross-link audit (takes Site)
  scaffold.ts                                   # Blog post directory/frontmatter generation (takes Site)
  suggest.ts                                    # Analytics integration (suggestions + performance)
  index.ts                                      # Barrel export
.claude/skills/editorial-*/SKILL.md             # One skill per action
```

## Calendar Format

Each site's calendar file (`docs/editorial-calendar-<site>.md`) uses markdown tables. Non-published stages:

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

### Distribution section

A separate `## Distribution` section tracks where published posts have been shared:

```markdown
## Distribution

| Slug | Platform | URL | Shared | Notes |
|------|----------|-----|--------|-------|
| my-post | reddit | https://reddit.com/r/synthdiy/comments/... | 2026-04-16 | r/synthdiy |
```

Platform is one of `reddit`, `youtube`, `linkedin`, `instagram`. A post can have multiple distribution records — one per share.
