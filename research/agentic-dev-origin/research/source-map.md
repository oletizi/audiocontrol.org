# Source map — canonical repos, paths, and access (reusable across articles)

Where the receipts live. Start here for any future "building deskwork / agentic-dev"
article. All git access is read-only (`git -C <path> log/show/grep`).

## Repos (on disk)

| Source | Path | Span | Role in the story |
|---|---|---|---|
| **ol_dsp (deepest root)** | `/Users/orion/work/ol_dsp` (cloned) — GitHub `oletizi/ol_dsp` | **2023-11-08** → 2026-02-03, 1026 commits, C/C++ | Hand-coded DSP for embedded hardware (Daisy/Teensy + Eurorack + JUCE host). Pre-agentic ~2yr (first CLAUDE.md 2025-09-01). The deepest origin; S-330 editor first built here. |
| **audio-tools (origin)** | GitHub `oletizi/audio-tools` (archived; flattened into the monorepo) | **2024-10-11** → 2025-09, TS | Hand-coded audio tooling, pre-agentic. No `.claude/` process yet. |
| **audiocontrol MONOREPO** | `/Users/orion/work/audiocontrol-work/audiocontrol` | 2025-09-01 → present (~2797 commits) | **Act 1.** Editors built + the process invented here. |
| **audiocontrol.org HUB site** | `/Users/orion/work/audiocontrol.org` (+ this worktree) | 2026-01-24 → present (~550) | Downstream hub; where deskwork/dw-lifecycle were adopted back. |
| **deskwork monorepo** | `/Users/orion/work/deskwork` (main) | 2026-04-21 → present (~1600) | **Act 2.** dw-lifecycle + deskwork + stack-control plugins. |
| **stack-control branch** | `/Users/orion/work/deskwork-work/pluggable-lifecycle-providers` (branch `feature/pluggable-lifecycle-providers`) | 2026-06-04 → | **Act 3.** The rebuild on Spec Kit. Spec: `specs/003-stack-control-front-door/`. |

## Session transcript archive (the human voice)

- **Local (recent only):** `~/.claude/projects/*<project>*/*.jsonl` — full transcripts, but only survive from **~2026-04-27**. Human-message corpus extractor: `/tmp/extract-human-corpus.py` → `/tmp/receipts/{audiocontrol,deskwork}-human.tsv`.
- **Archived (origin era), in the MONOREPO:** `data/sessions/`
  - `content/*.jsonl.age` — 183 full transcripts, encrypted, **from 2026-02-19**.
  - `analysis/*.json.age` — per-session structured summaries (arc, summary, accomplished, failed, **corrections**, patterns, improve), encrypted.
  - **clear-text:** `report-all.md` (aggregate: 183 sessions / 2,122 commits, 2026-02-19→05-21, by-project), `summary.csv` + `sessions.jsonl` (per-session metadata index).
  - **Decrypt (documented):** `age -d -i ~/.config/age/audiocontrol.key <file>.age` (key present on this machine; documented in `audiocontrol-monorepo:docs/1.0/003-COMPLETE/orchestrator-agent/`).
  - Decrypt+extract-summaries helper: `/tmp/decrypt-session-summaries.py` → `/tmp/receipts/monorepo-session-summaries.md` (182 sessions; kept in /tmp, never committed).

> **Privacy:** decrypted session content stays in `/tmp` (uncommitted). Only curated,
> article-appropriate receipts/quotes land in this repo's `research/`.

## Coverage gaps
- **2024-10-11 → 2026-02-18:** git-only (no session transcripts survive — neither local nor archived).
- The earliest *root* `.claude/CLAUDE.md` is 2026-02-02; before that the process lived in `modules/audio-control/.claude/CLAUDE.md` (from 2025-09-24).
