# Workplan: Editorial Calendar

**Feature slug:** `editorial-calendar`
**Branch:** `feature/editorial-calendar`
**Milestone:** Editorial Calendar
**GitHub Issue:** oletizi/audiocontrol.org#29

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#29 |
| Phase 1: Calendar Structure & Basic Management | oletizi/audiocontrol.org#40 |
| Phase 2: Post Scaffolding | oletizi/audiocontrol.org#41 |
| Phase 3: Analytics Integration | oletizi/audiocontrol.org#42 |

## Files Affected

- `docs/editorial-calendar.md` — the calendar itself
- `scripts/editorial.ts` — CLI entry point for calendar operations
- `scripts/lib/editorial/types.ts` — calendar entry types and stage definitions
- `scripts/lib/editorial/calendar.ts` — markdown calendar parser and writer
- `scripts/lib/editorial/suggest.ts` — analytics integration for topic suggestions
- `scripts/lib/editorial/scaffold.ts` — post scaffolding (directory, frontmatter, GitHub issue)
- `scripts/lib/editorial/index.ts` — barrel export
- `.claude/skills/editorial/` — Claude Code skill definition

## Implementation Phases

### Phase 1: Calendar Structure & Basic Management

**Deliverable:** Can manage a markdown editorial calendar via Claude Code skill

- [ ] Define calendar entry types and stage definitions (types.ts)
- [ ] Design markdown calendar format (machine-parseable tables per stage)
- [ ] Implement calendar markdown parser and writer (calendar.ts)
- [ ] Create initial `docs/editorial-calendar.md` with stage sections and any existing published content
- [ ] Create `/editorial` skill definition
- [ ] Implement `add` command: add a new entry to Ideas
- [ ] Implement `plan` command: move entry to Planned, set target keywords
- [ ] Implement `review` command: display calendar status across all stages

**Acceptance Criteria:**
- `/editorial add "Post Title"` adds an entry to the Ideas section
- `/editorial plan post-slug` moves an entry to Planned
- `/editorial review` shows a summary of entries in each stage
- Calendar file is human-readable and machine-parseable
- Existing published posts are pre-populated in the calendar

### Phase 2: Post Scaffolding

**Deliverable:** `/editorial draft` creates a ready-to-write blog post with all boilerplate

- [ ] Implement `draft` command: create blog post directory and index.md with frontmatter
- [ ] Generate frontmatter from calendar entry metadata (title, description, target keywords)
- [ ] Create a GitHub issue for the post with acceptance criteria
- [ ] Move calendar entry to Drafting stage with link to issue
- [ ] Implement `publish` command: update calendar with publish date, close GitHub issue
- [ ] Follow existing blog post conventions from workflow-playbooks.md

**Acceptance Criteria:**
- `/editorial draft post-slug` creates `src/pages/blog/<slug>/index.md` with correct frontmatter
- A GitHub issue is created and linked in the calendar entry
- `/editorial publish post-slug` marks the entry as Published with the current date
- Generated file structure matches existing blog post conventions

### Phase 3: Analytics Integration

**Deliverable:** Virtuous feedback loop — analytics drives topic suggestions and flags posts needing updates

- [ ] Implement `suggest` command: invoke analytics report, parse search opportunities and content gaps
- [ ] Present suggestions to user with source data (impressions, position, CTR gap)
- [ ] Allow user to accept suggestions into the Ideas stage
- [ ] Implement `performance` command: pull analytics for published posts
- [ ] Flag underperforming posts (declining traffic, high impressions but low CTR)
- [ ] Surface "update recommended" entries with specific improvement suggestions
- [ ] Track analytics-suggested vs manually added entries in the calendar

**Acceptance Criteria:**
- `/editorial suggest` shows content opportunities derived from analytics data
- `/editorial performance` shows metrics for published posts and flags underperformers
- Suggestions include specific data (e.g., "query X has 200 impressions at position 8 — no page targets it")
- Underperformers include specific improvement recommendations

## Verification Checklist

- [ ] `npm run build` succeeds (no build breakage)
- [ ] Calendar file is parseable by the script and readable by humans
- [ ] All skill commands work end-to-end
- [ ] Post scaffolding matches existing blog conventions
- [ ] Analytics integration produces actionable suggestions
- [ ] No secrets committed to the repository
