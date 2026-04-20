---
name: editorial-review-report
description: "Aggregate comment-annotation categories across completed editorial-review workflows to surface which voice-skill principles are producing the most operator corrections. Read-only; does not change the voice skills."
user_invocable: true
---

# Editorial Review Report — Voice-Drift Signal

Phase 12 of the editorial-review extension. After enough drafts have cycled through the review loop, the annotation categories reveal patterns: which voice-skill principles produce the most drift, which platforms need more editorial time, whether a specific site is drifting faster than its sibling.

The report is the signal. Revising the voice SKILL.md references based on the signal stays manual — this skill doesn't edit the voice skills.

## Site

Accepts `--site <slug>` to scope to one site; default is all sites with a per-site breakdown.

Accepts `--include-in-flight` to include non-terminal workflows in the counts. Default: terminal only (`applied` + `cancelled`), because in-flight drafts don't represent settled signal.

## Usage

```
/editorial-review-report
/editorial-review-report --site editorialcontrol
/editorial-review-report --include-in-flight
```

## Steps

1. **Call `buildReport(process.cwd(), opts)`** from `scripts/lib/editorial-review/report.ts`:
   - `{ terminalOnly: !argv.includeInFlight, site: argv.site }`

2. **Render the report** via `renderReport(report)` and print it verbatim.

3. **If the report is thin (fewer than ~5 approved or cancelled workflows)**, note that aloud: "Sample size is small — treat the signal as provisional." Phase 12 acceptance says "after ~5 drafts the report should be usable."

4. **For the top-two categories by count**, propose (don't enact) follow-up actions:

   | Top category | Suggested follow-up |
   |--------------|---------------------|
   | `voice-drift` | Tighten the voice SKILL.md principles most often invoked in flagged comments. Look at actual comment text for specifics. |
   | `missing-receipt` | Add a "receipts first" reminder near the top of the voice SKILL.md, or add a pre-draft checklist item. |
   | `tutorial-framing` | Surface the anti-tutorial language in the voice's "common failure modes." |
   | `saas-vocabulary` | Add specific banned-word list to the voice SKILL.md's "Common failure modes." |
   | `fake-authority` | Extend the "Honest about scale / limits" section with the pattern that recurred. |
   | `structural` | Review the dispatch structural patterns in the longform reference file for clarity. |
   | `other` | Consider whether a new category tag is needed; high `other` counts often mean the taxonomy isn't covering the real patterns. |

5. **Do NOT edit any `.claude/skills/*-voice/**` files.** The operator decides whether and how to revise the voice skills based on the signal.

## Important

- **Read-only.** Pure aggregation over the JSONL history. No writes, no git ops.
- **Terminal-only default**: in-flight workflows skew the signal because comments on an in-flight draft may still be addressed via `/editorial-iterate` and become obsolete.

## Related Skills

- `/editorial-review-help` — pipeline state (active workflows, next action per row)
- `/editorial-draft-review <slug>` — enqueue a draft
- `/editorial-iterate <slug>` — agent-side revision
- `audiocontrol-voice`, `editorialcontrol-voice` — the voice skills this report generates signal about
