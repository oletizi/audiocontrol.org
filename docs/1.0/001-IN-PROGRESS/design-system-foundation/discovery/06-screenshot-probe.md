# Discovery 06 — Screenshot-Viability Probe

Scope: live, hands-on probe (Playwright) of whether the S-330 / S-550 editors render a
populated UI without hardware, plus a best-effort assessment of running
`modules/akai-s3k-editor` locally for an Akai S3000XL shot. Evidence screenshots are in
`./probe-evidence/`.

## How the Roland editors are served

- Both `/roland/s330/editor` and `/roland/s550/editor` proxy (HTTP 200 rewrite, `force`) to
  the **same** backing app: `https://roland-sxx0-editor.netlify.app/`
  (`src/sites/audiocontrol/public/_redirects`). Device identity is **path-driven** — the same
  bundle renders "S-330 Editor" vs "S-550 Editor" based on the URL prefix.
- **Critical gotcha for screenshotting:** the app is built with base path
  `/roland/s330/editor/` (resp. `/s550`). Loading the **bare** netlify URL
  (`roland-sxx0-editor.netlify.app`) fails — its `assets/*.js|css` resolve to
  `/roland/s330/editor/assets/…`, which the netlify app returns as the SPA `index.html`
  fallback (`text/html`), tripping strict-MIME errors and rendering a blank page. **Screenshots
  must be taken via the production proxy path** `https://audiocontrol.org/roland/s330/editor`
  (verified rendering correctly), not the raw netlify origin.

## Does the editor render a *populated* UI without hardware?

**Renders fully, but the data views are gated.** Without a connected device:

| Tab | State without hardware | Screenshot-viable? |
|---|---|---|
| **CONNECT** (default) | Polished: virtual front-panel control surface (MODE/MENU/SUB-MENU/arrows/COM/EXEC/±), a phosphor "STATUS: Connecting… · Transport: Web MIDI API · Device: S-330" display, and a Reference/Help/Setup details panel (Connection details · Setup guide · Troubleshooting). | **Yes — best option.** On-brand, visually rich, honest. |
| PLAY / PATCHES / TONES / LIBRARY | Empty "Not Connected" placeholder: e.g. *"Connect to your S-330 to view and edit patches."* + a **GO TO CONNECTION** button. No demo/mock data. | No — empty states only. |

There is **no offline/demo data mode**: every data tab requires a live MIDI handshake. The
only attractive populated-looking screen reachable without hardware is the **CONNECT tab**,
which is genuinely handsome (front-panel chrome + status readout + reference panel).

Evidence: `probe-evidence/s330-connect-state.png`, `s550-connect-state.png` (CONNECT, both
devices, identical layout with device-specific labels); `s330-patches-state.png`,
`s330-library-state.png` (the gated empty states).

### Implication for Phase 4 (Task 2 — screenshots)

- S-330 and S-550 fresh screenshots are **viable now** from the CONNECT tab via the production
  proxy path — no hardware required. They show the front-panel + connect UI, not populated
  patch/sample data. This is honest and consistent with "enhanced support without trumpeting."
- Capturing **populated** patch/tone/library screenshots would require a connected S-330/S-550
  (real hardware over Web MIDI) — out of scope for this feature. Do **not** fabricate a
  populated view (no mock data — repo rule).
- Because both share one app, the two cards' screenshots will look near-identical apart from
  the "S-330"/"S-550" labels. Worth an operator decision: ship both CONNECT shots, or
  differentiate (e.g. one CONNECT + one of a different tab's empty state) — flagged, not decided.

## Akai S3000XL — can `modules/akai-s3k-editor` run locally?

Module: `/Users/orion/work/audiocontrol-work/audiocontrol/modules/akai-s3k-editor`
(the sibling monorepo; **not** in this repo).

- **Tooling:** Vite app — `npm run dev` (`vite`), `npm run build` (`tsc && vite build`),
  `npm run preview`. `node_modules` is present in the module.
- **Dependencies:** eight `@audiocontrol/*` `workspace:*` packages (editor-core, loop-editor,
  midi-core, sample-chopper, sample-editor, sampler-devices, sampler-library, synth-core) —
  so a clean run needs the **monorepo workspace installed**, not just the module.
- **Assessment:** locally runnable **best-effort** via `vite` from the monorepo
  (`cd modules/akai-s3k-editor && npm run dev`). Whether it renders a populated UI without
  Akai hardware is **unverified** here (not launched) — the Roland editors gate their data
  views behind a live device, so the S3000XL editor likely does too. There are hardware-only
  e2e configs (`playwright.scsi-midi.config.ts`, `playwright.http-midi.config.ts`,
  `test:e2e:hardware`), reinforcing that real device interaction is hardware-gated.
- **Per PRD/workplan:** S3000XL screenshot is explicitly **best-effort; else promote without an
  image (never a mock).** Given the deploy is out of scope (no live `/akai/s3000xl/editor`
  proxy yet) and a populated shot likely needs hardware, the realistic Phase-4 path is to
  promote S3000XL to the `launching` state **without an image** unless a local `vite` run
  happens to yield a presentable empty/connect screen.

## Probe summary

- Roland editors: live, render via the **production proxy path only**; CONNECT tab is the
  screenshot-viable populated-looking view; data tabs are hardware-gated empty states; S-330 &
  S-550 share one path-driven app.
- Akai S3000XL: module is a Vite app, locally runnable best-effort from the monorepo workspace;
  populated UI without hardware unverified and unlikely; plan for image-less `launching`
  promotion as the safe default.

Searched: live probe of `audiocontrol.org/roland/{s330,s550}/editor` + tabs (CONNECT/PATCHES/LIBRARY), bare netlify origin, and `modules/akai-s3k-editor` package.json/config inspection — 6 navigations + 1 module inspection
Included: probe-evidence/{s330-connect-state,s550-connect-state,s330-patches-state,s330-library-state}.png; src/sites/audiocontrol/public/_redirects:1; ../../../../../audiocontrol-work/audiocontrol/modules/akai-s3k-editor/package.json:1
Excluded: akai-s3k-editor live-run:1 — not launched; populated-without-hardware is unverifiable without an actual dev-server run + device, and the safe Phase-4 default (image-less launching promotion) does not depend on it
