// config/gymWidgetSettings.js — ویجت‌های اختصاصی قالب باشگاه بدنسازی

export const GYM_WIDGET_TYPES = [
  'gym_hero',
  'gym_journey',
  'gym_features',
  'gym_sessions',
  'gym_trainers',
  'gym_shop',
  'gym_pillars',
  'gym_closing',
]

export const GYM_WIDGET_TYPE_SET = new Set(GYM_WIDGET_TYPES)

export function isGymWidgetType(type) {
  return GYM_WIDGET_TYPE_SET.has(String(type || ''))
}

export const DEFAULT_GYM_HERO = {
  brand: 'باشگاه بدنسازی',
  headline: 'مدیریت واقعی باشگاه، بدون امکانات اضافه',
  subtitle:
    'اعضا، بسته، سانس، مربی، برنامه تمرین و رژیم، فروشگاه و پیامک — همه در یک هسته روشن.',
  cta_label: 'پروفایل باشگاه',
  cta_href: '/gym/profile',
  secondary_label: 'عضویت من',
  secondary_href: '/gym/profile?tab=membership',
  embed_breaking: true,
  show_on_mobile: true,
  show_on_desktop: true,
}

/** خبر فوری شفاف داخل هیرو باشگاه */
export const DEFAULT_GYM_HERO_BREAKING_NEWS = {
  show_ticker: true,
  sticky: true,
  shadow: false,
  bar_full_bleed: true,
  show_hamburger: false,
  show_menu_items: false,
  show_cart: false,
  guest_visible: true,
  guest_label: 'ورود',
  guest_href: '/login',
  color_bg: 'transparent',
  color_text: '#ffffff',
  color_link: '#a7f3d0',
  color_date: '#a7f3d0',
  color_accent: '#10b981',
  color_border: 'transparent',
  color_btn_bg: '#046c4e',
  color_btn_text: '#ffffff',
  color_menu_icon: '#ffffff',
  color_profile_bg: 'transparent',
  color_profile_text: '#ffffff',
  color_avatar_border: '#10b981',
  height: 40,
  padding_top: 8,
  padding_bottom: 8,
  mobile: {
    color_bg: 'transparent',
    color_text: '#ffffff',
    color_link: '#ffffff',
    color_date: '#ffffff',
    color_profile_text: '#ffffff',
    color_border: 'transparent',
    shadow: false,
    sticky: true,
    bar_full_bleed: true,
  },
  desktop: {
    color_bg: 'transparent',
    color_text: '#ffffff',
    color_link: '#a7f3d0',
    color_date: '#a7f3d0',
    color_profile_text: '#ffffff',
    color_border: 'transparent',
    shadow: false,
    sticky: true,
    bar_full_bleed: true,
  },
}

export function buildGymHeroBreakingNewsSettings(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const base = { ...DEFAULT_GYM_HERO_BREAKING_NEWS, ...src }
  const forceClear = {
    color_bg: 'transparent',
    shadow: false,
    sticky: true,
    bar_full_bleed: true,
    color_border: 'transparent',
    color_profile_text: '#ffffff',
  }
  const link = src.color_link || src.color_icon || '#a7f3d0'
  const mergeVp = (vp) => ({
    ...(DEFAULT_GYM_HERO_BREAKING_NEWS[vp] || {}),
    ...(src[vp] && typeof src[vp] === 'object' ? src[vp] : {}),
    ...forceClear,
    color_text: src.color_text || '#ffffff',
    color_link: link,
    color_profile_text: '#ffffff',
  })
  return {
    ...base,
    ...forceClear,
    color_text: src.color_text || '#ffffff',
    color_link: link,
    color_profile_text: '#ffffff',
    mobile: mergeVp('mobile'),
    desktop: mergeVp('desktop'),
  }
}

/** نوار خبر فوری جامد برای پروفایل و صفحات داخلی (هم‌رنگ تم باشگاه) */
export const DEFAULT_GYM_CHROME_BREAKING_NEWS = {
  show_ticker: true,
  sticky: true,
  shadow: true,
  bar_full_bleed: true,
  show_hamburger: true,
  show_menu_items: true,
  show_menu_icons: true,
  show_cart: false,
  guest_visible: true,
  guest_label: 'ورود',
  guest_href: '/login',
  menu_slug: 'gym',
  color_bg: '#023c2c',
  color_text: '#ffffff',
  color_link: '#a7f3d0',
  color_date: '#ffffff',
  color_accent: '#10b981',
  color_border: '#046c4e',
  color_btn_bg: '#046c4e',
  color_btn_text: '#ffffff',
  color_menu_icon: '#ffffff',
  color_drawer_bg: '#023c2c',
  color_menu_hover_bg: '#046c4e',
  color_menu_hover_text: '#a7f3d0',
  color_profile_bg: 'transparent',
  color_profile_text: '#ffffff',
  color_avatar_border: '#10b981',
  height: 44,
  padding_top: 8,
  padding_bottom: 8,
  mobile: {
    color_bg: '#023c2c',
    color_text: '#ffffff',
    color_link: '#a7f3d0',
    color_date: '#ffffff',
    color_profile_text: '#ffffff',
    color_border: '#046c4e',
    color_drawer_bg: '#023c2c',
    color_menu_icon: '#ffffff',
    show_menu_items: true,
    show_hamburger: true,
    shadow: true,
    sticky: true,
    bar_full_bleed: true,
  },
  desktop: {
    color_bg: '#023c2c',
    color_text: '#ffffff',
    color_link: '#a7f3d0',
    color_date: '#ffffff',
    color_profile_text: '#ffffff',
    color_border: '#046c4e',
    color_drawer_bg: '#023c2c',
    color_menu_icon: '#ffffff',
    show_menu_items: true,
    show_hamburger: true,
    shadow: true,
    sticky: true,
    bar_full_bleed: true,
  },
}

export function buildGymChromeBreakingNewsSettings(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const base = { ...DEFAULT_GYM_CHROME_BREAKING_NEWS, ...src }
  const force = {
    color_bg: src.color_bg || '#023c2c',
    color_text: src.color_text || '#ffffff',
    color_link: src.color_link || src.color_icon || '#a7f3d0',
    color_date: src.color_date || '#ffffff',
    color_profile_text: src.color_profile_text || '#ffffff',
    color_border: src.color_border || '#046c4e',
    color_menu_icon: src.color_menu_icon || src.color_icon || '#ffffff',
    show_menu_items: true,
    menu_slug: String(src.menu_slug || 'gym'),
    bar_full_bleed: true,
    sticky: true,
  }
  const mergeVp = (vp) => ({
    ...(DEFAULT_GYM_CHROME_BREAKING_NEWS[vp] || {}),
    ...(src[vp] && typeof src[vp] === 'object' ? src[vp] : {}),
    ...force,
  })
  return {
    ...base,
    ...force,
    mobile: mergeVp('mobile'),
    desktop: mergeVp('desktop'),
  }
}

export const DEFAULT_GYM_JOURNEY = {
  eyebrow: 'باشگاه پیکسلی',
  title: 'اسکوات، دمبل، بارفیکس و وزنه',
  subtitle: 'انیمیشن ساده پیکسلی — چند ادمک در حال تمرین، شبیه ماینکرافت.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_FEATURES = {
  eyebrow: 'با ما تمرین کن',
  title: 'اینجا عضویت فقط یه کارت نیست',
  subtitle:
    'سانس، مربی، برنامه و یادآوری تمدید — همه‌چیز آماده تا بیای و ادامه بدی.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_SESSIONS = {
  eyebrow: 'برنامه هفتگی',
  title: 'سانس‌های باشگاه',
  subtitle:
    'سانس آقایان و بانوان با ساعت و ظرفیت مشخص — جات رو انتخاب کن و سر وقت بیا.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_TRAINERS = {
  eyebrow: 'تیم مربیگری',
  title: 'مربیان باشگاه',
  subtitle:
    'با مربی متخصص تمرین کن — برنامه، فرم درست و مسیر مشخص برای هدفت.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_SHOP = {
  eyebrow: 'فروشگاه باشگاه',
  title: 'مکمل و پوشاک',
  subtitle:
    'از همان سبد خرید سایت سفارش بده — محصولات باشگاه مستقیم به پروفایل و سفارش‌هایت وصل است.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_PILLARS = {
  eyebrow: 'از طرف باشگاه',
  title: 'این‌ها رو برات آماده کردیم',
  subtitle:
    'سانس، مربی، فروشگاه و یادآوری تمدید — همه‌چیز تا بیای و تمرینت رو ادامه بدی.',
  show_on_mobile: true,
  show_on_desktop: true,
}

export const DEFAULT_GYM_CLOSING = {
  brand: 'باشگاه بدنسازی',
  title: 'با یک کلیک نصب شد؛ از همین‌جا مدیریت کنید',
  subtitle: 'داشبورد اعضا، بسته، سانس و پروفایل آماده است.',
  cta_label: 'باز کردن داشبورد',
  cta_href: '/gym/profile?tab=manage',
  show_on_mobile: true,
  show_on_desktop: true,
}

export function normalizeGymSettings(raw = {}, defaults = {}) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const out = { ...defaults }
  Object.keys(defaults).forEach((key) => {
    if (r[key] === undefined || r[key] === null) return
    if (typeof defaults[key] === 'boolean') {
      out[key] = !!r[key]
      return
    }
    out[key] = String(r[key]).trim() || defaults[key]
  })
  return out
}
