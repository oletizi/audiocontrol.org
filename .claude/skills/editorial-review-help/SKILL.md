---
name: editorial-review-help
description: "Show the editorial-review pipeline state across all active workflows and report the next action per workflow. Mirrors /feature-image-help for the prose side."
user_invocable: true
---

# Editorial Review Help

Dashboard skill. Reads the review pipeline and prints one row per active workflow with the next action the operator should take.

## Site

Accepts `--site <slug>` (default: show both sites). Also accepts `--all` to include terminal (`applied` / `cancelled`) workflows in the report.

## Usage

```
/editorial-review-help
/editorial-review-help --site editorialcontrol
/editorial-review-help --all
```

## Steps

1. **Read the pipeline** via `readWorkflows(process.cwd())` from `scripts/lib/editorial-review/pipeline.ts`. Each element is a `DraftWorkflowItem`.

2. **Filter**:
   - By `--site` if provided (exact match on `workflow.site`).
   - By state: exclude `applied` and `cancelled` unless `--all` is given.

3. **For each remaining workflow, read version count** via `readVersions(process.cwd(), workflow.id)`.

4. **Compute next action per state**:

   | State | Next Action |
   |-------|-------------|
   | `open` | Operator: open `http://localhost:4321/dev/editorial-review/<slug>` (run `npm run dev:<site>` first). State transitions to `in-review` on first annotation or control click. |
   | `in-review` | Operator: add comments in the UI, then click Approve, Iterate, or Reject. |
   | `iterating` | Agent: run `/editorial-iterate --site <site> <slug>` in Claude Code to produce the next version. |
   | `approved` | Agent: run `/editorial-approve --site <site> <slug>` to write the approved version to disk (no git ops — operator commits manually). |
   | `applied` | (shown only with `--all`) terminal — source file was written, workflow closed. |
   | `cancelled` | (shown only with `--all`) terminal — no file changes. |

5. **Print a table**:

   ```
   Editorial review — pipeline status

   | Site              | Slug                         | State      | v   | Next action |
   |-------------------|------------------------------|------------|-----|-------------|
   | editorialcontrol  | your-content-workflow...     | in-review  | 1   | operator: annotate/decide in UI |
   | audiocontrol      | scsi-protocol-deep-dive      | iterating  | 2   | agent: /editorial-iterate --site audiocontrol scsi-protocol-deep-dive |
   ```

6. **Summary line**: counts by state.
   - Example: `2 open, 3 in-review, 1 iterating, 0 approved (1 applied hidden, 0 cancelled hidden)`

7. **If pipeline is empty**:
   - Print: `No active workflows. Start one with /editorial-draft-review <slug>.`

## Important

- **Read-only skill.** Does not mutate anything — no transitions, no file writes, no git.
- **Sort order**: most recently updated first (`workflow.updatedAt` descending) — matches the operator's likely next touchpoint.

## Related Skills

- `/editorial-draft-review <slug>` — enqueue a draft
- `/editorial-iterate <slug>` — agent-side revision
- `/editorial-approve <slug>` — write approved version (no git ops)
- `/editorial-review-cancel <slug>` — cancel a workflow
- `/editorial-help` — broader editorial-calendar workflow (different skill; covers calendar stages, not review pipeline)
