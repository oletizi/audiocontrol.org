---
name: editorial-approve
description: "Write the approved draft version to the correct destination (blog file for longform; DistributionRecord.shortform in the calendar for shortform) and transition the workflow to applied. Does NOT commit, push, or run any git operations — the operator reviews the diff and commits manually."
user_invocable: true
---

# Editorial Approve — Write to Disk (No Git)

Terminal write step for the review loop. Finds a workflow in state `approved`, pulls the version the operator approved, and writes it to the correct destination depending on `contentKind`:

- `longform` → overwrites `src/sites/<site>/pages/blog/<slug>/index.md`
- `shortform` → writes to the matching `DistributionRecord.shortform` in `docs/editorial-calendar-<site>.md` (calendar's `## Shortform Copy` section)

Transitions the workflow to `applied` in both cases.

**This skill does NOT run any git operations.** Prose diffs are higher-risk than image swaps (merge conflicts cost more, review matters more). The operator drives `git status`, `git diff`, `git commit`, and `git push` manually.

## Site

Accepts `--site <slug>` (default: `audiocontrol`).

## Usage

```
# Longform (default content kind)
/editorial-approve <slug>
/editorial-approve --site editorialcontrol <slug>

# Shortform — specify platform + optional channel to disambiguate
# when a post has multiple shortform workflows open
/editorial-approve <slug> --platform reddit --channel r/synthdiy
/editorial-approve --site editorialcontrol <slug> --platform linkedin
```

## Preconditions

- A workflow exists for `(site, slug, contentKind, platform?, channel?)` in state `approved`. If it's in `in-review`, tell the operator to click Approve in the UI. If `open` / `iterating`, report and stop. If `applied` / `cancelled`, report that it's already finalized.
- For shortform: the matching `DistributionRecord` must exist in the calendar (use `/editorial-distribute` first if not). If missing, report and stop — this skill writes copy into an existing record, it does not create new DistributionRecords.

## Steps

1. **Resolve site, slug, and optional content kind** via `assertSite()`. Default `contentKind` is `longform`. If `--platform` is provided, `contentKind` becomes `shortform`.

2. **Fetch the workflow + versions** via `handleGetWorkflow(process.cwd(), { id: null, site, slug, contentKind, platform, channel })`.
   - 404 → report and stop.
   - 200 → proceed.

3. **Validate state** is `approved`. If not, report the current state and the next expected action.

4. **Identify the approved version**: read annotations via `readAnnotations(process.cwd(), workflow.id)` and find the latest `type: 'approve'` annotation. Its `version` field is the approved version number. If no approve annotation exists (unusual — normally the UI records one), fall back to `workflow.currentVersion` and warn the operator.

5. **Load the approved version's markdown**: from the versions array, pick the one whose `version` matches the approved version.

6. **Branch by `contentKind`:**

### Longform path (`contentKind === 'longform'`)

6a. **Compute the target path**: `src/sites/<site>/pages/blog/<slug>/index.md`. If the file does not exist, report it — this means someone renamed or deleted the source between `/editorial-draft-review` and now. Stop rather than creating a stale file in an unexpected location.

6b. **Preview the diff** (optional but preferred): Read the current on-disk file with the Read tool, compare to the approved markdown, and summarize the changed sections (first line, last line, approximate line delta). The operator appreciates knowing what's about to be written before it's written.

6c. **Write the approved markdown** to the target file using the Write tool. Overwrites the existing file.

### Shortform path (`contentKind === 'shortform'`)

6a. **Read the calendar** via `readCalendar(process.cwd(), site)`.

6b. **Find the matching `DistributionRecord`** by `(slug, platform, channel)` — channel match is case-insensitive. If no matching record exists, report and stop: the operator must first run `/editorial-distribute` to record the distribution before its copy can be approved.

6c. **Preview the diff** (optional): if the record already has a `shortform` value, show the operator how the approved text differs.

6d. **Set `record.shortform = <approved markdown>`** and write the calendar back via `writeCalendar(process.cwd(), site, cal)`. Note: the blog post file on disk is NOT modified for shortform approvals.

### Common final steps

7. **Transition state** via `transitionState(process.cwd(), workflow.id, 'applied')`. `approved → applied` is valid per `VALID_TRANSITIONS`.

8. **Report to the operator** (explicit next steps, because git is manual):

   For **longform**:
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

   For **shortform**:
   ```
   Wrote: docs/editorial-calendar-<site>.md · ## Shortform Copy · ### <slug> · <platform>[ · <channel>]
   Workflow: <id> → applied
   Approved version: v<N>

   Next steps (manual):
     git status
     git diff docs/editorial-calendar-<site>.md
     git add docs/editorial-calendar-<site>.md
     git commit -m "..."
     git push

   When you actually share the post, use the channel-specific helper:
     /editorial-distribute  (records the share URL + timestamp)
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
