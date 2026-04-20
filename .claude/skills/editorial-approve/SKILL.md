---
name: editorial-approve
description: "Write the approved draft version to the real blog post file and transition the workflow to applied. Does NOT commit, push, or run any git operations — the operator reviews the diff and commits manually."
user_invocable: true
---

# Editorial Approve — Write to Disk (No Git)

Terminal write step for the longform review loop. Finds a workflow in state `approved`, pulls the version the operator approved, and overwrites the source blog post file with it. Transitions the workflow to `applied`.

**This skill does NOT run any git operations.** Prose diffs are higher-risk than image swaps (merge conflicts cost more, review matters more). The operator drives `git status`, `git diff`, `git commit`, and `git push` manually.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). The target file is `src/sites/<site>/pages/blog/<slug>/index.md`.

## Usage

```
/editorial-approve <slug>
/editorial-approve --site editorialcontrol <slug>
```

## Preconditions

- A workflow exists for `(site, slug, contentKind='longform')` in state `approved`. If it's in `in-review`, tell the operator to click Approve in the UI. If `open` / `iterating`, report and stop. If `applied` / `cancelled`, report that it's already finalized.

## Steps

1. **Resolve site** via `assertSite()`. Resolve slug from the argument.

2. **Fetch the workflow + versions** via `handleGetWorkflow(process.cwd(), { id: null, site, slug, contentKind: 'longform', platform: null, channel: null })`.
   - 404 → report and stop.
   - 200 → proceed.

3. **Validate state** is `approved`. If not, report the current state and the next expected action.

4. **Identify the approved version**: read annotations via `readAnnotations(process.cwd(), workflow.id)` and find the latest `type: 'approve'` annotation. Its `version` field is the approved version number. If no approve annotation exists (unusual — normally the UI records one), fall back to `workflow.currentVersion` and warn the operator.

5. **Load the approved version's markdown**: from the versions array, pick the one whose `version` matches the approved version.

6. **Compute the target path**: `src/sites/<site>/pages/blog/<slug>/index.md`. If the file does not exist, report it — this means someone renamed or deleted the source between `/editorial-draft-review` and now. Stop rather than creating a stale file in an unexpected location.

7. **Preview the diff** (optional but preferred): Read the current on-disk file with the Read tool, compare to the approved markdown, and summarize the changed sections (first line, last line, approximate line delta). The operator appreciates knowing what's about to be written before it's written.

8. **Write the approved markdown** to the target file using the Write tool. Overwrites the existing file.

9. **Transition state** via `transitionState(process.cwd(), workflow.id, 'applied')`. `approved → applied` is valid per `VALID_TRANSITIONS`.

10. **Report to the operator** (explicit next steps, because git is manual):
    ```
    Wrote: src/sites/<site>/pages/blog/<slug>/index.md
    Workflow: <id> → applied
    Approved version: v<N>

    Next steps (manual):
      git status
      git diff src/sites/<site>/pages/blog/<slug>/index.md
      git add src/sites/<site>/pages/blog/<slug>/index.md
      git commit -m "..."
      git push
    ```

## Critical don'ts

- **Do NOT run `git add`, `git commit`, `git push`, or any other git command.** If the operator asks you to after approve, that's a separate explicit instruction — you may then, but not as part of this skill.
- **Do NOT alter the approved markdown.** Write it as stored in the DraftVersion. The operator already approved it exactly as-is in the UI.
- **Do NOT re-run `/editorial-iterate`** from here — the approve signal is terminal for the revision loop.

## Related Skills

- `/editorial-draft-review <slug>` — initial enqueue
- `/editorial-iterate <slug>` — agent-side revision (before approve)
- `/editorial-review-cancel <slug>` — cancel
- `/editorial-review-help` — pipeline status
