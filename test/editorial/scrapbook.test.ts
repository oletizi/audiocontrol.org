import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  assertSlug,
  assertFilename,
  scrapbookDir,
  scrapbookFilePath,
  classify,
  listScrapbook,
  countScrapbook,
  readScrapbookFile,
  createScrapbookMarkdown,
  saveScrapbookFile,
  renameScrapbookFile,
  deleteScrapbookFile,
  writeScrapbookUpload,
  formatRelativeTime,
  formatSize,
  isValidSite,
} from '../../scripts/lib/editorial/scrapbook.js';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'scrapbook-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('assertSlug', () => {
  it('accepts normal slugs', () => {
    expect(() => assertSlug('a-valid-slug')).not.toThrow();
    expect(() => assertSlug('abc123')).not.toThrow();
    expect(() => assertSlug('a')).not.toThrow();
  });
  it('rejects uppercase', () => {
    expect(() => assertSlug('Capitalized')).toThrow();
  });
  it('rejects leading hyphen', () => {
    expect(() => assertSlug('-foo')).toThrow();
  });
  it('rejects traversal', () => {
    expect(() => assertSlug('..')).toThrow();
    expect(() => assertSlug('a/b')).toThrow();
  });
});

describe('assertFilename', () => {
  it('accepts normal names', () => {
    expect(() => assertFilename('notes.md')).not.toThrow();
    expect(() => assertFilename('image.png')).not.toThrow();
    expect(() => assertFilename('a_b-c 1.txt')).not.toThrow();
  });
  it('rejects empty / dot / dotdot', () => {
    expect(() => assertFilename('')).toThrow();
    expect(() => assertFilename('.')).toThrow();
    expect(() => assertFilename('..')).toThrow();
  });
  it('rejects path separators', () => {
    expect(() => assertFilename('../etc/passwd')).toThrow();
    expect(() => assertFilename('a/b.md')).toThrow();
    expect(() => assertFilename('a\\b.md')).toThrow();
  });
  it('rejects null bytes', () => {
    expect(() => assertFilename('a\0b.md')).toThrow();
  });
  it('rejects dotfiles', () => {
    expect(() => assertFilename('.hidden')).toThrow();
  });
  it('rejects overly long names', () => {
    expect(() => assertFilename('x'.repeat(201))).toThrow();
  });
});

describe('scrapbookDir / scrapbookFilePath', () => {
  it('resolves to content/blog/<slug>/scrapbook', () => {
    const dir = scrapbookDir(root, 'audiocontrol', 'my-post');
    expect(dir.endsWith('src/sites/audiocontrol/content/blog/my-post/scrapbook')).toBe(true);
  });
  it('blocks path escape via filename', () => {
    expect(() => scrapbookFilePath(root, 'audiocontrol', 'my-post', '../escape.md')).toThrow();
  });
  it('returns resolved path inside scrapbook for valid filenames', () => {
    const abs = scrapbookFilePath(root, 'audiocontrol', 'my-post', 'note.md');
    expect(abs.endsWith('scrapbook/note.md')).toBe(true);
  });
});

describe('classify', () => {
  it('classifies by extension', () => {
    expect(classify('a.md')).toBe('md');
    expect(classify('a.markdown')).toBe('md');
    expect(classify('a.json')).toBe('json');
    expect(classify('a.jsonl')).toBe('json');
    expect(classify('a.js')).toBe('js');
    expect(classify('a.ts')).toBe('js');
    expect(classify('a.mjs')).toBe('js');
    expect(classify('a.png')).toBe('img');
    expect(classify('a.jpg')).toBe('img');
    expect(classify('a.SVG')).toBe('img');
    expect(classify('a.txt')).toBe('txt');
    expect(classify('a.log')).toBe('txt');
    expect(classify('a.bin')).toBe('other');
    expect(classify('Makefile')).toBe('other');
  });
});

describe('isValidSite', () => {
  it('accepts known sites', () => {
    expect(isValidSite('audiocontrol')).toBe(true);
    expect(isValidSite('editorialcontrol')).toBe(true);
  });
  it('rejects unknown / wrong types', () => {
    expect(isValidSite('example')).toBe(false);
    expect(isValidSite('')).toBe(false);
    expect(isValidSite(42)).toBe(false);
    expect(isValidSite(undefined)).toBe(false);
  });
});

describe('listScrapbook / countScrapbook', () => {
  it('returns empty + exists=false when scrapbook dir missing', () => {
    const s = listScrapbook(root, 'audiocontrol', 'no-such');
    expect(s.exists).toBe(false);
    expect(s.items).toEqual([]);
    expect(countScrapbook(root, 'audiocontrol', 'no-such')).toBe(0);
  });
  it('lists files sorted newest first, skips dotfiles', () => {
    const dir = scrapbookDir(root, 'audiocontrol', 'post');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'old.md'), 'x');
    // Force a distinct mtime for newer file.
    const newerTime = new Date(Date.now() + 5000);
    writeFileSync(join(dir, 'new.md'), 'y');
    // Bump mtime of new.md by rewriting + utimesSync substitute — use touch
    // via fs.utimesSync for reliability.
    const { utimesSync } = require('fs') as typeof import('fs');
    utimesSync(join(dir, 'new.md'), newerTime, newerTime);
    writeFileSync(join(dir, '.hidden'), 'z');
    const s = listScrapbook(root, 'audiocontrol', 'post');
    expect(s.exists).toBe(true);
    expect(s.items.map(i => i.name)).toEqual(['new.md', 'old.md']);
    expect(countScrapbook(root, 'audiocontrol', 'post')).toBe(2);
  });
});

describe('CRUD', () => {
  it('createScrapbookMarkdown writes and returns item', () => {
    const item = createScrapbookMarkdown(root, 'audiocontrol', 'post', 'notes.md', '# Hi\n');
    expect(item.kind).toBe('md');
    expect(item.name).toBe('notes.md');
    const abs = scrapbookFilePath(root, 'audiocontrol', 'post', 'notes.md');
    expect(readFileSync(abs, 'utf-8')).toBe('# Hi\n');
  });
  it('createScrapbookMarkdown refuses non-.md', () => {
    expect(() => createScrapbookMarkdown(root, 'audiocontrol', 'post', 'notes.txt', 'x')).toThrow();
  });
  it('createScrapbookMarkdown refuses existing file', () => {
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'n.md', 'a');
    expect(() => createScrapbookMarkdown(root, 'audiocontrol', 'post', 'n.md', 'b')).toThrow();
  });
  it('readScrapbookFile returns content buffer', () => {
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'n.md', 'hello');
    const entry = readScrapbookFile(root, 'audiocontrol', 'post', 'n.md');
    expect(entry.content.toString('utf-8')).toBe('hello');
    expect(entry.kind).toBe('md');
  });
  it('readScrapbookFile throws not-found', () => {
    expect(() => readScrapbookFile(root, 'audiocontrol', 'post', 'nope.md')).toThrow(/not found/);
  });
  it('saveScrapbookFile overwrites existing', () => {
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'n.md', 'a');
    saveScrapbookFile(root, 'audiocontrol', 'post', 'n.md', 'b');
    expect(readScrapbookFile(root, 'audiocontrol', 'post', 'n.md').content.toString('utf-8')).toBe('b');
  });
  it('saveScrapbookFile refuses missing file', () => {
    expect(() => saveScrapbookFile(root, 'audiocontrol', 'post', 'nope.md', 'x')).toThrow(/file not found/);
  });
  it('renameScrapbookFile moves and refuses collision', () => {
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'a.md', 'x');
    renameScrapbookFile(root, 'audiocontrol', 'post', 'a.md', 'b.md');
    expect(existsSync(scrapbookFilePath(root, 'audiocontrol', 'post', 'a.md'))).toBe(false);
    expect(existsSync(scrapbookFilePath(root, 'audiocontrol', 'post', 'b.md'))).toBe(true);
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'c.md', 'y');
    expect(() => renameScrapbookFile(root, 'audiocontrol', 'post', 'b.md', 'c.md')).toThrow(/already exists/);
  });
  it('deleteScrapbookFile removes and refuses missing', () => {
    createScrapbookMarkdown(root, 'audiocontrol', 'post', 'n.md', 'x');
    deleteScrapbookFile(root, 'audiocontrol', 'post', 'n.md');
    expect(existsSync(scrapbookFilePath(root, 'audiocontrol', 'post', 'n.md'))).toBe(false);
    expect(() => deleteScrapbookFile(root, 'audiocontrol', 'post', 'n.md')).toThrow(/file not found/);
  });
  it('writeScrapbookUpload refuses overwrite', () => {
    writeScrapbookUpload(root, 'audiocontrol', 'post', 'pic.png', Buffer.from([1, 2, 3]));
    expect(() => writeScrapbookUpload(root, 'audiocontrol', 'post', 'pic.png', Buffer.from([4]))).toThrow(/already exists/);
  });
});

describe('formatRelativeTime', () => {
  it('handles seconds / minutes / hours / days', () => {
    const now = new Date('2026-04-23T12:00:00Z');
    expect(formatRelativeTime(new Date(now.getTime() - 5_000).toISOString(), now)).toBe('5s ago');
    expect(formatRelativeTime(new Date(now.getTime() - 60_000).toISOString(), now)).toBe('1m ago');
    expect(formatRelativeTime(new Date(now.getTime() - 3_600_000).toISOString(), now)).toBe('1h ago');
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 86_400_000).toISOString(), now)).toBe('3d ago');
  });
  it('returns "just now" for future timestamps', () => {
    const now = new Date('2026-04-23T12:00:00Z');
    expect(formatRelativeTime(new Date(now.getTime() + 5000).toISOString(), now)).toBe('just now');
  });
});

describe('formatSize', () => {
  it('formats B / KB / MB', () => {
    expect(formatSize(512)).toBe('512 B');
    expect(formatSize(2048)).toBe('2.0 KB');
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});
