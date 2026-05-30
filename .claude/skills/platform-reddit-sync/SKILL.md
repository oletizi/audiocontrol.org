---
name: editorial-reddit-sync
description: "Pull recent Reddit submissions via API and upsert DistributionRecords for any that reference the site's blog posts or YouTube videos."
user_invocable: true
---

# Editorial Reddit Sync

Query the Reddit API for the configured user's recent submissions, match each to a blog post or video URL for the target site, and upsert DistributionRecords in that site's calendar. Idempotent — re-running produces no duplicate rows.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. The site determines the calendar file, the **host** used to match submission URLs (`audiocontrol.org` vs `editorialcontrol.org`), and the **Reddit username** that gets queried (per-site via the site-keyed Reddit config). Unknown `--site` values error.

## Prerequisites

`~/.config/audiocontrol/reddit.json` must exist with a site-keyed schema:

```json
{
  "audiocontrol":    { "username": "your-audiocontrol-reddit-handle" },
  "editorialcontrol": { "username": "your-editorialcontrol-reddit-handle" }
}
```

Only the site you're syncing needs to be present. Running with `--site=editorialcontrol` will fail with a clear error if there's no `editorialcontrol` entry. The old flat schema (`{ "username": "..." }`) is also rejected with an explicit migration hint — no silent fallback.

That's the entire setup. No Reddit app, no password, no OAuth, no 2FA concerns. We use Reddit's public `.json` endpoints — they're rate-limited but more than sufficient for periodic sync.

If the file is missing, the skill throws with a clear error telling the user how to create it.

## Steps

1. **Resolve site** via `assertSite()` and derive `host = siteHost(site)`.
2. **Fetch submissions**: call `getUserSubmissions(site, 200)` from `scripts/lib/reddit/client.ts` — resolves the site's username via `loadConfig(site)` and returns up to 200 of that user's most recent submissions. No authentication step.
3. **Read the calendar** via `readCalendar(process.cwd(), site)`.
4. **Match each submission to a Published calendar entry**:
   - **Blog match**: submission `url` or `selftext` contains `<host>/blog/<slug>/` where `<slug>` exists as a Published blog entry for this site. Extract the slug using `slugFromBlogUrl(url, host)`.
   - **YouTube match**: submission `url` is a YouTube URL (watch/shorts/youtu.be) whose video ID matches the `contentUrl` of a Published YouTube entry. Use `extractVideoId` from `scripts/lib/youtube/client.ts` to normalize both sides.
   - A submission may match at most one entry. Prefer blog match if both somehow apply. Submissions that reference the other site's host are skipped (not unmatched — they belong to a different `--site` run). Unmatched submissions are reported but not recorded.
5. **Build DistributionRecord for each match**:
   - `slug`: the matched entry's slug (blog slug, or YouTube entry slug)
   - `platform`: `reddit`
   - `channel`: the submission's `subreddit` field (already canonical `r/<name>`)
   - `url`: the submission's `permalink` (the reddit.com thread URL)
   - `dateShared`: the submission's `createdDate`
   - `notes`: the submission's `title` (truncated to 100 chars if longer)
6. **Dedupe**: a record is "already present" if the calendar has a DistributionRecord with the same `slug`, `platform`, and normalized `channel`, **and** the same `url`. Only insert new ones; do not modify existing records.
7. **Write the calendar** via `writeCalendar(process.cwd(), site, cal)`.
8. **Report**: the site, number of submissions fetched, number matched to the site's content, number of new DistributionRecords inserted, number skipped as duplicates, number skipped as belonging to the other site.

## Report Format

```
Reddit sync complete for /u/<username> (90d window):
  Submissions fetched: 37
  Matched to blog posts: 12
  New records inserted: 4
  Duplicates skipped: 8

New records:
  - claude-vs-codex-claude-perspective → r/ClaudeAI (2026-04-15)
  - scsi-over-wifi-raspberry-pi-bridge → r/retrocomputing (2026-04-16)
  ...
```

## Important

- **Idempotent**: running twice in a row must insert zero records on the second run. The test for "already present" is (slug, platform, normalized channel, url) — not by Reddit submission ID — so we're robust to users adding records manually via `/editorial-distribute` before syncing.
- **Use the Write tool** to persist the updated calendar.
- **Error messages must be specific**: if Reddit returns 429 (rate-limited), say so and suggest waiting before retrying. If a submission's URL doesn't parse, skip it and include the reason in the report tail.
- Do **not** post anything. This skill is strictly read-only.
- The skill is safe to schedule as a recurring task (e.g. via `/schedule`) — just keep it infrequent (hourly or less often) to stay well under Reddit's unauthenticated rate limits.
