# Workplan: Automated Analytics

**Feature slug:** `automated-analytics`
**Branch:** `feature/automated-analytics`
**Milestone:** Automated Analytics
**GitHub Issue:** oletizi/audiocontrol.org#30

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#30 |
| Phase 1: GA4 Data Pipeline | oletizi/audiocontrol.org#36 |
| Phase 2: Search Console Integration | oletizi/audiocontrol.org#37 |
| Phase 3: Actionable Report & Recommendations | oletizi/audiocontrol.org#38 |
| Phase 4: Analytics Claude Code Skill | oletizi/audiocontrol.org#39 |

## Files Affected

- `scripts/analytics-report.ts` — main entry point script
- `scripts/lib/analytics/types.ts` — shared types and interfaces
- `scripts/lib/analytics/ga4-client.ts` — GA4 Data API client
- `scripts/lib/analytics/gsc-client.ts` — Google Search Console API client
- `scripts/lib/analytics/report.ts` — report computation, derived metrics, and formatting
- `scripts/lib/analytics/index.ts` — barrel export
- `.claude/skills/analytics/` — Claude Code skill definition
- `.env.example` — document required credentials
- `package.json` — add googleapis dependency

## Implementation Phases

### Phase 1: GA4 Data Pipeline

**Deliverable:** Can pull and display GA4 content performance data locally

- [ ] Add googleapis dependency to package.json
- [ ] Set up Google service account authentication module
- [ ] Implement GA4 Data API client (types and data fetching)
- [ ] Pull core metrics: pageviews, engagement time, bounce rate by page
- [ ] Compute basic trends (current period vs previous period)
- [ ] Output raw content scorecard to terminal (markdown tables)
- [ ] Create CLI entry point with date range arguments

**Acceptance Criteria:**
- Running the script outputs a table of pages ranked by organic traffic
- Trend direction (up/down/flat) shown for each page
- Date range is configurable via CLI arguments
- Authentication works via service account env var

### Phase 2: Search Console Integration

**Deliverable:** Combined GA4 + GSC data in a single report

- [ ] Implement Google Search Console API client
- [ ] Pull query data: impressions, clicks, CTR, average position by page and query
- [ ] Merge GSC data with GA4 page data
- [ ] Identify high-impression/low-CTR queries (title/description improvement opportunities)
- [ ] Identify striking-distance queries (position 5-20)
- [ ] Add search performance section to report output

**Acceptance Criteria:**
- Report includes search queries driving traffic to each page
- High-impression/low-CTR queries are flagged with specific page URLs
- Striking-distance queries are listed with current position and impressions
- GSC and GA4 data are correlated by page URL

### Phase 3: Actionable Report & Recommendations

**Deliverable:** Actionable report with specific recommendations

- [ ] Compute content-to-editor funnel (blog pageview to editor pageview paths)
- [ ] Generate specific recommendations per content issue type
- [ ] Rank recommendations by potential impact (impressions x CTR gap)
- [ ] Format complete report with sections: scorecard, search opportunities, content gaps, funnel, recommendations
- [ ] Support output as terminal markdown and optionally as JSON for programmatic use

**Acceptance Criteria:**
- Recommendations are specific and actionable (e.g., "Post X has 500 impressions but 1.2% CTR — rewrite title/meta description")
- Recommendations are ranked by estimated impact
- Content-to-editor funnel shows conversion rate
- Report is readable in terminal output

### Phase 4: Claude Code Skill

**Deliverable:** Working `/analytics` skill that produces and interprets reports

- [ ] Create skill definition in `.claude/skills/analytics/`
- [ ] Skill invokes analytics-report.ts with appropriate arguments
- [ ] Skill can answer follow-up questions about the data
- [ ] Support date range selection via skill arguments
- [ ] Support filtering by content type (blog, docs, device pages)
- [ ] Document usage, prerequisites, and credential setup

**Acceptance Criteria:**
- `/analytics` produces a full report in the Claude Code session
- `/analytics --range 30d` limits to last 30 days
- Skill output is concise enough for Claude to interpret and discuss
- Skill definition documents prerequisite setup (service account, API access)

## Verification Checklist

- [ ] `npm run build` succeeds (no build breakage)
- [ ] GA4 data pipeline pulls real data successfully
- [ ] GSC data pipeline pulls real data successfully
- [ ] Report includes all five sections (scorecard, search, gaps, funnel, recommendations)
- [ ] Recommendations are specific and actionable
- [ ] `/analytics` skill works end-to-end
- [ ] No secrets committed to the repository
- [ ] `.env.example` documents all required credentials
