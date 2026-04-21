# Editorial Calendar

## Ideas

| Slug | Title | Description | Keywords | Source |
|------|------|------|------|------|
| analytics-automation-feature | Analytics Automation Feature | How the automated-analytics feature turns Umami / GA4 / Search Console into actionable recommendations — the scorecard, striking-distance queries, CTR opportunities, and the feedback loop into the editorial calendar. |  | manual |
| video-demo-feature | Video Demo Feature | Making YouTube videos a first-class content type alongside blog posts — same lifecycle, same cross-link audit, same distribution tracking. How treating videos as editorial entries (not marketing afterthoughts) changes the content workflow. |  | manual |
| lightweight-web-workflow-dashboards-with-action-queues-for-claude-code | Lightweight Web Workflow Dashboards with Action Queues for Claude Code | A pattern: instead of rigid hand-coded review UIs, build lightweight dev-only web dashboards that present an action queue Claude Code pushes work into and the user resolves. Queue is a JSONL file in git — no database. Claude Code is the backend — no rigid workflow engine. The workflow is a family of Claude skills. The audiocontrol.org /feature-image-* family is the live worked example (see the feature-image-automation-feature post). Pass messages back and forth via the queue: the dashboard surfaces complex questions Claude has, user responses save back. Works for feature images, works for any high-bandwidth review loop where the decision surface is too rich for a CLI yes/no. |  | manual |
| homegrown-workflow-skills-vs-the-popular-claude-plugins | Homegrown Workflow Skills vs. the Popular Claude Plugins | A side-by-side look at our homegrown session-lifecycle and feature-workflow skills — the /session-start, /feature-define, /feature-ship, /editorial-* families plus DEVELOPMENT-NOTES and feature workplans — against the widely-used Claude plugins that purport to do the same job. Where did homegrown win? Where would a plugin have served better? Criteria: fit-for-purpose, extensibility, maintenance burden, composability with the rest of the skill stack. |  | manual |
| feature-image-automation-evolution-gallery-claude-code | Feature-Image Automation, One Year On: Evolution by Selection, the Gallery, and Why You Stay in Claude Code | The **applied / practice** half of a pair. Follow-up to the original feature-image-automation piece. What changed: evolution by artificial selection for prompts (fitness × recency, lineage forks), a lightweight gallery app for side-by-side review, and the deeper framing that the whole thing works because you don't leave Claude Code — the agent is the workflow, not a feature bolted onto one. Pairs with `evolution-by-artificial-selection-for-prompt-generation` (the theory/framework half); the two should cross-link. |  | manual |
| editorialcontrol-breakout-new-brand-in-an-evening | The Editorialcontrol Breakout: Creating a New Brand in an Evening | Why the publication broke out from audiocontrol.org, and how. The design decisions (Fraunces + Newsreader, parchment, chartreuse accent), the voice decisions (dispatch, not blog), the infrastructure decisions (shared editorial calendar, shared skills, distinct register). A single-evening sibling site — what that is, what it costs, what it earns. |  | manual |
| editorial-studio-for-editorial-calendar | The Editorial Studio: Calendar, Review, and Voice-Drift in One Desk | Building the Editorial Studio on top of the Claude-based editorial calendar — modeled after the Feature Image Studio. Press-check desk aesthetic, unified surface for calendar stages + longform/shortform review + voice-drift feedback. How a dev-only review dashboard halves the friction of taking a draft from agent output to approved file. |  | manual |
| custom-copywriter-skills | Custom Copywriter Skills: Growing a Site Voice Inside Claude Code | A pattern for capturing a publication's voice as a reusable Claude skill. Not "prompt engineering" — closer to a style guide with structure. How the audiocontrol-voice and editorialcontrol-voice skills are built, what the iteration loop looks like (voice-drift report → skill update → re-run), and how the register survives across a hundred drafts. |  | manual |

## Planned

| Slug | Title | Description | Keywords | Topics | Source |
|------|------|------|------|------|------|
| evolution-by-artificial-selection-for-prompt-generation | You Don't Need a Better Prompt. You Need Selection Pressure. | The **theory / strategic-framework** half of a pair. Selection pressure as the default workflow posture, with feature-image prompts as the worked example (fitness from user ratings, lineage through forks, fitness×recency weighting). The broader claim: AI agents make selection infrastructure (rating UIs, fitness signals, side-by-side review apps) cheap enough to build weekly, so the operator's skill is noticing where variation + selection can replace engineering. The evolutionary mindset is the skill; the agent is what makes it practical. Pairs with `feature-image-automation-evolution-gallery-claude-code` (the applied half — how the framework plays out in practice); the two should cross-link. Close uses the meta move: this dispatch was itself reframed mid-planning by consulting the `editorialcontrol-voice` skill. | selection pressure workflow, evolutionary mindset AI, artificial selection workflow, feature image generator prompts, feature image prompt library, prompt library evolution, brand consistency AI image generation, AI agent custom software, agent-written review UIs, fitness signals AI workflow, side-by-side review Claude Code, rating UI prompts, prompt lineage forks, population-based prompt search, human-in-the-loop selection | content-marketing, ai-agents, claude, agent-as-workflow | manual |

## Drafting

*No entries.*

## Review

*No entries.*

## Published

| Slug | Title | Description | Keywords | Topics | Source | Published | Issue |
|------|------|------|------|------|------|------|------|
| building-the-editorial-calendar-feature | Building the Editorial Calendar Feature | A writeup of the editorial-calendar feature itself — why ad-hoc content creation needed a system, how the Ideas→Published lifecycle works, and how analytics, Reddit, and YouTube got wired into one virtuous loop. | AI content workflow automation, flexible editorial calendar for content teams, ship content faster with AI, build your own AI content stack | content-marketing, automation-workflow, claude | manual | 2026-04-18 | #68 |
| feature-image-automation-feature | Automating Around a Design Skills Gap | The older feature images on my audiocontrol.org blog are rough. Closing the skills gap with automation, dropping the friction of shipping posts, and growing a design system by artificial selection. | automated blog feature image generation, AI content marketing workflow, Claude Code skills image pipeline, lightweight content automation | ai-agents, claude, programming, content-marketing, automation-workflow | manual | 2026-04-18 | #65 |

## Distribution

*No entries.*
