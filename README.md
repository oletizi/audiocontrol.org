# audiocontrol.org

Astro-based static site serving as the hub for audiocontrol projects. Hosted on Netlify.

## Development

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test               # Run unit tests (vitest)
```

## Content Calendar

Editorial calendar tracking blog posts from idea through publication, with analytics-driven topic suggestions and performance tracking. Managed via `/editorial-*` Claude Code skills.

See [CONTENT-CALENDAR.md](./CONTENT-CALENDAR.md) for the workflow, skills reference, and file layout.

## Analytics

Automated analytics pipeline pulling from Umami Cloud, GA4, and Google Search Console. Run `/analytics` in Claude Code or `tsx scripts/analytics-report.ts` from the CLI.

See [ANALYTICS.md](./ANALYTICS.md) for setup, architecture, and report details.
