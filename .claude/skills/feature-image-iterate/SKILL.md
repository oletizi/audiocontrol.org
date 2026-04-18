---
name: feature-image-iterate
description: "Drain pending feature-image-iterate workflow items: read the user's feedback and current snapshot, invoke the generation pipeline with adjustments, append an assistant message to the thread, mark the workflow applied."
user_invocable: true
---

# Feature Image — Iterate

Part of the conversation loop. Picks up `feature-image-iterate` workflow items that the user enqueued from the gallery's focus-mode thread composer, responds by generating a new image, and appends an assistant message with commentary and a link to the new log entry.

## Usage

```
/feature-image-iterate
```

No arguments. Processes every pending iterate request.

The dev server at `http://localhost:4322` (or `:4321` if the port is free) must be running.

## Steps

1. **List pending iterate items:**
   - `GET http://localhost:4322/api/dev/feature-image/workflow?state=open`
   - Filter to items where `type === 'feature-image-iterate'`
   - Report count to the user; if zero, stop

2. **For each item, in order:**

   a. **Read the context:**
      - `context.threadId` — root entry id of the lineage
      - `context.sourceEntryId` — the entry the user was viewing when they sent the message
      - `context.userFeedback` — the user's natural-language feedback text
      - `context.snapshot` — current title, subtitle, prompt, preset, filters, overlay

   b. **Read the thread to get prior context** (if the thread has more than one message):
      - `GET http://localhost:4322/api/dev/feature-image/threads?entryId=<sourceEntryId>`
      - Returns `{threadId, messages: [...]}` oldest-first

   c. **Read the source entry** from `.feature-image-history.jsonl` by `sourceEntryId` — gives you the original prompt, preset, filters, provider, etc.

   d. **Interpret the feedback** and pick a response strategy:
      - *Prompt tweak*: the user wants a different subject, palette, or mood → generate a new image with an adjusted prompt
      - *Preset/filter tweak*: the user wants a different visual treatment → generate with a different preset, or use the recomposite endpoint on the existing raw image
      - *Text tweak*: the user wants different overlay text → use `recomposite` with the updated title/subtitle (no new raw generation needed)
      - *Ambiguous feedback*: append a text-only assistant message asking a clarifying question (no new generation)

   e. **Generate or recomposite:**
      - For a new image: `POST http://localhost:4322/api/dev/feature-image/generate` with `{ prompt, provider, preset, filters, title, subtitle, formats, templateSlug?, parentEntryId: sourceEntryId }`. **IMPORTANT: set `parentEntryId` to the source entry id** so lineage is preserved.
      - For a recomposite: `POST http://localhost:4322/api/dev/feature-image/recomposite` with `{ sourceEntryId, title, subtitle, preset, filters, overlay, formats }`. The recomposite endpoint already sets `parentEntryId` to the source.
      - Capture the returned `entry.id` for the assistant message reference.

   f. **Append the assistant message:**
      - `POST http://localhost:4322/api/dev/feature-image/threads` with `{ action: 'append-assistant', threadId: context.threadId, text: "<short explanation of what you changed and why>", logEntryId: "<new entry id>" }`
      - Keep the text concise (1-3 sentences). Explain *what* changed and briefly *why* you interpreted the feedback that way.

   g. **Mark the workflow applied:**
      - `POST http://localhost:4322/api/dev/feature-image/workflow` with `{ action: 'apply-result', id: <workflow id>, changedFiles: ["<generated file paths>"] }`
      - On error: include the `error` field so the state stays `decided` and the item can be retried.

3. **Summary report:**
   - N iterations processed, M succeeded, K failed
   - Per item: source → new entry id, strategy used (prompt tweak / recomposite / clarifying question)
   - Remind the user the new entries appear in the gallery under the same thread (focused on the parent shows the same thread; focusing on the new entry shows it too)

## Feedback Interpretation Hints

Common feedback patterns:

| User says… | Strategy |
|------------|----------|
| "Too literal" / "Too on-the-nose" | Prompt tweak toward abstraction; explain in assistant message |
| "Make it darker/brighter/more saturated" | Grade filter change via recomposite |
| "Try a different palette" | Prompt tweak with explicit palette guidance |
| "The title doesn't wrap well" / "Change the subtitle to X" | Recomposite with new title/subtitle, no new raw generation |
| "Remove/add scanlines" | Recomposite with filter adjustment |
| "Show me another variation" | Generate with same prompt + settings (different seed) |
| "What if we tried [totally different thing]?" | Prompt tweak; acknowledge in assistant message that this is a bigger shift |

Always pick ONE strategy per iterate item — if the feedback suggests multiple changes, bundle them into the single response generation rather than firing off multiple workflow items.

## Error Recovery

An item that fails stays in `open` state (since `apply-result` with `error` transitions to `decided`, not a retry). Re-running `/feature-image-iterate` re-processes it after the underlying issue is fixed. If you encounter a persistent problem (API key missing, credits exhausted), report to the user and suggest they cancel the workflow item from the gallery.

## Related Skills

- `/feature-image-blog <post-path>` — starts a blog-post workflow (different `type`)
- `/feature-image-apply` — applies decided blog workflows to posts
- `/feature-image-help` — reports pipeline state including pending iterations
