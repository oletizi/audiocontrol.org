# stackcontrol.org — messaging copy deck

Durable record of the homepage messaging direction and the locked copy, so it survives
outside the chat. Source of truth for the implementation in
`src/sites/stackcontrol/pages/index.astro`, `brand.ts`, and the Layout SEO props.

## Strategic direction (locked)

Decided via operator Q&A during the messaging pass:

1. **Protagonist — lead with stack-control.** stack-control is the product, present tense,
   named for what it is. **No mention of dw-lifecycle or deskwork.** Don't advertise the
   rebuild / flux.
2. **Center of gravity — the babysitter premise + the industrial-process thesis**
   (craftsman → industrialist). The differentiators (multi-agent audit / "stochastic
   correctness", scope discovery) are *talked about* as evidence — not enthroned as the headline.
3. **Voice — bring the visceral frame onto the homepage, anchored by one sharp hero line.**
   ("Both" of: bring-it + one-spark.)
4. **Toolchain references — held to real names only.** No invented command strings. Audit and
   Repeat carry no command (Audit is automatic on the implement hook; Repeat is the loop).

### Supporting capability (industrial teeth)
Implementation fanout: Spec Kit gives a **task dependency graph**, so stack-control runs work
**in parallel where it can and in order where it must**, fanned across **agents and providers**.
The queue substrate (subagents → other local CLIs → cloud queues for massive parallelism) is
**roadmap → kept off the homepage**; it's a devlog topic, not marketing copy.

### Lifecycle (locked)
Four-phase **loop**: **Define → Implement → Audit → Repeat.** Heavy design happens once up front
(Spec Kit's spec + dependency graph absorbs the old standalone "Workplan"). Implement and Audit
repeat until the diff is clean. ("Ship / you own the merge" remains a principle but is not a
rail node in this treatment.)

### Commands (from operator)
- `/stack-control:define` — on the Define card
- `/stack-control:implement` — on the Implement card
- Helpers (not lifecycle phases, kept off the phase grid): `session-start`, `session-end`
- Namespace prefix **confirmed**: `/stack-control:` (operator, 2026-06-06).

---

## Copy by surface

### Tagline (`brand.ts` → footer)
> An assembly line for agentic coding.

*Alt:* Industrial discipline for coding agents.

### Hero
- **Kicker:** `stack-control · an agent plugin`
- **H1:** Coding agents need a *babysitter*.  *(em word `babysitter` takes the cyan glow)*
- **Lede:**
  > Coding agents are insane, hyperintelligent toddlers — they lie, they get bored, and they shove
  > beans up their nose the second you stop watching. **stack-control** is the babysitter: an agent plugin
  > that runs every change down an assembly line — heavy design up front, implementation fanned
  > out across agents at once, and independent audits on every diff, so correctness never rides on
  > how much attention you had to spare.
- **CTAs:** `Read the devlog →` · `What it does`

### Section 01 — "The Lifecycle" (meta: `4 phases · one loop`)
Four cards in the existing `NN / NAME` + blurb idiom:
- **01 Define** — "An interview captures the problem and the scope before any code moves — what
  changes, what stays, what's explicitly out." · `$ /stack-control:define`
- **02 Implement** — "Tasks are delegated to specialized subagents and committed at clean task
  boundaries — never one giant blob." · `$ /stack-control:implement`
- **03 Audit** — "Every task gets a multi-agent audit — multiple reviewers fired in
  parallel against the diff, findings triaged." · *(no command — automatic)*
- **04 Repeat** — "Audit findings point implementation back to the happy path. Run Implement →
  Audit until the diff comes back clean." · *(no command — the loop)*

### Section 02 — "What / Why / How"
- **WHAT — "An assembly line for change":** stack-control wraps every change in a disciplined line
  — define once, then implement and audit on a loop until the diff is clean — instead of letting an
  agent freestyle from prompt to merge.
- **WHY — "Agents cause brilliant chaos":** Left unsupervised, agents drift: they skip scope,
  over-build, confabulate, and ship work no one checked. The line is the adult supervision — gates
  between intent and merge.
- **HOW — "Best practices, not bespoke":** Underneath, it's the state of the art — a Spec Kit spec
  and its dependency graph, the coding-agent CLIs, subagents — wired into one opinionated line.
  stack-control runs the graph in parallel where it can and in order where it must, across agents
  and providers, then audits every diff with independent models. A thin shell over the best tools,
  not a homegrown framework. *(Positioning: stack-control is not a bespoke solution — it's an
  opinionated assembly line of current best practices.)*

### SEO (`<Layout>` props)
- **Title:** `stackcontrol.org — a babysitter for your coding agents`
- **Description:** `stack-control is an agent plugin that turns agentic coding into an
  industrial process: heavy design up front, hands-off implementation fanned across agents, and
  multi-model audits on every change.`

---

## Status
- Phase grid (4 cards) + commands + `PhaseRail` (4 nodes): **applied**.
- Tagline, hero, What/Why/How, SEO: **applied** (this pass).
- `DESIGN-SYSTEM.md` §6/§7 vocabulary (control-plane → babysitter / assembly line / loop):
  **updated in the same change**.
- Homepage messaging committed in `0d8474c`; namespace `/stack-control:` confirmed.
- Published devlog post `standing-up-a-site-with-its-own-lifecycle` **reframed** to stack-control +
  the four-phase loop (deskwork / dw-lifecycle / five-phase walk removed; planning folded into
  Define; "operator owns the merge" kept as the exit).
