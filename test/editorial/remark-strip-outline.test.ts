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
  it('removes the ## Outline section through the next H2', async () => {
    const input = [
      '# Title',
      '',
      '## Outline',
      '',
      '- beat one',
      '- beat two',
      '',
      '## 01 Real section',
      '',
      'Body prose here.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Outline');
    expect(output).not.toContain('beat one');
    expect(output).toContain('# Title');
    expect(output).toContain('## 01 Real section');
    expect(output).toContain('Body prose here.');
  });

  it('removes the ## Outline section through end of file when no further H2', async () => {
    const input = [
      '# Title',
      '',
      'Opening paragraph.',
      '',
      '## Outline',
      '',
      'Draft shape notes.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Outline');
    expect(output).not.toContain('Draft shape notes');
    expect(output).toContain('Opening paragraph.');
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

  it('stops stripping at the next H1 (not just H2)', async () => {
    const input = [
      '# First title',
      '',
      '## Outline',
      '',
      '- shape',
      '',
      '# Second title',
      '',
      '## Body',
      '',
      'Content.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('shape');
    expect(output).toContain('# Second title');
    expect(output).toContain('## Body');
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
