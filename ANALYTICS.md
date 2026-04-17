# Analytics System

Automated analytics pipeline for audiocontrol.org. Pulls data from three sources, computes derived metrics, and produces actionable reports.

## Quick Start

```bash
tsx scripts/analytics-report.ts              # 30-day report (default)
tsx scripts/analytics-report.ts --days 7     # 7-day report
tsx scripts/analytics-report.ts --json       # JSON output
```

Or use the Claude Code skill:

```
/analytics        # 30-day report
/analytics 7      # 7-day report
/analytics json   # JSON output
```

## Data Sources

| Source | What it provides | Auth |
|--------|-----------------|------|
| **Umami Cloud** | Pageviews, visitors, visits, bounce rate, time on page by path | API key |
| **GA4 Data API** | Pageviews, active users, engagement rate, session duration by page (best-effort) | Service account |
| **Google Search Console** | Search queries, impressions, clicks, CTR, average position by page | Service account |

All three sources are fetched in parallel. GA4 is best-effort — if it fails (permissions, API not enabled), the report continues with Umami and GSC data.

## Report Sections

### 1. Content Scorecard (Umami)

Site-level summary with period-over-period comparison, plus per-page breakdown ranked by traffic. Metrics: pageviews, visitors, bounce rate, avg time on page.

### 2. GA4 Scorecard

Per-page breakdown with trend indicators (up/down/flat) comparing current vs previous period. Metrics: pageviews, active users, bounce rate, engagement rate, avg session duration.

### 3. Search Performance (GSC)

- **Top Queries by Clicks** — which search terms drive traffic
- **CTR Opportunities** — queries with 50+ impressions but < 5% CTR (title/meta description improvements)
- **Striking Distance** — queries at position 5-20 (close to page 1, content improvements could boost ranking)

### 4. Content-to-Editor Funnel

Compares blog pageviews to editor pageviews (`/roland/s330/editor`) to measure whether content drives editor usage. Uses GA4 data when available, falls back to Umami.

### 5. Recommendations

Specific, actionable items ranked by estimated impact:

| Type | Trigger |
|------|---------|
| `rewrite-title` | High impressions, low CTR (GSC) |
| `boost-ranking` | Query at position 5-20 (GSC) |
| `investigate-bounce` | 10+ views and > 70% bounce rate (GA4) |
| `capitalize-engagement` | High engagement rate + long duration (GA4) |
| `add-cta` | Blog traffic but no editor conversions (funnel) |

## Credentials Setup

All credentials live in `~/.config/audiocontrol/`:

### Umami API Key

```json
// ~/.config/audiocontrol/umami-key.json
{ apiKey: "api_..." }
```

Generate at: Umami Cloud > Settings > API Keys

### GA4 Property ID

```json
// ~/.config/audiocontrol/analytics-config.json
{ propertyID: 521375360 }
```

Found at: GA4 Admin > Property Settings

### Google Service Account

```
~/.config/audiocontrol/analytics-service-account.json
```

Standard Google Cloud service account key JSON. Needs:
- **GA4:** Added as Viewer in GA4 Admin > Property Access Management
- **Search Console:** Added as Restricted user in Search Console > Settings > Users and permissions

## Architecture

```
scripts/
  analytics-report.ts              # CLI entry point
  lib/analytics/
    types.ts                       # Shared types and interfaces
    auth.ts                        # Umami API key loading
    google-auth.ts                 # Google service account JWT auth (shared by GA4 + GSC)
    umami-client.ts                # Umami Cloud API client
    ga4-client.ts                  # GA4 Data API client (direct REST)
    gsc-client.ts                  # Google Search Console client (direct REST)
    funnel.ts                      # Content-to-editor funnel computation
    recommendations.ts             # Recommendation engine
    report.ts                      # Markdown report formatter
    index.ts                       # Barrel export

.claude/skills/analytics/SKILL.md  # /analytics Claude Code skill
```

Both Google APIs use direct REST calls with JWT authentication (no `googleapis` npm dependency). The shared `google-auth.ts` module handles service account key loading, JWT signing, and token exchange for both GA4 and GSC.

## Hardcoded Values

| Value | Location | What |
|-------|----------|------|
| `2b9a4087-e93a-432d-adba-252233404d67` | `auth.ts` | Umami website ID |
| `521375360` | `analytics-config.json` | GA4 property ID |
| `sc-domain:audiocontrol.org` | `gsc-client.ts` | Search Console site URL |
| `/blog/` | `funnel.ts` | Blog path prefix for funnel |
| `/roland/s330/editor` | `funnel.ts` | Editor path prefix for funnel |
