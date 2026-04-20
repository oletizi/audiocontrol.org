---
name: editorial-iterate
description: "Revise a draft based on operator comments using the site's voice skill, append a new DraftVersion, and transition the workflow back to in-review. Invoked after the operator clicks Iterate in the review UI."
user_invocable: true
---

# Editorial Iterate — Agent-Side Revision

Produces the next `DraftVersion` for a workflow that's in state `iterating`. Reads the current version plus all open comment annotations, loads the matching voice skill, revises the draft, and hands back to the operator for review.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Voice skill is chosen from site:

- `audiocontrol` → `audiocontrol-voice` (service-manual aesthetic)
- `editorialcontrol` → `editorialcontrol-voice` (magazine voice)

## Usage

```
/editorial-iterate <slug>
/editorial-iterate --site editorialcontrol <slug>
```

## Preconditions

- A workflow exists for `(site, slug, contentKind='longform')` in state `iterating`. If the workflow is still in `in-review`, tell the operator to click Iterate in the review UI first (that transitions it to `iterating`). If it's in `open`, tell them to open the review page first. If in `approved`/`applied`/`cancelled`, tell them why this is a no-op.

## Steps

1. **Resolve site** via `assertSite()`. Resolve slug from the argument.

2. **Fetch the workflow + versions** via `handleGetWorkflow(process.cwd(), { id: null, site, slug, contentKind: 'longform', platform: null, channel: null })` from `scripts/lib/editorial-review/handlers.ts`.
   - 404 → report that no workflow exists; suggest `/editorial-draft-review <slug>`.
   - 200 → proceed.

3. **Validate state**: the workflow must be in `iterating`. If not, report the current state and the expected next action (see Preconditions).

4. **Read the current version**: from the `versions` array returned by step 2, pick the one with `version === workflow.currentVersion`. That's the markdown you're revising.

5. **Read open comment annotations for the current version** via `readAnnotations(process.cwd(), workflow.id, workflow.currentVersion)` from `scripts/lib/editorial-review/pipeline.ts`. Filter to `type === 'comment'` only — edit annotations are already reflected in the current markdown, and approve/reject aren't revision inputs.
   - If zero comments: ask the operator whether they want a voice-driven polish anyway, or whether Iterate was clicked by mistake. Don't silently produce a no-op revision.

6. **Load the matching voice skill's references** (read them with the Read tool):
   - For `audiocontrol`: `.claude/skills/audiocontrol-voice/SKILL.md` + whichever reference files apply to longform (`references/blog-longform.md` is the main one).
   - For `editorialcontrol`: `.claude/skills/editorialcontrol-voice/SKILL.md` + `references/dispatch-longform.md` + `references/voice-vs-audiocontrol.md`.

7. **Revise the draft**. Produce a new full-file markdown that:
   - Addresses each comment annotation (quote → comment text pairs). Do not drop any comment without explaining why in your report.
   - Holds to the voice skill's principles. If a comment asks for something that contradicts the voice, prefer the voice and surface the conflict in your report so the operator can re-comment.
   - Preserves the frontmatter exactly as-is unless a comment specifically asks for a frontmatter change.
   - Keeps version delta focused on the comments; don't rewrite sections the operator didn't flag.

8. **Append the new version** via `appendVersion(process.cwd(), workflow.id, <new markdown>, 'agent')`. This bumps `currentVersion` to N+1 and returns the new `DraftVersion`.

9. **Transition state** via `transitionState(process.cwd(), workflow.id, 'in-review')`. `iterating → in-review` is valid per `VALID_TRANSITIONS`.

10. **Report to the operator**:
    - Version N+1 produced; N annotations addressed
    - Per-annotation: one-line description of what changed
    - Any voice/comment conflicts you surfaced rather than honored
    - Dev URL to review: `http://localhost:4321/dev/editorial-review/<slug>?v=<N+1>`
    - Next step: operator reviews; click Approve / Iterate again / Reject in UI

## Important

- **Do NOT write the file on disk.** This skill only appends a `DraftVersion` to the review pipeline. The approved version is written to the source file by `/editorial-approve`.
- **Do NOT run git operations.**
- **Do NOT modify annotations.** You're producing a new version that addresses them; the annotations stay in history attached to the old version for auditability.

## Related Skills

- `/editorial-draft-review <slug>` — initial enqueue
- `/editorial-approve <slug>` — write approved version to the real file (NO git ops)
- `/editorial-review-cancel <slug>` — cancel
- `/editorial-review-help` — pipeline status
- `audiocontrol-voice`, `editorialcontrol-voice` — the voice skills this loads
