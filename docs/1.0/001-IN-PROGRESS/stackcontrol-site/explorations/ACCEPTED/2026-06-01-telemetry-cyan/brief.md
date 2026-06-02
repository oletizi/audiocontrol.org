---
proposal: "Telemetry — electric-cyan industrial control-plane identity"
status: ACCEPTED
date: 2026-06-01
feature: docs/1.0/001-IN-PROGRESS/stackcontrol-site/
visual: "../../directions/a-telemetry.html"
---

# Telemetry — electric-cyan industrial control-plane identity

## What

The chosen stackcontrol.org identity. A near-black surface with a faint cool-blue cast, a single
electric-cyan accent (`190 92% 56%`) as the dominant chromatic voice, and a sparing cool-neutral
counter-accent (`200 14% 74%`). Type pairs Archivo / Archivo Expanded (heavy industrial grotesk
display) with IBM Plex Sans (body) and JetBrains Mono (telemetry, labels, metadata). The signature
structural device is a horizontal **phase rail** — the lifecycle (Define → Workplan → Implement →
Audit → Ship) rendered as connected nodes — used as the hero spine and echoed as a section divider,
plus a scrolling mono **telemetry ticker** and a faint dot-grid + scanline body texture.

## Why accepted

The site is a product + devlog for a *lifecycle / orchestration* toolchain, and the control-plane
register is the most literal, least decorative expression of that idea: the homepage reads like a
dashboard watching work move through phases, which is exactly what deskwork does. Among the three
generated directions it was the one whose signature device (the phase rail) doubled as real
information architecture rather than ornament. The electric cyan also satisfies the differentiation
constraint cleanly — it is neither audiocontrol's amber nor editorialcontrol's chartreuse — and the
Archivo display diverges from both siblings' faces. Operator picked it over Blueprint (indigo) and
Stack (magenta) in the Phase 2 design pass.

## When

Chosen 2026-06-01 (Phase 2 operator pick). Implemented in commit `224a5b1`
(`feat(stackcontrol-site): Phase 3 Tasks 1-2 — Telemetry identity + homepage`) and built out across
Phase 3. Settled values are documented in
[`src/sites/stackcontrol/DESIGN-SYSTEM.md`](../../../../../../src/sites/stackcontrol/DESIGN-SYSTEM.md).

## Feature reference

`docs/1.0/001-IN-PROGRESS/stackcontrol-site/` — stackcontrol.org site foundation + design pass.
