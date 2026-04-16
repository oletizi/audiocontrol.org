---
name: editorial-suggest
description: "Pull analytics data and suggest content opportunities for the editorial calendar."
user_invocable: true
---

# Editorial Suggest

Analyze analytics data and suggest content opportunities to add to the editorial calendar.

## Dependency

This skill requires the **automated-analytics** feature (oletizi/audiocontrol.org#30) to be implemented. Specifically:
- Phase 1: GA4 Data Pipeline (oletizi/audiocontrol.org#36)
- Phase 2: Search Console Integration (oletizi/audiocontrol.org#37)

If the analytics pipeline is not yet available, report that to the user with a link to the dependency issue and stop.

## Steps

1. **Check analytics availability**: Verify the analytics report script exists
   - If not available: report the dependency gap and stop
2. **Run analytics report**: Invoke the analytics pipeline to get:
   - Search Console query data (impressions, position, CTR)
   - Content gap analysis
   - Striking-distance queries (positions 8-20)
3. **Identify opportunities**: Filter and rank suggestions:
   - High-impression queries with no matching content on the site
   - Striking-distance queries that a new or updated post could push to page 1
   - Content gaps where competitors rank but audiocontrol.org doesn't
4. **Read the calendar**: Read `docs/editorial-calendar.md`
5. **Deduplicate**: Filter out topics that already exist in the calendar
6. **Present to user**: Show ranked suggestions with evidence:
   ```
   1. "SCSI protocol tutorial" — 450 impressions, position 12, no page targets this
   2. "Roland S-550 vs S-330" — 200 impressions, position 18, striking distance
   ```
7. **Accept suggestions**: If the user picks suggestions to add, use `/editorial-add` to add them to Ideas with `source: analytics`

## Important

- Every suggestion must include specific data (impressions, position, CTR) — no vague recommendations
- Mark accepted suggestions with `source: analytics` in the calendar to track analytics-driven vs manual entries
