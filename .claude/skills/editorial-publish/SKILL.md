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
3. **Branch on content type** (use `requiresContentUrl(effectiveContentType(entry))` — true for everything except `blog`):

### If contentType is `blog`

4. **Verify the blog post exists**: Check that `src/pages/blog/<slug>/index.md` exists
   - If not: report error — the post must be written before publishing

### Else (contentType is `youtube` or `tool`)

4. **Verify `contentUrl` is set**. This is the YouTube video URL for videos, the tool's canonical page URL for tools. If unset, prompt the user for it and persist it onto the entry. Refuse to publish without a URL.

### Common final steps

5. **Update the calendar**:
   - Move the entry to Published
   - Set `datePublished` to today's date (YYYY-MM-DD)
   - For non-blog entries, ensure the `contentUrl` is persisted
   - Write the updated `docs/editorial-calendar.md`
6. **Close the GitHub issue** (if one is linked):
   - For blog: `gh issue close <n> --comment "Published: /blog/<slug>/"`
   - For non-blog: `gh issue close <n> --comment "Published: <contentUrl>"`
7. **Report**: Confirm the entry was marked as Published, the date, whether the issue was closed, and — for `youtube` entries — a reminder to run `/editorial-cross-link-review` to verify the blog posts referenced in the video description reciprocate.

## Important

- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- Preserve all existing entries — only update the target entry
- The publish date is always today unless the user specifies a different date
- Non-blog entries without `contentUrl` cannot be published — the URL is the canonical identifier for the published content
