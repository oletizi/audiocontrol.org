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

  // Phase 17c: the scaffold now writes a `## Outline` section between
  // the H1 and the body placeholder. Outline content is real authored
  // text but isn't the body — bodyState must report 'placeholder' when
  // the body hasn't been drafted, regardless of how much outline work
  // has been done.
  it('returns "placeholder" when outline has content but body is still the placeholder', () => {
    const outline = '## Outline\n\n- First beat.\n- Second beat.\n- Third beat.\n';
    const content = `${FRONTMATTER}# Test Post\n\n${outline}\n${PLACEHOLDER_MARKER}\n`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('returns "placeholder" when outline is scaffolded (empty) and body is still the placeholder', () => {
    const outline = '## Outline\n\n<!-- Outline the shape of the article here before drafting the body. -->\n';
    const content = `${FRONTMATTER}# Test Post\n\n${outline}\n${PLACEHOLDER_MARKER}\n`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('placeholder');
  });

  it('returns "written" when outline has content AND body has prose below it', () => {
    const outline = '## Outline\n\n- A beat.\n- Another beat.\n';
    const body = '## 01 The opening\n\nReal prose starts here and continues for a while.\n';
    const content = `${FRONTMATTER}# Test Post\n\n${outline}\n${body}`;
    const path = writeTo('post.md', content);
    expect(bodyState(path)).toBe('written');
  });
});
