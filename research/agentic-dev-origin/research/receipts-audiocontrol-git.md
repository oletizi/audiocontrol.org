# Receipts: audiocontrol.org git history

Evidence gathered for the devlog "the lifecycle and why agents need one." All
SHAs, dates, and subjects are quoted verbatim from `git log` on
`/Users/orion/work/audiocontrol.org` (read-only). Author throughout: Orion
Letizi. Repo span: **2026-01-24 .. 2026-05-30**, 462 commits on `HEAD`.

> Method note: dates are committer dates (`%cs`). Subjects are exact (`%s`).
> Where a commit body is quoted, it is excerpted from `git show --no-patch`.

---

## Timeline at a glance

| Date | SHA | What | Why it matters to the arc |
|------|-----|------|---------------------------|
| 2026-01-24 | `8cc5dde` | "Nice new website." | True repo start. Act 1 begins: the hub site. |
| 2026-01-24 | `e425650` | Pixel-art logo, layout, **S330 screenshot**, favicon | The S-330 editor already exists elsewhere; this repo only screenshots/links it. |
| 2026-01-25 | `baeb710` | Add Claude AI agent guidelines (CLAUDE.md, 154 lines) | First agent-discipline doc. "No hardcoded secrets," strict TS, semantic HTML. |
| 2026-01-25 | `71bbb49` | Add Roland JV-1080 editor placeholder | Second editor named — as a placeholder, not built here. |
| 2026-01-26 | `9567ec3` | initial documentation for the S-330 web editor | Editor docs land; editor itself is upstream. |
| 2026-02-04 | `ad4b8da` | Move s330 editor URL to `/roland/s330/editor` | The proxy URL convention forms. |
| 2026-02-04 | `c719217` | Add project management standards + rewrite CLAUDE.md | First `PROJECT-MANAGEMENT.md`; explicitly "same core principles" as "the main audiocontrol monorepo." |
| 2026-02-10 | `ad8db1e` | Add palette-redesign feature documentation | **First `prd.md` + `workplan.md` + README status** in this repo. |
| 2026-03-27 | `a887532` | add S-550 editor proxy and homepage entry | Second editor shipped (as a proxy). |
| 2026-04-07 | `759c465` | blog: reverse-engineering the Akai S3000XL MIDI-over-SCSI protocol | Akai enters the story (content, not editor). |
| 2026-04-15 | `d581a62` | **port project management and agent infrastructure from audiocontrol** | **Act 2 prelude.** Mature lifecycle is ported IN; first `DEVELOPMENT-NOTES.md`, status dirs, skills, agents. |
| 2026-04-15 | `8f0218e` | add feature documentation for editorial-calendar | First feature built under the ported lifecycle. |
| 2026-04-27 | `5d62c68` | **deskwork: install plugin** + bind 12 posts | **Act 2 hinge.** In-house pipeline now productized as the `deskwork` plugin and installed side-by-side. |
| 2026-04-28 | `4c4d9b8` | extend feature with Phase 20 — deskwork migration + mothball plan | The extraction is named: "productized as the deskwork plugin and packaged for distribution outside this repo." |
| 2026-05-29 | `0a465cd` | mark in-house pipeline deskwork-replaced | The home-grown pipeline is mothballed in favor of the extracted plugin. |
| 2026-05-30 | `c9d56b8` | **chore: bootstrap dw-lifecycle config and journal template** | `dw-lifecycle` adopted back into the repo: `.dw-lifecycle/config.json`. |

---

## 1. Origin / earliest commits

The repo's true start is **2026-01-24**. The first ~15 commits build a static
Astro hub site — scaffolding, branding, SEO, and *documentation/screenshots of
editors that already exist elsewhere*. No editor source is built here.

- `8cc5dde` 2026-01-24 — "Nice new website." — the genesis commit.
- `e425650` 2026-01-24 — "* Pixel art logo. * Layout with site-wide header and footer * S330 screenshot * favicon" — the S-330 appears only as a *screenshot*; the editor itself predates and lives outside this repo.
- `39a5f4d` 2026-01-24 — "Add SEO improvements and Google Analytics"
- `c7d7c18` 2026-01-24 — "Add /s330 to sitemap and fix trailing slash proxy" — first sign the editor is a *proxied* external app.
- `f5f1571` 2026-01-24 — "Add YouTube channel link and logo"
- `baeb710` 2026-01-25 — "Add Claude AI agent guidelines" — first `CLAUDE.md` (see §2).
- `71bbb49` 2026-01-25 — "Add Roland JV-1080 editor placeholder" — a *placeholder*; the JV-1080 editor is not built in this repo.
- `d16b2bb` 2026-01-26 — "Add documentation section with Roland S-330 article"
- `6f1fe2c` 2026-01-26 — "Add screenshots to S-330 documentation"
- `59d40c0` 2026-01-26 — "Add site navigation with Docs and Editors dropdown menus"
- `3d210b4` 2026-01-26 — "Add S-330 feature image to documentation article"
- `851c721` 2026-01-26 — "Move S-330 article to blog, add Blog layout and navigation"
- `9567ec3` 2026-01-26 — "* initial documentation for the S-330 web editor"
- `b17c1fe` 2026-01-27 — "* screenshots for S-330 documentation"
- `62d75f2` 2026-01-27 — "* TOC left-nav * More S-330 docs"

**Editors predate this repo.** This hub-site repo never contains editor source —
only screenshots (`e425650`), docs (`9567ec3`), placeholders (`71bbb49`), and
later *proxy redirects* to dedicated Netlify apps (`ad4b8da`: `/roland/s330/editor`;
`a887532`/`68873ba`: `roland-sxx0-editor.netlify.app`). So the Roland S-330/S-550,
JV-1080, Akai, etc. all have history in **separate editor repos** older than or
parallel to this one. See "gaps / open questions."

---

## 2. The process forming

The discipline doc comes first; the full feature-doc machinery is *ported in*
later from the upstream monorepo rather than invented here.

- **First agent guidelines (`CLAUDE.md`):** `baeb710` 2026-01-25 — "Add Claude AI agent guidelines" — body: "Document project structure, conventions, and requirements for AI agents working on the codebase." 154-line file.
- **First PM standards (`PROJECT-MANAGEMENT.md`):** `c719217` 2026-02-04 — "Add project management standards and update CLAUDE.md." The file itself names the lineage: *"It has a smaller scope than the main audiocontrol monorepo, but follows the same core project management principles."* — i.e. the process already existed upstream.
- **First `prd.md` + `workplan.md` + feature README:** `ad8db1e` 2026-02-10 — "Add palette-redesign feature documentation" — "PRD with design system reference and scope / Workplan with implementation phases and GitHub issue links / README with status tracking / Implementation summary template." Path at the time: `docs/1.0/palette-redesign/` (flat, no status dir yet).
- **First `DEVELOPMENT-NOTES.md` (development journal):** `d581a62` 2026-04-15 — "port project management and agent infrastructure from audiocontrol." This single commit creates the journal AND the rest of the lifecycle scaffolding.
- **First `docs/<version>/<status>/<slug>/` convention:** also `d581a62` 2026-04-15 — the commit migrates `docs/1.0/palette-redesign/` → `docs/1.0/003-COMPLETE/palette-redesign/` and `seo-roland-s-series` → `docs/1.0/001-IN-PROGRESS/`. Before this, feature docs were flat under `docs/1.0/`.
- **Session-start / session-end rituals:** also `d581a62` 2026-04-15 — adds `.claude/skills/session-start/` and `.claude/skills/session-end/` (plus Codex mirrors in `.agents/skills/`). First *use* of the ritual in a commit subject: `0bc5770` 2026-04-15 "docs: session end — define and track three content automation features."
- **"lifecycle" as a named concept:** `d581a62`'s body — "Add ROADMAP.md, DEVELOPMENT-NOTES.md, **feature lifecycle** to PROJECT-MANAGEMENT.md" — and it adds 13 "feature lifecycle skills."

### The `d581a62` port (the pivotal Act-1→Act-2 commit)

`d581a62` 2026-04-15 — "port project management and agent infrastructure from
audiocontrol." Body (verbatim):

> - Add .claude/ with CLAUDE.md (session lifecycle, delegation, conventions), project.yaml, 14 skills, 7 agent profiles, 3 rules, 1 workflow
> - Add .agents/ Codex compatibility mirror (5 simplified skills)
> - Migrate feature docs into status directories (001-IN-PROGRESS, 003-COMPLETE)
> - Add ROADMAP.md, DEVELOPMENT-NOTES.md, feature lifecycle to PROJECT-MANAGEMENT.md
> - Move root CLAUDE.md content into .claude/CLAUDE.md
> - Add blog post draft: **"What 2,400 Sessions Taught Us About AI Agent Workflow"**

The first journal entry (written in this same commit) is self-describing:

> ## 2026-04-15: Infrastructure Port — Project Management & Agent Process
> **Goal:** Port project management infrastructure (feature lifecycle skills,
> agent profiles, status-organized docs, session journal) from the audiocontrol
> monorepo to audiocontrol.org.
> **Insights:** The feature lifecycle is project-agnostic enough to port with
> mostly mechanical substitutions / Hardware-specific infrastructure was cleanly
> separable.

This is the receipt that the *process* was invented in the upstream audiocontrol
monorepo (the "2,400 sessions" of editor-building), then lifted into this repo as
project-agnostic infrastructure.

---

## 3. Discipline conventions

The core disciplines arrive with the very first `CLAUDE.md` (`baeb710`) and the
ported `.claude/` infrastructure (`d581a62`).

- **No hardcoded secrets:** `baeb710` 2026-01-25, CLAUDE.md line 28: "**NEVER hardcode secrets** (API keys, tokens, passwords) in code or config files"; line 147: "**NEVER commit `.env` files**."
- **TypeScript strict / semantic HTML:** `baeb710` — CLAUDE.md line 43 "TypeScript strict mode is enabled," line 46 "Use semantic HTML for accessibility and SEO."
- **Commit-at-task-boundaries, define-before-code, agent-delegation rules:** ported in `d581a62` 2026-04-15 via `.claude/skills/feature-implement/`, `feature-define/`, the agent roster (`.claude/agents/*.md`), and `.claude/rules/` (`testing.md`, `workflow-playbooks.md`, `session-analytics.md`).
- **"No fallbacks / mock data" rule:** not introduced by its own commit in this repo's *history of subjects*; it lives in the ported `.claude/CLAUDE.md` / global instructions (the rule "Never implement fallbacks or use mock data outside test code. Throw errors instead."). Treat as inherited-with-the-port (`d581a62`), not a standalone commit.
- **Session-analytics / correction-tagging discipline:** `d581a62` adds `.claude/rules/session-analytics.md` (the `[PROCESS]/[UX]/[COMPLEXITY]/[FABRICATION]` correction taxonomy used in journal entries).

> Note on review discipline: the explicit "three-track audit / audit-barrage"
> review protocol does **not** appear as a discipline commit in *this* repo. It
> is the value that emerges later, in the extracted plugin (`dw-lifecycle`
> ships `audit-barrage`). In audiocontrol.org the closest in-repo analog is the
> code-review agent profile (`d581a62`) and routine "code-review fixups" /
> "pre-ship review" commits (e.g. `79390fe`, `18d847a`, `b306028`).

---

## 4. The extraction moment (Act 2 hinge)

The in-house **editorial-calendar** pipeline (built under the ported lifecycle,
starting `8f0218e` 2026-04-15) is itself generalized into a distributable plugin
called **deskwork**, which is then adopted back. Later the lifecycle scaffolding
is re-bootstrapped as **dw-lifecycle**.

- `5d62c68` 2026-04-27 — "**deskwork: install plugin** + bind 12 published posts to calendar via frontmatter id." Body: "Installs the deskwork + deskwork-studio plugins **alongside (not replacing)** the in-house editorial pipeline... `.claude/settings.json` records the two plugins as project-enabled (`deskwork@deskwork`, `deskwork-studio@deskwork`)." First side-by-side adoption.
- `866a756` 2026-04-28 — "docs: session end — ... **deskwork plugin adopted** + Phase 20 plan." Body: "**Deskwork plugin adopted side-by-side with the in-house pipeline.** Schemas patched, 12 published posts bound via deskwork.id, one shortform piece driven end-to-end, in-house mirror cancelled to avoid dual-tracking. **7 upstream issues filed (deskwork#41–46, #49).** Mothball plan tracked at #126."
- `4c4d9b8` 2026-04-28 — "docs: extend feature with Phase 20 — deskwork migration + mothball plan." Body (the explicit extraction statement): "**The in-house editorial pipeline has been productized as the deskwork plugin and packaged for distribution outside this repo.**" Phase 20a "adopt deskwork side-by-side," 20b "close the platform-coverage gap... new home," 20c "decommission the in-house pipeline" (delete 23 in-house `editorial-*` skills + dev surfaces + libs).
- `3851cbd` 2026-04-28 — "deskwork: drive socratic-prompt-engineering / linkedin shortform through deskwork pipeline; cancel in-house mirror" — first content driven *only* through the extracted plugin.
- `1d7b267` 2026-05-06 — "content: scaffold midi-to-mcu-macro-bridge + dogfooding-deskwork via deskwork" — note the idea slug "dogfooding-deskwork."
- `b0c5a50` 2026-05-06 — "migrate: legacy calendar.md tables → per-entry sidecars (deskwork v0.16.0)" — the plugin now versions independently.

### The mothball (in-house pipeline retired in favor of the extracted plugin)

- `9572da5` 2026-05-29 — "docs: design spec for mothballing the in-house editorial pipeline"
- `505e88f` 2026-05-29 — "deskwork: ingest + approve mothball spec (Drafting -> Final)" — the plugin reviews its own predecessor's retirement.
- `ec9f866` 2026-05-29 — "refactor: delete in-house editorial **lifecycle** skills (deskwork covers them)"
- `b5602a5` 2026-05-29 — "refactor: delete in-house editorial review/studio/scrapbook dev surfaces"
- `ddb2e27` 2026-05-29 — "refactor: delete pipeline-only editorial libs; trim editorial barrel"
- `61972bb` 2026-05-29 — "docs: repoint platform-* survivor skills at deskwork after mothball"
- `0a465cd` 2026-05-29 — "docs(editorial-calendar): mark in-house pipeline **deskwork-replaced**"
- `41c116a` 2026-05-29 — "docs: session-end 2026-05-29 [editorial-calendar mothball]"

### dw-lifecycle adopted back

- `c9d56b8` 2026-05-30 — "**chore: bootstrap dw-lifecycle config and journal template**." Adds `.dw-lifecycle/config.json` (46 lines) and `.dw-lifecycle/templates/journal-entry.md`. This is the lifecycle scaffolding (the §2 process) re-entering the repo as a *named, packaged plugin* — the audiocontrol-side end of the dw-lifecycle story.

---

## 5. Editor milestones (grounding the "building the editors" origin)

This repo is the *hub*, so editor milestones here are screenshots, docs, proxy
wiring, and content — not editor source. The timeline still grounds when each
editor entered the public story:

| Date | SHA | Editor milestone (in this repo) |
|------|-----|----------------------------------|
| 2026-01-24 | `e425650` | Roland **S-330** screenshot on the new site. |
| 2026-01-24 | `c7d7c18` | S-330 added to sitemap; trailing-slash proxy fixed (editor is a proxied external app). |
| 2026-01-25 | `71bbb49` | Roland **JV-1080** editor *placeholder*. |
| 2026-01-26 | `9567ec3` | Initial S-330 web-editor documentation. |
| 2026-02-04 | `ad4b8da` | S-330 editor URL moved to `/roland/s330/editor` (proxy URL convention). |
| 2026-02-04 | `d19ec02` | SEO content for the Roland S-series sampler ecosystem. |
| 2026-02-08 | `a4f7bc8` | "February 2026 S-330 Editor update" blog post. |
| 2026-02-10 | `e28097d` | Editors index page. |
| 2026-02-10 | `54119c4` | S-330 editor docs updated for the February 2026 release. |
| 2026-03-27 | `a887532` | Roland **S-550** editor proxy + homepage entry. |
| 2026-03-28 | `68873ba` / `990f58b` | S-330/S-550 proxies repointed to `roland-sxx0-editor.netlify.app` (shared editor app). |
| 2026-03-28 | `b8cba9e` | Integration + e2e tests for the editor proxy. |
| 2026-04-07 | `759c465` | Blog: reverse-engineering the **Akai S3000XL** MIDI-over-SCSI protocol (Akai enters via content). |
| 2026-04-17 | `00dd9bd` | "tool" becomes a third content type; **S-330 editor registered** in the editorial calendar. |

Editors with concrete in-repo evidence: **Roland S-330** (most developed),
**Roland S-550** (proxy, shares the `roland-sxx0-editor` app), **Roland JV-1080**
(placeholder only), **Akai S3000XL** (blog/protocol content, no editor proxy seen
in this repo's history). No D-110, Akai S5000/ESI-32 editor commits surfaced here.

---

## Gaps / open questions

1. **Editor source predates and lives outside this repo.** The hub repo only ever
   holds screenshots, docs, placeholders, and *proxy redirects* to dedicated
   Netlify apps (`roland-sxx0-editor.netlify.app`, `s330.netlify.app`). The
   actual "building the editors with agentic coding" (Act 1) happened in
   **separate editor repos** not examined here. To date the S-330/S-550/JV-1080
   editor builds, the article needs receipts from those repos (or the upstream
   `audiocontrol` monorepo), not this one.
2. **The "2,400 sessions" figure** comes from the upstream monorepo (blog-draft
   title in `d581a62`), not measurable in this repo. Per the project's own
   guidance against false precision, verify that number against the monorepo's
   session archive before quoting it as fact.
3. **"No fallbacks / mock data" and the review/audit-barrage discipline** are not
   standalone discipline commits in *this* repo's subject history; they were
   inherited with the `d581a62` port and matured in the extracted plugin. The
   audit-barrage's *birth* is a `dw-lifecycle`/deskwork-repo receipt, not an
   audiocontrol.org one.
4. **Where exactly the process was first invented** is asserted (by `c719217`'s
   "same core principles as the main audiocontrol monorepo" and `d581a62`'s
   port) but not *dated* here. The monorepo's own history is the primary source
   for Act 1's process-invention claim.
5. **D-110 / Akai S5000 / ESI-32 editors** referenced in the article's framing do
   not appear in this repo's history. Confirm they exist (or are planned)
   elsewhere before citing them as shipped.
