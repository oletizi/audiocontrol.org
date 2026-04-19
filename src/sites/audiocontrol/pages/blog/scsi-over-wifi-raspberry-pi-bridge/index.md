---
layout: ../../../layouts/BlogLayout.astro
title: "SCSI Over WiFi: Talking to Vintage Hardware from Your Phone"
description: "An open-source Raspberry Pi bridge that lets you send SCSI commands to vintage samplers and computers over HTTP and WebSocket -- no SCSI card required."
date: "April 2026"
datePublished: "2026-04-07"
dateModified: "2026-04-07"
author: "Orion Letizi"
image: "/images/scsi-over-wifi.png"
tags: ["SCSI", "Raspberry Pi", "Open Source", "PiSCSI"]
---

# SCSI Over WiFi: Talking to Vintage Hardware from Your Phone

<img src="/images/scsi-over-wifi.png" alt="SCSI Over WiFi — Talking to Vintage Hardware from Your Phone" />

If you own vintage SCSI hardware -- an Akai sampler, a Roland sampler, an old Mac, a SCSI hard drive -- you know the pain. Modern computers haven't had SCSI ports in twenty years. To connect to your gear, you need vintage Macs, SCSI-to-USB adapters (which are flaky and expensive), or elaborate workarounds involving floppy disks and prayer.

We built an open-source bridge that solves this. A Raspberry Pi with a [PiSCSI](https://github.com/PiSCSI/piscsi) board sits on the SCSI bus next to your vintage hardware. A small Rust daemon on the Pi exposes the SCSI bus over HTTP and WebSocket. Any device on your WiFi network -- a laptop, a phone, a browser -- can send SCSI commands to your vintage gear as easily as making an API call.

## How It Works

The system has three layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  Any Device on Your Network                                     │
│  ┌───────────────────────────────────────────┐                  │
│  │  Browser, curl, Python script, whatever   │                  │
│  └─────────────────────┬─────────────────────┘                  │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP / WebSocket
                         │ over WiFi
┌────────────────────────┼────────────────────────────────────────┐
│  Raspberry Pi          │                                        │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  scsi-midi-bridge (Rust daemon, port 7033)│                  │
│  └─────────────────────┬─────────────────────┘                  │
│                        │                                        │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  scsi2pi (SCSI bus controller)            │                  │
│  └─────────────────────┬─────────────────────┘                  │
│                        │                                        │
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  PiSCSI board (SCSI HAT)                  │                  │
│  └─────────────────────┬─────────────────────┘                  │
└────────────────────────┼────────────────────────────────────────┘
                         │ 50-pin SCSI ribbon cable
┌────────────────────────┼────────────────────────────────────────┐
│  ┌─────────────────────▼─────────────────────┐                  │
│  │  Your vintage SCSI hardware               │                  │
│  └───────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**[scsi2pi](https://www.scsi2pi.net/)** is the excellent open-source SCSI emulator for Raspberry Pi. It emulates SCSI hard drives, CD-ROMs, and other devices. It also exposes a protobuf API on port 6868 for programmatic control. We've extended it with the ability to execute arbitrary SCSI commands on the bus -- so the Pi can act as a SCSI initiator, sending commands to any device on the bus, not just emulating devices for other hosts.

**[scsi-midi-bridge](https://github.com/audiocontrol-org/audiocontrol/tree/main/services/scsi-midi-bridge)** is our Rust daemon that translates between HTTP (which anything on your network can speak) and scsi2pi's protobuf API (which requires a direct TCP connection to the Pi). It's a thin, fast translation layer that runs on the Pi alongside scsi2pi.

## What Can You Do With It?

### Read and write SCSI disks over the network

The bridge can execute generic SCSI commands, which means you can read and write disk blocks on any SCSI device on the bus. Got a vintage Mac hard drive you want to image? An old SCSI MO drive with irreplaceable data? Send a SCSI READ(10) from your laptop and get the raw blocks back over HTTP.

We took this a step further: we wrote a network SCSI backend for [SheepShaver](https://sheepshaver.cebix.net/) (a PowerPC Mac emulator) that forwards SCSI commands to the bridge over TCP. The result: Mac OS 9 running in a Docker container on an Apple Silicon Mac can mount SCSI disks connected to a Raspberry Pi on the other side of the network. Real SCSI commands -- INQUIRY, READ, WRITE -- traveling over WiFi. Mac OS sees real hard drives on its desktop. Reads and writes survive reboots.

This is how our [browser-based Akai disk browser](https://github.com/audiocontrol-org/audiocontrol) works -- it sends SCSI READ commands over HTTP, gets raw disk blocks back, and parses the Akai filesystem format entirely in the browser. No special drivers, no SCSI card, no vintage Mac required.

### Talk to any SCSI device

Any SCSI command you can construct, you can send. INQUIRY to identify a device. TEST UNIT READY to check if it's online. READ CAPACITY to find out how big a disk is. Vendor-specific commands for devices with proprietary protocols. If it speaks SCSI, the bridge can reach it.

```bash
# Check if the bridge and your device are alive
curl http://your-pi:7033/status
```

```json
{
  "version": "0.2.0",
  "scsi2piVersion": "6.2.1",
  "boardId": 7,
  "samplerReachable": true
}
```

### Send MIDI to an Akai sampler at SCSI speed

This is the use case we built the bridge for. The Akai S3000XL (and other S-series samplers) supports MIDI over SCSI -- standard MIDI SysEx messages transmitted over the SCSI bus at megabytes per second instead of MIDI's 31.25 kilobaud. The bridge daemon speaks this protocol natively.

```bash
# Request the list of resident sample names (Akai RSLIST command)
curl -X POST http://your-pi:7033/sds/send \
  -H "Content-Type: application/json" \
  -d '{"message": [240, 71, 0, 4, 72, 247]}'
```

```json
{
  "ok": true,
  "response": [240, 71, 0, 5, 72, 5, 0, ...]
}
```

That response is the sampler's complete sample list, arriving over WiFi in milliseconds instead of the seconds it would take over a MIDI cable.

For operations that require back-and-forth handshaking -- like transferring audio samples -- the bridge also provides a WebSocket endpoint (`ws://your-pi:7033/sds/stream`) for low-latency bidirectional streaming.

## Why We Built This

We're building [audiocontrol](https://audiocontrol.org) -- open-source web-based editors for vintage samplers. Our [Roland S-330 editor](https://audiocontrol.org/roland/s330/editor) and [S-550 editor](https://audiocontrol.org/roland/s550/editor) communicate over MIDI, but when we started building the Akai S3000XL editor, we needed something faster. MIDI transfers about 3 kilobytes per second. SCSI transfers megabytes per second. For loading multi-sample instruments with dozens of audio files, that's the difference between minutes and seconds.

The bridge daemon started as a single-purpose tool for our sampler editor, but it's really a general-purpose SCSI-over-HTTP gateway. Anything that can make an HTTP request can now talk to anything on a SCSI bus.

## What You Need

**Hardware:**
- A Raspberry Pi (3B+ or newer recommended)
- A [PiSCSI board](https://github.com/PiSCSI/piscsi) (also known as RaSCSI) -- the HAT that adds a 50-pin SCSI connector to the Pi
- A SCSI ribbon cable to connect the Pi to your vintage hardware

**Software:**
- Our [fork of scsi2pi](https://github.com/audiocontrol-org/scsi2pi) with the extended protobuf API (we're working on upstreaming these changes)
- The [scsi-midi-bridge](https://github.com/audiocontrol-org/audiocontrol/tree/main/services/scsi-midi-bridge) daemon

If you already have a PiSCSI setup running scsi2pi for disk image emulation (a common setup in the vintage Mac and sampler communities), adding the bridge daemon is straightforward -- it runs alongside scsi2pi without interfering with disk image serving.

## What's Next

We're working on packaging the bridge as a simple install-and-go systemd service, so you can `apt install` it on a Pi that's already running scsi2pi. We're also working on contributing our scsi2pi extensions back to the [upstream project](https://www.scsi2pi.net/) so the custom fork won't be necessary.

The long-term vision is that anyone with a PiSCSI board can expose their SCSI bus over the network with a single command, and any software on the network -- browsers, scripts, other tools -- can interact with the hardware as easily as calling a REST API.

If you're interested in contributing or have vintage SCSI hardware you'd like to test with, the code is all open source:

- **Bridge daemon:** [audiocontrol-org/audiocontrol/services/scsi-midi-bridge](https://github.com/audiocontrol-org/audiocontrol/tree/main/services/scsi-midi-bridge)
- **scsi2pi fork:** [audiocontrol-org/scsi2pi](https://github.com/audiocontrol-org/scsi2pi)
- **Akai MIDI-over-SCSI protocol reference:** [audiocontrol-org/mesa-plug-harness](https://github.com/audiocontrol-org/mesa-plug-harness)
