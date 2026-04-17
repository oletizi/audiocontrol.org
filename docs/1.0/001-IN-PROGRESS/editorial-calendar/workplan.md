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
- `.claude/skills/editorial-review/SKILL.md` — show calendar status
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
- `scripts/lib/editorial/crosslinks.ts` — extract links from blog MD and YouTube descriptions, diff bidirectional coverage (Phase 6)
- `.claude/skills/editorial-cross-link-review/SKILL.md` — audit skill (Phase 6)

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

- [ ] Add `channel?: string` field to `DistributionRecord` (e.g. `r/synthdiy`, YouTube channel handle, LinkedIn page slug)
- [ ] Add `topics?: string[]` to `CalendarEntry` (optional — overlaps with `targetKeywords` but is semantically distinct: topics are coarse tags used for cross-posting recommendations, keywords are SEO targets)
- [ ] Extend the Distribution markdown table with a Channel column; maintain backwards-compat parsing for old rows without the column

#### Curated map

- [ ] Create `docs/editorial-channels.json` with a `topic → [subreddit]` map (JSON rather than YAML to avoid a new dependency; human-editable enough for a curated list)
- [ ] Seed the map with topic tags we'll use for audiocontrol.org content: `samplers`, `vintage-hardware`, `scsi`, `roland`, `akai`, `ai-agents`, `home-studio`, etc. (initial set — user to curate)
- [ ] Each subreddit entry can carry optional hints (self-promo rules, flair requirements) as free-form notes

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

- [ ] Add `contentType: 'blog' | 'youtube'` to `CalendarEntry` (optional during parsing, defaults to `'blog'` — all existing entries remain valid)
- [ ] Add `contentUrl?: string` to `CalendarEntry` — the canonical URL for content that doesn't live at `/blog/<slug>/`. For blog entries, stays unset (URL is derived from slug). For YouTube entries, stores the full YouTube URL
- [ ] Extend `calendar.ts` parser/writer: stage tables gain optional `Type` and `URL` columns, emitted only when any entry in the stage has a non-default value (same pattern as Phase 5's Topics/Channel columns)

#### Curated map

No changes — `editorial-channels.json` stays topic-to-subreddit. A YouTube video is a calendar *entry*, not a channel.

#### Implementation

**Core data model + skill updates**

- [ ] Extend `types.ts` with `contentType` and `contentUrl`
- [ ] Update `calendar.ts` parser/writer for Type/URL columns
- [ ] Update `/editorial-add` to prompt for content type
- [ ] Update `/editorial-draft` to branch on content type (blog scaffolds directory; youtube creates issue only)
- [ ] Update `/editorial-publish` to require `contentUrl` for YouTube entries

**YouTube client**

- [ ] `scripts/lib/youtube/config.ts` — loads `~/.config/audiocontrol/youtube.json` (`{apiKey: "..."}`). Throws with setup instructions if missing
- [ ] `scripts/lib/youtube/client.ts` — `getVideoMetadata(videoIdOrUrl): {id, title, description, channelTitle, channelId, publishedAt}` using `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=<id>&key=<apiKey>`
- [ ] Video ID extraction helper supporting `youtube.com/watch?v=<id>`, `youtu.be/<id>`, and `youtube.com/shorts/<id>`
- [ ] Fixture-based tests — real API calls happen only from skills, not tests

**Cross-link audit**

- [ ] `scripts/lib/editorial/crosslinks.ts`:
  - `extractYouTubeLinksFromMarkdown(md): string[]` — parses `youtube.com` and `youtu.be` URLs from a blog MD file
  - `extractBlogLinksFromDescription(desc): string[]` — parses `audiocontrol.org/blog/<slug>/` URLs
  - `auditCrossLinks(calendar, fetchDescription)` — returns per-entry reports: what the entry links to, which of those are known calendar entries, and which don't reciprocate
- [ ] `/editorial-cross-link-review` skill — calls `auditCrossLinks`, passes a `fetchDescription` closure that uses `scripts/lib/youtube/client.ts`, prints the report grouped by gap type

**Reddit sync improvement**

- [ ] Update `/editorial-reddit-sync` to match submissions against `contentUrl` for YouTube entries in addition to `/blog/<slug>/` URLs for blog entries
- [ ] Re-run the sync after Phase 6 ships to attribute the 6 pre-existing S-330 editor video shares once that video becomes a calendar entry

**Tests**

- [ ] `contentType` + `contentUrl` round-trip on stage tables
- [ ] Backwards-compat parsing of legacy tables (no Type/URL columns)
- [ ] `extractYouTubeLinksFromMarkdown` against realistic blog MD
- [ ] `extractBlogLinksFromDescription` against realistic YouTube descriptions
- [ ] `auditCrossLinks` with fixture calendar + fixture descriptions, verifies gap detection in both directions
- [ ] YouTube client fixture tests (no live API calls from tests)

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
5. Save:
   ```json
   { "apiKey": "AIza..." }
   ```
   at `~/.config/audiocontrol/youtube.json`

Quota: 10,000 units per day free. One `videos.list` call costs 1 unit. The cross-link audit reads at most one video per calendar YouTube entry — we won't come close to the limit.

#### Open questions (resolve before coding)

- Should blog-post MD extraction handle embedded iframes (`<iframe src="youtube.com/embed/...">`) in addition to plain URLs? (Proposed: **yes** — capture all three forms: plain URL, short URL, iframe embed.)
- Should cross-link audit report be generated as markdown in `docs/` for review, or streamed only to the skill output? (Proposed: **stream only** — audit is fast enough that we don't need to cache; keeping it out of `docs/` avoids churn on every run.)
- Slug uniqueness: a blog post and a YouTube video on the same topic could collide. (Proposed: **keep global slug uniqueness** — if conflict, the user differentiates manually, e.g. `s330-crunch-post` vs `s330-crunch-video`.)

## Verification Checklist

- [x] `npm run build` succeeds (no build breakage)
- [x] Calendar file is parseable by the script and readable by humans
- [x] All skill commands work end-to-end
- [x] Post scaffolding matches existing blog conventions
- [x] Analytics integration produces actionable suggestions
- [x] No secrets committed to the repository
