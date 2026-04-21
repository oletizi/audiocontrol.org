---
name: editorial-outline-approve
description: "Advance an approved outline from the Outlining stage to Drafting. Terminates the outline-review workflow (transitions to applied) and flips the calendar Outlining → Drafting in one step. Does NOT run any git operations and does NOT draft the article body — that's the job of /editorial-draft after this runs."
user_invocable: true
---

# Editorial Outline Approve — Handoff to Drafting

Terminal step for the outline loop. Validates that the outline
workflow is approved, transitions it to applied, and advances the
calendar entry Outlining → Drafting. After this runs, the article
file on disk already has the approved `## Outline` section (SSOT:
disk is the article) and the agent can run `/editorial-draft` to
write the body beneath it.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites:
`audiocontrol`, `editorialcontrol`.

## Usage

```
/editorial-outline-approve <slug>
/editorial-outline-approve --site editorialcontrol <slug>
```

## Steps

1. **Run the apply helper:**

   ```
   npx tsx .claude/skills/editorial-outline-approve/apply.ts --site <site> <slug>
   ```

   The helper:
   - Looks up the outline workflow for `(site, slug, 'outline')`.
   - Refuses unless the workflow is in state `approved` (operator
     must click Approve in the review UI first).
   - Refuses unless the calendar entry is in Outlining.
   - Transitions the workflow to `applied`.
   - Advances the calendar Outlining → Drafting.

2. **Relay the output** — workflow id, calendar stage after the
   flip, and next-steps block.

3. **Do NOT run any git commands.** The helper deliberately omits
   them; the operator reviews the diff and commits.

## What this skill does NOT do

- **Does not draft the article body.** That's
  `/editorial-draft <slug>`, run after this skill.
- **Does not touch the `## Outline` section on disk.** By SSOT the
  file already holds the approved outline.
- **Does not enqueue a new workflow.** The drafting-phase review
  workflow (contentKind: 'longform') is created by
  `/editorial-draft-review` once the body is written.

## Why a separate skill, not just Approve in the UI?

The review-UI's Approve button records a workflow-level approval
(annotation + state transition to `approved`). It doesn't touch the
calendar. Stage transitions in the editorial calendar are
always driven by skill commands, not UI buttons — that keeps the
calendar as the single authoritative index of where each article
is, and keeps the review UI focused on the revision loop per
workflow. Same pattern as `/editorial-approve` for longform
workflows.

## Related skills

- `/editorial-outline <slug>` — enter the Outlining stage
- `/editorial-iterate <slug>` — iterate on the outline
- `/editorial-draft <slug>` — draft the body (next step)
- `/editorial-review-help` — pipeline status
