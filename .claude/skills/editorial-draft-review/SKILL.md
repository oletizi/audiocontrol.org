---
name: editorial-draft-review
description: "Enqueue an existing blog draft into the editorial-review pipeline for annotation and iteration. Prints the dev URL where the operator can review, comment, edit, and approve the draft."
user_invocable: true
---

# Editorial Draft Review — Enqueue a Draft

Entry point for the longform review loop. Reads the blog post markdown,
creates a `DraftWorkflowItem` in state `open` (idempotent per
(site, slug, contentKind)), and hands off to the operator to review in
the dev surface.

## Usage

```
/editorial-draft-review <slug>
/editorial-draft-review --site editorialcontrol <slug>
```

## Steps

1. **Run the enqueue helper.** The heavy lifting — site resolution,
   slug validation, reading the blog file, calling `createWorkflow`,
   and formatting the status report — lives in a reusable script:

   ```
   npx tsx .claude/skills/editorial-draft-review/enqueue.ts --site <site> <slug>
   ```

   The helper exits non-zero with a descriptive message on failure
   (unknown site, malformed slug, missing scaffold file — in which
   case it lists the blog slugs that do exist on that site).

2. **Relay the output.** The helper prints the workflow id, state,
   current version, and the dev URL. Pass those through unchanged —
   the operator needs the URL to open the review page.

3. **Remind about the dev server.** The review URL only works while
   the editorialcontrol dev server is running
   (`npm run dev:editorialcontrol`). The helper mentions this;
   reinforce it if the operator looks stuck.

## What this skill does NOT do

- **No agent-side drafting.** The scaffolded file's body is whatever
  it is — `/editorial-draft-review` just enqueues it so the operator
  can review, comment, and decide the next move. For initial drafting
  of body content, use `/editorial-draft` (scaffold + optional
  voice-skill-assisted initial copy) or iterate after enqueueing.
- **No git operations.** Enqueueing only writes to `journal/editorial/`
  under the repo root.

## Related skills

- `/editorial-draft` — the step before this one; scaffolds the blog
  post directory + frontmatter from a Planned calendar entry.
- `/editorial-iterate <slug>` — agent-side revision loop after the
  operator clicks Iterate in the UI. **Consults the site voice skill
  before drafting.**
- `/editorial-approve <slug>` — write the approved version to the
  real file (no git operations).
- `/editorial-review-cancel <slug>` — cancel an active workflow.
- `/editorial-review-help` — show pipeline state and next action per
  workflow.

## Why a script instead of a one-liner

Ad-hoc `npx tsx -e "..."` invocations look clean in isolation but
bit-rot the moment the underlying library API shifts. Bundling the
enqueue logic as `.claude/skills/editorial-draft-review/enqueue.ts`
means the skill has a single stable entry point, callers get clear
error messages, and the helper itself is testable / grep-able /
reviewable like any other code.
