// config/jobBoardWidgetSettings.js — تنظیمات همهٔ ویجت‌های سیستم کاریابی

export const JOB_BOARD_VIEW_MODES = [
  { id: 'grid-2', label: 'گرید ۲' },
  { id: 'grid-3', label: 'گرید ۳' },
  { id: 'list', label: 'لیستی' },
]

export const JOB_BOARD_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const JOB_BOARD_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

/** همهٔ ویجت‌های دسته کاریابی که پنل تنظیمات دارند */
export const JOB_BOARD_WIDGET_TYPES = new Set([
  'job_board_system',
  'job_listings',
  'job_list_only',
  'job_filters_only',
  'job_search_bar',
  'featured_jobs',
  'latest_jobs',
  'hiring_jobs',
  'seeking_jobs',
  'job_categories_grid',
  'verified_companies',
  'public_resumes',
  'job_quick_filters',
  'job_header_bar',
  'job_bottom_nav',
  'job_stats_strip',
])

export const JOB_FULL_BOARD_TYPES = new Set([
  'job_board_system',
  'job_listings',
  'job_list_only',
  'job_filters_only',
])

export const JOB_CARDS_STRIP_TYPES = new Set([
  'featured_jobs',
  'latest_jobs',
  'hiring_jobs',
  'seeking_jobs',
])

export const DEFAULT_JOB_BOARD_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: true,
  use_demo_data: false,
  show_filters: true,
  show_tabs: true,
  show_view_toggle: true,
  show_title: true,
  show_count: true,
  show_header: true,
  show_more_link: true,
  more_href: '/jobs',
  more_label: 'مشاهده همه',
  title_text: '',
  limit: 8,
  columns: 2,
  default_view: 'grid-2',
  default_tab: 'all',
  search_placeholder: 'عنوان شغل، مهارت یا شرکت...',
  show_city_picker: true,
  show_post_cta: true,
  max_width: 1200,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 8,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  return raw && Object.prototype.hasOwnProperty.call(raw, key) ? !!raw[key] : d[key]
}

/** نگاشت نوع ویجت → منبع داده / حالت UI */
export function getJobWidgetVariant(type) {
  switch (type) {
    case 'job_board_system':
      return { kind: 'full', gate: 'job_board', showFilters: true, showList: true }
    case 'job_listings':
      return { kind: 'full', gate: 'job_listings', showFilters: true, showList: true }
    case 'job_list_only':
      return { kind: 'full', gate: 'job_listings', showFilters: false, showList: true }
    case 'job_filters_only':
      return { kind: 'full', gate: 'job_listings', showFilters: true, showList: false }
    case 'featured_jobs':
      return { kind: 'cards', source: 'featured', gate: 'job_listings', title: 'آگهی‌های ویژه' }
    case 'latest_jobs':
      return { kind: 'cards', source: 'latest', gate: 'job_listings', title: 'آخرین آگهی‌ها' }
    case 'hiring_jobs':
      return { kind: 'cards', source: 'hiring', gate: 'job_listings', title: 'استخدام' }
    case 'seeking_jobs':
      return { kind: 'cards', source: 'seeking', gate: 'job_listings', title: 'کارجویان' }
    case 'job_search_bar':
      return { kind: 'search', gate: 'job_board' }
    case 'job_categories_grid':
      return { kind: 'categories', gate: 'job_board', title: 'دسته‌های شغلی' }
    case 'verified_companies':
      return { kind: 'companies', gate: 'job_board', title: 'شرکت‌های تاییدشده' }
    case 'public_resumes':
      return { kind: 'resumes', gate: 'job_profile', title: 'رزومه‌های عمومی' }
    case 'job_quick_filters':
      return { kind: 'quick_filters', gate: 'job_listings' }
    case 'job_header_bar':
      return { kind: 'header', gate: 'job_header' }
    case 'job_bottom_nav':
      return { kind: 'bottom_nav', gate: 'job_mobile_nav' }
    case 'job_stats_strip':
      return { kind: 'stats', gate: 'job_board', title: 'آمار کاریابی' }
    default:
      return { kind: 'full', gate: 'job_board', showFilters: true, showList: true }
  }
}

export function normalizeJobBoardWidgetSettings(raw = {}, type = 'job_board_system') {
  const d = DEFAULT_JOB_BOARD_WIDGET_SETTINGS
  const s = { ...d, ...(raw || {}) }
  const variant = getJobWidgetVariant(type)

  s.show_on_mobile = bool(raw, 'show_on_mobile', d)
  s.show_on_desktop = bool(raw, 'show_on_desktop', d)
  s.section_full = bool(raw, 'section_full', d)
  s.use_demo_data = bool(raw, 'use_demo_data', d)
  s.show_filters = bool(raw, 'show_filters', d)
  s.show_tabs = bool(raw, 'show_tabs', d)
  s.show_view_toggle = bool(raw, 'show_view_toggle', d)
  s.show_title = bool(raw, 'show_title', d)
  s.show_count = bool(raw, 'show_count', d)
  s.show_header = bool(raw, 'show_header', d)
  s.show_more_link = bool(raw, 'show_more_link', d)
  s.show_city_picker = bool(raw, 'show_city_picker', d)
  s.show_post_cta = bool(raw, 'show_post_cta', d)

  // پیش‌فرض ویجت‌های partial
  if (type === 'job_list_only') s.show_filters = false
  if (type === 'job_filters_only') {
    s.show_filters = true
    s.show_tabs = false
    s.show_view_toggle = false
  }
  if (variant.showFilters === false) s.show_filters = false
  if (variant.showFilters === true && type === 'job_board_system') {
    /* keep */
  }

  if (!JOB_BOARD_VIEW_MODES.some((v) => v.id === s.default_view)) {
    s.default_view = d.default_view
  }
  if (!['all', 'hiring', 'seeking'].includes(s.default_tab)) {
    s.default_tab = d.default_tab
  }

  s.limit = Math.max(1, Math.min(48, pxNum(s.limit, d.limit, 48)))
  s.columns = Math.max(1, Math.min(4, pxNum(s.columns, d.columns, 4)))
  s.max_width = Math.max(640, Math.min(1400, pxNum(s.max_width, d.max_width, 1400)))
  s.title_text = String(s.title_text || '').trim()
  s.more_href = String(s.more_href || d.more_href).trim() || d.more_href
  s.more_label = String(s.more_label || d.more_label).trim() || d.more_label
  s.search_placeholder =
    String(s.search_placeholder || d.search_placeholder).trim() ||
    d.search_placeholder

  ;[...JOB_BOARD_SPACE_FIELDS, ...JOB_BOARD_MARGIN_FIELDS].forEach(({ key }) => {
    s[key] = pxNum(s[key], d[key])
  })

  return s
}

export function createDefaultJobBoardWidgetSettings(type = 'job_board_system') {
  const s = normalizeJobBoardWidgetSettings({}, type)
  /* ویجت‌های سایدبار: باکس‌دار، یک‌ستونه، فاصله عمودی */
  if (
    type === 'verified_companies' ||
    type === 'public_resumes' ||
    type === 'job_stats_strip'
  ) {
    s.section_full = false
    s.columns = type === 'job_stats_strip' ? 2 : 1
    s.limit = type === 'job_stats_strip' ? 4 : 6
    s.margin_bottom = 0
    s.padding_top = 0
    s.padding_bottom = 0
    s.max_width = 1200
    if (type === 'verified_companies') {
      s.title_text = 'شرکت‌های تاییدشده'
      s.more_href = '/jobs?is_verified=true'
    }
    if (type === 'public_resumes') {
      s.title_text = 'رزومه‌های عمومی'
      s.more_href = '/profile'
    }
    if (type === 'job_stats_strip') {
      s.title_text = 'آمار کاریابی'
      s.show_more_link = false
    }
  }
  return s
}

export function isJobBoardWidgetType(type) {
  return JOB_BOARD_WIDGET_TYPES.has(type)
}

export function jobBoardWidgetCssVars(settings, type) {
  const s = normalizeJobBoardWidgetSettings(settings, type)
  return {
    '--jb-max': `${s.max_width}px`,
    '--jb-pad-t': `${s.padding_top}px`,
    '--jb-pad-r': `${s.padding_right}px`,
    '--jb-pad-b': `${s.padding_bottom}px`,
    '--jb-pad-l': `${s.padding_left}px`,
    '--jb-mar-t': `${s.margin_top}px`,
    '--jb-mar-r': `${s.margin_right}px`,
    '--jb-mar-b': `${s.margin_bottom}px`,
    '--jb-mar-l': `${s.margin_left}px`,
    '--jb-cols': String(s.columns),
  }
}
