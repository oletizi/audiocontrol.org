/**
 * Reddit tooling configuration.
 *
 * We use Reddit's public `.json` endpoints for reading user submissions and
 * subreddit metadata — no OAuth, no password, no app registration. The only
 * thing we need is the Reddit username whose submissions we're syncing,
 * which lives in a one-line config file so users don't have to pass it on
 * every invocation.
 *
 * Config file: `~/.config/audiocontrol/reddit.json`
 *
 * ```json
 * { "username": "your-reddit-username" }
 * ```
 *
 * If the file is missing we throw with instructions — no silent fallback.
 */

import { readFileSync } from 'fs';

const REDDIT_CONFIG_PATH = `${process.env.HOME}/.config/audiocontrol/reddit.json`;

export interface RedditConfig {
  /** Reddit username (no `u/` prefix) whose submissions to sync */
  username: string;
}

/** Load the Reddit config from disk. Throws with setup instructions if missing. */
export function loadConfig(): RedditConfig {
  let raw: string;
  try {
    raw = readFileSync(REDDIT_CONFIG_PATH, 'utf-8');
  } catch (err) {
    throw new Error(
      `Reddit config not found at ${REDDIT_CONFIG_PATH}. ` +
        `Create it with: {"username": "your-reddit-username"}`,
    );
  }
  const parsed = JSON.parse(raw) as Partial<RedditConfig>;
  if (!parsed.username || typeof parsed.username !== 'string' || !parsed.username.trim()) {
    throw new Error(
      `Missing or empty "username" field in ${REDDIT_CONFIG_PATH}`,
    );
  }
  return { username: parsed.username.trim() };
}

/**
 * Build a descriptive User-Agent from the username.
 *
 * Reddit rate-limits generic User-Agent strings aggressively; a descriptive
 * one identifying the tool and the user it's running as is required.
 */
export function buildUserAgent(username: string): string {
  return `audiocontrol.org-editorial-calendar/1.0 (by /u/${username})`;
}
