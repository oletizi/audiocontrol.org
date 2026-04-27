import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkStripOutline from '../../scripts/lib/editorial/remark-strip-outline.mjs';

async function strip(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkStripOutline)
    .use(remarkStringify)
    .process(markdown);
  return String(result);
}

describe('remarkStripOutline', () => {
  it('strips the outline through and including the first thematic break', async () => {
    const input = [
      '# Title',
      '',
      '## Outline',
      '',
      '- beat one',
      '- beat two',
      '',
      '---',
      '',
      'Body prose here.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Outline');
    expect(output).not.toContain('beat one');
    expect(output).toContain('# Title');
    expect(output).toContain('Body prose here.');
  });

  it('preserves a subsequent thematic break used as a magazine divider in the body', async () => {
    const input = [
      '# Title',
      '',
      '## Outline',
      '',
      '- thesis beat',
      '- hook beat',
      '',
      '<!-- drafting notes the operator left behind -->',
      '',
      '---',
      '',
      'Lede paragraph.',
      '',
      '---',
      '',
      'Section after a magazine divider.',
      '',
      '## What the archive says',
      '',
      'First body section.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Outline');
    expect(output).not.toContain('thesis beat');
    expect(output).not.toContain('drafting notes the operator');
    expect(output).toContain('Lede paragraph.');
    expect(output).toContain('Section after a magazine divider.');
    expect(output).toContain('## What the archive says');
    // The second `---` (magazine divider) survives.
    expect(output).toContain('***');
  });

  it('strips an HTML comment between the outline heading and its bullet list', async () => {
    const input = [
      '# Title',
      '',
      '## Outline',
      '',
      '<!-- backfilled outline note -->',
      '',
      '- beat',
      '',
      '---',
      '',
      'Body lede paragraph.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Outline');
    expect(output).not.toContain('backfilled outline note');
    expect(output).not.toContain('beat');
    expect(output).toContain('Body lede paragraph.');
  });

  it('is a no-op when there is no ## Outline heading', async () => {
    const input = [
      '# Title',
      '',
      '## 01 First',
      '',
      'Prose.',
      '',
      '## 02 Second',
      '',
      'More prose.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).toContain('## 01 First');
    expect(output).toContain('## 02 Second');
    expect(output).toContain('Prose.');
  });

  it('is a no-op when the outline has no terminating thematic break', async () => {
    // Early-stage outline-only files have no `---` because no body
    // has been drafted yet. The plugin leaves them alone; the
    // outline still shows in dev (where draft posts are visible)
    // and in prod the post is filtered out by state=draft anyway.
    const input = [
      '# Title',
      '',
      '## Outline',
      '',
      '- beat one',
      '- beat two',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).toContain('## Outline');
    expect(output).toContain('beat one');
  });

  it('ignores "Outline" text that is not at H2 depth', async () => {
    const input = [
      '# Title',
      '',
      '### Outline subheading',
      '',
      'This is still body content.',
      '',
      '## Real body',
      '',
      'Prose.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).toContain('### Outline subheading');
    expect(output).toContain('This is still body content.');
  });

  it('matches "## Outline — extended title" variants', async () => {
    const input = [
      '# Title',
      '',
      '## Outline — shape notes',
      '',
      '- beat',
      '',
      '---',
      '',
      '## Body',
      '',
      'Prose.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('shape notes');
    expect(output).not.toContain('beat');
    expect(output).toContain('## Body');
  });
});
