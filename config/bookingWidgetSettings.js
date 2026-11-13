// config/bookingWidgetSettings.js — تنظیمات فرم رزرو (دسکتاپ / موبایل جدا مثل نوار خبر فوری)

import { shopFontCss } from '@/config/shopWidgetSettings'

export const BOOKING_FORM_WIDGET_TYPES = new Set(['booking_form'])

export const BOOKING_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const BOOKING_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const BOOKING_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const BOOKING_BAR_COLORS = [
  { key: 'accent', label: 'اکسنت' },
  { key: 'accent_deep', label: 'اکسنت تیره' },
  { key: 'ink', label: 'متن' },
  { key: 'muted', label: 'متن کم‌رنگ' },
]

export const BOOKING_PANEL_COLORS = [
  { key: 'panel_from', label: 'پنل — از' },
  { key: 'panel_to', label: 'پنل — تا' },
  { key: 'panel_border', label: 'حاشیه پنل' },
  { key: 'input_bg', label: 'پس‌زمینه ورودی' },
  { key: 'input_border', label: 'حاشیه ورودی' },
]

export const BOOKING_BUTTON_COLORS = [
  { key: 'button_from', label: 'دکمه — از' },
  { key: 'button_to', label: 'دکمه — تا' },
  { key: 'button_text', label: 'متن دکمه' },
  { key: 'step_on_bg', label: 'مرحله فعال — پس‌زمینه' },
  { key: 'step_on_text', label: 'مرحله فعال — متن' },
]

export const BOOKING_COLOR_FIELDS = [
  ...BOOKING_BAR_COLORS,
  ...BOOKING_PANEL_COLORS,
  ...BOOKING_BUTTON_COLORS,
]

export const BOOKING_CALENDAR_DAYS = [
  { id: 7, label: '۷ روز' },
  { id: 14, label: '۱۴ روز' },
  { id: 21, label: '۲۱ روز' },
  { id: 30, label: '۳۰ روز' },
]

export const BOOKING_DENSITY = [
  { id: 'comfortable', label: 'راحت' },
  { id: 'compact', label: 'فشرده' },
]

/** کلیدهای جدا برای دسکتاپ / موبایل */
export const BOOKING_VIEWPORT_KEYS = [
  'density',
  'show_panel',
  'show_eyebrow',
  'show_steps',
  'show_staff_field',
  'show_note_field',
  'show_prices',
  'show_duration',
  'calendar_days',
  'panel_shadow',
  'section_full',
  'title_size',
  'subtitle_size',
  'panel_radius',
  'input_radius',
  'button_radius',
  'panel_padding',
  'max_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  ...BOOKING_COLOR_FIELDS.map((f) => f.key),
]

/** مشترک برای هر دو دستگاه (محتوا) */
export const BOOKING_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'service_label',
  'staff_label',
  'staff_optional_hint',
  'date_label',
  'time_label',
  'name_label',
  'mobile_label',
  'note_label',
  'submit_label',
  'success_title',
  'success_hint',
  'lookup_link_label',
])

export const DEFAULT_BOOKING_FORM_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  density: 'comfortable',
  show_panel: true,
  show_eyebrow: true,
  show_steps: true,
  show_staff_field: true,
  show_note_field: true,
  show_prices: true,
  show_duration: true,
  calendar_days: 14,
  eyebrow_text: 'رزرو',
  title: '',
  subtitle: '',
  service_label: 'خدمت',
  staff_label: 'پرسنل',
  staff_optional_hint: '(اختیاری)',
  date_label: 'تاریخ (شمسی)',
  time_label: 'ساعت',
  name_label: 'نام',
  mobile_label: 'موبایل',
  note_label: 'یادداشت',
  submit_label: 'ثبت نوبت',
  success_title: 'نوبت ثبت شد',
  success_hint: 'این کد را برای پیگیری نگه دارید.',
  lookup_link_label: 'پیگیری نوبت',
  accent: '#0f766e',
  accent_deep: '#0b5f59',
  ink: '#12221e',
  muted: '#5a6e68',
  panel_from: '#f0fdfa',
  panel_to: '#ffffff',
  panel_border: 'rgba(15, 118, 110, 0.14)',
  input_bg: '#ffffff',
  input_border: 'rgba(15, 118, 110, 0.14)',
  button_from: '#0f766e',
  button_to: '#0b5f59',
  button_text: '#ffffff',
  step_on_bg: '#ecfdf5',
  step_on_text: '#0f766e',
  title_size: 22,
  subtitle_size: 14,
  panel_radius: 18,
  input_radius: 12,
  button_radius: 12,
  panel_padding: 18,
  panel_shadow: true,
  section_full: false,
  max_width: 560,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 16,
  padding_left: 0,
  margin_top: 12,
  margin_right: 0,
  margin_bottom: 24,
  margin_left: 0,
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent' || s.toLowerCase() === 'none') {
    return 'transparent'
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

function pickViewportSlice(obj = {}) {
  const out = {}
  BOOKING_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isBookingFormWidgetType(type) {
  return BOOKING_FORM_WIDGET_TYPES.has(String(type || ''))
}

export function mergeBookingViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}

  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) {
      return { ...flat, ...mobileOv }
    }
    return desktop
  }
  return desktop
}

function coerceBookingSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_BOOKING_FORM_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;[
    'show_panel',
    'show_eyebrow',
    'show_steps',
    'show_staff_field',
    'show_note_field',
    'show_prices',
    'show_duration',
    'panel_shadow',
    'section_full',
  ].forEach((k) => {
    if (merged[k] === undefined) s[k] = DEFAULT_BOOKING_FORM_SETTINGS[k]
    else s[k] = !!merged[k]
  })

  if (!BOOKING_DENSITY.some((d) => d.id === s.density)) {
    s.density = 'comfortable'
  }

  const days = Number(s.calendar_days)
  s.calendar_days = BOOKING_CALENDAR_DAYS.some((d) => d.id === days)
    ? days
    : 14

  BOOKING_SHARED_ROOT_KEYS.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    const fromRoot = rawRoot[k]
    if (fromRoot !== undefined) s[k] = String(fromRoot ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })

  BOOKING_COLOR_FIELDS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || DEFAULT_BOOKING_FORM_SETTINGS[key]
  })

  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.panel_radius = Math.min(36, pxNum(s.panel_radius, 18, 36))
  s.input_radius = Math.min(28, pxNum(s.input_radius, 12, 28))
  s.button_radius = Math.min(28, pxNum(s.button_radius, 12, 28))
  s.panel_padding = Math.min(48, pxNum(s.panel_padding, 18, 48))
  s.max_width = Math.max(280, Math.min(900, pxNum(s.max_width, 560, 900)))

  BOOKING_SPACE_FIELDS.concat(BOOKING_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_BOOKING_FORM_SETTINGS[key], max)
  })

  return s
}

/**
 * @param {object} raw
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeBookingFormSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeBookingViewportRaw(root, viewport)
  return coerceBookingSettings(merged, root)
}

export function getBookingVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotBookingViewportSettings(raw = {}, viewport = 'desktop') {
  return pickViewportSlice(normalizeBookingFormSettings(raw, { viewport }))
}

export function buildBookingViewportPatch(raw, device, key, value) {
  if (BOOKING_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function bookingFormCssVars(settings, opts = {}) {
  const s = normalizeBookingFormSettings(settings || {}, opts)
  return {
    '--bk-pt': `${s.padding_top}px`,
    '--bk-pr': `${s.padding_right}px`,
    '--bk-pb': `${s.padding_bottom}px`,
    '--bk-pl': `${s.padding_left}px`,
    '--bk-mt': `${s.margin_top}px`,
    '--bk-mr': `${s.margin_right}px`,
    '--bk-mb': `${s.margin_bottom}px`,
    '--bk-ml': `${s.margin_left}px`,
    '--bk-max': `${s.max_width}px`,
    '--bk-accent': s.accent,
    '--bk-accent-deep': s.accent_deep,
    '--bk-ink': s.ink,
    '--bk-muted': s.muted,
    '--bk-panel-from': s.panel_from,
    '--bk-panel-to': s.panel_to,
    '--bk-panel-border': s.panel_border,
    '--bk-input-bg': s.input_bg,
    '--bk-input-border': s.input_border,
    '--bk-btn-from': s.button_from,
    '--bk-btn-to': s.button_to,
    '--bk-btn-text': s.button_text,
    '--bk-step-on-bg': s.step_on_bg,
    '--bk-step-on-text': s.step_on_text,
    '--bk-title-size': `${s.title_size}px`,
    '--bk-sub-size': `${s.subtitle_size}px`,
    '--bk-panel-radius': `${s.panel_radius}px`,
    '--bk-input-radius': `${s.input_radius}px`,
    '--bk-btn-radius': `${s.button_radius}px`,
    '--bk-panel-pad': `${s.panel_padding}px`,
    '--bk-panel-shadow': s.panel_shadow
      ? '0 10px 28px rgba(60, 45, 0, 0.07)'
      : 'none',
  }
}

/* ─── فراخوان رزرو نوبت (booking_cta) ─── */

export const BOOKING_CTA_WIDGET_TYPES = new Set(['booking_cta'])

export const BOOKING_CTA_LAYOUTS = [
  { id: 'row', label: 'ردیفی' },
  { id: 'stack', label: 'ستونی' },
]

/** نوع پس‌زمینه بنر — مثل ویجت‌های فروشگاه */
export const BOOKING_CTA_BG_MODES = [
  { id: 'solid', label: 'رنگ ثابت' },
  { id: 'gradient', label: 'گرادیان' },
  { id: 'transparent', label: 'شفاف' },
]

export const BOOKING_CTA_COLORS = [
  { key: 'bg_solid', label: 'رنگ پس‌زمینه' },
  { key: 'bg_from', label: 'گرادیان — از' },
  { key: 'bg_mid', label: 'گرادیان — میانه' },
  { key: 'bg_to', label: 'گرادیان — تا' },
  { key: 'glow', label: 'درخشش' },
  { key: 'text_color', label: 'عنوان' },
  { key: 'muted_color', label: 'زیرعنوان' },
  { key: 'icon_bg', label: 'آیکن — پس‌زمینه' },
  { key: 'icon_color', label: 'آیکن — رنگ' },
  { key: 'primary_bg', label: 'دکمه اصلی — پس‌زمینه' },
  { key: 'primary_text', label: 'دکمه اصلی — متن' },
  { key: 'secondary_bg', label: 'دکمه فرعی — پس‌زمینه' },
  { key: 'secondary_border', label: 'دکمه فرعی — حاشیه' },
  { key: 'secondary_text', label: 'دکمه فرعی — متن' },
]

export const BOOKING_CTA_VIEWPORT_KEYS = [
  'layout',
  'show_icon',
  'show_glow',
  'show_primary',
  'show_secondary',
  'section_full',
  'band_shadow',
  'bg_mode',
  'title_size',
  'subtitle_size',
  'band_radius',
  'band_padding_y',
  'band_padding_x',
  'max_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  ...BOOKING_CTA_COLORS.map((f) => f.key),
]

export const BOOKING_CTA_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'title',
  'subtitle',
  'primary_label',
  'secondary_label',
  'primary_href',
  'secondary_href',
])

export const DEFAULT_BOOKING_CTA_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  layout: 'row',
  show_icon: true,
  show_glow: true,
  show_primary: true,
  show_secondary: true,
  section_full: false,
  band_shadow: true,
  bg_mode: 'solid',
  title: 'نوبت خود را آنلاین رزرو کنید',
  subtitle: 'انتخاب خدمت، پرسنل و ساعت — با تقویم شمسی',
  primary_label: 'شروع رزرو',
  secondary_label: 'پیگیری نوبت',
  primary_href: '/booking',
  secondary_href: '/booking?tab=lookup',
  bg_solid: '#0f766e',
  bg_from: '#0b3d3a',
  bg_mid: '#0f766e',
  bg_to: '#134e4a',
  glow: 'rgba(45, 212, 191, 0.28)',
  text_color: '#ecfdf5',
  muted_color: 'rgba(236, 253, 245, 0.88)',
  icon_bg: 'rgba(255, 255, 255, 0.12)',
  icon_color: '#99f6e4',
  primary_bg: '#ffffff',
  primary_text: '#0b3d3a',
  secondary_bg: 'transparent',
  secondary_border: 'rgba(255, 255, 255, 0.35)',
  secondary_text: '#ecfdf5',
  title_size: 24,
  subtitle_size: 14,
  band_radius: 20,
  band_padding_y: 22,
  band_padding_x: 20,
  max_width: 1100,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 8,
  padding_left: 0,
  margin_top: 28,
  margin_right: 0,
  margin_bottom: 8,
  margin_left: 0,
}

function pickCtaViewportSlice(obj = {}) {
  const out = {}
  BOOKING_CTA_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isBookingCtaWidgetType(type) {
  return BOOKING_CTA_WIDGET_TYPES.has(String(type || ''))
}

export function isBookingStudioWidgetType(type) {
  return (
    isBookingFormWidgetType(type) ||
    isBookingCtaWidgetType(type) ||
    isBookingServicesWidgetType(type) ||
    isBookingStaffWidgetType(type) ||
    isBookingLookupWidgetType(type)
  )
}

export function mergeBookingCtaViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickCtaViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coerceBookingCtaSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_BOOKING_CTA_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;['show_icon', 'show_glow', 'show_primary', 'show_secondary', 'section_full', 'band_shadow'].forEach(
    (k) => {
      if (merged[k] === undefined) s[k] = DEFAULT_BOOKING_CTA_SETTINGS[k]
      else s[k] = !!merged[k]
    },
  )

  if (!BOOKING_CTA_LAYOUTS.some((l) => l.id === s.layout)) s.layout = 'row'

  // سازگاری: تنظیمات قدیمی بدون bg_mode → گرادیان (ظاهر قبلی)
  if (merged.bg_mode == null) {
    s.bg_mode = merged.bg_solid != null ? 'solid' : 'gradient'
  } else if (!BOOKING_CTA_BG_MODES.some((m) => m.id === s.bg_mode)) {
    s.bg_mode = 'gradient'
  }

  // سازگاری با کلیدهای قدیمی primaryLabel / secondaryLabel / cta_*
  if (!rawRoot.title && merged.title === undefined && rawRoot.title !== '') {
    /* keep */
  }
  BOOKING_CTA_SHARED_ROOT_KEYS.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    let fromRoot = rawRoot[k]
    if (fromRoot === undefined && k === 'primary_label') {
      fromRoot = rawRoot.primaryLabel ?? rawRoot.cta_label
    }
    if (fromRoot === undefined && k === 'secondary_label') {
      fromRoot = rawRoot.secondaryLabel
    }
    if (fromRoot === undefined && k === 'primary_href') {
      fromRoot = rawRoot.cta_href ?? rawRoot.primaryHref
    }
    if (fromRoot === undefined && k === 'secondary_href') {
      fromRoot = rawRoot.secondaryHref
    }
    if (fromRoot !== undefined) s[k] = String(fromRoot ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })

  // سازگاری رنگ‌های قدیمی صدرا/تعمیرات (accent / button_*)
  if (!colorStr(merged.primary_bg)) {
    const legacyBtn =
      colorStr(rawRoot.button_from) ||
      colorStr(rawRoot.button_to) ||
      colorStr(rawRoot.accent)
    if (legacyBtn) s.primary_bg = legacyBtn
  }
  if (!colorStr(merged.primary_text) && colorStr(rawRoot.button_text)) {
    s.primary_text = colorStr(rawRoot.button_text)
  }
  if (!colorStr(merged.bg_solid)) {
    const legacyBg =
      colorStr(rawRoot.accent_deep) || colorStr(rawRoot.accent)
    if (legacyBg) s.bg_solid = legacyBg
  }
  if (!colorStr(merged.bg_from) && colorStr(rawRoot.accent_deep)) {
    s.bg_from = colorStr(rawRoot.accent_deep)
  }
  if (!colorStr(merged.bg_to) && colorStr(rawRoot.accent)) {
    s.bg_to = colorStr(rawRoot.accent)
  }
  if (!colorStr(merged.bg_mid) && colorStr(rawRoot.accent)) {
    s.bg_mid = colorStr(rawRoot.accent)
  }
  if (
    merged.bg_mode == null &&
    (colorStr(rawRoot.accent) || colorStr(rawRoot.button_from))
  ) {
    s.bg_mode = 'gradient'
  }

  BOOKING_CTA_COLORS.forEach(({ key }) => {
    const parsed = colorStr(s[key])
    if (parsed) s[key] = parsed
    else if (key === 'bg_solid' && !s.bg_solid) {
      // اگر solid خالی بود از میانهٔ گرادیان قدیمی بگیر
      s[key] =
        colorStr(s.bg_mid) || DEFAULT_BOOKING_CTA_SETTINGS.bg_solid
    } else {
      s[key] = DEFAULT_BOOKING_CTA_SETTINGS[key]
    }
  })

  s.title_size = Math.max(16, Math.min(42, pxNum(s.title_size, 24, 42)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.band_radius = Math.min(40, pxNum(s.band_radius, 20, 40))
  s.band_padding_y = Math.min(64, pxNum(s.band_padding_y, 22, 64))
  s.band_padding_x = Math.min(64, pxNum(s.band_padding_x, 20, 64))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))

  BOOKING_SPACE_FIELDS.concat(BOOKING_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_BOOKING_CTA_SETTINGS[key], max)
  })

  return s
}

export function normalizeBookingCtaSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeBookingCtaViewportRaw(root, viewport)
  return coerceBookingCtaSettings(merged, root)
}

export function snapshotBookingCtaViewportSettings(raw = {}, viewport = 'desktop') {
  return pickCtaViewportSlice(normalizeBookingCtaSettings(raw, { viewport }))
}

export function buildBookingCtaViewportPatch(raw, device, key, value) {
  if (BOOKING_CTA_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingCtaViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function bookingCtaCssVars(settings, opts = {}) {
  const s = normalizeBookingCtaSettings(settings || {}, opts)
  const root = settings && typeof settings === 'object' ? settings : {}
  const titleFontId = String(root.title_font || 'iran_extra').trim() || 'iran_extra'
  const bodyFontId = String(root.body_font || 'iran').trim() || 'iran'
  return {
    '--bkc-pt': `${s.padding_top}px`,
    '--bkc-pr': `${s.padding_right}px`,
    '--bkc-pb': `${s.padding_bottom}px`,
    '--bkc-pl': `${s.padding_left}px`,
    '--bkc-mt': `${s.margin_top}px`,
    '--bkc-mr': `${s.margin_right}px`,
    '--bkc-mb': `${s.margin_bottom}px`,
    '--bkc-ml': `${s.margin_left}px`,
    '--bkc-max': `${s.max_width}px`,
    '--bkc-band-py': `${s.band_padding_y}px`,
    '--bkc-band-px': `${s.band_padding_x}px`,
    '--bkc-radius': `${s.band_radius}px`,
    '--bkc-title-size': `${s.title_size}px`,
    '--bkc-sub-size': `${s.subtitle_size}px`,
    '--bkc-title-ff': shopFontCss(titleFontId),
    '--bkc-body-ff': shopFontCss(bodyFontId),
    '--bkc-bg-solid': s.bg_solid || s.bg_mid,
    '--bkc-bg-from': s.bg_from,
    '--bkc-bg-mid': s.bg_mid,
    '--bkc-bg-to': s.bg_to,
    '--bkc-glow': s.glow,
    '--bkc-text': s.text_color,
    '--bkc-muted': s.muted_color,
    '--bkc-icon-bg': s.icon_bg,
    '--bkc-icon': s.icon_color,
    '--bkc-pri-bg': s.primary_bg,
    '--bkc-pri-text': s.primary_text,
    '--bkc-sec-bg': s.secondary_bg,
    '--bkc-sec-border': s.secondary_border,
    '--bkc-sec-text': s.secondary_text,
    '--bkc-shadow': s.band_shadow
      ? '0 16px 40px rgba(11, 61, 58, 0.22)'
      : 'none',
  }
}

/* ─── خدمات نوبت‌دهی (booking_services) ─── */

export const BOOKING_SERVICES_WIDGET_TYPES = new Set(['booking_services'])

export const BOOKING_SERVICES_COLUMNS = [
  { id: 2, label: '۲ ستون' },
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
]

/** طرح‌های چیدمان — انتخاب اسکلتون‌دار مثل ریسایکلر فروشگاه */
export const BOOKING_SERVICES_LAYOUTS = [
  {
    id: 'cards',
    label: 'شبکه کارت',
    desc: 'کارت‌های کلاسیک ستونی',
    skeleton: 'svc_cards',
    patch: {
      layout: 'cards',
      columns: 3,
      card_min: 168,
      gap: 12,
      card_padding: 16,
      show_dot: true,
      card_lift: true,
    },
  },
  {
    id: 'list',
    label: 'لیست افقی',
    desc: 'نام، مدت و قیمت در یک ردیف',
    skeleton: 'svc_list',
    patch: {
      layout: 'list',
      columns: 1,
      card_min: 280,
      gap: 8,
      card_padding: 14,
      show_dot: true,
      card_lift: false,
    },
  },
  {
    id: 'stripe',
    label: 'نوار اکسنت',
    desc: 'نوار رنگی کنار هر کارت',
    skeleton: 'svc_stripe',
    patch: {
      layout: 'stripe',
      columns: 3,
      card_min: 168,
      gap: 12,
      card_padding: 16,
      show_dot: false,
      card_lift: true,
    },
  },
  {
    id: 'soft',
    label: 'نرم رنگی',
    desc: 'پس‌زمینه ملایم بدون حاشیه قوی',
    skeleton: 'svc_soft',
    patch: {
      layout: 'soft',
      columns: 3,
      card_min: 168,
      gap: 12,
      card_padding: 16,
      show_dot: true,
      card_lift: true,
    },
  },
  {
    id: 'compact',
    label: 'فشرده',
    desc: 'کارت‌های کوچک‌تر و متراکم',
    skeleton: 'svc_compact',
    patch: {
      layout: 'compact',
      columns: 4,
      card_min: 140,
      gap: 8,
      card_padding: 12,
      show_dot: true,
      card_lift: false,
    },
  },
  {
    id: 'tile',
    label: 'تایل مرکزی',
    desc: 'محتوای وسط‌چین با تاکید بصری',
    skeleton: 'svc_tile',
    patch: {
      layout: 'tile',
      columns: 3,
      card_min: 160,
      gap: 14,
      card_padding: 18,
      show_dot: true,
      card_lift: true,
    },
  },
]

export const BOOKING_SERVICES_SURFACE_MODES = [
  { id: 'transparent', label: 'شفاف' },
  { id: 'color', label: 'رنگی' },
]

export const BOOKING_SERVICES_SURFACE_SPANS = [
  { id: 'full', label: 'تمام عرض صفحه' },
  { id: 'container', label: 'فقط کانتینر' },
]

/** شکل دکمه رزرو روی کارت */
export const BOOKING_SERVICES_CTA_STYLES = [
  { id: 'text', label: 'متن لینک' },
  { id: 'chip', label: 'دکمه / چیپ' },
  { id: 'rail', label: 'نوار کناری' },
]

/** جای دکمه — left/right فیزیکی صفحه */
export const BOOKING_SERVICES_CTA_SIDES = [
  { id: 'left', label: 'چپ کارت' },
  { id: 'right', label: 'راست کارت' },
  { id: 'bottom', label: 'پایین کارت' },
]

export const BOOKING_SERVICES_CTA_HEIGHTS = [
  { id: 'full', label: 'تمام ارتفاع' },
  { id: 'near', label: 'نزدیک تمام' },
  { id: 'auto', label: 'خودکار' },
]

export const BOOKING_SERVICES_COLORS = [
  { key: 'ink', label: 'متن عنوان' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'accent', label: 'اکسنت پیش‌فرض کارت' },
  { key: 'accent_deep', label: 'قیمت / تاکید' },
  { key: 'card_bg', label: 'پس‌زمینه کارت' },
  { key: 'card_border', label: 'حاشیه کارت' },
]

export const BOOKING_SERVICES_CTA_COLORS = [
  { key: 'cta_bg', label: 'پس‌زمینه دکمه' },
  { key: 'cta_color', label: 'رنگ متن / آیکن' },
  { key: 'cta_border', label: 'حاشیه دکمه' },
  { key: 'cta_hover_bg', label: 'هاور — پس‌زمینه' },
]

export const BOOKING_SERVICES_VIEWPORT_KEYS = [
  'layout',
  'columns',
  'card_min',
  'gap',
  'show_eyebrow',
  'show_duration',
  'show_price',
  'show_cta',
  'show_dot',
  'card_lift',
  'section_full',
  'surface_mode',
  'surface_bg',
  'surface_span',
  'cta_style',
  'cta_side',
  'cta_height',
  'cta_width',
  'cta_radius',
  'cta_icon',
  'cta_icon_size',
  'cta_show_label',
  'cta_show_icon',
  'title_size',
  'subtitle_size',
  'card_radius',
  'card_padding',
  'max_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  ...BOOKING_SERVICES_COLORS.map((f) => f.key),
  ...BOOKING_SERVICES_CTA_COLORS.map((f) => f.key),
]

export const BOOKING_SERVICES_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'cta_label',
  'link_base',
])

export const DEFAULT_BOOKING_SERVICES_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  layout: 'cards',
  columns: 3,
  card_min: 168,
  gap: 12,
  show_eyebrow: true,
  show_duration: true,
  show_price: true,
  show_cta: true,
  show_dot: true,
  card_lift: true,
  section_full: false,
  surface_mode: 'transparent',
  surface_bg: '#f0fdfa',
  surface_span: 'full',
  cta_style: 'text',
  cta_side: 'bottom',
  cta_height: 'auto',
  cta_width: 30,
  cta_radius: 0,
  cta_icon: 'ArrowLeft',
  cta_icon_size: 16,
  cta_show_label: true,
  cta_show_icon: true,
  eyebrow_text: 'خدمات',
  title: 'خدمات ما',
  subtitle: 'خدمت موردنظر را انتخاب کنید و مستقیم وارد رزرو شوید',
  cta_label: 'رزرو',
  link_base: '/booking?service=',
  ink: '#12221e',
  muted: '#5a6e68',
  eyebrow_color: '#0f766e',
  accent: '#0f766e',
  accent_deep: '#0b5f59',
  card_bg: '#ffffff',
  card_border: 'rgba(15, 118, 110, 0.14)',
  cta_bg: '#0f766e',
  cta_color: '#0f766e',
  cta_border: 'transparent',
  cta_hover_bg: '#0b5f59',
  title_size: 22,
  subtitle_size: 14,
  card_radius: 16,
  card_padding: 16,
  max_width: 1100,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 12,
  padding_left: 0,
  margin_top: 20,
  margin_right: 0,
  margin_bottom: 12,
  margin_left: 0,
}

function pickServicesViewportSlice(obj = {}) {
  const out = {}
  BOOKING_SERVICES_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isBookingServicesWidgetType(type) {
  return BOOKING_SERVICES_WIDGET_TYPES.has(String(type || ''))
}

export function mergeBookingServicesViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickServicesViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coerceBookingServicesSettings(merged, rawRoot = {}) {
  const d = DEFAULT_BOOKING_SERVICES_SETTINGS
  const s = { ...d, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;[
    'show_eyebrow',
    'show_duration',
    'show_price',
    'show_cta',
    'show_dot',
    'card_lift',
    'section_full',
    'cta_show_label',
    'cta_show_icon',
  ].forEach((k) => {
    if (merged[k] === undefined) s[k] = d[k]
    else s[k] = !!merged[k]
  })

  if (!BOOKING_SERVICES_LAYOUTS.some((l) => l.id === s.layout)) {
    s.layout = d.layout
  }

  const cols = Number(s.columns)
  s.columns = BOOKING_SERVICES_COLUMNS.some((c) => c.id === cols) ? cols : 3

  if (!BOOKING_SERVICES_SURFACE_MODES.some((m) => m.id === s.surface_mode)) {
    if (merged.surface_mode == null && merged.surface_bg) s.surface_mode = 'color'
    else s.surface_mode = d.surface_mode
  }
  if (!BOOKING_SERVICES_SURFACE_SPANS.some((m) => m.id === s.surface_span)) {
    s.surface_span = d.surface_span
  }
  s.surface_bg = colorStr(s.surface_bg) || d.surface_bg

  if (!BOOKING_SERVICES_CTA_STYLES.some((m) => m.id === s.cta_style)) {
    s.cta_style = d.cta_style
  }
  if (!BOOKING_SERVICES_CTA_SIDES.some((m) => m.id === s.cta_side)) {
    s.cta_side = d.cta_side
  }
  if (!BOOKING_SERVICES_CTA_HEIGHTS.some((m) => m.id === s.cta_height)) {
    s.cta_height = d.cta_height
  }
  s.cta_icon = String(s.cta_icon || d.cta_icon || 'ArrowLeft').trim() || 'ArrowLeft'
  s.cta_width = Math.max(20, Math.min(80, pxNum(s.cta_width, 30, 80)))
  s.cta_radius = Math.min(28, pxNum(s.cta_radius, 0, 28))
  s.cta_icon_size = Math.max(10, Math.min(28, pxNum(s.cta_icon_size, 16, 28)))

  BOOKING_SERVICES_SHARED_ROOT_KEYS.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    const fromRoot = rawRoot[k]
    if (fromRoot !== undefined) s[k] = String(fromRoot ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })
  if (!s.link_base) s.link_base = '/booking?service='

  BOOKING_SERVICES_COLORS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || d[key]
  })
  BOOKING_SERVICES_CTA_COLORS.forEach(({ key }) => {
    const parsed = colorStr(s[key])
    if (parsed) s[key] = parsed
    else s[key] = d[key]
  })

  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.card_radius = Math.min(28, pxNum(s.card_radius, 16, 28))
  s.card_padding = Math.min(32, pxNum(s.card_padding, 16, 32))
  s.card_min = Math.max(120, Math.min(280, pxNum(s.card_min, 168, 280)))
  s.gap = Math.min(32, pxNum(s.gap, 12, 32))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))

  BOOKING_SPACE_FIELDS.concat(BOOKING_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], d[key], max)
  })

  return s
}

export function normalizeBookingServicesSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeBookingServicesViewportRaw(root, viewport)
  return coerceBookingServicesSettings(merged, root)
}

export function snapshotBookingServicesViewportSettings(
  raw = {},
  viewport = 'desktop',
) {
  return pickServicesViewportSlice(
    normalizeBookingServicesSettings(raw, { viewport }),
  )
}

export function buildBookingServicesViewportPatch(raw, device, key, value) {
  if (BOOKING_SERVICES_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingServicesViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

/** چند کلید یکجا (مثلاً اعمال طرح چیدمان) */
export function buildBookingServicesViewportPatchMany(raw, device, patchObj = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  const shared = {}
  const vpKeys = {}
  Object.entries(patchObj || {}).forEach(([k, v]) => {
    if (BOOKING_SERVICES_SHARED_ROOT_KEYS.has(k)) shared[k] = v
    else vpKeys[k] = v
  })
  if (Object.keys(vpKeys).length === 0) return shared
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingServicesViewportSettings(root, vp)
  return { ...shared, [vp]: { ...current, ...vpKeys } }
}

export function bookingServicesCssVars(settings, opts = {}) {
  const s = normalizeBookingServicesSettings(settings || {}, opts)
  const surfaceOn = s.surface_mode === 'color'
  return {
    '--bks-pt': `${s.padding_top}px`,
    '--bks-pr': `${s.padding_right}px`,
    '--bks-pb': `${s.padding_bottom}px`,
    '--bks-pl': `${s.padding_left}px`,
    '--bks-mt': `${s.margin_top}px`,
    '--bks-mr': `${s.margin_right}px`,
    '--bks-mb': `${s.margin_bottom}px`,
    '--bks-ml': `${s.margin_left}px`,
    '--bks-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--bks-cols': String(s.columns),
    '--bks-card-min': `${s.card_min}px`,
    '--bks-gap': `${s.gap}px`,
    '--bks-title-size': `${s.title_size}px`,
    '--bks-sub-size': `${s.subtitle_size}px`,
    '--bks-card-radius': `${s.card_radius}px`,
    '--bks-card-pad': `${s.card_padding}px`,
    '--bks-ink': s.ink,
    '--bks-muted': s.muted,
    '--bks-eyebrow': s.eyebrow_color,
    '--bks-accent': s.accent,
    '--bks-accent-deep': s.accent_deep,
    '--bks-card-bg': s.card_bg,
    '--bks-card-border': s.card_border,
    '--bks-cta': s.cta_color,
    '--bks-cta-bg': s.cta_bg,
    '--bks-cta-border': s.cta_border,
    '--bks-cta-hover-bg': s.cta_hover_bg,
    '--bks-cta-w': `${s.cta_width}px`,
    '--bks-cta-radius': `${s.cta_radius}px`,
    '--bks-cta-icon': `${s.cta_icon_size}px`,
    '--bks-surface': surfaceOn ? s.surface_bg || '#f0fdfa' : 'transparent',
  }
}

/* ─── پرسنل نوبت‌دهی (booking_staff) ─── */

export const BOOKING_STAFF_WIDGET_TYPES = new Set(['booking_staff'])

export const BOOKING_STAFF_COLUMNS = [
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
  { id: 5, label: '۵ ستون' },
  { id: 6, label: '۶ ستون' },
]

export const BOOKING_STAFF_COLORS = [
  { key: 'ink', label: 'متن عنوان' },
  { key: 'muted', label: 'متن کم‌رنگ / سمت' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'card_bg', label: 'پس‌زمینه کارت' },
  { key: 'card_border', label: 'حاشیه کارت' },
  { key: 'avatar_from', label: 'آواتار — از' },
  { key: 'avatar_to', label: 'آواتار — تا' },
  { key: 'avatar_text', label: 'متن آواتار' },
]

export const BOOKING_STAFF_VIEWPORT_KEYS = [
  'columns',
  'card_min',
  'gap',
  'show_eyebrow',
  'show_role',
  'show_avatar',
  'card_lift',
  'section_full',
  'title_size',
  'subtitle_size',
  'name_size',
  'card_radius',
  'card_padding',
  'avatar_size',
  'max_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  ...BOOKING_STAFF_COLORS.map((f) => f.key),
]

export const BOOKING_STAFF_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
])

export const DEFAULT_BOOKING_STAFF_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  columns: 4,
  card_min: 120,
  gap: 11,
  show_eyebrow: true,
  show_role: true,
  show_avatar: true,
  card_lift: true,
  section_full: false,
  eyebrow_text: 'پرسنل',
  title: 'تیم ما',
  subtitle: '',
  ink: '#12221e',
  muted: '#5a6e68',
  eyebrow_color: '#0f766e',
  card_bg: '#f0fdfa',
  card_border: 'rgba(15, 118, 110, 0.14)',
  avatar_from: '#5eead4',
  avatar_to: '#0f766e',
  avatar_text: '#ffffff',
  title_size: 22,
  subtitle_size: 14,
  name_size: 14,
  card_radius: 16,
  card_padding: 16,
  avatar_size: 52,
  max_width: 1100,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 12,
  padding_left: 0,
  margin_top: 20,
  margin_right: 0,
  margin_bottom: 12,
  margin_left: 0,
}

function pickStaffViewportSlice(obj = {}) {
  const out = {}
  BOOKING_STAFF_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isBookingStaffWidgetType(type) {
  return BOOKING_STAFF_WIDGET_TYPES.has(String(type || ''))
}

export function mergeBookingStaffViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickStaffViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coerceBookingStaffSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_BOOKING_STAFF_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;[
    'show_eyebrow',
    'show_role',
    'show_avatar',
    'card_lift',
    'section_full',
  ].forEach((k) => {
    if (merged[k] === undefined) s[k] = DEFAULT_BOOKING_STAFF_SETTINGS[k]
    else s[k] = !!merged[k]
  })

  const cols = Number(s.columns)
  s.columns = BOOKING_STAFF_COLUMNS.some((c) => c.id === cols) ? cols : 4

  BOOKING_STAFF_SHARED_ROOT_KEYS.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    const fromRoot = rawRoot[k]
    if (fromRoot !== undefined) s[k] = String(fromRoot ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })

  BOOKING_STAFF_COLORS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || DEFAULT_BOOKING_STAFF_SETTINGS[key]
  })

  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.name_size = Math.max(11, Math.min(22, pxNum(s.name_size, 14, 22)))
  s.card_radius = Math.min(28, pxNum(s.card_radius, 16, 28))
  s.card_padding = Math.min(32, pxNum(s.card_padding, 16, 32))
  s.avatar_size = Math.max(32, Math.min(96, pxNum(s.avatar_size, 52, 96)))
  s.card_min = Math.max(80, Math.min(220, pxNum(s.card_min, 120, 220)))
  s.gap = Math.min(32, pxNum(s.gap, 11, 32))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))

  BOOKING_SPACE_FIELDS.concat(BOOKING_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_BOOKING_STAFF_SETTINGS[key], max)
  })

  return s
}

export function normalizeBookingStaffSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeBookingStaffViewportRaw(root, viewport)
  return coerceBookingStaffSettings(merged, root)
}

export function snapshotBookingStaffViewportSettings(
  raw = {},
  viewport = 'desktop',
) {
  return pickStaffViewportSlice(
    normalizeBookingStaffSettings(raw, { viewport }),
  )
}

export function buildBookingStaffViewportPatch(raw, device, key, value) {
  if (BOOKING_STAFF_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingStaffViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function bookingStaffCssVars(settings, opts = {}) {
  const s = normalizeBookingStaffSettings(settings || {}, opts)
  return {
    '--bkst-pt': `${s.padding_top}px`,
    '--bkst-pr': `${s.padding_right}px`,
    '--bkst-pb': `${s.padding_bottom}px`,
    '--bkst-pl': `${s.padding_left}px`,
    '--bkst-mt': `${s.margin_top}px`,
    '--bkst-mr': `${s.margin_right}px`,
    '--bkst-mb': `${s.margin_bottom}px`,
    '--bkst-ml': `${s.margin_left}px`,
    '--bkst-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--bkst-cols': String(s.columns),
    '--bkst-card-min': `${s.card_min}px`,
    '--bkst-gap': `${s.gap}px`,
    '--bkst-title-size': `${s.title_size}px`,
    '--bkst-sub-size': `${s.subtitle_size}px`,
    '--bkst-name-size': `${s.name_size}px`,
    '--bkst-card-radius': `${s.card_radius}px`,
    '--bkst-card-pad': `${s.card_padding}px`,
    '--bkst-avatar': `${s.avatar_size}px`,
    '--bkst-ink': s.ink,
    '--bkst-muted': s.muted,
    '--bkst-eyebrow': s.eyebrow_color,
    '--bkst-card-bg': s.card_bg,
    '--bkst-card-border': s.card_border,
    '--bkst-avatar-from': s.avatar_from,
    '--bkst-avatar-to': s.avatar_to,
    '--bkst-avatar-text': s.avatar_text,
  }
}

/* ─── پیگیری نوبت (booking_lookup) ─── */

export const BOOKING_LOOKUP_WIDGET_TYPES = new Set(['booking_lookup'])

export const BOOKING_LOOKUP_COLORS = [
  { key: 'ink', label: 'متن عنوان' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'panel_from', label: 'پنل — از' },
  { key: 'panel_to', label: 'پنل — تا' },
  { key: 'panel_border', label: 'حاشیه پنل' },
  { key: 'input_bg', label: 'پس‌زمینه ورودی' },
  { key: 'input_border', label: 'حاشیه ورودی' },
  { key: 'button_from', label: 'دکمه جستجو — از' },
  { key: 'button_to', label: 'دکمه جستجو — تا' },
  { key: 'button_text', label: 'متن دکمه جستجو' },
  { key: 'danger_border', label: 'حاشیه لغو' },
  { key: 'danger_text', label: 'متن لغو' },
  { key: 'result_bg', label: 'پس‌زمینه نتیجه' },
]

export const BOOKING_LOOKUP_VIEWPORT_KEYS = [
  'show_eyebrow',
  'show_panel',
  'show_cancel',
  'panel_shadow',
  'section_full',
  'title_size',
  'subtitle_size',
  'panel_radius',
  'panel_padding',
  'input_radius',
  'button_radius',
  'max_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  ...BOOKING_LOOKUP_COLORS.map((f) => f.key),
]

export const BOOKING_LOOKUP_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'code_label',
  'mobile_label',
  'submit_label',
  'cancel_label',
  'code_placeholder',
  'mobile_placeholder',
])

export const DEFAULT_BOOKING_LOOKUP_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  show_eyebrow: true,
  show_panel: true,
  show_cancel: true,
  panel_shadow: true,
  section_full: false,
  eyebrow_text: 'پیگیری',
  title: 'پیگیری نوبت',
  subtitle: 'کد پیگیری و موبایل خود را وارد کنید',
  code_label: 'کد پیگیری',
  mobile_label: 'موبایل',
  submit_label: 'جستجو',
  cancel_label: 'لغو نوبت',
  code_placeholder: 'مثلاً AB12CD',
  mobile_placeholder: '09xxxxxxxxx',
  ink: '#12221e',
  muted: '#5a6e68',
  eyebrow_color: '#0f766e',
  panel_from: '#f0fdfa',
  panel_to: '#ffffff',
  panel_border: 'rgba(15, 118, 110, 0.14)',
  input_bg: '#ffffff',
  input_border: 'rgba(15, 118, 110, 0.14)',
  button_from: '#0f766e',
  button_to: '#0b5f59',
  button_text: '#ffffff',
  danger_border: 'rgba(185, 28, 28, 0.25)',
  danger_text: '#b91c1c',
  result_bg: '#ecfdf5',
  title_size: 22,
  subtitle_size: 14,
  panel_radius: 18,
  panel_padding: 18,
  input_radius: 12,
  button_radius: 12,
  max_width: 520,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 8,
  margin_right: 0,
  margin_bottom: 24,
  margin_left: 0,
}

function pickLookupViewportSlice(obj = {}) {
  const out = {}
  BOOKING_LOOKUP_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isBookingLookupWidgetType(type) {
  return BOOKING_LOOKUP_WIDGET_TYPES.has(String(type || ''))
}

export function mergeBookingLookupViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickLookupViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coerceBookingLookupSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_BOOKING_LOOKUP_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;['show_eyebrow', 'show_panel', 'show_cancel', 'panel_shadow', 'section_full'].forEach(
    (k) => {
      if (merged[k] === undefined) s[k] = DEFAULT_BOOKING_LOOKUP_SETTINGS[k]
      else s[k] = !!merged[k]
    },
  )

  BOOKING_LOOKUP_SHARED_ROOT_KEYS.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    const fromRoot = rawRoot[k]
    if (fromRoot !== undefined) s[k] = String(fromRoot ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })

  BOOKING_LOOKUP_COLORS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || DEFAULT_BOOKING_LOOKUP_SETTINGS[key]
  })

  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.panel_radius = Math.min(28, pxNum(s.panel_radius, 18, 28))
  s.panel_padding = Math.min(40, pxNum(s.panel_padding, 18, 40))
  s.input_radius = Math.min(20, pxNum(s.input_radius, 12, 20))
  s.button_radius = Math.min(20, pxNum(s.button_radius, 12, 20))
  s.max_width = Math.max(280, Math.min(900, pxNum(s.max_width, 520, 900)))

  BOOKING_SPACE_FIELDS.concat(BOOKING_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_BOOKING_LOOKUP_SETTINGS[key], max)
  })

  return s
}

export function normalizeBookingLookupSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeBookingLookupViewportRaw(root, viewport)
  return coerceBookingLookupSettings(merged, root)
}

export function snapshotBookingLookupViewportSettings(
  raw = {},
  viewport = 'desktop',
) {
  return pickLookupViewportSlice(
    normalizeBookingLookupSettings(raw, { viewport }),
  )
}

export function buildBookingLookupViewportPatch(raw, device, key, value) {
  if (BOOKING_LOOKUP_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotBookingLookupViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function bookingLookupCssVars(settings, opts = {}) {
  const s = normalizeBookingLookupSettings(settings || {}, opts)
  return {
    '--bkl-pt': `${s.padding_top}px`,
    '--bkl-pr': `${s.padding_right}px`,
    '--bkl-pb': `${s.padding_bottom}px`,
    '--bkl-pl': `${s.padding_left}px`,
    '--bkl-mt': `${s.margin_top}px`,
    '--bkl-mr': `${s.margin_right}px`,
    '--bkl-mb': `${s.margin_bottom}px`,
    '--bkl-ml': `${s.margin_left}px`,
    '--bkl-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--bkl-title-size': `${s.title_size}px`,
    '--bkl-sub-size': `${s.subtitle_size}px`,
    '--bkl-panel-radius': `${s.panel_radius}px`,
    '--bkl-panel-pad': `${s.panel_padding}px`,
    '--bkl-input-radius': `${s.input_radius}px`,
    '--bkl-btn-radius': `${s.button_radius}px`,
    '--bkl-ink': s.ink,
    '--bkl-muted': s.muted,
    '--bkl-eyebrow': s.eyebrow_color,
    '--bkl-panel-from': s.panel_from,
    '--bkl-panel-to': s.panel_to,
    '--bkl-panel-border': s.panel_border,
    '--bkl-panel-shadow': s.panel_shadow
      ? '0 10px 28px rgba(12, 40, 36, 0.06)'
      : 'none',
    '--bkl-input-bg': s.input_bg,
    '--bkl-input-border': s.input_border,
    '--bkl-btn-from': s.button_from,
    '--bkl-btn-to': s.button_to,
    '--bkl-btn-text': s.button_text,
    '--bkl-danger-border': s.danger_border,
    '--bkl-danger-text': s.danger_text,
    '--bkl-result-bg': s.result_bg,
  }
}
