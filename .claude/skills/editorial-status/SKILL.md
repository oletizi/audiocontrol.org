---
name: editorial-status
description: "Display editorial calendar status across all stages."
user_invocable: true
---

# Editorial Status

Show the full editorial calendar status. Do NOT modify anything.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Reports the single site's calendar. Unknown `--site` values error.

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar**: `readCalendar(process.cwd(), site)` — reads `docs/editorial-calendar-<site>.md`.
3. **Parse and display**: Show entries grouped by stage. Include the site name in the report header.
4. **Count distributions**: Read the `## Distribution` section and include a count by platform in the summary

## Report Format

For each stage with entries, show a table:

```
## Ideas (N)
| Slug | Title | Source |
|------|-------|--------|

## Planned (N)
| Slug | Title | Keywords | Source |
|------|-------|----------|--------|

## Drafting (N)
| Slug | Title | Issue | Source |
|------|-------|-------|--------|

## Review (N)
| Slug | Title | Issue | Source |
|------|-------|-------|--------|

## Published (N)
| Slug | Title | Published | Source |
|------|-------|-----------|--------|
```

For stages with no entries, show: `## Stage (0) — empty`

End with a summary:
```
Total: N entries across 5 stages
Distribution: N total shares (reddit: N, youtube: N, linkedin: N, instagram: N)
```

If the Distribution section is empty, show: `Distribution: no shares recorded`
