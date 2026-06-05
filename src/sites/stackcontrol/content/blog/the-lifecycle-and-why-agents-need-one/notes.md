# Research notes — "Rolling My Own: From Web Editors to a Lifecycle Plugin to stack-control"

Working research doc for the article whose draft lives in `./index.md`. Everything
researched for this piece (and reusable for future ones) accumulates here. Not built
as a page (the blog collection only globs `*/index.md`).

- **Entry slug:** `the-lifecycle-and-why-agents-need-one` (may be renamed to match the new title — TBD)
- **Stage:** Outlining (working in chat; deskwork pipeline + studio paused 2026-06-05)
- **deskwork id:** `c196e248-3076-4e79-b44b-842691354340`
- **Detailed receipts:** `./research/receipts-{audiocontrol-monorepo-git, audiocontrol-git, deskwork-git, transcripts}.md`

---

## 1. The story (operator's framing — 2026-06-05)

First-person account of how Orion arrived at the discoveries that drove him to build
the lifecycle plugin, and why he's now rebuilding it.

1. **Origin.** Building the audiocontrol web editors last year, there wasn't much
   consensus (that he knew of) about how to develop software with agentic coding — so
   he developed his own process.
2. **Generalize.** Realized the process needed to apply across multiple projects →
   lifted it out of the audiocontrol repo → created the **dw-lifecycle** plugin, with
   continuous improvement.
3. **Rebuild.** Now rebuilding dw-lifecycle as **stack-control** (branded to this site)
   to adopt the new state-of-the-art spec+execution tooling (e.g. **Spec Kit**), while
   keeping dw-lifecycle's unique parts: the **audit barrage** and **scope discovery**.

Device: **git commit log + Claude Code session transcripts** as the "receipts."

---

## 2. stack-control facts (source: branch `feature/pluggable-lifecycle-providers`, `specs/003-stack-control-front-door`)

- **stack-control** (CLI `stackctl`) — new plugin, **successor to dw-lifecycle**, built
  **integration-first against Spec Kit**.
- **Feature 1 = self-hosting front door:** curate a Spec Kit spec + run it via *native*
  Spec Kit execution (`/speckit-implement`), with **governance (cross-model audit-barrage)
  firing automatically on `after_implement`**. Once it exists, every later feature is
  built *through* it.
- **Front-door touch points = in-session Claude skills `define` / `extend` / `execute`**
  (mirroring the dw-lifecycle vocabulary).
- **Kept:** audit barrage + scope discovery. **Neutrality invariant** (zero branches on
  provider identity) survives the governance rehome. **Isolation invariant:** dw-lifecycle
  keeps working untouched; stack-control ships as its own plugin on the repo's single
  lockstep version.
- **OUT OF SCOPE (later features):** the parallel multi-backend execution engine
  (Feature 2 — front door uses only native Spec Kit, "the single-agent grinder"); the
  fuller frontend; the dw-lifecycle **migrations** of scope-discovery / audit-barrage /
  session skills (so for now governance reaches audit-barrage cross-plugin into
  dw-lifecycle).
- Spec Kit verbs in use: `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`.

---

## 3. Receipts — GATHERED 2026-06-05 (master timeline)

Four repos mined (read-only). Detailed per-source receipts in `./research/`. Real start
of the whole story: **2025-09-01** (the monorepo). Local transcripts only survive from
**~2026-04-27** onward, so Act-1 origin is **git-only**.

| Date | Repo | SHA | Milestone | Act |
|---|---|---|---|---|
| 2025-09-01 | monorepo | `465300b5` | "moving audio-tools to this repo" — IMPORT of a pre-existing audio-tools project (not greenfield) | 1 (true start) |
| 2025-09-24 | monorepo | `940b522d` | first `.claude/CLAUDE.md` — **already structured** (9-agent roster + workflow YAMLs) | 1 |
| 2025-09-25 | monorepo | `62947ead` | **first web editor = Novation Launch Control XL 3** (workplan) — *not* a Roland | 1 |
| 2026-02-04 | monorepo | `0c96d759` | "no fallbacks / **mock data are bug factories**" rule + PROJECT-MANAGEMENT.md | 1 |
| 2026-02-05 | monorepo | `a59d1601` | `docs/1.0/<status>/<slug>/` PRD convention | 1 |
| 2026-02-10 → 03-30 | monorepo | — | Roland D-110 (02-10), JV-1080 (02-15), unified roland-sxx0 (03-28), Akai s3k (03-30) | 1 |
| 2026-03-18 | monorepo | `cb78ab0e` | **clone/duplication detection pilot** (jscpd, PR #59) — scope-discovery precursor | 1 |
| 2026-04-10 | monorepo | `3e302fff` | the **lifecycle named**: session-start/end, playbooks, journal template, agent mapping (#188) | 1 |
| 2026-04-13 | monorepo | `9795f927` | **cross-model / Codex review pilot** (exercised in MESA II) — audit-barrage precursor | 1 |
| 2026-04-14 | monorepo | `31319e1c` | CLAUDE.md **distilled** (~774 → ~198 path-scoped lines) | 1 |
| **2026-04-21** | **deskwork** | `4108e5ff` / `7311d842` | **THE EXTRACTION** — deskwork repo genesis; body: *"Ported from audiocontrol.org's .claude tooling"* | 1→2 |
| 2026-04-29 | deskwork | `c7931cbf`… | **dw-lifecycle plugin forms** (design spec → skeleton → 15 skills → ported templates) | 2 |
| 2026-05-05 | monorepo | `432b9b8b` | deskwork **adopted back** into audiocontrol (rules ported both ways) | 2 |
| 2026-05-21 | monorepo | `c834e44b` / `295cea80` | scope-discovery-protocol canonized in monorepo (`clones.yaml`, `paper-test-s550.md`) | 2 |
| 2026-05-25 | deskwork | `9ddcc6d4` | **scope discovery** canonized into the dw-lifecycle plugin (#298) | 2 |
| 2026-05-28 | deskwork | `847ea708` | **audit barrage** framed in ROADMAP (operator attention = "the binding constraint") | 2 |
| 2026-05-29 | deskwork | `4ef3c09f` | **audit barrage ships** (claude/codex/gemini CLI verb; Phases 12-14) | 2 |
| 2026-05-29 | hub | `0a465cd` | in-house editorial pipeline mothballed (deskwork-replaced) | 2 |
| 2026-05-30 | hub | `c9d56b8` | lifecycle re-enters the hub site as the **dw-lifecycle** plugin | 2 |
| 2026-06-04 | deskwork (branch) | `8226e1e0` | **stack-control rebuild begins** (`feature/pluggable-lifecycle-providers`) | 3 |
| 2026-06-05 | deskwork (branch) | `48295090` | stack-control **plugin scaffold + `stackctl` dispatcher**; front-door verbs `a5a0e6b8` | 3 |

### Strongest operator pull-quotes (verbatim, from transcripts ≥ 2026-04-27)
- On test theater: *"you burned days building a UI test suite that tests nothing… How would you write a test harness that PROVES the value slider works?"*
- The extraction, said plainly: *"I want to canonize the scope and duplication discovery tooling that was piloted in the audiocontrol repository into deskwork lifecycle."*
- Audit-barrage tooling choice: *"we won't be using model apis—we'll be using claude, codex, and gemini clis, since they are usage based, not token based."*
- Audit-barrage as mechanism: *"when to run the barrage should not be a matter of policy and the agent should have no discretion. It must be mechanized with teeth."*
- Scope-discovery birth: *"I shouldn't have had to point out the problem by brute force."*
- The throughline rule: *"policy embedded in rules is far less effective than policy enforced in process … didn't gain teeth until converted to process."*
- The anti-deferral spine: *"Defer nothing. Deferral is the same as refusal."* / *"did you scope it into the workplan?"*
- On plausible advice (the "no consensus" tell): *"all of your advice has been wrong… I don't want guesses based on what 'seems plausible'."*

---

## 4. Receipts vs. framing — flags for the operator (honesty checks before drafting)

1. **First editor was the Novation Launch Control XL 3 (Sept 2025), not a Roland.** The
   Roland S-330/S-550/JV-1080/D-110 + Akai editors came Feb–Mar 2026. "Building the
   audiocontrol web editors" is true; just decide whether to name Novation as the first.
2. **The process was structured early and *evolved* (~6.5 months), not invented ad hoc
   each time.** The Sept-2025 CLAUDE.md already had a 9-agent roster; the arc is
   accretion (~774 lines) → distillation (~198), with the lifecycle explicitly *named*
   only 2026-04-10. The "no consensus, rolled my own" framing holds at the macro level —
   but the honest texture is "kept formalizing it until it became a lifecycle," not "no
   process → finished process."
3. **"2,400 sessions" is NOT a verified local count.** The committed report
   (`data/sessions/report-all.md`) says **183 sessions / 2,122 commits** (2026-02-19 →
   05-21); `sessions.jsonl` = 183 lines. The "2,400" title was an unverified/aggregate
   figure. → Use 183/2,122, or confirm where 2,400 comes from, before quoting.
4. **The monorepo (2025-09-01) is itself an import** of a pre-existing audio-tools
   project — conventions may predate even it.

---

## 5. Open questions / pending decisions

- [ ] **Title** — working: "Rolling My Own: From Web Editors to a Lifecycle Plugin to
  stack-control". Alts: "I Had to Invent My Agentic-Dev Process. Now I'm Rebuilding It." /
  "The Process I Invented, and the One I'm Replacing It With".
- [ ] **Slug rename** to match the new framing?
- [ ] **"2,400 sessions"** — confirm vs the committed 183 / 2,122 (see §4.3).
- [ ] **Name the Novation first editor**, or keep "the editors" generic? (§4.1)
- [ ] **Older history** — is there anything before the 2025-09-01 audio-tools import?
- [ ] **Session transcripts** older than ~2026-04-27 are not local; the `age`-encrypted
  archive is at `data/sessions/content/*.jsonl.age` — need the decryption flow/key if we
  want older human-voice receipts.

---

## 6. Change log

- 2026-06-05 (a) — Created. Operator framing + stack-control facts (spec 003). Index.md
  re-framed to the 5-beat story (`1d6565e`).
- 2026-06-05 (b) — **Receipts gathered** from 4 repos via parallel agents → `./research/`
  (audiocontrol monorepo, audiocontrol hub, deskwork, transcripts). Built master timeline
  (§3), strongest pull-quotes, and receipts-vs-framing flags (§4). Human-message corpus
  extracted to `/tmp/receipts/{audiocontrol,deskwork}-human.tsv` (transient).
