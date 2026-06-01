# Design Discipline

This repo hosts two web properties with documented, load-bearing design discipline. Before any
UI, visual, or design work, follow the protocol — do not drift from settled choices silently.

## Read before UI work

1. **Read the relevant per-site `DESIGN-SYSTEM.md`** before designing or implementing any UI:
   - audiocontrol → `src/sites/audiocontrol/DESIGN-SYSTEM.md`
   - editorialcontrol → `src/sites/editorialcontrol/DESIGN-SYSTEM.md`

   If a design choice is documented there, it is **settled** — don't re-propose it, don't offer it
   as an option in a mockup. To revisit it, update the doc; don't drift.

2. **Read the repo-root [`DESIGN-DECISIONS-PROTOCOL.md`](../../DESIGN-DECISIONS-PROTOCOL.md)** when
   picking or rejecting a direction, or when asking "was this already considered?" It governs the
   per-feature `explorations/{ACCEPTED,REJECTED}/` archive and the `brief.md` contract.

## Update with the work

- When a design decision has **global impact** — changes vocabulary, alters how a class of element
  looks/behaves, applies across multiple pages, or differs between desktop and mobile — update the
  relevant `DESIGN-SYSTEM.md` **in the same commit** as the implementation change. The update is
  part of the work, not a follow-up.
- When unsure whether a change is global: it is. Document it.
- File ACCEPTED / REJECTED archive entries per the protocol for decisions a future session would
  learn from (one direction beat alternatives, or a direction was retired).

## Two-site nuance

A decision usually belongs to exactly one site's `DESIGN-SYSTEM.md`. Cross-site or shared concerns
(anything touching `src/shared` or a token/vocabulary both sites consume) must be called out
explicitly as shared so a reader of either site's doc can find it.
