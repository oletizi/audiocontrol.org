/*
 * Client driver for /dev/studio/focus/[id].
 *
 * Responsibilities:
 *   - Live-update the OGPreview component when parameter inputs change
 *     (no round-trip; mutates data-* attrs which the shared
 *     og-preview.css reacts to).
 *   - Commit / Approve / Reject: drive the POST APIs and surface
 *     progress on window.studioTape.
 *   - Thread composer: fetch messages, poll 6s, send new messages
 *     (creates a feature-image-iterate workflow behind the scenes).
 *   - Keyboard shortcuts: ESC → gallery, Cmd/Ctrl+Enter → send.
 *   - Persists draft state per entry to localStorage so the operator
 *     can walk away and come back to the same panel state.
 */

const PRESETS: Record<string, Record<string, string>> = {
  none:        { grade: 'none',       phosphor: 'off',   vignette: 'off',    scanlines: 'off', grain: 'off' },
  subtle:      { grade: 'none',       phosphor: 'off',   vignette: 'subtle', scanlines: 'off', grain: 'light' },
  'retro-crt': { grade: 'crt',        phosphor: 'on',    vignette: 'on',     scanlines: 'on',  grain: 'on' },
  'teal-amber':{ grade: 'teal-amber', phosphor: 'off',   vignette: 'subtle', scanlines: 'off', grain: 'light' },
  'heavy-crt': { grade: 'heavy',      phosphor: 'heavy', vignette: 'heavy',  scanlines: 'heavy', grain: 'heavy' },
};

const FILTER_KEYS = ['grade', 'phosphor', 'vignette', 'scanlines', 'grain'] as const;

const POLL_INTERVAL_MS = 6000;

interface ThreadMessage {
  messageId?: string;
  threadId: string;
  timestamp: string;
  role: 'user' | 'assistant';
  text: string;
  logEntryId?: string;
}

// ── Utilities ────────────────────────────────────────────────────────

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function qs<T extends Element = HTMLElement>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function qsAll<T extends Element = HTMLElement>(sel: string): T[] {
  return Array.from(document.querySelectorAll<T>(sel));
}

function readEntryId(): string {
  const root = qs<HTMLElement>('.studio-focus');
  return root?.dataset.entryId ?? '';
}

function readEntrySite(): 'audiocontrol' | 'editorialcontrol' {
  const root = qs<HTMLElement>('.studio-focus');
  const v = root?.dataset.entrySite;
  return v === 'editorialcontrol' ? 'editorialcontrol' : 'audiocontrol';
}

function getPreview(): HTMLElement | null {
  return qs('#studio-focus-preview');
}

function readPreviewState(): Record<string, string> {
  const el = getPreview();
  if (!el) return {};
  return {
    format: el.dataset.format ?? 'og',
    grade: el.dataset.grade ?? 'none',
    phosphor: el.dataset.phosphor ?? 'off',
    vignette: el.dataset.vignette ?? 'off',
    scanlines: el.dataset.scanlines ?? 'off',
    grain: el.dataset.grain ?? 'off',
    overlay: el.dataset.overlay ?? 'on',
    overlayPosition: el.dataset.overlayPosition ?? 'bottom',
    overlayAlign: el.dataset.overlayAlign ?? 'auto',
    preset: el.dataset.preset ?? '',
    site: el.dataset.site ?? 'audiocontrol',
  };
}

function readPreviewTextState(): { title: string; subtitle: string } {
  const titleEl = qs<HTMLTextAreaElement>('.og-title-input');
  const subEl = qs<HTMLTextAreaElement>('.og-subtitle-input');
  return {
    title: titleEl?.value ?? '',
    subtitle: subEl?.value ?? '',
  };
}

function writePreviewAttr(key: string, value: string): void {
  const el = getPreview();
  if (!el) return;
  el.dataset[key] = value;
}

// ── Draft persistence ────────────────────────────────────────────────

function draftKey(entryId: string): string {
  return `fi-studio-focus-draft-${entryId}`;
}

function saveDraft(entryId: string): void {
  const state = readPreviewState();
  const text = readPreviewTextState();
  try {
    localStorage.setItem(draftKey(entryId), JSON.stringify({ ...state, ...text }));
  } catch { /* noop */ }
}

function restoreDraft(entryId: string): void {
  try {
    const raw = localStorage.getItem(draftKey(entryId));
    if (!raw) return;
    const draft = JSON.parse(raw) as Record<string, string>;
    const el = getPreview();
    if (!el) return;

    for (const key of ['format', 'grade', 'phosphor', 'vignette', 'scanlines', 'grain', 'overlay', 'overlayPosition', 'overlayAlign', 'preset', 'site']) {
      if (draft[key] !== undefined) {
        el.dataset[key] = draft[key];
        const sel = qs<HTMLSelectElement | HTMLInputElement>(`[data-ctl="${key}"]`);
        if (sel && sel instanceof HTMLSelectElement) sel.value = draft[key];
      }
    }

    const titleEl = qs<HTMLTextAreaElement>('.og-title-input');
    const subEl = qs<HTMLTextAreaElement>('.og-subtitle-input');
    if (titleEl && draft.title !== undefined) titleEl.value = draft.title;
    if (subEl && draft.subtitle !== undefined) subEl.value = draft.subtitle;

    reflectTargetOnChrome(draft.site ?? readEntrySite());
  } catch { /* noop */ }
}

function clearDraft(entryId: string): void {
  try { localStorage.removeItem(draftKey(entryId)); } catch { /* noop */ }
}

// ── Target reflection (chrome + card-local var) ──────────────────────

function reflectTargetOnChrome(site: string): void {
  const normalized = site === 'editorialcontrol' ? 'editorialcontrol' : 'audiocontrol';
  if (typeof window.studioSetTarget === 'function') {
    window.studioSetTarget(normalized as 'audiocontrol' | 'editorialcontrol');
  }
  const root = qs<HTMLElement>('.studio-focus');
  if (root) {
    root.style.setProperty(
      '--card-target',
      normalized === 'editorialcontrol' ? '74 82% 58%' : '35 95% 62%',
    );
  }
}

// ── Parameter panel wiring ───────────────────────────────────────────

function onControlInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const ctl = target.dataset.ctl;
  if (!ctl) return;

  if (ctl === 'preset') {
    const preset = (target as HTMLSelectElement).value;
    writePreviewAttr('preset', preset);
    const defaults = PRESETS[preset];
    if (defaults) {
      for (const k of FILTER_KEYS) {
        writePreviewAttr(k, defaults[k]);
        const sel = qs<HTMLSelectElement>(`[data-ctl="${k}"]`);
        if (sel) sel.value = defaults[k];
      }
    }
  } else if (ctl === 'site') {
    const site = (target as HTMLSelectElement).value;
    writePreviewAttr('site', site);
    reflectTargetOnChrome(site);
    // Re-emit brand tokens inline on the preview element. The
    // OGPreview component normally does this at render time via its
    // Astro frontmatter; in the live-edit path we sync the brand
    // vars manually so the preview re-paints without a reload.
    const preview = getPreview();
    if (preview) applyBrandVars(preview, site);
  } else if (ctl === 'overlay') {
    writePreviewAttr('overlay', (target as HTMLSelectElement).value);
  } else if (ctl === 'all-formats') {
    // Checkbox — no preview change, just state for commit/approve
    return;
  } else if (['overlayPosition', 'overlayAlign', 'format', 'grade', 'phosphor', 'vignette', 'scanlines', 'grain'].includes(ctl)) {
    writePreviewAttr(ctl, (target as HTMLSelectElement).value);
  }

  const entryId = readEntryId();
  if (entryId) saveDraft(entryId);
}

function applyBrandVars(preview: HTMLElement, site: string): void {
  // Minimal set: switch between the two known brands via the inline style.
  // Full brand objects live in src/sites/<site>/brand.ts; we only need
  // the tokens that og-preview.css consumes for the swap.
  const brands: Record<string, Record<string, string>> = {
    audiocontrol: {
      '--og-primary': 'hsl(35 95% 62%)',
      '--og-accent': 'hsl(215 55% 55%)',
      '--og-foreground': 'hsl(35 18% 88%)',
      '--og-muted-foreground': 'hsl(30 10% 55%)',
      '--og-background': 'hsl(30 12% 7%)',
      '--og-card': 'hsl(30 14% 11%)',
      '--og-border': 'hsl(30 10% 18%)',
      '--og-font-display': '"Departure Mono", ui-monospace, Menlo, monospace',
      '--og-font-body': '"IBM Plex Sans", system-ui, sans-serif',
      '--og-font-mono': '"JetBrains Mono", ui-monospace, monospace',
      '--og-brand-name': "'audiocontrol.org'",
    },
    editorialcontrol: {
      '--og-primary': 'hsl(74 82% 58%)',
      '--og-accent': 'hsl(38 32% 82%)',
      '--og-foreground': 'hsl(40 20% 90%)',
      '--og-muted-foreground': 'hsl(35 8% 58%)',
      '--og-background': 'hsl(215 22% 7%)',
      '--og-card': 'hsl(215 20% 11%)',
      '--og-border': 'hsl(215 14% 20%)',
      '--og-font-display': '"Fraunces", Georgia, serif',
      '--og-font-body': '"Inter", system-ui, sans-serif',
      '--og-font-mono': '"JetBrains Mono", ui-monospace, monospace',
      '--og-brand-name': "'editorialcontrol.org'",
    },
  };

  const vars = brands[site];
  if (!vars) return;
  const existing = preview.getAttribute('style') ?? '';
  const cleaned = existing
    .split(';')
    .filter((s) => !/^\s*--og-/.test(s))
    .join(';')
    .trim();
  const next = Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join('; ');
  preview.setAttribute('style', (cleaned ? cleaned + '; ' : '') + next);
  preview.dataset.site = site;

  // Brand footer label
  const nameEl = preview.querySelector<HTMLElement>('.og-brand-text');
  if (nameEl) {
    nameEl.textContent = site === 'editorialcontrol' ? 'editorialcontrol.org' : 'audiocontrol.org';
  }
}

// ── Title / subtitle inline edit persistence ─────────────────────────

function wireInlineEdits(): void {
  const titleEl = qs<HTMLTextAreaElement>('.og-title-input');
  const subEl = qs<HTMLTextAreaElement>('.og-subtitle-input');
  const entryId = readEntryId();

  const onInput = () => {
    if (entryId) saveDraft(entryId);
  };
  if (titleEl) titleEl.addEventListener('input', onInput);
  if (subEl) subEl.addEventListener('input', onInput);
}

// ── Format tabs ──────────────────────────────────────────────────────

function wireFormatTabs(): void {
  const tabs = qsAll<HTMLButtonElement>('[data-format-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const format = tab.dataset.formatTab ?? 'og';
      writePreviewAttr('format', format);
      tabs.forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
      const sel = qs<HTMLSelectElement>('[data-ctl="format"]');
      if (sel) sel.value = format;
      const entryId = readEntryId();
      if (entryId) saveDraft(entryId);
    });
  });
}

// ── Rating ───────────────────────────────────────────────────────────

async function rateEntry(rating: number): Promise<void> {
  const entryId = readEntryId();
  if (!entryId) return;
  const res = await fetch('/api/dev/feature-image/log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: entryId, rating }),
  });
  if (!res.ok) {
    setStatusMessage('error', `Rate failed ${res.status}`);
    return;
  }
  qsAll<HTMLButtonElement>('.studio-focus__rating button').forEach((btn) => {
    const n = Number(btn.dataset.rating ?? '0');
    btn.classList.toggle('on', n <= rating);
  });
  setStatusMessage('ok', `Rated ${rating}/5`);
}

function wireRating(): void {
  qsAll<HTMLButtonElement>('[data-action="rate"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = Number(btn.dataset.rating ?? '0');
      void rateEntry(n);
    });
  });
}

// ── Status line ──────────────────────────────────────────────────────

function setStatusMessage(state: 'idle' | 'ok' | 'error' | 'working', message: string): void {
  const el = qs('[data-focus-status]') as HTMLElement | null;
  if (!el) return;
  el.textContent = message;
  el.setAttribute('data-state', state);
  if (state === 'ok' || state === 'error') {
    window.setTimeout(() => {
      if (el.textContent === message) {
        el.textContent = '';
        el.setAttribute('data-state', 'idle');
      }
    }, 2800);
  }
}

// ── Commit / Approve / Reject ────────────────────────────────────────

function gatherRecompositeBody(): Record<string, unknown> {
  const state = readPreviewState();
  const text = readPreviewTextState();
  const entryId = readEntryId();
  const filters: Record<string, string> = {};
  for (const k of FILTER_KEYS) filters[k] = state[k];

  const allFormatsCb = qs<HTMLInputElement>('[data-ctl="all-formats"]');
  const formats = allFormatsCb?.checked
    ? ['og', 'youtube', 'instagram']
    : [state.format || 'og'];

  return {
    sourceEntryId: entryId,
    title: text.title,
    subtitle: text.subtitle,
    preset: state.preset || undefined,
    filters,
    overlay: state.overlay !== 'off',
    overlayPosition: state.overlayPosition,
    overlayAlign: state.overlayAlign,
    formats,
    site: state.site,
  };
}

async function commit(): Promise<void> {
  if (!window.studioTape || window.studioTape.isActive()) return;
  const body = gatherRecompositeBody() as { formats: string[] };
  const formatCount = body.formats.length;

  const stages = Array.from({ length: formatCount }, (_, i) => ({
    label: `Bake ${body.formats[i]}`,
    estimateMs: 2200,
  }));

  window.studioTape.start({
    key: `studio-commit-${formatCount}`,
    operation: `Commit · bake ${formatCount} format${formatCount === 1 ? '' : 's'}`,
    stages,
    cancelable: true,
  });

  try {
    const res = await fetch('/api/dev/feature-image/recomposite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      window.studioTape.fail(`bake ${res.status}: ${text.slice(0, 60)}`);
      return;
    }
    // Advance through each format stage in turn (baked in one call; we
    // just tick across the visual for feedback).
    for (let i = 0; i < formatCount - 1; i++) {
      window.studioTape.advance();
      await sleep(60);
    }
    window.studioTape.complete(`Commit · ${formatCount} format${formatCount === 1 ? '' : 's'} baked`);
    const entryId = readEntryId();
    if (entryId) clearDraft(entryId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    window.studioTape.fail(msg);
  }
}

async function approve(): Promise<void> {
  if (!window.studioTape || window.studioTape.isActive()) return;
  const base = gatherRecompositeBody() as Record<string, unknown>;
  const forceThree = { ...base, formats: ['og', 'youtube', 'instagram'], includeFilteredVariant: true };

  // Active workflow lookup (cross-route localStorage key set by gallery)
  let activeWorkflowId: string | null = null;
  try {
    activeWorkflowId = localStorage.getItem('fi-studio-active-workflow');
  } catch { /* noop */ }

  const stages = [
    { label: 'Bake og', estimateMs: 2400 },
    { label: 'Bake youtube', estimateMs: 2200 },
    { label: 'Bake instagram', estimateMs: 2200 },
    { label: 'Mark approved', estimateMs: 300 },
  ];
  if (activeWorkflowId) stages.push({ label: 'Submit decision', estimateMs: 300 });

  window.studioTape.start({
    key: 'studio-approve-3-formats',
    operation: `Approve · ${readEntryId().slice(0, 8)}`,
    stages,
    cancelable: true,
  });

  try {
    const res = await fetch('/api/dev/feature-image/recomposite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(forceThree),
    });
    if (!res.ok) {
      const text = await res.text();
      window.studioTape.fail(`bake ${res.status}: ${text.slice(0, 60)}`);
      return;
    }
    const { entry: baked } = await res.json() as { entry: { id: string } };

    window.studioTape.advance(); // og → yt
    await sleep(80);
    window.studioTape.advance(); // yt → ig
    await sleep(80);
    window.studioTape.advance(); // ig → mark

    const markRes = await fetch('/api/dev/feature-image/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: baked.id, status: 'approved' }),
    });
    if (!markRes.ok) {
      window.studioTape.fail(`mark approved ${markRes.status}`);
      return;
    }

    if (activeWorkflowId) {
      window.studioTape.advance();
      const decideRes = await fetch('/api/dev/feature-image/workflow', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'decide',
          id: activeWorkflowId,
          logEntryId: baked.id,
        }),
      });
      if (!decideRes.ok) {
        window.studioTape.fail(`workflow decide ${decideRes.status}`);
        return;
      }
      try { localStorage.removeItem('fi-studio-active-workflow'); } catch { /* noop */ }
    }

    window.studioTape.complete('Approve · complete');
    const entryId = readEntryId();
    if (entryId) clearDraft(entryId);
    // Route back to gallery so the new canonical entry shows up at the top.
    window.setTimeout(() => { window.location.href = '/dev/studio'; }, 1200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    window.studioTape.fail(msg);
  }
}

async function reject(): Promise<void> {
  const entryId = readEntryId();
  if (!entryId) return;
  const res = await fetch('/api/dev/feature-image/log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: entryId, status: 'rejected' }),
  });
  if (!res.ok) {
    setStatusMessage('error', `Reject failed ${res.status}`);
    return;
  }
  setStatusMessage('ok', 'Rejected');
  window.setTimeout(() => { window.location.href = '/dev/studio'; }, 700);
}

// ── Thread ───────────────────────────────────────────────────────────

async function fetchThread(): Promise<ThreadMessage[]> {
  const entryId = readEntryId();
  if (!entryId) return [];
  // Server resolves entryId → lineage-root threadId, then returns all
  // messages in that thread. Handles mid-lineage entries correctly.
  const res = await fetch(`/api/dev/feature-image/threads?entryId=${encodeURIComponent(entryId)}`);
  if (!res.ok) return [];
  const data = await res.json() as { messages: ThreadMessage[] };
  return data.messages ?? [];
}

function renderThread(messages: ThreadMessage[]): void {
  const mount = qs('[data-focus-messages]');
  if (!mount) return;
  if (messages.length === 0) {
    mount.innerHTML = '<p class="studio-focus__thread-empty">No messages yet. Ask Claude to iterate on this image.</p>';
    return;
  }
  mount.innerHTML = messages
    .map((m) => `
      <article class="studio-focus__msg" data-role="${m.role}">
        <span class="studio-focus__msg-kicker">${m.role === 'user' ? 'Operator' : 'Claude'} · ${new Date(m.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}</span>
        <p class="studio-focus__msg-text">${htmlEscape(m.text)}</p>
      </article>
    `)
    .join('');
}

async function refreshThread(): Promise<void> {
  try {
    const msgs = await fetchThread();
    renderThread(msgs);
  } catch { /* noop — leaves whatever was there */ }
}

async function sendThreadMessage(text: string): Promise<void> {
  const entryId = readEntryId();
  if (!entryId || !text.trim()) return;
  const state = readPreviewState();
  const preview = readPreviewTextState();

  // Threads endpoint atomically appends the user message AND creates a
  // matching feature-image-iterate workflow item. The iterate skill
  // (/feature-image-iterate) drains the workflow.
  const res = await fetch('/api/dev/feature-image/threads', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'append-message',
      entryId,
      text,
      snapshot: {
        title: preview.title,
        subtitle: preview.subtitle,
        preset: state.preset,
        filters: FILTER_KEYS.reduce<Record<string, string>>((acc, k) => {
          acc[k] = state[k];
          return acc;
        }, {}),
        overlay: state.overlay !== 'off',
      },
    }),
  });
  if (!res.ok) {
    setStatusMessage('error', `Send failed ${res.status}`);
    return;
  }
  setStatusMessage('ok', 'Queued — run /feature-image-iterate to process');
  await refreshThread();
}

function wireThreadComposer(): void {
  const form = qs<HTMLFormElement>('[data-focus-composer]');
  const input = qs<HTMLTextAreaElement>('[data-focus-input]');
  if (!form || !input) return;
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    void sendThreadMessage(text);
  });
  input.addEventListener('keydown', (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') {
      ev.preventDefault();
      form.requestSubmit();
    }
  });
}

// ── Keyboard ─────────────────────────────────────────────────────────

function wireKeyboard(): void {
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      // Don't swallow ESC if a modal or native control has focus in an
      // unexpected way — just do the back-nav.
      window.location.href = '/dev/studio';
    }
  });
}

// ── Action buttons ───────────────────────────────────────────────────

function wireActions(): void {
  qsAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
    const action = btn.dataset.action;
    switch (action) {
      case 'commit':  btn.addEventListener('click', () => void commit()); break;
      case 'approve': btn.addEventListener('click', () => void approve()); break;
      case 'reject':  btn.addEventListener('click', () => void reject()); break;
    }
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Boot ─────────────────────────────────────────────────────────────

function boot(): void {
  // Delegate parameter input events
  const spec = qs('[data-focus-spec]');
  if (spec) spec.addEventListener('input', onControlInput);

  wireFormatTabs();
  wireInlineEdits();
  wireRating();
  wireThreadComposer();
  wireKeyboard();
  wireActions();

  const entryId = readEntryId();
  if (entryId) restoreDraft(entryId);

  void refreshThread();
  window.setInterval(refreshThread, POLL_INTERVAL_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
