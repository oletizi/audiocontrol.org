---
title: Session Fatigue: Why Long Agent Loops Degrade — and Why Compaction Makes It Worse
deskwork:
  id: 9363bb80-615c-493a-9fd1-7781041dafdd
  stage: Ideas
  iteration: 0
phase: IMPLEMENT
---

# Session Fatigue: Why Long Agent Loops Degrade — and Why Compaction Makes It Worse

Source: deskwork issue #408 — https://github.com/audiocontrol-org/deskwork/issues/408

Angle: long agentic sessions degrade in a specific, repeatable shape that is NOT a human-fatigue analogue — and the obvious cure (context compaction) makes the worst failure mode worse.

Four failure modes (from the reference session):
- Context-window dilution: early rules (CLAUDE.md, agent-discipline) get summarized past effective attention. Hour-1 the agent honored the arithmetic-reconciliation convention; hour-4 it wrote three contradictory commit counts in one paragraph.
- Self-confirmation loops: each shipped commit feels like progress, reducing care on the next; the audit-barrage caught real defects self-review missed.
- Pattern-match-substitute, not principled recall: the agent writes something *shaped like* a correct disposition without re-reading the source (claimed a regex matched `Acknowledges` when the source only matched `Closes`).
- Recursive meta-findings: the barrage starts flagging the *form* of fix-task blocks rather than substance; per-cycle marginal value drops.

Thesis: compaction is the wrong cure. The failure mode is acting on a digest instead of re-reading the source — and compaction IS that digest. It compresses evidence ("the exact regex at line 43") into summary ("parses Closes trailers") that *feels* like fact. session-end → clear → session-start beats compaction (rules reload from disk; evidence is re-read, not summarized).

The value-inflection point: the commit where the audit-barrage stops finding substantive defects and starts finding fix-task-lifecycle artifacts — locatable in the audit-log.

Craft framing the article can land on: "mechanize over policy" — surface the checkpoint in the tooling (/dwi, /dwse, a written session-checkpointing rule, an audit-barrage meta-pattern detector) so the tooling catches the inflection point instead of the operator catching it in retrospect.

Reference session: feature/scope-discovery, 2026-06-03 (commits 8da2ff0b..0fe000d1; audit-log AUDIT-20260603-37..87).

Phase tag: IMPLEMENT (the /dwi loop is the surface). Pairs with the "Building deskwork" audit-barrage piece (#6) — the barrage is what makes the degradation visible.
