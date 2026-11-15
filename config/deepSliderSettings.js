// config/deepSliderSettings.js — تنظیمات ویجت اسلایدر عمیق (ماسک مایع)

export const DEEP_SLIDER_TYPE = 'deep_slider'

/** ویجت‌هایی که باید از داخل ماسک REBO دیده شوند (انیمیشن ربو و مشابه) */
export const DEEP_REVEAL_UNDER_TYPES = ['rebo_usecases', 'school_animation']

/** منبع لایه زیر کلمه REBO */
export const DEEP_UNDER_SOURCES = [
  { id: 'media', label: 'تصویر / ویدیو' },
  { id: 'school_animation', label: 'انیمیشن مدرسه' },
  { id: 'rebo_usecases', label: 'انیمیشن ربو' },
]

export function isDeepSliderWidgetType(type) {
  return String(type || '') === DEEP_SLIDER_TYPE
}

export function isDeepRevealUnderType(type) {
  return DEEP_REVEAL_UNDER_TYPES.includes(String(type || ''))
}

/** آیا اسلایدر عمیق باید با ویجت زیر جفت شود؟ */
export function shouldDeepRevealPair(deepSettings, underType) {
  const mode = String(
    deepSettings?.under_source || DEEP_SLIDER_DEFAULTS.under_source,
  )
  if (mode === 'media') return false
  if (mode === 'school_animation') return underType === 'school_animation'
  if (mode === 'rebo_usecases') return underType === 'rebo_usecases'
  return isDeepRevealUnderType(underType)
}

export const DEEP_SLIDER_DEFAULTS = {
  title: 'اسلایدر عمیق',
  subtitle: 'داستان برند را با حرکت و عمق روایت کنید',
  scroll_hint: 'به پایین بروید',
  brand: 'REBO',
  mask_text: 'REBO',
  cta_label: 'شروع همکاری',
  cta_href: '/contact',
  show_brand: false,
  show_title: false,
  show_subtitle: false,
  show_scroll_hint: true,
  show_cta: false,
  show_progress: true,
  scroll_vh: 420,
  invert_at: 0.72,
  feather: 8,
  blob_start: 0.47,
  // زوم نهایی باید حروف را از صفحه بیرون بزند
  blob_end: 16,
  letter_spacing: 0.14,
  // لایهٔ رویی هنگام نمایش کلمه
  overlay_start: '#080808',
  // آسمان (بالای صحنه) و کرم (پایین) — با اسکرول یکی می‌شوند
  sky_color: '#c8d2db',
  cream_color: '#e6d4b0',
  overlay_end: '#c8d2db',
  mouse_follow: true,
  auto_demo: true,
  full_bleed: true,
  // media | school_animation | rebo_usecases
  under_source: 'media',
  // مدیا زیر کلمه REBO (تصویر یا ویدیو تمام‌صفحه)
  under_media_src: '',
  under_media_kind: 'image', // image | video
  under_media_fit: 'cover', // cover | contain
  slides: [],
  show_on_mobile: true,
  show_on_desktop: true,
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function flag(raw, key, fallback) {
  if (raw[key] === true || raw[key] === false) return raw[key]
  return fallback
}

function normalizeColor(value, fallback) {
  const v = String(value || '').trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v
  if (/^rgba?\(/i.test(v)) return v
  return fallback
}

export function parseDeepSliderColor(value, fallback = { r: 8, g: 8, b: 8 }) {
  const v = String(value || '').trim()
  const hex6 = v.match(/^#([0-9a-f]{6})$/i)
  if (hex6) {
    const n = parseInt(hex6[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const hex3 = v.match(/^#([0-9a-f]{3})$/i)
  if (hex3) {
    const [a, b, c] = hex3[1].split('')
    const n = parseInt(`${a}${a}${b}${b}${c}${c}`, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const rgb = v.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  )
  if (rgb) {
    return {
      r: clamp(Number(rgb[1]) || 0, 0, 255),
      g: clamp(Number(rgb[2]) || 0, 0, 255),
      b: clamp(Number(rgb[3]) || 0, 0, 255),
    }
  }
  return fallback
}

function normalizeSlide(raw, index = 0) {
  const row = raw && typeof raw === 'object' ? raw : {}
  const src = String(row.src || row.url || row.image || '').trim()
  if (!src) return null
  const kind =
    row.kind === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(src)
      ? 'video'
      : 'image'
  return {
    id: String(row.id || `slide_${index + 1}`),
    src,
    kind,
    x: clamp(Number(row.x ?? 10 + (index % 3) * 28) || 10, 0, 90),
    y: clamp(Number(row.y ?? 8 + Math.floor(index / 2) * 36) || 8, 0, 90),
    w: clamp(Number(row.w ?? 34) || 34, 12, 90),
    h: clamp(Number(row.h ?? 36) || 36, 12, 90),
  }
}

function normalizeUnderMedia(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}
  let src = String(
    s.under_media_src || s.under_src || s.media_src || '',
  ).trim()
  // سازگاری با اسلایدهای قدیمی: اولین اسلاید
  if (!src && Array.isArray(s.slides) && s.slides[0]) {
    src = String(s.slides[0].src || s.slides[0].url || '').trim()
  }
  if (!src) {
    return {
      under_media_src: '',
      under_media_kind: 'image',
      under_media_fit: 'cover',
    }
  }
  const kindRaw = String(s.under_media_kind || s.under_kind || '').toLowerCase()
  let kind = 'image'
  if (kindRaw === 'video' || kindRaw === 'image') kind = kindRaw
  else if (s.slides?.[0]?.kind === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(src))
    kind = 'video'
  const fit =
    String(s.under_media_fit || s.under_fit || 'cover').toLowerCase() ===
    'contain'
      ? 'contain'
      : 'cover'
  return {
    under_media_src: src,
    under_media_kind: kind,
    under_media_fit: fit,
  }
}

export function normalizeDeepSliderSettings(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const d = DEEP_SLIDER_DEFAULTS
  const slides = Array.isArray(s.slides)
    ? s.slides.map(normalizeSlide).filter(Boolean)
    : []
  const under = normalizeUnderMedia(s)
  return {
    ...d,
    ...s,
    title: String(s.title ?? d.title),
    subtitle: String(s.subtitle ?? d.subtitle),
    scroll_hint: String(s.scroll_hint ?? d.scroll_hint),
    brand: String(s.brand ?? d.brand),
    mask_text: String(s.mask_text ?? s.brand ?? d.mask_text).trim() || 'REBO',
    cta_label: String(s.cta_label ?? d.cta_label),
    cta_href: String(s.cta_href ?? d.cta_href),
    show_brand: flag(s, 'show_brand', d.show_brand),
    show_title: flag(s, 'show_title', d.show_title),
    show_subtitle: flag(s, 'show_subtitle', d.show_subtitle),
    show_scroll_hint: flag(s, 'show_scroll_hint', d.show_scroll_hint),
    show_cta: flag(s, 'show_cta', d.show_cta),
    show_progress: flag(s, 'show_progress', d.show_progress),
    scroll_vh: clamp(Number(s.scroll_vh ?? 420) || 420, 140, 620),
    invert_at: clamp(Number(s.invert_at ?? 0.72) || 0.72, 0.15, 0.9),
    feather: clamp(
      Number(
        s.feather != null && Number(s.feather) > 40 ? 8 : s.feather ?? 8,
      ) || 8,
      0,
      48,
    ),
    // blob_start = نسبت عرض نوشته به عرض صفحه در حالت اول
    // blob_end = ضریب زوم تا بیرون‌زدن حروف از صفحه
    ...(() => {
      let start = Number(s.blob_start)
      let end = Number(s.blob_end)
      if (!Number.isFinite(start)) start = 0.47
      else if (start >= 0.85) start = 0.47
      // مقادیر قدیمی کوچک (< ۵) → زوم واقعی برای پر کردن صفحه
      if (!Number.isFinite(end) || end < 5) end = 16
      return {
        blob_start: clamp(start, 0.28, 1.05),
        blob_end: clamp(end, 5, 32),
      }
    })(),
    letter_spacing: clamp(
      Number(
        s.letter_spacing != null ? s.letter_spacing : d.letter_spacing,
      ) || d.letter_spacing,
      -0.08,
      0.4,
    ),
    overlay_start: normalizeColor(s.overlay_start, d.overlay_start),
    sky_color: normalizeColor(s.sky_color, d.sky_color),
    cream_color: normalizeColor(s.cream_color, d.cream_color),
    overlay_end: normalizeColor(
      s.overlay_end ?? s.sky_color,
      d.overlay_end,
    ),
    mouse_follow: flag(s, 'mouse_follow', d.mouse_follow),
    auto_demo: flag(s, 'auto_demo', d.auto_demo),
    full_bleed: flag(s, 'full_bleed', d.full_bleed),
    under_source: (() => {
      const mode = String(s.under_source || d.under_source || 'media')
      if (
        mode === 'media' ||
        mode === 'school_animation' ||
        mode === 'rebo_usecases'
      ) {
        return mode
      }
      return 'media'
    })(),
    ...under,
    slides: slides,
    show_on_mobile: flag(s, 'show_on_mobile', d.show_on_mobile),
    show_on_desktop: flag(s, 'show_on_desktop', d.show_on_desktop),
  }
}

export function createDefaultDeepSliderSettings() {
  return normalizeDeepSliderSettings({})
}
