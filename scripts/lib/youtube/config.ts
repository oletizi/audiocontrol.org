/**
 * YouTube Data API v3 configuration.
 *
 * The API key is read from a plain-text file, matching the convention
 * used by other single-secret credentials in `~/.config/audiocontrol/`
 * (flux-key.txt, openai-key.txt, etc.):
 *
 *   `~/.config/audiocontrol/youtube-key.txt`  — one line containing
 *   the `AIza...` key.
 *
 * Setup steps (one-time):
 * 1. https://console.cloud.google.com → pick or create a project
 * 2. APIs & Services → Library → enable "YouTube Data API v3"
 * 3. Credentials → Create credentials → API key
 * 4. Restrict the key to YouTube Data API v3 for hygiene
 * 5. `echo "AIza..." > ~/.config/audiocontrol/youtube-key.txt`
 *
 * If the file is missing we throw with these steps — no silent fallback.
 */

import { readFileSync } from 'fs';

const YOUTUBE_KEY_PATH = `${process.env.HOME}/.config/audiocontrol/youtube-key.txt`;

export interface YouTubeConfig {
  apiKey: string;
}

export function loadConfig(): YouTubeConfig {
  let raw: string;
  try {
    raw = readFileSync(YOUTUBE_KEY_PATH, 'utf-8');
  } catch {
    throw new Error(
      `YouTube API key not found at ${YOUTUBE_KEY_PATH}. ` +
        `Create the file with your API key on a single line — see the file ` +
        `header of scripts/lib/youtube/config.ts for setup instructions.`,
    );
  }
  const apiKey = raw.trim();
  if (!apiKey) {
    throw new Error(
      `YouTube API key file ${YOUTUBE_KEY_PATH} is empty`,
    );
  }
  return { apiKey };
}
