/*
 * Client driver for /dev/studio/templates.
 *
 * Receives an initial pre-ranked template payload from the server
 * (window.__studioTemplates, seeded in templates.astro) and renders
 * the grid + detail pane. Handles site / tag / archived filters,
 * sort mode, and the Fork / Archive / "Generate from this" actions.
 */

interface TemplateFitness {
  usageCount: number;
  averageRating: number;
  recentAverageRating: number;
  fitness: number;
}

interface Template {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  prompt: string;
  preset: string | null;
  provider: string | null;
  parent: string | null;
  archived: boolean;
  examples: string[];
  site: 'audiocontrol' | 'editorialcontrol' | null;
  fitness: TemplateFitness;
}

declare global {
  interface Window {
    __studioTemplates?: Template[];
  }
}

let templates: Template[] = window.__studioTemplates ?? [];
let filters = {
  site: '' as '' | 'audiocontrol' | 'editorialcontrol',
  tag: '',
  sort: 'fitness' as 'fitness' | 'name' | 'recent' | 'usage',
  includeArchived: false,
};
let selectedSlug: string | null = null;

// ── Utilities ────────────────────────────────────────────────────────

function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c] ?? c);
}

function qs<T extends Element = HTMLElement>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function qsAll<T extends Element = HTMLElement>(sel: string): T[] {
  return Array.from(document.querySelectorAll<T>(sel));
}

// ── Filtering + sort ─────────────────────────────────────────────────

function applyFilters(all: Template[]): Template[] {
  let out = all;
  if (!filters.includeArchived) out = out.filter((t) => !t.archived);
  if (filters.site) {
    // Site-agnostic templates (site = null) pass every site filter.
    out = out.filter((t) => !t.site || t.site === filters.site);
  }
  if (filters.tag) {
    out = out.filter((t) => t.tags.includes(filters.tag));
  }
  return out;
}

function applySort(list: Template[]): Template[] {
  const copy = [...list];
  switch (filters.sort) {
    case 'name':
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'usage':
      copy.sort((a, b) => b.fitness.usageCount - a.fitness.usageCount);
      break;
    case 'recent':
      copy.sort((a, b) => b.fitness.recentAverageRating - a.fitness.recentAverageRating);
      break;
    case 'fitness':
    default:
      copy.sort((a, b) => b.fitness.fitness - a.fitness.fitness);
  }
  return copy;
}

// ── Card rendering ───────────────────────────────────────────────────

function cardHtml(t: Template): string {
  const fit = t.fitness;
  const fitLabel = fit.usageCount > 0
    ? `★ ${fit.averageRating.toFixed(1)} · n=${fit.usageCount}`
    : 'new';
  const siteLabel = t.site ?? 'any';
  const tagsHtml = t.tags
    .slice(0, 5)
    .map((tag) => `<li class="studio-tpl__card-tag">${htmlEscape(tag)}</li>`)
    .join('');
  const archivedBadge = t.archived
    ? `<span class="studio-tpl__card--archived-stamp">Archived</span>`
    : '';
  return `
    <button
      type="button"
      class="studio-tpl__card"
      data-tpl-slug="${htmlEscape(t.slug)}"
      data-archived="${t.archived ? 'true' : 'false'}"
      data-selected="${t.slug === selectedSlug ? 'true' : 'false'}"
    >
      <header class="studio-tpl__card-head">
        <span class="studio-tpl__card-name">${htmlEscape(t.name)}</span>
        <span class="studio-tpl__card-fit">${htmlEscape(fitLabel)}</span>
      </header>
      ${t.description ? `<p class="studio-tpl__card-desc">${htmlEscape(t.description)}</p>` : ''}
      ${tagsHtml ? `<ul class="studio-tpl__card-tags">${tagsHtml}</ul>` : ''}
      <footer class="studio-tpl__card-foot">
        <div class="studio-tpl__card-site">
          ${t.preset ? `<span>preset ${htmlEscape(t.preset)}</span> · ` : ''}
          <span>site ${htmlEscape(siteLabel)}</span>
        </div>
        <span class="studio-tpl__card-slug">${htmlEscape(t.slug)}</span>
        ${archivedBadge}
      </footer>
    </button>
  `;
}

function renderGrid(): void {
  const grid = qs('[data-tpl-grid]');
  if (!grid) return;
  const visible = applySort(applyFilters(templates));
  if (visible.length === 0) {
    grid.innerHTML = `<p class="studio-tpl__empty">No templates match these filters.</p>`;
    return;
  }
  grid.innerHTML = visible.map(cardHtml).join('');
  qsAll('[data-tpl-slug]').forEach((card) => {
    card.addEventListener('click', () => {
      const slug = (card as HTMLElement).dataset.tplSlug;
      if (!slug) return;
      selectedSlug = slug;
      qsAll('[data-tpl-slug]').forEach((c) => {
        c.setAttribute('data-selected', (c as HTMLElement).dataset.tplSlug === slug ? 'true' : 'false');
      });
      renderDetail();
    });
  });
}

// ── Detail rendering ─────────────────────────────────────────────────

function findTemplate(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}

function findForks(parentSlug: string): Template[] {
  return templates.filter((t) => t.parent === parentSlug);
}

function renderDetail(): void {
  const mount = qs('[data-tpl-detail]');
  if (!mount) return;
  if (!selectedSlug) {
    mount.innerHTML = `
      <div class="studio-tpl__detail-empty">
        <span class="studio-kicker studio-kicker--muted">Select a template</span>
        <p>Click a card to inspect its prompt, lineage, and examples.</p>
      </div>
    `;
    return;
  }
  const t = findTemplate(selectedSlug);
  if (!t) {
    mount.innerHTML = `<p class="studio-tpl__detail-empty">Template not found.</p>`;
    return;
  }

  const fit = t.fitness;
  const meta: string[] = [];
  meta.push(readoutInline('Slug', t.slug));
  if (t.site) meta.push(readoutInline('Site', t.site));
  if (t.preset) meta.push(readoutInline('Preset', t.preset));
  if (t.provider) meta.push(readoutInline('Provider', t.provider));
  meta.push(readoutInline('Usage', String(fit.usageCount)));
  if (fit.usageCount > 0) {
    meta.push(readoutInline('Avg', fit.averageRating.toFixed(2)));
    meta.push(readoutInline('Recent', fit.recentAverageRating.toFixed(2)));
  }
  meta.push(readoutInline('Fitness', fit.fitness.toFixed(2)));

  const forks = findForks(t.slug);
  const forkHtml = forks.length > 0
    ? `
      <div class="studio-tpl__detail-lineage">
        <span class="studio-tpl__detail-kicker">Forks (${forks.length})</span>
        ${forks.map((f) => `<a href="#" data-lineage-slug="${htmlEscape(f.slug)}">${htmlEscape(f.name)} · ${htmlEscape(f.slug)}</a>`).join('')}
      </div>
    `
    : '';

  const parentHtml = t.parent
    ? `
      <div class="studio-tpl__detail-lineage">
        <span class="studio-tpl__detail-kicker">Forked from</span>
        <a href="#" data-lineage-slug="${htmlEscape(t.parent)}">${htmlEscape(t.parent)}</a>
      </div>
    `
    : '';

  const examplesHtml = t.examples.length > 0
    ? `
      <div>
        <span class="studio-tpl__detail-kicker">Examples (${t.examples.length})</span>
        <ul class="studio-tpl__detail-examples">
          ${t.examples.slice(0, 10).map((id) => `<li>${htmlEscape(id.slice(0, 8))}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const archiveLabel = t.archived ? 'Restore' : 'Archive';
  const generateParams = new URLSearchParams();
  if (t.prompt) generateParams.set('prompt', t.prompt);
  if (t.preset) generateParams.set('preset', t.preset);
  if (t.provider) generateParams.set('provider', t.provider);
  if (t.site) generateParams.set('site', t.site);

  mount.innerHTML = `
    <header>
      <h2 class="studio-tpl__detail-title">${htmlEscape(t.name)}</h2>
      <span class="studio-tpl__detail-slug">${htmlEscape(t.slug)}</span>
    </header>

    <div class="studio-tpl__detail-meta">${meta.join('')}</div>

    ${t.description ? `<p class="studio-tpl__detail-desc">${htmlEscape(t.description)}</p>` : ''}

    <div>
      <span class="studio-tpl__detail-kicker">Prompt</span>
      <pre class="studio-tpl__detail-prompt">${htmlEscape(t.prompt)}</pre>
    </div>

    ${parentHtml}
    ${forkHtml}
    ${examplesHtml}

    <div class="studio-tpl__detail-actions">
      <a class="studio-btn studio-btn--primary" href="/dev/studio/generate?${generateParams.toString()}">
        Generate from this →
      </a>
      <button type="button" class="studio-btn" data-action="fork">Fork</button>
      <button type="button" class="studio-btn ${t.archived ? '' : 'studio-btn--danger'}" data-action="archive">${archiveLabel}</button>
    </div>
  `;

  // Lineage links — click a parent/fork to navigate the detail pane
  // to that slug.
  qsAll<HTMLAnchorElement>('[data-lineage-slug]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const slug = a.dataset.lineageSlug;
      if (!slug) return;
      selectedSlug = slug;
      qsAll('[data-tpl-slug]').forEach((c) => {
        c.setAttribute('data-selected', (c as HTMLElement).dataset.tplSlug === slug ? 'true' : 'false');
      });
      renderDetail();
      const card = qs(`[data-tpl-slug="${CSS.escape(slug)}"]`);
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  qs<HTMLButtonElement>('[data-action="fork"]')?.addEventListener('click', () => void forkTemplate(t));
  qs<HTMLButtonElement>('[data-action="archive"]')?.addEventListener('click', () => void archiveTemplate(t));
}

function readoutInline(kicker: string, value: string): string {
  return `<span class="studio-readout studio-readout--inline"><span class="studio-readout__kicker">${htmlEscape(kicker)}</span><span class="studio-readout__value">${htmlEscape(value)}</span></span>`;
}

// ── Actions ──────────────────────────────────────────────────────────

async function forkTemplate(source: Template): Promise<void> {
  const newSlug = window.prompt(`Fork "${source.slug}" — new slug?`, `${source.slug}-v2`);
  if (!newSlug) return;
  const newName = window.prompt('New name?', `${source.name} (fork)`);
  if (!newName) return;
  const res = await fetch('/api/dev/feature-image/templates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'fork',
      sourceSlug: source.slug,
      newSlug,
      overrides: { name: newName },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    window.alert(`Fork failed: ${text.slice(0, 120)}`);
    return;
  }
  await reloadLibrary();
  selectedSlug = newSlug;
  renderGrid();
  renderDetail();
}

async function archiveTemplate(t: Template): Promise<void> {
  const next = !t.archived;
  const res = await fetch('/api/dev/feature-image/templates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'archive',
      slug: t.slug,
      archived: next,
    }),
  });
  if (!res.ok) return;
  t.archived = next;
  renderGrid();
  renderDetail();
}

async function reloadLibrary(): Promise<void> {
  const res = await fetch('/api/dev/feature-image/templates?includeArchived=true');
  if (!res.ok) return;
  const data = await res.json() as { templates: Template[] };
  templates = data.templates ?? templates;
}

// ── Filter wiring ────────────────────────────────────────────────────

function wireFilters(): void {
  qsAll<HTMLButtonElement>('[data-filter-site-value]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.site = (btn.dataset.filterSiteValue ?? '') as typeof filters.site;
      qsAll<HTMLElement>('[data-filter-site-value]').forEach((el) =>
        el.setAttribute('data-active', el === btn ? 'true' : 'false'),
      );
      renderGrid();
    });
  });

  qsAll<HTMLButtonElement>('[data-filter-tag-value]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.tag = btn.dataset.filterTagValue ?? '';
      qsAll<HTMLElement>('[data-filter-tag-value]').forEach((el) =>
        el.setAttribute('data-active', el === btn ? 'true' : 'false'),
      );
      renderGrid();
    });
  });

  const sort = qs<HTMLSelectElement>('[data-filter-sort]');
  if (sort) {
    sort.addEventListener('change', () => {
      filters.sort = sort.value as typeof filters.sort;
      renderGrid();
    });
  }

  const archived = qs<HTMLInputElement>('[data-filter-archived]');
  if (archived) {
    archived.addEventListener('change', () => {
      filters.includeArchived = archived.checked;
      renderGrid();
    });
  }
}

// ── Boot ─────────────────────────────────────────────────────────────

function boot(): void {
  wireFilters();
  renderGrid();
  renderDetail();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
