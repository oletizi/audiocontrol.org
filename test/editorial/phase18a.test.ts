/**
 * Unit tests for Phase 18a: stable UUID identity for calendar entries
 * and distribution records.
 *
 *  - Parser backfills missing UUIDs in-memory so legacy calendars load.
 *  - Writer emits the UUID + EntryID columns so the first save
 *    persists the backfill.
 *  - Round-trip preserves UUID values once they're on the page.
 *  - DistributionRecords get their entryId linked to the matching
 *    entry's id on parse (even when the on-disk row has no entryId).
 *  - addEntry stamps a UUID; addDistribution stamps entryId from the
 *    matching entry.
 */

import { describe, it, expect } from 'vitest';
import {
  addDistribution,
  addEntry,
  distributionsByEntryId,
  entryById,
  findEntryById,
  parseCalendar,
  renderCalendar,
  type EditorialCalendar,
} from '../../scripts/lib/editorial/index.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('Phase 18a: UUID identity', () => {
  describe('parser backfill', () => {
    it('assigns a UUID to legacy entries missing the UUID column', () => {
      const md = [
        '# Editorial Calendar',
        '',
        '## Ideas',
        '',
        '| Slug | Title | Description | Keywords | Source |',
        '|------|-------|-------------|----------|--------|',
        '| legacy-post | Legacy | Description | kw | manual |',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.entries).toHaveLength(1);
      expect(cal.entries[0].id).toMatch(UUID_REGEX);
    });

    it('preserves UUID when present on disk', () => {
      const id = '00000000-0000-4000-8000-000000000001';
      const md = [
        '# Editorial Calendar',
        '',
        '## Ideas',
        '',
        '| UUID | Slug | Title | Description | Keywords | Source |',
        '|------|------|-------|-------------|----------|--------|',
        `| ${id} | my-post | My | D | kw | manual |`,
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.entries[0].id).toBe(id);
    });

    it('backfills distribution entryId from slug match', () => {
      const md = [
        '# Editorial Calendar',
        '',
        '## Published',
        '',
        '| UUID | Slug | Title | Description | Keywords | Source | Published | Issue |',
        '|------|------|-------|-------------|----------|--------|-----------|-------|',
        '| 11111111-2222-4333-8444-555555555555 | post-a | Post A | D | kw | manual | 2026-04-01 |  |',
        '',
        '## Distribution',
        '',
        '| Slug | Platform | URL | Shared | Notes |',
        '|------|----------|-----|--------|-------|',
        '| post-a | reddit | https://reddit.com/r/x/1 | 2026-04-10 | |',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.distributions[0].entryId).toBe(
        '11111111-2222-4333-8444-555555555555',
      );
    });

    it('leaves entryId empty when slug has no matching entry', () => {
      const md = [
        '# Editorial Calendar',
        '',
        '## Distribution',
        '',
        '| Slug | Platform | URL | Shared | Notes |',
        '|------|----------|-----|--------|-------|',
        '| orphan | reddit | https://reddit.com/r/x/1 | 2026-04-10 | |',
        '',
      ].join('\n');
      const cal = parseCalendar(md);
      expect(cal.distributions[0].entryId).toBe('');
    });
  });

  describe('writer', () => {
    it('emits UUID column in stage tables', () => {
      const cal: EditorialCalendar = {
        entries: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            slug: 'post',
            title: 'Post',
            description: '',
            stage: 'Ideas',
            targetKeywords: [],
            source: 'manual',
          },
        ],
        distributions: [],
      };
      const md = renderCalendar(cal);
      expect(md).toContain('| UUID | Slug | Title |');
      expect(md).toContain('22222222-2222-4222-8222-222222222222');
    });

    it('emits EntryID column in distribution table', () => {
      const cal: EditorialCalendar = {
        entries: [
          {
            id: '33333333-3333-4333-8333-333333333333',
            slug: 'post',
            title: 'Post',
            description: '',
            stage: 'Published',
            targetKeywords: [],
            source: 'manual',
            datePublished: '2026-04-01',
          },
        ],
        distributions: [
          {
            entryId: '33333333-3333-4333-8333-333333333333',
            slug: 'post',
            platform: 'reddit',
            url: 'https://reddit.com/r/x/1',
            dateShared: '2026-04-10',
          },
        ],
      };
      const md = renderCalendar(cal);
      expect(md).toContain('| EntryID | Slug | Platform |');
      expect(md).toContain('33333333-3333-4333-8333-333333333333');
    });

    it('round-trips a full calendar preserving all UUIDs', () => {
      const cal: EditorialCalendar = {
        entries: [
          {
            id: '44444444-4444-4444-8444-444444444444',
            slug: 'p',
            title: 'P',
            description: '',
            stage: 'Published',
            targetKeywords: [],
            source: 'manual',
            datePublished: '2026-04-01',
          },
        ],
        distributions: [
          {
            entryId: '44444444-4444-4444-8444-444444444444',
            slug: 'p',
            platform: 'linkedin',
            url: 'https://linkedin.com/posts/1',
            dateShared: '2026-04-12',
          },
        ],
      };
      const reparsed = parseCalendar(renderCalendar(cal));
      expect(reparsed.entries[0].id).toBe(cal.entries[0].id);
      expect(reparsed.distributions[0].entryId).toBe(cal.distributions[0].entryId);
    });
  });

  describe('mutations', () => {
    it('addEntry stamps a fresh UUID', () => {
      const cal: EditorialCalendar = { entries: [], distributions: [] };
      const entry = addEntry(cal, 'My Post');
      expect(entry.id).toMatch(UUID_REGEX);
    });

    it('addDistribution stamps entryId from the matching entry', () => {
      const cal: EditorialCalendar = {
        entries: [
          {
            id: '55555555-5555-4555-8555-555555555555',
            slug: 'post-a',
            title: 'Post A',
            description: '',
            stage: 'Published',
            targetKeywords: [],
            source: 'manual',
            datePublished: '2026-04-01',
          },
        ],
        distributions: [],
      };
      const rec = addDistribution(cal, {
        slug: 'post-a',
        platform: 'reddit',
        url: 'https://reddit.com/r/x/1',
        dateShared: '2026-04-10',
      });
      expect(rec.entryId).toBe('55555555-5555-4555-8555-555555555555');
    });
  });

  describe('lookups', () => {
    const cal: EditorialCalendar = {
      entries: [
        {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          slug: 'a',
          title: 'A',
          description: '',
          stage: 'Published',
          targetKeywords: [],
          source: 'manual',
          datePublished: '2026-04-01',
        },
      ],
      distributions: [
        {
          entryId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          slug: 'a',
          platform: 'reddit',
          url: 'https://reddit.com/r/x/1',
          dateShared: '2026-04-10',
        },
      ],
    };

    it('entryById finds an entry by stable id', () => {
      const found = entryById(cal, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
      expect(found?.slug).toBe('a');
    });

    it('findEntryById (calendar.ts) finds an entry by stable id', () => {
      const found = findEntryById(cal, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
      expect(found?.slug).toBe('a');
    });

    it('distributionsByEntryId filters by stable id', () => {
      const records = distributionsByEntryId(
        cal,
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      );
      expect(records).toHaveLength(1);
      expect(records[0].url).toBe('https://reddit.com/r/x/1');
    });

    it('lookups return undefined / empty for blank id', () => {
      expect(entryById(cal, '')).toBeUndefined();
      expect(findEntryById(cal, '')).toBeUndefined();
      expect(distributionsByEntryId(cal, '')).toEqual([]);
    });
  });
});
