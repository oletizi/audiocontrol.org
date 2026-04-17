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

The Reddit integration needs a Reddit "script" app and a local credentials file.

1. Go to https://www.reddit.com/prefs/apps and click **create another app**
2. Choose type **script**
3. Set the redirect URI to `http://localhost:8080` (unused for script apps; required by the form)
4. After creation, note the **client ID** (string under the app name, next to "personal use script") and the **secret**
5. Create `~/.config/audiocontrol/reddit.json`:
   ```json
   {
     "clientId": "...",
     "clientSecret": "...",
     "username": "your-reddit-username",
     "password": "your-reddit-password",
     "userAgent": "audiocontrol.org:editorial-sync:v1 (by /u/your-reddit-username)"
   }
   ```
6. Verify with `/editorial-reddit-sync` — it should list your recent submissions and report any that matched blog posts

**Security:** the file contains your Reddit password. Keep it out of version control (gitignored by default — it lives outside the repo). Rotate the password if leaked.

**Rate limits:** Reddit allows 60 requests per minute with a User-Agent. Our skills stay well under that. Avoid running `/editorial-reddit-sync` in a tight loop.

## Curated cross-posting map

`docs/editorial-channels.json` maps topic tags to recommended distribution channels (subreddits today; room for other platforms later). Edit this file directly to add topics or update subreddits. Each entry can carry an optional `note` with community rules or submission hints.

The `/editorial-reddit-opportunities` skill reads this file, collects candidates for a post's topics, subtracts already-shared subreddits (case-insensitive comparison — `r/SynthDIY` and `/r/synthdiy` match), enriches remaining candidates with subscriber count from Reddit's API, and reports the gap.

## Analytics Integration

The editorial calendar integrates with the analytics pipeline (Umami, GA4, Google Search Console):

- **`/editorial-suggest`** queries Search Console for striking-distance queries (position 5-20) and CTR opportunities (high impressions, low clicks). Suggestions include specific evidence so you can make informed decisions about what to write.

- **`/editorial-performance`** matches each published post to its metrics across all data sources and surfaces recommendations from the analytics engine (rewrite titles, boost rankings, investigate bounce rates, add CTAs). Also breaks out per-post traffic from Reddit, YouTube, LinkedIn, and Instagram using Umami referrer data.

- **`/editorial-distribute` + `/editorial-social-review`** record where each post has been shared and show which posts still have social distribution gaps, closing the loop from published → distributed → measured.

This creates a virtuous cycle: measure what's working, identify gaps, plan new content, publish, distribute, measure again.

## File Layout

```
docs/editorial-calendar.md              # The calendar itself (markdown tables)
scripts/lib/editorial/
  types.ts                               # Stage definitions, CalendarEntry type
  calendar.ts                            # Markdown parser/writer, mutations
  scaffold.ts                            # Blog post directory/frontmatter generation
  suggest.ts                             # Analytics integration (suggestions + performance)
  index.ts                               # Barrel export
.claude/skills/editorial-*/SKILL.md      # One skill per action (10 total)
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

### Distribution section

A separate `## Distribution` section tracks where published posts have been shared:

```markdown
## Distribution

| Slug | Platform | URL | Shared | Notes |
|------|----------|-----|--------|-------|
| my-post | reddit | https://reddit.com/r/synthdiy/comments/... | 2026-04-16 | r/synthdiy |
```

Platform is one of `reddit`, `youtube`, `linkedin`, `instagram`. A post can have multiple distribution records — one per share.
