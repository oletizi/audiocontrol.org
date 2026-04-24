import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkStripFirstH1 from '../../scripts/lib/editorial/remark-strip-first-h1.mjs';

async function strip(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkStripFirstH1)
    .use(remarkStringify)
    .process(markdown);
  return String(result);
}

describe('remarkStripFirstH1', () => {
  it('removes the leading H1', async () => {
    const input = [
      '# Your Content Workflow Is Already Obsolete.',
      '',
      'Opening paragraph.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('Your Content Workflow');
    expect(output).toContain('Opening paragraph.');
  });

  it('removes only the first H1, leaves later H1s alone', async () => {
    const input = [
      '# First',
      '',
      'Intro.',
      '',
      '# Second',
      '',
      'Body.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('# First');
    expect(output).toContain('# Second');
    expect(output).toContain('Intro.');
    expect(output).toContain('Body.');
  });

  it('is a no-op when there is no H1', async () => {
    const input = [
      'Opening paragraph.',
      '',
      '## Section heading',
      '',
      'More prose.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).toContain('Opening paragraph.');
    expect(output).toContain('## Section heading');
    expect(output).toContain('More prose.');
  });

  it('leaves H2s and lower-depth headings untouched', async () => {
    const input = [
      '# Title',
      '',
      '## Section one',
      '',
      'Body.',
      '',
      '### Subsection',
      '',
      'More body.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('# Title');
    expect(output).toContain('## Section one');
    expect(output).toContain('### Subsection');
  });

  it('strips H1 even if it is not the very first node', async () => {
    // Edge case: a post with a leading HTML comment or standalone
    // block before the H1. The plugin should still drop the first
    // H1 it encounters.
    const input = [
      '<!-- some comment -->',
      '',
      '# Title',
      '',
      'Body.',
      '',
    ].join('\n');
    const output = await strip(input);
    expect(output).not.toContain('# Title');
    expect(output).toContain('Body.');
  });
});
