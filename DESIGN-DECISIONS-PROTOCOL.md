# Design Decisions Protocol

Status: load-bearing

This repo hosts **three web properties** — `audiocontrol.org`, `editorialcontrol.org`, and
`stackcontrol.org`. This document governs how design directions are explored, decided, and recorded
across all of them. It is the durable record of what was *explored* — the ACCEPTED / REJECTED
decision archive — so directions that have had their fair hearing are not silently re-proposed.

## Why this exists

Design decisions kept being relitigated. When a direction has been ACCEPTED or REJECTED, the
archive is the durable evidence; future sessions read it before drafting new mockups so we don't
re-propose directions that already had their hearing. This repo has the failure mode on record:
design-system rules were living scattered (a no-modal rule buried in a single client-side code
comment, vocabulary in a voice skill, typographic conventions in `design-tokens.css`), and a
homepage design-language review would have been faster with a central index. This protocol, paired
with the per-site DESIGN-SYSTEM docs, is the index that absence cost us.

This is a **lightweight adaptation** of the discipline used by the sibling editor monorepo, scaled
to a multi-property content site. It carries the load-bearing parts — the archive, the brief
contract, the read/update governance — and leaves the editor-app ceremony behind.

## The two-doc model

Design discipline runs as two complementary documents. Neither subsumes the other.

| Doc | Records | When to read |
|---|---|---|
| **`src/sites/<site>/DESIGN-SYSTEM.md`** | What is *settled* — that site's tokens, typography, vocabulary, retired patterns, load-bearing contracts | Before any UI design or implementation work on that site |
| **This `DESIGN-DECISIONS-PROTOCOL.md`** (repo root) | What was *explored* — the archive layout + brief format for ACCEPTED / REJECTED entries, governing all sites | When picking or rejecting a direction; when asking "was this already considered?" |

There are **three** per-site DESIGN-SYSTEM docs — one for `audiocontrol`
(`src/sites/audiocontrol/DESIGN-SYSTEM.md`), one for `editorialcontrol`
(`src/sites/editorialcontrol/DESIGN-SYSTEM.md`), and one for `stackcontrol`
(`src/sites/stackcontrol/DESIGN-SYSTEM.md`). Each describes the tokens, typography, and vocabulary
that already exist in that site's `brand.ts` + `design-tokens.css`. The sites share layout bones but
diverge by accent palette and display face (audiocontrol amber, editorialcontrol chartreuse,
stackcontrol cyan), so a settled decision usually belongs to exactly one site's DESIGN-SYSTEM.

Briefs cite the standards they comply with (or amend); standards cite the entries that established
them. The two docs reference each other; neither is a superset.

## Archive layout

The archive is **scoped per-feature**, living alongside the feature's `explorations/` directory —
not in a central design folder. "Feature" here means a **site feature**: a section redesign, a
homepage treatment, a card pattern — not an editor feature. This repo already uses the
`docs/<version>/<status>/<slug>/` convention, so the subtree drops in unchanged:

```
docs/<version>/<status>/<slug>/explorations/
├── <misc explorations, single-direction sketches, screenshots>…
├── ACCEPTED/
│   └── <YYYY-MM-DD>-<slug>/
│       ├── brief.md                          # required
│       ├── mockup.html                       # canonical visual (or relative reference)
│       └── …                                 # any supporting assets
└── REJECTED/
    └── <YYYY-MM-DD>-<slug>/
        ├── brief.md                          # required
        ├── mockup.html
        └── …
```

Rules:

- `<YYYY-MM-DD>` is the date of the *decision* (acceptance / rejection), not the filing date.
- `<slug>` is short and describes the *proposal*, not the rationale.
- Single-direction early sketches (no chosen-vs-discarded contrast) stay at the **top** of
  `explorations/` and get NO archive entry. Archive entries are for **decisions** — moments where
  one direction beat alternatives or a direction was retired.
- **Single-pass rejections matter.** Every mockup variant the operator passed over gets its own
  REJECTED entry. That is the durable record that stops the next session re-proposing it.

## The `brief.md` contract

Every brief carries identical frontmatter + four fixed sections:

```markdown
---
proposal: <short description>
status: ACCEPTED | REJECTED
date: YYYY-MM-DD
feature: <relative path to motivating feature dir, or N/A>
visual: <"self-contained: ./mockup.html", OR relative path to mockup elsewhere, OR "N/A — non-visual decision">
---

# <proposal>

## What
<one paragraph — what the proposal is. What pattern, what shape, what affordance.>

## Why <accepted | rejected>
<one to three paragraphs — the rationale. For ACCEPTED, what made this the right pick.
 For REJECTED, what made this the wrong direction or what made another direction better.
 Cite the operator's framing when it shaped the decision.>

## When
<commit SHA + date if known. Implementation commit for ACCEPTED; decision-to-retire commit for REJECTED.>

## Feature reference
<link to the motivating feature dir, e.g. `docs/1.0/001-IN-PROGRESS/<slug>/`.>
```

Governing principles:

- Frontmatter is the searchable index. The body is the explanation.
- Keep briefs short — a brief that runs to multiple pages is doing the DESIGN-SYSTEM doc's job by
  accident.

## Visual reference — single source of truth

Each entry MAY carry a visual in one of two shapes:

1. **Self-contained** — a `mockup.html` inside the entry directory (`visual: self-contained:
   ./mockup.html`).
2. **Relative reference** — `visual:` frontmatter points at a path elsewhere, used when one visual
   backs multiple entries.

Hard rule: **never copy the file into the entry directory AND leave another copy elsewhere.** A
copy creates two sources of truth that drift. Non-visual decisions (a removal, a vocabulary choice)
use `visual: N/A — non-visual decision` and keep the brief.

## Governance — read before, update with

- **Before any UI design or implementation work, read the relevant per-site DESIGN-SYSTEM.md.** If
  a global design choice is documented there, it is settled. Don't re-propose it. Don't show it as
  an option in mockups. Update the doc if a settled choice is to be revisited; don't drift away
  from it silently.
- **Update in the same commit.** When a design decision has global impact — changes vocabulary,
  alters how a class of element looks or behaves, applies across multiple pages, or differs between
  desktop and mobile — update the relevant DESIGN-SYSTEM.md in the same commit as the
  implementation change. The update is part of the work, not a follow-up.
- **When unsure whether a change is global, it is — document it.**

**Multi-site nuance.** A decision usually belongs to exactly ONE site's DESIGN-SYSTEM
(`audiocontrol`, `editorialcontrol`, or `stackcontrol`). Update that site's doc. Cross-site or
shared concerns — anything that touches `src/shared` or a token/vocabulary more than one site
consumes — must be called out explicitly as shared, and recorded so a reader of any site's
DESIGN-SYSTEM can find it.

## What this archive is NOT

- **Not a settled-vocabulary spec.** That is the per-site DESIGN-SYSTEM.md's job. The archive is
  what was *explored*; the DESIGN-SYSTEM is what is *settled*. Complementary, not duplicates.
- **Not a replacement for feature documentation.** Feature dirs are the working context; the
  archive is the design-decision *checkpoint*. A feature can ship multiple ACCEPTED entries — one
  per global-impact decision.
- **Not a code-change log.** Implementation commits live in git history; the archive records
  *design* decisions — the why, not the what.
