# Reference: longform blog voice

Read this when drafting any blog post, essay, or lessons-learned piece for audiocontrol.org. The excerpts below are from real posts on the site. Imitate the rhythm, structure, and concreteness — do not copy sentences verbatim into new drafts.

## Title + dek pattern

Title is a specific claim or specific number. Dek is one sentence that distills the thesis.

> # Instructions Are Not Enough: What 2,400 Sessions Taught Us About AI Agent Workflow
>
> Telling an AI agent what to do is easy. Getting it to reliably follow process requires something structural — skills, session journals, and correction-driven guardrails.

> # Two AIs, One Feature: What Happens When Claude and Codex Build the Same Thing
>
> Claude Code and Codex independently implemented the same draggable zone feature for the Akai S3000XL editor. The code was comparable. The sessions were not.

Pattern:
- Title has a colon break. Left side: the claim or the setup. Right side: what the piece is actually about.
- Dek is 1–2 sentences, declarative, and doesn't repeat the title.
- The dek often ends on a contrast ("The code was comparable. The sessions were not.")

## Opening paragraph

The first paragraph does not introduce the author, the project, or the post. It names the hard problem.

> The hard problem isn't getting an AI agent to write code. It's getting it to reliably follow process.

One sentence, or two. No preamble.

## Second paragraph: the spec sheet

After the thesis, the second paragraph usually establishes credibility through concrete project detail — a list of proper nouns and protocols that proves the writer is embedded in the material.

> I've been building audiocontrol — a TypeScript monorepo for controlling vintage hardware samplers via web-based editors. Roland S-330, Roland S-550, Akai S3000XL. MIDI over SCSI. SysEx protocols reverse-engineered from 1980s service manuals. A Raspberry Pi running a Rust bridge between modern browsers and 30-year-old hardware.

## Third paragraph: the numbers

Then the receipts drop.

> I've done nearly all of it with Claude Code as my primary collaborator. 2,400+ sessions. 1,100+ commits. 55 sessions analyzed with quantitative metrics. And the most important thing I've learned: telling an AI agent what to do is easy. Getting it to reliably do what you told it requires something structural.

## Bolded lead-in paragraphs (for enumerated patterns)

When listing failure modes, principles, or categorical observations, open each paragraph with a bold lead-in followed by a period.

> **Fabrication.** "No, you can't write directly to the sampler's memory. You just made that up." The agent would state device capabilities it had invented from whole cloth — protocol behaviors that didn't exist, hardware features that had never shipped. The hardware has been in continuous service for 30 years. Our code was days old. But the agent would blame the device before questioning its own work.
>
> **Refusing to delegate.** "You are the orchestrator, not the implementation team." This became the single most frequent correction across all sessions. I'd explicitly assign the agent an orchestrator role and it would immediately start writing code itself.
>
> **Skipping process.** The agent would implement without committing. It wouldn't read existing patterns before building from scratch. In one session, it wasted four iterations building broken envelope drag math when a working, debugged implementation already existed in another editor module — one grep away.

Notes:
- Lead-in is a noun phrase (one or two words). Ends with a period.
- Paragraph that follows stands on its own — often opens with a direct quote or a compressed anecdote.
- Three to six lead-ins per section is the range. Beyond that they stop feeling like emphasis.

## Inline italicized quotes

Quoted speech from the agent, the user, or a hypothetical interlocutor goes in italic quotation marks.

> *"How do you know that?"*
>
> *"No good reason. I fell into the exact pattern documented in the corrections."*
>
> *"Soft instructions are insufficient — the agent needs mechanical constraints."*

These are signature moves for the site. Use them when a single line from a session carries the weight of the argument.

## Code and diagrams inline

The site inlines small ASCII diagrams when they clarify a loop or a structure.

> ```
> Corrections → Rules → Playbooks → Templates → Autonomy
>      ↑                                              |
>      └──────────── fewer corrections ←──────────────┘
> ```

Use these sparingly. One per post, maybe. They're memorable because they're rare.

## Metrics tables

Before/after comparisons go in Markdown tables. No adjectives inside the cells.

> | Metric | Before | After (avg) | After (best) |
> | --- | --- | --- | --- |
> | Corrections/session | ~20 | ~4 | 0 |
> | Fabrications/session | ~4 | ~0.2 | 0 |
> | User messages/session | 350+ | ~30 | 3 |
> | CLAUDE.md size | 774 lines | 198 lines + scoped rules | — |

Notes:
- Use `~` for approximate figures when the precise number isn't meaningful.
- Use `—` (em-dash) for "not applicable" cells.

## "The Lessons" section

Near the end of a long post, a section titled "The Lessons" or "What actually changed" bundles takeaways. Each lesson is a bolded lead-in sentence followed by a paragraph of evidence.

> **Instructions are necessary but not sufficient.** Write the rules. But don't expect them to be followed just because they exist. LLM agents have the same problem as human teams: knowing what to do and doing it are different things.
>
> **Structure beats willpower.** The agent "deciding" to delegate is fragile. The agent having its write permissions revoked is robust. Design for the failure mode, not the ideal case.
>
> **Measure corrections, not output.** Commits and lines of code are vanity metrics. Corrections per session is the real signal.

## "What's Next" section

Closes with honesty about what's unresolved.

> The continuous-improvement feature was itself a 9-phase meta-feature with its own PRD, workplan, and GitHub issues — the same process applied to improving the process. Areas still exploring: automated trend detection for persistent correction categories, pre-commit review gates that enforce process standards, and cross-project propagation of the skills and analytics pipeline.
>
> The tension between autonomy and oversight is real. How much process is too much? When does structure become bureaucracy? No final answers.

Never ends on a marketing CTA. Ends on an open question or a compressed final line.

## Closing lines that work

> The cycle compounds.

> The goal isn't an agent that never makes mistakes. It's a system where mistakes become rules, rules become automation, and automation reduces mistakes.

> You don't solve a structural problem with more documentation. You solve it with structure.

One short sentence. The argument condensed to its bone. No call to action, no link farm, no "subscribe for more."

## Punctuation and typography in prose

- Em-dashes `—` for asides, not parentheses or semicolons.
- `·` as a separator in inline specs ("1987 · 16-voice · 12-bit").
- Italic quoted speech in single or double quotes, as above.
- No `*emphasis*` except for the quoted-speech convention.
- Numbers: "2,400+" with the comma. "30-year-old" with hyphens. "5x" without a space.
- Acronyms get introduced inline the first time if they're not universal: "CLAUDE.md — the configuration file Claude Code loads at the start of every conversation."

## What the longform voice is NOT

- Not a tutorial. Doesn't walk the reader through installation steps.
- Not a benchmark post. Doesn't lead with a score table.
- Not a feature announcement. If it's promoting a release, it's framed as "here's what we learned shipping this."
- Not a listicle. No "7 things I learned" titles, no "Top 10" anything.
- Not hedged. "Arguably" and "perhaps" and "it could be said that" don't appear. Either make the claim or cut it.
