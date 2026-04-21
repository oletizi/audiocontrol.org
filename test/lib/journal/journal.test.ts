import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  appendJournal,
  deleteJournal,
  normalizeTimestamp,
  readJournal,
  updateJournal,
} from '../../../scripts/lib/journal/index.js';

interface TestRecord {
  id: string;
  timestamp: string;
  payload: string;
}

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'journal-test-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('journal — normalizeTimestamp', () => {
  it('replaces colons and dots with dashes', () => {
    expect(normalizeTimestamp('2026-04-20T15:00:00.000Z')).toBe('2026-04-20T15-00-00-000Z');
  });
});

describe('journal — append + read round-trip', () => {
  it('writes one file per record and reads them back in timestamp order', () => {
    const subdir = join(dir, 'entries');
    const a: TestRecord = { id: 'a', timestamp: '2026-04-20T15:00:00.000Z', payload: 'first' };
    const b: TestRecord = { id: 'b', timestamp: '2026-04-20T16:00:00.000Z', payload: 'second' };
    appendJournal(subdir, b);
    appendJournal(subdir, a);

    const files = readdirSync(subdir);
    expect(files).toHaveLength(2);

    const records = readJournal<TestRecord>(subdir);
    expect(records.map(r => r.id)).toEqual(['a', 'b']);
  });

  it('returns an empty array when directory does not exist', () => {
    expect(readJournal<TestRecord>(join(dir, 'missing'))).toEqual([]);
  });

  it('skips corrupt JSON files without aborting', () => {
    const subdir = join(dir, 'entries');
    appendJournal(subdir, {
      id: 'good',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'ok',
    });
    writeFileSync(join(subdir, 'bogus.json'), '{"broken":', 'utf-8');

    const records = readJournal<TestRecord>(subdir);
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('good');
  });

  it('respects custom idField / timestampField', () => {
    interface Workflow {
      workflowId: string;
      createdAt: string;
    }
    const subdir = join(dir, 'w');
    const w: Workflow = { workflowId: 'x', createdAt: '2026-04-20T15:00:00.000Z' };
    appendJournal(subdir, w, { idField: 'workflowId', timestampField: 'createdAt' });
    const read = readJournal<Workflow>(subdir, { timestampField: 'createdAt' });
    expect(read).toEqual([w]);
  });

  it('throws if the record lacks the expected id field', () => {
    expect(() =>
      appendJournal(dir, { timestamp: '2026-04-20T15:00:00.000Z' }),
    ).toThrow(/has no `id` field/);
  });

  it('throws if the record lacks the expected timestamp field', () => {
    expect(() => appendJournal(dir, { id: 'x' })).toThrow(/has no `timestamp` field/);
  });
});

describe('journal — update + delete', () => {
  it('updateJournal merges a patch and keeps the same filename', () => {
    const subdir = join(dir, 'entries');
    appendJournal(subdir, {
      id: 'x',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'before',
    });
    const [filename] = readdirSync(subdir);

    const updated = updateJournal<TestRecord>(subdir, 'x', { payload: 'after' });
    expect(updated?.payload).toBe('after');

    const filesAfter = readdirSync(subdir);
    expect(filesAfter).toEqual([filename]); // same file, overwritten in place

    const onDisk = JSON.parse(readFileSync(join(subdir, filename), 'utf-8')) as TestRecord;
    expect(onDisk.payload).toBe('after');
  });

  it('updateJournal returns null for unknown ids', () => {
    const subdir = join(dir, 'entries');
    appendJournal(subdir, {
      id: 'x',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'present',
    });
    expect(updateJournal<TestRecord>(subdir, 'missing', { payload: 'x' })).toBeNull();
  });

  it('deleteJournal removes the matching file', () => {
    const subdir = join(dir, 'entries');
    appendJournal(subdir, {
      id: 'x',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'present',
    });
    expect(deleteJournal(subdir, 'x')).toBe(true);
    expect(readdirSync(subdir)).toEqual([]);
    expect(deleteJournal(subdir, 'x')).toBe(false);
  });

  it('appendJournal overwrites an existing record with the same id (idempotent)', () => {
    const subdir = join(dir, 'entries');
    appendJournal(subdir, {
      id: 'x',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'first',
    });
    appendJournal(subdir, {
      id: 'x',
      timestamp: '2026-04-20T16:00:00.000Z',
      payload: 'second',
    });
    const files = readdirSync(subdir);
    expect(files).toHaveLength(1);
    const records = readJournal<TestRecord>(subdir);
    expect(records[0].payload).toBe('second');
  });
});

describe('journal — directory creation', () => {
  it('creates nested directories on first append', () => {
    const nested = join(dir, 'a', 'b', 'c');
    expect(existsSync(nested)).toBe(false);
    appendJournal(nested, {
      id: 'x',
      timestamp: '2026-04-20T15:00:00.000Z',
      payload: 'p',
    });
    expect(existsSync(nested)).toBe(true);
  });
});
