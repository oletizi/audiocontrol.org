/**
 * Minimal Reddit public-JSON client — no authentication.
 *
 * Reddit exposes most public data by appending `.json` to any reddit.com
 * URL. We use this for:
 * - `getUserSubmissions` → `/user/<name>/submitted.json`
 * - `getSubredditInfo`   → `/r/<name>/about.json`
 *
 * Reddit still requires a descriptive User-Agent header on every request,
 * or the response is rate-limited or blocked. We build the UA from the
 * configured username so requests are identifiable.
 *
 * No OAuth, no app registration, no credentials beyond the user's public
 * username. Trade-off: tighter rate limit (~10 req/min instead of 100) and
 * read-only access to public data. Sufficient for our editorial tooling.
 */

import { loadConfig, buildUserAgent } from './config.js';
import type { Site } from '../editorial/types.js';

const REDDIT_PUBLIC_BASE = 'https://www.reddit.com';

interface ListingChild<T> {
  kind: string;
  data: T;
}

interface Listing<T> {
  kind: 'Listing';
  data: {
    after: string | null;
    before: string | null;
    children: ListingChild<T>[];
  };
}

interface RedditSubmissionRaw {
  id: string;
  name: string;
  title: string;
  permalink: string;
  url: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  created_utc: number;
  selftext: string;
  is_self: boolean;
  domain: string;
}

/** One submission by a user. */
export interface RedditSubmission {
  /** Reddit's full ID, e.g. "t3_abcxyz" */
  id: string;
  title: string;
  /** Canonical subreddit form, e.g. "r/synthdiy" */
  subreddit: string;
  /** Permalink to the submission on reddit.com */
  permalink: string;
  /** The URL the submission links to (or the reddit.com permalink for self posts) */
  url: string;
  /** ISO date string (UTC) when the submission was created */
  createdDate: string;
  /** Self-post body text (empty for link posts) */
  selftext: string;
}

interface SubredditAboutRaw {
  display_name: string;
  display_name_prefixed: string;
  subscribers: number;
  accounts_active: number | null;
  over18: boolean;
  public_description: string;
  submission_type: string;
  wiki_enabled: boolean | null;
  description: string;
}

/** Subset of /r/<name>/about.json that's useful for opportunity reports. */
export interface SubredditInfo {
  name: string; // "r/synthdiy"
  subscribers: number;
  activeUsers: number;
  over18: boolean;
  publicDescription: string;
  submissionType: string;
  /** Extracted heuristically from public description + sidebar text. */
  selfPromoHints: string[];
}

function canonicalSubreddit(raw: string): string {
  const trimmed = raw.trim().replace(/^\/?r\//i, '');
  return `r/${trimmed}`;
}

function toIsoDate(createdUtc: number): string {
  return new Date(createdUtc * 1000).toISOString().slice(0, 10);
}

async function redditPublicGet<T>(site: Site, path: string): Promise<T> {
  const config = loadConfig(site);
  const userAgent = buildUserAgent(config.username);

  const url = new URL(`${REDDIT_PUBLIC_BASE}${path}`);
  if (!url.searchParams.has('raw_json')) {
    url.searchParams.set('raw_json', '1');
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Reddit public API error ${response.status} ${response.statusText} for ${path}: ${body.slice(0, 500)}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * List the configured user's recent submissions (link + self posts) for a
 * given site's Reddit account.
 *
 * Pages through `.json` listings until `limit` is reached or Reddit runs
 * out of results. The username is resolved from the site-keyed config; to
 * hit a different username without touching config, pass `usernameOverride`.
 */
export async function getUserSubmissions(
  site: Site,
  limit: number = 100,
  usernameOverride?: string,
): Promise<RedditSubmission[]> {
  const effectiveUser = usernameOverride ?? loadConfig(site).username;
  const results: RedditSubmission[] = [];
  let after: string | null = null;

  while (results.length < limit) {
    const pageSize: number = Math.min(100, limit - results.length);
    const afterParam = after ? `&after=${after}` : '';
    const path: string = `/user/${encodeURIComponent(effectiveUser)}/submitted.json?limit=${pageSize}${afterParam}`;
    const listing: Listing<RedditSubmissionRaw> =
      await redditPublicGet<Listing<RedditSubmissionRaw>>(site, path);
    const children = listing.data.children;
    if (children.length === 0) break;

    for (const child of children) {
      const raw = child.data;
      results.push({
        id: raw.name,
        title: raw.title,
        subreddit: canonicalSubreddit(raw.subreddit),
        permalink: `${REDDIT_PUBLIC_BASE}${raw.permalink}`,
        url: raw.url,
        createdDate: toIsoDate(raw.created_utc),
        selftext: raw.selftext ?? '',
      });
    }

    after = listing.data.after;
    if (!after) break;
  }

  return results;
}

const SELF_PROMO_PHRASES: Array<{ pattern: RegExp; hint: string }> = [
  { pattern: /no self[- ]?promo/i, hint: 'no self-promotion' },
  { pattern: /1[- ]?in[- ]?10/i, hint: '1-in-10 self-promo ratio enforced' },
  { pattern: /flair (?:is |your )?required/i, hint: 'flair required' },
  { pattern: /feedback friday/i, hint: 'self-promo only in Feedback Friday threads' },
  { pattern: /blog\s*posts?\s*(?:are\s*)?not\s*allowed/i, hint: 'blog posts disallowed' },
  { pattern: /link\s*posts?\s*(?:are\s*)?not\s*allowed/i, hint: 'link posts disallowed' },
  { pattern: /minimum (\d+) karma/i, hint: 'karma minimum enforced' },
];

function extractSelfPromoHints(...texts: Array<string | undefined>): string[] {
  const haystack = texts.filter(Boolean).join('\n').toLowerCase();
  const hits = new Set<string>();
  for (const { pattern, hint } of SELF_PROMO_PHRASES) {
    if (pattern.test(haystack)) hits.add(hint);
  }
  return [...hits];
}

/**
 * Fetch subscriber count and self-promo hints for a subreddit via
 * /r/<name>/about.json. `site` is used to build the User-Agent from that
 * site's configured Reddit username (Reddit requires a descriptive UA).
 */
export async function getSubredditInfo(
  site: Site,
  name: string,
): Promise<SubredditInfo> {
  const normalized = name.replace(/^\/?r\//i, '').replace(/\/$/, '');
  const path = `/r/${encodeURIComponent(normalized)}/about.json`;
  const response = await redditPublicGet<{ data: SubredditAboutRaw }>(site, path);
  const data = response.data;
  return {
    name: canonicalSubreddit(data.display_name),
    subscribers: data.subscribers ?? 0,
    activeUsers: data.accounts_active ?? 0,
    over18: Boolean(data.over18),
    publicDescription: data.public_description ?? '',
    submissionType: data.submission_type ?? 'any',
    selfPromoHints: extractSelfPromoHints(
      data.public_description,
      data.description,
    ),
  };
}
