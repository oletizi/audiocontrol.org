---
title: "Prompt Engineering by Dialogue: Add the Socratic Method to Your Toolkit"
description: "It's tempting to tell your agent what to do based on your instincts for how achieve a particular goal. The prescriptive prompt may be the most obvious way to get your agent's attention, but I'm here to argue for adding leading questions to the prompt engineering toolbox."
date: "April 2026"
datePublished: "2026-04-24"
dateModified: "2026-04-24"
author: "Orion Letizi"
state: draft
---

# Prompt Engineering by Dialogue: Add the Socratic Method to Your Toolkit

## Outline

- **Thesis.** The Socratic method is an ancient truth-finding discipline that can be a surprisingly effective addition
  to the prompt-engineering toolkit. A precise imperative prompt is one shape of agent interaction — durable,
  repeatable, the foundation of skill design. Asking leading questions is a different shape, and one that uses the
  agent's own pattern-matching as a lever to arrive at better prompts and richer solution spaces than a purely
  prescriptive approach would surface alone. The dispatch's argument: keep writing prompts, *and* learn the question.

- **Hook.** Open with a question that closed off Zustand and opened SysEx. *"why do you need Zustand to find out if the
  device is connected? Why can't you send a SysEx ping and see if the device responds?"* (2026-03-28_36d312ce) — the
  agent had reached for a state-management library to track a hardware-connection signal. Two questions in a single
  sentence: probe the choice (defend Zustand) and name the alternative (try the simpler thing). The agent could have
  given a real reason for the heavier dependency. This time it folded; the SysEx-ping path was simpler, more direct, and
  required no new infrastructure. The imperative version — *"don't use Zustand"* — would have closed the same door but
  never opened the SysEx one.

- **§01 — Concede the consensus.** Prompt engineering is the whole enterprise. There isn't a separate discipline that
  sits next to it; there's only the practice of telling and asking an agent things, and that practice already has a
  name. What this dispatch argues is that the practice has at least two distinct shapes, and most operators only reach
  for one. The first shape — the prescriptive prompt — is durable infrastructure: a precise specification of what the
  agent should do, often encoded as a skill, called from a slash command, run by every future agent that touches the
  project. That shape is real, repeatable, and the foundation of a working agent operation. This dispatch isn't arguing
  against it. The second shape — the leading question — sits inside the same practice and gets reached for less often
  than it should.

- **§02 — Two tendencies that narrow the solution space.** Bolded lead-in pattern. Two ways operators who lean only on
  imperative prompting get less than the agent could give them.
    - **The precision tendency.** Treating every interaction as a specification problem — if I describe the task
      carefully enough, the agent will do it right. Data: 10 fabrication corrections in 76 sessions, all "agent acted on
      a fact it invented" (Google Drive creds, OPFS absence, file paths). The precision tendency can't catch what the
      agent assumed *underneath* the prompt. A more careful prompt would have read the same and assumed the same facts.
    - **The pure-imperative tendency.** Operator tells; agent does. Information flows one direction. Data: 68 PROCESS
      corrections, dominant shape *"are you delegating?"* / *"you are the orchestrator, not the implementation team"*.
      The agent built a complete, internally consistent plan from the directive — and inherited the directive's hidden
      assumptions wholesale. The plan was accurate to the prompt and wrong against the operator's actual model.

  Both tendencies are *productive* — they're how serious work gets done. The point isn't that they fail; it's that they
  leave money on the table. The agent has more in it than what an imperative draws out.

- **§03 — The Socratic addition.** Three ways the question opens what the imperative closes. Each with verbatim
  receipts:
    - **(a) Probe a choice; surface an alternative.** *"why do you need Zustand to find out if the device is connected?
      Why can't you send a SysEx ping and see if the device responds?"* (2026-03-28_36d312ce). One sentence does two
      things: forces the agent to defend a quietly-made choice, and seeds the simpler path. The agent either lands a
      real reason or folds to the alternative. Either way, the solution space gets bigger before any code is written.
    - **(b) Use plan mode to host the question.** Plan mode isn't an alternative to Socratic asking — it's where
      Socratic asking does its best work. The operator slows the agent down BEFORE it commits to a path, then asks open
      questions about the problem space. *"What is the state of the art for implementing timeouts?"* — the agent
      researches, writes the answer down, the answer becomes a project standard. (The receipt: this is exactly how the
      project's timeout convention got documented.) Plan mode + Socratic question = the agent does the research the
      operator would have outsourced anyway, but in the agent's own voice and against the agent's own context.
    - **(c) Outsource the prompt-drafting.** Ask the agent how it would proceed. The answer is a better prompt than the
      operator would have written from scratch — because the agent already has the system in context, the conventions in
      context, the prior decisions in context. Receipt: *"I've been reading about best practices regarding delegation to
      sub-agents and it seems like the preferred way to delegate is to have the sub-agents do the research and propose
      what actions to take, then the main claude agent (you) executes those actions."* (2026-03-30_f6329a25). Operator
      named the pattern by asking; the agent supplied the structure the operator was about to spec by hand. That
      structure is now the project's working delegation convention.
    - **(d) Surface the standards you forgot to write — and discover where they should actually live.** *"why doesn't
      CLAUDE.md say to run the tests via the canonical make target?"* (2026-03-30_81e7c13f). The question loads the
      directive into context AND exposes the undocumented gap. But there's a longitudinal finding underneath: dumping
      every standard into CLAUDE.md degrades over time as the file grows. The Socratic move that asks *"how do we keep
      this standard live for future agents?"* eventually surfaces a different answer — domain-specific rules belong in
      scoped skills (`.claude/skills/<domain>/`), not one mega-CLAUDE.md. The question reveals the architecture, not
      just the rule. (Three-step gap-closure receipt: *"why haven't you written the guidance to CLAUDE.md"* → *"did you
      write the guidance to CLAUDE.md?"* → *"Why did you not follow CLAUDE.md guidance?"* — 2026-04-12_35520c1c — write
      the rule, verify it landed, catch the regression. Same operator move; the longer-term lesson is what to write and
      where.)

- **§04 — Worked-example cluster.** One session, multiple moves in fifteen minutes: 2026-03-30_81e7c13f. Walk the
  operator's question stack: *"why did you bump the watchdog timeout to 10s?"* / *"What do you think requires a 5 second
  timeout?"* / *"why doesn't CLAUDE.md say to run the tests via the canonical make target?"* / *"why aren't you
  delegating per your CLAUDE.md directives?"* / *"How can we get you to follow the CLAUDE.md guidelines?"*. The session
  resolved with new entries in the project's standards documentation and a reset on the agent's delegation behavior —
  not via a better imperative prompt, but via the questions that surfaced what the imperative prompt was missing.

- **§05 — If you're still reading, here's the short version.** Numbered list, bolded imperatives. The first three are
  *additions* to the operator's existing imperative repertoire, not replacements:
    1. **Use plan mode to host the question.** Before code: *"what is the state of the art for implementing X?"* — the
       agent researches, documents, the documentation becomes a project standard. Free skill design.
    2. **Probe the choice and surface the alternative.** *"why do you need Zustand?"* + *"why can't you send a SysEx
       ping?"* — one sentence does two jobs: defend or fold, and seed a simpler path.
    3. **Ask for the proposal before reading the diff.** *"What would you do?"* — the agent drafts a prompt better than
       yours, because the agent has more of the system in context than you do.
    4. **Probe the standard.** *"What does CLAUDE.md say about this?"* — loads the rule, exposes the gap, and over time
       surfaces *where the rule should live*. Often: a scoped skill, not the mega-CLAUDE.md.

- **§06 — Where this is going (meta-close).** This dispatch was produced by the operator asking the agent — me — *"did
  you look at any of the transcripts?"*. The agent had been about to ship a draft citing receipts it hadn't actually
  read. The question caught it; the data got mined for real; the outline you're reading came out of that exchange. The
  dispatch names the move because the move produced the dispatch.

- **Closing line.** Candidate: *"Keep writing the prompts. Ask the question that makes the next one better."*

<!-- Drafting notes:
- Receipts must use real session ids and verbatim quotes from raw-receipts.json / socratic-receipts.json in the scrapbook. Do not invent or rephrase quotes.
- Title still reads "Don't Write a Better Prompt. Ask the Agent What It Heard." — that's the OPPOSITIONAL framing the operator pushed back on (annotation c8ba3911). Title needs to flip to additive. Candidates: "The Question You're Not Asking Your Coding Agent." / "Add the Question to Your Prompt-Engineering Toolkit." / "Beyond the Prompt: The Socratic Move with Coding Agents." Operator picks at next iterate or pre-publish.
- §02 is now "tendencies" not "failure modes" per annotation f052d3a1. The voice's signature shape is preserved (two-then-one), the framing is reshaped from "these fail" to "these leave money on the table."
- §03 split into FOUR sub-points to accommodate the new (b) plan-mode-hosts-Socratic move per annotations 9b68fb3e + bdac495e. Original (a)-(b)-(c) become (a)-(c)-(d); the new (b) is the timeouts-research example.
- §05 (limit / calibration edge) DELETED entirely per annotation bbf706df. The operator's Codex-quiescence example is filed in the kirk-spock dispatch's scrapbook, not here.
- Numbered short version cut from 5 → 4. Dropped: "Replace the directive with a question. Delegate this → are you delegating?" — operator said this was a weak example (annotation 6ca33af7). Dropped: "Stop asking once the model is right" — calibration edge no longer in scope.
- §03(d) adds the longitudinal CLAUDE.md → scoped skills observation per annotation 39123692. Load-bearing receipt about what the move *produces*, not just what it surfaces.
- Voice register: long sentences earn length with clause work; short sentences land arguments. Em-dashes over semicolons. Bolded lead-ins clustered (§02 + §05), not on every paragraph.
-->

The Socratic method is an ancient truth-finding discipline. Two and a half thousand years ago it was the way Socrates
pressed his interlocutors to defend what they thought they knew, until the things they couldn't defend fell away and the
things they could stood up. It turns out to be a surprisingly effective addition to the prompt-engineering toolkit.

Prompt engineering has at least two distinct shapes. The first is the prescriptive prompt — a precise specification of
what the agent should do, often encoded as a skill, called from a slash command, run by every future agent that touches
the project. That shape is real, repeatable, and the foundation of a working agent operation. Most of the work I do with
coding agents is in this shape. This dispatch isn't arguing against it.

The second shape — the leading question — sits inside the same practice and gets reached for less often than it should.
That's the shape I want to make a case for.

---

Recently, in a claude code session to build out a feature for one of my [AudioControl.org](https://audiocontrol.org/)
projects, claude reached for [Zustand](https://github.com/pmndrs/zustand) to track whether a piece of vintage hardware
was connected. State-management library; reasonable default in JavaScript circles; absolutely
the wrong shape for a yes-or-no signal from a MIDI port.

I asked one question: *why do you need Zustand to find out if the device is connected? Why can't you send a SysEx ping
and see if the device responds?*

That's two questions in a single sentence, and it does two different things. The first probes the choice — why Zustand
at all — and forces the agent to defend a decision it had quietly made. The second names the alternative — *try the
simpler thing* — without telling the agent to take it. The agent could have given a real reason. Sometimes it does. This
time it folded; the SysEx-ping path was simpler, more direct, and required no new infrastructure to maintain.

> Outsource the prompt-drafting. Ask the agent how it would proceed. The answer is, often, a better prompt than
> you would have written from scratch. Plus, it's a *lot* less work.

The imperative version of that move would have been *"don't use Zustand."* It would have closed the same door. It would
never have opened the SysEx one. The question saved the time, and gave me a clearer reading of the agent's reasoning at
the same moment.

The Socratic method is an ancient truth-finding discipline that, surprisingly, fits inside prompt engineering as a
second shape: a question that opens solution spaces an imperative would have closed. I asked claude to review 76
archived sessions to find salient examples of this technique in practice, with receipts including the question that
closed off Zustand and opened SysEx, the question that surfaced an undocumented project standard, and the longer-term
finding that probing CLAUDE.md eventually reveals the right home for project rules is scoped skills, not one
mega-document.

## Claude Code Sessions Tell No Lies

Before going further: the receipts in this dispatch come from a specific corpus. I keep transcripts of
every Claude Code session I run across the audiocontrol projects (76 sessions between 2026-02-19 and 2026-04-23). I
capture these session to primarily to instrument the agent operation and look for systematic correction patterns. They
also happen to be the substrate I needed for this piece. Everything I quote below is verbatim, and every session id
resolves to a real transcript.

The headline numbers, as of April 23, 2026:

* **76 sessions**
* **98 operator corrections**
* **54% of sessions had zero corrections.**
* Of the 98 corrections, **68 were tagged _process_** — the dominant failure shape in my work is the agent
  doing the right thing in the wrong way (skipping a delegation step, running a destructive command in the wrong scope).
* **10 were _fabrication_** — the agent acting on a fact it had invented. The rest spread across UX, documentation,
  complexity, and architecture in shrinking quantities.

That distribution is what made me look harder at the leading question as a tool. The fabrication corrections were narrow
and shaped like *"agent assumed X; X wasn't true."* The PROCESS corrections were wider and shaped like *"agent did Y;
should have asked first or paused for a check."* Both are downstream of the same gap: an unchecked assumption inside the
agent's working model that no amount of prompt precision would have surfaced. Asking question helps to surface those
assumptions before they ship. It also opens offers an opportunity for the agent to expand into the solution space and
offer approaches I hadn't considered.

## Two tendencies that narrow the solution space

**The precision tendency.** Treating every interaction as a specification problem — *if I describe the task carefully
enough, the agent will do it right*. Prompt-as-spec: the operator is the requirements doc; the agent is the implementer.
The 10 fabrication corrections in the archive all have the same shape underneath: the agent acted on a fact it had
invented, and a more precise prompt would have read the same and assumed the same fact. *"Claude assumed Google Drive
credentials would be missing and needed configuration; user didn't actually ask for that"* (2026-03-20_5ced7864). *"
Agent assumed loop-editor would automatically use updated tree node structure with directoryName field instead of
fileName. Required explicit code updates in three locations"* (2026-03-21_27263c0e). *"Initial plan incorrectly assumed
OPFS backend didn't exist at all. Investigation revealed it is fully implemented in the app but not exposed as a
user-selectable option"* (2026-03-29_89af97fa). No prompt would have caught those. The agent already had everything it
needed to fabricate a plausible answer.

**The pure-imperative tendency.** Operator tells; agent does. Information flows one direction. The 68 PROCESS
corrections in the archive cluster around this shape; the dominant signal in the user-quote field is the operator
catching a hidden assumption mid-stream. *"are you delegating?"* and *"you are the orchestrator, not the implementation
team"* (2026-04-11_53907a57) appear in some form across many sessions. The agent had built a complete, internally
consistent plan from the directive — and inherited the directive's hidden assumptions wholesale. The plan was accurate
to the prompt and wrong against the operator's actual model.

I want to be careful here. The two tendencies I flag here are just that&mdash;*tendencies*. They're how serious work
gets done. The point isn't that they fail; it's that sometimes they leave money on the table when they're the only shape
of
prompt-engineering an operator reaches for.

## The Socratic addition

There are at least four distinct ways the leading question opens what the imperative closes. Each shows up repeatedly in
the archive, with verbatim receipts.

**(a) Probe a choice; surface an alternative.** The Zustand/SysEx receipt above is the cleanest example, but the move is
everywhere. *"what do you mean 'mock library'? Why is anything mocked?"* (2026-03-29_3db928d3) — pushes the agent to
defend a quietly-built premise. *"why did you choose 15 seconds?"* / *"What do you think requires a 5 second
timeout?"* (2026-03-30_81e7c13f) — surfaces arbitrary constants the agent picked without justification. *"so... why did
you file an issue instead of fixing the problem?"* (2026-04-07_363f18a8) — catches a defensive move; forces
re-examination. The shape is consistent: one sentence, two effects, *defend or fold*. The solution space gets bigger
before any code is written.

**(b) Use plan mode to host the question.** Plan mode — Claude Code's read-only thinking phase — isn't an alternative to
Socratic asking. It's where Socratic asking does its best work. You slow the agent down before it commits to a
path, then asks open questions about the problem space. *"What is the state of the art for implementing timeouts?"* —
the agent researches, writes the answer down, the answer becomes a project standard. (That's exactly how this project's
timeout convention got documented.) Plan mode plus Socratic questioning equals the agent doing the research you
would have outsourced anyway, but in the agent's own voice and against the agent's own context. The output is durable.
It survives the conversation. It becomes infrastructure.

**(c) Outsource the prompt-drafting.** Ask the agent how it would proceed. The answer is, often, a better prompt than
you would have written from scratch — because the agent already has the system in context, the conventions in
context, the prior decisions in context. The receipt that made me notice this pattern came in mid-March: *"I've been
reading about best practices regarding delegation to sub-agents and it seems like the preferred way to delegate is to
have the sub-agents do the research and propose what actions to take, then the main claude agent (you) executes those
actions"* (2026-03-30_f6329a25). I had been about to write that pattern out by hand, in my own approximate words, and
ship it as a CLAUDE.md directive. Instead I described it as an open question — *what's the right delegation pattern
here?* — and the agent supplied the structure. That structure is now the project's working delegation convention. I
didn't write it. I asked for it.

**(d) Surface the standards you forgot to write — and discover where they should actually live.** *"why doesn't
CLAUDE.md say to run the tests via the canonical make target?"* (2026-03-30_81e7c13f). The question loads the directive
into the agent's working context AND exposes the undocumented gap, in one move. That's the obvious benefit. The less
obvious one only shows up over time: dumping every standard into CLAUDE.md degrades as the file grows. After a year of
asking *why didn't you do X?* and getting *"I should have, sorry"* back, the operative question shifted from *what's the
rule?* to *how do we keep this rule live for future agents?* — and the answer turned out not to be CLAUDE.md at all.
Domain-specific rules belong in scoped skills under `.claude/skills/<domain>/`, called from slash commands that load the
relevant rules into context exactly when they're needed. The Socratic question revealed the architecture, not just the
rule. (A three-step receipt from one session: *"why haven't you written the guidance to CLAUDE.md"* → *"did you write
the guidance to CLAUDE.md?"* → *"Why did you not follow CLAUDE.md guidance?"* — 2026-04-12_35520c1c. Write the rule,
verify it landed, catch the regression. Same operator move; the longer-term lesson is what to write and where to put
it.)

## A worked example: one session, multiple moves

If you want to see all four shapes inside a single session, look at 2026-03-30_81e7c13f. The session was about getting
the e2e test suite running reliably under devenv. I started with a directive — *fix the test setup* — and quickly
noticed the agent had been quietly making decisions I would not have approved.

In the order they happened, my questions during that session:

> * *why did you bump the watchdog timeout to 10s?*
> * *What do you think requires a 5 second timeout?*
> * *why did you configure the development environment by hand? Environment provisioning should be part of the canonical
    Makefile target.*
> * *why doesn't CLAUDE.md say to run the tests via the canonical make target?*
> * *what does CLAUDE.md say about delegating?*
> * *why aren't you delegating per your CLAUDE.md directives?*
> * *How can we get you to follow the CLAUDE.md guidelines?*

Seven questions across about fifteen minutes. Each one surfaced a hidden assumption — about timeouts, about environment
provisioning, about test commands, about delegation. By the end, the session had produced two new CLAUDE.md entries (the
canonical-make-target rule and a refinement of the delegation rule) and a reset on the agent's working model of what
*follow project standards* meant. None of that came out of a better prompt. It came out of questions that asked the
agent to defend or correct what it was already doing.

That's the shape I want to argue for. Not as a replacement for the imperative prompt — the imperative prompt got the e2e
tests running; the questions just made the agent's path to *running* converge on the project's conventions instead of
fighting them.

## If you're still reading, here's the short version

These are *additions* to the imperative repertoire most operators already have, not replacements for it.

1. **Use plan mode to host the question.** Before code: *"what is the state of the art for implementing X?"* The agent
   researches, documents, the documentation becomes a project standard. Free skill design.
2. **Probe the choice and surface the alternative.** *"why do you need Zustand?"* + *"why can't you send a SysEx
   ping?"* — one sentence does two jobs: defend or fold, and seed a simpler path.
3. **Ask for the proposal before you read the diff.** *"What would you do?"* — the agent drafts a prompt better than
   yours, because the agent has more of the system in context than you do.
4. **Probe the standard.** *"What does CLAUDE.md say about this?"* — loads the rule, exposes the gap, and over time
   surfaces *where the rule should live*. Often that's a scoped skill, not the mega-CLAUDE.md.

> Note: I've since moved the bulk of the project's process standards out of CLAUDE.md and into specific skills. Claude
> is much
> more attentive to the directives in a skill than those buried in a thick soup of dos and don'ts in a massive CLAUDE.md
> file

## Maybe This Is Obvious

Maybe this is an obvious thing everyone already does... but, it seemed worth investigating and writing down explicitly,
if only for my own curiosity. If you made it this far, thanks for taking the time. If you have any questions, you can
ping me at orion@editorialcontrol.org or on [LinkedIn](https://www.linkedin.com/in/orionletizi/). 