---
name: editorial-outline
description: "Scaffold a blog post and advance a Planned entry to Outlining. Creates the content-collection markdown at src/sites/<site>/content/blog/<slug>.md with frontmatter + an empty `## Outline` section, flips the calendar to Outlining, and enqueues an outline-review workflow so the operator can iterate on the shape before the agent drafts the body."
user_invocable: true
---

# Editorial Outline — Shape Before Prose

Insert point between Planned and Drafting in the editorial calendar
lifecycle. Real editorial teams outline first; the operator approves
the shape before the agent invests in prose. Skipping this step
burns iteration cycles on structural problems a 30-second outline
review would have caught.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites:
`audiocontrol`, `editorialcontrol`. Output lands under
`src/sites/<site>/content/blog/<slug>.md`.

## Usage

```
/editorial-outline <slug>
/editorial-outline --site editorialcontrol <slug>
```

## Steps

1. **Run the enqueue helper:**

   ```
   npx tsx .claude/skills/editorial-outline/enqueue.ts --site <site> <slug>
   ```

   The helper:
   - Validates site + slug.
   - Refuses if the calendar entry isn't in Planned (with its current
     stage in the message).
   - Scaffolds `src/sites/<site>/content/blog/<slug>.md` with
     frontmatter (state: draft) + `# <title>` + empty `## Outline`
     section + body placeholder.
   - Transitions the calendar stage Planned → Outlining.
   - Creates an outline-review workflow (contentKind: 'outline') in
     state `open`.

2. **Load the voice skill before sketching the outline.**
   Before writing ANY outline content (even if the operator expects
   a v1 outline immediately), read the site's voice skill:

   - `audiocontrol` → `.claude/skills/audiocontrol-voice/SKILL.md` +
     `.claude/skills/audiocontrol-voice/references/longform.md`
   - `editorialcontrol` → `.claude/skills/editorialcontrol-voice/SKILL.md` +
     `.claude/skills/editorialcontrol-voice/references/dispatch-longform.md`

   The outline sets the article's shape — the voice skill tells you
   which shapes actually fit the site. Drafting against a
   voice-unaware outline means reworking the skeleton later.

3. **Ask the operator** whether they want a v1 outline sketch now
   or prefer to write the outline themselves. If they want a
   sketch, use the Edit tool to fill in the `## Outline` section.
   Keep it loose — a rough map of sections with their purpose, not
   a finished blueprint. One line per section is plenty.

4. **Report** the workflow id + review URL so the operator can
   open the review surface, annotate, and iterate.

## What to put in the outline

- Thesis in one sentence (what claim is this article making?).
- 3–7 sections, one line each, in the order they'll appear.
- For each section: one fragment describing its purpose or hook.
- No finished prose. No full paragraphs. The point is structure.

Example skeleton for a pairing-style dispatch:

```
## Outline

- Thesis: <one-sentence claim>.
- Hook: open with a concrete anecdote that lands the claim.
- Failure mode A: the <label> approach — why it doesn't work.
- Failure mode B: the <label> approach — why it doesn't work either.
- Third option: the approach this dispatch is arguing for.
- Worked example: a specific project where this played out.
- Short-version numbered list: the takeaways a skimmer needs.
- Meta-close: name the reframing the voice skill did to this piece.
```

## Iteration

Outline review uses the same dev-only surface as longform review:

```
http://localhost:4321/dev/editorial-review/<slug>?site=<site>
```

The operator annotates, edits, and clicks Iterate / Approve from
there. When the operator clicks Iterate, run
`/editorial-iterate <slug>` — the same skill as longform, branched
internally on `contentKind`.

## Next

When the operator approves the outline in the UI, run:

```
/editorial-outline-approve --site <site> <slug>
```

That transitions the workflow to applied and flips the calendar
Outlining → Drafting. The drafting step then runs
`/editorial-draft <slug>` (which preserves the approved outline in
the body while the agent writes prose underneath it).

## Related skills

- `/editorial-outline-approve <slug>` — terminal step for the outline loop
- `/editorial-iterate <slug>` — iterate on the outline (same as longform)
- `/editorial-draft <slug>` — draft the body after outline is approved
- `/editorial-review-help` — pipeline status
