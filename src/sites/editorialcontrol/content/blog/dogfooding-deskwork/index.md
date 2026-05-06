---
deskwork:
  id: c9e53780-cf12-4623-a624-bc284d5c5afd
title: Dogfooding deskwork
description: "Dogfooding the deskwork plugin from inside its own development. Recursive layers: (1) deskwork-plugin runs editorial-pipeline patterns on itself (DEVELOPMENT-NOTES.md journal, /feature-ship, calendar-style phases, sub-agent dispatch); (2) the plugin tests itself against a vendored .audiocontrol.org sandbox; (3) Phase 20 plans a true deskwork content sandbox where the plugin manages content about itself; (4) the audiocontrol.org-editorial-calendar (where this entry lives) is being eaten by its own offspring — the plugin extracted from this repo is now displacing the in-house pipeline here. Headline thesis is the project's own agent-discipline rule: Use the deskwork plugin only through the publicly-advertised distribution channel — operator quote: \"No fair using it in ways that other, non-privileged users can't.\" If the public path is broken, the only valid response is to fix the public path; pushing is the final mile of fixed. Sibling rule: Packaging is UX — never paper over install bugs. The agent-discipline rule itself is dogfood output — forged by repeated correction during dogfooding sessions (see deskwork issue 49: bundled marketplace path was fine; workspace-linked dev path crashed; the fix was to fix the public path, not work around it). Title candidates (pick at /deskwork:plan time): 1) \"No fair: dogfooding deskwork without privileged shortcuts\" (operator quote leads); 2) \"Packaging is UX: notes from the public path\"; 3) \"The friction is the data\"; 4) \"Pushing is the final mile of fixed\"; 5) \"How not to dogfood your own tool\" (contrarian); 6) \"The dogfood discipline: what gets surfaced when you use the public path\". Default site: editorialcontrol (magazine voice, AI-agents-craft register)."
date: April 2026
datePublished: "2026-04-28"
dateModified: "2026-04-28"
author: Orion Letizi
---

# Dogfooding deskwork

## Outline

<!--
Working title finalists (operator picks at /deskwork:draft time — current calendar title is the placeholder "Dogfooding deskwork"):

  1. Dogfooding Only Works If You Use the Public Path. Privileged Shortcuts Destroy the Signal You're Trying to Generate.
  2. The Cliché Says "Use Your Own Tool." The Discipline Says "Use It the Way a Stranger Would."
  3. Pushing Is the Final Mile of "Fixed." Local Edits Don't Count Until They're Public.
  4. No Fair: Dogfooding Without Privileged Shortcuts.   ← shortest; operator quote leads
  5. Your Dogfood Is Lying to You.   ← contrarian; one-sentence

Recommended: #1 (matches the publication's two-sentence-claim title pattern; second sentence sharpens the first; specific provocation).
-->

**Dek draft:**

> "Use your own tool" is the cliché version of dogfooding. The discipline version is harder: use it the way an adopter without privileged access would, and when the public path is broken, fix the public path before you take a single shortcut. The friction is the data; the shortcut destroys it.

**In this dispatch (proposed ToC):**

1. **01 The cliché everyone agrees on.** Concede the consensus. "Use your own tool" is table stakes. Not controversial.
2. **02 Two failure modes.** The privileged-path dogfood (works locally, breaks on adoption). The "we'll fix it later" dogfood (file the issue, take the shortcut, ship the next release). Both share the same structural problem: working around the friction destroys the signal it was supposed to generate.
3. **03 The third option: pushing is the final mile of "fixed."** Treat the public path as the only path. If it's broken, edit + commit + push + release, then re-attempt. Local edits aren't fixes until they're public. Working around hides the friction the dogfood is meant to expose.
4. **04 Worked example: the agent-discipline.md file is itself dogfood output.** Five releases in one session (v0.7.0 → v0.8.1). deskwork#49 as the canonical case: bundled marketplace path was fine, workspace-linked dev path crashed, fix was to fix the public path. Quote the operator's three rules verbatim.
5. **05 If you're still reading, here's the short version.** Numbered list compressing the discipline.
6. **06 Where this is going.** The meta move — this dispatch was made through deskwork end-to-end, including a fresh public-path bug surfaced *during the outlining session* (missing `author` config in `.deskwork/config.json`; the install skill didn't ask). The discipline is recursive: every dogfooding session updates the discipline.

### Section beats and receipts

**§ 01 — The cliché everyone agrees on.**
- Concede that "eat your own dogfood" is operator orthodoxy. No one in this audience needs convincing on the headline claim.
- Pivot: most "dogfooding" practiced inside the team that built the tool isn't dogfooding at all. It's privileged-path testing dressed in dogfooding vocabulary.
- Structural signal at the end of the section: *"Two failure modes."*

**§ 02 — Two failure modes.**

- **Bolded lead-in: The privileged-path dogfood.** Agent (or developer) runs the tool from the local source tree. Hand-rolls config files the install was supposed to write. Copies missing assets into the cache so the demo works. Reaches into workspace symlinks "just to keep moving." The team feels productive — they "tested" everything. Adopters hit the broken install on day one. The signal the dogfood was supposed to generate — *what does this look like to someone without privileged access?* — never reaches the team.
- **Bolded lead-in: The "we'll fix it later" dogfood.** Agent finds friction on the public path, files an issue, takes the shortcut to keep moving. The friction the dogfood was supposed to surface gets deferred into the issue tracker, then forgotten under release pressure. Operator ends up reading dispatch reports and finding *"flagged but not fixed"* notes weeks after the bug shipped to adopters. (Receipt: deskwork#49 — agent flagged the dev-source boot bug as "out of scope" during Phase 22 implementation; nobody filed it; editorialcontrol team hit it in production-adjacent use the next session.)
- **Collapse-into-structural-diagnosis paragraph.** Both failure modes share one shape: working around the friction destroys the data. The dogfood exists to *generate* the friction signal. A workaround is the agent (or operator) choosing a slightly more comfortable now in exchange for pushing the cost onto every future adopter. The pattern looks productive in the moment and destroys the only signal the work was supposed to produce.
- **Pivot line:** *"There's a third option, but it requires giving up the comfort of the shortcut."*

**§ 03 — The third option: pushing is the final mile of "fixed."**

- State the rule plainly. Quote it from `agent-discipline.md` (operator-authored, project-tracked, durable across worktrees):

  > "Use the deskwork plugin only through the publicly-advertised distribution channel. No privileged shortcuts." — *agent-discipline.md*

- The enforcement clause is the radical part:

  > "If the public path doesn't work properly — install fails, the documented commands produce errors, the docs are unclear or contradictory, the artifact is broken at runtime — the only valid response is to FIX the public path. Pushing is the final mile of 'fixed' — local edits aren't the fix until they are public."

- Sibling rule (also in `agent-discipline.md`): *"Packaging is UX — never paper over install bugs."* Working around an install bug produces an evaluation of a surface no operator actually sees.
- Why this works: friction on the public path is the *only* data the dogfood is trying to generate. The discipline forces every shortcut to convert into either (a) a fix that ships, or (b) an explicit acknowledgment that the dogfood is paused until the fix ships.
- Cost honesty: this slows the dogfooder down. That's the point. The cost is paid once, by the team that built the tool. The alternative pays the cost forever, by every adopter.

**§ 04 — Worked example: the rule is itself dogfood output.**

- Receipts. Five releases in one session: v0.7.0 → v0.7.1 → v0.7.2 → v0.8.0 → v0.8.1. 30 commits. +88 tests. Five PRs. *Source:* `DEVELOPMENT-NOTES.md` in the deskwork-plugin repo.
- The canonical case study — deskwork#49:
  - Symptom: studio fails to launch through the dev wrapper. Stack trace from `tsx` + Node 22 ESM about `outline-split.ts` named exports not resolving.
  - The "easy" workaround: tell adopters to run `node /path/to/bundle/server.mjs` directly. Documented privately. Move on.
  - What the discipline required instead: promote `outline-split.ts` to a proper `@deskwork/core` export, collocate the misplaced server-only catalog under `packages/studio/src/lib/`, delete the stale bundle output, ship v0.8.1. The bundled marketplace path was fine all along; the dev source had to match.
  - Result: the next adopter session (this one, in the audiocontrol.org editorial calendar) installed v0.8.1 cleanly. The studio is running on port 47322 right now while this outline gets written.
- The recursive layer the worked example exposes: `agent-discipline.md` itself was forged by operator correction during dogfooding. Quote the three load-bearing operator lines:
  - *"No fair using it in ways that other, non-privileged users can't."*
  - *"Packaging IS UX."*
  - *"I'm the only one who should determine whether something is in or out of scope."* (the rule that closes the "out of scope but worth flagging" loophole)
- Each rule is the residue of a specific friction the dogfood surfaced. The agent took (or proposed) a shortcut; the operator named the rule; the rule shipped to the project's `.claude/rules/` tree and now applies forever. The discipline is itself an artifact the dogfood produced.

**§ 05 — If you're still reading, here's the short version.**

Numbered list, bolded imperatives, 1–3 sentences of specifics under each:

1. **Use the public path or you're not dogfooding.** Privileged shortcuts feel productive and destroy the only signal the work was supposed to produce. *No fair using it in ways that other, non-privileged users can't.*
2. **Treat install friction as ground truth.** Packaging is UX. Every install-level defect (404'd assets, missing bundles, broken bootloop, dead UI) goes at the top of the bug list, not the bottom. Working around it lies to your team about what adopters experience.
3. **Fix forward; pushing is the final mile of "fixed."** Edit, commit, push, release, then re-attempt the dogfood. Local edits aren't fixes until they're public. The only legitimate work outside the public path is the work of fixing the public path itself.
4. **Encode the discipline as project rules.** Auto-memory is keyed to a working directory and doesn't survive a worktree switch or a fresh clone. Operator-authored rules in `.claude/rules/` (or whatever your project's equivalent is) are durable. The agent's discipline is the operator's discipline, written down.
5. **Sub-agent "out of scope" notes are not dispositions.** When a dispatched agent flags something as out-of-scope-but-worth-flagging, that is *not* a valid resting place. Either fix it now or file an issue immediately. The pattern of reading the flag and moving on bites twice and is only caught the third time, in production.

**§ 06 — Where this is going.**

- The meta move (this is the publication's signature; use it because it's genuinely true): this dispatch was made through deskwork end-to-end. `/deskwork:add` captured the idea. `/deskwork:plan` locked the keywords. `/deskwork:outline` scaffolded the markdown file you're reading. The first scaffold attempt failed — no `author` configured in `.deskwork/config.json`. The discipline said: that's a public-path issue. Filed as [deskwork#53](https://github.com/audiocontrol-org/deskwork/issues/53). The dogfooding session generated the receipt that the dispatch about dogfooding now cites.
- The recursion: the post about the discipline is itself a data point for the discipline. The friction surfaced during *this* outlining session is one more entry in the agent-discipline.md ledger of operator corrections.
- Honest about what's unresolved: the discipline is exhausting in the moment and the gravity of the shortcut is constant. The only durable defense is making the rule visible and re-readable every time the agent is about to take a shortcut.
- Closing line (single compressed sentence — voice signature): *"The friction was the data; the data was the discipline; the discipline was the only thing that made the dogfood worth eating."*

**Voice / structure notes for the draft pass:**

- Title is a two-sentence claim per the dispatch pattern.
- Repeat the H1 above the body after the ToC (magazine convention).
- Em-dashes for clause work, not semicolons.
- File paths and command names in inline code: `agent-discipline.md`, `.claude/rules/`, `/deskwork:install`, `deskwork#49`.
- One bolded-lead-in cluster per failure-mode section.
- "Concrete numbers:" announces receipts where appropriate (the v0.7.0→v0.8.1 release count, the +88 tests, the five PRs).
- No SaaS verbs (unlock, leverage, transform). No "today's fast-paced landscape." No fake authority.
- The dispatch is argumentative, not how-to. Don't slip into tutorial framing.
- Newsletter / mailto CTA — `mailto:orion@audiocontrol.org` — only at the end if the "where this is going" section calls for it.

**Cross-link candidates (for the draft):**

- `claude-is-kirk-codex-is-spock` (sibling dispatch in Planned) — both are about agent behavior at the interaction layer; the discipline rule about sub-agent "out of scope" notes connects directly.
- `evolution-by-artificial-selection-for-prompt-generation` (sibling dispatch in Drafting) — both make the meta move; the friction-as-signal framing is adjacent to the selection-pressure framing.
- `socratic-coding-agents` (recently published) — the operator's own thesis about acting on facts the agent invented; quoted directly in the agent-discipline.md "Read documentation before quoting commands" rule.

**Open questions for operator review:**

- Title preference (1–5 above)?
- Should the post name `deskwork` by name, or genericize as "the plugin we built and now use"? The signature meta move probably needs the name; current draft assumes named.
- Is it appropriate to publish operator quotes verbatim from `agent-discipline.md`, or should they be paraphrased?
- Audience scope: this post leans heavily on Claude Code-specific vocabulary (skills, sub-agents, marketplace, plugins). Is that audience tight enough, or should there be a softer on-ramp for adjacent agent ecosystems (Codex, Cursor, Amp)?

---

<!-- Body draft goes here after operator review of the outline. Advance with /deskwork:draft to flip Outlining → Drafting; the agent writes the body in the same file. -->
