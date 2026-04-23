/*
 * Client driver for /dev/studio/generate.
 *
 * Responsibilities:
 *   - Template bank click → stamps prompt + preset + provider + site
 *     into the form, highlights the active card.
 *   - Pre-fill from an active workflow (localStorage `fi-studio-active-
 *     workflow`) — populates prompt, preset, title, subtitle, site,
 *     and shows the workflow context block.
 *   - Pre-fill from URL params (?prompt=, ?preset=, ?site=, etc.) for
 *     the Copy-as-input flow from gallery.
 *   - Submit → POST /api/dev/feature-image/generate via
 *     window.studioTape for rich progress feedback.
 *   - On success: land back on /dev/studio so the operator sees the
 *     new entry at the top of the history wall.
 */

interface WorkflowItem {
  id: string;
  type: string;
  state: string;
  context: {
    postPath?: string;
    slug?: string;
    site?: 'audiocontrol' | 'editorialcontrol';
    title?: string;
    description?: string;
    suggestedPrompt?: string;
    suggestedPreset?: string;
    suggestedTemplateSlug?: string;
    candidateTemplates?: string[];
    notes?: string;
  };
}

const ACTIVE_WF_KEY = 'fi-studio-active-workflow';

function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c] ?? c);
}

function readActiveWorkflowId(): string | null {
  try { return localStorage.getItem(ACTIVE_WF_KEY); }
  catch { return null; }
}

function qs<T extends Element = HTMLElement>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function qsAll<T extends Element = HTMLElement>(sel: string): T[] {
  return Array.from(document.querySelectorAll<T>(sel));
}

function setField(name: string, value: string): void {
  const el = qs<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[data-gen-field="${name}"]`,
  );
  if (!el) return;
  el.value = value;
}

function getField(name: string): string {
  const el = qs<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[data-gen-field="${name}"]`,
  );
  return el?.value ?? '';
}

// ── Template click handling ──────────────────────────────────────────

function stampTemplate(card: HTMLElement): void {
  const prompt = card.dataset.tplPrompt ?? '';
  const preset = card.dataset.tplPreset ?? '';
  const provider = card.dataset.tplProvider ?? '';
  const site = card.dataset.tplSite ?? '';

  if (prompt) setField('prompt', prompt);
  if (preset) setField('preset', preset);
  if (provider && provider !== '') setField('provider', provider);
  if (site && site !== 'any') setField('site', site);

  qsAll<HTMLElement>('[data-tpl-slug]').forEach((el) => {
    el.setAttribute('data-active', el === card ? 'true' : 'false');
  });
}

// ── URL param pre-fill ───────────────────────────────────────────────

function prefillFromParams(): void {
  const params = new URLSearchParams(window.location.search);
  for (const name of ['prompt', 'preset', 'provider', 'title', 'subtitle', 'site', 'formats']) {
    const v = params.get(name);
    if (v !== null) setField(name, v);
  }
}

// ── Workflow pre-fill ────────────────────────────────────────────────

async function loadActiveWorkflow(): Promise<WorkflowItem | null> {
  const id = readActiveWorkflowId();
  if (!id) return null;
  try {
    const res = await fetch('/api/dev/feature-image/workflow?state=open');
    if (!res.ok) return null;
    const data = (await res.json()) as { items: WorkflowItem[] };
    return data.items.find((w) => w.id === id) ?? null;
  } catch {
    return null;
  }
}

function renderWorkflowContext(wf: WorkflowItem): void {
  const section = qs<HTMLElement>('[data-gen-workflow-section]');
  const mount = qs<HTMLElement>('[data-gen-workflow]');
  if (!section || !mount) return;

  const ctx = wf.context;
  const site = ctx.site ?? 'audiocontrol';
  const meta: string[] = [];
  meta.push(`<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Type</span><span class="studio-readout__value">${htmlEscape(wf.type)}</span></span>`);
  meta.push(`<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Site</span><span class="studio-readout__value">${htmlEscape(site)}</span></span>`);
  if (ctx.slug) {
    meta.push(`<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">Slug</span><span class="studio-readout__value">${htmlEscape(ctx.slug)}</span></span>`);
  }
  meta.push(`<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">ID</span><span class="studio-readout__value">${wf.id.slice(0, 8)}</span></span>`);

  mount.innerHTML = `
    <h3 class="studio-gen__workflow-title">${htmlEscape(ctx.title ?? 'Untitled workflow')}</h3>
    <div class="studio-gen__workflow-meta">${meta.join('')}</div>
    ${ctx.description ? `<p class="studio-gen__workflow-notes">${htmlEscape(ctx.description)}</p>` : ''}
    ${ctx.notes ? `<p class="studio-gen__workflow-notes">${htmlEscape(ctx.notes)}</p>` : ''}
    <div>
      <a href="/dev/studio" class="studio-btn">Manage workflow →</a>
    </div>
  `;
  section.hidden = false;

  // Pre-fill form fields from the workflow context (only if the fields
  // are empty or URL params haven't already populated them).
  if (!getField('prompt') && ctx.suggestedPrompt) setField('prompt', ctx.suggestedPrompt);
  if (!getField('preset') && ctx.suggestedPreset) setField('preset', ctx.suggestedPreset);
  if (!getField('title') && ctx.title) setField('title', ctx.title);
  if (!getField('subtitle') && ctx.description) setField('subtitle', ctx.description);
  setField('site', site);

  // Highlight the suggested template if it's in the bank.
  if (ctx.suggestedTemplateSlug) {
    const card = qs<HTMLElement>(`[data-tpl-slug="${ctx.suggestedTemplateSlug}"]`);
    if (card) card.setAttribute('data-active', 'true');
  }
}

// ── Site switch → chrome target reflection ──────────────────────────

function reflectTargetOnChrome(site: string): void {
  if (typeof window.studioSetTarget === 'function') {
    window.studioSetTarget(site === 'editorialcontrol' ? 'editorialcontrol' : 'audiocontrol');
  }
}

// ── Submit ───────────────────────────────────────────────────────────

interface GenerateBody {
  prompt: string;
  provider?: string;
  preset?: string;
  title?: string;
  subtitle?: string;
  formats?: string;
  site?: string;
  templateSlug?: string;
  parentEntryId?: string;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  if (!window.studioTape || window.studioTape.isActive()) return;

  const prompt = getField('prompt').trim();
  if (!prompt) return;

  const body: GenerateBody = {
    prompt,
    provider: getField('provider') || undefined,
    preset: getField('preset') || undefined,
    title: getField('title') || undefined,
    subtitle: getField('subtitle') || undefined,
    formats: getField('formats') || 'og',
    site: getField('site') || 'audiocontrol',
  };

  // Tag the generation with the active template if one is highlighted.
  const activeTpl = qs<HTMLElement>('[data-tpl-slug][data-active="true"]');
  if (activeTpl) body.templateSlug = activeTpl.dataset.tplSlug;

  const providerStages = (() => {
    const p = body.provider;
    if (p === 'both') {
      return [
        { label: 'Request flux', estimateMs: 7000 },
        { label: 'Request dalle', estimateMs: 7000 },
        { label: 'Apply filters', estimateMs: 900 },
        { label: 'Composite', estimateMs: 1200 },
      ];
    }
    return [
      { label: `Request ${p}`, estimateMs: 6500 },
      { label: 'Apply filters', estimateMs: 700 },
      { label: 'Composite', estimateMs: 1100 },
    ];
  })();

  window.studioTape.start({
    key: `studio-generate-${body.provider}`,
    operation: `Generate · ${body.provider}`,
    stages: providerStages,
    cancelable: false, // AI request isn't safely cancelable mid-flight
  });

  try {
    const res = await fetch('/api/dev/feature-image/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      window.studioTape.fail(`generate ${res.status}: ${text.slice(0, 80)}`);
      return;
    }

    // The server returns once the whole pipeline is done; we tick
    // across the stages for visual rhythm then complete.
    for (let i = 0; i < providerStages.length - 1; i++) {
      window.studioTape.advance();
      await sleep(140);
    }
    window.studioTape.complete(`Generate · ${body.provider} · complete`);

    // Return to gallery so the new entry is visible at the top.
    window.setTimeout(() => { window.location.href = '/dev/studio'; }, 900);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    window.studioTape.fail(msg);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Boot ─────────────────────────────────────────────────────────────

async function boot(): Promise<void> {
  // Template clicks
  qsAll<HTMLElement>('[data-tpl-slug]').forEach((card) => {
    card.addEventListener('click', () => stampTemplate(card));
  });

  // Site select → reflect on chrome readout
  const siteEl = qs<HTMLSelectElement>('[data-gen-field="site"]');
  if (siteEl) {
    siteEl.addEventListener('change', () => reflectTargetOnChrome(siteEl.value));
  }

  // Submit
  const form = qs<HTMLFormElement>('[data-gen-form]');
  if (form) form.addEventListener('submit', handleSubmit);

  // Pre-fills: URL params first, then workflow if one's active
  prefillFromParams();
  const wf = await loadActiveWorkflow();
  if (wf) {
    renderWorkflowContext(wf);
    reflectTargetOnChrome(wf.context.site ?? 'audiocontrol');
  } else {
    reflectTargetOnChrome(siteEl?.value ?? 'audiocontrol');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  void boot();
}
