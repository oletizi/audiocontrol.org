---
name: editorial-cross-link-review
description: "Audit bidirectional linking between blog posts and YouTube videos; flag missing reciprocal links."
user_invocable: true
---

# Editorial Cross-link Review

For each Published calendar entry, check what it links to and whether those links reciprocate. A healthy state: every blog post that embeds a video's URL also has that video's description linking back to the post, and vice versa. Gaps mean readers/viewers can't hop between the two.

## Steps

1. **Read the calendar** via `readCalendar(process.cwd())`.
2. **Build a blog-markdown loader**: given a slug, read `src/pages/blog/<slug>/index.md` and return its content. Return `null` on read errors.
3. **Build a video-description loader**: given a `contentUrl`, call `getVideoMetadata(url)` from `scripts/lib/youtube/client.ts` and return the `description` field. Catch and swallow errors — return `null` for that entry instead, and let the audit record it.
4. **Run the audit**: `auditCrossLinks({ calendar, fetchBlogMarkdown, fetchVideoDescription })` from `scripts/lib/editorial/crosslinks.ts`.
5. **Report** the results using the format below.

## Report Format

```
Cross-link Audit (N Published entries)

✓ Reciprocated (both sides link):
  claude-vs-codex-claude-perspective ↔ s330-editor-demo-video

⚠ Blog links to video, but video doesn't link back:
  s330-post → s330-video
    (missing in video description)

⚠ Video links to blog, but blog doesn't link back:
  s330-video → s330-post
    (missing in src/pages/blog/s330-post/index.md)

⚠ Outbound link does not resolve to any calendar entry:
  s330-post links to https://youtu.be/UNKNOWN_VIDEO_ID
    (is this a video you want to add to the calendar?)

Errors:
  - video-without-url: YouTube entry has no contentUrl
  - s330-fetch-fail: fetching description for s330-fetch-fail: YouTube API error 403
```

Group sections exactly as above. Omit any section that has no items. If everything reciprocates, say "All cross-links reciprocate." and stop.

## Important

- **Read-only** — do not modify `docs/editorial-calendar.md` or any blog markdown files.
- **Don't fail the whole audit on one bad fetch**: if the YouTube API errors for one video, record the error against that entry and move on. Users will want to see partial results.
- **Unresolved outbound links** (a YouTube URL in a blog post that doesn't match any known video calendar entry) should prompt the user to consider adding it as a calendar entry — that's the main way Phase 6 expects the calendar to grow.
- **Blog entries without markdown files** should still report (as errors) — missing markdown usually means the blog post is tracked in the calendar but not yet written.
- If `~/.config/audiocontrol/youtube.json` is missing, the skill throws with setup instructions from `scripts/lib/youtube/config.ts`. No silent degradation.
