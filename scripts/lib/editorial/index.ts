export {
  CONTENT_TYPES,
  PLATFORMS,
  STAGES,
  type ContentType,
  type Platform,
  type Stage,
  type CalendarEntry,
  type DistributionRecord,
  type EditorialCalendar,
  distributionsBySlug,
  effectiveContentType,
  entriesByStage,
  isContentType,
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
  extractBlogLinksFromDescription,
  slugFromBlogUrl,
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
