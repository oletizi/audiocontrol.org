/**
 * Minimal HTML fetcher for public pages.
 *
 * Used by the cross-link audit to fetch rendered tool pages from
 * audiocontrol.org. No auth, follows redirects (built into `fetch`),
 * throws on non-2xx so callers can record the error per-entry without
 * silent corruption.
 *
 * Sets a descriptive User-Agent so we're identifiable in the Netlify
 * access log if anything odd shows up.
 */

const DEFAULT_USER_AGENT =
  'audiocontrol.org-editorial-calendar/1.0 cross-link-audit';

const DEFAULT_TIMEOUT_MS = 10_000;

export interface FetchHtmlOptions {
  /** Override the User-Agent header. */
  userAgent?: string;
  /** Abort the request after this many ms. Default 10s. */
  timeoutMs?: number;
}

/**
 * Fetch a public HTML page and return its body as a string.
 *
 * Throws with a specific message on:
 *  - non-2xx responses (status + URL)
 *  - timeout after the configured budget
 *  - network errors (wrapped with the URL for context)
 */
export async function fetchHtml(
  url: string,
  options: FetchHtmlOptions = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `fetchHtml: ${response.status} ${response.statusText} for ${url}`,
      );
    }

    return await response.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`fetchHtml: timeout after ${timeoutMs}ms for ${url}`);
    }
    if (err instanceof Error && err.message.startsWith('fetchHtml:')) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`fetchHtml: ${message} for ${url}`);
  } finally {
    clearTimeout(timer);
  }
}
