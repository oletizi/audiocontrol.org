/**
 * Client-side behavior for the /dev/editorial-studio route.
 *
 * Loaded via a non-inline <script> tag in the Astro page. Each row and
 * action button carries its own `data-site` attribute, so the studio
 * can act on workflows from any site without a page-wide site marker.
 *
 * Responsibilities:
 *  - Toast for transient messages
 *  - Copy-to-clipboard buttons for Claude Code commands
 *  - Scaffold-draft button → POST /api/dev/editorial-calendar/draft (site from button)
 *  - Mark-published button → POST /api/dev/editorial-calendar/publish (site from button)
 *  - Text search + stage/site-chip filtering
 *  - Keyboard shortcuts (1-5 jump to stage columns)
 *  - Idle-polling via full-page reload
 */

function siteFromButton(btn: HTMLButtonElement): string {
  const site = btn.dataset.site;
  if (!site) {
    throw new Error(
      `editorial-studio: button is missing data-site (slug=${btn.dataset.slug ?? '?'}). Every row action must carry its site explicitly.`,
    );
  }
  return site;
}

function showToast(msg: string, isError = false): void {
  const toastEl = document.querySelector<HTMLElement>('[data-toast]');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.toggle('error', isError);
  toastEl.hidden = false;
  setTimeout(() => { toastEl.hidden = true; }, 4000);
}

function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.er-copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy ?? '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = 'copied ✓';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = original;
        }, 1500);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        showToast(`Clipboard unavailable (${message}) — copy manually: ${text}`, true);
      }
    });
  });
}

async function postJson(path: string, body: unknown): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload: unknown = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: payload };
}

function bodyError(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    const value = Reflect.get(body, 'error');
    if (typeof value === 'string') return value;
  }
  return fallback;
}

function initScaffoldButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-action="scaffold-draft"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      if (!slug) return;
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'scaffolding…';
      try {
        const result = await postJson('/api/dev/editorial-calendar/draft', {
          site: siteFromButton(btn),
          slug,
        });
        if (!result.ok) {
          showToast(bodyError(result.body, `Scaffold failed: ${result.status}`), true);
          btn.disabled = false;
          btn.textContent = originalText;
          return;
        }
        const relativePath =
          typeof result.body === 'object' && result.body !== null
            ? Reflect.get(result.body, 'relativePath')
            : undefined;
        showToast(
          typeof relativePath === 'string'
            ? `Scaffolded ${relativePath}`
            : `Scaffolded ${slug}`,
        );
        setTimeout(() => window.location.reload(), 900);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        showToast(`Network error: ${message}`, true);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
}

function initPublishButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-action="mark-published"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      if (!slug) return;
      if (!confirm(`Publish ${slug}? This sets datePublished to today.`)) return;
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'publishing…';
      try {
        const result = await postJson('/api/dev/editorial-calendar/publish', {
          site: siteFromButton(btn),
          slug,
        });
        if (!result.ok) {
          showToast(bodyError(result.body, `Publish failed: ${result.status}`), true);
          btn.disabled = false;
          btn.textContent = originalText;
          return;
        }
        showToast(`Published ${slug}`);
        setTimeout(() => window.location.reload(), 900);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        showToast(`Network error: ${message}`, true);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
}

function initFilter(): void {
  const searchInput = document.querySelector<HTMLInputElement>('[data-filter-input]');
  const stageChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-stage-chip]'));
  const siteChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-site-chip]'));
  const allCalRows = Array.from(document.querySelectorAll<HTMLElement>('.er-calendar-row'));
  const stageSections = Array.from(document.querySelectorAll<HTMLElement>('[data-stage-section]'));
  // Shortform coverage rows carry their own `data-site` and deserve the
  // same site filter. They're not inside a stage section so they stay
  // visible regardless of the stage chip.
  const sfRows = Array.from(document.querySelectorAll<HTMLElement>('.er-sf-matrix tbody tr[data-site]'));
  let activeStage = 'all';
  let activeSite = 'all';
  let searchQuery = '';

  function matchesRow(row: HTMLElement): boolean {
    const searchBlob = row.dataset.search ?? '';
    const matchSearch = !searchQuery || searchBlob.includes(searchQuery);
    const matchSite = activeSite === 'all' || row.dataset.site === activeSite;
    return matchSearch && matchSite;
  }

  function applyFilter(): void {
    const stageCounts = new Map<string, number>();
    for (const row of allCalRows) {
      const stage = row.dataset.stage ?? '';
      const matchStage = activeStage === 'all' || stage === activeStage;
      const visible = matchesRow(row) && matchStage;
      row.hidden = !visible;
      if (visible) stageCounts.set(stage, (stageCounts.get(stage) ?? 0) + 1);
    }
    // Hide entire stage sections when they have no visible rows under a filter,
    // but keep originally-empty sections visible (they show their empty state).
    for (const sec of stageSections) {
      const stage = sec.dataset.stageSection ?? '';
      const sectionVisible = (stageCounts.get(stage) ?? 0) > 0;
      const originallyEmpty = !allCalRows.some(r => r.dataset.stage === stage);
      sec.hidden = !sectionVisible && !originallyEmpty;
    }
    for (const row of sfRows) {
      row.hidden = activeSite !== 'all' && row.dataset.site !== activeSite;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.toLowerCase().trim();
      applyFilter();
    });
  }
  for (const chip of stageChips) {
    chip.addEventListener('click', () => {
      stageChips.forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      activeStage = chip.dataset.stageChip ?? 'all';
      applyFilter();
    });
  }
  for (const chip of siteChips) {
    chip.addEventListener('click', () => {
      siteChips.forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      activeSite = chip.dataset.siteChip ?? 'all';
      applyFilter();
    });
  }
}

function initKeyboardShortcuts(): void {
  const stageSections = Array.from(document.querySelectorAll<HTMLElement>('[data-stage-section]'));
  document.addEventListener('keydown', (ev) => {
    const target = ev.target;
    if (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const stageIndex = ['1', '2', '3', '4', '5'].indexOf(ev.key);
    if (stageIndex >= 0 && stageSections[stageIndex]) {
      ev.preventDefault();
      stageSections[stageIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function initPolling(): void {
  const searchInput = document.querySelector<HTMLInputElement>('[data-filter-input]');
  let lastInteraction = Date.now();
  for (const evName of ['input', 'focus', 'keydown', 'mousedown'] as const) {
    document.addEventListener(
      evName,
      () => { lastInteraction = Date.now(); },
      { passive: true, capture: true },
    );
  }
  setInterval(() => {
    if (Date.now() - lastInteraction < 4000) return;
    if (searchInput && searchInput.value.trim().length > 0) return;
    const pollIndicator = document.querySelector<HTMLElement>('[data-poll]');
    if (pollIndicator) pollIndicator.classList.add('polling');
    window.location.reload();
  }, 10000);
}

function init(): void {
  initCopyButtons();
  initScaffoldButtons();
  initPublishButtons();
  initFilter();
  initKeyboardShortcuts();
  initPolling();
}

init();
