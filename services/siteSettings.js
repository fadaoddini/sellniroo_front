// services/siteSettings.js — تنظیمات برند / هدر / سئو
import Config from '@/config/config'
import { getFullImageUrl } from '@/utils/imageUrl'
import {
  DEFAULT_HOME_LAYOUT,
  DEFAULT_NEWS_SINGLE_LAYOUT,
  DEFAULT_NEWS_LIST_LAYOUT,
  DEFAULT_JOB_SINGLE_LAYOUT,
  DEFAULT_PRODUCT_SINGLE_LAYOUT,
  DEFAULT_SHOP_LIST_LAYOUT,
  createWidgetInstance,
  findFirstWidgetByType,
  normalizeHomeLayout,
  normalizeNewsSingleLayout,
  normalizeNewsListLayout,
  normalizeJobSingleLayout,
  normalizeProductSingleLayout,
  normalizeShopListLayout,
} from '@/config/homeLayout'
import {
  MODULE_PAGE_DEFS,
  SHARED_INTERNAL_LAYOUT_KEY,
  SHARED_INTERNAL_LAYOUT_KEY_LEGACY,
  SHARED_INTERNAL_LAYOUT_EVENT,
  createDefaultSharedInternalLayout,
  isSharedInternalLayoutKey,
  normalizeModulePageLayout,
  normalizeModulePageLayoutsMap,
  normalizeSharedInternalLayout,
  getModulePageDef,
  getSharedInternalLayoutRaw,
  pageKeepsOwnChrome,
  sharedInternalLayoutHasContent,
} from '@/config/modulePageLayouts'
import { fetchSiteModules } from '@/services/siteModules'
import { DEFAULT_NAV_WIDGET_SETTINGS } from '@/config/navWidgetSettings'
import {
  DEFAULT_REBO_PRICING,
  normalizeReboPricing,
} from '@/config/reboPricing'
import {
  DEFAULT_PROFILE_LAYOUT,
  normalizeProfileLayout,
} from '@/config/profileLayout'
import {
  DEFAULT_CHECKOUT_PIPELINES,
  normalizeCheckoutPipelines,
} from '@/config/checkoutPipelines'
import {
  DEFAULT_HOME_HERO_SLIDER,
  normalizeHomeHeroSlider,
} from '@/config/homeHeroSlider'
import { normalizeCustomBreakingNewsThemes } from '@/config/breakingNewsThemes'
import { normalizeCustomSiteMenuThemes } from '@/config/siteMenuThemes'
import {
  normalizeProductSingleLayoutsMap,
  normalizeShopListLayoutsMap,
  resolveActiveShopLayoutMode,
  resolveProductSingleLayoutForMode,
  resolveShopListLayoutForMode,
} from '@/config/shopLayoutModes'
import {
  DEFAULT_NEWS_SINGLE_PAGE_SETTINGS,
  normalizeNewsSinglePageSettings,
} from '@/config/newsSinglePageSettings'
import {
  DEFAULT_JOB_SINGLE_PAGE_SETTINGS,
  normalizeJobSinglePageSettings,
} from '@/config/jobSinglePageSettings'
import {
  DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
  normalizeProductSinglePageSettings,
} from '@/config/productSinglePageSettings'
import {
  buildChromeRow,
  buildSyncedLayoutsFromHome,
  describeChromeFromHome,
  deriveJobSinglePageColorsFromHome,
  resolveSiteChromeLayout,
  stripChromeWidgets,
} from '@/config/chromeThemeSync'

export const DEFAULT_SITE_SETTINGS = {
  site_name: 'سلنیرو',
  site_name_en: 'Sellniroo',
  logo_display: '/images/logo.png',
  logo_url: '/images/logo.png',
  logo_alt: 'سلنیرو',
  logo_title: 'سلنیرو | کاریابی تخصصی فروش و بازاریابی',
  search_placeholder: 'عنوان شغل، مهارت یا شرکت...',
  header_cta_label: 'ثبت آگهی',
  header_cta_href: '/post-job',
  contact_phone: '',
  contact_mobile: '',
  contact_email: '',
  contact_title: 'مشاوره و ارتباط با ما',
  contact_title_en: 'Consultation & Contact Us',
  contact_description:
    'برای دریافت مشاوره تخصصی و اطلاعات بیشتر، فرم را تکمیل کنید. کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.',
  contact_description_en:
    'Fill out the form to get expert consultation. Our team will contact you as soon as possible.',
  contact_phone_label: 'تلفن ثابت',
  contact_mobile_label: 'شماره موبایل',
  contact_email_label: 'ایمیل',
  contact_submit_label: 'ارسال درخواست',
  contact_section_active: true,
  show_contact_phone: true,
  show_contact_mobile: true,
  show_contact_email: true,
  site_url: 'https://sellniroo.com',
  seo_title: 'سلنیرو | کاریابی تخصصی فروش و بازاریابی، استخدام فروشنده و بازاریاب',
  seo_title_template: '%s | سلنیرو',
  seo_description:
    'سلنیرو، سامانه کاریابی تخصصی فروش و بازاریابی؛ مشاهده جدیدترین آگهی‌های استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش و ثبت آگهی استخدام برای کارفرمایان و شرکت‌ها.',
  seo_keywords: '',
  keywords: [
    'سلنیرو',
    'Sellniroo',
    'کاریابی',
    'استخدام فروشنده',
    'استخدام بازاریاب',
  ],
  seo_category: 'کاریابی و استخدام',
  author_name: 'Sellniroo',
  og_title: '',
  og_description: '',
  og_image_display: '/images/logo.png',
  og_image_url: '/images/logo.png',
  twitter_title: '',
  twitter_description: '',
  robots_index: true,
  home_layout: { ...DEFAULT_HOME_LAYOUT },
  news_single_page: { ...DEFAULT_NEWS_SINGLE_PAGE_SETTINGS },
  news_single_layout: { ...DEFAULT_NEWS_SINGLE_LAYOUT },
  news_list_layout: { ...DEFAULT_NEWS_LIST_LAYOUT },
  job_single_page: { ...DEFAULT_JOB_SINGLE_PAGE_SETTINGS },
  job_single_layout: { ...DEFAULT_JOB_SINGLE_LAYOUT },
  product_single_page: { ...DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS },
  product_single_layout: { ...DEFAULT_PRODUCT_SINGLE_LAYOUT },
  product_single_layouts: {},
  shop_list_layout: { ...DEFAULT_SHOP_LIST_LAYOUT },
  shop_list_layouts: {},
  module_page_layouts: {},
  rebo_pricing: { ...DEFAULT_REBO_PRICING },
  profile_layout: { ...DEFAULT_PROFILE_LAYOUT, sections: { ...DEFAULT_PROFILE_LAYOUT.sections } },
  checkout_pipelines: normalizeCheckoutPipelines(DEFAULT_CHECKOUT_PIPELINES),
  home_hero_slider: { ...DEFAULT_HOME_HERO_SLIDER },
  widget_presets: { breaking_news: [], site_menu: [] },
}

const resolveAsset = (src) => {
  if (!src || typeof src !== 'string') return null
  if (
    src.startsWith('/images/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src
  }
  return getFullImageUrl(src)
}

export const normalizeSiteSettings = (raw = {}) => {
  const data = { ...DEFAULT_SITE_SETTINGS, ...raw }
  data.logo_display =
    resolveAsset(raw.logo_display || raw.logo_url || raw.logo) ||
    DEFAULT_SITE_SETTINGS.logo_display
  data.og_image_display =
    resolveAsset(raw.og_image_display || raw.og_image_url || raw.og_image) ||
    data.logo_display
  if (!Array.isArray(data.keywords) || !data.keywords.length) {
    const fromText = String(data.seo_keywords || '')
      .replace(/,/g, '\n')
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
    data.keywords = fromText.length ? fromText : DEFAULT_SITE_SETTINGS.keywords
  }
  data.og_title = data.og_title || data.seo_title
  data.og_description = data.og_description || data.seo_description
  data.twitter_title = data.twitter_title || data.seo_title
  data.twitter_description = data.twitter_description || data.seo_description
  const asBool = (v, fallback = true) => {
    if (v === undefined || v === null || v === '') return fallback
    if (v === false || v === 'false' || v === 0 || v === '0') return false
    return v === true || v === 'true' || v === 1 || v === '1'
  }
  data.contact_section_active = asBool(data.contact_section_active, true)
  data.show_contact_phone = asBool(data.show_contact_phone, true)
  data.show_contact_mobile = asBool(data.show_contact_mobile, true)
  data.show_contact_email = asBool(data.show_contact_email, true)
  data.home_layout = normalizeHomeLayout(raw.home_layout || data.home_layout)
  data.news_single_page = normalizeNewsSinglePageSettings(
    raw.news_single_page || data.news_single_page
  )
  data.news_single_layout = normalizeNewsSingleLayout(
    raw.news_single_layout || data.news_single_layout
  )
  data.news_list_layout = normalizeNewsListLayout(
    raw.news_list_layout || data.news_list_layout
  )
  data.job_single_page = normalizeJobSinglePageSettings(
    raw.job_single_page || data.job_single_page
  )
  data.job_single_layout = normalizeJobSingleLayout(
    raw.job_single_layout || data.job_single_layout
  )
  data.product_single_page = normalizeProductSinglePageSettings(
    raw.product_single_page || data.product_single_page
  )
  data.product_single_layout = normalizeProductSingleLayout(
    raw.product_single_layout || data.product_single_layout
  )
  data.product_single_layouts = normalizeProductSingleLayoutsMap(
    raw.product_single_layouts || data.product_single_layouts
  )
  data.shop_list_layout = normalizeShopListLayout(
    raw.shop_list_layout || data.shop_list_layout
  )
  data.shop_list_layouts = normalizeShopListLayoutsMap(
    raw.shop_list_layouts || data.shop_list_layouts
  )
  data.module_page_layouts = normalizeModulePageLayoutsMap(
    raw.module_page_layouts || data.module_page_layouts
  )
  data.rebo_pricing = normalizeReboPricing(
    raw.rebo_pricing || data.rebo_pricing
  )
  data.profile_layout = normalizeProfileLayout(
    raw.profile_layout || data.profile_layout
  )
  data.checkout_pipelines = normalizeCheckoutPipelines(
    raw.checkout_pipelines || data.checkout_pipelines
  )
  data.home_hero_slider = normalizeHomeHeroSlider(
    raw.home_hero_slider || data.home_hero_slider
  )
  const presetsRaw =
    raw.widget_presets && typeof raw.widget_presets === 'object'
      ? raw.widget_presets
      : data.widget_presets || {}
  data.widget_presets = {
    breaking_news: normalizeCustomBreakingNewsThemes(
      presetsRaw.breaking_news || [],
    ),
    site_menu: normalizeCustomSiteMenuThemes(presetsRaw.site_menu || []),
  }
  return data
}

let cache = null
let inflight = null
let cacheAt = 0
/** کش مرورگر کوتاه؛ روی سرور اصلاً کش نکن تا SSR کهنه نباشد */
const TTL_MS = 8_000
const SETTINGS_BUST_KEY = 'site-settings-bust'

export const clearSiteSettingsCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

function rememberSettingsCache(data, { broadcast = false } = {}) {
  cache = data
  cacheAt = Date.now()
  if (!broadcast || typeof window === 'undefined') return data
  try {
    window.localStorage.setItem(SETTINGS_BUST_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
  return data
}

/**
 * بعد از ذخیرهٔ /site-settings — کش را به‌روز می‌کند و به ویجت‌ها خبر می‌دهد
 * (لوگو در نوار خبر فوری، منوی سایت، …)
 */
export function publishSiteSettings(data) {
  const normalized = normalizeSiteSettings(data || {})
  rememberSettingsCache(normalized, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('site-settings-changed', { detail: normalized }),
    )
  }
  return normalized
}

export async function fetchSiteSettings({ force = false } = {}) {
  const onServer = typeof window === 'undefined'
  const now = Date.now()
  // روی سرور Node کش حافظه باعث دادهٔ کهنه بین رفرش‌ها می‌شود
  if (!onServer && !force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight
  if (force) {
    cache = null
    cacheAt = 0
    inflight = null
  }

  inflight = (async () => {
    try {
      const url = Config.endpoints.news.siteSettings.get()
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`site-settings ${res.status}`)
      const json = await res.json()
      const data = normalizeSiteSettings(json?.data || json)
      if (!onServer) rememberSettingsCache(data)
      return data
    } catch {
      if (cache) return cache
      return normalizeSiteSettings(DEFAULT_SITE_SETTINGS)
    } finally {
      inflight = null
    }
  })()

  return inflight
}

/** ذخیره فقط home_layout (PATCH site-settings) */
export async function saveHomeLayout(layout, authHeaders = {}) {
  const body = { home_layout: normalizeHomeLayout(layout) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('home-layout-changed', { detail: data.home_layout })
    )
  }
  return data.home_layout
}

/** ذخیره چیدمان صفحه‌ساز سینگل خبر (مثل home_layout) */
export async function saveNewsSingleLayout(layout, authHeaders = {}) {
  const body = { news_single_layout: normalizeNewsSingleLayout(layout) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان سینگل ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('news-single-layout-changed', {
        detail: data.news_single_layout,
      })
    )
  }
  return data.news_single_layout
}

/** ذخیره تنظیمات صفحه سینگل خبر */
export async function saveNewsSinglePageSettings(payload, authHeaders = {}) {
  const body = {
    news_single_page: normalizeNewsSinglePageSettings(payload),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تنظیمات سینگل ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('news-single-page-changed', {
        detail: data.news_single_page,
      })
    )
  }
  return data.news_single_page
}

/** ذخیره چیدمان صفحه‌ساز لیست اخبار (/news) */
export async function saveNewsListLayout(layout, authHeaders = {}) {
  const body = { news_list_layout: normalizeNewsListLayout(layout) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان لیست اخبار ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('news-list-layout-changed', {
        detail: data.news_list_layout,
      })
    )
  }
  return data.news_list_layout
}

/** ذخیره چیدمان صفحه‌ساز سینگل آگهی */
export async function saveJobSingleLayout(layout, authHeaders = {}) {
  const body = { job_single_layout: normalizeJobSingleLayout(layout) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان سینگل آگهی ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('job-single-layout-changed', {
        detail: data.job_single_layout,
      })
    )
  }
  return data.job_single_layout
}

/** ذخیره تنظیمات صفحه سینگل آگهی */
export async function saveJobSinglePageSettings(payload, authHeaders = {}) {
  const body = {
    job_single_page: normalizeJobSinglePageSettings(payload),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تنظیمات سینگل آگهی ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('job-single-page-changed', {
        detail: data.job_single_page,
      })
    )
  }
  return data.job_single_page
}

/** ذخیره چیدمان سینگل محصول (حالت پیش‌فرض) */
export async function saveProductSingleLayout(layout, authHeaders = {}) {
  return saveProductSingleLayoutVariant('default', layout, authHeaders, {
    alsoPublish: true,
  })
}

/** ذخیره چیدمان سینگل برای یک حالت عمودی */
export async function saveProductSingleLayoutVariant(
  variantId,
  layout,
  authHeaders = {},
  { alsoPublish = false, moduleMap = null } = {},
) {
  const mode = String(variantId || 'default')
  const normalized = normalizeProductSingleLayout(layout)
  const current = await fetchSiteSettings({ force: true })
  const layouts = {
    ...normalizeProductSingleLayoutsMap(current.product_single_layouts),
    [mode]: normalized,
  }
  let active = 'default'
  if (moduleMap && typeof moduleMap === 'object' && Object.keys(moduleMap).length) {
    active = resolveActiveShopLayoutMode(moduleMap)
  } else if (typeof window !== 'undefined') {
    try {
      const { fetchSiteModules } = await import('@/services/siteModules')
      const mods = await fetchSiteModules({ force: true })
      active = resolveActiveShopLayoutMode(mods?.map || {})
    } catch {
      active = 'default'
    }
  }
  const publish = alsoPublish || mode === active
  const body = {
    product_single_layouts: layouts,
    ...(publish ? { product_single_layout: normalized } : {}),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان سینگل محصول ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('product-single-layout-changed', {
        detail: data.product_single_layout,
      })
    )
    window.dispatchEvent(
      new CustomEvent('product-single-layouts-changed', {
        detail: data.product_single_layouts,
      })
    )
  }
  return data.product_single_layouts?.[mode] || normalized
}

/** ذخیره تنظیمات صفحه سینگل محصول */
export async function saveProductSinglePageSettings(payload, authHeaders = {}) {
  const body = {
    product_single_page: normalizeProductSinglePageSettings(payload),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تنظیمات سینگل محصول ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('product-single-page-changed', {
        detail: data.product_single_page,
      })
    )
  }
  return data.product_single_page
}

/** ذخیره چیدمان لیست فروشگاه (حالت پیش‌فرض / فعال) */
export async function saveShopListLayout(layout, authHeaders = {}) {
  return saveShopListLayoutVariant('default', layout, authHeaders, {
    alsoPublish: true,
  })
}

/**
 * ذخیره چیدمان یک حالت عمودی فروشگاه (default | sadra | gym_bodybuilding).
 * اگر alsoPublish یا حالت = حالت فعال سایت باشد، shop_list_layout هم به‌روز می‌شود.
 */
export async function saveShopListLayoutVariant(
  variantId,
  layout,
  authHeaders = {},
  { alsoPublish = false, moduleMap = null } = {},
) {
  const mode = String(variantId || 'default')
  const normalized = normalizeShopListLayout(layout)
  const current = await fetchSiteSettings({ force: true })
  const layouts = {
    ...normalizeShopListLayoutsMap(current.shop_list_layouts),
    [mode]: normalized,
  }
  let active = 'default'
  if (moduleMap && typeof moduleMap === 'object' && Object.keys(moduleMap).length) {
    active = resolveActiveShopLayoutMode(moduleMap)
  } else if (typeof window !== 'undefined') {
    try {
      const { fetchSiteModules } = await import('@/services/siteModules')
      const mods = await fetchSiteModules({ force: true })
      active = resolveActiveShopLayoutMode(mods?.map || {})
    } catch {
      active = 'default'
    }
  }
  const publish = alsoPublish || mode === active
  const body = {
    shop_list_layouts: layouts,
    ...(publish ? { shop_list_layout: normalized } : {}),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان لیست فروشگاه ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('shop-list-layout-changed', {
        detail: data.shop_list_layout,
      })
    )
    window.dispatchEvent(
      new CustomEvent('shop-list-layouts-changed', {
        detail: data.shop_list_layouts,
      })
    )
  }
  return data.shop_list_layouts?.[mode] || normalized
}

export {
  resolveActiveShopLayoutMode,
  resolveShopListLayoutForMode,
  resolveProductSingleLayoutForMode,
  normalizeShopListLayoutsMap,
  normalizeProductSingleLayoutsMap,
}

/**
 * یک‌کلیک: هدر و ترکیب رنگی صفحه اصلی → صفحات داخلی، پروفایل، فروشگاه،
 * سینگل محصول، سینگل آگهی، سینگل/لیست خبر.
 */
export async function syncHomeChromeTheme(authHeaders = {}) {
  const current = await fetchSiteSettings({ force: true })
  const chrome = describeChromeFromHome(current?.home_layout)
  if (!chrome.count) {
    throw new Error(
      'در چیدمان صفحه اصلی ویجت هدر (نوار خبر / منو) پیدا نشد. اول هدر را در صفحه اصلی بچینید.',
    )
  }
  const synced = buildSyncedLayoutsFromHome(current)
  const pageColors = deriveJobSinglePageColorsFromHome(current?.home_layout)
  const jobSinglePage = normalizeJobSinglePageSettings({
    ...(current?.job_single_page || {}),
    ink_color: pageColors.ink_color,
    muted_color: pageColors.muted_color,
    accent_color: pageColors.accent_color,
    surface_bg: pageColors.surface_bg,
  })
  const body = {
    module_page_layouts: synced.module_page_layouts,
    shop_list_layout: synced.shop_list_layout,
    product_single_layout: synced.product_single_layout,
    job_single_layout: synced.job_single_layout,
    news_single_layout: synced.news_single_layout,
    news_list_layout: synced.news_list_layout,
    job_single_page: jobSinglePage,
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `همگام‌سازی هدر ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('home-layout-changed', { detail: data.home_layout }),
    )
    window.dispatchEvent(
      new CustomEvent('module-page-layouts-changed', {
        detail: data.module_page_layouts,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('shop-list-layout-changed', {
        detail: data.shop_list_layout,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('product-single-layout-changed', {
        detail: data.product_single_layout,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('job-single-layout-changed', {
        detail: data.job_single_layout,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('job-single-page-changed', {
        detail: data.job_single_page,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('news-single-layout-changed', {
        detail: data.news_single_layout,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('news-list-layout-changed', {
        detail: data.news_list_layout,
      }),
    )
    const sharedSaved = normalizeSharedInternalLayout(
      getSharedInternalLayoutRaw(data.module_page_layouts),
    )
    window.dispatchEvent(
      new CustomEvent(SHARED_INTERNAL_LAYOUT_EVENT, {
        detail: sharedSaved,
      }),
    )
    MODULE_PAGE_DEFS.forEach((def) => {
      const layout = data.module_page_layouts?.[def.key]
      if (!layout) return
      window.dispatchEvent(
        new CustomEvent(def.event || `module-page-layout-changed:${def.key}`, {
          detail: layout,
        }),
      )
    })
  }
  return {
    settings: data,
    summary: synced.summary,
    chrome,
  }
}

/** ذخیره چیدمان یک صفحه داخلی ماژول یا چیدمان مشترک (shared) */
export async function saveModulePageLayout(pageKey, layout, authHeaders = {}) {
  const key = String(pageKey || '').trim()
  if (!key) throw new Error('کلید صفحه نامعتبر است')
  const savingShared = isSharedInternalLayoutKey(key)
  const chromeKind =
    key === 'chrome_header'
      ? 'header'
      : key === 'chrome_menu'
        ? 'menu'
        : key === 'chrome_footer'
          ? 'footer'
          : null
  const savingChrome = !!chromeKind
  const storageKey = savingShared ? SHARED_INTERNAL_LAYOUT_KEY : key
  const def = savingShared || savingChrome ? null : getModulePageDef(key)
  let keepOwnChrome = savingShared || savingChrome || !!def?.keepOwnChrome
  if (!keepOwnChrome && def?.ownChromeWhenSchool) {
    try {
      const { map } = await fetchSiteModules({ force: false })
      keepOwnChrome = pageKeepsOwnChrome(def, map || {})
    } catch {
      keepOwnChrome = false
    }
  }
  // صفحات تکی معمولاً کروم را ذخیره نمی‌کنند (مال چیدمان مشترک / تب هدر-منو است).
  // قالب مدرسه: news/profile کروم اختصاصی دارند — نباید strip شود وگرنه ذخیره عملاً پاک می‌شود.
  // هدر/منو/فوتر سراسری: کل ویجت‌ها همان کروم‌اند — هرگز strip نکن.
  let normalized
  if (savingChrome) {
    const { normalizeChromeLayout } = await import('@/config/siteChrome')
    normalized = normalizeChromeLayout(layout, chromeKind)
  } else if (savingShared) {
    normalized = normalizeSharedInternalLayout(layout)
  } else if (keepOwnChrome) {
    normalized = normalizeModulePageLayout(layout, key)
  } else {
    // پرچم chrome (سوییچ هدر/منو) را نگه دار؛ فقط ویجت‌های کروم داخل محتوا را ببر
    const base = normalizeModulePageLayout(layout, key)
    const stripped = stripChromeWidgets(base)
    normalized =
      base?.chrome && typeof base.chrome === 'object'
        ? { ...stripped, chrome: base.chrome }
        : stripped
  }
  const current = await fetchSiteSettings({ force: true })
  const nextMap = {
    ...(current.module_page_layouts || {}),
    [storageKey]: normalized,
  }
  // کلید قدیمی را پاک کن تا دو منبع گیج‌کننده نماند
  if (savingShared) {
    delete nextMap[SHARED_INTERNAL_LAYOUT_KEY_LEGACY]
  }
  const body = { module_page_layouts: nextMap }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = savingShared
      ? `ذخیره چیدمان مشترک ناموفق (${res.status})`
      : savingChrome
        ? `ذخیره ${chromeKind} ناموفق (${res.status})`
        : `ذخیره چیدمان صفحه ${key} ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  let saved
  if (savingChrome) {
    const { normalizeChromeLayout } = await import('@/config/siteChrome')
    saved = normalizeChromeLayout(data.module_page_layouts?.[key], chromeKind)
  } else if (savingShared) {
    saved = normalizeSharedInternalLayout(
      getSharedInternalLayoutRaw(data.module_page_layouts),
    )
  } else {
    saved = normalizeModulePageLayout(data.module_page_layouts?.[key], key)
  }
  if (typeof window !== 'undefined') {
    if (savingShared) {
      window.dispatchEvent(
        new CustomEvent(SHARED_INTERNAL_LAYOUT_EVENT, { detail: saved }),
      )
      MODULE_PAGE_DEFS.forEach((def) => {
        const pageLayout = data.module_page_layouts?.[def.key]
        if (!pageLayout) return
        window.dispatchEvent(
          new CustomEvent(
            def.event || `module-page-layout-changed:${def.key}`,
            { detail: pageLayout },
          ),
        )
      })
    } else {
      const eventName = savingChrome
        ? `module-page-layout-changed:${key}`
        : getModulePageDef(key)?.event || `module-page-layout-changed:${key}`
      window.dispatchEvent(new CustomEvent(eventName, { detail: saved }))
    }
    window.dispatchEvent(
      new CustomEvent('module-page-layouts-changed', {
        detail: data.module_page_layouts,
      }),
    )
  }
  return saved
}

/** ذخیره قیمت‌گذاری ویجت‌های ربو */
export async function saveReboPricing(pricing, authHeaders = {}) {
  const body = { rebo_pricing: normalizeReboPricing(pricing) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره قیمت‌گذاری ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('rebo-pricing-changed', {
        detail: data.rebo_pricing,
      }),
    )
  }
  return data.rebo_pricing
}

/** ذخیره چیدمان / دسترسی بخش‌های پروفایل */
export async function saveProfileLayout(layout, authHeaders = {}) {
  const body = { profile_layout: normalizeProfileLayout(layout) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره چیدمان پروفایل ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('profile-layout-changed', {
        detail: data.profile_layout,
      }),
    )
  }
  return data.profile_layout
}

const WIDGET_PRESET_NORMALIZERS = {
  breaking_news: normalizeCustomBreakingNewsThemes,
  site_menu: normalizeCustomSiteMenuThemes,
}

/** ذخیره تم‌های سفارشی یک ویجت در SiteSettings.widget_presets */
export async function saveWidgetCustomThemes(
  presetKey,
  themes,
  authHeaders = {},
) {
  const key = String(presetKey || '').trim()
  const normalize = WIDGET_PRESET_NORMALIZERS[key]
  if (!normalize) {
    throw new Error(`کلید تم ناشناخته: ${key}`)
  }
  const list = normalize(themes)
  const current = await fetchSiteSettings({ force: true })
  const nextPresets = {
    ...(current.widget_presets && typeof current.widget_presets === 'object'
      ? current.widget_presets
      : {}),
    [key]: list,
  }
  const body = { widget_presets: nextPresets }
  const url = Config.endpoints.news.siteSettings.update()
  const storageKey = `${key}_custom_themes`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تم‌ها ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    if (res.status === 400 || res.status === 404) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, JSON.stringify(list))
        }
      } catch {
        /* ignore */
      }
      return list
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  const saved = data.widget_presets?.[key] || list
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(saved))
      window.dispatchEvent(
        new CustomEvent('widget-presets-changed', {
          detail: { key, themes: saved },
        }),
      )
    }
  } catch {
    /* ignore */
  }
  return saved
}

/** @deprecated استفاده از saveWidgetCustomThemes('breaking_news', …) */
export async function saveBreakingNewsCustomThemes(themes, authHeaders = {}) {
  return saveWidgetCustomThemes('breaking_news', themes, authHeaders)
}

/** ذخیره محتوای اسلایدر / هیرو صفحه اصلی */
export async function saveHomeHeroSlider(payload, authHeaders = {}) {
  const body = { home_hero_slider: normalizeHomeHeroSlider(payload) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تنظیمات صفحه اصلی ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('home-hero-slider-changed', {
        detail: data.home_hero_slider,
      }),
    )
  }
  return data.home_hero_slider
}

/** ادغام پچ تنظیمات نوار خبر (desktop/mobile تو در تو) */
export function mergeBreakingNewsSettingsPatch(prev, patch) {
  const base = prev && typeof prev === 'object' ? { ...prev } : {}
  const p = patch && typeof patch === 'object' ? patch : {}
  const next = { ...base, ...p }
  ;['desktop', 'mobile'].forEach((vp) => {
    if (p[vp] && typeof p[vp] === 'object') {
      next[vp] = {
        ...(base[vp] && typeof base[vp] === 'object' ? base[vp] : {}),
        ...p[vp],
      }
    }
  })
  return next
}

function mapLayoutBreakingNewsSettings(layout, settings) {
  const L = normalizeHomeLayout(layout || {})
  let touched = false
  const rows = (L.rows || []).map((row) => ({
    ...row,
    columns: (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).map((w) => {
        const type = String(w?.type || '')
        if (type === 'breaking_news') {
          touched = true
          return { ...w, settings: { ...settings } }
        }
        if (type === 'school_landing') {
          const prev =
            w.settings && typeof w.settings === 'object' ? w.settings : {}
          touched = true
          return {
            ...w,
            settings: {
              ...prev,
              breaking: { ...settings },
              breaking_news: { ...settings },
            },
          }
        }
        return w
      }),
    })),
  }))
  return { layout: { ...L, rows }, touched }
}

function ensureSharedBreakingNews(layout, settings) {
  const mapped = mapLayoutBreakingNewsSettings(layout, settings)
  if (findFirstWidgetByType(mapped.layout, ['breaking_news'])) {
    return normalizeSharedInternalLayout(mapped.layout)
  }
  const base = sharedInternalLayoutHasContent(layout)
    ? normalizeSharedInternalLayout(layout)
    : createDefaultSharedInternalLayout()
  const rows = [...(base.rows || [])]
  if (!rows.length) {
    return normalizeSharedInternalLayout({
      ...createDefaultSharedInternalLayout(),
      rows: [
        {
          id: 'sec_shared_chrome_default',
          template: '1',
          width: 'full',
          padding_y: 'none',
          columns: [
            {
              id: 'col_shared_chrome_default',
              span: 100,
              widgets: [createWidgetInstance('breaking_news', settings)],
            },
          ],
        },
      ],
    })
  }
  const first = { ...rows[0] }
  const cols = [...(first.columns || [])]
  if (!cols.length) {
    cols.push({
      id: 'col_shared_chrome_default',
      span: 100,
      widgets: [],
    })
  }
  const col0 = { ...cols[0], widgets: [...(cols[0].widgets || [])] }
  col0.widgets = [
    createWidgetInstance('breaking_news', settings),
    ...col0.widgets,
  ]
  cols[0] = col0
  first.columns = cols
  rows[0] = first
  return normalizeSharedInternalLayout({ ...base, rows })
}

/** خواندن تنظیمات ظاهر نوار خبر فوری از چیدمان کروم */
export async function loadBreakingNewsChromeSettings() {
  const data = await fetchSiteSettings({ force: true })
  const chrome = resolveSiteChromeLayout(data)
  const widget = findFirstWidgetByType(chrome, ['breaking_news'])
  const settings =
    widget?.settings && typeof widget.settings === 'object'
      ? { ...widget.settings }
      : { ...DEFAULT_NAV_WIDGET_SETTINGS }
  return { settings, siteSettings: data }
}

/** به‌روزرسانی / درج ویجت خبر فوری در یک چیدمان صفحه‌ساز (مثل /news) */
function upsertBreakingNewsInBuilderLayout(layout, settings, normalizer) {
  const normalized = normalizer(layout || {})
  const mapped = mapLayoutBreakingNewsSettings(normalized, settings)
  if (findFirstWidgetByType(mapped.layout, ['breaking_news'])) {
    return normalizer(mapped.layout)
  }
  const stripped = stripChromeWidgets(mapped.layout)
  const chromeRow = buildChromeRow(
    [{ type: 'breaking_news', settings }],
    'ticker_bn',
  )
  return normalizer({
    ...stripped,
    rows: [chromeRow, ...(stripped.rows || [])],
  })
}

/**
 * ذخیره ظاهر نوار خبر فوری در چیدمان مشترک + خانه + لیست/سینگل خبر
 * (همان تنظیماتی که در ویجت adminweb ویرایش می‌شود)
 */
export async function saveBreakingNewsChromeSettings(
  settings,
  authHeaders = {},
) {
  const payload =
    settings && typeof settings === 'object'
      ? settings
      : { ...DEFAULT_NAV_WIDGET_SETTINGS }
  const current = await fetchSiteSettings({ force: true })
  const homeMapped = mapLayoutBreakingNewsSettings(
    current.home_layout,
    payload,
  )
  const sharedNext = ensureSharedBreakingNews(
    getSharedInternalLayoutRaw(current.module_page_layouts),
    payload,
  )
  const nextMap = {
    ...(current.module_page_layouts || {}),
    [SHARED_INTERNAL_LAYOUT_KEY]: sharedNext,
  }
  delete nextMap[SHARED_INTERNAL_LAYOUT_KEY_LEGACY]

  const body = {
    module_page_layouts: nextMap,
    home_layout: homeMapped.layout,
    news_list_layout: upsertBreakingNewsInBuilderLayout(
      current.news_list_layout,
      payload,
      normalizeNewsListLayout,
    ),
    news_single_layout: upsertBreakingNewsInBuilderLayout(
      current.news_single_layout,
      payload,
      normalizeNewsSingleLayout,
    ),
  }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره تنظیمات نوار خبر ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('home-layout-changed', { detail: data.home_layout }),
    )
    window.dispatchEvent(
      new CustomEvent('module-page-layouts-changed', {
        detail: data.module_page_layouts,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('news-list-layout-changed', {
        detail: data.news_list_layout,
      }),
    )
    window.dispatchEvent(
      new CustomEvent('news-single-layout-changed', {
        detail: data.news_single_layout,
      }),
    )
    const sharedSaved = normalizeSharedInternalLayout(
      getSharedInternalLayoutRaw(data.module_page_layouts),
    )
    window.dispatchEvent(
      new CustomEvent(SHARED_INTERNAL_LAYOUT_EVENT, { detail: sharedSaved }),
    )
  }
  const sharedWidget = findFirstWidgetByType(sharedNext, ['breaking_news'])
  return sharedWidget?.settings && typeof sharedWidget.settings === 'object'
    ? { ...sharedWidget.settings }
    : { ...payload }
}

/** ذخیره پایپ‌لاین سفارش / سبد سیستم‌ها */
export async function saveCheckoutPipelines(pipelines, authHeaders = {}) {
  const body = { checkout_pipelines: normalizeCheckoutPipelines(pipelines) }
  const url = Config.endpoints.news.siteSettings.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره پایپ‌لاین سفارش ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeSiteSettings(json?.data || json)
  rememberSettingsCache(data, { broadcast: true })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('checkout-pipelines-changed', {
        detail: data.checkout_pipelines,
      }),
    )
  }
  return data.checkout_pipelines
}

export function buildMetadataFromSettings(settings) {
  const s = normalizeSiteSettings(settings)
  const siteUrl = (s.site_url || 'https://sellniroo.com').replace(/\/$/, '')
  const ogImage = s.og_image_display?.startsWith('http')
    ? s.og_image_display
    : `${siteUrl}${s.og_image_display?.startsWith('/') ? '' : '/'}${s.og_image_display || '/images/logo.png'}`

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: s.seo_title,
      template: s.seo_title_template || '%s | سلنیرو',
    },
    description: s.seo_description,
    keywords: s.keywords,
    robots: {
      index: !!s.robots_index,
      follow: !!s.robots_index,
      googleBot: {
        index: !!s.robots_index,
        follow: !!s.robots_index,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    authors: [{ name: s.author_name || 'Sellniroo', url: siteUrl }],
    creator: s.author_name || 'Sellniroo',
    publisher: s.author_name || 'Sellniroo',
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: siteUrl,
      siteName: s.site_name,
      title: s.og_title || s.seo_title,
      description: s.og_description || s.seo_description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: s.logo_alt || s.site_name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: s.twitter_title || s.seo_title,
      description: s.twitter_description || s.seo_description,
      images: [ogImage],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: siteUrl,
    },
    category: s.seo_category || 'کاریابی و استخدام',
  }
}
