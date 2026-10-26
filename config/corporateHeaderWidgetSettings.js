// سازگاری عقب‌رو — به siteTopNavWidgetSettings منتقل شد
export {
  SITE_TOP_NAV_DEVICES as CORP_HEADER_DEVICES,
  SITE_TOP_NAV_ALIGNS as CORP_HEADER_NAV_ALIGNS,
  SITE_TOP_NAV_MOBILE_MODES as CORP_HEADER_MOBILE_MODES,
  DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS as DEFAULT_CORP_HEADER_WIDGET_SETTINGS,
  normalizeSiteTopNavSettings as normalizeCorpHeaderWidgetSettings,
  getSiteTopNavVisibilityFlags as getCorpHeaderVisibilityFlags,
  buildSiteTopNavViewportPatch as buildCorpHeaderViewportPatch,
  siteTopNavCssVars as corpHeaderWidgetCssVars,
  isSiteTopNavWidgetType as isCorpHeaderWidgetType,
  createDefaultSiteTopNavSettings as createDefaultCorpHeaderSettings,
} from './siteTopNavWidgetSettings'
