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

- [ ] `DraftWorkflowState` union: `'open' | 'in-review' | 'iterating' | 'approved' | 'applied' | 'cancelled'`
- [ ] `DraftAnnotation` discriminated union:
  - `{ type: 'comment', range: {start, end}, text, category?, createdAt }`
  - `{ type: 'edit', beforeVersion, afterMarkdown, diff, createdAt }`
  - `{ type: 'approve', version, createdAt }`
  - `{ type: 'reject', version, reason?, createdAt }`
- [ ] `DraftVersion`: `{ version, markdown, createdAt, originatedBy: 'agent' | 'operator' }`
- [ ] `DraftWorkflowItem`: `{ id, site, slug, contentKind, platform?, channel?, state, currentVersion, createdAt, updatedAt }`

#### Implementation

- [x] Rename `/editorial-review` skill to `/editorial-status` (update `.claude/skills/editorial-review/` → `.claude/skills/editorial-status/`, update skill frontmatter, update `/editorial-help` to list the new name)
- [ ] Create `scripts/lib/editorial-review/types.ts` with the union and interfaces above
- [ ] Create `scripts/lib/editorial-review/pipeline.ts` with `appendHistory()`, `upsertWorkflow()`, `readWorkflow()`, `listOpen()`, `readVersions()` — all JSONL, append-only, mirrors `scripts/lib/feature-image/pipeline.ts`
- [ ] Create `scripts/lib/editorial-review/index.ts` barrel export
- [ ] Add `.editorial-draft-history.jsonl` and `.editorial-draft-pipeline.jsonl` as tracked files (empty, not gitignored)
- [ ] Create `src/sites/<site>/pages/dev/editorial-review/[slug].astro` route stubs (both sites) — 404s in prod via the existing dev-guard pattern used by feature-image-preview
- [ ] Create server endpoints under `src/sites/<site>/pages/dev/api/editorial-review/`: `annotate.ts`, `annotations.ts`, `decision.ts` — all 404 in prod
- [ ] Unit tests: state-machine transitions (valid + invalid), history append/read round-trip, workflow upsert idempotence

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

- [ ] Mount the draft's markdown through the real blog layout (Astro collections or direct import), so the operator sees the post as it will ship — feature image, headings, typography, spacing
- [ ] Select-to-comment overlay:
  - [ ] Client-side selection capture → range (character offsets against the MD source, not the rendered HTML)
  - [ ] Margin-note sidebar: list of comments, each highlighted in the text when hovered
  - [ ] Category selector per comment (values from Phase 12 — for now, free text with a planned taxonomy)
- [ ] Edit-mode toggle:
  - [ ] Textarea shows raw MD of the current version
  - [ ] On submit, server computes a diff against the prior version and stores both the new version and the diff
  - [ ] Edit-mode submissions create a new `DraftVersion` with `originatedBy: 'operator'`
- [ ] Version selector: dropdown or tab strip; selecting a prior version re-renders the page at that version
- [ ] Controls: **Approve** (records `approve` annotation, transitions state to `approved`), **Iterate** (records state transition to `iterating`, surfaces next-step text: "run `/editorial-iterate <slug>` in Claude Code"), **Reject** (cancels workflow)
- [ ] Polling or SSE for annotation updates when the operator refreshes after the agent has iterated

#### Tests

- [ ] Character-offset ranges survive a round-trip through serialization
- [ ] Edit-mode diff is reversible (applying the diff to the before-version yields the after-version)
- [ ] Approving from an older version than the current is flagged as an operator error (with a confirmation prompt in UI; not an automatic bypass)
- [ ] Prod build returns 404 for `/dev/editorial-review/*`

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

- [ ] `/editorial-draft-review` — resolves draft file path from slug + site, reads its current content as v1, writes workflow + first `DraftVersion`, returns dev URL
- [ ] `/editorial-iterate` — key logic:
  - [ ] Read all annotations attached to the current version that haven't yet been consumed
  - [ ] Load the matching voice skill (`audiocontrol-voice` for audiocontrol site, `editorialcontrol-voice` for editorialcontrol site)
  - [ ] Compose a prompt structure: current draft + annotation list + voice skill instructions
  - [ ] Run revision in the current Claude Code session (the skill is a Markdown file that drives the conversation; the actual revision happens in the dialog between operator and agent, not in a background process)
  - [ ] On completion, append new `DraftVersion` with `originatedBy: 'agent'`, update workflow state to `in-review`
- [ ] `/editorial-approve` — writes the approved version's markdown to `src/sites/<site>/pages/blog/<slug>/index.md` (or the appropriate path for shortform in Phase 11), transitions state, prints: "git status to see the diff; commit when ready"
- [ ] `/editorial-review-cancel` — sets state to `cancelled`, appends an annotation record with reason if provided
- [ ] `/editorial-review-help` — reads pipeline JSONL, groups by state, prints table

**Important behavior**

- `/editorial-approve` **does not** run `git add`, `git commit`, or `git push`. It only writes the file. Operator drives the git operations.
- `/editorial-iterate` is a skill Markdown file, not a background process. It defines the conversation shape and hands off to the agent in the current session.

#### Tests

- [ ] `/editorial-draft-review` is idempotent: running it twice on the same slug doesn't create a second workflow
- [ ] `/editorial-approve` writes the correct file and transitions state; re-running is a no-op on an already-applied workflow
- [ ] `/editorial-review-cancel` on an already-applied workflow is an error, not a silent overwrite
- [ ] `/editorial-review-help` reports correctly across a synthetic pipeline with multiple workflows

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

- [ ] Extend `DraftWorkflowItem` with `contentKind: 'longform' | 'shortform'` (default `longform` for backward compat)
- [ ] Add `platform?: Platform` and `channel?: string` fields (mirror `DistributionRecord`)
- [ ] Extend `DistributionRecord` with optional `shortform?: string` — the approved short-form text
- [ ] Calendar parser/writer updates to round-trip the new `DistributionRecord.shortform` (optional column, emitted only when populated)

#### Implementation

- [ ] `/editorial-shortform-draft`:
  - [ ] Prompts for slug (if not supplied), platform, channel (if platform supports channels)
  - [ ] Loads post title, dek, target keywords, tags from calendar
  - [ ] Loads matching voice skill reference for short-form (`social-and-distribution.md` for audiocontrol, `cross-site-and-distribution.md` for editorialcontrol)
  - [ ] Runs first-pass draft in the current session; appends workflow + v1
- [ ] Dev route: `src/sites/<site>/pages/dev/editorial-review-shortform.astro` — list view of all open shortform workflows grouped by platform
- [ ] Per-workflow UI is inline (not a separate route) — each row expands to show the current version, annotation field, edit textarea, and approve/iterate buttons. Matches the feature-image gallery pattern more than the longform review pattern.
- [ ] `/editorial-iterate` branches on `contentKind` — shortform path uses a terser iteration prompt (the voice skill reference for short-form, not longform)
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
