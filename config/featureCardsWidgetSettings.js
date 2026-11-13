// config/featureCardsWidgetSettings.js — کارت‌های ویژگی / خطوط محصول

import { SHOP_FONTS, shopFontCss } from '@/config/shopWidgetSettings'

export { SHOP_FONTS as FEATURE_CARDS_FONTS, shopFontCss as featureCardsFontCss }

export const FEATURE_CARDS_WIDGET_TYPES = new Set(['feature_cards'])

export function isFeatureCardsWidgetType(type) {
  return FEATURE_CARDS_WIDGET_TYPES.has(String(type || ''))
}

export const FEATURE_CARDS_COLUMNS = [
  { id: 2, label: '۲ ستون' },
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
]

export const FEATURE_CARDS_HEAD_ALIGNS = [
  { id: 'center', label: 'وسط' },
  { id: 'start', label: 'راست' },
]

export const FEATURE_CARDS_BG_MODES = [
  { id: 'transparent', label: 'شفاف' },
  { id: 'solid', label: 'تک‌رنگ' },
  { id: 'gradient', label: 'گرادیان' },
]

export const FEATURE_CARDS_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const FEATURE_CARDS_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const FEATURE_CARDS_ICON_OPTIONS = [
  { id: 'Store', label: 'فروشگاه' },
  { id: 'Shield', label: 'محافظت' },
  { id: 'LayoutGrid', label: 'گرید' },
  { id: 'LayoutDashboard', label: 'داشبورد' },
  { id: 'Package', label: 'بسته' },
  { id: 'Phone', label: 'تلفن' },
  { id: 'Droplets', label: 'قطره' },
  { id: 'Leaf', label: 'برگ' },
  { id: 'Sprout', label: 'جوانه' },
  { id: 'Users', label: 'کاربران' },
  { id: 'Trophy', label: 'جام' },
  { id: 'Target', label: 'هدف' },
  { id: 'Award', label: 'نشان' },
  { id: 'Layers', label: 'لایه‌ها' },
  { id: 'Palette', label: 'پالت' },
  { id: 'GraduationCap', label: 'تحصیل' },
  { id: 'BookOpen', label: 'کتاب' },
  { id: 'ClipboardCheck', label: 'چک‌لیست' },
  { id: 'BarChart3', label: 'نمودار' },
  { id: 'Video', label: 'ویدیو' },
  { id: 'PenLine', label: 'قلم' },
  { id: 'FileQuestion', label: 'سؤال' },
  { id: 'FolderTree', label: 'پوشه' },
]

/** پالت‌های آماده — با انتخاب، همه رنگ‌ها پر می‌شوند و قابل ویرایش‌اند */
export const FEATURE_CARDS_PRESETS = [
  {
    id: 'light',
    label: 'سبز روشن',
    desc: 'شرکتی کلاسیک',
    colors: {
      section_bg_mode: 'transparent',
      section_bg: '#ffffff',
      bg_from: '#f0fdf4',
      bg_to: '#ffffff',
      eyebrow_color: '#1b4332',
      eyebrow_bg: 'rgba(45, 106, 79, 0.12)',
      title_color: '#081c15',
      subtitle_color: '#52796f',
      card_bg: '#ffffff',
      card_bg_to: '#e8f5ec',
      card_border: 'rgba(45, 106, 79, 0.14)',
      card_shadow: '0 10px 28px rgba(27, 67, 50, 0.07)',
      card_title_color: '#1b4332',
      card_desc_color: '#52796f',
      card_cta_color: '#2d6a4f',
      icon_color: '#f8fff8',
      icon_bg_from: '#2d6a4f',
      icon_bg_to: '#52b788',
      icon_shadow: '0 8px 18px rgba(45, 106, 79, 0.28)',
      hover_border: 'rgba(45, 106, 79, 0.28)',
      hover_shadow: '0 16px 36px rgba(27, 67, 50, 0.12)',
    },
  },
  {
    id: 'dark',
    label: 'تیره طلایی',
    desc: 'پس‌زمینه مشکی',
    colors: {
      section_bg_mode: 'solid',
      section_bg: '#0a0a0a',
      bg_from: '#0a0a0a',
      bg_to: '#111111',
      eyebrow_color: '#e8b800',
      eyebrow_bg: 'rgba(232, 184, 0, 0.14)',
      title_color: '#f5f0e6',
      subtitle_color: '#a39b8f',
      card_bg: '#1a1a1a',
      card_bg_to: '#111111',
      card_border: 'rgba(232, 184, 0, 0.18)',
      card_shadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
      card_title_color: '#f5f0e6',
      card_desc_color: '#a39b8f',
      card_cta_color: '#e8b800',
      icon_color: '#111111',
      icon_bg_from: '#e8b800',
      icon_bg_to: '#c9a000',
      icon_shadow: '0 8px 18px rgba(232, 184, 0, 0.28)',
      hover_border: 'rgba(232, 184, 0, 0.4)',
      hover_shadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
    },
  },
  {
    id: 'school',
    label: 'مدرسه جنگلی',
    desc: 'جنگل · زمرد · مرجان',
    colors: {
      section_bg_mode: 'gradient',
      section_bg: '#f3f4f6',
      bg_from: '#f3f4f6',
      bg_to: '#dcdfe5',
      eyebrow_color: '#cb0b0a',
      eyebrow_bg: 'rgba(223, 128, 128, 0.2)',
      title_color: '#004733',
      subtitle_color: '#568d66',
      card_bg: '#ffffff',
      card_bg_to: '#f3f4f6',
      card_border: 'rgba(165, 193, 174, 0.55)',
      card_shadow: '0 12px 32px rgba(0, 71, 51, 0.08)',
      card_title_color: '#004733',
      card_desc_color: '#568d66',
      card_cta_color: '#2b6a4d',
      icon_color: '#ffffff',
      icon_bg_from: '#2b6a4d',
      icon_bg_to: '#568d66',
      icon_shadow: '0 8px 20px rgba(0, 71, 51, 0.28)',
      hover_border: 'rgba(43, 106, 77, 0.45)',
      hover_shadow: '0 18px 40px rgba(0, 71, 51, 0.12)',
    },
  },
  {
    id: 'marketplace',
    label: 'مارکت‌پلیس',
    desc: 'مشکی / صورتی',
    colors: {
      section_bg_mode: 'gradient',
      section_bg: '#eeeeee',
      bg_from: '#eeeeee',
      bg_to: '#ffffff',
      eyebrow_color: '#cb2957',
      eyebrow_bg: 'rgba(203, 41, 87, 0.12)',
      title_color: '#000000',
      subtitle_color: '#555555',
      card_bg: '#ffffff',
      card_bg_to: '#eeeeee',
      card_border: '#dddddd',
      card_shadow: '0 10px 28px rgba(0, 0, 0, 0.06)',
      card_title_color: '#000000',
      card_desc_color: '#555555',
      card_cta_color: '#cb2957',
      icon_color: '#ffffff',
      icon_bg_from: '#000000',
      icon_bg_to: '#cb2957',
      icon_shadow: '0 8px 18px rgba(203, 41, 87, 0.28)',
      hover_border: 'rgba(203, 41, 87, 0.35)',
      hover_shadow: '0 16px 36px rgba(203, 41, 87, 0.12)',
    },
  },
]

export const FEATURE_CARDS_COLOR_FIELDS = [
  { key: 'section_bg', label: 'پس‌زمینه سکشن (تک‌رنگ)' },
  { key: 'bg_from', label: 'گرادیان سکشن — از' },
  { key: 'bg_to', label: 'گرادیان سکشن — تا' },
  { key: 'eyebrow_color', label: 'eyebrow — متن' },
  { key: 'eyebrow_bg', label: 'eyebrow — پس‌زمینه' },
  { key: 'title_color', label: 'عنوان اصلی' },
  { key: 'subtitle_color', label: 'زیرعنوان' },
  { key: 'card_bg', label: 'کارت — پس‌زمینه' },
  { key: 'card_bg_to', label: 'کارت — گرادیان تا' },
  { key: 'card_border', label: 'کارت — حاشیه' },
  { key: 'card_shadow', label: 'کارت — سایه' },
  { key: 'card_title_color', label: 'عنوان کارت' },
  { key: 'card_desc_color', label: 'توضیح کارت' },
  { key: 'card_cta_color', label: 'لینک CTA کارت' },
  { key: 'icon_color', label: 'آیکون — رنگ' },
  { key: 'icon_bg_from', label: 'آیکون — گرادیان از' },
  { key: 'icon_bg_to', label: 'آیکون — گرادیان تا' },
  { key: 'icon_shadow', label: 'آیکون — سایه' },
  { key: 'hover_border', label: 'هاور — حاشیه' },
  { key: 'hover_shadow', label: 'هاور — سایه' },
]

const LIGHT = FEATURE_CARDS_PRESETS[0].colors

export const DEFAULT_FEATURE_CARDS_ITEMS = [
  {
    title: 'کودهای پودری و محلول',
    desc: 'NPK، ریزمغذی و کودهای محلول در آب با حلالیت بالا',
    icon: 'Droplets',
    href: '',
    cta: '',
  },
  {
    title: 'کودهای گرانول',
    desc: 'ماکرو، میکرو و کودهای پایه خاک برای تغذیه فصلی',
    icon: 'Package',
    href: '',
    cta: '',
  },
  {
    title: 'سموم گیاهی',
    desc: 'علف‌کش، قارچ‌کش و حشره‌کش مناسب مزرعه و باغ',
    icon: 'Shield',
    href: '',
    cta: '',
  },
  {
    title: 'مشاوره و سفارش',
    desc: 'راهنمایی فنی و دریافت لیست قیمت از دفتر فروش',
    icon: 'Phone',
    href: '',
    cta: '',
  },
]

export const DEFAULT_FEATURE_CARDS_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: true,
  show_eyebrow: true,
  show_title: true,
  show_subtitle: true,
  show_icons: true,
  show_cta: true,
  preset: 'light',
  columns: 4,
  head_align: 'center',
  max_width: 1120,
  gap: 14,
  card_radius: 18,
  card_padding: 18,
  icon_size: 46,
  icon_radius: 14,
  eyebrow: '',
  title: 'خطوط محصول',
  subtitle: '',
  items: DEFAULT_FEATURE_CARDS_ITEMS,
  title_font: 'iran_extra',
  body_font: 'iran',
  eyebrow_font: 'iran_bold',
  card_title_font: 'iran_extra',
  title_size: 28,
  subtitle_size: 15,
  card_title_size: 16,
  card_desc_size: 13,
  section_bg_mode: LIGHT.section_bg_mode,
  ...LIGHT,
  padding_top: 28,
  padding_right: 16,
  padding_bottom: 20,
  padding_left: 16,
  margin_top: 8,
  margin_right: 0,
  margin_bottom: 4,
  margin_left: 0,
}

function pxNum(v, fallback = 0, max = 480) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  if (raw?.[key] === undefined) return !!d[key]
  return !!raw[key]
}

function colorStr(v, fallback = '') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function normalizeItems(rawItems) {
  const src =
    Array.isArray(rawItems) && rawItems.length
      ? rawItems
      : DEFAULT_FEATURE_CARDS_ITEMS
  return src.slice(0, 12).map((it, i) => ({
    title: String(it?.title || `مورد ${i + 1}`).trim(),
    desc: String(it?.desc || '').trim(),
    icon: String(it?.icon || 'Package').trim() || 'Package',
    href: String(it?.href || '').trim(),
    cta: String(it?.cta || '').trim(),
  }))
}

export function getFeatureCardsPreset(id) {
  return FEATURE_CARDS_PRESETS.find((p) => p.id === id) || null
}

/** نگاشت variant قدیمی → preset */
function resolvePreset(raw = {}) {
  const p = String(raw.preset || raw.variant || '').trim()
  if (FEATURE_CARDS_PRESETS.some((x) => x.id === p)) return p
  return 'light'
}

export function normalizeFeatureCardsSettings(raw = {}) {
  const d = DEFAULT_FEATURE_CARDS_SETTINGS
  const r = raw && typeof raw === 'object' ? raw : {}
  const preset = resolvePreset(r)
  const presetColors = getFeatureCardsPreset(preset)?.colors || LIGHT

  const fontIds = new Set(SHOP_FONTS.map((f) => f.id))
  const pickFont = (key, fallback) => {
    const v = String(r[key] || fallback || '').trim()
    return fontIds.has(v) ? v : fallback
  }

  const s = {
    show_on_mobile: bool(r, 'show_on_mobile', d),
    show_on_desktop: bool(r, 'show_on_desktop', d),
    section_full: bool(r, 'section_full', d),
    show_eyebrow: bool(r, 'show_eyebrow', d),
    show_title: bool(r, 'show_title', d),
    show_subtitle: bool(r, 'show_subtitle', d),
    show_icons: bool(r, 'show_icons', d),
    show_cta: bool(r, 'show_cta', d),
    preset,
    // سازگاری با layoutهای قدیمی
    variant: preset,
    columns: Math.min(4, Math.max(2, Number(r.columns) || d.columns)),
    head_align: FEATURE_CARDS_HEAD_ALIGNS.some((a) => a.id === r.head_align)
      ? r.head_align
      : d.head_align,
    max_width: pxNum(r.max_width, d.max_width, 1600),
    gap: pxNum(r.gap, d.gap, 48),
    card_radius: pxNum(r.card_radius, d.card_radius, 48),
    card_padding: pxNum(r.card_padding, d.card_padding, 48),
    icon_size: pxNum(r.icon_size, d.icon_size, 96),
    icon_radius: pxNum(r.icon_radius, d.icon_radius, 48),
    eyebrow: String(r.eyebrow ?? d.eyebrow).trim(),
    title: String(r.title ?? d.title).trim(),
    subtitle: String(r.subtitle ?? d.subtitle).trim(),
    items: normalizeItems(r.items),
    title_font: pickFont('title_font', d.title_font),
    body_font: pickFont('body_font', d.body_font),
    eyebrow_font: pickFont('eyebrow_font', d.eyebrow_font),
    card_title_font: pickFont('card_title_font', d.card_title_font),
    title_size: pxNum(r.title_size, d.title_size, 64),
    subtitle_size: pxNum(r.subtitle_size, d.subtitle_size, 32),
    card_title_size: pxNum(r.card_title_size, d.card_title_size, 32),
    card_desc_size: pxNum(r.card_desc_size, d.card_desc_size, 24),
    section_bg_mode: FEATURE_CARDS_BG_MODES.some((m) => m.id === r.section_bg_mode)
      ? r.section_bg_mode
      : presetColors.section_bg_mode || d.section_bg_mode,
    padding_top: pxNum(r.padding_top, d.padding_top),
    padding_right: pxNum(r.padding_right, d.padding_right),
    padding_bottom: pxNum(r.padding_bottom, d.padding_bottom),
    padding_left: pxNum(r.padding_left, d.padding_left),
    margin_top: pxNum(r.margin_top, d.margin_top),
    margin_right: pxNum(r.margin_right, d.margin_right),
    margin_bottom: pxNum(r.margin_bottom, d.margin_bottom),
    margin_left: pxNum(r.margin_left, d.margin_left),
  }

  FEATURE_CARDS_COLOR_FIELDS.forEach(({ key }) => {
    const fallback = presetColors[key] ?? d[key] ?? ''
    // اگر کاربر مقدار گذاشته (حتی خالی عمدی با کلید موجود) — از raw؛ وگرنه از preset
    if (Object.prototype.hasOwnProperty.call(r, key)) {
      s[key] = colorStr(r[key], fallback)
    } else {
      s[key] = colorStr(fallback, '')
    }
  })

  return s
}

export function applyFeatureCardsPreset(presetId) {
  const preset = getFeatureCardsPreset(presetId) || FEATURE_CARDS_PRESETS[0]
  return {
    preset: preset.id,
    variant: preset.id,
    ...preset.colors,
  }
}

export function featureCardsCssVars(settings) {
  const s = normalizeFeatureCardsSettings(settings || {})
  let sectionBg = 'transparent'
  if (s.section_bg_mode === 'solid') {
    sectionBg = s.section_bg || '#ffffff'
  } else if (s.section_bg_mode === 'gradient') {
    sectionBg = `linear-gradient(180deg, ${s.bg_from || '#fff'} 0%, ${s.bg_to || '#fff'} 100%)`
  }

  return {
    '--fc-cols': String(s.columns),
    '--fc-max': `${s.max_width}px`,
    '--fc-gap': `${s.gap}px`,
    '--fc-pt': `${s.padding_top}px`,
    '--fc-pr': `${s.padding_right}px`,
    '--fc-pb': `${s.padding_bottom}px`,
    '--fc-pl': `${s.padding_left}px`,
    '--fc-mt': `${s.margin_top}px`,
    '--fc-mr': `${s.margin_right}px`,
    '--fc-mb': `${s.margin_bottom}px`,
    '--fc-ml': `${s.margin_left}px`,
    '--fc-section-bg': sectionBg,
    '--fc-head-align': s.head_align === 'start' ? 'start' : 'center',
    '--fc-title-ff': shopFontCss(s.title_font),
    '--fc-body-ff': shopFontCss(s.body_font),
    '--fc-eyebrow-ff': shopFontCss(s.eyebrow_font),
    '--fc-card-title-ff': shopFontCss(s.card_title_font),
    '--fc-title-size': `${s.title_size}px`,
    '--fc-subtitle-size': `${s.subtitle_size}px`,
    '--fc-card-title-size': `${s.card_title_size}px`,
    '--fc-card-desc-size': `${s.card_desc_size}px`,
    '--fc-eyebrow-color': s.eyebrow_color,
    '--fc-eyebrow-bg': s.eyebrow_bg,
    '--fc-title-color': s.title_color,
    '--fc-subtitle-color': s.subtitle_color,
    '--fc-card-bg': s.card_bg,
    '--fc-card-bg-to': s.card_bg_to || s.card_bg,
    '--fc-card-border': s.card_border,
    '--fc-card-shadow': s.card_shadow,
    '--fc-card-radius': `${s.card_radius}px`,
    '--fc-card-pad': `${s.card_padding}px`,
    '--fc-card-title': s.card_title_color,
    '--fc-card-desc': s.card_desc_color,
    '--fc-card-cta': s.card_cta_color,
    '--fc-icon-color': s.icon_color,
    '--fc-icon-from': s.icon_bg_from,
    '--fc-icon-to': s.icon_bg_to,
    '--fc-icon-shadow': s.icon_shadow,
    '--fc-icon-size': `${s.icon_size}px`,
    '--fc-icon-radius': `${s.icon_radius}px`,
    '--fc-hover-border': s.hover_border,
    '--fc-hover-shadow': s.hover_shadow,
  }
}
