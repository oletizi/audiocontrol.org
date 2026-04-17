---
name: editorial-draft
description: "Scaffold a blog post directory and frontmatter from a Planned calendar entry, create a GitHub issue, and move entry to Drafting."
user_invocable: true
---

# Editorial Draft

Move a Planned calendar entry to Drafting. For **blog** entries: creates the blog post directory, index.md with frontmatter, a GitHub tracking issue, and moves the entry. For **youtube** entries: creates a GitHub tracking issue only (no directory — the video lives on YouTube) and moves the entry.

## Input

The user provides the slug of a Planned entry. Example:
- `/editorial-draft scsi-protocol-deep-dive`

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available Planned entries
   - If found but not in Planned stage: report its current stage and stop
3. **Branch on content type** (use `effectiveContentType(entry)` — defaults to `'blog'`):

### If contentType is `blog`

4. **Check for existing post**: Verify `src/pages/blog/<slug>/index.md` does not already exist
   - If it exists: report error and stop
5. **Create blog post directory**: Create `src/pages/blog/<slug>/`
6. **Create index.md**: Generate frontmatter following existing blog conventions:
   ```yaml
   ---
   layout: ../../../layouts/BlogLayout.astro
   title: "<entry title>"
   description: "<entry description>"
   date: "<Month Year>"
   datePublished: "<YYYY-MM-DD>"
   dateModified: "<YYYY-MM-DD>"
   author: "Orion Letizi"
   ---
   ```
   Then add an `# <title>` heading and a `<!-- Write your post here -->` placeholder.
7. **Create GitHub issue**:
   - Title: `[blog post] <entry title>`
   - Body: Description, target keywords, and acceptance criteria (draft, review, publish)

### If contentType is `youtube`

4. **Skip the directory scaffolding** — YouTube videos don't live in the repo.
5. **Create GitHub issue**:
   - Title: `[youtube] <entry title>`
   - Body: Description, target keywords, topics (if any), acceptance criteria (film, edit, upload, publish — with link-back to blog posts if applicable)
   - Mention that the contentUrl must be set on the calendar entry before `/editorial-publish` will advance it.

### Common final steps

8. **Update the calendar**:
   - Move the entry from Planned to Drafting
   - Set the issue number from the created issue
   - Write the updated `docs/editorial-calendar.md`
9. **Report**: Confirm what was created — for blog: file path + issue; for youtube: issue only + reminder that publishing requires contentUrl. Next step: `/editorial-publish`.

## Important

- Use the Write tool to create `src/pages/blog/<slug>/index.md` (blog entries only)
- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- The author is always "Orion Letizi" unless the user specifies otherwise
- Follow the frontmatter format exactly as shown in existing blog posts
- For YouTube entries, do NOT create any files under `src/pages/blog/` — the only artifact is the GitHub issue
