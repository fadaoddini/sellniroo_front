// config/sliderWidgetSettings.js — تنظیمات ویجت اسلایدر هیرو (دسکتاپ / موبایل جدا)

export const SLIDER_HEIGHTS = [
  { id: 'sm', label: 'کوتاه' },
  { id: 'md', label: 'متوسط' },
  { id: 'lg', label: 'بلند' },
]

export const SLIDER_INTERVALS = [
  { id: 3000, label: '۳ ثانیه' },
  { id: 5000, label: '۵ ثانیه' },
  { id: 8000, label: '۸ ثانیه' },
]

export const SLIDER_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const SLIDER_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

/** گوشه‌ها — در RTL: راست‌بالا = visual start */
export const SLIDER_RADIUS_FIELDS = [
  { key: 'radius_top_right', label: 'بالا راست' },
  { key: 'radius_top_left', label: 'بالا چپ' },
  { key: 'radius_bottom_left', label: 'پایین چپ' },
  { key: 'radius_bottom_right', label: 'پایین راست' },
]

export const SLIDER_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const SLIDER_DOTS_PLACES = [
  { id: 'overlay', label: 'روی اسلایدر' },
  { id: 'below', label: 'زیر اسلایدر' },
]

const LEGACY_SPACE = { none: 0, sm: 8, md: 16, lg: 24 }
const LEGACY_RADIUS = { none: 0, sm: 8, md: 14, lg: 20 }

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

/** کلیدهای قابل تفکیک دسکتاپ / موبایل */
export const SLIDER_VIEWPORT_KEYS = [
  'autoplay',
  'autoplay_ms',
  'show_arrows',
  'show_dots',
  'dots_place',
  'dots_bg',
  'dots_border_color',
  'dots_border_width',
  'dots_radius',
  'dots_pad_y',
  'dots_pad_x',
  'dots_gap',
  'dots_blur',
  'dots_shadow',
  'dots_shadow_color',
  'dots_shadow_blur',
  'dots_shadow_y',
  'dots_margin_top',
  'dots_dot_color',
  'dots_dot_hover',
  'dots_dot_active',
  'dots_progress_from',
  'dots_progress_to',
  'dots_dot_size',
  'dots_dot_active_width',
  'show_caption',
  'swipe_drag',
  'height',
  'full_bleed',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  'radius_top_left',
  'radius_top_right',
  'radius_bottom_right',
  'radius_bottom_left',
]

export const SLIDER_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
])

export const DEFAULT_SLIDER_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  autoplay: true,
  autoplay_ms: 5000,
  show_arrows: true,
  show_dots: true,
  /** overlay = روی تصویر | below = زیر اسلایدر */
  dots_place: 'overlay',
  dots_bg: 'rgba(0, 0, 0, 0.25)',
  dots_border_color: 'rgba(255, 255, 255, 0.12)',
  dots_border_width: 1,
  dots_radius: 999,
  dots_pad_y: 6,
  dots_pad_x: 12,
  dots_gap: 8,
  dots_blur: 10,
  dots_shadow: false,
  dots_shadow_color: 'rgba(0, 0, 0, 0.28)',
  dots_shadow_blur: 16,
  dots_shadow_y: 6,
  dots_margin_top: 12,
  dots_dot_color: 'rgba(255, 255, 255, 0.4)',
  dots_dot_hover: 'rgba(255, 255, 255, 0.7)',
  dots_dot_active: 'rgba(255, 255, 255, 0.3)',
  dots_progress_from: '#fbc300',
  dots_progress_to: '#fb9700',
  dots_dot_size: 8,
  dots_dot_active_width: 28,
  show_caption: true,
  /** کشیدن با انگشت/موس مثل اپ برای عوض کردن اسلاید */
  swipe_drag: true,
  height: 'md',
  full_bleed: true,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  radius_top_left: 0,
  radius_top_right: 0,
  radius_bottom_right: 0,
  radius_bottom_left: 0,
}

export const SLIDER_WIDGET_TYPES = new Set([
  'hero_slider',
  'featured_news_slider',
])

function pxNum(v, fallback = 0, max = 240) {
  if (typeof v === 'string' && LEGACY_SPACE[v] != null) return LEGACY_SPACE[v]
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function radiusNum(v, fallback = 0) {
  if (typeof v === 'string' && LEGACY_RADIUS[v] != null) return LEGACY_RADIUS[v]
  return pxNum(v, fallback, 64)
}

function pickViewportSlice(obj = {}) {
  const out = {}
  SLIDER_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

function applyLegacyMigrations(src, s) {
  if (src.padding_top === undefined && src.padding_y != null) {
    const py = pxNum(src.padding_y, 0)
    s.padding_top = py
    s.padding_bottom = py
  }
  if (src.padding_left === undefined && src.padding_x != null) {
    const px = pxNum(src.padding_x, 0)
    s.padding_left = px
    s.padding_right = px
  }
  if (src.margin_top === undefined && src.margin_y != null) {
    const my = pxNum(src.margin_y, 0)
    s.margin_top = my
    s.margin_bottom = my
  }
  const legacyRadius =
    src.radius_px !== undefined
      ? radiusNum(src.radius_px, 0)
      : src.radius != null
        ? radiusNum(src.radius, 0)
        : null

  if (
    legacyRadius != null &&
    src.radius_top_left === undefined &&
    src.radius_top_right === undefined &&
    src.radius_bottom_right === undefined &&
    src.radius_bottom_left === undefined
  ) {
    s.radius_top_left = legacyRadius
    s.radius_top_right = legacyRadius
    s.radius_bottom_right = legacyRadius
    s.radius_bottom_left = legacyRadius
  }
  return s
}

/**
 * دسکتاپ و موبایل کاملاً جدا هستند.
 * موبایل از desktop ارث نمی‌برد؛ فقط اگر هنوز هیچ کلید موبایلی نباشد
 * موقتاً همان ظاهر دسکتاپ را نشان می‌دهد تا اولین ویرایش موبایل اسنپ‌شات بسازد.
 */
export function mergeSliderViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const migrated = applyLegacyMigrations(root, { ...root })
  const flat = pickViewportSlice(migrated)
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

function coerceSliderSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_SLIDER_WIDGET_SETTINGS, ...merged }

  s.autoplay = merged.autoplay === undefined ? true : !!merged.autoplay
  s.show_arrows = merged.show_arrows === undefined ? true : !!merged.show_arrows
  s.show_dots = merged.show_dots === undefined ? true : !!merged.show_dots
  s.show_caption =
    merged.show_caption === undefined ? true : !!merged.show_caption
  s.swipe_drag = merged.swipe_drag === undefined ? true : !!merged.swipe_drag
  s.full_bleed = merged.full_bleed === undefined ? true : !!merged.full_bleed

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  const ms = Number(s.autoplay_ms)
  s.autoplay_ms = [3000, 5000, 8000].includes(ms) ? ms : 5000

  if (!SLIDER_HEIGHTS.some((h) => h.id === s.height)) {
    s.height = 'md'
  }
  if (!SLIDER_DOTS_PLACES.some((p) => p.id === s.dots_place)) {
    s.dots_place = 'overlay'
  }

  s.dots_shadow =
    merged.dots_shadow === undefined
      ? DEFAULT_SLIDER_WIDGET_SETTINGS.dots_shadow
      : !!merged.dots_shadow

  ;[
    'dots_bg',
    'dots_border_color',
    'dots_shadow_color',
    'dots_dot_color',
    'dots_dot_hover',
    'dots_dot_active',
    'dots_progress_from',
    'dots_progress_to',
  ].forEach((k) => {
    s[k] = colorStr(s[k]) || DEFAULT_SLIDER_WIDGET_SETTINGS[k]
  })

  s.dots_border_width = Math.min(
    8,
    pxNum(s.dots_border_width, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_border_width, 8)
  )
  s.dots_radius = Math.min(
    999,
    pxNum(s.dots_radius, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_radius, 999)
  )
  s.dots_pad_y = Math.min(
    32,
    pxNum(s.dots_pad_y, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_pad_y, 32)
  )
  s.dots_pad_x = Math.min(
    48,
    pxNum(s.dots_pad_x, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_pad_x, 48)
  )
  s.dots_gap = Math.min(
    32,
    pxNum(s.dots_gap, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_gap, 32)
  )
  s.dots_blur = Math.min(
    40,
    pxNum(s.dots_blur, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_blur, 40)
  )
  s.dots_shadow_blur = Math.min(
    48,
    pxNum(s.dots_shadow_blur, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_shadow_blur, 48)
  )
  s.dots_shadow_y = Math.min(
    40,
    pxNum(s.dots_shadow_y, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_shadow_y, 40)
  )
  s.dots_margin_top = Math.min(
    64,
    pxNum(s.dots_margin_top, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_margin_top, 64)
  )
  s.dots_dot_size = Math.min(
    24,
    Math.max(
      4,
      pxNum(s.dots_dot_size, DEFAULT_SLIDER_WIDGET_SETTINGS.dots_dot_size, 24)
    )
  )
  s.dots_dot_active_width = Math.min(
    64,
    Math.max(
      s.dots_dot_size,
      pxNum(
        s.dots_dot_active_width,
        DEFAULT_SLIDER_WIDGET_SETTINGS.dots_dot_active_width,
        64
      )
    )
  )

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
    s[k] = pxNum(s[k], DEFAULT_SLIDER_WIDGET_SETTINGS[k])
  })

  ;[
    'radius_top_left',
    'radius_top_right',
    'radius_bottom_right',
    'radius_bottom_left',
  ].forEach((k) => {
    s[k] = radiusNum(s[k], 0)
  })

  return s
}

/**
 * @param {object} raw
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeSliderWidgetSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeSliderViewportRaw(root, viewport)
  return coerceSliderSettings(merged, root)
}

export function getSliderVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotSliderViewportSettings(raw = {}, viewport = 'desktop') {
  return pickViewportSlice(normalizeSliderWidgetSettings(raw, { viewport }))
}

/**
 * هر ویرایش، اسنپ‌شات کامل همان ویوپورت را می‌نویسد تا دسکتاپ و موبایل
 * بعد از اولین تغییر کاملاً از هم جدا بمانند (بدون نشت از طریق کلیدهای تخت).
 */
export function buildSliderViewportPatch(raw, device, key, value) {
  if (SLIDER_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotSliderViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

/**
 * @param {object} settings
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function sliderWidgetCssVars(settings, opts = {}) {
  const s = normalizeSliderWidgetSettings(settings || {}, opts)
  const fullBleed = s.full_bleed !== false
  const dotsShadow = s.dots_shadow
    ? `0 ${s.dots_shadow_y}px ${s.dots_shadow_blur}px ${s.dots_shadow_color}`
    : 'none'
  return {
    '--slider-pt': `${s.padding_top}px`,
    '--slider-pr': `${s.padding_right}px`,
    '--slider-pb': `${s.padding_bottom}px`,
    '--slider-pl': `${s.padding_left}px`,
    '--slider-mt': `${s.margin_top}px`,
    '--slider-mr': fullBleed ? '0px' : `${s.margin_right}px`,
    '--slider-mb': `${s.margin_bottom}px`,
    '--slider-ml': fullBleed ? '0px' : `${s.margin_left}px`,
    '--slider-tl': `${s.radius_top_left}px`,
    '--slider-tr': `${s.radius_top_right}px`,
    '--slider-br': `${s.radius_bottom_right}px`,
    '--slider-bl': `${s.radius_bottom_left}px`,
    '--slider-dots-bg': s.dots_bg,
    '--slider-dots-bc': s.dots_border_color,
    '--slider-dots-bw': `${s.dots_border_width}px`,
    '--slider-dots-radius': `${s.dots_radius}px`,
    '--slider-dots-py': `${s.dots_pad_y}px`,
    '--slider-dots-px': `${s.dots_pad_x}px`,
    '--slider-dots-gap': `${s.dots_gap}px`,
    '--slider-dots-blur': `${s.dots_blur}px`,
    '--slider-dots-shadow': dotsShadow,
    '--slider-dots-mt': `${s.dots_margin_top}px`,
    '--slider-dot-color': s.dots_dot_color,
    '--slider-dot-hover': s.dots_dot_hover,
    '--slider-dot-active': s.dots_dot_active,
    '--slider-dot-progress-from': s.dots_progress_from,
    '--slider-dot-progress-to': s.dots_progress_to,
    '--slider-dot-size': `${s.dots_dot_size}px`,
    '--slider-dot-active-w': `${s.dots_dot_active_width}px`,
  }
}

export function isSliderWidgetType(type) {
  return SLIDER_WIDGET_TYPES.has(type)
}
