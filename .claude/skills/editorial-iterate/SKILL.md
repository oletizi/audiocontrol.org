---
name: editorial-iterate
description: "Revise a draft based on operator comments using the site's voice skill, append a new DraftVersion, and transition the workflow back to in-review. Invoked after the operator clicks Iterate in the review UI."
user_invocable: true
---

# Editorial Iterate — Agent-Side Revision

Produces the next `DraftVersion` for a workflow that's in state `iterating`. Reads the current version plus all open comment annotations, loads the matching voice skill, revises the draft, and hands back to the operator for review.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Voice skill is chosen from site:

- `audiocontrol` → `audiocontrol-voice` (service-manual aesthetic)
- `editorialcontrol` → `editorialcontrol-voice` (magazine voice)

## Usage

```
/editorial-iterate <slug>                              # longform (default)
/editorial-iterate --site editorialcontrol <slug>
/editorial-iterate --kind outline <slug>               # iterate on an outline workflow
```

## Preconditions

- A workflow exists for `(site, slug, contentKind)` where contentKind is `'longform'` (default) or `'outline'` (when the `--kind outline` flag is passed) and the workflow is in state `iterating`. If the workflow is still in `in-review`, tell the operator to click Iterate in the review UI first (that transitions it to `iterating`). If it's in `open`, tell them to open the review page first. If in `approved`/`applied`/`cancelled`, tell them why this is a no-op.

## Steps

Two helper scripts bracket the creative work. Do **not** reassemble their logic inline with ad-hoc tsx one-liners — the helpers exist so the workflow lookup, state check, comment-resolution semantics, and state transitions stay consistent across every iterate run.

1. **Pre-step — run `pending.ts`:**

   ```
   npx tsx .claude/skills/editorial-iterate/pending.ts --site <site> [--kind <longform|outline>] <slug>
   ```

   Prints workflow id, state, current version, and the pending (unresolved) comments on the current version. Non-zero exit if no workflow (2), not iterating (3), or nothing to iterate (4). Use the printed comment list as the authoritative revision brief.

2. **Load the matching voice skill's references** (read them with the Read tool):
   - For `audiocontrol`: `.claude/skills/audiocontrol-voice/SKILL.md` + whichever reference files apply to longform (`references/blog-longform.md` is the main one).
   - For `editorialcontrol`: `.claude/skills/editorialcontrol-voice/SKILL.md` + `references/dispatch-longform.md` + `references/voice-vs-audiocontrol.md`.

3. **Revise the source file on disk** — `src/sites/<site>/content/blog/<slug>.md`. The content-collection file IS the article (SSOT); the workflow pipeline snapshots versions off of it. Edits should:
   - Address each pending comment from step 1. Don't drop any comment without explaining why in your report.
   - Hold to the voice skill's principles. If a comment asks for something that contradicts the voice, prefer the voice and surface the conflict in your report so the operator can re-comment.
   - Preserve frontmatter and outline unless a comment specifically asks otherwise.
   - Keep the delta focused on the comments; don't rewrite sections the operator didn't flag.

4. **Write a `dispositions.json` file** recording what you did with each comment `pending.ts` surfaced (both on current version and on prior versions). One entry per comment, keyed by comment id (full UUID, not the short form):

   ```json
   {
     "16f2619e-975d-462d-9070-db509518414e": {
       "disposition": "addressed",
       "reason": "Compressed dek to two sentences — hook + promise + worked-example tease."
     },
     "02521eca-61af-425b-8cd1-a5c3aa2f90e4": {
       "disposition": "deferred",
       "reason": "On prior version; kept as rebased so operator decides whether to re-flag."
     }
   }
   ```

   `disposition` is one of:
   - `addressed` — the revision explicitly handled this comment.
   - `deferred` — noted but not changed this round (e.g., stale prior-version comment, or voice-skill conflict the operator should re-comment on).
   - `wontfix` — rejected; the comment conflicts with the voice skill or the argument shape.

   `reason` is a one-sentence explanation the operator will see as a stamp in the review UI.

   Write the file to a scratch location (e.g. `/tmp/dispositions-<slug>.json`). Don't commit it.

5. **Post-step — run `finalize.ts`:**

   ```
   npx tsx .claude/skills/editorial-iterate/finalize.ts \
     --site <site> [--kind <longform|outline>] \
     --dispositions /tmp/dispositions-<slug>.json \
     <slug>
   ```

   Reads the edited source file, appends it as a new `DraftVersion` (`originatedBy: 'agent'`), writes one `address` annotation per dispositions entry, and transitions `iterating → in-review`. Refuses if the file on disk matches the current version exactly (i.e., no revision was actually written).

   `--dispositions` is technically optional, but skip it only if you genuinely handled zero comments (should be rare — pending.ts refuses with exit code 4 in that case anyway). Omitting it means the sidebar shows no "addressed / deferred" stamps for this iteration and the operator has to figure out what you did from the diff.

6. **Report to the operator**:
   - Version N+1 produced; addressed/deferred/wontfix counts (echoed by finalize.ts)
   - Per-annotation: the short id, disposition, and one-line reason — the same information that's now stamped in the sidebar
   - Any voice/comment conflicts you surfaced rather than honored
   - Dev URL to review (printed by `finalize.ts`)
   - Next step: operator reviews stamps + revisions, clicks Approve / Iterate again / Reject in UI

## Important

- **Do NOT run git operations.**
- **Do NOT modify annotations.** The revision addresses them; the annotations stay in history attached to the old version for auditability.
- **Do NOT hand-roll the pre/post logic.** Use `pending.ts` and `finalize.ts`. If their output is wrong for a case you hit, fix the helper, don't route around it.

## Related Skills

- `/editorial-draft-review <slug>` — initial enqueue
- `/editorial-approve <slug>` — write approved version to the real file (NO git ops)
- `/editorial-review-cancel <slug>` — cancel
- `/editorial-review-help` — pipeline status
- `audiocontrol-voice`, `editorialcontrol-voice` — the voice skills this loads
