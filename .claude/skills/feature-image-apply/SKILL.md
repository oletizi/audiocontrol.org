---
name: feature-image-apply
description: "Process decided workflow items from the feature-image pipeline: copy approved images into the target post's image dir, update frontmatter and blog index card."
user_invocable: true
---

# Feature Image — Apply Decisions

Second half of the async feature-image pipeline. Reads all `decided` workflow items, applies each decision to its target blog post, and marks the items `applied`.

## Usage

```
/feature-image-apply
```

No arguments. Processes every pending decision.

## Steps

1. **List decided items:**
   - `GET /api/dev/feature-image/workflow?state=decided`
   - Report count to the user; if zero, stop

2. **Load the generation history:**
   - Read `.feature-image-history.jsonl` to resolve `logEntryId` references

3. **For each decided item, in order:**

   a. **Look up the approved log entry** by `decision.logEntryId`
      - If not found, record an `apply-result` with error, keep state `decided`, continue

   b. **Resolve target paths:**
      - Target dir: `public/images/blog/<slug>/` (derive slug from `context.slug` or `context.postPath`)
      - Create if missing

   c. **Check for conflicts:**
      - If the target dir already contains `feature-*.png` files, ask the user whether to overwrite
      - If the post already has `image` or `socialImage` pointing to a different path, surface this

   d. **Copy the approved images:**
      - Copy the `-filtered.png` from the log entry's `outputs.filtered` → `<target-dir>/feature-filtered.png`
      - Copy each `outputs.composited` entry → `<target-dir>/feature-<format>.png` (og, youtube, instagram)
      - Copy the `-raw.png` (first one in `outputs.raw`) → `<target-dir>/feature-raw.png` (optional, useful for re-compositing later)

   e. **Update post frontmatter** (`src/pages/blog/<slug>/index.md`):
      - Set `image: "/images/blog/<slug>/feature-filtered.png"`
      - Set `socialImage: "/images/blog/<slug>/feature-og.png"`
      - Use the Edit tool; preserve other frontmatter fields and ordering

   f. **Update blog index** (`src/pages/blog/index.astro`):
      - Find the entry whose `slug:` matches
      - Set its `image:` field to `"/images/blog/<slug>/feature-filtered.png"`
      - If no matching entry, report it but don't fail — the user maintains that list manually

   g. **Report the item as applied:**
      - `POST /api/dev/feature-image/workflow` with `{ action: "apply-result", id, changedFiles: [...] }`
      - On error, include the `error` field — state stays `decided` so the item can be retried

4. **Summary report:**
   - N items applied, M failed, K skipped
   - Per item: target post, files written, any errors
   - Suggest running `npm run dev` to preview and `git add` / commit when satisfied

5. **Do NOT commit** — user reviews and commits

## Conflict Handling

If the target post already has a feature image:
- Report the existing path and the new path
- Ask the user: overwrite, skip, or cancel this item
- On skip: transition the item to `cancelled` via the workflow endpoint
- On cancel: leave the item as `decided` (user can decide later)

## Error Recovery

An item that fails to apply stays in `decided` state with an `application.error`. Re-running `/feature-image-apply` retries it after the underlying issue is fixed.

## Related Skills

- `/feature-image-blog <post-path>` — creates the workflow item this skill consumes
