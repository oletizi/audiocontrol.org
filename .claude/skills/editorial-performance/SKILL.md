---
name: editorial-performance
description: "Show analytics metrics for published posts and flag underperformers needing updates."
user_invocable: true
---

# Editorial Performance

Pull analytics for published posts and flag those needing attention.

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md` to get the list of Published entries
2. **Run analytics**: Execute `tsx scripts/analytics-report.ts --json` to fetch live analytics data
3. **Match posts to metrics**: For each published post, gather:
   - Pageviews and sessions (Umami/GA4)
   - Search impressions, clicks, CTR, average position (Search Console)
   - Recommendations from the analytics engine
4. **Flag underperformers**: Posts that have recommendations from the analytics engine:
   - High impressions but low CTR (title/description needs improvement)
   - High bounce rate (content or UX issue)
   - Striking-distance rankings (could be boosted with updates)
5. **Fetch social referrals**: Call `getSocialReferrals(publishedEntries)` from `scripts/lib/editorial/suggest.ts` to break out per-post traffic from Reddit, YouTube, LinkedIn, and Instagram
6. **Report**: Show a performance table, a per-post social referrals table, and recommendations:
   ```
   Published Posts Performance:

   | Post | Pageviews | Impressions | CTR | Avg Position | Status |
   |------|-----------|-------------|-----|--------------|--------|
   | free-roland-s330-sampler-editor | 1,200 | 3,400 | 4.2% | 6.1 | OK |
   | scsi-over-wifi-raspberry-pi-bridge | 80 | 900 | 0.8% | 14.3 | Needs Update |

   Social Referrals (sessions per post per platform):

   | Post | Reddit | YouTube | LinkedIn | Instagram |
   |------|--------|---------|----------|-----------|
   | claude-vs-codex-claude-perspective | 42 | — | 11 | — |
   | scsi-over-wifi-raspberry-pi-bridge | 7 | — | — | — |

   Recommendations:
   - scsi-over-wifi-raspberry-pi-bridge: High impressions but low CTR — consider updating title and meta description
   ```
   Omit rows with zero social sessions across all four platforms. If no post had any social sessions in the window, report `(no social session traffic attributed in window)`.

## Implementation

The `getPostPerformance()` function in `scripts/lib/editorial/suggest.ts` handles steps 2-4. It:
- Calls the analytics pipeline (Umami, GA4, Search Console)
- Matches each published entry to its metrics across all data sources
- Collects recommendations from the analytics recommendation engine
- Sorts results with underperformers first

The `getSocialReferrals()` function in the same file handles step 5:
- Queries GA4 with `pagePath` + `sessionSource` dimensions (via `fetchPageReferrals`)
- Maps `sessionSource` values to `reddit`, `youtube`, `linkedin`, or `instagram`
- Returns one record per (slug, platform) pair with ≥1 session — posts with no social traffic produce no records

GA4 is used (rather than Umami) because social platforms typically strip the Referer header, and GA4's session-source attribution remains reliable in that case.

## Important

- All metrics come from real analytics data — never fabricate numbers
- Flag posts with specific, actionable recommendations — not generic advice
- Posts with no analytics data should be reported as "No data" rather than skipped
