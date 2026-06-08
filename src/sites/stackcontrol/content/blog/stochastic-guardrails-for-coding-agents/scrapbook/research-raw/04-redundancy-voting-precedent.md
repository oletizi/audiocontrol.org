# Research raw: redundancy / voting / dissimilar software as the opening precedent

Gathered 2026-06-07 via web search for a possible **opening** to the audit-barrage post. The
operator's framing of the desired opening: *how do you keep a system you KNOW will produce
bullshit results, with regularity, from burning everything to the ground?* The remembered hook:
"the Apollo program ran three independently-developed control systems simultaneously and took the
plurality answer."

**Bottom line up front:** that exact story (three *independently developed* software versions, run
together, majority vote) is a real and named idea — but it is **not** Apollo, and the precise
"three-version majority vote on independently written *software*" was largely an academic ideal
(**N-version programming**) that a famous 1986 experiment showed **doesn't actually work the way the
legend assumes.** The honest, corrected version is a *better* opening than the myth, because its
twist is the whole thesis of the post.

---

## What the operator is half-remembering (the real candidates)

Four distinct real things get blended into the legend. None is exactly "Apollo, three independent
software versions, plurality vote," but each contributes a piece:

### 1. Saturn V's LVDC — Triple Modular Redundancy (the "three + vote" part)
The IBM **Launch Vehicle Digital Computer** that guided the **Saturn V rocket** (not the
spacecraft) used **Triple Modular Redundancy (TMR)**: three identical logic paths, and a majority
**voter** passed on the result two of three agreed on, so any single module could fail and be
outvoted. ([Wikipedia: LVDC](https://en.wikipedia.org/wiki/Launch_Vehicle_Digital_Computer))

⚠️ But this is **identical hardware logic** voting to mask a *hardware* fault — NOT three
*independently developed* programs. It gives the "three run together, plurality wins" image, not the
"diverse implementations" idea.

### 2. The Apollo Guidance Computer — essentially single-string (the myth-buster)
The spacecraft each had **one** AGC (one in the Command Module, one in the Lunar Module). They did
**not** run triple-redundant voting software. The "Apollo ran redundant voting code" belief is a
known misconception — most likely a conflation with the Saturn V's LVDC above. ([Bob Yewchuk, "The
Apollo Code Redundancy Speculation"](https://bobyewchuk.wordpress.com/2017/07/20/apollo-code-redundancy/);
[Smithsonian NASM](https://airandspace.si.edu/stories/editorial/apollo-guidance-computer-and-first-silicon-chips))

So if the post says "Apollo ran three independent systems and voted," **it is wrong and a reader who
knows will bounce off it.** Don't open on that claim as stated.

### 3. The Apollo Lunar Module — PGNCS + AGS (real *dissimilar* redundancy, no vote)
The closest *Apollo* thing to the operator's instinct: the LM carried **two** guidance systems
designed by **different contractors**:
- **PGNCS** — the Primary Guidance, Navigation and Control System (MIT Instrumentation Lab; the AGC).
- **AGS** — the **Abort Guidance System**, "designed by **TRW independently** of the development of
  the AGC and PGNCS," a "**truly dissimilar** backup," even architecturally different (strapdown IMU
  vs PGNCS's gimballed one). ([Wikipedia: Apollo Abort Guidance System](https://en.wikipedia.org/wiki/Apollo_Abort_Guidance_System))
- **It earned its keep:** never needed for its actual job (landing abort), the AGS "played an
  important role in the safe return of **Apollo 13**" after the explosion, flying most of the return
  including mid-course corrections. ([Centauri Dreams](https://www.centauri-dreams.org/2019/07/18/lunar-landing-backup-apollos-abort-guidance-system/))

This is *two*-version dissimilar redundancy with a human deciding when to switch — not a three-way
automatic plurality vote. But it's a genuine "independently built second opinion saved the mission"
story, and it's *Apollo*, so it can rescue the operator's instinct if we want to keep the Apollo
hook honestly.

### 4. The Space Shuttle — PASS + BFS (the canonical "independent software backup")
The strongest real example of *independently developed software* guarding against a *software*
failure:
- **Four** primary computers ran **identical** software — **PASS** (Primary Avionics Software
  System, by **IBM**) — **voting** each cycle so failed *hardware* could be outvoted/dropped.
- A **fifth** computer ran **BFS** (Backup Flight System), "a different set of software, **programmed
  by a company different from the PASS developer**" (Rockwell), there specifically to take over "if a
  **generic error in the PASS software** ... should cause a loss of vehicle control."
  ([NASA KSC avionics ref](https://science.ksc.nasa.gov/shuttle/technology/sts-newsref/sts-av.html);
  [Smithsonian: Backup Flight Controller](https://airandspace.si.edu/collection-objects/computer-backup-flight-controller-shuttle/nasm_A20181403000))

⚠️ Nuance to keep honest: the four-way **vote** is for *hardware* fault masking (identical software);
the *software diversity* lives in the **single** independent backup (PASS vs BFS = **two** versions),
and the backup **stands by** for a human to engage — it does not participate in the plurality vote.
And famously, **the BFS was never once engaged to take control in 135 flights.**

---

## The named concept the operator actually wants: N-version programming

The "independently develop N versions from one spec and vote on the majority result" idea has a
name: **N-version programming (NVP)**, introduced **1977 by Liming Chen and Algirdas Avižienis**.
Central conjecture: "the **independence of programming efforts** will greatly reduce the probability
of identical software faults occurring in two or more versions." A generic voter takes the
consensus/majority of the versions' outputs. ([Wikipedia: N-version programming](https://en.wikipedia.org/wiki/N-version_programming))

**This is exactly the audit-barrage bet, one generation earlier:** independent implementations fail
in independent ways, so disagreement surfaces faults. The barrage's "genetic diversity in failure
modes" is NVP's "independence of programming efforts" restated.

### The twist that IS the article's thesis — Knight & Leveson (1986)
The foundational assumption was **empirically attacked and largely demolished**: John Knight and
Nancy Leveson, *"An Experimental Evaluation of the Assumption of Independence in Multiversion
Programming"* (IEEE TSE, 1986). **27 versions** of a program, written independently from one spec at
two universities, subjected to **~1,000,000 tests**. Result: the versions were individually very
reliable, but they **failed together far more often than independence would predict** — "programs
that are written independently do **not** always fail independently." The first major evidence that
design diversity buys less than you hope, because humans make **correlated** mistakes (the hard
cases are hard for everyone). ([Knight & Leveson, full paper PDF](http://sunnyday.mit.edu/papers/nver-tse.pdf);
[summary, John Regehr](https://blog.regehr.org/archives/303))

**Why this is gold for the opening.** The clean version of the legend ("just run three and vote, and
you're safe") was shown 40 years ago to be *too good to be true* — independent authors share blind
spots. That is precisely the problem the audit barrage re-opens for the LLM era, and it sets up the
post's genuinely open question:

> Human N-version programming failed to deliver independence because humans trip on the same hard
> cases. The barrage's wager is that **different model families, trained on different corpora, fail
> differently enough** to recover the independence humans couldn't. (Honest caveat the post can own:
> LLMs also share a lot of training data, so correlation is a real risk — which is exactly why the
> barrage treats *cross-model agreement* as the high-confidence signal and never trusts one model
> alone.)

---

## Bonus on-theme irony (optional color, all true)

The redundancy machinery has its own failure stories that rhyme with the post:
- **STS-1 (first shuttle flight) was scrubbed by the backup system itself.** On 1981-04-10 the BFS
  "did **not synchronize**" with the primary computers; root cause was a "seemingly innocuous change
  ... about a **year earlier** in a totally **unrelated** part of the software" that opened a ~1-in-67
  timing window. Two-day delay; flew clean on 04-12. ([Garman, "STS-1 Failure to Sync"](https://klabs.org/mapld06/abstracts/105_garman_a.html);
  [NASA STS-1 scrub](https://www.nasa.gov/history/40-years-ago-the-countdown-begins-for-sts-1-first-launch-attempt-scrubbed/))
  → The thing built to catch the catastrophic bug was itself tripped by a benign, distant change.
  Rhymes with the barrage's own "fiction cascade" and the cost of always-on guardrails.

---

## How to use it for the opening (recommended framing)

The operator wants to **open on the problem**: *you have a system you KNOW lies with regularity —
how do you keep it from burning everything down?* The precedent gives a clean three-beat cold open:

1. **The problem, stated as old, not new.** Aerospace has always shipped systems it knew could be
   wrong — a single computer, a single program, is a single point of failure with a known nonzero
   bug rate. You don't make it perfect; you assume it's wrong and engineer around the wrongness.
2. **The classic answer: don't trust one of anything.** Run more than one, built differently, and
   let them check each other — Saturn V's three-way voter; the LM's independent TRW abort computer
   that helped bring Apollo 13 home; the Shuttle's fifth computer running a rival company's code in
   case the primary software had a fatal flaw the tests never caught.
3. **The catch that makes it interesting (the pivot into the piece).** The dream — *just run N
   independent versions and vote* — was named (N-version programming, 1977) and then **shown not to
   hold**: independently written programs still fail together (Knight & Leveson, 1986), because
   people share blind spots. → *Which is the exact problem you have with an AI coding agent: it's a
   mind with blind spots, and the obvious fix — ask another one — only works if the other one
   doesn't share the same blind spots.* That tees up "genetic diversity in failure modes" and the
   whole barrage.

**Accuracy guardrails for whoever drafts this:**
- Do **not** write "Apollo ran three independent flight programs and voted." It didn't. If you want
  the word *Apollo*, use the **LM's PGNCS + AGS dissimilar backup** (and the Apollo 13 save), which
  is true. For the literal "three + majority vote," use **Saturn V's TMR** (hardware) or **name
  N-version programming** as the concept.
- The Shuttle's four-way vote = **hardware** fault masking on **identical** software; the
  **independent** software is the single **BFS** backup. Keep those two ideas distinct.
- The Knight-Leveson result is load-bearing and counterintuitive — cite it; don't soften it into
  "diversity helps." Its point is that diversity helps *less than assumed* because failures
  correlate. That caveat is what keeps the barrage's claim honest rather than triumphalist.

---

## Sources
- Saturn V LVDC / TMR: https://en.wikipedia.org/wiki/Launch_Vehicle_Digital_Computer
- AGC single-string / redundancy myth: https://bobyewchuk.wordpress.com/2017/07/20/apollo-code-redundancy/ ; https://airandspace.si.edu/stories/editorial/apollo-guidance-computer-and-first-silicon-chips
- Apollo Abort Guidance System (TRW, dissimilar, Apollo 13): https://en.wikipedia.org/wiki/Apollo_Abort_Guidance_System ; https://www.centauri-dreams.org/2019/07/18/lunar-landing-backup-apollos-abort-guidance-system/
- Shuttle PASS/BFS: https://science.ksc.nasa.gov/shuttle/technology/sts-newsref/sts-av.html ; https://airandspace.si.edu/collection-objects/computer-backup-flight-controller-shuttle/nasm_A20181403000 ; https://www.hq.nasa.gov/office/pao/History/computers/Ch4-3.html
- N-version programming (Chen & Avižienis 1977): https://en.wikipedia.org/wiki/N-version_programming
- Knight & Leveson 1986 (independence assumption): http://sunnyday.mit.edu/papers/nver-tse.pdf ; https://blog.regehr.org/archives/303
- STS-1 sync scrub: https://klabs.org/mapld06/abstracts/105_garman_a.html ; https://www.nasa.gov/history/40-years-ago-the-countdown-begins-for-sts-1-first-launch-attempt-scrubbed/
