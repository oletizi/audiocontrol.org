/**
 * Curated cross-posting channel map loader.
 *
 * Reads `docs/editorial-channels.json` — a map of topic tags to recommended
 * platform channels (subreddits, etc.) — and exposes helpers to look up
 * candidates for a set of topics and diff them against already-shared
 * distributions.
 *
 * Channel comparison is case-insensitive and normalizes common subreddit
 * URL forms (`r/Foo`, `/r/foo`, `https://reddit.com/r/FOO/`) to a single
 * canonical string for the match. This is the invariant that lets us
 * reliably say "already shared to this subreddit — do not duplicate."
 */

import { readFileSync } from 'fs';
import type { DistributionRecord, Platform } from './types.js';

const CHANNELS_FILENAME = 'docs/editorial-channels.json';

export interface ChannelEntry {
  /** Canonical channel name as published in the curated file */
  channel: string;
  /** Optional hint about community rules (self-promo, flair, etc.) */
  note?: string;
}

interface ChannelsFile {
  topics: Record<string, Partial<Record<Platform, ChannelEntry[]>>>;
}

export function channelsPath(rootDir: string): string {
  return `${rootDir}/${CHANNELS_FILENAME}`;
}

/** Load and parse the curated channels file from disk. */
export function readChannels(rootDir: string): ChannelsFile {
  const raw = readFileSync(channelsPath(rootDir), 'utf-8');
  const parsed = JSON.parse(raw) as ChannelsFile;
  if (!parsed || typeof parsed !== 'object' || !parsed.topics) {
    throw new Error(
      `${CHANNELS_FILENAME} is missing a top-level "topics" object`,
    );
  }
  return parsed;
}

/**
 * Return the union of channel candidates across the given topics, grouped
 * by platform. Channels that appear under multiple topics are deduplicated
 * on the canonical form; the first hint encountered wins.
 */
export function getChannelsForTopics(
  file: ChannelsFile,
  topics: string[],
): Map<Platform, ChannelEntry[]> {
  const byPlatform = new Map<Platform, Map<string, ChannelEntry>>();

  for (const topic of topics) {
    const topicEntry = file.topics[topic];
    if (!topicEntry) continue;
    for (const [platform, channels] of Object.entries(topicEntry) as [
      Platform,
      ChannelEntry[] | undefined,
    ][]) {
      if (!channels) continue;
      const platformMap =
        byPlatform.get(platform) ?? new Map<string, ChannelEntry>();
      for (const entry of channels) {
        const key = normalizeChannel(entry.channel);
        if (!platformMap.has(key)) platformMap.set(key, entry);
      }
      byPlatform.set(platform, platformMap);
    }
  }

  const result = new Map<Platform, ChannelEntry[]>();
  for (const [platform, map] of byPlatform) {
    result.set(platform, [...map.values()]);
  }
  return result;
}

/**
 * Normalize a channel name to a canonical form for case-insensitive
 * comparison. Strips URL prefixes and leading slashes so that these all
 * collapse to the same key:
 *   - "r/SynthDIY"
 *   - "/r/synthdiy"
 *   - "https://reddit.com/r/SynthDIY/"
 *   - "https://old.reddit.com/r/synthdiy"
 */
export function normalizeChannel(channel: string): string {
  let value = channel.trim();
  if (!value) return '';

  value = value.replace(
    /^https?:\/\/(www\.|old\.|new\.|np\.)?reddit\.com/i,
    '',
  );
  value = value.replace(/^\//, '').replace(/\/$/, '');
  return value.toLowerCase();
}

/** Remove candidates that are already present in the recorded distributions. */
export function diffShared(
  candidates: ChannelEntry[],
  recorded: DistributionRecord[],
): ChannelEntry[] {
  const sharedKeys = new Set(
    recorded
      .map((r) => r.channel)
      .filter((c): c is string => c !== undefined && c !== '')
      .map(normalizeChannel),
  );
  return candidates.filter(
    (c) => !sharedKeys.has(normalizeChannel(c.channel)),
  );
}

/**
 * Return distribution records that match one of the candidates, preserving
 * the canonical channel form from the candidate so callers can display a
 * consistent label.
 */
export function alreadyShared(
  candidates: ChannelEntry[],
  recorded: DistributionRecord[],
): Array<{ entry: ChannelEntry; record: DistributionRecord }> {
  const candidateKeys = new Map<string, ChannelEntry>();
  for (const c of candidates) {
    candidateKeys.set(normalizeChannel(c.channel), c);
  }
  const pairs: Array<{ entry: ChannelEntry; record: DistributionRecord }> = [];
  for (const r of recorded) {
    if (!r.channel) continue;
    const entry = candidateKeys.get(normalizeChannel(r.channel));
    if (entry) pairs.push({ entry, record: r });
  }
  return pairs;
}
