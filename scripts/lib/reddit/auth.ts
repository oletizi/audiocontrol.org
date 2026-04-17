/**
 * Reddit API authentication via script-app OAuth flow.
 *
 * Loads credentials from ~/.config/audiocontrol/reddit.json:
 *   {
 *     "clientId": "...",
 *     "clientSecret": "...",
 *     "username": "...",
 *     "password": "...",
 *     "userAgent": "audiocontrol.org:editorial-sync:v1 (by /u/<user>)"
 *   }
 *
 * Uses the password grant supported by Reddit's "script" app type. This
 * avoids an interactive OAuth flow at the cost of being tied to a single
 * user account — fine for personal tooling, not for multi-user deployment.
 *
 * Reddit requires a meaningful User-Agent header on every request; requests
 * without one (or with a generic one) are rate-limited aggressively.
 */

import { readFileSync } from 'fs';

const REDDIT_CONFIG_PATH = `${process.env.HOME}/.config/audiocontrol/reddit.json`;
const REDDIT_ACCESS_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  userAgent: string;
}

/** Load Reddit credentials from the config file. Throws if any field is missing. */
export function loadCredentials(): RedditCredentials {
  const raw = readFileSync(REDDIT_CONFIG_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<RedditCredentials>;
  const required: Array<keyof RedditCredentials> = [
    'clientId',
    'clientSecret',
    'username',
    'password',
    'userAgent',
  ];
  for (const field of required) {
    const value = parsed[field];
    if (!value || typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing or empty "${field}" in ${REDDIT_CONFIG_PATH}`);
    }
  }
  return parsed as RedditCredentials;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

let cached: CachedToken | null = null;

/**
 * Return a valid bearer token, fetching a new one if the cache is empty
 * or the existing token is within 60s of expiry. Tokens are cached in
 * memory for the life of the process only.
 */
export async function getAccessToken(
  credentials: RedditCredentials = loadCredentials(),
): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt - now > 60_000) {
    return cached.token;
  }

  const basic = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'password',
    username: credentials.username,
    password: credentials.password,
  });

  const response = await fetch(REDDIT_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': credentials.userAgent,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Reddit token request failed ${response.status} ${response.statusText}: ${text}`,
    );
  }

  const data = (await response.json()) as TokenResponse;
  if (!data.access_token) {
    throw new Error(
      `Reddit token response missing access_token: ${JSON.stringify(data)}`,
    );
  }

  cached = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cached.token;
}

/** Clear the cached token (used by tests). */
export function clearTokenCache(): void {
  cached = null;
}
