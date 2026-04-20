---
name: feature-image-iterate
description: "Drain pending feature-image-iterate workflow items: read the user's feedback and current snapshot, invoke the generation pipeline with adjustments, append an assistant message to the thread, mark the workflow applied."
user_invocable: true
---

# Feature Image — Iterate

Part of the conversation loop. Picks up `feature-image-iterate` workflow items that the user enqueued from the gallery's focus-mode thread composer, responds by generating a new image (or a recomposite, or a clarifying question), and appends an assistant message with commentary and a link to the new log entry.

## Usage

```
/feature-image-iterate
```

No arguments. Processes every pending iterate request.

The dev server at `http://localhost:4322` (or `:4321`) must be running.

## Helper scripts

Two scripts live in this skill directory. They're designed to keep the permission prompts down — one pre-approved command pattern per phase, instead of ad-hoc curl one-liners:

- `drain.ts` — lists all pending iterate items with full context (source entry, thread history, snapshot). Read-only.
- `respond.ts --payload=<file>` — executes one response: generate/recomposite/clarify → append-assistant → apply-result.

## Steps

### 1. Drain pending items

```bash
tsx .claude/skills/feature-image-iterate/drain.ts
```

Output is JSON with `pendingCount` and per-item `workflowId`, `threadId`, `sourceEntryId`, `userFeedback`, `snapshot`, `source` (the source log entry), and `thread` (prior message history).

If `pendingCount === 0`, report that and stop.

### 2. For each item, pick a strategy

Interpret the `userFeedback` in context of `snapshot` (what the user was looking at) and `thread` (what's been discussed). Pick exactly ONE strategy per item:

| Feedback pattern | Strategy |
|------------------|----------|
| "Too literal" / "Too on-the-nose" / "Try something more abstract" | `generate` with prompt tweak toward abstraction |
| "Make it darker/brighter/more saturated" / "Different palette" | `generate` with prompt tweak (for palette) or `recomposite` with grade change |
| "Change the title to X" / "Different subtitle" | `recomposite` with new title/subtitle, no new raw image |
| "Add/remove scanlines" / "More phosphor" | `recomposite` with filter tweak |
| "Show another variation" | `generate` with same settings (different seed) |
| Meta-question about the workflow (e.g. "how do I mark this as preferred?") | `clarify` — text-only response, no generation |
| Anything ambiguous / multiple conflicting asks | `clarify` with a single specific question back |

### 3. Build the payload file

Write a JSON payload to a tmp file. Example shapes:

**Prompt tweak** (new generation):
```json
{
  "workflowId": "<from drain output>",
  "threadId": "<from drain>",
  "assistantText": "Pushed the prompt away from literal grid arrangements — now it asks for overlapping shapes at slight angles. Same palette and grain.",
  "strategy": "generate",
  "generate": {
    "prompt": "<adjusted prompt>",
    "provider": "flux",
    "preset": "retro-crt",
    "title": "<from snapshot>",
    "subtitle": "<from snapshot>",
    "formats": "og",
    "parentEntryId": "<sourceEntryId>"
  }
}
```

**Recomposite** (reuse raw, change overlay/filters):
```json
{
  "workflowId": "...",
  "threadId": "...",
  "assistantText": "Swapped to teal-amber grade so the shadows warm up without losing the cool highlights.",
  "strategy": "recomposite",
  "recomposite": {
    "sourceEntryId": "<sourceEntryId>",
    "title": "<from snapshot>",
    "subtitle": "<from snapshot>",
    "preset": "teal-amber",
    "filters": { "grade": "teal-amber", "phosphor": "off", "vignette": "subtle", "scanlines": "off", "grain": "light" },
    "overlay": true,
    "overlayPosition": "bottom",
    "formats": ["og"]
  }
}
```

`overlayPosition` accepts `bottom` | `middle` | `top` | `left` | `right` | `left-two-thirds` | `right-two-thirds` | `left-one-third` | `right-one-third` | `full`. Pull from the snapshot if the user has been iterating on position; otherwise inherit from the source entry (default `bottom`).

**Clarify** (text-only, no generation):
```json
{
  "workflowId": "...",
  "threadId": "...",
  "assistantText": "When you say 'more scattered', do you want fewer panels at larger scales, or the same count but more offset from each other?",
  "strategy": "clarify"
}
```

### 4. Execute the response

```bash
tsx .claude/skills/feature-image-iterate/respond.ts --payload=/tmp/iter-<short-id>.json
```

Respond writes all three steps (the optional generate/recomposite + the assistant message + apply-result). On success, prints the new entry id and confirms.

### 5. Summary report

After processing all items:
- N processed, M succeeded, K failed
- Per item: `sourceEntryId[:8] → newEntryId[:8] · strategy`
- Remind the user the new entries appear in the gallery under the same thread.

## Feedback Interpretation Hints

- Always pick ONE strategy per iterate item. Bundle multiple changes into a single response generation rather than firing multiple workflow items.
- When in doubt, `clarify` is better than guessing — the user will appreciate the precise follow-up more than a wrong generation.
- If the feedback is a meta-question about the pipeline (ratings, templates, lineage, artifical selection), answer in the assistant message without generating. Point at the Phase 11 prompt library for "how do I cultivate this"-style questions.

## Error Recovery

`respond.ts` exits non-zero on any HTTP failure. Errors include the response body so you can diagnose. Retry by re-running with the same payload after fixing the underlying issue (e.g. dev server not running, API key missing).

If a persistent problem blocks progress (credits exhausted, etc.), report to the user and suggest they cancel the workflow item from the gallery.

## Related Skills

- `/feature-image-blog <post-path>` — creates feature-image-blog workflow items (different `type`)
- `/feature-image-apply` — applies decided blog workflows to posts
- `/feature-image-help` — reports pipeline state including pending iterations
