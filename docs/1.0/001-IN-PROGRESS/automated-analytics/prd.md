# PRD: Automated Analytics

## Problem Statement

There is no automated way to measure content effectiveness on audiocontrol.org. Understanding which content drives organic traffic, which search queries the site ranks for, and whether blog readers convert to editor users requires manual checking across Google Analytics and Search Console. This feature creates an automated analytics pipeline that produces actionable reports to feed a virtuous content improvement cycle: measure, diagnose, act.

## Goals

- Automate content performance measurement from GA4 and Google Search Console
- Surface actionable insights: what's working, what isn't, and what to change
- Track content-to-editor conversion funnel
- Feed recommendations back into editorial calendar decisions

## Acceptance Criteria

- A Claude Code skill (`/analytics`) pulls GA4 and Google Search Console data and produces an actionable report
- Report includes a content scorecard: top and bottom pages by organic traffic with trends
- Report identifies search opportunities: high-impression/low-CTR queries needing title/description improvements
- Report identifies content gaps: queries where position is 5-20 (striking distance of page 1)
- Report tracks content-to-editor funnel: % of blog readers who visit the editor
- Report includes specific, actionable recommendations tied to editorial calendar decisions
- Authentication uses a Google service account via environment variable
- Works locally via CLI
- Date range is configurable

## Out of Scope

- Real-time dashboard on the website
- Paid advertising analytics
- Social media analytics (LinkedIn, Reddit, YouTube impressions)
- Editor instrumentation (separate codebase, separate feature)
- Automatic content changes based on analytics

## Technical Approach

### Data Sources

- **GA4 Data API** — pageviews, engagement time, bounce rate, user paths, events by page
- **Google Search Console API** — queries, impressions, clicks, CTR, average position by page and query

### Authentication

Google service account with read access to GA4 and Search Console. Credentials via environment variable pointing to JSON key file.

### Report Structure

1. **Content scorecard** — top and bottom pages by organic traffic with trends
2. **Search opportunities** — high-impression/low-CTR queries (title/description improvements)
3. **Content gaps** — queries at position 5-20 (striking distance of page 1)
4. **Content-to-editor funnel** — % of blog readers who visit the editor
5. **Recommendations** — specific, actionable items ranked by estimated impact

### Dependencies

- `googleapis` npm package (official Google API client)
- GA4 property (measurement ID: G-2N7X29Y1RN, numeric property ID TBD)
- Google Search Console verified for audiocontrol.org
- Google Cloud service account

### Open Questions

- GA4 numeric property ID (needed for Data API, different from measurement ID)
- Search Console site URL format (`https://audiocontrol.org` or `sc-domain:audiocontrol.org`)
- Whether GA4 currently tracks enough events for content-to-editor funnel, or if basic pageview-based funnel is sufficient initially

## References

- GitHub Issue: oletizi/audiocontrol.org#30
