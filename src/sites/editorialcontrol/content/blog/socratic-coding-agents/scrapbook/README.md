# Scrapbook: Don't Write a Better Prompt. Ask the Agent What It Heard.

Research, receipts, and artifacts that inform this dispatch. Not part of
the article; co-located with `index.md` so a slug rename carries it
automatically. Invisible to Astro's content collection (glob is
`*/index.md`, not `**`), so nothing in here ships to the static site.

## Contents

- `mine-patterns.mjs` — the Node script that aggregated the session
  analyses. Reads decrypted JSONs under `/tmp/session-analysis/` and
  emits `patterns.json` + `all-corrections.json`. To re-run:
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

## Worked receipts (for the dispatch body)

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
