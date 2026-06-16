---
slug: design-system-foundation
targetVersion: "1.0"
date: 2026-05-31
branch: feature/design-system-foundation
parentIssue: 
---

# Feature: Design discipline foundation + homepage pilot

Ports design-decision discipline into this two-property repo — a shared repo-root
`DESIGN-DECISIONS-PROTOCOL.md` plus a per-site `DESIGN-SYSTEM.md` for audiocontrol and
editorialcontrol — and validates it by running the audiocontrol homepage refresh (S-330/S-550
screenshot refresh + Akai S3000XL "launching" promotion) under the new discipline as a pilot.
It matters because UI changes are about to start, and without documented, load-bearing
standards those choices drift and get silently relitigated. All concrete work is gated behind
a comprehensive, operator-approved discovery pass.

## Status

| Phase | Description | Status |
|---|---|---|
| 1 | Discovery (GATE) | ✅ Complete — approved 2026-06-01 (4 gate decisions in prd.md) |
| 2 | Protocol + governance wiring | ✅ Complete |
| 3 | Per-site design systems | ✅ Complete — both DESIGN-SYSTEM.md docs + shared-token dedupe / type-scale-radius fix (build green, visually verified) |
| 4 | Homepage pilot (under the discipline) | ✅ Complete *(2 operator-approved stand-ins — see PRE-MERGE MUST-FIX in workplan)*: S3000XL `available` card, S-550/S3000XL screenshots, copy refresh, archive entries, #132 fix, /hardware audit |
| 5 | Verification + retro | ✅ Complete — build green both sites; `retro.md` written |

## Key Links

- Branch: `feature/design-system-foundation`
- PR: [#133](https://github.com/oletizi/audiocontrol.org/pull/133) (**draft** — 2 PRE-MERGE MUST-FIX stand-ins; do not merge until resolved)
- PRD: `prd.md` · Workplan: `workplan.md` · Discovery: `discovery-findings.md` · Retro: `retro.md`
- Protocol: `../../../../DESIGN-DECISIONS-PROTOCOL.md` · Archive: `explorations/{ACCEPTED,REJECTED}/`
- Issues: [#132](https://github.com/oletizi/audiocontrol.org/issues/132) (OG path bug — fixed, closes on merge)
- Parent Issue: none (`/dwis` not run)
