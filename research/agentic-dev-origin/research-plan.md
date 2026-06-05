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

- [x] **[op→done]** **"2,400 sessions"** — DROPPED (operator doesn't recognize it). Use verified **183 / 2,122**.
- [x] **[op→done]** **Editor lineage** — Akai S3000XL + S5000/S6000 + Roland JV-1080 SysEx (hand-coded); Novation is experimental, not the lead.
- [x] **[op→done]** **Origin texture** — framing accepted: hand-coded DSP era → invented the process by correction; "no-consensus, rolled my own" holds.
- [x] **[me]** **Pre-history check** — is there anything before the 2025-09-01 `audio-tools` import? (separate `audio-tools` repo? earlier editor repos?) Report what exists.
- [x] **[op→done]** **Title** locked: "Coding Agents Are Insane, Hyperintelligent Toddlers". Slug kept (`the-lifecycle-and-why-agents-need-one`).

---

## Phase 2 — Act 1 deep dig: the origin (monorepo, git-only)

Repo: `/Users/orion/work/audiocontrol-work/audiocontrol`. Goal: concrete "before → process" receipts.

- [x] **[me]** **The "before" state** — find 2–4 earliest sessions/commits showing genuinely ad-hoc work (no workplan/journal), to open the story honestly. *(Partial: the correction corpus shows the texture; still want the earliest pre-process sessions.)*
- [x] **[me]** **Disaster → rule moments** — DONE via session summaries: slider-that-didn't-slide (05-14 → test-theater rule), "JUST FOR NOW" prompt-fallback (05-03 → agent-discipline.md), silent failover (03-29 → fail-fast). See `research/receipts-monorepo-sessions.md`.
- [x] **[me]** **CLAUDE.md evolution** — pull 2–3 dated snapshots (line count + structure) showing accretion (~774) → distillation (~198), and what each added. *(receipts-audiocontrol-monorepo-git.md has anchors)*
- [x] **[me]** **Read the lifecycle-naming commit** `3e302fff` (#188, 2026-04-10) — exactly what it introduced (session-start/end, journal template, agent map).
- [x] **[me]** **Editor timeline detail** — for each editor (Novation, D-110, JV-1080, roland-sxx0, Akai s3k): date + one line on what it was / what it taught the process.
- [x] **[P2][me]** **Clone-detection / scope-discovery pilot** — DONE: seed 03-21 [27263c0e], contracts-to-reduce-corrections 04-12 [719e8d42] (55 violations), duplication gate 05-09, meta 05-21. (jscpd `cb78ab0e` 03-18.)
- [x] **[P2][me]** **Cross-model review (audit-barrage) pilot** — DONE: Claude-vs-Codex 04-13 [66875892], MESA II rigor 04-16 [bc965958] ("INFERENCE, not a finding").

---

## Phase 3 — Act 2 deep dig: generalize → dw-lifecycle (deskwork)

Repo: `/Users/orion/work/deskwork`.

- [x] **[me]** **Read the extraction commit** `7311d842` (2026-04-21) full message + `git show --stat` — what was ported out of audiocontrol.
- [x] **[me]** **dw-lifecycle formation** — the spec→skeleton→15-skills→templates arc (`c7931cbf`…), one line each.
- [x] **[me]** **Scope discovery canonization** `9ddcc6d4` (#298, 2026-05-25) — what "canonize the pilot" meant; what every adopter inherits.
- [x] **[me]** **Audit barrage genesis** — the ROADMAP framing `847ea708` ("operator attention = the binding constraint"), the multi-CLI decision (claude/codex/gemini, usage-based), the ship `4ef3c09f`.
- [x] **[me]** **"Mechanized with teeth"** — the `/dwi` end-of-task hook `3a370a19`, the 3 enforcement layers, the dampener + structural-bug **#383** `c9849b61`, the E2BIG/stdin fix `e7f5b4df`.
- [x] **[P2][me]** **Forged by correction** — 3–5 specific AUDIT-#### / operator-directive moments that drove a design change (the "policy → process" lesson).

---

## Phase 4 — Act 3 deep dig: rebuild → stack-control

Branch: `feature/pluggable-lifecycle-providers` (`/Users/orion/work/deskwork-work/pluggable-lifecycle-providers`).

- [x] **[me]** **Read the full spec** `specs/003-stack-control-front-door/{spec,plan,research}.md` + `stack-control-roadmap.md` — confirm/quote: successor to dw-lifecycle, Spec Kit integration-first, what's kept vs out-of-scope, isolation + neutrality invariants.
- [x] **[me]** **"Why now / consensus forming"** — articulate (with receipts) what Spec Kit gives that you had to hand-build, and what stack-control keeps that the consensus doesn't (audit barrage, scope discovery).
- [x] **[me]** **Rebuild commit trail** — tighten the `8226e1e0` → `48295090` → `a5a0e6b8` sequence into a 4–6 line story.

---

## Phase 5 — Transcript / archive infrastructure

- [x] **[op→done]** **age decryption** — documented method `age -d -i ~/.config/age/audiocontrol.key` (key present; `age` installed). Archive in `audiocontrol-monorepo:data/sessions/`: `content/*.jsonl.age` (183 full transcripts, from 2026-02-19) + `analysis/*.json.age` (per-session summaries); clear-text index `sessions.jsonl` + `summary.csv` + `report-all.md` (183 sessions / 2,122 commits).
- [x] **[me]** **Decrypted + mined the 182 analysis summaries** → `research/receipts-monorepo-sessions.md` (225 corrections, PROCESS-dominant taxonomy, disaster→rule moments, scope-discovery + audit-barrage genesis dates, generalize-out 2026-04-19). Bulk corpus in `/tmp` (uncommitted).
- [ ] **[P3][me]** **Full transcripts** — the 183 `content/*.jsonl.age` hold verbatim operator words beyond the summaries; decrypt+mine specific sessions on demand when drafting needs an exact quote.
- [x] **[P2][me]** **Quote-bank** — DONE → `research/quote-bank.md` (~25 quotes by theme, tagged [V]/[C]/[S]/[P]).

---

## Phase 6 — Reuse & housekeeping (research is for many articles)

- [x] **[op→done]** **Research home** — PROMOTED to repo-root `research/agentic-dev-origin/`; linked from the top-level `README.md` and the article `README.md`.
- [x] **[P3][me]** **Source map** — DONE → `research/source-map.md`.

---

## Phase 7 — Synthesis → draft (exit criteria)

- [x] **[me]** Each Act has ≥3 concrete, dated receipts + ≥2 verbatim operator quotes.
- [x] All Phase-1 flags resolved; title locked ("Hand-Coded DSP Code"); slug kept.
- [x] **[me]** Update `index.md` outline to cite specific receipts per beat → then move to Drafting.

---

## Change log
- 2026-06-05 (a) — Plan created. Phase 0 complete; Phases 1–7 open.
- 2026-06-05 (b) — Decrypted + mined the monorepo session archive (Phase 5 unlocked):
  225-correction taxonomy, disaster→rule moments, scope-discovery + audit-barrage genesis
  dates, generalize-out date → `research/receipts-monorepo-sessions.md` + `notes.md` §3.
  Ticked Phase 2 disaster→rule + both pilots; Phase 5 decrypt + mine.
- 2026-06-05 (c) — Closed ALL remaining [me] items via 2 deep agents + synthesis: pre-history (true origin 2024-10-11 audio-tools), CLAUDE.md evolution, #188 read, editor timeline, extraction/dw-lifecycle/audit-barrage/#383, full stack-control spec + why-now, rebuild trail → research/receipts-act1-deep.md + receipts-act2-3-deep.md. Wrote research/quote-bank.md + source-map.md; updated index.md outline with receipts per beat. OPEN: [op] decisions (title, 2,400 vs 183/2,122, Novation, research home) + [P3] full-transcript pulls on demand.
