---
slug: design-system-foundation
phase: 5 — Retro
date: 2026-06-02
---

# Retro — did the design discipline help?

The pilot question: dogfood the design-decision discipline on a real change (the audiocontrol
homepage refresh) before rolling it out to editorialcontrol. Did the protocol help, or just add
friction?

## Verdict: it helped, in three concrete places

**The discovery gate caught a scope change before any code.** The hard Phase-1 gate forced a full
inventory + operator sign-off before artifacts. That review is where the S3000XL card flipped from
the PRD's `launching` state to a real `available` card, where the token-dedupe target was found to
be narrower than assumed (values differ per site; only structural tokens + four utility classes are
shared), and where the screenshot-viability probe established that the live editors only render a
populated UI with hardware. None of that surfaced as a surprise mid-implementation. The gate did its
job.

**The archive gave the relitigation-prone decisions a home.** The `available`-vs-`launching` call is
exactly the kind of choice that gets silently re-proposed three sessions later. It is now one
ACCEPTED + one REJECTED brief. The protocol's "single-pass rejections matter" rule is what made the
dropped `launching` state worth recording rather than forgetting.

**The DESIGN-SYSTEM docs absorbed the drift findings.** Discovery surfaced duplicated tokens, a
missing type scale, and orphaned components. Those landed in the per-site docs as a "known drift"
section instead of scattering into code comments — the exact failure mode (scattered rules) the
2026-04-24 journal entry cited as the reason this feature exists.

## Friction — one real, two minor

**Real: the same-commit-update rule is not self-enforcing.** Phase 3's token refactor changed a
global pattern but did *not* update the DESIGN-SYSTEM docs in the same commit — the docs were
corrected only in the Phase-5 completion pass. The rule is right; nothing reminded the implementer
of it at commit time. **editorialcontrol rollout needs a pre-commit nudge** (a hook or a checklist
gate) that flags "you touched a token/component file but no DESIGN-SYSTEM.md in the same commit."

**Minor: the lightweight choice was correct.** Dropping the monorepo's "when to update which doc"
decision table and the append-only change-log produced no friction — a two-property content site did
not miss them. Don't re-add them for editorialcontrol.

**Minor: the dispatch grammar fit awkwardly.** The Searched/Included/Excluded return grammar is built
for refactor/audit work; for read-only discovery and doc-authoring sub-agents it was a stretch to
phrase. It still forced honest coverage accounting, so it earned its place — but a discovery-shaped
variant would read more naturally.

## What editorialcontrol rollout needs

- The protocol + a per-site `DESIGN-SYSTEM.md` already exist for editorialcontrol, but the discipline
  has **never been exercised there** — zero archive entries. Rollout is a real editorialcontrol UI
  change run under the protocol, not more documentation.
- The **same-commit-update enforcement** above is the one thing to add before trusting the discipline
  to hold without a human remembering it.
- Consider widening the shared token base (`src/shared/design-tokens-base.css`) as editorialcontrol
  grows — the dedupe so far is deliberately minimal (only genuinely-identical tokens).

## Receipts

- Phases 1–5 across ~10 commits on `feature/design-system-foundation`.
- 1 ACCEPTED + 1 REJECTED inaugural archive entry; 1 repo-root protocol; 2 per-site DESIGN-SYSTEM docs.
- 1 pre-existing bug found + fixed during build verification (#132, OG path).
- 2 operator-approved stand-ins tracked as PRE-MERGE MUST-FIX (S3000XL `#` link + stand-in image).
