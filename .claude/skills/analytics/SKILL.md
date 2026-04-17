---
name: analytics
description: "Run the analytics report: content scorecard, GA4 metrics, search performance, funnel, and recommendations."
user_invocable: true
---

# Analytics Report

Run the analytics pipeline and present the results. The report pulls data from three sources (Umami, GA4, Google Search Console) and produces a content scorecard, search performance analysis, content-to-editor funnel, and actionable recommendations.

## Arguments

- No arguments: 30-day report (default)
- A number: days to report on (e.g., `/analytics 7` for 7-day report)
- `json`: output raw JSON instead of markdown

## Steps

1. **Parse arguments** from the skill invocation:
   - Extract the number of days if provided (default: 30)
   - Check for `json` flag

2. **Run the report script:**
   - Command: `tsx scripts/analytics-report.ts --days <N>` (add `--json` if requested)
   - The script fetches Umami, GA4, and GSC data in parallel
   - GA4 is best-effort — if it fails, the report continues without it

3. **Present the output** to the user as-is (the script produces formatted markdown)

4. **Be ready for follow-up questions** about the data:
   - The user may ask about specific pages, queries, or recommendations
   - Refer back to the report output to answer
   - If the user wants to drill into a specific page, suggest running with a longer date range

## Prerequisites

These must be configured before the skill will work:

- **Umami API key:** `~/.config/audiocontrol/umami-key.json` with `{ apiKey: "..." }`
- **GA4 property ID:** `~/.config/audiocontrol/analytics-config.json` with `{ propertyID: 521375360 }`
- **Google service account:** `~/.config/audiocontrol/analytics-service-account.json` (needs GA4 Viewer + Search Console Restricted access)
- **Umami website ID** is hardcoded: `2b9a4087-e93a-432d-adba-252233404d67`
- **Search Console site** is hardcoded: `sc-domain:audiocontrol.org`
