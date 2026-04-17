---
name: feature-image-help
description: "Show the feature-image pipeline workflow and current state: open workflows, decided workflows awaiting apply, and recent generation history."
user_invocable: true
---

# Feature Image — Help & Status

Reports the current state of the feature-image pipeline and the available skills. Use it to:

- See what workflows are open (awaiting user interaction in the gallery)
- See what's decided (awaiting `/feature-image-apply`)
- Recall recent generations
- Remember the workflow

## Usage

```
/feature-image-help
```

No arguments.

## Steps

1. **Print the workflow diagram** (concise):

   ```
   /feature-image-blog <post>   →   agent enqueues (open)
   user opens gallery            →   iterates on prompts + filters
   user submits decision         →   picks a generation (decided)
   /feature-image-apply          →   agent wires files + frontmatter (applied)
   ```

2. **Check pipeline state** via the workflow API:
   - If the dev server is running, prefer HTTP:
     - `GET http://localhost:4321/api/dev/feature-image/workflow` (or whatever port `npm run dev` reported)
   - If the server isn't running, fall back to reading `.feature-image-pipeline.jsonl` directly

3. **Report workflow items, grouped by state:**
   - **Open** (awaiting user in gallery) — show slug, workflow id (first 8), suggested prompt snippet
   - **Decided** (awaiting apply) — show slug, workflow id, approved log entry id
   - **Applied** (recent, last 5) — show slug, files changed
   - **Cancelled** (recent, last 5) — show slug, why if annotated

4. **Check generation history** (optional, if helpful):
   - Read `.feature-image-history.jsonl` tail
   - Surface the last 5 entries with status markers (approved/rejected/generated)

5. **List available skills:**

   | Skill | Purpose |
   |-------|---------|
   | `/feature-image-blog <post-path-or-url>` | Enqueue a workflow item for a blog post |
   | `/feature-image-apply` | Process decided workflows — copy images, update frontmatter + index |
   | `/feature-image-help` | This skill |
   | `/feature-image <page-path>` | Older inline generation for non-blog pages |

6. **Surface the gallery URL:**
   - `http://localhost:4321/dev/feature-image-preview` (or whatever port is live)

7. **Point to the docs** — mention `FEATURE-IMAGES.md` at the repo root for full reference.

## Output Format

Keep the report tight — table for workflow items, one-line per recent history entry, no walls of text.

Example output shape:

```
Workflow pipeline — 2 open, 1 decided, 3 applied

Open (go to http://localhost:4321/dev/feature-image-preview):
  - 7c3a19ab  src/pages/blog/foo/index.md           "Abstract isometric…"
  - 2f4e6bc1  src/pages/blog/bar/index.md           "Close-up macro…"

Decided (awaiting /feature-image-apply):
  - e77e8a7a  src/pages/blog/baz/index.md           log=ed8b6e7f

Recent history (last 3):
  - ed8b6e7f  flux+retro-crt  "Abstract isometric…"  [approved]
  - c1d2a3b4  flux+heavy-crt  "Vintage CRT…"          [generated]
  - 9f8e7d6c  dalle+subtle    "Geometric pattern…"    [rejected]

Docs: FEATURE-IMAGES.md
Skills: /feature-image-blog · /feature-image-apply · /feature-image-help
```

## Notes

- If both the pipeline file and the history file are empty, say so and point at `/feature-image-blog` as the starting point.
- If the dev server isn't running and there ARE open workflows, note that the user needs `npm run dev` to interact with them.
