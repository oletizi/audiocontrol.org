import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { bodyState, PLACEHOLDER_MARKER } from '../../scripts/lib/editorial/body-state.js';

const FRONTMATTER = [
  '---',
  'layout: ../../../layouts/BlogLayout.astro',
  'title: "Test Post"',
  'description: "A test description"',
  'date: "April 2026"',
  'datePublished: "2026-04-21"',
  'dateModified: "2026-04-21"',
  'author: "Orion Letizi"',
  '---',
  '',
].join('\n');

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'body-state-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function writeTo(relative: string, content: string): string {
  const path = join(root, relative);
  writeFileSync(path, content, 'utf-8');
  return path;
}

describe('bodyState', () => {
  it('returns "missing" when the file does not exist', () => {
    expect(bodyState(join(root, 'nope.md'))).toBe('missing');
  });

  it('returns "placeholder" when body is exactly the scaffold placeholder', () => {
    const path = writeTo('post.md', `${FRONTMATTER}# Test Post\n\n${PLACEHOLDER_MARKER}\n`);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('returns "placeholder" when body is only H1 + placeholder (no trailing newlines)', () => {
    const path = writeTo('post.md', `${FRONTMATTER}# Test Post\n${PLACEHOLDER_MARKER}`);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('returns "placeholder" when body is empty after frontmatter + H1', () => {
    const path = writeTo('post.md', `${FRONTMATTER}# Test Post\n\n`);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('returns "written" when body has real prose after the placeholder', () => {
    const content = `${FRONTMATTER}# Test Post\n\n${PLACEHOLDER_MARKER}\n\nAnd here is the real first paragraph.\n`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('written');
  });

  it('returns "written" when body has real prose instead of the placeholder', () => {
    const content = `${FRONTMATTER}# Test Post\n\nThe dispatch opens here with real words, no placeholder.\n`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('written');
  });

  it('returns "written" even for very short prose', () => {
    const content = `${FRONTMATTER}# Test Post\n\nHi.\n`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('written');
  });

  it('handles files without frontmatter', () => {
    const path = writeTo('post.md', `# Test Post\n\n${PLACEHOLDER_MARKER}\n`);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('handles the blank line between frontmatter and H1 that scaffoldBlogPost produces (regression)', () => {
    // scaffoldBlogPost emits: "---\n<fm>\n---\n\n# Title\n\n<!-- Write your post here -->"
    // Note the blank line BEFORE "# Title". Without the leading-whitespace
    // tolerance in the H1-strip regex, bodyState mis-reads this as 'written'.
    const content = `${FRONTMATTER}\n# Test Post\n\n${PLACEHOLDER_MARKER}`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('placeholder');
  });
});
