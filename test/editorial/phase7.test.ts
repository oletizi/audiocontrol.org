/**
 * Unit tests for Phase 7 additions:
 * - extractLinksFromHtml (cheerio-based, tolerant of malformed HTML)
 * - extractSiteLinksFromMarkdown (markdown-relative + absolute)
 * - canonicalizeUrl
 * - auditCrossLinks with tool entries: fetches page, extracts links,
 *   resolves against unified byContentUrl index
 */

import { describe, it, expect } from 'vitest';
import {
  auditCrossLinks,
  canonicalizeUrl,
  extractSiteLinksFromMarkdown,
  extractLinksFromHtml,
  type CalendarEntry,
  type EditorialCalendar,
} from '../../scripts/lib/editorial/index.js';

const HOST = 'audiocontrol.org';

describe('extractLinksFromHtml (cheerio)', () => {
  it('extracts href, src, and bare URLs', () => {
    const html = `
      <html><body>
        <a href="https://audiocontrol.org/blog/foo/">Foo</a>
        <iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>
        <p>Also see https://example.com/other for more.</p>
      </body></html>
    `;
    const urls = extractLinksFromHtml(html);
    expect(urls).toContain('https://audiocontrol.org/blog/foo/');
    expect(urls).toContain('https://www.youtube.com/embed/abcdefghijk');
    expect(urls).toContain('https://example.com/other');
  });

  it('resolves relative URLs against the base URL', () => {
    const html = '<a href="/roland/s330/editor">Editor</a>';
    const urls = extractLinksFromHtml(html, 'https://audiocontrol.org/');
    expect(urls).toContain('https://audiocontrol.org/roland/s330/editor');
  });

  it('skips anchor-only, mailto, and javascript links', () => {
    const html = `
      <a href="#section">Jump</a>
      <a href="mailto:me@example.com">Mail</a>
      <a href="javascript:void(0)">Do</a>
      <a href="https://audiocontrol.org/blog/keep/">Keep</a>
    `;
    const urls = extractLinksFromHtml(html, 'https://audiocontrol.org/');
    expect(urls).toEqual(['https://audiocontrol.org/blog/keep/']);
  });

  it('skips feeds, sitemaps, and robots.txt', () => {
    const html = `
      <link rel="alternate" href="/rss.xml" />
      <a href="/sitemap-index.xml">Sitemap</a>
      <a href="/robots.txt">Robots</a>
      <a href="https://audiocontrol.org/blog/keep/">Keep</a>
    `;
    const urls = extractLinksFromHtml(html, 'https://audiocontrol.org/');
    expect(urls).toEqual(['https://audiocontrol.org/blog/keep/']);
  });

  it('does not extract URLs from inside <script> or <style>', () => {
    const html = `
      <script>const pixel = "https://tracker.example.com/pixel.gif";</script>
      <style>a.blog { background: url(https://tracker.example.com/bg.png); }</style>
      <a href="https://audiocontrol.org/blog/real-link/">Real</a>
    `;
    const urls = extractLinksFromHtml(html, 'https://audiocontrol.org/');
    expect(urls).toContain('https://audiocontrol.org/blog/real-link/');
    expect(urls.some((u) => u.includes('tracker.example.com'))).toBe(false);
  });

  it('tolerates unclosed tags and garbage markup', () => {
    const html = `
      <p>Lorem <a href="https://audiocontrol.org/blog/foo/">foo<p>
      <a href='https://audiocontrol.org/blog/bar/'>bar
      <iframe src="https://www.youtube.com/embed/aaaaaaaaaaa">
      <div>unclosed
    `;
    const urls = extractLinksFromHtml(html, 'https://audiocontrol.org/');
    expect(urls).toContain('https://audiocontrol.org/blog/foo/');
    expect(urls).toContain('https://audiocontrol.org/blog/bar/');
    expect(urls).toContain('https://www.youtube.com/embed/aaaaaaaaaaa');
  });

  it('deduplicates the same URL appearing multiple times', () => {
    const html = `
      <a href="https://audiocontrol.org/blog/foo/">One</a>
      <a href="https://audiocontrol.org/blog/foo/">Two</a>
    `;
    const urls = extractLinksFromHtml(html);
    expect(urls.filter((u) => u === 'https://audiocontrol.org/blog/foo/')).toHaveLength(1);
  });
});

describe('extractSiteLinksFromMarkdown', () => {
  it('extracts absolute host-matching URLs', () => {
    const md = `See https://audiocontrol.org/blog/foo/ for details.`;
    expect(extractSiteLinksFromMarkdown(md, HOST)).toEqual([
      'https://audiocontrol.org/blog/foo/',
    ]);
  });

  it('extracts markdown-style relative links and prepends the host', () => {
    const md = `Try the [S-330 editor](/roland/s330/editor) or [blog post](/blog/foo/).`;
    const urls = extractSiteLinksFromMarkdown(md, HOST);
    expect(urls).toContain('https://audiocontrol.org/roland/s330/editor');
    expect(urls).toContain('https://audiocontrol.org/blog/foo/');
  });

  it('combines absolute and relative without duplicating when both forms appear', () => {
    const md = `
[Absolute](https://audiocontrol.org/blog/foo/)
[Relative](/blog/bar/)
`;
    const urls = extractSiteLinksFromMarkdown(md, HOST);
    expect(urls).toContain('https://audiocontrol.org/blog/foo/');
    expect(urls).toContain('https://audiocontrol.org/blog/bar/');
  });
});

describe('canonicalizeUrl', () => {
  it.each([
    ['https://audiocontrol.org/blog/foo/', 'https://audiocontrol.org/blog/foo'],
    ['https://AudioControl.org/blog/foo/', 'https://audiocontrol.org/blog/foo'],
    ['https://audiocontrol.org/blog/foo', 'https://audiocontrol.org/blog/foo'],
    ['https://audiocontrol.org/', 'https://audiocontrol.org/'],
    ['https://audiocontrol.org', 'https://audiocontrol.org/'],
  ])('normalizes %s → %s', (input, expected) => {
    expect(canonicalizeUrl(input)).toBe(expected);
  });

  it('preserves query strings', () => {
    expect(canonicalizeUrl('https://audiocontrol.org/x?y=1')).toBe(
      'https://audiocontrol.org/x?y=1',
    );
  });
});

describe('auditCrossLinks with tool entries', () => {
  function toolEntry(slug: string, contentUrl: string): CalendarEntry {
    return {
      slug,
      title: slug,
      description: '',
      stage: 'Published',
      contentType: 'tool',
      contentUrl,
      targetKeywords: [],
      source: 'manual',
      datePublished: '2025-01-01',
    };
  }

  function blogEntry(slug: string): CalendarEntry {
    return {
      slug,
      title: slug,
      description: '',
      stage: 'Published',
      targetKeywords: [],
      source: 'manual',
      datePublished: '2025-01-01',
    };
  }

  const TOOL_URL = 'https://audiocontrol.org/roland/s330/editor';

  it('fetches the tool page and records outbound links', async () => {
    const cal: EditorialCalendar = {
      entries: [toolEntry('s330-editor', TOOL_URL), blogEntry('s330-post')],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => `
        <a href="https://audiocontrol.org/blog/s330-post/">Read more</a>
      `,
    });
    const toolAudit = report.entries.find((a) => a.entry.slug === 's330-editor');
    expect(toolAudit?.outbound).toHaveLength(1);
    expect(toolAudit?.outbound[0].resolvedSlug).toBe('s330-post');
  });

  it('flags missing backlink when tool links to blog but blog does not link back', async () => {
    const cal: EditorialCalendar = {
      entries: [toolEntry('s330-editor', TOOL_URL), blogEntry('s330-post')],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () => 'A post with no links.',
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => `
        <a href="https://audiocontrol.org/blog/s330-post/">Read more</a>
      `,
    });
    const blogAudit = report.entries.find((a) => a.entry.slug === 's330-post');
    expect(blogAudit?.missingBacklinksTo).toContain('s330-editor');
  });

  it('resolves via unified byContentUrl index — blog MD to tool', async () => {
    const cal: EditorialCalendar = {
      entries: [toolEntry('s330-editor', TOOL_URL), blogEntry('s330-post')],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () =>
        'Try the [editor](/roland/s330/editor) to hear it.',
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => '<p>No links.</p>',
    });
    const blogAudit = report.entries.find((a) => a.entry.slug === 's330-post');
    expect(blogAudit?.outbound).toHaveLength(1);
    expect(blogAudit?.outbound[0].resolvedSlug).toBe('s330-editor');
  });

  it('records fetch failures per-entry without aborting the audit', async () => {
    const cal: EditorialCalendar = {
      entries: [toolEntry('s330-editor', TOOL_URL), blogEntry('s330-post')],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () => 'no links',
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => {
        throw new Error('404 Not Found');
      },
    });
    const toolAudit = report.entries.find((a) => a.entry.slug === 's330-editor');
    expect(toolAudit?.errors.join(' ')).toMatch(/404 Not Found/);
    // The audit still returned — not aborted
    expect(report.entries).toHaveLength(2);
  });

  it('records tools with missing contentUrl as errors', async () => {
    const cal: EditorialCalendar = {
      entries: [
        {
          slug: 'tool-without-url',
          title: 't',
          description: '',
          stage: 'Published',
          contentType: 'tool',
          targetKeywords: [],
          source: 'manual',
          datePublished: '2025-01-01',
        },
      ],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => null,
    });
    expect(report.entries[0].errors.join(' ')).toMatch(/no contentUrl/);
  });

  it('excludes self-links from outbound', async () => {
    const cal: EditorialCalendar = {
      entries: [toolEntry('s330-editor', TOOL_URL)],
      distributions: [],
    };
    const report = await auditCrossLinks({
      site: 'audiocontrol',
      calendar: cal,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => `
        <a href="/roland/s330/editor">Home</a>
        <a href="https://example.com/other">Other</a>
      `,
    });
    const toolAudit = report.entries.find((a) => a.entry.slug === 's330-editor');
    // Self-link is filtered; only the external link remains
    expect(toolAudit?.outbound.map((l) => l.url)).toEqual([
      'https://example.com/other',
    ]);
  });
});
