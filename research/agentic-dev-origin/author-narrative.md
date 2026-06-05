# Author narrative — Orion's first-person account (primary source)

Captured from the operator directly (the most authoritative source — the receipts
corroborate it). Quote/paraphrase faithfully when drafting. Delivered in installments.

---

## Installment 1 (2026-06-05) — the causal chain that motivated the process

> Paraphrase of the operator's account, kept close to his words:

1. **The failure that really motivated me: the memory wipe.** It happened in almost every
   session at the **auto-compact boundaries** — the agent lost its memory/context mid-session.
2. **That's what prompted "source-of-truth documentation": the PRD and the workplan.** Durable
   docs that survive the wipe and can be re-read.
3. **Then another failure point: keeping the agent on task.** I had to repeat myself
   constantly about protocol — *"always write your planned steps to the workplan," "what's
   next on the workplan?", "did you update the workplan?"*
4. **I also accreted a very large `CLAUDE.md`** full of policy and standards — and I realized
   **those are often forgotten or dissolve into the context haze.**
5. **So I began to decompose the policy and standards into explicit skills and processes.**
6. **Once I had the processes and skills, it became clear I needed them portable across
   projects — so I decided to create the dw-lifecycle plugin.**

*(— more to come in the next installment.)*

### Receipts that corroborate installment 1
- **Source-of-truth docs:** first `prd.md` + `workplan.md` ~2026-02-10 (`ad8db1e`, monorepo);
  the `docs/<version>/<status>/<slug>/` convention 2026-02-05 (`a59d1601`).
- **On-task drift:** PROCESS = 128 of 225 corrections; verbatim refrains *"did you check to
  see if it worked?"*, *"did you scope it into the workplan?"*
- **Big CLAUDE.md → context haze → decompose:** CLAUDE.md grew to a **773-line peak**
  (`a20b8f07`, 2026-04-14) then **distilled to 198 path-scoped lines** the same day
  (`31319e1c`, #286) by extracting rules into `.claude/rules/` with conditional `paths:`
  loading; the lifecycle *named* 2026-04-10 (`3e302fff`, #188).
- **Portability → plugin:** decision to extract into a plugin 2026-04-19 (`d4df8ec4`); deskwork
  repo genesis 2026-04-21 (`7311d842`, "Ported from audiocontrol.org's .claude tooling");
  *"I want to canonize the … tooling … into deskwork lifecycle"* (05-24).

### Note on the disasters (slider / JUST-FOR-NOW / failover)
These are vivid *illustrations* of steps 3–4 (the agent drifting / policy-in-a-doc being
ignored), not separate plot points. Deploy them as evidence inside the on-task + context-haze
beats, not as their own act.
