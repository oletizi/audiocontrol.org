export {
  CONTENT_TYPES,
  DEFAULT_SITE,
  PLATFORMS,
  SITES,
  STAGES,
  type ContentType,
  type Platform,
  type Site,
  type Stage,
  type CalendarEntry,
  type DistributionRecord,
  type EditorialCalendar,
  assertSite,
  distributionsBySlug,
  effectiveContentType,
  entriesByStage,
  hasRepoContent,
  isContentType,
  isSite,
  requiresContentUrl,
  siteBaseUrl,
  siteHost,
} from './types.js';

export {
  calendarPath,
  parseCalendar,
  readCalendar,
  renderCalendar,
  writeCalendar,
  addEntry,
  addDistribution,
  planEntry,
  draftEntry,
  publishEntry,
  findEntry,
} from './calendar.js';

export { scaffoldBlogPost, type ScaffoldResult } from './scaffold.js';

export {
  channelsPath,
  readChannels,
  getChannelsForTopics,
  normalizeChannel,
  diffShared,
  alreadyShared,
  type ChannelEntry,
} from './channels.js';

export {
  extractYouTubeLinksFromMarkdown,
  extractSiteLinksFromText,
  extractSiteLinksFromMarkdown,
  extractLinksFromHtml,
  slugFromBlogUrl,
  canonicalizeUrl,
  auditCrossLinks,
  type OutboundLink,
  type EntryAudit,
  type AuditReport,
  type AuditCrossLinksInput,
} from './crosslinks.js';

export {
  getContentSuggestions,
  getPostPerformance,
  getSocialReferrals,
  type ContentSuggestion,
  type PostPerformance,
  type SocialReferral,
} from './suggest.js';
