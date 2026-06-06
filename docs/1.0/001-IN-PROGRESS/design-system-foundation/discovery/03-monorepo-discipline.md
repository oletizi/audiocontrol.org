# Monorepo Design Discipline — Transferable vs. Editor-Specific

Scope: read-only study of the sibling monorepo at `/Users/orion/work/audiocontrol-work/audiocontrol` to separate transferable design governance from editor-app-specific content. Grounded in the monorepo's own docs (`DESIGN-DECISIONS-PROTOCOL.md`, `DESIGN-SYSTEM.md`, `CAPABILITIES-AS-CONTRACTS.md`, `TESTING-UI.md`) and the on-disk archive at `docs/1.0/003-COMPLETE/s550-support/explorations/`.

---

## Documents located

| Doc | Path (monorepo root) | Size | Read |
|---|---|---|---|
| DESIGN-DECISIONS-PROTOCOL.md | `DESIGN-DECISIONS-PROTOCOL.md` | 6.5 KB | full |
| DESIGN-SYSTEM.md | `DESIGN-SYSTEM.md` | 61 KB | full |
| CAPABILITIES-AS-CONTRACTS.md | `CAPABILITIES-AS-CONTRACTS.md` | 50 KB | conceptual framing (sections 1–4) |
| TESTING-UI.md | `TESTING-UI.md` | 5.6 KB | full |

Glob `*DESIGN*.md` matched ONLY the two design docs above. Other top-level docs exist (`ARCHITECTURE-REVIEW.md`, `AUDITOR-IMPLEMENTER-PROTOCOL.md`, `AGENTS.md`, `PROJECT-MANAGEMENT.md`, the `TESTING-*.md` family) but are not design-discipline docs and are out of scope for this study. No referenced design doc was absent — all four named docs are present.

On-disk archive confirmed: the s550-support feature shipped exactly one ACCEPTED + two REJECTED entries (`connect-vfd-status` accepted; `connect-focus-card`, `connect-signal-flow` rejected), each a `<YYYY-MM-DD>-<slug>/` dir holding `brief.md` + `mockup.html`. This is the protocol working in practice, not just on paper.

---

## 1. TRANSFERABLE GOVERNANCE

The discipline that should port to the two-site `audiocontrol.org` / `editorialcontrol.org` repo. None of this depends on editor apps — it is pure process.

### 1.1 Two complementary docs, neither subsumes the other

The monorepo runs **two** design docs with a strict division of labor (DESIGN-DECISIONS-PROTOCOL.md §"Companion document"):

| Doc | Records | When to read |
|---|---|---|
| **DESIGN-SYSTEM.md** | What is *settled* — tokens, vocabulary, retired patterns, load-bearing contracts | Before any UI design or implementation work |
| **DESIGN-DECISIONS-PROTOCOL.md** | What was *explored* — the archive layout + brief format for ACCEPTED / REJECTED entries | When picking/rejecting a direction; when asking "was this already considered?" |

The framing line to carry over verbatim: *"Mockup briefs cite the standards they comply with (or amend); standards cite the entries that established them."* The two docs reference each other; neither is a superset.

**Why it exists** (the load-bearing rationale, DESIGN-DECISIONS-PROTOCOL.md §intro): *"It exists because design decisions kept being relitigated. If a direction has been ACCEPTED or REJECTED, the record below is the durable evidence. Future sessions read the archive before drafting new mockups so we don't re-propose directions that have already had their fair hearing."* The named failure mode (§"When to file an entry"): *"The 2026-05-09 deskwork sessions repeatedly resurrected retired patterns because nothing was written down; that's the failure mode this archive prevents."* This rationale is content-agnostic and transfers directly.

### 1.2 The ACCEPTED / REJECTED archive layout (per-feature, NOT global)

The archive is **scoped per-feature**, living alongside the feature's `explorations/` directory — not in a central design folder. Verbatim layout from DESIGN-DECISIONS-PROTOCOL.md §"Archive layout":

```
docs/<version>/<status>/<feature-slug>/explorations/
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

Rules that transfer:
- `<YYYY-MM-DD>` is the date of the *decision* (acceptance/rejection), not the filing date.
- `<slug>` is short and describes the *proposal*, not the rationale.
- Single-direction early sketches (no chosen-vs-discarded contrast) stay at the **top** of `explorations/` and get NO archive entry. Archive entries are for **decisions** — moments where one direction beat alternatives or a direction was retired.
- **Single-pass rejections matter**: every mockup variant the operator passed over gets its own REJECTED entry. That is the durable record that stops the next session re-proposing it.

**Path adaptation for the target repo.** The target repo uses the same `docs/<version>/<status>/<slug>/` convention the monorepo uses (confirmed by this feature living at `docs/1.0/001-IN-PROGRESS/design-system-foundation/`), so the `explorations/{ACCEPTED,REJECTED}/` subtree drops in **without path surgery**. The only adaptation is conceptual: the monorepo scopes design decisions to *editor features* (e.g., `s550-support`); the two-site repo will scope them to *site features* (a redesign of a section, a homepage treatment, a card pattern). The protocol's "per-feature, alongside explorations/" rule is the transferable invariant; "feature" just rebinds from editor-feature to site-feature.

### 1.3 The `brief.md` contract

Every brief carries identical frontmatter + four fixed sections. Verbatim template from DESIGN-DECISIONS-PROTOCOL.md §"What goes in brief.md":

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
<link to the motivating feature dir, e.g. `docs/1.0/001-IN-PROGRESS/s550-support/`.>
```

Governing principles (transfer verbatim):
- *"Frontmatter is the searchable index. The body is the explanation."*
- *"Keep briefs short — a brief that runs to multiple pages is doing the standards doc's job by accident."*

Confirmed against the real ACCEPTED brief on disk (`.../ACCEPTED/2026-05-18-connect-vfd-status/brief.md`): frontmatter is exactly `proposal / status / date / feature / visual`; body is exactly What / Why accepted / When (with commit SHA `2a20ecdd`) / Feature reference (relative link `../../../`). The on-disk artifact matches the spec — the contract is real and enforced.

**Visual reference contract** (transfers as-is, DESIGN-DECISIONS-PROTOCOL.md §"Visual reference contract"): each entry MAY carry a visual in one of two shapes — (1) **self-contained** (`mockup.html` inside the entry dir) or (2) **relative reference** (`visual:` frontmatter points at a path elsewhere, used when one visual backs multiple entries). Hard rule: *"Never copy the file into the entry directory AND leave another copy elsewhere. A copy creates two sources of truth that drift."* Non-visual decisions (a removal, a vocabulary choice) use `visual: N/A — non-visual decision` and keep the brief.

### 1.4 "Read/update DESIGN-SYSTEM before UI work" governance rules

From DESIGN-SYSTEM.md §"Process" — the load-bearing governance that transfers:

- **Before any UI design or implementation work: read this document.** (The header restates it: *"If a global design choice is documented here, it is settled. Don't re-propose it. Don't show it as an option in mockups. Update this document if a settled choice is to be revisited; don't drift away from it silently."*)
- **Same-commit update rule:** *"When a design decision has global impact — changes vocabulary, alters how a class of element looks or behaves, applies across multiple pages, or differs between desktop and mobile — update this document in the same commit as the implementation change. The update is part of the work, not a follow-up."*
- **Bias toward documenting:** *"If a design decision feels like it might have global impact and you're unsure: it does. Document it."*
- **CLAUDE.md points here:** *"This is the single source of truth — CLAUDE.md directs agents here."* (Transferable pattern: the target repo's CLAUDE.md should direct agents to its own DESIGN-SYSTEM.md.)

The **"When to update which doc" decision table** (DESIGN-SYSTEM.md §"When to update which doc") is a clean transferable artifact — it tells an agent, per decision type, whether to touch DESIGN-SYSTEM.md, file an archive entry, or both:

| The decision is… | Update DESIGN-SYSTEM.md | File an archive entry |
|---|---|---|
| Settling a token, vocabulary, or component shape (load-bearing) | ✓ in same commit | ✓ ACCEPTED with rationale |
| Picking one mockup direction over alternatives | (only if the pick alters a global pattern) | ✓ one ACCEPTED + one REJECTED per discarded alternative |
| Retiring a previous pattern | ✓ note the retirement + cite the replacement | ✓ REJECTED with retirement rationale |
| Per-page polish without global impact | (no) | (no — keep the iteration in feature commits) |

The deciding heuristic for the right column: *"whether the next session would learn from reading the entry."*

### 1.5 "What this archive is NOT" — scope guards that transfer

DESIGN-DECISIONS-PROTOCOL.md §"What this archive is NOT" gives three negative boundaries worth porting:
- **Not a settled-vocabulary spec** — that is DESIGN-SYSTEM.md's job. Archive = what was *explored*; standards = what is *settled*. Complementary, not duplicates.
- **Not a replacement for feature documentation** — feature dirs are the working context; the archive is the design-decision *checkpoint*. A feature can ship multiple ACCEPTED entries (one per global-impact decision).
- **Not a code-change log** — implementation commits live in git history; the archive records *design* decisions (the why, not the what).

### 1.6 Change-log discipline (transfers)

Both docs carry an append-only **Change log** at the bottom. DESIGN-SYSTEM.md's rule: append a one-line entry whenever the *Process* or settled-vocabulary *surface shape* changes (pattern retired, process changed, load-bearing contract amended); routine token/component additions can be inlined without a log line. DESIGN-DECISIONS-PROTOCOL.md: append a one-line entry on every protocol update. This is a content-agnostic provenance habit.

### 1.7 What "load-bearing" status means (transfers as a doc-status vocabulary)

Both docs are headed `status: load-bearing` / `Status: load-bearing`. That status label is the signal that the doc is settled-truth an agent must obey, not a draft. The target repo can adopt the same status vocabulary for its own design docs.

---

## 2. DO-NOT-TRANSFER (editor-app-specific)

Everything below is specific to the MIDI hardware-editor apps (Roland S-330/S-550, Akai S3000XL, etc.) and the React/Vite monorepo. It must NOT be copied into the two-site Astro repo. The *structure* (a DESIGN-SYSTEM.md with tokens/vocabulary/patterns) transfers; this *content* does not.

### 2.1 CAPABILITIES-AS-CONTRACTS — the whole methodology

`CAPABILITIES-AS-CONTRACTS.md` is a 50 KB essay describing a methodology for **refactoring evolving GUIs without regression**, built on three editor-app artifacts:
- **Capability inventory** — a per-affordance table with stable opaque IDs (`D-CART-01`, `D-XX-02`), source-of-truth file:line, lifecycle status (`implemented`/`partial`/`missing`/`removed`/`planned`), and test citations.
- **Test-name protocol** — every UI test name begins with the capability ID it verifies (`test('D-CART-01: …')`) so coverage is auditable by grep.
- **Atomic-primitive design system** — the swappable-implementation layer.

This targets a long-lived, stateful, multi-page application GUI with a Playwright test corpus. The two-site project is a static Astro content site. The capability-inventory / test-name-protocol machinery does **not** transfer. (The high-level *idea* "separate what from how" is generic, but the operational artifacts are editor-app infrastructure — do not port them.)

### 2.2 The `.ac-*` control primitives and `--ac-*` token vocabulary

DESIGN-SYSTEM.md is dominated by editor-only CSS contracts that must NOT come over:
- **`--ac-*` design tokens** in `editor-core/src/design/tokens.css` (`--ac-color-*`, `--ac-space-*`, `--ac-fp-*` 16-token front-panel chassis vocabulary, `--ac-color-rec` REC-LED red, `--ac-tracking-eyebrow`, etc.).
- **`.ac-*` atomic control primitives**: `.ac-field-label`, `.ac-select`, `.ac-checkbox`, `.ac-slider` / `.ac-range-bar`, `.ac-number-input`, `.ac-envelope` (8-segment VFD-glow), `.ac-list-*` family, `.ac-page-shell` / `.ac-page-shell--fixed-viewport`, `.ac-page-title-*`, `.ac-detail-live-*`.
- Their **mockup citations** pointing into `01-design-language.html` / `04-tones.html` line ranges.

These encode the Roland-hardware instrument-face aesthetic (Departure Mono, VFD phosphor glow, REC-LED homage to the S-550 front panel) and the editor-core React component library. The site repo will have its own token/primitive vocabulary; do not import this one.

### 2.3 Dialogs, optimistic updates, CRUD, connection UI

All editor-app interaction patterns — do not transfer:
- **Dialog components** (`ConfirmDialog`, `SlideDrawer`, `SteppedProgressDrawer`, `SaveDialog`, `MoveDialog`) and their behavior contracts.
- **Optimistic updates** for device CRUD (update local → send to device → invalidate-on-success → revert-on-failure).
- **CRUD affordances on list items**, hover actions, inline rename gestures.
- **Connection UI** — the MIDI connection `SlideDrawer`, not-connected states, transport selection.
- **Live-Status Footer** / live-edit-no-save pattern, **Tabbed Detail Pane**, **Virtual Front Panel under the CRT**, **Envelope Visualizations**, **Typed Capability Contracts** (`ErrorReporter` / `RefreshNotifier` / `ProgressReporter` / `StrategyResult`), `OperationProgress`, `useNotifications`. All bound to device hardware and the editor-core hook library.

### 2.4 TESTING-UI specifics

`TESTING-UI.md` is entirely editor-app-specific: test harness pages (`src/pages/Test<Feature>Page.tsx`) that render React components with hardcoded factory data because *"editors in this monorepo require MIDI hardware to show real data"*; per-editor Vite dev-server ports; Playwright CLI screenshots against `https://localhost:<port>` with mkcert self-signed certs; `make test-ui-<editor>` targets; keygroup/zone/velocity harness examples. None of this transfers — the site repo already has its own Vitest/Playwright testing rules (`.claude/rules/testing.md`).

### 2.5 Contract Enforcement Rules

DESIGN-SYSTEM.md §"Contract Enforcement Rules" (every shared interface change must break consumers at compile time; no optional callback bags; `make` builds all editors before commit) are TypeScript-monorepo / shared-package rules for the editor-core library. They do not apply to a content site. (The general TypeScript-architecture principles the target repo cares about already live in its own CLAUDE.md / TYPESCRIPT-ARCHITECTURE.md.)

---

## Synthesis takeaway

Port the **skeleton**, leave the **organs**. Transfer: the two-doc split (settled vs. explored), the per-feature `explorations/{ACCEPTED,REJECTED}/<YYYY-MM-DD>-<slug>/brief.md` archive (the target repo's `docs/<version>/<status>/<slug>/` tree accepts it unchanged), the `brief.md` frontmatter+four-section contract, the visual-reference single-source-of-truth rule, the "read before UI work / update in same commit / when-unsure-document" governance, the "when to update which doc" decision table, the "what this archive is NOT" guards, the load-bearing status label, and the append-only change log. Leave behind: every `.ac-*`/`--ac-*` primitive, the CAPABILITIES-AS-CONTRACTS methodology, all dialog/optimistic/CRUD/MIDI patterns, and the hardware-harness TESTING-UI workflow.
