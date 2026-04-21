---
name: editorial-draft
description: "Scaffold a blog post directory and frontmatter from a Planned calendar entry, optionally produce an initial body draft with the site's voice skill, and move the entry to Drafting."
user_invocable: true
---

# Editorial Draft

Move a Planned calendar entry to Drafting. For **blog** entries:
creates the blog post directory, writes `index.md` with calendar-
derived frontmatter, and (optionally, at the operator's request)
produces an initial body draft using the site's voice skill. For
**youtube** and **tool** entries: updates the calendar only — the
content lives outside the repo.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites:
`audiocontrol`, `editorialcontrol`. Blog posts land under
`src/sites/<site>/pages/blog/<slug>/`. Unknown `--site` values error.

## Input

The user provides the slug of a Planned entry:

- `/editorial-draft scsi-protocol-deep-dive`
- `/editorial-draft --site editorialcontrol agent-as-workflow`

## Steps

1. **Resolve site** via `assertSite()`.

2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads
   `docs/editorial-calendar-<site>.md`.

3. **Find the entry**: Look for the slug in the calendar.
   - If not found: report error and list available Planned entries.
   - If found but not in Planned stage: report its current stage
     and stop.

4. **Branch on content type** (use
   `hasRepoContent(effectiveContentType(entry))` — true only for
   `blog`):

### If the entry has repo content (contentType is `blog`)

5. **Check body state.** Call
   `bodyState(path)` from `scripts/lib/editorial/body-state.ts` where
   `path` = `src/sites/<site>/pages/blog/<slug>/index.md`. Three
   possible states drive three modes:

   - **`missing`**: file does not exist. Run the full scaffold-and-
     optionally-draft flow (steps 6–7 below).
   - **`placeholder`**: file exists but body is only the scaffold
     placeholder (`<!-- Write your post here -->`). Skip scaffolding
     — the studio or a prior `/editorial-draft` call already did it.
     Jump to step 7 (draft the body). This is the **new mode** that
     supports the studio's Scaffold-button flow: click scaffold in
     the UI → entry advances to Drafting with an empty body → run
     `/editorial-draft` to fill the body without redoing the
     scaffold.
   - **`written`**: file exists and body has real prose. Report the
     current state and stop; this skill is not the right place to
     edit already-written prose (use `/editorial-iterate` after
     enqueueing for review).

6. **Scaffold the post** (only when body state was `missing`): Call
   `scaffoldBlogPost(process.cwd(), site, entry, 'Orion Letizi')`
   from `scripts/lib/editorial/scaffold.ts`. That helper creates
   the directory and writes `index.md` with the correct frontmatter
   pulled from the calendar entry:

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

   Then adds an `# <title>` heading and a
   `<!-- Write your post here -->` placeholder for the body.

7. **Draft the body** (for `missing` or `placeholder` states).

   If body state was `missing` (step 6 just scaffolded it), ask the
   operator first: *"want an initial v1 body draft now, or is the
   scaffolded file the hand-off point?"* — some operators prefer to
   write the body by hand.

   If body state was `placeholder` (studio scaffolded earlier, or
   the operator came back to finish), skip the question — they
   clearly re-invoked `/editorial-draft` to fill the body.

   Either way, if drafting is wanted: **LOAD THE VOICE SKILL FIRST
   (MANDATORY).** Before writing a single sentence of body copy,
   read the site's voice skill and its longform reference with the
   Read tool:

   - `audiocontrol` → `.claude/skills/audiocontrol-voice/SKILL.md` +
     `.claude/skills/audiocontrol-voice/references/longform.md`
   - `editorialcontrol` →
     `.claude/skills/editorialcontrol-voice/SKILL.md` +
     `.claude/skills/editorialcontrol-voice/references/dispatch-longform.md`

   Then draft the body against the pairing notes, worked example,
   and meta-move decisions that the calendar description records
   (the `/editorial-plan` step pins those; respect them). Use the
   Edit tool to replace the `<!-- Write your post here -->`
   placeholder.

   If the operator wants to write the body themselves (only
   possible when body state was `missing`), skip this step — the
   scaffolded file is the hand-off.

### Else (contentType is `youtube` or `tool`)

5. **Skip directory scaffolding** — the content lives outside this
   repo. Remind the operator that `contentUrl` must be set on the
   calendar entry before `/editorial-publish` will advance the
   entry.

### Common final steps

8. **Update the calendar**: Move the entry from Planned to Drafting.
   Write via `writeCalendar(process.cwd(), site, cal)` →
   `docs/editorial-calendar-<site>.md`.

9. **Report**:
   - For **blog**: file path scaffolded, and whether a v1 body
     draft was written. If yes, recommend
     `/editorial-draft-review --site <site> <slug>` to enqueue for
     review. If no, mention the file is ready for the operator to
     write into directly.
   - For **youtube** / **tool**: confirm the stage flip and remind
     about `contentUrl`.

## Why the voice skill is mandatory for drafting

The voice skill is not polish — it is the framework the piece needs
to hang together. Skipping it and "just writing something" produces
drafts that sound like generic AI blog copy; the operator then pays
in iteration cycles to claw it back to the site's register. Loading
the voice skill up front is a small, predictable cost that
eliminates a large, unpredictable one.

The same rule applies in `/editorial-iterate` and
`/editorial-shortform-draft` — wherever Claude generates copy for
either site, the voice skill is consulted first.

## Important

- Use `scaffoldBlogPost` (which uses the Write tool internally) to
  create `src/sites/<site>/pages/blog/<slug>/index.md` (blog entries
  only).
- Use the Edit tool to replace the body placeholder when drafting
  initial copy.
- Use the Write tool to persist changes to
  `docs/editorial-calendar-<site>.md`.
- The author is always "Orion Letizi" unless the user specifies
  otherwise.
- Follow the frontmatter format exactly as shown in existing blog
  posts.
- For `youtube` and `tool` entries, do NOT create any files under
  `src/sites/<site>/pages/blog/`.
- **No git operations.** Scaffolding, drafting, and stage flips
  all write to disk; the operator reviews the diff and commits
  manually. GitHub issue creation was dropped in Phase 14 of the
  editorial-calendar feature and is explicitly out of scope.
