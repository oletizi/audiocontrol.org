---
name: editorial-publish
description: "Mark a calendar entry as Published with today's date and close its GitHub issue."
user_invocable: true
---

# Editorial Publish

Mark a calendar entry as Published and close its associated GitHub issue.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Blog post files are expected at `src/sites/<site>/pages/blog/<slug>/index.md`. Unknown `--site` values error.

## Input

The user provides the slug of an entry to publish. Example:
- `/editorial-publish scsi-protocol-deep-dive`
- `/editorial-publish --site editorialcontrol agent-as-workflow`

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available non-Published entries
   - If already Published: report that it's already published and stop
4. **Branch on content type** (use `requiresContentUrl(effectiveContentType(entry))` — true for everything except `blog`):

### If contentType is `blog`

5. **Verify the blog post exists**: Check that `src/sites/<site>/pages/blog/<slug>/index.md` exists
   - If not: report error — the post must be written before publishing

### Else (contentType is `youtube` or `tool`)

5. **Verify `contentUrl` is set**. This is the YouTube video URL for videos, the tool's canonical page URL for tools. If unset, prompt the user for it and persist it onto the entry. Refuse to publish without a URL.

### Common final steps

6. **Update the calendar**:
   - Move the entry to Published
   - Set `datePublished` to today's date (YYYY-MM-DD)
   - For non-blog entries, ensure the `contentUrl` is persisted
   - `writeCalendar(process.cwd(), site, cal)` → `docs/editorial-calendar-<site>.md`
7. **Close the GitHub issue** (if one is linked):
   - For blog: `gh issue close <n> --comment "Published: /blog/<slug>/"`
   - For non-blog: `gh issue close <n> --comment "Published: <contentUrl>"`
8. **Report**: Confirm the entry was marked as Published, the date, the site, whether the issue was closed, and — for `youtube` entries — a reminder to run `/editorial-cross-link-review --site=<site>` to verify the blog posts referenced in the video description reciprocate.

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar-<site>.md`
- Preserve all existing entries — only update the target entry
- The publish date is always today unless the user specifies a different date
- Non-blog entries without `contentUrl` cannot be published — the URL is the canonical identifier for the published content
