# Editorial Calendar

## Ideas

| Slug | Title | Description | Keywords | Source |
|------|------|------|------|------|
| building-the-editorial-calendar-feature | Building the Editorial Calendar Feature | A writeup of the editorial-calendar feature itself — why ad-hoc content creation needed a system, how the Ideas→Published lifecycle works, and how analytics, Reddit, and YouTube got wired into one virtuous loop. |  | manual |
| analytics-automation-feature | Analytics Automation Feature | How the automated-analytics feature turns Umami / GA4 / Search Console into actionable recommendations — the scorecard, striking-distance queries, CTR opportunities, and the feedback loop into the editorial calendar. |  | manual |
| codex-parallel-implementation-and-work-checking-on-mesa-ii | Codex Parallel Implementation and Work Checking on MESA II | Running Claude Code and Codex against the same MESA II reverse-engineering problem in parallel, using each to cross-check the other. How disagreement between agents surfaces real bugs; how agreement gives higher confidence than a single agent alone. |  | manual |
| video-demo-feature | Video Demo Feature | Making YouTube videos a first-class content type alongside blog posts — same lifecycle, same cross-link audit, same distribution tracking. How treating videos as editorial entries (not marketing afterthoughts) changes the content workflow. |  | manual |
| lightweight-web-workflow-dashboards-with-action-queues-for-claude-code | Lightweight Web Workflow Dashboards with Action Queues for Claude Code | A pattern: instead of rigid hand-coded review UIs, build lightweight dev-only web dashboards that present an action queue Claude Code pushes work into and the user resolves. Queue is a JSONL file in git — no database. Claude Code is the backend — no rigid workflow engine. The workflow is a family of Claude skills. The audiocontrol.org /feature-image-* family is the live worked example (see the feature-image-automation-feature post). Pass messages back and forth via the queue: the dashboard surfaces complex questions Claude has, user responses save back. Works for feature images, works for any high-bandwidth review loop where the decision surface is too rich for a CLI yes/no. |  | manual |
| evolution-by-artificial-selection-for-prompt-generation | Evolution by Artificial Selection for Prompt Generation | Cultivating a prompt library under selection pressure instead of one-shot engineering the perfect prompt. Fitness from user ratings, lineage through forks, fitness×recency weighting in the UI — brand consistency as a by-product, evolution as the mechanism. The general principle: for high-variance search spaces (prompts, filter combos, skill docs), a population under selection pressure beats brute-force or engineering. |  | manual |

## Planned

*No entries.*

## Drafting

*No entries.*

## Review

*No entries.*

## Published

| Slug | Title | Description | Keywords | Topics | Type | URL | Source | Published | Issue |
|------|------|------|------|------|------|------|------|------|------|
| feature-image-automation-feature | Feature Image Automation Feature | How we went from hand-cropping images to a two-way workflow pipeline between Claude Code skills and a local preview gallery for AI-generated feature images — the JSONL workflow queue, the state machine, and why dev-only Astro routes beat a dashboard app. | automated blog feature image generation, AI content marketing workflow, Claude Code skills image pipeline, lightweight content automation | ai-agents, claude, programming, content-marketing, automation-workflow | blog |  | manual | 2026-04-18 | #65 |
| free-roland-s330-sampler-editor | A Free, Open Source Web Editor for the Roland S-330 Sampler | A guide to the Roland S-330 sampler and the open-source web editor for modern workflows. |  |  | blog |  | manual | 2025-01-15 |  |
| roland-s-series-samplers | The Roland S-Series Samplers: A Complete Guide to the S-330, S-550, S-770, and W-30 | A comprehensive guide to Roland's S-series sampler family — from the affordable S-330 to the flagship S-770, including the W-30 workstation, original accessories, and modern editing tools. |  |  | blog |  | manual | 2025-02-15 |  |
| roland-s330-sampler-editor-feb-2026-update | What's New in the Roland S-330 Web Editor: February 2026 | Real-time hardware sync, integrated video capture, debug tools, and quality-of-life improvements for the free S-330 sampler editor. |  |  | blog |  | manual | 2026-02-09 |  |
| reverse-engineering-akai-s3000xl-midi-over-scsi | Reverse-Engineering the Akai S3000XL MIDI-over-SCSI Protocol: An Odyssey | How a failed attempt to run Akai's MESA II in a Mac OS 9 emulator led us through 38 disproven theories in five days of intense debugging, and ultimately to a standalone 68k emulator that cracked the protocol in four hours. |  |  | blog |  | manual | 2026-04-07 |  |
| scsi-over-wifi-raspberry-pi-bridge | SCSI Over WiFi: Talking to Vintage Hardware from Your Phone | An open-source Raspberry Pi bridge that lets you send SCSI commands to vintage samplers and computers over HTTP and WebSocket -- no SCSI card required. |  |  | blog |  | manual | 2026-04-07 |  |
| claude-vs-codex-claude-perspective | Two AIs, One Feature: What Happens When Claude and Codex Build the Same Thing | Claude Code and Codex independently implemented the same draggable zone feature for the Akai S3000XL editor. The code was comparable. The sessions were not. |  |  | blog |  | manual | 2026-04-13 |  |
| claude-vs-codex-codex-perspective | What Happened When We Asked Claude and Codex to Build the Same Feature | We asked two AI coding agents to implement the same draggable zone editing feature for the Akai S3000XL editor. The most useful comparison wasn't about code quality -- it was about failure modes. |  |  | blog |  | manual | 2026-04-13 |  |
| what-2400-session-taught-us-about-agent-workflow | Instructions Are Not Enough: What 2,400 Sessions Taught Us About AI Agent Workflow | Telling an AI agent what to do is easy. Getting it to reliably follow process requires something structural — skills, session journals, and correction-driven guardrails. |  |  | blog |  | manual | 2026-04-17 |  |
| s330-drum-crunch-video | Vintage 12-bit Sampler Drum Sounds for Cheap | Vintage 12-bit sampler crunch for drums using a ~$200 Roland S-330 plus the free web editor — turn any drum hits into dozens of crunchy kits. |  | samplers, vintage-hardware, roland, home-studio | youtube | https://youtu.be/jWgCQDdsyrw | manual | 2026-03-03 |  |
| s330-web-editor | Roland S-330 Web Editor | Free open-source web editor for the Roland S-330 12-bit sampler — no signup, no cloud, modern workflow for vintage hardware. |  | samplers, vintage-hardware, roland, home-studio | tool | https://audiocontrol.org/roland/s330/editor | manual | 2025-01-15 |  |

## Distribution

| Slug | Platform | URL | Shared | Channel | Notes |
|------|------|------|------|------|------|
| claude-vs-codex-codex-perspective | reddit | https://www.reddit.com/r/ClaudeCode/comments/1smcjze/claude_vs_codex_cage_match/ | 2026-04-15 | r/ClaudeCode | Claude vs. Codex Cage Match |
| claude-vs-codex-codex-perspective | reddit | https://www.reddit.com/r/codex/comments/1smd3jc/claude_vs_codex_cage_match/ | 2026-04-15 | r/codex | [ Removed by moderator ] |
| s330-drum-crunch-video | reddit | https://www.reddit.com/r/synthdiy/comments/1rl9k63/roland_s330_12bit_crunch_for_drums_cheap/ | 2026-03-05 | r/synthdiy | Roland S-330 12-Bit Crunch for Drums, Cheap |
| s330-drum-crunch-video | reddit | https://www.reddit.com/r/Samplers/comments/1rjyrac/roland_s330_12bit_crunch_for_drums_cheap/ | 2026-03-03 | r/Samplers | Roland S-330 12-Bit Crunch for Drums, Cheap |
| s330-drum-crunch-video | reddit | https://www.reddit.com/r/synthesizers/comments/1rjyuuf/roland_s330_12bit_crunch_for_drums_cheap/ | 2026-03-03 | r/synthesizers | Roland S-330 12-Bit Crunch for Drums, Cheap |
| s330-drum-crunch-video | reddit | https://www.reddit.com/r/Roland/comments/1rjyssb/roland_s330_12bit_crunch_for_drums_cheap/ | 2026-03-03 | r/Roland | Roland S-330 12-Bit Crunch for Drums, Cheap |
| s330-web-editor | reddit | https://www.reddit.com/r/Samplers/comments/1qxov76/web_editor_for_roland_s330_12bit_samplerlooking/ | 2026-02-06 | r/Samplers | Web Editor for Roland S-330 12-bit Sampler — looking for feedback |
| s330-web-editor | reddit | https://www.reddit.com/r/synthesizers/comments/1qxp6ih/web_editor_for_roland_s330_12bit_samplerlooking/ | 2026-02-06 | r/synthesizers | Web Editor for Roland S-330 12-bit Sampler — looking for feedback |
