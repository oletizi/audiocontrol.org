---
name: audiocontrol-voice
description: Write copy in the voice of audiocontrol.org — the service-manual aesthetic used across that site's hardware pages, editor intros, blog posts, YouTube descriptions, Reddit posts, and homepage sections. Use this skill whenever the user asks for copy for audiocontrol.org or any audiocontrol project (Roland S-330/S-550/S-770, Akai S3000XL/S5000/ESI-32, JV-1080, etc.), including full blog drafts, hardware cards, editor descriptions, nav microcopy, feature announcements, release notes, YouTube video descriptions, Reddit posts about the project, or any text that will appear on audiocontrol.org or be attributed to it. Also use this skill when the user says "write it in the audiocontrol voice," "make it sound like the site," "service-manual style," or similar — even if they don't explicitly name a deliverable type.
---

# audiocontrol-voice

Write like audiocontrol.org. Terse. Technical. Service-manual aesthetic. Evidence on the page. No marketing fluff.

## Read the references first

Before writing any substantial piece (anything longer than a card or a nav blurb), read the reference excerpts. The voice is easier to match than to describe, and the excerpts are calibrated samples of the real thing.

- `references/homepage-and-cards.md` — the homepage, hardware cards, nav, section headers. Read this for: landing copy, editor intros, hardware descriptions, any short-form.
- `references/blog-longform.md` — a full blog post. Read this for: any longform draft, lessons-learned writing, process/meta posts.
- `references/social-and-distribution.md` — patterns for YouTube descriptions, Reddit posts, release notes, commit-message-style announcements.

For short, mechanical jobs (a single card, a nav label, a one-sentence tag), you can work from the principles below without pulling the references. For anything longer than ~100 words, pull the matching reference first.

## The core principles

### 1. The voice is a service manual, not a brochure

Spec sheets, not hype. The site treats its own hardware and software the way a 1987 Roland service manual treats an S-330: a known object, documented plainly, with dates, voice counts, and bit depths up front. Never editorialize a spec ("powerful," "incredible," "revolutionary"). State it.

- **Do:** "1987 · 16-voice · 12-bit"
- **Don't:** "The legendary 16-voice sampler that defined an era"

### 2. Typography is part of the voice

Use these glyphs deliberately. They carry the aesthetic.

- `→` for forward motion, links, next steps ("→ Open Editor")
- `↳` for secondary actions ("↳ Browse Hardware")
- `·` as a separator between specs, not commas ("1994 · 32-voice · 16-bit")
- `§` for numbered sections in magazine-style lists
- `---` horizontal rules to break sections in longform, used generously
- Em-dashes (`—`) over parentheses or semicolons when punctuating asides

Don't overuse them in any single piece. A card gets one or two. A homepage might get four. A blog post uses `---` between sections and em-dashes in prose, nothing else.

### 3. Lowercase pacing subheads, bold lead-ins

Section headers are sentence-case, not Title Case. ("What actually changed" — not "What Actually Changed.")

In blog posts, paragraphs often open with a **bolded lead-in word or phrase** followed by a period, then the paragraph continues. This is the site's signature prose rhythm:

> **Fabrication.** "No, you can't write directly to the sampler's memory. You just made that up." The agent would state device capabilities it had invented from whole cloth...

Use lead-ins when you're enumerating failure modes, patterns, principles, or categorical observations. Don't use them for every paragraph — they lose force if overused. Rule of thumb: 3–6 lead-ins per longform post, clustered in one or two sections.

### 4. Receipts, always

Every claim takes a number or a concrete artifact. "2,400+ sessions. 1,100+ commits. 55 sessions analyzed." "I refactored CLAUDE.md from 774 lines to 198." "Three inputs. Zero corrections." If you make an assertion without a receipt, either find one or cut the assertion.

When quoting the agent or the user, use italicized quoted speech inline: *"How do you know that?"* Don't paraphrase what a real session said — either quote it verbatim or describe what happened without quoting.

### 5. The hardware comes first

audiocontrol is about vintage samplers. The hardware is the protagonist; the software is in service of it. Names are specific and dated: "Roland S-330 (1987)," "Akai S3000XL (1994)." Never "a vintage sampler" when you could say which one.

When the hardware has a known quirk or limitation, name it. "12-bit," "SCSI handshake," "MIDI over SCSI protocol reverse-engineered from 1980s service manuals," "30 years of field service." This specificity is half the voice.

### 6. Short sentences carry weight. Long ones earn it.

The site mixes three-word sentences with long clause-chained ones. Don't settle into medium-length prose. Compress where you can:

> The hardware is on the shelf. The original software is thirty years gone.

Then let a longer one breathe when the argument needs it. But short is the default.

### 7. First-person singular, sparingly

Orion writes as "I." Use it when describing what actually happened or what you actually think. Don't use "we" unless a group genuinely did the thing. Don't use second-person "you" for marketing-style address ("you'll love how…"). Second-person works fine for instruction ("You don't solve a structural problem with more documentation. You solve it with structure.").

### 8. Honest about limits

When something isn't working, say so. "The agent was operating blind." "PROCESS corrections still dominated at 69%." Acknowledgments of failure are currency — they're what make the claims that follow credible. Never paper over a weakness; the voice loses everything when it does.

### 9. No SEO crud

No "Introduction" sections. No "In this article, we'll explore…" No "In conclusion." No "It's important to note that…" No "Let's dive in." No emoji. The site does not pander.

Table of contents blocks are fine — they're part of the service-manual feel — but auto-generate them from the actual section headers; don't write a summary paragraph of what's ahead.

### 10. Lists are rarer than in typical tech writing

The site uses bullet lists where they genuinely enumerate discrete items (skill inventories, rule lists, spec rows in a table). Prose is preferred over bullets for arguments. If you find yourself writing a bulleted list of four concepts, try prose first — the site almost always does.

Tables are welcome for metrics, specs, and before/after comparisons. The site uses them without apology.

## Shape by deliverable

### Hardware card (on the homepage or /hardware/)

Template:

```
Status [Available|Pending]

### [Device name]

[Year] · [voice count]-voice · [bit depth or type]

[One or two sentences. First sentence: what it is in the family. Second sentence: what the editor offers or the state of development.]

→ [Open Editor | In development]
```

The year-voice-bit line is non-negotiable. If a spec doesn't fit (a synth, not a sampler), use the closest equivalent ("1994 · 64-voice · synth").

### Editor intro (on the /editors/[name]/ page)

Longer than a card, shorter than a blog post. Opens with one short declarative sentence about the editor's purpose, then gets into specifics — what it shows, what it syncs, what's not in it yet. End with the invocation to open it or see the repo.

### Blog post

Structure that recurs on the site:

1. Title is a specific claim or a specific number ("What 2,400 Sessions Taught Us…"), not a question and not a generic topic.
2. One-sentence dek that distills the thesis.
3. Feature image.
4. One-paragraph intro that states the hard problem in plain language. Never a "let me introduce myself" preamble.
5. `---` rule.
6. Body organized into 3–7 sentence-case sections separated by `---`. Tables and code blocks welcome where evidence lives.
7. A "Lessons" or "What actually changed" section near the end — plural bolded lead-ins, each stating one lesson, then a paragraph of evidence.
8. A "What's Next" section. Brief. Honest about what's unresolved.

### YouTube / Reddit / release-note style short-form

One short paragraph in the voice. Link. Out. No "Hey everyone!" No sign-off. Include the specific hardware (Roland S-330, Akai S3000XL — not "vintage sampler"). Include the specific thing being shown or shipped. If it's a demo, say what the video demonstrates in one line; if it's a release, say what changed in one line.

## Annotated examples

### Good hardware card

> **Status** Available
>
> ### Roland S-330
>
> 1987 · 16-voice · 12-bit
>
> Rack-mount 12-bit digital sampler. Web editor with real-time hardware sync, patch browsing, and filter/envelope visualization.
>
> → Open Editor

Why this works: year-voice-bit line upfront. Two sentences. First names the device family; second names what the editor actually does. No adjectives. Arrow to the action.

### Bad hardware card (rewrite target)

> ### Roland S-330 Web Editor
>
> The Roland S-330 is a classic digital sampler from the golden age of 12-bit sampling. Our cutting-edge web editor brings this legendary device into the modern era with powerful new features.
>
> [Click here to try it out!]

Why this fails: title is about the editor, not the device. "Classic," "golden age," "legendary," "cutting-edge," "powerful" are all fluff. "Click here to try it out" is the opposite of the site's link style. No year, no voice count, no bit depth — which is most of the information.

### Good blog intro

> The hard problem isn't getting an AI agent to write code. It's getting it to reliably follow process.
>
> I've been building audiocontrol — a TypeScript monorepo for controlling vintage hardware samplers via web-based editors. Roland S-330, Roland S-550, Akai S3000XL. MIDI over SCSI. SysEx protocols reverse-engineered from 1980s service manuals. A Raspberry Pi running a Rust bridge between modern browsers and 30-year-old hardware.
>
> I've done nearly all of it with Claude Code as my primary collaborator. 2,400+ sessions. 1,100+ commits. 55 sessions analyzed with quantitative metrics. And the most important thing I've learned: telling an AI agent what to do is easy. Getting it to reliably do what you told it requires something structural.

Why this works: thesis in the first two sentences. Second paragraph is a spec sheet for the project — names the hardware, names the protocols, names the stack, every line a receipt. Third paragraph drops the numbers and restates the thesis sharper.

### Good YouTube description

> The Roland S-550 coming back online after thirty years of sitting on a shelf. VGA output, SCSI drive emulation via a Rephlux HD5-IF, and the web editor running live against the hardware. No mods to the sampler itself — it boots from the original OS disk and talks to the browser over MIDI.
>
> → Editor: https://audiocontrol.org/roland/s550/editor
> → Source: https://github.com/audiocontrol-org

Why this works: one paragraph, all concrete. "Thirty years" is a receipt. Names the interface board (Rephlux HD5-IF) by part. Ends with two arrow links. No calls to subscribe.

## Common failure modes to avoid

- **Sounding like a marketing site.** If the draft contains "passionate," "community," "empower," "journey," "seamless," "unlock," "revolutionize," or "democratize," it's broken. Cut and rewrite.
- **Year-voice-bit missing.** If a hardware card doesn't have the spec line, it's broken.
- **Claims without receipts.** "Dramatically faster" fails. "From 20 corrections per session to 4" passes.
- **Title Case headers.** The site is sentence-case. Fix it.
- **"Introduction" / "Conclusion" / "TL;DR" sections.** Not used. Delete.
- **Overuse of bolded lead-ins.** They're a seasoning. If every paragraph starts with one, they're noise.
- **Apologizing for the tech.** The hardware is 30+ years old and still running. That's the point. Don't frame it as "legacy" or "old" or "obsolete" — those words assume a consumer-upgrade worldview the site rejects.
- **First-person plural when it should be singular.** If Orion did it, "I" did it. "We" is reserved for when a group actually did the thing.
