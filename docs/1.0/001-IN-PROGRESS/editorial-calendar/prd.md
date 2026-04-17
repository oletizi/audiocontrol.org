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

## In Scope (Phase 4 addition)

- **Social distribution tracking**: recording where published posts have been shared (Reddit, YouTube, LinkedIn, Instagram) and surfacing that data in the calendar
- **Social referral analytics**: reporting how much traffic each post receives from each social platform, derived from Umami/GA4 referrer data

## In Scope (Phase 5 addition)

- **Sub-channel tracking**: each `DistributionRecord` carries a channel (e.g. subreddit `r/synthdiy`, YouTube channel name, LinkedIn page) so coverage can be tracked below the platform level
- **Cross-posting opportunities**: a curated `topic → channels` map plus a skill that diffs recorded distributions against the map for a given post, surfacing unshared relevant channels
- **Reddit API read-only sync (Tier 1)**: `/editorial-reddit-sync` pulls the user's own Reddit submissions via Reddit's public `.json` endpoints (no OAuth, no credentials — just the username in a one-line config file) and upserts DistributionRecords automatically, so the calendar stays in sync with reality without manual entry
- **Subreddit enrichment (Tier 2)**: opportunity reports include live subscriber count and self-promo hints pulled from `/r/<sub>/about.json`
- **Reddit-first scope**: the curated map ships with subreddits first; the data model supports any platform but automation and enrichment target Reddit only

## In Scope (Phase 6 addition)

- **YouTube videos as first-class calendar entries**: videos go through the same Ideas → Planned → Drafting → Review → Published lifecycle as blog posts. `CalendarEntry` gains a `contentType` discriminator (`blog` | `youtube`) and a `contentUrl` for content that doesn't live at `/blog/<slug>/`
- **YouTube metadata via Data API v3**: small client that fetches video title, description, and channel given a video ID or URL. Authenticated with a single API key in `~/.config/audiocontrol/youtube.json`. No OAuth — the key has read-only access to public data
- **Cross-link audit**: a new skill `/editorial-cross-link-review` that verifies bidirectional linking between blog posts and YouTube videos. For each calendar entry, it extracts outbound links from the content (blog MD or YouTube description) and flags missing reciprocal links
- **Reddit sync improvement**: when a Reddit submission links to a YouTube URL that matches a known YouTube calendar entry, record it as a distribution of that video. Closes the gap observed during the first live `/editorial-reddit-sync` run (6 S-330 editor video shares that had nowhere to attach)

## Deferred Scope

- **Reddit auto-posting (Tier 3)**: programmatically submitting link posts to subreddits. Documented in detail in the [workplan](./workplan.md#deferred-tier-3--auto-posting-to-reddit). Deferred indefinitely — operational risk (bot bans, spam filters), per-subreddit rule complexity, and limited value-add over manual posting outweigh the automation benefit. A clipboard-helper alternative is proposed there if partial automation becomes interesting later.

## Out of Scope

- External tools (Notion, Google Sheets, CMS)
- Automated publishing or deployment
- Automated social media scheduling or cross-posting (distribution *tracking* is in scope; automated *publishing* is not)
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
| `/editorial-distribute` | 4 | Record that a published post was shared on a platform + channel |
| `/editorial-social-review` | 4 | Show matrix of published posts × platforms |
| `/editorial-reddit-sync` | 5 | Pull user Reddit submissions via API, upsert DistributionRecords |
| `/editorial-reddit-opportunities` | 5 | For a published post, list relevant subreddits not yet distributed to, enriched with live subreddit metadata |
| `/editorial-cross-link-review` | 6 | Audit bidirectional linking between blog posts and YouTube videos, flag missing reciprocal links |

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
