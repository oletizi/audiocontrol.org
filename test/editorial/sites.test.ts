/**
 * Unit tests for Phase 2 additions (multi-site):
 * - Site type + SITES + DEFAULT_SITE
 * - assertSite defaults and error behavior
 * - calendarPath / channelsPath per-site resolution
 * - siteHost / siteBaseUrl
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SITE,
  SITES,
  assertSite,
  isSite,
  siteBaseUrl,
  siteHost,
  type Site,
} from '../../scripts/lib/editorial/index.js';
import { calendarPath } from '../../scripts/lib/editorial/calendar.js';
import { channelsPath } from '../../scripts/lib/editorial/channels.js';

describe('SITES and DEFAULT_SITE', () => {
  it('enumerates both known sites', () => {
    expect(SITES).toEqual(['audiocontrol', 'editorialcontrol']);
  });

  it('defaults to audiocontrol (preserves pre-multi-site invocation behavior)', () => {
    expect(DEFAULT_SITE).toBe('audiocontrol');
  });
});

describe('isSite', () => {
  it('accepts known site slugs', () => {
    for (const site of SITES) {
      expect(isSite(site)).toBe(true);
    }
  });

  it('rejects unknown slugs', () => {
    expect(isSite('audio')).toBe(false);
    expect(isSite('audiocontrol.org')).toBe(false);
    expect(isSite('')).toBe(false);
  });
});

describe('assertSite', () => {
  it('returns the default site when the value is missing', () => {
    expect(assertSite(undefined)).toBe(DEFAULT_SITE);
    expect(assertSite(null)).toBe(DEFAULT_SITE);
    expect(assertSite('')).toBe(DEFAULT_SITE);
  });

  it('returns the site when the value is a known slug', () => {
    expect(assertSite('audiocontrol')).toBe('audiocontrol');
    expect(assertSite('editorialcontrol')).toBe('editorialcontrol');
  });

  it('throws with the valid sites listed when the value is unknown', () => {
    try {
      assertSite('mystery-site');
      throw new Error('expected assertSite to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('mystery-site');
      expect(message).toContain('audiocontrol');
      expect(message).toContain('editorialcontrol');
      expect(message).toContain(DEFAULT_SITE);
    }
  });
});

describe('calendarPath / channelsPath', () => {
  it('resolves per-site data file paths for every known site', () => {
    const root = '/repo';
    for (const site of SITES) {
      expect(calendarPath(root, site)).toBe(
        `/repo/docs/editorial-calendar-${site}.md`,
      );
      expect(channelsPath(root, site)).toBe(
        `/repo/docs/editorial-channels-${site}.json`,
      );
    }
  });

  it('keeps audiocontrol and editorialcontrol paths distinct', () => {
    const root = '/repo';
    const sites: Site[] = ['audiocontrol', 'editorialcontrol'];
    const calendars = new Set(sites.map((s) => calendarPath(root, s)));
    const channels = new Set(sites.map((s) => channelsPath(root, s)));
    expect(calendars.size).toBe(sites.length);
    expect(channels.size).toBe(sites.length);
  });
});

describe('siteHost / siteBaseUrl', () => {
  it('derives the canonical host from the site slug', () => {
    expect(siteHost('audiocontrol')).toBe('audiocontrol.org');
    expect(siteHost('editorialcontrol')).toBe('editorialcontrol.org');
  });

  it('wraps the host in a full base URL', () => {
    expect(siteBaseUrl('audiocontrol')).toBe('https://audiocontrol.org/');
    expect(siteBaseUrl('editorialcontrol')).toBe('https://editorialcontrol.org/');
  });
});
