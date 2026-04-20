import type { Platform, Site } from '../editorial/types.js';

export type DraftWorkflowState =
  | 'open'
  | 'in-review'
  | 'iterating'
  | 'approved'
  | 'applied'
  | 'cancelled';

export type ContentKind = 'longform' | 'shortform';

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

export type DraftAnnotation =
  | CommentAnnotation
  | EditAnnotation
  | ApproveAnnotation
  | RejectAnnotation;

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
 * A single append-only entry in `.editorial-draft-history.jsonl`.
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
