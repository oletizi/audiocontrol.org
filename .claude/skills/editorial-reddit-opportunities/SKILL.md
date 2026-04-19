---
name: editorial-reddit-opportunities
description: "For a published post, list relevant subreddits grouped into already-shared (do not duplicate) and unshared candidates enriched with subscriber count and self-promo hints."
user_invocable: true
---

# Editorial Reddit Opportunities

Given a post slug, find which relevant subreddits the post has already been shared to (so the user can avoid double-posting) and which curated candidates remain. Enrich the candidates with live subreddit metadata from Reddit's API.

## Site

Accepts `--site <slug>` (default: `audiocontrol`). Valid sites: `audiocontrol`, `editorialcontrol`. Both the calendar and the curated channels file are per-site. Unknown `--site` values error.

## Input

`<slug>` as the skill argument. If omitted, prompt for one and show Published slugs as hints. Example: `/editorial-reddit-opportunities --site=editorialcontrol agent-as-workflow`.

## Steps

1. **Resolve site** via `assertSite()`.
2. **Read the calendar** via `readCalendar(process.cwd(), site)`.
3. **Find the entry** for `<slug>`. If not found, stop and report available Published slugs. If found but not in Published stage, warn and stop (we don't cross-post unshipped content).
4. **Read the curated file** via `readChannels(process.cwd(), site)`.
5. **Determine topics** for the post:
   - If the entry has `topics` set, use those.
   - Else stop with: `(no topics — tag this post via /editorial-plan --site=<site> to get opportunities)`.
6. **Collect candidates**: `getChannelsForTopics(file, entry.topics)` → gives candidate `ChannelEntry[]` per platform. Focus on the `reddit` platform.
7. **Split into shared vs unshared**:
   - `shared = alreadyShared(candidates, calendar.distributions.filter(d => d.slug === slug && d.platform === 'reddit'))`
   - `unshared = diffShared(candidates, those same distributions)`
8. **Enrich unshared candidates** with subreddit metadata. For each candidate, call `getSubredditInfo(site, candidate.channel)` from `scripts/lib/reddit/client.ts`. Wrap each call in a try/catch — Reddit API may rate-limit, sub may be private, sub may not exist — and fall through with a `(enrichment failed)` marker rather than aborting the whole skill. The `site` argument resolves the User-Agent username from the site-keyed Reddit config.
9. **Report** in the format below.

## Report Format

```
Cross-posting status for: <slug>
Title: <title>
Topics: <topics, comma-separated>

Already shared to Reddit — DO NOT DUPLICATE:
  r/ClaudeAI        2026-04-15  https://www.reddit.com/r/ClaudeAI/...
  r/programming     2026-04-14  https://www.reddit.com/r/programming/...

Unshared candidates for this post's topics:
  r/LocalLLaMA      45.2k subscribers, 1.8k active   self-promo only in Feedback Friday threads
  r/artificial       112k subscribers, 3.2k active
  r/ChatGPTCoding    12.1k subscribers                (enrichment failed — check manually)

Curated notes:
  r/LocalLLaMA: research-leaning; no bare promo
  r/artificial: —
```

## Important

- **The "Already shared" section must always be shown first and visually distinct** (the "DO NOT DUPLICATE" label). The whole point of this skill is to prevent the user from cross-posting to the same subreddit twice.
- Channel comparison is case-insensitive and normalized — `r/SynthDIY`, `/r/synthdiy`, and `https://reddit.com/r/SynthDIY/` all collapse to the same key. Use `normalizeChannel` from `scripts/lib/editorial/channels.ts` when in doubt.
- If Reddit credentials for the target site are not configured (file missing, or no entry for `--site`), degrade gracefully: skip the enrichment step and report candidates without subscriber counts. Do not fail the whole skill. If the file uses the old flat schema, `loadConfig` throws a migration hint — surface that to the user so they know to update the file.
- This skill is **read-only**. It does not add distribution records — the user records shares via `/editorial-distribute` or `/editorial-reddit-sync`.
- If the post's topics aren't in the curated file at all, report `(no candidates — topics X, Y not found in docs/editorial-channels-<site>.json)` and optionally suggest the user adds them.
