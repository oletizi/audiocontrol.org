---
layout: ../../../layouts/BlogLayout.astro
title: "Reverse-Engineering the Akai S3000XL MIDI-over-SCSI Protocol: An Odyssey"
description: "How a failed attempt to run Akai's MESA II in a Mac OS 9 emulator led us through 44 disproven theories, a month of debugging, and ultimately to a standalone 68k emulator that cracked the protocol in four hours."
date: "April 2026"
datePublished: "2026-04-07"
dateModified: "2026-04-07"
author: "Orion Letizi"
---

# Reverse-Engineering the Akai S3000XL MIDI-over-SCSI Protocol

The Akai S3000XL is a professional 16-bit sampler from the mid-1990s. Like most hardware samplers of its era, you edit it by scrolling through pages of tiny text on a backlit LCD, navigating with a data wheel and a handful of buttons. Every parameter change is a multi-step menu dive. It's powerful, but painfully slow to work with.

We're building [audiocontrol](https://audiocontrol.org) -- open-source web-based editors for vintage samplers. Instead of squinting at an LCD, you connect to your sampler from a browser and edit everything visually. We've already shipped editors for Roland's S-330 and S-550 samplers, and the S3000XL editor is in active development.

What followed was a month-long odyssey through Mac OS 9 emulation, PowerPC binary reverse-engineering, 44 disproven theories, and ultimately a pivot that cracked the entire protocol in a single evening.

## The Setup

### Two Ways to Talk to a Sampler

The S3000XL supports two communication interfaces. **MIDI** is the standard one -- a 5-pin DIN cable carrying messages at 31.25 kilobaud. That's fast enough for parameter editing (changing a filter cutoff, renaming a program), but agonizingly slow for transferring audio. Loading a one-second sample over MIDI takes about 25 seconds.

The S3000XL also has a **SCSI** port -- the same parallel bus interface that 1990s Macs used for hard drives. SCSI transfers data at megabytes per second, orders of magnitude faster than MIDI. The sampler supports "MIDI via SCSI": standard MIDI messages transmitted over the SCSI bus instead of a MIDI cable. The payload is byte-for-byte identical; only the physical transport changes.

The problem is that modern computers don't have SCSI ports. Nobody has for twenty years.

### A Raspberry Pi on the SCSI Bus

The solution is a Raspberry Pi with a [PiSCSI](https://github.com/PiSCSI/piscsi) board -- a hat that gives the Pi a 50-pin SCSI connector. The Pi runs [scsi2pi](https://www.scsi2pi.net/), software that emulates SCSI hard drives, serves disk images to the sampler, and can send raw SCSI commands on the bus. We connect the Pi to the sampler's SCSI port with a ribbon cable, and the Pi connects to the network over WiFi.

On the Pi, we run a small open-source bridge daemon we built called [scsi-midi-bridge](https://github.com/audiocontrol-org/audiocontrol/tree/main/services/scsi-midi-bridge). It translates between HTTP (which a browser can speak) and the SCSI bus (which the sampler speaks). The browser-based editor sends a request like "give me the list of programs on the sampler," the bridge daemon converts it into the right SCSI command, sends it down the SCSI bus, reads the response, and sends it back to the browser.

```
┌─────────────────────────────────────────────────────────────────┐
│  Your Laptop                                                    │
│  ┌───────────────────────────────────────────┐                  │
│  │  Browser                                  │                  │
│  │  audiocontrol.org/akai/s3000xl/editor     │                  │
│  └─────────────────────┬─────────────────────┘                  │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP / WebSocket
                         │ over WiFi
┌────────────────────────┼────────────────────────────────────────┐
│  Raspberry Pi          │                                        │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  scsi-midi-bridge (Rust daemon, port 7033)│                  │
│  └─────────────────────┬─────────────────────┘                  │
│                        │ Protobuf (TCP, port 6868)              │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  scsi2pi / s2p (SCSI bus controller)      │                  │
│  └─────────────────────┬─────────────────────┘                  │
│                        │ GPIO                                   │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  PiSCSI board (SCSI HAT)                  │                  │
│  └─────────────────────┬─────────────────────┘                  │
└────────────────────────┼────────────────────────────────────────┘
                         │ 50-pin SCSI ribbon cable
┌────────────────────────┼────────────────────────────────────────┐
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  Akai S3000XL Sampler (SCSI ID 6)         │                  │
│  └───────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### What Worked and What Didn't

We'd built the bridge and gotten reads working -- the browser editor could fetch program names, sample headers, and keygroup data from the sampler over SCSI. But two things were broken: writes didn't seem to persist when we read the values back, and we couldn't receive sample waveform data at all. The sampler simply wasn't sending it through the SCSI response channel.

We needed to see how Akai's own software did it. Enter MESA II.

## Act I: The Plan That Seemed Reasonable

MESA II is Akai's official Mac OS 9 editor for the S3000XL. It communicates over SCSI using a plugin called the "SCSI Plug" -- a 12KB 68k code resource that handles all low-level SCSI communication. If we could run MESA II and capture its SCSI traffic, we'd have a definitive protocol reference.

The plan: run Mac OS 9 in [SheepShaver](https://sheepshaver.cebix.net/) (a PowerPC Mac emulator), connect it to the real S3000XL hardware via scsi2pi over the network, and watch what MESA II does.

### The Network SCSI Backend

The first piece went smoothly. We wrote `scsi_s2p.cpp`, a network SCSI backend for SheepShaver that forwards SCSI commands to scsi2pi over TCP. Hand-rolled protobuf encoding, no external dependencies. Within a few days, Mac OS 9 was booting in a Docker container, discovering SCSI devices on the Pi, and mounting HFS disk images over the network.

We could even automate it -- keystroke injection via xdotool to dismiss Disk First Aid dialogs, a rebuild-and-boot script that handled the full build-restart-wait cycle. Mac OS 9 in a container, talking to 1990s SCSI hardware over WiFi. The future is weird.

### The Brick Wall

Then we tried to run MESA II.

MESA II's SCSI Plug uses a mechanism called Mixed Mode -- a bridge between Mac OS's older 68k code and the newer PowerPC runtime. The Plug itself is 68k code, but MESA II is a PowerPC application. When MESA II calls the Plug, the OS's Mixed Mode Manager is supposed to switch execution contexts seamlessly.

Except in SheepShaver, it doesn't.

## Act II: Forty-Four Theories

What followed was a sustained campaign of investigation, hypothesis, and refutation. We documented every theory with a letter.

**Theory A** (Gestalt timing): Maybe SheepShaver reports the wrong machine type. Checked -- the native value passes the Plug's sanity check fine.

**Theory E** (Plug not loaded): Maybe the Plug binary isn't even in memory. We wrote a memory scanner that searches for the Plug's byte signature at boot. It's there, loaded correctly at 0x10069xxx.

**Theory Q** was a turning point. We'd been analyzing a binary at address 0x1014EA0A, carefully reverse-engineering its control flow, patching its branch instructions, tracing its device initialization handlers. Theories J through P were all about this binary. Then we found the strings ".EDisk" and "Mac OS 9.0b9" in it. It was the Mac OS system SCSI driver. Not MESA's Plug. We'd been patching the wrong code for days.

**Theory X** (emulation ops): SheepShaver has a mechanism for injecting custom instruction handlers into the 68k emulator. We patched the Plug's code to call one. Error type 12 -- illegal instruction. Emulation ops don't work in Mixed Mode's 68k context.

**Theory Y** (A-line traps): We installed a custom A-line trap handler. "SheepShaver Warning &Diamond;P." The PPC emulator intercepts unknown traps before the 68k dispatcher ever sees them.

**Theory Z** was the most illuminating failure. We wrote a 68k handler, installed it in the OS trap table at address 0x0624, placed a marker value at that address. Triggered MESA II's "Find Sampler" function. Read back the marker. Still zero. Mixed Mode completely bypasses the OS trap table.

### The Root Cause

Theories AG through AI finally revealed the architecture problem.

SheepShaver patches the PowerPC ROM at `rom_patches.cpp:1469` to disable the 68k exception table. This is necessary for boot -- SheepShaver uses emulation ops instead of real exception handlers for native 68k code during startup. But it breaks Mixed Mode.

The ROM's 68k interpreter has a fast path for A-line instructions (opcodes 0xA000-0xAFFF) that dispatches through the exception table at `r1+0x360`. With the exception table disabled, A-line traps in Mixed Mode are silently dropped. The Plug calls `$A089` (SCSI Manager dispatch), and nothing happens.

We tried restoring the exception table patch. Black screen on boot -- the exception table conflicts with the emulation ops that SheepShaver needs for native code.

We tried patching the per-opcode dispatch table in RAM at the correct address (0x50450448). Verified the write via readback. Entry still never reached -- the A-line fast path intercepts before the table dispatch.

This is an architectural conflict. SheepShaver's emulation model is fundamentally incompatible with Mixed Mode's exception-based A-line dispatch. Fixing one breaks the other.

After Theory AL, we stopped. Forty-four theories tested and disproven. The fundamental issue requires rewriting SheepShaver's Mixed Mode Manager -- not a weekend project.

## Act III: The Pivot

But the SheepShaver work wasn't wasted. We'd learned several critical things:

1. The SCSI Plug's 68k binary was fully extracted and mapped. We knew every function, every CDB, every string.
2. The network SCSI backend worked perfectly -- Mac OS could talk to real hardware over the network.
3. We had the Plug's function signatures from the THINK C name mangling: `SetSCSIMIDIMode`, `SMSendData`, `SMDataByteEnquiry`, `SMDispatchReply`, `SCSICommand`.

The question was no longer "how do we make MESA II run?" It was "do we even need MESA II?"

### The SCSI Plug Harness

The idea was radical in its simplicity: don't emulate Mac OS 9. Don't emulate SheepShaver. Just emulate the 68k CPU.

We built the `mesa-plug-harness` -- a standalone program that:

1. Embeds [Musashi](https://github.com/kstenerud/Musashi), a cycle-accurate Motorola 68000 emulator
2. Loads the raw 12KB SCSI Plug binary into emulated memory
3. Intercepts Mac OS traps (`$A089` for SCSI Manager) and forwards them to scsi2pi over TCP
4. Stubs out everything else (memory allocation, resource loading, dialog boxes) with minimal handlers

No Mixed Mode. No ROM patches. No trap dispatch tables. When the Plug's 68k code executes `$A089`, we catch it, extract the SCSI command parameters from the emulated registers, send the command to the real S3000XL via scsi2pi, and return the response.

### Four Hours

The entire protocol was reverse-engineered and implemented in a single evening.

**7:40 PM** -- First commit. 68k harness loads the Plug binary, Musashi runs the first instruction.

**8:31 PM** -- SCSI bridge connected. INQUIRY to S3000XL succeeds. We can see the device: `AKAI EMI / S3000XL SAMPLER / 2.00`.

**8:34 PM** -- Full MIDI-over-SCSI conversation working. The protocol is four SCSI commands:

| Step | CDB | Direction | Purpose |
|------|-----|-----------|---------|
| Init | `09 00 MM TT 00 00` | None | Activate MIDI-over-SCSI session |
| Send | `0C 00 HH MM LL FF` | Write | Send SysEx to sampler |
| Poll | `0D 00 00 00 00 FF` | Read (3 bytes) | Check for pending response (`00 HH LL`) |
| Read | `0E 00 HH MM LL FF` | Read | Retrieve buffered response |

**8:46 PM** -- Program and sample names decoded. Eight samples, one program on the device.

**9:19 PM** -- Standalone `s3k-client` CLI tool created. Can list, read, and display everything on the sampler.

**10:18 PM** -- SDS sample download working. Full audio pipeline: request sample via SDS Dump Request, receive header and data packets over SCSI, convert to WAV.

**10:42 PM** -- Write operations working. Read-modify-write cycle verified on real hardware: change a program name, read it back, it persists.

**10:49 PM** -- Upload and delete. Audio round-trip verified: upload a WAV, download it back, binary-identical PCM data (within 1 Hz sample rate rounding from SDS period encoding).

**11:02 PM** -- Program cloning. Discovered that the S3000XL requires a unique program name for creation -- if you send PDATA with a name that already exists, the device silently ignores it. This wasn't documented anywhere.

**11:31 PM** -- Complete. Read-modify-write for programs, keygroups, and miscellaneous device data. Full round-trip audio transfer. The protocol is fully understood.

## What We Learned

### The Protocol

The MIDI-over-SCSI protocol is elegant. Four vendor-specific SCSI commands wrap standard MIDI SysEx in a poll-based flow. The sampler buffers responses, and the initiator must actively poll (CDB `0x0D`) to check if data is waiting, then read it (CDB `0x0E`). There's no streaming -- each SysEx message is a discrete request-response cycle.

A critical detail from the Plug analysis: the flag byte in CDB `0x0C` (byte 5) must be `0x00` for sends, not `0x80`. And the device requires a drain-before-send pattern -- you must poll and read any leftover data from previous transfers before sending a new command, or the response buffers get corrupted.

### The MESA II Discovery

The most important finding from the MESA II binary analysis wasn't about MIDI-over-SCSI at all. We found this string in the Sampler Editor module:

> "Sample data can only be transferred if you are using SCSI to communicate with the sampler. You are currently using MIDI."

MESA II doesn't transfer sample waveform data via SysEx. Not via standard MIDI SDS, not via Akai's proprietary RSPACK. It reads and writes sample data directly from the Akai-formatted SCSI disks using native SCSI READ and WRITE commands. "SCSI" in that error message means block-level SCSI disk I/O, not the SysEx-over-SCSI channel.

This explained why we couldn't receive SDS Data Packets over SCSI -- the S3000XL firmware simply doesn't route them through the SCSI response buffer. It was never designed to. MESA II never needed it to.

### The Engineering Lesson

The month we spent fighting SheepShaver wasn't wasted time. It taught us the shape of the problem: the Plug's function signatures, the CDB structure, the trap calling conventions. Without that deep binary analysis, the four-hour harness implementation wouldn't have been possible.

But the real lesson is about knowing when to pivot. We spent weeks trying to make an entire operating system emulator do something its architecture fundamentally couldn't support. The solution was to throw away everything except the 12KB binary we actually needed and build a minimal harness around it.

Sometimes the best engineering is knowing what to subtract.

## What's Next

The complete MIDI-over-SCSI protocol is now implemented in the [audiocontrol](https://github.com/audiocontrol-org/audiocontrol) web editor. The S3000XL editor can read and write programs, keygroups, and sample headers over SCSI via the Raspberry Pi bridge.

For sample waveform data, we're following MESA II's lead: reading and writing directly to Akai-formatted SCSI disks over the network. The Pi serves the disk images, our browser-based Akai disk format parser reads the blocks, and the editor's disk browser lets you move samples between the Akai disks and your browser library. No SDS needed.

The `s3k-client` CLI tool from the harness project is [available on GitHub](https://github.com/audiocontrol-org/scsi2pi). It's a complete standalone Akai S3000XL client that talks to real hardware over SCSI-over-network. If you have a PiSCSI board and an Akai sampler, you can use it today.
