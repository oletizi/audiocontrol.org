/**
 * Unit tests for the editorial calendar distribution section.
 *
 * Covers parsing, rendering, and the addDistribution mutation.
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  addDistribution,
  parseCalendar,
  renderCalendar,
  type DistributionRecord,
  type EditorialCalendar,
} from '../../scripts/lib/editorial/index.js';

function emptyCalendar(): EditorialCalendar {
  return { entries: [], distributions: [] };
}

function publishedCalendar(slug: string): EditorialCalendar {
  return {
    entries: [
      {
        slug,
        title: 'A Post',
        description: '',
        stage: 'Published',
        targetKeywords: [],
        source: 'manual',
        datePublished: '2026-04-01',
      },
    ],
    distributions: [],
  };
}

describe('Distribution section', () => {
  describe('parsing', () => {
    it('returns empty distributions when the section is absent', () => {
      const md = '# Editorial Calendar\n\n## Published\n\n*No entries.*\n';
      const cal = parseCalendar(md);
      expect(cal.distributions).toEqual([]);
    });

    it('returns empty distributions when the section is present but empty', () => {
      const md = [
        '# Editorial Calendar',
        '',
        '## Distribution',
        '',
        '*No entries.*',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.distributions).toEqual([]);
    });

    it('parses rows with and without notes', () => {
      const md = [
        '# Editorial Calendar',
        '',
        '## Distribution',
        '',
        '| Slug | Platform | URL | Shared | Notes |',
        '|------|----------|-----|--------|-------|',
        '| post-a | reddit | https://reddit.com/r/x/1 | 2026-04-10 | r/x |',
        '| post-b | youtube | https://youtu.be/abc | 2026-04-11 |  |',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.distributions).toHaveLength(2);
      // Post-Phase-18 the parser sets entryId to '' for legacy rows
      // whose slug doesn't match a known entry. Match only the semantic
      // fields; entryId / missing-note shape is covered elsewhere.
      expect(cal.distributions[0]).toMatchObject({
        slug: 'post-a',
        platform: 'reddit',
        url: 'https://reddit.com/r/x/1',
        dateShared: '2026-04-10',
        notes: 'r/x',
      });
      expect(cal.distributions[1]).toMatchObject({
        slug: 'post-b',
        platform: 'youtube',
        url: 'https://youtu.be/abc',
        dateShared: '2026-04-11',
      });
      expect(cal.distributions[1].notes).toBeUndefined();
    });

    it('drops rows with an unknown platform', () => {
      const md = [
        '## Distribution',
        '',
        '| Slug | Platform | URL | Shared | Notes |',
        '|------|----------|-----|--------|-------|',
        '| post-a | twitter | https://twitter.com/x/1 | 2026-04-10 |  |',
        '| post-a | reddit | https://reddit.com/r/x/1 | 2026-04-10 |  |',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.distributions).toHaveLength(1);
      expect(cal.distributions[0].platform).toBe('reddit');
    });
  });

  describe('rendering', () => {
    it('emits a Distribution section even when empty', () => {
      const md = renderCalendar(emptyCalendar());
      expect(md).toContain('## Distribution');
      expect(md).toMatch(/## Distribution\s*\n\s*\n\*No entries\.\*/);
    });

    it('round-trips a distribution record', () => {
      const cal = publishedCalendar('post-a');
      cal.distributions.push({
        slug: 'post-a',
        platform: 'linkedin',
        url: 'https://linkedin.com/posts/foo',
        dateShared: '2026-04-12',
        notes: 'personal',
      });
      const md = renderCalendar(cal);
      const reparsed = parseCalendar(md);
      // Post-Phase-18 the write emits entryId and the reparse links
      // records to the entry whose slug matches. Verify the semantic
      // fields round-trip; entryId linkage verified in a dedicated test.
      expect(reparsed.distributions).toHaveLength(1);
      expect(reparsed.distributions[0]).toMatchObject(cal.distributions[0]);
    });

    it('round-trips multiple distributions preserving order', () => {
      const cal = publishedCalendar('post-a');
      const records: DistributionRecord[] = [
        {
          slug: 'post-a',
          platform: 'reddit',
          url: 'https://reddit.com/r/x/1',
          dateShared: '2026-04-10',
          notes: 'r/x',
        },
        {
          slug: 'post-a',
          platform: 'reddit',
          url: 'https://reddit.com/r/y/2',
          dateShared: '2026-04-11',
          notes: 'r/y',
        },
        {
          slug: 'post-a',
          platform: 'youtube',
          url: 'https://youtu.be/abc',
          dateShared: '2026-04-12',
        },
      ];
      cal.distributions.push(...records);
      const reparsed = parseCalendar(renderCalendar(cal));
      expect(reparsed.distributions).toHaveLength(records.length);
      records.forEach((rec, i) => {
        expect(reparsed.distributions[i]).toMatchObject(rec);
      });
    });
  });

  describe('addDistribution', () => {
    it('appends a record for a Published entry', () => {
      const cal = publishedCalendar('post-a');
      const rec: DistributionRecord = {
        slug: 'post-a',
        platform: 'reddit',
        url: 'https://reddit.com/r/x/1',
        dateShared: '2026-04-10',
      };
      addDistribution(cal, rec);
      expect(cal.distributions).toEqual([rec]);
    });

    it('throws when the slug has no matching entry', () => {
      const cal = emptyCalendar();
      expect(() =>
        addDistribution(cal, {
          slug: 'missing',
          platform: 'reddit',
          url: 'https://reddit.com/r/x/1',
          dateShared: '2026-04-10',
        }),
      ).toThrow(/No calendar entry found/);
    });

    it('throws when the entry is not in Published stage', () => {
      const cal: EditorialCalendar = {
        entries: [
          {
            slug: 'draft-post',
            title: 'Draft',
            description: '',
            stage: 'Drafting',
            targetKeywords: [],
            source: 'manual',
          },
        ],
        distributions: [],
      };
      expect(() =>
        addDistribution(cal, {
          slug: 'draft-post',
          platform: 'reddit',
          url: 'https://reddit.com/r/x/1',
          dateShared: '2026-04-10',
        }),
      ).toThrow(/must be Published/);
    });
  });
});
