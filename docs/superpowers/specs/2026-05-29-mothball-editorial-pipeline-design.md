# Mothball the in-house editorial pipeline (deskwork cutover)

Date: 2026-05-29
Issue: [#126](https://github.com/oletizi/audiocontrol.org/issues/126)
Branch: `feature/mothball-editorial-pipeline`

## Problem

audiocontrol.org runs an in-house editorial pipeline (23 `editorial-*` skills, a
review UI under `src/sites/editorialcontrol/pages/dev/`, and backing libraries in
`scripts/lib/editorial*`). That pipeline has been superseded by the **deskwork**
plugin (`github.com/audiocontrol-org/deskwork`, installed here at v0.28.0), which
absorbs the content lifecycle — add, plan, outline, draft, iterate, approve,
publish, distribute, and the review surface (deskwork-studio).

Keeping both indefinitely is duplicative and accrues divergence cost. We want to
delete the in-house pipeline. But a subset of in-house skills covers
platform-reach features that deskwork — content-pipeline-only by design — does not
provide. Those must be preserved before the rest can be removed.

## Goal

Cut audiocontrol.org over to deskwork for the content lifecycle, while preserving
the platform-reach capabilities in a slimmer in-house surface, and delete
everything deskwork now covers. The shared calendars
(`docs/editorial-calendar-{audiocontrol,editorialcontrol}.md`) are the lifeline:
both pipelines read/write them, so the cutover never forks content state.

## Decisions (locked during brainstorming)

- **Platform-coverage skills get a thin in-repo home** (#126 "option 2"), not an
  upstream deskwork expansion and not a separate sibling plugin.
- **Survivors are renamed `platform-*`**, dropping the `editorial-` prefix so the
  boundary between "deleted (deskwork covers it)" and "kept (platform reach)" is
  self-evident.
- **Retained library code stays in `scripts/lib/editorial/`.** Only the
  pipeline-only modules are deleted; the dir is not moved (minimal import churn).
- **`rename-slug` survives in-house** (it mutates the shared calendar + content,
  and deskwork has no equivalent) AND a deskwork upstream gap issue is filed.
- **Combined A+B spec**, but PR-B (destructive deletion) executes only after PR-A
  (non-destructive carve-out) merges and the survivors are verified independent.

## Survivors vs. deletions

### Survivor skills → renamed `platform-*` (6, plus 1 pending verification)

| Current | New | Why it stays |
|---|---|---|
| `editorial-reddit-sync` | `platform-reddit-sync` | Pulls Reddit submissions via API to mark distribution coverage. Deskwork doesn't reach external platforms. |
| `editorial-reddit-opportunities` | `platform-reddit-opportunities` | Lists relevant subreddits per published post. |
| `editorial-cross-link-review` | `platform-cross-link-review` | Audits bidirectional blog↔YouTube linking. Repo-content-specific. |
| `editorial-performance` | `platform-performance` | Pulls GA4 + Search Console analytics. Site-specific. |
| `editorial-suggest` | `platform-suggest` | Analytics-driven topic suggestions. Site-specific. |
| `editorial-rename-slug` | `platform-rename-slug` | Renames a slug across the shared calendar + content. No deskwork equivalent. |
| `editorial-social-review` | `platform-social-review` *(pending)* | Cross-platform share matrix. **Verify** deskwork-studio's shortform matrix covers it; if it does, delete instead of keeping. |

### Skills deleted (deskwork covers them)

`editorial-add`, `editorial-plan`, `editorial-outline`, `editorial-outline-approve`,
`editorial-draft`, `editorial-draft-review`, `editorial-iterate`, `editorial-approve`,
`editorial-publish`, `editorial-distribute`, `editorial-shortform-draft`,
`editorial-review-cancel`, `editorial-review-help`, `editorial-review-report`,
`editorial-status`, `editorial-help`.

Parity is established in #126's audit; `editorial-outline-approve` maps to
`/deskwork:approve` (the universal forward-graduation verb, Outlining → Drafting).

### Out of scope — stays regardless

`audiocontrol-voice`, `editorialcontrol-voice` (content-quality skills),
`og-preview`, `feature-image-*` skills and `pages/dev/feature-image-*` +
`pages/dev/studio/` (separate generator), and the shared calendar markdown format.

## Library carve-out (`scripts/lib/editorial/`)

The dir mixes platform-shared and pipeline-only modules. It stays in place; only
pipeline-only modules are removed.

| Module | Fate | Notes |
|---|---|---|
| `calendar.ts` | **keep** | All survivors read the shared calendar; also the deskwork lifeline. |
| `types.ts` | **keep** | Shared by `channels`/`crosslinks`/`suggest`/`calendar`. |
| `channels.ts` | **keep** | Used by `platform-reddit-opportunities`. |
| `crosslinks.ts` | **keep** | Used by `platform-cross-link-review`. |
| `suggest.ts` | **keep** | Used by `platform-suggest`/`platform-performance`. |
| `rename-slug.ts` | **keep** | Backs `platform-rename-slug`. |
| `index.ts` | **trim** | Barrel re-exports; drop exports of deleted modules. |
| `body-state.ts` | **delete** | Drafting-body state — pipeline only. |
| `scaffold.ts` | **delete** | Post scaffolding — pipeline only. |
| `scrapbook.ts` | **delete** | Review-surface scrapbook — pipeline only (9 importers, all deleted). |
| `remark-image-figure.mjs`, `remark-strip-first-h1.mjs`, `remark-strip-outline.mjs` | **delete** | Markdown transforms for the draft/review render path. |

External libs the survivors depend on — **untouched**: `scripts/lib/reddit/`,
`scripts/lib/youtube/`, `scripts/lib/analytics/`, `scripts/lib/http/`,
`scripts/analytics-report.ts`.

Fully deleted backing library: `scripts/lib/editorial-review/` (the review-surface
TypeScript). `scripts/lib/editorial-calendar-actions` to be assessed in PR-B
(verify no survivor imports it; delete if pipeline-only).

## Dev surfaces deleted (PR-B)

Under `src/sites/editorialcontrol/`:

- `pages/dev/editorial-review/` (longform review route)
- `pages/dev/editorial-review-shortform.astro`
- `pages/dev/editorial-studio.astro`
- `pages/dev/editorial-help.astro`
- `pages/dev/scrapbook/`
- `pages/api/dev/editorial-review/` (annotate / annotations / decision / start /
  version / workflow endpoints)
- `pages/api/dev/editorial-studio/`

Under `src/shared/`:

- `editorial-review.css`, `editorial-review-client.ts`, `editorial-review-editor.ts`
- `editorial-studio.css`
- `lightbox.ts` — **only if** grep confirms it's used solely by the deleted
  surfaces; otherwise keep.

## Architecture after cutover

```
Content lifecycle  ──▶  deskwork plugin (/deskwork:*) + deskwork-studio
                         writes ──▶  docs/editorial-calendar-*.md  (SHARED)
Platform reach     ──▶  platform-* skills (in-repo)  ──reads──┘
                         scripts/lib/editorial/{calendar,types,channels,
                         crosslinks,suggest,rename-slug}
                         + scripts/lib/{reddit,youtube,analytics,http}
```

The `platform-*` skills read the same shared calendar deskwork writes. No coupling
to deskwork internals — they consume the calendar markdown, which is the stable
contract.

## Execution plan — two PRs on one branch

### PR-A — carve-out (non-destructive)

1. Rename the 6 survivor skill dirs `editorial-*` → `platform-*`; update in-SKILL
   self-references and any cross-skill references.
2. Confirm survivor imports of `scripts/lib/editorial/*` still resolve (lib
   unmoved → expected no change).
3. Verify each survivor runs green against the live shared calendar (dry-run /
   read-only invocation per skill).
4. **Verify `editorial-social-review`** against deskwork-studio's shortform matrix;
   decide keep-as-`platform-social-review` vs. delete-in-PR-B. Record the verdict.
5. File the deskwork upstream gap issue for `rename-slug`.
6. Merge PR-A. **Gate:** survivors proven independent before any deletion.

### PR-B — decommission (destructive, after PR-A merges)

1. Rebase branch on `main`.
2. Delete the 16 deletable `editorial-*` skills.
3. Delete pipeline-only lib modules + `scripts/lib/editorial-review/`; trim
   `scripts/lib/editorial/index.ts`.
4. Delete the dev review/studio/scrapbook pages, API routes, and shared
   CSS/TS surfaces (with the `lightbox.ts` usage check).
5. Update `.claude/CLAUDE.md` and any rules referencing `editorial-*` skills →
   point to deskwork equivalents and note the `platform-*` survivors.
6. Journal: leave `journal/editorial/` history on disk untouched (no further
   writes); deskwork's `.deskwork/review-journal/` is the go-forward.
7. `npm run build` green — confirm no dangling imports/routes.
8. Update `docs/1.0/001-IN-PROGRESS/editorial-calendar/` README + workplan to
   mark the in-house pipeline deskwork-replaced.

## Testing & verification

- **PR-A:** each `platform-*` skill executes its read-only path against the live
  calendar without error; `npm run build` green (no skill code is imported by the
  build, but confirms nothing regressed).
- **PR-B:** `npm run build` green with all deleted routes/components gone; `grep`
  confirms zero remaining imports of deleted modules; manual confirmation that the
  shared calendar still parses via the retained `calendar.ts`.

## Risks

- **Survivor hidden coupling.** A survivor might transitively import a
  pipeline-only module. Mitigation: PR-A step 2's import-resolution check + green
  build before any deletion.
- **`social-review` misclassification.** Deleting it when studio doesn't actually
  cover the matrix loses a feature. Mitigation: explicit verification gate in PR-A
  step 4 before it's eligible for deletion.
- **Dangling dev-route imports.** Deleted pages may be referenced by a nav/index.
  Mitigation: build is the backstop; grep for route references in PR-B.
- **`lightbox.ts` shared use.** Could be used outside the deleted surfaces.
  Mitigation: usage grep before deletion; keep if shared.

## Open questions resolved

- Survivor home: in-repo `platform-*` (option 2). ✔
- Lib location: stays in `scripts/lib/editorial/`. ✔
- `rename-slug`: kept in-house + upstream issue. ✔
- Scope: A+B, B gated on A. ✔

## Open question still pending

- `editorial-social-review` keep-vs-delete — resolved during PR-A step 4 by
  verifying deskwork-studio coverage.
