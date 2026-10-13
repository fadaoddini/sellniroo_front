// services/siteModules.js — وضعیت ماژول‌های سایت
import Config from '@/config/config'
import { SITE_MODULES_CATALOG } from '@/config/siteModules'

function catalogDefaultMap() {
  const byKey = Object.fromEntries(SITE_MODULES_CATALOG.map((m) => [m.key, m]))
  const map = {}
  SITE_MODULES_CATALOG.forEach((m) => {
    let active = m.defaultActive !== false
    const parentKey = m.parentKey
    if (active && parentKey && byKey[parentKey]?.defaultActive === false) {
      active = false
    }
    map[m.key] = active
  })
  return map
}

let cache = null
let cacheAt = 0
let inflight = null
const TTL_MS = 30_000

export const clearSiteModulesCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

function normalizePayload(json) {
  const list = Array.isArray(json?.data) ? json.data : []
  const map =
    json?.map && typeof json.map === 'object'
      ? { ...catalogDefaultMap(), ...json.map }
      : {
          ...catalogDefaultMap(),
          ...Object.fromEntries(
            list.map((m) => [m.key, m.effective_active ?? !!m.is_active])
          ),
        }
  return { list, map, affected: json?.affected || [] }
}

export async function fetchSiteModules({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight

  inflight = (async () => {
    try {
      const url = Config.endpoints.news.siteModules.list()
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`site-modules ${res.status}`)
      const json = await res.json()
      const payload = normalizePayload(json)
      cache = payload
      cacheAt = Date.now()
      return payload
    } catch {
      if (cache) return cache
      const failMap = Object.fromEntries(
        SITE_MODULES_CATALOG.map((m) => [m.key, false])
      )
      return {
        list: SITE_MODULES_CATALOG.map((m) => ({
          key: m.key,
          name: m.name,
          name_en: m.name_en,
          description: m.description,
          category: m.category,
          parent_key: m.parentKey || null,
          is_group: !!m.isGroup,
          is_active: false,
          effective_active: false,
          componentPath: m.componentPath,
        })),
        map: failMap,
        affected: [],
      }
    } finally {
      inflight = null
    }
  })()

  return inflight
}

/** وضعیت مؤثر: خود ماژول + والد (اگر باشد) */
export async function isSiteModuleActive(key, { force = false } = {}) {
  const { map } = await fetchSiteModules({ force })
  if (Object.prototype.hasOwnProperty.call(map, key)) return !!map[key]
  return true
}

export async function reorderHomepageModules(keys, headers = {}) {
  const url = Config.endpoints.news.siteModules.reorderHome()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ keys }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.detail || json?.message || `reorder failed ${res.status}`)
  }
  clearSiteModulesCache()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('site-modules-changed', {
        detail: { type: 'reorder-home', keys: json?.home_order || keys },
      })
    )
  }
  return {
    homeOrder: json?.home_order || keys,
    list: Array.isArray(json?.data) ? json.data : null,
    map: json?.map || null,
    raw: json,
  }
}

export async function toggleSiteModule(key, headers = {}) {
  const url = Config.endpoints.news.siteModules.toggle(key)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.detail || json?.message || `toggle failed ${res.status}`)
  }
  clearSiteModulesCache()
  const affected = json?.affected || [key]
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('site-modules-changed', {
        detail: { key, affected },
      })
    )
  }
  return {
    data: json?.data || json,
    map: json?.map || null,
    list: Array.isArray(json?.modules) ? json.modules : null,
    affected,
    raw: json,
  }
}
