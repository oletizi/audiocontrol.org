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
5. **Report**: Show a performance table and recommendations:
   ```
   Published Posts Performance:

   | Post | Pageviews | Impressions | CTR | Avg Position | Status |
   |------|-----------|-------------|-----|--------------|--------|
   | free-roland-s330-sampler-editor | 1,200 | 3,400 | 4.2% | 6.1 | OK |
   | scsi-over-wifi-raspberry-pi-bridge | 80 | 900 | 0.8% | 14.3 | Needs Update |

   Recommendations:
   - scsi-over-wifi-raspberry-pi-bridge: High impressions but low CTR — consider updating title and meta description
   ```

## Implementation

The `getPostPerformance()` function in `scripts/lib/editorial/suggest.ts` handles steps 2-4. It:
- Calls the analytics pipeline (Umami, GA4, Search Console)
- Matches each published entry to its metrics across all data sources
- Collects recommendations from the analytics recommendation engine
- Sorts results with underperformers first

## Important

- All metrics come from real analytics data — never fabricate numbers
- Flag posts with specific, actionable recommendations — not generic advice
- Posts with no analytics data should be reported as "No data" rather than skipped
