---
name: editorial-plan
description: "Move a calendar entry to the Planned stage, set target keywords + topics, and reframe the title/dek with the site's voice skill before the entry leaves Ideas."
user_invocable: true
---

# Editorial Plan

Move an editorial calendar entry from Ideas to Planned, set target
keywords + topics, and use the site's voice skill to sharpen the
framing (title, dek, description) before the entry travels further
down the pipeline.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites:
`audiocontrol`, `editorialcontrol`. Topic hints come from
`docs/editorial-channels-<site>.json`, so the topic list is per-site.
Unknown `--site` values error.

## Input

The user provides a slug and optionally keywords. Examples:

- `/editorial-plan scsi-protocol-deep-dive "SCSI protocol, vintage hardware, SCSI commands"`
- `/editorial-plan --site editorialcontrol agent-as-workflow`
- `/editorial-plan scsi-protocol-deep-dive` (will prompt for keywords + topics)

After keywords are collected, also prompt for optional **topics** —
coarse tags used by `/editorial-reddit-opportunities` to look up
relevant subreddits. Relevant topics for the selected site come from
the `topics` keys in `docs/editorial-channels-<site>.json`.

## Steps

1. **Resolve site** via `assertSite()`.

2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads
   `docs/editorial-calendar-<site>.md`.

3. **Find the entry**: Look for the slug in the calendar.
   - If not found: report error and list available Ideas entries.
   - If found but not in Ideas stage: report its current stage and stop.

4. **Load the matching voice skill's references (MANDATORY).** Before
   proposing any framing — title, dek, keyword strategy, topics — read
   the skill and the longform reference with the Read tool:
   - `audiocontrol` → `.claude/skills/audiocontrol-voice/SKILL.md` +
     `.claude/skills/audiocontrol-voice/references/longform.md`
   - `editorialcontrol` → `.claude/skills/editorialcontrol-voice/SKILL.md`
     + `.claude/skills/editorialcontrol-voice/references/dispatch-longform.md`

   This is the step operators previously had to remember to ask for.
   It is no longer optional. The voice-skill references name the
   site's title pattern, dek shape, signature argumentative moves,
   and typographic conventions — you cannot propose a title or dek
   without them and match the site's voice.

5. **Propose reframed title + dek + description.** Using the voice-
   skill guidance, offer a refined title (following the site's
   established pattern), a compressed dek, and a calendar description
   that signals scope and pairing decisions. Ask the operator to
   confirm or redirect. Never silently overwrite — the operator
   decides.

6. **Get keywords.** Use the keywords from the argument, or ask the
   user. Guidance: go wide until analytics data earns narrowing.
   Treat the `keywords` field as "semantic territory this post
   covers" rather than a narrow set of SEO heroes. 10–15 phrases is
   typical; anchor on any worked example the post already names.

7. **Get topics** (optional): ask the user for comma-separated topic
   tags. Blank is fine — leaves the `topics` field unset.

8. **Move to Planned**: Change the entry's stage from Ideas to
   Planned; update title, description, keywords, and topics as
   agreed. Remove the row from the `## Ideas` table; add it to the
   `## Planned` table with the full set of fields filled in.

9. **Write the calendar**: `writeCalendar(process.cwd(), site, cal)`
   → `docs/editorial-calendar-<site>.md`.

10. **Seed the scrapbook** (blog entries only): call
    `seedPlanScrapbook(process.cwd(), site, entry)` from
    `scripts/lib/editorial/calendar.js` to drop a
    `content/blog/<slug>/scrapbook/README.md` next to the article.
    Idempotent — returns `null` if the file already exists. The
    README carries an H1 + the article slug + skeleton sections for
    receipts, notes, and references so there's an obvious home for
    anything learned during planning that would otherwise be lost.

11. **Report**: Confirm the move and show the entry with its final
    title, keyword count, topics, and any pairing notes pinned in
    the description. Mention the voice skill was consulted — that's
    part of the record. If a scrapbook README was seeded, point the
    operator at `/dev/scrapbook/<site>/<slug>`.

## Why consult the voice skill at planning time

Title and dek decide how the piece lands in the reader's head before
they read a word. Waiting until `/editorial-draft` or
`/editorial-iterate` to consult the voice means the framing in the
calendar row is already wrong, and every downstream step inherits it.
Plan time is the cheapest moment to get the framing right.

The voice skill also teaches the keyword-strategy move: go wide,
anchor on the piece's worked example, let the analytics loop promote
striking-distance queries once there's real data. Without loading
the skill first, the natural failure is proposing 3–5 "SEO hero"
terms chosen from thin air.

## Important

- Use the Write tool to persist changes to
  `docs/editorial-calendar-<site>.md`.
- Preserve all existing entries — only move the target entry
  between tables.
- The calendar format uses pipe-delimited markdown tables.
