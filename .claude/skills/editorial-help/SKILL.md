---
name: editorial-help
description: "Show the editorial workflow and report current calendar status across all stages."
user_invocable: true
---

# Editorial Help

Show the editorial content lifecycle and current calendar status. Do NOT modify anything.

## 1. Show the Editorial Workflow

```
/editorial-add       Add an idea to the calendar
       |
       v
/editorial-plan      Move to Planned, set target keywords
       |
       v
/editorial-draft     Scaffold blog post directory and frontmatter (Phase 2)
       |
       v
/editorial-publish   Mark as Published, close GitHub issue (Phase 2)
```

**Analytics skills (Phase 3):**
- `/editorial-suggest` — Pull analytics, identify content opportunities
- `/editorial-performance` — Show metrics and social referral traffic for published posts

**Distribution skills (Phase 4):**
- `/editorial-distribute` — Record that a published post was shared on Reddit / YouTube / LinkedIn / Instagram
- `/editorial-social-review` — Matrix of published posts vs platforms (shared / not shared)

**Status skills:**
- `/editorial-review` — Show calendar status across all stages
- `/editorial-help` — This workflow overview

## 2. Show Calendar Status

- Read: `docs/editorial-calendar.md`
- Parse using `scripts/lib/editorial/calendar.ts` logic (or just read the markdown directly)
- Report entry counts per stage and list entries in non-Published stages
- For Published: report total count and most recent 3 entries

## 3. Report Format

```
Editorial Calendar Status:
  Ideas:     N entries
  Planned:   N entries
  Drafting:  N entries
  Review:    N entries
  Published: N entries (most recent: <slug>, <slug>, <slug>)
```
