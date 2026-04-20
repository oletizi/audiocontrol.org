---
name: editorialcontrol-voice
description: Write copy in the voice of editorialcontrol.org — a publication about building with AI agents, written by Orion Letizi and positioned as a sibling to audiocontrol.org. Use this skill whenever the user asks for copy for editorialcontrol.org, for "the publication," for "the desk," for "a dispatch," or for any piece that will appear on editorialcontrol.org. Covers full blog posts (which the site calls dispatches), homepage sections, nav, About/Contact page copy, section descriptions, newsletter outreach, and distribution copy (LinkedIn, Reddit, Substack cross-posts) for editorialcontrol content. Also use this skill when the user says "write it like the publication," "magazine voice," "editorialcontrol style," or similar — even if they don't explicitly name a deliverable type.
---

# editorialcontrol-voice

Write like editorialcontrol.org. A publication — not a blog, not a product site. Magazine rhythm, terminal-published sensibility. Every claim earns its place. The agent drafts; the human finishes. Receipts stay on the page.

## Read the references first

Before writing any substantial piece (anything longer than a section blurb), read the reference excerpts. The voice is calibrated and easier to match than to describe.

- `references/homepage-and-sections.md` — the homepage, "on the desk" section list, nav, About/Contact style, newsletter pitches. Read this for any short-form copy on the site itself.
- `references/dispatch-longform.md` — a full dispatch (what the site calls blog posts). Read this for any longform draft.
- `references/cross-site-and-distribution.md` — patterns for LinkedIn posts, Reddit crossposts, newsletter blurbs, and how the publication voices announcements on other platforms.
- `references/voice-vs-audiocontrol.md` — how the editorialcontrol voice differs from the sibling site audiocontrol.org. Read this if you have experience with audiocontrol voice and need to make sure you're not collapsing the two.

For short, mechanical jobs (a nav label, a single section header), work from the principles below. For anything longer than ~100 words, pull the matching reference first.

## The core principles

### 1. A publication, not a blog

The site frames itself as a publication: "Vol. 01 / Issue 00," "Pre-press," "The desk," "Dispatch," "On the desk." That frame is load-bearing, not decoration. Words matter:

- Posts are **dispatches**, not blog posts or articles.
- The blog index is **the desk**.
- The newsletter is **the dispatch** (singular; what goes out when an issue ships).
- The homepage is laid out like an issue cover — "Vol. 01 / Issue 00 · Pre-press · [Date]."
- The tagline format is "◆[one-line claim]" — the diamond prefix is part of the brand.

Don't collapse into blog/newsletter/content vocabulary when publication vocabulary is available. "Next dispatch" not "next post." "On the desk" not "on the roadmap."

### 2. Magazine voice, terminal sensibility

The voice is longer-form than audiocontrol. Sentences breathe. Em-dashes and parenthetical asides are available. There's room for a clause that qualifies the previous clause. But the substance underneath is still engineering — concrete, specific, numeric where it can be, honest where it can't.

Think: a technical magazine's editor's column. Not a Medium post. Not a SaaS blog. Not a personal blog.

Rhythmic markers:
- Long sentences are OK when they earn their length with clause work.
- Short sentences land arguments: "More posts shipped means more analytics data." "The receipts stay on the page."
- Em-dashes `—` are the punctuation of choice. Semicolons exist but are rare. Parentheses work for genuine asides.
- Italics for emphasis *sparingly*, usually on a single word or short phrase that reframes the sentence.

### 3. The thesis-two-failure-modes-third-option pattern

The site's arguments follow a recognizable shape:

1. Claim the obvious consensus upfront ("AI in content marketing is table stakes…").
2. Name two common failure modes, usually in bolded-lead-in paragraphs: "The homegrown process." and "The SaaS stack."
3. Offer the third option — the actual argument of the piece.
4. Make the third option concrete with a worked example from Orion's actual project history.
5. Close with a short "if you're still reading, here's the short version" that restates the move in numbered steps, or a "where this is going" that is honest about what's unresolved.

This structure isn't required, but when writing an argument-shaped dispatch, reach for it first.

### 4. Receipts, always

Every claim takes a number, a date, a specific file path, or a named artifact. Abstractions without grounding are a failure mode — correct them by finding the receipt or cutting the claim.

Good receipts from the site:
- "between January 2025 and March 2026, this site shipped three posts. In the first eighteen days of April 2026... it shipped seven."
- "Time elapsed: an afternoon."
- "`.claude/skills/`" (specific file path).
- "`/editorial-reddit-sync` has been rewritten twice and extended a third time."

### 5. The meta move: the piece describes itself

Dispatches regularly end by noting that the piece you just read was produced by the system it describes. This is a signature: the writing demonstrates the claim instead of just making it.

> The post you're reading right now was made through the exact setup it describes.

Use this move when it's genuinely true. Don't fake it.

### 6. First-person singular, with an editor's we

Orion writes as "I" for personal action and observation. "We" appears sparingly and deliberately — usually in the editorial-column sense (the publication speaking) rather than as a team. Never "we at editorialcontrol" or "our team." When unsure, default to "I."

The About page and Contact page will sometimes use "the editor" third-person-style. That's available.

### 7. Typography carries brand

Typographic elements the site uses:
- `◆` as a marker in repeated taglines ("◆A publication on building with AI agents").
- `§ 01`, `§ 02` for section markers in lists.
- `No. 01`, `No. 02` for post numbering on the desk index.
- `Vol. 01 / Issue 00 · Pre-press · [Date]` for the issue stamp.
- `→` for outbound links and actions ("Write to the editor →").
- `—` for em-dashes in prose.
- `·` as a separator in meta lines.

Fonts are Fraunces (serif, for display), Inter (for body UI), and JetBrains Mono (for code). Don't write with fonts in mind, but know that the site carries a magazine-typographic presentation and the prose should not undercut it.

### 8. Lowercase sentence-case headers

Section headers are sentence-case. ("What it looks like when the agent is the workflow." Not "What It Looks Like…")

The exception: issue masthead and nav elements that are brand elements ("The desk," "On the desk," "Editorial spread").

### 9. "No form, no funnel" ethic

The site refuses marketing instrumentation at the interaction level. Newsletter signup is a mailto link. The CTA is "Write to the editor →." There's no tracked button, no lead magnet, no "Get started free."

When writing CTAs for the site, honor this. The action is almost always: email Orion directly, or read another dispatch, or go to audiocontrol.

### 10. Honest about scale

The publication is small and says so. "Vol. 01 / Issue 00." "Pre-press." "Slowly published." "A short list." Don't pretend the publication is bigger than it is; the scale is part of the credibility. Corollary: don't project fake authority ("the definitive guide," "everything you need to know"). The tone is a thoughtful operator reporting from the desk, not an authority pronouncing.

### 11. Connected to audiocontrol but not derivative

Every dispatch can reference audiocontrol as "the sibling site" or the practical project where the workflows described actually run. That's useful and grounded. But the publication has its own identity — the voice here is literary where audiocontrol's is service-manual. Don't let audiocontrol's terser voice bleed in, and don't describe editorialcontrol as audiocontrol's blog. They are siblings.

## Shape by deliverable

### Dispatch (a blog post)

Structure:

1. **Title** — a specific provocation or claim, often with a colon or a double-sentence structure. "Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement." or "Your Brand Survives the First Generation. Does It Survive the Hundredth?" Two sentences in a title is fine and on-brand.
2. **Dek** — one paragraph, 2–4 sentences. Distills the thesis. Often previews the failure-mode/third-option structure.
3. **Byline** — "[Month] 2026 · Orion Letizi"
4. **Horizontal rule** — `---`
5. **"In this dispatch" table of contents** — numbered list of the section headers, in the magazine-style "01 / 02 / 03" format.
6. **Repeat the title** above the body. This is a magazine convention the site uses.
7. **Body** — thesis → two failure modes → third option → worked example → short version → where this is going. Sections separated by `---`.
8. **Closing section** — "If you're still reading, here's the short version" (numbered list of the argument's moves) and/or "Where this is going" (honest about what's unresolved).
9. **Last line** — a single compressed sentence. No sign-off, no CTA beyond the editor link.

### Homepage section

Short blocks, two or three short paragraphs. Uses "Q&A style" labels: "What's here," "Why bother," "How we publish." Plain-English answers under each. (See references/homepage-and-sections.md.)

### "On the desk" entries

Numbered sections (§ 01, § 02…). Each entry is a section the publication is working on — not a single post. One-sentence description. See the homepage.

### About page copy

First person. Light on credentials, heavy on the work. Mentions audiocontrol.org as the practical project. Mentions the publication frame: vol, issue, slow schedule.

### Newsletter / dispatch invitation

"No form, no funnel." A mailto link disguised as an editor's note. See references.

### LinkedIn / Reddit crossposts

The editorial voice survives the platform. No "I just published a new article!" energy. Open with the thesis, not the announcement. See references/cross-site-and-distribution.md.

## Annotated examples

### Good dispatch opening

> # Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement.
>
> AI in content marketing isn't an advantage anymore. It's table stakes. If your workflow doesn't have AI somewhere in the loop — drafting, rewriting, analyzing, distributing — you're already losing to the operations that do. That part isn't controversial.
>
> What's less obvious: most of the workflows that do have AI in them aren't fast or flexible enough to keep up. Two common failure modes.

Why this works: title is a two-sentence claim. Opening paragraph concedes the consensus view to establish shared ground. Second paragraph signals the structural move ("Two common failure modes") that organizes the next two paragraphs.

### Bad dispatch opening (rewrite target)

> # How AI Is Revolutionizing Content Marketing in 2026
>
> In today's fast-paced digital landscape, AI has emerged as a transformative force in content marketing. In this article, I'll share some insights on how to leverage AI in your workflow.

Why this fails: title is a generic topic, not a claim. "Today's fast-paced digital landscape" is the exact phrase the publication exists to reject. "In this article, I'll share some insights" is tutorial-blog framing; the publication doesn't do tutorials and doesn't announce its structure in advance.

### Good section transition

> Both failures are stuck on the same structural issue: a process that isn't clear, isn't low-friction, isn't repeatable, and doesn't improve itself between posts. Adding more people or more tools doesn't address the shape.
>
> There's a third option that didn't exist eighteen months ago.

Why this works: summarizes the two failure modes in one sentence using structural language ("the shape"). Pivots into the argument's third option with a specific temporal claim ("eighteen months ago") that is itself a receipt.

### Good closing line

> Otherwise: the agent got out of the way, so the content got made.

Why this works: one sentence. No CTA. Restates the whole argument as a compressed observation. The "Otherwise:" opening is the voice's dry humor at rest.

## Common failure modes to avoid

- **Blog vocabulary instead of publication vocabulary.** "Blog post" instead of "dispatch." "Homepage" instead of "issue cover." "Newsletter" instead of "the dispatch." "About page" is fine since that's the URL.
- **Tutorial framing.** "In this post, I'll show you how to…" — the publication doesn't pre-announce its structure. Make the argument; don't describe the argument you're about to make.
- **Corporate plural.** "We at editorialcontrol" — doesn't exist. Reduce to "I" or the editor's "we."
- **Generic topic titles.** "How AI Is Changing X" fails. "Your Content Workflow Is Already Obsolete. Your AI Agent Is the Replacement." passes.
- **SaaS-blog words.** "Unlock," "leverage," "empower," "synergy," "transform," "seamless," "effortless." If any of these make it into a draft, rewrite the sentence.
- **Fake authority.** "The definitive guide to…" or "Everything you need to know about…" The publication is small and says so.
- **Audiocontrol voice bleed.** If the draft reads like a service manual (terse, bullet-heavy, spec-first), it's drifted toward the sibling site. Pull back: longer sentences, more connective tissue, more editorial texture.
- **Missing meta move when it would help.** If the dispatch is describing a workflow, and that workflow was used to produce the dispatch, say so. It's a signature move.
- **Dropping receipts to sound more magazine-y.** Magazine voice doesn't mean soft argument. Every claim still needs a number or an artifact. Don't let the register change your evidence standards.
