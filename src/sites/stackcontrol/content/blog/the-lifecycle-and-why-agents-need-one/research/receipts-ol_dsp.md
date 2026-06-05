# Receipts: `oletizi/ol_dsp` — the origin beat

> Source: read-only clone at `/Users/orion/work/ol_dsp` (1026 commits,
> `0073faf` "init" 2023-11-08 .. `75c92a3` 2026-02-03). All SHAs, dates, and commit
> subjects below are quoted verbatim from `git log`/`git show`. Nothing invented.

## Bottom line: what ol_dsp is and why it's the origin

`ol_dsp` is Orion Letizi's personal **C/C++ digital-signal-processing toolkit for embedded audio
hardware** — hand-written synth voices, audio effects (delay, reverb, filters), and MIDI control,
targeted at the **Electrosmith Daisy** (Daisy Seed / DaisySP) and **Teensy** microcontrollers, plus
a Eurorack **DU-INO** Arduino module and a JUCE desktop plugin host for testing. It begins
**2023-11-08** with a single `git init` and a `main.cpp`, and the first three months (Nov 2023 –
Jan 2024) are a dense, entirely hand-coded run of low-level DSP work: oscillators, envelopes,
filters, soft-clipping, SDRAM-allocated delay lines for the Daisy, reverb classes, and the painful
"refactor this to not use classes and inheritance b/c it's gross" cleanups that only a human typing
every line produces. There are **no agent artifacts anywhere in that era** — the first `CLAUDE.md`
does not appear until **2025-09-01** (`6b4bbd0`), nearly two years in. That is exactly why this repo
grounds the origin story: it is documented proof that Orion was a hand-coder building embedded audio
DSP for real hardware *before* agentic coding was available, which is what makes the later "I had to
invent a process for building WITH agents" arc earned rather than asserted. And the bridge is
literal: the TypeScript **audio-tools** sampler stack — the direct ancestor of the audiocontrol.org
web editors — was pulled *into* this repo on 2025-09-01 (`d5e5197`), and the **Roland S-330 editor**
that audiocontrol.org now proxies was first built here in **January 2026** (`cbd5059` onward).

---

## 1. The true beginning

**`0073faf` — 2023-11-08 — "init"** (`git show --stat`):

```
 .gitignore     | 2 ++
 .gitmodules    | 3 +++
 CMakeLists.txt | 7 +++++++
 JUCE           | 1 +
 main.cpp       | 6 ++++++
 5 files changed, 19 insertions(+)
```

The repo is born as a bare CMake + JUCE submodule shell with a 6-line `main.cpp`. The next ~15
commits, all on **2023-11-08**, are the project finding its shape in a single sitting:

- `05c83a5` 2023-11-08 — "basic juce stuff works."
- `3a68807` 2023-11-08 — "- libdaisy in juce seems to work."  *(Daisy target present on day one)*
- `a0c2ff0` 2023-11-08 — "- added synthlib - added google test"
- `abd7b0a` 2023-11-08 — "- renamed to juce_test"
- `62e30e1` 2023-11-08 — "- Voice: added oscillator - Added tests for voice."
- `1e76508` 2023-11-08 — "- added Voice to realtime JUCE test"
- `9f81aa4` 2023-11-08 — "- added ControlPanel and Control"
- `7a8a802` 2023-11-08 — "- wired up midi to voice oscillator frequency"
- `1a1d4ce` 2023-11-08 — "- amp envelope seems to work."
- `142e123` 2023-11-08 — "- added filter and filter envelope - added control for oscillator waveform"

**What it concretely is** (from `README.md` at HEAD + top-level dirs + early commits): an
*"eclectic collection of digital signal processing tools, audio effects, and hardware sampler
utilities for Arduino microcontrollers and desktop applications,"* bridging *"embedded audio
processing and professional audio hardware."* Hardware targets are explicit: **Daisy Seed** (libDaisy
/ DaisySP), **Teensy**, and a Eurorack **DU-INO** Arduino module. The C/C++ module set at HEAD:
`corelib`, `fxlib`, `ctllib`, `iolib`, `synthlib`, `guilib`, `ol_daisy`, `ol_teensy`, `du-ino`,
`juce`, `rnbo`. So: a hand-rolled monosynth + effects-rack DSP library, written to run on
microcontrollers and validated through a JUCE desktop host.

## 2. Hand-coded / pre-agentic confirmation — and the transition point

Searched for every agentic artifact. Findings:

- **`CLAUDE.md`** — first appears **`6b4bbd0` 2025-09-01** "CLAUDE.md tailored to this project".
  This is the *first* agent artifact in the entire history.
- **`AGENTS.md`** — never committed (no history).
- **`.claude/`** directory — never committed as a tracked path with its own history; the
  Claude-Code agent config shows up via commits like `b9bbd09` 2026-01-24
  "chore(s330-editor): add Claude Code agent configuration" and `2a96a40` 2025-10-04
  "chore(claude): add multi-agent workflow system with harmonized configuration".
- **`.cursor`** — never committed.
- First commit *subject* mentioning an agent tool: **`4bcdb02` 2025-09-30**
  "docs(launch-control-xl3): add maintenance guide and AI agent guidelines…", then
  `2a96a40` 2025-10-04 (multi-agent workflow), then a wave of `claude`/agent-tagged commits
  through 2026-01.

**The pre-agentic era is firmly established.** Commit volume by month:

| Month | Commits | Era |
|-------|--------:|-----|
| 2023-11 | 114 | hand-coded |
| 2023-12 | 69 | hand-coded |
| 2024-01 | 85 | hand-coded |
| 2024-10 | 6 | hand-coded (dormant tail) |
| 2025-03 | 50 | hand-coded |
| 2025-04 | 9 | hand-coded |
| 2025-05 | 2 | hand-coded |
| **2025-09** | **231** | **agentic (CLAUDE.md lands 09-01)** |
| 2025-10 | 228 | agentic |
| 2026-01 | 34 | agentic |
| 2026-02 | 2 | agentic |

There is a hard, empty gap **2024-02 through 2024-09** (zero commits) and again a quiet
2025-05→2025-08 stretch. The work resumes at high volume in **September 2025 — the same month the
first `CLAUDE.md` lands.** That is the transition point: the early/middle era (2023-11 → mid-2025)
is hand-coded with no agent artifacts; the agentic era begins **2025-09-01**. (Notably, that is the
same date the audiocontrol monorepo was created — these are the same moment.)

## 3. What it is / the arc — a compact dated timeline

- **2023-11-08** (`0073faf`) — init: CMake + JUCE shell, libDaisy wired up same day.
- **2023-11-08** — synth core hand-built: Voice, oscillator, amp + filter envelopes, MIDI→param
  wiring (`62e30e1`, `1a1d4ce`, `142e123`, `7a8a802`).
- **2023-11-10** (`4fab156`) — "added fxlib"; first reverb `1ac06d9` "- basic reverb fx seems to work".
- **2023-11-11** (`fb0fc33`) — delay class added; DaisySP / `sample_t` plumbing.
- **2023-11-17–18** (`6a64243`, `5f4f2be`, `97bd121`) — **Daisy-specific embedded work**: allocating
  delay lines on **SDRAM** for larger FX, "wrangling things to make it work for Daisy."
- **2023-11-18** (`a798c49`) — real hardware debugging: "noise from the Daisy analog controls was
  making things sound super funky" + profiling.
- **2023-11-24** (`0dec2ba`) — "moved DaisySP to my own fork" (owns the toolchain).
- **2023-11-25** (`3d96ac9`) — "mid-refactor reverb stuff to not use classes and inheritance b/c
  it's gross" (the now-familiar composition-over-inheritance instinct, hand-applied).
- **2023-12-01** (`861f025`) — "added support for **DU-INO** Arduino-based Eurorack module."
- **2023-12-04** (`95fcc4f`) — "stubbed out support for a sampler app" — first sampler seed.
- **2023-12-31 → 2024-01** (`afefb96` …) — **Teensy** build infra + serialization; MIDI RX.
- **2024-01-15** (`592d708`) — `modules/daisy` → `modules/ol_daisy`; SynthApp app split out.
- **2024-01-16** (`6a661b9`) — "Daisy MIDI RX via USART2 works" (bare-metal UART MIDI).
- **2024-10 / 2025-03–05** — sparse maintenance (build fixes, miniaudio workouts).
- **2025-09-01** (`d5e5197`) — **audio-tools (TS sampler stack) absorbed**; `CLAUDE.md` added.
- **2025-10-03+** — audio-tools refactored into pnpm-workspace packages: `sampler-devices`,
  `sampler-midi`, `sampler-lib`, akaitools, SFZ/DecentSampler export (Akai S3000XL / S5000/S6000).
- **2026-01-21** (`cbd5059`) — "feat(sampler-devices): add Roland S-330 sampler support"; the
  **S-330 web editor** is built out (`329ea8e`, `54eec42`, `76e2660`, …) with RQD/WSD/DAT MIDI
  SysEx protocol reverse-engineering.
- **2026-02-03** (`75c92a3`) — "chore: remove audio-tools workspace references" (audio-tools
  graduates out to its own home).

Arc in one line: **hand-coded embedded audio DSP for Daisy/Teensy/Eurorack hardware (2023–2024) →
dormancy → agentic-era sampler tooling and web editors (late 2025–2026).**

## 4. Connection to audiocontrol

Direct and load-bearing:

- **Same author throughout** — `orion <oletizi@mac.com>` on the 2023 init *and* the 2026 S-330
  editor commits.
- **audio-tools lived here.** `d5e5197` 2025-09-01 — "moving https://github.com/oletizi/audio-tools
  to this repo." audio-tools (created as its own repo 2024-10-11 per operator context) was pulled
  *into* ol_dsp, refactored into the `@oletizi/sampler-*` packages
  (`ee13a30`, `b941159`, `eac826a`, 2025-10-03), then later removed (`75c92a3` 2026-02-03) once it
  moved on. ol_dsp is the crucible the sampler stack passed through.
- **The Roland S-330 editor was born here.** The audiocontrol.org URL convention proxies
  `/roland/s330/editor`; that editor's protocol and UI were first implemented in *this* repo in
  January 2026: `cbd5059` (S-330 support), `e0fe8cd` (RQD/DAT protocol), `329ea8e`/`54eec42` (UI),
  `38b272a` "implement tone editing with real-time device updates", `b9bbd09` "add Claude Code agent
  configuration". The hardware-MIDI reverse-engineering muscle that audiocontrol's editors depend on
  is the same muscle built across ol_dsp's whole history.
- **The hardware motivation is continuous.** ol_dsp starts by *making* synth/effects hardware run
  (Daisy, Teensy, Eurorack) and ends by *controlling* classic hardware samplers (Akai S-series,
  Roland S-330) — the throughline is "talk to real audio hardware at the byte/MIDI/DSP level,"
  which is precisely audiocontrol.org's premise.

## 5. Representative origin receipts (hand-coded, pre-agentic)

Five commits that read well as "before agentic coding" evidence — all human-typed C/C++ on
embedded targets, 2023–2024:

1. **`142e123` — 2023-11-08 — "- added filter and filter envelope - added control for oscillator
   waveform"** — hand-built subtractive-synth signal path on day one.
2. **`9de8c03` — 2023-11-15 — "- Created a Reverb effects class - Started refactoring effects lib to
   use a common interface for Init and Process…"** — touches 13 files
   (`fxlib/Reverb.{cpp,h}`, `FxChain`, `FxControlPanel`, `corelib`); a meaty hand-written DSP
   architecture commit.
3. **`5f4f2be` — 2023-11-18 — "…adding support for SDRAM allocation for larger fx like delay lines
   and reverbs in a Daisy context."** — embedded-memory-aware DSP, the kind of constraint only
   bare-metal hardware forces.
4. **`a798c49` — 2023-11-18 — "…figured out that noise from the the Daisy analog controls was making
   things sound super funky…"** — real hardware bring-up debugging (typos and all), unmistakably
   hand-driven.
5. **`6a661b9` — 2024-01-16 — "* Daisy MIDI RX via USART2 works"** — bare-metal UART MIDI receive on
   the Daisy: a hardware bring-up milestone.

(Bonus, the human voice in the log:) **`3d96ac9` — 2023-11-25 — "- mid-refactor reverb stuff to not
use classes and inheritance b/c it's gross."**

---

## Gaps / open questions

- **Do ol_dsp's agentic-era commits matter to the *origin* beat?** For the ORIGIN beat the answer is
  "only as the transition marker." The story the beat needs is the hand-coded 2023–2024 era; the
  2025-09+ agentic explosion is best used as the pivot ("…and then, in Sept 2025, the first
  `CLAUDE.md` appears"), not dwelt on. Confirm with operator whether the article wants the transition
  point named in the origin beat or saved for the later "building WITH agents" beat.
- **The 2024-02 → 2024-09 silence.** Zero commits for ~8 months. Worth an operator note on whether
  that dormancy is narratively meaningful (life happened / pivot to other repos) or just noise.
- **audio-tools provenance.** ol_dsp shows audio-tools was *imported* 2025-09-01 and *removed*
  2026-02-03; its own independent history (created 2024-10-11 per context) lives in a separate repo
  not examined here. If the article leans on the audio-tools → audiocontrol bridge, mine that repo
  directly for the cleanest dates.
- **Authorship attribution in the agentic era.** Commits remain authored by `orion <oletizi@mac.com>`
  even where Claude Code config is present; this repo's git metadata does not by itself prove
  human-vs-agent authorship per commit. Don't claim a specific commit was "written by an agent"
  without operator confirmation.
