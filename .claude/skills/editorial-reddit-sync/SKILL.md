---
name: editorial-reddit-sync
description: "Pull recent Reddit submissions via API and upsert DistributionRecords for any that reference audiocontrol.org blog posts."
user_invocable: true
---

# Editorial Reddit Sync

Query the Reddit API for the configured user's recent submissions, match each to a blog post by URL, and upsert DistributionRecords in the calendar. Idempotent — re-running produces no duplicate rows.

## Prerequisites

`~/.config/audiocontrol/reddit.json` must exist with:

```json
{
  "clientId": "...",
  "clientSecret": "...",
  "username": "your-reddit-username",
  "password": "your-reddit-password",
  "userAgent": "audiocontrol.org:editorial-sync:v1 (by /u/your-reddit-username)"
}
```

The credentials come from a Reddit "script" app at https://www.reddit.com/prefs/apps. If the file is missing, the skill throws with a clear error — do not attempt to run without it.

## Steps

1. **Load credentials** via `loadCredentials()` from `scripts/lib/reddit/auth.ts`. If this throws, stop and tell the user to create the config file.
2. **Fetch submissions**: call `getUserSubmissions(username, 200)` from `scripts/lib/reddit/client.ts` — returns up to 200 of the user's most recent submissions.
3. **Read the calendar** via `readCalendar(process.cwd())`.
4. **Match each submission to a blog post**: a submission matches a Published entry if its `url` field contains `audiocontrol.org/blog/<slug>/` or if its `selftext` links to that path. Extract the slug from the URL.
5. **Build DistributionRecord for each match**:
   - `slug`: extracted slug
   - `platform`: `reddit`
   - `channel`: the submission's `subreddit` field (already canonical `r/<name>`)
   - `url`: the submission's `permalink` (the reddit.com thread URL)
   - `dateShared`: the submission's `createdDate`
   - `notes`: the submission's `title` (truncated to 100 chars if longer)
6. **Dedupe**: a record is "already present" if the calendar has a DistributionRecord with the same `slug`, `platform`, and normalized `channel`, **and** the same `url`. Only insert new ones; do not modify existing records.
7. **Write the calendar** via `writeCalendar(process.cwd(), cal)`.
8. **Report**: number of submissions fetched, number matched to blog posts, number of new DistributionRecords inserted, number skipped as duplicates.

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
- **Error messages must be specific**: if Reddit returns 401, surface the exact status and suggest re-checking credentials. If a submission's URL doesn't parse, skip it and include the reason in the report tail.
- Do **not** post anything. This skill is strictly read-only.
- The skill is safe to schedule as a recurring task (e.g. via `/schedule`) once credentials are configured.
