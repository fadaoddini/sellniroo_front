// services/menuLists.js — فهرست‌های منو برای ویجت‌های چیدمان
import Config from '@/config/config'

let cache = null
let cacheAt = 0
let inflight = null
const TTL_MS = 30_000

export const clearMenuListsCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

export async function fetchMenuLists({ force = false, includeItems = false } = {}) {
  const now = Date.now()
  if (!force && !includeItems && cache && now - cacheAt < TTL_MS) return cache
  if (!force && !includeItems && inflight) return inflight

  const run = async () => {
    try {
      const url = Config.endpoints.news.menuLists.list(
        includeItems ? { include_items: '1' } : {}
      )
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`menu-lists ${res.status}`)
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : []
      if (!includeItems) {
        cache = list
        cacheAt = Date.now()
      }
      return list
    } catch (err) {
      console.error('fetchMenuLists:', err)
      return cache || []
    } finally {
      if (!includeItems) inflight = null
    }
  }

  if (!includeItems) {
    inflight = run()
    return inflight
  }
  return run()
}

export async function fetchMenuListBySlug(slug, { force = false } = {}) {
  if (!slug) return null
  try {
    const url = Config.endpoints.news.menuLists.get(slug)
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: force ? 'no-store' : 'default',
    })
    if (!res.ok) throw new Error(`menu-list ${res.status}`)
    const json = await res.json()
    return json?.data || null
  } catch (err) {
    console.error('fetchMenuListBySlug:', err)
    return null
  }
}

export async function fetchMenuListItems(menuSlug, { force = false } = {}) {
  try {
    const url = Config.endpoints.news.menuListItems.list({ menu: menuSlug })
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: force ? 'no-store' : 'default',
    })
    if (!res.ok) throw new Error(`menu-list-items ${res.status}`)
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch (err) {
    console.error('fetchMenuListItems:', err)
    return []
  }
}
