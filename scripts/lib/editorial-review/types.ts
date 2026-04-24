import type { Platform, Site } from '../editorial/types.js';

export type DraftWorkflowState =
  | 'open'
  | 'in-review'
  | 'iterating'
  | 'approved'
  | 'applied'
  | 'cancelled';

export type ContentKind = 'longform' | 'shortform' | 'outline';

export type OriginatedBy = 'agent' | 'operator';

/**
 * Annotation category for comments. Phase 12 aggregates these to surface
 * which voice-skill principles produce the most drift. `other` is the
 * catch-all for comments that don't map to a recognized pattern.
 */
export type AnnotationCategory =
  | 'voice-drift'
  | 'missing-receipt'
  | 'tutorial-framing'
  | 'saas-vocabulary'
  | 'fake-authority'
  | 'structural'
  | 'other';

/** Character-offset range against the raw markdown source. */
export interface DraftRange {
  start: number;
  end: number;
}

interface AnnotationBase {
  /** ISO-8601 timestamp when the annotation was recorded. */
  createdAt: string;
  /** Workflow the annotation belongs to. */
  workflowId: string;
  /** Monotonic id within the workflow (server-assigned). */
  id: string;
}

export interface CommentAnnotation extends AnnotationBase {
  type: 'comment';
  /** Draft version the comment was attached to. */
  version: number;
  /** Character range against the raw markdown of that version. */
  range: DraftRange;
  /** Free-text operator comment. */
  text: string;
  /** Optional category for Phase 12 aggregation. */
  category?: AnnotationCategory;
  /**
   * The displayed text the operator selected when they made the
   * comment. Captured at creation time against the version's
   * rendered body. Used on later versions to re-locate the anchor
   * via `indexOf`: if the quote appears exactly once in the new
   * version, the comment is rebased; otherwise it's shown as
   * unresolved-from-v{N}. Optional so pre-rebase annotations still
   * load; they render as unresolved.
   */
  anchor?: string;
}

export interface EditAnnotation extends AnnotationBase {
  type: 'edit';
  /** Version that was edited (the source of the edit). */
  beforeVersion: number;
  /** Full markdown of the new version the edit produced. */
  afterMarkdown: string;
  /** Unified diff of afterMarkdown against the beforeVersion's markdown. */
  diff: string;
}

export interface ApproveAnnotation extends AnnotationBase {
  type: 'approve';
  /** Version the operator approved. */
  version: number;
}

export interface RejectAnnotation extends AnnotationBase {
  type: 'reject';
  /** Version the operator rejected. */
  version: number;
  /** Optional reason free-text. */
  reason?: string;
}

/**
 * Marks a specific comment annotation as resolved — the operator
 * acted on it (or decided the edit made it moot) and doesn't need
 * to see it in the live sidebar anymore.
 *
 * Emitted as a separate record rather than mutating the comment,
 * because the journal is append-only. Readers reconstruct a
 * comment's resolved state by scanning for the most recent
 * resolve annotation that points at the comment's id. An explicit
 * `resolved: false` value re-opens the comment (toggles the state
 * back to unresolved) — so resolution is fully reversible without
 * deleting history.
 */
export interface ResolveAnnotation extends AnnotationBase {
  type: 'resolve';
  /** The comment's id this resolution refers to. */
  commentId: string;
  /** `true` to resolve, `false` to re-open. Default true. */
  resolved: boolean;
}

/**
 * Agent's per-comment disposition for a specific iteration. Written by
 * `finalize.ts` after it appends the new version. Unlike `resolve` —
 * which is operator-driven and terminal — `address` is a lightweight
 * claim: "in vN, I handled this comment by doing X." The sidebar
 * reads the most recent address annotation per comment to stamp
 * "Addressed in vN" / "Deferred in vN" badges, so the operator can
 * see at a glance what the latest iteration touched.
 *
 * Multiple address annotations on the same commentId are allowed —
 * a later iteration can revise the disposition. Latest-wins per
 * `createdAt` when rendering the badge.
 */
export interface AddressAnnotation extends AnnotationBase {
  type: 'address';
  /** The comment this disposition refers to. */
  commentId: string;
  /** The version this disposition was recorded on (the version the agent just produced). */
  version: number;
  /** How the agent handled this comment in that version. */
  disposition: 'addressed' | 'deferred' | 'wontfix';
  /** Optional free-text explanation the agent surfaced. */
  reason?: string;
}

export type DraftAnnotation =
  | CommentAnnotation
  | EditAnnotation
  | ApproveAnnotation
  | RejectAnnotation
  | ResolveAnnotation
  | AddressAnnotation;

export interface DraftVersion {
  /** 1-based version number; v1 is the initial draft. */
  version: number;
  /** Full raw markdown of this version. */
  markdown: string;
  /** ISO-8601 when this version was recorded. */
  createdAt: string;
  /** Who produced this version — the agent or the operator (edit mode). */
  originatedBy: OriginatedBy;
}

export interface DraftWorkflowItem {
  /** Stable UUID for this workflow. */
  id: string;
  /**
   * Stable UUID of the target calendar entry. Preferred join key for
   * `matchesKey` / `findOpenByKey` — survives slug renames. Optional
   * for legacy workflows created before Phase 18a; those keep joining
   * via the slug fallback.
   */
  entryId?: string;
  /** Which site this draft belongs to. */
  site: Site;
  /** Post slug (blog entry slug for longform; calendar entry slug for shortform). */
  slug: string;
  /** Longform (blog post) or shortform (social-post). */
  contentKind: ContentKind;
  /** For shortform only: which distribution platform. */
  platform?: Platform;
  /** For shortform only: channel (e.g. `r/synthdiy`). */
  channel?: string;
  /** Current state in the review pipeline. */
  state: DraftWorkflowState;
  /** Version number of the most recent `DraftVersion` for this workflow. */
  currentVersion: number;
  /** ISO-8601 when the workflow was first created. */
  createdAt: string;
  /** ISO-8601 when the workflow was last modified (state transition or new version). */
  updatedAt: string;
}

/**
 * A single entry in the editorial-review history journal (one JSON file
 * per entry under `journal/editorial/history/` as of Phase 14c).
 * Discriminated by `kind` so we can interleave versions, annotations,
 * and workflow transitions in one stream.
 */
export type DraftHistoryEntry =
  | { kind: 'workflow-created'; at: string; workflow: DraftWorkflowItem }
  | { kind: 'workflow-state'; at: string; workflowId: string; from: DraftWorkflowState; to: DraftWorkflowState }
  | { kind: 'version'; at: string; workflowId: string; version: DraftVersion }
  | { kind: 'annotation'; at: string; annotation: DraftAnnotation };

/** Allowed state transitions. All others are invalid. */
export const VALID_TRANSITIONS: Readonly<Record<DraftWorkflowState, readonly DraftWorkflowState[]>> = {
  open: ['in-review', 'cancelled'],
  'in-review': ['iterating', 'approved', 'cancelled'],
  iterating: ['in-review', 'cancelled'],
  approved: ['applied', 'cancelled'],
  applied: [],
  cancelled: [],
};

export function isValidTransition(from: DraftWorkflowState, to: DraftWorkflowState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
