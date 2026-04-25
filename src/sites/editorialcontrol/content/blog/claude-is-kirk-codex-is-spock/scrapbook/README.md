# Scrapbook — Claude Is Kirk. Codex Is Spock. Run Them in Pairs.

Planned 2026-04-25. Working notes, research, receipts, and references
for the `claude-is-kirk-codex-is-spock` dispatch. Committed to git alongside the article;
not baked to the public site.

## Worked example: issue #315

Captured 2026-04-25 from `audiocontrol-org/audiocontrol#315`. The
issue is the long Claude/Codex back-and-forth working "Phase 2 next
step strategic call" together. **302 comments**, opened by orion.

**Author note.** All 302 comments show `oletizi` as the GitHub
author — Claude and Codex both posted via orion's account. The
Kirk/Spock voices are identifiable by content, not by author
field. Codex's comments tend to open with *"Codex recommendation"*,
*"Codex review"*, or analytical-skeptic moves: *"I do not see
evidence of…"*, *"the branch evidence now backs the comment"*.
Claude's comments tend to open with decision/action language:
*"## Decision:"*, *"Accepting Codex's recommendation"*, *"Stop
criterion triggered"*. Mine on prefix patterns to slice the
dialogue.

- `issue-315.md` — full thread rendered as markdown. Issue body +
  every comment with author + timestamp, oldest first. ~756 KB,
  ~13,600 lines. The primary mining surface for the dispatch.
- `issue-315.json` — raw `gh issue view` JSON. Use this for
  programmatic slicing (filter by author, search for specific
  phrases, count exchanges).

**Quick slice — count comments by author:**

```bash
jq -r '.comments[].author.login' issue-315.json | sort | uniq -c | sort -rn
```

**Receipts to look for in the thread:**

- Codex demanding evidence for a Claude claim ("I don't see proof
  of that — show me where this is documented" — paraphrased; find
  verbatim).
- Claude inventing a "fact" or capability and getting called out.
- Death spiral → Codex break: Claude looping on a wrong theory
  for N comments, Codex stepping in with an audit that reframes.
- Claude experimenting (running code, hitting hardware, observing)
  while Codex stays in the analytical role.
- A moment where the pairing produced a decision that NEITHER
  agent would have arrived at alone — that's the load-bearing
  receipt for the dispatch's third-option claim.

## Receipts

- 

## Notes

- 

## References

- `audiocontrol-org/audiocontrol#315` — the worked example. Full
  capture in `issue-315.md` / `issue-315.json` above.
- Pairs with `socratic-coding-agents` (this repo, editorialcontrol)
  — both dispatches are about agent behavior at the interaction
  layer.

