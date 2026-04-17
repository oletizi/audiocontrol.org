---
name: editorial-add
description: "Add a new entry to the Ideas stage of the editorial calendar."
user_invocable: true
---

# Editorial Add

Add a new content idea to the editorial calendar.

## Input

The user provides a title (and optionally a description) as the skill argument. Examples:
- `/editorial-add "SCSI Protocol Deep Dive"`
- `/editorial-add "SCSI Protocol Deep Dive" "A technical walkthrough of the SCSI protocol for vintage hardware"`

After title/description, prompt for **content type** — `blog` (default) or `youtube`. For YouTube entries, also prompt for the video URL if the user already has it; leave `contentUrl` unset if the video hasn't been published yet (URL is required at publish time).

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Generate slug**: Convert the title to a URL-safe slug (lowercase, hyphens, no special chars)
3. **Check for duplicates**: If a slug already exists in the calendar, report the conflict and stop
4. **Add the entry**: Add a new row to the `## Ideas` table with:
   - Slug (generated)
   - Title (from user)
   - Description (from user, or empty)
   - Keywords (empty — set later via `/editorial-plan`)
   - Content type (if not `blog`; the writer adds a Type column when any entry in the stage has a non-default type)
   - Content URL (for YouTube entries with a known URL; otherwise omit)
   - Source: `manual`
5. **Write the calendar**: Write the updated `docs/editorial-calendar.md`
6. **Report**: Confirm the entry was added and show its slug

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- Preserve all existing entries — only append to the Ideas table
- The calendar format uses pipe-delimited markdown tables (see `scripts/lib/editorial/types.ts` for stage definitions)
