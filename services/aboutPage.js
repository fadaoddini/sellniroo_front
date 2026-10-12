// services/aboutPage.js — محتوای صفحه درباره ما از API
import Config from '@/config/config'
import { aboutData } from '@/components/About/AboutData'

export const DEFAULT_ABOUT_SEO = {
  seo_title: 'درباره ما',
  seo_description:
    'درباره سلنیرو - سایت کاریابی تخصصی فروش و بازاریابی؛ مشاهده جدیدترین آگهی‌های استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش و ثبت آگهی استخدام برای شرکت‌ها و کارفرمایان.',
  keywords: [
    'درباره سلنیرو',
    'تاریخچه سلنیرو',
    'ماموریت سلنیرو',
    'چشم انداز سلنیرو',
    'تیم سلنیرو',
    'کاریابی تخصصی فروش',
    'کاریابی بازاریابی',
    'استخدام فروشنده',
    'استخدام بازاریاب',
    'استخدام ویزیتور',
    'ثبت آگهی استخدام رایگان',
    'جذب نیروی فروش',
    'جذب بازاریاب',
  ],
  canonical_url: 'https://sellniroo.com/about',
  og_title: 'درباره ما | سلنیرو',
  og_description:
    'درباره سلنیرو - سایت کاریابی تخصصی فروش و بازاریابی؛ مشاهده جدیدترین آگهی‌های استخدام فروشنده، بازاریاب و ویزیتور و ثبت آگهی استخدام رایگان برای کارفرمایان.',
  og_image_url: 'https://sellniroo.com/images/logo.png',
  twitter_title: 'درباره ما | سلنیرو',
  twitter_description:
    'درباره سلنیرو - سایت کاریابی تخصصی فروش و بازاریابی؛ جدیدترین آگهی‌های استخدام فروش، بازاریابی و ویزیتوری.',
  robots_index: true,
}

export const normalizeAboutPage = (raw = {}) => {
  const data = { ...DEFAULT_ABOUT_SEO, ...raw }
  const contentFa = raw.content_fa && typeof raw.content_fa === 'object'
    ? raw.content_fa
    : aboutData.fa
  const contentEn = raw.content_en && typeof raw.content_en === 'object'
    ? raw.content_en
    : aboutData.en

  let keywords = data.keywords
  if (!Array.isArray(keywords) || !keywords.length) {
    keywords = String(data.seo_keywords || '')
      .replace(/,/g, '\n')
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (!keywords.length) keywords = DEFAULT_ABOUT_SEO.keywords

  return {
    ...data,
    content_fa: contentFa,
    content_en: contentEn,
    keywords,
    og_title: data.og_title || data.seo_title || DEFAULT_ABOUT_SEO.og_title,
    og_description:
      data.og_description || data.seo_description || DEFAULT_ABOUT_SEO.og_description,
    twitter_title:
      data.twitter_title || data.seo_title || DEFAULT_ABOUT_SEO.twitter_title,
    twitter_description:
      data.twitter_description ||
      data.seo_description ||
      DEFAULT_ABOUT_SEO.twitter_description,
    robots_index: data.robots_index !== false,
  }
}

export function pickAboutContent(page, language = 'fa') {
  const lang = String(language || 'fa').toLowerCase()
  if (lang.startsWith('en')) {
    return page?.content_en || aboutData.en
  }
  return page?.content_fa || aboutData.fa
}

let cache = null
let inflight = null
let cacheAt = 0
const TTL_MS = 60_000

export const clearAboutPageCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

export function emptyAboutContent() {
  return {
    title: '',
    subtitle: '',
    section1: {
      title: '',
      paragraphs: [''],
      image: { src: '', alt: '', caption: '' },
    },
    section2: {
      title: '',
      paragraphs: [''],
      image: { src: '', alt: '', caption: '' },
    },
    stats: [],
    sections: { title: '', items: [] },
    achievements: { title: '', items: [] },
  }
}

/** آماده‌سازی محتوا قبل از ذخیره در API */
export function sanitizeAboutContent(raw = {}) {
  const base = emptyAboutContent()
  const data = { ...base, ...(raw || {}) }

  const cleanSection = (sec) => {
    const s = sec && typeof sec === 'object' ? sec : {}
    const paragraphs = Array.isArray(s.paragraphs)
      ? s.paragraphs.map((p) => String(p ?? '').trim()).filter(Boolean)
      : []
    const image = s.image && typeof s.image === 'object' ? s.image : {}
    return {
      title: String(s.title || '').trim(),
      paragraphs: paragraphs.length ? paragraphs : [''],
      image: {
        src: String(image.src || '').trim(),
        alt: String(image.alt || '').trim(),
        caption: String(image.caption || '').trim(),
      },
    }
  }

  const stats = Array.isArray(data.stats)
    ? data.stats
        .map((item) => ({
          value: String(item?.value || '').trim(),
          label: String(item?.label || '').trim(),
          icon: String(item?.icon || 'Briefcase').trim() || 'Briefcase',
        }))
        .filter((item) => item.value || item.label)
    : []

  const sectionItems = Array.isArray(data.sections?.items)
    ? data.sections.items
        .map((item) => ({
          title: String(item?.title || '').trim(),
          desc: String(item?.desc || '').trim(),
          icon: String(item?.icon || 'Target').trim() || 'Target',
        }))
        .filter((item) => item.title || item.desc)
    : []

  const achievements = Array.isArray(data.achievements?.items)
    ? data.achievements.items
        .map((item) => ({
          label: String(item?.label || '').trim(),
          desc: String(item?.desc || '-').trim() || '-',
        }))
        .filter((item) => item.label)
    : []

  return {
    title: String(data.title || '').trim(),
    subtitle: String(data.subtitle || '').trim(),
    section1: cleanSection(data.section1),
    section2: cleanSection(data.section2),
    stats,
    sections: {
      title: String(data.sections?.title || '').trim(),
      items: sectionItems,
    },
    achievements: {
      title: String(data.achievements?.title || '').trim(),
      items: achievements,
    },
  }
}

export async function updateAboutPage(payload, authHeaders = {}) {
  const Config = (await import('@/config/config')).default
  const axios = (await import('axios')).default
  const res = await axios.patch(
    Config.endpoints.news.about.update(),
    payload,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    }
  )
  clearAboutPageCache()
  return normalizeAboutPage(res.data?.data || res.data)
}

export async function fetchAboutPage({ force = false, lang = 'fa' } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight

  inflight = (async () => {
    try {
      const base = Config.endpoints.news.about.get()
      const url = `${base}${base.includes('?') ? '&' : '?'}lang=${encodeURIComponent(lang)}`
      const res = await fetch(url, {
        next: { revalidate: 60 },
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`about ${res.status}`)
      const json = await res.json()
      const data = normalizeAboutPage(json?.data || json)
      cache = data
      cacheAt = Date.now()
      return data
    } catch (err) {
      console.error('fetchAboutPage:', err)
      return normalizeAboutPage({
        content_fa: aboutData.fa,
        content_en: aboutData.en,
      })
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export function buildAboutMetadata(page) {
  const data = normalizeAboutPage(page || {})
  const title = data.seo_title || DEFAULT_ABOUT_SEO.seo_title
  const description = data.seo_description || DEFAULT_ABOUT_SEO.seo_description
  const ogImage = data.og_image_url || DEFAULT_ABOUT_SEO.og_image_url
  const canonical = data.canonical_url || DEFAULT_ABOUT_SEO.canonical_url

  return {
    title,
    description,
    keywords: data.keywords,
    openGraph: {
      title: data.og_title || title,
      description: data.og_description || description,
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: data.twitter_title || title,
      description: data.twitter_description || description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
    robots: data.robots_index
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}
