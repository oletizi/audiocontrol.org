---
name: editorial-publish
description: "Mark a calendar entry as Published with today's date and close its GitHub issue."
user_invocable: true
---

# Editorial Publish

Mark a calendar entry as Published and close its associated GitHub issue.

## Input

The user provides the slug of an entry to publish. Example:
- `/editorial-publish scsi-protocol-deep-dive`

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available non-Published entries
   - If already Published: report that it's already published and stop
3. **Verify the blog post exists**: Check that `src/pages/blog/<slug>/index.md` exists
   - If not: report error — the post must be written before publishing
4. **Update the calendar**:
   - Move the entry to Published
   - Set `datePublished` to today's date (YYYY-MM-DD)
   - Write the updated `docs/editorial-calendar.md`
5. **Close the GitHub issue** (if one is linked):
   - Run: `gh issue close <issue-number> --comment "Published: /blog/<slug>/"`
6. **Report**: Confirm the entry was marked as Published, the date, and whether the issue was closed

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- Preserve all existing entries — only update the target entry
- The publish date is always today unless the user specifies a different date
