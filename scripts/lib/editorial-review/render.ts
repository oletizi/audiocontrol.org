import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export interface ParsedDraft {
  frontmatter: Record<string, string>;
  body: string;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const FRONTMATTER_LINE_RE = /^(\w+):\s*"?([^"]*)"?$/;

export function parseDraftFrontmatter(markdown: string): ParsedDraft {
  const match = markdown.match(FRONTMATTER_RE);
  if (!match) return { frontmatter: {}, body: markdown };
  const fm: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(FRONTMATTER_LINE_RE);
    if (m) fm[m[1]] = m[2];
  }
  return { frontmatter: fm, body: match[2] };
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}
