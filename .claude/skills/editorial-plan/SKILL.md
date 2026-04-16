---
name: editorial-plan
description: "Move a calendar entry to the Planned stage and set target keywords."
user_invocable: true
---

# Editorial Plan

Move an editorial calendar entry from Ideas to Planned and set target SEO keywords.

## Input

The user provides a slug and keywords. Examples:
- `/editorial-plan scsi-protocol-deep-dive "SCSI protocol, vintage hardware, SCSI commands"`
- `/editorial-plan scsi-protocol-deep-dive` (will prompt for keywords)

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available Ideas entries
   - If found but not in Ideas stage: report its current stage and stop
3. **Get keywords**: Use the keywords from the argument, or ask the user for target keywords
4. **Move to Planned**: Change the entry's stage from Ideas to Planned and set the keywords
   - Remove the row from the `## Ideas` table
   - Add it to the `## Planned` table with the keywords filled in
5. **Write the calendar**: Write the updated `docs/editorial-calendar.md`
6. **Report**: Confirm the move and show the entry with its keywords

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- Preserve all existing entries — only move the target entry between tables
- The calendar format uses pipe-delimited markdown tables
