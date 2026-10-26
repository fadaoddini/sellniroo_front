// config/appBottomNavWidgetSettings.js — منوی پایین اپلیکیشن (دسکتاپ / موبایل جدا)

export const APP_BOTTOM_NAV_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const APP_BOTTOM_NAV_STYLES = [
  { id: 'classic', label: 'کلاسیک' },
  { id: 'center_circle', label: 'دایره وسط' },
  { id: 'rounded_square', label: 'مربع گرد' },
  { id: 'glow_dock', label: 'داک درخشان' },
]

export const APP_BOTTOM_NAV_COLOR_FIELDS = [
  { key: 'color_bg', label: 'پس‌زمینه' },
  { key: 'color_text', label: 'متن' },
  { key: 'color_icon', label: 'آیکن' },
  { key: 'color_active', label: 'فعال' },
  { key: 'color_border', label: 'بردر' },
]

export const APP_BOTTOM_NAV_VIEWPORT_KEYS = [
  'visible',
  'fixed',
  'nav_style',
  'max_items',
  'show_labels',
  'show_icons',
  'height',
  'blur',
  'shadow',
  'border_width',
  'radius',
  'inset_x',
  'inset_bottom',
  'z_index',
  'padding_top',
  'padding_bottom',
  ...APP_BOTTOM_NAV_COLOR_FIELDS.map((f) => f.key),
]

export const APP_BOTTOM_NAV_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'filter_by_modules',
  'use_site_appearance',
])

export const DEFAULT_APP_BOTTOM_NAV_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: false,
  filter_by_modules: true,
  use_site_appearance: true,

  visible: true,
  fixed: true,
  nav_style: 'classic',
  max_items: 5,
  show_labels: true,
  show_icons: true,
  height: 64,
  blur: 22,
  shadow: true,
  border_width: 1,
  radius: 0,
  inset_x: 0,
  inset_bottom: 0,
  z_index: 1200,
  padding_top: 6,
  padding_bottom: 8,

  color_bg: '#0a0a0a',
  color_text: '#9a9a9a',
  color_icon: '#9a9a9a',
  color_active: '#ffffff',
  color_border: 'rgba(255, 255, 255, 0.08)',
}

export const DEFAULT_APP_BOTTOM_NAV_DESKTOP = {
  ...DEFAULT_APP_BOTTOM_NAV_SETTINGS,
  visible: false,
  fixed: false,
}

export const DEFAULT_APP_BOTTOM_NAV_MOBILE = {
  ...DEFAULT_APP_BOTTOM_NAV_SETTINGS,
  visible: true,
  fixed: true,
  nav_style: 'classic',
  max_items: 5,
  height: 64,
  radius: 0,
  inset_x: 0,
  inset_bottom: 0,
}

export const APP_BOTTOM_NAV_WIDGET_TYPES = new Set([
  'app_bottom_nav',
  'corporate_bottom_nav',
])

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

function pickViewportSlice(obj = {}) {
  const out = {}
  APP_BOTTOM_NAV_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function mergeAppBottomNavViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickViewportSlice(root)
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

function coerceAppBottomNavSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_APP_BOTTOM_NAV_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? false : !!rawRoot.show_on_desktop
  s.filter_by_modules =
    rawRoot.filter_by_modules === undefined
      ? true
      : !!rawRoot.filter_by_modules
  s.use_site_appearance =
    rawRoot.use_site_appearance === undefined
      ? true
      : !!rawRoot.use_site_appearance

  ;['visible', 'fixed', 'show_labels', 'show_icons', 'shadow'].forEach((k) => {
    if (merged[k] === undefined) s[k] = DEFAULT_APP_BOTTOM_NAV_SETTINGS[k]
    else s[k] = !!merged[k]
  })

  if (!APP_BOTTOM_NAV_STYLES.some((x) => x.id === s.nav_style)) {
    s.nav_style = 'classic'
  }

  s.max_items = Math.min(
    7,
    Math.max(3, pxNum(s.max_items, 5, 7))
  )
  s.height = Math.min(
    96,
    Math.max(48, pxNum(s.height, DEFAULT_APP_BOTTOM_NAV_SETTINGS.height, 96))
  )
  s.blur = Math.min(40, pxNum(s.blur, 22, 40))
  s.border_width = Math.min(4, pxNum(s.border_width, 1, 4))
  s.radius = Math.min(40, pxNum(s.radius, 0, 40))
  s.inset_x = Math.min(48, pxNum(s.inset_x, 0, 48))
  s.inset_bottom = Math.min(48, pxNum(s.inset_bottom, 0, 48))
  s.z_index = Math.min(
    9999,
    Math.max(1, pxNum(s.z_index, 1200, 9999))
  )
  s.padding_top = Math.min(24, pxNum(s.padding_top, 6, 24))
  s.padding_bottom = Math.min(24, pxNum(s.padding_bottom, 8, 24))

  APP_BOTTOM_NAV_COLOR_FIELDS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || DEFAULT_APP_BOTTOM_NAV_SETTINGS[key]
  })

  return s
}

export function normalizeAppBottomNavSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coerceAppBottomNavSettings(
    mergeAppBottomNavViewportRaw(root, viewport),
    root
  )
}

export function getAppBottomNavVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? false : !!root.show_on_desktop,
  }
}

export function snapshotAppBottomNavViewportSettings(
  raw = {},
  viewport = 'desktop'
) {
  return pickViewportSlice(normalizeAppBottomNavSettings(raw, { viewport }))
}

export function buildAppBottomNavViewportPatch(raw, device, key, value) {
  if (APP_BOTTOM_NAV_SHARED_ROOT_KEYS.has(key)) return { [key]: value }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotAppBottomNavViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function appBottomNavCssVars(settings, opts = {}) {
  const s = normalizeAppBottomNavSettings(settings || {}, opts)
  return {
    '--abn-h': `${s.height}px`,
    '--abn-blur': `${s.blur}px`,
    '--abn-bw': `${s.border_width}px`,
    '--abn-radius': `${s.radius}px`,
    '--abn-inset-x': `${s.inset_x}px`,
    '--abn-inset-b': `${s.inset_bottom}px`,
    '--abn-z': String(s.z_index),
    '--abn-pt': `${s.padding_top}px`,
    '--abn-pb': `${s.padding_bottom}px`,
    '--abn-bg': s.color_bg,
    '--abn-text': s.color_text,
    '--abn-icon': s.color_icon,
    '--abn-active': s.color_active,
    '--abn-border': s.color_border,
    '--abn-shadow': s.shadow ? '0 -10px 32px rgba(0, 0, 0, 0.28)' : 'none',
  }
}

export function isAppBottomNavWidgetType(type) {
  return APP_BOTTOM_NAV_WIDGET_TYPES.has(type)
}

export function createDefaultAppBottomNavSettings() {
  return {
    show_on_mobile: true,
    show_on_desktop: false,
    filter_by_modules: true,
    use_site_appearance: true,
    ...pickViewportSlice(DEFAULT_APP_BOTTOM_NAV_MOBILE),
    desktop: { ...DEFAULT_APP_BOTTOM_NAV_DESKTOP },
    mobile: { ...DEFAULT_APP_BOTTOM_NAV_MOBILE },
  }
}
