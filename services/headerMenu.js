// services/headerMenu.js — آیتم‌های منوی HeaderByMenuTop
import Config from '@/config/config'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export const DEFAULT_HEADER_MENU = [
  { id: 'home', label_fa: 'خانه', label_en: 'Home', href: '/', icon: 'Home', sort_order: 10, mobile_sort_order: 10 },
  { id: 'jobs', label_fa: 'آگهی‌ها', label_en: 'Jobs', href: '/jobs', icon: 'Briefcase', sort_order: 20, mobile_sort_order: 20 },
  { id: 'news', label_fa: 'اخبار', label_en: 'News', href: '/news', icon: 'Newspaper', sort_order: 30, mobile_sort_order: 30 },
  { id: 'faq', label_fa: 'سوالات متداول', label_en: 'FAQ', href: '/faq', icon: 'HelpCircle', sort_order: 35, mobile_sort_order: 35 },
  { id: 'school', label_fa: 'مدرسه', label_en: 'School', href: '/school', icon: 'GraduationCap', sort_order: 37, mobile_sort_order: 37 },
  { id: 'about', label_fa: 'درباره ما', label_en: 'About', href: '/about', icon: 'Info', sort_order: 40, mobile_sort_order: 40 },
  { id: 'post', label_fa: 'ثبت آگهی', label_en: 'Post a job', href: '/post-job', icon: 'PlusCircle', sort_order: 50, mobile_sort_order: 50 },
]

/** مرتب‌سازی مستقل دسکتاپ / موبایل */
export function sortHeaderMenuItems(items = [], scope = 'desktop') {
  const key = scope === 'mobile' ? 'mobile_sort_order' : 'sort_order'
  return (items || [])
    .slice()
    .sort((a, b) => {
      const ao = Number(a?.[key] ?? a?.sort_order ?? 0)
      const bo = Number(b?.[key] ?? b?.sort_order ?? 0)
      if (ao !== bo) return ao - bo
      return (Number(a?.id) || 0) - (Number(b?.id) || 0)
    })
}

/** آیتم منو → ماژول سایت (اگر ماژول خاموش باشد لینک مخفی می‌شود) */
const MENU_ITEM_MODULES = {
  jobs: SITE_MODULE_KEYS.JOB_BOARD,
  post: SITE_MODULE_KEYS.JOB_BOARD,
  news: SITE_MODULE_KEYS.NEWS,
  faq: SITE_MODULE_KEYS.FAQ,
  school: SITE_MODULE_KEYS.SCHOOL,
}

export function resolveHeaderMenuModuleKey(item) {
  if (!item) return null
  if (item.id && MENU_ITEM_MODULES[item.id]) return MENU_ITEM_MODULES[item.id]
  const path = String(item.href || '').split('?')[0].split('#')[0] || ''
  if (path === '/jobs' || path.startsWith('/jobs/')) return SITE_MODULE_KEYS.JOB_BOARD
  if (path === '/post-job') return SITE_MODULE_KEYS.JOB_BOARD
  if (path === '/news' || path.startsWith('/news/')) return SITE_MODULE_KEYS.NEWS
  if (path === '/faq' || path.startsWith('/faq/')) return SITE_MODULE_KEYS.FAQ
  if (path === '/school' || path.startsWith('/school/')) return SITE_MODULE_KEYS.SCHOOL
  return null
}

export function filterHeaderMenuByModules(items, moduleMap = {}) {
  return (items || []).filter((item) => {
    const key = resolveHeaderMenuModuleKey(item)
    if (!key) return true
    if (!Object.prototype.hasOwnProperty.call(moduleMap, key)) return true
    return !!moduleMap[key]
  })
}

/**
 * ترتیب نمایش منوی پایین موبایل + قرار دادن آیتم انتخاب‌شده در وسط (دایره وسط)
 * @param {Array} items
 * @param {{ centerItemId?: number|string|null, maxItems?: number }} [opts]
 */
export function arrangeMobileNavItems(items = [], opts = {}) {
  const maxItems = Math.max(3, Math.min(7, Number(opts.maxItems) || 5))
  let list = (items || []).slice()
  const centerId =
    opts.centerItemId != null && opts.centerItemId !== ''
      ? String(opts.centerItemId)
      : null

  if (centerId) {
    const center = list.find((i) => String(i.id) === centerId)
    if (center) {
      const others = list.filter((i) => String(i.id) !== centerId)
      const keepOthers = Math.max(0, maxItems - 1)
      const trimmed = others.slice(0, keepOthers)
      const mid = Math.floor(trimmed.length / 2)
      list = [...trimmed.slice(0, mid), center, ...trimmed.slice(mid)]
      return list.slice(0, maxItems)
    }
  }

  return list.slice(0, maxItems)
}

export function findMobileNavCenterIndex(items = [], centerItemId) {
  if (!items.length) return -1
  if (centerItemId == null || centerItemId === '') {
    return Math.floor(items.length / 2)
  }
  const idx = items.findIndex((i) => String(i.id) === String(centerItemId))
  return idx >= 0 ? idx : Math.floor(items.length / 2)
}

export async function reorderHeaderMenu(ids, authHeaders = {}, { scope = 'desktop' } = {}) {
  const url = Config.endpoints.news.headerMenu.reorder()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify({
      ids,
      scope: scope === 'mobile' ? 'mobile' : 'desktop',
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.detail || json?.message || `reorder failed ${res.status}`)
  }
  clearHeaderMenuCache()
  const list = Array.isArray(json?.data) ? json.data : []
  cache = list
  cacheAt = Date.now()
  return list
}

let cache = null
let cacheAt = 0
let inflight = null
const TTL_MS = 30_000

export const clearHeaderMenuCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

export async function fetchHeaderMenu({ force = false, activeOnly = true } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight

  inflight = (async () => {
    try {
      const url = activeOnly
        ? Config.endpoints.news.headerMenu.active()
        : Config.endpoints.news.headerMenu.list()
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`header-menu ${res.status}`)
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : []
      cache = list.length ? list : DEFAULT_HEADER_MENU
      cacheAt = Date.now()
      return cache
    } catch (err) {
      console.error('fetchHeaderMenu:', err)
      return cache || DEFAULT_HEADER_MENU
    } finally {
      inflight = null
    }
  })()

  return inflight
}
