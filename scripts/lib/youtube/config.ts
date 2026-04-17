/**
 * YouTube Data API v3 configuration.
 *
 * One key in one file — same pattern as the other audiocontrol tooling.
 *
 * Config: `~/.config/audiocontrol/youtube.json`
 *
 * ```json
 * { "apiKey": "AIza..." }
 * ```
 *
 * Setup steps (one-time):
 * 1. https://console.cloud.google.com → pick or create a project
 * 2. APIs & Services → Library → enable "YouTube Data API v3"
 * 3. Credentials → Create credentials → API key
 * 4. Restrict the key to YouTube Data API v3 for hygiene
 * 5. Save the key in the JSON above
 *
 * If the file is missing we throw with these steps — no silent fallback.
 */

import { readFileSync } from 'fs';

const YOUTUBE_CONFIG_PATH = `${process.env.HOME}/.config/audiocontrol/youtube.json`;

export interface YouTubeConfig {
  apiKey: string;
}

export function loadConfig(): YouTubeConfig {
  let raw: string;
  try {
    raw = readFileSync(YOUTUBE_CONFIG_PATH, 'utf-8');
  } catch {
    throw new Error(
      `YouTube config not found at ${YOUTUBE_CONFIG_PATH}. ` +
        `Create it with: {"apiKey": "AIza..."} — see the file header of ` +
        `scripts/lib/youtube/config.ts for setup instructions.`,
    );
  }
  const parsed = JSON.parse(raw) as Partial<YouTubeConfig>;
  if (!parsed.apiKey || typeof parsed.apiKey !== 'string' || !parsed.apiKey.trim()) {
    throw new Error(
      `Missing or empty "apiKey" in ${YOUTUBE_CONFIG_PATH}`,
    );
  }
  return { apiKey: parsed.apiKey.trim() };
}
