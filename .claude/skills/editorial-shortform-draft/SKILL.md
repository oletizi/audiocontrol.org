---
name: editorial-shortform-draft
description: "Draft a short-form social post (Reddit title/body, YouTube description, LinkedIn post, newsletter blurb) for a published calendar entry, using the site's voice skill. Enqueues a shortform review workflow keyed to (slug, platform, channel)."
user_invocable: true
---

# Editorial Shortform Draft

First-pass draft of platform-appropriate short-form copy for a published entry. Uses the site's voice skill + calendar context, then enqueues a review workflow so the operator can annotate, iterate, and approve through the same pipeline as longform drafts.

## Site

Accepts `--site <slug>` (default: `audiocontrol`).

## Usage

```
/editorial-shortform-draft <slug> <platform> [channel]
/editorial-shortform-draft --site editorialcontrol <slug> <platform> [channel]
```

**Interactive fallback**: if any required argument is missing, prompt one field at a time (per the project's composable-skills rule — no positional-argument surprises).

### Arguments

- `<slug>` — a Published calendar entry slug (a blog post, YouTube video, or tool that's been shipped). Required.
- `<platform>` — one of `reddit`, `youtube`, `linkedin`, `instagram`. Required.
- `[channel]` — platform-specific sub-channel:
  - Reddit: subreddit name, e.g. `r/synthdiy`
  - YouTube: channel handle if relevant (usually not needed for video descriptions)
  - LinkedIn: page slug if posting from a company page rather than the personal profile
  - Instagram: handle if relevant
  - Optional for platforms where "default channel" makes sense.

## Preconditions

- The calendar entry `<slug>` exists and is in stage `Published`. Otherwise error with the entry's current stage and suggest `/editorial-publish` first.
- The voice skills (`audiocontrol-voice` or `editorialcontrol-voice`) are installed under `.claude/skills/`.

## Steps

1. **Resolve site** via `assertSite()`. Resolve the three arguments (prompting if any are missing).

2. **Read the calendar** via `readCalendar(process.cwd(), site)` and find the entry with `slug === <slug>`.
   - If not found, list available Published slugs and stop.
   - If not Published, report its stage and stop.

3. **Check for an existing workflow** via `handleGetWorkflow(process.cwd(), { id: null, site, slug, contentKind: 'shortform', platform, channel: channel ?? null })`.
   - 200 → a workflow already exists for this (slug, platform, channel) tuple. Print the existing workflow's state and dev URL; stop without creating a duplicate. (createWorkflow would be idempotent anyway, but reporting this explicitly is clearer.)
   - 404 → proceed.

4. **Load the matching voice skill's short-form reference**:
   - For `audiocontrol`: `.claude/skills/audiocontrol-voice/SKILL.md` + `references/social-and-distribution.md`
   - For `editorialcontrol`: `.claude/skills/editorialcontrol-voice/SKILL.md` + `references/cross-site-and-distribution.md`
   - Platform-specific patterns live inside those reference files.

5. **Gather context from the entry**:
   - `title`, `description`, `targetKeywords`, `topics`, `contentUrl` (for youtube/tool) or the derived blog URL
   - For blog entries, optionally read the blog post's frontmatter/first-paragraph for added context
   - Any `DistributionRecord` already on file for this post (to avoid regurgitating the same angle across platforms)

6. **Draft the short-form copy**. Platform conventions:
   - **Reddit**: `title: <title>\n\n<body>` — body leads with the thesis, names the hardware / project specifically, ends with a link. Observe subreddit rules from the channel name when possible.
   - **YouTube description**: 1-paragraph opener that is dispatch-voice, then bullet-list of specifics, then the canonical link back to the blog or project.
   - **LinkedIn**: 2-4 short paragraphs with a punchline opener and a single link. No hashtag spam.
   - **Newsletter blurb**: 1-2 paragraphs editor's-note style with a link. No sign-off.
   - Keep the register consistent with the voice skill. Pull specifics (years, voice counts, hardware names, metric numbers) from the calendar entry; do not invent.

7. **Enqueue the workflow** via `createWorkflow(process.cwd(), { site, slug, contentKind: 'shortform', platform, channel, initialMarkdown: <drafted copy>, initialOriginatedBy: 'agent' })`. The result's `id` is the workflow id.

8. **Report to the operator**:
   - Workflow `id` and state (`open`)
   - The draft, verbatim (so the operator sees what's in v1 without switching to the UI)
   - Dev URL: `http://localhost:4321/dev/editorial-review-shortform` (list view on the same site)
   - Next step: open the URL to review, annotate, iterate, and approve

9. **Do NOT write anything to the calendar** yet. The approved copy lands in `DistributionRecord.shortform` via `/editorial-approve` when the workflow reaches the terminal state.

## Important

- Use `createWorkflow` — do NOT hand-write pipeline JSONL.
- Short-form content is NOT stored in a file on disk. It lives in the calendar's `## Shortform Copy` section (written by `/editorial-approve`) and in the pipeline's version history (written by this skill).
- If the operator asks for a second platform/channel on the same post, rerun this skill with different arguments — a separate workflow is created per (slug, platform, channel) tuple.

## Related Skills

- `/editorial-iterate <slug>` — revise short-form in response to operator comments (same skill as longform; branches on `contentKind`)
- `/editorial-approve <slug>` — write approved short-form to `DistributionRecord.shortform` in the calendar (no git ops)
- `/editorial-review-cancel <slug>` — cancel a shortform workflow
- `/editorial-review-help` — see pipeline state
- `/editorial-distribute` — record an actual share (separate from the drafting pipeline; captures the share URL after the operator posts)
