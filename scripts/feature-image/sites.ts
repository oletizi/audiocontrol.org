/**
 * Site dimension for the feature-image pipeline.
 *
 * Each site in this repo has its own brand.ts with palette + typography.
 * The pipeline needs to know which site's brand to apply when rendering a
 * feature image, where to write generated files, and where to route output
 * when a workflow is applied.
 *
 * The set of valid sites is anchored by the `src/sites/<site>/` directories.
 * Pre-Phase-14 log entries have no site field; they default to
 * `audiocontrol` for backwards compatibility.
 */

import { brand as audiocontrolBrand } from '../../src/sites/audiocontrol/brand.js';
import { brand as editorialcontrolBrand } from '../../src/sites/editorialcontrol/brand.js';
import type { Brand } from '../../src/shared/brand.js';

export type Site = 'audiocontrol' | 'editorialcontrol';

export const DEFAULT_SITE: Site = 'audiocontrol';
export const ALL_SITES: Site[] = ['audiocontrol', 'editorialcontrol'];

export function isSite(value: unknown): value is Site {
  return value === 'audiocontrol' || value === 'editorialcontrol';
}

/**
 * Normalize an untrusted site value to a valid Site. Falls back to
 * DEFAULT_SITE for null/undefined/invalid input — callers supply the
 * default so every caller has to think about the contract explicitly.
 */
export function resolveSite(value: unknown, fallback: Site = DEFAULT_SITE): Site {
  return isSite(value) ? value : fallback;
}

const BRANDS: Record<Site, Brand> = {
  audiocontrol: audiocontrolBrand,
  editorialcontrol: editorialcontrolBrand,
};

export function getBrand(site: Site): Brand {
  return BRANDS[site];
}

/**
 * Absolute filesystem path of a site's publicDir, given the repo root.
 * Matches the `publicDir` setting in each site's astro.*.config.mjs.
 */
export function getPublicDir(site: Site, repoRoot: string): string {
  return `${repoRoot}/src/sites/${site}/public`;
}

/**
 * The publicDir the dev-only gallery is served from. Scratch generation
 * output lives here regardless of the target site because the gallery page
 * can only serve files from a single site's public tree (it lives under
 * editorialcontrol — the dev-infra site). The `site` dimension is persisted
 * on LogEntry and only affects where /feature-image-apply copies approved
 * files (into the correct site's public/images/blog/<slug>/ tree).
 *
 * Historical note: the gallery used to host under audiocontrol. It moved
 * to editorialcontrol so that running a single dev server (editorialcontrol)
 * is enough to use every dev-facing surface — editorial studio, review
 * surface, and feature-image studio — without the shared `.astro/data-
 * store.json` bleed that hits when both sites' dev servers run in parallel.
 */
export const GALLERY_HOST_SITE: Site = 'editorialcontrol';
export function getGalleryPublicDir(repoRoot: string): string {
  return getPublicDir(GALLERY_HOST_SITE, repoRoot);
}

/**
 * Infer a site from a source-file path. Looks for `src/sites/<site>/`.
 * Used by /feature-image-blog to pick up the site from a post path.
 */
export function inferSiteFromPath(path: string): Site | null {
  const match = path.match(/src\/sites\/([^/]+)/);
  if (!match) return null;
  return isSite(match[1]) ? match[1] : null;
}
