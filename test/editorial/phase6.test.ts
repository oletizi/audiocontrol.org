/**
 * Unit tests for Phase 6 additions:
 * - contentType + contentUrl on CalendarEntry (round-trip + backwards compat)
 * - crosslinks: extract YouTube URLs from markdown, extract blog URLs from
 *   YouTube descriptions, audit bidirectional coverage
 * - extractVideoId across URL forms
 *
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  parseCalendar,
  renderCalendar,
  type CalendarEntry,
  type EditorialCalendar,
} from '../../scripts/lib/editorial/index.js';
import {
  auditCrossLinks,
  extractAudioControlLinksFromText,
  extractYouTubeLinksFromMarkdown,
  slugFromBlogUrl,
} from '../../scripts/lib/editorial/crosslinks.js';
import { extractVideoId } from '../../scripts/lib/youtube/client.js';

function emptyCalendar(): EditorialCalendar {
  return { entries: [], distributions: [] };
}

function blogEntry(slug: string): CalendarEntry {
  return {
    slug,
    title: slug,
    description: '',
    stage: 'Published',
    targetKeywords: [],
    source: 'manual',
    datePublished: '2026-04-01',
  };
}

function videoEntry(slug: string, contentUrl: string): CalendarEntry {
  return {
    slug,
    title: slug,
    description: '',
    stage: 'Published',
    contentType: 'youtube',
    contentUrl,
    targetKeywords: [],
    source: 'manual',
    datePublished: '2026-04-01',
  };
}

describe('contentType + contentUrl columns', () => {
  it('round-trips a tool entry', () => {
    const cal: EditorialCalendar = {
      entries: [
        {
          slug: 's330-editor',
          title: 'Roland S-330 Web Editor',
          description: 'Free open-source web editor',
          stage: 'Published',
          contentType: 'tool',
          contentUrl: 'https://audiocontrol.org/roland/s330/editor',
          targetKeywords: [],
          source: 'manual',
          datePublished: '2025-01-01',
        },
      ],
      distributions: [],
    };
    const md = renderCalendar(cal);
    expect(md).toMatch(/\| Type \|/);
    expect(md).toContain('tool');
    const reparsed = parseCalendar(md);
    expect(reparsed.entries[0].contentType).toBe('tool');
    expect(reparsed.entries[0].contentUrl).toBe(
      'https://audiocontrol.org/roland/s330/editor',
    );
  });

  it('round-trips a YouTube entry', () => {
    const cal: EditorialCalendar = {
      entries: [videoEntry('s330-crunch-video', 'https://youtu.be/jWgCQDdsyrw')],
      distributions: [],
    };
    const md = renderCalendar(cal);
    expect(md).toMatch(/\| Type \|/);
    expect(md).toMatch(/\| URL \|/);
    expect(md).toContain('youtube');
    expect(md).toContain('https://youtu.be/jWgCQDdsyrw');
    const reparsed = parseCalendar(md);
    expect(reparsed.entries[0].contentType).toBe('youtube');
    expect(reparsed.entries[0].contentUrl).toBe('https://youtu.be/jWgCQDdsyrw');
  });

  it('omits Type and URL columns when all entries are plain blogs', () => {
    const cal: EditorialCalendar = {
      entries: [blogEntry('regular-post')],
      distributions: [],
    };
    const md = renderCalendar(cal);
    expect(md).not.toMatch(/\| Type \|/);
    expect(md).not.toMatch(/\| URL \|/);
  });

  it('backwards-compat: a legacy Published row without Type/URL parses as blog', () => {
    const md = [
      '# Editorial Calendar',
      '',
      '## Published',
      '',
      '| Slug | Title | Description | Keywords | Source | Published | Issue |',
      '|------|-------|-------------|----------|--------|-----------|-------|',
      '| legacy-post | Legacy | d | kw | manual | 2026-03-01 |  |',
      '',
    ].join('\n');
    const cal = parseCalendar(md);
    expect(cal.entries).toHaveLength(1);
    expect(cal.entries[0].contentType).toBeUndefined();
    expect(cal.entries[0].contentUrl).toBeUndefined();
  });
});

describe('extractVideoId', () => {
  it.each([
    ['jWgCQDdsyrw', 'jWgCQDdsyrw'],
    ['https://youtu.be/jWgCQDdsyrw', 'jWgCQDdsyrw'],
    ['https://youtu.be/jWgCQDdsyrw?t=42', 'jWgCQDdsyrw'],
    ['https://www.youtube.com/watch?v=jWgCQDdsyrw', 'jWgCQDdsyrw'],
    ['https://www.youtube.com/watch?v=jWgCQDdsyrw&t=42s', 'jWgCQDdsyrw'],
    ['https://youtube.com/shorts/jWgCQDdsyrw', 'jWgCQDdsyrw'],
    ['https://www.youtube.com/embed/jWgCQDdsyrw', 'jWgCQDdsyrw'],
    ['https://m.youtube.com/watch?v=jWgCQDdsyrw', 'jWgCQDdsyrw'],
  ])('extracts ID from %s', (input, expected) => {
    expect(extractVideoId(input)).toBe(expected);
  });

  it('throws on empty input', () => {
    expect(() => extractVideoId('')).toThrow();
  });

  it('throws on a URL without a recognizable video ID', () => {
    expect(() => extractVideoId('https://youtube.com/results?search_query=foo')).toThrow();
  });
});

describe('extractYouTubeLinksFromMarkdown', () => {
  it('extracts plain watch and short URLs', () => {
    const md = `
Here's a video: https://www.youtube.com/watch?v=abcdefghijk

And another: https://youtu.be/zyxwvutsrqp
`;
    const urls = extractYouTubeLinksFromMarkdown(md);
    expect(urls).toHaveLength(2);
    expect(urls).toContain('https://www.youtube.com/watch?v=abcdefghijk');
    expect(urls).toContain('https://youtu.be/zyxwvutsrqp');
  });

  it('extracts shorts and iframe embeds', () => {
    const md = `
Short: https://www.youtube.com/shorts/aaaaaaaaaaa

<iframe src="https://www.youtube.com/embed/bbbbbbbbbbb" />
`;
    const urls = extractYouTubeLinksFromMarkdown(md);
    expect(urls).toContain('https://www.youtube.com/shorts/aaaaaaaaaaa');
    expect(urls).toContain('https://www.youtube.com/embed/bbbbbbbbbbb');
  });

  it('deduplicates repeated URLs', () => {
    const md = `
Once: https://youtu.be/abcdefghijk
Again: https://youtu.be/abcdefghijk
`;
    expect(extractYouTubeLinksFromMarkdown(md)).toHaveLength(1);
  });

  it('returns empty when there are no YouTube URLs', () => {
    const md = 'Plain text with no links and a [fake](https://example.com/youtube) reference';
    expect(extractYouTubeLinksFromMarkdown(md)).toEqual([]);
  });
});

describe('extractAudioControlLinksFromText', () => {
  it('extracts any audiocontrol.org URL', () => {
    const desc = `
Full article: https://audiocontrol.org/blog/scsi-over-wifi-raspberry-pi-bridge/

Try the tool: https://audiocontrol.org/roland/s330/editor

Also: https://www.audiocontrol.org/blog/roland-s-series-samplers
`;
    const urls = extractAudioControlLinksFromText(desc);
    expect(urls).toHaveLength(3);
    expect(urls).toContain('https://audiocontrol.org/blog/scsi-over-wifi-raspberry-pi-bridge/');
    expect(urls).toContain('https://audiocontrol.org/roland/s330/editor');
    expect(urls).toContain('https://www.audiocontrol.org/blog/roland-s-series-samplers');
  });

  it('returns empty when no audiocontrol.org URLs are present', () => {
    expect(extractAudioControlLinksFromText('no links here')).toEqual([]);
  });
});

describe('slugFromBlogUrl', () => {
  it.each([
    ['https://audiocontrol.org/blog/slug-one/', 'slug-one'],
    ['https://audiocontrol.org/blog/slug-two', 'slug-two'],
    ['https://www.audiocontrol.org/blog/slug-three/', 'slug-three'],
    ['http://audiocontrol.org/blog/slug-four/', 'slug-four'],
  ])('extracts slug from %s', (url, expected) => {
    expect(slugFromBlogUrl(url)).toBe(expected);
  });

  it('returns null for non-blog URLs', () => {
    expect(slugFromBlogUrl('https://audiocontrol.org/roland/s330')).toBeNull();
  });
});

describe('auditCrossLinks', () => {
  const VIDEO_URL = 'https://youtu.be/jWgCQDdsyrw';

  const calendar: EditorialCalendar = {
    entries: [
      blogEntry('s330-post'),
      videoEntry('s330-video', VIDEO_URL),
      blogEntry('lonely-post'),
    ],
    distributions: [],
  };

  const blogBodies: Record<string, string> = {
    's330-post': `Watch the demo: ${VIDEO_URL}`,
    'lonely-post': 'No video here.',
  };

  it('reports a reciprocated link as no-gap', async () => {
    const report = await auditCrossLinks({
      calendar,
      fetchBlogMarkdown: (slug) => blogBodies[slug] ?? null,
      fetchVideoDescription: async () =>
        'Read more at https://audiocontrol.org/blog/s330-post/',
      fetchToolPage: async () => null,
    });
    const postAudit = report.entries.find((a) => a.entry.slug === 's330-post');
    const videoAudit = report.entries.find((a) => a.entry.slug === 's330-video');
    expect(postAudit?.outbound[0].resolvedSlug).toBe('s330-video');
    expect(videoAudit?.outbound[0].resolvedSlug).toBe('s330-post');
    expect(postAudit?.missingBacklinksTo).toEqual([]);
    expect(videoAudit?.missingBacklinksTo).toEqual([]);
  });

  it('flags a missing backlink when the video description does not reciprocate', async () => {
    const report = await auditCrossLinks({
      calendar,
      fetchBlogMarkdown: (slug) => blogBodies[slug] ?? null,
      fetchVideoDescription: async () => 'No blog links here.',
      fetchToolPage: async () => null,
    });
    const videoAudit = report.entries.find((a) => a.entry.slug === 's330-video');
    // The blog post links TO the video but the video does NOT link BACK to the post.
    // The video's audit should list the post in missingBacklinksTo.
    expect(videoAudit?.missingBacklinksTo).toContain('s330-post');
  });

  it('captures errors when the blog markdown is unavailable', async () => {
    const report = await auditCrossLinks({
      calendar,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => null,
    });
    const postAudit = report.entries.find((a) => a.entry.slug === 's330-post');
    expect(postAudit?.errors.length).toBeGreaterThan(0);
  });

  it('skips tool entries cleanly — no outbound links, no errors, no false-positive backlink gaps', async () => {
    const cal: EditorialCalendar = {
      entries: [
        {
          slug: 's330-editor',
          title: 'Roland S-330 Web Editor',
          description: '',
          stage: 'Published',
          contentType: 'tool',
          contentUrl: 'https://audiocontrol.org/roland/s330/editor',
          targetKeywords: [],
          source: 'manual',
          datePublished: '2025-01-01',
        },
      ],
      distributions: [],
    };
    const report = await auditCrossLinks({
      calendar: cal,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => null,
    });
    const toolAudit = report.entries.find((a) => a.entry.slug === 's330-editor');
    expect(toolAudit?.outbound).toEqual([]);
    expect(toolAudit?.missingBacklinksTo).toEqual([]);
    expect(toolAudit?.errors).toEqual([]);
  });

  it('records YouTube entries with missing contentUrl as errors', async () => {
    const cal: EditorialCalendar = {
      entries: [
        {
          slug: 'video-without-url',
          title: 't',
          description: '',
          stage: 'Published',
          contentType: 'youtube',
          targetKeywords: [],
          source: 'manual',
          datePublished: '2026-04-01',
        },
      ],
      distributions: [],
    };
    const report = await auditCrossLinks({
      calendar: cal,
      fetchBlogMarkdown: () => null,
      fetchVideoDescription: async () => '',
      fetchToolPage: async () => null,
    });
    expect(report.entries[0].errors.join(' ')).toMatch(/no contentUrl/);
  });
});
