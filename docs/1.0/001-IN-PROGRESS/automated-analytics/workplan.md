# Workplan: Automated Analytics

**Feature slug:** `automated-analytics`
**Branch:** `feature/automated-analytics`
**Milestone:** Automated Analytics
**GitHub Issue:** oletizi/audiocontrol.org#30

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#30 |
| Phase 1: Umami Data Pipeline | oletizi/audiocontrol.org#36 |
| Phase 2: Search Console Integration | oletizi/audiocontrol.org#37 |
| Phase 3: Actionable Report & Recommendations | oletizi/audiocontrol.org#38 |
| Phase 4: Analytics Claude Code Skill | oletizi/audiocontrol.org#39 |

## Files Affected

- `scripts/analytics-report.ts` — main entry point script
- `scripts/lib/analytics/types.ts` — shared types and interfaces
- `scripts/lib/analytics/auth.ts` — Umami API key loading and config
- `scripts/lib/analytics/umami-client.ts` — Umami Cloud API client
- `scripts/lib/analytics/gsc-client.ts` — Google Search Console API client
- `scripts/lib/analytics/report.ts` — report computation, derived metrics, and formatting
- `scripts/lib/analytics/index.ts` — barrel export
- `.claude/skills/analytics/` — Claude Code skill definition
- `.env.example` — document required credentials

## Implementation Phases

### Phase 1: Umami Data Pipeline

**Deliverable:** Can pull and display Umami content performance data locally

- [x] Set up Umami Cloud API authentication (API key from config file)
- [x] Implement Umami API client (types and data fetching)
- [x] Pull core metrics: pageviews, visitors, bounce rate, time on page by path
- [x] Compute basic trends (current period vs previous period)
- [x] Output raw content scorecard to terminal (markdown tables)
- [x] Create CLI entry point with date range arguments

**Acceptance Criteria:**
- [x] Running the script outputs a table of pages ranked by traffic
- [x] Trend direction (up/down/flat) shown in summary
- [x] Date range is configurable via CLI arguments
- [x] Authentication works via Umami API key

### Phase 2: Search Console Integration

**Deliverable:** Combined Umami + GSC data in a single report

- [x] Implement Google Search Console API client (direct REST + JWT, no googleapis dependency)
- [x] Pull query data: impressions, clicks, CTR, average position by page and query
- [x] Merge GSC data with Umami page data in unified report
- [x] Identify high-impression/low-CTR queries (title/description improvement opportunities)
- [x] Identify striking-distance queries (position 5-20)
- [x] Add search performance section to report output

**Acceptance Criteria:**
- [x] Report includes search queries driving traffic to each page
- [x] High-impression/low-CTR queries are flagged with specific page URLs
- [x] Striking-distance queries are listed with current position and impressions
- [x] GSC and Umami data are correlated by page URL

### Phase 3: Actionable Report & Recommendations

**Deliverable:** Actionable report with specific recommendations

- [x] Compute content-to-editor funnel (blog pageview to editor pageview ratio, GA4-preferred)
- [x] Generate specific recommendations per content issue type (CTR, bounce, engagement, funnel, ranking)
- [x] Rank recommendations by potential impact
- [x] Format complete report with sections: scorecard, GA4 scorecard, search, funnel, recommendations
- [x] Support output as terminal markdown and JSON (`--json` flag)

**Acceptance Criteria:**
- [x] Recommendations are specific and actionable
- [x] Recommendations are ranked by estimated impact
- [x] Content-to-editor funnel shows conversion rate
- [x] Report is readable in terminal output

### Phase 4: Claude Code Skill

**Deliverable:** Working `/analytics` skill that produces and interprets reports

- [x] Create skill definition in `.claude/skills/analytics/`
- [x] Skill invokes analytics-report.ts with appropriate arguments
- [x] Skill can answer follow-up questions about the data
- [x] Support date range selection via skill arguments (`/analytics 7` for 7-day)
- [x] Support JSON output (`/analytics json`)
- [x] Document usage, prerequisites, and credential setup

**Acceptance Criteria:**
- [x] `/analytics` produces a full report in the Claude Code session
- [x] `/analytics 7` limits to last 7 days
- [x] Skill output is concise enough for Claude to interpret and discuss
- [x] Skill definition documents prerequisite setup (API key, service account)

## Verification Checklist

- [x] `npm run build` succeeds (no build breakage)
- [x] Umami data pipeline pulls real data successfully
- [x] GSC data pipeline pulls real data successfully
- [x] Report includes all five sections (scorecard, GA4 scorecard, search, funnel, recommendations)
- [x] Recommendations are specific and actionable
- [x] `/analytics` skill works end-to-end
- [x] No secrets committed to the repository
- [x] `.env.example` documents all required credentials
