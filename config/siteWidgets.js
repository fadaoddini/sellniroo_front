// config/siteWidgets.js — ویجت‌های قابل استفاده در اسکلت صفحه اصلی
import { SITE_MODULE_KEYS, HOMEPAGE_ORDERABLE_KEYS } from './siteModules'

/**
 * zone:
 *  - chrome_top: بالای صفحه (ثابت)
 *  - main: بدنه HomePage (قابل درگ و ترتیب)
 *  - chrome_bottom: پایین صفحه (ثابت)
 *
 * settingsPanel: کلید پنل تنظیمات اختصاصی در استودیو چیدمان
 * settingsHref: لینک تنظیمات کامل (اختیاری)
 */
export const SITE_WIDGETS = [
  {
    id: 'w_breaking_news',
    moduleKey: SITE_MODULE_KEYS.BREAKING_NEWS,
    label: 'نوار خبر فوری',
    zone: 'chrome_top',
    skeleton: 'ticker',
    settingsPanel: 'generic',
    settingsHref: '/ticker',
  },
  {
    id: 'w_brand_bar',
    moduleKey: SITE_MODULE_KEYS.ADVANCED_MENU,
    label: 'پروفایل برند شرکتی',
    zone: 'chrome_top',
    skeleton: 'brand',
    settingsPanel: 'generic',
    settingsHref: '/site-settings',
  },
  {
    id: 'w_hero',
    moduleKey: SITE_MODULE_KEYS.HERO_SLIDER,
    label: 'اسلایدر هیرو',
    zone: 'chrome_top',
    skeleton: 'hero',
    settingsPanel: 'generic',
    settingsHref: '/hero-slider',
  },
  {
    id: 'w_header_menu',
    moduleKey: SITE_MODULE_KEYS.ADVANCED_MENU,
    label: 'هدر دارای منو',
    zone: 'chrome_top',
    skeleton: 'header',
    settingsPanel: 'header',
    settingsHref: '/header-menu?tab=desktop',
  },
  {
    id: 'w_job_header',
    moduleKey: SITE_MODULE_KEYS.JOB_HEADER,
    label: 'هدر کاریابی',
    zone: 'chrome_top',
    skeleton: 'header',
    hidesWhen: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
    settingsPanel: 'generic',
    settingsHref: '/site-settings',
  },
  {
    id: 'w_news_section',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'بخش اخبار',
    zone: 'main',
    skeleton: 'cards',
    homeKey: SITE_MODULE_KEYS.NEWS_SECTION,
    settingsPanel: 'generic',
    settingsHref: '/news-management',
  },
  {
    id: 'w_latest_news',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'آخرین اخبار',
    zone: 'main',
    skeleton: 'cards',
    settingsPanel: 'news',
    settingsHref: '/news-latest',
  },
  {
    id: 'w_news_list',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'لیست اخبار',
    zone: 'main',
    skeleton: 'cards',
    settingsPanel: 'news',
    settingsHref: '/news-list',
  },
  {
    id: 'w_news_recycler',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'ریسایکلرویوی اخبار',
    zone: 'main',
    skeleton: 'cards',
    settingsPanel: 'news',
    settingsHref: '/news-recycler',
  },
  {
    id: 'w_featured_news_list',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'اخبار ویژه لیست سفارشی',
    zone: 'main',
    skeleton: 'cards',
    settingsPanel: 'news',
    settingsHref: '/news-featured-list',
  },
  {
    id: 'w_news_by_category',
    moduleKey: SITE_MODULE_KEYS.NEWS_SECTION,
    label: 'اخبار یک دسته',
    zone: 'main',
    skeleton: 'cards',
    settingsPanel: 'news',
    settingsHref: '/news-by-category',
  },
  {
    id: 'w_videoinsta',
    moduleKey: SITE_MODULE_KEYS.VIDEOINSTA,
    label: 'آرشیو ویدیو',
    zone: 'main',
    skeleton: 'stories',
    homeKey: SITE_MODULE_KEYS.VIDEOINSTA,
    settingsPanel: 'generic',
    settingsHref: '/videoinsta-manage',
  },
  {
    id: 'w_catalog',
    moduleKey: SITE_MODULE_KEYS.CATALOG,
    label: 'کاتالوگ دیجیتال',
    zone: 'main',
    skeleton: 'flip',
    homeKey: SITE_MODULE_KEYS.CATALOG,
    settingsPanel: 'generic',
    settingsHref: '/catalog-manage',
  },
  {
    id: 'w_job_board_system',
    moduleKey: SITE_MODULE_KEYS.JOB_BOARD,
    label: 'سیستم کاریابی',
    zone: 'main',
    skeleton: 'jobs',
    homeKey: SITE_MODULE_KEYS.JOB_BOARD,
    settingsPanel: 'job_board',
    settingsHref: '/jobs-manage',
  },
  {
    id: 'w_job_listings',
    moduleKey: SITE_MODULE_KEYS.JOB_LISTINGS,
    label: 'لیست آگهی‌ها',
    zone: 'main',
    skeleton: 'jobs',
    homeKey: SITE_MODULE_KEYS.JOB_LISTINGS,
    settingsPanel: 'job_board',
    settingsHref: '/jobs-manage',
  },
  {
    id: 'w_cta',
    moduleKey: SITE_MODULE_KEYS.CTA_SECTION,
    label: 'تماس و درخواست',
    zone: 'main',
    skeleton: 'cta',
    homeKey: SITE_MODULE_KEYS.CTA_SECTION,
    settingsPanel: 'generic',
    settingsHref: '/site-settings',
  },
  {
    id: 'w_footer',
    moduleKey: SITE_MODULE_KEYS.SITE_FOOTER,
    label: 'فوتر سایت',
    zone: 'chrome_bottom',
    skeleton: 'footer',
    settingsPanel: 'generic',
    settingsHref: '/site-settings',
  },
  {
    id: 'w_corp_mobile',
    moduleKey: SITE_MODULE_KEYS.ADVANCED_MENU,
    label: 'منوی پایین شرکتی',
    zone: 'chrome_bottom',
    skeleton: 'mobile_nav',
    settingsPanel: 'mobile_nav',
    settingsHref: '/header-menu?tab=mobile',
  },
  {
    id: 'w_job_mobile',
    moduleKey: SITE_MODULE_KEYS.JOB_MOBILE_NAV,
    label: 'منوی پایین کاریابی',
    zone: 'chrome_bottom',
    skeleton: 'mobile_nav',
    hidesWhen: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
    settingsPanel: 'generic',
  },
]

/** ویجت‌های یک ماژول (خود + فرزندان اگر گروه باشد) */
export function widgetsForModule(moduleKey, modulesList = []) {
  if (!moduleKey) return []
  const children = (modulesList || [])
    .filter((m) => m.parent_key === moduleKey)
    .map((m) => m.key)
  const keys = new Set([moduleKey, ...children])
  return SITE_WIDGETS.filter((w) => keys.has(w.moduleKey))
}

export function isWidgetVisible(widget, moduleMap = {}) {
  if (!moduleMap[widget.moduleKey]) return false
  if (widget.hidesWhen && moduleMap[widget.hidesWhen]) return false
  return true
}

/** همه ویجت‌هایی که با ماژول‌های فعال قابل استفاده‌اند */
export function usableWidgets(moduleMap = {}) {
  return SITE_WIDGETS.filter((w) => isWidgetVisible(w, moduleMap))
}

export function usableWidgetsByZone(moduleMap = {}) {
  const list = usableWidgets(moduleMap)
  return {
    chrome_top: list.filter((w) => w.zone === 'chrome_top'),
    main: list.filter((w) => w.zone === 'main'),
    chrome_bottom: list.filter((w) => w.zone === 'chrome_bottom'),
  }
}

export function mainHomeKeysFromOrder(orderKeys, moduleMap = {}) {
  return (orderKeys || []).filter(
    (key) => HOMEPAGE_ORDERABLE_KEYS.includes(key) && moduleMap[key]
  )
}

export function widgetByHomeKey(homeKey) {
  return SITE_WIDGETS.find((w) => w.homeKey === homeKey) || null
}

export function widgetById(id) {
  return SITE_WIDGETS.find((w) => w.id === id) || null
}
