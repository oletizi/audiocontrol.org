---
name: editorial-distribute
description: "Record that a published blog post was shared to a social platform."
user_invocable: true
---

# Editorial Distribute

Record a single social share of a published post in the editorial calendar. Interactive — prompt the user for each field.

## Input

Prompt the user one field at a time (do NOT expect positional arguments):

1. **Slug** — the post being shared. Offer a list of Published entries as a hint if the user doesn't know the slug.
2. **Platform** — one of `reddit`, `youtube`, `linkedin`, `instagram`. Reject any other value.
3. **URL** — the full URL where the post was shared (e.g. the Reddit thread, YouTube video, LinkedIn post).
4. **Notes** — optional free-form context (e.g. `r/synthdiy`, `personal channel`). Blank is fine.

If the user provides all four as a single argument string, parse it and skip the prompts. Otherwise ask each missing field.

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Validate the slug**: Must match an existing entry in the `## Published` stage.
   - If the slug isn't in the calendar at all: report error with available Published slugs
   - If the slug is in a pre-Published stage: refuse — distributions are only recorded for shipped posts
3. **Validate the platform**: must be one of `reddit`, `youtube`, `linkedin`, `instagram`
4. **Collect remaining fields** via prompts (URL, optional notes)
5. **Default the share date** to today (YYYY-MM-DD). Allow the user to override if they're backfilling.
6. **Append the record** to the `## Distribution` section:
   ```
   | slug | platform | url | YYYY-MM-DD | notes |
   ```
7. **Write the calendar**: Write `docs/editorial-calendar.md` with the new row appended
8. **Report**: Confirm the record was added and show the row

## Important

- Use the Write tool to persist changes
- Do NOT modify existing Distribution rows; only append
- The `## Distribution` section lives after `## Published` in the calendar markdown
- Today's date (UTC) is the default for the Shared column when the user doesn't specify one
- Use `scripts/lib/editorial/calendar.ts` — `addDistribution()` — if scripting this rather than hand-editing markdown
