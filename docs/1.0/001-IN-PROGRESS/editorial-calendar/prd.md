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

## In Scope (Phase 14 addition: studio as calendar command center + journal migration)

The Editorial Studio becomes the single situation room for the entire editorial calendar, not just the review pipeline. Calendar stages (Ideas → Planned → Drafting → Review → Published) are first-class in the UI; mechanical state transitions run via HTTP endpoints directly from the studio; cognitive work (drafting, revising, approving prose) stays in Claude Code.

This phase also migrates the editorial-review JSONL pipeline+history to the per-entry `journal/` layout introduced in feature-image-generator Phase 15, pre-empting the same merge-conflict pain that motivated the feature-image migration.

- **Calendar stage panels** — studio grows columns for Ideas, Planned, Drafting, and (implicit) Review, alongside the existing Published-based "The desk" view. Each row annotates the entry with: has-file? active-workflow? next-move hint.
- **Mechanical-action endpoints + buttons** — `POST /api/dev/editorial-calendar/draft` (Planned → Drafting; wraps `scaffoldBlogPost` + GH issue + calendar write) and `POST /api/dev/editorial-calendar/publish` (→ Published; wraps publish logic + GH issue close). Buttons in the studio wired up. Both sites, thin handlers around existing library functions. Actions that need writer input (Ideas → Planned with target keywords; prose drafting; iterate; approve) keep their Claude Code command + copy-to-clipboard button.
- **Journal migration for editorial-review** — `.editorial-draft-history.jsonl` and `.editorial-draft-pipeline.jsonl` decompose into `journal/editorial/{history,pipeline}/<timestamp>-<id>.json` per feature-image Phase 15's pattern. Extract the feature-image `journal.ts` (already generic on `dir` + `timestampField`) into `scripts/lib/journal/` as a shared utility; wire both features to it. Idempotent migration script with `journal/editorial/MIGRATED.txt` receipt. Public API of `scripts/lib/editorial-review/pipeline.ts` unchanged — callers continue to work through `readWorkflows` / `appendAnnotation` / etc.
- **Polish** — short-form draft queue panel (Published × platforms matrix showing which have no `DistributionRecord.shortform` yet), column-jump keyboard shortcuts in the studio (`1–5` to jump between stage columns), optional GH issue status display per entry if cheap.

**Out of scope for Phase 14:** Ideas-stage creation from the studio (needs target-keyword form; Claude Code is fine), inline editing of calendar metadata (title/description), shortform drafting from the studio (still agent-driven via `/editorial-shortform-draft`), stage reordering / custom stages.

## In Scope (Phase 18 addition: stable UUID identity + slug rename)

Slug is currently the only stable identifier for a calendar entry — every workflow, distribution record, cross-link audit, and skill helper joins back to the calendar through it. That prevents post-publish slug changes for SEO realignment without rewriting history across multiple JSON journals and markdown tables.

Phase 18 decouples internal identity (UUID) from the public handle (slug). Ships as two sequential PRs.

- **Phase 18a — UUID identity refactor (no user-visible change).** Adds `id: string` (UUID v4) to `CalendarEntry` and `entryId: string` to `DistributionRecord`. Both calendars grow a leading `UUID` column in every stage table; parser tolerates missing UUIDs on legacy rows and backfills in-memory so data loads cleanly, then persists on the next `writeCalendar`. Workflow contexts (both `scripts/feature-image/workflow.ts` and `scripts/lib/editorial-review/types.ts`) gain optional `entryId`. Join call sites (`matchesKey`, `findOpenByKey`, `handleGetWorkflow`, `editorial-approve/apply.ts`) prefer entryId and fall back to slug for legacy workflows. One-shot `scripts/editorial/backfill-uuids.ts` stamps entryId onto existing workflow journal records by matching `(site, slug, contentKind)` against the backfilled calendar.
- **Phase 18b — `/editorial-rename-slug` skill.** With UUID identity in place, a slug rename touches only the public surface: `scripts/lib/editorial/rename-slug.ts` + `.claude/skills/editorial-rename-slug/` rename the content-collection file (`src/sites/<site>/content/blog/<old>.md` → `<new>.md`), rename the per-post image dir, rewrite `image:` / `socialImage:` frontmatter paths, update `entry.slug` in the calendar (entry.id unchanged), and append a 301 redirect block to `netlify.toml` for the legacy URL. Internal cross-link rewrites are out of scope — the 301 covers them and SEO equity is preserved. No git ops (matches existing editorial-approve pattern).
- **No Astro route changes.** Blog URLs still derive from filename. Decoupling URL from filename would lose the property the user wants: a slug change IS a URL change (that's the whole point of SEO realignment).

**Out of scope for Phase 18:** scanning other posts for `/blog/<old>/` link text and rewriting it (the 301 redirect covers inbound internal links), renaming the GitHub issue title on slug change, updating historical workflow slug fields (joins use entryId — slug in old journal entries is historical record), storing UUIDs anywhere other than the markdown calendar (no sidecar JSON; calendar stays single-source-of-truth).

## In Scope (Phase 19 addition: article scrapbook — viewer, CRUD, and review-surface integration)

Articles accumulate research, notes, references, and images before they ship — and today that work is scattered across `/tmp`, ad-hoc conversations, or the operator's head. Phase 18c's directory-based content collections opened the door to co-located pre-publish material: a `content/blog/<slug>/scrapbook/` subdirectory travels with the article through a slug rename and stays out of the public render (the content-collection glob was tightened from `**/index.md` to `*/index.md` in anticipation). Phase 19 makes that scrapbook actually usable — a web surface for viewing + CRUD on scrapbook items, plus contextual embedding inside the review/edit surfaces so notes and clippings sit next to the draft being written.

Ships as two sub-phases.

- **Phase 19a — Scrapbook viewer + CRUD (standalone dev surface).** New `/dev/scrapbook/<site>/<slug>` route reads the scrapbook dir, lists files, renders markdown inline, previews images. HTTP endpoints under `/api/dev/scrapbook/*` cover create / update / rename / delete / upload — markdown notes, images, data files. `/editorial-plan` seeds the scrapbook dir with a `README.md` template at plan time so every Planned article has a waiting scrapbook. Editorial-studio calendar rows gain a `scrapbook →` link + a small count badge. Look + feel designed via the `frontend-design` skill, in the press-check desk register already established elsewhere on the studio. No git operations — matches the `/dev/*` convention; operator stages scrapbook changes alongside article edits.
- **Phase 19b — Scrapbook in context (review/edit integration).** The `/dev/editorial-review/<slug>` outline + draft surfaces gain a collapsible scrapbook rail showing the article's scrapbook items alongside the draft editor. A "quote into draft" affordance lets the operator insert a passage from a scrapbook note at the cursor. Cross-links from scrapbook items back to the review page. `frontend-design` continues driving the register across the two surfaces.

**Out of scope for Phase 19:** versioning and history (git already handles that), search across scrapbooks from different articles, shared scrapbook items that inform multiple articles (each scrapbook stays per-article), any export / bundle of scrapbook material as part of the published site (scrapbooks are dev-only by construction — invisible to `getCollection('blog')` and never written into `dist/`).

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

## In Scope (Phase 20 addition: deskwork migration + mothball)

The in-house editorial pipeline matured into a workflow-shape that's been productized as the [deskwork plugin](https://github.com/audiocontrol-org/deskwork) (`@deskwork/deskwork` + `@deskwork/deskwork-studio`), packaged for distribution outside this repo. Phase 20 transitions this project onto the deskwork plugin and decommissions the in-house equivalents. Calendars at `docs/editorial-calendar-{audiocontrol,editorialcontrol}.md` remain the source of truth and are read/written by both pipelines during the transition.

- **Phase 20a — Adopt deskwork side-by-side.** Install `deskwork@deskwork` + `deskwork-studio@deskwork` plugins, patch the host content schemas to accept the `deskwork` namespace block, run `deskwork doctor --fix=missing-frontmatter-id` to bind existing posts to their calendar UUIDs, drive new content through deskwork. The in-house pipeline stays running for features deskwork doesn't yet cover.
- **Phase 20b — Close the platform-coverage gap.** Deskwork is content-pipeline-only by design — it doesn't reach external platforms (Reddit API, GA4, Search Console). The features that DO (`/editorial-reddit-sync`, `/editorial-reddit-opportunities`, `/editorial-cross-link-review`, `/editorial-performance`, `/editorial-suggest`, `/editorial-social-review`) need a future home. Decision required: upstream into deskwork, in-repo plugin layered on deskwork's data, or sibling plugin. Default proposal: in-repo plugin, since the features are project-shape-specific and would expand deskwork's scope.
- **Phase 20c — Decommission the in-house pipeline.** Delete the in-house `.claude/skills/editorial-*` skills, the dev-only Astro pages (`pages/dev/editorial-{review,review-shortform,studio,help,scrapbook}/`), the API endpoints (`pages/api/dev/editorial-review/*`), the shared client + editor + CSS modules (`src/shared/editorial-review-*`), the TypeScript libraries (`scripts/lib/editorial/`, `scripts/lib/editorial-review/`), and the in-house workflow journal (`journal/editorial/`). Public-build remark plugins and the calendar markdown files stay.

**Out of scope for Phase 20:** the feature-image studio (`pages/dev/feature-image-*`, `pages/dev/studio/`) — feature-image generation is a separate concern and not absorbed by deskwork. Voice skills (`audiocontrol-voice`, `editorialcontrol-voice`) — content-quality skills used by both pipelines; no migration needed.

Tracking: oletizi/audiocontrol.org#126 captures the parity audit, dual-pipeline holding pattern, and the per-phase decommission checklist.

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
- `scripts/feature-image/journal.ts` (from feature-image-generator Phase 15) — extracted to `scripts/lib/journal/` in Phase 14 and shared with editorial-review's per-entry record store

## Future Enhancements

- **Visual markdown editor (TipTap / ProseMirror) as an opt-in mode.**
  The current edit surface on the editorial-review page uses a
  CodeMirror 6 source editor with a live preview pane and
  Source / Split / Preview toggles — the modern source-editor
  shape shipped by Typora, Obsidian, Bear, iA Writer, Ghost.
  The natural next step is a *Visual* mode that edits the rendered
  article directly (TipTap on top of `prosemirror-markdown`),
  keeping markdown as the source of truth with serialization on
  save. Tradeoffs: markdown round-trip is imperfect for HTML
  comments, some list shapes, and raw HTML, so the Source mode
  must remain available as the lossless fallback. Estimated scope:
  ~1 day of careful implementation; ~200 KB of additional client
  bundle weight (TipTap + extensions). Not in the critical path;
  revisit when the operator signals they want proof-style editing
  on the rendered article.

## Open Questions

- Exact markdown table format vs structured list entries — tables are more scannable, lists allow more metadata per entry
- How aggressive should `suggest` be? (List opportunities for user to pick, or auto-add to Ideas?)
- Should `/editorial draft` also invoke `/feature-image`?

## References

- GitHub Issue: oletizi/audiocontrol.org#29
- Related: oletizi/audiocontrol.org#30 (automated-analytics)
