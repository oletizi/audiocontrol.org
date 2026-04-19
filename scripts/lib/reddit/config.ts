/**
 * Reddit tooling configuration (site-keyed).
 *
 * We use Reddit's public `.json` endpoints for reading user submissions and
 * subreddit metadata — no OAuth, no password, no app registration. Each
 * site in the repo (audiocontrol, editorialcontrol) can have its own
 * Reddit username; a single config file holds them all.
 *
 * Config file: `~/.config/audiocontrol/reddit.json`
 *
 * Site-keyed schema:
 * ```json
 * {
 *   "audiocontrol":    { "username": "your-audiocontrol-reddit-handle" },
 *   "editorialcontrol": { "username": "your-editorialcontrol-reddit-handle" }
 * }
 * ```
 *
 * The old flat schema (`{ "username": "..." }`) is explicitly rejected with
 * a migration error — no silent fallback.
 */

import { readFileSync } from 'fs';
import { SITES, type Site } from '../editorial/types.js';

const DEFAULT_REDDIT_CONFIG_PATH = `${process.env.HOME}/.config/audiocontrol/reddit.json`;

/** Per-site Reddit credentials. Today just a username; room to grow. */
export interface SiteRedditConfig {
  /** Reddit username (no `u/` prefix) whose submissions to sync for this site. */
  username: string;
}

/**
 * The full config — a mapping of site slug to per-site config. Sites that
 * haven't been set up yet are simply absent; callers that ask for a missing
 * site get a clear error.
 */
export type RedditConfig = Partial<Record<Site, SiteRedditConfig>>;

/** Migration instructions appended to errors that detect the old schema. */
const MIGRATION_HINT =
  'Migrate to the site-keyed schema: ' +
  '{"audiocontrol": {"username": "your-handle"}, "editorialcontrol": {"username": "your-handle"}}. ' +
  'Only include sites you actually use.';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Parse a raw JSON string into a validated RedditConfig. Throws with a
 * migration hint if the payload is the old flat `{ username: ... }` shape.
 * Pure function — testable without filesystem access.
 */
export function parseConfig(raw: string, source: string = '<input>'): RedditConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${source} is not valid JSON: ${message}`);
  }

  if (!isPlainObject(parsed)) {
    throw new Error(`${source} must be a JSON object at the top level`);
  }

  // Detect the old flat schema — a top-level `username` field — and refuse.
  // Multi-site editorialcontrol work requires the site-keyed shape.
  if (typeof parsed.username === 'string') {
    throw new Error(
      `${source} uses the old flat schema ({"username": "..."}). ${MIGRATION_HINT}`,
    );
  }

  const config: RedditConfig = {};
  for (const site of SITES) {
    const entry = parsed[site];
    if (entry === undefined) continue;
    if (!isPlainObject(entry)) {
      throw new Error(
        `${source}[${site}] must be an object with a "username" field`,
      );
    }
    const username = entry.username;
    if (typeof username !== 'string' || !username.trim()) {
      throw new Error(
        `${source}[${site}].username must be a non-empty string`,
      );
    }
    config[site] = { username: username.trim() };
  }

  return config;
}

/**
 * Load the Reddit config for one site. Throws with setup instructions when
 * the config file is missing or the requested site isn't configured.
 *
 * `configPath` is exposed for tests; production callers should use the
 * default (`~/.config/audiocontrol/reddit.json`).
 */
export function loadConfig(
  site: Site,
  configPath: string = DEFAULT_REDDIT_CONFIG_PATH,
): SiteRedditConfig {
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch (err) {
    throw new Error(
      `Reddit config not found at ${configPath}. ` +
        `Create it with the site-keyed schema: ` +
        `{"${site}": {"username": "your-reddit-username"}}. ` +
        `Other configured sites can sit beside this one in the same file.`,
    );
  }

  const config = parseConfig(raw, configPath);
  const siteConfig = config[site];
  if (!siteConfig) {
    const configured = Object.keys(config);
    const haveStr =
      configured.length > 0
        ? `Currently configured sites: ${configured.join(', ')}.`
        : 'No sites are currently configured.';
    throw new Error(
      `No Reddit config for site "${site}" in ${configPath}. ${haveStr} ` +
        `Add an entry: {"${site}": {"username": "your-reddit-username"}}.`,
    );
  }
  return siteConfig;
}

/**
 * Build a descriptive User-Agent from a username.
 *
 * Reddit rate-limits generic User-Agent strings aggressively; a descriptive
 * one identifying the tool and the user it's running as is required.
 */
export function buildUserAgent(username: string): string {
  return `audiocontrol.org-editorial-calendar/1.0 (by /u/${username})`;
}
