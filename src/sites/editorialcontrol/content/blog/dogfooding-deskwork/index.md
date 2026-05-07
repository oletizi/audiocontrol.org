---
deskwork:
  id: c9e53780-cf12-4623-a624-bc284d5c5afd
title: "Dogfooding Only Works If You Use the Public Path. Privileged Shortcuts Destroy the Signal."
description: "Eat-your-own-dogfood is operator orthodoxy. Most teams who say they do it don't. The privileged-path dogfood feels productive, hides every public-path bug, and lies to the team about what adopters experience. The discipline is harder: use the tool the way an adopter without privileged access would, and when the public path is broken, fix it before you take a single shortcut. Pushing is the final mile of fixed."
date: "April 2026"
datePublished: "2026-04-28"
dateModified: "2026-04-28"
author: "Orion Letizi"
---

# Dogfooding Only Works If You Use the Public Path. Privileged Shortcuts Destroy the Signal.

> **Stage:** Outlining — this document IS the outline. On `/deskwork:approve`, v0.17.1 snapshots the outline to `scrapbook/outline.md` and `index.md` becomes the draft body. (Single-document Option B per deskwork#222.)

## Working title — picked

**Dogfooding Only Works If You Use the Public Path. Privileged Shortcuts Destroy the Signal.**

Two-sentence claim per the publication's title pattern. Specific provocation. Avoids the cliché ("eat your dogfood") in favor of the precise failure mode.

Alts kept for record:

1. *The Cliché Says "Use Your Own Tool." The Discipline Says "Use It the Way a Stranger Would."*
2. *Pushing Is the Final Mile of "Fixed." Local Edits Don't Count Until They're Public.*
3. *No Fair: Dogfooding Without Privileged Shortcuts.* (shortest; operator quote leads)
4. *Your Dogfood Is Lying to You.* (contrarian; one-sentence)

## Dek

> "Use your own tool" is the cliché version of dogfooding. The discipline version is harder: use it the way an adopter without privileged access would, and when the public path is broken, fix the public path before you take a single shortcut. The friction is the data; the shortcut destroys it.

## In this dispatch

A six-section argumentative dispatch. Magazine dividers between. Sentence-case headers. Thesis → two failure modes → third option → worked example → short version → meta move.

§ 01 — The cliché everyone agrees on
§ 02 — Two failure modes
§ 03 — The third option: pushing is the final mile of "fixed"
§ 04 — The rule is itself dogfood output
§ 05 — If you're still reading, here's the short version
§ 06 — Where this is going

---

## § 01 — The cliché everyone agrees on

Concede the consensus upfront. *"Eat your own dogfood"* is operator orthodoxy. No one in the audience needs convincing on the headline claim — every team that ships a tool says they use it. Don't argue against the slogan; argue that the slogan misnames the practice.

Pivot: most "dogfooding" practiced inside the team that built the tool isn't dogfooding at all. It's privileged-path testing dressed in dogfooding vocabulary. The team and adopters meet the same tool through completely different surfaces. The team sees it work. The adopter sees it broken.

Structural signal at the close — *"Two failure modes."* Sets up § 02.

## § 02 — Two failure modes

Bolded lead-in cluster. Two paragraphs, structurally parallel.

**The privileged-path dogfood.** Agent (or developer) runs the tool from the local source tree. Hand-rolls config files the install was supposed to write. Copies missing assets into the cache so the demo works. Reaches into workspace symlinks "just to keep moving." The team feels productive — they "tested" everything. Adopters hit the broken install on day one. The signal the dogfood was supposed to generate — *what does this look like to someone without privileged access?* — never reaches the team.

**The "we'll fix it later" dogfood.** Agent finds friction on the public path, files an issue, takes the shortcut to keep moving. The friction the dogfood was supposed to surface gets deferred into the issue tracker, then forgotten under release pressure. Operator ends up reading dispatch reports and finding *"flagged but not fixed"* notes weeks after the bug shipped to adopters. *(Receipt: deskwork#49 — agent flagged the dev-source boot bug as "out of scope" during Phase 22 implementation; nobody filed it; the editorialcontrol team hit it in production-adjacent use the next session.)*

Collapse-into-structural-diagnosis paragraph. Both failure modes share one shape: working around the friction destroys the data. The dogfood exists to *generate* the friction signal. A workaround is the team choosing a slightly more comfortable now in exchange for pushing the cost onto every future adopter. The pattern looks productive in the moment and destroys the only signal the work was supposed to produce.

Pivot line: *"There's a third option, but it requires giving up the comfort of the shortcut."*

## § 03 — The third option: pushing is the final mile of "fixed"

State the rule plainly. Quote it from `agent-discipline.md` (operator-authored, project-tracked, durable across worktrees):

> *"Use the deskwork plugin only through the publicly-advertised distribution channel. No privileged shortcuts."*
> — `.claude/rules/agent-discipline.md`

The enforcement clause is the radical part — same file:

> *"If the public path doesn't work properly — install fails, the documented commands produce errors, the docs are unclear or contradictory, the artifact is broken at runtime — the only valid response is to FIX the public path. Pushing is the final mile of 'fixed' — local edits aren't the fix until they are public."*

Sibling rule from the same file: *"Packaging is UX — never paper over install bugs."* Working around an install bug produces an evaluation of a surface no operator actually sees.

Why the discipline works. Friction on the public path is the *only* data the dogfood is trying to generate. The discipline forces every shortcut to convert into either (a) a fix that ships, or (b) an explicit acknowledgment that the dogfood is paused until the fix ships. There is no third resting place where the friction is "noticed and deferred."

Cost honesty. This slows the dogfooder down. That's the point. The cost is paid once, by the team that built the tool. The alternative pays the cost forever, by every adopter.

## § 04 — The rule is itself dogfood output

Concrete numbers: five releases in one session — v0.7.0 → v0.7.1 → v0.7.2 → v0.8.0 → v0.8.1. 30 commits. +88 tests. Five PRs. *Source:* `DEVELOPMENT-NOTES.md` in the deskwork-plugin repo. Three of those releases existed solely to fix public-path bugs the dogfooding session surfaced.

The canonical case study — deskwork#49.

- **Symptom.** Studio fails to launch through the dev wrapper. Stack trace from `tsx` + Node 22 ESM about `outline-split.ts` named exports not resolving.
- **The "easy" workaround.** Tell adopters to run `node /path/to/bundle/server.mjs` directly. Document privately. Move on.
- **What the discipline required instead.** Promote `outline-split.ts` to a proper `@deskwork/core` export. Collocate the misplaced server-only catalog under `packages/studio/src/lib/`. Delete the stale bundle output. Ship v0.8.1. The bundled marketplace path was fine all along; the dev source had to match.
- **Result.** The next adopter session — this one, in the audiocontrol.org editorial calendar — installed v0.8.1 cleanly. The studio is running on port 47321 right now while this outline gets written.

The recursive layer. `agent-discipline.md` itself was forged by operator correction during dogfooding. Three load-bearing operator lines, verbatim:

- *"No fair using it in ways that other, non-privileged users can't."*
- *"Packaging IS UX."*
- *"I'm the only one who should determine whether something is in or out of scope."* — closes the *"out of scope but worth flagging"* loophole.

Each rule is the residue of a specific friction the dogfood surfaced. The agent took (or proposed) a shortcut; the operator named the rule; the rule shipped to the project's `.claude/rules/` tree and now applies forever. The discipline is itself an artifact the dogfood produced.

## § 05 — If you're still reading, here's the short version

Numbered list, bolded imperatives, 1–3 sentences of specifics under each.

1. **Use the public path or you're not dogfooding.** Privileged shortcuts feel productive and destroy the only signal the work was supposed to produce. *No fair using it in ways that other, non-privileged users can't.*
2. **Treat install friction as ground truth.** Packaging is UX. Every install-level defect (404'd assets, missing bundles, broken bootloop, dead UI) goes at the top of the bug list, not the bottom. Working around it lies to your team about what adopters experience.
3. **Fix forward; pushing is the final mile of "fixed."** Edit, commit, push, release, then re-attempt the dogfood. Local edits aren't fixes until they're public. The only legitimate work outside the public path is the work of fixing the public path itself.
4. **Encode the discipline as project rules.** Auto-memory is keyed to a working directory and doesn't survive a worktree switch or a fresh clone. Operator-authored rules in `.claude/rules/` (or whatever your project's equivalent is) are durable. The agent's discipline is the operator's discipline, written down.
5. **Sub-agent "out of scope" notes are not dispositions.** When a dispatched agent flags something as out-of-scope-but-worth-flagging, that is *not* a valid resting place. Either fix it now or file an issue immediately. The pattern of reading the flag and moving on bites twice and is only caught the third time, in production.

## § 06 — Where this is going

The meta move (this is the publication's signature; use it because it is genuinely true). This dispatch was made through deskwork end-to-end. `/deskwork:add` captured the idea. `/deskwork:plan` locked the keywords. `/deskwork:outline` scaffolded the markdown file you're reading. The first scaffold attempt failed — no `author` configured in `.deskwork/config.json`. The discipline said: that's a public-path issue. Filed as deskwork#53. The dogfooding session generated the receipt that the dispatch about dogfooding now cites.

The recursion. The post about the discipline is itself a data point for the discipline. The friction surfaced during *this* outlining session is one more entry in the agent-discipline.md ledger of operator corrections.

Honest about what's unresolved. The discipline is exhausting in the moment and the gravity of the shortcut is constant. The only durable defense is making the rule visible and re-readable every time the agent is about to take a shortcut.

Closing line — single compressed sentence; voice signature:

> *The friction was the data; the data was the discipline; the discipline was the only thing that made the dogfood worth eating.*

---

## Voice / structure notes for the draft pass

- Two-sentence claim title per the dispatch pattern.
- Repeat the H1 above the body after the ToC (magazine convention; the site's render handles the strip-first-h1 rule, so the source can read clean).
- Em-dashes for clause work, not semicolons.
- File paths and command names in inline code: `agent-discipline.md`, `.claude/rules/`, `/deskwork:install`, `deskwork#49`.
- One bolded-lead-in cluster per failure-mode section. Don't repeat the pattern outside § 02.
- *"Concrete numbers:"* announces receipts where appropriate — the v0.7.0 → v0.8.1 release count, the +88 tests, the five PRs.
- No SaaS verbs (unlock, leverage, transform). No "today's fast-paced landscape." No fake authority.
- The dispatch is argumentative, not how-to. Don't slip into tutorial framing.
- No CTA beyond the editor link, and only at the end if the *"where this is going"* section calls for it. `mailto:orion@audiocontrol.org` is the form factor.

## Cross-link candidates (for the draft)

- `claude-is-kirk-codex-is-spock` (sibling dispatch in Planned). Both are about agent behavior at the interaction layer. The discipline rule about sub-agent "out of scope" notes connects directly.
- `evolution-by-artificial-selection-for-prompt-generation` (sibling dispatch in Drafting). Both make the meta move; the friction-as-signal framing is adjacent to the selection-pressure framing.
- `socratic-prompt-engineering` (recently published). The operator's own thesis about acting on facts the agent invented; quoted directly in the agent-discipline.md *"Read documentation before quoting commands"* rule.

## Open questions for operator review

1. **Title — confirm the picked finalist.** *"Dogfooding Only Works If You Use the Public Path. Privileged Shortcuts Destroy the Signal."* feels right (two-sentence claim, specific provocation, no slogan-bait). If you want one of the alts, name it before approve.
2. **Should the post name `deskwork` by name, or genericize as "the plugin we built and now use"?** The signature meta move probably needs the name; current outline assumes named.
3. **Operator-quotes verbatim from `agent-discipline.md`** — the three load-bearing lines in § 04 are quoted directly. Confirm OK to publish those verbatim, or paraphrase.
4. **Audience scope.** The outline leans heavily on Claude Code-specific vocabulary (skills, sub-agents, marketplace, plugins). Is that audience tight enough, or should there be a softer on-ramp for adjacent agent ecosystems (Codex, Cursor, Amp)?
5. **deskwork#53 receipt.** § 06 cites it as the public-path bug surfaced during this session. If a different issue number is canonical for that bug, swap before draft.


---
Note: This note is just here to test save functionality. It's not part of the article.
