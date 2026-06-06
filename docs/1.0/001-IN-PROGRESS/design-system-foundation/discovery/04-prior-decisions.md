# Prior Design Decisions — Discovery 04

Scope: design decisions already settled in this repo (journal, feature docs, git history, `.claude` directives), mined to seed the design-system decision archive. Everything below cites a source; nothing is invented.

---

## How to read this

- **Status** is either **settled** (stable, single decision still in force) or **relitigated** (changed at least once — churn is noted).
- **Site** is `audiocontrol`, `editorialcontrol`, or `both`.
- The two sites are siblings on one codebase: "same layout bones, distinct accent palette" (editorialcontrol-site PRD line 27, 79). Decisions tagged `both` are shared infrastructure; site-specific tokens diverge by design.

---

## A. Palette & color

### A1. audiocontrol palette: warm-ink + phosphor amber + Roland-blue — RELITIGATED
- **Decision:** Background `30 12% 7%` (warm near-black, faint amber cast), foreground `35 18% 88%` (warm cream), primary `35 95% 62%` (phosphor amber, VFD/flight-instrument glow, dominant chromatic voice), accent `215 55% 55%` (Roland-blue, used sparingly).
- **Rationale:** "Warm cream off-white — reads as phosphor-on-ink, not grey-on-slate." Amber primary should "feel emergent rather than bolted on." (`src/sites/audiocontrol/brand.ts`, `design-tokens.css` header.)
- **Source:** `src/sites/audiocontrol/brand.ts`; `src/sites/audiocontrol/styles/design-tokens.css` lines 21-42; commit `c1bc552` (feat(audiocontrol): phase 1 design foundation).
- **Status:** **Relitigated — this is the SECOND palette.** The first (palette-redesign, 2026-02-10) settled coral `4 70% 62%` + teal `174 60% 46%` on a flat slate bg `220 20% 10%` (palette-redesign PRD "Design System Reference" table; implementation-summary "Design Tokens" table). audiocontrol-redesign (commit `c1bc552`, 2026-04-18) explicitly replaced it: "Phosphor amber primary 35 95% 62% … replaces teal. Roland-blue accent … replaces coral. … Warm-ink background … replaces flat slate." Churn driver: the redesign PRD called the first palette "generic dark-mode with no typographic identity … no atmospheric detail" (audiocontrol-redesign PRD line 5).
- **Site:** audiocontrol.

### A2. editorialcontrol palette: ink + signal-green chartreuse + parchment cream — SETTLED
- **Decision:** Background `215 22% 7%` (ink-near-black, cool cast), foreground `40 20% 90%` (cream-on-ink), primary `74 82% 58%` (signal-green chartreuse — editorial highlight / tracked-changes mark), accent `38 32% 82%` (parchment cream — the paper side of a publication).
- **Rationale:** Background "feels like press ink on paper"; chartreuse is "editorial attention, tracked-changes mark"; cream is "the paper accent, used for pull quotes / rules." (`src/sites/editorialcontrol/brand.ts`.)
- **Source:** `src/sites/editorialcontrol/brand.ts`; `src/sites/editorialcontrol/styles/design-tokens.css` lines 18-33.
- **Status:** **Settled**, but resolves an open question. editorialcontrol-site PRD line 96 left it open: "audiocontrol leans coral/teal; editorialcontrol could shift to something greener or warmer-gray to signal editorial/print." Resolved to greener (chartreuse). Note the original coral/teal premise was itself later overturned for audiocontrol (see A1) — so the two siblings now sit warm-amber vs cool-ink-chartreuse, not coral/teal vs green.
- **Site:** editorialcontrol.

### A3. Project-card status badges retuned to warm palette — SETTLED
- **Decision:** audiocontrol carries dedicated badge tokens: `--badge-available 152 55% 55%`, `--badge-coming 35 80% 55%`, plus background variants.
- **Source:** `src/sites/audiocontrol/styles/design-tokens.css` lines 38-42.
- **Status:** Settled. Status badges (Available / Coming Soon) date back to palette-redesign success criteria; the color values were retuned warm in the redesign.
- **Site:** audiocontrol.

---

## B. Typography

### B1. audiocontrol type stack: Departure Mono / IBM Plex Sans / JetBrains Mono — RELITIGATED
- **Decision:** Display = Departure Mono (SIL OFL pixel monospace, Apollo-era terminal lineage) for wordmark, eyebrows/panel labels, tickers, h1/h2. Body = IBM Plex Sans (self-hosted 400/500/600/700) for long-form + h3+. Mono = JetBrains Mono for code and tabular meta.
- **Rationale:** Departure Mono is "the identity voice … reserved for small structural moments." IBM Plex Sans chosen because it is "designed for technical documentation; readable at long-form sizes where a pixel face would become twee." (commit `c1bc552`; brand.ts comment.)
- **Source:** `src/sites/audiocontrol/brand.ts` lines 37-44; commit `c1bc552` (Typography section).
- **Status:** **Relitigated.** palette-redesign used JetBrains Mono for display/headings AND mono, with Inter (later) for body (palette-redesign PRD Typography section; success criterion "JetBrains Mono font for monospace elements"). The redesign PRD's first acceptance criterion was explicitly "A distinctive display typeface replaces JetBrains Mono for headings and the wordmark" (audiocontrol-redesign PRD line 17) — the diagnosis being "Display typeface: JetBrains Mono (same as code)" was a weakness (PRD audit table). Inter `@font-face` declarations were dropped as unreferenced (commit `c1bc552`).
- **Site:** audiocontrol.

### B2. editorialcontrol type stack: Fraunces / Inter / JetBrains Mono — SETTLED
- **Decision:** Display = Fraunces (serif, optical-size + italic variants "give us editorial pull-quote and wordmark treatments for free"). Body = Inter. Mono = JetBrains Mono.
- **Source:** `src/sites/editorialcontrol/brand.ts` lines 35-41; `design-tokens.css` line 40.
- **Status:** Settled. Serif display is the deliberate sibling-differentiator from audiocontrol's pixel-mono display.
- **Site:** editorialcontrol.

### B3. JetBrains Mono is the shared code/tabular face on both sites — SETTLED
- **Decision:** Both sites keep JetBrains Mono as `--font-mono` for code and tabular meta, regardless of their divergent display faces.
- **Source:** both `brand.ts` files; both `design-tokens.css` (`--font-mono` line).
- **Status:** Settled. The one typographic constant across the sibling split.
- **Site:** both.

### B4. Tabular-nums + `No. NN` numbering convention — SETTLED
- **Decision:** Every numeric display in editorial UI uses `tabular-nums`; counts render as `No. NN` or `N items`, never bare `N`.
- **Source:** scrapbook Phase 19a design brief (`docs/design/scrapbook-phase-19a-design.md`) §12 "Three hard rules" #3; used on homepage "Recent dispatches" register where "No. 01 is the latest" (DEVELOPMENT-NOTES.md, 2026-04-24 entry).
- **Status:** Settled.
- **Site:** editorialcontrol (origin); candidate to generalize.

---

## C. Logo / brand mark / favicon

### C1. audiocontrol logo: typographic wordmark; pixel-art retired from body, kept as icon — RELITIGATED
- **Decision:** Wordmark uses the display typeface (Departure Mono). Logo.astro rewritten: "retires 80s-neon pixel-art alien"; new `indicator` (pulsing amber LED) and `glyph` (5×5 amber "A" monogram) variants. Pixel art retained only as favicon/icon.
- **Rationale:** redesign PRD flagged the prior logo as "pixel art in a vacuum" — "The logo … exists in a completely different visual universe from the rest of the site" (audiocontrol-redesign PRD line 5; acceptance criterion line 21).
- **Source:** audiocontrol-redesign workplan Phase 2; PRD lines 5, 21, 59-60.
- **Status:** **Relitigated.** Earlier the direction was the opposite: commit `73dcbb1` ("Replace header dots with pixel art logo and update logo colors") promoted the pixel-art logo INTO the header and recolored it to the (then coral/teal) palette. The redesign reversed this — pixel art back out of the header, into icon/favicon role only.
- **Site:** audiocontrol.

### C2. editorialcontrol mark: signal-green ◆ diamond — SETTLED
- **Decision:** Filled ◆ diamond in chartreuse on publication-ink bg, serving as favicon, OG-image corner mark, and review-UI "addressed" stamp.
- **Rationale:** The ◆ "already carries the brand weight — used in the site's tagline ('◆A publication on building with AI agents') and as the 'addressed' stamp in the review UI." Reusing it "keeps browser tabs, OG images, and the review-surface stamps speaking the same language." Logo.astro comment: "No pixel-art icon like audiocontrol — this is a publication mast, not a gear emblem." (commit `05fdcee`.)
- **Source:** commits `05fdcee` (replace favicon with ◆), `f63de52` (drop favicon.ico; SVG alone). Tailpiece reuse: DEVELOPMENT-NOTES.md 2026-05 entry ("three chartreuse ◆ ◆ ◆ diamonds … brand-mark anchor").
- **Status:** Settled. Replaced a placeholder cyan/magenta/yellow pixel-art mark.
- **Site:** editorialcontrol.

### C3. SVG-only favicon (no .ico fallback) — SETTLED
- **Decision:** Ship the SVG favicon alone; drop `favicon.ico`.
- **Rationale:** Chrome preferred the stale `.ico` over the new `.svg`; "SVG favicons work in every browser shipped since ~2020; dropping the .ico removes the fallback path and the stale binary in one step." (commit `f63de52`.)
- **Source:** commit `f63de52`.
- **Status:** Settled. (Also a concrete instance of the global "no fallbacks" rule applied to assets.)
- **Site:** editorialcontrol (pattern; applies to both).

---

## D. Layout & homepage structure

### D1. Homepage = narrative structure, not a flat card grid — SETTLED (audiocontrol)
- **Decision:** Homepage has hero/masthead → two-tier project showcase (Available Now 2-col featured + In Development 3-col) with editorial context (spec-meta lines like "1987 · 16-voice · 12-bit", `STATUS:` panel labels) → Latest Writing (top-3 posts) → Community Channels.
- **Rationale:** redesign PRD: "The homepage is a flat card grid with no narrative" was a named weakness; goal was "a homepage with narrative structure (not just a card grid)" (audiocontrol-redesign PRD lines 5, 11, 47).
- **Source:** audiocontrol-redesign workplan Phase 3; commit `6add457` (phase 3 homepage redesign).
- **Status:** Settled (supersedes palette-redesign's "Projects + card grid", which was the relitigated prior state).
- **Site:** audiocontrol.

### D2. Reading-column + right-edge marginalia rail — SETTLED (editorialcontrol)
- **Decision:** Reading-column content left-weighted in a wide container, with a right-edge marginalia rail of editorial ephemera (ISSUE stamp, THE DESK index, HANDLING card). Shared `.marginalia` styles: mono kicker + mono value-lines + serif italic prose + thin left hairline. Collapses below content under 820px.
- **Rationale:** The wide container left "text left, empty right" — the margin furniture makes the asymmetry "read as intentional asymmetry rather than empty right zones." Insight: "The marginalia gap was latent under-development, not a bug." (DEVELOPMENT-NOTES.md 2026-04-24, "Marginalia pattern (Option A)".)
- **Source:** DEVELOPMENT-NOTES.md 2026-04-24 entry; commit `6499303`; scrapbook brief §2.1/§2.12 reuses the same rhythm.
- **Status:** Settled. **Scoping caveat recorded:** the pattern was NOT carried to the `/blog/` Desk page because the Desk caps `.desk` at `max-width: 58rem` centered, so it lacks the "wide container, empty right" problem (DEVELOPMENT-NOTES.md 2026-04-24, "Overstated the Desk page's need for marginalia"). Operator's "Can you explain why?" scaled the proposal back.
- **Site:** editorialcontrol.

### D3. Container widths — SETTLED (per site)
- **Decision:** audiocontrol `--container-max-width: 1400px`, reading measure `36rem`. editorialcontrol `--container-max-width: 1280px`, reading measure `34rem`. Desk listing capped at `max-width: 58rem`; scrapbook reading column at `44rem`.
- **Source:** both `design-tokens.css` (`:root` Layout block); scrapbook brief §2.1.
- **Status:** Settled.
- **Site:** both (divergent values per site).

### D4. Newest-first listing order — SETTLED (editorialcontrol)
- **Decision:** `/blog/` and homepage "Recent dispatches" sort newest-first; `No. 01` is the latest.
- **Source:** DEVELOPMENT-NOTES.md 2026-05 entry; commit `cf69759` ("desk newest-first").
- **Status:** Settled.
- **Site:** editorialcontrol.

### D5. Aspirational homepage content replaced by live catalog — SETTLED (editorialcontrol)
- **Decision:** Homepage "On the desk" aspirational topic list (5 promised sections with no back-catalog) replaced with a live listing of actually-published posts. Topics array preserved as a commented block for revival "once the publication has enough catalog to back the claims."
- **Rationale:** Don't promise sections the catalog can't back (anti-fabrication applied to design content).
- **Source:** DEVELOPMENT-NOTES.md 2026-04-24, "aspirational topics → Recent dispatches"; commit `71f4272`.
- **Status:** Settled.
- **Site:** editorialcontrol.

---

## E. Typographic devices & atmosphere

### E1. Atmosphere layers: vignette + grain + scanlines — SETTLED (audiocontrol)
- **Decision:** Three global body-class layers: `.atmosphere-vignette` (warm radial gradient on body bg), `.atmosphere-grain` (radial-dot overlay, 3.5% opacity, overlay blend, z-9998), `.atmosphere-scanlines` (repeating linear gradient, 6% alpha, multiply blend, z-9999). Content z-indexed above so reading is uninterrupted. All respect `prefers-reduced-motion`.
- **Rationale:** redesign PRD wanted "background texture, vignette, depth" vs "flat solid" (PRD audit table). Scanlines invoke "CRT/VFD display refresh without the kitsch."
- **Source:** `src/sites/audiocontrol/styles/design-tokens.css` lines 277-330; commit `c1bc552` (Atmosphere section).
- **Status:** Settled. editorialcontrol has a lighter analogue: `.paper-grain` at 2.5% opacity (`editorialcontrol/design-tokens.css` lines 81-96) — no scanlines/vignette (print metaphor, not CRT).
- **Site:** audiocontrol (full set); editorialcontrol (paper-grain only).

### E2. Rule utilities as a primary editorial device — SETTLED
- **Decision:** Both sites ship a rule vocabulary. audiocontrol: `.rule-hairline`, `.rule-accent` (short amber underscore with glow), `.rule-ticked` (schematic fiducial ticks), `.rule-double`, three rule-weight tokens. editorialcontrol: `.rule-single`, `.rule-double`, `.rule-accent`, `.rule-masthead` (3px foreground hairline at masthead top).
- **Rationale:** editorialcontrol "leans heavily on typographic rules" (design-tokens.css comment line 35); rules are "a primary editorial device."
- **Source:** both `design-tokens.css` rule-utility blocks.
- **Status:** Settled.
- **Site:** both (divergent rule sets).

### E3. Signature components per site — SETTLED
- **Decision:** audiocontrol: `.panel-label` (Departure Mono eyebrow), `.dimension-bracket` (CSS-only corner hairlines = technical-drawing callout), `.signal-led` (pulsing amber status lamp), `.phosphor` (amber text + halo glow), `.ticker`. editorialcontrol: `.dropcap` (chartreuse Fraunces first-letter), `.edit-mark` (chartreuse italic indicator), `.ticker`, `.rule-masthead`.
- **Source:** both `design-tokens.css`; commit `c1bc552` (Typographic utilities).
- **Status:** Settled.
- **Site:** both (divergent component sets).

### E4. Magazine tailpiece replaces floating divider — SETTLED (editorialcontrol)
- **Decision:** A floating `<hr class="rule-double">` below the last dispatch was replaced by a magazine tailpiece: three chartreuse `◆ ◆ ◆` diamonds + italic Fraunces "More dispatches in pre-press."
- **Rationale:** Operator read three stacked hairlines as "a cluster of three lines … accidental." Tailpiece reads as intentional typography because the ◆ is already the brand mark. General insight recorded: "Reaching for symbols already in vocabulary > inventing new ones." (DEVELOPMENT-NOTES.md 2026-05, "Magazine convention as load-bearing UI vocabulary".)
- **Source:** DEVELOPMENT-NOTES.md 2026-05 entry; commit `423cec5`.
- **Status:** Settled.
- **Site:** editorialcontrol.

---

## F. Cross-cutting design directives (rules / conventions)

### F1. No modals — inline-per-row affordances instead — SETTLED
- **Decision:** No modal dialogs in editorial UI. CRUD is inline-everywhere: edit expands a slip, rename swaps the filename cell, delete is a two-step inline confirm with a 4-second countdown bar, create slides a composer in at the top.
- **Rationale:** "Inline-per-row … keeps the operator's eye on the row they're acting on." The rule was already explicit in code (`editorial-review-client.ts:354`) but agent went to modal anyway and was corrected; saved as memory. (DEVELOPMENT-NOTES.md [UX] corrections, two sessions.)
- **Source:** scrapbook brief §12 "Three hard rules" #1; DEVELOPMENT-NOTES.md [UX] entries (`editorial-review-client.ts:354` citation); commit `097d6d2` ("inline rename form per row (no modal)").
- **Status:** Settled (relitigated once in practice via a correction, but the rule itself never changed).
- **Site:** both (editorial dev surfaces).

### F2. Typographic glyphs over iconography — SETTLED
- **Decision:** Every glyph in editorial UI is typographic (`§ · ◆ ◇ → ⋯ ✕`), not iconographic.
- **Rationale:** Disposition glyphs chosen to echo the tagline (◆/◇/✕) also read clearly as "filled = done, hollow = pending, crossed = killed" — "Design-coherent choices are usually semantically coherent too." (DEVELOPMENT-NOTES.md, press-check insight.)
- **Source:** scrapbook brief §12 "Three hard rules" #2; DEVELOPMENT-NOTES.md press-check entry.
- **Status:** Settled.
- **Site:** both (editorial dev surfaces); aligns with both sites' overall typographic identity.

### F3. Don't embed editorial text in generated images — SETTLED
- **Decision:** Do not bake editorial text into generated feature/OG images. Keep text in page content or HTML/CSS overlays.
- **Rationale:** "Generated text is not editable."
- **Source:** `.claude/CLAUDE.md` line 197 (project directive).
- **Status:** Settled (codified as a standing rule).
- **Site:** both.

### F4. Don't depict identifiable hardware in feature-image backgrounds — SETTLED
- **Decision:** Use abstract/geometric backgrounds, not photographic depictions of known gear.
- **Rationale:** "Anyone who knows the gear sees the AI artifacts." (DEVELOPMENT-NOTES.md feature-image [UX] correction.)
- **Source:** DEVELOPMENT-NOTES.md feature-image entry ([UX] "Pivoted from photographic gear prompts to abstract/geometric").
- **Status:** Settled.
- **Site:** both (feature-image pipeline).

### F5. Inline feature image decoupled from social/OG card — SETTLED
- **Decision:** `frontmatter.image` (inline, cropped 21:10) is separate from `frontmatter.socialImage` (OG card).
- **Rationale:** "Inline feature image was tall and odd without the text overlay" — the two contexts have different aspect/treatment needs. (DEVELOPMENT-NOTES.md.)
- **Source:** commit `32cef66` ("split inline feature image from social card image"); `70d49bb`; DEVELOPMENT-NOTES.md.
- **Status:** Settled.
- **Site:** both.

### F6. Studio dev-tool design system layered on site tokens — SETTLED
- **Decision:** The feature-image Studio (dev tool) is built on `studio-tokens.css` — a thin layer on top of the site's `design-tokens.css` — sharing primitives (stamped chips, DIP-switch rows, pocket readouts, corner brackets, registration marks). Press-check / service-manual register, not a generic dev-tool palette.
- **Rationale:** "A design system for a dev tool earns its keep" — shared primitives meant new routes didn't reinvent visual language; "Commit 1 took 90 minutes; commits 3-5 … because the tokens they built on were already resolved." Routing a per-entry destination through a top nav is a recorded UX smell (Focus removed from nav).
- **Source:** DEVELOPMENT-NOTES.md Phase 16 entry; commits `a1a6615` (foundation: tokens + chrome), `fb6070e` (redesign against house voice).
- **Status:** Settled. **Complexity caveat recorded:** the "< 2500 lines across 5-8 files" budget was overshot (~6300 lines / 10 files) because primitives weren't scoped as a separate line item (DEVELOPMENT-NOTES.md [COMPLEXITY]).
- **Site:** dev surface (editorialcontrol-hosted); built on editorialcontrol tokens.

---

## G. CSS-architecture decisions worth capturing

### G1. Shared `prose.css` as single source of truth for article typography — SETTLED (audiocontrol)
- **Decision:** One `styles/prose.css` consumed by BlogLayout / DocsLayout / GuideLayout (Service-Manual voice: Departure Mono h1/h2 with amber accent hairline above h2, IBM Plex Sans h3+, amber-haloed inline code, panel-table treatment, phosphor-underline links). Also resolved pre-existing undefined `--fg`/`--muted`/`--card-bg` tokens.
- **Source:** audiocontrol-redesign workplan Phase 4.
- **Status:** Settled.
- **Site:** audiocontrol.

### G2. Set explicit token values, don't `inherit`, when an intermediate ancestor sets a property — SETTLED
- **Decision:** When a distant ancestor's color must reach a descendant past an intermediate that re-declares it, set the explicit `hsl(var(--foreground))` value rather than relying on `inherit` (which only pulls the parent's declared value).
- **Rationale:** Two same-session bugs (dark-on-dark body text; Mark-pencil mispositioning) both came from trying to un-inherit from a distant ancestor. "Write explicit values when an intermediate ancestor sets the property." (DEVELOPMENT-NOTES.md [COMPLEXITY].)
- **Source:** DEVELOPMENT-NOTES.md press-check / review-UI entries (`#draft-body` color fix).
- **Status:** Settled (engineering convention).
- **Site:** both (dev surfaces; CSS cascade discipline).

### G3. Exactly one top-level element in an `.astro` page that uses a full-document layout — SETTLED
- **Decision:** A page using a layout that emits a full `<html>` document (e.g. BlogLayout) must have exactly one top-level element; a second sibling becomes invalid HTML and `<script>` modules render outside `</html>` and fail to attach.
- **Source:** DEVELOPMENT-NOTES.md longform-review-UI entry (the bug that broke review chrome since Phase 14).
- **Status:** Settled (engineering convention).
- **Site:** both.

---

## H. Open / unresolved design questions still on record

These are flagged in sources as not-yet-settled — relevant for the decision archive's "open" column:

- **audiocontrol-redesign PRD open questions (lines 67-71):** what display typeface fits vintage-audio hardware (resolved post-PRD to Departure Mono); whether to retire the pixel-art logo entirely vs keep as favicon (resolved: keep as icon only, C1); how much CRT/retro aesthetic should bleed into the site (partially resolved via atmosphere layers E1, "without the kitsch").
- **scrapbook brief §10 open questions:** `.age` encrypted-file preview handling; large-image rendering via Astro image pipeline; syntax-highlighter dependency choice; sort/collapsed-state localStorage persistence. (Dev-surface scope.)
- **[DOCUMENTATION] correction (DEVELOPMENT-NOTES.md 2026-04-24):** "Design-system rules live scattered (no-modal rule in a single client-side code comment; 'dispatch' vocabulary in the voice skill; typographic conventions in design-tokens.css). The homepage design-language review … would have been faster with a central design-system index." — this is the explicit problem statement this feature (design-system-foundation) exists to solve.

---

## Summary table (archive-ready)

| ID | Decision | Status | Site |
|----|----------|--------|------|
| A1 | audiocontrol warm-ink + phosphor amber + Roland-blue | relitigated (2nd palette; replaced coral/teal) | audiocontrol |
| A2 | editorialcontrol ink + chartreuse + parchment cream | settled (resolved open Q) | editorialcontrol |
| A3 | warm-retuned status badge tokens | settled | audiocontrol |
| B1 | Departure Mono / IBM Plex Sans / JetBrains Mono | relitigated (replaced JetBrains-as-display) | audiocontrol |
| B2 | Fraunces / Inter / JetBrains Mono | settled | editorialcontrol |
| B3 | JetBrains Mono shared code/tabular face | settled | both |
| B4 | tabular-nums + `No. NN` numbering | settled | editorialcontrol |
| C1 | typographic wordmark; pixel art → icon only | relitigated (reversed `73dcbb1`) | audiocontrol |
| C2 | signal-green ◆ diamond mark | settled | editorialcontrol |
| C3 | SVG-only favicon, no .ico | settled | editorialcontrol |
| D1 | homepage narrative, not card grid | settled (supersedes grid) | audiocontrol |
| D2 | reading-column + marginalia rail | settled (scoped: not on Desk) | editorialcontrol |
| D3 | container widths / reading measures | settled | both |
| D4 | newest-first listing | settled | editorialcontrol |
| D5 | live catalog over aspirational topics | settled | editorialcontrol |
| E1 | vignette + grain + scanlines atmosphere | settled | audiocontrol (paper-grain only on editorialcontrol) |
| E2 | rule utilities as editorial device | settled | both |
| E3 | per-site signature components | settled | both |
| E4 | magazine tailpiece over floating divider | settled | editorialcontrol |
| F1 | no modals — inline-per-row CRUD | settled | both (dev) |
| F2 | typographic glyphs over icons | settled | both (dev) |
| F3 | no editorial text baked into generated images | settled | both |
| F4 | no identifiable hardware in feature-image bg | settled | both |
| F5 | inline image decoupled from social/OG card | settled | both |
| F6 | studio dev-tool tokens layered on site tokens | settled (budget overshot) | dev |
| G1 | shared prose.css single source of truth | settled | audiocontrol |
| G2 | explicit token values over `inherit` past an ancestor | settled | both (dev) |
| G3 | one top-level element under full-document layout | settled | both |
