// config/siteTopNavWidgetSettings.js — ویجت منو (بالا + نوار پایین موبایل)

export const SITE_TOP_NAV_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const SITE_TOP_NAV_ALIGNS = [
  { id: 'start', label: 'شروع' },
  { id: 'center', label: 'وسط' },
  { id: 'end', label: 'پایان' },
]

export const SITE_TOP_NAV_MOBILE_MODES = [
  { id: 'drawer', label: 'منوی کشویی' },
  { id: 'inline', label: 'لینک افقی' },
  { id: 'icons', label: 'فقط آیکن' },
]

export const SITE_TOP_NAV_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const SITE_TOP_NAV_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const SITE_TOP_NAV_COLOR_FIELDS = [
  { key: 'color_bg', label: 'پس‌زمینه' },
  { key: 'color_text', label: 'متن لینک' },
  { key: 'color_icon', label: 'آیکن' },
  { key: 'color_hover', label: 'هاور' },
  { key: 'color_accent', label: 'اکسنت / خط زیر' },
  { key: 'color_border', label: 'بردر' },
  { key: 'color_cta_bg', label: 'دکمه CTA — پس‌زمینه' },
  { key: 'color_cta_text', label: 'دکمه CTA — متن' },
  { key: 'color_drawer_bg', label: 'پس‌زمینه کشو' },
  { key: 'color_hamburger', label: 'همبرگری' },
]

export const SITE_TOP_NAV_VIEWPORT_KEYS = [
  'sticky',
  'sticky_offset',
  'height',
  'full_bleed',
  'blur',
  'shadow',
  'border_width',
  'radius',
  'show_logo',
  'logo_height',
  'show_nav',
  'show_icons',
  'show_labels',
  'nav_align',
  'nav_gap',
  'link_radius',
  'font_size',
  'underline',
  'show_cta',
  'mobile_mode',
  'drawer_width',
  ...SITE_TOP_NAV_SPACE_FIELDS.map((f) => f.key),
  ...SITE_TOP_NAV_MARGIN_FIELDS.map((f) => f.key),
  ...SITE_TOP_NAV_COLOR_FIELDS.map((f) => f.key),
]

export const SITE_TOP_NAV_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'use_site_logo',
  'logo_href',
  'site_name_fa',
  'site_name_en',
  'cta_label',
  'cta_href',
  'filter_by_modules',
  /** نوار پایین موبایل (ظاهر از /header-menu) */
  'mobile_bottom_nav',
  /** نمایش نوار بالای منو در موبایل */
  'mobile_show_top',
])

export const DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  use_site_logo: true,
  logo_href: '/',
  site_name_fa: 'سلنیرو',
  site_name_en: 'Sellniroo',
  cta_label: 'ثبت آگهی',
  cta_href: '/post-job',
  filter_by_modules: true,
  mobile_bottom_nav: true,
  mobile_show_top: true,

  sticky: true,
  sticky_offset: 0,
  height: 56,
  full_bleed: true,
  blur: 16,
  shadow: true,
  border_width: 1,
  radius: 0,
  show_logo: true,
  logo_height: 40,
  show_nav: true,
  show_icons: true,
  show_labels: true,
  nav_align: 'end',
  nav_gap: 6,
  link_radius: 10,
  font_size: 13,
  underline: true,
  show_cta: false,
  mobile_mode: 'drawer',
  drawer_width: 300,

  padding_top: 0,
  padding_right: 20,
  padding_bottom: 0,
  padding_left: 20,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,

  color_bg: '#0a0b0d',
  color_text: '#b8bcc6',
  color_icon: '#f4f5f7',
  color_hover: '#ffffff',
  color_accent: '#fbc300',
  color_border: 'rgba(255, 255, 255, 0.08)',
  color_cta_bg: '#fbc300',
  color_cta_text: '#14181f',
  color_drawer_bg: '#0f1115',
  color_hamburger: '#ffffff',
}

/** پیش‌فرض موبایل هنگام ساخت ویجت */
export const DEFAULT_SITE_TOP_NAV_MOBILE = {
  sticky: true,
  sticky_offset: 0,
  height: 52,
  full_bleed: false,
  blur: 18,
  shadow: true,
  border_width: 1,
  radius: 16,
  show_logo: true,
  logo_height: 34,
  show_nav: true,
  show_icons: true,
  show_labels: true,
  nav_align: 'end',
  nav_gap: 4,
  link_radius: 10,
  font_size: 14,
  underline: false,
  show_cta: false,
  mobile_mode: 'drawer',
  drawer_width: 300,
  padding_top: 4,
  padding_right: 12,
  padding_bottom: 4,
  padding_left: 12,
  margin_top: 8,
  margin_right: 12,
  margin_bottom: 0,
  margin_left: 12,
  color_bg: '#0a0b0d',
  color_text: '#c4c8d0',
  color_icon: '#f4f5f7',
  color_hover: '#ffffff',
  color_accent: '#fbc300',
  color_border: 'rgba(255, 255, 255, 0.1)',
  color_cta_bg: '#fbc300',
  color_cta_text: '#14181f',
  color_drawer_bg: '#0f1115',
  color_hamburger: '#ffffff',
}

export const SITE_TOP_NAV_WIDGET_TYPES = new Set([
  'site_menu',
  'site_top_nav',
  'corporate_header',
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
  SITE_TOP_NAV_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function mergeSiteTopNavViewportRaw(raw = {}, viewport = 'desktop') {
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

function coerceSiteTopNavSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  s.use_site_logo =
    rawRoot.use_site_logo === undefined
      ? true
      : !!rawRoot.use_site_logo
  s.logo_href = String((rawRoot.logo_href ?? s.logo_href) || '/').trim() || '/'
  s.site_name_fa = String((rawRoot.site_name_fa ?? s.site_name_fa) || '').trim()
  s.site_name_en = String((rawRoot.site_name_en ?? s.site_name_en) || '').trim()
  s.cta_label = String((rawRoot.cta_label ?? s.cta_label) || '').trim()
  s.cta_href = String((rawRoot.cta_href ?? s.cta_href) || '/').trim() || '/'
  s.filter_by_modules =
    rawRoot.filter_by_modules === undefined
      ? true
      : !!rawRoot.filter_by_modules
  s.mobile_bottom_nav =
    rawRoot.mobile_bottom_nav === undefined
      ? true
      : !!rawRoot.mobile_bottom_nav
  s.mobile_show_top =
    rawRoot.mobile_show_top === undefined
      ? true
      : !!rawRoot.mobile_show_top

  ;[
    'sticky',
    'full_bleed',
    'shadow',
    'show_logo',
    'show_nav',
    'show_icons',
    'show_labels',
    'underline',
    'show_cta',
  ].forEach((k) => {
    if (merged[k] === undefined) s[k] = DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS[k]
    else s[k] = !!merged[k]
  })

  if (!SITE_TOP_NAV_ALIGNS.some((a) => a.id === s.nav_align)) {
    s.nav_align = 'end'
  }
  if (!SITE_TOP_NAV_MOBILE_MODES.some((m) => m.id === s.mobile_mode)) {
    s.mobile_mode = 'drawer'
  }

  s.sticky_offset = Math.min(
    120,
    pxNum(s.sticky_offset, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.sticky_offset, 120)
  )
  s.height = Math.min(
    120,
    Math.max(40, pxNum(s.height, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.height, 120))
  )
  s.blur = Math.min(40, pxNum(s.blur, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.blur, 40))
  s.border_width = Math.min(
    4,
    pxNum(s.border_width, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.border_width, 4)
  )
  s.radius = Math.min(
    40,
    pxNum(s.radius, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.radius, 40)
  )
  s.logo_height = Math.min(
    72,
    Math.max(
      20,
      pxNum(s.logo_height, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.logo_height, 72)
    )
  )
  s.nav_gap = Math.min(
    32,
    pxNum(s.nav_gap, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.nav_gap, 32)
  )
  s.link_radius = Math.min(
    24,
    pxNum(s.link_radius, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.link_radius, 24)
  )
  s.font_size = Math.min(
    20,
    Math.max(
      10,
      pxNum(s.font_size, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.font_size, 20)
    )
  )
  s.drawer_width = Math.min(
    420,
    Math.max(
      220,
      pxNum(s.drawer_width, DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS.drawer_width, 420)
    )
  )

  SITE_TOP_NAV_SPACE_FIELDS.concat(SITE_TOP_NAV_MARGIN_FIELDS).forEach(({ key }) => {
    s[key] = pxNum(s[key], DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS[key])
  })

  SITE_TOP_NAV_COLOR_FIELDS.forEach(({ key }) => {
    s[key] =
      colorStr(s[key]) || DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS[key]
  })

  return s
}

export function normalizeSiteTopNavSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeSiteTopNavViewportRaw(root, viewport)
  return coerceSiteTopNavSettings(merged, root)
}

export function getSiteTopNavVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotSiteTopNavViewportSettings(raw = {}, viewport = 'desktop') {
  return pickViewportSlice(
    normalizeSiteTopNavSettings(raw, { viewport })
  )
}

export function buildSiteTopNavViewportPatch(raw, device, key, value) {
  if (SITE_TOP_NAV_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotSiteTopNavViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function siteTopNavCssVars(settings, opts = {}) {
  const s = normalizeSiteTopNavSettings(settings || {}, opts)
  const fullBleed = s.full_bleed !== false
  return {
    '--stn-h': `${s.height}px`,
    '--stn-sticky-top': s.sticky ? `${s.sticky_offset}px` : 'auto',
    '--stn-blur': `${s.blur}px`,
    '--stn-bw': `${s.border_width}px`,
    '--stn-radius': `${s.radius}px`,
    '--stn-logo-h': `${s.logo_height}px`,
    '--stn-gap': `${s.nav_gap}px`,
    '--stn-link-radius': `${s.link_radius}px`,
    '--stn-fs': `${s.font_size}px`,
    '--stn-drawer-w': `${s.drawer_width}px`,
    '--stn-pt': `${s.padding_top}px`,
    '--stn-pr': `${s.padding_right}px`,
    '--stn-pb': `${s.padding_bottom}px`,
    '--stn-pl': `${s.padding_left}px`,
    '--stn-mt': `${s.margin_top}px`,
    '--stn-mr': fullBleed ? '0px' : `${s.margin_right}px`,
    '--stn-mb': `${s.margin_bottom}px`,
    '--stn-ml': fullBleed ? '0px' : `${s.margin_left}px`,
    '--stn-bg': s.color_bg,
    '--stn-text': s.color_text,
    '--stn-icon': s.color_icon,
    '--stn-hover': s.color_hover,
    '--stn-accent': s.color_accent,
    '--stn-border': s.color_border,
    '--stn-cta-bg': s.color_cta_bg,
    '--stn-cta-text': s.color_cta_text,
    '--stn-drawer-bg': s.color_drawer_bg,
    '--stn-hamburger': s.color_hamburger,
    '--stn-shadow': s.shadow
      ? '0 10px 40px rgba(0, 0, 0, 0.35)'
      : 'none',
  }
}

export function isSiteTopNavWidgetType(type) {
  return SITE_TOP_NAV_WIDGET_TYPES.has(type)
}

export function createDefaultSiteTopNavSettings() {
  const desktop = pickViewportSlice(DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS)
  return {
    show_on_mobile: true,
    show_on_desktop: true,
    use_site_logo: true,
    logo_href: '/',
    site_name_fa: 'سلنیرو',
    site_name_en: 'Sellniroo',
    cta_label: 'ثبت آگهی',
    cta_href: '/post-job',
    filter_by_modules: true,
    mobile_bottom_nav: true,
    mobile_show_top: true,
    ...desktop,
    desktop: { ...desktop },
    mobile: { ...DEFAULT_SITE_TOP_NAV_MOBILE },
  }
}
