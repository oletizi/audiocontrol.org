/**
 * Unit tests for the site-keyed Reddit config.
 *
 * Covers parsing, site resolution, the old-schema migration error, and
 * the loader's filesystem path override (used by tests so they don't
 * depend on the real ~/.config/audiocontrol/reddit.json).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  parseConfig,
  loadConfig,
  buildUserAgent,
} from '../../scripts/lib/reddit/config.js';

describe('parseConfig', () => {
  it('parses a site-keyed config with both sites', () => {
    const raw = JSON.stringify({
      audiocontrol: { username: 'alice' },
      editorialcontrol: { username: 'bob' },
    });
    const config = parseConfig(raw);
    expect(config.audiocontrol?.username).toBe('alice');
    expect(config.editorialcontrol?.username).toBe('bob');
  });

  it('accepts a config with only one site present', () => {
    const raw = JSON.stringify({ audiocontrol: { username: 'alice' } });
    const config = parseConfig(raw);
    expect(config.audiocontrol?.username).toBe('alice');
    expect(config.editorialcontrol).toBeUndefined();
  });

  it('trims whitespace from usernames', () => {
    const raw = JSON.stringify({ audiocontrol: { username: '  alice  ' } });
    const config = parseConfig(raw);
    expect(config.audiocontrol?.username).toBe('alice');
  });

  it('throws a migration error when the old flat schema is present', () => {
    const raw = JSON.stringify({ username: 'alice' });
    try {
      parseConfig(raw, '/fake/reddit.json');
      throw new Error('expected parseConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('old flat schema');
      expect(message).toContain('audiocontrol');
      expect(message).toContain('editorialcontrol');
      expect(message).toContain('/fake/reddit.json');
    }
  });

  it('throws when the JSON is malformed', () => {
    try {
      parseConfig('{not json');
      throw new Error('expected parseConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('not valid JSON');
    }
  });

  it('throws when the top level is not an object', () => {
    try {
      parseConfig('["an", "array"]');
      throw new Error('expected parseConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('JSON object at the top level');
    }
  });

  it('throws when a site entry is missing username', () => {
    const raw = JSON.stringify({ audiocontrol: {} });
    try {
      parseConfig(raw);
      throw new Error('expected parseConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('audiocontrol');
      expect(message).toContain('username');
    }
  });

  it('ignores unknown top-level keys', () => {
    const raw = JSON.stringify({
      audiocontrol: { username: 'alice' },
      someFutureSite: { username: 'carol' },
    });
    const config = parseConfig(raw);
    expect(config.audiocontrol?.username).toBe('alice');
    // Unknown keys are not validated or rejected — the SITES allowlist
    // defines what gets picked up. This keeps the parser forward-compatible
    // with configs written by newer tools.
    expect((config as Record<string, unknown>).someFutureSite).toBeUndefined();
  });
});

describe('loadConfig', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'reddit-config-test-'));
    configPath = join(tempDir, 'reddit.json');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns the site entry when configured', () => {
    writeFileSync(
      configPath,
      JSON.stringify({
        audiocontrol: { username: 'alice' },
        editorialcontrol: { username: 'bob' },
      }),
    );
    expect(loadConfig('audiocontrol', configPath).username).toBe('alice');
    expect(loadConfig('editorialcontrol', configPath).username).toBe('bob');
  });

  it('throws with setup instructions when the file is missing', () => {
    const missing = join(tempDir, 'does-not-exist.json');
    try {
      loadConfig('editorialcontrol', missing);
      throw new Error('expected loadConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('not found');
      expect(message).toContain('editorialcontrol');
      expect(message).toContain('username');
    }
  });

  it('throws a clear error when the requested site is missing from an otherwise-valid file', () => {
    writeFileSync(
      configPath,
      JSON.stringify({ audiocontrol: { username: 'alice' } }),
    );
    try {
      loadConfig('editorialcontrol', configPath);
      throw new Error('expected loadConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('editorialcontrol');
      expect(message).toContain('audiocontrol'); // listed as currently-configured
    }
  });

  it('passes the old-schema migration error up to the caller', () => {
    writeFileSync(configPath, JSON.stringify({ username: 'alice' }));
    try {
      loadConfig('audiocontrol', configPath);
      throw new Error('expected loadConfig to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('old flat schema');
    }
  });
});

describe('buildUserAgent', () => {
  it('formats a descriptive User-Agent from a username', () => {
    expect(buildUserAgent('alice')).toBe(
      'audiocontrol.org-editorial-calendar/1.0 (by /u/alice)',
    );
  });
});
