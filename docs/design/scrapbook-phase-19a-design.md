# Scrapbook — Phase 19a Design Brief

**Contract for implementation.** Design this first, code against it. If a spec below is ambiguous, the existing patterns in `src/shared/editorial-studio.css`, `src/shared/editorial-review.css`, and `src/sites/editorialcontrol/pages/index.astro` are the tiebreaker.

---

## 1. Direction

**Metaphor: the editor's clippings folder.** A scrapbook isn't a file browser or a CMS. It's the paper slip-folder that sits on the press-check desk next to the draft being marked up — tight-packed, typographically dense, honestly ephemeral. Every item in it is an offcut: a note, a data dump, a mined receipt, a reference image. The viewer reads like the desk itself: mono metadata, Fraunces italic headings, red-pencil accents on states that matter.

**Three moves carry the register:**

1. **Slip-shaped items.** Each scrapbook file renders as a slip — a dark card with a red perforation top-edge (reuse `.er-slip::before`'s repeating-linear-gradient pattern) + a meta row + a body that expands inline. Never a modal, never a full-page swap.
2. **Typographic filing.** File types are shown as tracked mono monograms (`MD / JSON / JS / IMG / ·`), not iconography. Item counts appear as `No. 01 / 12`. Kickers are `§ THE FOLDER`, `§ INDEX`. Every numeric display is tabular.
3. **Left-weighted reading column + right-edge index rail.** Same rhythm as the homepage's masthead + marginalia. The item stack lives in the reading column at max-width 44rem; the index rail on the right holds a jump-to list, totals, CRUD primary actions, and the folder path.

**What the user remembers:** a scrapbook page that looks like a typographer's research drawer — not a file manager. Every file reads as a slip of paper, every paper numbered, every state marked in red pencil.

---

## 2. Surface 1 — Viewer Layout

### 2.1 Overall grid

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [site-header: editorialcontrol.org — nav]                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  §  S C R A P B O O K                              [ I N D E X ]            │
│  Don't Write a Better Prompt. Ask                  socratic-coding-         │
│  the Agent What It Heard.                          agents                   │
│                                                    editorialcontrol         │
│  ← back to the desk                                                         │
│                                                    No. 01 README.md         │
│  ───────────────────────────────────────────       No. 02 patterns.json     │
│                                                    No. 03 mine-patterns.mjs │
│  § 01  MD  README.md                  2h ago ⋯    No. 04 all-corrections… │
│  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼                                         │
│  [ red perforation ]                                 4 items · 12.3 KB      │
│  ┌────────────────────────────────────────┐        last modified 2h ago    │
│  │ # Scrapbook: Don't Write a Better…    │                                 │
│  │                                        │        + new note               │
│  │ Research, receipts, and artifacts...  │        + upload file            │
│  │                                        │                                 │
│  │ ## Contents                           │        content/blog/            │
│  │ - `mine-patterns.mjs` — the Node …    │        socratic-coding-         │
│  │ ...                                   │        agents/scrapbook/        │
│  └────────────────────────────────────────┘                                 │
│                                                                             │
│  § 02  JSON  patterns.json             4h ago ⋯                            │
│  ▶ (collapsed — click to expand)                                            │
│                                                                             │
│  § 03  JS   mine-patterns.mjs          4h ago ⋯                            │
│  ▶ (collapsed)                                                              │
│                                                                             │
│  § 04  JSON  all-corrections.json      4h ago ⋯                            │
│  ▶ (collapsed)                                                              │
│                                                                             │
│  ────────────── drop a file here, or pick one ──────────────                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Grid specifics:**

```css
.scrapbook-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
  gap: clamp(2rem, 4vw, 4.5rem);
  align-items: start;
  max-width: 78rem;
  padding: 3rem clamp(1.5rem, 4vw, 3rem) 5rem;
  margin: 0 auto;
}
.scrapbook-reading { min-width: 0; }   /* prevents grid overflow from long code lines */
.scrapbook-index  { position: sticky; top: 5rem; align-self: start; }

@media (max-width: 820px) {
  .scrapbook-page { grid-template-columns: 1fr; }
  .scrapbook-index { position: static; }
}
```

Left column content width: natural. Slips inside cap at `max-width: 44rem` for markdown readability; code blocks + JSON can extend full width of the column (set per item body).

---

### 2.2 Header component

```
§  S C R A P B O O K                           ← back to the desk
Don't Write a Better Prompt. Ask the
Agent What It Heard.
socratic-coding-agents · editorialcontrol
```

- Kicker: `§ SCRAPBOOK` — JetBrains Mono 0.7rem, letter-spacing 0.14em, uppercase, `hsl(var(--primary))` (chartreuse). Leading `§ ` rendered as a separate span in muted-foreground for the mark.
- Article title: Fraunces italic, `font-variation-settings: 'opsz' 48, 'wght' 500`, `font-size: clamp(2rem, 4vw, 3rem)`, `line-height: 1.05`. Clickable → article's review page (`/dev/editorial-review/<slug>`).
- Meta line: JetBrains Mono 0.75rem, tracked 0.08em, muted-foreground. `<slug> · <site>`.
- Back link: `← back to the desk` — JetBrains Mono 0.75rem, tracked 0.1em uppercase, chartreuse. Hover underlines.

Header block spans both grid columns; the grid starts below it.

---

### 2.3 Item slip — collapsed state

```
§ 01  MD  README.md                                      2h ago  ⋯
```

Full-width inside the reading column. Reads as a single compact row at `padding: 0.9rem 1rem`. Horizontal hairline `border-top: 1px solid var(--border)` between items (no border on the first).

Anatomy, left to right:

1. **Sequence marker** `§ 01` — JetBrains Mono 0.72rem, tracked 0.08em, chartreuse. Fixed width 3rem column.
2. **Type glyph** `MD` — JetBrains Mono 0.72rem, tracked 0.14em, uppercase, color depends on type (see §5). Fixed width 3.5rem column.
3. **Filename** — JetBrains Mono 0.9rem, foreground, NOT uppercase. Flex: 1.
4. **Modified time** — JetBrains Mono 0.72rem, tracked 0.08em, muted-foreground, tabular-nums. Relative ("2h ago", "3d ago"). Fixed width ~5rem.
5. **Item menu** `⋯` — JetBrains Mono 1rem, muted-foreground. On hover reveals inline toolbar (no popup): `[edit] [rename] [delete]` — tracked-mono small buttons. See §2.7.

Collapsed slips have no body visible. Click anywhere on the row (except the ⋯ toolbar) toggles expand.

---

### 2.4 Item slip — expanded state

```
§ 01  MD  README.md                                      2h ago  [edit] [rename] [delete]
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  # Scrapbook: Don't Write a Better Prompt...

  Research, receipts, and artifacts that inform...

  ## Contents
  - `mine-patterns.mjs` — the Node script that...
  ...
```

- **Perforation** on expand: 3px-tall `repeating-linear-gradient` in `var(--er-red-pencil)` (matches `.er-slip::before`). Sits between the row and the body.
- **Body container:** `padding: 1.25rem 1rem 1.5rem 6.5rem` (left padding aligns body under the filename; sequence + type glyph stay in the gutter above).
- **Body max-width:** 44rem for markdown items; 100% (min 0) for JSON/code/image items.
- **Expand animation:** 180ms `ease-out`; `transform: translateY(-4px)` + `opacity: 0` → `translateY(0)` + `opacity: 1`. Respects `prefers-reduced-motion`.
- **Re-click the row** (or the `▼`/`▶` disclosure at the right edge) to collapse.

Body content renders differently by file type — see §4.

---

### 2.5 Sequence marker — the left rail

The `§ 01`, `§ 02`, `§ 03` markers function as a visible sequence rail down the left gutter. Sequence is derived from the CURRENT sort order (most recently modified first by default; clicking the "no. / modified / name" header in the index rail re-sorts).

Numbers are regenerated on reorder. Don't persist them.

---

### 2.6 Item menu (⋯)

Collapsed slip: the `⋯` sits at the far right, muted. Hover state on the slip reveals the toolbar — three tracked-mono mini-buttons:

```
[ edit ]   [ rename ]   [ delete ]
```

- Each button: JetBrains Mono 0.72rem, tracked 0.1em, uppercase. `padding: 0.2rem 0.5rem`. Border: 1px solid transparent at rest; on hover, `border-color: hsl(var(--primary) / 0.5)` + color chartreuse.
- `delete` gets a red-pencil color on hover (`color: var(--er-red-pencil)`).
- The `⋯` fades to transparent when the toolbar is revealed; reverses on mouse-out.

**Edit** opens the body in edit mode (see §2.7).
**Rename** replaces the filename cell with a mono input, focused (see §2.8).
**Delete** enters a two-step confirm state (see §2.9).

---

### 2.7 Edit — markdown inline edit

Clicking `[edit]` on a markdown slip:

1. Body transitions from rendered HTML → `<textarea>` containing the raw source. 160ms fade.
2. Textarea: JetBrains Mono 0.85rem, `padding: 1rem`, min-height 12rem, resizable (`resize: vertical`), background `var(--card)`, 1px border `var(--border)`. Full reading-column width.
3. Footer row appears: `[cancel]  [save →]` — cancel plain, save is the chartreuse primary button.
4. `Cmd/Ctrl+S` saves. `Esc` cancels (with confirm if dirty).
5. On save: 150ms flash of chartreuse on the left rail to indicate commit, then body re-renders.

Non-markdown files don't get `[edit]`. Only rename, delete, and (for images) "replace."

---

### 2.8 Rename — inline filename edit

Clicking `[rename]`:

1. Filename cell transitions from static text → `<input type="text">` with the current filename, selection positioned before the extension (so renaming `socratic-mining.md` preselects `socratic-mining` and leaves `.md` after the cursor).
2. Input: JetBrains Mono 0.9rem, `border-bottom: 1px dashed var(--border)`, no other borders. Background transparent. Focus: border-bottom solid chartreuse.
3. `Enter` → validate (valid filename chars, no collisions) → POST to rename endpoint → update in place.
4. `Esc` → cancel, revert.
5. If validation fails, border-bottom goes red-pencil and a 0.7rem mono hint appears under the input ("name taken" / "invalid chars").

---

### 2.9 Delete — two-step inline confirm

Clicking `[delete]`:

1. The slip header gets a red-pencil left rail (`border-left: 3px solid var(--er-red-pencil)`). The filename cell shifts right by 3px to accommodate.
2. The button row changes: `[confirm delete]  [cancel]` — confirm is red-pencil, cancel plain.
3. A 4-second countdown bar fills from right to left along the bottom of the slip (`height: 2px`, red-pencil). After 4 seconds with no click, the slip reverts to normal state.
4. Clicking `[confirm delete]` within the window → DELETE endpoint → slip transitions away (180ms slide-out left, fade to 0).
5. Cancel → revert to normal state.

No JS confirm dialog. No modal. The two-step is the guard.

---

### 2.10 Create — inline composer at the top

The marginalia rail has `+ new note` as a primary CRUD action. Click it:

1. A new composer slip slides in at the TOP of the item stack (180ms translateY + opacity). Auto-scrolls the stack so the composer is in view.
2. Composer layout:
   ```
   §  ✎  NEW  [filename.md]                                    [cancel] [save →]
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     (textarea — write the note here. markdown. cmd/ctrl+s to save.)
   ```
3. `§  ✎  NEW` is a kicker equivalent to the sequence marker on existing items — uses a different glyph so the slip is visually distinct until saved.
4. Filename input defaults to `note-<timestamp>.md` but focuses on save, not here — the user types the body first, fills the filename at save time.
5. Cancel → slide out.
6. Save → POST to create endpoint → on success, the composer slip transitions into a normal slip (the `§  ✎  NEW` becomes `§ 01`) and gets renumbered with the others.

---

### 2.11 Upload — drag-drop + picker

Two affordances:

**(a) Dedicated drop-zone at the bottom of the item stack:**

```
────────────── drop a file here, or pick one ──────────────
```

- Dashed hairline outline: `border: 1px dashed var(--border)`, `border-radius: 0`, `padding: 2rem 1rem`, text-align center.
- Center text: JetBrains Mono 0.78rem, tracked 0.12em, uppercase, muted.
- Click anywhere in the zone opens a file picker.

**(b) Full-page drop overlay when dragging a file anywhere on the page:**

- Triggered by `dragenter` on the `<body>` when `dataTransfer.types.includes('Files')`.
- Full-page overlay: `position: fixed; inset: 0; background: hsl(var(--background) / 0.92); pointer-events: none` (pointer-events off so the underlying content still receives the drop if needed).
- Center message in Fraunces italic 2.5rem: `drop to add to the scrapbook ◇`.
- Outer 24px dashed border in chartreuse (`border: 2px dashed hsl(var(--primary))`, inset 12px from viewport edges).
- Fade-in 120ms. On `dragleave`/`drop`: fade-out 120ms.

Both routes POST multipart to `/api/dev/scrapbook/upload` → on success, the new item slides in at the top (same transition as create-note).

Supported types: `image/*`, `application/json`, `text/*`. Reject silently-with-toast for unsupported types.

---

### 2.12 Marginalia rail (right column)

```
§  I N D E X
socratic-coding-agents
editorialcontrol

No. 01  README.md
No. 02  patterns.json
No. 03  mine-patterns.mjs
No. 04  all-corrections.json

─────────────────────

4 items · 12.3 KB
last modified 2h ago

─────────────────────

+ new note
+ upload file

─────────────────────

content/blog/
socratic-coding-agents/
scrapbook/
```

Specifics:

- Kicker `§ INDEX`: mono 0.7rem tracked 0.14em uppercase primary.
- Article slug line: mono 0.78rem muted-foreground.
- Site line: mono 0.75rem muted-foreground.
- Gap 1rem.
- Index list: `<ol>` no padding, tabular-nums. Each row: `No. 01 <filename>` with `No. 01` chartreuse and filename foreground. Click scrolls the item into view (`scrollIntoView({ behavior: 'smooth', block: 'start' })` + highlight flash). Hover underlines filename in chartreuse. Current-in-view item has a left-rail chartreuse bar (2px wide, `border-left`).
- Hairline rule (`<hr>` 1px border hsl(var(--border))) between blocks.
- Totals line: mono 0.78rem muted-foreground, tabular.
- Last modified: mono 0.75rem muted-foreground.
- Primary actions: two buttons stacked, full-width of the rail. Mono 0.78rem, tracked 0.08em, `padding: 0.55rem 0.75rem`, border 1px chartreuse at 0.4 alpha, background transparent. Hover: background chartreuse, text background. Matching the `.dispatch-cta` style from `pages/index.astro`.
- Folder path: mono 0.72rem muted-foreground, word-break break-all.

On mobile (<820px), the rail collapses to below the content; the jump-to-index list becomes a horizontal-scroll row of chips, and the CRUD buttons stay as two stacked buttons above the item stack.

---

### 2.13 Empty state

When the directory has no items other than a seed-`README.md` (or is completely empty):

```
§  S C R A P B O O K
[article title]
socratic-coding-agents · editorialcontrol

This scrapbook is empty. Write the first note,
or drop a file anywhere on this page.

[ + new note ]    [ + upload file ]

[drop-zone visible at bottom]
```

- Centered prose paragraph, Fraunces italic 1.1rem muted, max-width 36rem.
- Two primary buttons centered, same style as the marginalia CRUD buttons.
- The marginalia rail hides in empty state (nothing to index); grid becomes single-column.
- The drop-zone at the bottom of the content column stays visible.

---

## 3. Surface 2 — Studio calendar row chip

The existing calendar rows in `/dev/editorial-studio` use `.er-calendar-meta` chips. Add a new chip for the scrapbook.

### 3.1 Populated state

```
✓ feature image    scrapbook · 4 →
```

- Rendered as an `<a>` element with class `er-calendar-meta er-calendar-meta-scrapbook er-calendar-meta-link`.
- Text: `scrapbook · N →`
  - `scrapbook` — mono 0.68rem tracked 0.04em lowercase, muted-foreground.
  - `·` — separator, muted-foreground.
  - `N` — tabular-nums, `hsl(var(--primary))` chartreuse.
  - ` →` — trailing arrow, muted-foreground.
- At rest: transparent background, muted text.
- Hover: background highlight-soft (same as `.er-calendar-meta-baked`), border 1px solid 0.3-alpha chartreuse, arrow shifts 2px right (120ms ease-out `transform: translateX(2px)`).
- Click → navigates to `/dev/scrapbook/<site>/<slug>`.

### 3.2 Empty state

**Don't render the chip.** Scrapbooks get seeded at `/editorial-plan` time with a `README.md`, so the `count === 0` state should be rare. When it does occur, the chip is absent — the operator goes to the viewer via a different route (back-link from the article, or by typing the URL).

### 3.3 Position in the meta row

```
issue #68    2026-04-18    ✓ feature image    scrapbook · 4 →
```

Append to the existing meta-row. Order: left-to-right by edit-frequency (things that change a lot at the end). Scrapbook changes frequently once drafting starts → rightmost meta chip position.

---

## 4. File-type rendering

| Extension                       | Type glyph | Glyph color   | Body render                                                                                                                                                                     |
| ------------------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.md`, `.markdown`              | `MD`       | `foreground`  | Astro-rendered HTML via existing remark pipeline (strip-first-h1 NOT applied here — scrapbook notes can have titles). Editable.                                                  |
| `.json`, `.jsonl`, `.json.age`  | `JSON`     | `accent`      | Pretty-printed in a code block. Fold-depth toggle (`collapse all / expand all`) in the top-right of the body. `.jsonl` → array-of-objects pretty-print. `.age` → "encrypted — [open with age-decrypted preview]" link that runs decrypt server-side via endpoint. |
| `.js`, `.mjs`, `.ts`, `.tsx`    | `JS`       | `primary`     | Syntax-highlighted code block (shiki or prism — match existing `remark-rehype` config if one is in place).                                                                       |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | `IMG`      | `accent`      | Inline `<img>` preview, full reading-column width, with width/height/size line below. Click opens the existing lightbox (`src/shared/lightbox.ts`).                             |
| `.txt`, `.log`                  | `TXT`      | `muted`       | Monospace preformatted block, max-height 20rem with scroll.                                                                                                                     |
| Anything else                   | `·`        | `muted`       | Filename + "download →" link. No inline preview.                                                                                                                                |

**Glyph styling:**

```css
.scrapbook-item-type {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  line-height: 1;
  width: 3.5rem;          /* fixed width for alignment */
  display: inline-block;
  text-align: left;
}
.scrapbook-item-type--md   { color: hsl(var(--foreground)); }
.scrapbook-item-type--json { color: hsl(var(--accent)); }
.scrapbook-item-type--js   { color: hsl(var(--primary)); }
.scrapbook-item-type--img  { color: hsl(var(--accent)); }
.scrapbook-item-type--txt  { color: hsl(var(--muted-foreground)); }
.scrapbook-item-type--other{ color: hsl(var(--muted-foreground)); }
```

---

## 5. Typography scale

| Role                         | Font family             | Size           | Weight / features                                                 | Color                          |
| ---------------------------- | ----------------------- | -------------- | ----------------------------------------------------------------- | ------------------------------ |
| Page title (article)         | Fraunces                | clamp(2rem, 4vw, 3rem) | italic, opsz 48, wght 500, line-height 1.05                       | foreground                     |
| Section kicker (`§ SCRAPBOOK`) | JetBrains Mono          | 0.7rem         | uppercase, tracked 0.14em                                         | primary (chartreuse)           |
| Back-link                    | JetBrains Mono          | 0.75rem        | uppercase, tracked 0.1em                                          | primary                        |
| Meta line (slug · site)      | JetBrains Mono          | 0.75rem        | tracked 0.08em                                                    | muted-foreground               |
| Item sequence (`§ 01`)       | JetBrains Mono          | 0.72rem        | tracked 0.08em                                                    | primary                        |
| Item type glyph (`MD`)       | JetBrains Mono          | 0.72rem        | uppercase, tracked 0.14em                                         | per §4                         |
| Item filename                | JetBrains Mono          | 0.9rem         | tracked 0.04em, not uppercase                                     | foreground                     |
| Item mtime                   | JetBrains Mono          | 0.72rem        | tabular-nums, tracked 0.08em                                      | muted-foreground               |
| Item menu (`⋯`)              | JetBrains Mono          | 1rem           | —                                                                 | muted-foreground               |
| Toolbar buttons              | JetBrains Mono          | 0.72rem        | uppercase, tracked 0.1em                                          | muted (rest) / primary (hover) |
| Marginalia kicker            | JetBrains Mono          | 0.7rem         | uppercase, tracked 0.14em                                         | primary                        |
| Marginalia text              | JetBrains Mono          | 0.78rem        | tracked 0.04em                                                    | muted-foreground               |
| Marginalia count (`4`)       | JetBrains Mono          | 0.82rem        | tabular-nums, tracked 0.06em                                      | accent                         |
| Empty-state prose            | Fraunces                | 1.1rem         | italic                                                            | muted-foreground               |
| Drop-zone label              | JetBrains Mono          | 0.78rem        | uppercase, tracked 0.12em                                         | muted-foreground               |
| Drop-overlay center          | Fraunces                | 2.5rem         | italic, wght 500                                                  | primary                        |
| Body — markdown rendered     | Inter (or existing body)| 1.0rem         | line-height 1.6                                                   | foreground                     |
| Body — code blocks           | JetBrains Mono          | 0.85rem        | line-height 1.55                                                  | foreground                     |
| Hint (validation error)      | JetBrains Mono          | 0.7rem         | italic removed, tracked 0.08em                                    | `var(--er-red-pencil)`         |

Tokens reused from `src/sites/editorialcontrol/pages/index.astro`'s scheme — don't introduce new color tokens.

---

## 6. Color tokens (for reference)

```
--background        215 22%  7%   /* hsl, page bg */
--card              215 18% 11%   /* slip bg */
--card-hover        215 18% 14%
--foreground         40 20% 90%
--muted-foreground  215 10% 55%
--primary            74 82% 58%   /* chartreuse */
--accent             38 32% 82%   /* warm cream */
--border            215 14% 18%
--border-hover      215 14% 28%
--er-red-pencil     #BC3F32        /* editorial red */
```

Use `hsl(var(--primary) / 0.4)` for 40%-alpha borders; `hsl(var(--primary) / 0.12)` for very subtle bg tints.

---

## 7. Motion

All motion respects `prefers-reduced-motion: reduce` — `animation: none; transition: none;` on sensitive elements.

| Event                      | Duration | Easing      | Properties                                       |
| -------------------------- | -------- | ----------- | ------------------------------------------------ |
| Item expand                | 180ms    | ease-out    | `translateY(-4px)` → 0 + opacity 0 → 1           |
| Item collapse              | 140ms    | ease-in     | reverse of expand                                |
| Composer slide-in          | 200ms    | ease-out    | `translateY(-8px)` → 0 + opacity 0 → 1           |
| Composer save → slip fold  | 250ms    | ease-in-out | cross-fade body (0.85 → 1) + textarea-to-HTML swap |
| Toolbar reveal (hover)     | 120ms    | ease-out    | opacity 0 → 1 + `translateX(-2px)` → 0           |
| Button hover               | 120ms    | ease-out    | background, border, color                        |
| Index-rail active-item     | 100ms    | ease-out    | color + left-border width 0 → 2px                |
| Drop-overlay in/out        | 120ms    | ease-out    | opacity 0 ↔ 1                                    |
| Delete confirm countdown   | 4000ms   | linear      | `width: 100%` → 0% on a 2px bar                  |
| Delete slide-out           | 180ms    | ease-in     | `translateX(0)` → -12px + opacity 1 → 0          |

---

## 8. Accessibility notes

- The item header row (collapsed slip) is a `<button type="button">` spanning full width of the slip, with `aria-expanded`, `aria-controls` pointing to the body `<section>`. Click and Enter/Space both toggle.
- Focus outlines: `outline: 2px solid hsl(var(--primary)); outline-offset: 2px` on all interactive elements. Never `outline: none` without a visible replacement.
- The `⋯` menu + toolbar buttons are focusable by keyboard; toolbar doesn't require hover to open — focus-within on the slip reveals it.
- Drop-zone: keyboard-accessible fallback via `<input type="file">` linked to the label.
- Full-page drop overlay: `aria-hidden="true"` (decorative — the actual drop target is the body).
- Delete confirm: `aria-live="polite"` region announcing "press confirm within 4 seconds to delete X".
- Rename input: `aria-label="rename <old-filename>"`.
- Sequence numbers `§ 01` are `aria-hidden="true"` (decorative).
- All color combinations meet WCAG AA at 4.5:1 for body / 3:1 for large. Chartreuse on `--background` measures ~9:1 — safe.

---

## 9. Transition between surfaces

### 9.1 Studio row → viewer

Click `scrapbook · 4 →` on a studio row → `window.location.href = '/dev/scrapbook/<site>/<slug>'`. Standard full-page navigation; Astro handles the page transition via its default view transitions if enabled.

### 9.2 Viewer → studio

- Back link in the header (`← back to the desk`) → `/dev/editorial-studio`.
- Back link in marginalia index (below the site line): `← back to the desk` — duplicate for scroll convenience.
- Browser back also works normally.

### 9.3 Viewer → article review

- Clicking the article title in the viewer header → `/dev/editorial-review/<slug>` (if the article is drafted; hidden otherwise).
- Title is underlined on hover (1px, chartreuse).

### 9.4 Viewer → publicly rendered article

- No link. The scrapbook is dev-only; the published article is a separate mental context.

---

## 10. Open design questions (flag for implementer)

1. **.age file handling.** The scrapbook might contain encrypted session excerpts. Current proposal: show `"[ encrypted — preview ]"` link that hits a server-side decrypt endpoint. Confirm the decrypt endpoint is scoped to dev-only and rate-limited before shipping.
2. **Large images.** A 3MB PNG in the scrapbook could be bad. Propose: render via the existing Astro image pipeline (same as post figures), emit `srcset` for inline preview.
3. **Syntax highlighter choice.** If the repo doesn't already have shiki/prism set up, don't introduce a new dep — fall back to plain `<pre><code>` with mono font and accept the loss. Flag this at implementation.
4. **Sort persistence.** Default sort is most-recently-modified. Should the sort choice persist in localStorage? Probably yes; key on site+slug. Verify.
5. **Collapsed-state persistence.** Should each item remember its collapsed/expanded state across reloads? Proposed: yes, localStorage keyed on `scrapbook:<site>:<slug>:<filename>`. Default all-collapsed except the seed README.

---

## 11. File manifest for implementation

New files:

- `src/sites/editorialcontrol/pages/dev/scrapbook/[site]/[slug].astro` — the viewer page
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/list.ts` — GET directory contents
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/read.ts` — GET single file contents
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/create.ts` — POST new markdown note
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/save.ts` — POST update existing markdown
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/rename.ts` — POST rename
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/delete.ts` — POST delete
- `src/sites/editorialcontrol/pages/api/dev/scrapbook/upload.ts` — POST multipart upload
- `src/shared/scrapbook-client.ts` — client-side JS: expand/collapse, inline edit/rename/delete, drag-drop, index-rail scroll sync, localStorage state
- `src/shared/scrapbook.css` — all scrapbook-specific styles (viewer + studio chip)
- `scripts/lib/editorial/scrapbook.ts` — server-side helpers (path validation, dir listing, type classification, file operations)
- `test/editorial/scrapbook.test.ts` — unit tests for path validation (`..` rejection), type classification, filename validation

Modified files:

- `src/sites/editorialcontrol/pages/dev/editorial-studio.astro` — add the `scrapbook · N →` chip to each calendar row
- `src/shared/editorial-studio.css` — add `.er-calendar-meta-scrapbook` variant
- `.claude/skills/editorial-plan/SKILL.md` + (seed helper) — seed `scrapbook/README.md` at plan time

---

## 12. Summary for the implementer

Build the viewer like a typographer's slip-folder: red perforations on each slip, `§ 01 / § 02` sequence in the gutter, mono metadata everywhere, Fraunces italic only at the title. CRUD is inline-everywhere — no modals, no popups — edit expands the slip, rename swaps the filename cell, delete two-steps with a 4-second countdown bar, create slides in a composer at the top. The right rail is a tight press-check index (jump-to list + totals + two primary CRUD buttons + folder path). The studio chip is a single-line `scrapbook · N →` that matches the existing meta-chip register.

**Three hard rules:**
1. No modal.
2. Every glyph in the UI is typographic (`§ · ◇ → ⋯`), not iconographic.
3. Every numeric display is tabular-nums. Every count is rendered as `No. NN` or `N items`, never just `N`.

If a choice isn't covered here: pattern-match the existing editorial-review / editorial-studio CSS. If that pattern is ambiguous: default to the mono kicker + serif italic title shape. Be sparse before being busy.
