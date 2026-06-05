# Act 3 — working outline (iterate here)

Working outline for **Act 3** of "Coding Agents Are Insane, Hyperintelligent Toddlers". Not
built as a page. Sources: `research/agentic-dev-origin/notes.md` §2, `research/receipts-act2-3-deep.md`,
the stack-control spec (`specs/003-stack-control-front-door`). PROVISIONAL.

**Act 3 = the rebuild: stack-control.** Picks up at Act 2 §2.7 (I keep the crown jewels);
ends by paying off the babysitter hook. `[V]` verbatim · `[S]` from the spec.

---

## §3.1 — Why rebuild now: the consensus finally arrived
- The thing I had to invent — the **define → plan → tasks** spine — now has a community
  answer: **Spec Kit**. The hardest, most generic part of my hand-built process is now
  consensus state-of-the-art.
- The move isn't "throw it away"; it's "stop hand-maintaining the parts everyone now shares,
  and keep the parts that are mine."

## §3.2 — stack-control: integration-first against Spec Kit
- A new plugin (`stackctl`), the **successor to dw-lifecycle**, **built integration-first
  against Spec Kit**: curate a spec, run it via *native* Spec Kit execution (`/speckit-implement`).
- Front door = in-session skills **`define` / `extend` / `execute`** (the lifecycle vocabulary,
  rehomed). Branded to this site (stackcontrol.org).
- [S] *"successor to dw-lifecycle, built integration-first against Spec Kit."*

## §3.3 — What I keep (the crown jewels the consensus doesn't give)
- **The audit barrage** — "stochastic correctness" — firing **automatically** on
  `after_implement` (SC-002: zero manual invocations), **provider-neutral** (SC-004: branch on
  *capability*, never identity — so it survives a vendor sunsetting headless-CLI mode).
- **Scope discovery** — still the answer to incomplete-change-discovery + duplication.
- The frame: Spec Kit is the crib; the **babysitter's actual teeth** (catching the lying and
  the boredom) are still mine.

## §3.4 — Self-hosting + isolation
- **Self-hosting:** once the front door exists, every later feature is specced and built
  *through* it — [S] *"every later feature is specced and built through it."*
- **Isolation:** dw-lifecycle keeps doing real work, untouched, while stack-control stands up
  beside it (single lockstep version).
- Receipts: rebuild trail `8226e1e0` (06-04) → `a5a0e6b8` (front-door verbs) → `48295090`
  (scaffold + `stackctl`) → `1de44b18` (US1 MVP: native exec + governance).

## §3.5 — Close: the babysitter, paid off
- Pay off the hook: the agents are *still* insane, hyperintelligent toddlers that lie and get
  bored. What changed is that I now have a real **babysitter** — and I'm rebuilding it on the
  shared crib (Spec Kit) while keeping the parts that actually catch the lying (audit barrage)
  and the boredom (scope discovery).
- Forward pointer: the rest of the "Building deskwork" series drills into each kept part.

---

## Open structural calls
1. **Tone of the close** — land on the babysitter payoff (warm/wry), or on the durability
   thesis (branch-on-capability outlives any one model)?
2. **How much stack-control detail** — this is a *current/unfinished* rebuild; how much to
   commit to in print vs. "here's the bet I'm making"?
3. **Spec Kit framing** — credit the consensus generously (good-faith, "adopt what's better"),
   or foreground what it *doesn't* solve (the crown jewels)?

## Iteration log
- v1 (2026-06-05) — built from stack-control spec + receipts; pays off the babysitter hook.
