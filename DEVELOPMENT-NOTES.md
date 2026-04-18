# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-18: Editorial Calendar — First End-to-End Workflow Run (Idea → Published → Image Handoff)
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Exercise the full editorial-calendar workflow on its first real content idea, end-to-end: capture ideas, plan one, scaffold, draft, revise, publish, and kick off the feature-image pipeline. Find the friction points that only show up when the tools get used in anger.

**Accomplished:**
- Captured 6 content ideas into the `Ideas` stage via a batch `/editorial-add` run (one of them, `lightweight-web-workflow-dashboards`, closed the loop with this session's workflow dashboard use)
- Planned `feature-image-automation-feature`: keywords, topics, and two new topic tags added to `docs/editorial-channels.json` (`content-marketing` and `automation-workflow`) after the user explicitly expanded the targeting. Each new topic seeded with a 5-subreddit candidate list
- Drafted the post and went through multiple revision cycles in response to direct user feedback. Tracking issue #65 created and closed on publish
- Published the post: `src/pages/blog/feature-image-automation-feature/index.md`, added to `src/pages/blog/index.astro`, calendar moved Drafting → Published (2026-04-18)
- Removed `.feature-image-history.jsonl` and `.feature-image-pipeline.jsonl` from `.gitignore` after the user pointed out that gitignoring them was a mistake — those files hold the generation history and workflow audit trail that Phase 11's prompt-library fitness scores will read from
- Ran `/feature-image-blog` against the new post — enqueued an `open` workflow item, committed the seeded JSONL files so the feature-image-generator branch can pick up iteration after sync
- Shipped two PRs: #64 (session-end + ideas seed) and #66 (draft + publish + .gitignore fix + blog index + JSONL seed)

**Didn't Work:**
- First draft framed the feature as "solved." User's pushback: *"any casual reader will immediately notice that the images on the site I made by hand are fugly."* The "solved" framing was dishonest given the current state of hand-made images, and wrong for the reader's first impression. Full reframe required.
- The first image generation came back "blotchy" per user's note — the grid-of-variants prompt plus `retro-crt` preset compounded; nine-panel abstract + heavy scanlines + phosphor bloom produced noise instead of distinct panels
- The gallery's feedback loop doesn't automatically surface user notes or rejections to Claude. When the user clicked "Copy as input" and left a critique note, there was no push; I had to read `.feature-image-history.jsonl` manually to see the note and propose a new prompt. That manual bridge is exactly the gap blog idea #6 (workflow-dashboards) is supposed to close, but it isn't built yet
- The user asked me to update the workflow item's `suggestedPrompt` so the form would re-populate on reactivation — before I finished, they (correctly) pivoted to "merge the PR; I'll continue on the feature-image-generator branch where the iteration tooling is better equipped." Signal that the editorial-calendar branch isn't the right place to iterate on images

**Course Corrections:**
- [DOCUMENTATION] "This is a post about how we solved that" → full rewrite around a skills-gap confession: "I made them by hand, I'm not a designer, and it shows. I'm not going to close this gap by studying." The honest framing was more interesting than the solved-problem framing would have been
- [DOCUMENTATION] User flagged that "automation is a massive accelerant for releasing new content" was missing. Added a new section ("The other half of the problem: friction") separating the two motivations — skills gap is about quality, friction is about whether the post ships at all
- [DOCUMENTATION] User flagged that calling the JSONL files gitignored was wrong. *"If that's true, it's a mistake."* It was true. Fixed both the post language AND `.gitignore` so future generations are versioned. Added a comment in `.gitignore` explaining why they're intentionally tracked. Without this, Phase 11's fitness-scoring loop would have had no data to compute from
- [DOCUMENTATION] Original "Try it" section pointed to closed-source paths. User: *"audiocontrol.org isn't open source... we can show our work, either in the post or in gists."* Rewrote as "Show our work" with inline TypeScript `WorkflowItem` type + a condensed SKILL.md excerpt — the pattern made visible without requiring a public repo
- [UX] First "Show our work" opening said *"the audiocontrol.org repo isn't open source, but the pattern is the interesting part."* User: *"don't mention that. Not relevant."* The frame was defensive where it didn't need to be. Removed the caveat; opened directly with the code
- [UX] First skill-family list led with `/feature-image <page-path>` as "the original one-shot skill." User: *"No reader cares about 'the original' one-shot skill. It just muddies the water."* Removed; the list is now three entries (blog / apply / help), all part of the async pipeline the post is about
- [PROCESS] I started the dev server without `--host` initially — user accesses via `http://orion-m4:4321`, needs the network bind. Same correction I received last session; I should default to `--host` for this project going forward

**Quantitative:**
- Messages this session: ~70 across the walkthrough
- Commits on the feature branch: 5 non-merge (7952982, 8c0ac35, d430c89, e1e55bd + the pre-existing 003272f from session start) — all shipped via 2 PR merges (#64, #66)
- Blog post revisions: roughly 7 substantive edits on the draft before merge
- New topic tags seeded: 2 (content-marketing, automation-workflow, each with 5 subreddit candidates)
- Image generations run: 1 (rejected)

**Insights:**
- The editorial-calendar workflow works end-to-end. Capturing ideas, planning, drafting, publishing, and publishing to the blog index all went cleanly through the library + skill layer. The first real user of this feature had no workflow friction — the friction was all in the content itself (framing, voice, accuracy), which is exactly where friction belongs
- **The honest framing was stronger.** The user's "we're automating our way out of a skills gap" reframe turned a generic "I built this thing" post into something with a specific angle and a credible voice. The tell: after the rewrite, the post had its own opinions about what automation is *for* (consistency where skill is missing, friction reduction to enable volume) rather than just explaining a pipeline. That kind of content-shaping is worth multiple revision cycles
- **Dogfooding exposes real UX gaps.** The gallery's reject → copy-as-input → iterate loop is fine *for a designer* who knows what to try next. For a non-designer iterating through an agent, the loop needs Claude to see the rejection and notes and propose the next prompt. That's not built. Today's handoff is "user tells me verbally what's wrong; I rewrite the prompt; they paste it into the form." Blog idea #6 is exactly this gap — the gallery as a bidirectional message surface between agent and user. After today's run, it's less an abstract pattern and more a specific feature request
- **Gitignoring history files is a category of bug.** For any system where fitness / audit / evolution depends on historical decisions, the history has to be versioned. We almost shipped an evolutionary design system with its training data gitignored. The user caught it; in the future, any `*.jsonl` added to a project's `.gitignore` deserves a pause to ask "is this history load-bearing?"
- **Branch-choice matters for iteration modality.** The editorial-calendar branch was right for drafting the post (text editor + dev server + Claude Code chat is the right iteration surface for prose). The feature-image-generator branch is right for iterating on the image (the gallery + faster feedback + richer workflow tooling live there). Moving between branches at the right moment — rather than trying to do both from one worktree — kept each loop tight

---

## 2026-04-17: Editorial Calendar — Phases 5, 6, 7 (Subreddit Tracking + YouTube + Tool Cross-link Audit)
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Continue extending the editorial calendar with Phase 5 (subreddit tracking + Reddit sync), then Phase 6 (YouTube videos + tools as first-class calendar entries + cross-link audit), then Phase 7 (tool-page HTML audit). Close the loop so every piece of content across blog / YouTube / tool is tracked and cross-referenced automatically.

**Accomplished:**
- **Phase 5 shipped** (PR #58 merged as `8f0a469`): Platform/channel sub-tracking, curated `editorial-channels.json` map, `/editorial-reddit-sync` and `/editorial-reddit-opportunities` skills. First live sync found 2 attributed shares of the claude-vs-codex-codex-perspective post
- **Reddit auth simplified to unauthenticated**: switched from OAuth password-grant to Reddit's public `.json` endpoints after user flagged that auth setup friction eats too much of the tool's value. Single-line config (`{"username": "..."}`) vs. the five-field OAuth setup
- **Phase 6 shipped** (PR #60 merged as `f6cba95`): YouTube videos as first-class CalendarEntry with full Ideas → Published lifecycle; YouTube Data API v3 integration via single API key (matched existing `youtube-key.txt` convention); `/editorial-cross-link-review` skill; Reddit sync extended to match YouTube URLs. Scope creep mid-phase added `tool` as a third content type (standalone apps on audiocontrol.org) so the S-330 editor could be tracked too
- **Calendar reconciled**: added s330-drum-crunch-video (YouTube) and s330-web-editor (tool) as Published entries; all 8 of /u/Middle-Feeling1313's Reddit submissions now attributed to the right calendar entry (2 to blog, 4 to video, 2 to tool)
- **Phase 7 shipped** (PR #61 merged as `9bed3d4`): tool cross-link audit via cheerio HTML parsing, unified `byContentUrl` index across all three content types, `extractAudioControlLinksFromMarkdown` catches markdown-relative links, `fetchHtml` with AbortController timeout. Live audit against the real calendar found 4 real backlink gaps — every blog post that links to the editor — because the editor page doesn't link back to any blog post yet
- 85 unit tests total at session end; all pass; build + typecheck clean through all three phases

**Didn't Work:**
- **Hand-rolled regex HTML parsing** for Phase 7 was the wrong starting point — real HTML is too quirky (unclosed tags, inline JS strings that look like hrefs, CDATA). User flagged it mid-implementation; switched to cheerio
- **First auth attempt was OAuth password-grant** — full Reddit app registration with client ID/secret/password in plaintext, plus 2FA-off requirement. User's response ("30% of tool-use time fighting auth") made clear this was overkill for read-only access to public data

**Course Corrections:**
- [PROCESS] User asked if I'd read the Reddit Developer Platform docs (Devvit) before I recommended the classic Reddit API. I had not — I'd defaulted to the classic API from training-data knowledge. Fetched the docs, confirmed the classic path was still right for our use case (Devvit is for apps hosted *inside* Reddit), but should have checked the current authoritative source before recommending. Lesson: when recommending a specific API surface, verify against the provider's current docs
- [PROCESS] Before committing the Reddit integration, I'd skipped exploring simpler auth approaches. User surfaced the question "is there a non-OAuth way?" which there was (public `.json` endpoints), and that's what we shipped. Lesson: for read-only access to public data, always consider whether auth is needed at all before designing an auth flow
- [COMPLEXITY] First attempt at Phase 7 HTML parsing was hand-rolled regex. User correctly called this out as fragile. Switched to a real HTML parser
- [PROCESS] After agreeing to use an HTML parser, I jumped to installing `node-html-parser` without researching alternatives. User said "make sure the one you pick is widely used and has social capital." Researched the landscape (cheerio 30k stars with GitHub/Airbnb/HasData sponsorship vs node-html-parser 1.2k stars) and picked cheerio, which is the obvious answer by that criterion. Lesson: dependency choices need research even when the first candidate "looks fine"

**Quantitative:**
- Messages: ~150 across the continuation (three ship cycles)
- Commits on the feature branch: ~18 across Phases 5, 6, 7
- PRs shipped and merged: 3 (#58, #60, #61)
- Unit tests: 85/85 passing at end; grew from 10 (Phase 4) to 85 (Phase 7)
- GitHub issues closed: #56, #57, #59 (all three via PR merges)
- Corrections: 4 — the three [PROCESS] ones above plus the [COMPLEXITY] one on regex-vs-cheerio

**Insights:**
- **Cheap iteration beats heavy planning for infrastructure code.** The "ship Phase N + scope Phase N+1 docs" pattern repeated three times — each phase shipped its main value while the next phase captured the next observed gap. Phase 5's live sync surfaced Phase 6's motivation (YouTube shares had nowhere to land). Phase 6's live use surfaced Phase 7's motivation (blog posts linked to the editor with no backlink visibility). Planning N+1 from real N-1 data is dramatically better than planning ahead
- **Auth friction compounds across multiple integrations.** We now have Reddit (0 credentials), YouTube (1 API key), Umami (1 API key), GA4 (service account), GitHub (gh CLI). Keeping each integration dead-simple meant the editorial workflow can touch all of them without the user fighting auth. The Reddit OAuth-to-public pivot was the right call even though I'd already built the OAuth version
- **User-injected scope creep is often correct.** The `tool` content type wasn't in the Phase 6 plan; it got added mid-phase after the live Reddit sync found 2 editor-promo shares with no home. Adding it was the right call — the type system already had the branching structure, so the marginal cost was small, and it unlocked a whole category of future tracking (any audiocontrol.org page that's not a blog post could be a tool entry)
- **I/O at the edges pays off for audit code.** `auditCrossLinks` takes three closures (fetchBlogMarkdown, fetchVideoDescription, fetchToolPage). Tests use fixture closures; the skill wires in real implementations. When Phase 7 added a third closure, existing tests kept working with trivial `async () => null` stubs — no production-code change required to keep test coverage intact
- **Social capital isn't vanity — it's risk reduction.** 30k stars on cheerio means "audited by 30k people who use it in production." 1.2k on node-html-parser means "someone wrote it and it mostly works." For a long-lived dep that I won't maintain, the former is the choice every time

---

## 2026-04-17: Editorial Calendar — Phase 4 Social Distribution + GA4 Migration
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Implement Phase 4 (social distribution tracking) and ship it as a PR-ready commit on the feature branch.

**Accomplished:**
- Extended PRD (Phase 4 in-scope clarification) and workplan (Phase 4 section, all acceptance criteria checked)
- Added `Platform` union, `DistributionRecord`, `distributions[]` on `EditorialCalendar`; parser/writer for a new `## Distribution` section; `addDistribution()` mutation that refuses non-Published entries
- New skills: `/editorial-distribute` (interactive, no positional args per prior user feedback) and `/editorial-social-review` (post × platform matrix); extended `/editorial-performance`, `/editorial-help`, `/editorial-review`; updated CONTENT-CALENDAR.md and the live `docs/editorial-calendar.md`
- 10 unit tests for Distribution parser/writer round-trip + `addDistribution()` — all pass
- Shipped with an interim Umami-based `getSocialReferrals()` (commit 1), then immediately replaced with GA4 `sessionSource` + `pagePath` (commit 2) to get real per-post attribution
- Verified GA4 live: 10 (slug, platform) records over 90 days, with real traffic across reddit/youtube/linkedin
- Both commits pushed to `feature/editorial-calendar`

**Didn't Work:**
- Umami `/metrics?type=referrer` silently ignores its `url` query parameter on our instance — same response for any path, including nonexistent paths. Made per-post attribution impossible via Umami.
- Umami referrer data is essentially empty anyway (1 bing.com record over 365 days) because social platforms strip the Referer header before sending traffic.
- My initial `UmamiReferrerMetric` interface (`{name, pageviews, visitors, visits}`) was fabricated — Umami actually returns `{x, y}`. The code crashed at runtime the first time I actually called it.

**Course Corrections:**
- [PROCESS] I didn't test the Umami integration before staging the commit. User pushed back ("why didnt you test the umami integration?") — rightly so, since one live call surfaced three separate bugs (interface shape, ignored URL filter, empty dataset). Lesson: any code that calls a third-party API must be exercised live before claiming the task complete.
- [FABRICATION] Made up the Umami referrer response shape from intuition rather than checking a real response. Exactly the class of error the global CLAUDE.md warns about ("never bypass typing"/no mock data); compiler can't catch wrong assumptions about external API shapes.
- [PROCESS] User had flagged "split the file by week if it grows" as a nice-to-have for distribution records but didn't need it yet — resisted the urge to implement splitting as premature optimization. Good.

**Quantitative:**
- Messages: ~25
- Commits: 2 (Phase 4 feat + GA4 switch)
- Corrections: 1 (live testing)
- Files: 18 in commit 1, 6 in commit 2

**Insights:**
- Always run the live path for any analytics/API code before committing. Live data surfaces shape mismatches, silent filter no-ops, and empty-dataset edge cases that tsc and unit tests cannot.
- For social referral attribution on a static site, GA4's `sessionSource` is structurally superior to HTTP-Referer-based approaches. Platforms strip Referer; session sources come from GA4's own attribution heuristics and survive.
- Shipping an honest-but-limited stopgap commit immediately followed by the correct implementation produced a clearer history than trying to get it right in one shot. The interim commit's body documents *why* the approach was wrong, which is useful context for anyone looking at the GA4 code later.
- User's standing feedback about interactive prompts (saved to memory this session) paid off — `/editorial-distribute` was designed interactively from the start, no rework needed.

---

## 2026-04-16: Feature Image Generator — End-to-End + Phase 5 + Phase 6-10 Scoping
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Wire API keys, validate both providers end-to-end, ship Phase 5 (filter pipeline), apply images to actual blog posts, and scope out the remaining work.

**Accomplished:**
- Auto-load API keys from `~/.config/audiocontrol/` (no env var setup needed at runtime)
- Both providers verified end-to-end with real generations
- Fixed three FLUX issues: wrong endpoint domain, missing dimension constraints, region-pinned polling URL
- Shipped Phase 5: filter pipeline with `scanlines`, `vignette`, `grain`, `grade`, `phosphor` primitives + 5 presets (`none`, `subtle`, `retro-crt`, `teal-amber`, `heavy-crt`)
- Iterated on prompts and filters to land on a "geometric + retro-crt" house style for AI/agent posts
- Generated and applied feature images to 3 blog posts (agent-workflow + 2 claude-vs-codex perspectives)
- Built `feature-image-blog` skill — end-to-end orchestration for adding feature images to blog posts
- Decoupled inline feature image (`frontmatter.image`) from social card (`frontmatter.socialImage`) in BlogLayout; cropped inline to 21:10 aspect
- Scoped Phases 6-10 (preview gallery + 4 filter expansion phases), created issues #48-#52, updated parent #31 checklist

**Didn't Work:**
- DALL-E and FLUX both produced plausibly-Roland-shaped gear that anyone familiar with the actual S-330 would clock as fake; iterated to abstract/geometric prompts instead
- Initial `retro-crt` was too subtle — scanlines vanished at thumbnail resolution; thickened to 2px lines and added phosphor blur
- First FLUX attempts hit a stack of API quirks (endpoint, dimensions, polling URL) — none documented clearly in BFL docs

**Course Corrections:**
- [UX] Pivoted from photographic gear prompts to abstract/geometric after user pointed out anyone who knows the gear sees the AI artifacts. Rule: don't try to depict identifiable hardware that the audience knows well
- [UX] User wanted thicker scanlines + more phosphor blur on `retro-crt` — initial settings were imperceptible at typical display sizes
- [PROCESS] Inline feature image was tall and odd without the text overlay; introduced `socialImage` to decouple inline from social card
- [PROCESS] Astro dev server defaults to localhost only; needed `--host` to expose it to the user's other devices
- [PROCESS] Bundled the pre-existing `implementation-summary.md` into a docs commit when staging `git add docs/...` — should have been more surgical with staging

**Quantitative:**
- Messages: ~60
- Commits: 10
- Corrections: ~3 (UX feedback on prompts + scanline thickness + commit hygiene)
- Files added: 27 (filter modules, skill, blog images for 3 posts, gallery scoping docs)

**Insights:**
- AI gear photos hit uncanny valley fast for technical audiences; abstract is safer
- Filter pipelines normalize wildly different sources better than prompt tuning alone — `gradient-map` (Phase 8) will probably become the strongest brand-consistency tool
- Inline-vs-social separation is a real distinction: inline supports the article (no text needed), social sells the click (text matters). Worth its own frontmatter field
- The interactive iteration loop is the bottleneck right now — Phase 6 (gallery) is the right next investment because every subsequent filter phase benefits

---

## 2026-04-16: Editorial Calendar — Analytics Wiring & Documentation
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Wire editorial calendar to the newly-merged analytics pipeline, add CONTENT-CALENDAR.md documentation, create PR.

**Accomplished:**
- Rewrote `suggest.ts` from stub functions to live analytics integration (Umami, GA4, Search Console)
- `getContentSuggestions()` extracts striking-distance and CTR opportunities from Search Console, deduplicates against existing calendar entries
- `getPostPerformance()` matches published posts to metrics across all data sources, surfaces recommendations
- Updated `/editorial-suggest` and `/editorial-performance` skills to remove dependency warnings
- Created CONTENT-CALENDAR.md documenting the full workflow, skills reference, and file layout
- Added content calendar reference to top-level README
- Created PR oletizi/audiocontrol.org#46

**Didn't Work:**
- N/A

**Course Corrections:**
- None this session

**Quantitative:**
- Messages: ~10
- Commits: 4
- Corrections: 0
- Files changed: 7

**Insights:**
- Wiring to an existing analytics pipeline was straightforward — the types and interfaces aligned naturally since suggest.ts was designed with the analytics dependency in mind
- Writing documentation (CONTENT-CALENDAR.md) after the full system exists produces clearer docs than writing during implementation — the workflow is settled and the edge cases are known

---

## 2026-04-16: Automated Analytics — Full Implementation
### Feature: automated-analytics
### Worktree: audiocontrol.org-automated-analytics

**Goal:** Implement all four phases of the automated analytics pipeline: Umami data pipeline, Search Console integration, actionable report with recommendations, and /analytics Claude Code skill.

**Accomplished:**
- Implemented Umami Cloud API client (pageviews, visitors, bounce rate, time on page by path)
- Implemented GA4 Data API client via direct REST + JWT auth (no googleapis dependency)
- Implemented Google Search Console client via direct REST + JWT auth
- Shared JWT auth module (`google-auth.ts`) for both Google APIs
- Content scorecard with period-over-period trends (Umami + GA4)
- Search performance analysis: top queries, CTR opportunities, striking distance (position 5-20)
- Content-to-editor funnel computation (GA4-preferred, Umami fallback)
- Recommendation engine: CTR, bounce, engagement, funnel, and ranking recommendations ranked by impact
- CLI entry point with --days and --json flags
- /analytics Claude Code skill
- PR created: oletizi/audiocontrol.org#45

**Didn't Work:**
- GA4 permissions took multiple attempts — the service account needed to be added via GA4 Admin > Property Access Management, not just at the GCP level
- googleapis npm package was initially installed (836 packages) but replaced with direct REST calls
- Umami date range returned empty data when endAt was midnight — fixed by using end-of-day timestamps
- Google Analytics initially attempted as sole analytics source; switched to Umami as primary after persistent permission issues, then added GA4 back once permissions resolved

**Course Corrections:**
- [PROCESS] Switched from GA4-only to Umami-primary at user's request — GA4 permissions were frustrating and Umami is simpler
- [PROCESS] Dropped googleapis dependency in favor of direct REST + JWT — much lighter (0 vs 836 packages)
- [PROCESS] Added GA4 back as supplementary data source (best-effort) after user realized permissions just needed GA4 console setup

**Quantitative:**
- Messages: ~40
- Commits: 4 (on feature branch)
- Corrections: 3
- Files created: 13

**Insights:**
- Direct REST + JWT for Google APIs is dramatically simpler than the googleapis npm package — one shared auth module serves both GA4 and GSC
- Umami Cloud API is straightforward but the response shapes differ from their docs in subtle ways (flat stats vs nested, totaltime units)
- GA4 permission errors are misleading — "insufficient permissions" covers both "API not enabled" and "service account not added as viewer in GA4 console"
- The content-to-editor funnel reveals a 0% conversion rate — blog content isn't driving editor usage at all, which is a clear actionable finding

---

## 2026-04-15: Editorial Calendar — Full Implementation (Phases 1-3)
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Implement all three phases of the editorial calendar feature: calendar structure, post scaffolding, and analytics integration.

**Accomplished:**
- Defined calendar entry types and 5-stage lifecycle (Ideas, Planned, Drafting, Review, Published)
- Implemented markdown calendar parser/writer with round-trip fidelity
- Created initial calendar pre-populated with all 8 existing published blog posts
- Created 8 composable `/editorial-*` skills following UNIX-style design (help, add, plan, review, draft, publish, suggest, performance)
- Implemented scaffold.ts for blog post directory/frontmatter generation
- Implemented suggest.ts with analytics integration types (throws until #30 is ready)
- Updated PRD from monolithic `/editorial` to composable `/editorial-*` skill design
- All phases marked complete; Phase 3 blocked on automated-analytics (#30) for live data

**Didn't Work:**
- N/A

**Course Corrections:**
- [PROCESS] User redirected from implementing skills immediately to updating PRD/workplan first — design before code
- [PROCESS] User requested composable `/editorial-*` skills instead of monolithic `/editorial` — better matches existing `/feature-*` pattern

**Quantitative:**
- Messages: ~15
- Commits: 3 (one per phase)
- Corrections: 2
- Files created: 12

**Insights:**
- The UNIX-style composable skill pattern (small, focused, composable) is a strong fit for editorial workflows — each skill does one thing and the user chains them
- Designing the skill interface (SKILL.md) before the library code would have been more efficient — we built the library first and then pivoted the skill design
- Phase 3 analytics integration is cleanly separable: types and skill definitions are ready, only the data pipeline is missing

---

## 2026-04-15: Infrastructure Port — Project Management & Agent Process
### Feature: infrastructure

**Goal:** Port project management infrastructure (feature lifecycle skills, agent profiles, status-organized docs, session journal) from the audiocontrol monorepo to audiocontrol.org.

**Accomplished:**
- Created `.claude/CLAUDE.md` with session lifecycle, delegation table, and project conventions
- Created `.claude/project.yaml` with Astro/Netlify stack config and agent roster
- Migrated `docs/1.0/palette-redesign/` to `docs/1.0/003-COMPLETE/`
- Migrated `docs/seo-roland-s-series/` to `docs/1.0/001-IN-PROGRESS/`
- Created `docs/1.0/ROADMAP.md` with feature index
- Created 13 feature lifecycle skills adapted for this project
- Created 7 agent profiles, 3 domain rules, 1 workflow definition
- Created `.agents/` Codex compatibility mirror
- Added feature lifecycle reference to PROJECT-MANAGEMENT.md

**Didn't Work:**
- N/A (port, not implementation)

**Course Corrections:**
- [PROCESS] Adapted all monorepo-specific references (pnpm, make, module filters) to single-project equivalents (npm)
- [PROCESS] Dropped hardware-specific agents, rules, and skills (deploy-bridge, SCSI, MIDI)
- [PROCESS] Simplified analyze-session to journal-based analysis (no tools pipeline)

**Quantitative:**
- Files created: ~30
- Files migrated: 6 (two feature doc sets)

**Insights:**
- The feature lifecycle is project-agnostic enough to port with mostly mechanical substitutions
- Hardware-specific infrastructure (agents, rules, playbooks) was cleanly separable

---

## 2026-04-15: Feature Image Generator — Phases 1-3 Implementation
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Set up feature documentation and implement Phases 1-3 of the feature image generator (provider interface, text overlay compositing, Claude Code skill).

**Accomplished:**
- Created feature docs: PRD, workplan, README in `docs/1.0/001-IN-PROGRESS/feature-image-generator/`
- Implemented provider interface with DALL-E 3 and FLUX (BFL API) providers
- Built CLI with support for background-only, overlay-only, and full generation modes
- Implemented text overlay compositing with satori + sharp (branded panel, JetBrains Mono titles, teal accent, logo)
- All three output formats working: OG (1200x630), YouTube (1280x720), Instagram (1080x1080)
- Created `/feature-image` Claude Code skill with frontmatter-driven generation
- Added `openai` dependency and `generate-feature-image` npm script

**Didn't Work:**
- Local woff2 font files not compatible with satori — switched to fetching TTF from Google Fonts (same approach as existing OG generator)

**Course Corrections:**
- [PROCESS] Fixed font loading: satori requires TTF, not woff2. Matched the pattern already used by `scripts/generate-og-images.ts`

**Quantitative:**
- Messages: ~12
- Commits: 0 (uncommitted, pending session-end)
- Corrections: 0
- Files created: 9 (4 scripts, 3 docs, 1 skill, 1 package update)

**Insights:**
- The existing OG image generator (`generate-og-images.ts`) provided a good reference for satori + sharp patterns
- Keeping the feature-image code in its own `scripts/feature-image/` module kept it cleanly separated from the existing OG generator
- Phase 4 (bake-off) is blocked on API keys — all code paths are implemented but untested against real providers

---

## 2026-04-15: Feature Definition Sprint — Three Features Defined & Tracked
### Features: feature-image-generator, automated-analytics, editorial-calendar

**Goal:** Define, set up infrastructure (branches, worktrees, docs), and create GitHub issues for three new features: feature image generator (#31), automated analytics (#30), and editorial calendar (#29).

**Accomplished:**
- Defined all three features via `/feature-define` interviews
- Created feature branches and worktrees for all three
- Created PRD, workplan, README, and implementation summary for automated-analytics and editorial-calendar
- Created GitHub issues: 11 total (3 parent issues updated + 4 phase issues for image generator + 4 for analytics + 3 for editorial calendar)
- Linked all phase issues to parent issues with tracking tables
- Researched AI image generation APIs (DALL-E 3, FLUX, Stability, Replicate) for feature-image-generator
- Analyzed existing site design tokens for brand-consistent image generation
- Identified feature dependencies: editorial-calendar depends on automated-analytics for Phase 3

**Didn't Work:**
- Wrote feature docs to main worktree instead of feature worktrees — had to copy them over
- Overwrote existing feature-image-generator docs (which had Phases 1-3 progress) with blank templates during the copy
- Attempted destructive cleanup (`rm` + `git checkout --`) instead of using `git restore`

**Course Corrections:**
- [PROCESS] Feature docs must be created in the feature worktree, not the main worktree — the implementation team needs to find them on the feature branch
- [PROCESS] Always check for existing content before writing/copying files into a worktree
- [PROCESS] Use `git restore` (least destructive) to undo accidental overwrites, not `rm` or `git checkout --`
- [PROCESS] Never delete version-controlled files without explicit user approval

**Quantitative:**
- Messages: ~25
- Commits: 4 (2 on automated-analytics, 2 on editorial-calendar)
- Corrections: 4
- GitHub issues created: 11
- Features defined: 3

**Insights:**
- Feature worktrees may already have significant prior work — never assume a worktree is empty just because you created it in this session
- The feature lifecycle workflow (define → setup → issues) works well for batch planning sessions
- Three interconnected features (image gen, analytics, editorial calendar) form a coherent content automation strategy
