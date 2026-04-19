---
name: editorial-help
description: "Show the editorial workflow and report current calendar status across all stages."
user_invocable: true
---

# Editorial Help

Show the editorial content lifecycle and current calendar status across both sites. Do NOT modify anything.

## Site

Accepts `--site <slug>` (default: all known sites). Valid sites: `audiocontrol`, `editorialcontrol`. When no `--site` is passed, iterate over `SITES` and report each. When `--site` is passed, report only that one. Unknown values error.

## 1. Show the Editorial Workflow

```
/editorial-add       Add an idea to the calendar
       |
       v
/editorial-plan      Move to Planned, set target keywords
       |
       v
/editorial-draft     Scaffold blog post directory and frontmatter (Phase 2)
       |
       v
/editorial-publish   Mark as Published, close GitHub issue (Phase 2)
```

**Analytics skills (Phase 3):**
- `/editorial-suggest` — Pull analytics, identify content opportunities
- `/editorial-performance` — Show metrics and social referral traffic for published posts

**Distribution skills (Phase 4):**
- `/editorial-distribute` — Record that a published post was shared on Reddit / YouTube / LinkedIn / Instagram (captures sub-channel e.g. subreddit)
- `/editorial-social-review` — Matrix of published posts vs platforms (subreddit count for Reddit)

**Reddit cross-posting skills (Phase 5):**
- `/editorial-reddit-sync` — Pull recent submissions from Reddit API and upsert distribution records automatically (matches both blog posts AND YouTube entries by URL)
- `/editorial-reddit-opportunities <slug>` — Show already-shared subreddits (don't duplicate) and unshared candidates with subscriber counts

**YouTube integration skills (Phase 6):**
- `/editorial-cross-link-review` — Audit bidirectional links between blog posts and YouTube videos; flag missing reciprocal links

YouTube videos and tools/apps on the target site are first-class calendar entries — use `/editorial-add` with content type `youtube` or `tool`. They go through the same five stages as blog posts, but `/editorial-draft` creates only a GitHub issue (no directory) and `/editorial-publish` requires a `contentUrl` (the YouTube URL or canonical page URL).

**Status skills:**
- `/editorial-review` — Show calendar status across all stages for one site
- `/editorial-help` — This workflow overview (covers all sites unless `--site` is passed)

**Multi-site convention:** every `/editorial-*` skill takes `--site <slug>` and defaults to `audiocontrol` when omitted. Unknown values error with the list of valid sites. Data files are per-site: `docs/editorial-calendar-<site>.md` and `docs/editorial-channels-<site>.json`.

## 2. Show Calendar Status

For each site in scope (all `SITES` by default, or just the one passed via `--site`):
- Read the site's calendar via `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`
- Parse using `scripts/lib/editorial/calendar.ts` logic
- Report entry counts per stage and list entries in non-Published stages
- For Published: report total count and most recent 3 entries

## 3. Report Format

```
Editorial Calendar Status (audiocontrol):
  Ideas:     N entries
  Planned:   N entries
  Drafting:  N entries
  Review:    N entries
  Published: N entries (most recent: <slug>, <slug>, <slug>)

Editorial Calendar Status (editorialcontrol):
  Ideas:     N entries
  ...
```
