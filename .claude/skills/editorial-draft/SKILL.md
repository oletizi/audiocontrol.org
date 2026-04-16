---
name: editorial-draft
description: "Scaffold a blog post directory and frontmatter from a Planned calendar entry, create a GitHub issue, and move entry to Drafting."
user_invocable: true
---

# Editorial Draft

Scaffold a blog post from a Planned calendar entry. Creates the blog post directory, index.md with frontmatter, a GitHub issue, and moves the entry to Drafting.

## Input

The user provides the slug of a Planned entry. Example:
- `/editorial-draft scsi-protocol-deep-dive`

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available Planned entries
   - If found but not in Planned stage: report its current stage and stop
3. **Check for existing post**: Verify `src/pages/blog/<slug>/index.md` does not already exist
   - If it exists: report error and stop
4. **Create blog post directory**: Create `src/pages/blog/<slug>/`
5. **Create index.md**: Generate frontmatter following existing blog conventions:
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
6. **Create GitHub issue**: Run `gh issue create` with:
   - Title: `[blog post] <entry title>`
   - Body: Description, target keywords, and acceptance criteria (draft, review, publish)
   - Label: (none required)
7. **Update the calendar**:
   - Move the entry from Planned to Drafting
   - Set the issue number from the created issue
   - Write the updated `docs/editorial-calendar.md`
8. **Report**: Confirm what was created — file path, issue number, next step (`/editorial-publish`)

## Important

- Use the Write tool to create `src/pages/blog/<slug>/index.md`
- Use the Write tool to persist changes to `docs/editorial-calendar.md`
- The author is always "Orion Letizi" unless the user specifies otherwise
- Follow the frontmatter format exactly as shown in existing blog posts
