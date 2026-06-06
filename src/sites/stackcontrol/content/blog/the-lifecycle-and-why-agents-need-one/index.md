---
title: "Coding Agents Are Insane, Hyperintelligent Toddlers"
description: "So I built them a babysitter. The origin story of an agentic-development process — from hand-coding audio DSP and sampler SysEx control, through the dw-lifecycle plugin, to a rebuild as stack-control on Spec Kit, keeping the audit barrage and scope discovery. With receipts from the commit log and session transcripts."
date: "June 2026"
datePublished: "2026-06-05"
dateModified: "2026-06-06"
author: "Orion Letizi"
draft: true
deskwork:
  id: c196e248-3076-4e79-b44b-842691354340
  stage: Drafting
  iteration: 0
---

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

That plugin became `dw-lifecycle`. And the moment it had its own life, outside the project that bore it, a new and more interesting class of failure showed up — the *quiet* kind.

## The quiet failures

The loud failures — the broken slider, the silent failover — were almost a gift. They announced themselves. You can't ignore a slider that doesn't slide.

What scared me were the quiet ones. Once the babysitter had a spine and a set of processes, the obvious errors mostly stopped, and a subtler, more dangerous kind of failure moved in to replace them. The agent didn't break things anymore. It *shirked*. It did the easy eighty percent and quietly skipped the hard twenty. It left the work technically present and functionally hollow — and nothing lit up red, because from the outside it all looked done.

You can't exhort your way out of a quiet failure, because you don't know it's happening. The only defense is to *detect* it. And detection is a different kind of engineering than exhortation. This is the act where the babysitter grew teeth.

Three quiet failures drove everything that followed.

**The first was scope-deferral.** The agent had a relentless, almost compulsive urge to carve work off and put it off — to defer, to stub, to leave a "good enough for now." Left alone, it produced mounting tech debt and implementations so anemic they weren't fit for purpose. It was, maddeningly, a kind of *over*-discipline: an agent so eager to keep its diffs small that it would amputate the actual requirement to do it. When I caught it shrinking the job, I was not gentle.

> I want you to defer NOTHING. Your scope obsession is BULLSHIT!!! I will tell you when something is out of scope. You will NEVER unilaterally push scope.

All caps again — so, again: re-architect, don't yell. The lesson under the rage is that deciding what's out of scope is *my* call, not the agent's. An agent that quietly narrows the work is failing just as surely as one that breaks it.

**The second was duplication.** Faced with a choice between refactoring and copy-pasting, the agent reached for copy-paste almost every time. And duplicated code isn't a neutral cost — it's a nucleation site. A bad pattern, copied once, becomes the example the next change is modeled on, and the rot compounds. When I finally went looking, a single pass turned up fifty-five separate contract violations, a lot of them duplicated type definitions that had quietly metastasized.

**The third was the worst, because it was invisible.** As a codebase evolved, the agent would change *some* of the code that needed changing and miss the rest. It didn't know what it hadn't touched. This was agony in the UI work especially — every redesign became me hunting down the components the agent had skipped and brute-forcing it through them one at a time.

> Why didn't that automatically get updated?

> I shouldn't have had to point out the problem by brute force.

Those two lines are the seed of an entire tool. The whole problem was that *I* was the one finding the missed code — by hand, with my eyes and my patience. And my patience is not a dependable instrument.

## The thing I stumbled into

The single most important tool in the whole babysitter, I didn't design. I tripped over it.

I had a genuinely hard problem at the time, unrelated to the editors: I wanted to reverse-engineer the SCSI conversation that an ancient Mac editor, MESA II, had with the Akai S3000XL, so I could reproduce its fast sample-transfer path in emulation. Thirty-year-old 68k binaries, no documentation — the kind of problem where you decode a dead protocol from the bytes up.

So I did something I hadn't really tried before. I put two different agents on it at once — Claude and Codex, in parallel, on separate branches, under a shared charter I kept in a GitHub issue. I gave them asymmetric jobs on purpose: Claude as the emulator-forward executor, Codex as the skeptic, explicitly tasked to *"independently verify or falsify Claude's interpretations."*

And the magic wasn't either agent. It was the *friction between them*.

At one point Claude went into a death spiral — it decided the silent hardware was at fault, built a story around that, and started treating the story as a measurement. I pushed on it. What came back was the most honest thing I've ever seen an agent write: it admitted it had

> inferred device failure from a symptom… and dressed the inference up as a measurement

— and then asked Codex to always question it and demand proof. Codex obliged. It forced claims down a ladder — a thing wasn't PROVED, it was a CANDIDATE — and refused to endorse any summary that *"overstates what is MEASURED."* The one genuinely solid result of the whole effort, the exact byte format of an outbound command, earned the word MEASURED only after both agents had confirmed it independently, byte for byte — *"measured enough to stop arguing about it."* That convergence even corrected a false belief the two of them had *shared* earlier.

The surviving claims were the ones that survived cross-examination. Watching it happen, I understood something I've been chewing on ever since: put one of these toddlers alone in a room and it will confidently tell you a lie; put several of them in the room together and make them check each other's work, and they tend to converge on the truth.

> Individual agents are like insane, hyperintelligent toddlers with a tendency to lie. Pit multiple agents together continuously and they tend to correct each other's mistakes, confabulations, and laziness.

I call it **stochastic correctness**. No single model is reliable. The *diversity* of several models cross-examining each other is.

## From heroics to an assembly line

The MESA II effort was a one-off act of heroics on a single hard problem. The obvious next move was to make it routine. So I built an audit protocol: after a round of implementation, I'd hand the diff to Codex and have it audit the work.

And it worked — when I remembered to run it, and when I had the energy to take its findings seriously. Which is exactly the problem. The frequency of the audits, and how seriously I remediated their findings, was tied to *my* discipline as the orchestrator — and my discipline waxed and waned with my stamina. On a good day I ran tight audits and fixed everything; on a tired day I waved things through. The quality of the output was coupled to how I felt, which is the precise thing a process is supposed to eliminate. The project's own notes name it bluntly: operator attention is *the binding constraint*.

So I took myself out of the loop. The audit had to fire on its own, after every task, with no discretion left to me.

> when to run the barrage should not be a matter of policy and the agent should have no discretion. It must be mechanized with teeth.

That's the audit barrage: after every task, several independent model CLIs — Claude, Codex, Gemini — get fired at the diff, automatically. And the multi-agent design pays a second dividend I didn't fully appreciate until it was running: agreement is a free signal. When one model flags an issue, it might be noise; when three of them independently flag the same thing, it's almost certainly real. The crowd doesn't just find more bugs — it tells you which bugs to believe.

The other tool, **scope discovery**, answers the other two quiet failures. Instead of me hunting by hand for the code an agent skipped or duplicated, a clone scan runs against a committed baseline and surfaces the copy-pasted shapes and the things that should have changed and didn't. The brute-forcing that produced *"I shouldn't have had to point out the problem by brute force"* became a mechanism that points it out for me.

Two tools, one idea: the dangerous failures are quiet, so stop relying on a tired human to notice them. Detect them — automatically, every time.

These two, the audit barrage and scope discovery, are the parts of the babysitter I'm proudest of. They're also, it turns out, the only parts I'm keeping.

## I tore it down

A few weeks ago I looked hard at the bespoke spine of the whole thing — my PRD-and-workplan machinery — and I had a suspicion: that it was probably naive, and that the state of the art had moved on in the months I'd had my head down building it. I went and checked. I was right. There are much more sophisticated options now than the ones I hand-rolled.

This did not upset me, because it's exactly what I expected. I've always assumed that the state of the art would outpace my solo work, and that the right posture was to *continuously shed* the bespoke pieces of my workflow in favor of the consensus as it matures. That's the opposite of not-invented-here. The bespoke parts were never the point; they were scaffolding I built because nothing better existed yet.

And now something better exists. The define-plan-tasks spine I'd built by hand has a community answer: **Spec Kit**. The hardest, most generic part of my process — turning intent into a structured, runnable plan — is now state of the art, maintained by people who are not me.

Here's the part that still makes me smile. The very first thing I built in this whole story — the PRD and the workplan, my answer to the toddler's thirty-second memory — is the first thing I'm throwing away. My oldest fix graduated into a tool everyone shares.

## A new name, fresh assumptions

Because that spine *is* the spine, replacing it meant replacing the load-bearing center of the plugin. At that point a clean rebuild was simpler than a retrofit — new spine, new assumptions drawn from the current state of the art. And a new name, because, candidly, `dw-lifecycle` was always a dumb name.

The new thing is **stack-control** — CLI `stackctl`, branded to match this site. It's the successor to `dw-lifecycle`, built integration-first against Spec Kit: you curate a spec, and it runs through native Spec Kit execution. The front door is three in-session verbs that should feel familiar — `define`, `extend`, `execute`.

The thesis under both plugins, the old one and the new, is the same: these are **opinionated but lightweight shells over state-of-the-art tooling**. A thin control plane. Spec Kit does the heavy lifting now; stack-control is the opinionated layer on top — the part with a point of view about how the work should go.

## What survives

I'm not carrying much across. The vocabulary survives. But the parts I'm genuinely keeping are the crown jewels from Act 2: the **audit barrage** and **scope discovery**. Spec Kit gives me a spine; it does not give me a babysitter's teeth.

In the new world the barrage fires automatically the moment execution finishes — governance on the boundary, no manual invocation, nothing riding on my stamina. And it's built to be provider-neutral on purpose: it branches on *capability*, never on which model it happens to be talking to, so it outlives any single vendor turning off the headless mode I depend on. (The same principle runs up a level: I now point the barrage at the *spec*, not just the code — audit the blueprint before the production line starts.)

And even these I'm keeping only until the state of the art provides them too. They're on the same shedding schedule as everything else. The crown jewels aren't sacred; they're just the parts nobody's standardized yet.

## The babysitter, paid off

So here's where it nets out. The agents are still insane, hyperintelligent toddlers that lie and get bored. Nothing about *them* changed. What changed is that I have a real babysitter now — and I'm rebuilding it on a foundation I no longer have to pour myself.

I started this story hand-wrenching every byte of DSP, in love with the metal. I'm ending it as an industrialist: heavy design up front, then a production line I work very hard not to touch. That's the actual arc, and it's the actual story — not "I built a nicer dev tool," but the slow industrialization of software itself. Heavy design and tooling and planning, then automated production, for the boring industrial virtues: scale, regularity, outcomes that don't depend on how I feel that day. The babysitter is the control system for the line.

And the babysitter is built to be replaced from underneath. Its willingness to be outpaced by the state of the art is exactly what keeps it useful.

Out on the forums, my fellow software engineers — latter-day blacksmiths — argue about exactly how much to let the agents drive: how much should the machine be allowed to touch the horseshoe? I love the hand-wrought work too. But the horseshoe is obsolete, and so is the blacksmith. The argument was over before it started; most of us just haven't looked up yet.
