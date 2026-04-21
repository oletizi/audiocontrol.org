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
}

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
  const modal = q<HTMLElement>('[data-comment-modal]');
  const modalQuote = q<HTMLElement>('[data-modal-quote]');
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

  function extractQuote(offsets: DraftRange): string {
    const text = draftBody.innerText || '';
    return text.slice(offsets.start, offsets.end);
  }

  // ---- Sidebar rendering ----

  function addSidebarItem(annotation: CommentAnnotation): void {
    sidebarEmpty.hidden = true;
    const li = document.createElement('li');
    li.className = 'er-marginalia-item';
    li.dataset.annotationId = annotation.id;
    const cat = document.createElement('div');
    cat.className = 'cat';
    cat.textContent = annotation.category || 'other';
    const quote = document.createElement('div');
    quote.className = 'quote';
    quote.textContent = extractQuote(annotation.range);
    const text = document.createElement('p');
    text.className = 'note';
    text.textContent = annotation.text;
    li.appendChild(cat);
    li.appendChild(quote);
    li.appendChild(text);
    li.addEventListener('mouseenter', () => setActiveHighlight(annotation.id, true));
    li.addEventListener('mouseleave', () => setActiveHighlight(annotation.id, false));
    li.addEventListener('click', () => scrollToHighlight(annotation.id));
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
    addBtn.style.top = `${window.scrollY + rect.top - 34}px`;
    addBtn.style.left = `${window.scrollX + rect.left + rect.width / 2 - 50}px`;
    addBtn.hidden = false;
    pendingRange = offsets;
  });

  addBtn.addEventListener('click', () => {
    if (!pendingRange) return;
    modalQuote.textContent = extractQuote(pendingRange);
    textArea.value = '';
    categorySel.value = 'other';
    modal.hidden = false;
    addBtn.hidden = true;
    textArea.focus();
  });

  // ---- Modal submission ----

  q('[data-modal-backdrop]').addEventListener('click', closeModal);
  q('[data-action="cancel-comment"]').addEventListener('click', closeModal);
  q('[data-action="submit-comment"]').addEventListener('click', submitComment);

  function closeModal(): void { modal.hidden = true; pendingRange = null; }

  async function submitComment(): Promise<void> {
    if (!pendingRange) { closeModal(); return; }
    const text = textArea.value.trim();
    if (!text) { showToast('Comment text is required', true); return; }
    const payload = {
      type: 'comment',
      workflowId,
      version: versionNum,
      range: pendingRange,
      text,
      category: categorySel.value,
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
      addSidebarItem(body.annotation);
      closeModal();
      showToast('Comment saved');
    } catch (e) {
      showToast(`Network error: ${(e as Error).message}`, true);
    }
  }

  // ---- Load existing annotations ----

  async function loadAnnotations(): Promise<void> {
    try {
      const url = `/api/dev/editorial-review/annotations?workflowId=${encodeURIComponent(workflowId)}&version=${versionNum}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const body = await res.json();
      const comments: CommentAnnotation[] = (body.annotations || []).filter(
        (a: { type: string }) => a.type === 'comment',
      );
      for (const a of comments) {
        wrapRange(a.range, a.id);
        addSidebarItem(a);
      }
    } catch (e) {
      showToast(`Failed to load annotations: ${(e as Error).message}`, true);
    }
  }

  // ---- Edit mode ----

  const toggleBtn = q<HTMLButtonElement>('[data-action="toggle-edit"]');
  const cancelEditBtn = q<HTMLButtonElement>('[data-action="cancel-edit"]');
  const saveVersionBtn = q<HTMLButtonElement>('[data-action="save-version"]');
  let editing = false;

  function enterEdit(): void {
    draftEdit.value = state.currentVersion.markdown;
    draftEdit.hidden = false;
    editToolbar.hidden = false;
    draftBody.classList.add('hidden');
    toggleBtn.textContent = 'View';
    editing = true;
    updateSaveState();
    // Scroll the textarea into view — BlogLayout header and feature
    // image otherwise keep it below the fold on first click.
    draftEdit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    draftEdit.focus({ preventScroll: true });
  }

  function exitEdit(): void {
    draftEdit.hidden = true;
    editToolbar.hidden = true;
    draftBody.classList.remove('hidden');
    toggleBtn.textContent = 'Edit';
    editing = false;
  }

  function updateSaveState(): void {
    const changed = draftEdit.value !== state.currentVersion.markdown;
    saveVersionBtn.disabled = !changed;
    editHint.textContent = changed ? 'Modified' : 'No changes';
  }

  toggleBtn.addEventListener('click', () => { if (editing) { exitEdit(); } else { enterEdit(); } });
  cancelEditBtn.addEventListener('click', exitEdit);
  draftEdit.addEventListener('input', updateSaveState);

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

  approveBtn?.addEventListener('click', async () => {
    approveBtn.disabled = true;
    const bridged = await ensureInReview();
    if (!bridged) { approveBtn.disabled = false; return; }
    await postApproveAnnotation();
    const ok = await postDecision('approved');
    if (ok) window.location.reload();
    else approveBtn.disabled = false;
  });

  iterateBtn?.addEventListener('click', async () => {
    iterateBtn.disabled = true;
    const bridged = await ensureInReview();
    if (!bridged) { iterateBtn.disabled = false; return; }
    const ok = await postDecision('iterating');
    if (ok) {
      showToast(
        `Run /editorial-iterate ${state.workflow.slug} in Claude Code to draft v${versionNum + 1}`,
      );
      setTimeout(() => window.location.reload(), 1800);
    } else {
      iterateBtn.disabled = false;
    }
  });

  rejectBtn?.addEventListener('click', async () => {
    const reason = window.prompt('Optional reason for rejection:') || '';
    rejectBtn.disabled = true;
    if (reason) await postRejectAnnotation(reason);
    const ok = await postDecision('cancelled');
    if (ok) window.location.reload();
    else rejectBtn.disabled = false;
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
        target.blur();
        // If the operator was typing inside the comment modal, also close it.
        if (!modal.hidden) closeModal();
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
      if (!modal.hidden) { closeModal(); return; }
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
