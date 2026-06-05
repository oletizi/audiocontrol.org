# Research notes — "Rolling My Own: From Web Editors to a Lifecycle Plugin to stack-control"

Working research doc for the article whose draft lives in `./index.md`. Everything
researched for this piece accumulates here (facts, receipts, sources, open
questions, decisions). Not built as a page (the blog collection only globs
`*/index.md`). Append-only-ish; date substantive additions.

- **Entry slug:** `the-lifecycle-and-why-agents-need-one` (may be renamed to match the new title — TBD)
- **Stage:** Outlining (working in chat; deskwork pipeline + studio are paused 2026-06-05)
- **deskwork id:** `c196e248-3076-4e79-b44b-842691354340`

---

## 1. The story (operator's framing — 2026-06-05)

First-person account of how Orion arrived at the discoveries that drove him to build
the lifecycle plugin, and why he's now rebuilding it.

Arc:
1. **Origin.** Building the audiocontrol web editors last year, there wasn't much
   consensus (that he knew of) about how to actually develop software with agentic
   coding — so he developed his own process.
2. **Generalize.** Realized the process needed to apply across multiple projects →
   lifted it out of the audiocontrol repo → created the **dw-lifecycle** plugin, with
   continuous improvement.
3. **Rebuild.** Now rebuilding dw-lifecycle as **stack-control** (branded to this
   site) to take advantage of the new consensus / state-of-the-art spec + execution
   process and tooling (e.g. **Spec Kit**), while keeping the unique parts of
   dw-lifecycle: the **audit barrage** and **scope discovery**.

Device: use **git commit log + Claude Code session transcripts** as the "receipts."

---

## 2. stack-control facts (source of truth)

**Source:** branch `feature/pluggable-lifecycle-providers` in `audiocontrol-org/deskwork`,
checked out at `/Users/orion/work/deskwork-work/pluggable-lifecycle-providers`.
Spec: `specs/003-stack-control-front-door/spec.md` (+ plan.md, research.md, tasks.md,
data-model.md, quickstart.md, contracts/, checklists/). Program roadmap referenced at
`docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/stack-control-roadmap.md`.

Key facts (quote/verify before publishing):
- **stack-control** (CLI `stackctl`) is a **new plugin, the successor to dw-lifecycle**,
  built **integration-first against Spec Kit**.
- **Feature 1 = the self-hosting front door** (spec 003): stand up the plugin (minimal
  scaffolding folded in), **rehome the founding governance extension**, ship a thin
  control plane (`stackctl` CLI + minimal frontend, two touch points) that can curate a
  Spec Kit spec and **execute it via native Spec Kit execution (`/speckit-implement`)**,
  with **governance firing on `after_implement`** (cross-model **audit-barrage**).
- **Self-hosting goal:** once the front door exists, every later feature is specced and
  built *through* it. Success = "we can drive the next feature's build through it."
- **Front-door touch points = in-session Claude Code skills** (native Spec Kit execution
  is agent-invoked, not headlessly script-callable):
  - **`define`** — author a NEW Spec Kit spec for a new feature
  - **`extend`** — refine the EXISTING spec in place
  - **`execute`** — drive native Spec Kit execution (US1 / MVP)
  (Verbs mirror the dw-lifecycle lifecycle vocabulary.)
- **Neutrality invariant** survives the rehome: governance selection logic has **zero
  branches on provider identity**.
- **Isolation invariant:** `dw-lifecycle` keeps working **undisturbed** while
  stack-control stands up beside it; stack-control ships as its own plugin and shares the
  repo's **single lockstep version** (operator decision 2026-06-05).
- **Explicitly OUT OF SCOPE (later features):** the parallel **multi-backend execution
  engine** (Feature 2 — this front door uses ONLY native Spec Kit execution, "the
  single-agent grinder"); the fuller control-plane frontend (spec↔implementation
  negotiation, scope-discovery + audit-barrage surfaces); the **dw-lifecycle migrations**
  of scope-discovery / audit-barrage / session skills.
- Governance currently fires deskwork's audit-barrage, which **today lives in
  dw-lifecycle**; the rehomed extension reaches it cross-plugin until audit-barrage itself
  migrates (a later feature). Missing capability **fails loud**, never silent.
- Spec Kit verbs in use on the branch: `/speckit-plan`, `/speckit-tasks`,
  `/speckit-analyze`, `/speckit-implement`.

Commit trail (rebuild story, newest first — `feature/pluggable-lifecycle-providers`):
- `1de44b18` feat(stack-control): US1 MVP — execute-check + governance rehome + execute skill + seam guard (Feature 1 Phase 3)
- `48295090` feat(stack-control): plugin scaffold + stackctl dispatcher + version verb (Feature 1 Phases 1-2)
- `0bab3159` docs(stack-control): /speckit-tasks Feature 1 — 34 tasks, TDD-first, MVP=US1 (native exec + governance)
- `8a960142` docs(stack-control): branch-local session-start/end skills orient to Spec Kit, not dw-lifecycle
- `a5a0e6b8` docs(stack-control): front-door verbs define/extend/execute; fat plugin, no npm (decisions)
- `51d03ffd` docs(stack-control): /speckit-plan Feature 1 — plan + research + contracts + clarifications

---

## 3. Receipt sources to mine (at draft time)

- **Act I/II (origin + in-repo process):** `audiocontrol.org` repo git log — earliest
  editor commits; first `DEVELOPMENT-NOTES.md` entry; first workplan; early
  scope/review corrections. (This repo IS audiocontrol.org; the editors live under
  `src/sites/audiocontrol` + the Roland editors are proxied — see root CLAUDE.md.)
- **Act II (extraction → dw-lifecycle):** the commit(s) lifting the process out of
  audiocontrol into the plugin; audit-barrage + scope-discovery feature commits +
  `audit-log.md` evidence of findings caught (deskwork repo `/Users/orion/work/deskwork`,
  `docs/1.0/001-IN-PROGRESS/{scope-discovery,...}`).
- **Act III (stack-control):** §2 above.
- **Session transcripts:** archived **encrypted with `age`** at
  `data/sessions/content/*.jsonl.age` (per the editorialcontrol calendar + the
  `extract-session-content` skill). NEED: confirm the decryption flow / age key to pull
  specific moments. → OPEN QUESTION.

---

## 4. Open questions / pending decisions

- [ ] **Title** — working: "Rolling My Own: From Web Editors to a Lifecycle Plugin to
  stack-control". Alternatives floated: "I Had to Invent My Agentic-Dev Process. Now I'm
  Rebuilding It." / "The Process I Invented, and the One I'm Replacing It With".
- [ ] **Slug rename** — current slug no longer matches the framing; rename later?
- [ ] **Session transcripts** — decryption flow / `age` key to cite specific moments.
- [ ] **Other projects** — name any beyond audiocontrol that the generalization covered?
- [ ] A specific origin anecdote / a discovery to feature prominently?

---

## 5. Change log

- 2026-06-05 — Created. Captured operator framing, stack-control facts from spec 003,
  receipt sources, open questions. Index.md re-framed to the 5-beat story
  (commit `1d6565e`).
