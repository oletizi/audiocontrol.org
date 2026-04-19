---
name: editorial-add
description: "Add a new entry to the Ideas stage of the editorial calendar."
user_invocable: true
---

# Editorial Add

Add a new content idea to the editorial calendar.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`.

All data files and blog paths resolve per site. An unknown value for `--site` errors with the list of valid sites (use `scripts/lib/editorial/types.ts` → `assertSite`).

## Input

The user provides a title (and optionally a description) as the skill argument. Examples:
- `/editorial-add "SCSI Protocol Deep Dive"`
- `/editorial-add --site editorialcontrol "Agents as Workflow Primitives"`
- `/editorial-add "SCSI Protocol Deep Dive" "A technical walkthrough of the SCSI protocol for vintage hardware"`

After title/description, prompt for **content type** — one of:

- `blog` (default) — lives in this repo at `src/sites/<site>/pages/blog/<slug>/`
- `youtube` — video hosted on YouTube; prompt for the video URL if known
- `tool` — standalone tool or app on the site (e.g. an editor page); prompt for the tool URL

For `youtube` and `tool` entries, if the content is already published the URL should be captured now. If the content is still planned (not yet live), `contentUrl` stays unset and must be filled in before `/editorial-publish` will advance the entry.

## Steps

1. **Resolve site**: parse `--site` via `assertSite()` (defaults to `audiocontrol` when omitted).
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Generate slug**: Convert the title to a URL-safe slug (lowercase, hyphens, no special chars)
4. **Check for duplicates**: If a slug already exists in the calendar, report the conflict and stop
5. **Add the entry**: Add a new row to the `## Ideas` table with:
   - Slug (generated)
   - Title (from user)
   - Description (from user, or empty)
   - Keywords (empty — set later via `/editorial-plan`)
   - Content type (if not `blog`; the writer adds a Type column when any entry in the stage has a non-default type)
   - Content URL (for `youtube` and `tool` entries with a known URL; otherwise omit)
   - Source: `manual`
6. **Write the calendar**: `writeCalendar(process.cwd(), site, cal)` — writes `docs/editorial-calendar-<site>.md`.
7. **Report**: Confirm the entry was added and show its slug (and the site it landed in)

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar-<site>.md`
- Preserve all existing entries — only append to the Ideas table
- The calendar format uses pipe-delimited markdown tables (see `scripts/lib/editorial/types.ts` for stage definitions)
