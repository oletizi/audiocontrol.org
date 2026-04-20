# Reference: cross-site and distribution copy

When a dispatch needs to travel — LinkedIn, Reddit, a Substack cross-post, a Mastodon or BlueSky note — the voice should survive the platform. The platforms reward different rhetorical moves than the publication; don't let those rewards pull the voice off-shape.

## Core principle

**Open with the thesis, not the announcement.** The platform culture wants "I just published a new article!" The publication doesn't. Start with a sentence that could be the first line of the dispatch. If the reader wants more, the link's at the bottom.

## LinkedIn post template

LinkedIn rewards longer posts — it's OK to use the format. Keep the voice.

Template:

```
[First sentence: the thesis, in the voice of the dispatch itself. No "Just published" opening.]

[2–4 short paragraphs: the argument in miniature. Use the same failure-modes / third-option structure if the piece uses it. Use bolded lead-ins if enumerating.]

[One receipt — a number, a date, a specific artifact — that makes the argument land.]

[A single-sentence pivot to the full piece.]

Full dispatch: [url]
```

Example:

> Most AI-generated feature image workflows stop at the generator. That's the easy half.
>
> The missing infrastructure is a human gate cheap enough to actually use — one click to accept, one click to regenerate, running against a local brand library — and a design system that gets sharper every time you use it. Without it, the hundredth image doesn't belong to your brand anymore; it belongs to whatever the model pulled from its average of the internet.
>
> The latest dispatch at editorialcontrol.org is about building that gate and that library on top of a coding agent, in a weekend. No SaaS. No vendor. Receipts: 100+ images generated through the pipeline over the last month, all reviewed, fewer than 8 regenerations.
>
> Full dispatch: https://editorialcontrol.org/blog/feature-image-automation-feature/

## Reddit crosspost template

Reddit will read a thoughtful post, but it won't tolerate ceremony. Strip the publication framing; keep the argument.

Template:

```
**[Thesis-shaped title, often a claim or a challenge]**

[One paragraph: the argument's core, in plain language, no publication scaffolding.]

[One paragraph: the specific method or receipt that makes it credible.]

[One line: "Full writeup with code paths and specific skills: [url]" — or similar, specific to what's in the dispatch.]

[Optional: "Happy to answer questions about [specific aspect]."]
```

Example:

> **An editorial calendar as one Markdown file in a repo, controlled through an AI agent**
>
> I stopped using SaaS editorial tools for a content site I run, and moved the whole calendar — ideas, planned posts, drafts, published, distribution tracking — into a single Markdown file with one table per stage. All interaction happens through a coding agent (Claude Code in my case, Codex or Cursor work the same way) via short Markdown skills like `/editorial-add`, `/editorial-draft`, `/editorial-publish`.
>
> In the first eighteen days of April 2026, the site shipped seven posts — against three posts in the previous fifteen months. Same author, same subjects, different friction floor. The agent absorbs the workflow and removes the vendor layer entirely.
>
> Full writeup with the specific skills, content schema, and distribution flow: https://editorialcontrol.org/blog/building-the-editorial-calendar-feature/
>
> Happy to answer questions about the schema design or the skills.

Notes:
- No "I just published on my new publication" opening. The reader doesn't care where it lives.
- The title is a claim, not a question, and not clickbait.
- No emoji. No bold in the body (except for section-lead-ins if you're using them). No all-caps.

## Mastodon / BlueSky / short post

Short posts collapse the dispatch to one good sentence plus a link. The sentence has to carry the thesis and have enough texture that someone might click.

Good patterns:

> Stop treating AI as a feature bolted onto your workflow and start treating the agent as the workflow. New at editorialcontrol.org: https://editorialcontrol.org/blog/building-the-editorial-calendar-feature/

> Most AI feature-image workflows stop at the generator. That's the easy half. On the missing infrastructure — human gate, design system, loop that sharpens — at editorialcontrol.org: https://editorialcontrol.org/blog/feature-image-automation-feature/

Bad patterns (don't use):

> 🚀 Just dropped a new article on AI workflows! Check it out 👉

> Hot take: AI is changing content marketing

> What if I told you…

## Substack / cross-post on other publications

If the dispatch is reprinted on Substack or another publication, keep the title, the dek, and the body as-is. Update only:

- The byline (to match the cross-post's convention).
- The "where this is going" closing paragraph (to link back to editorialcontrol.org as the canonical home).
- Image credits if the hosting publication requires them.

Never rewrite the voice for the host. The pieces should be identifiable as editorialcontrol pieces wherever they land.

## Newsletter dispatch (the actual email when an issue ships)

The "dispatch" to the list is not marketing copy. It's an editor's note, written the way the publication writes everything.

Template:

```
Subject: [Issue number] — [dispatch title, short]

[Plain-text opening: one or two sentences framing the piece, in the voice. No "We hope you enjoy this issue!"]

[A one-paragraph excerpt from the dispatch — usually the thesis paragraph.]

[The link, on its own line.]

[A one-line sign-off. Orion, or no sign-off at all.]
```

Example:

> Subject: Issue 01 — Your Content Workflow Is Already Obsolete.
>
> First issue of editorialcontrol is out. It's on building an editorial calendar on top of a coding agent — not a SaaS, not a homegrown process, the agent as the workflow itself.
>
> AI in content marketing isn't an advantage anymore. It's table stakes. What's less obvious: most of the workflows that do have AI in them aren't fast or flexible enough to keep up.
>
> Read: https://editorialcontrol.org/blog/building-the-editorial-calendar-feature/
>
> — Orion

## Common failure modes to avoid

- **"Just published!" openings.** Never. Open with the thesis.
- **Emoji as punctuation.** 🚀, 👉, 💡, 🔥. None.
- **Platform vernacular.** "Dropped," "cooked up," "wild," "hot take," "unpopular opinion." All off-voice.
- **Scarcity/urgency CTAs.** "Don't miss this." "Only this week." The publication doesn't pressure the reader.
- **Cross-posts that rewrite the voice to fit the platform.** The point is that the voice survives. If you're cutting the texture to make it "more LinkedIn-friendly," you've broken the brand.
- **Hashtag walls.** #ai #agents #content #workflow — don't. If platform custom requires one or two, use them inline, not as a tail.
