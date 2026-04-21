/**
 * Unit tests for editorial-calendar-actions handlers.
 *
 * GitHub issue integration is out of scope for these handlers; the tests
 * never needed to mock it out since it isn't called. Legacy entries in
 * the fixture still carry issueNumber values to prove the writer keeps
 * reading them correctly, but no new issues are created or closed.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  handleDraftStart,
  handlePublish,
} from '../../scripts/lib/editorial-calendar-actions/handlers.js';
import { calendarPath, parseCalendar } from '../../scripts/lib/editorial/calendar.js';
import type { Site } from '../../scripts/lib/editorial/types.js';

const SITE: Site = 'audiocontrol';

function seedCalendar(root: string): void {
  const md = [
    '# Editorial Calendar',
    '',
    '## Ideas',
    '',
    '*No entries.*',
    '',
    '## Planned',
    '',
    '| Slug | Title | Description | Keywords | Source |',
    '|------|-------|-------------|----------|--------|',
    '| test-post | Test Post | A test description | keyword1, keyword2 | manual |',
    '',
    '## Drafting',
    '',
    '| Slug | Title | Description | Keywords | Source | Issue |',
    '|------|-------|-------------|----------|--------|-------|',
    '| existing-draft | Existing Draft | Already drafting | kw | manual | #42 |',
    '',
    '## Review',
    '',
    '| Slug | Title | Description | Keywords | Source | Issue |',
    '|------|-------|-------------|----------|--------|-------|',
    '| in-review | In Review | Ready to publish | kw | manual | #43 |',
    '',
    '## Published',
    '',
    '*No entries.*',
    '',
    '## Distribution',
    '',
    '*No entries.*',
    '',
  ].join('\n');

  const path = calendarPath(root, SITE);
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(path, md, 'utf-8');
}

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-calendar-actions-'));
  seedCalendar(root);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('handleDraftStart', () => {
  it('happy path: scaffolds file and flips Planned to Drafting', () => {
    const result = handleDraftStart(root, {
      site: SITE,
      slug: 'test-post',
    });
    expect(result.status).toBe(200);
    if (typeof result.body !== 'object' || result.body === null) {
      throw new Error('expected object body');
    }
    const body = result.body;
    // No issueNumber field should appear in the response body.
    expect('issueNumber' in body).toBe(false);
    const entry = Reflect.get(body, 'entry');
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('expected entry object');
    }
    expect(Reflect.get(entry, 'stage')).toBe('Drafting');
    // And not on the entry — draftEntry doesn't mint one anymore.
    expect(Reflect.get(entry, 'issueNumber')).toBeUndefined();

    const filePath = Reflect.get(body, 'filePath');
    expect(typeof filePath).toBe('string');
    if (typeof filePath !== 'string') throw new Error('bad filePath');
    expect(existsSync(filePath)).toBe(true);
    const contents = readFileSync(filePath, 'utf-8');
    expect(contents).toContain('title: "Test Post"');
    expect(contents).toContain('# Test Post');

    // Calendar file should reflect the transition.
    const cal = parseCalendar(readFileSync(calendarPath(root, SITE), 'utf-8'));
    const updated = cal.entries.find((e) => e.slug === 'test-post');
    expect(updated?.stage).toBe('Drafting');
  });

  it('returns 400 when site is missing', () => {
    const result = handleDraftStart(root, { slug: 'test-post' });
    expect(result.status).toBe(400);
  });

  it('returns 400 when slug is missing', () => {
    const result = handleDraftStart(root, { site: SITE });
    expect(result.status).toBe(400);
  });

  it('returns 400 for a malformed slug (path traversal)', () => {
    const result = handleDraftStart(root, {
      site: SITE,
      slug: '../foo',
    });
    expect(result.status).toBe(400);
  });

  it('returns 400 for an unknown site', () => {
    const result = handleDraftStart(root, {
      site: 'not-a-site',
      slug: 'test-post',
    });
    expect(result.status).toBe(400);
  });

  it('returns 404 when the calendar file is missing', () => {
    const emptyRoot = mkdtempSync(join(tmpdir(), 'editorial-actions-empty-'));
    try {
      const result = handleDraftStart(emptyRoot, {
        site: SITE,
        slug: 'test-post',
      });
      expect(result.status).toBe(404);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  it('returns 404 when the slug is unknown', () => {
    const result = handleDraftStart(root, {
      site: SITE,
      slug: 'does-not-exist',
    });
    expect(result.status).toBe(404);
    if (typeof result.body !== 'object' || result.body === null) {
      throw new Error('expected body object');
    }
    const message = Reflect.get(result.body, 'error');
    expect(typeof message).toBe('string');
    if (typeof message !== 'string') throw new Error('bad error');
    // Should list available slugs.
    expect(message).toContain('test-post');
  });

  it('returns 409 when the entry is not in Planned', () => {
    const result = handleDraftStart(root, {
      site: SITE,
      slug: 'existing-draft',
    });
    expect(result.status).toBe(409);
  });

  it('returns 409 when the blog file already exists on disk', () => {
    const blogDir = join(root, 'src', 'sites', SITE, 'pages', 'blog', 'test-post');
    mkdirSync(blogDir, { recursive: true });
    writeFileSync(join(blogDir, 'index.md'), 'pre-existing content', 'utf-8');

    const result = handleDraftStart(root, {
      site: SITE,
      slug: 'test-post',
    });
    expect(result.status).toBe(409);
  });
});

describe('handlePublish', () => {
  it('happy path from Drafting: flips to Published and sets today', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'existing-draft',
    });
    expect(result.status).toBe(200);
    if (typeof result.body !== 'object' || result.body === null) {
      throw new Error('expected body object');
    }
    const entry = Reflect.get(result.body, 'entry');
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('expected entry');
    }
    expect(Reflect.get(entry, 'stage')).toBe('Published');
    const datePublished = Reflect.get(entry, 'datePublished');
    expect(typeof datePublished).toBe('string');
    if (typeof datePublished !== 'string') throw new Error('bad date');
    expect(/^\d{4}-\d{2}-\d{2}$/.test(datePublished)).toBe(true);
    // Response no longer carries a closedIssue field.
    expect('closedIssue' in result.body).toBe(false);
  });

  it('happy path from Review: flips to Published', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'in-review',
    });
    expect(result.status).toBe(200);

    const cal = parseCalendar(readFileSync(calendarPath(root, SITE), 'utf-8'));
    const updated = cal.entries.find((e) => e.slug === 'in-review');
    expect(updated?.stage).toBe('Published');
  });

  it('returns 400 on missing site', () => {
    const result = handlePublish(root, { slug: 'existing-draft' });
    expect(result.status).toBe(400);
  });

  it('returns 400 on malformed slug', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'bad slug!',
    });
    expect(result.status).toBe(400);
  });

  it('returns 400 on malformed datePublished', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'existing-draft',
      datePublished: 'yesterday',
    });
    expect(result.status).toBe(400);
  });

  it('returns 409 when stage is Planned', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'test-post',
    });
    expect(result.status).toBe(409);
  });

  it('returns 409 when stage is Ideas', () => {
    // Seed an Ideas entry by rewriting the calendar.
    const md = readFileSync(calendarPath(root, SITE), 'utf-8');
    const ideasTable = [
      '| Slug | Title | Description | Keywords | Source |',
      '|------|-------|-------------|----------|--------|',
      '| raw-idea | Raw Idea | just an idea | | manual |',
    ].join('\n');
    writeFileSync(
      calendarPath(root, SITE),
      md.replace('## Ideas\n\n*No entries.*', `## Ideas\n\n${ideasTable}`),
      'utf-8',
    );

    const result = handlePublish(root, {
      site: SITE,
      slug: 'raw-idea',
    });
    expect(result.status).toBe(409);
  });

  it('publishes without regard to legacy issue numbers on the entry', () => {
    // existing-draft has issueNumber #42 in the fixture; publish should
    // advance the stage without attempting to close anything.
    const result = handlePublish(root, {
      site: SITE,
      slug: 'existing-draft',
    });
    expect(result.status).toBe(200);
  });

  it('accepts a custom datePublished and stores it', () => {
    const result = handlePublish(root, {
      site: SITE,
      slug: 'existing-draft',
      datePublished: '2026-01-15',
    });
    expect(result.status).toBe(200);
    if (typeof result.body !== 'object' || result.body === null) {
      throw new Error('expected body');
    }
    const entry = Reflect.get(result.body, 'entry');
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('expected entry');
    }
    expect(Reflect.get(entry, 'datePublished')).toBe('2026-01-15');
  });
});
