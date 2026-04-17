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
- `scripts/lib/editorial/channels.ts` — load curated `editorial-channels.yml` and diff against distributions
- `docs/editorial-channels.yml` — curated `topic → [subreddit]` map

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

**Deliverable:** Record where a post was shared at the sub-channel level (subreddit, YouTube channel) and surface unshared relevant subreddits for a given post.

#### Skill design (UX first, per composable-skills rule)

| Skill | Input | Output |
|-------|-------|--------|
| `/editorial-distribute` (updated) | Prompts for slug, platform, url, **channel** (e.g. `r/synthdiy`), optional notes | Writes a DistributionRecord with `channel` populated |
| `/editorial-reddit-opportunities <slug>` | One arg: post slug. Fast path: also accept `--topic <tag>` to override | Prints unshared subreddits, grouped by relevance tag, with recorded shares for reference |
| `/editorial-social-review` (updated) | (no change in args) | Reddit column shows "N subreddits" instead of just a checkmark when that post has reddit distributions |

`/editorial-reddit-opportunities` is the one new user-invocable skill. `/editorial-distribute` and `/editorial-social-review` pick up the new data transparently.

#### Data model

- [ ] Add `channel?: string` field to `DistributionRecord` (e.g. `r/synthdiy`, YouTube channel handle, LinkedIn page slug)
- [ ] Add `topics?: string[]` to `CalendarEntry` (optional — overlaps with `targetKeywords` but is semantically distinct: topics are coarse tags used for cross-posting recommendations, keywords are SEO targets)
- [ ] Extend the Distribution markdown table with a Channel column; maintain backwards-compat parsing for old rows without the column

#### Curated map

- [ ] Create `docs/editorial-channels.yml` with a `topic → [subreddit]` map (plus room to add other platforms later)
- [ ] Seed the map with topic tags we'll use for audiocontrol.org content: `samplers`, `vintage-hardware`, `scsi`, `roland`, `akai`, `ai-agents`, `home-studio`, etc. (initial set — user to curate)
- [ ] Each subreddit entry can carry optional hints (self-promo rules, flair requirements) as free-form notes

#### Implementation

- [ ] Extend `types.ts` with `channel?: string` on DistributionRecord and `topics?: string[]` on CalendarEntry
- [ ] Extend `calendar.ts` parser/writer:
  - Distribution section gains a `Channel` column (optional — omit when no record in the section uses it, for cleaner diffs)
  - Calendar entry tables gain an optional Topics column following Keywords, rendered only when any entry in the stage has topics
- [ ] Add a new `channels.ts` library module — loads `docs/editorial-channels.yml` and exposes `getChannelsForTopics(topics: string[]): Map<Platform, string[]>`
- [ ] Update `/editorial-distribute` skill to prompt for channel after platform
- [ ] Update `/editorial-social-review` skill to show per-post subreddit count when that post has reddit distributions
- [ ] Create `/editorial-reddit-opportunities` skill — reads a slug, looks up its topics, consults the curated map, subtracts already-distributed subreddits, reports the gap
- [ ] Update `/editorial-add` / `/editorial-plan` prompts to collect topics (optional) at plan time
- [ ] Update `/editorial-help` to cover the new skill
- [ ] Add tests for channel round-trip in Distribution parser/writer
- [ ] Add tests for `getChannelsForTopics` and the opportunity-diff logic

**Acceptance Criteria:**
- `/editorial-distribute` captures a channel (e.g. `r/synthdiy`) as a first-class field, not free-text notes
- `/editorial-reddit-opportunities <slug>` prints unshared relevant subreddits derived from the curated `editorial-channels.yml` and the post's topics
- `/editorial-social-review` shows subreddit coverage for Reddit rather than just a checkmark
- Calendar round-trips cleanly with the new `Channel` and `Topics` columns
- `docs/editorial-channels.yml` is user-editable and human-readable
- No regressions to Phase 4 behavior — old Distribution rows without a Channel still parse

#### Open questions (resolve before coding)

- Should `topics` on CalendarEntry be required once Phase 5 ships, or remain optional with graceful handling of untagged posts? (Proposed: optional; untagged posts produce `(no topics — tag this post to get opportunities)` from the skill.)
- Should the opportunities skill fetch live data (check subreddit activity/recent posts) or strictly read the curated file? (Proposed: strictly curated file; live fetch is a deferred enhancement.)
- Should the curated map be checked into `docs/` or kept private in `~/.config/audiocontrol/`? (Proposed: `docs/` — it's non-sensitive guidance, useful to review in PRs.)

## Verification Checklist

- [x] `npm run build` succeeds (no build breakage)
- [x] Calendar file is parseable by the script and readable by humans
- [x] All skill commands work end-to-end
- [x] Post scaffolding matches existing blog conventions
- [x] Analytics integration produces actionable suggestions
- [x] No secrets committed to the repository
