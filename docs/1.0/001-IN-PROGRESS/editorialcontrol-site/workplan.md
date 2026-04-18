# Workplan: editorialcontrol-site

**Feature slug:** `editorialcontrol-site`
**Branch:** `feature/editorialcontrol-site`
**Milestone:** editorialcontrol.org launch
**GitHub Issue:** oletizi/audiocontrol.org#69

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#69 |
| Phase 1: Multi-site source layout + build split | oletizi/audiocontrol.org#70 |
| Phase 2: Multi-site editorial calendar library | oletizi/audiocontrol.org#71 |
| Phase 3: editorialcontrol branding + core pages | oletizi/audiocontrol.org#72 |
| Phase 4: Content migration | oletizi/audiocontrol.org#73 |
| Phase 5: Reddit / distribution | oletizi/audiocontrol.org#74 |
| Phase 6: Launch | oletizi/audiocontrol.org#75 |

## Files Affected

**Build system / repo layout:**
- `astro.config.mjs` → `astro.audiocontrol.config.mjs` + `astro.editorialcontrol.config.mjs`
- `src/pages/` → `src/sites/audiocontrol/pages/` + `src/sites/editorialcontrol/pages/`
- `netlify.toml` — updated
- `package.json` — per-site build/dev scripts

**Editorial calendar library:**
- `scripts/lib/editorial/calendar.ts` — `calendarPath(rootDir, site)` and friends
- `scripts/lib/editorial/channels.ts` — `channelsPath(rootDir, site)` and friends
- `docs/editorial-calendar-audiocontrol.md` (rename from `docs/editorial-calendar.md`)
- `docs/editorial-calendar-editorialcontrol.md` (new)
- `docs/editorial-channels-audiocontrol.json` (rename from `docs/editorial-channels.json`)
- `docs/editorial-channels-editorialcontrol.json` (new)
- `.claude/skills/editorial-*/SKILL.md` — `--site` parameter

**Reddit config:**
- `~/.config/audiocontrol/reddit.json` — site-keyed structure
- `scripts/lib/reddit/config.ts` — `loadConfig(site)`

**Branding:**
- `src/sites/audiocontrol/brand.ts` (new)
- `src/sites/editorialcontrol/brand.ts` (new)
- `src/layouts/BaseLayout.astro` — accepts brand config

**Content migration:**
- Two blog post dirs moved under `src/sites/editorialcontrol/pages/blog/`
- Calendar entries migrated
- Blog index updated for both sites

## Implementation Phases

### Phase 1: Multi-site source layout + build split

**Deliverable:** The repo builds both sites from two Astro configs. audiocontrol.org deploys identically to today; editorialcontrol.org stub builds to a working placeholder page served on Netlify.

- [x] Create `src/sites/audiocontrol/` subtree (also moved `layouts/`, `components/`, `styles/` under it so relative imports keep working; Phase 3 can extract shared layouts back to `src/layouts/` when the second site needs them)
- [x] Move `src/pages/` → `src/sites/audiocontrol/pages/`
- [x] Create `src/sites/editorialcontrol/pages/` with an index placeholder page
- [x] Split `astro.config.mjs` into `astro.audiocontrol.config.mjs` and `astro.editorialcontrol.config.mjs` with distinct `site`, `srcDir`, `outDir`, and sitemap config
- [x] Update `package.json` scripts: `build:audiocontrol`, `build:editorialcontrol`, `build` (runs both); same for `dev` and `preview`
- [x] Update `netlify.toml` (audiocontrol Netlify site: `build:audiocontrol`, publish `dist/audiocontrol`); editorialcontrol Netlify site config set in UI at launch time
- [x] Verify audiocontrol.org builds identically — normalized diff shows only Astro's auto-generated `data-astro-cid-*` hashes changed (derived from source paths); CSS content and HTML structure are byte-identical after normalization
- [x] Verify editorialcontrol.org builds to a functional HTML placeholder (index.html + favicons + sitemap emitted to `dist/editorialcontrol`)
- [ ] Second Netlify site connected to same repo, custom domain pending (deferred to Phase 6 / Launch)

**Acceptance Criteria:**
- `npm run build:audiocontrol` produces output equivalent to today's `npm run build`
- `npm run build:editorialcontrol` produces a deployable placeholder site
- Both Netlify sites auto-deploy from main (or the launch branch)
- Existing integration tests still pass

### Phase 2: Multi-site editorial calendar library

**Deliverable:** Editorial calendar library accepts a `site` parameter. Skills accept `--site`. Both sites' calendars and channels configs live at their site-keyed paths.

- [x] Update `scripts/lib/editorial/calendar.ts` — `calendarPath(rootDir, site)` and all callers
- [x] Update `scripts/lib/editorial/channels.ts` — `channelsPath(rootDir, site)` and loaders
- [x] Update `scripts/lib/editorial/scaffold.ts` — per-site blog dir `src/sites/<site>/pages/blog`
- [x] Update `scripts/lib/editorial/crosslinks.ts` — `auditCrossLinks` takes `site`; `extractSiteLinksFromText/Markdown` and `slugFromBlogUrl` take `host` (`extractAudioControlLinks*` renamed to `extractSiteLinks*`)
- [x] Update `scripts/lib/editorial/suggest.ts` — `getContentSuggestions(site, ...)` strips the correct host from analytics page URLs
- [x] Add `Site` type, `SITES`, `DEFAULT_SITE`, `isSite`, `assertSite`, `siteHost`, `siteBaseUrl` to `types.ts` and re-export via the barrel
- [x] Rename `docs/editorial-calendar.md` → `docs/editorial-calendar-audiocontrol.md` and update references
- [x] Rename `docs/editorial-channels.json` → `docs/editorial-channels-audiocontrol.json` and update references
- [x] Create empty `docs/editorial-calendar-editorialcontrol.md` (with stage headings)
- [x] Create `docs/editorial-channels-editorialcontrol.json` with a curated subreddit list for content-marketing, automation-workflow, claude, ai-agents, agent-as-workflow, programming
- [x] Update all 13 `/editorial-*` skills to accept `--site <slug>`; default to `audiocontrol` when omitted; unknown sites error with the list of valid sites (helper: `assertSite` in `scripts/lib/editorial/types.ts`)
- [x] Update existing unit tests for the renamed crosslinks API; added `test/editorial/sites.test.ts` covering `SITES`, `DEFAULT_SITE`, `assertSite` defaults+error, per-site `calendarPath`/`channelsPath`, and `siteHost`/`siteBaseUrl`
- [x] Update CONTENT-CALENDAR.md to document the `--site` convention (including the `audiocontrol` default) and the per-site data file layout

**Acceptance Criteria:**
- All existing editorial-calendar tests pass with the new site parameter
- A new test covers resolving calendar paths per site
- Running a skill without `--site` uses `audiocontrol`; passing an unknown `--site` errors with the list of valid sites
- Both sites' calendars round-trip cleanly

### Phase 3: editorialcontrol.org branding and core pages

**Deliverable:** editorialcontrol.org has a brand-aligned visual identity distinct from audiocontrol.org, and the core pages render cleanly: home, about, blog index (empty), contact.

- [ ] Design: pick an accent palette that differentiates editorialcontrol.org while maintaining the family look
- [ ] Create `src/sites/editorialcontrol/brand.ts` with color tokens, logo variant, typography overrides
- [ ] Extract audiocontrol's current palette into `src/sites/audiocontrol/brand.ts` for symmetry
- [ ] Refactor base layout to accept a brand config; site-specific layout variants wrap it
- [ ] Create editorialcontrol home page describing the site's scope and value proposition
- [ ] Create editorialcontrol about page
- [ ] Create editorialcontrol blog index page (empty state)
- [ ] Create editorialcontrol contact page with mailto CTA
- [ ] Verify audiocontrol.org visual output is byte-identical after the brand extraction

**Acceptance Criteria:**
- editorialcontrol.org renders with distinct branding across all core pages
- Home / about / blog index / contact all render cleanly at their expected paths
- audiocontrol.org visual design is unchanged
- Lighthouse or similar accessibility/perf scores within 5 points of the pre-split audiocontrol baseline

### Phase 4: Content migration

**Deliverable:** Two posts live on editorialcontrol.org with their editorial calendar entries ported and tracking issues retitled.

- [ ] Move `building-the-editorial-calendar-feature` to `src/sites/editorialcontrol/pages/blog/<slug>/` and migrate its calendar entry
- [ ] Retitle tracking issue #68 to reference editorialcontrol.org
- [ ] Revert audiocontrol's calendar entry for `building-the-editorial-calendar-feature` (remove)
- [ ] Move `feature-image-automation-feature` to `src/sites/editorialcontrol/pages/blog/<slug>/`; reframe with the current agent-as-workflow thesis
- [ ] Remove `feature-image-automation-feature` from audiocontrol's calendar and blog index
- [ ] Generate feature images for both posts via the existing feature-image pipeline (targeting editorialcontrol now)
- [ ] Add both to editorialcontrol's blog index

**Acceptance Criteria:**
- Both posts render correctly on editorialcontrol.org
- Both calendar entries are in Published stage on editorialcontrol's calendar
- audiocontrol.org no longer references either post in its calendar, blog index, or pages
- Feature images generated and applied to both posts
- `/editorial-cross-link-review --site=editorialcontrol` reports no unreciprocated links

### Phase 5: Reddit / distribution setup

**Deliverable:** editorialcontrol.org has its own Reddit sync working end-to-end. Distribution records flow into its calendar.

- [ ] Decide on a brand-aligned Reddit username and register the account
- [ ] Update `scripts/lib/reddit/config.ts` to support site-keyed credential lookup
- [ ] Update `reddit.json` schema (site-keyed structure)
- [ ] Update `/editorial-reddit-sync` and `/editorial-reddit-opportunities` to resolve the right username per site
- [ ] Seed the editorialcontrol Reddit account with at least one promotional share (to have data for first sync)
- [ ] Run `/editorial-reddit-sync --site=editorialcontrol` and confirm attribution
- [ ] Finalize the subreddit list in `editorial-channels-editorialcontrol.json`

**Acceptance Criteria:**
- `/editorial-reddit-sync --site=editorialcontrol` runs clean and attributes at least one submission
- `/editorial-reddit-opportunities --site=editorialcontrol <slug>` reports candidates from the curated list
- audiocontrol's Reddit sync continues to work unchanged

### Phase 6: Launch

**Deliverable:** editorialcontrol.org is live with HTTPS, DNS pointing to Netlify, sitemap submitted, and the debut posts indexed.

- [ ] Point editorialcontrol.org DNS at Netlify (CNAME / A records)
- [ ] Enable HTTPS via Netlify (auto-provisioned cert)
- [ ] Verify `https://editorialcontrol.org/` resolves and serves the live site
- [ ] Create and submit sitemap to Google Search Console
- [ ] Create a separate GA4 property (or Umami site) for editorialcontrol.org — minimal: tracking ID in place
- [ ] Announce launch: run `/editorial-distribute --site=editorialcontrol` for each debut post against its best-fit subreddits

**Acceptance Criteria:**
- `https://editorialcontrol.org` resolves with a valid certificate
- Sitemap submitted and processing in Search Console
- At least one distribution record per debut post recorded in the calendar

## Verification Checklist

- [ ] Both sites build cleanly via their respective `npm run build:*` commands
- [ ] All existing editorial-calendar tests pass with the new `--site` parameter
- [ ] audiocontrol.org visual output is unchanged (verified by eye + diffed dist output)
- [ ] Both debut posts render correctly on editorialcontrol.org
- [ ] Reddit sync works on both sites independently
- [ ] No secrets committed (`reddit.json` stays outside the repo at `~/.config/audiocontrol/`)
- [ ] Documentation in CONTENT-CALENDAR.md reflects the multi-site workflow
