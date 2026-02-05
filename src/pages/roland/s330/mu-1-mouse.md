---
layout: ../../../layouts/GuideLayout.astro
title: "Roland MU-1 Mouse — MSX Mouse for S-330 and S-550 Samplers"
description: "The Roland MU-1 is an MSX-compatible mouse used to control the Roland S-330, S-550, and W-30 samplers. Learn about its history, compatibility, alternatives, and modern replacements."
---

# Roland MU-1 Mouse

<figure>
  <img src="/images/mu-1.jpg" alt="Roland MU-1 Mouse">
  <figcaption>The Roland MU-1 Mouse — an MSX-compatible mouse manufactured by Mitsumi</figcaption>
</figure>

The Roland MU-1 is the primary pointing device for Roland's S-series samplers. It connects to the sampler's mouse port and controls a cursor on the composite video output, providing graphical access to sample editing, envelope shaping, and parameter adjustment.

## Background

Roland designed the S-series samplers around a graphical user interface displayed on an external monitor. Unlike most rack-mount samplers of the era, which relied on small LCD screens and button navigation, the S-330, S-550, and W-30 output a full-screen display showing waveform editors, envelope curves, and menu systems.

This interface requires a pointing device, and Roland chose the MSX mouse standard — a protocol from the MSX home computer platform developed by ASCII Corporation and Microsoft in the early 1980s. The MU-1 was manufactured by Mitsumi and uses a 9-pin D-sub connector carrying the MSX mouse protocol.

## MSX Mouse Protocol

The MSX mouse standard defines a specific communication protocol over a 9-pin connector. Key characteristics:

- **9-pin D-sub connector** (DE-9)
- **Quadrature encoding** for X and Y axes
- **Two buttons** (left and right click)
- **Active polling** by the host device

This protocol is incompatible with the more common serial mouse standards used by PC (Microsoft/Logitech), Amiga, and Atari computers of the same era. A standard PC serial mouse will not work in the S-330's mouse port — the electrical interface and signaling protocol are different.

## Compatible Hardware

| Device | Notes |
|--------|-------|
| Roland S-330 | Primary use case |
| Roland S-550 | Same mouse port and protocol |
| Roland W-30 | Same mouse port and protocol |
| MSX computers | Original target platform |

## Finding an MU-1

The MU-1 was manufactured in limited quantities and has not been produced for decades. Sources include:

- **Used gear marketplaces** — eBay, Reverb, Yahoo Auctions Japan
- **MSX computer communities** — since any MSX mouse is compatible
- **Roland-specific forums** — occasionally surface in classified sections

Prices vary widely depending on condition and availability. Working MU-1 units can sell for several times their original retail price.

## Alternatives to the MU-1

### Other MSX Mice

Any MSX-compatible mouse will work with the S-330. Notable options:

- **Philips SBC 3810** — a common MSX mouse found in European markets
- **Panasonic FS-JM1** — another MSX mouse option
- **Various third-party MSX mice** — any mouse labeled "MSX compatible" uses the same protocol

MSX mice share the same 9-pin connector and protocol, making them interchangeable with the MU-1 for S-series sampler use.

### DIY Adapters

Several community projects exist for building adapter hardware:

- **Arduino-based MSX mouse emulators** — microcontroller circuits that translate modern USB mouse input to MSX protocol
- **PS/2 to MSX adapters** — convert PS/2 mouse signals to MSX format

These projects require electronics assembly skills and sourcing specific components.

### Roland RC-100 Remote Controller

The [RC-100](/roland/s330/rc-100) is an alternative control surface that connects to the same port. It replaces the mouse with physical buttons and a jog wheel, offering a different workflow for navigating the sampler's interface.

### The Web Editor

The [audiocontrol.org S-330 web editor](/roland/s330/editor) eliminates the need for original control hardware entirely. It communicates with the S-330 via MIDI System Exclusive messages, providing a modern browser-based interface for all editing tasks that are accessible through SysEx.

The web editor does not replace the mouse for every function — certain operations like sampling and disk management are only available through the sampler's native interface — but it covers patch editing, tone editing, envelope shaping, and real-time parameter control.

## See Also

- [Roland S-330 Overview](/roland/s330/) — specs, accessories, and related devices
- [Roland RC-100 Remote Controller](/roland/s330/rc-100) — the alternative control surface
- [S-330 Web Editor](/roland/s330/editor) — the free browser-based editor
- [S-330 Web Editor Documentation](/docs/roland/samplers/s-330/) — setup and usage guide
- [The Roland S-Series Samplers](/blog/roland-s-series-samplers/) — history of the full product line
