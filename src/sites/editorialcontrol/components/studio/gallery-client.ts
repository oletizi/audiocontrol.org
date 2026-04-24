/*
 * Client-side driver for /dev/studio.
 *
 * Server renders the shell (kickers, section headers). This module
 * populates the timeline from /api/dev/feature-image/log and the
 * workflow tab sticker from /api/dev/feature-image/workflow, wires
 * up card actions (focus, approve, reject, rate, archive), and
 * handles workflow activation (stored in localStorage so other
 * studio routes share the active context).
 *
 * Approve wires through window.studioTape (Commit 2) — the
 * operator gets live elapsed + EMA-driven ETA for the three-format
 * bake.
 */

interface LogEntry {
  id: string;
  timestamp: string;
  prompt?: string;
  title?: string;
  subtitle?: string;
  provider?: string;
  preset?: string;
  filters?: string;
  formats?: string;
  duration_ms?: number;
  durationMs?: number;
  status?: 'generated' | 'approved' | 'rejected';
  rating?: number;
  templateSlug?: string;
  parentEntryId?: string;
  site?: 'audiocontrol' | 'editorialcontrol';
  appliedTo?: string;
  archived?: boolean;
  overlayPosition?: string;
  overlayAlign?: string;
  outputs?: {
    raw?: string[];
    filtered?: string[];
    composited?: Array<{ provider: string | null; format: string; path: string }>;
  };
  notes?: string;
}

interface WorkflowItem {
  id: string;
  type: string;
  state: string;
  createdAt: string;
  context: {
    postPath?: string;
    slug?: string;
    site?: 'audiocontrol' | 'editorialcontrol';
    title?: string;
    description?: string;
    suggestedPrompt?: string;
  };
}

const ACTIVE_WF_KEY = 'fi-studio-active-workflow';
const ARCHIVED_TOGGLE_KEY = 'fi-studio-show-archived';
const POLL_INTERVAL_MS = 6000;

// ── Utilities ────────────────────────────────────────────────────────

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDuration(ms: number | undefined): string {
  if (!ms || !isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  return `${s.toFixed(1)}s`;
}

// ── State ────────────────────────────────────────────────────────────

let entries: LogEntry[] = [];
let workflows: WorkflowItem[] = [];
let showArchived = readArchivedToggle();
let activeWorkflowId: string | null = readActiveWorkflowId();

function readArchivedToggle(): boolean {
  try {
    return localStorage.getItem(ARCHIVED_TOGGLE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeArchivedToggle(value: boolean): void {
  try {
    localStorage.setItem(ARCHIVED_TOGGLE_KEY, value ? '1' : '0');
  } catch {
    /* noop */
  }
}

function readActiveWorkflowId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_WF_KEY);
  } catch {
    return null;
  }
}

function writeActiveWorkflowId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_WF_KEY, id);
    else localStorage.removeItem(ACTIVE_WF_KEY);
  } catch {
    /* noop */
  }
  activeWorkflowId = id;
}

// ── Fetchers ─────────────────────────────────────────────────────────

async function fetchEntries(): Promise<LogEntry[]> {
  const res = await fetch('/api/dev/feature-image/log');
  if (!res.ok) throw new Error(`GET /log: ${res.status}`);
  const data = (await res.json()) as { entries: LogEntry[] };
  return data.entries ?? [];
}

async function fetchOpenWorkflows(): Promise<WorkflowItem[]> {
  const res = await fetch('/api/dev/feature-image/workflow?state=open');
  if (!res.ok) throw new Error(`GET /workflow: ${res.status}`);
  const data = (await res.json()) as { items: WorkflowItem[] };
  return data.items ?? [];
}

// ── Rendering: workflow tab ──────────────────────────────────────────

function renderWorkflowPanel(): void {
  const badge = document.querySelector<HTMLElement>('[data-wf-badge]');
  const list = document.querySelector<HTMLElement>('[data-wf-list]');
  const tab = document.querySelector<HTMLElement>('[data-wf-tab]');
  if (!badge || !list || !tab) return;

  const count = workflows.length;
  if (count > 0) {
    badge.textContent = String(count);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }

  const hasActive = activeWorkflowId !== null && workflows.some(w => w.id === activeWorkflowId);
  tab.setAttribute('data-has-active', hasActive ? 'true' : 'false');

  if (count === 0) {
    list.innerHTML = '<p class="studio-wf-tab__empty">No pending workflows.</p>';
    return;
  }

  list.innerHTML = workflows
    .map((wf) => {
      const isActive = wf.id === activeWorkflowId;
      const site = wf.context.site ?? 'audiocontrol';
      const title = wf.context.title ?? '(untitled workflow)';
      const path = wf.context.postPath ?? '';
      return `
        <article class="studio-wf-item" data-active="${isActive}" data-wf-id="${wf.id}">
          <h3 class="studio-wf-item__title">${htmlEscape(title)}</h3>
          <div class="studio-wf-item__meta">
            <span class="studio-readout studio-readout--inline">
              <span class="studio-readout__kicker">Type</span>
              <span class="studio-readout__value">${htmlEscape(wf.type)}</span>
            </span>
            <span class="studio-readout studio-readout--inline">
              <span class="studio-readout__kicker">Site</span>
              <span class="studio-readout__value">${htmlEscape(site)}</span>
            </span>
            <span class="studio-readout studio-readout--inline">
              <span class="studio-readout__kicker">ID</span>
              <span class="studio-readout__value">${wf.id.slice(0, 8)}</span>
            </span>
          </div>
          ${path ? `<div class="studio-wf-item__path">${htmlEscape(path)}</div>` : ''}
          <div class="studio-wf-item__actions">
            ${isActive
              ? `<button type="button" class="studio-btn" data-wf-action="deactivate" data-wf-id="${wf.id}">Deactivate</button>`
              : `<button type="button" class="studio-btn studio-btn--primary" data-wf-action="activate" data-wf-id="${wf.id}">Activate</button>`
            }
            <button type="button" class="studio-btn studio-btn--danger" data-wf-action="cancel" data-wf-id="${wf.id}">Cancel</button>
          </div>
        </article>
      `;
    })
    .join('');
}

// ── Rendering: gallery timeline ──────────────────────────────────────

function renderEntriesCount(): void {
  const entriesCountEl = document.querySelector<HTMLElement>('[data-entries-count]');
  const archivedCountEl = document.querySelector<HTMLElement>('[data-archived-count]');
  const toggleBtn = document.querySelector<HTMLButtonElement>('[data-archived-toggle]');
  const toggleLabel = document.querySelector<HTMLElement>('[data-archived-toggle-label]');

  const active = entries.filter(e => !e.archived);
  const archived = entries.filter(e => e.archived);

  if (entriesCountEl) entriesCountEl.textContent = String(active.length);
  if (archivedCountEl) archivedCountEl.textContent = String(archived.length);
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', showArchived ? 'true' : 'false');
  }
  if (toggleLabel) {
    toggleLabel.textContent = showArchived ? 'Hide archived' : 'Show archived';
  }
}

function cardHtml(entry: LogEntry): string {
  const composited = entry.outputs?.composited ?? [];
  const thumb = composited[0]?.path ?? entry.outputs?.filtered?.[0] ?? entry.outputs?.raw?.[0];
  const target = entry.site ?? 'audiocontrol';
  // The card-local target color: chartreuse for editorialcontrol, amber
  // for audiocontrol. Lets the card's stamp read the card's target
  // independently of the page-level --studio-target variable.
  const cardTargetHsl = target === 'editorialcontrol' ? '74 82% 58%' : '35 95% 62%';
  const status = entry.status ?? 'generated';
  const title = entry.title ?? '';
  const prompt = entry.prompt ?? '';
  const timeLabel = formatTime(entry.timestamp);
  const durationMs = entry.durationMs ?? entry.duration_ms;
  const rating = entry.rating ?? 0;

  const ratingHtml = [1, 2, 3, 4, 5]
    .map((n) => `
      <button
        type="button"
        data-action="rate"
        data-rating="${n}"
        class="${rating >= n ? 'on' : ''}"
        title="Rate ${n}/5"
      >★</button>
    `)
    .join('');

  const statusStampLabel = status === 'approved'
    ? '✓ Approved'
    : status === 'rejected'
      ? '✗ Rejected'
      : 'Generated';

  const statusStampClass = `studio-stamp studio-stamp--${status}`;

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  const approveBtn = isApproved
    ? `<button type="button" class="studio-btn" disabled>Approved ✓</button>`
    : `<button type="button" class="studio-btn studio-btn--primary" data-action="approve">Approve</button>`;

  const rejectBtn = isRejected
    ? `<button type="button" class="studio-btn" disabled>Rejected ✗</button>`
    : `<button type="button" class="studio-btn studio-btn--danger" data-action="reject">Reject</button>`;

  // Apply button — only surfaces on approved entries that are neither
  // archived nor already applied. `scan.ts` filters out archived +
  // appliedTo entries; the card UI has to match or clicking Apply
  // produces "nothing pending" since there's nothing left to drain.
  // Applied entries show a disabled "Applied ✓" stamp instead so the
  // process-motion affordance still reads end-to-end.
  const isApplied = Boolean(entry.appliedTo);
  const isArchived = Boolean(entry.archived);
  const applyBtn = !isApproved
    ? ''
    : isApplied
      ? `<button type="button" class="studio-btn" disabled title="applied to ${entry.appliedTo}">Applied ✓</button>`
      : isArchived
        ? ''
        : `<button type="button" class="studio-btn studio-btn--primary studio-copy-btn" data-action="copy-apply" data-copy="/feature-image-apply" title="copy /feature-image-apply to clipboard — run in Claude Code to bake files into the post">Apply →</button>`;

  const archiveLabel = entry.archived ? 'Restore' : 'Archive';

  return `
    <article
      class="studio-card studio-regmark"
      data-id="${entry.id}"
      data-status="${status}"
      data-archived="${entry.archived ? 'true' : 'false'}"
      data-card-target="${target}"
      style="--card-target: ${cardTargetHsl};"
    >
      <div class="studio-card__thumb">
        ${thumb
          ? `<img src="${htmlEscape(thumb)}" alt="${htmlEscape(title)}" loading="lazy" />`
          : `<div class="studio-card__thumb-empty">No output</div>`
        }
        <span class="studio-stamp studio-stamp--target studio-card__target" data-studio-target-label-static>
          ${htmlEscape(target.toUpperCase())}
        </span>
      </div>

      <div class="studio-card__body">
        <header class="studio-card__head">
          <h2 class="studio-card__title ${title ? '' : 'studio-card__title--empty'}">
            ${title ? htmlEscape(title) : '(no title)'}
          </h2>
          <time class="studio-card__timestamp" datetime="${entry.timestamp}">${timeLabel}</time>
        </header>

        <div class="studio-card__meta">
          ${entry.provider ? `<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Provider</span><span class="studio-readout__value">${htmlEscape(entry.provider)}</span></span>` : ''}
          ${entry.preset ? `<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Preset</span><span class="studio-readout__value">${htmlEscape(entry.preset)}</span></span>` : ''}
          ${entry.templateSlug ? `<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Tpl</span><span class="studio-readout__value">${htmlEscape(entry.templateSlug)}</span></span>` : ''}
          ${durationMs !== undefined ? `<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Dur</span><span class="studio-readout__value">${formatDuration(durationMs)}</span></span>` : ''}
        </div>

        ${prompt ? `<p class="studio-card__prompt">${htmlEscape(prompt)}</p>` : ''}

        <footer class="studio-card__footer">
          <div class="studio-card__actions">
            <a class="studio-btn" href="/dev/studio/focus/${entry.id}">Focus →</a>
            ${approveBtn}
            ${rejectBtn}
            ${applyBtn}
          </div>
          <div class="studio-card__status-row">
            <div class="studio-card__rating">${ratingHtml}</div>
            <span class="${statusStampClass}">${status === 'approved' ? '<span class="studio-stamp__led" aria-hidden="true"></span>' : ''}<span>${statusStampLabel}</span></span>
            <div class="studio-card__overflow" data-open="false">
              <button
                type="button"
                class="studio-card__overflow-btn"
                data-action="overflow-toggle"
                aria-haspopup="true"
              >⋯</button>
              <div class="studio-card__overflow-menu">
                <button type="button" data-action="archive-toggle">${archiveLabel}</button>
                <button type="button" data-action="copy-input">Copy as input</button>
                <button type="button" data-action="save-template">Save as template</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </article>
  `;
}

function renderTimeline(): void {
  const mount = document.querySelector<HTMLElement>('[data-timeline]');
  if (!mount) return;

  const visible = showArchived
    ? entries
    : entries.filter(e => !e.archived);

  if (visible.length === 0) {
    mount.innerHTML = `
      <div class="studio-gallery__empty">
        <span class="studio-kicker studio-kicker--muted">Empty journal</span>
        <p>${showArchived ? 'No archived entries.' : 'No entries yet. Open Generate to kick off a run.'}</p>
      </div>
    `;
    mount.setAttribute('aria-busy', 'false');
    return;
  }

  const byDay = new Map<string, LogEntry[]>();
  // Reverse-chronological: iterate newest-first
  const sorted = [...visible].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  for (const entry of sorted) {
    const key = dayKey(entry.timestamp);
    const bucket = byDay.get(key) ?? [];
    bucket.push(entry);
    byDay.set(key, bucket);
  }

  const days = [...byDay.entries()].map(([key, bucket]) => {
    const dayLabel = formatDayLabel(bucket[0].timestamp);
    return `
      <section class="studio-day" data-day="${key}">
        <header class="studio-day__head">
          <span class="studio-kicker">${htmlEscape(dayLabel)}</span>
          <span class="studio-day__rule" aria-hidden="true"></span>
          <span class="studio-day__num">${bucket.length} / ${visible.length}</span>
        </header>
        <div class="studio-day__entries">
          ${bucket.map(cardHtml).join('')}
        </div>
      </section>
    `;
  });

  mount.innerHTML = days.join('');
  mount.setAttribute('aria-busy', 'false');
}

// ── Interactions: card actions ───────────────────────────────────────

async function rateEntry(id: string, rating: number): Promise<void> {
  const res = await fetch('/api/dev/feature-image/log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, rating }),
  });
  if (!res.ok) {
    console.error('rate failed', res.status);
    return;
  }
  // Optimistic local update + re-render
  const entry = entries.find(e => e.id === id);
  if (entry) entry.rating = rating;
  renderTimeline();
}

async function setStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const res = await fetch('/api/dev/feature-image/log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) {
    console.error('setStatus failed', res.status);
    return;
  }
  const entry = entries.find(e => e.id === id);
  if (entry) entry.status = status;
  renderTimeline();
}

async function toggleArchive(id: string): Promise<void> {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  const next = !entry.archived;
  const res = await fetch('/api/dev/feature-image/log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, archived: next }),
  });
  if (!res.ok) {
    console.error('archive failed', res.status);
    return;
  }
  entry.archived = next;
  renderTimeline();
}

async function approveEntry(entry: LogEntry): Promise<void> {
  if (!window.studioTape || window.studioTape.isActive()) return;

  const site = entry.site ?? 'audiocontrol';
  const filters = (() => {
    if (!entry.filters) return undefined;
    try { return JSON.parse(entry.filters) as Record<string, string>; }
    catch { return undefined; }
  })();

  // Active workflow (if any) — Approve will submit this as the decision.
  const activeWf = activeWorkflowId ? workflows.find(w => w.id === activeWorkflowId) : null;

  const stages = [
    { label: 'Bake og', estimateMs: 2400 },
    { label: 'Bake youtube', estimateMs: 2200 },
    { label: 'Bake instagram', estimateMs: 2200 },
    { label: 'Mark approved', estimateMs: 300 },
  ];
  if (activeWf) {
    stages.push({ label: 'Submit decision', estimateMs: 300 });
  }

  let cancelled = false;
  window.studioTape.start({
    key: 'studio-approve-3-formats',
    operation: `Approve · ${entry.title ?? entry.id.slice(0, 8)}`,
    stages,
    cancelable: true,
    onCancel: () => {
      cancelled = true;
    },
  });

  try {
    // Stage 1-3: bake three formats via recomposite (single call produces all three)
    const bakeRes = await fetch('/api/dev/feature-image/recomposite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sourceEntryId: entry.id,
        title: entry.title,
        subtitle: entry.subtitle,
        preset: entry.preset,
        filters,
        overlay: true,
        overlayPosition: entry.overlayPosition,
        overlayAlign: entry.overlayAlign,
        site,
        formats: ['og', 'youtube', 'instagram'],
        includeFilteredVariant: true,
      }),
    });
    if (cancelled) return;
    if (!bakeRes.ok) {
      const text = await bakeRes.text();
      window.studioTape.fail(`bake ${bakeRes.status}: ${text.slice(0, 60)}`);
      return;
    }
    const baked = (await bakeRes.json()) as { entry: LogEntry };
    const canonical = baked.entry;

    // Advance across bake stages (we know all three baked in one call; show them as a single tick)
    window.studioTape.advance(); // og → yt
    await new Promise(r => setTimeout(r, 80));
    if (cancelled) return;
    window.studioTape.advance(); // yt → ig
    await new Promise(r => setTimeout(r, 80));
    if (cancelled) return;
    window.studioTape.advance(); // ig → mark

    // Stage 4: mark approved on the canonical (baked) entry
    const statusRes = await fetch('/api/dev/feature-image/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: canonical.id, status: 'approved' }),
    });
    if (cancelled) return;
    if (!statusRes.ok) {
      window.studioTape.fail(`mark approved ${statusRes.status}`);
      return;
    }

    // Stage 5 (optional): submit workflow decision
    if (activeWf) {
      window.studioTape.advance();
      const decideRes = await fetch('/api/dev/feature-image/workflow', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'decide',
          id: activeWf.id,
          logEntryId: canonical.id,
        }),
      });
      if (cancelled) return;
      if (!decideRes.ok) {
        window.studioTape.fail(`workflow decide ${decideRes.status}`);
        return;
      }
      writeActiveWorkflowId(null); // the workflow is now decided; clear local active
    }

    window.studioTape.complete(`Approve · ${entry.title ?? entry.id.slice(0, 8)} · complete`);
    await refreshAll();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    window.studioTape.fail(msg);
  }
}

/**
 * Copy text across both secure and insecure contexts. The async
 * Clipboard API is gated on a secure context (HTTPS / localhost); LAN
 * access via plain HTTP is blocked. Falls back to execCommand('copy')
 * on a hidden textarea, which works in plain HTTP.
 */
async function copyTextToClipboardFlex(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.left = '-1000px';
  ta.setAttribute('readonly', '');
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); }
  finally { document.body.removeChild(ta); }
  return ok;
}

/** Copy text + flash a "copied ✓" badge on the triggering button. */
async function copyToClipboard(text: string, btn: HTMLButtonElement): Promise<void> {
  const ok = await copyTextToClipboardFlex(text);
  if (!ok) {
    toast('Copy failed — clipboard unavailable');
    return;
  }
  const original = btn.textContent;
  btn.classList.add('copied');
  btn.textContent = 'copied ✓';
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.textContent = original;
  }, 1500);
}

async function copyAsInput(entry: LogEntry): Promise<void> {
  const text = [
    `prompt: ${entry.prompt ?? ''}`,
    `preset: ${entry.preset ?? ''}`,
    `title: ${entry.title ?? ''}`,
    `subtitle: ${entry.subtitle ?? ''}`,
    `site: ${entry.site ?? 'audiocontrol'}`,
  ].join('\n');
  const ok = await copyTextToClipboardFlex(text);
  toast(ok ? 'Copied prompt + params to clipboard' : 'Copy failed — check console');
}

function saveAsTemplate(entry: LogEntry): void {
  // Defer richer UX to /dev/studio/templates in Commit 5. For now open
  // a minimal prompt-backed flow that writes a new template.
  const slug = window.prompt('Template slug?', entry.templateSlug ?? '');
  if (!slug) return;
  const name = window.prompt('Template name?', entry.title ?? slug);
  if (!name) return;
  fetch('/api/dev/feature-image/templates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      template: {
        slug,
        name,
        description: '',
        tags: [],
        prompt: entry.prompt ?? '',
        preset: entry.preset ?? '',
        provider: entry.provider ?? '',
        examples: [entry.id],
        site: entry.site ?? null,
      },
    }),
  }).then(async (res) => {
    if (res.ok) toast(`Template "${slug}" saved`);
    else {
      const err = await res.text();
      toast(`Save failed: ${err.slice(0, 80)}`);
    }
  });
}

// ── Interactions: workflow actions ───────────────────────────────────

async function cancelWorkflow(id: string): Promise<void> {
  const res = await fetch('/api/dev/feature-image/workflow', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'cancel', id }),
  });
  if (!res.ok) {
    console.error('cancel workflow failed', res.status);
    return;
  }
  if (activeWorkflowId === id) writeActiveWorkflowId(null);
  await refreshWorkflows();
}

// ── Toast ────────────────────────────────────────────────────────────

let toastTimer: number | null = null;
function toast(message: string): void {
  let el = document.querySelector<HTMLElement>('[data-studio-toast]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-studio-toast', '');
    el.style.cssText = [
      'position: fixed',
      'bottom: calc(var(--studio-tape-idle-h, 8px) + 1.25rem)',
      'left: 50%',
      'transform: translateX(-50%)',
      'z-index: 25',
      'background: hsl(var(--studio-surface-1))',
      'color: hsl(var(--foreground))',
      'border: 1px solid hsl(var(--primary) / 0.5)',
      'padding: 0.5rem 0.875rem',
      'font-family: var(--font-mono)',
      'font-size: 0.75rem',
      'letter-spacing: 0.05em',
      'box-shadow: 0 4px 16px hsl(0 0% 0% / 0.4)',
      'border-radius: 1px',
    ].join(';');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (el) el.style.opacity = '0';
  }, 2600);
}

// ── Event delegation ─────────────────────────────────────────────────

function findCardId(el: EventTarget | null): string | null {
  if (!(el instanceof HTMLElement)) return null;
  const card = el.closest<HTMLElement>('[data-id]');
  return card?.dataset.id ?? null;
}

function onGalleryClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionEl = target.closest<HTMLElement>('[data-action]');
  if (actionEl) {
    const action = actionEl.dataset.action!;
    const cardId = findCardId(actionEl);
    if (!cardId) return;
    const entry = entries.find(e => e.id === cardId);
    if (!entry) return;

    switch (action) {
      case 'rate': {
        const rating = Number(actionEl.getAttribute('data-rating') ?? '0');
        void rateEntry(cardId, rating);
        break;
      }
      case 'approve':
        void approveEntry(entry);
        break;
      case 'reject':
        void setStatus(cardId, 'rejected');
        break;
      case 'archive-toggle':
        void toggleArchive(cardId);
        break;
      case 'copy-input':
        void copyAsInput(entry);
        break;
      case 'save-template':
        saveAsTemplate(entry);
        break;
      case 'copy-apply': {
        const cmd = actionEl.dataset.copy ?? '/feature-image-apply';
        void copyToClipboard(cmd, actionEl as HTMLButtonElement);
        break;
      }
      case 'overflow-toggle': {
        const overflow = actionEl.closest<HTMLElement>('.studio-card__overflow');
        if (overflow) {
          const open = overflow.getAttribute('data-open') === 'true';
          overflow.setAttribute('data-open', open ? 'false' : 'true');
        }
        break;
      }
    }
    return;
  }

  // Click outside an open overflow menu — close it
  document.querySelectorAll<HTMLElement>('.studio-card__overflow[data-open="true"]').forEach((el) => {
    if (!el.contains(target)) el.setAttribute('data-open', 'false');
  });
}

function onWorkflowClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const toggle = target.closest<HTMLElement>('[data-wf-toggle]');
  if (toggle) {
    const tab = document.querySelector<HTMLElement>('[data-wf-tab]');
    if (!tab) return;
    const open = tab.getAttribute('data-open') === 'true';
    tab.setAttribute('data-open', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    return;
  }

  const actionEl = target.closest<HTMLElement>('[data-wf-action]');
  if (!actionEl) return;
  const id = actionEl.dataset.wfId;
  if (!id) return;
  const action = actionEl.dataset.wfAction;

  if (action === 'activate') {
    writeActiveWorkflowId(id);
    renderWorkflowPanel();
    // Hand the operator off to Generate. Activating a workflow is a
    // commitment to start producing images against it, and Generate
    // is the immediate next step — its form auto-prefills from the
    // active workflow's context (prompt, preset, template, site).
    // Without this nav, activating just silently updates a list
    // entry and leaves the operator wondering what to do next.
    window.location.href = '/dev/studio/generate';
  } else if (action === 'deactivate') {
    writeActiveWorkflowId(null);
    renderWorkflowPanel();
  } else if (action === 'cancel') {
    void cancelWorkflow(id);
  }
}

function onArchivedToggle(): void {
  showArchived = !showArchived;
  writeArchivedToggle(showArchived);
  renderTimeline();
  renderEntriesCount();
}

// ── Poll loop ────────────────────────────────────────────────────────
//
// Signature-based change detection, same policy as the editorial studio's
// state-signature endpoint. The poll tick fetches data, serializes it to
// a stable string, and ONLY re-renders when the string changes. Without
// this, every tick (every 6s) rebuilt the timeline DOM and the workflow
// panel from scratch, producing a visible flicker even when nothing had
// moved on the backend.

let lastEntriesSignature: string | null = null;
let lastWorkflowsSignature: string | null = null;

async function refreshEntries(): Promise<void> {
  try {
    const next = await fetchEntries();
    const signature = JSON.stringify(next);
    if (signature === lastEntriesSignature) return;
    lastEntriesSignature = signature;
    entries = next;
    renderTimeline();
    renderEntriesCount();
  } catch (err) {
    console.error('refresh entries failed', err);
  }
}

async function refreshWorkflows(): Promise<void> {
  try {
    const next = await fetchOpenWorkflows();
    const signature = JSON.stringify(next);
    if (signature === lastWorkflowsSignature) return;
    lastWorkflowsSignature = signature;
    workflows = next;
    renderWorkflowPanel();
  } catch (err) {
    console.error('refresh workflows failed', err);
  }
}

async function refreshAll(): Promise<void> {
  await Promise.all([refreshEntries(), refreshWorkflows()]);
}

// ── Boot ─────────────────────────────────────────────────────────────

function boot(): void {
  document.addEventListener('click', onGalleryClick);
  document.querySelector<HTMLElement>('[data-wf-tab]')?.addEventListener('click', onWorkflowClick);
  document.querySelector<HTMLButtonElement>('[data-archived-toggle]')?.addEventListener('click', onArchivedToggle);

  void refreshAll();
  window.setInterval(refreshAll, POLL_INTERVAL_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
