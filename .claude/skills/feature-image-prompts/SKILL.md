---
name: feature-image-prompts
description: "Browse the prompt template library: list templates by tag, fitness, or lineage; show the parent/fork tree."
user_invocable: true
---

# Feature Image — Prompt Library

Surfaces the curated prompt template library and their fitness scores. The library lives at `docs/feature-image-prompts.yaml` (hand-editable, checked in) and grows over time as you save approved generations as templates and fork existing ones.

## Usage

```
/feature-image-prompts                 # list all (default sort: fitness desc)
/feature-image-prompts <tag>           # filter by tag (e.g., debugging, ai, geometric)
/feature-image-prompts --tree          # show the full lineage tree
/feature-image-prompts --include-archived
```

## Steps

1. **Pick a data source** (in this order):
   - If the dev server is up, prefer HTTP: `GET http://localhost:4321/api/dev/feature-image/templates[?tag=X][&includeArchived=true]` — returns templates ranked by fitness with `usageCount`, `averageRating`, `recentAverageRating`, `fitness` already computed
   - Otherwise read `docs/feature-image-prompts.yaml` directly and skip fitness (display "—")

2. **Render the list as a table:**

   | Slug | Name | Fitness | Uses | Avg ★ | Tags | Parent |
   |------|------|---------|------|-------|------|--------|
   | … | … | 3.42 | 7 | 4.1 | ai, process | crystal-teal |

   Mark archived rows with `(archived)` and dim them in the description.

3. **If `--tree` is set**, render the lineage as nested bullets:

   ```
   crystal-teal  fit=3.4  uses=12
   ├─ crystal-amber  fit=2.9  uses=4   (fork)
   └─ crystal-teal-pixelart  fit=1.1  uses=2  (archived)
   ```

4. **For a specific slug**, also print:
   - Description
   - Full prompt (in a fenced block)
   - Default preset / provider
   - First few example log entry IDs (linkable to gallery history)

5. **Footer:** point at `/dev/feature-image-preview` for the gallery (template picker + Save/Fork actions) and at `FEATURE-IMAGES.md` for the broader docs.

## Notes

- **Fitness** rolls up 1-5 ratings on the generation history (entries with `templateSlug` field). Templates with `usageCount = 0` are surfaced first as "new — needs sampling" so they accumulate data.
- **Lineage** is tracked via the `parent` slug. Forking always sets `parent`; manual edits don't.
- This skill is **read-only**. To create/edit/fork templates, use the gallery UI or edit `docs/feature-image-prompts.yaml` directly.

## Related Skills

- `/feature-image-blog <post>` — auto-suggests templates whose tags match the post
- `/feature-image-help` — overall pipeline status (workflows, recent history)
- `/feature-image-apply` — apply a decided workflow
