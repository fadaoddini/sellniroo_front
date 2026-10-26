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
  normalizeHomeLayout,
  normalizeNewsSingleLayout,
  normalizeNewsListLayout,
  normalizeJobSingleLayout,
  normalizeProductSingleLayout,
  normalizeShopListLayout,
} from '@/config/homeLayout'
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
  shop_list_layout: { ...DEFAULT_SHOP_LIST_LAYOUT },
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
  data.shop_list_layout = normalizeShopListLayout(
    raw.shop_list_layout || data.shop_list_layout
  )
  return data
}

let cache = null
let inflight = null
let cacheAt = 0
const TTL_MS = 60_000

export const clearSiteSettingsCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

export async function fetchSiteSettings({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
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
      cache = data
      cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
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
  cache = data
  cacheAt = Date.now()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('job-single-page-changed', {
        detail: data.job_single_page,
      })
    )
  }
  return data.job_single_page
}

/** ذخیره چیدمان صفحه‌ساز سینگل محصول */
export async function saveProductSingleLayout(layout, authHeaders = {}) {
  const body = { product_single_layout: normalizeProductSingleLayout(layout) }
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
  cache = data
  cacheAt = Date.now()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('product-single-layout-changed', {
        detail: data.product_single_layout,
      })
    )
  }
  return data.product_single_layout
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
  cache = data
  cacheAt = Date.now()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('product-single-page-changed', {
        detail: data.product_single_page,
      })
    )
  }
  return data.product_single_page
}

/** ذخیره چیدمان لیست فروشگاه */
export async function saveShopListLayout(layout, authHeaders = {}) {
  const body = { shop_list_layout: normalizeShopListLayout(layout) }
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
  cache = data
  cacheAt = Date.now()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('shop-list-layout-changed', {
        detail: data.shop_list_layout,
      })
    )
  }
  return data.shop_list_layout
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
