---
name: feature-image-apply
description: "Drain pending feature-image decisions and approved entries: copy the baked images into the target post's public dir, wire frontmatter, mark the entry applied."
user_invocable: true
---

# Feature Image — Apply

Second half of the async pipeline. Two paths into "ready to apply":

1. **Decided workflow** — user submitted a specific generation as a workflow decision in the gallery. The workflow context carries `postPath` / `slug` / `site`.
2. **Approved entry without a workflow** — user clicked Approve in the focus view. The entry is baked in all three social formats and marked `status: 'approved'`, but no workflow is attached. Target post is inferred by matching the entry's `title` against posts under `src/sites/<site>/pages/blog/` for the entry's site.

Both paths terminate the same way: copy the five files into the post's public dir (`feature-{og,youtube,instagram,filtered,raw}.png`), upsert `image` / `socialImage` / `dateModified` in the post frontmatter, and mark the log entry with `appliedTo=<postPath>`.

## Usage

```
/feature-image-apply
```

No arguments. Processes every pending decision + every unapplied approved entry.

Dev server (default `http://localhost:4321`) must be running for the HTTP API.

## Helper scripts

- `scan.ts` — lists everything pending: decided workflows + approved-unapplied entries with candidate targets (matched by title + site). Read-only.
- `apply.ts --workflow=<id>` or `apply.ts --entry=<id> --to=<post-path>` — performs a single apply: file copies, frontmatter edits, `appliedTo` marker, and (for workflow mode) the `apply-result` transition.

Both helpers accept `--base=<url>` to override the default dev-server port. `apply.ts` also accepts `--dry-run` to preview without writing.

## Steps

### 1. Scan for pending work

```bash
tsx .claude/skills/feature-image-apply/scan.ts
```

Output shape:
```json
{
  "decidedCount": 1,
  "approvedUnappliedCount": 2,
  "decided": [ { "workflowId": "...", "postPath": "...", "logEntryId": "...", ... } ],
  "approvedUnapplied": [
    {
      "entryId": "...",
      "site": "editorialcontrol",
      "title": "...",
      "candidateTargets": [ { "postPath": "...", "slug": "...", "site": "..." } ],
      "targetDecision": "auto" | "ambiguous" | "none"
    }
  ]
}
```

If both counts are zero, report "nothing pending" and stop.

### 2. Apply each decided workflow

For each entry in `decided`, call:
```bash
tsx .claude/skills/feature-image-apply/apply.ts --workflow=<workflowId>
```

`apply.ts` reads the workflow context, resolves the log entry, copies files, edits frontmatter, marks the log entry with `appliedTo`, and transitions the workflow to `applied`.

### 3. Apply each approved-unapplied entry

For each entry in `approvedUnapplied`:

- **`targetDecision: auto`** (exactly one post title matches) — apply without prompting:
  ```bash
  tsx .claude/skills/feature-image-apply/apply.ts --entry=<entryId> --to=<candidateTargets[0].postPath>
  ```
- **`targetDecision: ambiguous`** (multiple matches) — surface the list to the user and ask which post to apply to, then run `apply.ts` with `--to=<chosen>`.
- **`targetDecision: none`** (no title match found) — report the entry + site and ask the user for the target `post-path`. Possible reasons: the post's title doesn't exactly match the entry's title, or the post doesn't exist yet.

### 4. Summary report

After all items processed:
- N applied, M skipped, K failed
- Per item: `entryId[:8] → <site>:<slug>` (one line each)
- Suggest `npm run dev:<site>` to preview, then `git add` + commit when satisfied

### 5. Do NOT commit

The user reviews + commits.

## Conflict handling

If the target post already has `feature-*.png` files in its image dir:
- Report the existing files before overwriting
- Ask the user: overwrite / skip this item / cancel

If the post already has an `image` / `socialImage` frontmatter pointing elsewhere:
- Surface the existing value. The helper upserts over it; that's usually fine but worth naming so the user can intervene.

## Path conventions

| Kind | Path |
|------|------|
| Scratch output (gallery's host site) | `src/sites/audiocontrol/public/images/generated/<baseName>-<format>.png` |
| Target image dir | `src/sites/<site>/public/images/blog/<slug>/` |
| Target filenames | `feature-og.png`, `feature-youtube.png`, `feature-instagram.png`, `feature-filtered.png`, `feature-raw.png` |
| Target post | `src/sites/<site>/pages/blog/<slug>/index.md` |
| Target frontmatter | `image: "/images/blog/<slug>/feature-filtered.png"`, `socialImage: "/images/blog/<slug>/feature-og.png"` |
| Applied marker | `LogEntry.appliedTo = "<postPath>"` |

## Error recovery

An item that fails stays in its current state (decided workflow stays `decided`; approved entry stays without `appliedTo`). Re-run the skill after fixing the underlying issue.

If `apply.ts` reports a missing source file, the scratch output may have been cleared — the user should regenerate or reapprove to produce fresh files.

## Related skills

- `/feature-image-blog <post-path>` — start a blog-post workflow (produces `decided` items)
- `/feature-image-iterate` — drain gallery iterate-thread messages
- `/feature-image-help` — pipeline state
- The gallery's **Approve** button — bakes all three social formats + marks entry approved (produces approved-unapplied items)
