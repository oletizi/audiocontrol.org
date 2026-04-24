# Editorial Rename Slug — SEO Realignment

Rename a published post's slug cleanly. Under Phase 18a's stable UUID
identity, only the public surface changes — filename, URL, and a 301
redirect for legacy inbound links. Workflows, distribution records,
and journal history all join through `entry.id` so they survive the
rename without rewriting.

## Usage

```
/editorial-rename-slug --site <site> <old-slug> <new-slug>
/editorial-rename-slug --site <site> <old-slug> <new-slug> --dry-run
```

## Steps

1. **Run the rename helper** (all validation + writes live here):

   ```
   npx tsx .claude/skills/editorial-rename-slug/rename.ts \
     --site <site> <old-slug> <new-slug> [--dry-run]
   ```

   The helper refuses (non-zero exit with a descriptive message) on:
   - Unknown site, malformed slug (`[a-z0-9][a-z0-9-]*`)
   - `oldSlug === newSlug`
   - No calendar entry for `oldSlug` on `<site>`
   - `entry.id` missing (operator needs to run the Phase 18a
     backfill first: `npx tsx scripts/editorial/backfill-uuids.ts`)
   - `newSlug` already in use by a different entry
   - Target content file or image dir already exists

2. **Relay the output.** The helper prints the full action list:
   file rename, image-dir rename, frontmatter rewrite,
   calendar slug change, distribution slug sync, and the
   `_redirects` append. Pass it through unchanged.

3. **Do NOT run any git commands.** The helper deliberately omits
   them; the operator reviews the diff, decides whether internal
   cross-links in other posts should be rewritten (rarely needed
   — the 301 covers them), and commits manually.

## What the helper does

With Phase 18a in place, the rename only touches the public surface.
`entry.id` stays constant across the rename, so every workflow
and distribution record that joined by `entryId` keeps resolving.

Operations, in order:

1. **Content file rename:**
   `src/sites/<site>/content/blog/<old>.md` → `<new>.md`
2. **Image dir rename (if present):**
   `src/sites/<site>/public/images/blog/<old>/` → `<new>/`
3. **Frontmatter rewrite:** rewrites `image:` / `socialImage:`
   paths in the renamed file that embed the old slug segment
   (`/images/blog/<old>/...` → `/images/blog/<new>/...`).
   Conservative — only matches the slug segment, leaves unrelated
   paths alone.
4. **Calendar update:** `entry.slug = <new>`; `entry.id` unchanged.
   Distribution records with the same `entryId` get their slug field
   synced (cosmetic — the join is via entryId).
5. **Netlify redirect append:** adds a three-line 301 block to
   `src/sites/<site>/public/_redirects` covering bare, trailing-slash,
   and splat variants of the old URL. Deploys as a 301 so inbound
   links keep working.

## What the helper does NOT do

- **No git operations.** The operator stages the renames, reviews
  the diff, and commits.
- **No internal cross-link rewriting.** Other posts that link to
  `/blog/<old>/` keep doing so; the 301 redirect resolves them at
  request time. SEO-safe. If you really want to rewrite them, do
  it as a separate pass.
- **No GitHub issue rename.** Rarely worth the API churn; the
  workflow + distribution joins don't care about the issue title.
- **No workflow slug rewriting.** Historical journal entries keep
  their old slug string in context; the join is via `entryId` and
  stays correct.
- **No entry.id change.** The stable UUID is the whole point of
  Phase 18a.

## Why a separate skill, not an in-place calendar edit?

A slug change on a published post is a multi-file operation that
has to happen atomically to avoid broken state: filename, URL,
redirect, and calendar row all have to move together. Bundling it
into `scripts/lib/editorial/rename-slug.ts` gives callers one
stable entry point, testable deterministic behavior, one place to
fix bugs. Same pattern as `.claude/skills/editorial-approve/apply.ts`.

## Related skills

- `/editorial-plan <slug>` — set target keywords + topics at plan
  time (usually the first place to get the slug right).
- `/editorial-publish <slug>` — mark an entry Published. Renames
  after this point are the primary use case for this skill.
- `/editorial-status` — inspect the calendar to verify the rename
  landed.
