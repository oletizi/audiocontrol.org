/**
 * Minimal YouTube Data API v3 client.
 *
 * We need exactly one operation: fetch a video's metadata (title,
 * description, channel, publish date) given a video ID or URL. Used by
 * the cross-link audit to extract audiocontrol.org URLs from YouTube
 * video descriptions.
 *
 * One API call = 1 quota unit. Free tier is 10,000 units/day — effectively
 * unlimited for our use case.
 */

import { loadConfig } from './config.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface VideoMetadata {
  /** Canonical 11-char video ID */
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  /** ISO timestamp of the publishedAt field */
  publishedAt: string;
}

interface VideoListResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      channelId?: string;
      publishedAt?: string;
    };
  }>;
}

/**
 * Extract an 11-character video ID from a YouTube URL or return the input
 * if it already looks like a bare ID.
 *
 * Supported URL forms:
 *   - `https://www.youtube.com/watch?v=<id>`
 *   - `https://youtu.be/<id>`
 *   - `https://www.youtube.com/shorts/<id>`
 *   - `https://www.youtube.com/embed/<id>`
 */
export function extractVideoId(input: string): string {
  const value = input.trim();
  if (!value) throw new Error('extractVideoId: empty input');

  // Bare 11-char ID shape
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`extractVideoId: not a bare ID and not a parseable URL: ${value}`);
  }

  const host = url.hostname.toLowerCase();

  // youtu.be/<id>
  if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
  }

  // youtube.com/watch?v=<id>
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    const v = url.searchParams.get('v');
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

    // youtube.com/shorts/<id> or /embed/<id>
    const match = url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }

  throw new Error(`extractVideoId: could not extract a video ID from ${value}`);
}

/** Fetch metadata for a single YouTube video. */
export async function getVideoMetadata(
  videoIdOrUrl: string,
): Promise<VideoMetadata> {
  const config = loadConfig();
  const id = extractVideoId(videoIdOrUrl);

  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('id', id);
  url.searchParams.set('key', config.apiKey);

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `YouTube API error ${response.status} ${response.statusText} for video ${id}: ${body.slice(0, 500)}`,
    );
  }

  const data = (await response.json()) as VideoListResponse;
  const item = data.items?.[0];
  if (!item) {
    throw new Error(`YouTube API returned no items for video ${id}`);
  }
  const snippet = item.snippet ?? {};
  return {
    id: item.id,
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    channelTitle: snippet.channelTitle ?? '',
    channelId: snippet.channelId ?? '',
    publishedAt: snippet.publishedAt ?? '',
  };
}
