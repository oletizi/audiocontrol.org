---
title: Findings Are Guardrails, Not Exceptions
deskwork:
  id: 77a439f2-121d-4c68-bbe2-26096cd98d24
  stage: Ideas
  iteration: 0
phase: AUDIT
---

# Findings Are Guardrails, Not Exceptions

Angle: findings are failures of the previous step pointed back at the happy path — not optional extra credit.

Key beats:
- The workplan-aware open-findings gate; open findings block advance unless they ARE the next scoped work.
- No --ignore-open-findings escape hatch — the workplan-aware semantic IS the cure.
- Dispatch-wrapper forbidden-deferral phrases / regexes; the return grammar that rejects "skipped same-class audit".
- The operator directive that shaped it (findings as guardrails back to the happy path).

Sources: dw-lifecycle implement SKILL (open-findings gate, dispatch wrapper), promote-findings.
