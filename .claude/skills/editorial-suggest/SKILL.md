---
name: editorial-suggest
description: "Pull analytics data and suggest content opportunities for the editorial calendar."
user_invocable: true
---

# Editorial Suggest

Analyze analytics data and suggest content opportunities to add to the editorial calendar.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Reads the target site's calendar; site-specific analytics credentials are a Phase 6 / launch concern for editorialcontrol. Pass the site through to `getContentSuggestions(site, existingEntries)` so the page-URL prefix stripped from analytics rows matches the site's host. Unknown `--site` values error.

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Run analytics**: Execute `tsx scripts/analytics-report.ts --json` to fetch live analytics data
3. **Identify opportunities** from the report:
   - **Striking-distance queries** (position 5-20): queries where new or expanded content could push to page 1
   - **CTR opportunities**: high-impression queries with low CTR — title/description may need rewriting
   - **Content gaps**: queries with impressions but no matching calendar entry
4. **Deduplicate**: Filter out topics that already exist in the calendar
5. **Present to user**: Show ranked suggestions with evidence:
   ```
   1. "SCSI protocol tutorial" — 450 impressions, position 12, no page targets this
   2. "Roland S-550 vs S-330" — 200 impressions, position 18, striking distance
   ```
7. **Accept suggestions**: If the user picks suggestions to add, use `/editorial-add --site=<site>` to add them to Ideas with `source: analytics`

## Implementation

The `getContentSuggestions()` function in `scripts/lib/editorial/suggest.ts` handles steps 2-4. It:
- Calls the analytics pipeline (Umami, GA4, Search Console)
- Extracts striking-distance and CTR opportunities
- Deduplicates against existing calendar entries

## Important

- Every suggestion must include specific data (impressions, position, CTR) — no vague recommendations
- Mark accepted suggestions with `source: analytics` in the calendar to track analytics-driven vs manual entries
