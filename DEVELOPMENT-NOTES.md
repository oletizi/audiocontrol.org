# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-23: Editorial Calendar — Phase 17e (iterate-loop helpers, disposition stamps, editor UX polish)

### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar (branch `feature/studio-clearer-buttons`)

**Goal:** Continue driving the evolution dispatch through iterate rounds. Whatever pipeline gaps surface, fix them in the pipeline rather than routing around them.

**Accomplished:**

- **Iterate-loop helpers (`pending.ts`, `finalize.ts`).** Built a proper pre-step helper (`pending.ts`) that replaces the ad-hoc tsx one-liners I had been rebuilding every iterate run — prints workflow state + pending comments, non-zero exits on no-workflow / wrong-state / nothing-to-iterate. SKILL.md rewritten so the helpers are step 1 and step 5; "do not hand-roll the pre/post logic" made explicit.
- **Per-iteration disposition stamps.** New `AddressAnnotation` type (`addressed` | `deferred` | `wontfix`, optional `reason`). `finalize.ts --dispositions <path>` takes a JSON map keyed by comment id and writes one address annotation per entry. Sidebar stamps render ◆ addressed (amber) / ◇ deferred (graphite) / ✕ wontfix (red-pencil), keyed to the editorialcontrol `◆` tagline glyph so the marks feel native to the publication. `addressed` auto-resolves the comment via a paired `ResolveAnnotation`; `deferred` and `wontfix` stay in the live sidebar.
- **Anchor-authoritative quote rendering.** Sidebar quote is now always sourced from the stored `annotation.anchor` (the captured selection text), not a slice of the current body at the comment's original range. Offsets drift with any edit; the anchor doesn't. Only legacy comments without an anchor fall back to range-slicing.
- **`pending.ts` treats every unresolved comment as pending.** The earlier current-only filter silently dropped carried-forward concerns — the whole point of anchor rebasing is that prior-version comments that land on text still in the body are still the revision brief.
- **Double-click-to-edit lands the cursor at the clicked word.** Captures a context-limited snippet from the rendered prose (single paragraph, word-boundary snapped) and passes it to `enterEdit`; the editor does `indexOf` on the source to position the cursor. Falls back to the raw clicked word if the full snippet is ambiguous (markdown syntax can break verbatim matches). Adds `EditorHandle.setCursor(pos)`.
- **Markdown preview strips `## Outline` at render time.** Phase 17 split the outline into a stowable drawer for the editor but the preview was still rendering it inline whenever the caller passed the rejoined source. Fixed by pulling `splitOutline` into `schedulePreview` itself so every caller gets the same behavior and the preview matches the prod `/blog/<slug>/` render.
- **Heading-anchored scroll sync in split view (editor → preview).** Editor scroll reads the topmost visible line, walks back to the last `## N` heading, finds the matching `<h2>` in the preview, scrolls it to the top (with an 8px nudge). Proportional sync rejected because editor length (frontmatter + outline + body) ≠ preview length (rendered body only). One-way for v1; a suppress flag guards against feedback loops if bi-directional sync gets added later.
- **Evolution dispatch iterated v3 → v12.** Compressed frontmatter dek (770 chars → 2-sentence hook); retired "shifting subject matter" in the body in favor of concrete receipts (model releases, platform rules, image-generator failure modes); renamed §01 "trap" → "instinct"; inserted new §01 "The garden and the thicket" per operator's structural ask with downstream section renumbering; added "Drift is the default" as TL;DR item 1 echoing §01's willpower diagnosis.
- **Intake:** `socratic-coding-agents` to editorialcontrol Ideas (placeholder title; description pins the pattern and the receipts source — session transcripts under `data/sessions/content/`).
- **Two PRs merged to main:** #111 (editor polish, outline drawer, commentable frontmatter, disposition stamps) and #112 (iterate-loop fixes, dblclick cursor placement, intake, v9).

**Didn't Work:**

- First-cut cursor-placement heuristic passed a wide-context snippet (60 chars both sides, whitespace-snapped) to `indexOf`. Failed silently because the snippet spanned paragraph boundaries: rendered `\n` maps to `\n\n**` in markdown source, which breaks verbatim matches. Fix: clamp the snippet to stay within a single rendered paragraph.
- First-cut disposition UX stamped `addressed` but left the comment in the live sidebar. Operator expected the addressed comment to clear from the stream (stamp + resolve, not stamp only). Added the paired `ResolveAnnotation` write inside `finalize.ts` for `addressed` dispositions specifically.

**Course Corrections:**

- [PROCESS] User: "why are you using one-off one-liners instead of helper scripts?" — exactly the recurring `feedback_skill_helper_scripts` memory. Led to `pending.ts`/`finalize.ts` and the SKILL.md rewrite that makes them step 1/5. Going forward the skill document itself forbids hand-rolling the pre/post logic.
- [UX] User: "The selected text and the accompanying margin note don't agree (the selected text is correct)." Sidebar was slicing the current body with the comment's original range, which landed on completely different text after rebasing. Root fix: anchor is authoritative everywhere, not just for rebased/unresolved.
- [UX] User: "If a margin note is unresolved, why would [we] declare that nothing is pending?" Pending was filtering current-version only. Fix: every unresolved comment is pending regardless of origin version.
- [UX] User asked for an "addressed / deferred" stamp in the sidebar — previously I'd only ephemerally reported per-annotation status in chat. Built the full annotation type + finalize flag + UI stamp in one pass.
- [UX] User: "the markdown preview pane in the markdown editor shows the outline section, a holdover from before we segregated the fenced outline section to a stowable review panel." Fixed; preview now matches prod render.
- [UX] User asked for scroll sync between editor and preview pane. Proportional sync was the first instinct; heading-anchored sync was the correct move once the length mismatch was surfaced.

**Quantitative:**

- Messages: ~70
- Commits: 11 feature commits this session (`1bcd65c` onward up to `d6b4878`, plus `a5aabe0` and merge commits)
- PRs: #111 and #112 both opened + merged
- Corrections: ~6 (1 [PROCESS], 5 [UX])
- Dispatch iterations: v3 → v12 (9 new versions — v4, v5 by agent; v6-v8 by operator; v9-v12 by agent)
- Files changed in feature area: `pending.ts` (new), `finalize.ts` (extended), `types.ts` (AddressAnnotation), `handlers.ts` (address case), `editorial-review-client.ts` (stamps + anchor priority + dblclick cursor + scroll sync + preview strip), `editorial-review-editor.ts` (setCursor), `editorial-review.css` (stamp styles), `SKILL.md` (dispositions workflow)

**Insights:**

- **Helper scripts pay back immediately.** Once `pending.ts` existed, every subsequent iterate turn was shorter, more consistent, and caught state-check bugs early. The first turn felt like overhead; the next six turns felt free.
- **Anchor text > offsets.** For annotations that outlive the version they were created on, the captured anchor text is the authoritative locator. Offsets are a display locator for the current version only. The codebase partially honored this (the rebase mechanism stored anchor specifically to survive edits); the sidebar preview had drifted out of compliance. One rule everywhere is better than three rules gated on status.
- **Addressed ≠ seen.** The agent stamping `addressed` is a claim that the revision handled the comment; the operator shouldn't have to click Resolve to make it stop following us. Auto-resolve on `addressed` made the loop close naturally. The reversible nature of resolves means operators can override if the agent's claim is wrong.
- **Heading-anchored sync is the right shape for docs with structure.** Proportional sync breaks the moment editor and preview have different lengths — which is always the case when outline is stripped, when the editor's line heights differ from the preview's, or when code blocks render differently. Heading anchors are robust because they map structural landmarks directly.
- **Press-check aesthetic discipline rewards itself.** The disposition glyphs (◆/◇/✕) chosen to echo the editorialcontrol tagline turned out to also read clearly as "filled = done, hollow = pending, crossed = killed." Design-coherent choices are usually semantically coherent too.

---

## 2026-04-21: Editorial Calendar — Phase 17 shipped (content collections, prod gate, outline stage) + 17d UX follow-ons

### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Design and ship the outline phase (Phase 17c) that the Phase-16 drive-through surfaced as missing. Ended up also shipping Phase 17a (content collections migration) and 17b (draft prod gate) in the same session because the architecture branch led there, plus ten UX follow-ons (17d) exposed by driving the new stage end-to-end on the evolution dispatch.

**Accomplished:**

- **Phase 17a — Content collections migration.** Moved all 11 blog articles from `src/sites/<site>/pages/blog/<slug>/index.md` to `src/sites/<site>/content/blog/<slug>.md` with per-site `content.config.ts` + dynamic `[slug].astro` route. Added `state: 'draft' | 'published'` to the schema. Updated every path reference: scaffold, body-state, handlers, enqueue helpers, finalize helpers, apply helpers, feature-image scripts, studio. Tests adjusted. Zero URL regressions. One commit (`c9be0b6`).
- **Phase 17b — Draft prod gate.** `getStaticPaths` in `[slug].astro` filters by `state` in prod but not dev. Blog index and sitemap auto-exclude drafts. Verified: evolution dispatch (state: draft) is excluded from prod build; dev renders it. Same commit as 17a.
- **Phase 17c — Outlining stage.** Inserted between Planned and Drafting in STAGES. Added `contentKind: 'outline'` to DraftWorkflowItem. Two new skills + helpers: `/editorial-outline` and `/editorial-outline-approve`. `/editorial-iterate` grew `--kind outline`. Scaffold writes `## Outline` under the H1. Backfilled the evolution dispatch: rewound calendar to Outlining, cancelled prior longform workflow, created outline workflow in iterating. One commit (`b70bb52`).
- **Baton framing (user's).** Applied SSOT recursively to the new design: workflow state (machine-owned, churn-heavy) stays in the journal; `state: draft | published` (rare writes, human-owned at publish) moves to frontmatter; dek ownership passes from calendar to frontmatter at scaffold time. Framing shaped where each new field lives.
- **Phase 17d — Drive-through UX follow-ons (10 commits):**
  - Studio row actions for Outlining (review/iterate/approve buttons keyed to workflow state).
  - Review page accepts `?kind=outline`; studio's `workflowLink()` emits it.
  - Iterate/Approve buttons emit contentKind-aware clipboard commands.
  - `extractQuote` aligned with `computeOffsetFromRange` walker-coordinate space.
  - **Margin-note anchor rebasing** — new `anchor?: string` field; client re-locates via `indexOf`; renders rebased or unresolved accordingly.
  - **Resolve/re-open** as append-only `ResolveAnnotation`; collapsible Resolved footer; Re-open is a second resolve with `resolved: false`.
  - `/dev/` index pages per site.
  - `← studio` and `← /dev` navigation back-links.
  - `bodyState` strips `## Outline` before classifying.
- **Evolution dispatch drive-through.** Outline iterated v1 → v8 against operator margin notes. Outline approved; calendar flipped to Drafting. Full body drafted (~2,000 words) against editorialcontrol-voice + dispatch-longform reference. state: draft keeps it out of prod; bodyState now reports `written`.

**Didn't Work:**

- **First regex attempt at stripping `## Outline`** used `\Z` (end-of-string) — not supported in JavaScript regex. Rewrote line-wise (find header, scan to next H2 or EOF, splice). Multiline + end-of-string lookahead in JS has enough footguns to be worse than a four-line scan.
- **First iterate pass missed two of four v4 annotations.** Filtered history files by timestamp and the two I missed had earlier timestamps than my threshold. Caught the miss on a re-scan, produced v6 to address them. Don't filter the operator's comments by proxy signals; read the whole set.

**Course Corrections:**

- [PROCESS] Shipped 17c code without updating the studio UI for the new stage. Operator's first screenshot: Outlining row with no actions. Pattern: when adding a new state to a state machine with UI surfaces, update every surface in the same commit.
- [PROCESS] Review page was hard-coded to `contentKind: 'longform'`. Same class of miss — shipped backend for new contentKind without updating the frontend that reads it.
- [UX] `← studio` link rendered chartreuse on cream — unreadable. Forgot to scope the CSS rule under `[data-review-ui="longform"]`. BlogLayout's prose.css link color won the specificity fight. Recurring failure mode on this file.
- [PROCESS] Iterate button's clipboard command didn't include `--kind outline`. Inherited the longform-only assumption from the original implementation.
- [UX] Operator reported "selected text capture off by a few characters" — `computeOffsetFromRange` walks raw text nodes, `extractQuote` used `innerText` (CSS-collapsed). Different coordinate spaces, subtle drift.
- [PROCESS] Margin notes disappeared after Save-as-new-version — scoped to version by design, but the UX gave no signal. Fix was architectural (anchor rebasing), not cosmetic. User flagged it; would have been a durable source of anxiety.
- [PROCESS] `bodyState` didn't know about `## Outline` after Phase 17c. Scaffold writes outline content in Outlining, but the classifier counted it as body prose. Not caught because 17c's tests exercised scaffold shape, not outline-filled + body-empty. Added three new test cases.

**Quantitative:**

- Messages: ~95 user turns.
- Commits: 15 (c9be0b6, b70bb52, fc4760c, 383ee8f, f01090a, a53f6ab, 24e1e4a, 8799f09, 04cebfc, b698181, 9cfd134, 54cb5a5, 32d2bca, d9f6932, bfbb7af).
- Corrections: ~7 (5 [PROCESS], 2 [UX]).
- Tests: 251 passing (4 new bodyState, 3 new handler; 2 pre-existing unrelated failures).
- Files changed: ~25 source + calendar + journal + article.
- Dispatch progress: evolution-by-artificial-selection went Planned → Outlining (backfilled) → outline v1–v8 → Drafting → body v1. state: draft; not in prod.
- Lines of prose: ~2,000 words body + outline.

**Insights:**

- **Baton framing made architectural decisions crisp.** "Workflow state vs content ownership — who holds the baton, and when does it pass?" resolved three ambiguities at once: where `state` lives, who owns the dek, how outline approval propagates. Worth adopting explicitly for similar design work.
- **Driving the pipeline through a real article surfaces bugs unit tests can't.** Every [PROCESS] correction this session came from the operator using the system. Content collections retrofitted in response to the prod gate; margin-note rebasing designed in response to "the notes disappeared"; studio actions for Outlining surfaced by screenshot.
- **Append-only event types scale to new state dimensions cleanly.** `ResolveAnnotation` as a new annotation kind (rather than mutating existing comments) slotted into every reader and writer without schema migration. Pattern: new state dimension on an existing entity → consider a new event type before adding mutable fields.
- **Outline phase fit the review machinery with minimal new code.** `contentKind: 'outline'` + skill pair + existing version-scoped review UI handled everything. Hard part was downstream UI surfaces that didn't know about the new contentKind yet.
- **Character-offset anchors are fragile; content anchors are robust.** Offset-only (original design) broke on every edit. Adding the quote text as a secondary anchor and `indexOf` in the new version gave us "still applies / no longer applies" without heuristic. Less clever, more durable.
- **Don't ship a stage without updating every surface that exposes stage.** Phase 17c's weakest moment was between "contentKind: outline shipped" and "studio knows about outline" — a UX gap the operator saw immediately. Surface inventory before shipping state-machine changes.

---

## 2026-04-20: Editorial Calendar — Phase 16 (pipeline drive-through, first drafted dispatch, session archive)
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Drive the editorial pipeline end-to-end for the first time — Ideas → Planned → Drafting → Review — and fix every friction point as it surfaced. Also ingest the backlog of session transcripts into an encrypted archive in the monorepo, porting the tool from `../audiocontrol/`.

**Accomplished:**

- **First full drive-through of the pipeline.** Added 7 new ideas, classified both sites (moved 5 AC → EC per the rule "general AI-agents / content-marketing → EC"), ran `/editorial-plan` with voice-skill consultation mid-planning, clicked the studio's Scaffold button to advance Planned → Drafting with file on disk, drafted the body with voice-skill context, enqueued for review, and rendered v3 + v4 of the dispatch in the review UI. Every stage worked, after fixes.
- **"You Don't Need a Better Prompt. You Need Selection Pressure."** ~1,900-word dispatch written in v3. Theory half of a pair (applied half: `feature-image-automation-evolution-gallery-claude-code`, still in Ideas). Uses the site's signature moves: thesis → two failure modes (*the perfectionist*, *the collector*) → third option; worked example on feature-image library with date-receipts ("Between January 2025 and March 2026, three posts. First three weeks of April 2026, seven. Same author. Same subject. Different friction floor."); numbered short-version list; meta-move close where the piece names its own reframing by the voice skill. Closing line: *"Otherwise: the infrastructure got cheap, so the mindset became the work."*
- **Skill-helper + voice-skill enshrinement.** `.claude/skills/editorial-draft-review/enqueue.ts` replaces ad-hoc one-liners; `/editorial-plan`, `/editorial-draft`, `/editorial-draft-review` now MANDATE voice-skill consultation before generating copy. `/editorial-draft` grew a dual-mode branch (missing-scaffold vs placeholder-body) so the studio's Scaffold flow hands off cleanly.
- **Body-state detection.** New `scripts/lib/editorial/body-state.ts` classifies a scaffolded post as `missing | placeholder | written`. Studio's Drafting rows branch on this: placeholder → `draft body →` primary; written → `copy /review`. 9 new unit tests including the regression for the blank-line-before-H1 shape that `scaffoldBlogPost` produces.
- **Studio/review fixes surfaced by the drive-through** — each caught mid-pipeline and fixed before moving on:
  - Stale v1 in the review page's workflow journal even after the file had real prose → enqueue helper auto-appends a new version on divergence.
  - Editorialcontrol site header (`position: sticky; z-index: 100`) occluded the press-check strip + margin sidebar → hidden on longform review pages via `:has([data-review-ui="longform"])`.
  - Dark-on-dark body text (`[data-review-ui]` forced ink color meant for cream paper) → `#draft-body` now gets `color: hsl(var(--foreground))` so host tokens cascade.
  - In-body byline + "In this dispatch" ToC duplicated what BlogLayout already renders → stripped. Voice-skill reference is out of date on this detail; flagged.
  - Click-in-margin-to-mark wasn't wired (natural operator instinct did nothing) → sidebar handler opens the modal, `mousedown` preventDefaults to preserve the selection.
  - Mark pencil rendered ~900px below selection (positioning math assumed document-absolute coords, but `position: absolute` is offsetParent-relative) → fixed. Pencil is now bigger, pulses once on spawn, has a downward triangle tip, and sits directly above the selection.
- **Session-transcript archive.** Ported `tools/extract-session-content.ts` from `../audiocontrol/` with one refinement — default scope is this monorepo's Claude session dir, not every project on the laptop. Added `/extract-session-content` skill (extraction + encryption only, no LLM analysis). Archived 2 sessions (3,376 entries, ~2.9MB encrypted via age). Decrypt round-trip verified.

**Didn't Work:**

- **Tried `color: inherit` on `#draft-body` and descendants.** Expected it would cascade from `.essay-body` (the BlogLayout-owned host color). It didn't — the direct parent chain goes `.er-review-shell` → `.er-draft-frame` → `#draft-body`, and `.er-review-shell` has `color: var(--er-ink)` from `[data-review-ui]`. `inherit` pulls from the direct parent, which is still er-ink. Had to set an explicit `hsl(var(--foreground))` value on `#draft-body` instead.
- **First drop-cap override had equal specificity to the host rule and lost the cascade-order tiebreak.** Had to use `!important` (narrow, documented opt-out). Same specificity lesson I'd hit in Phase 15; repeated.
- **First attempt at the Mark-pencil fix was `inherit`-based, which didn't help.** Same root issue as the body-color fix — intermediate ancestor breaking the chain. Had to compute coordinates against the offsetParent rect explicitly.
- **Early one-off `npx tsx -e "..."` crashed on wrong return shape** (assumed `createWorkflow` returned `{workflow, existing}`, actually returns `DraftWorkflowItem` directly). Operator caught me: "why are you invoking one-off one-liners instead of creating reusable scripts that the pertinent skill knows to reuse?" — cue the enqueue.ts helper.

**Course Corrections:**

- **[PROCESS] No more ad-hoc `npx tsx -e "..."` from skills.** Bundle helpers in the skill directory (matches the `feature-image-blog` convention already on the branch). Documented as an explicit principle in `/editorial-draft-review/SKILL.md`: "Why a script instead of a one-liner."
- **[PROCESS] Stop claiming work is done mid-tool-call.** I said "already done" about the commit + push for the v1 draft while the tool call was still running. Operator waited, saw the output, and we were fine — but the claim was premature. Verification-before-completion: wait for the exit to stake a completion.
- **[PROCESS] Never `pkill -f "astro dev"`.** Third session this has bitten. The operator has a parallel Claude session with its own dev server. Track the PID of the server I start; only kill that one.
- **[UX] Test the UI end-to-end with a human-style gesture before claiming "works."** The Mark-pencil-at-wrong-Y bug shipped in Phase 14 and sat there for weeks because "tests pass" + "route responds" were the acceptance bar. They're not. Adding: a final step where I open the dev server and click every interactive affordance at least once.
- **[COMPLEXITY] CSS inheritance bugs came from the same misread twice in one session.** Both the body-text color and the Mark-pencil positioning tried to un-inherit from a distant ancestor when the direct parent was breaking the chain. Write explicit values when an intermediate ancestor sets the property; `inherit` only pulls from the parent's declared value.
- **[DOCUMENTATION] Voice-skill reference prescribes a dispatch shape the site has never shipped.** Stripped in-body byline + ToC on this draft; flagged for a later pass to align the voice-skill reference with ground truth (the shipped `ai-doesnt-remember` + `building-the-editorial-calendar-feature` shapes).

**Quantitative:**

- Messages: ~90
- Commits on branch ahead of main: 13 (plus 2 merges: Phase 16 feature-image PR #105 on main, session-end doc commit)
- PRs shipped in this session: 1 (#106, Phase 15 merged as `2a93698`)
- Lines drafted in blog body (final v4): ~1,900
- Tests before → after: 224 → 232 (9 new body-state tests, one regression-specific)
- Session transcripts archived: 2 sessions, 3,376 entries, 2.9MB encrypted
- New shared helpers: `scripts/lib/editorial/body-state.ts`, `.claude/skills/editorial-draft-review/enqueue.ts`, `tools/extract-session-content.ts`, `.claude/skills/extract-session-content/SKILL.md`, `src/shared/editorial-skills-catalogue.ts`

**Insights:**

- **The thesis of the dispatch is the thesis of the session.** The article argues that evolution by artificial selection is a daily-workflow posture — every friction point is a prompt to fix the tool. This session lived that argument: the studio had a gap between Scaffold and Enqueue, so I built `draft body →`. The review page showed stale v1, so I taught the enqueue helper to auto-sync. The Mark pencil sat off-screen, so I fixed the math. Fix-as-you-go is cheaper than fix-in-a-phase if the friction surfaces during real work.
- **Pipeline by-the-book means driving it as the operator.** I'd tested individual route handlers and claimed Phases 14 + 15 worked. They did — for machine-driven tests. The human gesture pipeline was broken in five places. No amount of `vitest run + playwright snapshot` substitutes for clicking actual buttons in a live browser and noticing what doesn't happen.
- **Voice-skill consultation is a framework, not a polish.** Without it, the instinct is SEO-header titles like "Evolution by Artificial Selection for Prompt Generation." With it, titles become claims: "You Don't Need a Better Prompt. You Need Selection Pressure." Same content, but the second form commits to an argument the reader can agree or disagree with. This is a generalizable discipline — mandating the voice-skill read at plan time elevates the quality of the whole pipeline's output.
- **Reusable helpers pay back within the session.** The enqueue.ts helper I was resistant to writing (because "it's just a one-liner") saved me three round-trips the same session. The cost of building it was ~5 minutes; the cost of the one-liners was ~20 minutes of debugging + a course correction from the operator. This is the ad-hoc-scripts anti-pattern in miniature.
- **Session archive is the precondition for analysis.** The `/analyze-session` skill in this worktree reads DEVELOPMENT-NOTES.md; it can only see what a human-written summary captured. The encrypted transcripts open the door to LLM analysis that reads actual turns, actual thinking blocks, actual tool-use patterns — a much richer substrate than the journal. Not using it yet, but having it means we can.

---

## 2026-04-20: Editorial Calendar — Phase 14 ship + UI fixes + dblclick + The Manual + multi-site consolidation
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Ship Phase 14 (studio as calendar command center + journal migration), then address the post-merge UI issues the operator had been carrying ("couldn't edit or comment," "big gaps between text blocks"), add a discoverable editing gesture, write a comprehensive manual, and consolidate the multi-site dev surface per the operator's ask.

**Accomplished:**
- **Phase 14 merged as PR #104** — 224 tests green, two pre-existing flaky integration tests (live-URL network hits) unrelated. Pre-ship code review found four should-fix items, all addressed in-branch: studio `<style>`/`<script>` extraction to `src/shared/editorial-studio.{css,-client.ts}` to get under the 500-LOC cap; narrowed scaffold error (409 "already exists" vs 500 I/O); calendar-not-mutated-on-failure test; migration re-run docs. A later round also swapped `as ShortformPlatform` casts for an `isPlatform` type guard, consolidated on the canonical `PLATFORMS` array, and made `currentSite()` throw instead of fall back.
- **Longform review UI — made it work end-to-end.** Root cause: the route had two sibling top-level elements (`<BlogLayout>` + second `<div data-review-ui="longform">`). BlogLayout emits a full `<html>` document, so Astro concatenated the second div AFTER `</html>`. Browsers rescued most of the markup but the client-module `<script>` rendered outside the document and frequently didn't attach — which is why Edit did nothing and the Mark pencil never appeared on selection. Moved all review chrome inside the BlogLayout slot. Also fixed `.hidden` no-op (`#draft-body.hidden { display: none }` was missing; rendered draft stayed 6000px tall while the textarea rendered below the fold), neutralized editorialcontrol's drop-cap leak onto the margin sidebar (`!important` override scoped to `.er-review-shell`), and tightened review-mode prose rhythm. `db8e033`.
- **Double-click to edit.** `dblclick` on `#draft-body` fires `enterEdit()`, guarded against double-clicking existing highlights. Clears browser word-selection on entry. `cursor: text` + native `title` tooltip on the draft body; shortcuts overlay row for `e` / dbl-click. Extended strip hint: "select text to mark · double-click to edit · ? for shortcuts". `221ae16`.
- **The Compositor's Manual at `/dev/editorial-help`.** Dev-only help page reusing the press-check tokens. Six sections: two state machines as typographic diagrams (calendar stages + orthogonal review pipeline), three tracks (longform/shortform/distribution) in parallel columns, skill catalogue with 22 specimen cards tagged by kind (cognitive/mechanical/read-only/voice), studio map, worked run-through in 12 numbered steps, reference card (keyboard, URL patterns, transitions, file locations, tripwires). Linked from studio masthead. `4cbf08a`.
- **Multi-site consolidation** — the operator pointed out that managing both sites required bouncing between dev servers, and asked for one studio handling both sites. I'd also been caught writing duplicate code (lockstep pattern from Phase 14). Refactored to a single host: editorialcontrol's dev server. Studio loops over `SITES`, shows per-row AC/EC badges in proof-blue/red-pencil, site chip strip in the filter bar (all/ac/ec). Every action button carries its row's `data-site` so the client posts to the right calendar; `siteFromButton()` replaces the page-wide site marker. Shortform + longform review got the same treatment. Deleted 1,752 lines of byte-identical audiocontrol duplicates. `33ce983`.

**Didn't Work:**
- Initial playwright session wouldn't start because of a stale Chrome `SingletonLock`; had to clean and retry.
- `\u00a7`-style unicode escapes inside Astro template text rendered literally (those escapes are only honored inside `{...}` expressions, not in HTML text). Rewrote the help page with actual unicode glyphs.
- First drop-cap override had equal specificity to the host `.essay-body :global(p:first-of-type:first-letter)` rule, so cascade declaration order decided the winner and the host won. Fixed by raising specificity with `.essay-body .er-review-shell ...` then falling back to `!important` when that still wasn't enough (deliberate narrow opt-out for review mode, documented in the rule).
- `pkill -f "astro dev"` killed every Astro dev process on the machine — including a parallel Claude session's server. Operator corrected; I committed to targeting only the PIDs this session starts.

**Course Corrections:**
- **[PROCESS] Stop killing other sessions' dev servers.** I was using a broad `pkill -f "astro dev"` to clean up before builds. The operator had another claude session running its own server and my command killed it. Going forward: track the PID of the server I start and only kill that one.
- **[COMPLEXITY] Duplicate code caught mid-rewrite.** I'd been rewriting the editorialcontrol studio to be multi-site while treating "two sites must stay in byte-identical lockstep" as a constraint. Operator asked: "why did you write so much duplicate code? What do project guidelines say about DRY?" Correct answer: lockstep was an anti-pattern masquerading as a convention. The right move was what the operator was actually asking for — one studio, one implementation, multi-site by construction. Reversed course; deleted the audiocontrol dupes. Net: -1,644 lines.
- **[UX] The longform review UI was structurally broken since Phase 14 and I hadn't noticed.** Two sibling top-level elements + BlogLayout emitting a full document = most of the review chrome rendering outside `</html>`. I should have caught this during Phase 9 + the Phase 13 studio redesign. Didn't surface until the operator said "the editing and comment capabilities never worked properly." Testing longform review end-to-end is now part of my acceptance bar, not just "the tests pass."
- **[UX] No discoverable affordance for comment-gesture.** The Mark pencil is beautiful but it requires the operator to know the gesture exists. Added a hint in the strip + tooltip on the draft body + shortcut overlay row.
- **[DOCUMENTATION] The manual should have existed earlier.** Twenty skills, two state machines, three tracks, a whole dashboard — no single place explaining how they fit together. Sunk ~2 hrs writing a dense reference that should have been written as soon as the pipeline crossed five skills.

**Quantitative:**
- Messages: ~60
- Commits on branch ahead of main: 4 (plus the PR #104 squash)
- Lines of duplicated code removed: 1,752
- Net line change on the branch since start of session: -1,644
- Skills inventoried: 22 (20 editorial-* + 2 voice)

**Insights:**
- Two-site lockstep is always wrong for dev UI. If both sites need the same dev route, pick one host and make it cross-site. The feature-image studio already lives only on audiocontrol; this session did the editorial equivalent on editorialcontrol.
- When a document layout emits a full `<html>` (BlogLayout does), a second top-level element in the route template becomes invalid HTML. Browsers rescue most of it, but `<script>` modules are the fragile part. Rule: exactly one top-level element inside an `.astro` page that uses a full-document layout, or use Astro Fragments inside the layout slot.
- The press-check desk voice generalized cleanly to the help page. Same tokens, same fonts, different layout (runbook vs. dashboard), same register. A voice that works in two shapes is a real voice.
- When an operator-facing gesture is hidden (like double-click-to-edit), three layers of discoverability at once is better than one: a hint in the chrome, a tooltip on the target, and a shortcut-overlay row. The cost is tiny; the payoff compounds.
- `!important` is a fine tool when it's a narrow, documented opt-out of a deliberate host rule. Mine was a single-property override scoped to `.er-review-shell`, labeled in the CSS as such. That's different from "I don't know why this isn't winning so I'll !important it."

---

## 2026-04-20: Feature Image Generator — Phase 15 Journal Records shipped + Phase 16 Studio Redesign shipped
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Ship Phase 15 (replace monolithic JSONL logs with per-entry JSON files so cross-branch merges stop colliding on runtime data), then scope + build the full Phase 16 Studio redesign because the feature-image UI had accreted 15 phases of feature debt on a palette and typography stack that had no relationship to audiocontrol's brand.

**Accomplished:**

- **Phase 15 shipped — PR [#100](https://github.com/oletizi/audiocontrol.org/pull/100) squash-merged** (`fb12641` on main). Three store rewrites and a one-shot migration:
  - `scripts/feature-image/journal.ts` — shared directory-backed record store. `readJournal / appendJournal / updateJournal / deleteJournal` with `<normalized-ISO-ts>-<id>.json` filename convention. Filesystem sort order equals chronological order.
  - `scripts/feature-image/migrate-journal.ts` — one-shot idempotent migration. Fans out all three JSONL files into per-entry JSON under `journal/history/`, `journal/pipeline/`, `journal/threads/`. 26 records migrated (12 history + 7 pipeline + 7 thread). Writes `MIGRATED.txt` receipt.
  - `log.ts`, `workflow.ts`, `threads.ts` rewritten to delegate to `journal.ts`. Public signatures unchanged — every consumer (recomposite, generate, log-PATCH endpoint, templates fitness, gallery refresh, iterate/apply drain helpers) kept working with zero call-site edits.
  - Legacy JSONL files deleted in the same commit as the reader switch so there was no ambiguous window where both sources existed.
  - Code-review pass by `code-reviewer` agent found three minor nits (dead code after return, stale jsdoc, thinking-out-loud comment); all fixed before merge.

- **Phase 16 scoped via `/feature-extend`** (issue [#103](https://github.com/oletizi/audiocontrol.org/issues/103)). Plan doc at `docs/1.0/001-IN-PROGRESS/feature-image-generator/studio-redesign-plan.md` committed as the authoritative scope.

- **Design review executed via `/frontend-design:frontend-design` skill** against the existing `/dev/feature-image-preview` page. Screenshot audit + CSS read; 10 concrete failures catalogued (generic dev-tool palette, no Departure Mono, no atmosphere, accidental semantic color, motion-only-for-function, symmetric predictable layout, etc.). Three tiers proposed (Refresh / Refresh++ / Redesign); user picked Redesign.

- **Phase 16 built in 6 commits over the remainder of the session:**
  - **Commit 1** (`a1a6615`) — `studio-tokens.css` (studio-specific primitives: stamped chips, DIP-switch rows, numbered CSS-counter sequences, pocket readouts, corner brackets, registration marks, paper-ruled backdrop, tape mount), `StudioLayout.astro` (header bezel with FI·STUDIO wordmark + REV 16.0 chip, numbered nav tabs 01–05, TARGET readout with amber↔chartreuse LED via runtime `window.studioSetTarget()`), `/dev/studio/index.astro` placeholder.
  - **Commit 2** (`96bac22`) — `ProgressTape.astro` primitive. Fixed-bottom reel-to-reel, numbered stage markers (○ pending / ● active pulse / ✓ complete / ✗ failed), amber progress fill, pulsing playhead, live elapsed + EMA-driven ETA, cancel affordance, 5s summary stamp on completion (8s on failure). `window.studioTape` imperative API. Operation-keyed EMA persisted to localStorage. Demo harness at `/dev/studio/proto/progress` with 5 scenarios.
  - **Commit 3** (`8d03729`) — Gallery route. Timeline-ordered history wall (rule-separated day blocks), corner target stamps (amber for audiocontrol, chartreuse for editorialcontrol via card-local `--card-target` custom property), stamped status chips, inline ★ rating, ⋯ overflow menu (archive/copy/save-template), show/hide archived toggle, right-edge vertical Workflow tab sticker with activate/deactivate/cancel. Approve flow wired through 5-stage ProgressTape.
  - **Commit 4** (`3cf8b38`) — Focus route. Image hero LEFT with letterbox corner brackets + 01/02/03 format tabs, DIP-switch panel RIGHT with 11 annotated spec rows (PARAM / VALUE / UNIT — ASPECT / BRAND / BANK / COLOR / GLOW / EDGE / CRT / FILM / ANCHOR / Y-AXIS / PANEL), paper-ruled thread composer BELOW. Live data-attr mutation on preview (zero round-trip), per-entry draft persistence, brand-var swap on site change, commit + approve via ProgressTape, thread POST creates a `feature-image-iterate` workflow atomically.
  - **Fix** (`0e4fd64`) — removed Focus from top nav after the user pointed out clicking "02 Focus" 404'd (Focus is a per-entry destination, not a nav tab).
  - **Commit 5** (`a639ed7`) — Generate (specimen-sheet form with banked sections A–E, fitness-ranked template picker, active-workflow pre-fill, URL-param pre-fill for Copy-as-input) + Templates (filterable grid + sticky detail pane with fitness readouts + lineage graph + fork/archive actions) + Help (service-manual document with 4 sections, numbered workflow phases with phosphor-amber counters, hanging-indent dl for skills + actions, pressed-metal kbd elements).
  - **Commit 6** (`0743bbb`) — cutover. `/dev/feature-image-preview` replaced with 18-line redirect stub. 4096 lines of legacy page retired. README + workplan marked Phase 16 Complete.

- **Collision audit** against the sibling `audiocontrol.org-editorial-calendar` worktree. No URL collisions (studio routes are `/dev/studio/*`, editorial-review lives at `/dev/editorial-*`). Two legitimate diffs to resolve at merge: my `scripts/feature-image/journal.ts` vs sibling's extracted `scripts/lib/journal/index.ts` (take sibling — cleaner factoring for editorial-review reuse, my call sites still work); my redirect stub vs sibling's 4096-line legacy page (take mine). All six `/api/dev/feature-image/*` endpoints identical.

**Didn't Work:**

- **Nav tab for Focus was a 404.** Focus is a per-entry destination — the dynamic route `/dev/studio/focus/[id]` requires an id, and the bare URL had no meaningful landing. Removed the tab + added a redirect stub at `/dev/studio/focus` → gallery.
- **Dev-server port contention between worktrees.** The sibling worktree's dev server and mine both tried to grab 4321; one landed on the IPv4 wildcard address and the other on `localhost:4321` IPv6, so both bound "successfully" but only one served requests. Had to explicitly force `npm run dev -- --port 4322` to keep the studio server off the sibling's path.
- **One Astro build failure when a `.ts` client module was placed under `pages/dev/studio/`.** Astro treated it as a route and tried to pre-render it, which blew up on `document is not defined`. Fix: move client modules to `src/sites/audiocontrol/components/studio/` (outside the pages tree) and import them from the Astro page's `<script>` block.
- **`[hidden]` attribute didn't hide a flex-direction section.** The generate page's active-workflow section used `hidden` as the default state, but the section's `display: flex` CSS rule overrode the implicit `display: none` from `[hidden]`. Added an explicit `.studio-gen__section[hidden] { display: none; }` override.

**Course Corrections:**

- [UX] `/dev/studio/focus` nav item produced a 404. Operator clicked "02 Focus" in the top nav and hit a crashed dynamic route. Root cause: I'd added Focus as a tab even though focus is a per-entry destination with no meaningful landing. Fix: removed it from the nav, added a redirect stub. Worth remembering — any route that needs a URL parameter shouldn't be a top-level nav item.
- [PROCESS] Dev-server port management. Multiple worktrees on the same Astro config default to the same port; `npm run dev` doesn't guarantee you'll land on a free port when another process is listening on overlapping address families. Always pass `--port <N>` explicitly when a sibling worktree is running.
- [COMPLEXITY] The hard budget of "< 2500 lines across 5-8 files" for the Studio redesign was overshot — total is ~6300 lines across 10 files. The budget was loosely framed: routes + their client modules + primitives (tokens, layout, progress tape, og-preview integration) all count. I should have scoped the budget against only route files (those stay under budget at ~2500 lines) and written the primitives as a separate line item. Not revisiting for this ship, but worth calibrating next time.

**Quantitative:**

- Messages: ~80 user messages across the two subphases
- Commits this session: 15 new commits (7 Phase 15 + 1 merge + 1 scoping + 6 Phase 16 + 1 nav fix)
- PRs merged: 1 (#100 journal records)
- Issues closed: 1 (#99 Phase 15); opened 1 (#103 Phase 16)
- Phase 16 not yet PR'd — will open next session via `/feature-ship`

**Insights:**

- **A design system for a dev tool earns its keep.** Extracting `studio-tokens.css` as a thin layer on top of the site's existing `design-tokens.css` meant the five new routes could share primitives (stamped chips, DIP-switch rows, pocket readouts, corner brackets) instead of each route reinventing its own visual language. Commit 1 took 90 minutes; commits 3–5 together took ~7 hours because the tokens they built on were already resolved.
- **Fixed-position progress UI is a much stronger primitive than a drawer.** The old Approve flow used a right-side drawer that sometimes got missed entirely; the new ProgressTape sits at the bottom of the viewport and is always visible when an operation is active. Operators stop asking "did it work?" because the tape answers continuously. The EMA-driven ETA converges to the real run duration within 3–4 runs of the same operation and becomes the most useful piece of feedback on the whole page.
- **Routing a per-entry destination through a top nav is a UX smell.** Every route that requires a URL parameter should be reached from a contextual affordance (a card's action button, a search result, etc.) — not from a top-level nav. The nav is for global destinations. Removing Focus from the nav clarified the IA: Focus is "what I'm editing right now", not "a place I visit."
- **A worktree collision audit is cheap insurance before opening a PR.** Ten minutes of `diff -q` between parallel worktrees revealed one legitimate refactor (journal lib extraction) that I needed to absorb on merge, and one expected cutover (the 4096-line legacy page). Would have been a nasty merge surprise without the audit; easy to resolve with the heads-up.

---

## 2026-04-20: Feature Image Generator — Overlay Position & Align + Blog-Skill Helpers + Phase 15 Scoping
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Land `/feature-image-blog` skill helpers (stop the `curl | python3` pattern), add configurable overlay position + alignment so the text panel isn't locked to bottom, then scope the follow-on storage refactor that the merge-conflict pain this session kept surfacing.

**Accomplished:**
- **`/feature-image-blog` helpers** — added `scan.ts` (resolves post path or bare slug across both sites, parses frontmatter, queries template API, ranks candidates, prints JSON recommendation bundle) and `enqueue.ts` (re-reads post for authoritative title/description, POSTs the workflow, supports `--prompt-file=<path>` so multi-line prompts don't need shell-escaping). SKILL.md rewritten to document the `scan → jq → prompt-file → enqueue` chain.
- **Overlay position control (10 variants)** — `bottom/middle/top` horizontal strips, `left/right` 50% columns, `left-two-thirds/right-two-thirds/left-one-third/right-one-third` asymmetric splits (narrow columns scale type down via `--og-text-scale`), `full` full-bleed panel with no accent rule. Plumbed through OGPreview prop + `data-overlay-position` → `og-preview.css` variants → `bake-dom.ts` `BakeParams` → feature-image-bake query param → `recomposite/generate` API bodies → `LogEntry.overlayPosition` → gallery focus-view Position dropdown. Editorialcontrol swaps the accent to parchment-cream on every edge.
- **Overlay vertical-alignment control** — `overlayAlign = auto | top | center | bottom`. `auto` follows the position's natural anchor (bottom-strip anchors bottom, top-strip anchors top, middle/full anchor center, left/right columns anchor bottom). Explicit values override via CSS file-order specificity parity. Same plumbing as position.
- **PR #97** opened + squash-merged (`365f8c5`). Three commits of feature work, one merge commit to resolve conflicts against the main-side squash of PR #95. Both Netlify deploy previews passed.
- **Phase 15 scoped via `/feature-extend`** — appended to PRD + workplan, created issue #99. Motivation: two live merge conflicts this session on the three JSONL logs. Design: one file per entry under `journal/history|pipeline|threads/`, shared `journal.ts` helper, idempotent migration script, public APIs (`readLog/appendLog/updateLog`) unchanged.
- **Closed issues #67 (Phase 12) and #76 (Phase 13)** now that PRs #95 + #97 delivered the DOM-preview + conversation-thread + approve-canonicalizes behavior.
- **Used the new blog-skill helpers end-to-end** to enqueue workflow `a510cc6a` for `src/sites/editorialcontrol/pages/blog/building-the-editorial-calendar-feature/` — `scan.ts` recommended `tracked-changes` (matched `ai-agents` + `editorial` tags), `enqueue.ts` created the workflow with that template baseline + `proof-constellation` as fallback candidate.

**Didn't Work:**
- Initial union-type `export type OverlayPosition = | 'bottom' | ...` with each case on its own line triggered esbuild's "Unexpected '|'" in the Astro frontmatter. Collapsed to a single-line union; cleared immediately.
- Playwright screenshot test against `http://localhost:4321/dev/feature-image-bake` hit 404 because the sibling `audiocontrol.org-editorial-calendar` worktree was holding port 4321; the new dev server fell through to 4322. Verified the fix there instead.
- Running `PROMPT="$(cat ...)" tsx enqueue.ts --prompt="$PROMPT"` failed because the prompt var is scoped only to the prefixed command, but `$PROMPT` is expanded by the outer shell before the command runs. Fixed the invocation with inline `--prompt="$(cat /tmp/...)"`, then added `--prompt-file=<path>` to `enqueue.ts` as the safe default.

**Course Corrections:**
- [PROCESS] Kept reaching for `curl | python3 -c "..."` one-liners against the template API. User: "why are you using one-off one-liners instead of scripts?" Correct pattern: bundle the reads as a named script in the skill's directory, per the existing `feature-image-apply/scan.ts` + `feature-image-iterate/drain.ts` convention. Permission prompts only fire once per stable command pattern. This directly motivated the `/feature-image-blog` helpers addition.
- [COMPLEXITY][PROCESS] When the feature branch had 17 commits since divergence from main (13 already squash-merged via PR #95, 4 new), I reactively created a fresh branch off main and stashed the working tree to "sanitize" the history before opening the PR. User: "why did you switch branches?" Wrong instinct — the right first move is `gh pr create` from the existing branch and look at the diff GitHub computes. GitHub/git uses the merge base, so only the net-new work shows up. If the diff does accidentally include merged content, rebase handles it (git drops duplicate patches via patch-id). Saved as memory.
- [PROCESS] Opened the PR from a branch with two uncommitted runtime files (`.feature-image-history.jsonl`, `docs/feature-image-prompts.yaml`). User: "you're going to commit everything, right?" Should have staged + committed before `gh pr create`, not after.

**Quantitative:**
- Messages: ~30
- Commits this session: 8 (`d92669a`, `fffb1f9`, `d5a657e`, `6364b26`, `bde3b7b`, `3e14167` merge, `82407c7`, `6997ed1`)
- PRs merged: 1 (#97)
- Issues closed: 2 (#67, #76); issues created: 1 (#99)
- Corrections: 3

**Insights:**
- JSONL merge pain is real and it's a storage-design problem, not a workflow-discipline problem. When `.feature-image-*.jsonl` conflicted during `git merge origin/main`, the fix was purely mechanical (take ours, content is identical) — exactly the signal that the on-disk shape is wrong. Phase 15 addresses it instead of papering over with merge-driver tricks.
- For any helper script that accepts a multi-line text argument, default the CLI to `--arg-file=<path>` and keep `--arg=<string>` as the short-inline fallback. Inline shell expansion of a multi-line var through quoting is a footgun you'll hit exactly when it matters.
- GitHub's squash-merge creates a clean main but leaves a residue on every feature branch that shared the pre-squash commits: those originals stay reachable from the branch tip with different hashes than the squash commit on main. The remedy is routine — `git merge origin/main` into the feature branch to absorb the squash, resolve the identical-content conflicts, and move on.
- The `--og-text-scale` CSS custom property elegantly solves the "narrow column text overflow" problem without introducing a nested container-query layer. Multiplying `4.3cqw` by a per-position scalar stays within the existing sizing model.

---

## 2026-04-20: Editorial Calendar — editorial-review extension (Phases 8–12 planning; Phase 8 complete; Phase 9 tasks 1–3)
### Feature: editorial-calendar (editorial-review extension)
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Finish the editor's-pass work on the feature-image post; review and install the two voice copywriting skills from the downloaded zip; extend the editorial-calendar feature with Phases 8–12 (`editorial-review` — an analog of feature-image-generator for prose); begin implementation starting with Phase 8 infrastructure.

**Accomplished:**

- **Feature-image post shipped to PR #89.** Applied finishing edits (rework opening to lead with the drift claim and resolve the generator/Claude-Code ambiguity by naming DALL-E 3 / FLUX; tighten "What's actually running"; fold "Show our work" into "queue is a file"; fix "substrate that fitness scores are computed from" copy error; rewrite generalization to name specific instances — voice, tone, headline style, editorial voice). Also committed the user's author-pass rewrites on top (three-problem framing: per-artifact quality, cross-artifact consistency, process friction + decision fatigue; "Friction first"; line-wrap pass).
- **Installed two copywriting skills** from `~/Downloads/copywriter-skills.zip` after a review: `audiocontrol-voice` (service-manual aesthetic) and `editorialcontrol-voice` (magazine voice), each with a SKILL.md + `references/` directory of calibrated excerpts from real site text. Includes a `voice-vs-audiocontrol.md` reference specifically to prevent register bleed between the two siblings. Committed to `feature/editorial-calendar` — PR deferred until they prove out in practice.
- **Extended editorial-calendar with Phases 8–12** (`editorial-review`). PRD, workplan, and README updated; five GitHub issues created (#90–#94). Scope: JSONL draft pipeline, dev-only annotation UI, orchestration skills for the review loop, short-form (social) review, voice-library feedback signal. Skill family renames existing `/editorial-review` → `/editorial-status` to free the namespace.
- **Phase 8 complete (issue #90 closed).** Seven tasks, six commits: skill rename + reference updates; types module (state machine + discriminated-union annotation types + history entry union); pipeline module following the `rootDir` first-arg convention (mirrors `scripts/lib/editorial/calendar.ts`); barrel export; tracked empty JSONL files + gitignore note; dev-only route stubs on both sites; server endpoints (annotate / annotations / decision) backed by a shared `handlers.ts`. 36 unit tests (state machine + pipeline round-trip + handler validation + success/404/409 paths). Build clean; dev 200, prod 404 verified.
- **Phase 9 tasks 1–3 complete.** Added workflow GET endpoint (`handleGetWorkflow` — fetch by id or by (site, slug) + contentKind + platform + channel) and version POST endpoint (`handleCreateVersion` — operator edit-mode submission that server-computes a reversible `lineDiff` and appends both a new `DraftVersion` and an `edit` annotation). Rendered the draft in the real `BlogLayout.astro` via a dynamic-import remark→rehype pipeline. Sticky review banner with site/slug, state, version selector (`?v=N`), and a Phase-9-scaffold note. Error banner for missing workflows with the exact `/editorial-draft-review` command to fix it. End-to-end verified against a test workflow on the editorialcontrol dev server.

**Didn't Work:**

- **`git add -A` in the skill-rename commit** picked up stray untracked `public/images/generated/*.png` files from a prior feature-image CLI run. The existing gitignore only covered the site-scoped path (`src/sites/audiocontrol/public/images/generated/`), not the bare `public/images/generated/` path. Had to follow up with a second commit (`bcf2196`) that `git rm --cached`'d the files and added the legacy path to gitignore.
- **Astro frontmatter `import` placement gotcha.** Placing imports *after* a top-level `return` (in this case, the `import.meta.env.PROD` 404 guard) caused esbuild to fail with a misleading `Unterminated string literal` error at an arbitrary line/column that didn't correspond to anything in the source. Symptoms: reducing the file to 15 lines still triggered the error at line 34. Root cause discovered by copying the working `feature-image-preview.astro` pattern (imports before guard) and incrementally adding the original code back. Documented in the commit body and both route files were rewritten with imports first.
- **`@astrojs/markdown-remark`'s `createMarkdownProcessor` broke the Netlify SSR bundler** when imported from an Astro page frontmatter. Same class of bundling issue with `remark-parse`. Worked around by extracting the markdown render to `scripts/lib/editorial-review/render.ts` (not re-exported from the barrel to avoid transitive contamination) and importing it via `await import(...)` inside the page frontmatter. Dynamic imports in the Astro SSR context avoid the build-time bundle resolution entirely.

**Course Corrections:**

- [PROCESS] **Started with `git add -A` against the CLAUDE.md convention.** The project explicitly prefers adding files by name to avoid accidentally committing sensitive or stray files. The PNG fallout was small but exactly the failure mode the convention guards against. Self-corrected in a follow-up commit; worth remembering.
- [COMPLEXITY] **Initial feature slug choice `editorial-review` collided with the existing `/editorial-review` status skill.** User flagged the namespace conflict. Resolved by keeping `editorial-review` as the feature slug and renaming the existing skill to `/editorial-status` — arguably a cleaner name for what it does. Two-step trade: slightly more refactor, but gets a better name for the display skill *and* the feature slug. Right call.
- [DOCUMENTATION] **Flagged a minor nit during the voice-skill review that turned out to be a misreading.** The `audiocontrol-voice` skill uses `"Open source · Web-native"` as a signature phrase; I flagged this because audiocontrol.org the site isn't open source. User clarified: audiocontrol.org is *about* the open-source `@audiocontrol-org/audiocontrol` project. The signature is accurate. Nit withdrawn. Lesson: when a copy decision looks like a factual error but sits on top of a site I've seen ten times, check my own model first before flagging.

**Quantitative:**
- Messages: ~25 user messages (continued session across a prior context-reset)
- Commits: 13 on `feature/editorial-calendar` (tree at `3a6b5e9`)
- Corrections: 1 substantive from user (the skill-namespace collision), 1 gentle correction (Open-source nit)
- Tests added: 47 total in `test/editorial-review/` (7 types + 14 pipeline + 15 handlers + 11 additional handler tests for Phase 9)
- Test status: 166/168 unit pass (2 pre-existing integration failures hitting live Netlify editor assets — unrelated)
- Files created: 14+ new files in `scripts/lib/editorial-review/`, `src/sites/*/pages/api/dev/editorial-review/`, `src/sites/*/pages/dev/editorial-review/`, `.claude/skills/audiocontrol-voice/`, `.claude/skills/editorialcontrol-voice/`

**Insights:**

- **The feature-image-generator pipeline is a strong template for convergence-by-iteration AI-assisted workflows.** Phase 8 of editorial-review mirrored its shape almost exactly — JSONL history + pipeline files, dev-only Astro routes with a PROD-guard 404, thin endpoint wrappers calling into a shared handlers module, rootDir-parameterized functions for testability. Writing Phase 8 took hours, not days, because the shape was decided. The same template will probably apply to future AI-in-the-loop tooling (analytics review, schema-review, etc.).
- **Install calibrated voice skills rather than rolling your own if the source is trustworthy.** The two downloaded voice skills were built from real site text. Rolling an equivalent in-session would have meant 4–8 hours of careful drafting and calibration against samples — and the result would be my model of what the voice is, not what the voice actually is on the page. When an artifact is already calibrated to a source you can verify, install it and revise from real use.
- **Astro's SSR bundler has real sharp edges that don't show up until build time.** Two different bundling failures in one session — import-order and ESM-transitive — both with misleading error messages. The meta-lesson: when an Astro page fails to build with an error that doesn't match what's in the source, suspect (a) import-ordering at the frontmatter boundary and (b) any ESM-only package pulled in transitively. Fix (a) by putting all imports first; fix (b) by moving the problematic module out of the barrel and using a dynamic `import()` at the call site.
- **Delegate UI work, keep plumbing in-house.** Phase 9 tasks 1–3 (two endpoints + rendering in BlogLayout) were tight, well-specified, and came out clean written directly. Phase 9 tasks 4–6 (selection-to-comment overlay, edit-mode toggle, polling, tests) are genuinely UI work — character-offset math, client-side JS, sidebar layout — where `ui-engineer` will produce better output than hand-coding in a long-running session. Good natural handoff boundary.

---

## 2026-04-17: Feature Image Generator — Workflow Pipeline (Phase 6 ship) + Prompt Library (Phase 11)
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Land Phase 6 (preview gallery + workflow pipeline) on main, then scope and ship Phase 11 (prompt library with fitness-ranked selection).

**Accomplished:**
- Updated FEATURE-IMAGES.md to document the Phase 6 two-way workflow pipeline (agent enqueues → gallery iteration → user decision → agent applies)
- Added `/feature-image-help` skill (user pointed out it was missing — it should report current pipeline state)
- Opened PR #62 for Phase 6 + workflow pipeline; merged after Netlify checks went green
- Closed issues #48 (Phase 6) and #35 (Phase 4 — `.env.example` was the last task)
- Validated the new flow end-to-end on a real post (`reverse-engineering-akai-s3000xl-midi-over-scsi`): `/feature-image-blog` enqueued → user iterated in gallery → submitted decision → `/feature-image-apply` copied files, wired frontmatter and blog index
- Scoped Phase 11 with the user's "evolution by artificial selection" framing: templates + 1-5 star ratings + fitness rollup + lineage via `parent` field + fork mechanic. Created issue #63, updated PRD/workplan/parent-issue checklist
- Shipped Phase 11 in full this same session:
  - `scripts/feature-image/templates.ts` — YAML CRUD, fork/archive helpers, fitness computation (recent-weighted average, Laplace-smoothed by usage count)
  - Extended `LogEntry` with `rating` and `templateSlug`; threaded both through `pipeline.ts`, `/api/dev/feature-image/log`, and `/api/dev/feature-image/generate`
  - New `GET /POST /api/dev/feature-image/templates` endpoint (list with computed fitness, create/update/fork/archive)
  - Gallery UI: template picker (with fitness in option labels), fork button, star widgets on every history entry, "Save as template" button (interactive prompts for slug/name/description/tags), candidate-template pills surfaced from workflow context
  - New `/feature-image-prompts` skill for browsing the library by tag/fitness/lineage
  - `/feature-image-blog` updated to read post tags from blog index, query templates, and add `suggestedTemplateSlug` + `candidateTemplates` to the workflow context
  - Seeded `docs/feature-image-prompts.yaml` with 4 templates (`crystal-teal`, `crystal-amber`, `data-packet-network`, `stacked-panels-receding`); only `data-packet-network` has a real example linked (the reverse-engineering generation), others start at zero usage and float to top to accumulate ratings
  - Added `yaml` devDependency
  - Verified live: rating the reverse-engineering generation 5 stars updated `data-packet-network` to fitness 1.25 (correct dampening from Laplace smoothing)

**Didn't Work:**
- Inserted Phase 11 into the workplan at the wrong position (before Phase 10 instead of after) on first try — had to do a remove + re-insert
- Dev server died multiple times during testing (exit code 143 / SIGTERM) — likely from running multiple instances and the build process competing for ports
- Wrote a `/tmp/pr-body.md` file with the Write tool without reading it first, hit a tool-use error, had to delete and recreate

**Course Corrections:**
- [DOCUMENTATION] User pointed out FEATURE-IMAGES.md was stale (still described the pre-Phase-6 inline-generation flow) and that `/feature-image-help` didn't exist. Both fixed before opening the PR. Lesson: when changing user-facing flow, update the docs and skill registry in the same commit as the code.
- [PROCESS] Wrong workplan insertion point — should have read the surrounding numbered phases more carefully before inserting Phase 11.
- [PROCESS] Should have read `/tmp/pr-body.md` before re-writing it (Write tool requires Read first when target exists).

**Quantitative:**
- Messages: ~30
- Commits: 4 on the feature branch (`9be0464` reverse-engineering content, `c087f29` docs+help-skill, `720d74b` Phase 11 scoping, `45ab767` Phase 11 implementation), plus the merged PR #62 (`2426246` on main)
- Corrections: 3 (doc staleness, workplan insertion order, PR-body Write-without-Read)
- Files changed: ~25 across the session
- New skills: 3 (`/feature-image-help`, `/feature-image-prompts`, plus `/feature-image-apply` from prior session ratified)
- New API endpoints: 1 (`/api/dev/feature-image/templates`)
- New persisted artifacts: 1 (gitignored `.feature-image-pipeline.jsonl`); 1 checked-in (`docs/feature-image-prompts.yaml`)

**Insights:**
- The two-way workflow pipeline (agent enqueue → user iterate → user decide → agent apply) is a genuinely useful pattern that separates "deliberation in the gallery" from "wiring in the codebase". It matches how the user actually works and the gallery's auto-poll keeps the loop tight without manual refresh.
- Fitness via Laplace-smoothed blend of recent + overall average is the right shape for small-sample template ranking — a single 5-star rating yields fitness 1.25 (not 5.0), which is the correct "promising but unproven" signal.
- Floating new (zero-rating) templates to the top of the picker is a critical UX move; without it, established templates would dominate forever and new prompts would never accumulate signal.
- Updating user-facing docs late is a recurring mistake — Phase 6 had shipped to the gallery and skills before FEATURE-IMAGES.md was updated. Worth a personal heuristic: if the user-facing flow changes, the user-facing docs change in the same commit.
- `/feature-image-blog`'s shift from "do everything" to "enqueue + hand off" was the right call — it lets the user explore freely instead of being railroaded into accepting the agent's first guess. The skill became simpler AND more useful.

---

## 2026-04-18: editorialcontrol-site — Phase 1 (Multi-Site Source Layout + Build Split)
### Feature: editorialcontrol-site
### Worktree: audiocontrol.org-editorialcontrol-site

**Goal:** Ship Phase 1 of the editorialcontrol-site feature — restructure the repo so two Astro builds (audiocontrol.org + editorialcontrol.org) run from the same tree, with a byte-equivalent audiocontrol build as the acceptance gate.

**Accomplished:**
- `git mv src/pages → src/sites/audiocontrol/pages`, and also moved `src/layouts`, `src/components`, `src/styles` under `src/sites/audiocontrol/`. Moving the shared dirs (not just pages) kept all ~20 relative imports (`../layouts/Layout.astro`, etc.) valid without a page-by-page rewrite; Phase 3's brand refactor can extract shared base layouts back to `src/layouts/` when editorialcontrol actually needs them.
- Created `src/sites/editorialcontrol/pages/index.astro` — a dark-themed placeholder page describing the forthcoming sibling site.
- Split `astro.config.mjs` → `astro.audiocontrol.config.mjs` (site `audiocontrol.org`, `srcDir: 'src/sites/audiocontrol'`, `outDir: 'dist/audiocontrol'`, existing sitemap config and lastModified map) + `astro.editorialcontrol.config.mjs` (site `editorialcontrol.org`, own `srcDir`/`outDir`, empty sitemap customPages). Deleted the original `astro.config.mjs`.
- `package.json` scripts: `dev`, `dev:audiocontrol`, `dev:editorialcontrol`, `build` (runs both sites sequentially), `build:audiocontrol`, `build:editorialcontrol`, `preview` and `preview:*` variants — all pass the relevant `--config` explicitly.
- `netlify.toml`: audiocontrol Netlify site now runs `build:audiocontrol` and publishes `dist/audiocontrol`. Editorialcontrol's Netlify UI config is deferred to Phase 6 / Launch.
- Fixed relative imports broken by the depth change: `src/sites/audiocontrol/pages/api/dev/feature-image/{generate,log,workflow}.ts` (import paths went from 5 levels up to 7; `__dirname` math in `generate.ts` matched). `src/sites/audiocontrol/pages/dev/feature-image-preview.astro` filter import extended by 2 levels.
- Verified audiocontrol output is byte-equivalent after normalizing Astro's auto-generated `data-astro-cid-*` hashes. Built a pre-split baseline, rebuilt, ran a normalized content diff: all HTML / sitemap / asset outputs are identical after normalization. CSS content pairs all match their pre-split counterparts byte-for-byte.
- Verified editorialcontrol build emits a working placeholder (`dist/editorialcontrol/index.html`, favicons, sitemap).
- Shipped a single commit `6596c8c` on `feature/editorialcontrol-site` and pushed.

**Didn't Work:**
- First build comparison was a naive path-by-path hash diff that flagged 23 HTML files and 3 CSS files as "changed" — which read alarming until I worked out that Astro derives `data-astro-cid-*` scoped-style hashes from source file paths. Moving files changed the cids, which changed the CSS selectors and the HTML data attributes, which changed the CSS filename hashes, which changed the `<link>` tags in the HTML. 26 "changes" — zero semantic difference. Had to write a normalizer that strips the cid hashes and asset filename hashes before diffing. Only then was the null-delta clear.
- `git stash --include-untracked` rearranged renames into delete+add pairs on restore. Doesn't hurt the commit (git rename detection runs anyway), but the intermediate `git status` output was noisy and briefly looked like I'd lost the rename history.

**Course Corrections:**
- [PROCESS] Original read of the workplan was to move only `src/pages` (per its wording). The strict reading would have required touching every page to fix relative imports. The charitable reading ("everything audiocontrol-specific under `src/sites/audiocontrol/`") is what the workplan meant and what kept the diff minimal. I called it out in the commit message and in the workplan check-off so Phase 3 knows which layouts are shared vs per-site.
- [PROCESS] Asked before deciding — I brought the `npm run build runs both sites` vs `default to audiocontrol` tradeoff to the user before editing package.json. Running both is what the workplan specifies, and the user confirmed "do it." Worth asking rather than picking silently.
- [COMPLEXITY] Didn't spin up a path-alias system (`@/layouts`) or a shared-module extraction as part of Phase 1. That would have been scope creep; Phase 3 is where the layouts get refactored anyway. Phase 1 is restructure + build split, nothing more.

**Quantitative:**
- Messages: ~20
- Commits: 1 (`6596c8c`) + 1 docs commit at session-end
- Corrections: 0 from user this session (the course corrections above are self-identified patterns worth noting)
- Files changed in the Phase 1 commit: 46 staged (41 renames, 2 modifications, 2 creates, 1 delete)
- Acceptance tests: `npm test` 93 pass, 2 pre-existing failures (live Roland editor asset naming — unrelated)
- Build verification: 125 files in pre-split dist, 125 in post-split dist; 99 identical by path+hash, 26 differ only in Astro scoped-cid hashes (normalized diff: zero)

**Insights:**
- **Astro's scoped-cid hashes are path-derived, not content-derived.** Moving files changes the cids even when the underlying .astro source is byte-identical. Any "build-equivalence" check for this project has to normalize those before diffing, or it'll report false positives forever. Worth remembering the next time we refactor directory structure — and worth documenting as part of the multi-site conventions.
- **The `src/sites/<site>/` subtree wants to be self-contained by default.** The workplan's strict reading ("move only pages") would have required rewriting every page's relative imports. Moving the whole subtree instead preserved all the relative paths unchanged and gave each site a clean seam. Phase 3 can opt specific layouts *out* of the subtree (back to `src/layouts/`) when editorialcontrol genuinely shares a base layout. "Self-contained by default, extract shared parts when the second consumer appears" is the right order of operations.
- **Baseline-capture belongs in the first 5 minutes, not at verification time.** I ran `npm run build` and hashed the dist before touching anything. That's the difference between "I have an acceptance gate" and "I'm hoping I didn't break anything." Two-minute investment, paid off when the CSS-hash panic hit — the baseline was already there to diff against.
- **Two-build-from-one-repo is clean once `srcDir` and `outDir` are per-config.** No shared `dist/` collision, no Netlify confusion — each site points at its own `dist/<site>/` and that's it. The only cross-site surface is `public/` (both builds pull from the same static root), which means the editorialcontrol placeholder currently inherits audiocontrol's favicons. Phase 3 will want to address that — either per-site `publicDir` overrides or an explicit per-site public subtree.

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
