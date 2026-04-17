import type {
  ContentFunnel,
  ContentScorecard,
  Ga4Scorecard,
} from "./types.js";

const BLOG_PREFIX = "/blog/";
const EDITOR_PREFIX = "/roland/s330/editor";

/** Build content-to-editor funnel from available data */
export function buildContentFunnel(
  umami: ContentScorecard,
  ga4: Ga4Scorecard | null
): ContentFunnel {
  // Prefer GA4 if available (more historical data)
  if (ga4) {
    return buildFromGa4(ga4);
  }
  return buildFromUmami(umami);
}

function buildFromGa4(ga4: Ga4Scorecard): ContentFunnel {
  const blogPages: Array<{ path: string; pageviews: number }> = [];
  const editorPages: Array<{ path: string; pageviews: number }> = [];
  let blogPageviews = 0;
  let editorPageviews = 0;

  for (const page of ga4.pages) {
    const path = page.current.pagePath;
    const views = page.current.screenPageViews;

    if (path.startsWith(BLOG_PREFIX) && path !== BLOG_PREFIX) {
      blogPageviews += views;
      blogPages.push({ path, pageviews: views });
    } else if (path.startsWith(EDITOR_PREFIX)) {
      editorPageviews += views;
      editorPages.push({ path, pageviews: views });
    }
  }

  blogPages.sort((a, b) => b.pageviews - a.pageviews);
  editorPages.sort((a, b) => b.pageviews - a.pageviews);

  return {
    blogPageviews,
    editorPageviews,
    conversionRate: blogPageviews > 0 ? editorPageviews / blogPageviews : 0,
    topBlogPages: blogPages.slice(0, 10),
    editorPages,
    source: "ga4",
  };
}

function buildFromUmami(umami: ContentScorecard): ContentFunnel {
  const blogPages: Array<{ path: string; pageviews: number }> = [];
  const editorPages: Array<{ path: string; pageviews: number }> = [];
  let blogPageviews = 0;
  let editorPageviews = 0;

  for (const page of umami.pages) {
    const path = page.pagePath;
    const views = page.pageviews;

    if (path.startsWith(BLOG_PREFIX) && path !== BLOG_PREFIX) {
      blogPageviews += views;
      blogPages.push({ path, pageviews: views });
    } else if (path.startsWith(EDITOR_PREFIX)) {
      editorPageviews += views;
      editorPages.push({ path, pageviews: views });
    }
  }

  blogPages.sort((a, b) => b.pageviews - a.pageviews);
  editorPages.sort((a, b) => b.pageviews - a.pageviews);

  return {
    blogPageviews,
    editorPageviews,
    conversionRate: blogPageviews > 0 ? editorPageviews / blogPageviews : 0,
    topBlogPages: blogPages.slice(0, 10),
    editorPages,
    source: "umami",
  };
}
