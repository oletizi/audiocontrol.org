---
name: editorial-distribute
description: "Record that a published blog post was shared to a social platform."
user_invocable: true
---

# Editorial Distribute

Record a single social share of a published post in the editorial calendar. Interactive — prompt the user for each field.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. The share is recorded in `docs/editorial-calendar-<site>.md`. Unknown `--site` values error.

## Input

Prompt the user one field at a time (do NOT expect positional arguments):

1. **Slug** — the post being shared. Offer a list of Published entries as a hint if the user doesn't know the slug.
2. **Platform** — one of `reddit`, `youtube`, `linkedin`, `instagram`. Reject any other value.
3. **Channel** — sub-channel within the platform:
   - Reddit: subreddit in `r/name` form (e.g. `r/synthdiy`)
   - YouTube: channel handle
   - LinkedIn: company/page slug, or `personal` for your profile
   - Optional — blank is fine if the share has no sub-channel identity
4. **URL** — the full URL where the post was shared (e.g. the Reddit thread, YouTube video, LinkedIn post).
5. **Notes** — optional free-form context. Blank is fine.

If the user provides all fields as a single argument string, parse it and skip the prompts. Otherwise ask each missing field.

For Reddit specifically: `/editorial-reddit-sync` will pick up new submissions from the API automatically, so you often don't need to run this skill manually for Reddit shares. Use it for YouTube, LinkedIn, Instagram, or when you're backfilling.

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Validate the slug**: Must match an existing entry in the `## Published` stage.
   - If the slug isn't in the calendar at all: report error with available Published slugs
   - If the slug is in a pre-Published stage: refuse — distributions are only recorded for shipped posts
4. **Validate the platform**: must be one of `reddit`, `youtube`, `linkedin`, `instagram`
5. **Collect remaining fields** via prompts (URL, optional notes)
6. **Default the share date** to today (YYYY-MM-DD). Allow the user to override if they're backfilling.
7. **Append the record** to the `## Distribution` section. The writer handles the column layout automatically — if any record now uses a channel, a `Channel` column appears in the table:
   ```
   | slug | platform | url | YYYY-MM-DD | r/channel | notes |
   ```
8. **Write the calendar**: `writeCalendar(process.cwd(), site, cal)` → `docs/editorial-calendar-<site>.md`
9. **Report**: Confirm the record was added, the site, and show the row

## Important

- Use the Write tool to persist changes
- Do NOT modify existing Distribution rows; only append
- The `## Distribution` section lives after `## Published` in the calendar markdown
- Today's date (UTC) is the default for the Shared column when the user doesn't specify one
- Use `scripts/lib/editorial/calendar.ts` — `addDistribution()` — if scripting this rather than hand-editing markdown
