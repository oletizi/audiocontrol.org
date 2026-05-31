# Homepage Pilot — Static Code Recon

Scope: static-code recon of the audiocontrol homepage, `/editors`, `/hardware`, the `ProjectCard` component, `public/images/` conventions, and hero-count logic, to ground the `launching`-card pilot. All findings cited to source files; the live screenshot-viability probe is handled separately.

## File map

| Surface | Path |
| --- | --- |
| Homepage | `src/sites/audiocontrol/pages/index.astro` |
| Editors page | `src/sites/audiocontrol/pages/editors/index.astro` |
| Hardware page | `src/sites/audiocontrol/pages/hardware/index.astro` |
| ProjectCard | `src/sites/audiocontrol/components/ProjectCard.astro` |
| Images dir | `src/sites/audiocontrol/public/images/` (per-site `public/`, copied to web root `/images/...`) |
| OG generator | `scripts/generate-og-images.ts` |

Note: the audiocontrol site uses a per-site public dir at `src/sites/audiocontrol/public/`. Image references like `/images/s330-screenshot.png` resolve from that root. There is **no** repo-root `public/images/` for this site.

---

## 1. Homepage — `src/sites/audiocontrol/pages/index.astro`

### `Project` interface (index.astro:31-38)

```ts
interface Project {
  name: string;
  description: string;
  meta: string;
  status: 'available' | 'coming-soon';
  href?: string;
  image?: string;
}
```

Note the homepage's local `Project` interface marks `meta` as **required** (no `?`), whereas `ProjectCard`'s own `Props.meta` is optional. The homepage always supplies `meta`.

### `availableProjects` array (index.astro:40-56) — verbatim

```ts
const availableProjects: Project[] = [
  {
    name: 'Roland S-330',
    description: 'Rack-mount 12-bit digital sampler. Web editor with real-time hardware sync, patch browsing, and filter/envelope visualization.',
    meta: '1987 · 16-voice · 12-bit',
    status: 'available',
    href: '/roland/s330/editor',
    image: '/images/s330-screenshot.png',
  },
  {
    name: 'Roland S-550',
    description: 'The S-330’s bigger sibling — more memory, VGA output, same family. Shares the editor UI with an expanded feature set.',
    meta: '1987 · 16-voice · 16-bit',
    status: 'available',
    href: '/roland/s550/editor',
  },
];
```

- S-330: status `available`, href `/roland/s330/editor`, image `/images/s330-screenshot.png`.
- S-550: status `available`, href `/roland/s550/editor`, **NO `image` field** (renders the image-less ProjectCard variant). This is the card the `s550-thumbnail.jpg` could fill — see section 5.

### `pendingProjects` array (index.astro:58-77) — verbatim

```ts
const pendingProjects: Project[] = [
  {
    name: 'Akai S3000XL',
    description: 'The workhorse 90s rack sampler. MIDI-over-SCSI protocol reverse-engineered; editor under construction.',
    meta: '1994 · 32-voice · 16-bit',
    status: 'coming-soon',
  },
  {
    name: 'Akai S5000',
    description: 'Akai’s late-generation rack sampler with USB and 24-bit audio. Shared parameter model with the S6000.',
    meta: '1999 · 64-voice · 24-bit',
    status: 'coming-soon',
  },
  {
    name: 'Roland JV-1080',
    description: 'Rack synthesizer module with expansion board slots. Patch editor and librarian in early exploration.',
    meta: '1994 · 64-voice · synth',
    status: 'coming-soon',
  },
];
```

All three pending entries: status `coming-soon`, no `href`, no `image`.

### Rendering (index.astro:142-159)

- `availableProjects` → `.projects-grid--featured` (2-col at ≥720px), spread directly: `<ProjectCard {...project} />` (index.astro:143-145).
- `pendingProjects` → `.projects-grid--small` (3-col at ≥720px), same spread (index.astro:155-157).

---

## 2. `/editors` page — `src/sites/audiocontrol/pages/editors/index.astro`

### `Editor` interface (editors/index.astro:5-12)

```ts
interface Editor {
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  meta: string;
  slug?: string;     // NOTE: 'slug', not 'href'
  image?: string;
}
```

### `editors` array (editors/index.astro:14-48) — verbatim

```ts
const editors: Editor[] = [
  {
    name: "Roland S-330",
    description: "Web-based patch editor for the Roland S-330 12-bit sampler. Edit tones, patches, and performance settings directly in your browser via Web MIDI.",
    status: "available",
    meta: "12-bit · Web MIDI · Live sync",
    slug: "/roland/s330/editor",
    image: "/images/s330-screenshot.png",
  },
  {
    name: "Roland S-550",
    description: "Web-based editor for the Roland S-550 12-bit sampler. Shares the editor UI with the S-330 with an expanded feature set.",
    status: "available",
    meta: "12-bit · Web MIDI",
    slug: "/roland/s550/editor",
  },
  {
    name: "Akai S3000XL",
    description: "Web-based editor for the Akai S3000XL sampler. Edit programs, keygroups, and samples via MIDI-over-SCSI.",
    status: "coming-soon",
    meta: "16-bit · MIDI-over-SCSI",
  },
  {
    name: "Akai S5000",
    description: "Web-based editor for the Akai S5000/S6000 series samplers — 24-bit audio and USB transfer.",
    status: "coming-soon",
    meta: "24-bit · USB · SCSI",
  },
  {
    name: "Roland JV-1080",
    description: "Web-based patch editor for the Roland JV-1080 synthesizer module with expansion board support.",
    status: "coming-soon",
    meta: "Synth module · SysEx",
  },
];
```

### How it mirrors / diverges from the homepage

- **Same five devices, same `available` / `coming-soon` split** (S-330 + S-550 available; S3000XL, S5000, JV-1080 coming-soon).
- **Divergence — field name:** uses `slug` instead of `href`. The page maps it onto `ProjectCard`'s `href` prop explicitly (editors/index.astro:81: `href={editor.slug}`) rather than spreading. Coming-soon cards (editors/index.astro:95-103) deliberately omit `href`/`image` in the prop call.
- **Divergence — copy + meta strings differ.** The homepage uses era/voice/bit meta (`1987 · 16-voice · 12-bit`); `/editors` uses capability meta (`12-bit · Web MIDI · Live sync`). Descriptions are reworded. Any pilot that adds a `launching` card must update **both arrays** to keep them in sync — they are independent literals, not a shared source.
- **Same `image` story:** only S-330 carries `image: '/images/s330-screenshot.png'`; S-550 has none here too.
- Filtering: `available = editors.filter(status === 'available')`, `pending = filter(status === 'coming-soon')` (editors/index.astro:50-51).

---

## 3. `/hardware` page — `src/sites/audiocontrol/pages/hardware/index.astro`

Hardware uses a **different data model and a different card** (inline `<a class="hardware-card">`, not `ProjectCard`).

### `Device` interface (hardware/index.astro:4-12)

```ts
interface Device {
  name: string;
  description: string;
  year: string;
  format: string;
  slug: string;       // required here
  image?: string;
  tags?: string[];
}
```

### Devices listed (hardware/index.astro:14-48)

| name | year | format | slug | image | tags |
| --- | --- | --- | --- | --- | --- |
| Roland S-330 | 1987 | 1U Rack | `/roland/s330/` | `/images/s-330-feature.jpg` | 12-bit, Rack, S-Series |
| Roland S-550 | 1987 | 2U Rack | `/roland/s550/` | _(none)_ | 12-bit, Rack, S-Series |
| Roland S-770 | 1990 | 3U Rack | `/roland/s770/` | _(none)_ | 16-bit, Rack, S-Series |
| Roland W-30 | 1989 | Workstation | `/roland/w30/` | _(none)_ | 12-bit, Keyboard, S-Series |

- **S-330 and S-550 appear; S3000XL does NOT.** Hardware is Roland S-Series-only. S-770 and W-30 appear here but are absent from the homepage/editors lists.
- No `status` field at all — hardware cards are always links (`<a href={device.slug}>`), no available/coming-soon distinction.
- Only the S-330 carries a thumbnail image (`s-330-feature.jpg`); the other three render image-less.
- There is a `DeviceCard.astro` component in `src/sites/audiocontrol/components/` but the hardware index does **not** use it — it inlines its own `.hardware-card` markup.

---

## 4. `ProjectCard` component — `src/sites/audiocontrol/components/ProjectCard.astro`

### `Props` interface IN FULL (ProjectCard.astro:16-24)

```ts
interface Props {
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  href?: string;
  image?: string;
  /** Terse spec line rendered under the title. Example: "1987 · 16-VOICE · 12-BIT". */
  meta?: string;
}
```

**The `status` union has exactly two members:** `'available' | 'coming-soon'` (ProjectCard.astro:19). This is the type the pilot extends with a third member, `'launching'`.

### Status-driven rendering logic (ProjectCard.astro:26-31)

```ts
const { name, description, status, href, image, meta } = Astro.props;

const isAvailable = status === 'available';
const Tag = isAvailable ? 'a' : 'div';
const statusLabel = isAvailable ? 'Available' : 'Pending';
const cta = isAvailable ? 'Open Editor' : 'In development';
```

Every behavioral branch is a boolean derived from `isAvailable` (i.e. `status === 'available'`). Consequences for the two current states:

| Aspect | `available` | `coming-soon` |
| --- | --- | --- |
| Root tag | `<a>` (ProjectCard.astro:29) | `<div>` |
| `href` emitted | yes (`href={isAvailable ? href : undefined}`, line 36) | no |
| Status value text | "Available" (line 30) | "Pending" |
| CTA text | "Open Editor" (line 31) | "In development" |
| Dimension-bracket corners | rendered (4 spans, lines 38-45, gated on `isAvailable`) | not rendered |
| CSS class | `.is-available` (line 35) | `.is-coming-soon` |
| Visual treatment | full opacity, hover lift + amber glow + border + image zoom + amber CTA (lines 123-134, 160-163, 212-222, 266-268) | `opacity: 0.62`, `cursor: default`, muted status value (lines 136-139, 165-167) |
| `image` slot | rendered if `image` truthy (`.has-image`, lines 35, 47-51) | same conditional, but no card supplies an image |

The status panel-label always renders as `STATUS: <value>` (lines 54-57, with `:` appended via `.card-status-label::after`).

### Pilot impact note

Because every branch keys off `isAvailable` (a strict `=== 'available'` check), a new `'launching'` value will, **with no other change**, fall through to the coming-soon path: `<div>` tag, no href, "Pending" label, "In development" CTA, `.is-coming-soon` styling, no corners, 0.62 opacity. The pilot must add explicit handling (e.g. an `isLaunching` branch, new label/CTA strings, anchor-vs-div decision, and CSS class) rather than relying on the existing ternaries. The `class:list` (line 35) and the corner/CTA/Tag logic are the touch points.

---

## 5. `public/images/` conventions — `src/sites/audiocontrol/public/images/`

### `s550-thumbnail.jpg` — exists; "unused" claim VERIFIED (with nuance)

- **File exists:** `src/sites/audiocontrol/public/images/s550-thumbnail.jpg` (193,908 bytes, 660×385).
- **Referenced only in `scripts/generate-og-images.ts`**, twice, as an OG-image `backgroundImage`:
  - line 54 — blog OG for `blog-roland-s-series-samplers`.
  - line 73 — hardware OG for `roland-s550`.
- **NOT referenced as a card `image`** anywhere: not on the homepage S-550 card (which has no `image` field, index.astro:49-55), not on the `/editors` S-550 card (editors/index.astro:23-29), not on the `/hardware` S-550 card (hardware/index.astro:24-31). It is also absent from `netlify.toml`.
- **Conclusion:** the PRD's "unused" is accurate in the sense the pilot cares about — it is unused as a project/editor/hardware **card thumbnail**, despite being a healthy 660×385 asset already used for OG generation. It is the natural candidate to wire into the image-less S-550 card.

### Editor / project / device images present (sampler-relevant subset)

| File | Dims (px) | Format | Used as |
| --- | --- | --- | --- |
| `s330-screenshot.png` | 2282×1770 | PNG | S-330 card image (homepage + /editors); homepage OG background |
| `s-330-feature.jpg` | 2806×780 | JPG (wide banner) | S-330 hardware card image |
| `s330-thumbnail.jpg` | 2008×989 | JPG | S-330 hardware OG background |
| `s330-editor-thumbnail.jpg` | — | JPG | blog OG backgrounds |
| `s550-thumbnail.jpg` | **660×385** | JPG | OG only (see above) — **no card use** |
| `s770-thumbnail.jpg` | 615×327 | JPG | S-770 hardware OG background |
| `w30-thumbnail.jpg` | 1236×532 | JPG | W-30 hardware OG background |
| `mu-1*.jpg`, `rc-100*.jpg` | — | JPG | peripheral/blog imagery |
| `og/` (dir) | — | PNG | generated OG outputs (per-page) |

(No S3000XL / S5000 / JV-1080 images exist on disk — consistent with those being coming-soon, image-less cards.)

### Naming / size / format conventions observed

- **Naming:** kebab-case, device-prefixed: `s330-*`, `s550-*`, `s770-*`, `w30-*`. Two patterns coexist — terse `s330` and hyphenated `s-330` (e.g. `s-330-feature.jpg`). Suffixes encode role: `-screenshot` (editor UI capture, PNG), `-thumbnail` (compressed hero/OG source, JPG), `-feature` (wide banner crop, JPG), plus task-specific `-front-panel`, `-tone-editor`, etc.
- **Format:** PNG for sharp UI screenshots (`*-screenshot.png`, `*-home.png`); JPG for photographic / OG-source thumbnails.
- **Size:** no single enforced card dimension. Card slot is CSS-driven: `.card-image { height: 11rem; }` with `object-fit: cover` (ProjectCard.astro:88-108), so any aspect ratio crops to the panel. Thumbnails range from ~615px to ~2800px wide. `s550-thumbnail.jpg` (660×385, ~3:1.7) is comfortably above the rendered ~176px card height.
- **Reference path:** always web-absolute `/images/<name>` (resolved from the per-site `public/`), never an import.

---

## 6. Hero-count logic — `src/sites/audiocontrol/pages/index.astro`

### Computation (index.astro:81-82)

```ts
const availableCount = availableProjects.length;
const pendingCount = pendingProjects.length;
```

- `availableCount` = **length of the `availableProjects` array** (currently 2 → S-330, S-550).
- `pendingCount` = **length of the `pendingProjects` array** (currently 3 → S3000XL, S5000, JV-1080).
- Counts are **array lengths, not status filters.** Membership is determined purely by which literal array an entry sits in; the per-entry `status` field is consumed only by `ProjectCard`, not by the counters. (Contrast `/editors`, which derives its split via `.filter(status === ...)`.)

### Render (index.astro:117-134)

```astro
<dl class="hero-stats">
  <div>
    <dt>Available</dt>
    <dd>{availableCount.toString().padStart(2, '0')}</dd>
  </div>
  <div>
    <dt>In development</dt>
    <dd>{pendingCount.toString().padStart(2, '0')}</dd>
  </div>
  <div><dt>Stack</dt><dd>Open source · Web-native</dd></div>
  <div><dt>Install</dt><dd>None</dd></div>
</dl>
```

- Both numbers are zero-padded to 2 digits (`padStart(2, '0')`): currently displays **"02"** available, **"03"** in development.
- The hero "Open S-330 Editor" primary CTA hard-codes `/roland/s330/editor` (index.astro:107) and is independent of the counts.

### Honesty constraint for the pilot

A `launching` card is, by definition, neither "available today" (it would inflate the Available count and imply an openable editor) nor purely "in development." Because `availableCount`/`pendingCount` are raw array lengths:

- Dropping a `launching` entry into `availableProjects` would bump "Available" to "03" — dishonest (the editor isn't openable yet).
- Dropping it into `pendingProjects` would bump "In development" — defensible but conflates "launching soon" with "early exploration."

To keep the hero honest the pilot should either introduce a dedicated `launchingProjects` array (and decide whether/how it feeds a third hero stat or stays uncounted), or compute the hero counts from explicit status filters so a `launching` entry is counted under whichever bucket the design intends — not silently absorbed by an array length. This is the load-bearing decision point at index.astro:81-82 and 117-134.
