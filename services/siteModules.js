// services/siteModules.js — وضعیت ماژول‌های سایت
import Config from '@/config/config'
import { SITE_MODULES_CATALOG } from '@/config/siteModules'

const CHANGED_EVENT = 'site-modules-changed'
const STORAGE_KEY = 'site-modules-bust'

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

/** اگر والد خاموش باشد، فرزند را هم در map خاموش کن */
function applyParentEffective(map) {
  const byKey = Object.fromEntries(SITE_MODULES_CATALOG.map((m) => [m.key, m]))
  const out = { ...map }
  SITE_MODULES_CATALOG.forEach((m) => {
    const parentKey = m.parentKey
    if (!parentKey) return
    if (Object.prototype.hasOwnProperty.call(out, parentKey) && !out[parentKey]) {
      out[m.key] = false
    } else if (
      parentKey &&
      byKey[parentKey] &&
      Object.prototype.hasOwnProperty.call(out, m.key) &&
      Object.prototype.hasOwnProperty.call(out, parentKey)
    ) {
      if (!out[parentKey]) out[m.key] = false
    }
  })
  // والدهای آمده از API که در کاتالوگ نیستند
  Object.keys(out).forEach((key) => {
    const meta = byKey[key]
    const parentKey = meta?.parentKey
    if (parentKey && out[parentKey] === false) out[key] = false
  })
  return out
}

let cache = null
let cacheAt = 0
let inflight = null
let fetchGen = 0
const TTL_MS = 15_000

export const clearSiteModulesCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
  fetchGen += 1
}

function normalizePayload(json) {
  const list = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.modules)
      ? json.modules
      : []
  let map
  if (json?.map && typeof json.map === 'object') {
    map = { ...catalogDefaultMap(), ...json.map }
  } else {
    map = {
      ...catalogDefaultMap(),
      ...Object.fromEntries(
        list.map((m) => [m.key, m.effective_active ?? !!m.is_active])
      ),
    }
  }
  map = applyParentEffective(map)
  return { list, map, affected: json?.affected || [] }
}

function emitChanged(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CHANGED_EVENT, { detail })
  )
  try {
    // همگام‌سازی بین تب‌های مختلف مرورگر
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export async function fetchSiteModules({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight

  const gen = ++fetchGen
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
      // پاسخ قدیمی‌تر از یک fetch جدیدتر، کش را خراب نکند
      if (gen === fetchGen) {
        cache = payload
        cacheAt = Date.now()
      }
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
      if (gen === fetchGen) inflight = null
    }
  })()

  return inflight
}

/** وضعیت مؤثر: خود ماژول + والد (اگر باشد) */
export async function isSiteModuleActive(key, { force = false } = {}) {
  const { map } = await fetchSiteModules({ force })
  if (Object.prototype.hasOwnProperty.call(map, key)) return !!map[key]
  return false
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
  const payload = normalizePayload(json)
  cache = payload
  cacheAt = Date.now()
  emitChanged({ type: 'reorder-home', keys: json?.home_order || keys })
  return {
    homeOrder: json?.home_order || keys,
    list: Array.isArray(json?.data) ? json.data : payload.list,
    map: payload.map,
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
  // بلافاصله کش را از پاسخ toggle پر کن تا داشبورد/سایت وضعیت کهنه نبینند
  const payload = normalizePayload(json)
  cache = payload
  cacheAt = Date.now()
  const affected = json?.affected || [key]
  emitChanged({ key, affected, map: payload.map })
  return {
    data: json?.data || json,
    map: payload.map,
    list: payload.list.length ? payload.list : null,
    affected,
    raw: json,
  }
}
