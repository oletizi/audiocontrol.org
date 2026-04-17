/**
 * Unit tests for Phase 5 additions:
 * - Channel column on Distribution (round-trip + backwards compat)
 * - Topics column on stage tables (round-trip)
 * - channels.ts helpers: normalizeChannel, getChannelsForTopics,
 *   diffShared, alreadyShared
 *
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  parseCalendar,
  renderCalendar,
  type DistributionRecord,
  type EditorialCalendar,
} from '../../scripts/lib/editorial/index.js';
import {
  alreadyShared,
  diffShared,
  getChannelsForTopics,
  normalizeChannel,
  type ChannelEntry,
} from '../../scripts/lib/editorial/channels.js';

function publishedCalendar(slug: string, topics?: string[]): EditorialCalendar {
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
        ...(topics ? { topics } : {}),
      },
    ],
    distributions: [],
  };
}

describe('Channel column on Distribution', () => {
  it('round-trips a record with channel', () => {
    const cal = publishedCalendar('post-a');
    const rec: DistributionRecord = {
      slug: 'post-a',
      platform: 'reddit',
      channel: 'r/synthdiy',
      url: 'https://reddit.com/r/synthdiy/1',
      dateShared: '2026-04-10',
      notes: 'first share',
    };
    cal.distributions.push(rec);
    const md = renderCalendar(cal);
    expect(md).toContain('| Slug | Platform | URL | Shared | Channel | Notes |');
    const re = parseCalendar(md);
    expect(re.distributions).toEqual([rec]);
  });

  it('omits Channel column when no record uses it (backwards compat)', () => {
    const cal = publishedCalendar('post-a');
    cal.distributions.push({
      slug: 'post-a',
      platform: 'reddit',
      url: 'https://reddit.com/r/x/1',
      dateShared: '2026-04-10',
    });
    const md = renderCalendar(cal);
    expect(md).toContain('| Slug | Platform | URL | Shared | Notes |');
    expect(md).not.toMatch(/\| Channel \|/);
  });

  it('parses a legacy pre-Phase-5 Distribution table without Channel', () => {
    const md = [
      '# Editorial Calendar',
      '',
      '## Published',
      '',
      '| Slug | Title | Description | Keywords | Source | Published | Issue |',
      '|------|-------|-------------|----------|--------|-----------|-------|',
      '| post-a | A | D | kw | manual | 2026-04-01 |  |',
      '',
      '## Distribution',
      '',
      '| Slug | Platform | URL | Shared | Notes |',
      '|------|----------|-----|--------|-------|',
      '| post-a | reddit | https://reddit.com/r/x/1 | 2026-04-10 | r/x via notes |',
      '',
    ].join('\n');
    const cal = parseCalendar(md);
    expect(cal.distributions).toHaveLength(1);
    expect(cal.distributions[0]).toEqual({
      slug: 'post-a',
      platform: 'reddit',
      url: 'https://reddit.com/r/x/1',
      dateShared: '2026-04-10',
      notes: 'r/x via notes',
    });
  });

  it('round-trips a mix of records with and without channel', () => {
    const cal = publishedCalendar('post-a');
    cal.distributions.push(
      {
        slug: 'post-a',
        platform: 'reddit',
        channel: 'r/synthdiy',
        url: 'https://reddit.com/r/synthdiy/1',
        dateShared: '2026-04-10',
      },
      {
        slug: 'post-a',
        platform: 'youtube',
        url: 'https://youtu.be/abc',
        dateShared: '2026-04-11',
      },
    );
    const reparsed = parseCalendar(renderCalendar(cal));
    expect(reparsed.distributions).toEqual(cal.distributions);
  });
});

describe('Topics column on stage tables', () => {
  it('round-trips a Published entry with topics', () => {
    const cal = publishedCalendar('post-a', ['samplers', 'ai-agents']);
    const md = renderCalendar(cal);
    expect(md).toMatch(/\| Topics \|/);
    expect(md).toContain('samplers, ai-agents');
    const reparsed = parseCalendar(md);
    expect(reparsed.entries[0].topics).toEqual(['samplers', 'ai-agents']);
  });

  it('omits Topics column when no entry in the stage has topics', () => {
    const cal = publishedCalendar('post-a'); // no topics
    const md = renderCalendar(cal);
    expect(md).not.toMatch(/\| Topics \|/);
  });

  it('parses legacy tables without a Topics column', () => {
    const md = [
      '# Editorial Calendar',
      '',
      '## Planned',
      '',
      '| Slug | Title | Description | Keywords | Source |',
      '|------|-------|-------------|----------|--------|',
      '| post-a | A | D | kw1, kw2 | manual |',
      '',
    ].join('\n');
    const cal = parseCalendar(md);
    expect(cal.entries).toHaveLength(1);
    expect(cal.entries[0].topics).toBeUndefined();
    expect(cal.entries[0].targetKeywords).toEqual(['kw1', 'kw2']);
  });
});

describe('normalizeChannel', () => {
  it.each([
    ['r/synthdiy', 'r/synthdiy'],
    ['r/SynthDIY', 'r/synthdiy'],
    ['/r/SynthDIY', 'r/synthdiy'],
    ['/r/SynthDIY/', 'r/synthdiy'],
    ['https://reddit.com/r/SynthDIY/', 'r/synthdiy'],
    ['https://www.reddit.com/r/SynthDIY', 'r/synthdiy'],
    ['https://old.reddit.com/r/synthdiy/', 'r/synthdiy'],
    ['HTTPS://Reddit.COM/r/SynthDIY/', 'r/synthdiy'],
  ])('normalizes %s → %s', (input, expected) => {
    expect(normalizeChannel(input)).toBe(expected);
  });

  it('handles empty input', () => {
    expect(normalizeChannel('')).toBe('');
    expect(normalizeChannel('   ')).toBe('');
  });
});

describe('getChannelsForTopics', () => {
  const file = {
    topics: {
      samplers: {
        reddit: [
          { channel: 'r/synthdiy', note: 'diy focus' },
          { channel: 'r/vintagesynths' },
        ],
      },
      'ai-agents': {
        reddit: [{ channel: 'r/ClaudeAI' }, { channel: 'r/LocalLLaMA' }],
      },
      overlap: {
        reddit: [{ channel: 'r/SynthDIY', note: 'should dedupe' }],
      },
    },
  };

  it('returns candidates for a single topic', () => {
    const result = getChannelsForTopics(file, ['samplers']);
    const reddit = result.get('reddit');
    expect(reddit).toHaveLength(2);
    expect(reddit?.map((c) => c.channel)).toEqual(['r/synthdiy', 'r/vintagesynths']);
  });

  it('dedupes across topics using normalized channel', () => {
    const result = getChannelsForTopics(file, ['samplers', 'overlap']);
    const reddit = result.get('reddit') ?? [];
    expect(reddit.map((c) => c.channel.toLowerCase())).toEqual([
      'r/synthdiy',
      'r/vintagesynths',
    ]);
  });

  it('unions candidates across distinct topics', () => {
    const result = getChannelsForTopics(file, ['samplers', 'ai-agents']);
    const reddit = result.get('reddit') ?? [];
    expect(reddit.map((c) => c.channel)).toEqual([
      'r/synthdiy',
      'r/vintagesynths',
      'r/ClaudeAI',
      'r/LocalLLaMA',
    ]);
  });

  it('ignores unknown topics', () => {
    const result = getChannelsForTopics(file, ['not-a-topic']);
    expect(result.size).toBe(0);
  });
});

describe('diffShared and alreadyShared', () => {
  const candidates: ChannelEntry[] = [
    { channel: 'r/synthdiy' },
    { channel: 'r/vintagesynths' },
    { channel: 'r/ClaudeAI' },
  ];

  const recorded: DistributionRecord[] = [
    {
      slug: 'post-a',
      platform: 'reddit',
      channel: 'r/SynthDIY', // different case
      url: 'https://reddit.com/r/synthdiy/1',
      dateShared: '2026-04-10',
    },
    {
      slug: 'post-a',
      platform: 'reddit',
      channel: 'https://reddit.com/r/ClaudeAI/',
      url: 'https://reddit.com/r/ClaudeAI/2',
      dateShared: '2026-04-11',
    },
    {
      slug: 'post-a',
      platform: 'reddit',
      url: 'https://reddit.com/r/other/3',
      dateShared: '2026-04-12',
      // no channel — should not match anything
    },
  ];

  it('filters out already-shared candidates (case-insensitive)', () => {
    const unshared = diffShared(candidates, recorded);
    expect(unshared.map((c) => c.channel)).toEqual(['r/vintagesynths']);
  });

  it('returns shared (candidate, record) pairs', () => {
    const shared = alreadyShared(candidates, recorded);
    expect(shared).toHaveLength(2);
    const channels = shared.map((p) => p.entry.channel).sort();
    expect(channels).toEqual(['r/ClaudeAI', 'r/synthdiy']);
  });

  it('ignores recorded entries without a channel', () => {
    const shared = alreadyShared(
      [{ channel: 'r/nochannelmatch' }],
      [
        {
          slug: 'p',
          platform: 'reddit',
          url: 'https://reddit.com/x',
          dateShared: '2026-04-10',
        },
      ],
    );
    expect(shared).toEqual([]);
  });
});
