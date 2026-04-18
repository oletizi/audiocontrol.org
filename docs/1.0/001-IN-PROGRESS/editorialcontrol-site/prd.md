# PRD: editorialcontrol-site

## Problem Statement

audiocontrol.org's content scope is audio / vintage-hardware / sampler content. Process-oriented and content-marketing material — drafts like "Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement." and "Automating Around a Design Skills Gap" — dilutes that brand and wrong-foots readers who came for Roland S-series deep-dives.

editorialcontrol.org (domain registered) is the sibling site where the content-marketing / agent-as-workflow thesis lives. It needs its own branding, its own Reddit presence, its own editorial calendar — but should share infrastructure with audiocontrol.org so both sites benefit from every improvement to the editorial-calendar tooling, feature-image pipeline, and related skill families. One repo, two sites.

## Goals

- Stand up editorialcontrol.org as a production site with a distinct brand and its own editorial surface
- Share all infrastructure code (editorial calendar, feature image pipeline, analytics, cross-link audit) between the two sites
- Migrate content that doesn't belong on audiocontrol.org over to editorialcontrol.org without losing history or breaking links
- Preserve audiocontrol.org's current visual and functional state — zero visible regression

## Acceptance Criteria

- editorialcontrol.org is live on Netlify with HTTPS and the registered custom domain
- Two posts are published on editorialcontrol.org at launch:
  - "Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement." (migrated from audiocontrol.org's Drafting stage)
  - "Automating Around a Design Skills Gap" (migrated and reframed with the current agent-as-workflow thesis)
- audiocontrol.org continues to build and deploy identically to its pre-split state — zero visible regression
- Shared components and library code live in one place; site-specific content and brand are cleanly partitioned
- Each site has its own editorial calendar (`docs/editorial-calendar-<site>.md`), channels config (`docs/editorial-channels-<site>.json`), blog index, and brand variant
- Editorial-calendar skills accept a `--site` parameter (or honor an equivalent selector) and operate on the right calendar
- editorialcontrol.org has its own Reddit account configured under a brand-aligned username, and `/editorial-reddit-sync --site=editorialcontrol` works end-to-end
- Branding: same typography and layout bones as audiocontrol.org, distinct accent palette

## Out of Scope

- Newsletter / email integration
- Auth / paid tiers / member-only content
- Any CRM integration for "contact me" CTAs
- Custom Claude Code skills specific to editorialcontrol.org (the existing `/editorial-*` family covers launch)
- Migrating GA4 property, Search Console property, or Umami tracking — editorialcontrol gets fresh analytics setup post-launch
- Full design system refactor of audiocontrol.org's existing palette (only the minimal extraction needed to support a brand variant)

## Technical Approach

### Files Affected

**Build system / repo layout:**
- `astro.config.mjs` → split into `astro.audiocontrol.config.mjs` + `astro.editorialcontrol.config.mjs`
- `src/pages/` → restructure into `src/sites/audiocontrol/pages/` + `src/sites/editorialcontrol/pages/`
- `src/components/` — stays as shared
- `src/layouts/` — shared base layout; site-specific variants wrap with brand config
- `netlify.toml` — updated or split per-site as Netlify requires
- `package.json` — `build:audiocontrol`, `build:editorialcontrol`, `build` (both), same for `dev`

**Editorial calendar library (per-site):**
- `scripts/lib/editorial/calendar.ts` — `calendarPath(rootDir, site)`, `readCalendar(rootDir, site)`, `writeCalendar(rootDir, site, calendar)`
- `scripts/lib/editorial/channels.ts` — `channelsPath(rootDir, site)`, `readChannels(rootDir, site)`
- `docs/editorial-calendar.md` → `docs/editorial-calendar-audiocontrol.md` (rename)
- `docs/editorial-calendar-editorialcontrol.md` (new, seeded with migrated posts)
- `docs/editorial-channels.json` → `docs/editorial-channels-audiocontrol.json` (rename)
- `docs/editorial-channels-editorialcontrol.json` (new, curated subreddit targets: content-marketing, automation-workflow, claude, SaaS, IndieHackers, etc.)
- `.claude/skills/editorial-*/SKILL.md` — updated to accept `--site` arg; error if ambiguous

**Reddit config (multi-account):**
- `~/.config/audiocontrol/reddit.json` — extend to site-keyed structure
- `scripts/lib/reddit/config.ts` — `loadConfig(site)`

**Content migration:**
- `src/pages/blog/building-the-editorial-calendar-feature/` → `src/sites/editorialcontrol/pages/blog/<slug>/`
- `src/pages/blog/feature-image-automation-feature/` → `src/sites/editorialcontrol/pages/blog/<slug>/` (reframed)
- Calendar entries moved between calendars
- `src/pages/blog/index.astro` (audiocontrol) — remove both entries; `src/sites/editorialcontrol/pages/blog/index.astro` (new) — added

**Branding:**
- `src/sites/audiocontrol/brand.ts` + `src/sites/editorialcontrol/brand.ts` — color tokens, logo variant, typography overrides
- Shared base layout accepts brand config; site wrappers pass theirs in

### Strategy

Six phases, each shippable independently:

1. **Source layout + build split** — get two sites building from one repo with zero regression on audiocontrol.org. This is the biggest refactor; everything downstream depends on it.
2. **Editorial calendar library parameterization** — thread a `site` parameter through `calendarPath`, `channelsPath`, and the skill-layer. Keeps existing tests green by treating `audiocontrol` as the default.
3. **editorialcontrol.org branding + core pages** — extract color tokens into a brand config, build editorialcontrol's home/about/blog-index/contact. Branding stays close to audiocontrol; one accent-palette shift.
4. **Content migration** — move both posts, reframe feature-image post with the current agent-as-workflow thesis, generate feature images, update both calendars.
5. **Reddit / distribution** — register the new brand-aligned Reddit account, extend config for multi-account, validate sync end-to-end.
6. **Launch** — DNS + HTTPS + sitemap + debut distribution.

### Dependencies

- **editorialcontrol.org domain** — registered ✓
- **Netlify workspace** — assumed capable of hosting a second site from the same repo (needs confirmation)
- **New Reddit account** — to be registered under a brand-aligned username (TBD)
- **Existing editorial-calendar feature** — complete on main (Phases 1-7 shipped)
- **Existing feature-image-generator feature** — complete on main (Phase 6 shipped; Phase 11 scoped but not built)
- **Existing analytics infrastructure** — stays audiocontrol-specific for now; editorialcontrol gets its own post-launch

## Open Questions

- **Brand-aligned Reddit username** — needs a suggestion-and-select round
- **Accent palette for editorialcontrol.org** — audiocontrol leans coral/teal; editorialcontrol could shift to something greener or warmer-gray to signal editorial/print rather than audio/gear
- **DEVELOPMENT-NOTES.md and ROADMAP.md** — keep as repo-wide docs, or split per-site? (default: repo-wide)
- **Shared blog cards or site-specific?** — default: shared component, brand config provides accent colors
- **Default site for skills invoked without `--site`** — error out (explicit), or default to one of the two? (proposed: error with a clear message listing valid sites)

## References

- Parent GitHub issue: oletizi/audiocontrol.org#69
- Definition file (transient): `/tmp/feature-definition-editorialcontrol-site.md`
- Feature branch: `feature/editorialcontrol-site`
- Based on: `feature/editorial-calendar` at `9e125d0` (includes the unmerged draft that gets migrated in Phase 4)
