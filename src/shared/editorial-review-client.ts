/**
 * Client-side annotation UI for the editorial-review dev route.
 *
 * Range semantics: comment ranges are character offsets against the rendered
 * plain text of the current version's draft body (innerText of #draft-body).
 * A raw-markdown offset scheme would require a source-map from remark/rehype
 * that hasn't been plumbed through; plain-text offsets are pragmatic for a
 * dev tool and let us persist highlights across reloads via a text-walker.
 *
 * Both dev routes (audiocontrol and editorialcontrol) bundle this module via
 * a non-inline <script> tag; Astro/Vite dedupe it across entry points.
 */

interface DraftRange {
  start: number;
  end: number;
}

interface DraftVersion {
  version: number;
  markdown: string;
  createdAt: string;
  originatedBy: 'agent' | 'operator';
}

interface DraftWorkflow {
  id: string;
  site: string;
  slug: string;
  state: string;
  currentVersion: number;
  contentKind: 'longform' | 'shortform' | 'outline';
}

interface CommentAnnotation {
  id: string;
  type: 'comment';
  workflowId: string;
  version: number;
  range: DraftRange;
  text: string;
  category?: string;
  createdAt: string;
  /** Quote text captured at comment time against the original version. */
  anchor?: string;
}

interface ResolveAnnotation {
  id: string;
  type: 'resolve';
  workflowId: string;
  commentId: string;
  resolved: boolean;
  createdAt: string;
}

/**
 * Classification applied to every comment annotation when the page
 * renders. Determines how the comment shows up in the UI:
 *   - `current`: anchor belongs to the version being viewed; render
 *     body highlight + sidebar item like before.
 *   - `rebased`: anchor appears exactly once in the current body
 *     text; compute a new range against current text and render the
 *     highlight + a "from v{N}" pill in the sidebar.
 *   - `unresolved`: anchor is missing, absent from the current body,
 *     or appears more than once (ambiguous). Sidebar-only; no body
 *     highlight; labeled "from v{N} · unresolved" so the operator
 *     sees the comment and can re-anchor manually if they want.
 */
type AnnotationStatus = 'current' | 'rebased' | 'unresolved';

interface DraftState {
  workflow: DraftWorkflow;
  currentVersion: DraftVersion;
  versions: DraftVersion[];
}

function q<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`editorial-review: missing required element ${selector}`);
  return el;
}

function qn<T extends Element = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

export function initEditorialReview(): void {
  const stateEl = document.getElementById('draft-state');
  if (!stateEl) return;

  const state = JSON.parse(stateEl.textContent || '{}') as DraftState;
  const workflowId = state.workflow.id;
  const versionNum = state.currentVersion.version;

  const draftBody = q<HTMLElement>('#draft-body');
  const draftEdit = q<HTMLTextAreaElement>('#draft-edit');
  const editToolbar = q<HTMLElement>('[data-edit-toolbar]');
  const editHint = q<HTMLElement>('[data-edit-hint]');
  const addBtn = q<HTMLButtonElement>('[data-add-comment-btn]');
  const composer = q<HTMLElement>('[data-comment-composer]');
  const composerQuote = q<HTMLElement>('[data-composer-quote]');
  const categorySel = q<HTMLSelectElement>('[data-comment-category]');
  const textArea = q<HTMLTextAreaElement>('[data-comment-text]');
  const sidebarList = q<HTMLElement>('[data-sidebar-list]');
  const sidebarEmpty = q<HTMLElement>('[data-sidebar-empty]');
  const toastEl = q<HTMLElement>('[data-toast]');

  let pendingRange: DraftRange | null = null;
  const sidebarIndex = new Map<string, HTMLElement>();

  function showToast(msg: string, isError = false): void {
    toastEl.textContent = msg;
    toastEl.classList.toggle('error', isError);
    toastEl.hidden = false;
    setTimeout(() => { toastEl.hidden = true; }, 4000);
  }

  // ---- Range utilities (plain-text offsets over draftBody) ----

  function computeOffsetFromRange(range: Range): DraftRange | null {
    const root = draftBody;
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
    let start = -1;
    let end = -1;
    let acc = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const len = node.nodeValue?.length ?? 0;
      if (node === range.startContainer) start = acc + range.startOffset;
      if (node === range.endContainer) { end = acc + range.endOffset; break; }
      acc += len;
      node = walker.nextNode();
    }
    if (start < 0 || end < 0 || end <= start) return null;
    return { start, end };
  }

  function wrapRange(offsets: DraftRange, annotationId: string): void {
    const walker = document.createTreeWalker(draftBody, NodeFilter.SHOW_TEXT);
    const segments: { node: Text; localStart: number; localEnd: number }[] = [];
    let acc = 0;
    let node = walker.nextNode() as Text | null;
    while (node) {
      const nodeStart = acc;
      const nodeEnd = acc + (node.nodeValue?.length ?? 0);
      const segStart = Math.max(offsets.start, nodeStart);
      const segEnd = Math.min(offsets.end, nodeEnd);
      if (segEnd > segStart) {
        segments.push({ node, localStart: segStart - nodeStart, localEnd: segEnd - nodeStart });
      }
      acc = nodeEnd;
      node = walker.nextNode() as Text | null;
    }
    // Wrap in reverse so earlier splits don't invalidate later indices.
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (!seg) continue;
      const { node, localStart, localEnd } = seg;
      const value = node.nodeValue ?? '';
      const before = value.slice(0, localStart);
      const middle = value.slice(localStart, localEnd);
      const after = value.slice(localEnd);
      const mark = document.createElement('mark');
      mark.className = 'draft-comment-highlight';
      mark.dataset.annotationId = annotationId;
      mark.textContent = middle;
      const parent = node.parentNode;
      if (!parent) continue;
      if (after) parent.insertBefore(document.createTextNode(after), node.nextSibling);
      parent.insertBefore(mark, node.nextSibling);
      if (before) {
        node.nodeValue = before;
      } else {
        parent.removeChild(node);
      }
    }
  }

  /**
   * Concatenate the raw text-node values of draftBody in the same
   * order `computeOffsetFromRange` and `wrapRange` walk them.
   *
   * Don't use `draftBody.innerText` here — innerText collapses
   * source whitespace (newlines and indentation between block
   * elements) the way CSS renders it, but the stored ranges are
   * indexed against the raw concatenation of text-node values. The
   * two coordinate spaces differ by a few chars whenever the
   * markdown renderer produces multi-char whitespace between blocks,
   * which truncates the quote's leading characters.
   */
  function draftPlainText(): string {
    const walker = document.createTreeWalker(draftBody, NodeFilter.SHOW_TEXT);
    let text = '';
    let node = walker.nextNode();
    while (node) {
      text += node.nodeValue ?? '';
      node = walker.nextNode();
    }
    return text;
  }

  function extractQuote(offsets: DraftRange): string {
    return draftPlainText().slice(offsets.start, offsets.end);
  }

  // ---- Sidebar rendering ----

  function addSidebarItem(annotation: CommentAnnotation, status: AnnotationStatus): void {
    sidebarEmpty.hidden = true;
    const li = document.createElement('li');
    li.className = `er-marginalia-item er-marginalia-item--${status}`;
    li.dataset.annotationId = annotation.id;
    li.dataset.status = status;

    const cat = document.createElement('div');
    cat.className = 'cat';
    // Prefix the status for non-current items so the sidebar makes
    // it unambiguous where the comment came from.
    if (status === 'rebased') {
      cat.textContent = `from v${annotation.version} · ${annotation.category || 'other'}`;
    } else if (status === 'unresolved') {
      cat.textContent = `from v${annotation.version} · unresolved`;
    } else {
      cat.textContent = annotation.category || 'other';
    }

    const quote = document.createElement('div');
    quote.className = 'quote';
    // Rebased comments show the anchor text (displayed at the
    // current, rebased position). Unresolved comments show the
    // original anchor if we have one; legacy annotations without
    // anchor say so explicitly rather than rendering a wrong slice.
    if (status === 'unresolved') {
      quote.textContent = annotation.anchor
        ? annotation.anchor
        : '(legacy comment — no anchor captured)';
    } else {
      quote.textContent = extractQuote(annotation.range);
    }

    const text = document.createElement('p');
    text.className = 'note';
    text.textContent = annotation.text;

    li.appendChild(cat);
    li.appendChild(quote);
    li.appendChild(text);

    // Every live item gets a Resolve affordance, including unresolved
    // (anchor-missing) prior-version comments — resolving them is how
    // the operator says "the edit already handled this."
    const actions = document.createElement('div');
    actions.className = 'er-marginalia-actions';
    const resolveBtn = document.createElement('button');
    resolveBtn.type = 'button';
    resolveBtn.className = 'er-marginalia-action';
    resolveBtn.textContent = 'Resolve';
    resolveBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      void resolveComment(annotation, status);
    });
    actions.appendChild(resolveBtn);
    li.appendChild(actions);

    if (status !== 'unresolved') {
      li.addEventListener('mouseenter', () => setActiveHighlight(annotation.id, true));
      li.addEventListener('mouseleave', () => setActiveHighlight(annotation.id, false));
      li.addEventListener('click', () => scrollToHighlight(annotation.id));
    }

    sidebarList.appendChild(li);
    sidebarIndex.set(annotation.id, li);
  }

  function scrollToHighlight(annotationId: string): void {
    const mark = draftBody.querySelector<HTMLElement>(
      `mark[data-annotation-id="${annotationId}"]`,
    );
    if (mark) {
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setActiveHighlight(annotationId: string, active: boolean): void {
    const marks = draftBody.querySelectorAll<HTMLElement>(
      `mark[data-annotation-id="${annotationId}"]`,
    );
    marks.forEach(m => m.classList.toggle('active', active));
    const item = sidebarIndex.get(annotationId);
    if (item) item.classList.toggle('active', active);
  }

  // ---- Selection -> Add button ----

  document.addEventListener('selectionchange', () => {
    if (draftBody.classList.contains('hidden')) { addBtn.hidden = true; return; }
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { addBtn.hidden = true; return; }
    const range = sel.getRangeAt(0);
    if (!draftBody.contains(range.commonAncestorContainer)) { addBtn.hidden = true; return; }
    const offsets = computeOffsetFromRange(range);
    if (!offsets) { addBtn.hidden = true; return; }
    const rect = range.getBoundingClientRect();
    // The pencil uses `position: absolute`, so `top/left` are relative
    // to the nearest positioned ancestor (the .er-review-shell div).
    // Subtract that ancestor's viewport position from the selection's
    // viewport rect to get the correct offset. Horizontal centering is
    // handled in CSS with `translateX(-50%)` so we don't need to know
    // the pencil's rendered width here.
    // Un-hide FIRST so offsetParent + offsetHeight are measurable.
    addBtn.hidden = false;
    const parent = addBtn.offsetParent instanceof HTMLElement ? addBtn.offsetParent.getBoundingClientRect() : null;
    if (!parent) { addBtn.hidden = true; return; }
    // The pencil uses `position: absolute`, so `top/left` are relative
    // to the nearest positioned ancestor (the .er-review-shell div).
    // Subtract that ancestor's viewport position from the selection's
    // viewport rect to get the correct offset. Horizontal centering
    // is handled in CSS with `translateX(-50%)` so we don't need to
    // know the pencil's rendered width here.
    const PENCIL_GAP = 14; // breathing room (triangle tip + a few px)
    addBtn.style.top = `${rect.top - parent.top - addBtn.offsetHeight - PENCIL_GAP}px`;
    addBtn.style.left = `${rect.left - parent.left + rect.width / 2}px`;
    pendingRange = offsets;
  });

  /**
   * Reveal the in-margin composer at the top of the margin-rail
   * with the selected quote pre-populated. No modal — the composer
   * lives inside the same sidebar that hosts saved marks, so the
   * reading frame never gets pulled out from under the operator.
   */
  function openComposer(): void {
    if (!pendingRange) return;
    composerQuote.textContent = extractQuote(pendingRange);
    textArea.value = '';
    categorySel.value = 'other';
    composer.hidden = false;
    composer.classList.add('er-marginalia-composer--entering');
    // Next frame, strip the entering class so the CSS transition
    // runs. Reading the offsetWidth forces a layout flush which is
    // enough to separate the two class changes into distinct frames.
    void composer.offsetWidth;
    composer.classList.remove('er-marginalia-composer--entering');
    addBtn.hidden = true;
    textArea.focus();
  }

  addBtn.addEventListener('click', openComposer);

  // Operator-friendly second entry: click anywhere in the margin-notes
  // sidebar (but not on an existing note, which has its own scroll-to
  // behavior, and not on the composer itself) to open the composer
  // for the current selection. This honors the natural "I selected
  // text → now I click the margin" instinct that the floating pencil
  // alone doesn't satisfy.
  const sidebar = q<HTMLElement>('[data-comments-sidebar]');
  sidebar.addEventListener('mousedown', (ev) => {
    const target = ev.target instanceof HTMLElement ? ev.target : null;
    // Clicks on an existing note: let that handler run (scroll to highlight).
    if (target?.closest('.er-marginalia-item')) return;
    // Clicks inside the composer: let normal form input behavior run.
    if (target?.closest('[data-comment-composer]')) return;
    // Preserve the selection the browser is about to clear on mouseup.
    // selectionchange already stashed `pendingRange`; just suppress the
    // default mousedown so the selection survives into click.
    ev.preventDefault();
  });
  sidebar.addEventListener('click', (ev) => {
    const target = ev.target instanceof HTMLElement ? ev.target : null;
    if (target?.closest('.er-marginalia-item')) return;
    if (target?.closest('[data-comment-composer]')) return;
    if (!pendingRange) {
      showToast('Select text in the draft first, then click here to mark it.');
      return;
    }
    openComposer();
  });

  // ---- Composer submission ----

  q('[data-action="cancel-comment"]').addEventListener('click', closeComposer);
  q('[data-action="submit-comment"]').addEventListener('click', submitComment);
  // Cmd/Ctrl+Enter submits from anywhere inside the composer.
  composer.addEventListener('keydown', (ev) => {
    const e = ev as KeyboardEvent;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void submitComment();
    }
  });

  function closeComposer(): void {
    composer.hidden = true;
    pendingRange = null;
  }

  async function submitComment(): Promise<void> {
    if (!pendingRange) { closeComposer(); return; }
    const text = textArea.value.trim();
    if (!text) { showToast('Comment text is required', true); return; }
    // Capture the selected text at comment time so later versions
    // can try to re-locate the anchor by content. This is the
    // difference between "margin notes vanish after an edit" and
    // "margin notes survive edits, possibly with a re-anchor hint."
    const anchor = extractQuote(pendingRange);
    const payload = {
      type: 'comment',
      workflowId,
      version: versionNum,
      range: pendingRange,
      text,
      category: categorySel.value,
      anchor,
    };
    try {
      const res = await fetch('/api/dev/editorial-review/annotate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) { showToast(`Annotate failed: ${body.error || res.status}`, true); return; }
      wrapRange(body.annotation.range, body.annotation.id);
      addSidebarItem(body.annotation, 'current');
      closeComposer();
      showToast('Comment saved');
    } catch (e) {
      showToast(`Network error: ${(e as Error).message}`, true);
    }
  }

  // ---- Load existing annotations ----

  /**
   * Try to re-locate a prior-version anchor in the current body.
   * Returns a current-body range if the anchor appears exactly
   * once, null otherwise. Missing anchors (legacy annotations)
   * also return null — those fall through to "unresolved" in the
   * caller.
   */
  function rebaseAnchor(anchor: string | undefined): DraftRange | null {
    if (!anchor || anchor.length === 0) return null;
    const text = draftPlainText();
    const first = text.indexOf(anchor);
    if (first < 0) return null;
    const next = text.indexOf(anchor, first + 1);
    if (next >= 0) return null; // ambiguous — refuse to guess.
    return { start: first, end: first + anchor.length };
  }

  /**
   * Walk the resolve annotations for this workflow and compute
   * which comments are currently resolved. Resolves are append-only
   * events; the latest event for a given commentId wins. This lets
   * Resolve/Reopen both persist through the same journal shape
   * without mutating past records.
   */
  function computeResolvedSet(all: ResolveAnnotation[]): Set<string> {
    const byCreatedAt = [...all].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const state = new Map<string, boolean>();
    for (const r of byCreatedAt) state.set(r.commentId, r.resolved);
    const resolved = new Set<string>();
    for (const [commentId, isResolved] of state) {
      if (isResolved) resolved.add(commentId);
    }
    return resolved;
  }

  /** Resolved comments kept in memory so the "Show resolved" toggle
   * can render them without a re-fetch. */
  const resolvedHistory: { ann: CommentAnnotation; status: AnnotationStatus }[] = [];

  async function loadAnnotations(): Promise<void> {
    try {
      // Omit `version` — the server returns every annotation for the
      // workflow. The client decides per-annotation how to display
      // it based on whether it belongs to the current version, can
      // be rebased, or is unresolved.
      const url = `/api/dev/editorial-review/annotations?workflowId=${encodeURIComponent(workflowId)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const body = await res.json();
      const all: Array<CommentAnnotation | ResolveAnnotation> = body.annotations || [];
      const comments = all.filter((a): a is CommentAnnotation => a.type === 'comment');
      const resolves = all.filter((a): a is ResolveAnnotation => a.type === 'resolve');
      const resolvedIds = computeResolvedSet(resolves);

      // Stable render order: current-version first, then rebased
      // (by original version desc), then unresolved (by original
      // version desc). Keeps the natural reading focus on the
      // version actually under review.
      const current: CommentAnnotation[] = [];
      const rebased: { ann: CommentAnnotation; range: DraftRange }[] = [];
      const unanchored: CommentAnnotation[] = [];
      for (const a of comments) {
        if (resolvedIds.has(a.id)) {
          // Resolved — keep in history so the toggle can resurface
          // them, but don't render in the live stream.
          let status: AnnotationStatus = 'current';
          if (a.version !== versionNum) {
            status = rebaseAnchor(a.anchor) ? 'rebased' : 'unresolved';
          }
          resolvedHistory.push({ ann: a, status });
          continue;
        }
        if (a.version === versionNum) {
          current.push(a);
          continue;
        }
        const rebasedRange = rebaseAnchor(a.anchor);
        if (rebasedRange) rebased.push({ ann: a, range: rebasedRange });
        else unanchored.push(a);
      }
      rebased.sort((a, b) => b.ann.version - a.ann.version);
      unanchored.sort((a, b) => b.version - a.version);

      for (const a of current) {
        wrapRange(a.range, a.id);
        addSidebarItem(a, 'current');
      }
      for (const r of rebased) {
        wrapRange(r.range, r.ann.id);
        addSidebarItem(r.ann, 'rebased');
      }
      for (const a of unanchored) {
        // No body highlight; sidebar-only.
        addSidebarItem(a, 'unresolved');
      }
      updateResolvedFooter();
    } catch (e) {
      showToast(`Failed to load annotations: ${(e as Error).message}`, true);
    }
  }

  // ---- Resolve / re-open ----

  async function postResolve(commentId: string, resolved: boolean): Promise<boolean> {
    try {
      const res = await fetch('/api/dev/editorial-review/annotate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'resolve', workflowId, commentId, resolved }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(`Resolve failed: ${body.error || res.status}`, true);
        return false;
      }
      return true;
    } catch (e) {
      showToast(`Network error: ${(e as Error).message}`, true);
      return false;
    }
  }

  async function resolveComment(annotation: CommentAnnotation, status: AnnotationStatus): Promise<void> {
    const ok = await postResolve(annotation.id, true);
    if (!ok) return;
    // Remove highlight + sidebar item; stash in resolvedHistory.
    removeHighlight(annotation.id);
    const item = sidebarIndex.get(annotation.id);
    if (item) item.remove();
    sidebarIndex.delete(annotation.id);
    resolvedHistory.push({ ann: annotation, status });
    updateResolvedFooter();
    maybeShowEmpty();
    showToast('Marked resolved');
  }

  async function reopenComment(annotation: CommentAnnotation, status: AnnotationStatus): Promise<void> {
    const ok = await postResolve(annotation.id, false);
    if (!ok) return;
    // Pop from history, render back into the live list.
    const idx = resolvedHistory.findIndex(r => r.ann.id === annotation.id);
    if (idx >= 0) resolvedHistory.splice(idx, 1);
    if (status === 'rebased') {
      const r = rebaseAnchor(annotation.anchor);
      if (r) wrapRange(r, annotation.id);
    } else if (status === 'current') {
      wrapRange(annotation.range, annotation.id);
    }
    addSidebarItem(annotation, status);
    updateResolvedFooter();
    showToast('Re-opened');
  }

  function removeHighlight(annotationId: string): void {
    draftBody
      .querySelectorAll<HTMLElement>(`mark[data-annotation-id="${annotationId}"]`)
      .forEach(m => {
        const parent = m.parentNode;
        if (!parent) return;
        // Replace the mark with a plain text node so the draft body
        // reads cleanly after resolve. Adjacent text nodes will be
        // merged on the next re-render; fine for dev.
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m);
      });
  }

  function maybeShowEmpty(): void {
    const anyLive = sidebarList.querySelector('.er-marginalia-item');
    sidebarEmpty.hidden = !!anyLive;
  }

  /** The collapsible "Resolved" footer at the bottom of the sidebar. */
  function updateResolvedFooter(): void {
    let footer = sidebar.querySelector<HTMLElement>('[data-resolved-footer]');
    if (resolvedHistory.length === 0) {
      if (footer) footer.remove();
      return;
    }
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'er-marginalia-resolved';
      footer.dataset.resolvedFooter = '';
      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'er-marginalia-resolved-header';
      header.dataset.resolvedToggle = '';
      header.setAttribute('aria-expanded', 'false');
      const list = document.createElement('ol');
      list.className = 'er-marginalia-resolved-list';
      list.dataset.resolvedList = '';
      list.hidden = true;
      footer.appendChild(header);
      footer.appendChild(list);
      sidebar.appendChild(footer);

      header.addEventListener('click', () => {
        const open = list.hidden;
        list.hidden = !open;
        header.setAttribute('aria-expanded', String(open));
      });
    }
    const headerBtn = footer.querySelector<HTMLButtonElement>('[data-resolved-toggle]');
    const list = footer.querySelector<HTMLElement>('[data-resolved-list]');
    if (!headerBtn || !list) return;
    headerBtn.textContent = `Resolved (${resolvedHistory.length}) ▾`;
    list.innerHTML = '';
    for (const { ann, status } of resolvedHistory) {
      list.appendChild(renderResolvedItem(ann, status));
    }
  }

  function renderResolvedItem(ann: CommentAnnotation, status: AnnotationStatus): HTMLElement {
    const li = document.createElement('li');
    li.className = 'er-marginalia-item er-marginalia-item--resolved';
    li.dataset.annotationId = ann.id;

    const cat = document.createElement('div');
    cat.className = 'cat';
    const origin = status === 'current' ? `v${ann.version}` : `from v${ann.version}`;
    cat.textContent = `${origin} · ${ann.category || 'other'} · resolved`;

    const quote = document.createElement('div');
    quote.className = 'quote';
    quote.textContent = ann.anchor
      ? ann.anchor
      : status === 'unresolved'
        ? '(legacy — no anchor captured)'
        : extractQuote(ann.range);

    const text = document.createElement('p');
    text.className = 'note';
    text.textContent = ann.text;

    const actions = document.createElement('div');
    actions.className = 'er-marginalia-actions';
    const reopenBtn = document.createElement('button');
    reopenBtn.type = 'button';
    reopenBtn.className = 'er-marginalia-action';
    reopenBtn.textContent = 'Re-open';
    reopenBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      void reopenComment(ann, status);
    });
    actions.appendChild(reopenBtn);

    li.appendChild(cat);
    li.appendChild(quote);
    li.appendChild(text);
    li.appendChild(actions);
    return li;
  }

  // ---- Edit mode ----

  const toggleBtn = q<HTMLButtonElement>('[data-action="toggle-edit"]');
  const cancelEditBtn = q<HTMLButtonElement>('[data-action="cancel-edit"]');
  const saveVersionBtn = q<HTMLButtonElement>('[data-action="save-version"]');
  const editSourceHost = q<HTMLElement>('[data-edit-source]');
  const editPreviewHost = q<HTMLElement>('[data-edit-preview]');
  const editPanes = q<HTMLElement>('[data-edit-panes]');
  const editModeBtns = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-edit-view]'),
  );
  let editing = false;
  let editorHandle: import('./editorial-review-editor').EditorHandle | null = null;
  let previewDebounce: number | null = null;

  /** Debounced render of the current source into the preview pane. */
  function schedulePreview(md: string): void {
    if (previewDebounce !== null) window.clearTimeout(previewDebounce);
    previewDebounce = window.setTimeout(async () => {
      try {
        const { renderMarkdownToHtml, parseDraftFrontmatter } = await import(
          '../../scripts/lib/editorial-review/render.js'
        );
        const parsed = parseDraftFrontmatter(md);
        const html = await renderMarkdownToHtml(parsed.body);
        editPreviewHost.innerHTML = html;
      } catch (e) {
        editPreviewHost.innerHTML = `<p class="er-edit-preview-error">Preview failed: ${(e as Error).message}</p>`;
      }
    }, 120);
  }

  /** Flip the three-way Source / Split / Preview toggle. */
  function setEditView(view: 'source' | 'split' | 'preview'): void {
    editPanes.dataset.view = view;
    for (const btn of editModeBtns) {
      btn.setAttribute('aria-pressed', String(btn.dataset.editView === view));
    }
    // If the split / preview pane just became visible with stale
    // content, refresh it synchronously so the operator never sees
    // an empty pane.
    if (view !== 'source' && editorHandle) {
      schedulePreview(editorHandle.getValue());
    }
  }

  for (const btn of editModeBtns) {
    btn.addEventListener('click', () => {
      const v = btn.dataset.editView as 'source' | 'split' | 'preview';
      setEditView(v);
    });
  }

  async function enterEdit(): Promise<void> {
    draftEdit.value = state.currentVersion.markdown;
    editToolbar.hidden = false;
    draftBody.classList.add('hidden');
    toggleBtn.textContent = 'View';
    editing = true;
    // Lazy-import the editor module so the CodeMirror bundle only
    // loads when the operator actually enters edit mode.
    const { mountEditor } = await import('./editorial-review-editor.ts');
    if (editorHandle) editorHandle.destroy();
    editSourceHost.innerHTML = '';
    editorHandle = mountEditor({
      host: editSourceHost,
      doc: state.currentVersion.markdown,
      onChange: (md) => {
        draftEdit.value = md;
        updateSaveState();
        if (editPanes.dataset.view !== 'source') schedulePreview(md);
      },
      onSave: () => { saveVersionBtn.click(); },
      onCancel: () => {
        // In focus mode, Esc peels focus off but leaves the edit
        // session alive. In regular edit mode, Esc cancels the edit.
        if (document.body.classList.contains('er-focus-mode')) {
          exitFocus();
        } else {
          cancelEditBtn.click();
        }
      },
    });
    updateSaveState();
    // Default view is split — shows what the source will look like
    // as you type. Operators who want focus switch to Source or Preview.
    setEditView('split');
    editToolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    editorHandle.focus();
    schedulePreview(state.currentVersion.markdown);
  }

  function exitEdit(): void {
    // Exit focus mode first so the chrome comes back before we hide it.
    if (document.body.classList.contains('er-focus-mode')) {
      document.body.classList.remove('er-focus-mode');
      const fb = document.querySelector<HTMLButtonElement>('[data-action="focus-mode"]');
      fb?.setAttribute('aria-pressed', 'false');
    }
    editToolbar.hidden = true;
    draftBody.classList.remove('hidden');
    toggleBtn.textContent = 'Edit';
    editing = false;
    if (editorHandle) {
      editorHandle.destroy();
      editorHandle = null;
    }
    editSourceHost.innerHTML = '';
    editPreviewHost.innerHTML = '';
  }

  function updateSaveState(): void {
    const changed = draftEdit.value !== state.currentVersion.markdown;
    saveVersionBtn.disabled = !changed;
    editHint.textContent = changed ? 'Modified' : 'No changes';
    // Mirror the hint into the focus-mode corner affordance.
    if (focusSaveHint) focusSaveHint.textContent = changed ? 'Modified' : 'No changes';
  }

  toggleBtn.addEventListener('click', () => {
    if (editing) exitEdit();
    else void enterEdit();
  });
  cancelEditBtn.addEventListener('click', exitEdit);

  // ---- Focus mode ----
  //
  // Full-viewport, single-column, chrome-free editor. The press-check
  // metaphor is "the galley under the lamp" — everything except the
  // page being edited recedes. Exit on Esc, Shift+F, or the floating
  // affordance in the top-left corner.

  const focusBtn = document.querySelector<HTMLButtonElement>('[data-action="focus-mode"]');
  const exitFocusBtn = document.querySelector<HTMLButtonElement>('[data-action="exit-focus"]');
  const focusSaveHint = document.querySelector<HTMLElement>('[data-focus-save-hint]');
  let focusMode = false;

  function enterFocus(): void {
    if (!editing) return;
    document.body.classList.add('er-focus-mode');
    focusBtn?.setAttribute('aria-pressed', 'true');
    focusMode = true;
    // Force source-only; split/preview don't make sense in focus.
    setEditView('source');
    // Sync the save hint into the corner indicator.
    syncFocusSave();
    editorHandle?.focus();
  }

  function exitFocus(): void {
    document.body.classList.remove('er-focus-mode');
    focusBtn?.setAttribute('aria-pressed', 'false');
    focusMode = false;
  }

  function syncFocusSave(): void {
    if (!focusSaveHint) return;
    focusSaveHint.textContent = editHint.textContent ?? '';
  }

  focusBtn?.addEventListener('click', () => {
    if (focusMode) exitFocus();
    else enterFocus();
  });
  exitFocusBtn?.addEventListener('click', exitFocus);

  // Double-click anywhere in the rendered draft enters edit mode. This
  // mirrors the comment gesture (select → Mark) with its own shape so
  // the operator doesn't have to reach for the top strip. Ignore
  // double-clicks inside highlight marks so we don't steal the
  // annotation scroll-to behavior that click handlers attach later.
  draftBody.addEventListener('dblclick', (ev) => {
    if (editing) return;
    const target = ev.target;
    if (target instanceof HTMLElement && target.closest('mark.draft-comment-highlight')) return;
    // Clear the double-click text selection the browser made on the way in
    // — otherwise the Mark button reappears alongside the editor.
    window.getSelection()?.removeAllRanges();
    void enterEdit();
  });

  saveVersionBtn.addEventListener('click', async () => {
    if (saveVersionBtn.disabled) return;
    saveVersionBtn.disabled = true;
    editHint.textContent = 'Saving...';
    try {
      const res = await fetch('/api/dev/editorial-review/version', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          beforeVersion: state.currentVersion.version,
          afterMarkdown: draftEdit.value,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(`Save failed: ${body.error || res.status}`, true);
        updateSaveState();
        return;
      }
      showToast(`Saved v${body.version.version}`);
      window.location.href = `?v=${body.version.version}`;
    } catch (e) {
      showToast(`Network error: ${(e as Error).message}`, true);
      updateSaveState();
    }
  });

  // ---- Decision buttons (Approve / Iterate / Reject) ----

  async function postDecision(to: string): Promise<boolean> {
    const res = await fetch('/api/dev/editorial-review/decision', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workflowId, to }),
    });
    const body = await res.json();
    if (!res.ok) { showToast(`Decision failed: ${body.error || res.status}`, true); return false; }
    return true;
  }

  // If the workflow is still in `open`, bridge to `in-review` first so the
  // downstream transition (approved/iterating) is legal per VALID_TRANSITIONS.
  async function ensureInReview(): Promise<boolean> {
    if (state.workflow.state !== 'open') return true;
    return postDecision('in-review');
  }

  async function postApproveAnnotation(): Promise<boolean> {
    const res = await fetch('/api/dev/editorial-review/annotate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'approve', workflowId, version: versionNum }),
    });
    return res.ok;
  }

  async function postRejectAnnotation(reason: string): Promise<boolean> {
    const res = await fetch('/api/dev/editorial-review/annotate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'reject', workflowId, version: versionNum, reason }),
    });
    return res.ok;
  }

  const approveBtn = qn<HTMLButtonElement>('[data-action="approve"]');
  const iterateBtn = qn<HTMLButtonElement>('[data-action="iterate"]');
  const rejectBtn = qn<HTMLButtonElement>('[data-action="reject"]');

  /**
   * Copy the Claude Code command that the operator needs to run next
   * to the clipboard. Studio clicks only transition the workflow state;
   * the actual cognitive work (iterate, approve-and-write, etc.) lives
   * in a skill that must be invoked by the operator. Without the
   * clipboard copy + toast, the operator is left staring at a page
   * that looks like it did something but didn't tell them what's next.
   */
  async function copyAndToast(command: string, hint: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
      showToast(`${hint}  (command copied — paste into Claude Code)`);
    } catch {
      showToast(`${hint}  Run: ${command}`, true);
    }
  }

  approveBtn?.addEventListener('click', async () => {
    approveBtn.disabled = true;
    const bridged = await ensureInReview();
    if (!bridged) { approveBtn.disabled = false; return; }
    await postApproveAnnotation();
    const ok = await postDecision('approved');
    if (!ok) { approveBtn.disabled = false; return; }
    // Approve writes to disk + transitions to applied; both are done
    // by /editorial-approve (longform/shortform) or
    // /editorial-outline-approve (outline) in Claude Code, not by
    // the studio click. Build the command that matches the workflow.
    const site = state.workflow.site;
    const slug = state.workflow.slug;
    const kind = state.workflow.contentKind;
    const approveCmd =
      kind === 'outline'
        ? `/editorial-outline-approve --site ${site} ${slug}`
        : `/editorial-approve --site ${site} ${slug}`;
    const approveHint =
      kind === 'outline'
        ? `Approved outline v${versionNum}. Next: /editorial-outline-approve advances the calendar Outlining → Drafting.`
        : `Approved v${versionNum}. Next: /editorial-approve writes the file and marks the workflow applied.`;
    await copyAndToast(approveCmd, approveHint);
    setTimeout(() => window.location.reload(), 2400);
  });

  iterateBtn?.addEventListener('click', async () => {
    iterateBtn.disabled = true;
    const bridged = await ensureInReview();
    if (!bridged) { iterateBtn.disabled = false; return; }
    const ok = await postDecision('iterating');
    if (!ok) { iterateBtn.disabled = false; return; }
    const site = state.workflow.site;
    const slug = state.workflow.slug;
    const kind = state.workflow.contentKind;
    // /editorial-iterate defaults to --kind longform; outline
    // workflows need the flag so the helper picks the right workflow.
    const iterateCmd =
      kind === 'outline'
        ? `/editorial-iterate --kind outline --site ${site} ${slug}`
        : `/editorial-iterate --site ${site} ${slug}`;
    await copyAndToast(
      iterateCmd,
      `Iterating on v${versionNum}. Next: ${iterateCmd} revises against your comments and appends v${versionNum + 1}.`,
    );
    setTimeout(() => window.location.reload(), 2400);
  });

  rejectBtn?.addEventListener('click', async () => {
    const reason = window.prompt('Optional reason for rejection:') || '';
    rejectBtn.disabled = true;
    if (reason) await postRejectAnnotation(reason);
    const ok = await postDecision('cancelled');
    if (ok) {
      // Reject is terminal; nothing for the operator to run in Claude
      // Code. Just confirm and reload.
      showToast('Workflow cancelled.');
      setTimeout(() => window.location.reload(), 900);
    } else {
      rejectBtn.disabled = false;
    }
  });

  // ---- Keyboard shortcuts ----

  const shortcutsOverlay = qn<HTMLElement>('[data-shortcuts-overlay]');
  const shortcutsBackdrop = qn<HTMLElement>('[data-shortcuts-backdrop]');
  const shortcutsBtn = qn<HTMLButtonElement>('[data-action="shortcuts"]');

  function showShortcuts(show: boolean): void {
    if (!shortcutsOverlay) return;
    shortcutsOverlay.hidden = !show;
  }
  shortcutsBtn?.addEventListener('click', () => showShortcuts(true));
  shortcutsBackdrop?.addEventListener('click', () => showShortcuts(false));

  let commentFocusIndex = -1;
  function focusCommentByIndex(dir: 1 | -1): void {
    const items = Array.from(sidebarList.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    if (items.length === 0) return;
    commentFocusIndex =
      (commentFocusIndex + dir + items.length) % items.length;
    const target = items[commentFocusIndex];
    items.forEach(el => el.classList.remove('active'));
    target.classList.add('active');
    const id = target.dataset.annotationId;
    if (id) {
      scrollToHighlight(id);
      setActiveHighlight(id, true);
      setTimeout(() => setActiveHighlight(id, false), 1800);
    }
  }

  document.addEventListener('keydown', (ev) => {
    // Don't hijack keys while typing
    const target = ev.target instanceof HTMLElement ? ev.target : null;
    const typing = target !== null && (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
    if (typing) {
      if (ev.key === 'Escape') {
        // In focus mode, Esc exits focus first — the editor itself
        // stays open. Regular edit mode's Esc still blurs + dismisses
        // the composer if that's what the operator was typing in.
        if (focusMode) {
          ev.preventDefault();
          exitFocus();
          return;
        }
        target.blur();
        if (!composer.hidden) closeComposer();
      }
      return;
    }
    // Don't hijack with modifiers
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

    if (ev.key === '?' || (ev.key === '/' && ev.shiftKey)) {
      ev.preventDefault();
      showShortcuts(!shortcutsOverlay || shortcutsOverlay.hidden);
      return;
    }
    if (ev.key === 'Escape') {
      if (shortcutsOverlay && !shortcutsOverlay.hidden) { showShortcuts(false); return; }
      if (!composer.hidden) { closeComposer(); return; }
      if (focusMode) { exitFocus(); return; }
    }
    // Shift+F toggles focus mode from anywhere on the page (as long
    // as the operator isn't typing, which the `typing` branch above
    // already handled).
    if (ev.shiftKey && ev.key === 'F') {
      ev.preventDefault();
      if (!editing) return;
      if (focusMode) exitFocus(); else enterFocus();
      return;
    }
    if (ev.key === 'e') { ev.preventDefault(); toggleBtn.click(); return; }
    if (ev.key === 'a') { ev.preventDefault(); approveBtn?.click(); return; }
    if (ev.key === 'i') { ev.preventDefault(); iterateBtn?.click(); return; }
    if (ev.key === 'r') { ev.preventDefault(); rejectBtn?.click(); return; }
    if (ev.key === 'j') { ev.preventDefault(); focusCommentByIndex(1); return; }
    if (ev.key === 'k') { ev.preventDefault(); focusCommentByIndex(-1); return; }
  });

  // ---- Polling: check for new versions or state changes ----

  const pollIndicator = qn<HTMLElement>('[data-poll]');
  const POLL_MS = 8000;
  let pollingBusy = false;

  async function poll(): Promise<void> {
    if (pollingBusy || editing) return;
    pollingBusy = true;
    try {
      const res = await fetch(
        `/api/dev/editorial-review/workflow?id=${encodeURIComponent(workflowId)}`,
      );
      if (!res.ok) return;
      const body = await res.json();
      const w = body.workflow as { currentVersion: number; state: string } | undefined;
      if (!w) return;
      const currentVersionChanged = w.currentVersion !== state.workflow.currentVersion;
      const stateChanged = w.state !== state.workflow.state;
      if (currentVersionChanged) {
        showToast(`New version v${w.currentVersion} available — reloading…`);
        setTimeout(() => {
          window.location.href = `?v=${w.currentVersion}`;
        }, 1200);
      } else if (stateChanged) {
        showToast(`State changed: ${state.workflow.state} → ${w.state}`);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      // network hiccup — ignore and try again next tick
    } finally {
      pollingBusy = false;
    }
  }

  async function tick(): Promise<void> {
    if (pollIndicator) pollIndicator.classList.add('polling');
    try {
      await poll();
    } finally {
      if (pollIndicator) pollIndicator.classList.remove('polling');
    }
  }
  setInterval(tick, POLL_MS);

  // ---- Boot ----

  loadAnnotations();
}

initEditorialReview();
