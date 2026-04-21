---
name: editorial-approve
description: "Transition an approved review workflow to applied. For longform, no disk write is needed at approve time — the markdown file is the source of truth and already holds the approved content. For shortform, the approved markdown is inserted into the matching DistributionRecord in the calendar. Does NOT run any git operations."
user_invocable: true
---

# Editorial Approve — Finalize the Review Loop (No Git)

Terminal step for the review loop. Validates the workflow state,
resolves the approved version via the latest `approve` annotation,
and transitions the workflow to `applied`.

**Single-source-of-truth invariant.** The markdown file on disk IS
the article; the journal stores versioned snapshots for history. The
review-UI Save handler writes disk before snapshotting, and the UI's
Approve button records the current version as approved. So for
longform, at approve time disk is already the approved content — no
write is needed. For shortform there is no per-post file; the
approved markdown is inserted into the calendar's matching
DistributionRecord.

**This skill does NOT run any git operations.** Prose diffs are
higher-risk than image swaps — merge conflicts cost more, review
matters more. The operator drives `git status`, `git diff`,
`git commit`, and `git push` manually.

## Usage

```
# Longform (default content kind)
/editorial-approve <slug>
/editorial-approve --site editorialcontrol <slug>

# Shortform — --platform picks contentKind=shortform
/editorial-approve <slug> --platform reddit --channel r/synthdiy
/editorial-approve --site editorialcontrol <slug> --platform linkedin
```

## Steps

1. **Run the apply helper.** All validation, state resolution,
   and disk/calendar writes live in a reusable script:

   ```
   npx tsx .claude/skills/editorial-approve/apply.ts --site <site> <slug> [--platform <p>] [--channel <c>]
   ```

   The helper refuses (non-zero exit with a descriptive message)
   on any of:
   - Unknown site / malformed slug
   - No workflow matches (site, slug, contentKind, platform?, channel?)
   - Workflow state is not `approved`
   - **Longform:** the approved version has been superseded by
     later saves. Disk has moved on since the operator clicked
     Approve. The operator must either re-click Approve on the
     now-current version, or iterate to bring disk back to the
     approved content.
   - **Shortform:** no matching `DistributionRecord` exists; the
     operator must first run `/editorial-distribute` to record the
     distribution, then re-run approve to insert the copy.
   - Blog file is missing from disk when longform approve is asked.

2. **Relay the output** — it includes the workflow id, site/slug,
   the version that was approved, and the manual-next-steps block
   for git. Pass it through unchanged.

3. **Do NOT run any git commands.** The helper deliberately omits
   them; the operator reviews the diff and commits. If the operator
   asks for git as a separate instruction, that's a separate turn.

## What happens per content kind

### Longform (`contentKind === 'longform'`)

- Validates that the approved version === the workflow's current
  version. If they differ, refuses (see above).
- No disk write: the file at `src/sites/<site>/pages/blog/<slug>/index.md`
  already holds the approved content by SSOT invariant.
- Transitions the workflow to `applied`.

### Shortform (`contentKind === 'shortform'`)

- Finds the matching `DistributionRecord` in the calendar by
  `(slug, platform, channel?)` — channel match is case-insensitive;
  records without a channel require no `--channel` flag.
- Sets `record.shortform = <approved markdown>` and writes the
  calendar.
- Transitions the workflow to `applied`.
- The blog post file is NOT modified for shortform approvals.

## Critical don'ts

- **Do NOT run `git add`, `git commit`, `git push`, or any other git
  command** from this skill.
- **Do NOT alter the approved markdown.** The operator already
  approved the content exactly as it was at approve-time.
- **Do NOT silently roll disk back** if the approved version is
  older than current. The helper already refuses; do not work
  around it.
- **Do NOT re-run `/editorial-iterate`** from here — approve is
  terminal for the revision loop.

## Why the helper (not prose steps)

Prior version of this skill walked Claude Code through ~6 steps of
manual workflow-fetching, version-picking, diff-previewing, and
Write-tool calls. That shape worked but drifted — each run could
subtly do something different depending on how Claude interpreted
the prose. Bundling the logic as `apply.ts` gives a single stable
entry point, deterministic behavior, one place to fix bugs. Same
pattern as `.claude/skills/editorial-draft-review/enqueue.ts` and
`.claude/skills/editorial-iterate/finalize.ts`.

## Related Skills

- `/editorial-draft-review <slug>` — initial enqueue
- `/editorial-iterate <slug>` — agent-side revision (before approve)
- `/editorial-review-cancel <slug>` — cancel
- `/editorial-distribute` — record a distribution before shortform approve
- `/editorial-review-help` — pipeline status
