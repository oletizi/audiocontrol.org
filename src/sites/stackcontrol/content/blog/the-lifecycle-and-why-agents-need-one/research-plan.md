# Research plan — origin-story article (and reusable corpus)

A followable checklist. Tick boxes as we go. Findings land in `./notes.md` (curated
spine + timeline + flags) and `./research/*.md` (detailed receipts). Tags: **[me]** =
I execute; **[op]** = needs your decision/input. Priority: **P1** = needed to draft;
**P2** = enriches; **P3** = nice-to-have / future articles.

How to use: we work top-to-bottom within a phase; when an item closes I check it and
note where the finding lives. Phase 0 is already done.

---

## Phase 0 — Foundation (DONE 2026-06-05)

- [x] **[me]** Inventory sources (git repos + transcript corpus); build human-message corpus → `/tmp/receipts/*.tsv`
- [x] **[me]** Mine 4 repos (monorepo, hub, deskwork, transcripts) → `./research/receipts-*.md`
- [x] **[me]** Build master timeline + pull-quotes + framing flags → `notes.md` §3–§4

---

## Phase 1 — Resolve the framing flags (gating; do before drafting)

- [ ] **[op]** **"2,400 sessions"** — confirm the number. Committed report says **183 sessions / 2,122 commits**. Is 2,400 a cross-repo/cross-machine aggregate, a later count, or wrong? Decide what the article quotes. *(notes.md §4.3)*
- [ ] **[op]** **First editor naming** — name the **Novation Launch Control XL 3** as the first editor, or keep "the editors" generic? *(§4.1)*
- [ ] **[op]** **Origin texture** — agree the honest framing: "kept formalizing a process until it became a lifecycle" (evolution), vs "invented from zero." Macro "no-consensus, rolled my own" still holds. *(§4.2)*
- [ ] **[me]** **Pre-history check** — is there anything before the 2025-09-01 `audio-tools` import? (separate `audio-tools` repo? earlier editor repos?) Report what exists.
- [ ] **[op]** **Title + slug** — lock the title; decide whether to rename the slug. *(§5)*

---

## Phase 2 — Act 1 deep dig: the origin (monorepo, git-only)

Repo: `/Users/orion/work/audiocontrol-work/audiocontrol`. Goal: concrete "before → process" receipts.

- [ ] **[me]** **The "before" state** — find 2–4 earliest sessions/commits showing genuinely ad-hoc work (no workplan/journal), to open the story honestly.
- [ ] **[me]** **Disaster → rule moments** — pin specific failures that produced a written rule, with commit/date + the resulting rule. Known candidates: the "UI test suite that tests nothing" / value-slider test-harness episode; the "bug factories" (no-fallbacks) rule's trigger. Get 3–5.
- [ ] **[me]** **CLAUDE.md evolution** — pull 2–3 dated snapshots (line count + structure) showing accretion (~774) → distillation (~198), and what each added. *(receipts-audiocontrol-monorepo-git.md has anchors)*
- [ ] **[me]** **Read the lifecycle-naming commit** `3e302fff` (#188, 2026-04-10) — exactly what it introduced (session-start/end, journal template, agent map).
- [ ] **[me]** **Editor timeline detail** — for each editor (Novation, D-110, JV-1080, roland-sxx0, Akai s3k): date + one line on what it was / what it taught the process.
- [ ] **[P2][me]** **Clone-detection pilot** `cb78ab0e` (2026-03-18) + `paper-test-s550.md` — what duplication it caught; the genesis of scope discovery in-repo.
- [ ] **[P2][me]** **Cross-model review pilot** `9795f927` (2026-04-13) + the MESA II reverse-engineering work — the genesis of the audit barrage in-repo.

---

## Phase 3 — Act 2 deep dig: generalize → dw-lifecycle (deskwork)

Repo: `/Users/orion/work/deskwork`.

- [ ] **[me]** **Read the extraction commit** `7311d842` (2026-04-21) full message + `git show --stat` — what was ported out of audiocontrol.
- [ ] **[me]** **dw-lifecycle formation** — the spec→skeleton→15-skills→templates arc (`c7931cbf`…), one line each.
- [ ] **[me]** **Scope discovery canonization** `9ddcc6d4` (#298, 2026-05-25) — what "canonize the pilot" meant; what every adopter inherits.
- [ ] **[me]** **Audit barrage genesis** — the ROADMAP framing `847ea708` ("operator attention = the binding constraint"), the multi-CLI decision (claude/codex/gemini, usage-based), the ship `4ef3c09f`.
- [ ] **[me]** **"Mechanized with teeth"** — the `/dwi` end-of-task hook `3a370a19`, the 3 enforcement layers, the dampener + structural-bug **#383** `c9849b61`, the E2BIG/stdin fix `e7f5b4df`.
- [ ] **[P2][me]** **Forged by correction** — 3–5 specific AUDIT-#### / operator-directive moments that drove a design change (the "policy → process" lesson).

---

## Phase 4 — Act 3 deep dig: rebuild → stack-control

Branch: `feature/pluggable-lifecycle-providers` (`/Users/orion/work/deskwork-work/pluggable-lifecycle-providers`).

- [ ] **[me]** **Read the full spec** `specs/003-stack-control-front-door/{spec,plan,research}.md` + `stack-control-roadmap.md` — confirm/quote: successor to dw-lifecycle, Spec Kit integration-first, what's kept vs out-of-scope, isolation + neutrality invariants.
- [ ] **[me]** **"Why now / consensus forming"** — articulate (with receipts) what Spec Kit gives that you had to hand-build, and what stack-control keeps that the consensus doesn't (audit barrage, scope discovery).
- [ ] **[me]** **Rebuild commit trail** — tighten the `8226e1e0` → `48295090` → `a5a0e6b8` sequence into a 4–6 line story.

---

## Phase 5 — Transcript / archive infrastructure

- [ ] **[op]** **age decryption** — provide the key/flow for `data/sessions/content/*.jsonl.age` (or confirm we skip pre-April human-voice). Origin-era (Sept 2025–Apr 2026) operator quotes live only there.
- [ ] **[me]** **If decrypted:** extend the human-corpus extraction over the archive; mine origin-era voice for Act 1.
- [ ] **[P2][me]** **Quote-bank** — distill the strongest ~25 verbatim quotes into a reusable `research/quote-bank.md` (tagged by theme), usable across future articles.

---

## Phase 6 — Reuse & housekeeping (research is for many articles)

- [ ] **[op]** **Research home** — keep the corpus under this article's `research/`, or promote to a shared location (e.g. a repo-level `research/` or a dedicated devlog research entry) so future articles reuse it? *(operator said this research seeds many pieces)*
- [ ] **[P3][me]** **Source map** — a short index of the canonical repos/paths (monorepo, hub, deskwork, branch, transcripts, age archive) so any future article starts from a known map.

---

## Phase 7 — Synthesis → draft (exit criteria)

- [ ] **[me]** Each Act has ≥3 concrete, dated receipts + ≥2 verbatim operator quotes.
- [ ] All Phase-1 flags resolved; title + slug locked.
- [ ] **[me]** Update `index.md` outline to cite specific receipts per beat → then move to Drafting.

---

## Change log
- 2026-06-05 — Plan created. Phase 0 complete; Phases 1–7 open.
