# PRD: Automated Analytics

## Problem Statement

There is no automated way to measure content effectiveness on audiocontrol.org. Understanding which content drives traffic, which pages engage visitors, and whether blog readers convert to editor users requires manual checking. This feature creates an automated analytics pipeline that produces actionable reports to feed a virtuous content improvement cycle: measure, diagnose, act.

## Goals

- Automate content performance measurement from Umami and Google Search Console
- Surface actionable insights: what's working, what isn't, and what to change
- Track content-to-editor conversion funnel
- Feed recommendations back into editorial calendar decisions

## Acceptance Criteria

- A Claude Code skill (`/analytics`) pulls Umami and Google Search Console data and produces an actionable report
- Report includes a content scorecard: top and bottom pages by traffic with trends
- Report identifies search opportunities: high-impression/low-CTR queries needing title/description improvements
- Report identifies content gaps: queries where position is 5-20 (striking distance of page 1)
- Report tracks content-to-editor funnel: % of blog readers who visit the editor
- Report includes specific, actionable recommendations tied to editorial calendar decisions
- Authentication uses Umami Cloud API key and Google service account
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

- **Umami Cloud API** — pageviews, visitors, visits, bounce rate, time on page by path
- **Google Search Console API** — queries, impressions, clicks, CTR, average position by page and query

### Authentication

- **Umami:** API key stored at `~/.config/audiocontrol/umami-key.json`
- **Search Console:** Google service account stored at `~/.config/audiocontrol/analytics-service-account.json`

### Report Structure

1. **Content scorecard** — top and bottom pages by traffic with trends
2. **Search opportunities** — high-impression/low-CTR queries (title/description improvements)
3. **Content gaps** — queries at position 5-20 (striking distance of page 1)
4. **Content-to-editor funnel** — % of blog readers who visit the editor
5. **Recommendations** — specific, actionable items ranked by estimated impact

### Dependencies

- Umami Cloud account with API key
- Umami website ID: `2b9a4087-e93a-432d-adba-252233404d67`
- Google Search Console verified for audiocontrol.org
- Google Cloud service account

### Open Questions

- ~~Search Console site URL format~~ — resolved: `sc-domain:audiocontrol.org` (domain property)
- Whether Umami tracks enough events for content-to-editor funnel, or if basic pageview-based funnel is sufficient initially

## References

- GitHub Issue: oletizi/audiocontrol.org#30
