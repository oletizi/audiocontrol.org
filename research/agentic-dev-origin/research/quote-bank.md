# Quote bank — strongest operator lines (reusable across articles)

Curated pull-quotes from the receipts. Tags: **[V]** verbatim operator words (from a
transcript/summary) · **[C]** quoted inside a git commit message · **[S]** from the
stack-control spec · **[P]** analysis-paraphrase (the session-summary's wording, not
necessarily verbatim — verify against the full transcript before publishing as a quote).
Where a session id is known it's in `[brackets]`. Verify [P] lines against
`content/*.jsonl.age` (decrypt) before quoting as exact.

## On having no playbook / distrusting plausible advice
- **[V]** "all of your advice has been wrong… I don't want guesses based on what 'seems plausible'."
- **[P]** The rules exist "to suppress pathological behavior that I couldn't figure out how to fix any other way."

## Test theater → prove it works (the loudest disaster→rule)
- **[V, ~05-14, 21b95c31]** "You shipped garbage." / "What's the point of writing UI tests that don't exercise the UI?"
- **[V]** "you burned days building a UI test suite that tests nothing… How would you write a test harness that PROVES the value slider works?"

## Scope discipline (PROCESS was 128 of 225 corrections)
- **[V, 03-21, 27263c0e]** "Why didn't that automatically get updated?" *(the scope-discovery seed)*
- **[V, 05-26]** "I shouldn't have had to point out the problem by brute force."
- **[V]** "did you scope it into the workplan?" *(recurring)*
- **[V, 02-19]** "I told you NOT to implement."
- **[V]** "Defer nothing. Deferral is the same as refusal." / "defer NOTHING… your scope obsession is BULLSHIT."

## Fallbacks / "just for now" → bug factories
- **[V, 05-03, 57e0bc83]** "JUST FOR NOW" *(the temporary `window.prompt()` that never got restored — authored agent-discipline.md)*
- **[V, 03-29, 3db928d3]** "'Graceful' failover is misleading and bad." *(→ fail-fast-on-hardware)*

## Delegation
- **[V, 05-11]** "you are the orchestrator, not the implementer."

## Policy → process (the throughline)
- **[P]** "policy embedded in rules is far less effective than policy enforced in process … didn't gain teeth until converted to process."
- **[V (deskwork rules)]** "I'd rather have empty revisions than miss changes."

## Cross-model review → the audit barrage
- **[V, 04-16, bc965958 (MESA II)]** "this is an INFERENCE, not a finding."
- **[V, 05-29]** "we won't be using model apis—we'll be using claude, codex, and gemini clis, since they are usage based, not token based."
- **[V, 06-01]** "when to run the barrage should not be a matter of policy and the agent should have no discretion. It must be mechanized with teeth."
- **[C, 3a370a19]** "Audit findings are failures of the previous implementation that shouldn't be treated like exceptions — they are guardrails to point the implementation team back to the happy path."

## Generalize → dw-lifecycle
- **[P, 04-19, d4df8ec4]** Decision to "extract skills into open-source plugins, codename deskwork."
- **[V, 05-24]** "I want to canonize the scope and duplication discovery tooling that was piloted in the audiocontrol repository into deskwork lifecycle."

## Rebuild → stack-control (Act 3 thesis)
- **[S]** stack-control is the "successor to `dw-lifecycle`, built integration-first against Spec Kit."
- **[S]** "once the front door exists, every later feature is specced and built through it." *(self-hosting)*
- **[S, SC-002 / SC-004]** governance fires cross-model audit-barrage automatically on `after_implement`, with zero branches on provider identity. *(what's kept that the consensus doesn't give)*
