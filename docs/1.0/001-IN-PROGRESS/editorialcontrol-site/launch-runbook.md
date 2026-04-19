# editorialcontrol.org — Launch Runbook

Step-by-step for bringing editorialcontrol.org live after this feature
branch merges to main. Each step lists what to do, where to do it, and
what to verify before moving on.

Everything marked **local** is a code/config change in the repo on main
after merge. Everything marked **external** is a click-ops task in a web
dashboard (Netlify, DNS registrar, Google, Reddit).

## Prerequisites

- `feature/editorialcontrol-site` merged to `main`.
- You're on an up-to-date `main` in `~/work/audiocontrol-work/audiocontrol.org-editorialcontrol-site`.

---

## 1. Create the editorialcontrol Netlify site (external)

Netlify-side setup. Do this before DNS.

1. In Netlify → "Add new site" → "Import an existing project" → select
   the `oletizi/audiocontrol.org` GitHub repo.
2. Configure build settings (the existing repo-level `netlify.toml`
   targets audiocontrol, so override here):
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build:editorialcontrol`
   - **Publish directory:** `dist/editorialcontrol`
3. Deploy. Netlify assigns a temporary `*.netlify.app` URL — note it.

**Verify:** open the `*.netlify.app` URL. All four pages (`/`, `/about/`,
`/blog/`, `/contact/`) render. The two migrated posts open from
`/blog/<slug>/`. Fonts load (Fraunces visible on the masthead). Dark
background, signal-green accents.

## 2. Point DNS at Netlify (external)

1. At your DNS registrar for `editorialcontrol.org`:
   - Apex (`editorialcontrol.org`): set an **ALIAS** or **ANAME**
     record pointing at Netlify's load balancer (Netlify's
     documentation for your specific registrar lists the target).
     If your registrar doesn't support ALIAS/ANAME, use the four A
     records Netlify provides.
   - `www` subdomain (optional): CNAME `www.editorialcontrol.org` →
     `apex-loadbalancer.netlify.com`.
2. In the Netlify site → **Domain settings** → **Add custom domain** →
   `editorialcontrol.org`. Netlify will detect propagation.
3. **Enable HTTPS.** Netlify auto-provisions a Let's Encrypt cert once
   DNS resolves. May take 5–30 minutes after DNS propagation.

**Verify:** `curl -I https://editorialcontrol.org/` returns 200 and a
valid Let's Encrypt cert is issued. `curl -I https://editorialcontrol.org/robots.txt`
returns 200 with body including `Sitemap: https://editorialcontrol.org/sitemap-index.xml`
(not audiocontrol's).

## 3. Analytics tracking IDs (external + local)

Currently `src/sites/editorialcontrol/layouts/Layout.astro` loads NO
analytics scripts. Add them with real IDs.

1. **Create a GA4 property** at analytics.google.com for
   editorialcontrol.org. Grab the measurement ID (`G-XXXXXXXXXX`).
2. **Create an Umami site** at cloud.umami.is (or your own Umami
   instance) for editorialcontrol.org. Grab the website ID (UUID).
3. Edit `src/sites/editorialcontrol/layouts/Layout.astro` — add the
   tracking snippets inside `<head>`, mirroring audiocontrol's layout
   but with the new IDs:

   ```html
   <!-- Umami Analytics -->
   <script defer src="https://cloud.umami.is/script.js" data-website-id="<UMAMI_ID>"></script>

   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=<GA4_ID>"></script>
   <script is:inline>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', '<GA4_ID>');
   </script>
   ```

4. Commit on main (or a small PR) with a message like
   `chore(editorialcontrol): wire live analytics IDs`. Netlify
   redeploys.

**Verify:** Load the live site. Open DevTools → Network → filter for
`umami` and `googletagmanager` — both load 200. Visit a second page and
check GA4 Realtime / Umami dashboard for the hit.

## 4. Submit the sitemap (external)

1. In Google Search Console → **Add property** → type:
   **URL prefix** → `https://editorialcontrol.org/`.
2. Verify ownership. Easiest: paste the HTML-tag meta verification
   into `src/sites/editorialcontrol/layouts/Layout.astro` `<head>`,
   redeploy, then click Verify. Alternatively, DNS TXT record at
   the registrar.
3. After verification: **Sitemaps** → submit
   `https://editorialcontrol.org/sitemap-index.xml`.

**Verify:** Search Console shows the sitemap status as "Success" with
the five or six URLs discovered.

## 5. Reddit account + sync (external + local)

This is Phase 5(b) — the plumbing landed in Phase 5(a).

1. **Register** a brand-aligned Reddit username for editorialcontrol.
   Done: [`/u/EditorialControl`](https://www.reddit.com/user/EditorialControl/).
   Warm it up a little before posting (Reddit rate-limits brand-new
   accounts on self-promo).
2. **Update** `~/.config/audiocontrol/reddit.json` to the site-keyed
   schema:
   ```json
   {
     "audiocontrol":    { "username": "<your-existing-audiocontrol-handle>" },
     "editorialcontrol": { "username": "EditorialControl" }
   }
   ```
   The loader throws a clear migration error if it still sees the old
   flat schema — no silent fallback.
3. **Seed one promo share** from the new account. Post one of the two
   migrated posts to a suitable subreddit from
   `docs/editorial-channels-editorialcontrol.json` (e.g. r/ClaudeAI,
   r/IndieHackers, r/SideProject). Follow each sub's self-promo rules.
4. **Run the first sync:**
   ```
   /editorial-reddit-sync --site=editorialcontrol
   ```
   The report should show "1 new record inserted" and the record should
   appear in `docs/editorial-calendar-editorialcontrol.md` under the
   `## Distribution` section.

**Verify:** The Distribution row in the calendar has the correct slug,
`r/<subreddit>` channel, share date, and reddit.com permalink. Re-running
the sync inserts zero records (idempotency).

## 6. Announce (external)

The two debut posts need to actually reach readers.

1. For each debut post, run:
   ```
   /editorial-reddit-opportunities --site=editorialcontrol <slug>
   ```
   This lists unshared subreddits with live subscriber counts and
   self-promo hints, using the curated
   `editorial-channels-editorialcontrol.json` candidates.

2. Pick 1–2 subs per post that are a genuine fit. Post manually from
   the editorialcontrol Reddit account, following each sub's rules.

3. After posting, run `/editorial-reddit-sync --site=editorialcontrol`
   again to pick up the new shares and attribute them.

4. Optional: record LinkedIn / other shares with
   `/editorial-distribute --site=editorialcontrol`.

## 7. Close out the feature

Once the above are done:

1. Move feature docs from `001-IN-PROGRESS/` to `003-COMPLETE/`:
   ```
   /feature-complete editorialcontrol-site
   ```
2. Update `ROADMAP.md` (if present) to reflect the launched state.
3. Close the parent GitHub issue (#69) with a summary comment linking
   to this runbook.

## Deferred / follow-up (not blocking launch)

These can wait until after the site is live:

- **Per-site public assets.** editorialcontrol currently inherits
  audiocontrol's favicons/apple-touch-icon/images from the shared
  `public/` directory. Designing editorialcontrol-specific favicons
  and default OG image is its own small task.
- **Feature images for the two migrated posts.** The feature-image
  pipeline is an interactive workflow (gallery review); can run as its
  own session.
- **Cross-link review clean run.** `/editorial-cross-link-review
  --site=editorialcontrol` won't surface much until there's at least
  one Reddit distribution record in place (from step 5 above).
