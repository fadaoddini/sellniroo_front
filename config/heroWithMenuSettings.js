// config/heroWithMenuSettings.js — هیرو دارای منو (ویجت منو + پروفایل/تاریخ + دیال)
import {
  DEFAULT_GYM_DIAL_ITEMS,
  normalizeGymDialItems,
} from '@/components/widgets/gym/gymDialDefaults'
import {
  DEFAULT_GYM_CHROME_BREAKING_NEWS,
  buildGymChromeBreakingNewsSettings,
} from '@/config/gymWidgetSettings'
import {
  DEFAULT_SITE_TOP_NAV_MOBILE,
  createDefaultSiteTopNavSettings,
  normalizeSiteTopNavSettings,
} from '@/config/siteTopNavWidgetSettings'
import { PROFILE_MODES } from '@/config/navWidgetSettings'

export const HERO_WITH_MENU_WIDGET_TYPE = 'hero_with_menu'

export const HERO_WITH_MENU_WIDGET_TYPES = [
  HERO_WITH_MENU_WIDGET_TYPE,
  'gym_hero',
]

export const HERO_WITH_MENU_TYPE_SET = new Set(HERO_WITH_MENU_WIDGET_TYPES)

export function isHeroWithMenuWidgetType(type) {
  return HERO_WITH_MENU_TYPE_SET.has(String(type || ''))
}

/** حالت پس‌زمینه دسکتاپ */
export const HERO_BG_MODES = [
  { id: 'curve', label: 'منحنی', hint: 'نیمهٔ رنگی با لبهٔ موج‌دار' },
  { id: 'simple', label: 'ساده', hint: 'تقسیم صاف بدون موج' },
  { id: 'gradient', label: 'گرادیان', hint: 'گرادیان یکپارچه' },
]

export const DEFAULT_HERO_BG = {
  bg_mode: 'curve',
  curve_intensity: 50,
  bg_color: '#ffffff',
  bg_color_alt: '#023c2c',
}

/** پروفایل + تاریخ روی نوار منو (مثل خبر فوری، بدون تیکر) */
export const DEFAULT_HERO_WITH_MENU_PROFILE = {
  show_date: true,
  date_font_size: 11,
  date_font_weight: 400,
  profile_mode: 'avatar_name',
  avatar_shape: 'circle',
  guest_visible: true,
  guest_label: 'ورود',
  guest_icon: 'LogIn',
  guest_href: '/login',
  color_date: '#a7f3d0',
  color_profile_bg: 'transparent',
  color_profile_text: '#ffffff',
  color_avatar_border: '#10b981',
  color_btn_bg: '#046c4e',
  color_btn_text: '#ffffff',
}

/** پالت سبز هم‌تراز بک‌گراند هیرو — دسکتاپ و موبایل */
export const HERO_MENU_GREEN = {
  bg: '#023c2c',
  text: '#ecfdf5',
  icon: '#a7f3d0',
  hover: '#6ee7b7',
  accent: '#10b981',
  border: 'rgba(167, 243, 208, 0.2)',
  drawer: '#023c2c',
  hamburger: '#ecfdf5',
}

/** نارنجی شغلی + آبی قدیمی باشگاه — نباید در منوی هیرو بمانند */
const HERO_MENU_LEGACY_COLORS = new Set(
  [
    '#fdba74',
    '#ea580c',
    '#f4ae52',
    '#d4621a',
    '#fb923c',
    '#fb9700',
    '#c2410c',
    '#f97316',
    '#0b3a5c',
    '#135a87',
    '#062a42',
    '#0f4c75',
    '#006bcf',
  ].map((c) => c.toLowerCase()),
)

export function isHeroMenuLegacyColor(value) {
  const v = String(value || '')
    .trim()
    .toLowerCase()
  return !!v && HERO_MENU_LEGACY_COLORS.has(v)
}

export function scrubHeroMenuColor(value, fallback) {
  const v = String(value ?? '').trim()
  if (!v || v === 'transparent') return fallback
  if (isHeroMenuLegacyColor(v)) return fallback
  return v
}

/** ادغام عمیق desktop/mobile تا رنگ‌های موبایل پاک نشوند */
export function mergeHeroMenuSettings(...parts) {
  let out = {}
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue
    const { desktop, mobile, ...rest } = part
    out = { ...out, ...rest }
    if (desktop && typeof desktop === 'object') {
      out.desktop = { ...(out.desktop || {}), ...desktop }
    }
    if (mobile && typeof mobile === 'object') {
      out.mobile = { ...(out.mobile || {}), ...mobile }
    }
  }
  return out
}

/**
 * رنگ‌های نهایی منو/پروفایل/کشو — تنظیمات کاربر با حذف نارنجی/آبی قدیمی
 */
export function resolveHeroMenuChromeColors(menu = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const vp =
    menu?.[viewport] && typeof menu[viewport] === 'object' ? menu[viewport] : {}
  const otherKey = viewport === 'mobile' ? 'desktop' : 'mobile'
  const other =
    menu?.[otherKey] && typeof menu[otherKey] === 'object' ? menu[otherKey] : {}

  const pick = (key, fallback) => {
    const raw = vp[key] ?? menu[key] ?? other[key]
    return scrubHeroMenuColor(raw, fallback)
  }

  const bg = pick('color_bg', HERO_MENU_GREEN.bg)
  const text = pick('color_text', HERO_MENU_GREEN.text)
  const icon = pick('color_icon', text || HERO_MENU_GREEN.icon)
  const hover = pick('color_hover', HERO_MENU_GREEN.hover)
  let accent = pick('color_accent', HERO_MENU_GREEN.accent)
  /* اکسنت هم‌رنگ بک‌گراند → دیده نمی‌شود؛ مینت فعال */
  if (accent.toLowerCase() === String(bg).toLowerCase()) {
    accent = HERO_MENU_GREEN.accent
  }

  return {
    color_bg: bg === 'transparent' ? HERO_MENU_GREEN.bg : bg,
    color_text: text,
    color_icon: icon,
    color_hover: hover,
    color_accent: accent,
    color_border: pick('color_border', HERO_MENU_GREEN.border),
    color_drawer_bg: pick('color_drawer_bg', HERO_MENU_GREEN.drawer),
    color_hamburger: pick('color_hamburger', HERO_MENU_GREEN.hamburger),
    color_cta_bg: pick('color_cta_bg', HERO_MENU_GREEN.bg),
    color_cta_text: pick('color_cta_text', '#ffffff'),
    color_date: pick('color_date', icon),
    color_avatar_border: pick('color_avatar_border', accent),
    color_btn_bg: pick('color_btn_bg', accent),
    color_btn_text: pick('color_btn_text', '#ffffff'),
    color_profile_text: pick('color_profile_text', text),
    color_profile_bg: pick('color_profile_bg', 'transparent'),
    color_link: pick('color_link', icon),
    color_menu_icon: pick('color_menu_icon', icon),
    color_menu_hover_bg: pick('color_menu_hover_bg', HERO_MENU_GREEN.bg),
    color_menu_hover_text: pick('color_menu_hover_text', hover),
  }
}

/** ویجت منو — همان SiteTopNav با حالت‌های موبایل (دایره وسط و …) */
export const DEFAULT_HERO_WITH_MENU_MENU = {
  ...createDefaultSiteTopNavSettings(),
  ...DEFAULT_HERO_WITH_MENU_PROFILE,
  show_on_mobile: true,
  show_on_desktop: true,
  use_site_logo: true,
  show_logo: true,
  show_cta: false,
  filter_by_modules: false,
  mobile_bottom_nav: true,
  mobile_show_top: true,
  mobile_nav_style: 'center_circle',
  sticky: false,
  shadow: false,
  full_bleed: true,
  blur: 0,
  border_width: 0,
  height: 40,
  margin_top: 16,
  radius: 0,
  color_bg: 'transparent',
  color_text: HERO_MENU_GREEN.text,
  color_icon: HERO_MENU_GREEN.icon,
  color_hover: HERO_MENU_GREEN.hover,
  color_accent: HERO_MENU_GREEN.accent,
  color_border: 'transparent',
  color_drawer_bg: HERO_MENU_GREEN.drawer,
  color_hamburger: HERO_MENU_GREEN.hamburger,
  desktop: {
    ...createDefaultSiteTopNavSettings().desktop,
    sticky: false,
    shadow: false,
    full_bleed: true,
    blur: 0,
    border_width: 0,
    height: 40,
    margin_top: 16,
    radius: 0,
    show_logo: true,
    show_cta: false,
    color_bg: 'transparent',
    color_text: HERO_MENU_GREEN.text,
    color_icon: HERO_MENU_GREEN.icon,
    color_hover: HERO_MENU_GREEN.hover,
    color_accent: HERO_MENU_GREEN.accent,
    color_border: 'transparent',
    color_drawer_bg: HERO_MENU_GREEN.drawer,
    color_hamburger: HERO_MENU_GREEN.hamburger,
  },
  mobile: {
    ...DEFAULT_SITE_TOP_NAV_MOBILE,
    sticky: false,
    shadow: false,
    full_bleed: true,
    blur: 0,
    border_width: 0,
    show_logo: true,
    show_cta: false,
    mobile_mode: 'drawer',
    /* موبایل: نوار سبز یکدست (هماهنگ با دسکتاپ اسکرول‌شده) */
    color_bg: HERO_MENU_GREEN.bg,
    color_text: HERO_MENU_GREEN.text,
    color_icon: HERO_MENU_GREEN.icon,
    color_hover: HERO_MENU_GREEN.hover,
    color_accent: HERO_MENU_GREEN.accent,
    color_border: HERO_MENU_GREEN.border,
    color_drawer_bg: HERO_MENU_GREEN.drawer,
    color_hamburger: HERO_MENU_GREEN.hamburger,
  },
}

export const DEFAULT_HERO_WITH_MENU = {
  brand: 'باشگاه بدنسازی',
  show_menu: true,
  ...DEFAULT_HERO_BG,
  dial_items: DEFAULT_GYM_DIAL_ITEMS.map((x) => ({ ...x })),
  menu: { ...DEFAULT_HERO_WITH_MENU_MENU },
  show_on_mobile: true,
  show_on_desktop: true,
}

function normalizeProfileSlice(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const mode = String(r.profile_mode || DEFAULT_HERO_WITH_MENU_PROFILE.profile_mode)
  return {
    show_date: r.show_date !== false,
    date_font_size: Number(r.date_font_size) || DEFAULT_HERO_WITH_MENU_PROFILE.date_font_size,
    date_font_weight:
      Number(r.date_font_weight) || DEFAULT_HERO_WITH_MENU_PROFILE.date_font_weight,
    profile_mode: PROFILE_MODES.some((m) => m.id === mode)
      ? mode
      : DEFAULT_HERO_WITH_MENU_PROFILE.profile_mode,
    avatar_shape:
      r.avatar_shape === 'rounded' ? 'rounded' : 'circle',
    guest_visible: r.guest_visible !== false,
    guest_label:
      String(r.guest_label || DEFAULT_HERO_WITH_MENU_PROFILE.guest_label).trim() ||
      'ورود',
    guest_icon:
      String(r.guest_icon || DEFAULT_HERO_WITH_MENU_PROFILE.guest_icon).trim() ||
      'LogIn',
    guest_href:
      String(r.guest_href || DEFAULT_HERO_WITH_MENU_PROFILE.guest_href).trim() ||
      '/login',
    color_date: String(r.color_date || DEFAULT_HERO_WITH_MENU_PROFILE.color_date),
    color_profile_bg: String(
      r.color_profile_bg || DEFAULT_HERO_WITH_MENU_PROFILE.color_profile_bg,
    ),
    color_profile_text: String(
      r.color_profile_text || DEFAULT_HERO_WITH_MENU_PROFILE.color_profile_text,
    ),
    color_avatar_border: String(
      r.color_avatar_border || DEFAULT_HERO_WITH_MENU_PROFILE.color_avatar_border,
    ),
    color_btn_bg: String(
      r.color_btn_bg || DEFAULT_HERO_WITH_MENU_PROFILE.color_btn_bg,
    ),
    color_btn_text: String(
      r.color_btn_text || DEFAULT_HERO_WITH_MENU_PROFILE.color_btn_text,
    ),
  }
}

function normalizeHeroBg(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const mode = String(r.bg_mode || DEFAULT_HERO_BG.bg_mode)
  const intensity = Number(r.curve_intensity)
  return {
    bg_mode: HERO_BG_MODES.some((m) => m.id === mode) ? mode : DEFAULT_HERO_BG.bg_mode,
    curve_intensity: Number.isFinite(intensity)
      ? Math.max(0, Math.min(100, Math.round(intensity)))
      : DEFAULT_HERO_BG.curve_intensity,
    bg_color: String(r.bg_color || DEFAULT_HERO_BG.bg_color),
    bg_color_alt: String(r.bg_color_alt || DEFAULT_HERO_BG.bg_color_alt),
  }
}

export function normalizeHeroWithMenuSettings(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {}
  return {
    brand:
      String(r.brand || DEFAULT_HERO_WITH_MENU.brand).trim() ||
      DEFAULT_HERO_WITH_MENU.brand,
    show_menu: r.show_menu !== false,
    ...normalizeHeroBg(r),
    dial_items: normalizeGymDialItems(r.dial_items),
    menu: r.menu && typeof r.menu === 'object' ? r.menu : {},
    show_on_mobile: r.show_on_mobile !== false,
    show_on_desktop: r.show_on_desktop !== false,
  }
}

/** تنظیمات ویجت منو (SiteTopNav) برای هیرو */
export function resolveHeroWithMenuBarSettings(raw = {}) {
  const s = normalizeHeroWithMenuSettings(raw)
  if (!s.show_menu) return null
  const merged = {
    ...DEFAULT_HERO_WITH_MENU_MENU,
    ...s.menu,
  }
  return normalizeSiteTopNavSettings(merged)
}

/** پروفایل + تاریخ برای رندر کنار منو (بدون تیکر/لینک منو) */
export function resolveHeroWithMenuProfileSettings(raw = {}) {
  const s = normalizeHeroWithMenuSettings(raw)
  if (!s.show_menu) return null
  const profile = normalizeProfileSlice({
    ...DEFAULT_HERO_WITH_MENU_PROFILE,
    ...s.menu,
  })
  if (!profile.show_date && profile.profile_mode === 'hidden' && !profile.guest_visible) {
    return null
  }
  return {
    show_ticker: false,
    show_menu_items: false,
    show_hamburger: false,
    show_menu_icons: false,
    show_cart: false,
    sticky: false,
    shadow: false,
    bar_full_bleed: true,
    border_width: 0,
    color_bg: 'transparent',
    color_border: 'transparent',
    color_text: HERO_MENU_GREEN.text,
    color_link: HERO_MENU_GREEN.icon,
    color_accent: HERO_MENU_GREEN.accent,
    ...profile,
  }
}

/** برای همگام‌سازی کروم صفحات داخلی */
export function resolveHeroWithMenuChromeBreakingSettings(raw = {}) {
  const s = normalizeHeroWithMenuSettings(raw)
  const profile = normalizeProfileSlice({
    ...DEFAULT_HERO_WITH_MENU_PROFILE,
    ...s.menu,
  })
  return buildGymChromeBreakingNewsSettings({
    ...DEFAULT_GYM_CHROME_BREAKING_NEWS,
    ...profile,
    menu_slug: s.menu?.menu_slug || 'gym',
    show_ticker: true,
  })
}

/** @deprecated */
export function resolveHeroWithMenuBreakingSettings() {
  return null
}

/** @deprecated — alias */
export function resolveHeroWithMenuNavSettings(raw = {}) {
  return resolveHeroWithMenuBarSettings(raw)
}

export function createDefaultHeroWithMenuSettings() {
  return {
    ...DEFAULT_HERO_WITH_MENU,
    dial_items: DEFAULT_GYM_DIAL_ITEMS.map((x) => ({ ...x })),
    menu: JSON.parse(JSON.stringify(DEFAULT_HERO_WITH_MENU_MENU)),
  }
}
