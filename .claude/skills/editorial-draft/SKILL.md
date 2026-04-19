---
name: editorial-draft
description: "Scaffold a blog post directory and frontmatter from a Planned calendar entry, create a GitHub issue, and move entry to Drafting."
user_invocable: true
---

# Editorial Draft

Move a Planned calendar entry to Drafting. For **blog** entries: creates the blog post directory, index.md with frontmatter, a GitHub tracking issue, and moves the entry. For **youtube** and **tool** entries: creates a GitHub tracking issue only (no directory — the content lives outside the repo) and moves the entry.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Blog posts land under `src/sites/<site>/pages/blog/<slug>/`. Unknown `--site` values error.

## Input

The user provides the slug of a Planned entry. Example:
- `/editorial-draft scsi-protocol-deep-dive`
- `/editorial-draft --site editorialcontrol agent-as-workflow`

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Find the entry**: Look for the slug in the calendar
   - If not found: report error and list available Planned entries
   - If found but not in Planned stage: report its current stage and stop
4. **Branch on content type** (use `hasRepoContent(effectiveContentType(entry))` — true only for `blog`):

### If the entry has repo content (i.e. contentType is `blog`)

5. **Check for existing post**: Verify `src/sites/<site>/pages/blog/<slug>/index.md` does not already exist
   - If it exists: report error and stop
6. **Scaffold the post**: use `scaffoldBlogPost(process.cwd(), site, entry, 'Orion Letizi')` from `scripts/lib/editorial/scaffold.ts`. That helper creates the directory and writes `index.md` with the correct frontmatter:
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

### Else (contentType is `youtube` or `tool`)

5. **Skip the directory scaffolding** — the content lives outside this repo.
6. **Create GitHub issue**:
   - Title: `[<contentType>] <entry title>`
   - Body: Description, target keywords, topics (if any), acceptance criteria appropriate to the type (e.g. youtube: film/edit/upload/publish with link-back to blog posts if applicable; tool: build/test/deploy/link-from-blog)
   - Mention that the contentUrl must be set on the calendar entry before `/editorial-publish` will advance it.

### Common final steps

8. **Update the calendar**:
   - Move the entry from Planned to Drafting
   - Set the issue number from the created issue
   - Write via `writeCalendar(process.cwd(), site, cal)` → `docs/editorial-calendar-<site>.md`
9. **Report**: Confirm what was created — for blog: file path + issue; for youtube: issue only + reminder that publishing requires contentUrl. Next step: `/editorial-publish`.

## Important

- Use `scaffoldBlogPost` (which uses the Write tool internally) to create `src/sites/<site>/pages/blog/<slug>/index.md` (blog entries only)
- Use the Write tool to persist changes to `docs/editorial-calendar-<site>.md`
- The author is always "Orion Letizi" unless the user specifies otherwise
- Follow the frontmatter format exactly as shown in existing blog posts
- For `youtube` and `tool` entries, do NOT create any files under `src/sites/<site>/pages/blog/` — the only artifact is the GitHub issue
