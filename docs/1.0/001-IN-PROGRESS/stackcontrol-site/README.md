---
slug: stackcontrol-site
targetVersion: "1.0"
date: 2026-06-02
branch: feature/stackcontrol-site
parentIssue: 
---

# Feature: stackcontrol.org — site foundation + design pass

Stands up `stackcontrol.org` — a third sibling site (hybrid product + devlog for the deskwork
lifecycle plugin) with its own identity in the "control" family. Runs a `/frontend-design` design
pass to establish that identity, builds four representative surfaces (identity, homepage, blog
index, blog post), and provisions the site live on Netlify + the stackcontrol.org domain. It's the
second real-world pilot of the design-decisions protocol. It matters because the deskwork plugin
has no public home and we want its look established under the discipline before building it out.

## Status

| Phase | Description | Status |
|---|---|---|
| 0 | Recon (dependency + domain + constraints brief) | Complete |
| 1 | Scaffold site infra | Complete |
| 2 | Design pass (identity) | Complete — direction A (Telemetry/cyan) chosen |
| 3 | Build the four surfaces | Complete |
| 4 | Discipline (archive entries + DESIGN-SYSTEM) | Complete |
| 5 | Provision + deploy | Not started |
| 6 | Verify | Not started |

## Key Links

- Branch: `feature/stackcontrol-site` — **stacked on `feature/design-system-foundation`** (re-sync with `git merge feature/design-system-foundation`)
- PRD: `prd.md`
- Workplan: `workplan.md`
- Parent Issue: 
