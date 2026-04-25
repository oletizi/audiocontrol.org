# Scrapbook — Prompt Engineering by Dialogue: Add the Socratic Method to Your Toolkit

Research, receipts, and artifacts that inform this dispatch. Not part of
the article; co-located with `index.md` so a slug rename carries it
automatically. Invisible to Astro's content collection (glob is
`*/index.md`, not `**`), so nothing in here ships to the static site.

## Operator thesis (from planning, 2026-04-24)

The Socratic method is something the operator can employ on the agent
— not something we can reliably require the agent to employ on the
operator. The benefits the operator has observed in practice:

**(a) Open-ended solution space.** Asking the agent leading questions
or asking it to describe its understanding of the state of affairs
keeps the solution space open. Telling the agent autocratically what
to do produces narrow execution. Asking it how it thinks it should
proceed produces a richer reading of the design space — and surfaces
the hidden assumptions the agent was already operating on.

**(b) Less framing burden — agent drafts its own prompt.** The
operator doesn't have to think as hard about how to frame
instructions. Asking the agent what it would do is essentially
asking the agent to draft its own prompt. The operator hones it via
further leading questions, often arriving at a better prompt than
they would have written from scratch.

**(c) Standards-surfacing.** Asking the agent to explain which
project directive or standard it has violated does two things at
once: (1) swaps that directive into the agent's working context
with a bright line around it, and (2) unearths project guidelines
that are poorly described or not described at all. The Socratic
method is therefore useful not only for corrections but as a tool
for arriving at better prompt engineering and better project
documentation.

The dispatch's job: name these three benefits, prove each with
verbatim receipts from the session archive, and disclose the limit
(over-asking when the operator has already given a directive).

## Frame correction (in scrapbook for honesty's sake)

First-pass framing of the dispatch put the Socratic move on the
agent ("ask the agent what it heard"). That conflated read-back /
requirements elicitation (operator holds the frame, agent
restates) with the Socratic method (questioner holds the frame,
asks leading questions of one with a hidden gap). The corrected
frame: the dispatch is about the **operator's** Socratic stance
toward the agent. The data supports this — see receipts files
below. The earlier "ask the agent what it heard" framing should
NOT survive into the published dispatch.

## Contents

- `mine-patterns.mjs` — first-pass aggregation over the LLM-classified
  session analyses (Haiku 4.5 output under
  `/tmp/session-analysis/`). Emits `patterns.json` +
  `all-corrections.json`. To re-run:
  ```bash
  for f in ~/work/audiocontrol-work/audiocontrol/data/sessions/analysis/*.json.age; do
    name=$(basename "$f" .json.age)
    age -d -i ~/.config/age/audiocontrol.key "$f" > "/tmp/session-analysis/$name.json"
  done
  node mine-patterns.mjs
  ```
- `patterns.json` — aggregate stats: total sessions, correction counts
  by category, top-N high-correction sessions, mental-model hits,
  Socratic-pattern samples.
- `all-corrections.json` — every correction from every analyzed
  session, in raw form. Use `jq` or another lightweight tool to slice.
- `mine-socratic-patterns.mjs` — second pass over the Haiku JSONs.
  Keyword-classifies each correction's `user_quote` and each
  pattern/strength entry against the three operator benefits (a/b/c).
  Emits `socratic-receipts.json`. Coarse — the analysis layer only
  records corrections, so it under-counts (b).
- `socratic-receipts.json` — Haiku-layer hits per claim. Strong for
  (c), thin for (a) + (b).
- `mine-raw-transcripts.mjs` — third pass over the raw decrypted
  transcripts in `~/work/audiocontrol-work/audiocontrol/data/sessions/content/`.
  Filters user messages to questions and matches against the same
  three-claim regex set. Emits `raw-receipts.json`. Where (a)
  actually shows up in the data — 76 hits across 23 sessions of the
  operator asking "why did you X?" / "what do you think Y?" /
  "what about Z?" These probes don't produce corrections (because
  the question ITSELF is the correction), so the analysis layer
  misses them.
- `raw-receipts.json` — full transcript-layer hits per claim. The
  primary receipt source for the dispatch. Pull individual quotes
  and cite the session id verbatim.

## Dataset snapshot

From the 2026-04-24 mining pass:

- **76** sessions analyzed (2026-02-19 through 2026-04-23)
- **98** total corrections
- **1.29** average corrections per session
- **54%** of sessions had zero corrections
- **~32%** of corrections map to mental-model gaps a Socratic restate
  would have caught (second-pass classification, keyword-based)

### Corrections by category

| Category       | Count |
| -------------- | ----- |
| process        | 68    |
| fabrication    | 10    |
| ux             | 8     |
| documentation  | 7     |
| complexity     | 4     |
| architecture   | 3     |

## Anchor receipts per claim (transcript-layer)

Pull these as exemplars when drafting the dispatch body. Each ties
to one of the three operator benefits above. Full set in
`raw-receipts.json`; full Haiku-layer set in `socratic-receipts.json`.

### (a) Open-ended solution space

- *"why do you need Zustand to find out if the device is connected?
  **Why can't you send a SysEx ping and see if the device responds?**"*
  (2026-03-28_36d312ce) — operator probes hidden dependency choice
  AND surfaces simpler alternative in one move.
- *"what do you mean 'mock library'? **Why is anything mocked?**"*
  (2026-03-29_3db928d3) — pushes agent to defend a quietly-built
  premise.
- *"why did you choose 15 seconds?"* / *"What do you think requires
  a 5 second timeout?"* (2026-03-30_81e7c13f) — surfaces arbitrary
  constants the agent picked without justification.
- *"so... why did you file an issue instead of fixing the problem?"*
  (2026-04-07_363f18a8) — catches a defensive move; forces
  re-examination.
- *"why do you need to write s3k-specific drum kit fixtures? Drum
  kits are common-area library objects. **What do the project
  standards say about the library structure and code duplication?**"*
  (2026-04-07_363f18a8) — all three benefits in one sentence.

### (b) Agent-as-prompt-drafter

- *"I've been reading about best practices regarding delegation to
  sub-agents and it seems like the preferred way to delegate is to
  have the sub-agents do the research and propose what actions to
  take, then the main claude agent (you) executes those actions."*
  (2026-03-30_f6329a25 + 81e7c13f) — operator names the pattern
  explicitly: sub-agents *draft*, main agent *executes*. Now built
  into the project's working model.
- The keyword filter under-counts (b) because the move is often
  imperative ("propose X before implementing"), not a question.
  When the dispatch needs more (b) receipts, widen the search to
  imperative forms or treat (b) as the move *inside* (a) — a
  "why did you choose X?" answer is the agent drafting a rationale
  the operator hones.

### (c) Standards-surfacing

- *"what does CLAUDE.md say about running e2e tests"*
  (2026-03-29_67252b19)
- Three-question stack inside one session
  (2026-03-30_81e7c13f): *"what does CLAUDE.md say about
  delegating?"* → *"why aren't you delegating per your CLAUDE.md
  directives?"* → *"How can we get you to follow the CLAUDE.md
  guidelines?"*
- *"why doesn't CLAUDE.md say to run the tests via the canonical
  make target?"* (2026-03-30_81e7c13f and _f6329a25) — directly
  surfaces an undocumented guideline. Haiku's
  `improvement_suggestion` for this session: *"Use git-aware file
  operations… This should be in CLAUDE.md as a general rule."*
- Three-step gap-closure in one session (2026-04-12_35520c1c):
  *"why haven't you written the guidance to CLAUDE.md"* → *"did
  you write the guidance to CLAUDE.md?"* → *"Why did you not
  follow CLAUDE.md guidance?"* — operator forces the standard
  to be written, verifies it landed, then catches a regression
  against it.
- *"does the CLAUDE.md for the midi-server project have a
  prohibition against claude attribution in pull requests?"*
  (2026-02-19_3d171144) — probing whether a standard exists at
  all before assuming.

### Limit / calibration edge

- 2026-04-21_81bfd33c (Haiku-layer): *"Agent over-asked for
  clarification when user provided directive; should have inferred
  from context."* The operator's Socratic stance has a limit:
  when the directive is already clear, the move is friction, not
  insight. The dispatch must name this so the move doesn't become
  its own tax.

## Earlier worked receipts (legacy first-pass)

### The precision trap — assuming capabilities that don't exist

- **2026-03-20_5ced7864** (fabrication): "Claude assumed Google Drive
  credentials would be missing and needed configuration; user didn't
  actually ask for that, and the topic shift made it moot."
- **2026-03-21_27263c0e** (fabrication): "Agent assumed loop-editor
  would automatically use updated tree node structure with
  directoryName field instead of fileName. Required explicit code
  updates in three locations."
- **2026-03-21_526c062b** (fabrication): "Agent incorrectly assumed
  the file path worked and kept trying variations instead of asking
  user for help or checking if the file existed. User pointed out
  the escaping issue."
- **2026-03-29_89af97fa** (fabrication): "Initial plan incorrectly
  assumed OPFS backend didn't exist at all. Investigation revealed
  it is fully implemented in the app but not exposed as a user-
  selectable option."

### The plan-mode proxy — plan in response without first restating

- **2026-04-12_92a92c10** (process): "Agent started implementing
  Phase 2 directly instead of delegating to a sub-agent. User asked
  'are you delegating?' to redirect the approach."
- **2026-04-11_53907a57** (process): "User said 'you are the
  orchestrator, not the implementation team' but Claude tried to
  read worktree files and start editing after the plan was
  created. Should have delegated implementation or waited."
- **2026-04-13_5bd0b7a6** (process): "Agent started implementing
  Phase 1 directly instead of delegating to sub-agents. Should
  have used Agent tool from the beginning."

### Counter-evidence — when the Socratic move worked

- **2026-04-13_62a16914** (pattern): "Assistant appropriately paused
  feature-complete workflow to clarify ambiguous feature state
  (high test coverage gaps, no tracked PR, no formal issue
  tracking). No user corrections were issued — session ended during
  clarification phase."
- **2026-04-19_d4df8ec4** (strength): "Iterative clarification
  questions that narrowed scope and revealed constraints
  (audiocontrol.org's live calendar, need for incremental
  migration)."
- **2026-04-13_885f8871** (pattern): "User gives precise course
  corrections by asking clarifying questions rather than directives."
- **2026-04-13_a8c1dd30** (pattern): "Agent uses /feature-define
  skill in a discovery mode, asking clarifying questions before
  jumping to implementation."
- **2026-04-11_095ccc74** (pattern): "Structured interview minimizes
  questions (4-6) by proposing concrete options and extracting from
  user's own descriptions."

### Calibration edge — over-asking

- **2026-04-21_81bfd33c** (pattern): "Agent over-asked for
  clarification when user provided directive; should have inferred
  from context." The move has a limit.

### Meta-move receipts (from this session, not yet in the archive)

Corrections this session exhibited exactly:

- Built a modal dialog for slug-rename when the design system said
  no modals — operator pointed at
  `editorial-review-client.ts:354`.
- Overstated that the Desk page "had the same gap" needing
  marginalia when it didn't — operator asked for the rationale,
  correction happened in-turn.
- Misdiagnosed "the primary UX violation" as the clipboard-copy
  affordance when it was the modal — operator corrected.
- Silent-renamed a calendar row whose content file was orphaned
  from a prior git rename — added a drift guard after the failure.

The session was drafted in a conversation where the operator
asked, "did you look at any of the transcripts?" — which is itself
the Socratic move. The dispatch wrote itself.

## How the analysis was produced

- `tools/extract-session-content.ts` (editorial-calendar repo) —
  extract transcripts from `~/.claude/projects/`, encrypt with age.
- `tools/extract-session-content.ts` (sibling audiocontrol repo) —
  mirror the archive into that repo's `data/sessions/content/`.
- `tools/extract-sessions.ts` (sibling audiocontrol) — pull
  lightweight metrics (user msgs, tool calls, duration, etc.).
- `tools/analyze-session-llm.ts` (sibling audiocontrol) — send
  each session to Claude Haiku 4.5 for structured analysis
  (arc_type, corrections, patterns, strengths). Rate-limited to
  50K input tokens/min. Idempotent: only runs on sessions without
  an existing analysis file.
- `mine-patterns.mjs` (this scrapbook) — second-pass keyword
  classification to find Socratic-preventable corrections.

The LLM classifications come from Haiku. The Socratic-preventable
cut is a keyword match I did against Haiku's correction
descriptions — disclosed in the dispatch so readers know which
layer of classification is model and which is me.
