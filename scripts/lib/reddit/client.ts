/**
 * Minimal Reddit API client.
 *
 * Covers only the calls our editorial tooling needs:
 * - getUserSubmissions: list the user's submissions with URL/subreddit/date
 * - getSubredditInfo: fetch subscriber count and self-promo hints from
 *   /r/<name>/about.json
 *
 * All calls go through the OAuth host (oauth.reddit.com) with a bearer
 * token from auth.ts. Reddit requires a descriptive User-Agent header; we
 * read that from the credentials file so the caller controls it.
 */

import { getAccessToken, loadCredentials } from './auth.js';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

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

/** One submission by the authenticated user. */
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

/** Normalize a raw subreddit name ("synthdiy", "/r/synthdiy") to "r/synthdiy". */
function canonicalSubreddit(raw: string): string {
  const trimmed = raw.trim().replace(/^\/?r\//i, '');
  return `r/${trimmed}`;
}

function toIsoDate(createdUtc: number): string {
  return new Date(createdUtc * 1000).toISOString().slice(0, 10);
}

async function redditGet<T>(path: string): Promise<T> {
  const creds = loadCredentials();
  const token = await getAccessToken(creds);
  const url = new URL(`${REDDIT_API_BASE}${path}`);
  if (!url.searchParams.has('raw_json')) {
    url.searchParams.set('raw_json', '1');
  }
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': creds.userAgent,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Reddit API error ${response.status} ${response.statusText} for ${path}: ${body.slice(0, 500)}`,
    );
  }
  return response.json() as Promise<T>;
}

/**
 * List the authenticated user's recent submissions (link + self posts).
 *
 * Reddit's `/user/<u>/submitted` endpoint returns up to 100 per page; this
 * function pages through until either the caller's `limit` is reached or
 * Reddit runs out of results.
 */
export async function getUserSubmissions(
  username: string,
  limit: number = 100,
): Promise<RedditSubmission[]> {
  const results: RedditSubmission[] = [];
  let after: string | null = null;

  while (results.length < limit) {
    const pageSize: number = Math.min(100, limit - results.length);
    const path: string = `/user/${encodeURIComponent(username)}/submitted?limit=${pageSize}${after ? `&after=${after}` : ''}`;
    const listing: Listing<RedditSubmissionRaw> =
      await redditGet<Listing<RedditSubmissionRaw>>(path);
    const children = listing.data.children;
    if (children.length === 0) break;

    for (const child of children) {
      const raw = child.data;
      results.push({
        id: raw.name,
        title: raw.title,
        subreddit: canonicalSubreddit(raw.subreddit),
        permalink: `https://www.reddit.com${raw.permalink}`,
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

/** Fetch subscriber count and self-promo hints for a subreddit. */
export async function getSubredditInfo(name: string): Promise<SubredditInfo> {
  const normalized = name.replace(/^\/?r\//i, '').replace(/\/$/, '');
  const path = `/r/${encodeURIComponent(normalized)}/about`;
  const response = await redditGet<{ data: SubredditAboutRaw }>(path);
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
