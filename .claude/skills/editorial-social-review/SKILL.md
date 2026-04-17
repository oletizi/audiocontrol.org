---
name: editorial-social-review
description: "Show a matrix of published posts versus social platforms, marking which have been shared."
user_invocable: true
---

# Editorial Social Review

Report which published posts have been distributed on which social platforms. Do NOT modify anything.

## Steps

1. **Read the calendar**: Read `docs/editorial-calendar.md`
2. **Parse Published entries** from the `## Published` section
3. **Parse Distribution records** from the `## Distribution` section
4. **Build the matrix**:
   - Rows: each Published post (by slug, most recent first)
   - Columns: `reddit`, `youtube`, `linkedin`, `instagram`
   - Cell: checkmark if there is ≥1 DistributionRecord for that (slug, platform), blank otherwise
5. **Report**: print the matrix as a markdown table

## Report Format

```
Social Distribution Status (N published posts):

| Post | Reddit | YouTube | LinkedIn | Instagram |
|------|--------|---------|----------|-----------|
| <slug> | ✓ |   | ✓ |   |
| <slug> |   |   |   |   |

Gaps: <N> post/platform pairs with no share recorded.
Shared somewhere: <N>/<N> posts have at least one distribution.
```

## Important

- Read-only — do not modify `docs/editorial-calendar.md`
- Use slugs (not titles) for readability and so the user can feed the slug back into `/editorial-distribute`
- If there are no Published entries, say so and stop
- If the Distribution section is missing or empty, the matrix is all blanks — that's not an error
