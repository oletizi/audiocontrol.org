/**
 * Round-trip tests for the ## Shortform Copy calendar section and the
 * shortform-scoped editorial-review workflow.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  parseCalendar,
  renderCalendar,
} from '../../scripts/lib/editorial/calendar.js';
import type {
  DistributionRecord,
  EditorialCalendar,
} from '../../scripts/lib/editorial/types.js';
import { createWorkflow } from '../../scripts/lib/editorial-review/pipeline.js';

function emptyCalendar(): EditorialCalendar {
  return { entries: [], distributions: [] };
}

describe('## Shortform Copy section', () => {
  it('round-trips a single record with multi-line body', () => {
    const cal = emptyCalendar();
    cal.distributions.push({
      slug: 'my-post',
      platform: 'reddit',
      channel: 'r/synthdiy',
      url: 'https://reddit.com/r/synthdiy/comments/abc',
      dateShared: '2026-04-20',
      shortform: 'title: A two-line title\n\nBody paragraph one.\n\nBody paragraph two with `code` and *emphasis*.',
    });
    const md = renderCalendar(cal);
    const parsed = parseCalendar(md);
    const rec = parsed.distributions[0];
    expect(rec.shortform).toBe(cal.distributions[0].shortform);
  });

  it('emits the section only when at least one record has shortform content', () => {
    const cal = emptyCalendar();
    cal.distributions.push({
      slug: 'x',
      platform: 'reddit',
      url: 'https://reddit.com/x',
      dateShared: '2026-04-20',
    });
    const md = renderCalendar(cal);
    expect(md).not.toContain('## Shortform Copy');
  });

  it('matches short-form blocks back to records by (slug, platform, channel)', () => {
    const cal = emptyCalendar();
    const lf: DistributionRecord = {
      slug: 'p',
      platform: 'linkedin',
      url: 'https://linkedin.com/x',
      dateShared: '2026-04-20',
      shortform: 'A LinkedIn post body.',
    };
    const rd: DistributionRecord = {
      slug: 'p',
      platform: 'reddit',
      channel: 'r/audioengineering',
      url: 'https://reddit.com/r/audioengineering/x',
      dateShared: '2026-04-20',
      shortform: 'Reddit title + body.',
    };
    cal.distributions.push(lf, rd);
    const parsed = parseCalendar(renderCalendar(cal));
    const back = parsed.distributions;
    const lfBack = back.find(
      (d) => d.slug === 'p' && d.platform === 'linkedin',
    );
    const rdBack = back.find(
      (d) => d.slug === 'p' && d.platform === 'reddit',
    );
    expect(lfBack?.shortform).toBe('A LinkedIn post body.');
    expect(rdBack?.shortform).toBe('Reddit title + body.');
  });

  it('channel match is case-insensitive', () => {
    const cal = emptyCalendar();
    cal.distributions.push({
      slug: 'p',
      platform: 'reddit',
      channel: 'r/SynthDIY',
      url: 'https://reddit.com/x',
      dateShared: '2026-04-20',
      shortform: 'body',
    });
    const md = renderCalendar(cal);
    // Flip case on the channel in the written section header to simulate
    // drift, then parse — should still attach to the (case-different) record.
    const jittered = md.replace('### p · reddit · r/SynthDIY', '### p · reddit · r/synthdiy');
    const parsed = parseCalendar(jittered);
    expect(parsed.distributions[0].shortform).toBe('body');
  });

  it('ignores shortform blocks that do not match any distribution record', () => {
    const cal = emptyCalendar();
    cal.distributions.push({
      slug: 'p',
      platform: 'reddit',
      url: 'https://reddit.com/x',
      dateShared: '2026-04-20',
    });
    const md = renderCalendar(cal) + '\n\n## Shortform Copy\n\n### does-not-exist · reddit\n\nstray body\n';
    const parsed = parseCalendar(md);
    expect(parsed.distributions[0].shortform).toBeUndefined();
  });
});

describe('shortform workflow idempotence', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'editorial-review-shortform-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('createWorkflow is idempotent on (slug, platform, channel)', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/synthdiy',
      initialMarkdown: 'v1',
    });
    const b = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/synthdiy',
      initialMarkdown: 'different v1',
    });
    expect(b.id).toBe(a.id);
  });

  it('creates distinct workflows for distinct (slug, platform, channel)', () => {
    const reddit = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/synthdiy',
      initialMarkdown: 'a',
    });
    const sameSlugDifferentSub = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/vintagesynths',
      initialMarkdown: 'b',
    });
    const linkedin = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'linkedin',
      initialMarkdown: 'c',
    });
    expect(new Set([reddit.id, sameSlugDifferentSub.id, linkedin.id]).size).toBe(3);
  });

  it('shortform and longform workflows for the same slug coexist', () => {
    const lf = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'longform body',
    });
    const sf = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/synthdiy',
      initialMarkdown: 'shortform body',
    });
    expect(sf.id).not.toBe(lf.id);
  });
});
