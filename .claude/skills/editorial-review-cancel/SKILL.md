---
name: editorial-review-cancel
description: "Cancel an active editorial-review workflow and leave the source file untouched. Transitions the workflow to the cancelled terminal state."
user_invocable: true
---

# Editorial Review Cancel

Abort an in-flight review without writing anything to disk. Use when a draft is being withdrawn, the review is no longer worth continuing, or the workflow was enqueued by mistake.

## Site

Accepts `--site <slug>` (default: `audiocontrol`).

## Usage

```
/editorial-review-cancel <slug>
/editorial-review-cancel --site editorialcontrol <slug>
```

## Steps

1. **Resolve site** via `assertSite()`. Resolve slug from the argument.

2. **Fetch the workflow** via `handleGetWorkflow(process.cwd(), { id: null, site, slug, contentKind: 'longform', platform: null, channel: null })`.
   - 404 → report no active workflow for this slug; stop.
   - 200 → proceed.

3. **Check state**: if already `applied` or `cancelled`, report and stop (terminal states don't re-cancel).

4. **Transition to cancelled** via `transitionState(process.cwd(), workflow.id, 'cancelled')`. Every non-terminal state has `cancelled` as a valid target per `VALID_TRANSITIONS`.

5. **Report**:
   - Workflow `<id>` cancelled
   - Source file `src/sites/<site>/pages/blog/<slug>/index.md` was NOT modified
   - All annotations remain in history for audit

## Important

- **Do NOT delete** the draft file. Cancelling a review doesn't imply cancelling the post.
- **Do NOT remove** annotations from history. They stay as part of the audit trail.
- If the operator wants to re-open review for the same slug, they can re-run `/editorial-draft-review <slug>` — `createWorkflow` will mint a fresh workflow because the prior one is in a terminal state.

## Related Skills

- `/editorial-draft-review <slug>` — re-enqueue after cancel (creates a new workflow)
- `/editorial-review-help` — pipeline status
