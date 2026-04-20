# Reference: social, YouTube, Reddit, release notes

Short-form distribution copy. The challenge: keep the service-manual voice even when the platform is hostile to it (Reddit rewards casual voice; YouTube rewards hook-bait titles). Don't concede the voice. Write audiocontrol-flavored copy that happens to be short.

## YouTube video descriptions

Template:

```
[One paragraph: what the video shows, what hardware, what surprised us or what's worth noting. 2–4 sentences.]

→ Editor: https://audiocontrol.org/[device]/editor
→ Source: https://github.com/audiocontrol-org
→ Discord: https://discord.gg/...

[Optional: second paragraph for technical notes or next steps.]
```

Example:

> The Roland S-550 coming back online after thirty years of sitting on a shelf. VGA output, SCSI drive emulation via a Rephlux HD5-IF, and the web editor running live against the hardware. No mods to the sampler itself — it boots from the original OS disk and talks to the browser over MIDI.
>
> → Editor: https://audiocontrol.org/roland/s550/editor
> → Source: https://github.com/audiocontrol-org

Notes:
- Never "Don't forget to like and subscribe."
- Never "In this video we'll be looking at…"
- Specific hardware and interface parts named by model number.
- Links use the `→` prefix, one per line.

## YouTube titles

Declarative. Device named. Action named.

- "Roland S-550 — live sample transfer over SCSI, no floppy"
- "Akai S3000XL SysEx: reverse-engineering the patch format"
- "Web editor + real hardware: 12-bit envelopes in the browser"

Avoid question titles, clickbait, and the word "ULTIMATE."

## Reddit posts

Reddit audiences will read the body if the title is honest. Don't capitulate to the culture of overclaiming.

Title template: **[Device] — [specific thing shown/built]**

Body template:

```
[One line: context — who this is for or why it exists.]

[One short paragraph: what it does, what hardware it runs against, what's open.]

Source: [github url]
Editor: [url if applicable]

Happy to answer questions about [specific aspect].
```

Example post:

> **Roland S-330 — free web editor with real-time hardware sync**
>
> For anyone with an S-330 or S-550 on the rack: we've been building a browser-based editor that runs against the actual hardware over MIDI. No install, no sign-up, runs off a static page.
>
> Patch browsing, filter and envelope visualization, sample waveform display. 16-bit math in the browser against a 12-bit device — the edits round-trip back to the sampler as the original parameter bytes.
>
> Source: https://github.com/audiocontrol-org
> Editor: https://audiocontrol.org/roland/s330/editor
>
> Happy to answer questions about the MIDI protocol work or the UI.

Notes:
- No "Hey r/synthesizers!" opening.
- No self-deprecating "I'm new to this" framing. The work stands on its own.
- No emoji. No exclamation points.
- End with a specific offer to answer questions, not a generic "thoughts?"

## Release notes / changelog entries

Short, terse, service-manual. One line per change.

```
## v0.4.2 — 2026-04-15

- S-330: fixed envelope decay rounding at low sample rates.
- S-550: added patch-level filter cutoff visualization.
- Shared: SCSI handshake timeout now configurable per device.
- Docs: added MESA II protocol notes under /docs/akai/s3000xl/.
```

## Commit-message-style announcements (Discord, Mastodon, BlueSky)

One line. Optionally a second line for the link.

- "S-550 editor: patch browsing now live. → https://audiocontrol.org/roland/s550/editor"
- "S3000XL: MIDI-over-SCSI handshake confirmed end-to-end. Protocol notes published."
- "New: Rephlux HD5-IF working as an S-550 SCSI drive replacement. Demo video going up this week."

## Feature announcements (longer than a tweet, shorter than a blog post)

When a feature ships and deserves more than one line but not a full essay, write it like a patch notes entry expanded to three paragraphs.

> **S-550 editor — patch browsing**
>
> As of this week, the S-550 editor can browse patches live off the sampler's current memory. Open the editor with the device connected over MIDI; it pulls the patch list, renders the filter and envelope parameters, and round-trips edits back.
>
> The S-550 shares its parameter model with the S-330, so most of this was a matter of wiring up the UI — the protocol work was done last month. Known gap: velocity-layer editing is not in yet. Next up.
>
> → Editor: https://audiocontrol.org/roland/s550/editor

## What NOT to do in short-form

- Don't adopt platform vernacular. No "frfr," no "🚀," no "big W for vintage samplers," no "I made a thing." The site doesn't do that.
- Don't lead with the company name or the writer. Lead with the hardware.
- Don't turn "we" into "the audiocontrol team" — the site is one person and his sampler rack. Be accurate.
- Don't write "show HN" bait unless genuinely posting to Show HN. The tone should survive being read six months later.
- Don't promise things the editor doesn't actually do. "Full MIDI control" is different from "patch browsing and envelope editing." Be precise.
