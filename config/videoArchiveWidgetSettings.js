/**
 * تنظیمات ویجت آرشیو ویدیو / استوری در صفحه‌ساز
 * (مشابه نوار خبر فوری — مدیریت کامل ظاهر و محتوا)
 */

import {
  DEFAULT_VIDEO_INSTA_SETTINGS,
  VIDEO_INSTA_SITE_THEME,
} from '@/services/videoInstaSettings'
import { SHOP_FONTS, shopFontCss } from '@/config/shopWidgetSettings'

export const VIDEO_ARCHIVE_FONTS = SHOP_FONTS
export { shopFontCss as videoArchiveFontCss }

export const VIDEO_ARCHIVE_WIDGET_TYPES = [
  'video_gallery',
  'video_archive_grid',
  'video_archive_recycler',
  'story',
  'story_circles',
  'featured_video',
]

export const VIDEO_ARCHIVE_RECYCLER_ASPECTS = [
  { id: '9_16', label: 'عمودی ۹:۱۶' },
  { id: '16_9', label: 'افقی ۱۶:۹' },
]

export const VIDEO_ARCHIVE_RECYCLER_VISIBLE = [
  { id: 2, label: '۲' },
  { id: 3, label: '۳' },
  { id: 4, label: '۴' },
  { id: 5, label: '۵' },
  { id: 6, label: '۶' },
  { id: 7, label: '۷' },
  { id: 8, label: '۸' },
]

export function isVideoArchiveWidgetType(type) {
  return VIDEO_ARCHIVE_WIDGET_TYPES.includes(type)
}

export const VIDEO_ARCHIVE_COLUMNS = [
  { id: 2, label: '۲ ستون' },
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
]

export const VIDEO_ARCHIVE_CARD_STYLES = [
  { id: 'classic', label: 'کلاسیک' },
  { id: 'rounded', label: 'گرد' },
  { id: 'cinema', label: 'سینمایی' },
]

export const VIDEO_ARCHIVE_TITLE_ALIGNS = [
  { id: 'right', label: 'راست' },
  { id: 'center', label: 'وسط' },
  { id: 'left', label: 'چپ' },
]

/** پالت تم سایت (کرم / طلایی سلنیرو) */
export const VIDEO_ARCHIVE_SITE_THEME = {
  ...VIDEO_INSTA_SITE_THEME,
  subtitle_color: '#6B5344',
  card_bg: '#FFFFFF',
  card_border: 'rgba(42, 26, 14, 0.12)',
}

export const VIDEO_ARCHIVE_COLOR_FIELDS = [
  { key: 'accent_color', label: 'رنگ اکسنت' },
  { key: 'accent_secondary', label: 'اکسنت دوم' },
  { key: 'section_bg_from', label: 'پس‌زمینه از' },
  { key: 'section_bg_to', label: 'پس‌زمینه تا' },
  { key: 'title_color', label: 'رنگ عنوان' },
  { key: 'subtitle_color', label: 'رنگ زیرعنوان' },
  { key: 'card_bg', label: 'پس‌زمینه کارت' },
  { key: 'card_border', label: 'بردر کارت' },
  { key: 'ring_color_1', label: 'حلقه ۱ (استوری)' },
  { key: 'ring_color_2', label: 'حلقه ۲' },
  { key: 'ring_color_3', label: 'حلقه ۳' },
  { key: 'rail_bg', label: 'پس‌زمینه نوار استوری' },
]

export const VIDEO_ARCHIVE_SPACE_FIELDS = [
  { key: 'padding_top', label: 'پدینگ بالا' },
  { key: 'padding_right', label: 'پدینگ راست' },
  { key: 'padding_bottom', label: 'پدینگ پایین' },
  { key: 'padding_left', label: 'پدینگ چپ' },
]

export const VIDEO_ARCHIVE_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'مارجین بالا' },
  { key: 'margin_right', label: 'مارجین راست' },
  { key: 'margin_bottom', label: 'مارجین پایین' },
  { key: 'margin_left', label: 'مارجین چپ' },
]

export const DEFAULT_VIDEO_ARCHIVE_WIDGET_SETTINGS = {
  ...DEFAULT_VIDEO_INSTA_SETTINGS,
  ...VIDEO_ARCHIVE_SITE_THEME,
  follow_site_theme: true,
  show_on_mobile: true,
  show_on_desktop: true,
  /** تعداد آخرین ویدیوها در ویجت */
  count: 8,
  columns: 4,
  card_style: 'classic',
  title_align: 'right',
  title_font: 'edameh',
  card_title_font: 'iran',
  title_font_size: 28,
  title_font_bold: true,
  subtitle_font_size: 14,
  card_radius: 16,
  card_gap: 16,
  section_radius: 18,
  section_full_bleed: true,
  padding_top: 40,
  padding_right: 0,
  padding_bottom: 48,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  show_pagination: true,
  story_size: 72,
  story_gap: 14,
  /** ریسایکلر افقی */
  recycler_visible_desktop: 4,
  recycler_show_arrows: true,
  recycler_drag_scroll: true,
  recycler_aspect: '9_16',
  show_view_all: true,
  view_all_href: '/videos',
  view_all_label_fa: 'همه',
  view_all_label_en: 'All',
}

function clamp(n, min, max, fallback) {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

function bool(v, fallback = true) {
  if (v === undefined || v === null) return fallback
  return !!v
}

/** رنگ‌های قابل‌نمایش بعد از پیروی از تم سایت */
export function resolveVideoArchiveColors(settings = {}) {
  const s = settings && typeof settings === 'object' ? settings : {}
  if (s.follow_site_theme !== false) {
    return { ...s, ...VIDEO_ARCHIVE_SITE_THEME }
  }
  return s
}

export function normalizeVideoArchiveWidgetSettings(raw = {}) {
  const d = DEFAULT_VIDEO_ARCHIVE_WIDGET_SETTINGS
  const s = { ...d, ...(raw && typeof raw === 'object' ? raw : {}) }

  s.follow_site_theme = bool(s.follow_site_theme, true)
  s.show_on_mobile = bool(s.show_on_mobile, true)
  s.show_on_desktop = bool(s.show_on_desktop, true)
  s.show_desktop_section = bool(s.show_desktop_section, true)
  s.show_mobile_rail = bool(s.show_mobile_rail, true)
  s.show_title = bool(s.show_title, true)
  s.show_subtitle = bool(s.show_subtitle, true)
  s.show_views = bool(s.show_views, true)
  s.show_add_button = bool(s.show_add_button, true)
  s.show_pagination = bool(s.show_pagination, true)
  s.title_font_bold = bool(s.title_font_bold, true)
  s.section_full_bleed = bool(s.section_full_bleed, true)
  s.recycler_show_arrows = bool(s.recycler_show_arrows, true)
  s.recycler_drag_scroll = bool(s.recycler_drag_scroll, true)
  s.show_view_all = bool(s.show_view_all, true)

  s.title_fa = String(s.title_fa ?? d.title_fa)
  s.title_en = String(s.title_en ?? d.title_en)
  s.subtitle_fa = String(s.subtitle_fa ?? d.subtitle_fa)
  s.subtitle_en = String(s.subtitle_en ?? d.subtitle_en)

  s.count = clamp(s.count, 1, 48, 8)
  s.view_all_href = String(s.view_all_href || '/videos').trim() || '/videos'
  s.view_all_label_fa = String(s.view_all_label_fa ?? d.view_all_label_fa)
  s.view_all_label_en = String(s.view_all_label_en ?? d.view_all_label_en)
  s.columns = [2, 3, 4].includes(Number(s.columns)) ? Number(s.columns) : 4
  if (!VIDEO_ARCHIVE_CARD_STYLES.some((c) => c.id === s.card_style)) {
    s.card_style = 'classic'
  }
  if (!VIDEO_ARCHIVE_TITLE_ALIGNS.some((a) => a.id === s.title_align)) {
    s.title_align = 'right'
  }
  if (!VIDEO_ARCHIVE_FONTS.some((f) => f.id === s.title_font)) {
    s.title_font = 'edameh'
  }
  if (!VIDEO_ARCHIVE_FONTS.some((f) => f.id === s.card_title_font)) {
    s.card_title_font = 'iran'
  }

  s.title_font_size = clamp(s.title_font_size, 14, 48, 28)
  s.subtitle_font_size = clamp(s.subtitle_font_size, 11, 24, 14)
  s.card_radius = clamp(s.card_radius, 0, 40, 16)
  s.card_gap = clamp(s.card_gap, 4, 40, 16)
  s.section_radius = clamp(s.section_radius, 0, 48, 18)
  s.story_size = clamp(s.story_size, 48, 120, 72)
  s.story_gap = clamp(s.story_gap, 4, 40, 14)
  s.recycler_visible_desktop = [2, 3, 4, 5, 6, 7, 8].includes(
    Number(s.recycler_visible_desktop)
  )
    ? Number(s.recycler_visible_desktop)
    : 4
  if (!VIDEO_ARCHIVE_RECYCLER_ASPECTS.some((a) => a.id === s.recycler_aspect)) {
    s.recycler_aspect = '9_16'
  }

  ;[
    'padding_top',
    'padding_right',
    'padding_bottom',
    'padding_left',
    'margin_top',
    'margin_right',
    'margin_bottom',
    'margin_left',
  ].forEach((k) => {
    s[k] = clamp(s[k], 0, 120, d[k])
  })

  VIDEO_ARCHIVE_COLOR_FIELDS.forEach(({ key }) => {
    if (s[key] == null) s[key] = d[key] || ''
    else s[key] = String(s[key])
  })

  return s
}

/** ادغام تنظیمات سراسری API با تنظیمات ویجت صفحه‌ساز */
export function mergeVideoArchiveWidgetSettings(apiSettings = {}, widgetRaw = {}) {
  const api = apiSettings && typeof apiSettings === 'object' ? apiSettings : {}
  const widget =
    widgetRaw && typeof widgetRaw === 'object' && Object.keys(widgetRaw).length
      ? widgetRaw
      : {}
  const merged = normalizeVideoArchiveWidgetSettings({ ...api, ...widget })
  // ویجت صفحه‌ساز: پیش‌فرض پیروی از تم سایت (حتی اگر API رنگ قدیمی تیره ذخیره کرده)
  if (merged.follow_site_theme !== false) {
    return normalizeVideoArchiveWidgetSettings({
      ...merged,
      ...VIDEO_ARCHIVE_SITE_THEME,
      follow_site_theme: true,
    })
  }
  return merged
}

export function videoArchiveWidgetCssVars(settings) {
  const s = resolveVideoArchiveColors(normalizeVideoArchiveWidgetSettings(settings))
  const align =
    s.title_align === 'left'
      ? 'left'
      : s.title_align === 'center'
        ? 'center'
        : 'right'

  const accent = s.accent_color || VIDEO_ARCHIVE_SITE_THEME.accent_color
  const accent2 = s.accent_secondary || VIDEO_ARCHIVE_SITE_THEME.accent_secondary
  const titleSolid = s.title_color || VIDEO_ARCHIVE_SITE_THEME.title_color

  return {
    '--va-accent': accent,
    '--va-accent-2': accent2,
    '--va-bg-from': s.section_bg_from || VIDEO_ARCHIVE_SITE_THEME.section_bg_from,
    '--va-bg-to': s.section_bg_to || VIDEO_ARCHIVE_SITE_THEME.section_bg_to,
    '--va-title-solid': titleSolid,
    '--va-subtitle-c':
      s.subtitle_color || VIDEO_ARCHIVE_SITE_THEME.subtitle_color,
    '--va-card-bg': s.card_bg || VIDEO_ARCHIVE_SITE_THEME.card_bg,
    '--va-card-border': s.card_border || VIDEO_ARCHIVE_SITE_THEME.card_border,
    '--va-ring-1': s.ring_color_1 || VIDEO_ARCHIVE_SITE_THEME.ring_color_1,
    '--va-ring-2': s.ring_color_2 || VIDEO_ARCHIVE_SITE_THEME.ring_color_2,
    '--va-ring-3': s.ring_color_3 || VIDEO_ARCHIVE_SITE_THEME.ring_color_3,
    '--va-rail-bg': s.rail_bg || VIDEO_ARCHIVE_SITE_THEME.rail_bg,
    '--va-ink': '#2A1A0E',
    '--va-muted': '#6B5344',
    '--va-line': 'rgba(42, 26, 14, 0.1)',
    '--va-surface': '#FFFFFF',
    '--va-surface-2': '#FFF8EC',
    '--va-cols': String(s.columns),
    '--va-gap': `${s.card_gap}px`,
    '--va-card-r': `${s.card_radius}px`,
    '--va-sec-r': `${s.section_radius}px`,
    '--va-title-fs': `${s.title_font_size}px`,
    '--va-title-fw': s.title_font_bold ? '800' : '600',
    '--va-title-ff': shopFontCss(s.title_font),
    '--va-card-title-ff': shopFontCss(s.card_title_font),
    '--va-sub-fs': `${s.subtitle_font_size}px`,
    '--va-title-align': align,
    '--va-pt': `${s.padding_top}px`,
    '--va-pr': `${s.padding_right}px`,
    '--va-pb': `${s.padding_bottom}px`,
    '--va-pl': `${s.padding_left}px`,
    '--va-mt': `${s.margin_top}px`,
    '--va-mr': `${s.margin_right}px`,
    '--va-mb': `${s.margin_bottom}px`,
    '--va-ml': `${s.margin_left}px`,
    '--va-story-size': `${s.story_size}px`,
    '--va-story-gap': `${s.story_gap}px`,
  }
}

export function createDefaultVideoArchiveWidgetSettings(type = 'video_gallery') {
  const base = {
    ...DEFAULT_VIDEO_ARCHIVE_WIDGET_SETTINGS,
    ...VIDEO_ARCHIVE_SITE_THEME,
    follow_site_theme: true,
  }
  if (type === 'video_archive_grid') {
    base.columns = 3
    base.card_style = 'rounded'
  }
  if (type === 'video_archive_recycler') {
    base.count = 12
    base.columns = 4
    base.recycler_visible_desktop = 5
    base.recycler_aspect = '9_16'
    base.recycler_show_arrows = true
    base.recycler_drag_scroll = true
    base.show_desktop_section = true
    base.show_mobile_rail = false
    base.show_pagination = false
    base.show_view_all = true
    base.view_all_href = '/videos'
    base.card_radius = 14
    base.card_gap = 12
    base.padding_top = 22
    base.padding_bottom = 24
    base.title_font_size = 22
    base.subtitle_font_size = 13
    base.title_fa = 'آرشیو ویدیویی'
    base.title_en = 'Video Archive'
  }
  if (type === 'story' || type === 'story_circles' || type === 'featured_video') {
    base.show_desktop_section = false
    base.show_mobile_rail = true
    if (type === 'story_circles') base.story_size = 64
  }
  return normalizeVideoArchiveWidgetSettings(base)
}
