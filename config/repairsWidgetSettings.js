// config/repairsWidgetSettings.js — ویجت‌های ماژول تعمیرات (دسکتاپ / موبایل جدا)

export const REPAIRS_WIDGET_TYPES = new Set([
  'repairs_cta',
  'repairs_technicians',
  'repairs_services',
  'repairs_request',
  'repairs_track',
])

export const REPAIRS_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const REPAIRS_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const REPAIRS_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const REPAIRS_COLUMNS = [
  { id: 2, label: '۲ ستون' },
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
  { id: 5, label: '۵ ستون' },
]

export const REPAIRS_CTA_LAYOUTS = [
  { id: 'row', label: 'ردیفی' },
  { id: 'stack', label: 'ستونی' },
]

export const REPAIRS_CTA_BG_MODES = [
  { id: 'solid', label: 'رنگ ثابت' },
  { id: 'gradient', label: 'گرادیان' },
  { id: 'transparent', label: 'شفاف' },
]

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

function pickKeys(obj = {}, keys = []) {
  const out = {}
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

function mergeViewport(raw, viewport, viewportKeys) {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickKeys(root, viewportKeys)
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

function applySpace(s, defaults) {
  REPAIRS_SPACE_FIELDS.concat(REPAIRS_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], defaults[key], max)
  })
}

function applyVisibility(s, rawRoot) {
  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop
}

function applySharedStrings(s, rawRoot, sharedKeys) {
  sharedKeys.forEach((k) => {
    if (k === 'show_on_mobile' || k === 'show_on_desktop') return
    if (rawRoot[k] !== undefined) s[k] = String(rawRoot[k] ?? '').trim()
    else s[k] = String(s[k] ?? '').trim()
  })
}

function applyBools(s, merged, defaults, keys) {
  keys.forEach((k) => {
    if (merged[k] === undefined) s[k] = defaults[k]
    else s[k] = !!merged[k]
  })
}

function applyColors(s, defaults, colorFields) {
  colorFields.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || defaults[key]
  })
}

function buildViewportPatch(raw, device, key, value, sharedKeys, snapshotFn) {
  if (sharedKeys.has(key)) return { [key]: value }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotFn(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function isRepairsWidgetType(type) {
  return REPAIRS_WIDGET_TYPES.has(String(type || ''))
}

export function getRepairsVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

/* ─── CTA ─── */

export const REPAIRS_CTA_COLORS = [
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

export const REPAIRS_CTA_VIEWPORT_KEYS = [
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
  ...REPAIRS_CTA_COLORS.map((f) => f.key),
]

export const REPAIRS_CTA_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'title',
  'subtitle',
  'primary_label',
  'secondary_label',
  'primary_href',
  'secondary_href',
])

export const DEFAULT_REPAIRS_CTA_SETTINGS = {
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
  title: 'درخواست تعمیر و سرویس',
  subtitle: 'ثبت درخواست، اعزام سرویسکار و پرداخت مرحله‌ای',
  primary_label: 'ثبت درخواست',
  secondary_label: 'پیگیری سفارش',
  primary_href: '/repairs',
  secondary_href: '/repairs#track',
  bg_solid: '#8F7000',
  bg_from: '#3d3200',
  bg_mid: '#8F7000',
  bg_to: '#5c4a00',
  glow: 'rgba(219, 190, 0, 0.32)',
  text_color: '#fff8e7',
  muted_color: 'rgba(255, 248, 231, 0.88)',
  icon_bg: 'rgba(219, 190, 0, 0.18)',
  icon_color: '#dbbe00',
  primary_bg: '#dbbe00',
  primary_text: '#1c1c1e',
  secondary_bg: 'transparent',
  secondary_border: 'rgba(255, 248, 231, 0.35)',
  secondary_text: '#fff8e7',
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

function coerceCta(merged, rawRoot = {}) {
  const d = DEFAULT_REPAIRS_CTA_SETTINGS
  const s = { ...d, ...merged }
  applyVisibility(s, rawRoot)
  applyBools(s, merged, d, [
    'show_icon',
    'show_glow',
    'show_primary',
    'show_secondary',
    'section_full',
    'band_shadow',
  ])
  if (!REPAIRS_CTA_LAYOUTS.some((l) => l.id === s.layout)) s.layout = 'row'
  if (merged.bg_mode == null) {
    s.bg_mode = merged.bg_solid != null ? 'solid' : 'gradient'
  } else if (!REPAIRS_CTA_BG_MODES.some((m) => m.id === s.bg_mode)) {
    s.bg_mode = 'gradient'
  }
  applySharedStrings(s, rawRoot, REPAIRS_CTA_SHARED_ROOT_KEYS)
  REPAIRS_CTA_COLORS.forEach(({ key }) => {
    const parsed = colorStr(s[key])
    if (parsed) s[key] = parsed
    else if (key === 'bg_solid') {
      s[key] = colorStr(s.bg_mid) || d.bg_solid
    } else {
      s[key] = d[key]
    }
  })
  s.title_size = Math.max(16, Math.min(42, pxNum(s.title_size, 24, 42)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.band_radius = Math.min(40, pxNum(s.band_radius, 20, 40))
  s.band_padding_y = Math.min(64, pxNum(s.band_padding_y, 22, 64))
  s.band_padding_x = Math.min(64, pxNum(s.band_padding_x, 20, 64))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))
  applySpace(s, d)
  return s
}

export function normalizeRepairsCtaSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceCta(mergeViewport(root, viewport, REPAIRS_CTA_VIEWPORT_KEYS), root)
}

export function snapshotRepairsCtaViewportSettings(raw = {}, viewport = 'desktop') {
  return pickKeys(normalizeRepairsCtaSettings(raw, { viewport }), REPAIRS_CTA_VIEWPORT_KEYS)
}

export function buildRepairsCtaViewportPatch(raw, device, key, value) {
  return buildViewportPatch(
    raw,
    device,
    key,
    value,
    REPAIRS_CTA_SHARED_ROOT_KEYS,
    snapshotRepairsCtaViewportSettings,
  )
}

export function repairsCtaCssVars(settings, opts = {}) {
  const s = normalizeRepairsCtaSettings(settings || {}, opts)
  return {
    '--rpc-pt': `${s.padding_top}px`,
    '--rpc-pr': `${s.padding_right}px`,
    '--rpc-pb': `${s.padding_bottom}px`,
    '--rpc-pl': `${s.padding_left}px`,
    '--rpc-mt': `${s.margin_top}px`,
    '--rpc-mr': `${s.margin_right}px`,
    '--rpc-mb': `${s.margin_bottom}px`,
    '--rpc-ml': `${s.margin_left}px`,
    '--rpc-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--rpc-band-py': `${s.band_padding_y}px`,
    '--rpc-band-px': `${s.band_padding_x}px`,
    '--rpc-radius': `${s.band_radius}px`,
    '--rpc-title-size': `${s.title_size}px`,
    '--rpc-sub-size': `${s.subtitle_size}px`,
    '--rpc-bg-solid': s.bg_solid || s.bg_mid,
    '--rpc-bg-from': s.bg_from,
    '--rpc-bg-mid': s.bg_mid,
    '--rpc-bg-to': s.bg_to,
    '--rpc-glow': s.glow,
    '--rpc-text': s.text_color,
    '--rpc-muted': s.muted_color,
    '--rpc-icon-bg': s.icon_bg,
    '--rpc-icon': s.icon_color,
    '--rpc-pri-bg': s.primary_bg,
    '--rpc-pri-text': s.primary_text,
    '--rpc-sec-bg': s.secondary_bg,
    '--rpc-sec-border': s.secondary_border,
    '--rpc-sec-text': s.secondary_text,
    '--rpc-shadow': s.band_shadow
      ? '0 16px 40px rgba(60, 45, 0, 0.28)'
      : 'none',
  }
}

/* ─── Technicians ─── */

export const REPAIRS_TECH_COLORS = [
  { key: 'ink', label: 'متن عنوان' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'card_bg', label: 'پس‌زمینه کارت' },
  { key: 'card_border', label: 'حاشیه کارت' },
  { key: 'avatar_from', label: 'آواتار — از' },
  { key: 'avatar_to', label: 'آواتار — تا' },
  { key: 'avatar_text', label: 'متن آواتار' },
]

export const REPAIRS_TECH_VIEWPORT_KEYS = [
  'columns',
  'card_min',
  'gap',
  'show_eyebrow',
  'show_specialty',
  'show_city',
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
  ...REPAIRS_TECH_COLORS.map((f) => f.key),
]

export const REPAIRS_TECH_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'limit',
])

export const DEFAULT_REPAIRS_TECH_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  columns: 4,
  card_min: 140,
  gap: 12,
  show_eyebrow: true,
  show_specialty: true,
  show_city: true,
  show_avatar: true,
  card_lift: true,
  section_full: false,
  eyebrow_text: 'تیم سرویس',
  title: 'تعمیرکاران ما',
  subtitle: '',
  limit: 12,
  ink: '#1c1917',
  muted: '#78716c',
  eyebrow_color: '#b45309',
  card_bg: '#fafaf9',
  card_border: 'rgba(28, 25, 23, 0.1)',
  avatar_from: '#fbbf24',
  avatar_to: '#b45309',
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

function coerceTech(merged, rawRoot = {}) {
  const s = { ...DEFAULT_REPAIRS_TECH_SETTINGS, ...merged }
  applyVisibility(s, rawRoot)
  applyBools(s, merged, DEFAULT_REPAIRS_TECH_SETTINGS, [
    'show_eyebrow',
    'show_specialty',
    'show_city',
    'show_avatar',
    'card_lift',
    'section_full',
  ])
  const cols = Number(s.columns)
  s.columns = REPAIRS_COLUMNS.some((c) => c.id === cols) ? cols : 4
  applySharedStrings(s, rawRoot, REPAIRS_TECH_SHARED_ROOT_KEYS)
  s.limit = Math.max(
    1,
    Math.min(
      48,
      pxNum(
        rawRoot.limit !== undefined ? rawRoot.limit : s.limit,
        DEFAULT_REPAIRS_TECH_SETTINGS.limit,
        48,
      ),
    ),
  )
  applyColors(s, DEFAULT_REPAIRS_TECH_SETTINGS, REPAIRS_TECH_COLORS)
  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.name_size = Math.max(12, Math.min(22, pxNum(s.name_size, 14, 22)))
  s.card_radius = Math.min(28, pxNum(s.card_radius, 16, 28))
  s.card_padding = Math.min(32, pxNum(s.card_padding, 16, 32))
  s.card_min = Math.max(100, Math.min(280, pxNum(s.card_min, 140, 280)))
  s.gap = Math.min(32, pxNum(s.gap, 12, 32))
  s.avatar_size = Math.max(36, Math.min(96, pxNum(s.avatar_size, 52, 96)))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))
  applySpace(s, DEFAULT_REPAIRS_TECH_SETTINGS)
  return s
}

export function normalizeRepairsTechSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceTech(mergeViewport(root, viewport, REPAIRS_TECH_VIEWPORT_KEYS), root)
}

export function snapshotRepairsTechViewportSettings(raw = {}, viewport = 'desktop') {
  return pickKeys(normalizeRepairsTechSettings(raw, { viewport }), REPAIRS_TECH_VIEWPORT_KEYS)
}

export function buildRepairsTechViewportPatch(raw, device, key, value) {
  return buildViewportPatch(
    raw,
    device,
    key,
    value,
    REPAIRS_TECH_SHARED_ROOT_KEYS,
    snapshotRepairsTechViewportSettings,
  )
}

export function repairsTechCssVars(settings, opts = {}) {
  const s = normalizeRepairsTechSettings(settings || {}, opts)
  return {
    '--rpt-pt': `${s.padding_top}px`,
    '--rpt-pr': `${s.padding_right}px`,
    '--rpt-pb': `${s.padding_bottom}px`,
    '--rpt-pl': `${s.padding_left}px`,
    '--rpt-mt': `${s.margin_top}px`,
    '--rpt-mr': `${s.margin_right}px`,
    '--rpt-mb': `${s.margin_bottom}px`,
    '--rpt-ml': `${s.margin_left}px`,
    '--rpt-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--rpt-cols': String(s.columns),
    '--rpt-card-min': `${s.card_min}px`,
    '--rpt-gap': `${s.gap}px`,
    '--rpt-title-size': `${s.title_size}px`,
    '--rpt-sub-size': `${s.subtitle_size}px`,
    '--rpt-name-size': `${s.name_size}px`,
    '--rpt-card-radius': `${s.card_radius}px`,
    '--rpt-card-pad': `${s.card_padding}px`,
    '--rpt-avatar': `${s.avatar_size}px`,
    '--rpt-ink': s.ink,
    '--rpt-muted': s.muted,
    '--rpt-eyebrow': s.eyebrow_color,
    '--rpt-card-bg': s.card_bg,
    '--rpt-card-border': s.card_border,
    '--rpt-avatar-from': s.avatar_from,
    '--rpt-avatar-to': s.avatar_to,
    '--rpt-avatar-text': s.avatar_text,
  }
}

/* ─── Services / labor rates ─── */

export const REPAIRS_SVC_COLORS = [
  { key: 'ink', label: 'متن عنوان' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'accent', label: 'اکسنت' },
  { key: 'accent_deep', label: 'اکسنت تیره' },
  { key: 'card_bg', label: 'پس‌زمینه کارت' },
  { key: 'card_border', label: 'حاشیه کارت' },
  { key: 'cta_color', label: 'لینک CTA' },
]

export const REPAIRS_SVC_VIEWPORT_KEYS = [
  'columns',
  'card_min',
  'gap',
  'show_eyebrow',
  'show_price',
  'show_unit',
  'show_desc',
  'show_cta',
  'show_dot',
  'card_lift',
  'section_full',
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
  ...REPAIRS_SVC_COLORS.map((f) => f.key),
]

export const REPAIRS_SVC_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'cta_label',
  'link_base',
  'limit',
])

export const DEFAULT_REPAIRS_SVC_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  columns: 3,
  card_min: 168,
  gap: 12,
  show_eyebrow: true,
  show_price: true,
  show_unit: true,
  show_desc: true,
  show_cta: true,
  show_dot: true,
  card_lift: true,
  section_full: false,
  eyebrow_text: 'اجرت‌ها',
  title: 'خدمات و اجرت تعمیر',
  subtitle: 'فهرست خدمات از پیش تعریف‌شده',
  cta_label: 'درخواست سرویس',
  link_base: '/repairs',
  limit: 12,
  ink: '#1c1917',
  muted: '#78716c',
  eyebrow_color: '#0369a1',
  accent: '#b45309',
  accent_deep: '#92400e',
  card_bg: '#ffffff',
  card_border: 'rgba(28, 25, 23, 0.1)',
  cta_color: '#0369a1',
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

function coerceSvc(merged, rawRoot = {}) {
  const s = { ...DEFAULT_REPAIRS_SVC_SETTINGS, ...merged }
  applyVisibility(s, rawRoot)
  applyBools(s, merged, DEFAULT_REPAIRS_SVC_SETTINGS, [
    'show_eyebrow',
    'show_price',
    'show_unit',
    'show_desc',
    'show_cta',
    'show_dot',
    'card_lift',
    'section_full',
  ])
  const cols = Number(s.columns)
  s.columns = REPAIRS_COLUMNS.some((c) => c.id === cols) ? cols : 3
  applySharedStrings(s, rawRoot, REPAIRS_SVC_SHARED_ROOT_KEYS)
  if (!s.link_base) s.link_base = '/repairs'
  s.limit = Math.max(
    1,
    Math.min(
      48,
      pxNum(
        rawRoot.limit !== undefined ? rawRoot.limit : s.limit,
        DEFAULT_REPAIRS_SVC_SETTINGS.limit,
        48,
      ),
    ),
  )
  applyColors(s, DEFAULT_REPAIRS_SVC_SETTINGS, REPAIRS_SVC_COLORS)
  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.card_radius = Math.min(28, pxNum(s.card_radius, 16, 28))
  s.card_padding = Math.min(32, pxNum(s.card_padding, 16, 32))
  s.card_min = Math.max(120, Math.min(280, pxNum(s.card_min, 168, 280)))
  s.gap = Math.min(32, pxNum(s.gap, 12, 32))
  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, 1100, 1400)))
  applySpace(s, DEFAULT_REPAIRS_SVC_SETTINGS)
  return s
}

export function normalizeRepairsSvcSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceSvc(mergeViewport(root, viewport, REPAIRS_SVC_VIEWPORT_KEYS), root)
}

export function snapshotRepairsSvcViewportSettings(raw = {}, viewport = 'desktop') {
  return pickKeys(normalizeRepairsSvcSettings(raw, { viewport }), REPAIRS_SVC_VIEWPORT_KEYS)
}

export function buildRepairsSvcViewportPatch(raw, device, key, value) {
  return buildViewportPatch(
    raw,
    device,
    key,
    value,
    REPAIRS_SVC_SHARED_ROOT_KEYS,
    snapshotRepairsSvcViewportSettings,
  )
}

export function repairsSvcCssVars(settings, opts = {}) {
  const s = normalizeRepairsSvcSettings(settings || {}, opts)
  return {
    '--rps-pt': `${s.padding_top}px`,
    '--rps-pr': `${s.padding_right}px`,
    '--rps-pb': `${s.padding_bottom}px`,
    '--rps-pl': `${s.padding_left}px`,
    '--rps-mt': `${s.margin_top}px`,
    '--rps-mr': `${s.margin_right}px`,
    '--rps-mb': `${s.margin_bottom}px`,
    '--rps-ml': `${s.margin_left}px`,
    '--rps-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--rps-cols': String(s.columns),
    '--rps-card-min': `${s.card_min}px`,
    '--rps-gap': `${s.gap}px`,
    '--rps-title-size': `${s.title_size}px`,
    '--rps-sub-size': `${s.subtitle_size}px`,
    '--rps-card-radius': `${s.card_radius}px`,
    '--rps-card-pad': `${s.card_padding}px`,
    '--rps-ink': s.ink,
    '--rps-muted': s.muted,
    '--rps-eyebrow': s.eyebrow_color,
    '--rps-accent': s.accent,
    '--rps-accent-deep': s.accent_deep,
    '--rps-card-bg': s.card_bg,
    '--rps-card-border': s.card_border,
    '--rps-cta': s.cta_color,
  }
}

/* ─── Request form ─── */

export const REPAIRS_REQ_COLORS = [
  { key: 'accent', label: 'اکسنت' },
  { key: 'accent_deep', label: 'اکسنت تیره' },
  { key: 'ink', label: 'متن' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'panel_from', label: 'پنل — از' },
  { key: 'panel_to', label: 'پنل — تا' },
  { key: 'panel_border', label: 'حاشیه پنل' },
  { key: 'input_bg', label: 'پس‌زمینه ورودی' },
  { key: 'input_border', label: 'حاشیه ورودی' },
  { key: 'button_from', label: 'دکمه — از' },
  { key: 'button_to', label: 'دکمه — تا' },
  { key: 'button_text', label: 'متن دکمه' },
]

export const REPAIRS_REQ_VIEWPORT_KEYS = [
  'density',
  'show_panel',
  'show_eyebrow',
  'show_deposit_hint',
  'show_brand_fields',
  'show_serial',
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
  ...REPAIRS_REQ_COLORS.map((f) => f.key),
]

export const REPAIRS_REQ_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'submit_label',
  'success_hint',
])

export const DEFAULT_REPAIRS_REQ_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  density: 'comfortable',
  show_panel: true,
  show_eyebrow: true,
  show_deposit_hint: true,
  show_brand_fields: true,
  show_serial: true,
  panel_shadow: true,
  section_full: false,
  eyebrow_text: 'سرویس',
  title: 'درخواست تعمیر',
  subtitle: 'اطلاعات دستگاه و آدرس را وارد کنید',
  submit_label: 'ثبت درخواست',
  success_hint: 'لینک پیگیری را نگه دارید و پیش‌پرداخت را انجام دهید.',
  accent: '#b45309',
  accent_deep: '#92400e',
  ink: '#1c1917',
  muted: '#78716c',
  panel_from: '#fffbeb',
  panel_to: '#ffffff',
  panel_border: 'rgba(180, 83, 9, 0.14)',
  input_bg: '#ffffff',
  input_border: 'rgba(28, 25, 23, 0.12)',
  button_from: '#b45309',
  button_to: '#92400e',
  button_text: '#ffffff',
  title_size: 22,
  subtitle_size: 14,
  panel_radius: 18,
  input_radius: 12,
  button_radius: 12,
  panel_padding: 18,
  max_width: 640,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 16,
  padding_left: 0,
  margin_top: 12,
  margin_right: 0,
  margin_bottom: 24,
  margin_left: 0,
}

function coerceReq(merged, rawRoot = {}) {
  const s = { ...DEFAULT_REPAIRS_REQ_SETTINGS, ...merged }
  applyVisibility(s, rawRoot)
  applyBools(s, merged, DEFAULT_REPAIRS_REQ_SETTINGS, [
    'show_panel',
    'show_eyebrow',
    'show_deposit_hint',
    'show_brand_fields',
    'show_serial',
    'panel_shadow',
    'section_full',
  ])
  if (!['comfortable', 'compact'].includes(s.density)) s.density = 'comfortable'
  applySharedStrings(s, rawRoot, REPAIRS_REQ_SHARED_ROOT_KEYS)
  applyColors(s, DEFAULT_REPAIRS_REQ_SETTINGS, REPAIRS_REQ_COLORS)
  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.panel_radius = Math.min(32, pxNum(s.panel_radius, 18, 32))
  s.input_radius = Math.min(24, pxNum(s.input_radius, 12, 24))
  s.button_radius = Math.min(24, pxNum(s.button_radius, 12, 24))
  s.panel_padding = Math.min(40, pxNum(s.panel_padding, 18, 40))
  s.max_width = Math.max(320, Math.min(900, pxNum(s.max_width, 640, 900)))
  applySpace(s, DEFAULT_REPAIRS_REQ_SETTINGS)
  return s
}

export function normalizeRepairsReqSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceReq(mergeViewport(root, viewport, REPAIRS_REQ_VIEWPORT_KEYS), root)
}

export function snapshotRepairsReqViewportSettings(raw = {}, viewport = 'desktop') {
  return pickKeys(normalizeRepairsReqSettings(raw, { viewport }), REPAIRS_REQ_VIEWPORT_KEYS)
}

export function buildRepairsReqViewportPatch(raw, device, key, value) {
  return buildViewportPatch(
    raw,
    device,
    key,
    value,
    REPAIRS_REQ_SHARED_ROOT_KEYS,
    snapshotRepairsReqViewportSettings,
  )
}

export function repairsReqCssVars(settings, opts = {}) {
  const s = normalizeRepairsReqSettings(settings || {}, opts)
  return {
    '--rpr-pt': `${s.padding_top}px`,
    '--rpr-pr': `${s.padding_right}px`,
    '--rpr-pb': `${s.padding_bottom}px`,
    '--rpr-pl': `${s.padding_left}px`,
    '--rpr-mt': `${s.margin_top}px`,
    '--rpr-mr': `${s.margin_right}px`,
    '--rpr-mb': `${s.margin_bottom}px`,
    '--rpr-ml': `${s.margin_left}px`,
    '--rpr-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--rpr-title-size': `${s.title_size}px`,
    '--rpr-sub-size': `${s.subtitle_size}px`,
    '--rpr-panel-radius': `${s.panel_radius}px`,
    '--rpr-panel-pad': `${s.panel_padding}px`,
    '--rpr-input-radius': `${s.input_radius}px`,
    '--rpr-btn-radius': `${s.button_radius}px`,
    '--rpr-accent': s.accent,
    '--rpr-accent-deep': s.accent_deep,
    '--rpr-ink': s.ink,
    '--rpr-muted': s.muted,
    '--rpr-panel-from': s.panel_from,
    '--rpr-panel-to': s.panel_to,
    '--rpr-panel-border': s.panel_border,
    '--rpr-input-bg': s.input_bg,
    '--rpr-input-border': s.input_border,
    '--rpr-btn-from': s.button_from,
    '--rpr-btn-to': s.button_to,
    '--rpr-btn-text': s.button_text,
    '--rpr-shadow': s.panel_shadow
      ? '0 12px 32px rgba(28, 25, 23, 0.1)'
      : 'none',
  }
}

/* ─── Track / lookup ─── */

export const REPAIRS_TRACK_COLORS = [
  { key: 'ink', label: 'متن' },
  { key: 'muted', label: 'متن کم‌رنگ' },
  { key: 'eyebrow_color', label: 'Eyebrow' },
  { key: 'panel_from', label: 'پنل — از' },
  { key: 'panel_to', label: 'پنل — تا' },
  { key: 'panel_border', label: 'حاشیه پنل' },
  { key: 'input_bg', label: 'پس‌زمینه ورودی' },
  { key: 'input_border', label: 'حاشیه ورودی' },
  { key: 'button_from', label: 'دکمه — از' },
  { key: 'button_to', label: 'دکمه — تا' },
  { key: 'button_text', label: 'متن دکمه' },
  { key: 'result_bg', label: 'پس‌زمینه نتیجه' },
]

export const REPAIRS_TRACK_VIEWPORT_KEYS = [
  'show_eyebrow',
  'show_panel',
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
  ...REPAIRS_TRACK_COLORS.map((f) => f.key),
]

export const REPAIRS_TRACK_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'eyebrow_text',
  'title',
  'subtitle',
  'code_label',
  'mobile_label',
  'submit_label',
  'code_placeholder',
  'mobile_placeholder',
])

export const DEFAULT_REPAIRS_TRACK_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  show_eyebrow: true,
  show_panel: true,
  panel_shadow: false,
  section_full: true,
  eyebrow_text: 'پیگیری سفارش',
  title: 'وضعیت تعمیر من',
  subtitle:
    'کد سفارش و موبایل ثبت‌شده را وارد کنید تا وضعیت فعلی نمایش داده شود',
  code_label: 'کد سفارش',
  mobile_label: 'شماره موبایل',
  submit_label: 'نمایش وضعیت',
  code_placeholder: 'مثلاً R-1403-001',
  mobile_placeholder: '09xxxxxxxxx',
  ink: '#1E3B2F',
  muted: '#7F8C6A',
  eyebrow_color: '#7F8C6A',
  panel_from: '#ffffff',
  panel_to: '#ffffff',
  panel_border: 'rgba(127, 140, 106, 0.22)',
  input_bg: '#ffffff',
  input_border: 'rgba(30, 59, 47, 0.14)',
  button_from: '#1E3B2F',
  button_to: '#163028',
  button_text: '#F5F0E6',
  result_bg: '#ffffff',
  title_size: 16,
  subtitle_size: 12,
  panel_radius: 14,
  panel_padding: 16,
  input_radius: 10,
  button_radius: 10,
  max_width: 720,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
}

function coerceTrack(merged, rawRoot = {}) {
  const s = { ...DEFAULT_REPAIRS_TRACK_SETTINGS, ...merged }
  applyVisibility(s, rawRoot)
  applyBools(s, merged, DEFAULT_REPAIRS_TRACK_SETTINGS, [
    'show_eyebrow',
    'show_panel',
    'panel_shadow',
    'section_full',
  ])
  applySharedStrings(s, rawRoot, REPAIRS_TRACK_SHARED_ROOT_KEYS)
  applyColors(s, DEFAULT_REPAIRS_TRACK_SETTINGS, REPAIRS_TRACK_COLORS)
  s.title_size = Math.max(16, Math.min(40, pxNum(s.title_size, 22, 40)))
  s.subtitle_size = Math.max(11, Math.min(22, pxNum(s.subtitle_size, 14, 22)))
  s.panel_radius = Math.min(32, pxNum(s.panel_radius, 18, 32))
  s.panel_padding = Math.min(40, pxNum(s.panel_padding, 18, 40))
  s.input_radius = Math.min(24, pxNum(s.input_radius, 12, 24))
  s.button_radius = Math.min(24, pxNum(s.button_radius, 12, 24))
  s.max_width = Math.max(280, Math.min(800, pxNum(s.max_width, 520, 800)))
  applySpace(s, DEFAULT_REPAIRS_TRACK_SETTINGS)
  return s
}

export function normalizeRepairsTrackSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceTrack(
    mergeViewport(root, viewport, REPAIRS_TRACK_VIEWPORT_KEYS),
    root,
  )
}

export function snapshotRepairsTrackViewportSettings(raw = {}, viewport = 'desktop') {
  return pickKeys(
    normalizeRepairsTrackSettings(raw, { viewport }),
    REPAIRS_TRACK_VIEWPORT_KEYS,
  )
}

export function buildRepairsTrackViewportPatch(raw, device, key, value) {
  return buildViewportPatch(
    raw,
    device,
    key,
    value,
    REPAIRS_TRACK_SHARED_ROOT_KEYS,
    snapshotRepairsTrackViewportSettings,
  )
}

export function repairsTrackCssVars(settings, opts = {}) {
  const s = normalizeRepairsTrackSettings(settings || {}, opts)
  return {
    '--rpk-pt': `${s.padding_top}px`,
    '--rpk-pr': `${s.padding_right}px`,
    '--rpk-pb': `${s.padding_bottom}px`,
    '--rpk-pl': `${s.padding_left}px`,
    '--rpk-mt': `${s.margin_top}px`,
    '--rpk-mr': `${s.margin_right}px`,
    '--rpk-mb': `${s.margin_bottom}px`,
    '--rpk-ml': `${s.margin_left}px`,
    '--rpk-max': s.section_full ? 'none' : `${s.max_width}px`,
    '--rpk-title-size': `${s.title_size}px`,
    '--rpk-sub-size': `${s.subtitle_size}px`,
    '--rpk-panel-radius': `${s.panel_radius}px`,
    '--rpk-panel-pad': `${s.panel_padding}px`,
    '--rpk-input-radius': `${s.input_radius}px`,
    '--rpk-btn-radius': `${s.button_radius}px`,
    '--rpk-ink': s.ink,
    '--rpk-muted': s.muted,
    '--rpk-eyebrow': s.eyebrow_color,
    '--rpk-panel-from': s.panel_from,
    '--rpk-panel-to': s.panel_to,
    '--rpk-panel-border': s.panel_border,
    '--rpk-input-bg': s.input_bg,
    '--rpk-input-border': s.input_border,
    '--rpk-btn-from': s.button_from,
    '--rpk-btn-to': s.button_to,
    '--rpk-btn-text': s.button_text,
    '--rpk-result-bg': s.result_bg,
    '--rpk-shadow': s.panel_shadow
      ? '0 12px 28px rgba(30, 59, 47, 0.12)'
      : 'none',
  }
}

/* ─── defaults by type ─── */

export function getRepairsWidgetDefaults(type) {
  const withViewport = (flat, mobileOv = {}) => {
    const desktop = pickKeys(
      flat,
      Object.keys(flat).filter(
        (k) =>
          ![
            'show_on_mobile',
            'show_on_desktop',
            'title',
            'subtitle',
            'eyebrow_text',
            'primary_label',
            'secondary_label',
            'primary_href',
            'secondary_href',
            'cta_label',
            'link_base',
            'limit',
            'submit_label',
            'success_hint',
            'code_label',
            'mobile_label',
            'code_placeholder',
            'mobile_placeholder',
          ].includes(k),
      ),
    )
    return {
      ...flat,
      desktop,
      mobile: {
        ...desktop,
        columns: 2,
        max_width: 480,
        padding_top: 12,
        padding_bottom: 12,
        padding_left: 12,
        padding_right: 12,
        margin_left: 0,
        margin_right: 0,
        layout: 'stack',
        ...mobileOv,
      },
    }
  }

  switch (type) {
    case 'repairs_technicians':
      return withViewport({ ...DEFAULT_REPAIRS_TECH_SETTINGS })
    case 'repairs_services':
      return withViewport({ ...DEFAULT_REPAIRS_SVC_SETTINGS })
    case 'repairs_request':
      return withViewport(
        { ...DEFAULT_REPAIRS_REQ_SETTINGS },
        { max_width: 520, panel_padding: 14 },
      )
    case 'repairs_track':
      return withViewport(
        { ...DEFAULT_REPAIRS_TRACK_SETTINGS },
        { max_width: 420, panel_padding: 14 },
      )
    case 'repairs_cta':
    default:
      return withViewport(
        { ...DEFAULT_REPAIRS_CTA_SETTINGS },
        { layout: 'stack', band_padding_y: 18 },
      )
  }
}

export function normalizeRepairsWidgetSettings(raw, type, opts = {}) {
  switch (type) {
    case 'repairs_technicians':
      return normalizeRepairsTechSettings(raw, opts)
    case 'repairs_services':
      return normalizeRepairsSvcSettings(raw, opts)
    case 'repairs_request':
      return normalizeRepairsReqSettings(raw, opts)
    case 'repairs_track':
      return normalizeRepairsTrackSettings(raw, opts)
    case 'repairs_cta':
    default:
      return normalizeRepairsCtaSettings(raw, opts)
  }
}

export function buildRepairsViewportPatch(raw, device, key, value, type) {
  switch (type) {
    case 'repairs_technicians':
      return buildRepairsTechViewportPatch(raw, device, key, value)
    case 'repairs_services':
      return buildRepairsSvcViewportPatch(raw, device, key, value)
    case 'repairs_request':
      return buildRepairsReqViewportPatch(raw, device, key, value)
    case 'repairs_track':
      return buildRepairsTrackViewportPatch(raw, device, key, value)
    case 'repairs_cta':
    default:
      return buildRepairsCtaViewportPatch(raw, device, key, value)
  }
}

export function snapshotRepairsViewportSettings(raw, viewport, type) {
  switch (type) {
    case 'repairs_technicians':
      return snapshotRepairsTechViewportSettings(raw, viewport)
    case 'repairs_services':
      return snapshotRepairsSvcViewportSettings(raw, viewport)
    case 'repairs_request':
      return snapshotRepairsReqViewportSettings(raw, viewport)
    case 'repairs_track':
      return snapshotRepairsTrackViewportSettings(raw, viewport)
    case 'repairs_cta':
    default:
      return snapshotRepairsCtaViewportSettings(raw, viewport)
  }
}
