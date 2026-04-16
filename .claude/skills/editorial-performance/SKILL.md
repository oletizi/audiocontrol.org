---
name: editorial-performance
description: "Show analytics metrics for published posts and flag underperformers needing updates."
user_invocable: true
---

# Editorial Performance

Pull analytics for published posts and flag those needing attention.

## Dependency

This skill requires the **automated-analytics** feature (oletizi/audiocontrol.org#30) to be implemented. Specifically:
- Phase 3: Actionable Report & Recommendations (oletizi/audiocontrol.org#38)

If the analytics pipeline is not yet available, report that to the user with a link to the dependency issue and stop.

## Steps

1. **Check analytics availability**: Verify the analytics report script exists
   - If not available: report the dependency gap and stop
2. **Read the calendar**: Read `docs/editorial-calendar.md` to get the list of Published entries
3. **Pull analytics**: For each published post, fetch:
   - Pageviews and sessions (GA4)
   - Search impressions, clicks, CTR, average position (Search Console)
4. **Identify underperformers**: Flag posts that show:
   - Declining traffic trend (compared to previous period)
   - High impressions but low CTR (title/description may need improvement)
   - Dropping average position (content may need freshening)
5. **Generate recommendations**: For each flagged post, provide specific suggestions:
   - "Update title/description — 500 impressions but 1.2% CTR"
   - "Add content about X — related query Y has 300 impressions at position 15"
   - "Refresh content — position dropped from 5 to 12 in the last period"
6. **Report**: Show a performance table:
   ```
   Published Posts Performance:

   | Post | Pageviews | Impressions | CTR | Avg Position | Status |
   |------|-----------|-------------|-----|--------------|--------|
   | free-roland-s330-sampler-editor | 1,200 | 3,400 | 4.2% | 6.1 | OK |
   | scsi-over-wifi-raspberry-pi-bridge | 80 | 900 | 0.8% | 14.3 | Needs Update |

   Recommendations:
   - scsi-over-wifi-raspberry-pi-bridge: High impressions but low CTR — consider updating title and meta description
   ```

## Important

- All metrics must come from real analytics data — never fabricate numbers
- Flag posts with specific, actionable recommendations — not generic advice
- Compare against the post's own history, not arbitrary thresholds
