---
layout: ../../../../../layouts/DocsLayout.astro
title: "Roland S-330 Web Editor"
description: "A guide to the Roland S-330 sampler and the open-source web editor for modern workflows."
---

# A Modern Web Editor for the S-330, Roland's Underdog 80's 12-bit Sampler

![Roland S-330](/images/s-330-feature.jpg)

The Roland S-330 is one of those pieces of vintage gear that punches well above its weight. Released in 1987, this compact 1U rack sampler packed serious sound-shaping capabilities into an affordable package. Nearly four decades later, its distinctive 12-bit character continues to attract musicians looking for that unmistakable late-80s sampling warmth. But there's been one persistent obstacle to truly unlocking its potential: the control hardware.

## A Brief History

The S-330 arrived at a pivotal moment in sampling history. Digital sampling was transitioning from exotic studio luxury to accessible creative tool, and Roland positioned the S-330 as the affordable entry point to their S-series sampler line.

Despite its single rack unit size, the S-330 offered impressive specifications:

- 16-voice polyphony with 8-part multitimbral operation
- Variable sample rates from 15kHz to 30kHz at 12-bit resolution
- Up to 28.8 seconds of sampling time
- Powerful resonant low-pass filter with dedicated 8-stage envelopes
- LFO with sine and peak-hold waveforms
- 8 individual outputs
- Composite video output for external monitoring

The S-330 shared its sampling engine with the larger S-550, and the same architecture later appeared in the W-30 sampling workstation. The S-series distinguished itself through a graphical editing interface displayed on an external video monitor and controlled via mouse or remote controller.

## The Control Hardware Problem

Roland designed the S-330 for editing through an external display and pointing device. The sampler outputs a composite video signal showing parameter screens, waveform displays, and graphical envelope editors. Navigating this interface requires one of the following:

**The Roland MU-1 Mouse**: An MSX-compatible mouse manufactured by Mitsumi for the MSX home computer standard. These mice use a proprietary protocol incompatible with PC, Amiga, or Atari mice. Working originals are rare and expensive.

**The Roland RC-100 Remote Controller**: A dedicated control surface with buttons and a jog wheel mapped to sampler functions. The RC-100 is extremely rare.

**MSX-Compatible Mice**: Some third-party MSX mice (such as the Philips SBC 3810) work, but the MSX computer standard has been obsolete for decades, making these difficult to find.

Without compatible control hardware, editing is limited to the S-330's front panel—a small LCD and minimal buttons that make detailed parameter editing impractical.

DIY solutions exist, including Arduino-based mouse emulators, PS/2 adapters, and Windows control software. These require hardware construction, specific software configurations, or dedicated computers.

## The Web Editor Approach

The S-330 Web Editor communicates directly with the sampler via MIDI System Exclusive messages—the same protocol Roland included for computer-based editing. The editor runs in a web browser, requiring only a standard MIDI interface connection to the S-330.

![S-330 Web Editor screenshot](/images/s330-screenshot.jpg)

### Communication

**MIDI SysEx**: The editor reads and writes sampler parameters in real-time using Roland's SysEx protocol. Changes appear immediately on both the hardware and the web interface.

**Bidirectional Sync**: Parameters edited in the browser update on the S-330, and changes made on the hardware's front panel are reflected in the editor.

**Video Display Integration**: A USB video capture device connected to the S-330's composite output allows the editor to display the sampler's native screen alongside the modern interface.

**Virtual Front Panel**: The editor includes a virtual representation of the S-330's front panel buttons for menu navigation and parameter adjustment. Keyboard shortcuts allow navigation using arrow keys and function keys, making it possible to control the sampler's native UI without a mouse.

### Editor Organization

The interface loosely follows the S-330's organizational structure while taking advantage of the UX benefits afforded by modern web applications:

**Patches**: Each patch contains up to 16 tone zones mapped across the keyboard. The patch editor displays keyboard mappings with controls for key range, velocity response, and tone assignment.

![Patch editor screenshot](/images/s330-patches.png)

**Tones**: Each tone contains sample parameters including filter settings, envelopes, LFO configuration, and wave data references. The tone editor presents these with visual envelope displays.

![Tone editor screenshot](/images/s330-tones.png)

**Play Mode**: A performance view for using the S-330 as an instrument.

![Play mode screenshot](/images/s330-play.png)

## Requirements

- Roland S-330 sampler
- MIDI interface connected to your computer
- Web browser with Web MIDI support (Chrome, Edge, or Opera)
- Optional: USB video capture device for display integration

The editor is available at [audiocontrol.org/s330](https://audiocontrol.org/s330).

## About the Project

The S-330 Web Editor is open source. The editor and supporting libraries are available on [GitHub](https://github.com/oletizi/ol_dsp).
