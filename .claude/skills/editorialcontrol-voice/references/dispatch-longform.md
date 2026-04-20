# Reference: longform dispatch voice

Read this when drafting any dispatch (what editorialcontrol calls blog posts). Excerpts below are from the real dispatch on the site. Imitate the rhythm and structure; do not copy sentences verbatim into new drafts.

## Title + dek pattern

Title is often a two-sentence claim. Dek is a compressed paragraph that names the thesis and hints at the argument's structure.

Real examples:

> # Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement.
>
> AI in content marketing is table stakes; most workflows using it aren't fast or flexible enough to keep up. The third option: stop treating AI as a feature bolted onto your workflow and start treating the agent as the workflow. An editorial calendar built on top of a coding agent (Claude Code, Codex, Cursor, any of them), Markdown files, and a weekend of work.

> # Your Brand Survives the First Generation. Does It Survive the Hundredth?
>
> Most AI-generated feature image workflows stop at the generator. That's the easy half. The missing infrastructure is a human gate cheap enough to actually use, and a design system that gets sharper every time you use it.

Patterns:
- Two-sentence titles are common. The second sentence often reverses or sharpens the first.
- Titles often address the reader in second person ("Your…"), but framed as a specific challenge, not a promise of benefit.
- The dek states the thesis in 2–3 sentences and previews the shape of the argument.

## In-dispatch table of contents

Right after the dek, dispatches include a numbered ToC in a small "In this dispatch" block:

> In this dispatch
>
> 1. 01 What it looks like when the agent is the workflow
> 2. 02 Flexibility as survival
> 3. 03 Speed compounds
> 4. 04 If you're still reading, here's the short version
> 5. 05 Where this is going

Format: numbered list, with a second 01/02/03 marker inside each entry. Section names are sentence-case, 3–8 words.

Then the title repeats — yes, the exact H1 from the top of the page — before the body begins. This is a magazine convention the site uses.

## The thesis → two failure modes → third option opening

The signature argumentative move. Read the full pattern here, because the rhythm is specific:

> AI in content marketing isn't an advantage anymore. It's table stakes. If your workflow doesn't have AI somewhere in the loop — drafting, rewriting, analyzing, distributing — you're already losing to the operations that do. That part isn't controversial.
>
> What's less obvious: most of the workflows that do have AI in them aren't fast or flexible enough to keep up. Two common failure modes.
>
> **The homegrown process.** A loose pile of Google Docs, Slack approvals, and spreadsheets, with ChatGPT open in a browser tab for the parts that feel AI-shaped. Someone has to remember to update the tracker. Someone compiles analytics by hand. When the process changes, the change lives in someone's head until they write it down somewhere, and they never quite do. It's flexible in the sense that it could go anywhere — but it doesn't reliably go anywhere, because it depends on everyone remembering the same unwritten rules.
>
> **The SaaS stack.** Some features are AI-powered, but the workflow shape is whatever your vendor decided on last quarter. Every generic editorial-calendar tool has an opinion about what "a post" is, and some of those opinions don't match yours. You keep a second informal system on the side because the tool can't hold half of what your actual workflow needs. The integrations you'd actually use — your analytics, the social platform of the week, a new content format — aren't on anyone's roadmap this quarter.
>
> Both failures are stuck on the same structural issue: a process that isn't clear, isn't low-friction, isn't repeatable, and doesn't improve itself between posts. Adding more people or more tools doesn't address the shape.
>
> There's a third option that didn't exist eighteen months ago.

Shape:
1. **Concede the consensus** ("That part isn't controversial.") — establishes shared ground.
2. **Name the real problem** ("What's less obvious…") — pivots.
3. **Announce structure** ("Two common failure modes.") — signals.
4. **Failure mode 1** with bolded lead-in.
5. **Failure mode 2** with bolded lead-in.
6. **Collapse both into a structural diagnosis** ("Both failures are stuck on the same structural issue…") — names what the failures share.
7. **Pivot to the third option** with a temporal receipt ("didn't exist eighteen months ago").

## Bolded-lead-in paragraphs

Same move as the sibling site — paragraphs often open with a **bold lead-in phrase** followed by a period. Use for enumerated failure modes, principles, or categorical observations. A dispatch might have two or three clusters of these.

> **Adding YouTube as a first-class content type.** A live sync of Reddit posts surfaced that six recent shares were of a YouTube demo video, not a blog post. The calendar had no place to track that. The agent extended the entry schema with `contentType: 'youtube'`, taught the parser to emit an optional `Type` column when any entry used it, updated three skills to branch on the new type, and re-ran the sync. Time elapsed: an afternoon. The six previously-unattributable shares now attached to the right entry.

> **Adding a `tool` content type for standalone apps.** Two other Reddit posts linked to a web-based editor hosted on the same site — not a blog post, not a video, just an app at a URL. Same kind of change: extend the content type to `'blog' | 'youtube' | 'tool'`, add the lifecycle branch, re-run the sync. Afternoon. No vendor involved.

Notes: code inline (`contentType: 'youtube'`, `'blog' | 'youtube' | 'tool'`) is welcome when it's the actual artifact. "Afternoon. No vendor involved." shows the voice's dry-line rhythm.

## Worked examples with receipts

The middle of a dispatch grounds the argument in concrete project history. This is where the receipts land.

> Concrete numbers: between January 2025 and March 2026, this site shipped three posts. In the first eighteen days of April 2026, once the agent had accumulated enough skills to move content through without hand-cropping, hand-tracking, or hand-linking, it shipped seven. Same author. Same subject matter. Different friction floor.

Structural cues:
- "Concrete numbers:" announces that receipts are coming.
- Dates and counts, not percentages.
- Short closing clauses ("Same author. Same subject matter. Different friction floor.") that make the receipts land.

## Code blocks, file paths, and inline code

Dispatches are technical and the voice welcomes code:

> - `/editorial-add "Title"` — capture an idea in the Ideas stage
> - `/editorial-plan <slug>` — move Ideas → Planned, set target keywords and topic tags
> - `/editorial-draft <slug>` — scaffold the blog post directory, create a GitHub tracking issue, move to Drafting

Also `.claude/skills/`, `docs/editorial-calendar.md`, `git log`, `grep`, etc. File paths are precise. No fake names — when the project has a real artifact, name it.

## Em-dashes, parentheticals, and clause work

The voice uses em-dashes to manage complex sentences without going comma-heavy:

> The agent extended the entry schema with `contentType: 'youtube'`, taught the parser to emit an optional `Type` column when any entry used it, updated three skills to branch on the new type, and re-ran the sync.

Parentheticals are available for a genuine aside:

> Claude Code, Codex, Cursor, Amp, any of the serious coding agents shipped in the last year will do this.

Avoid semicolons. The site almost never uses them. Em-dash does the same work with less formality.

## "If you're still reading, here's the short version" section

Near the end, the argument often gets compressed into a numbered list. This is the service-manual moment in an otherwise magazine-shaped piece.

> ## If you're still reading, here's the short version
>
> 1. **Pick an agent you already use.** Claude Code, Codex, Cursor, Windsurf, Amp — the workflow maps to any of them.
> 2. **Keep the calendar in one Markdown file, versioned in git.** One table per stage. Hand-editable in any text editor; machine-parseable in twenty lines of code. The agent reads and writes it directly.
> 3. **Write each action as a skill.** The convention depends on the agent; the substance is the same — a short Markdown file telling the agent what the action does and how to do it reliably, referring to library functions for the mechanical parts. Expect to rewrite it.
> 4. **One skill per action, UNIX-style.** `/editorial-add`, `/editorial-plan`, `/editorial-draft`. Composable beats monolithic.

Pattern:
- Numbered list.
- Each item opens with a **bolded imperative sentence**.
- Then 1–3 sentences of specifics under each.

## "Where this is going" closing section

The last section of a dispatch is brief, honest about what's unresolved, and often includes the meta move — the piece was produced by the system it describes.

> ## Where this is going
>
> The post you're reading right now was made through the exact setup it describes. It was captured through a conversation that triggered `/editorial-add`, planned through one that triggered `/editorial-plan`, drafted through `/editorial-draft`, and published through `/editorial-publish`. The draft was iterated on in the same conversation with the same agent. The cross-link audit will flag this post's outbound links within an hour of shipping. No other interface was opened to make any of that happen.
>
> If you want help building this for your own operation, [get in touch](mailto:orion@audiocontrol.org).
>
> Otherwise: the agent got out of the way, so the content got made.

Closing sentence pattern: single short line that compresses the whole argument. No CTA beyond the editor mailto.

## Punctuation, numbers, and register

- Em-dashes `—` for asides, not parentheses or semicolons.
- Italics for *single-word emphasis* that reframes the sentence. Don't italicize whole phrases.
- Numbers: "eighteen months ago" spelled out when narrative; "3x," "10S4P," "774 lines" when they're metric-specific.
- Contractions are welcome — it's magazine voice, not formal.
- Sentences over 30 words exist. Don't fear them, but make them earn the length.

## What the dispatch voice is NOT

- Not a listicle. No "7 ways" or "Top 10" titles.
- Not a how-to. The form is argumentative, with worked examples. The closest it comes to instruction is the numbered "short version" list at the end.
- Not a personal essay. Orion is first-person, but the pieces are about the craft and the work, not about Orion's personal life.
- Not hedged. "Arguably," "perhaps," "it seems to me that" don't appear. Either make the claim or cut it.
- Not promotional. Dispatches don't announce audiocontrol features or advertise services. If a dispatch mentions audiocontrol, it's because that's the project where the workflow actually runs.
- Not SEO-shaped. No keyword-stuffed subheads. No meta-descriptions in the body.
