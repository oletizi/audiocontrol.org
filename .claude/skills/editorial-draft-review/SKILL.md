---
name: editorial-draft-review
description: "Enqueue an existing blog draft into the editorial-review pipeline for annotation and iteration. Prints the dev URL where the operator can review, comment, edit, and approve the draft."
user_invocable: true
---

# Editorial Draft Review — Enqueue a Draft

Entry point for the longform review loop. Reads an existing blog post markdown file, creates a `DraftWorkflowItem` in state `open`, and hands off to the operator to review in the dev surface.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Blog drafts live under `src/sites/<site>/pages/blog/<slug>/index.md`.

## Usage

```
/editorial-draft-review <slug>
/editorial-draft-review --site editorialcontrol <slug>
```

## Steps

1. **Resolve site** via `assertSite()` from `scripts/lib/editorial/types.ts`.

2. **Compute the draft path**: `src/sites/<site>/pages/blog/<slug>/index.md`. If the file does not exist, report the expected path and list the blog slugs actually present under `src/sites/<site>/pages/blog/`.

3. **Read the draft markdown** using the Read tool. Keep the full file content — frontmatter + body — as the initial markdown. The review UI re-parses frontmatter at render time, and the voice skill will want to see the whole file for context.

4. **Create the workflow** via `createWorkflow(process.cwd(), { ... })` from `scripts/lib/editorial-review/pipeline.ts`:
   ```ts
   createWorkflow(process.cwd(), {
     site,
     slug,
     contentKind: 'longform',
     initialMarkdown,
     initialOriginatedBy: 'agent',
   });
   ```
   Creation is idempotent on (site, slug, contentKind). If a non-terminal workflow already exists for this tuple, the function returns the existing one unchanged — report that to the user rather than creating a duplicate.

5. **Report to the operator:**
   - The workflow `id` and current `state`
   - The dev URL: `http://localhost:4321/dev/editorial-review/<slug>` (or the port actually reported by `npm run dev:<site>`)
   - Next step: open the URL, annotate, and use the UI controls to iterate/approve
   - Remind the operator to start the dev server if not already running: `npm run dev:<site>`

6. **Do NOT** invoke any agent-side revision work here. This skill is the enqueue step — the operator drives the next moves.

## Related Skills

- `/editorial-iterate <slug>` — agent-side revision loop after operator requests iteration from the UI
- `/editorial-approve <slug>` — write approved version to the real file (NO git operations)
- `/editorial-review-cancel <slug>` — cancel an active workflow
- `/editorial-review-help` — show pipeline state and next action per workflow
