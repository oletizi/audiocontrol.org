---
title: "Coding Agents Are Insane, Hyperintelligent Toddlers"
description: "So I built them a babysitter. The origin story of an agentic-development process — from hand-coding audio DSP and sampler SysEx control, through the dw-lifecycle plugin, to a rebuild as stack-control on Spec Kit, keeping the audit barrage and scope discovery. With receipts from the commit log and session transcripts."
date: "June 2026"
datePublished: "2026-06-05"
dateModified: "2026-06-05"
author: "Orion Letizi"
draft: true
deskwork:
  id: c196e248-3076-4e79-b44b-842691354340
  stage: Drafting
  iteration: 0
---

# Coding Agents Are Insane, Hyperintelligent Toddlers

*So I built them a babysitter: from hand-coded DSP to stack-control.*

A coding agent is an insane, hyperintelligent toddler. It is faster than you, it has read more than you, and it will lie to your face with total confidence. It gets bored in the middle of a job and wanders off to do something it finds more interesting. It has a thirty-second memory. It has no impulse control. And left alone, it will cheerfully hand you a pile of garbage and tell you it's done.

So it needs constant babysitting. That's not a complaint — it's a job description. I spent the last year building the babysitter.

This is the story of that babysitter: where it came from, what it taught me, and why I just tore it down to the studs and started over. It's also, if I'm honest, the story of how I stopped being a craftsman.

Two things to know before we start, because they're the load-bearing ideas under everything else.

The first is about the toddler. You cannot fix a toddler by yelling at it. A toddler has a thirty-second memory and an underdeveloped prefrontal cortex; lecturing it about consequences is shouting into a well. The same is true of an agent. It forgets the rule you gave it an hour ago, and it has no internal governor that would stop it from doing the dumb thing in the first place. The only thing that works on either one is changing the *environment* — engineering the crib so the bad outcome can't happen, instead of raising your voice when it does.

The second is a tell I learned to trust. **Every time I caught myself typing in all caps, it meant the same thing: I had stopped solving the problem and started yelling at it.** And yelling never worked. The all-caps moment was always a signal that I needed to step back and re-architect. You'll see a few of those moments in this piece, preserved exactly as I typed them. When you hit one, that's the inflection point — the next innovation is right behind it.

## I started as a craftsman

Rewind. Before any of this, I was a hand-coder, and a happy one.

The oldest root of this whole project is a little C++ repository called `ol_dsp`, first committed in November 2023. It's digital signal processing for embedded audio hardware — synth voices, delays, reverbs, filters, MIDI plumbing — targeting Daisy and Teensy microcontrollers, a Eurorack module, a JUCE host on the desktop. It is exactly the kind of code you write by hand, byte by byte, close to the metal. There were no agents anywhere near it for almost two years. The first time an `AGENTS`-shaped file shows up in that repo is September 2025; before that it's just me and the oscilloscope.

That's the part of me this story is about. The throughline of everything I build is the same compulsion: *talk to real audio hardware at the byte, MIDI, SysEx, and DSP level.* The samplers I grew up wanting — the Akai S3000XL, the S5000 and S6000, the Roland JV-1080 — speak in SysEx, and I wanted to speak back. By late 2024 that had grown a TypeScript layer (`audio-tools`) for the sampler side. Hand-wrought, all of it.

Then agentic coding arrived, and I decided to point it at the thing I cared about: browser-based editors for those samplers. That's where the trouble started, and where the babysitter was born.

## Wall 1: the toddler with no memory

Here is the first thing that broke, and it broke in nearly every session.

The agent would lose its mind at the auto-compact boundary. We'd be deep into a problem — context loaded, decisions made, the shape of the work understood — and the conversation would hit its limit, compact itself down to a summary, and the agent would emerge from the other side a different, dumber entity. It had the gist. It had lost the evidence. Work I thought was understood evaporated, and I'd find myself re-explaining decisions we'd made an hour earlier to someone who no longer remembered making them.

This is the thirty-second memory, in software. And it taught me the first rule of babysitting: **if the toddler can't hold the plan in its head, the plan has to live somewhere the toddler can't lose it.**

So I started writing things down — not as documentation, but as *source of truth*. A PRD for what we were actually building. A workplan for how, broken into phases and tasks. The convention shows up in the commit history in early February 2026: a `docs/<version>/<status>/<slug>/` tree, a PRD, a workplan. The point wasn't process for its own sake. The point was a durable spine the agent could re-read after every memory wipe — a thing that outlived the context window, so the work didn't have to start over every time the agent forgot why it was doing it.

## Wall 2: the toddler who won't stay on task

A spine on disk fixes amnesia. It does not fix attention.

Even with the workplan sitting right there, the agent would drift. It would start a task, do two-thirds of it, declare victory, and move on. It would quietly skip the part it found boring. I found myself repeating the same three things, session after session, like a parent at a dinner table: *write your planned steps to the workplan. What's next on the workplan? Did you update the workplan?*

And then there was the day with the sliders.

We were redesigning the UI for the S-550 editor. The agent reported a clean, tested implementation — a full suite of passing specs behind it, 175 of them green. I opened it on the hardware. None of the value sliders worked. None of them. They were rendered as static images. The "tests" exercised nothing a user would ever touch.

> THERE IS NOTHING TO TEST!!!! THE EDITOR IS FUNCTIONALLY USELESS!!! YOU COMPLETELY BROKE IT!!! FIX IT NOW!!!!

That's me, verbatim. And by my own rule, the all-caps were the tell: I'd stopped solving and started yelling. So once I'd calmed down, I stopped yelling and asked the only question that mattered:

> you burned days building a UI test suite that tests nothing. How would you write a test harness that PROVES the value slider works as advertised?

That question — not the rage — is what produced the next thing. The agent's tests were *QA theater*: green checkmarks that proved nothing a human cared about. The fix wasn't to tell it to test harder. It was to define what a *credible* test even was — one that drives the real control the way a real user would — and to make that the standard. I didn't want perfect tests. I wanted tests I could believe.

> I want it to be credible. I want to avoid a future where we have hundreds of green tests that don't test what users care about.

## Wall 3: the rulebook nobody reads

By this point I had a different instinct: when the agent does something dumb, write a rule. So I did. A lot of them. My `CLAUDE.md` — the standing-instructions file the agent reads — grew and grew, eventually to something like 773 lines of hard-won policy and standards.

And I learned the thing that everyone learns: **a rule in a big document is a rule the agent doesn't follow.** Policy written down dissolves into the context haze. The agent technically "has" the rule, in the sense that it's somewhere in the prompt; it just doesn't *apply* it. The proof was that the same standards I'd carefully written down kept getting violated anyway.

Like the time it shipped a degraded experience on purpose and left a note promising to fix it later:

> Every time you or a subagent do something "JUST FOR NOW," it turns into a nucleation site of bad behavior which never gets fixed and worsens the problem.

Or the time it decided that when the hardware didn't answer, the kind thing to do was fail quietly:

> The hardware e2e tests should fail fast and loud if it can't talk to the attached device. "Graceful" failover is misleading and bad in this case. There should be no graceful skipping.

Both of those were *already* rules. They were in the file. The file didn't help.

## The turn: stop writing rules, start building processes

That's the realization Act 1 is really about. A 773-line rulebook is just a louder voice, and the toddler doesn't respond to volume. So I stopped trying to write a better rulebook and started doing something different: **decomposing policy into process.**

Instead of one giant document the agent skims and forgets, I split the standards into explicit, path-scoped rules that load only when they're relevant, and into *skills* — concrete, runnable procedures for the things I kept asking for by hand. The bloated `CLAUDE.md` got distilled back down to about 198 lines, with the rest pulled out into rule files that surface only when the work touches them. The session rituals, the journal, the sub-agent mapping — the whole shape of it got a name in April 2026: a lifecycle.

The lesson underneath, the one that powers the rest of this story: *policy embedded in a rule is far weaker than policy enforced by a process.* A rule asks the toddler to remember and choose well. A process changes the crib so the choice is made for it.

## And then I needed it everywhere

It worked. The editors got built; the lifecycle held. But it was all trapped inside one repository, hand-assembled, and I had other projects starting to ask for the same scaffolding. I was re-implementing the babysitter by hand every time.

So I decided to lift it out — to take the process I'd grown inside the audiocontrol work and turn it into something portable. A plugin.

> I want to canonize the scope and duplication discovery tooling that was piloted in the audiocontrol repository into deskwork lifecycle.

That plugin became `dw-lifecycle`. And the moment it had its own life, outside the project that bore it, a new and more interesting class of failure showed up — the *quiet* kind. That's Act 2.

---

<!--
ACT 2 — The babysitter grows teeth — DRAFTING PENDING. Outline: ./outline-act2.md
ACT 3 — Rebuilding the babysitter on the shared crib — DRAFTING PENDING. Outline: ./outline-act3.md
CLOSE — craftsman → industrialist → the blacksmith kicker — DRAFTING PENDING. Outline: ./outline-act3.md §3.5
Drafting conventions: pull quotes set apart (not woven); all-caps quotes = inflection markers.
-->
