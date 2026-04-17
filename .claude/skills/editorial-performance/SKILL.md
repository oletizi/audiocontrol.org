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
5. **Fetch social referrals**: Call `getSocialReferrals()` from `scripts/lib/editorial/suggest.ts` for a site-wide breakdown of traffic from Reddit, YouTube, LinkedIn, and Instagram
6. **Report**: Show a performance table, a social referrals summary, and recommendations:
   ```
   Published Posts Performance:

   | Post | Pageviews | Impressions | CTR | Avg Position | Status |
   |------|-----------|-------------|-----|--------------|--------|
   | free-roland-s330-sampler-editor | 1,200 | 3,400 | 4.2% | 6.1 | OK |
   | scsi-over-wifi-raspberry-pi-bridge | 80 | 900 | 0.8% | 14.3 | Needs Update |

   Social Referrals (site-wide pageviews from each platform):

   | Platform | Pageviews |
   |----------|-----------|
   | reddit | 0 |
   | linkedin | 0 |

   Recommendations:
   - scsi-over-wifi-raspberry-pi-bridge: High impressions but low CTR — consider updating title and meta description
   ```
   If no social referrals are recorded in the window, show `(no social referrer traffic in window — many platforms strip the Referer header)`.

## Implementation

The `getPostPerformance()` function in `scripts/lib/editorial/suggest.ts` handles steps 2-4. It:
- Calls the analytics pipeline (Umami, GA4, Search Console)
- Matches each published entry to its metrics across all data sources
- Collects recommendations from the analytics recommendation engine
- Sorts results with underperformers first

The `getSocialReferrals()` function in the same file handles step 5:
- Calls Umami's `/metrics?type=referrer` endpoint
- Maps referrer hostnames to `reddit`, `youtube`, `linkedin`, or `instagram`
- Returns a site-wide pageview count per platform for platforms with ≥1 referrer

**Known limitation (tracked for GA4 migration):** Per-post attribution is not currently available. Umami's `url` filter on the referrer endpoint is ignored on this instance, so `getSocialReferrals` can only report site-wide numbers. Social platforms also frequently strip the Referer header, so counts are typically low regardless of actual share traffic. Moving this to GA4's `pagePath` + `sessionSource` dimensions will restore per-post attribution.

## Important

- All metrics come from real analytics data — never fabricate numbers
- Flag posts with specific, actionable recommendations — not generic advice
- Posts with no analytics data should be reported as "No data" rather than skipped
