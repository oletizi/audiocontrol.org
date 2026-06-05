# Act 3 — working outline (iterate here)

Working outline for **Act 3** of "Coding Agents Are Insane, Hyperintelligent Toddlers". Not
built as a page. Sources: `research/agentic-dev-origin/notes.md` §2, `research/receipts-act2-3-deep.md`,
the stack-control spec (`specs/003-stack-control-front-door`). PROVISIONAL.

**Act 3 = the rebuild: stack-control.** Picks up at Act 2 §2.7 (I keep the crown jewels);
ends by paying off the babysitter hook. `[V]` verbatim · `[S]` from the spec.

---

## §3.1 — Why rebuild now: the consensus caught up (as I always assumed it would)
- I felt the bespoke **PRD/workplan was probably naive**, and that **the state of the art had
  progressed** in the months since — *and I was right; there are now much more sophisticated
  options.*
- **The governing philosophy:** I've **always assumed the state of the art would outpace my
  solo development**, and that I'd **continuously shed bespoke pieces of my agent workflow in
  favor of the state of the art as it matures.** Humility-as-design — the opposite of NIH.
- The thing I had to invent — the **define → plan → tasks** spine — now has a community answer:
  **Spec Kit.** So the move is: stop hand-maintaining the parts everyone now shares; keep the
  parts that are still mine.
- **Arc closure (call it out):** the **PRD/workplan I invented in Act 1 §1.3** (the very first
  fix, to survive the memory wipe) is **the first thing I now shed** — it graduated into a
  consensus tool.

## §3.2 — A fresh start: new spine, new name, fresh assumptions
- Since the PRD/workplan **is the spine** of dw-lifecycle, replacing it is replacing the spine
  — so it was cleaner to start fresh than to retrofit. (Also: **"dw-lifecycle has always been a
  dumb name."**) New spine (Spec Kit), new name (**stack-control**, branded to this site),
  **fresh assumptions** from the state of the art — *while pulling the unique parts along.*
- **The product thesis (state it plainly):** dw-lifecycle — and now stack-control — are
  **opinionated but lightweight shells that use the state-of-the-art tooling underneath.** The
  spec's own word for it: a **"thin control plane."**
- A new plugin (`stackctl`), **successor to dw-lifecycle**, **integration-first against Spec
  Kit**: curate a spec, run it via *native* Spec Kit execution (`/speckit-implement`). Front
  door = in-session skills **`define` / `extend` / `execute`**.
- [S] *"successor to dw-lifecycle, built integration-first against Spec Kit."*

## §3.3 — What I keep (the crown jewels the consensus doesn't give)
- **The audit barrage** — "stochastic correctness" — firing **automatically** on
  `after_implement` (SC-002: zero manual invocations), **provider-neutral** (SC-004: branch on
  *capability*, never identity — so it survives a vendor sunsetting headless-CLI mode).
- **Scope discovery** — still the answer to incomplete-change-discovery + duplication.
- The frame: Spec Kit is the crib; the **babysitter's actual teeth** (catching the lying and
  the boredom) are still mine. And they're kept **only until the state of the art provides them
  too** — the crown jewels are bespoke parts on the *same shedding schedule* as the PRD/workplan.

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
- The deeper note: the babysitter is **built to be replaced from underneath** — an opinionated
  shell that sheds its bespoke parts as the state of the art catches up. That willingness to be
  outpaced is what keeps it durable.
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
- v2 (2026-06-05) — installment 5: the "shed bespoke for SOTA" philosophy; "opinionated
  lightweight shell" thesis; fresh-start/dumb-name rationale; arc closure (the PRD/workplan
  invented in Act 1 §1.3 is the first thing shed); crown jewels on the same shedding schedule.
