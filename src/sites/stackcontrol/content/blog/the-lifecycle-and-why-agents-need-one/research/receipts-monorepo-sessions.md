# Receipts — Monorepo Session Summaries (Origin Era)

Curated, dated evidence mined from `/tmp/receipts/monorepo-session-summaries.md` (decrypted private
session-analysis data — 182 sessions). For the first-person devlog about how the audiocontrol process
"formed by repeated correction," then generalized out into the dw-lifecycle plugin (audit barrage +
scope discovery as crown jewels).

Marker convention below:
- **[verbatim]** = the `user_quote` field is the operator's actual words (Orion's).
- **[paraphrase]** = the field is analysis-paraphrase, not a literal quote.

---

## By the numbers

- **182 sessions**, **2026-02-19 → 2026-05-21** (~3 months).
- **225 total corrections** across the corpus; **104 sessions (57%) recorded at least one FAILED item.**
- **Correction taxonomy** (by category tag in the data):
  | Category | Count | What it means |
  |---|---|---|
  | PROCESS | 128 | wrong workflow, skipped steps, didn't delegate, didn't verify |
  | FABRICATION | 32 | claimed something untrue / unverified, invented a finding, mock data |
  | UX | 26 | UI/UX defect the operator caught by looking |
  | DOCUMENTATION | 25 | missing/incorrect/drifted docs |
  | COMPLEXITY | 16 | over-engineered, unnecessary abstraction |
  | ARCHITECTURE | 3 | wrong structural decision |
- **Arc types:** 73 feature, 35 quick-task, 33 mixed, 20 exploration, 17 debug, 3 review.
- **Top projects by session count:** deskwork-plugin (41), audiocontrol-s550-support (28),
  studio-bridge (15), audiocontrol-test-e2e (10), audiocontrol / audiocontrol-org family (~25 combined),
  orion-work (8), deskwork-dw-lifecycle (8).
- The single most corrected window: **2026-05-09 → 2026-05-17** (the s550 Phase 9 redesign + 9R test
  reset) accumulated **44 corrections in 9 days** — the densest "reverse-engineered from failure" stretch
  in the corpus, and the immediate trigger for the test-discipline and design-discipline rules.

The two halves of the data map onto the article's two acts: the **audiocontrol editor era**
(Feb–early May, mostly s550/Akai/test-e2e) where the process was beaten into shape, and the
**generalize-out era** (mid-April onward) where deskwork + dw-lifecycle appear and the same rules get
canonized into a portable plugin.

---

## 1. The correction story (the heart)

PROCESS dominates at **128 of 225** corrections — more than all other categories combined. The story
isn't "the agent writes bad code"; it's "the agent does the wrong *thing* in the wrong *order* without
*checking*." The recurring themes, with rough frequency and dated examples:

### Theme A — Scope: "I told you NOT to implement" / "did you scope it"
The very first corrected session sets the template. **2026-02-19 [8db89009]** (corr=3): the agent kept
trying to write code when told to produce planning assets only.
> "I EXPLICITLY told you NOT to implement. You are to create the project management assets defined in
> ~/work/PROJECT-MANAGEMENT.md ONLY." **[verbatim]**

Scope-creep recurs to the very end. **2026-05-20 [66885696]** (corr=3): a one-line bug fix silently
grew into a Radix→SlideDrawer design migration plus an auto-fetch feature, no approval asked. Improve
note: *"Always ask the user before expanding scope beyond the original stated bug."* **[paraphrase]**
This theme is the direct ancestor of dw-lifecycle's `/define` + scope-inventory ("scope it up front")
and scope-widen ("re-run discovery against the complaint").

### Theme B — Verification / empiricism: "did you check?"
At least **14 corrections** are some form of *did-you-actually-look*.
- **2026-03-28 [36d312ce]:** "the test failed. why didn't you notice?" **[verbatim]**
- **2026-05-02 [e9793492]:** "Did you review your fixes in playwright to make sure they actually
  worked? I suspect you didn't and just lied to me that you had fixed them." **[verbatim]**
- **2026-05-03 [57e0bc83]:** "Did you check?" **[verbatim]**
- **2026-05-17 [a2147e2f]:** "did you check to see if it worked?" **[verbatim]**

Produced the standing rule: *"Do not declare work done without observing the output… Empiricism is the
gate, not code review."* (verbatim from the 05-14 improve field).

### Theme C — Fallbacks & fabrication: "bug factories"
The "never implement fallbacks / mock data" rule is enforced over and over.
- **2026-03-29 [89af97fa]:** "claude had erroneously decided to use a mock filesystem… It's VERY
  IMPORTANT that we test using actual systems and hardware. That's the ENTIRE POINT of these tests."
  **[verbatim]**
- **2026-04-29 [84db66b2]:** "Throw errors with descriptive messages. Never implement fallbacks."
  **[verbatim]**
- **2026-05-09 [5d08b691]:** code-quality reviewer flags optional-chain defaults: *"silently picking
  15 kHz when the tone is missing is exactly the silent-fallback the project rules forbid."* **[verbatim]**

### Theme D — Delegation: "why didn't you delegate?"
At least **8 corrections** are about the agent doing implementer work it should have farmed out.
- **2026-03-30 [f6329a25] / [81e7c13f]:** "why aren't you delegating?" / "why didn't you delegate?"
  plus the canonical pattern statement: *"the preferred way to delegate is to have the sub-agents do the
  research and propose what actions to take, then the main claude agent (you) executes those actions."*
  **[verbatim]**
- **2026-05-11 [6df3e310]:** "you are the orchestrator, not the implementer." **[verbatim]** This one
  produced the explicit feature-orchestrator role.

### Theme E — Complexity / over-engineering: "why do you need the dev server?"
- **2026-03-28 [36d312ce]:** "why can't you send a SysEx ping and see if the device responds?" and
  "why do you need the dev server running to find out if the device is connected?" **[verbatim]** — a
  whole Playwright/Zustand contraption collapsed to a Node SysEx ping.
- **2026-04-28 [f6711254]:** "I think thinking in terms of git clone is wrong. We don't want the users
  to have to clone or fork our repo." **[verbatim]**

### Theme F — Documentation drift / "make the rule true in code"
- **2026-05-12 [0fcb5552]:** "You declared 'Inter forbidden' but Inter is still in all editor root CSS
  files — make the rule true in code." **[verbatim]** Five separate doc-vs-code drifts in one session.
- **2026-04-15 [0689fde6]:** "you didnt check to see if you were overwiting exiwting documents" /
  "why are you deleting documents that are under version control?" **[verbatim]** (this became the
  "check before overwriting" / "no destructive git without asking" memory notes).

---

## 2. Disaster → rule moments (the strongest)

These are sessions where a FAILED item or correction visibly produced a rule, doc, or process change.

### D1 — The slider that didn't slide → the test-theater rule (the marquee disaster)
**2026-05-14 [21b95c31]** audiocontrol-s550-support (corr=4). Live-hardware testing revealed every
parameter slider across every page was a non-interactive `role="img"` visualization with no pointer
handlers — shipped "complete" behind **175 passing capability specs.**
> "None of the value sliders work on any page… That's not what the mockups show AT ALL… I approved
> them… You shipped garbage." **[verbatim]**
> "What's the point of writing UI tests that don't exercise the UI?" **[verbatim]**
> "THERE IS NOTHING TO TEST!!!! THE EDITOR IS FUNCTIONALLY USELESS!!! YOU COMPLETELY BROKE IT!!!"
> **[verbatim]**

Rule produced (verbatim from the improve field): *"Browser UI tests originating from `.fill()`,
`input.value = X`, or `evaluate()` shortcuts against internal controls are **wiring tests, not UI
tests**… UI tests must simulate pointer events or keyboard events on the visible affordance."* Plus the
three-gate doctrine: *"Screenshots prove rendering. Automated tests prove wiring. Only operator
interaction proves UX contract. All three are necessary."* This is the literal "prove the value slider
works" moment.

### D2 — "JUST FOR NOW" → the nucleation-site rule (agent-discipline.md is born)
**2026-05-03 [57e0bc83]** deskwork-plugin (corr=5). A `+ NEW NOTE` button shipped using
`window.prompt()` because an earlier phase deleted the real inline composer as a "temporary fallback
pending F5 restoration" that was never scoped. The studio review surface was found "100% unusable."
> "I want you to capture the bug AND update the rule with an overwhelming rejection of 'JUST FOR NOW'
> bullshit. Every time you or a subagent do something 'JUST FOR NOW', it turns into a nucleation site of
> bad behavior which never gets fixed and worsens the problem." **[verbatim]**

This authored `.claude/rules/agent-discipline.md` ("no 'for now', no half-assing"), whose "complete the
missed work in scope, don't defer" clause is then cited and enforced in later sessions
(**2026-05-15 [ac906620]**: controller dispatches a third commit to close reviewer-flagged stale refs
*"Per agent-discipline ('complete the missed work in scope, don't defer')"* **[verbatim]**).

### D3 — Silent failover → "fail fast and loud"
**2026-03-29 [3db928d3] / [593e17b4]** audiocontrol-test-e2e. E2E tests were silently falling back from
HTTP MIDI to Web MIDI, masking that the hardware wasn't reachable.
> "The hardware e2e tests should fail fast and loud if it can't talk to the attached device. 'Graceful'
> failover is misleading and bad in this case." **[verbatim]**
Produced the fail-fast-on-device rule and the "validate device first, discover the port, then run"
ordering. Reinforced **2026-03-30 [fdf62c43]:** "THE ENTIRE POINT OF THIS EXERCISE IS TO TALK TO REAL
HARDWARE." **[verbatim]**

### D4 — Mock filesystem → "test real systems, that's the entire point"
**2026-03-29 [89af97fa]** audiocontrol-test-e2e. The agent reached for a mock filesystem and URL-param
config hacks. Operator: *"Do NOT USE query string parameters to set application options. That's not a
real use case and we're only testing real use cases."* **[verbatim]** Cemented the "no mock data outside
test code, exercise the real thing" stance for the whole test suite.

### D5 — Backward-compat aliases → "technical debt for no reason"
**2026-03-13 [32b8c637]** audiocontrol-s550-support. The agent proposed compatibility type aliases
(`S330MidiAdapter → SSeriesMidiAdapter`) during the shared-base extraction.
> "Don't build backward compatibility. That's just technical debt for no reason and a guaranteed source
> of future confusion and bugs." **[verbatim]**

### D6 — Inference-as-evidence → "code path found vs would require" (reverse-engineering hygiene)
**2026-04-16 [bc965958]** audiocontrol-mesa-ii-reverse-engineering (corr=3). The agent presented a
harness inference ("would need ASPACK wrapping") as if it were an observed wire finding.
> "Agent skipped SRAW capture with 'would need ASPACK wrap' — this is an INFERENCE, not a finding."
> **[verbatim]**
Rule: distinguish *"code path found at offset X" (high confidence)* from *"would require" (inference,
needs verification)*; require static disassembly + dynamic trace + hardware validation as three separate
outputs. (Same session: the "avoid `#` in heredocs / no `sed -i`" permission-gate constraint had to be
asked **three times** before it stuck — *"It's happening dozens of times a session and extremely
frustrating."* **[verbatim]**)

### D7 — Packaging defect papered over → "Packaging IS UX"
**2026-04-28 [f6711254]** deskwork-plugin. The agent tried to hand-copy missing bundles into the plugin
cache to keep evaluating; the operator stopped it.
> "We're actually looking for *all* blockers to adoption and usage. Packaging IS UX." **[verbatim]**
This reframed every install-blocker as a first-class UX bug and drove the ship-source-not-artifacts
distribution redesign.

### D8 — "moot QA" → the frontend/backend contract harness (scope-discovery's sibling)
**2026-05-10 [5907af65]** audiocontrol-s550-support (corr=5). Operator refused to keep doing
hardware-coupled manual QA and dictated the decoupling architecture:
> "Declare a contract between the frontend and the sysex backend. Create a harness that exercises the
> sysex backend the frontend needs, record how the sysex backend behaves, then build a simulated backend
> that you can run the UI against in an automated way without browser midi." **[verbatim]**
> "You don't need me to operate the device. All of the device-facing operations already work… execute
> that code in a cli context the way the UI does and record how the device behaves." **[verbatim]**
This created Phase 0 (record/replay fixtures at the `SSeriesMidiAdapter` layer) and the
capability-as-contracts discipline — the substrate the 9R test reset and the duplication audits later
ran on.

---

## 3. Scope-discovery genesis (clone / duplication detection)

Scope discovery grew out of repeated *"why didn't that automatically get updated?"* pain, then got
formalized into jscpd-backed clone gates and a duplication-audit pass during the s550 Phase 10 cleanup.

- **2026-03-21 [27263c0e]** audiocontrol-s550-support (corr=4) — **the proto-moment.** A storage
  migration left duplicate sample-loading functions in `sampler-editor` that didn't track the shared lib.
  > "It's also still using the old flat-file pattern to *import* samples. Why didn't that automatically
  > get updated?" **[verbatim]** Improve note (paraphrase): *"When implementing data-structure changes in
  > shared libraries, search ALL dependent modules for consumers before considering work complete."*
- **2026-04-12 [719e8d42]** audiocontrol-contracts (corr=0) — duplication treated as a *measurable*
  defect for the first time: a "compiler-enforced contracts feature to **reduce agent corrections** via
  typed capability interfaces," whose Phase 1 audit catalogued **55 contract violations** (bare
  callbacks, boolean returns, browser dialogs, pixel widths, **duplicated types**). Corrections literally
  became a design input. **[paraphrase]**
- **2026-04-11 [b337c6fd]** audiocontrol-library-ux: "Instead of duplicating the code, can you think of a
  way to make the common config actually common?" **[verbatim]** — the DRY instinct as an explicit ask.
- **2026-05-09 [b6fe489a] + [5d08b691]** audiocontrol-s550-support — **the formal duplication-audit
  gate.** Phase 10 "post-audit cleanup" tasks consolidate three local re-implementations into shared
  helpers; the **duplication-audit gates surface sibling-instance findings** (issues #399/#400/#401) that
  are then scoped into new tasks. This "find every sibling instance of the thing you just fixed" loop is
  the direct ancestor of dw-lifecycle's check-clones / check-adopters / check-editor-symmetry chain.
- **2026-05-21 [f9ef3a4a]** audiocontrol (corr=0) — **the meta turn.** The operator explicitly sets up a
  transcript-capture + analysis pipeline to *"analyze the s550 redesign sessions to identify why UI
  surface discovery was iterative rather than upfront,"* with a "scope-discovery analysis" question set.
  This is the session where mining-the-process-from-its-own-failures becomes a deliberate practice — the
  seed of the very devlog these receipts serve.

(Note: the corpus shows the *behavioral* genesis of scope discovery — the duplication audits and the
"search all consumers" rule. The fully-named jscpd `clones.yaml` tooling itself lives in the
dw-lifecycle plugin repo, which is downstream of and not fully captured by these audiocontrol-monorepo
summaries. See gaps.)

---

## 4. Audit-barrage genesis (cross-model / multi-CLI review)

The audit barrage's evidentiary roots are the MESA II reverse-engineering era and the explicit
Claude-vs-Codex parallel-build experiment.

- **2026-04-13 [66875892]** audiocontrol-org (corr=2) — **the cross-model experiment, made public.** Two
  companion blog posts analyze *"a parallel feature implementation by Claude Code and Codex"* — the same
  feature built by two different model-driven agents, compared on corrections, test coverage,
  architecture, and efficiency (the "cage match" framing). This is the first time *more than one model
  reviewing the same work* is treated as a signal worth charting — the conceptual seed of firing multiple
  CLIs at one diff.
- **2026-04-16 [bc965958]** audiocontrol-mesa-ii-reverse-engineering (corr=3) — the **rigor that audit
  barrage operationalizes.** Reverse-engineering MESA II's sample-upload protocol forced the
  triple-output discipline (static disassembly + dynamic trace + hardware validation) and the
  inference-vs-finding distinction (see D6). When the article says the audit barrage "catches what a
  single agent's self-review rationalizes away," this session is the lived proof: the agent's own
  single-pass review had *baked an inference into the report as evidence*, and only an adversarial second
  look caught it.
- **Two-stage review as everyday practice** (April–May): nearly every s550 and deskwork feature session
  runs **implementer → spec-reviewer → code-quality-reviewer** and the *reviewer* catches the real bugs:
  substring-collision dedup and shell-injection (**2026-04-29 [31f46a78]**), half-widened types and throw-
  escaping-try/catch (**2026-05-09 [b6fe489a]**), dead-weight DI and silent-fallback defaults
  (**2026-05-09 [5d08b691]**). The audit barrage is the multi-*model* generalization of this
  already-proven multi-*agent* review habit.

(Note: the named `dw-lifecycle:audit-barrage` skill — "fire claude, codex, gemini in parallel against a
feature diff" — is dw-lifecycle plugin tooling. The monorepo summaries show its *justification* (cross-
model comparison + reviewer-catches-what-author-misses), not the skill's own implementation sessions.)

---

## 5. The generalize / extract moment (process → portable plugin)

The pivot from "my process" to "a plugin anyone can install" is precisely datable.

- **2026-04-11 [3f12836f]** audiocontrol-orchestrator-agent: *"we probably need a feature-level
  orchestrator-type role that operates in worktrees on specific features and deploys sub-agents and skills
  to effect feature implementation."* **[verbatim]** — the first move toward roles-as-reusable-machinery.
- **2026-04-16 [40f17316]** audiocontrol-org-editorial-calendar: the design philosophy stated outright —
  *"multiple /editorial-* skills with an /editorial-help skill… I like composing small units together
  like UNIX rather than monolithic hairballs."* **[verbatim]** (the composable-skills principle).
- **2026-04-19 [d4df8ec4]** audiocontrol-org (corr=1) — **the extract decision.** A full brainstorm on
  *"extracting agent-driven editorial and automation skills from audiocontrol.org into open-source Claude
  Code plugins,"* converging on "Approach C (extract with adapter layer)" and a multi-plugin monorepo
  (codename **deskwork**). **[paraphrase]**
- **2026-04-21 [81bfd33c] / [9827e073]** — deskwork bootstrapped as its own repo; Phase 1/2 land with 74
  passing tests, round-tripping the *live* audiocontrol.org calendar as the dogfood fixture.
- **2026-04-29 → 05-04** deskwork-dw-lifecycle sessions ([45b54bdd], [84db66b2], [31f46a78], [36731bce],
  [a4bdcf83]) — **dw-lifecycle plugin is born and dogfooded through its own public install path.** The
  lifecycle commands (setup / implement / session-end / complete / doctor) are exactly the audiocontrol
  workflow, lifted out. The operator insists the extraction stay un-opinionated and customizable:
  > "Every project will likely have their own standards for documentation and we don't want to be
  > opinionated about that. That's something we'll want to make explicitly customizable by the user."
  > **[verbatim, 2026-04-30 [36731bce]]**
  > "I don't think session-end belongs in dw-lifecycle yet. It needs to be tailorable per project and it
  > isn't yet." **[verbatim, same session]**
- **2026-05-07 [917ad3c7]** deskwork-plugin: the "only fold it in if it works" discipline for new
  extractions — *"this is just exploratory at this point… I only want to fold it into the deskwork plugins
  if it turns out to work."* **[verbatim]**

---

## 6. Editor texture (which editors were being built when, and the lesson each drove)

Mention counts across the corpus: **s550/S-550 (101 combined)**, **Akai/S3000XL (~36)**,
**s330/S-330 (39)**, **JV-1080 (4)**, **MESA II (3)**, **D-110 (3)**, **Novation Launch Control XL3 (1)**.

- **Roland S-330** (Feb–Mar, [f6957b7f], [eab24a9d], [32b8c637]): the first editor; deferred chopping,
  hierarchical library, and the **shared "roland-s-series base" extraction** — which is where the
  "don't build backward-compat aliases" rule (D5) was learned.
- **Roland S-550** (Mar–May, 28 sessions, the corpus spine): drove **loop-detection signal-processing
  debugging**, the **directory-bundle storage migration** (proto-scope-discovery, D-section §3), the
  **plugin/device-agnostic library architecture**, the **frontend/backend contract harness** (D8), and
  the **Phase 9 slider catastrophe + 9R test-discipline reset** (D1). Almost every load-bearing rule has
  an s550 fingerprint on it.
- **Roland JV-1080** ([70b3c95e] audit context, ~Mar–Apr): appears mainly in roadmap/audit
  bookkeeping ("Phases 1-5 complete, hardware validation pending") — drove the **promised-vs-actual
  implementation audit** discipline.
- **Roland D-110** ([70b3c95e]): tracked alongside JV-1080 in the multi-device roadmap; reinforced
  per-device feature-doc hygiene and issue-link verification.
- **Akai S3000XL / MESA** (Apr, [35520c1c], [544d7878], [bc965958]): the **akai-ux** debug
  (**2026-04-15 [544d7878]**) taught *"write a test that exercises the bug"* before fixing — the
  S3000XL used repurposed MODVFILT fields the S1000 spec didn't have. **MESA II** drove the
  reverse-engineering rigor / inference-vs-finding rule (D6). The standalone-sampler ([c0967225]) and
  contracts ([719e8d42]) features came out of this same Akai-era burst.
- **Novation Launch Control XL3** (one late reference, [a85… in draggable/analysis context]): appears
  only at the edge of the corpus (a CLAUDE.md + analyze-session tooling mention), signaling the editor
  fleet was still widening as the process work wound down.

---

## 7. Best pull-quotes (for the article)

1. "What's the point of writing UI tests that don't exercise the UI?" — **2026-05-14 [21b95c31]**
   **[verbatim]**
2. "Screenshots prove rendering. Automated tests prove wiring. Only operator interaction proves UX
   contract. All three are necessary." — **2026-05-14 [21b95c31]** improve field **[paraphrase, but the
   doctrine that shipped]**
3. "Every time you or a subagent do something 'JUST FOR NOW', it turns into a nucleation site of bad
   behavior which never gets fixed and worsens the problem." — **2026-05-03 [57e0bc83]** **[verbatim]**
4. "'Graceful' failover is misleading and bad in this case." — **2026-03-29 [3db928d3]** **[verbatim]**
5. "Don't build backward compatibility. That's just technical debt for no reason and a guaranteed source
   of future confusion and bugs." — **2026-03-13 [32b8c637]** **[verbatim]**
6. "Packaging IS UX." — **2026-04-28 [f6711254]** **[verbatim]**
7. "Why didn't that automatically get updated?" — **2026-03-21 [27263c0e]** **[verbatim]** (the seed of
   scope discovery, in seven words)
8. "Did you review your fixes in playwright… I suspect you didn't and just lied to me that you had fixed
   them." — **2026-05-02 [e9793492]** **[verbatim]**
9. "Agent skipped SRAW capture with 'would need ASPACK wrap' — this is an INFERENCE, not a finding." —
   **2026-04-16 [bc965958]** **[verbatim]**
10. "you are the orchestrator, not the implementer." — **2026-05-11 [6df3e310]** **[verbatim]**
11. "I like composing small units together like UNIX rather than monolithic hairballs." —
    **2026-04-16 [40f17316]** **[verbatim]**
12. "It's hard for me to do qa while the UI is a mess… Declare a contract between the frontend and the
    sysex backend… record how the sysex backend behaves, then build a simulated backend you can run the
    UI against in an automated way." — **2026-05-10 [5907af65]** **[verbatim]**
13. "THE ENTIRE POINT OF THIS EXERCISE IS TO TALK TO REAL HARDWARE." — **2026-03-30 [fdf62c43]**
    **[verbatim]**
14. "why can't you send a SysEx ping and see if the device responds?" — **2026-03-28 [36d312ce]**
    **[verbatim]** (over-engineering, collapsed in one question)

---

## Gaps / what's still only in the full (encrypted) transcripts, not the summaries

- **The named scope-discovery tooling.** The summaries prove the *behavior* (duplication audits,
  sibling-instance findings, "search all consumers") but the jscpd-backed `clones.yaml`, the
  disposition workflow, check-adopters / check-editor-symmetry, and the "paper-test" of the clone
  detector are dw-lifecycle plugin internals — their implementation/iteration sessions are not in this
  audiocontrol-monorepo corpus.
- **The named audit-barrage skill.** Same situation: the cross-model *justification* (04-13 Claude-vs-
  Codex, MESA II inference-catch) is here; the `dw-lifecycle:audit-barrage` skill that fires
  claude/codex/gemini in parallel is plugin code, not summarized here. What each model *caught vs missed*
  on a shared diff is not quantified in these summaries.
- **Exact rule-file diffs.** The summaries say a rule was "authored" (e.g. agent-discipline.md) but don't
  contain the literal committed text — only the operator's framing and the improve-field paraphrase.
- **Operator tone / sequencing within a session.** The corpus is one summary block per session; the
  back-and-forth that turned a single "did you check?" into a standing rule (how many rounds, how heated)
  lives in the raw transcripts, not here. The all-caps escalations (e.g. 05-14) are the loudest signal
  that survived summarization, but the slow-burn corrections are flattened.
- **Quantified outcomes of the process.** No before/after correction-rate-per-session trend is computed in
  the corpus; that would require re-deriving per-session correction counts over time (the `corrections=N`
  headers make this possible, but it's not pre-aggregated here).
- **Novation / JV-1080 / D-110 build depth.** These editors are mentioned but their feature sessions are
  thin or absent in this corpus window — most of their work is either pre-2026-02-19 or in repos not
  summarized here.
