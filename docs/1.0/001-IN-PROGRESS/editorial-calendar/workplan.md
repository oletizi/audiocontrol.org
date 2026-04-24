# Workplan: Editorial Calendar

**Feature slug:** `editorial-calendar`
**Branch:** `feature/editorial-calendar`
**Milestone:** Editorial Calendar
**GitHub Issue:** oletizi/audiocontrol.org#29

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#29 |
| Phase 1: Calendar Structure & Basic Management | oletizi/audiocontrol.org#40 |
| Phase 2: Post Scaffolding | oletizi/audiocontrol.org#41 |
| Phase 3: Analytics Integration | oletizi/audiocontrol.org#42 |
| Phase 4: Social Distribution Tracking | oletizi/audiocontrol.org#54 |
| Phase 5: Subreddit Tracking & Cross-posting Opportunities | oletizi/audiocontrol.org#56 |
| Phase 6: YouTube as First-Class Content + Cross-link Audit | oletizi/audiocontrol.org#57 |
| Phase 7: Tool Cross-link Audit | oletizi/audiocontrol.org#59 |
| Phase 8: Draft Review Pipeline + Surface Scaffolding | oletizi/audiocontrol.org#90 |
| Phase 9: Longform Annotation UI | oletizi/audiocontrol.org#91 |
| Phase 10: Orchestration Skills for the Review Loop | oletizi/audiocontrol.org#92 |
| Phase 11: Short-form Review (Social Posts) | oletizi/audiocontrol.org#93 |
| Phase 12: Voice-Library Feedback Signal | oletizi/audiocontrol.org#94 |
| Phase 13: Editorial Studio (unified dashboard) | oletizi/audiocontrol.org#96 |
| Phase 14: Studio as calendar command center + journal migration | oletizi/audiocontrol.org#102 |
| Phase 18a: Stable UUID identity for calendar entries + distribution records | oletizi/audiocontrol.org#116 |
| Phase 18b: /editorial-rename-slug skill + Netlify redirect management | oletizi/audiocontrol.org#117 |

## Files Affected

- `docs/editorial-calendar.md` — the calendar itself
- `scripts/lib/editorial/types.ts` — calendar entry types and stage definitions
- `scripts/lib/editorial/calendar.ts` — markdown calendar parser and writer
- `scripts/lib/editorial/scaffold.ts` — post scaffolding (directory, frontmatter, GitHub issue)
- `scripts/lib/editorial/suggest.ts` — analytics integration for topic suggestions
- `scripts/lib/editorial/index.ts` — barrel export
- `.claude/skills/editorial-help/SKILL.md` — workflow overview and calendar status
- `.claude/skills/editorial-add/SKILL.md` — add entry to Ideas
- `.claude/skills/editorial-plan/SKILL.md` — move entry to Planned
- `.claude/skills/editorial-status/SKILL.md` — show calendar status (renamed from `editorial-review` in Phase 8)
- `.claude/skills/editorial-draft/SKILL.md` — scaffold blog post
- `.claude/skills/editorial-publish/SKILL.md` — mark entry as Published
- `.claude/skills/editorial-suggest/SKILL.md` — analytics-driven topic suggestions
- `.claude/skills/editorial-performance/SKILL.md` — published post analytics
- `.claude/skills/editorial-distribute/SKILL.md` — record a social share
- `.claude/skills/editorial-social-review/SKILL.md` — matrix of shares across platforms
- `.claude/skills/editorial-reddit-opportunities/SKILL.md` — show unshared relevant subreddits for a post
- `.claude/skills/editorial-reddit-sync/SKILL.md` — pull submissions from Reddit API and update distribution records
- `scripts/lib/editorial/channels.ts` — load curated `editorial-channels.json` and diff against distributions
- `scripts/lib/reddit/config.ts` — Reddit username loader, User-Agent builder (no OAuth)
- `scripts/lib/reddit/client.ts` — minimal Reddit public-JSON client (submissions, subreddit about)
- `docs/editorial-channels.json` — curated `topic → [subreddit]` map
- `scripts/lib/youtube/config.ts` — YouTube API key loader (Phase 6)
- `scripts/lib/youtube/client.ts` — YouTube Data API v3 client — fetch video metadata (Phase 6)
- `scripts/lib/editorial/crosslinks.ts` — extract links from blog MD and YouTube descriptions, diff bidirectional coverage (Phase 6); extended in Phase 7 for tool-page analysis and generalized audiocontrol.org link resolution
- `.claude/skills/editorial-cross-link-review/SKILL.md` — audit skill (Phase 6)
- `scripts/lib/http/fetch-page.ts` — minimal HTML fetcher for tool pages (Phase 7)
- `scripts/lib/editorial-review/types.ts` — draft workflow types (Phase 8)
- `scripts/lib/editorial-review/pipeline.ts` — append-only history + workflow writers (Phase 8)
- `scripts/lib/editorial-review/index.ts` — barrel export (Phase 8)
- `src/sites/editorialcontrol/pages/dev/editorial-review/[slug].astro` — longform review surface (Phase 9)
- `src/sites/audiocontrol/pages/dev/editorial-review/[slug].astro` — longform review surface mirror (Phase 9)
- `src/sites/editorialcontrol/pages/dev/api/editorial-review/*.ts` — server endpoints: annotate, list, decision (Phase 8/9)
- `src/sites/audiocontrol/pages/dev/api/editorial-review/*.ts` — audiocontrol mirror (Phase 8/9)
- `src/sites/*/pages/dev/editorial-review-shortform.astro` — short-form list view (Phase 11)
- `.editorial-draft-history.jsonl` — every draft version and annotation, append-only (Phase 8)
- `.editorial-draft-pipeline.jsonl` — workflow items with state transitions, one record per change (Phase 8)
- `.claude/skills/editorial-status/SKILL.md` — renamed from `editorial-review` (Phase 8)
- `.claude/skills/editorial-draft-review/SKILL.md` — enqueue draft, print dev URL (Phase 10)
- `.claude/skills/editorial-iterate/SKILL.md` — read annotations + voice skill, revise, append (Phase 10)
- `.claude/skills/editorial-approve/SKILL.md` — write final file, no git ops (Phase 10)
- `.claude/skills/editorial-review-cancel/SKILL.md` — cancel workflow (Phase 10)
- `.claude/skills/editorial-review-help/SKILL.md` — pipeline state + next action (Phase 10)
- `.claude/skills/editorial-shortform-draft/SKILL.md` — draft short-form post (Phase 11)
- `.claude/skills/editorial-review-report/SKILL.md` — annotation category aggregates (Phase 12)
- `scripts/lib/journal/index.ts` — extracted from `scripts/feature-image/journal.ts`; shared directory-backed record store (Phase 14)
- `scripts/lib/editorial-review/migrate-journal.ts` — one-shot idempotent migration from the two JSONL files to the journal tree (Phase 14)
- `journal/editorial/history/` + `journal/editorial/pipeline/` — per-entry record directories (Phase 14)
- `journal/editorial/MIGRATED.txt` — migration receipt (Phase 14)
- `scripts/lib/editorial-calendar-actions/types.ts` + `handlers.ts` — mechanical state-transition handlers for Phase 14 endpoints
- `src/sites/<site>/pages/api/dev/editorial-calendar/draft.ts` + `publish.ts` — Phase 14 HTTP endpoints on both sites

## Implementation Phases

### Phase 1: Calendar Structure & Basic Management

**Deliverable:** Can manage a markdown editorial calendar via Claude Code skills

- [x] Define calendar entry types and stage definitions (types.ts)
- [x] Design markdown calendar format (machine-parseable tables per stage)
- [x] Implement calendar markdown parser and writer (calendar.ts)
- [x] Create initial `docs/editorial-calendar.md` with stage sections and existing published content
- [x] Create `/editorial-help` skill: show workflow overview and calendar status
- [x] Create `/editorial-add` skill: add a new entry to Ideas
- [x] Create `/editorial-plan` skill: move entry to Planned, set target keywords
- [x] Create `/editorial-review` skill: display calendar status across all stages
- [x] Create barrel export (index.ts) and verify build

**Acceptance Criteria:**
- `/editorial-add "Post Title"` adds an entry to the Ideas section
- `/editorial-plan post-slug` moves an entry to Planned
- `/editorial-review` shows a summary of entries in each stage
- `/editorial-help` shows the workflow and lists all editorial skills
- Calendar file is human-readable and machine-parseable
- Existing published posts are pre-populated in the calendar

### Phase 2: Post Scaffolding

**Deliverable:** `/editorial-draft` creates a ready-to-write blog post with all boilerplate

- [x] Create `/editorial-draft` skill: create blog post directory and index.md with frontmatter
- [x] Generate frontmatter from calendar entry metadata (title, description, target keywords)
- [x] Create a GitHub issue for the post with acceptance criteria
- [x] Move calendar entry to Drafting stage with link to issue
- [x] Create `/editorial-publish` skill: update calendar with publish date, close GitHub issue
- [x] Implement scaffold.ts library for post scaffolding
- [x] Follow existing blog post conventions from workflow-playbooks.md

**Acceptance Criteria:**
- `/editorial-draft post-slug` creates `src/pages/blog/<slug>/index.md` with correct frontmatter
- A GitHub issue is created and linked in the calendar entry
- `/editorial-publish post-slug` marks the entry as Published with the current date
- Generated file structure matches existing blog post conventions

### Phase 3: Analytics Integration

**Deliverable:** Virtuous feedback loop — analytics drives topic suggestions and flags posts needing updates

- [x] Create `/editorial-suggest` skill: invoke analytics report, parse search opportunities and content gaps
- [x] Present suggestions to user with source data (impressions, position, CTR gap)
- [x] Allow user to accept suggestions into the Ideas stage (via `/editorial-add`)
- [x] Create `/editorial-performance` skill: pull analytics for published posts
- [x] Flag underperforming posts (declining traffic, high impressions but low CTR)
- [x] Surface "update recommended" entries with specific improvement suggestions
- [x] Implement suggest.ts library for analytics integration
- [x] Track analytics-suggested vs manually added entries in the calendar

**Note:** Analytics integration is live — `suggest.ts` calls the analytics pipeline (Umami, GA4, Search Console) via `scripts/lib/analytics/`. The `source` field on CalendarEntry distinguishes `analytics` vs `manual` entries.

**Acceptance Criteria:**
- `/editorial-suggest` shows content opportunities derived from analytics data
- `/editorial-performance` shows metrics for published posts and flags underperformers
- Suggestions include specific data (e.g., "query X has 200 impressions at position 8 — no page targets it")
- Underperformers include specific improvement recommendations

### Phase 4: Social Distribution Tracking

**Deliverable:** Record where published posts have been shared and surface social referral traffic from analytics

- [x] Define `Platform` union (`'reddit' | 'youtube' | 'linkedin' | 'instagram'`) and `DistributionRecord` interface in types.ts
- [x] Add `distributions` field to `EditorialCalendar` type
- [x] Extend calendar.ts parser to read a new `## Distribution` markdown section (columns: Slug, Platform, URL, Shared, Notes)
- [x] Extend calendar.ts writer to render the `## Distribution` section
- [x] Add `addDistribution()` mutation function in calendar.ts
- [x] Create `/editorial-distribute` skill — interactive prompt for slug, platform, URL, optional notes (no positional args)
- [x] Create `/editorial-social-review` skill — render a matrix of published posts × platforms with checkmarks
- [x] Add `getSocialReferrals()` to suggest.ts — fetch referrer data from Umami, map hostnames to the 4 platforms, return per-post traffic
- [x] Extend `/editorial-performance` skill to include a Social Referrals section per post
- [x] Update `/editorial-help` to list `/editorial-distribute` and `/editorial-social-review`
- [x] Update `/editorial-review` to show distribution counts alongside stage counts
- [x] Add unit tests for the Distribution parser/writer round-trip and `addDistribution()`

**Acceptance Criteria:**
- `/editorial-distribute` prompts the user for each field and records a share in the calendar
- `/editorial-social-review` shows a matrix of published posts vs platforms (shared / not shared)
- `/editorial-performance` includes social referral traffic alongside organic search metrics for each post
- Distribution data is persisted in `docs/editorial-calendar.md` in a `## Distribution` section
- Calendar round-trips: parsing then rendering produces the same markdown

### Phase 5: Subreddit Tracking & Cross-posting Opportunities

**Deliverable:** Record where a post was shared at the sub-channel level (subreddit, YouTube channel), surface unshared relevant subreddits for a given post, and automate ingestion from the Reddit API so the calendar stays in sync without manual entry.

**Scope:** Tier 1 (read-only Reddit API sync) + Tier 2 (subreddit enrichment via about.json). Tier 3 (auto-posting) is documented below as deferred.

#### Skill design (UX first, per composable-skills rule)

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-distribute` (updated) | Prompts for slug, platform, url, **channel** (e.g. `r/synthdiy`), optional notes | Writes a DistributionRecord with `channel` populated |
| `/editorial-reddit-sync` (new) | None — pulls from Reddit API | Fetches recent submissions by the configured Reddit user, matches to blog posts by URL, upserts DistributionRecords (idempotent) |
| `/editorial-reddit-opportunities <slug>` | Post slug (fast path); optional `--topic <tag>` to override | Prints subreddits already shared (do-not-duplicate list) and unshared candidates enriched with live subscriber count / activity / self-promo rules from about.json |
| `/editorial-social-review` (updated) | (no change in args) | Reddit column shows "N subreddits" instead of just a checkmark when that post has reddit distributions |

`/editorial-reddit-sync` and `/editorial-reddit-opportunities` are new user-invocable skills. `/editorial-distribute` and `/editorial-social-review` pick up the new data transparently.

#### Data model

- [x] Add `channel?: string` field to `DistributionRecord` (e.g. `r/synthdiy`, YouTube channel handle, LinkedIn page slug)
- [x] Add `topics?: string[]` to `CalendarEntry` (optional — overlaps with `targetKeywords` but is semantically distinct: topics are coarse tags used for cross-posting recommendations, keywords are SEO targets)
- [x] Extend the Distribution markdown table with a Channel column; maintain backwards-compat parsing for old rows without the column

#### Curated map

- [x] Create `docs/editorial-channels.json` with a `topic → [subreddit]` map (JSON rather than YAML to avoid a new dependency; human-editable enough for a curated list)
- [x] Seed the map with topic tags we'll use for audiocontrol.org content: `samplers`, `vintage-hardware`, `scsi`, `roland`, `akai`, `ai-agents`, `home-studio`, etc. (initial set — user to curate)
- [x] Each subreddit entry can carry optional hints (self-promo rules, flair requirements) as free-form notes

#### Implementation

**Core (data model + curated opportunities):**

- [x] Extend `types.ts` with `channel?: string` on DistributionRecord and `topics?: string[]` on CalendarEntry
- [x] Extend `calendar.ts` parser/writer — header-driven, Channel column on Distribution, Topics column on stages (both optional, emitted only when any row uses them)
- [x] Add `channels.ts` library module — `readChannels`, `getChannelsForTopics`, `normalizeChannel`, `diffShared`, `alreadyShared` with case-insensitive subreddit normalization
- [x] Update `/editorial-distribute` skill to prompt for channel after platform
- [x] Update `/editorial-social-review` skill to show per-post subreddit count when that post has reddit distributions
- [x] Update `/editorial-plan` prompt to collect topics (optional) at plan time
- [x] Update `/editorial-help` to cover the new skills

**Tier 1 — Reddit API read-only sync:**

- [x] Add `scripts/lib/reddit/config.ts` — one-line config loader (`{username}`), derives User-Agent from username; no OAuth/password
- [x] Add `scripts/lib/reddit/client.ts` — `getUserSubmissions` via public `.json` endpoints with pagination
- [x] Create `/editorial-reddit-sync` skill — pulls submissions, matches by URL, upserts DistributionRecords idempotently
- [x] Dedup on (slug, platform, normalized channel, url) so repeated syncs are idempotent
- [x] Document reddit.json credential setup in CONTENT-CALENDAR.md

**Tier 2 — Subreddit enrichment:**

- [x] Extend `scripts/lib/reddit/client.ts` with `getSubredditInfo(name)` — subscribers, active users, self-promo hints extracted heuristically
- [x] Create `/editorial-reddit-opportunities <slug>` — already-shared (do-not-duplicate) + unshared candidates enriched with live metadata

**Tests:**

- [x] Channel round-trip in Distribution parser/writer
- [x] Topics round-trip in stage tables
- [x] `getChannelsForTopics`, `diffShared`, `alreadyShared` with case-insensitive matching
- [x] Backwards-compat parsing of pre-Phase-5 Distribution rows (no Channel column) and pre-Phase-5 stage tables (no Topics column)
- [x] `normalizeChannel` across various URL/slug forms

**Acceptance Criteria:**
- `/editorial-distribute` captures a channel (e.g. `r/synthdiy`) as a first-class field, not free-text notes
- `/editorial-reddit-sync` pulls the configured user's Reddit submissions and upserts DistributionRecords idempotently
- `/editorial-reddit-opportunities <slug>` prints a do-not-duplicate list of already-shared subreddits, then a candidate list enriched with live subscriber count and self-promo hints
- `/editorial-social-review` shows subreddit coverage for Reddit rather than just a checkmark
- Calendar round-trips cleanly with the new `Channel` and `Topics` columns
- `docs/editorial-channels.json` is user-editable and human-readable
- No regressions to Phase 4 behavior — pre-Phase-5 Distribution rows without a Channel still parse

#### Deferred: Tier 3 — Auto-posting to Reddit

**Status:** Out of scope for Phase 5. Captured here so the PRD reflects the option and the analysis is not lost.

**What it would do**

- `/editorial-reddit-post <slug> <subreddit>` — given a post slug and a target subreddit, submit a link post with the correct title, flair, and URL
- Integrate with `/editorial-reddit-opportunities` so the user can accept a suggestion and submit in one step
- Record the submission as a DistributionRecord immediately (or wait for the next `/editorial-reddit-sync` to pick it up)

**Why deferred**

- **Operational risk:** Reddit aggressively bans accounts that exhibit bot-like posting patterns. Even with a legitimate use case, cross-posting the same URL across many subreddits in a short window triggers spam filters. This is specifically the pattern our opportunities skill would encourage.
- **Per-subreddit rule complexity:** Every relevant subreddit has its own rules — minimum account karma, account age, required flair, banned domains, self-promo ratios (the "1-in-10" rule), submission format (link vs self-post), allowed post frequency. Encoding these rules correctly is an ongoing maintenance burden.
- **Limited value over manual posting:** The hard part of cross-posting isn't the mechanics of clicking "submit" — it's framing the title and top comment for each community's tone. Automating the submit step doesn't save the valuable effort; it only saves the trivial one.
- **Community norms:** Many of the most valuable subreddits for our content (e.g. `r/synthdiy`, `r/vintagesynths`) have explicit rules against automated or low-effort self-promotion. Violating those norms damages the brand regardless of the technical legality.

**Requirements if we ever implement**

- Expanded Reddit OAuth scopes: `submit`, `edit`, `modposts` (if we want to edit after posting)
- Per-subreddit rule config in `editorial-channels.json` — `{requiredFlair, minKarma, minAccountAgeDays, selfPromoRatio, allowedDomains, submissionType}`
- Rate limiter: per-subreddit max submissions per day, global max submissions per hour
- Pre-submission validator: karma check, account-age check, flair check, subreddit allows URL check
- Dry-run mode that shows the exact submission body without posting
- Submission log at `docs/editorial-submissions.jsonl` — append-only audit trail with request payload, response, any error
- Integration point: `/editorial-reddit-opportunities` gains a confirmation prompt that optionally calls the submitter

**Alternatives likely to be better than full automation**

- **Clipboard helper:** A skill `/editorial-reddit-prep <slug> <subreddit>` that generates the ideal title, top-comment body, and flair for that community, copies them to the clipboard, and opens the subreddit's submit page in a browser. User pastes and submits manually. Gets the hard part (framing) automated without the risky part (submission).
- **Never automate posting.** This is currently the recommended path. Tier 1 ingestion + Tier 2 enrichment handles the tracking and discovery problems; submission stays manual.

**Decision log**

- 2026-04-17: User raised Reddit API integration during Phase 5 scoping. Tier 1 + Tier 2 accepted into Phase 5 scope. Tier 3 documented here and deferred indefinitely pending a clear use case that outweighs the operational risk.

#### Open questions (resolve before coding)

- Should `topics` on CalendarEntry be required once Phase 5 ships, or remain optional with graceful handling of untagged posts? (Resolved: **optional**; untagged posts produce `(no topics — tag this post to get opportunities)` from the skill.)
- Should the curated map be checked into `docs/` or kept private in `~/.config/audiocontrol/`? (Resolved: **`docs/`** — it's non-sensitive guidance, useful to review in PRs.)
- Should we use YAML or JSON for the curated map? (Resolved: **JSON** — avoids a new dependency; human-editable enough for a curated list.)

### Phase 6: YouTube as First-Class Content + Cross-link Audit

**Deliverable:** YouTube videos become first-class editorial calendar entries with the same Ideas → Planned → Drafting → Review → Published lifecycle, and a new skill audits bidirectional linking between blog posts and videos so neither side is left dangling.

**Motivation:** The first live `/editorial-reddit-sync` run on 2026-04-17 found 6 Reddit submissions that correctly didn't match blog posts — they were shares of the S-330 editor demo YouTube video. The calendar has no place for that video today, so those shares can't be tracked, the video's performance can't be monitored, and there's no automated way to confirm the video description and related blog posts link to each other. Phase 6 closes both gaps.

#### Skill design (UX first)

| Skill | Change in Phase 6 | Behavior |
|-------|------------------|----------|
| `/editorial-add` | Updated | Prompts for `content type` — `blog` (default) or `youtube`. For YouTube, also prompts for the video URL if already known; otherwise URL is captured at publish time |
| `/editorial-draft` | Updated | Branches on `contentType`: blog entries get directory + frontmatter scaffolding as before; YouTube entries get a GitHub issue only (no repo files to scaffold) |
| `/editorial-publish` | Updated | For YouTube entries, requires `contentUrl` (the YouTube URL) to be set before advancing. Still records `datePublished` |
| `/editorial-cross-link-review` (new) | — | Scans all Published entries, extracts links from each (blog MD for `youtube.com`/`youtu.be`; YouTube description for `audiocontrol.org/blog/`), maps hits to known calendar slugs, and reports missing reciprocal links |
| `/editorial-reddit-sync` | Updated | Extends URL-matching to recognize YouTube URLs and match them to YouTube calendar entries' `contentUrl`, so YouTube-video shares are attributed correctly |

No new user-invocable skill beyond `/editorial-cross-link-review`. The rest are backwards-compatible extensions.

#### Data model

- [x] Add `contentType: 'blog' | 'youtube' | 'tool'` to `CalendarEntry` (optional during parsing, defaults to `'blog'` — all existing entries remain valid; `tool` added in Phase 6 to cover standalone apps)
- [x] Add `contentUrl?: string` to `CalendarEntry` — the canonical URL for content that doesn't live at `/blog/<slug>/`. For blog entries, stays unset (URL is derived from slug). For YouTube/tool entries, stores the full URL
- [x] Extend `calendar.ts` parser/writer: stage tables gain optional `Type` and `URL` columns, emitted only when any entry in the stage has a non-default value (same pattern as Phase 5's Topics/Channel columns)

#### Curated map

No changes — `editorial-channels.json` stays topic-to-subreddit. A YouTube video is a calendar *entry*, not a channel.

#### Implementation

**Core data model + skill updates**

- [x] Extend `types.ts` with `contentType` and `contentUrl` (+ `effectiveContentType`, `isContentType` helpers)
- [x] Update `calendar.ts` parser/writer for Type/URL columns (optional, emitted only when any entry uses non-default values)
- [x] Update `/editorial-add` to prompt for content type
- [x] Update `/editorial-draft` to branch on content type (blog scaffolds directory; youtube creates issue only)
- [x] Update `/editorial-publish` to require `contentUrl` for YouTube entries

**YouTube client**

- [x] `scripts/lib/youtube/config.ts` — loads `~/.config/audiocontrol/youtube.json` (`{apiKey: "..."}`)
- [x] `scripts/lib/youtube/client.ts` — `getVideoMetadata(videoIdOrUrl)` via `/youtube/v3/videos?part=snippet`
- [x] `extractVideoId` helper supporting `watch?v=`, `youtu.be/`, `shorts/`, `embed/`, and bare IDs

**Cross-link audit**

- [x] `scripts/lib/editorial/crosslinks.ts` — `extractYouTubeLinksFromMarkdown`, `extractBlogLinksFromDescription`, `slugFromBlogUrl`, `auditCrossLinks` with bidirectional gap detection
- [x] `/editorial-cross-link-review` skill

**Reddit sync improvement**

- [x] Update `/editorial-reddit-sync` to match submissions against `contentUrl` for YouTube entries in addition to blog URLs
- [x] Re-run the sync after Phase 6 ships, once the S-330 editor video exists as a calendar entry, to attribute the 6 pre-existing shares (done in commit 9b9a701 + 00dd9bd — all 8 Reddit submissions now attributed)

**Tests**

- [x] `contentType` + `contentUrl` round-trip on stage tables
- [x] Backwards-compat parsing of legacy tables (no Type/URL columns)
- [x] `extractYouTubeLinksFromMarkdown` against realistic blog MD
- [x] `extractBlogLinksFromDescription` against realistic YouTube descriptions
- [x] `auditCrossLinks` with fixture calendar + fixture descriptions — verifies reciprocation, missing-backlink detection, and error handling in both directions
- [x] `extractVideoId` fixture tests covering all supported URL forms

**Acceptance Criteria**

- `/editorial-add` creates a calendar entry with `contentType: 'youtube'` when the user chooses that type
- `/editorial-draft` on a YouTube entry creates a GitHub issue and does NOT create `src/pages/blog/<slug>/`
- `/editorial-publish` on a YouTube entry refuses if `contentUrl` is missing
- `/editorial-cross-link-review` reports for each Published entry what it links to and whether those links are reciprocated
- `/editorial-reddit-sync` attributes YouTube-URL Reddit submissions to YouTube calendar entries after Phase 6 ships
- Calendar round-trips cleanly with the new columns
- No regressions to Phase 5 or earlier behavior — legacy tables without Type/URL columns still parse

#### YouTube API setup (what the user does once)

1. Go to https://console.cloud.google.com
2. Open or create a project (reuse the one with the GA4 service account if you like)
3. Enable the **YouTube Data API v3** under APIs & Services → Library
4. Under Credentials, create an **API key**. Restrict it to the YouTube Data API v3 for hygiene
5. Save the key as a single line at `~/.config/audiocontrol/youtube-key.txt` (matches the project's existing `flux-key.txt`, `openai-key.txt` convention):
   ```bash
   echo "AIza..." > ~/.config/audiocontrol/youtube-key.txt
   ```

Quota: 10,000 units per day free. One `videos.list` call costs 1 unit. The cross-link audit reads at most one video per calendar YouTube entry — we won't come close to the limit.

#### Open questions (resolve before coding)

- Should blog-post MD extraction handle embedded iframes (`<iframe src="youtube.com/embed/...">`) in addition to plain URLs? (Proposed: **yes** — capture all three forms: plain URL, short URL, iframe embed.)
- Should cross-link audit report be generated as markdown in `docs/` for review, or streamed only to the skill output? (Proposed: **stream only** — audit is fast enough that we don't need to cache; keeping it out of `docs/` avoids churn on every run.)
- Slug uniqueness: a blog post and a YouTube video on the same topic could collide. (Proposed: **keep global slug uniqueness** — if conflict, the user differentiates manually, e.g. `s330-crunch-post` vs `s330-crunch-video`.)

### Phase 7: Tool Cross-link Audit

**Deliverable:** Extend `/editorial-cross-link-review` so tool entries participate fully — the audit fetches each tool page's HTML, extracts outbound links, resolves them against the calendar's `contentUrl` index, and flags missing reciprocal links in both directions (blog→tool, tool→blog, tool→video, video→tool).

**Motivation:** Phase 6 added `tool` as a valid content type but deliberately skipped it in the cross-link audit — tools don't have a fetch-able "description" field like YouTube videos, and they don't have a repo MD file like blog posts. Phase 7 closes that gap by fetching the tool's actual rendered HTML page from audiocontrol.org and parsing its outbound links.

Without this, gaps like "the S-330 editor page embeds the drum-crunch video but the video description doesn't link back" or "the editor page doesn't link to the Feb 2026 blog update" can't be detected automatically — the operator has to notice them manually, which is exactly what Phase 6 was supposed to prevent.

#### Skill design

No new user-invocable skill. `/editorial-cross-link-review` is extended: when it encounters a tool entry, it fetches the page HTML, extracts links, and includes the results in the report alongside blog and video entries.

#### Implementation

**HTML fetching**

- [x] `scripts/lib/http/fetch-page.ts` — `fetchHtml(url)` with descriptive User-Agent, 10s timeout via AbortController, throws on non-2xx. No auth
- [x] No caching layer in this phase (revisit if audits get slow)

**Link extraction**

- [x] `extractLinksFromHtml(html, baseUrl?)` in `crosslinks.ts` — uses **cheerio** (the de-facto Node HTML parser, 30k+ stars, backed by htmlparser2) for robust DOM traversal. Regex parsing was considered and rejected — real HTML is too quirky
- [x] Extracts `href`/`src` attributes plus bare URLs from text content; explicitly strips `<script>` and `<style>` before scanning
- [x] Skips anchor-only, `mailto:`/`tel:`/`javascript:`/`data:`, feeds, sitemap, robots.txt
- [x] Unit tests against realistic and deliberately garbage HTML

**Generalized link resolution**

- [x] Unified `byContentUrl` index built from all Published entries. Blog entries derive canonical URL from slug; youtube/tool use `contentUrl`. Normalized via `canonicalizeUrl` (lowercase hostname, strip trailing slash, preserve query)
- [x] `resolveUrl` tries YouTube first (video ID match — more robust than URL match for YouTube's many URL shapes), then falls back to `byContentUrl`
- [x] `extractBlogLinksFromDescription` generalized to `extractAudioControlLinksFromText` — matches any audiocontrol.org URL, not just `/blog/`
- [x] New `extractAudioControlLinksFromMarkdown` — catches absolute URLs AND markdown-relative links like `[text](/roland/s330/editor)`

**Tool-entry audit branch**

- [x] `auditCrossLinks` now has a tool branch: fetches `entry.contentUrl`, extracts links, resolves each via unified index
- [x] Self-links filtered at the recording step (tool pages link to themselves via nav)
- [x] On fetch failure, error recorded per-entry; audit continues
- [x] Phase 6 "tool entries are tracked but not analyzed" skip removed

**Reciprocation rules**

- [x] Phase 6 second-pass tool-skip removed — tools now have outbound links, reciprocation is meaningful
- [x] Second pass unchanged in shape; flags missing backlinks in both directions

**Skill update**

- [x] `/editorial-cross-link-review` skill doc updated with tool-page fetching, unified resolution, cheerio note

**Tests**

- [x] `extractLinksFromHtml` fixtures: realistic HTML, relative URLs, anchor/mailto/javascript skipping, feeds/sitemap/robots skipping, script/style exclusion, unclosed-tag tolerance, deduplication
- [x] `extractAudioControlLinksFromMarkdown` with absolute + markdown-relative forms
- [x] `canonicalizeUrl` cases (hostname case, trailing slash, query preservation)
- [x] `auditCrossLinks` tool-entry tests: outbound extraction, blog-to-tool via relative link, missing-backlink detection, fetch failure per-entry, missing-contentUrl errors, self-link exclusion

**Acceptance Criteria**

- `/editorial-cross-link-review` reports outbound links for tool entries
- Tool pages that embed YouTube videos are flagged if the video description doesn't link back to the tool
- Blog posts that link to a tool are flagged if the tool page doesn't link back to the post
- Unified content-URL resolution works for all three content types — no silent drops of audiocontrol.org URLs in YouTube descriptions
- Fetch failures for individual tool pages don't abort the whole audit; they're recorded per-entry
- Existing Phase 6 tests still pass (no regressions)

#### Open questions (resolve before coding)

- Should the audit follow links inside tool pages recursively (e.g., the editor links to a docs page that links to a blog post)? (Proposed: **no** — single-hop only. Recursive fetching adds complexity and a crawler-like pattern we don't need right now.)
- Should we cache fetched HTML during a single audit run to avoid re-fetching the same URL? (Proposed: **yes** — in-memory per-audit Map, invalidated each run. Cheap to implement, protects against audits getting slow when many entries reference the same tool.)
- Do we need a way to exclude specific outbound links from the audit (e.g., social icons in the site footer)? (Proposed: **not initially** — if the audit surfaces noise later, add an `editorial-crosslink-ignore.json` file with URL patterns. For now, the report just shows what it finds and the user can ignore.)

### Phase 8: Draft Review Pipeline + Surface Scaffolding

**Deliverable:** The review pipeline's state machine, storage, and dev-only route are in place. No annotation UI yet — the route renders a placeholder. Rename of existing skill frees the namespace.

**Motivation:** The pipeline is the load-bearing part of the system (analogous to feature-image Phase 1–2). Before building UI or skills, the types, JSONL files, and 404-in-prod route need to exist so subsequent phases can wire into them.

#### Skill design (UX first)

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-status` (renamed from `/editorial-review`) | Same as today | Same as today — displays calendar status across all stages |
| `/editorial-review-help` (new, placeholder) | None | Reports pipeline state: open workflows, in-review, approved pending apply. Real content populated in Phase 10 |

#### Data model

- [x] `DraftWorkflowState` union: `'open' | 'in-review' | 'iterating' | 'approved' | 'applied' | 'cancelled'`
- [x] `DraftAnnotation` discriminated union:
  - `{ type: 'comment', range: {start, end}, text, category?, createdAt }`
  - `{ type: 'edit', beforeVersion, afterMarkdown, diff, createdAt }`
  - `{ type: 'approve', version, createdAt }`
  - `{ type: 'reject', version, reason?, createdAt }`
- [x] `DraftVersion`: `{ version, markdown, createdAt, originatedBy: 'agent' | 'operator' }`
- [x] `DraftWorkflowItem`: `{ id, site, slug, contentKind, platform?, channel?, state, currentVersion, createdAt, updatedAt }`

#### Implementation

- [x] Rename `/editorial-review` skill to `/editorial-status` (update `.claude/skills/editorial-review/` → `.claude/skills/editorial-status/`, update skill frontmatter, update `/editorial-help` to list the new name)
- [x] Create `scripts/lib/editorial-review/types.ts` with the union and interfaces above
- [x] Create `scripts/lib/editorial-review/pipeline.ts` with create/transition/append-version/append-annotation/read* — JSONL, first-arg rootDir for testability (mirrors the `scripts/lib/editorial/calendar.ts` convention)
- [x] Create `scripts/lib/editorial-review/index.ts` barrel export (re-exports types, pipeline, handlers)
- [x] Add `.editorial-draft-history.jsonl` and `.editorial-draft-pipeline.jsonl` as tracked files (empty, not gitignored; gitignore block updated to note the intentional non-ignore)
- [x] Create `src/sites/<site>/pages/dev/editorial-review/[slug].astro` route stubs (both sites) — 404 in prod via `import.meta.env.PROD` guard (matches `feature-image-preview.astro` pattern)
- [x] Create server endpoints under `src/sites/<site>/pages/api/dev/editorial-review/`: `annotate.ts`, `annotations.ts`, `decision.ts` — all 404 in prod. Shared handler logic in `scripts/lib/editorial-review/handlers.ts`
- [x] Unit tests: state-machine transitions (valid + invalid), history append/read round-trip, workflow create idempotence, annotation round-trip with version filtering, handler validation + success + 404/409 paths (36 tests total)

**Acceptance Criteria**

- `/editorial-status` works exactly as `/editorial-review` did (no behavior change, just a rename)
- State machine round-trips in unit tests
- Dev route loads a placeholder page in `npm run dev`; returns 404 in `npm run preview` (prod build)
- JSONL files append cleanly; malformed lines produce a per-line error, not an abort
- `/editorial-help` lists the new skill name and does not list the old one

#### Open questions (resolve before coding)

- Should the JSONL files live at the repo root (mirroring `.feature-image-*.jsonl`) or under `docs/`? (Proposed: **root** — same pattern as feature-image.)
- Do we need a separate pipeline file per site, or one shared file with a `site` field on each record? (Proposed: **shared file with `site` field** — avoids duplicating infrastructure. Workflows filter by site at read time.)

### Phase 9: Longform Annotation UI

**Deliverable:** Operator can open `/dev/editorial-review/<slug>` in the dev server, read the draft rendered in the real blog layout, annotate inline, and submit version decisions. The "iterate" action calls the Phase 10 skill via a well-documented hand-off; it does not invoke an agent directly.

#### Skill design

No new user-invocable skills in this phase. This is UI work that the Phase 10 skills will drive.

#### Implementation

Phase 9 adds two server endpoints beyond the three scaffolded in Phase 8, to support the UI:

- [x] `GET /api/dev/editorial-review/workflow` — fetch workflow + versions by id or (site, slug). `handleGetWorkflow` in `scripts/lib/editorial-review/handlers.ts`
- [x] `POST /api/dev/editorial-review/version` — operator edit-mode submission. Server appends a new `DraftVersion` with `originatedBy='operator'` and records an edit annotation carrying a line-level diff. `handleCreateVersion` + `lineDiff` / `applyLineDiff` helpers

Then the UI:

- [x] Mount the draft's markdown through the real blog layout. Route fetches workflow via `handleGetWorkflow`, parses the current version's frontmatter, renders the body through a remark→rehype pipeline, and mounts the result inside `BlogLayout.astro`. Feature image, headings, typography, spacing match production. Sticky review banner shows site/slug, state, version selector, and a "Phase 9 scaffold" note
- [x] Select-to-comment overlay:
  - [x] Client-side selection capture → range (character offsets against rendered plain text via TreeWalker; documented pragmatic choice over raw-MD offsets)
  - [x] Margin-note sidebar: list of comments, each highlighted in the text when hovered
  - [x] Category selector per comment — closed enum dropdown (voice-drift, missing-receipt, tutorial-framing, saas-vocabulary, fake-authority, structural, other)
- [x] Edit-mode toggle:
  - [x] Textarea shows raw MD of the current version (loaded from `draft-state` JSON block)
  - [x] On submit, POST `/api/dev/editorial-review/version` (server computes diff + appends `DraftVersion`)
  - [x] Edit-mode submissions create a new `DraftVersion` with `originatedBy: 'operator'` (enforced by endpoint)
  - [x] Save disabled when textarea unchanged from current-version markdown
- [x] Version selector: ?v=N URL param + clickable tab strip in the sticky banner (current version highlighted)
- [x] Controls: **Approve** (records approve annotation + state bridge if open → in-review → approved), **Iterate** (state bridge + transitions to iterating; alerts operator to run `/editorial-iterate <slug>` in Claude Code), **Reject** (prompts for optional reason, transitions to cancelled)
- [ ] Polling or SSE for annotation updates when the operator refreshes after the agent has iterated (deferred — operator reloads manually; low-value for single-user dev tool)

#### Tests

- [x] Edit-mode diff is reversible (applying the diff to the before-version yields the after-version) — tested via `lineDiff`/`applyLineDiff` round-trip for addition/substitution/deletion/multi-line MD
- [x] Character-offset ranges survive a round-trip through serialization — verified in `lifecycle.test.ts` comment-range-round-trip test + in handler tests
- [x] Full lifecycle (open → in-review → iterating → in-review → approved → applied) verified end-to-end in `lifecycle.test.ts`
- [ ] Approving from an older version than the current is flagged as an operator error (deferred — current UI always approves the visible version; rare edge case)
- [x] Prod build returns no prerendered `/dev/editorial-review/*` static output (verified via absence in dist/). `astro preview` not directly checkable due to @astrojs/netlify adapter limitation, but the `import.meta.env.PROD` 404 guard is unchanged across all Phase 8/9 endpoints and route stubs.

**Acceptance Criteria**

- Opening the current in-flight dispatch in `/dev/editorial-review/<slug>` renders the draft in the real blog layout
- Highlighting a sentence and attaching a comment persists and shows up on reload
- Toggling to edit mode and saving a change creates a new version visible in the version selector
- Approve / iterate / reject buttons each produce the correct state transition
- Route 404s in prod

#### Open questions (resolve before coding)

- Should comments be persistable at the HTML-rendered-offset level or the raw-MD-offset level? (Proposed: **raw MD** — stable across rendering changes. Display layer maps MD offsets to rendered DOM.)
- Do we need per-annotation threading (reply to a comment)? (Proposed: **no** — single-level annotations; if the operator wants to clarify, they edit the comment or add a new one.)
- When a new version is created, do existing annotations carry over? (Proposed: **no** — annotations are scoped to a specific version. The UI shows prior-version annotations but doesn't re-anchor them. This keeps the version audit trail honest.)

### Phase 10: Orchestration Skills for the Review Loop

**Deliverable:** The five skills that close the loop between the review UI and Claude Code. Operator can iterate a dispatch from v1 to approved-and-written-to-disk entirely through these skills.

#### Skill design (UX first)

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-draft-review` | `<slug>` (site inferred from where the draft lives) | Enqueues draft as an `open` workflow item; prints the dev URL; transitions state to `in-review` when operator opens the page |
| `/editorial-iterate` | `<slug>` | Reads all open annotations for current version, loads matching voice skill, produces new MD, appends version, transitions state |
| `/editorial-approve` | `<slug>` | Writes approved version to the real file; transitions to `applied`. Prints the next manual step (git status, diff, commit) |
| `/editorial-review-cancel` | `<slug>` | Transitions workflow to `cancelled`; leaves file untouched |
| `/editorial-review-help` | none | Reports: open workflows, in-review, approved pending apply; next action per workflow |

#### Implementation

- [x] `/editorial-draft-review` — resolves draft file path from slug + site, reads its current content as v1, calls `createWorkflow` (idempotent on natural key), returns dev URL
- [x] `/editorial-iterate` — key logic:
  - [x] Fetches workflow + versions via `handleGetWorkflow`; validates state is `iterating`
  - [x] Reads open comment annotations for the current version via `readAnnotations`
  - [x] Loads the matching voice skill (`audiocontrol-voice` for audiocontrol site, `editorialcontrol-voice` for editorialcontrol site) + relevant reference files
  - [x] Runs revision in the current Claude Code session; produces full-file markdown that addresses each annotation while holding to voice principles
  - [x] On completion, appends new `DraftVersion` with `originatedBy: 'agent'` and transitions `iterating` → `in-review`
- [x] `/editorial-approve` — finds approved version via the latest `approve` annotation, writes its markdown to `src/sites/<site>/pages/blog/<slug>/index.md`, transitions `approved` → `applied`, prints git next-steps. **No git operations.**
- [x] `/editorial-review-cancel` — validates non-terminal state, transitions to `cancelled`, leaves source file untouched, annotations remain in history
- [x] `/editorial-review-help` — reads pipeline, filters by state (and optional `--site`), renders a next-action table per workflow, with `--all` to include terminal states

**Important behavior**

- `/editorial-approve` **does not** run `git add`, `git commit`, or `git push`. It only writes the file. Operator drives the git operations.
- `/editorial-iterate` is a skill Markdown file, not a background process. It defines the conversation shape and hands off to the agent in the current session.

#### Tests

- [x] `/editorial-draft-review` idempotence — verified via `createWorkflow` natural-key test (`pipeline.test.ts`)
- [x] State-machine invariants protecting `/editorial-approve` re-run — `transitionState` rejects transitions out of `applied` (`pipeline.test.ts`); `handleStartLongform` idempotence (`handlers.test.ts`)
- [x] `/editorial-review-cancel` rejection on terminal state — covered by the state-machine terminal test (`pipeline.test.ts`)
- [x] `/editorial-review-help` reads the pipeline correctly — exercised via `listOpen`/`readWorkflows` tests (`pipeline.test.ts`) and the full `lifecycle.test.ts` end-to-end walk

**Acceptance Criteria**

- Full loop works end-to-end on a real draft: `/editorial-draft-review` → operator annotates → `/editorial-iterate` → operator reviews v2 → `/editorial-approve` → `git status` shows the expected file change
- No git operations happen as a side effect of any skill
- Voice skill is loaded automatically based on which site the draft belongs to

#### Open questions (resolve before coding)

- Should `/editorial-approve` also update the calendar entry's stage from Drafting to Review? (Proposed: **no** — approve means "this is the final prose." Stage transitions remain with `/editorial-publish`. Keeps the two pipelines orthogonal.)
- Iteration version cap: keep every version forever, or cap at N with compaction? (Proposed: **forever, append-only** — same rationale as feature-image history. Git-tracked, cheap, disposable if it ever becomes a problem.)
- Should the operator be able to seed `/editorial-draft-review` with an explicit voice-skill override (e.g., audiocontrol voice on an editorialcontrol draft)? (Proposed: **not initially** — site inference is almost always correct; override can be added if it becomes a pain point.)

### Phase 11: Short-form Review (Social Posts)

**Deliverable:** The same review pipeline handles Reddit titles and bodies, YouTube descriptions, LinkedIn posts, and newsletter blurbs — drafted using the voice skill + calendar context, reviewed through a list-style UI, approved into a `DistributionRecord` field.

**Motivation:** Short-form content is drafted more frequently than long-form (multiple platforms per post), benefits even more from voice consistency, and is where voice drift typically surfaces first (platform pressure toward generic social tone). The longform review loop already generalizes — this phase is mostly surface and integration work, not core pipeline.

#### Skill design

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-shortform-draft` | `<slug> <platform> [channel]` | Loads post metadata + voice skill, drafts platform-appropriate short-form content, enqueues as an `open` shortform workflow item |
| `/editorial-iterate` (extended) | `<slug>` — branches on workflow's `contentKind` | Same loop; for shortform, the revision target is short — typically one paragraph + optional link block |
| `/editorial-approve` (extended) | `<slug>` — branches on `contentKind` | For shortform, writes approved text to the attached `DistributionRecord.shortform` field; does NOT write to a file |

#### Data model changes

- [x] Extend `DraftWorkflowItem` with `contentKind: 'longform' | 'shortform'` (landed in Phase 8 types)
- [x] Add `platform?: Platform` and `channel?: string` fields (landed in Phase 8 types)
- [x] Extend `DistributionRecord` with optional `shortform?: string`
- [x] Calendar parser/writer round-trip `shortform` via a separate `## Shortform Copy` section (table cells are wrong for multi-line copy — emitted only when populated)

#### Implementation

- [ ] `/editorial-shortform-draft`:
  - [ ] Prompts for slug (if not supplied), platform, channel (if platform supports channels)
  - [ ] Loads post title, dek, target keywords, tags from calendar
  - [ ] Loads matching voice skill reference for short-form (`social-and-distribution.md` for audiocontrol, `cross-site-and-distribution.md` for editorialcontrol)
  - [ ] Runs first-pass draft in the current session; appends workflow + v1
- [ ] Dev route: `src/sites/<site>/pages/dev/editorial-review-shortform.astro` — list view of all open shortform workflows grouped by platform
- [ ] Per-workflow UI is inline (not a separate route) — each row expands to show the current version, annotation field, edit textarea, and approve/iterate buttons. Matches the feature-image gallery pattern more than the longform review pattern.
- [x] `/editorial-iterate` branches on `contentKind` — shortform path uses a terser iteration prompt (the voice skill reference for short-form, not longform)
- [ ] `/editorial-approve` for shortform writes to `DistributionRecord.shortform`, re-runs calendar round-trip test to confirm persistence, does not touch the filesystem outside the calendar MD

#### Tests

- [ ] Shortform workflow lifecycle: draft → iterate → approve → DistributionRecord updated
- [ ] Calendar round-trips with and without the `shortform` column
- [ ] `/editorial-shortform-draft` is idempotent: a second run on the same (slug, platform, channel) tuple reports the existing workflow and does not create a duplicate
- [ ] Iteration loop works with the short-form voice reference loaded (not the longform one)

**Acceptance Criteria**

- A Reddit title + body for an existing published post can be drafted, annotated, iterated, and approved
- YouTube description for a published video entry works the same way
- LinkedIn dispatch and newsletter blurb work the same way
- Approved text shows up in the calendar under the matching `DistributionRecord`
- No regressions to longform flow

#### Open questions (resolve before coding)

- Should shortform storage be `DistributionRecord.shortform` (single field) or a separate file? (Proposed: **DistributionRecord.shortform** — attached to the platform/channel, round-trips with the calendar, no separate storage to reason about.)
- Do Reddit submissions need title + body as separate fields (they're separate in Reddit's API), or one text blob? (Proposed: **one blob** with a convention like `title: ...\n\n<body>` or structured MD. Reddit-specific split can be added if it matters for the distribution skill later.)
- Should `/editorial-shortform-draft` auto-run after `/editorial-publish`? (Proposed: **no** — explicit invocation. Auto-chaining creates noise; the operator decides when a post is ready for distribution.)

### Phase 12: Voice-Library Feedback Signal

**Deliverable:** Annotation categories aggregate across approved drafts. A report shows which voice-skill principles are catching the most operator corrections, identifying where voice drift is happening most often. This is the Phase 11 fitness-scoring analog of feature-image, scoped to surface the signal — not to automatically mutate the voice skills.

**Motivation:** The voice skills (`audiocontrol-voice`, `editorialcontrol-voice`) are hand-calibrated right now. Over 20+ drafts, patterns will emerge: certain principles will produce drift more than others, certain SKILL.md sections will need refinement or forking. Phase 12 surfaces that signal; any revision to the voice skills stays manual for now.

#### Skill design

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-review-report` | None | Per-category counts across all approved drafts, top-level summary + per-site breakdown |

#### Data model

- [ ] `DraftAnnotation.comment` variant carries optional `category: AnnotationCategory` where `AnnotationCategory = 'voice-drift' | 'missing-receipt' | 'tutorial-framing' | 'saas-vocabulary' | 'fake-authority' | 'structural' | 'other'`
- [ ] Category is captured in the UI from Phase 9 (dropdown next to the comment input). Default is `'other'`.

#### Implementation

- [ ] Extend annotation type to carry `category`
- [ ] Update Phase 9 UI (retroactive) to show category dropdown on comment creation
- [ ] `/editorial-review-report` reads all history entries with state `applied`, aggregates annotation categories, produces:
  - [ ] Top-level table: category × count, ordered by frequency
  - [ ] Per-site breakdown: same table filtered by site
  - [ ] Per-voice-principle breakdown (optional stretch): map categories to specific SKILL.md sections for each voice skill. Requires a mapping table in the report module.
- [ ] Report is text-only (prints to terminal). No persistent output file — always re-computed from JSONL.

#### Tests

- [ ] Aggregation is correct for a synthetic JSONL with known category counts
- [ ] Per-site filter is correct
- [ ] Missing category defaults to `'other'` in the count

**Acceptance Criteria**

- `/editorial-review-report` prints a usable summary after ≥5 drafts have cycled through
- Operator can identify which voice principles are producing the most drift from the output
- No changes to the voice skills themselves happen automatically

#### Deferred: Automated voice-skill refinement

**Out of scope for Phase 12.** If the signal from `/editorial-review-report` is clear and stable, a follow-on feature could propose edits to the voice SKILL.md references — forking a new reference when a specific principle recurs, or tightening existing reference text. This is explicitly a human-driven refinement for now: the report surfaces the signal, the operator decides what to change.

#### Open questions (resolve before coding)

- Should categories be a closed enum or free-text with suggestions? (Proposed: **closed enum, `'other'` catch-all** — keeps the aggregate meaningful. Add categories via PRs when a new pattern emerges.)
- How do we handle edit-mode annotations (no explicit category) in the report? (Proposed: **treat as `'other'` with a note** — edit-mode is too heterogeneous to categorize without a separate taxonomy.)
- Should the report include rejected drafts? (Proposed: **yes** — rejection is a strong signal. Include with a separate column; a high-reject voice principle is a stronger drift indicator than a high-annotation one.)

## Verification Checklist

- [x] `npm run build` succeeds (no build breakage)
- [x] Calendar file is parseable by the script and readable by humans
- [x] All skill commands work end-to-end
- [x] Post scaffolding matches existing blog conventions
- [x] Analytics integration produces actionable suggestions
- [x] No secrets committed to the repository
- [ ] Dev-only review routes 404 in prod build (Phase 8)
- [ ] Longform annotation UI round-trips annotations without loss (Phase 9)
- [ ] `/editorial-approve` does not perform any git operations (Phase 10)
- [ ] Short-form drafts round-trip through `DistributionRecord.shortform` (Phase 11)
- [ ] `/editorial-review-report` produces a usable summary from ≥5 cycled drafts (Phase 12)
- [ ] `/dev/editorial-studio` unified dashboard returns 200 in dev, 404 in prod (Phase 13)

### Phase 13: Editorial Studio (unified dashboard)

**Deliverable:** A single dev-only URL — `/dev/editorial-studio` — shows the whole editorial-review pipeline at a glance, replaces the need to remember two URLs, and gives the operator a dashboard-level starting point analogous to `/dev/feature-image-preview`.

**Motivation:** Phases 9 and 11 shipped two specialized routes — per-slug longform (`/dev/editorial-review/<slug>`) and shortform list (`/dev/editorial-review-shortform`). Operators asked for one unified surface. A unified studio also lets future extensions (filters, bulk actions, polling) have a natural home.

#### Skill design

No new user-invocable skills in this phase. `/editorial-review-help` and `/editorial-help` are updated to link the studio URL at the top.

#### Files affected

- `scripts/lib/editorial-review/handlers.ts` — new `handleStartLongform` handler
- `src/sites/<site>/pages/api/dev/editorial-review/start-longform.ts` — thin POST endpoint (both sites)
- `src/sites/<site>/pages/dev/editorial-studio.astro` — the unified dashboard (both sites)
- `.claude/skills/editorial-review-help/SKILL.md` — add studio URL pointer
- `.claude/skills/editorial-help/SKILL.md` — link studio under the review-skills block
- `test/editorial-review/handlers.test.ts` — extend for handleStartLongform

#### Implementation

- [x] Add `handleStartLongform(rootDir, { site, slug })`:
  - [x] Validates `site` against the `SITES` list
  - [x] Reads `src/sites/<site>/pages/blog/<slug>/index.md` (400 on missing slug/site, 404 on missing file)
  - [x] Calls `createWorkflow` with `contentKind: 'longform'` and the file's markdown — idempotent on natural key
  - [x] Returns `{ workflow, existing: boolean }` so the UI can distinguish "created" vs "already existed"
- [x] Add `POST /api/dev/editorial-review/start-longform` endpoint (both sites) — thin wrapper around handleStartLongform
- [x] Create the studio route at `src/sites/<site>/pages/dev/editorial-studio.astro` (both sites; identical except `SITE` constant). Sections:
  - Masthead: "Editorial Studio · <site> · dev"
  - Pending panel: non-terminal workflows (open/in-review/iterating) grouped by state, sorted by `updatedAt` descending, link per-row to slug route (longform) or shortform list (shortform). Iterating rows show the exact `/editorial-iterate` command.
  - Approved panel: highlighted separately with the exact `/editorial-approve` command per row (with `--platform` / `--channel` for shortform)
  - Start-new longform form: dropdown of Published calendar entries that don't have an active longform workflow; submit POSTs to the new endpoint; on success redirects to the per-slug route
  - Shortform hint: the `/editorial-shortform-draft` command + link to `/dev/editorial-review-shortform`
  - Voice-drift mini-panel: top-2 categories from `buildReport()` when ≥5 terminal workflows; placeholder otherwise
  - Recent terminal panel: last 10 applied/cancelled workflows
- [x] Update `.claude/skills/editorial-review-help/SKILL.md` — link studio URL at the top
- [x] Update `.claude/skills/editorial-help/SKILL.md` — link studio URL and list all review-extension skills (Phases 10–13)
- [x] Unit test `handleStartLongform` — 5 tests covering happy path, idempotence, missing args, missing file, unknown site

#### Tests

- [x] `handleStartLongform` happy path — returns a new workflow with `existing: false`
- [x] Second call returns the same workflow with `existing: true`
- [x] 400 on missing slug or site argument
- [x] 400 on unknown site
- [x] 404 when blog file doesn't exist on disk

**Acceptance Criteria**

- `/dev/editorial-studio` renders in dev for both sites with non-empty content
- Pending panel shows all non-terminal workflows across longform + shortform
- Approved panel shows the exact `/editorial-approve` command per row
- Start-new longform form lists only Published entries without an active longform workflow; submitting enqueues and redirects
- Voice-drift panel respects the ≥5 sample threshold
- Route 404s in prod
- No regressions to Phase 8–12 behavior

### Phase 14: Studio as calendar command center + journal migration

**Deliverable:** The Editorial Studio becomes the situation room for the whole calendar — shows every entry grouped by stage with a next-move hint, drives mechanical state transitions via HTTP endpoints, and keeps cognitive work (drafting, revising, approving prose) in Claude Code. Concurrent with this, the editorial-review JSONL store is decomposed into per-entry files under `journal/editorial/` per the feature-image Phase 15 pattern, pre-empting merge-conflict pain.

**Motivation:** Post-Phase-13 the studio only sees the editorial-review pipeline's state; calendar stages (Ideas / Planned / Drafting / Review / Published) are invisible there. Operators bounce between `/editorial-status` in Claude Code and the studio URL. Merging this view gives one surface for "where is everything and what's the next move?" The journal migration is a timely add-on: feature-image Phase 15 landed on main last week and we know the two review JSONLs will eventually hit the same merge-conflict wall.

**Scope splits into four sub-deliverables, shipped as one PR.**

#### 14a. Calendar stage panels (read-only)

- [x] Studio reads the full calendar (all stages) in addition to the existing workflow fetch
- [x] Column layout: Ideas · Planned · Drafting · Review · Published, each a scrollable list of entries
- [x] Per-entry row surfaces: slug, title, stage-specific metadata (target keywords for Planned; issue number for Drafting/Review; publish date for Published), has-file indicator, active-workflow state + link if present
- [x] "Next move" column shows either a copy-to-clipboard Claude Code command (for cognitive actions) OR a button (for mechanical actions once 14b lands)
- [x] Filter + search from Phase 13 continues to work against the expanded list

**Acceptance:** a freshly-loaded studio shows at least one entry in every stage column that currently has data, without requiring the operator to run `/editorial-status`.

#### 14b. Mechanical-action endpoints + buttons

- [x] Add `scripts/lib/editorial-calendar-actions/` — `types.ts` (request/response shapes), `handlers.ts` (`handleDraftStart`, `handlePublish`), mirroring the thin-handler pattern from `scripts/lib/editorial-review/handlers.ts`
- [x] `handleDraftStart(rootDir, { site, slug })` — validates slug via the existing `SLUG_RE`, reads the Planned entry, calls `scaffoldBlogPost`, writes the calendar. Returns `{ entry, filePath, relativePath }` or `{ error }`. *GitHub issue creation dropped per user direction — handlers never shell out to `gh`.*
- [x] `handlePublish(rootDir, { site, slug })` — flips stage to Published, sets `datePublished` to today. Returns `{ entry }` or `{ error }`. *GitHub issue closing dropped — same rationale as above.*
- [x] Wire `POST /api/dev/editorial-calendar/draft` and `/publish` on both sites (thin wrappers, identical across sites modulo nothing — they take site in the body)
- [x] Studio rows gain a button for each mechanical action applicable to that stage; button POSTs the endpoint, reloads on success, toasts on error
- [x] Unit tests for `handleDraftStart` and `handlePublish` — happy path, 400 on missing args, 404 on unknown slug, 409 on illegal stage transition, 409 on file-already-exists, 500 on other scaffold I/O failures, calendar-not-mutated-on-scaffold-failure

**Acceptance:** from a Planned entry with just a calendar row, the operator clicks "Scaffold draft" in the studio, the blog file appears on disk, the GH issue is created, the entry moves to Drafting, and the studio reloads with the row now in the Drafting column.

#### 14c. Journal migration for editorial-review

- [x] Extract `scripts/feature-image/journal.ts` → `scripts/lib/journal/index.ts` as a shared generic record-store module. Feature-image now re-exports from the shared path.
- [x] `scripts/lib/editorial-review/pipeline.ts` — switch `readWorkflows`/`readHistory` (and their writers) from JSONL append to journal directory. Paths: `journal/editorial/history/` and `journal/editorial/pipeline/`.
- [x] Public API stays identical — downstream callers (`handlers.ts`, `report.ts`, route frontmatter, skills) do not change.
- [x] `scripts/lib/editorial-review/migrate-journal.ts` — one-shot idempotent migration. Reads the two legacy JSONL files, writes per-entry JSON under `journal/editorial/`, creates `journal/editorial/MIGRATED.txt` with per-store counts and a timestamp. Running it again is a no-op.
- [x] `--dry-run` flag previews without writing
- [x] Update `.gitignore` note — editorial-review journal lives under `journal/editorial/`, intentionally tracked
- [x] Delete the legacy `.editorial-draft-history.jsonl` and `.editorial-draft-pipeline.jsonl` files after a clean migration run + verification
- [x] Unit tests — migration correctness, idempotence, `--dry-run` produces no writes, journal module direct unit tests
- [x] All existing editorial-review tests continue to pass against the new store

**Acceptance:** after migration, `.editorial-draft-*.jsonl` are gone; `journal/editorial/` has all prior records as individual JSON files; every editorial-review test passes without changes to the test code.

#### 14d. Polish

- [x] Short-form draft queue panel — matrix of Published entries × platforms (reddit/linkedin/youtube/instagram), cell shaded if `DistributionRecord.shortform` is populated for that (slug, platform) tuple. Empty cells surface the exact `/editorial-shortform-draft` command.
- [x] Column-jump keyboard shortcuts — `1`–`5` focuses the matching stage column
- [ ] ~~GH issue status per entry~~ — dropped; handlers no longer touch `gh`.

**Acceptance:** operator can see shortform coverage at a glance; pressing `3` jumps to the Drafting column.

#### Open questions (resolve before coding)

- Should `handlePublish` require the entry to already be in `Review` stage, or allow directly from `Drafting`? (Proposed: **allow from either** — the review pipeline (editorial-review extension) and the calendar stages (original feature) are orthogonal; blocking on calendar-stage `Review` would require the operator to run an explicit "mark for review" action we don't have a skill for. Revisit if it causes confusion.)
- Should `handleDraftStart` call `gh` directly, or return an issue draft for the operator to create manually? (Proposed: **call `gh` directly** — the operator already authenticated once for the existing `/editorial-draft` skill, and we're replicating that skill's behavior. Add a `--skip-gh-issue` flag on the endpoint for testing.)
- Journal migration: migrate-and-delete in one step, or two phases (migrate, verify, then delete)? (Proposed: **one PR, two commits**: first commit lands journal + migration; second commit deletes the JSONLs after the migration runs clean.)
- Share `scripts/lib/journal/` with feature-image-generator now, or extract later? (Proposed: **share now** — the module on main is already generic; moving it costs ~5 minutes of path updates.)

#### Verification

- [x] `npm run build` clean on both sites
- [x] `npx vitest run` — all pre-existing tests pass (2 s330 failures unrelated to this branch); new tests for `handleDraftStart`, `handlePublish`, and the migration script all green
- [x] Manual end-to-end: scaffolding and publish flow exercised via studio UI buttons; shortform matrix + copy commands verified
- [x] Journal migration: exercised against fresh repo (receipt written, subsequent runs no-op); pipeline/history records serialize + deserialize identically

### Phase 15: Review-UI fixes, dblclick-to-edit, the Manual, multi-site consolidation

**Deliverable:** Four in-flight commits on `feature/editorial-calendar` atop the merged Phase 14: the longform review UI now actually works end-to-end, the rendered draft accepts a double-click to enter edit mode, a Compositor's Manual lives at `/dev/editorial-help`, and the editorial dev routes have been consolidated to a single multi-site studio hosted on editorialcontrol.

**Motivation:** Phase 14 shipped a structurally broken longform review (strip + sidebar + modal + client script rendering outside `</html>` because of a two-sibling Astro template). User reported "couldn't edit or comment" and "big gaps between text blocks"; root cause was the document structure plus a missing `.hidden { display: none }` rule. Also: the two-site lockstep pattern duplicated ~1,750 lines across byte-identical dev routes. User asked for a single multi-site studio; that refactor also kills the duplication.

#### 15a. Longform review UI — make edit + comment actually work

- [x] Move all review chrome (strip, sidebar, modal, toast, shortcuts overlay, poll indicator, `#draft-state` JSON, client-module import) INSIDE the `BlogLayout` slot so the client script actually attaches.
- [x] Add `#draft-body.hidden { display: none }` — without it `.hidden` is a no-op and the textarea renders 6000px below the fold.
- [x] Neutralize editorialcontrol's drop-cap leak onto the margin-notes sidebar (`!important` override scoped to `.er-review-shell`).
- [x] Auto-scroll the textarea into view on edit-enter + focus it; `scroll-margin-top: 5rem` so it clears the fixed strip.
- [x] Tighten review-mode prose rhythm (h2 3rem → 1.75rem, p 1.25rem → 0.9rem) so the view is dense without losing hierarchy.
- [x] Add a strip hint ("select text to mark · double-click to edit · ? for shortcuts") for discoverability.

**Acceptance:** clicking Edit hides the rendered draft and shows the textarea focused and in view; selecting text in the draft raises the Mark button and submitting saves a comment that highlights on reload. Verified end-to-end via Playwright.

#### 15b. Double-click to edit

- [x] `dblclick` on `#draft-body` fires `enterEdit()`; guarded against dbl-clicking an existing highlight (reserved for comment navigation).
- [x] Clears the browser-generated word selection on entry so the Mark button doesn't race with the textarea.
- [x] `cursor: text` + native `title` tooltip on the draft body for discoverability.
- [x] Shortcuts overlay row for `e` / dbl-click toggling edit mode.

#### 15c. The Compositor's Manual

- [x] `/dev/editorial-help` on editorialcontrol — a dev-only help page in the press-check desk voice.
- [x] Six sections: (I) the two state machines as typographic diagrams, (II) three tracks (longform/shortform/distribution), (III) alphabetised skill catalogue with kind stamps, (IV) studio map, (V) worked run-through, (VI) reference card.
- [x] `src/shared/editorial-help.css` companion stylesheet (`body[data-review-ui="manual"]` scope).
- [x] Linked from the studio masthead in red-pencil.

#### 15d. Multi-site consolidation

- [x] Studio reads every site's calendar and workflow; per-row site badge (AC / EC) and `data-site` on every action button.
- [x] Site chip strip in the filter bar (all / ac / ec); filter also scopes the shortform coverage matrix.
- [x] `editorial-studio-client.ts` reads site from `data-site` on the clicked button rather than a page-wide marker; site-chip handler added to `initFilter`.
- [x] Shortform review page reads every site's open shortforms; per-card site badge.
- [x] Longform review accepts `?site=<site>` query param (default editorialcontrol); renders in editorialcontrol's BlogLayout regardless to avoid cross-site style-graph tangle.
- [x] Help page drops the `SITE` constant; imprint says "audiocontrol.org · editorialcontrol.org".
- [x] Delete audiocontrol's duplicate dev routes and API endpoints (1,752 lines removed).
- [x] `.er-row-site` badge rule promoted to `editorial-review.css` so shortform + longform inherit it.

**Acceptance:** running `npm run dev:editorialcontrol`, `/dev/editorial-studio` shows entries from both sites; clicking the AC chip narrows to audiocontrol-only rows; scaffold / publish buttons POST with the correct site; `/dev/editorial-review/<slug>?site=<site>` looks up the right workflow. Audiocontrol dev server no longer has editorial routes (by design).

#### Verification

- [x] `npm run build` clean on both sites
- [x] `npx vitest run` — 224 tests pass (2 pre-existing network-integration failures unrelated)
- [x] Live verification: edit toggle, text-select → Mark → modal → submit → highlight on reload, dblclick → edit mode, site chip filter, per-site action routing all exercised via Playwright
- [x] Net −1,644 lines of duplicated code removed

### Phase 16: Pipeline drive-through — skill helpers, voice-skill consultation, body-state gate, first drafted dispatch, session archive

**Deliverable:** 13 commits on `feature/editorial-calendar` atop the merged Phase 15. Walked the pipeline by-the-book for the first time, found and fixed every friction point as it surfaced, drafted the first dispatch end-to-end, and added the session-transcript archive so future LLM-analysis sessions have data to work against.

**Motivation:** Phase 15 shipped a multi-site studio but had never been driven end-to-end from Ideas → Drafting by a human operator plus Claude. The test-drive surfaced a series of gaps — some procedural (one-liners instead of helpers), some structural (scaffold→draft step missing from the studio UI), some visual (dark-on-dark body text, Mark pencil positioning off by ~900px, host-site header occluding the review chrome). The thesis of the article we drafted during this phase ("You Don't Need a Better Prompt. You Need Selection Pressure.") is that evolution-by-selection is a daily-workflow posture — every friction point is an opportunity to fix the tool. This phase is that thesis made literal.

#### 16a. Ideas, plans, and the first drafted dispatch

- [x] Batch-added 7 new ideas, moved 5 from audiocontrol → editorialcontrol per operator classification rule ("general AI-agents / content-marketing → EC; developing the audiocontrol project → AC"). AC now has 4 Ideas + 10 Published; EC has 9 Ideas + 2 Published.
- [x] Planned `evolution-by-artificial-selection-for-prompt-generation` on EC. Two strategic calls: (1) wide-net keywords over narrow "SEO heroes" until analytics data earns the narrowing; (2) consulted `editorialcontrol-voice` skill mid-planning to reframe the title from a topic-header to the site's signature two-sentence claim — "You Don't Need a Better Prompt. You Need Selection Pressure." Paired with `feature-image-automation-evolution-gallery-claude-code` (the applied half); cross-link decision pinned in both descriptions.
- [x] Drafted the dispatch (~1,900 words). Uses the site's signature moves: thesis → two failure modes (the perfectionist, the collector) → third option; worked example with date-receipts on the feature-image library; "If you're still reading, here's the short version" numbered list; meta-move close that names the dispatch's own reframing by the voice skill.

#### 16b. Skill-helper + voice-skill enshrinement

- [x] `.claude/skills/editorial-draft-review/enqueue.ts` — reusable helper that reads the blog file, calls `createWorkflow`, reports fresh-vs-existing + any body-state warning. Replaces the earlier ad-hoc `npx tsx -e "..."` pattern. Also auto-syncs: when an existing workflow's current version differs from the file, the helper appends a new version instead of silently returning the stale one.
- [x] `/editorial-plan`, `/editorial-draft`, `/editorial-draft-review` skills updated to MANDATE voice-skill consultation before any copy generation (title/dek framing at plan time, body drafting at draft time). `/editorial-draft` also grew a dual-mode flow (missing-scaffold vs placeholder-body) to support the studio's Scaffold button flow.
- [x] Removed stale GitHub-issue language from `/editorial-draft` (dropped in Phase 14; skill doc was outdated).

#### 16c. Studio + review-page fixes surfaced by the drive-through

- [x] **Body-state detection.** `scripts/lib/editorial/body-state.ts` classifies a scaffolded post as `missing | placeholder | written`. Studio rows in Drafting/Review now branch on this: placeholder body → `draft body →` primary action; written body → `copy /review`. File dot colors match. Unit tests: 9 cases including the regression for scaffoldBlogPost's blank-line-between-frontmatter-and-H1 shape.
- [x] **Stale v1 on review page.** Review page reads `currentVersion.markdown` from the journal, not disk. Workflow enqueued with placeholder v1 showed the placeholder long after the file had real prose. Enqueue helper now detects divergence and appends a new version.
- [x] **Host site header occluded the review chrome.** Editorialcontrol's header is `position: sticky; top: 0; z-index: 100` — won the z-index fight vs. the review strip and margin sidebar. Hidden on longform review pages via `body:has([data-review-ui="longform"]) .header-wrapper { display: none }`.
- [x] **Dark-on-dark body text.** `[data-review-ui]` sets `color: var(--er-ink)` — correct on cream studio/shortform pages, wrong on the dark BlogLayout-hosted longform page. `#draft-body` now gets an explicit `color: hsl(var(--foreground))` so prose cascades from the host token; tag-specific host rules (em/strong/a/code/h2/h3) keep their own colors.
- [x] **Scaffold chrome in the body.** Voice-skill reference prescribed an in-body byline + rule + "In this dispatch" numbered ToC, but the shipped dispatches on the site don't follow that — BlogLayout handles byline + auto-ToC. Stripped the in-body chrome; draft now matches the shape of shipped dispatches. Noted: the voice-skill reference is out of date on this detail.
- [x] **Click-in-margin to mark.** The natural operator gesture (select text → click margin area) now opens the Mark modal. `mousedown` on the marginalia sidebar preventDefaults so the selection survives; `click` opens the modal if a pending range is set, otherwise toasts the instruction.
- [x] **Mark pencil visibility.** Bigger (opsz 36/wght 700), heavier shadow + cream halo, one-shot pulse animation on spawn, downward-pointing triangle tip anchoring it to the selection below.
- [x] **Mark pencil positioning bug.** `top = window.scrollY + rect.top - 34` assumed document-absolute coordinates but `position: absolute` is offsetParent-relative. Result: pencil rendered ~900px below the selection — invisible to the operator since Phase 14. Fixed with `rect.top - offsetParent.top - offsetHeight - 14` and CSS `translate(-50%, 0)` for horizontal centering.

#### 16d. Session-transcript archive

- [x] Ported `tools/extract-session-content.ts` from `../audiocontrol/`. Scoped by default to this monorepo's Claude session dir (not every project on the laptop).
- [x] Added focused `/extract-session-content` skill that just runs the extractor (no LLM analysis, no report). Larger pipeline (extract → encrypt → LLM → report) stays in the parent repo.
- [x] Archived the 2 sessions leading into this phase's test-drive: 3,376 entries, ~2.9MB encrypted across `data/sessions/content/`.

#### Verification

- [x] `npm run build` clean on both sites.
- [x] 232 tests pass (9 new `bodyState` tests + 2 pre-existing network-integration failures unrelated).
- [x] Drove the full pipeline: `/editorial-add` → `/editorial-plan` → Scaffold button (studio) → `/editorial-draft` → `/editorial-draft-review` → review page rendering the drafted dispatch with all four sites of review UI working (Edit toggle, margin-click / pencil-click Mark, selection highlight, iterate/approve buttons).
- [x] Session content extractor: 2 sessions encrypted, decrypt round-trip verified on one file.

### Phase 17: Content collections + draft prod gate + outline stage

**Deliverable:** Three reviewable commits that (a) migrate blog articles from file-based routing to Astro content collections, (b) add a `state: draft | published` frontmatter field that gates production rendering while keeping dev unchanged, and (c) introduce a new `Outlining` calendar stage with an outline-review sub-workflow, all applied recursively to the SSOT invariant established in Phase 16.

**Motivation:** The Phase 16 drive-through surfaced two architectural gaps that only became visible once the pipeline was exercised end-to-end.

1. **No outline phase.** The pipeline goes straight from a planned brief to a fully-drafted first version. Real editorial teams outline first; the operator reviews the shape before the agent invests in prose. Without this step, iteration burns tokens on structural problems that a 30-second outline review would have caught.
2. **No draft/publish gate.** Any in-flight article in `src/sites/<site>/pages/blog/<slug>/` is visible on production the moment it's built. The SSOT invariant says disk IS the article — which means the article file exists from scaffold time forward, long before it's ready for the world.

The user also raised a data-ownership question applying the SSOT invariant recursively: if the article file owns the article's content, should it also own the article's lifecycle state? The agreed answer: **split ownership by who writes most often.** Workflow state (churn-heavy, machine-owned) stays in the journal. A single `state: draft | published` field (rarely written, human-owned at publish time) moves to frontmatter as the production-render gate. Dek ownership passes from calendar to `index.md` frontmatter at scaffold time (calendar flushes once, then frontmatter is authoritative).

File-based routing can't conditionally skip pages, so the gate requires content collections: `src/sites/<site>/content/blog/<slug>/index.md` plus a dynamic `[slug].astro` route whose `getStaticPaths` filters on `state` (in prod) or passes everything (in dev). This is the Astro-native shape blogs "should have had from the beginning."

#### 17a. Content collections migration

- [x] Add `src/sites/<site>/content.config.ts` (×2 sites) with a Zod schema for the blog collection. Schema mirrors current frontmatter (title, description, date, datePublished, dateModified, author, optional feature-image fields) plus `state: z.enum(['draft', 'published']).default('draft')`.
- [x] Move every `src/sites/<site>/pages/blog/<slug>/index.md` → `src/sites/<site>/content/blog/<slug>/index.md`. Keep the directory shape so co-located images (`images/...`) resolve with their existing relative imports.
- [x] Add `src/sites/<site>/pages/blog/[slug].astro` (×2 sites) — dynamic route. `getStaticPaths` returns all entries in the `blog` collection with `params.slug`. The component renders via `<Content />` from `entry.render()` wrapped in `BlogLayout`.
- [x] Drop obsolete `layout:` frontmatter lines from every migrated article (Astro content collections don't use the frontmatter `layout` mechanism).
- [x] Update `src/sites/<site>/pages/blog/index.astro` to use `getCollection('blog')` instead of `Astro.glob()` / `import.meta.glob()`.
- [x] Backfill `state` in frontmatter for every existing article: merged/published posts get `state: published`; the in-flight `evolution-by-artificial-selection-for-prompt-generation` on editorialcontrol gets `state: draft`.
- [x] Update every path reference in helper scripts and skills: `scripts/lib/editorial/scaffold.ts`, `scripts/lib/editorial/body-state.ts`, `scripts/lib/editorial-review/handlers.ts`, `.claude/skills/editorial-draft-review/enqueue.ts`, `.claude/skills/editorial-iterate/finalize.ts`, `.claude/skills/editorial-approve/apply.ts`, `.claude/skills/editorial-draft/SKILL.md`, `.claude/skills/editorial-draft-review/SKILL.md`, feature-image generator refs, sitemap/customPages config in `astro.config.mjs`.
- [x] Update test fixtures in `test/editorial-review/*.test.ts` and `test/editorial/body-state.test.ts` to scaffold blog files under the new `content/blog/` path.
- [x] Update `scaffoldBlogPost()` to write under `content/blog/` and include `state: 'draft'` in the frontmatter it generates.

**Acceptance criteria — 17a:**

- [x] `npm run build` succeeds on both sites with all existing articles rendering at their existing URLs.
- [x] `npm test` passes (vitest suite adjusted for new paths).
- [x] Feature image generation still locates source articles via the new content collection path.
- [x] Dev server renders the in-flight draft at `/blog/evolution-by-artificial-selection-for-prompt-generation` on both sites.
- [x] No URL change for any shipped article (the dynamic `[slug]` route preserves `/blog/<slug>/`).

#### 17b. Draft prod gate

- [x] `getStaticPaths` in `[slug].astro` filters by `state`:
  ```ts
  const entries = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.state === 'published' : true
  );
  ```
- [x] Blog index page (`pages/blog/index.astro`) applies the same env-gated filter so drafts don't appear in the listing in prod.
- [x] Sitemap config in `astro.config.mjs` — verify the `@astrojs/sitemap` integration only sees the built pages. Because `getStaticPaths` omits drafts in prod, they're auto-excluded from the sitemap.
- [x] Feature-image OG generation for drafts still works in dev (needed for review UI previews) but prod build skips drafts naturally.

**Acceptance criteria — 17b:**

- [x] `npm run dev` renders both draft and published articles.
- [x] `npm run build` produces zero HTML files for draft articles; curl against the built output for a draft slug returns a 404 (or no file).
- [x] Blog index in built prod output excludes drafts; blog index in dev includes them.
- [x] Sitemap in the prod build excludes draft slugs.
- [x] Review UI at `/dev/editorial-review/<slug>` still works for draft articles (dev-only, unchanged).

#### 17c. Outline stage + backfill

- [x] Add `'Outlining'` to the `STAGES` array in `scripts/lib/editorial/types.ts`, inserted between `'Planned'` and `'Drafting'`. Update the markdown calendar parser/writer to round-trip the new stage's table.
- [x] Extend the `contentKind` union on `DraftWorkflowItem` to include `'outline'` (join `'longform' | 'shortform'`). Update discriminant usage in handlers and skills.
- [x] New skill `/editorial-outline` — loads the voice skill, reads the calendar brief, appends a `## Outline` body section to `index.md` under the scaffolded `# <title>` heading, transitions calendar stage to `Outlining`, enqueues an outline review workflow in `open` via `createWorkflow({ contentKind: 'outline' })`.
- [x] New skill `/editorial-outline-approve` (helper: `.claude/skills/editorial-outline-approve/apply.ts`) — advances calendar stage `Outlining` → `Drafting` in one click. Does not write the draft; that's the job of `/editorial-draft`, which now preserves the approved outline in the body during drafting.
- [x] `/editorial-iterate` branches on `workflow.contentKind`: for `'outline'`, finalize snapshots the updated outline section. For `'longform'`, behavior is unchanged.
- [x] `/editorial-approve` refuses (or no-ops) for `contentKind: 'outline'` — outline approval is a one-click advance (17c), not the terminal write step.
- [ ] Studio row display: new column or pill indicating contentKind so the operator can see at a glance which workflows are outline-vs-longform.
- [x] Backfill: add a `## Outline` section to `evolution-by-artificial-selection-for-prompt-generation/index.md`, rewind calendar entry from `Drafting` → `Outlining`, create an outline review workflow in state `iterating`.

**Acceptance criteria — 17c:**

- [x] A Planned entry can be advanced to Outlining via `/editorial-outline <slug>`, produces a `## Outline` section on disk, and creates a workflow with `contentKind: 'outline'`.
- [x] The operator can iterate on the outline via the existing review UI — margin notes, Save, Iterate all work end-to-end because contentKind branching is invisible to the UI layer.
- [x] Approving the outline (via `/editorial-outline-approve`) advances the calendar to Drafting; disk is unchanged except for the calendar file.
- [x] `/editorial-draft` run on an entry in Drafting with an existing `## Outline` section writes the article body but leaves the outline section intact (agent can consult it while drafting).
- [x] The evolution dispatch shows up in the studio as an outline-in-iteration, with the rest of the pipeline state (current version, annotations) preserved.

### Phase 17d: Review-UI and studio follow-ons surfaced by the drive-through

**Deliverable:** Ten commits on `feature/editorial-calendar` addressing bugs, UX gaps, and architectural improvements surfaced by driving the evolution dispatch through the newly-shipped Outlining stage.

**Motivation:** Phase 17c shipped the pipeline code but left several UX gaps that only became visible once a real operator used the new stage: no actions in the Outlining studio row, wrong clipboard commands, a deep-link that pointed at the wrong workflow, a quote-offset bug, margin notes disappearing after edits. Each one was a follow-on of Phase 17c; none were worth deferring to a separate phase.

- [x] Studio renders actions for Outlining rows (review outline / iterate outline / approve outline buttons keyed to workflow state).
- [x] `/dev/editorial-review/[slug]` accepts `?kind=outline` to select the outline workflow; studio's `workflowLink()` emits the param.
- [x] Iterate and Approve buttons in the review UI emit contentKind-aware commands (`/editorial-iterate --kind outline`, `/editorial-outline-approve`).
- [x] `extractQuote` aligned with `computeOffsetFromRange`'s walker coordinate space; margin-note quotes no longer drop leading/trailing chars on block-heavy markdown.
- [x] Comment annotations grow an `anchor?: string` field capturing the quote text at creation time. On later versions, the client rebases comments via `indexOf(anchor)`: if unique in the current body, render as "from v{N}" with highlight at the new position; if missing/ambiguous, render as "from v{N} · unresolved" in the sidebar only.
- [x] Resolve/re-open as a new `ResolveAnnotation` type (`type: 'resolve'`, `commentId`, `resolved`). Append-only; re-open is a second resolve with `resolved: false`. Live items grow a Resolve button; resolved items archive to a collapsible `Resolved (N) ▾` footer with a Re-open button.
- [x] `/dev/` index pages per site listing all dev-only surfaces.
- [x] `← studio` back-link in the review chrome; `← /dev` in the studio masthead. Scoped CSS to beat BlogLayout's prose.css link color.
- [x] `bodyState` strips the `## Outline` section before classifying — a post with a filled-in outline and a placeholder body correctly reports `placeholder`, so the studio surfaces the `draft body →` action instead of `copy /review`.
- [x] Full dispatch body drafted (v1) for `evolution-by-artificial-selection-for-prompt-generation`, ~2,000 words against editorialcontrol-voice + dispatch-longform reference.

**Acceptance criteria — 17d:**

- [x] Every new UI affordance built for outline workflows renders correctly for both longform and outline kinds — no regressions.
- [x] Margin notes survive version bumps: either anchor-rebased (highlight + sidebar) or unresolved (sidebar-only, operator can resolve or re-anchor). Verified on the evolution dispatch across v1-v8.
- [x] Resolve and Re-open both persist across page reload + version switches.
- [x] `npm test` passes (248+ tests, 2 pre-existing network-integration failures unrelated).
- [x] `npm run build` clean on both sites; drafts still excluded from prod.

#### Open questions — 17

- Should the outline section be stripped from the article on publish, preserved as a commented-out block, or kept as an authored section? (Proposed: **preserve inline as-authored** for the first pass. Operators who want it gone can strip manually; we can add an auto-strip later if it becomes a pattern.)
- Does the outline workflow need its own list view in the studio, or does the existing unified list with a contentKind pill cover it? (Proposed: **unified list with pill** — avoids multiplying surfaces. Revisit if outline reviews get lost.)
- Should there be an `Outline Approved` explicit sub-stage, or is the Outlining → Drafting transition sufficient signal? (Proposed: **just Drafting** — the outline is approved when the workflow moves to Drafting; a separate "outline approved" stage would be redundant with the calendar stage transition.)

### Phase 17e: Iterate-loop helpers, disposition stamps, editor UX polish

**Deliverable:** Thirteen commits + two merged PRs (#111, #112) covering iterate-loop infrastructure, per-iteration disposition tracking, editor/preview UX refinements, and a full iteration run on the evolution dispatch (v3 → v12).

**Motivation:** Driving the evolution dispatch through multiple iterate rounds surfaced systemic gaps that were worth fixing rather than routing around: operators had no durable signal of what the agent addressed vs. deferred; `pending.ts` silently dropped carried-forward comments; the sidebar's anchor preview pulled stale offset slices; the editor opened at position 0 ignoring where the operator was reading; the preview showed the outline scaffold that the drawer feature was supposed to hide; the preview didn't follow the editor in split view.

- [x] `pending.ts` iterate pre-step helper — prints workflow state + pending comments; non-zero exit codes for no-workflow / wrong-state / nothing-to-iterate. Replaces ad-hoc tsx one-liners.
- [x] `AddressAnnotation` type + `/api/dev/editorial-review/annotate` support — agent-written per-iteration dispositions (`addressed` | `deferred` | `wontfix`, optional `reason`).
- [x] `finalize.ts --dispositions <path>` — accepts JSON map keyed by comment id; writes one address annotation per entry after appending the new version.
- [x] Sidebar stamp UI: ◆ addressed (amber) / ◇ deferred (graphite) / ✕ wontfix (red-pencil), keyed to the editorialcontrol tagline glyph so the marks feel native.
- [x] `addressed` disposition auto-resolves the comment via paired `ResolveAnnotation`. `deferred` and `wontfix` stay in the live sidebar — both "keep operator in the loop" states.
- [x] `pending.ts` treats every unresolved comment as pending regardless of origin version. The earlier current-only filter silently dropped carried-forward concerns.
- [x] Sidebar quote sourced from `annotation.anchor` (the captured selection text) rather than a slice of the current body at the comment's original range — offsets drift, anchor doesn't. Only legacy comments fall back to range-slicing.
- [x] Double-click enters edit mode with the cursor at the clicked word. Captures a context-limited snippet (single paragraph, word-boundary snapped) and uses `indexOf` on the source; falls back to the raw clicked word if the full snippet doesn't uniquely match. Adds `EditorHandle.setCursor(pos)`.
- [x] Markdown preview pane strips the `## Outline` section via `splitOutline` before rendering — matches the remark-strip-outline plugin used in the prod build, so preview and prod render agree.
- [x] Heading-anchored scroll sync in split view (editor → preview). Finds the last `## N` heading at or above the editor's topmost visible line; scrolls the matching `<h2>` in the preview to the top. Proportional sync rejected because editor length ≠ preview length.
- [x] Evolution dispatch iterated v3 → v12 across multiple operator feedback rounds: compressed frontmatter dek, retired "shifting subject matter" abstraction in favor of concrete receipts (model releases, platform rules, failure modes), renamed §01 trap → instinct, inserted new §01 "The garden and the thicket" per operator's structural ask with downstream section renumbering, added "Drift is the default" TL;DR item.
- [x] Intake: `socratic-coding-agents` to editorialcontrol Ideas (placeholder title + description; refine at `/editorial-plan` time).

**Acceptance criteria — 17e:**

- [x] Every iterate run uses `pending.ts` / `finalize.ts` — no one-liner regressions in SKILL.md.
- [x] Address annotations produce correct sidebar stamps for all three dispositions; `addressed` auto-resolves the comment.
- [x] Double-click lands the CodeMirror cursor at the clicked word for prose-heavy sections; falls back to position 0 only when the snippet is ambiguous.
- [x] Markdown preview pane never shows the outline section, even when the caller passes the rejoined source.
- [x] Split-view preview follows editor scroll via heading anchors — verified against the evolution dispatch's six-section body.
- [x] Both PRs (#111, #112) merge-cleanly to main.

### Phase 17f: Studio intake flow + blog figures/lightbox + first editorial-control dispatch ships

**Deliverable:** Same-day continuation of 17e. PR #113 merged (preview outline-strip, scroll sync, evolution v10–v12). Shipped: studio intake form, clipboard fallback for LAN browsers, signature-based polling (no more flicker), blog figure/caption + lightbox + pull-quote support, midi-to-mcu idea intake on audiocontrol, `building-the-editorial-calendar-feature` article carried from v3 through v19 and approved for publication.

**Motivation:** Further pipeline drive-through of the editorial calendar surfaced gaps every time the operator tried to do real work on it. Each gap was small, localized, and cheaper to fix in-place than to defer. In parallel, iterating the meta-article on the editorial calendar itself exercised the entire toolchain end-to-end and produced a worked example inside the post.

- [x] Dev servers bind to all interfaces via `--host` so LAN access works (`http://orion-m4:4321/`).
- [x] Studio 'intake new idea →' button in the Ideas section header — copies `/editorial-add` to clipboard as a pure hand-off (phase 1).
- [x] `execCommand('copy')` fallback when the async Clipboard API is blocked on insecure contexts (LAN browser → dev HTTP server).
- [x] Inline intake sheet under the Ideas header (phase 2) — site / title / description / content type / optional content URL; assembles a self-contained natural-language prompt that instructs the agent to run `/editorial-add` non-interactively.
- [x] Polling reload skips when any input/textarea/select has focus OR the intake form is open — no more nuked in-progress input.
- [x] Signature-based polling — new dev-only `/api/dev/editorial-studio/state-signature` endpoint returns a 16-char hash compounded from calendar-file mtimes, workflow pipeline/history directories, and per-site content directories. Reload only fires when the hash changes, so the flicker only appears when underlying data actually moves.
- [x] Intake for `midi-to-mcu-macro-bridge` on audiocontrol via the new intake flow (first use of the new form end-to-end); planned into Planned stage with voice-skill-informed title + dek + 14 keywords + 5 topics.
- [x] Blog figure support — new `remark-image-figure.mjs` wraps standalone `![alt](src)` in `<figure><figcaption>`. Registered in both public Astro pipelines AND the editorial-review unified render pipeline so captions show in both the production blog and the review surface.
- [x] Lightbox overlay — new `src/shared/lightbox.ts` + `src/shared/blog-figure.css`. Click `figure.blog-figure img` → overlay with backdrop-blur, close on backdrop/button/Esc. Wired from both BlogLayouts.
- [x] Pull-quote support — markdown `>` blockquotes already render; used inline in `building-the-editorial-calendar-feature` and moved above the fold per operator direction.
- [x] `building-the-editorial-calendar-feature` iterated v3 → v19 across multiple operator comment rounds: grounded the dek with vendor-release-cycle / team-meeting contrast, replaced bragging numbers with a structural claim, added a dispatch-era §02 bullet on the editorial-control sibling breakout, new §02 bullet on figures-as-just-in-time-UX, pull quote moved above the fold. Approved at v19 and applied (no git operation — operator commits manually).

**Acceptance criteria — 17f:**

- [x] PR #113 merges cleanly to main.
- [x] Studio intake flow produces a paste-ready prompt that runs `/editorial-add` end-to-end without operator re-prompts.
- [x] Signature polling replaces the blind 10-second reload — verified via mtime bump on a calendar file flipping the hash.
- [x] Blog figures render with captions on both the public `/blog/<slug>/` render AND the review surface.
- [x] Lightbox opens on figure click, closes on backdrop / button / Esc.
- [x] `building-the-editorial-calendar-feature` moves from in-review → approved → applied; disk matches the approved content by SSOT invariant.
- [x] Code review (feature-review) passes with zero blockers. Three warnings noted (polling visibility guard, lightbox keydown listener re-registration, focus trap); five info items; all tracked for follow-up.

### Phase 18a: Stable UUID identity for calendar entries + distribution records

**Deliverable:** Refactor that adds a stable UUID to every `CalendarEntry` and `entryId` to every `DistributionRecord`, routes all internal joins through the UUID, and backfills existing data. Zero user-visible change; the prep step before Phase 18b's slug rename.

**Motivation:** Slug is currently the only stable identifier — every workflow, distribution record, and skill helper joins back to the calendar through it. Renaming a slug for SEO realignment currently requires rewriting history across multiple JSON journals and markdown tables. Separating internal identity (UUID) from the public handle (slug) makes the rename cheap and non-destructive, and stabilizes the data model for any future operation that would have cared about slug stability.

- [ ] `scripts/lib/editorial/types.ts` — add `id: string` (UUID v4) to `CalendarEntry` (line 76); add `entryId: string` to `DistributionRecord` (line 151); add `entryById(calendar, id)` and `distributionsByEntryId(calendar, entryId)` helpers alongside the existing `distributionsBySlug`. Keep `slug` on DistributionRecord as a human-readable cross-reference.
- [ ] `scripts/lib/editorial/calendar.ts` — add a leading `UUID` column to every stage-table renderer (Ideas, Planned, Drafting, Review, Published) and the distribution table. `parseEntries` (line 104) and `parseDistributions` (line 161) tolerate missing UUID columns on legacy rows and generate v4 UUIDs in-memory; `writeCalendar` persists UUIDs back on the next save (idempotent backfill).
- [ ] Add `findEntryById(calendar, id)` to `calendar.ts`. Stage-transition helpers (`planEntry`, `outlineEntry`, `draftEntry`, `publishEntry`, `addDistribution`) accept either slug or id and prefer id when available. Existing slug-based signatures stay as-is so all current call sites keep working.
- [ ] `scripts/feature-image/workflow.ts` (line 13) — add `entryId?: string` to `WorkflowContext` (sits alongside `postPath`, `slug`, `site`). Optional so legacy workflows remain valid.
- [ ] `scripts/lib/editorial-review/types.ts` (line 155) — add `entryId: string` to `DraftWorkflowItem`.
- [ ] `scripts/lib/editorial-review/pipeline.ts` — `matchesKey` (line 103) and `findOpenByKey` (line 118) prefer `entryId` for the join; fall back to `(site, slug, contentKind)` when the workflow predates the refactor.
- [ ] `scripts/lib/editorial-review/handlers.ts` (lines 167–218) — `handleGetWorkflow` accepts `entryId` as a query param; keeps slug as fallback.
- [ ] `.claude/skills/editorial-approve/apply.ts` (lines 50–80) — accept entryId as primary key; slug remains a convenience fallback.
- [ ] `scripts/editorial/backfill-uuids.ts` (new) — one-shot, idempotent. Loads both calendars, backfills missing UUIDs, then walks every JSON file under `journal/pipeline/` and stamps `entryId` on the context by matching `(site, slug, contentKind)` against the backfilled calendar. Prints mapping preview before writing in `--dry-run` mode.
- [ ] Run the backfill against both calendars + all workflow journals. Both calendars now have UUID columns on every row; every active workflow has `entryId` in its context.
- [ ] `npm test` passes — parser round-trip preserves all data AND emits the UUID column.

**Acceptance criteria — 18a:**

- [ ] Every row in both `docs/editorial-calendar-*.md` has a UUID column populated.
- [ ] Every distribution row has a matching `entryId` populated.
- [ ] Every non-terminal workflow in `journal/pipeline/` has `entryId` in its context.
- [ ] `tsx .claude/skills/feature-image-apply/scan.ts` output is unchanged (no behavior diff).
- [ ] `npm run dev:editorialcontrol` — studio, feature-image pipeline, and editorial review all render without error.
- [ ] Unit tests pass; backward-compatibility round-trip test covers a legacy (no-UUID) calendar.

### Phase 18b: `/editorial-rename-slug` skill

**Deliverable:** Skill + helper that renames a calendar entry's slug. With 18a's UUID identity in place, internal joins don't break — only the public surface changes (filename, URL, redirect).

**Motivation:** Post-publish SEO data regularly suggests a better slug than the one picked at planning time. Without tooling, renaming requires manual coordination across the content file, image dir, frontmatter, calendar row, and a Netlify redirect for the legacy URL — error-prone and skipped in practice, leaving slugs locked to first-guess SEO choices.

- [ ] `scripts/lib/editorial/rename-slug.ts` (new) — core library with `renameSlug({site, oldSlug, newSlug, dryRun})`. Operations in order: content file rename (`src/sites/<site>/content/blog/<old>.md` → `<new>.md`), image dir rename (`src/sites/<site>/public/images/blog/<old>/` → `<new>/`), frontmatter `image:` / `socialImage:` path rewrite, `entry.slug = <new>` in calendar (entry.id unchanged), cosmetic slug update on matching DistributionRecords, 301-redirect append to `netlify.toml`.
- [ ] Redirect block matches existing `netlify.toml` patterns: bare path, trailing-slash, splat (`/*`) variants with `status = 301, force = true`.
- [ ] `.claude/skills/editorial-rename-slug/SKILL.md` + `rename.ts` (new) — skill wraps the helper. Usage: `/editorial-rename-slug --site <site> <old-slug> <new-slug>`. `--dry-run` prints the full change list (files to rename, frontmatter diffs, calendar row change, redirect block) without writing.
- [ ] No git operations in the skill. User reviews diff and commits.
- [ ] Verify end-to-end on a throwaway entry: rename, inspect calendar + file moves, confirm `netlify.toml` has the redirect block, confirm feature-image workflows + distribution records for the renamed entry still resolve by entryId.

**Acceptance criteria — 18b:**

- [ ] `/editorial-rename-slug --site <site> <old> <new>` produces a clean dry-run change list.
- [ ] Non-dry-run run renames content file + image dir + frontmatter + calendar row + appends the Netlify 301.
- [ ] Workflow and distribution records for the renamed entry still join correctly (via entryId).
- [ ] Old URL 301s to new URL on deployed preview (verified via Netlify deploy preview).
- [ ] Existing skills (`/editorial-approve`, `/feature-image-apply`, etc.) continue to work after a rename.
