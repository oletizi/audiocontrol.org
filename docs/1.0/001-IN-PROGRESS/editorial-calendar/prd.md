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

- **YouTube videos as first-class calendar entries**: videos go through the same Ideas → Planned → Drafting → Review → Published lifecycle as blog posts. `CalendarEntry` gains a `contentType` discriminator (`blog` | `youtube` | `tool`) and a `contentUrl` for content that doesn't live at `/blog/<slug>/`
- **Tools as first-class calendar entries**: standalone apps/editors on audiocontrol.org (like the S-330 web editor) get the same treatment as YouTube videos — tracked by `contentUrl`, lifecycle identical, no repo scaffolding
- **YouTube metadata via Data API v3**: small client that fetches video title, description, and channel given a video ID or URL. Authenticated with a single API key in `~/.config/audiocontrol/youtube-key.txt`. No OAuth — the key has read-only access to public data
- **Cross-link audit (blog ↔ YouTube only)**: a new skill `/editorial-cross-link-review` that verifies bidirectional linking between blog posts and YouTube videos. For each calendar entry, it extracts outbound links from the content (blog MD or YouTube description) and flags missing reciprocal links. Tool entries are tracked but not audited — see Phase 7 below for that extension.
- **Reddit sync improvement**: when a Reddit submission links to a YouTube URL that matches a known YouTube calendar entry, record it as a distribution of that video. Closes the gap observed during the first live `/editorial-reddit-sync` run (6 S-330 editor video shares that had nowhere to attach)

## In Scope (Phase 7 addition)

- **Cross-link audit for tool entries**: fetch the tool's page HTML, parse outbound links (YouTube URLs and audiocontrol.org URLs), and resolve them against the calendar. Extends `/editorial-cross-link-review` so a gap like "blog post X mentions the editor but doesn't link to it" or "editor page embeds video Y but Y's description doesn't link to editor" is detected automatically
- **Generalized audiocontrol.org link resolution**: any audiocontrol.org URL (blog, tool, or future types) can be resolved to its calendar entry via a unified `contentUrl` index. Not limited to `/blog/<slug>/` paths
- **Lightweight HTML extraction**: regex-based extraction of `<a href>` and bare URLs from static HTML, no DOM parser dependency

## In Scope (Phases 8–12 addition: editorial-review)

Analog of the feature-image-generator pipeline for prose: a dev-only web surface plus a Claude Code skill family that together let the operator annotate, edit, and iterate blog drafts, dispatches, and short-form social posts to publication — with the voice skills (`audiocontrol-voice`, `editorialcontrol-voice`) doing the drafting.

- **Draft review pipeline**: append-only `.editorial-draft-history.jsonl` and `.editorial-draft-pipeline.jsonl` mirror the feature-image storage model. `DraftWorkflowState` = `open → in-review → iterating → approved → applied | cancelled`. Drafts are first-class workflow items with a version history. Files are checked into the repo — they are the substrate for Phase 12 fitness signals and must not be lost.
- **Longform annotation UI**: dev-only Astro route renders the draft in its real blog layout. Select-to-comment (highlight a range, attach a margin note) and toggle-to-edit mode (raw MD textarea; submit captures a diff). Version selector flips between v1, v2, v3 to audit the iteration history. 404s in prod.
- **Orchestration skills**: `/editorial-draft-review <slug>` enqueues an existing draft; `/editorial-iterate <slug>` reads open annotations + the appropriate voice skill and produces a new version; `/editorial-approve <slug>` writes the approved version to the real file but **does not commit or push** (per operator preference — merge-conflict cost is higher for prose than for images). `/editorial-review-cancel` and `/editorial-review-help` round out the family.
- **Short-form (Reddit, YouTube description, LinkedIn, newsletter)**: same pipeline, different UI surface. `DraftWorkflowItem` gains `contentKind: 'longform' | 'shortform'` + `platform?` + `channel?`. Short-form drafts are keyed to a `DistributionRecord`. A separate dev-only list view (not per-slug) shows all open short-form drafts. Origination: `/editorial-shortform-draft <slug> <platform> [channel]` drafts the post using the voice skill + calendar context.
- **Voice-library feedback signal**: annotations carry an optional `category` tag (`voice-drift`, `missing-receipt`, `tutorial-framing`, `saas-vocabulary`, `fake-authority`, `other`). An aggregate report shows which categories are most frequent across approved drafts, identifying which voice-skill principles are producing the most drift. Analogous to feature-image Phase 11 (fitness scoring on prompt templates).
- **Skill rename to free the namespace**: existing `/editorial-review` (status display) renames to `/editorial-status`. Frees `editorial-review` for the feature and arguably a cleaner name for the display skill.
- **Both sites**: routes and skills work for audiocontrol.org and editorialcontrol.org. Site-aware like the rest of the editorial calendar.

## In Scope (Phase 13 addition: editorial-studio)

Unified dev-only dashboard analogous to `/dev/feature-image-preview`, so the operator has one URL that shows the whole review pipeline at a glance rather than two specialized routes (per-slug longform, shortform list).

- **Unified dashboard at `/dev/editorial-studio`** (both sites) — single dev-only SSR page, 404 in prod via the existing guard pattern.
- **Pending panel** — all non-terminal workflows (open / in-review / iterating / approved) across longform and shortform, grouped by state, sorted by `updatedAt` descending. Each row is a link to the per-slug route (longform) or the shortform list (shortform).
- **Approved-pending-apply panel** — approved workflows awaiting `/editorial-approve`, with the exact command to run.
- **Start-new longform form** — dropdown of Published calendar entries that don't yet have an active longform workflow → submit enqueues via a new `handleStartLongform` handler (reads the blog file, calls `createWorkflow`). For shortform, the dashboard shows command hints — agent-driven drafting stays on `/editorial-shortform-draft`.
- **Voice-drift mini-panel** — top-2 categories from `buildReport()` for this site, shown only when the sample size is meaningful (≥5 terminal workflows).
- **Recent terminal panel** — last ~10 `applied` / `cancelled` workflows, so the operator sees recent history without scrolling a separate report.

One new POST endpoint: `/api/dev/editorial-review/start-longform` — takes `{ site, slug }`, reads the draft file, calls `createWorkflow`, returns the created workflow. Thin wrapper around a shared handler so both sites' endpoint files stay boilerplate.

**Out of scope for Phase 13:** polling for live updates, shortform drafting from the dashboard form (agent-driven, stays on `/editorial-shortform-draft`), filters/search across the pending list. These can extend the studio later if the UX gets cramped.

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
| `/editorial-draft` | 2 | Scaffold blog post directory and move to Drafting |
| `/editorial-publish` | 2 | Mark entry as Published with date, close GitHub issue |
| `/editorial-suggest` | 3 | Pull analytics, identify content opportunities |
| `/editorial-performance` | 3 | Pull analytics for published posts, flag underperformers |
| `/editorial-distribute` | 4 | Record that a published post was shared on a platform + channel |
| `/editorial-social-review` | 4 | Show matrix of published posts × platforms |
| `/editorial-reddit-sync` | 5 | Pull user Reddit submissions via API, upsert DistributionRecords |
| `/editorial-reddit-opportunities` | 5 | For a published post, list relevant subreddits not yet distributed to, enriched with live subreddit metadata |
| `/editorial-cross-link-review` | 6 | Audit bidirectional linking between blog posts and YouTube videos, flag missing reciprocal links |
| `/editorial-cross-link-review` (extended) | 7 | Same skill; Phase 7 adds tool-page analysis and generalized audiocontrol.org link resolution |
| `/editorial-status` (renamed from `/editorial-review`) | 8 | Show calendar status across all stages |
| `/editorial-draft-review` | 10 | Enqueue an existing draft for review; print the dev URL |
| `/editorial-iterate` | 10 | Read open annotations + voice skill; produce and append a new draft version |
| `/editorial-approve` | 10 | Write the approved version to the real file (no git operations) |
| `/editorial-review-cancel` | 10 | Cancel an open review workflow; leave file untouched |
| `/editorial-review-help` | 10 | Report pipeline state and next action |
| `/editorial-shortform-draft` | 11 | Draft a short-form post (Reddit/YouTube desc/LinkedIn/newsletter) for a published entry |
| `/editorial-review-report` | 12 | Aggregate annotation categories across approved drafts; surface voice-drift signals |

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
- Voice skills (`audiocontrol-voice`, `editorialcontrol-voice`) — required by `/editorial-iterate` and `/editorial-shortform-draft` (Phases 10–11) for voice-consistent drafting and revision

## Open Questions

- Exact markdown table format vs structured list entries — tables are more scannable, lists allow more metadata per entry
- How aggressive should `suggest` be? (List opportunities for user to pick, or auto-add to Ideas?)
- Should `/editorial draft` also invoke `/feature-image`?

## References

- GitHub Issue: oletizi/audiocontrol.org#29
- Related: oletizi/audiocontrol.org#30 (automated-analytics)
