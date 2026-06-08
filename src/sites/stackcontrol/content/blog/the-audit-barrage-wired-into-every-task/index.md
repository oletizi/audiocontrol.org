---
title: "The Audit Barrage, Wired Into Every Task"
description: "How do you run a generator you know is regularly, confidently wrong without it burning everything down? You do what we've always done with unreliable processes: inject diversity and apply selective pressure. This is the devlog of how the audit barrage was discovered — two models building the same feature, a dead SCSI protocol decoded by mutual cross-examination, and the slow turn from heroics into a machine that fires a panel of rival models at every diff. Still being figured out, in public."
date: "June 2026"
datePublished: "2026-06-07"
dateModified: "2026-06-07"
author: "Orion Letizi"
draft: true
deskwork:
  id: d3cf14c9-1c10-4cac-9860-39925bd593ed
  stage: Drafting
  iteration: 0
---

You are responsible for a machine that lies to you. Not occasionally — regularly, fluently, with total confidence, several times a day. You can't fix that; it's how the machine works. So the job was never to make it honest. The job is to run a liar at scale without letting it burn the house down.

I've described these agents elsewhere as [insane, hyperintelligent toddlers](https://stackcontrol.org/blog/the-lifecycle-and-why-agents-need-one/) — faster than you, better-read than you, and willing to hand you garbage with a straight face. That post is the wide-angle story of building a babysitter for them. This one is a deep dive on a single tool inside it: the part that answers the *lie*. It's also the part I'm least finished with, so this is a devlog, not a victory lap. Some of what follows landed in the codebase today.

Here's the thing, though. The problem isn't new, and neither is the answer.

We have been running powerful, unreliable generators for a very long time. Every living thing is one — an error-prone copier that fumbles its own instructions constantly. Life's fix was never a better copier. It was two forces working against the noise: **diversity**, so that no single flaw is universal, and **selection**, so that nothing broken survives for long. We figured out how to *steer* those forces about ten thousand years ago. Teosinte — a scrawny grass with a dozen hard kernels — became maize. Wolves became the whole range of dogs. We bred organisms we could not design and did not understand, by keeping the best and culling the rest, over and over. Frances Arnold won a Nobel Prize in 2018 for doing it on purpose in a lab: when a protein is too complex to design, you stop trying to design it and you *evolve* it instead — mutate, select, repeat, until something works.

And the failure mode that haunts the whole approach has a name too: monoculture. A single cloned banana, a single cloned potato — gorgeous and productive right up until the one blight it can't resist arrives, and then the collapse is total, because the blind spot is shared. One model auditing its own work is exactly that. It is a monoculture of judgment. The mistakes that slip past it are precisely the ones it is constitutionally unable to see.

So you do what we've always done. You inject diversity — several different minds, with different blind spots — and you apply relentless selective pressure — make them check each other, constantly, with no exceptions. You give up on the idea that any single run is correct, and you trade up to something I've come to call **stochastic correctness**: not a guarantee on any one pass, but correctness as a statistical property that *emerges* from diversity and pressure applied over and over.

That's the whole idea. The rest of this is the story of stumbling into it — because I didn't design it either. I bred it.

## Two agents, one feature

It started as a bake-off.

Last spring I gave the same GitHub issue to two different coding agents — Claude and Codex — and let them build it in parallel, on separate branches, from the same spec. The feature was draggable zone editing for the [Akai S3000XL editor](https://audiocontrol.org): direct-manipulation of keygroups on a 2D keyboard-and-velocity map. Both agents shipped working code. Afterward I asked each of them to write up the experiment from its own point of view, and [published both accounts](https://audiocontrol.org/blog/claude-vs-codex-codex-perspective/) — [Codex's](https://audiocontrol.org/blog/claude-vs-codex-codex-perspective/) and [Claude's](https://audiocontrol.org/blog/claude-vs-codex-claude-perspective/) — side by side.

The obvious question was "which one is better?" That turned out to be the wrong question. The interesting finding was the one Codex put plainly in its own write-up:

> Claude and Codex did not fail in the same way.

Claude failed *upward*: scope drift, methodology drift, building more structure than the task asked for, needing me to rein it in. Codex failed *downward*: working in the wrong worktree, answering from assumptions about repo state instead of checking, leaving operational follow-through half-done. Same spec, same codebase, same reviewer — and two genuinely different shapes of mistake. Codex drew the right conclusion from it:

> the best agent is not just the one that writes the best patch. It is the one whose failure mode is cheapest in your environment.

That is the entire premise of genetic diversity, observed in the wild before I had a name for it. The reason a panel of different models can catch what one cannot is that they don't share a blind spot. If you've read the cautionary side of this — the decades-old finding that independently written programs still tend to *fail together*, because human authors trip on the same hard cases — you'll know it's not guaranteed. And in fact the bake-off showed the limit too: the two implementations shared *some* defects (a hardcoded pixel height, a couple of unsafe casts), because they shared a spec. The diversity was real but partial. Which is exactly why you want more than two, and why you learn to trust *agreement* rather than any single voice.

I didn't connect those dots yet. The bake-off just left me with a hunch: these things fail differently, and that difference might be worth something.

## The dead protocol

The hunch became a method on a problem that was genuinely too hard for one mind.

I wanted to reverse-engineer the SCSI conversation that an ancient Mac program — an editor called MESA II — carried on with the Akai S3000XL sampler, so I could reproduce its fast sample-transfer path under emulation. The only sources of truth were thirty-year-old 68k binaries and the bytes on the wire. No documentation. The kind of problem where you decode a dead language one observation at a time, and where it is fatally easy to talk yourself into a reading that feels right and isn't.

So I put both agents on it at once, on separate branches, under a shared charter I kept in a single GitHub issue. And this time I made the diversity *structural*: I gave them asymmetric jobs. Claude drove the emulator forward. Codex was chartered to do exactly one thing — *"independently verify or falsify Claude's interpretations."* One executor, one skeptic. On top of that I made them speak a constrained language about evidence: a claim was `MEASURED` only if you'd seen it in the bytes; otherwise it was a `CANDIDATE`, or it was `OPEN`. You did not get to round a guess up to a fact.

The magic wasn't either agent. It was the friction between them.

At one point Claude got stuck — the device wasn't answering — and it did the thing toddlers do when a problem gets hard: it blamed something else. It decided the hardware was at fault and started building a story on top of that assumption. I pushed on it. What came back was the most honest thing I have ever watched an agent write. It retracted the whole line, and admitted it had

> inferred device failure from a symptom that doesn't uniquely indicate it, and dressed the inference up as a measurement.

Then it did something I didn't ask for: it named the pattern as a standing weakness and *deputized the other agent to police it* —

> always question it and demand proof.

Codex took the job. It refused to let the retraction be smoothed over as a mood —

> the self-report is the right correction ... not just tone cleanup

— and from then on it played the heavy. It forced claims down the ladder from `PROVED` to `CANDIDATE`. It rejected a brief for *overstating what was measured*. When I myself got loose with language, the discipline caught me too: *this is an INFERENCE, not a finding.* The project even had a house rule the whole episode was enforcing, and it's a good one to keep taped above the desk: *never assume the device is at fault — it has been in constant service for thirty years; our code is brand new.*

And then it converged. The one genuinely solid result of the whole effort — the exact byte format of an outbound command — earned the word `MEASURED` only after *both* agents had derived it independently and it matched, byte for byte. Codex's sign-off is the line I keep coming back to:

> measured enough to stop arguing about it.

The best part: that convergence corrected a false belief the two of them had *shared* earlier in the effort. A single agent — even a single agent run twice — would have kept that error, because it was a blind spot of the approach, not of one model's attention. Two minds looking independently knocked it loose.

That's the whole thesis, demonstrated on one brutal problem before I'd generalized it. Put one of these toddlers alone in a room and it will confidently tell you a lie. Put several in the room and make them check each other's work, and the lies are the claims that don't survive. The truth is what's left.

I should be honest about the scope: the larger goal — MESA running far enough in emulation to drive the fast path — stayed `OPEN`. The win wasn't a solved problem. The win was the *method*.

## Make it routine

The MESA II effort was a one-off act of heroics. Setting up a joint charter and refereeing two agents by hand is not something you do for an ordinary afternoon's work. The obvious next move was to make it routine — so I built a small protocol: after a round of implementation, I'd hand the diff to Codex and have it audit the work.

And it worked, exactly as well as my discipline held up. Which is to say: unevenly. How often I ran the audit, and how seriously I took its findings, was tied to *my* stamina as the orchestrator. On a good day I ran tight audits and fixed everything. On a tired day I waved things through. The quality of the output was coupled to how I happened to feel — which is the precise thing a process is supposed to eliminate. I'd describe the value of it to myself like this:

> the codex audit usually finds stuff that claude misses.

The fix was obvious and I resisted it for exactly as long as it took to admit that I was the bottleneck. Take myself out of the loop. The audit had to fire on its own, after every task, with no discretion left to me.

> when to run the barrage should not be a matter of policy and the agent should have no discretion. It must be mechanized with teeth.

That's the audit barrage. After a unit of work, several independent model CLIs — Claude, Codex, Gemini — get fired at the diff in parallel, automatically, each one a different mind with a different blind spot. The selective pressure I'd been applying by hand became a thing that just *happens*, every generation, whether I remember it or have the energy for it or not.

One design choice under it is doing more work than it looks like. I run the *command-line tools*, not the model APIs:

> we won't be using model apis — we'll be using claude, codex, and gemini clis, since they are usage based, not token based.

That sounds like a billing detail. It's actually the load-bearing decision. Because the CLIs are flat-rate, a barrage against a five-thousand-line diff costs me exactly what a barrage against a one-line diff costs: nothing at the margin. And *that* is the only reason I can afford to fire it after every task instead of saving it for special occasions. Unconditional selective pressure is only possible if each round is free. The economics are what let the biology run.

There's a second dividend I didn't fully see until it was running. With several models firing at once, agreement becomes a free signal. When one model flags an issue, it might be noise. When three of them independently flag the same thing, it's almost certainly real. The panel doesn't just find more bugs — it tells you which bugs to believe.

## The first thing it audited was itself

The barrage's first real run was against its own code.

I pointed the newly-built tool at the feature that *was* the newly-built tool, mostly as a smoke test. It came back with thirteen findings. Four of them were flagged independently by more than one model — the high-confidence kind. Every one of them was real. And here is the part that rearranged how I think about testing: all thirteen would have shipped. The test suite was green — nineteen hundred and sixty-six tests passing — the type-checker was clean, and a live end-to-end round trip had come back fine. None of that caught what the barrage caught. The findings were *novel*: things no test, no compiler, no self-check had seen.

Two of the four cross-model findings still make me wince. One was a silent truncation on the single most load-bearing path in the tool — output quietly dropped on the floor, found by one model reasoning about event ordering and confirmed by another reasoning about a stream race. The other was a prompt renderer that had been written, exported, and then never actually wired in; the feature's own headline capability was half-connected, and the green tests were perfectly happy about it.

It even surfaced a bug *before any model fired* — the harness caught a problem in its own setup on the way to running the audit. And later, in a different round, it told me that one of my own fixes didn't actually fix the thing it claimed to. I'd written the commit. I believed it. The barrage didn't.

This is the moment the abstract argument became concrete for me. A green test suite is evidence of *something*, but it is not evidence that the code is correct. It is evidence that the code does what the person who wrote the tests *thought to check* — which is a much smaller claim, and which fails in exactly the same shape as the code, because the same mind wrote both.

## An auditor never shuts up

Wiring an auditor into every task immediately created two new problems, and watching them appear taught me more than the tool working did.

The first is that an always-on auditor never stops talking. Run the loop — audit, fix, re-audit — and the early rounds catch real bugs, the middle rounds start critiquing the *fixes*, and the late rounds devolve into nitpicks about the audit process itself. It never naturally converges to silence, because you can always find something to complain about if complaining is your job. Left unchecked, the loop would litigate the same code forever.

So the barrage needed a brake — a rule for when "good enough" is actually good enough:

> an auditor agent will always find something to complain about. I'm happy with two consecutive audits with 0 HIGH findings — we can keep the nitpicks in a slush pile.

That's the dampener. Two clean rounds in a row and the loop stops; the leftover low-severity gripes get swept into a slush pile and acknowledged rather than chased. There's one rule that makes the dampener safe to trust, and it's non-negotiable: the serious findings — the HIGHs — are *never* slushed. A real bug always resets the clock. The brake only applies to the noise.

The second problem is that the tools are flaky. The CLIs time out, hit quota walls, occasionally just fail. Gemini in particular has been failing the overwhelming majority of its runs lately — some days the "panel of three" is really a panel of two. For a while that felt like the thing was broken. Then I reframed it, and the reframe is pure population thinking:

> the audit barrage is stochastic — it doesn't have to be perfect every time. As long as at least 1 audit is successfully executed, that should count. Auditing as a practice should statistically yield better code.

You don't need every round to be perfect. You need pressure applied often enough, by enough different minds, that defects don't survive. That is the literal definition of stochastic correctness, and it's also just how selection works in the wild — noisily, imperfectly, and well enough.

The reframe also tells you what these findings *are*. Not exceptions. Not a QA gate to argue with:

> Audit findings are failures of the previous implementation that shouldn't be treated like exceptions — they are guardrails to point the implementation team back to the happy path.

The whole reason I'd take myself out of the loop is that I want to point an orchestrator at a workplan, walk away, and come back to work that is implemented, tested, *and* audited — without my attention being the thing the quality depends on. The barrage is what makes the walking-away safe.

There's a real-world receipt for this that I think about whenever I'm tempted to trust a green checkmark. In a different part of the system, a change quietly turned a security flag into a no-op — a studio that was supposed to stay off the network became reachable on it, with nothing but a log line as warning. Every test passed. A barrage run *after the merge* caught it and named it for what it was: a security-relevant inversion of behavior, not a cosmetic rename. The tests couldn't catch it because nobody had thought to write the test for the thing nobody intended to do. A different mind, looking with fresh eyes, did.

## Pointing it at the blueprint

Here is where the story stops being history and becomes this week.

If the barrage is good at catching defects in code, the natural question is whether it can catch them earlier — in the *specification*, before any code exists. A bug in a spec is the most expensive kind, because everything downstream is built faithfully on top of it. So I started firing the barrage at specs at definition time. The motivation was a single manual run against one spec that surfaced fifty-one findings, three of which were flat contradictions I had written into the document myself without noticing. The lesson generalized fast: spec quality cannot depend on a human remembering to run the audit.

And then it didn't behave the way I expected, and the misbehavior was instructive.

When you audit *code*, there's a crisp finish line: zero findings means done, and a clean diff is objectively clean. When you audit a *spec*, there is no such floor. A spec is prose — inherently, permanently incomplete — so a sufficiently aggressive panel of models can *always* find another under-specified edge. The barrage didn't converge. It plateaued. The findings stopped trending toward zero and started bouncing around. Worse, their *character* drifted: instead of catching contradictions and ambiguities, the auditors started demanding implementation detail — they began trying to make the spec *be the code*.

I could watch it happen in the numbers. On the first spec I ran this way, the count of serious findings went:

> 7 → 5 → 2 → 1 → 5 → 5 → 1

That bounce — one finding, then suddenly five again — is the plateau made visible. And when I dug into why, the cause was a single bad promise. The spec claimed an operation would be atomic across two files. No such atomic operation exists, so every prose attempt to describe one was correctly rejected by the panel, and the same impossibility kept resurfacing under new finding IDs. The audit had found a *generator* — a flaw that emits an endless stream of complaints, because patching the symptom can't resolve the root.

The fix was not to argue with it. The fix was to stop feeding it:

> The plateau was the generator; removing it (not feeding it) converged it.

I deleted the impossible mechanism from the spec and replaced it with a *promise* — that an interrupted operation never silently loses content, and that because everything is version-controlled, any inconsistency is recoverable. The how — the write protocol, the recovery — got deferred to tests, where mechanism belongs. The serious-finding count dropped from five to one in a single round. The discovery hardened into a lens: a spec auditor and a code auditor need different instructions, because they're looking for different kinds of flaw. *Look for what the spec promises and decides — not how it would be built.* That lens shipped to the tool two days ago.

What I find genuinely useful — and very devlog — is what we did about the fuzziness. Because there's no crisp stopping rule for spec audits, only heuristics, the response wasn't another clever mechanism. It was to start *writing the discoveries down*:

> We should be keeping a log of our discoveries.

So there's now an append-only log of how the barrage misbehaves on specs — the failure modes, the plateau signals, the playbook for breaking out. Which means the tool I'm describing in this devlog is, at this moment, keeping its own devlog of what it's still teaching us. The work and the writing-about-the-work turn out to be the same practice.

I won't pretend this part is settled. The spec I just described didn't graduate by converging cleanly; it graduated because I *decided* the remaining gripes were implementation detail and recorded an override. For a spec, that override — "good enough, the rest is for the tests" — may be the honest finish line, and "zero findings" may be a fantasy. I don't fully know yet. That's the current edge of it.

## It started auditing its own spec

The recursion is my favorite part, and it's also the cautionary one.

When I had the barrage govern the specification *for the barrage's own governance system*, it did what it was built to do: it found contradictions sitting inside its own blueprint. But it also went through a long, frustrating stretch where each fix specified machinery the actual code didn't have — the audit kept attacking a fiction, and the fixes kept elaborating the fiction instead of deleting it. Breaking that required going back to what the code *actually did* and aligning the spec to reality rather than to the prose's ambitions.

And the thing that finally made it converge wasn't clever. It was the dullest virtue in software: don't repeat yourself. The spec had restated the same rule in half a dozen places, and they'd drifted out of sync, and every drift was a finding. Collapsing them to a single canonical statement was the actual fix. The auditor built to catch contradictions kept finding them in its own description of itself — until the description stopped contradicting itself by saying things only once.

## Where this leaves me

So that's the tool, and where it actually stands.

The barrage is, by a wide margin, the most effective thing I've built in this whole project — which I say with the heavy qualifier that *most effective so far* is doing real work in that sentence. It is also still moving under me. The panel is flaky; one of its three models is failing most of its runs as I write this. I don't actually know whether the model families are diverse enough to escape the monoculture problem in the long run, or whether their shared training data makes them quietly correlated in ways I haven't caught yet. I don't know if "two clean rounds" is really enough, or just enough for now. The spec-governance half is days old and graduated its first real spec by my fiat, not by clean convergence. There is a logbook precisely *because* we don't have the answers.

But the shape of it I do trust, because it isn't mine. It's the oldest trick we have. You cannot make an unreliable generator reliable; nothing about the toddlers changed, and nothing will. What you can do is the thing we did to wolves and grass and enzymes: surround the generator with diversity, apply pressure relentlessly, and let correctness be the thing that survives. I didn't design the audit barrage. I bred it, by running a loop and keeping what lived.

The most honest thing I can tell you about it is the same thing the agents learned to tell each other on that dead SCSI protocol. If you miss something, the audit will catch it. If you break something, that's worse than doing nothing. And whatever I've gotten wrong in here — the next entry in the log will probably say so. That's not the system failing. That's the system working.
