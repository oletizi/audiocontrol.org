---
name: editorial-review
description: "Display editorial calendar status across all stages."
user_invocable: true
---

# Editorial Review

Show the full editorial calendar status. Do NOT modify anything.

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Parse and display**: Show entries grouped by stage

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

End with a summary line: `Total: N entries across 5 stages`
