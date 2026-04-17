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
- `/editorial-plan scsi-protocol-deep-dive` (will prompt for keywords and topics)

After keywords are collected, also prompt for optional **topics** — coarse tags used by `/editorial-reddit-opportunities` to look up relevant subreddits. Example topics for this project: `samplers`, `vintage-hardware`, `scsi`, `roland`, `akai`, `ai-agents`, `home-studio`, `programming`, `reverse-engineering`. Topics are optional; untagged posts simply get no cross-posting suggestions.

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available Ideas entries
   - If found but not in Ideas stage: report its current stage and stop
3. **Get keywords**: Use the keywords from the argument, or ask the user for target keywords
4. **Get topics** (optional): ask the user for comma-separated topic tags. Blank is fine — leaves the `topics` field unset.
5. **Move to Planned**: Change the entry's stage from Ideas to Planned, set keywords, and set topics if provided
   - Remove the row from the `## Ideas` table
   - Add it to the `## Planned` table with the keywords (and topics, if any) filled in
5. **Write the calendar**: Write the updated `docs/editorial-calendar.md`
6. **Report**: Confirm the move and show the entry with its keywords

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- Preserve all existing entries — only move the target entry between tables
- The calendar format uses pipe-delimited markdown tables
