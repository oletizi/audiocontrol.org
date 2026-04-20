import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  VALID_TRANSITIONS,
  type DraftWorkflowState,
} from '../../scripts/lib/editorial-review/types.js';

const ALL_STATES: DraftWorkflowState[] = [
  'open',
  'in-review',
  'iterating',
  'approved',
  'applied',
  'cancelled',
];

describe('editorial-review state machine', () => {
  it('allows open → in-review and open → cancelled', () => {
    expect(isValidTransition('open', 'in-review')).toBe(true);
    expect(isValidTransition('open', 'cancelled')).toBe(true);
  });

  it('rejects open → applied (must go through approved)', () => {
    expect(isValidTransition('open', 'approved')).toBe(false);
    expect(isValidTransition('open', 'applied')).toBe(false);
  });

  it('allows in-review → iterating → in-review (revision loop)', () => {
    expect(isValidTransition('in-review', 'iterating')).toBe(true);
    expect(isValidTransition('iterating', 'in-review')).toBe(true);
  });

  it('only allows approved → applied or cancelled', () => {
    expect(isValidTransition('approved', 'applied')).toBe(true);
    expect(isValidTransition('approved', 'cancelled')).toBe(true);
    expect(isValidTransition('approved', 'in-review')).toBe(false);
    expect(isValidTransition('approved', 'iterating')).toBe(false);
  });

  it('treats applied and cancelled as terminal', () => {
    for (const target of ALL_STATES) {
      expect(isValidTransition('applied', target)).toBe(false);
      expect(isValidTransition('cancelled', target)).toBe(false);
    }
  });

  it('rejects self-transitions', () => {
    for (const state of ALL_STATES) {
      expect(isValidTransition(state, state)).toBe(false);
    }
  });

  it('VALID_TRANSITIONS covers every state', () => {
    for (const state of ALL_STATES) {
      expect(VALID_TRANSITIONS[state]).toBeDefined();
    }
  });
});
