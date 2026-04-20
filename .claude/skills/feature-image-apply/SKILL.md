---
name: feature-image-apply
description: "Process decided workflow items from the feature-image pipeline: copy approved images into the target post's image dir, update frontmatter and blog index card."
user_invocable: true
---

# Feature Image — Apply Decisions

Second half of the async feature-image pipeline. Reads all `decided` workflow items, applies each decision to its target blog post on the correct site, and marks the items `applied`.

## Usage

```
/feature-image-apply
```

No arguments. Processes every pending decision.

## Multi-site routing

Each workflow item's `context.site` (set by `/feature-image-blog`) tells this skill which site's tree to write into:

| site | post source dir | image dir template | blog index |
|------|-----------------|--------------------|-----------|
| `audiocontrol` | `src/sites/audiocontrol/pages/blog/<slug>/` | `src/sites/audiocontrol/public/images/blog/<slug>/` | `src/sites/audiocontrol/pages/blog/index.astro` |
| `editorialcontrol` | `src/sites/editorialcontrol/pages/blog/<slug>/` | `src/sites/editorialcontrol/public/images/blog/<slug>/` | `src/sites/editorialcontrol/pages/blog/index.astro` |

If `context.site` is absent on a legacy item (pre-Phase-14), fall back to the approved log entry's `site` field. If both are absent, default to `audiocontrol` and note the assumption in the output.

## Steps

1. **List decided items:**
   - `GET /api/dev/feature-image/workflow?state=decided`
   - Report count to the user; if zero, stop

2. **Load the generation history:**
   - Read `.feature-image-history.jsonl` to resolve `logEntryId` references

3. **For each decided item, in order:**

   a. **Look up the approved log entry** by `decision.logEntryId`
      - If not found, record an `apply-result` with error, keep state `decided`, continue

   b. **Resolve site:**
      - `site = item.context.site ?? logEntry.site ?? 'audiocontrol'`
      - Note it in the output

   c. **Resolve target paths:**
      - Slug: `item.context.slug` or derived from `item.context.postPath`
      - Target image dir: `src/sites/<site>/public/images/blog/<slug>/`
      - Post source: `src/sites/<site>/pages/blog/<slug>/index.md`
      - Blog index: `src/sites/<site>/pages/blog/index.astro`
      - Create target image dir if missing

   d. **Check for conflicts:**
      - If the target dir already contains `feature-*.png` files, ask the user whether to overwrite
      - If the post already has `image` or `socialImage` pointing to a different path, surface this

   e. **Copy the approved images:**
      - Copy the `-filtered.png` from the log entry's `outputs.filtered` → `<target-dir>/feature-filtered.png`
      - Copy each `outputs.composited` entry → `<target-dir>/feature-<format>.png` (og, youtube, instagram)
      - Copy the `-raw.png` (first one in `outputs.raw`) → `<target-dir>/feature-raw.png` (optional, useful for re-compositing later)
      - Source paths in the log entry are already URL-style (`/images/generated/...`) relative to the correct site's publicDir; resolve them against `src/sites/<site>/public/` to find the filesystem path.

   f. **Update post frontmatter** (`src/sites/<site>/pages/blog/<slug>/index.md`):
      - Set `image: "/images/blog/<slug>/feature-filtered.png"`
      - Set `socialImage: "/images/blog/<slug>/feature-og.png"`
      - Use the Edit tool; preserve other frontmatter fields and ordering

   g. **Update blog index** (`src/sites/<site>/pages/blog/index.astro`):
      - Find the entry whose `slug:` matches
      - Set its `image:` field to `"/images/blog/<slug>/feature-filtered.png"`
      - If no matching entry, report it but don't fail — the user maintains that list manually

   h. **Report the item as applied:**
      - `POST /api/dev/feature-image/workflow` with `{ action: "apply-result", id, changedFiles: [...] }`
      - On error, include the `error` field — state stays `decided` so the item can be retried

4. **Summary report:**
   - N items applied, M failed, K skipped
   - Per item: target post (site + slug), files written, any errors
   - Suggest running `npm run dev` to preview and `git add` / commit when satisfied

5. **Do NOT commit** — user reviews and commits

## Conflict Handling

If the target post already has a feature image:
- Report the existing path and the new path
- Ask the user: overwrite, skip, or cancel this item
- On skip: transition the item to `cancelled` via the workflow endpoint
- On cancel: leave the item as `decided` (user can decide later)

## Cross-site gotchas

- Make sure you're writing into `src/sites/<site>/public/images/blog/<slug>/` — NOT the deprecated top-level `public/` tree (which is orphaned and gitignored).
- Each site's blog index lives under its own `src/sites/<site>/pages/blog/index.astro`. Don't edit the other site's index by accident.
- If a workflow item references a slug that doesn't exist in the target site's blog index, surface the mismatch rather than silently creating one.

## Error Recovery

An item that fails to apply stays in `decided` state with an `application.error`. Re-running `/feature-image-apply` retries it after the underlying issue is fixed.

## Related Skills

- `/feature-image-blog <post-path>` — creates the workflow item this skill consumes
- `/feature-image-iterate` — handles gallery iterate requests
- `/feature-image-help` — report pipeline state including pending workflows
