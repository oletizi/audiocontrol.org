# Editorial Calendar

## Ideas

| UUID | Slug | Title | Description | Keywords | Source |
|------|------|------|------|------|------|
| a3aabacb-c692-444b-8a40-8e6297798098 | analytics-automation-feature | Analytics Automation Feature | How the automated-analytics feature turns Umami / GA4 / Search Console into actionable recommendations — the scorecard, striking-distance queries, CTR opportunities, and the feedback loop into the editorial calendar. |  | manual |
| fdb68375-45c8-42d5-ad91-64702126523b | video-demo-feature | Video Demo Feature | Making YouTube videos a first-class content type alongside blog posts — same lifecycle, same cross-link audit, same distribution tracking. How treating videos as editorial entries (not marketing afterthoughts) changes the content workflow. |  | manual |
| 23b76aaa-37f9-42c7-aa74-f06743d0f206 | lightweight-web-workflow-dashboards-with-action-queues-for-claude-code | Lightweight Web Workflow Dashboards with Action Queues for Claude Code | A pattern: instead of rigid hand-coded review UIs, build lightweight dev-only web dashboards that present an action queue Claude Code pushes work into and the user resolves. Queue is a JSONL file in git — no database. Claude Code is the backend — no rigid workflow engine. The workflow is a family of Claude skills. The audiocontrol.org /feature-image-* family is the live worked example (see the feature-image-automation-feature post). Pass messages back and forth via the queue: the dashboard surfaces complex questions Claude has, user responses save back. Works for feature images, works for any high-bandwidth review loop where the decision surface is too rich for a CLI yes/no. |  | manual |
| b61b7b79-828d-428d-beda-8e4a7d673502 | homegrown-workflow-skills-vs-the-popular-claude-plugins | Homegrown Workflow Skills vs. the Popular Claude Plugins | A side-by-side look at our homegrown session-lifecycle and feature-workflow skills — the /session-start, /feature-define, /feature-ship, /editorial-* families plus DEVELOPMENT-NOTES and feature workplans — against the widely-used Claude plugins that purport to do the same job. Where did homegrown win? Where would a plugin have served better? Criteria: fit-for-purpose, extensibility, maintenance burden, composability with the rest of the skill stack. |  | manual |
| 1d721535-d815-474a-bc28-757cdb15d8f3 | feature-image-automation-evolution-gallery-claude-code | Feature-Image Automation, One Year On: Evolution by Selection, the Gallery, and Why You Stay in Claude Code | The **applied / practice** half of a pair. Follow-up to the original feature-image-automation piece. What changed: evolution by artificial selection for prompts (fitness × recency, lineage forks), a lightweight gallery app for side-by-side review, and the deeper framing that the whole thing works because you don't leave Claude Code — the agent is the workflow, not a feature bolted onto one. Pairs with `evolution-by-artificial-selection-for-prompt-generation` (the theory/framework half); the two should cross-link. |  | manual |
| bb8186f3-8dba-4edb-b67e-40df244dcecc | editorialcontrol-breakout-new-brand-in-an-evening | The Editorialcontrol Breakout: Creating a New Brand in an Evening | Why the publication broke out from audiocontrol.org, and how. The design decisions (Fraunces + Newsreader, parchment, chartreuse accent), the voice decisions (dispatch, not blog), the infrastructure decisions (shared editorial calendar, shared skills, distinct register). A single-evening sibling site — what that is, what it costs, what it earns. |  | manual |
| 24bc853b-fcb2-4255-b264-b6f1fa20dd50 | editorial-studio-for-editorial-calendar | The Editorial Studio: Calendar, Review, and Voice-Drift in One Desk | Building the Editorial Studio on top of the Claude-based editorial calendar — modeled after the Feature Image Studio. Press-check desk aesthetic, unified surface for calendar stages + longform/shortform review + voice-drift feedback. How a dev-only review dashboard halves the friction of taking a draft from agent output to approved file. |  | manual |
| c95305bc-08ad-4437-9901-b0ed9f5681aa | custom-copywriter-skills | Custom Copywriter Skills: Growing a Site Voice Inside Claude Code | A pattern for capturing a publication's voice as a reusable Claude skill. Not "prompt engineering" — closer to a style guide with structure. How the audiocontrol-voice and editorialcontrol-voice skills are built, what the iteration loop looks like (voice-drift report → skill update → re-run), and how the register survives across a hundred drafts. |  | manual |
| c19c1dfc-90c3-4196-ad1e-58349be77688 | socratic-coding-agents | Socratic Coding Agents | A pattern for working with coding agents: instead of writing better instructions, have the agent describe the task back to you in its own words before it starts. Socratic interview as the real "prompt." Surfaces misunderstandings cheaply, makes the agent's mental model visible, and produces better starting conditions than any amount of upfront specification. Worked example: mine the archived session transcripts under `data/sessions/content/` for cases where the agent got it right after being asked vs. cases where it went sideways after being told — receipts from real sessions, not hypothetical. |  | manual |

## Planned

*No entries.*

## Outlining

*No entries.*

## Drafting

| UUID | Slug | Title | Description | Keywords | Topics | Source |
|------|------|------|------|------|------|------|
| be702116-5a0b-4cf9-b6c9-737c94f0e7ee | evolution-by-artificial-selection-for-prompt-generation | You Don't Need a Better Prompt. You Need Selection Pressure. | The **theory / strategic-framework** half of a pair. Selection pressure as the default workflow posture, with feature-image prompts as the worked example (fitness from user ratings, lineage through forks, fitness×recency weighting). The broader claim: AI agents make selection infrastructure (rating UIs, fitness signals, side-by-side review apps) cheap enough to build weekly, so the operator's skill is noticing where variation + selection can replace engineering. The evolutionary mindset is the skill; the agent is what makes it practical. Pairs with `feature-image-automation-evolution-gallery-claude-code` (the applied half — how the framework plays out in practice); the two should cross-link. Close uses the meta move: this dispatch was itself reframed mid-planning by consulting the `editorialcontrol-voice` skill. | selection pressure workflow, evolutionary mindset AI, artificial selection workflow, feature image generator prompts, feature image prompt library, prompt library evolution, brand consistency AI image generation, AI agent custom software, agent-written review UIs, fitness signals AI workflow, side-by-side review Claude Code, rating UI prompts, prompt lineage forks, population-based prompt search, human-in-the-loop selection | content-marketing, ai-agents, claude, agent-as-workflow | manual |

## Review

*No entries.*

## Published

| UUID | Slug | Title | Description | Keywords | Topics | Source | Published | Issue |
|------|------|------|------|------|------|------|------|------|
| fc4716b3-344d-49a4-ab8b-b230a0f7b1fd | building-the-editorial-calendar-feature | Building the Editorial Calendar Feature | A writeup of the editorial-calendar feature itself — why ad-hoc content creation needed a system, how the Ideas→Published lifecycle works, and how analytics, Reddit, and YouTube got wired into one virtuous loop. | AI content workflow automation, flexible editorial calendar for content teams, ship content faster with AI, build your own AI content stack | content-marketing, automation-workflow, claude | manual | 2026-04-18 | #68 |
| b3d50392-6312-4046-8b9e-6ac2570f8778 | automate-image-generation-in-claude-code | AI Doesn't Remember | Brand consistency is an in-process problem. On the in-process infrastructure that keeps AI-assisted content from drifting off-brand across a hundred independent sessions. | automated blog feature image generation, AI content marketing workflow, Claude Code skills image pipeline, lightweight content automation | ai-agents, claude, programming, content-marketing, automation-workflow | manual | 2026-04-18 | #65 |

## Distribution

*No entries.*
